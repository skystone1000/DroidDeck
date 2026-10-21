/* ==========================================================================
   Theory corpus validator.

   This project has no build step and no test framework, so a hand-authored
   corpus of hundreds of chapters would rot silently. This script is the only
   test the theory layer gets: it enforces the schema in
   docs/plans/2026-08-15-theory-section.md §5 and the integrity rules in §7.1.

       node tools/validate-theory.js

   Exits 1 on any error. Warnings never fail the run — they are the signal that
   a subject was dropped, and need a human reading them.
   ========================================================================== */

const { loadCorpus, allQuestions } = require('./load-corpus');
const {
    TIERS, LANGUAGES, DIAGRAM_TYPES, OUTPUT_KINDS, RUNNABLE_LANGUAGES, KEBAB, htmlIssues
} = require('./schema');

/* Theory-only vocabulary. The rest lives in schema.js, shared with the
   question validator. */
const DOC_KINDS = ['guide', 'api', 'codelab', 'sample', 'course'];
const RESERVED_IDS = ['theory', 'glossary'];

const BLOCK_FIELDS = {
    prose:      ['html'],
    definition: ['term', 'html'],
    types:      ['title', 'items'],
    syntax:     ['language', 'title', 'code'],
    table:      ['headers', 'rows'],
    comparison: ['title', 'left', 'right', 'rows'],
    pitfall:    ['html'],
    tip:        ['html'],
    diagram:    ['diagramType', 'diagramConfig'],
    drill:      ['id', 'tier', 'title', 'minutes', 'prompt', 'watchFor'],
    predict:    ['id', 'importance', 'language', 'prompt', 'code', 'output']
};

/* The drill catalogue, from docs/plans/2026-08-15-machine-coding-drills.md
   Appendix A. Held here rather than derived from the corpus so that a dropped
   drill is an error rather than a smaller number nobody notices. */
const DRILL_IDS = [
    // Tier 1 — the core loop
    'list-from-api', 'debounced-search', 'pagination', 'detail-navigation',
    'offline-first-cache',
    // Tier 2 — feature-flavoured screens
    'shopping-cart', 'form-validation', 'countdown-timer', 'quiz-flow',
    'notes-crud', 'image-list', 'filter-and-sort',
    // Tier 3 — utilities
    'lru-cache', 'hand-rolled-debounce', 'retry-with-backoff',
    'custom-flow-operator', 'rate-limiter', 'image-loader', 'result-wrapper',
    'event-bus',
    // Tier 4 — extend, debug, review
    'fix-the-leak', 'refactor-god-activity', 'add-the-missing-test',
    'review-this-diff'
];

/* The predict catalogue, from docs/plans/2026-08-19-output-prediction.md
   Appendix A. Held here for the same reason DRILL_IDS is: a puzzle dropped
   during authoring should be a number this script reports, not one nobody
   notices. Filled in per phase as each module lands. */
