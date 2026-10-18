/* ==========================================================================
   Question corpus validator.

   The theory corpus has been machine-checked since it was written. The question
   bank — 465 answers, older and larger — has never been checked at all, which is
   how it came to hold authored HTML that the theory layer would have rejected on
   the first run.

   This script closes that gap. It enforces the schema in
   docs/plans/2026-08-17-answer-quality.md §6.

       node tools/validate-questions.js

   Exits 1 on any error. Warnings never fail the run.

   All seven checks from §6 are on.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { loadCorpus, ROOT } = require('./load-corpus');
const {
    TIERS, LANGUAGES, DIAGRAM_TYPES, OUTPUT_KINDS, RUNNABLE_LANGUAGES, KEBAB, htmlIssues
} = require('./schema');

/* Question ids are unique within a topic but not across the bank, and exactly
   one id is shared by two topics. Listing it here means a *second* collision is
   an error while this one stays legal — a bare uniqueness check would have to be
   switched off entirely to tolerate it, and would then catch nothing. */
const KNOWN_CROSS_TOPIC_IDS = ['kotlin-multiplatform'];

const errors = [];
const warnings = [];

function error(where, message) { errors.push(`${where}: ${message}`); }
function warn(where, message) { warnings.push(`${where}: ${message}`); }

/* --------------------------------------------------------------------------
   Checks
   -------------------------------------------------------------------------- */

function checkTopics(topics) {
    const seenTopicIds = new Set();
    const idOwners = new Map();     // question id -> [topic ids]

    for (const topic of topics) {
        const at = `topic "${topic.id || '<missing id>'}"`;

        if (!topic.id) { error(at, 'has no id'); continue; }
        if (!KEBAB.test(topic.id)) error(at, 'id is not kebab-case');
        if (seenTopicIds.has(topic.id)) error(at, 'duplicate topic id');
        seenTopicIds.add(topic.id);

        if (!topic.title) error(at, 'has no title');

        const declaredSubsections = new Set((topic.subsections || []).map((s) => s.id));
        (topic.subsections || []).forEach((sub, i) => {
            if (!sub || !sub.id || !sub.title) {
                error(at, `subsections[${i}] needs both id and title`);
            }
        });

        const questions = topic.questions || [];
        if (!questions.length) warn(at, 'has no questions');

        // 2 — ids unique within the topic
        const seen = new Set();
        questions.forEach((question, i) => {
            const where = `${topic.id} › ${question.id || `question ${i + 1}`}`;

            if (!question.id) { error(where, 'has no id'); return; }
            if (!KEBAB.test(question.id)) error(where, 'id is not kebab-case');
            if (seen.has(question.id)) error(where, 'duplicate question id within this topic');
            seen.add(question.id);

            if (!idOwners.has(question.id)) idOwners.set(question.id, []);
            idOwners.get(question.id).push(topic.id);

            checkQuestion(question, where, topic, declaredSubsections);
        });
    }

    // 2 (continued) — the one known cross-topic collision, and no others
    for (const [id, owners] of idOwners) {
        if (owners.length < 2) continue;
        if (KNOWN_CROSS_TOPIC_IDS.includes(id)) continue;
        error(
            `question id "${id}"`,
            `appears in ${owners.length} topics (${owners.join(', ')}) — ids may repeat across ` +
            'topics only if listed in KNOWN_CROSS_TOPIC_IDS, because theory cross-links ' +
            'resolve on {topicId, questionId} and a new collision hides a mistake'
        );
    }

    // A known collision that has been resolved should stop being excused.
    for (const id of KNOWN_CROSS_TOPIC_IDS) {
        const owners = idOwners.get(id) || [];
        if (owners.length < 2) {
            warn('registry', `"${id}" is listed as a known cross-topic id but no longer collides — remove it`);
        }
    }
}

