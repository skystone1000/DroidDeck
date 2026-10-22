/* ==========================================================================
   Corpus loader — reads the data layer the way the browser does.

   There is no module system: every data file declares a top-level `const` and
   `data/index.js` assembles them. Node cannot `require()` that, so we
   concatenate the files in the same order `index.html` loads them and evaluate
   the result as one script. Because it is a single script, the declarations
   are visible to each other exactly as they are in the browser.

   Used by validate-theory.js and check-doc-links.js.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const THEORY_DIR = path.join(DATA_DIR, 'theory');

/** Files in a directory, `index.js` last — it depends on all the others. */
function sourceFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir)
        .filter((f) => f.endsWith('.js'))
        .filter((f) => f !== 'index.js')
        .sort();
    if (fs.existsSync(path.join(dir, 'index.js'))) files.push('index.js');
    return files.map((f) => path.join(dir, f));
}

function loadCorpus() {
    const files = [...sourceFiles(DATA_DIR), ...sourceFiles(THEORY_DIR)];

    // `typeof x === 'undefined'` guards let this run before the theory layer
    // exists — Phase 0 has a registry but no modules, and the validator has to
    // be runnable from the very first commit.
    const source = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n;\n') + `
        ;({
            topics:        typeof topics        === 'undefined' ? [] : topics,
            topicTracks:   typeof topicTracks    === 'undefined' ? {} : topicTracks,
            theoryTracks:  typeof theoryTracks  === 'undefined' ? [] : theoryTracks,
            theoryModules: typeof theoryModules === 'undefined' ? [] : theoryModules,
            appModes:      typeof appModes      === 'undefined' ? [] : appModes
        })
    `;

    let corpus;
    try {
        corpus = vm.runInNewContext(source, {}, { filename: 'corpus.js' });
    } catch (error) {
        throw new Error(
            `Could not evaluate the data layer — a data file has a syntax error.\n${error.message}`
        );
    }

    return {
        ...corpus,
        files: files.map((f) => path.relative(ROOT, f))
    };
}

/** Every question in the corpus, tagged with the topic that owns it. */
function allQuestions(topics) {
    const out = [];
    for (const topic of topics) {
        for (const question of topic.questions || []) {
            out.push({ topicId: topic.id, question });
        }
    }
    return out;
}

/** Every chapter in the corpus, tagged with the module that owns it. */
function allChapters(theoryModules) {
    const out = [];
    for (const mod of theoryModules) {
        for (const chapter of mod.chapters || []) {
            out.push({ moduleId: mod.id, module: mod, chapter });
        }
    }
    return out;
}

module.exports = { loadCorpus, allQuestions, allChapters, ROOT };
