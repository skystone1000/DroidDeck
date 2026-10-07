/* ==========================================================================
   One-shot codemod: seed `importance` onto every question.

   TEMPORARY. Delete this once the field exists everywhere. It is scaffolding,
   not infrastructure — keeping it around invites someone to re-run it over
   hand-reviewed tiers and lose the review, which is the part that matters.

       node tools/seed-importance.js            # report what it would do
       node tools/seed-importance.js --write    # do it

   Where the tier comes from: theory chapters link the questions worth testing
   themselves against, and every chapter carries a tier. So a question inherits
   the tier of the chapters that cite it, strongest wins — a question worth
   testing a must-know chapter against is a must-know question.

   That is a starting point and not an answer. Theory cites a question wherever
   it is *relevant*, so the seed measures coverage rather than how often a thing
   is actually asked, and it marks far too much must-know. The review that
   follows is the real work; this only saves the typing.

   Questions no chapter links get nothing and are listed for hand assignment.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const { loadCorpus, allChapters, ROOT } = require('./load-corpus');
const { TIERS } = require('./schema');

const RANK = { 'must-know': 3, 'should-know': 2, 'good-to-know': 1 };

const write = process.argv.includes('--write');

/* --------------------------------------------------------------------------
   Which file declares which topic
   -------------------------------------------------------------------------- */

function topicFiles(topics) {
    const dir = path.join(ROOT, 'data');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'index.js');
    const map = new Map();

    for (const topic of topics) {
        const found = files.find((f) => {
            const src = fs.readFileSync(path.join(dir, f), 'utf8');
            return new RegExp(`"?id"?:\\s*["'\`]${escapeId(topic.id)}["'\`]`).test(src);
        });
        if (found) map.set(topic.id, path.join(dir, found));
    }
    return map;
}

function escapeId(id) { return String(id).replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'); }

/* --------------------------------------------------------------------------
   Seeding
   -------------------------------------------------------------------------- */

function seedTiers(theoryModules) {
    const seed = new Map();      // "topicId::questionId" -> tier

    for (const { chapter } of allChapters(theoryModules)) {
        for (const ref of chapter.relatedQuestions || []) {
            if (!ref || !ref.topicId || !ref.questionId) continue;
            const key = `${ref.topicId}::${ref.questionId}`;
            const current = seed.get(key);
            if (!current || RANK[chapter.importance] > RANK[current]) {
                seed.set(key, chapter.importance);
            }
        }
    }
    return seed;
}

/**
 * Insert `importance` immediately after the question's `id` line, copying that
 * line's indentation and quoting style so the file keeps the shape it had.
 */
function insertImportance(src, questionId, tier) {
    const line = new RegExp(
        `^([ \\t]*)("?)id\\2:(\\s*)(["'\`])${escapeId(questionId)}\\4(,?)[ \\t]*$`,
        'm'
    );
    const match = src.match(line);
    if (!match) return { ok: false, note: 'id line not found' };

    const [whole, indent, keyQuote, space, valueQuote] = match;

    // Already seeded, or hand-written: never overwrite.
    const after = src.slice(src.indexOf(whole) + whole.length, src.indexOf(whole) + whole.length + 200);
    if (/^\s*"?importance"?:/.test(after)) return { ok: false, note: 'already has importance' };

    const added =
        `\n${indent}${keyQuote}importance${keyQuote}:${space}${valueQuote}${tier}${valueQuote},`;

    return { ok: true, src: src.replace(line, whole + added) };
}

/* --------------------------------------------------------------------------
   Run
   -------------------------------------------------------------------------- */

function main() {
    const { topics, theoryModules } = loadCorpus();
    const seed = seedTiers(theoryModules);
    const files = topicFiles(topics);

    const counts = { 'must-know': 0, 'should-know': 0, 'good-to-know': 0 };
    const unseeded = [];
    const problems = [];
    const edits = new Map();     // file -> source

    for (const topic of topics) {
        const file = files.get(topic.id);
        if (!file) { problems.push(`topic "${topic.id}": no data file found`); continue; }

        for (const question of topic.questions || []) {
            if (question.importance) continue;

            const tier = seed.get(`${topic.id}::${question.id}`);
            if (!tier) { unseeded.push(`${topic.id} › ${question.id}`); continue; }
            if (!TIERS.includes(tier)) {
                problems.push(`${topic.id} › ${question.id}: seeded tier "${tier}" is not a tier`);
                continue;
            }

            const current = edits.get(file) || fs.readFileSync(file, 'utf8');
            const result = insertImportance(current, question.id, tier);
            if (!result.ok) {
                problems.push(`${topic.id} › ${question.id}: ${result.note}`);
                continue;
            }
            edits.set(file, result.src);
            counts[tier] += 1;
        }
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    console.log(`Seeded from ${seed.size} theory cross-reference(s), strongest tier wins.\n`);
    for (const tier of TIERS) console.log(`  ${String(counts[tier]).padStart(4)}  ${tier}`);
    console.log(`  ${String(unseeded.length).padStart(4)}  no theory link — assign by hand\n`);

    if (problems.length) {
        console.log(`${problems.length} problem(s):`);
        problems.forEach((p) => console.log(`  ✗ ${p}`));
        console.log('');
    }

    if (unseeded.length) {
        console.log('Needing a hand-assigned tier:');
        unseeded.forEach((u) => console.log(`  · ${u}`));
        console.log('');
    }

    if (!write) {
        console.log(`Dry run — nothing written. ${total} question(s) would be seeded.`);
        console.log('Re-run with --write to apply.');
        return;
    }

    for (const [file, src] of edits) fs.writeFileSync(file, src);
    console.log(`Wrote ${total} importance field(s) across ${edits.size} file(s).`);
    console.log('Now: assign the rest by hand, review every tier, then delete this script.');

    if (problems.length) process.exit(1);
}

main();