function checkQuestion(question, at, topic, declaredSubsections) {
    for (const field of ['question', 'answer']) {
        if (!question[field]) error(at, `has no ${field}`);
    }

    // 1 — importance tier. Same three values theory uses, because a must-know
    // question and a must-know chapter mean the same thing and are rendered
    // with the same tokens.
    if (!TIERS.includes(question.importance)) {
        error(at, `importance ${JSON.stringify(question.importance)} is not one of ${TIERS.join(', ')}`);
    }

    // 7 — authored HTML stays inside the allowed subset
    if (typeof question.answer === 'string') {
        htmlIssues(question.answer).forEach((issue) => error(`${at} answer`, issue));
    }

    // A question filed under a section the topic does not declare still renders,
    // in a trailing "More" bucket, so this is a warning rather than an error.
    if (question.subsection && !declaredSubsections.has(question.subsection)) {
        warn(at, `subsection "${question.subsection}" is not declared by the topic`);
    }
    if (!question.subsection && declaredSubsections.size) {
        warn(at, 'has no subsection, in a topic that declares them — it renders under "More"');
    }

    // 3 — a must-know question carries a source. Mirrors the rule
    // validate-theory.js applies to must-know chapters, and it is the ratchet
    // Phase 4 leaves behind: the verification pass is a moment in time, but a
    // must-know answer that cites nothing can never be re-checked by anyone.
    const links = question.referenceLinks || [];
    if (question.importance === 'must-know' && !links.length) {
        error(at, 'is must-know but has no referenceLink');
    }

    links.forEach((link, i) => {
        const where = `${at} referenceLinks[${i}]`;
        if (!link || typeof link !== 'object') { error(where, 'is not an object'); return; }
        if (!link.title) error(where, 'has no title');
        if (typeof link.url !== 'string' || !link.url.startsWith('https://')) {
            error(where, `url ${JSON.stringify(link.url)} must be an https URL`);
        }
    });

    if (question.tags && !Array.isArray(question.tags)) {
        error(at, 'tags must be an array');
    }

    // 4 — vendored figures
    if (question.images !== undefined) {
        if (!Array.isArray(question.images)) {
            error(at, 'images must be an array');
        } else {
            question.images.forEach((image, i) => checkImage(image, `${at} images[${i}]`));
        }
    }

    // 6 — snippet language is one the highlighter understands
    (question.codeSnippets || []).forEach((snippet, i) => {
        const where = `${at} codeSnippets[${i}]`;
        if (!snippet || typeof snippet !== 'object') { error(where, 'is not an object'); return; }
        if (!snippet.code) error(where, 'has no code');
        if (!LANGUAGES.includes(snippet.language)) {
            error(where, `language ${JSON.stringify(snippet.language)} is not one of ${LANGUAGES.join(', ')}`);
        }
        if (snippet.output) checkOutput(snippet, `${where} output`);
    });

    checkDiagram(question, at);
}

/* 4 — a vendored figure.

   Two of these rules exist because the app redistributes someone else's work.
   `sourceUrl` and `sourceTitle` are what turn a copied PNG into an attributed
   one, and CC BY makes that a condition of use rather than a nicety — so a
   figure without them is a licence problem, not a cosmetic one, and fails.

   The rest are the reasons §3.5 kept images out of authored HTML. `src` is
   checked against the disk because a hotlink defeats the point of vendoring and
   a typo produces a silent broken image; `alt` is length-checked because
   `alt="diagram"` is the same as no alt text to anyone using a screen reader,
   and the whole argument for these figures is that they carry information the
   prose cannot. Neither check is possible inside an HTML blob. */
function checkImage(image, at) {
    if (!image || typeof image !== 'object') { error(at, 'is not an object'); return; }

    if (typeof image.src !== 'string' || !image.src) {
        error(at, 'has no src');
    } else if (/^(https?:)?\/\//.test(image.src) || image.src.startsWith('/')) {
        error(at, `src ${JSON.stringify(image.src)} must be repo-relative — figures are vendored, not hotlinked`);
    } else if (!fs.existsSync(path.join(ROOT, image.src))) {
        error(at, `src ${JSON.stringify(image.src)} does not exist on disk`);
    }

    if (typeof image.alt !== 'string' || image.alt.trim().length <= 20) {
        error(at, 'alt must describe the figure in more than 20 characters');
    }

    for (const field of ['sourceTitle', 'sourceUrl']) {
        if (typeof image[field] !== 'string' || !image[field].trim()) {
            error(at, `has no ${field} — a vendored figure must carry its attribution`);
        }
    }

    if (typeof image.sourceUrl === 'string' && image.sourceUrl && !image.sourceUrl.startsWith('https://')) {
        error(at, `sourceUrl ${JSON.stringify(image.sourceUrl)} must be an https URL`);
    }

    if (image.caption !== undefined) {
        if (typeof image.caption !== 'string' || !image.caption.trim()) {
            error(at, 'caption, when present, must be a non-empty string');
        } else {
            htmlIssues(image.caption).forEach((issue) => error(`${at} caption`, issue));
        }
    }
}