const PREDICT_IDS = [
    // M51 — builders and ordering
    'launch-does-not-wait', 'launches-print-in-delay-order',
    'nested-launch-completes-last', 'delay-zero-does-not-yield',
    'async-starts-eagerly', 'await-immediately-is-sequential',
    'await-after-both-is-concurrent', 'job-join-returns-unit',
    'lazy-does-not-start-itself', 'runblocking-blocks-its-thread',
    'withcontext-returns-last-expression',
    // M52 — cancellation and exceptions
    'cancel-does-not-stop-a-cpu-loop', 'ensure-active-makes-it-cooperative',
    'catching-exception-swallows-cancellation', 'finally-needs-noncancellable',
    'job-lets-a-sibling-kill-a-sibling', 'supervisorjob-isolates-siblings',
    'child-failure-cancels-the-parent', 'async-exception-surfaces-at-await',
    'async-in-supervisorscope-still-throws', 'handler-ignored-by-async',
    'withtimeout-throws-ortimeoutornull-does-not', 'launch-in-a-cancelled-scope',
    // M53 — Flow, hot and cold
    'flow-builder-does-not-run', 'collecting-twice-runs-it-twice',
    'operator-order-changes-output', 'take-cancels-upstream',
    'collectlatest-drops-in-flight-work', 'conflate-skips-intermediates',
    'buffer-changes-the-timing', 'flowon-affects-upstream-only',
    'stateflow-drops-an-equal-value', 'stateflow-replays-the-current-value',
    'sharedflow-loses-what-it-missed', 'sharedflow-replay-one-changes-the-answer',
    'zip-against-combine',
    // M54 — Kotlin language semantics
    'let-returns-the-lambda-apply-returns-the-receiver',
    'a-local-shadows-the-apply-receiver', 'run-against-with',
    'safe-call-let-skips-on-null', 'data-class-equals-ignores-the-body',
    'copy-is-shallow', 'initialisers-run-in-declaration-order',
    'list-is-read-only-not-immutable', 'sequence-interleaves-list-does-not',
    'extension-functions-dispatch-statically', 'lateinit-before-assignment',
    'smart-cast-fails-on-a-mutable-property', 'default-arguments-evaluate-per-call',
    'equals-against-referential-equality', 'elvis-evaluates-lazily',
    // M55 — Java semantics
    'integer-cache-127-against-128', 'string-literal-against-new-string',
    'finally-overrides-a-return', 'finally-runs-after-a-caught-throw',
    'static-then-instance-then-constructor', 'pass-by-value-of-a-reference',
    'ternary-unboxes-and-npes', 'char-plus-int-is-arithmetic',
    'integer-division-truncates', 'array-covariance-throws-at-runtime',
    'overload-binds-statically-override-dynamically', 'mutating-a-hashmap-key'
];

const errors = [];
const warnings = [];

/* drill id -> where it was found, so check 15 can report the duplicate's home. */
const drillsSeen = new Map();

/* Likewise for predict ids, which are unique corpus-wide rather than per
   module because js/progress.js keys reveal state on the bare id. */
const predictionsSeen = new Map();

function error(where, message) { errors.push(`${where}: ${message}`); }
function warn(where, message) { warnings.push(`${where}: ${message}`); }

/* --------------------------------------------------------------------------
   Checks
   -------------------------------------------------------------------------- */

function checkModules(theoryModules, theoryTracks) {
    const trackIds = new Set(theoryTracks.map((t) => t.id));
    const seenIds = new Map();
    const seenOrders = new Map();

    for (const mod of theoryModules) {
        const at = `module "${mod.id || '<missing id>'}"`;

        // 1 — ids unique, kebab-case, not reserved
        if (!mod.id) { error(at, 'has no id'); continue; }
        if (!KEBAB.test(mod.id)) error(at, 'id is not kebab-case');
        if (RESERVED_IDS.includes(mod.id)) {
            error(at, `id "${mod.id}" is reserved by the router`);
        }
        if (seenIds.has(mod.id)) error(at, 'duplicate module id');
        seenIds.set(mod.id, mod);

        // 3 — trackId resolves
        if (!trackIds.has(mod.trackId)) {
            error(at, `trackId "${mod.trackId}" is not a declared track`);
        }

        // 2 — order unique (contiguity checked once, below)
        if (typeof mod.order !== 'number') {
            error(at, 'has no numeric order');
        } else if (seenOrders.has(mod.order)) {
            error(at, `order ${mod.order} collides with "${seenOrders.get(mod.order)}"`);
        } else {
            seenOrders.set(mod.order, mod.id);
        }

        for (const field of ['title', 'tagline']) {
            if (!mod[field]) error(at, `has no ${field}`);
        }
        if (typeof mod.estimatedMinutes !== 'number' || mod.estimatedMinutes <= 0) {
            error(at, 'estimatedMinutes must be a positive number');
        }

        // 9 — every module has a doc hub
        if (!mod.docHub) {
            error(at, 'has no docHub');
        } else {
            checkDocEntry(mod.docHub, at + ' docHub', { requireKind: false });
        }
    }

    // 2 — orders are unique positions on the reading path. Gaps are expected
    // while the curriculum is authored a track at a time — an order is a slot
    // in the finished path, not an index into what happens to exist today — so
    // holes are reported as a warning and only uniqueness is an error.
    if (theoryModules.length) {
        const orders = [...seenOrders.keys()].sort((a, b) => a - b);
        const gaps = [];
        for (let i = orders[0]; i < orders[orders.length - 1]; i += 1) {
            if (!seenOrders.has(i)) gaps.push(i);
        }
        if (gaps.length) {
            warn('registry', `reading path has unwritten positions: ${gaps.join(', ')}`);
        }
    }

    // 4 — prerequisites exist and come earlier
    for (const mod of theoryModules) {
        for (const prereq of mod.prerequisites || []) {
            const target = seenIds.get(prereq);
            if (!target) {
                error(`module "${mod.id}"`, `prerequisite "${prereq}" is not a module`);
            } else if (target.order >= mod.order) {
                error(
                    `module "${mod.id}"`,
                    `prerequisite "${prereq}" has order ${target.order}, which is not before ${mod.order}` +
                    ' — the reading path would ask the reader to know it before it is taught'
                );
            }
        }
    }
}

