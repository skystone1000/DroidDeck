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

   Checks 1, 3, 4 and 5 from the plan describe fields that do not exist yet
   (`importance`, `images`, `codeSnippets[].output`). They are turned on by the
   phase that introduces each field; what is here is everything that can be
   enforced against the corpus as it stands.
   ========================================================================== */

const { loadCorpus } = require('./load-corpus');
const { LANGUAGES, DIAGRAM_TYPES, KEBAB, htmlIssues } = require('./schema');

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

    (question.referenceLinks || []).forEach((link, i) => {
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

    // 6 — snippet language is one the highlighter understands
    (question.codeSnippets || []).forEach((snippet, i) => {
        const where = `${at} codeSnippets[${i}]`;
        if (!snippet || typeof snippet !== 'object') { error(where, 'is not an object'); return; }
        if (!snippet.code) error(where, 'has no code');
        if (!LANGUAGES.includes(snippet.language)) {
            error(where, `language ${JSON.stringify(snippet.language)} is not one of ${LANGUAGES.join(', ')}`);
        }
    });

    checkDiagram(question, at);
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