/* 5 — the output pane.

   `stdout` is a falsifiable claim: this is what the program printed, and
   `run-snippets.js` re-runs it to prove it. `trace` is a description of
   behaviour, for code that has no stdout to give. Confusing the two is the one
   failure this feature must not have, so the schema keeps them apart and the
   language check below refuses `stdout` on anything no compiler here can run —
   an Output block nobody verified is a guess wearing a costume. */
function checkOutput(snippet, at) {
    const output = snippet.output;
    if (typeof output !== 'object') { error(at, 'is not an object'); return; }

    if (!OUTPUT_KINDS.includes(output.kind)) {
        error(at, `kind ${JSON.stringify(output.kind)} is not one of ${OUTPUT_KINDS.join(', ')}`);
    }

    if (!Array.isArray(output.lines) || !output.lines.length) {
        error(at, 'lines must be a non-empty array');
    } else {
        output.lines.forEach((line, i) => {
            if (typeof line !== 'string') error(at, `lines[${i}] is not a string`);
        });
    }

    if (output.kind === 'stdout' && !RUNNABLE_LANGUAGES.includes(snippet.language)) {
        error(
            at,
            `kind is "stdout" but the snippet is ${snippet.language}, which run-snippets.js ` +
            `cannot execute — only ${RUNNABLE_LANGUAGES.join(' and ')} can carry stdout. Use "trace"`
        );
    }

    if (output.explain !== undefined) {
        if (typeof output.explain !== 'string' || !output.explain.trim()) {
            error(at, 'explain, when present, must be a non-empty string');
        } else {
            htmlIssues(output.explain).forEach((issue) => error(`${at} explain`, issue));
        }
    }
}

/* `hasDiagram` gates the render, so a config with the flag off is dead content
   and a flag with no config renders an empty box. */
function checkDiagram(question, at) {
    const flagged = Boolean(question.hasDiagram);
    const configured = Boolean(question.diagramConfig);

    if (flagged && !configured) {
        error(at, 'hasDiagram is true but there is no diagramConfig');
    }
    if (!flagged && configured) {
        warn(at, 'has a diagramConfig that never renders, because hasDiagram is not true');
    }
    if (!flagged) return;

    if (!DIAGRAM_TYPES.includes(question.diagramType)) {
        error(at, `diagramType ${JSON.stringify(question.diagramType)} is not one of ${DIAGRAM_TYPES.join(', ')}`);
    }
}

/* --------------------------------------------------------------------------
   Run
   -------------------------------------------------------------------------- */

function main() {
    let corpus;
    try {
        corpus = loadCorpus();
    } catch (loadError) {
        console.error(`✗ ${loadError.message}`);
        process.exit(1);
    }

    const { topics } = corpus;
    checkTopics(topics);

    const questionCount = topics.reduce((n, t) => n + (t.questions || []).length, 0);
    const snippetCount = topics.reduce(
        (n, t) => n + (t.questions || []).reduce((m, q) => m + (q.codeSnippets || []).length, 0),
        0
    );

    console.log(
        `Question corpus: ${topics.length} topics, ${questionCount} questions, ` +
        `${snippetCount} code snippets.`
    );

    if (warnings.length) {
        console.log(`\n${warnings.length} warning(s):`);
        warnings.forEach((w) => console.log(`  ! ${w}`));
    }

    if (errors.length) {
        console.log(`\n${errors.length} error(s):`);
        errors.forEach((e) => console.log(`  ✗ ${e}`));
        process.exit(1);
    }

    console.log('\n✓ valid');
}

main();