function checkChapters(theoryModules, questionIndex) {
    for (const mod of theoryModules) {
        const chapters = mod.chapters || [];
        if (!chapters.length) {
            error(`module "${mod.id}"`, 'has no chapters');
            continue;
        }

        const position = new Map();
        chapters.forEach((chapter, i) => {
            if (chapter.id) position.set(chapter.id, i);
        });

        const seen = new Set();
        chapters.forEach((chapter, i) => {
            const at = `${mod.id} › ${chapter.id || `chapter ${i + 1}`}`;

            // 5 — chapter ids unique within the module
            if (!chapter.id) { error(at, 'has no id'); return; }
            if (!KEBAB.test(chapter.id)) error(at, 'id is not kebab-case');
            if (seen.has(chapter.id)) error(at, 'duplicate chapter id');
            seen.add(chapter.id);

            for (const field of ['title', 'summary', 'interviewAngle']) {
                if (!chapter[field]) error(at, `has no ${field}`);
            }

            // 6 — importance tier
            if (!TIERS.includes(chapter.importance)) {
                error(at, `importance "${chapter.importance}" is not one of ${TIERS.join(', ')}`);
            }

            // 5 — buildsOn resolves, and earlier
            for (const dep of chapter.buildsOn || []) {
                if (!position.has(dep)) {
                    error(at, `buildsOn "${dep}" is not a chapter in this module`);
                } else if (position.get(dep) >= i) {
                    error(at, `buildsOn "${dep}" appears later in the module`);
                }
            }

            // 9 — must-know chapters carry documentation
            const docs = chapter.docs || [];
            if (chapter.importance === 'must-know' && !docs.length) {
                error(at, 'is must-know but links no documentation');
            }
            docs.forEach((doc, d) => checkDocEntry(doc, `${at} docs[${d}]`));

            // 7 — related questions resolve
            (chapter.relatedQuestions || []).forEach((ref, r) => {
                const where = `${at} relatedQuestions[${r}]`;
                if (!ref || !ref.topicId || !ref.questionId) {
                    error(where, 'must be {topicId, questionId}');
                    return;
                }
                if (!questionIndex.has(`${ref.topicId}::${ref.questionId}`)) {
                    error(where, `"${ref.questionId}" is not a question in topic "${ref.topicId}"`);
                }
            });

            // 10-13 — blocks
            const blocks = chapter.blocks || [];
            if (!blocks.length) error(at, 'has no blocks');
            blocks.forEach((block, b) => checkBlock(block, `${at} block[${b}]`));

            // 18 — cram mode filters chapters *and* predict blocks, so a
            // must-know puzzle inside a should-know chapter is invisible in
            // the exact mode it was written for: the chapter is hidden before
            // the block rule is ever consulted. Caught here rather than left
            // to be noticed, because it is invisible by definition.
            blocks.forEach((block, b) => {
                if (block.type !== 'predict') return;
                if (TIERS.indexOf(block.importance) < TIERS.indexOf(chapter.importance)) {
                    error(`${at} block[${b}]`,
                        `is ${block.importance} inside a ${chapter.importance} chapter — ` +
                        'cram mode hides the chapter, so the block could never be seen in it');
                }
            });
        });
    }
}

/* 8 — doc entries */
function checkDocEntry(doc, at, { requireKind = true } = {}) {
    if (!doc || typeof doc !== 'object') { error(at, 'is not an object'); return; }
    if (!doc.title) error(at, 'has no title');

    const hasPath = typeof doc.path === 'string';
    const hasUrl = typeof doc.url === 'string';

    if (hasPath === hasUrl) {
        error(at, 'must have exactly one of `path` (developer.android.com) or `url` (elsewhere)');
    }
    if (hasPath && !doc.path.startsWith('/')) {
        error(at, `path "${doc.path}" must start with "/" — it resolves against DOC_BASE`);
    }
    if (hasPath && /^https?:/.test(doc.path)) {
        error(at, 'path must not be absolute; use `url` for off-site links');
    }
    if (hasUrl && !doc.url.startsWith('https://')) {
        error(at, `url "${doc.url}" must be https`);
    }
    if (requireKind && !DOC_KINDS.includes(doc.kind)) {
        error(at, `kind "${doc.kind}" is not one of ${DOC_KINDS.join(', ')}`);
    }
}

function checkBlock(block, at) {
    if (!block || typeof block !== 'object') { error(at, 'is not an object'); return; }

    // 10 — known type, required fields present
    const required = BLOCK_FIELDS[block.type];
    if (!required) {
        error(at, `unknown block type "${block.type}"`);
        return;
    }
    for (const field of required) {
        const value = block[field];
        const empty = value == null || value === '' ||
            (Array.isArray(value) && value.length === 0);
        if (empty) error(at, `${block.type} block is missing "${field}"`);
    }

    // 11 — syntax language is one the highlighter understands
    if (block.type === 'syntax' && !LANGUAGES.includes(block.language)) {
        error(at, `language "${block.language}" is not one of ${LANGUAGES.join(', ')}`);
    }

    // 12 — diagram type is one the renderer implements
    if (block.type === 'diagram' && !DIAGRAM_TYPES.includes(block.diagramType)) {
        error(at, `diagramType "${block.diagramType}" is not one of ${DIAGRAM_TYPES.join(', ')}`);
    }

    // 15 — drill shape. The timebox and the tier are the two fields a reader
    // acts on, so neither may be decorative.
    if (block.type === 'drill') {
        if (!DRILL_IDS.includes(block.id)) {
            error(at, `drill id "${block.id}" is not in the catalogue (Appendix A)`);
        } else if (drillsSeen.has(block.id)) {
            error(at, `drill "${block.id}" already appears at ${drillsSeen.get(block.id)}`);
        } else {
            drillsSeen.set(block.id, at);
        }

        if (!Number.isInteger(block.tier) || block.tier < 1 || block.tier > 4) {
            error(at, `tier must be an integer 1–4, got ${JSON.stringify(block.tier)}`);
        }
        if (!Number.isInteger(block.minutes) || block.minutes <= 0) {
            error(at, `minutes must be a positive integer, got ${JSON.stringify(block.minutes)}`);
        }
        if (!Array.isArray(block.watchFor) || block.watchFor.some((w) => !w)) {
            error(at, 'watchFor must be a non-empty array of non-empty strings');
        } else {
            block.watchFor.forEach((w, i) => checkHtml(String(w), `${at} watchFor[${i}]`));
        }
        if (typeof block.prompt === 'string') checkHtml(block.prompt, `${at} prompt`);

        if (block.sketch) {
            if (!LANGUAGES.includes(block.sketch.language)) {
                error(at, `sketch language "${block.sketch.language}" is not one of ${LANGUAGES.join(', ')}`);
            }
            if (!block.sketch.code) error(at, 'sketch is present but has no code');
        }
    }

    /* 16 — predict shape. The whole section is a claim about what code prints,
       so the fields that carry the claim are the ones checked hardest. */
    if (block.type === 'predict') {
        if (!PREDICT_IDS.includes(block.id)) {
            error(at, `predict id "${block.id}" is not in the catalogue (Appendix A)`);
        } else if (predictionsSeen.has(block.id)) {
            error(at, `predict "${block.id}" already appears at ${predictionsSeen.get(block.id)}`);
        } else {
            predictionsSeen.set(block.id, at);
        }

        if (!TIERS.includes(block.importance)) {
            error(at, `importance "${block.importance}" is not one of ${TIERS.join(', ')}`);
        }
        if (!LANGUAGES.includes(block.language)) {
            error(at, `language "${block.language}" is not one of ${LANGUAGES.join(', ')}`);
        }
        if (typeof block.prompt === 'string') checkHtml(block.prompt, `${at} prompt`);
        if (block.distractor) checkHtml(String(block.distractor), `${at} distractor`);

        const output = block.output;
        if (!output || typeof output !== 'object') {
            error(at, 'output must be an object');
        } else {
            if (!OUTPUT_KINDS.includes(output.kind)) {
                error(at, `output.kind "${output.kind}" is not one of ${OUTPUT_KINDS.join(', ')}`);
            }
            if (!Array.isArray(output.lines) || !output.lines.length ||
                output.lines.some((l) => typeof l !== 'string')) {
                error(at, 'output.lines must be a non-empty array of strings');
            }
            if (output.explain) checkHtml(String(output.explain), `${at} output.explain`);

            // 17 — no dodging. In the question bank a `trace` is a fair choice
            // for an Activity or a Composable, which no toolchain here can run.
            // In a predict block it is only ever a choice, and choosing it for
            // a language run-snippets.js could have compiled is choosing not to
            // be checked. The section's entire value is that its answers are
            // verified, so this is an error rather than a warning.
            if (output.kind === 'trace' && RUNNABLE_LANGUAGES.includes(block.language)) {
                error(at, `output.kind is "trace" but language "${block.language}" is runnable — ` +
                          'a predict block that could be verified must claim "stdout"');
            }
        }
    }

    if (block.type === 'types') {
        (block.items || []).forEach((item, i) => {
            if (!item || !item.name || !item.html) {
                error(at, `types item[${i}] needs both name and html`);
            } else {
                checkHtml(item.html, `${at} item[${i}]`);
            }
        });
    }

    if (block.type === 'comparison') {
        (block.rows || []).forEach((row, i) => {
            if (!row || !row.aspect || row.left == null || row.right == null) {
                error(at, `comparison row[${i}] needs aspect, left and right`);
            }
        });
    }

    if (block.type === 'table') {
        const width = (block.headers || []).length;
        (block.rows || []).forEach((row, i) => {
            if (!Array.isArray(row)) {
                error(at, `table row[${i}] is not an array`);
            } else if (row.length !== width) {
                error(at, `table row[${i}] has ${row.length} cells, headers declare ${width}`);
            }
        });
    }

    for (const field of ['html', 'notes']) {
        if (typeof block[field] === 'string') checkHtml(block[field], `${at} ${field}`);
    }
}

/* 13 — authored HTML stays inside the allowed subset */
function checkHtml(html, at) {
    htmlIssues(html).forEach((issue) => error(at, issue));
}

/* 14 — coverage. A warning, because keyTopics phrasing will not always match
   theory prose, but it is the only signal that the reorganisation dropped a
   subject on the floor. */
function checkCoverage(topics, theoryModules) {
    if (!theoryModules.length) return;

    const haystack = JSON.stringify(theoryModules).toLowerCase();
    const missing = [];

    for (const topic of topics) {
        const keyTopics = [
            ...(topic.keyTopics || []),
            ...(topic.subsections || []).flatMap((s) => s.keyTopics || [])
        ];
        for (const key of new Set(keyTopics)) {
            // Compare on the significant words: "async-await & withContext"
            // should match prose that says withContext.
            const words = key.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 3);
            if (!words.length) continue;
            if (!words.some((w) => haystack.includes(w))) {
                missing.push(`${topic.id}: "${key}"`);
            }
        }
    }

    if (!missing.length) return;

    // Until the curriculum is finished most keyTopics are legitimately
    // unwritten, so listing all of them every run buries the errors. The full
    // list is what matters at the end of a phase, not on every commit.
    const showAll = process.argv.includes('--coverage');
    warn('coverage', `${missing.length} keyTopics have no match in the theory corpus yet` +
        (showAll ? ':' : ' (run with --coverage to list them)'));
    if (showAll) missing.forEach((m) => warnings.push(`    ${m}`));
}

/* 15 (continued) — every catalogued drill is written exactly once. Duplicates
   and unknown ids are errors at the block; what is left is what is missing,
   which is a warning while the section is still being authored. */
function checkDrillCatalogue() {
    if (!drillsSeen.size) return;
    const missing = DRILL_IDS.filter((id) => !drillsSeen.has(id));
    if (missing.length) {
        warn('drills', `${drillsSeen.size}/${DRILL_IDS.length} written; missing: ${missing.join(', ')}`);
    }
}

/* 16 (continued) — the same accounting for predictions. Reported even when
   nothing has been written yet, unlike the drill check: the catalogue lands in
   Phase 0 and the modules follow one per phase, so "0/80 written" is the
   progress bar for the rest of the plan rather than noise. */
function checkPredictCatalogue() {
    if (!PREDICT_IDS.length) return;
    const missing = PREDICT_IDS.filter((id) => !predictionsSeen.has(id));
    if (missing.length) {
        warn('predictions', `${predictionsSeen.size}/${PREDICT_IDS.length} written; missing: ${missing.join(', ')}`);
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

    const { topics, theoryTracks, theoryModules } = corpus;

    const questionIndex = new Set(
        allQuestions(topics).map(({ topicId, question }) => `${topicId}::${question.id}`)
    );

    const trackOrders = theoryTracks.map((t) => t.order);
    if (new Set(trackOrders).size !== trackOrders.length) {
        error('registry', 'track orders are not unique');
    }

    checkModules(theoryModules, theoryTracks);
    checkChapters(theoryModules, questionIndex);
    checkCoverage(topics, theoryModules);
    checkDrillCatalogue();
    checkPredictCatalogue();

    const chapterCount = theoryModules.reduce((n, m) => n + (m.chapters || []).length, 0);
    console.log(
        `Theory corpus: ${theoryTracks.length} tracks, ${theoryModules.length} modules, ` +
        `${chapterCount} chapters, checked against ${questionIndex.size} questions.`
    );

    if (warnings.length) {
        console.log(`\n${warnings.length} warning(s):`);
        warnings.forEach((w) => console.log(`  ! ${w}`));
    }

    if (errors.length) {
        console.error(`\n${errors.length} error(s):`);
        errors.forEach((e) => console.error(`  ✗ ${e}`));
        process.exit(1);
    }

    console.log('\n✓ valid');
}

main();
