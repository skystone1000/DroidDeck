/* ==========================================================================
   Navigation registry validation.

   The two corpus validators check content. This one checks the structure the
   navigation is built on: that every track declares whether it is a subject or
   a mode, that every question topic names a subject track, that the five mode
   routes are reserved against both id spaces, and that the counters the mode
   header prints are counting what they claim to.

   Runs before every commit, alongside validate-theory.js and
   validate-questions.js.
   ========================================================================== */

const { loadCorpus } = require('./load-corpus.js');

const SUBJECT = 'subject';
const MODE = 'mode';

/* The two tracks that stopped being entries in a list and became destinations.
   Named here rather than inferred, so a third one cannot arrive by accident. */
const MODE_TRACKS = ['synthesis', 'output'];

const errors = [];
function fail(where, message) { errors.push(`${where}: ${message}`); }

/* --------------------------------------------------------------------------
   Tracks
   -------------------------------------------------------------------------- */

function checkTrackScope(theoryTracks) {
    theoryTracks.forEach((track) => {
        if (track.scope !== SUBJECT && track.scope !== MODE) {
            fail(`track ${track.id}`,
                `scope must be '${SUBJECT}' or '${MODE}', got ${JSON.stringify(track.scope)}`);
            return;
        }
        const expected = MODE_TRACKS.includes(track.id) ? MODE : SUBJECT;
        if (track.scope !== expected) {
            fail(`track ${track.id}`, `scope should be '${expected}'`);
        }
    });

    const subjects = theoryTracks.filter((t) => t.scope === SUBJECT);
    if (subjects.length !== 7) {
        fail('tracks', `expected 7 subject tracks, found ${subjects.length}`);
    }
}

/* --------------------------------------------------------------------------
   Question topics
   -------------------------------------------------------------------------- */

const EXPECTED_TOPIC_COUNT = 14;

function checkTopicTracks(topics, theoryTracks, topicTracks) {
    const subjectIds = theoryTracks.filter((t) => t.scope === SUBJECT).map((t) => t.id);

    if (topics.length !== EXPECTED_TOPIC_COUNT) {
        fail('topics', `expected ${EXPECTED_TOPIC_COUNT} topics, found ${topics.length}`);
    }

    topics.forEach((topic) => {
        // `null` is a deliberate, spelled-out answer: the topic renders in the
        // "Everything else" group. `undefined` is a topic nobody has decided
        // about, and that is what this check exists to catch.
        if (!(topic.id in topicTracks)) {
            fail(`topic ${topic.id}`, 'has no entry in topicTracks — add one, or map it to null');
            return;
        }
        const trackId = topicTracks[topic.id];
        if (trackId === null) return;
        if (!subjectIds.includes(trackId)) {
            fail(`topic ${topic.id}`,
                `trackId '${trackId}' is not a subject track (${subjectIds.join(', ')})`);
        }
    });

    Object.keys(topicTracks).forEach((id) => {
        if (!topics.some((t) => t.id === id)) {
            fail('topicTracks', `names '${id}', which is not a topic`);
        }
    });
}

/* --------------------------------------------------------------------------
   The mode registry
   -------------------------------------------------------------------------- */

const RESERVED = ['questions', 'theory', 'synthesis', 'predict', 'glossary'];
const SIDEBAR_KINDS = ['tracks', 'rounds', 'sets', 'alphabet'];
const GROUPS = ['study', 'drill'];

function checkModes(appModes, topics, theoryModules) {
    if (appModes.length !== 5) {
        fail('modes', `expected 5 modes, found ${appModes.length}`);
        return;
    }

    const seenId = new Set();
    const seenKey = new Set();

    appModes.forEach((mode, i) => {
        const where = `mode ${mode.id || i}`;

        if (seenId.has(mode.id)) fail(where, 'duplicate id');
        seenId.add(mode.id);

        if (!RESERVED.includes(mode.route)) {
            fail(where, `route '${mode.route}' is not one of the reserved segments (${RESERVED.join(', ')})`);
        }
        if (topics.some((t) => t.id === mode.route)) {
            fail(where, `route '${mode.route}' collides with a topic id`);
        }
        if (theoryModules.some((m) => m.id === mode.route)) {
            fail(where, `route '${mode.route}' collides with a module id`);
        }

        if (mode.railOrder !== i + 1) fail(where, `railOrder must be ${i + 1}, got ${mode.railOrder}`);
        if (String(mode.key) !== String(i + 1)) fail(where, `key must be '${i + 1}', got '${mode.key}'`);
        if (seenKey.has(mode.key)) fail(where, 'duplicate keyboard digit');
        seenKey.add(mode.key);

        if (!SIDEBAR_KINDS.includes(mode.sidebar)) {
            fail(where, `sidebar must be one of ${SIDEBAR_KINDS.join(', ')}, got '${mode.sidebar}'`);
        }
        if (!GROUPS.includes(mode.group)) {
            fail(where, `group must be 'study' or 'drill', got '${mode.group}'`);
        }
        if (!/^--[a-z0-9-]+$/.test(mode.accentVar || '')) {
            fail(where, `accentVar must be a CSS custom property name, got '${mode.accentVar}'`);
        }
        if (!mode.title || !mode.shortLabel) fail(where, 'needs both title and shortLabel');
        if (!mode.progressNoun) fail(where, 'needs a progressNoun');
    });

    // The divider in the rail separates study from drill, and the handoff says
    // not to remove it. It only means anything if the groups are contiguous.
    const groups = appModes.map((m) => m.group);
    if (groups.join(',') !== 'study,study,drill,drill,drill') {
        fail('modes', `rail order must be study,study,drill,drill,drill — got ${groups.join(',')}`);
    }
}

/* --------------------------------------------------------------------------
   The five totals the mode header prints

   Hard numbers, because a navigation refactor that quietly halves the Predict
   total is exactly the failure this file exists to catch, and "some number
   appeared" is not a check. Update them deliberately when the corpus grows.
   -------------------------------------------------------------------------- */

const EXPECTED_TOTALS = {
    questions: 465,   // questions across all fourteen topics
    theory: 154,      // chapters in the seven subject tracks
    synthesis: 24,    // drill blocks
    predict: 80,      // predict blocks
    glossary: 68      // definition blocks
};

function checkTotals(topics, theoryModules, theoryTracks) {
    const subjects = theoryTracks.filter((t) => t.scope === SUBJECT).map((t) => t.id);

    const blocksIn = (trackId, type) => theoryModules
        .filter((m) => m.trackId === trackId)
        .reduce((n, m) => n + (m.chapters || []).reduce(
            (k, c) => k + (c.blocks || []).filter((b) => b.type === type).length, 0), 0);

    const actual = {
        questions: topics.reduce((n, t) => n + (t.questions || []).length, 0),
        theory: theoryModules
            .filter((m) => subjects.includes(m.trackId))
            .reduce((n, m) => n + (m.chapters || []).length, 0),
        synthesis: blocksIn('synthesis', 'drill'),
        predict: blocksIn('output', 'predict'),
        glossary: theoryModules.reduce((n, m) => n + (m.chapters || []).reduce(
            (k, c) => k + (c.blocks || []).filter((b) => b.type === 'definition').length, 0), 0)
    };

    Object.keys(EXPECTED_TOTALS).forEach((id) => {
        if (actual[id] !== EXPECTED_TOTALS[id]) {
            fail(`mode ${id}`, `total is ${actual[id]}, expected ${EXPECTED_TOTALS[id]} — ` +
                'if the corpus grew on purpose, update EXPECTED_TOTALS in tools/validate-nav.js');
        }
    });
}

/* --------------------------------------------------------------------------
   The optional fields the promoted modes render

   None of these is required. Interview Synthesis ships against the drill
   fields that already exist — title, minutes, prompt, watchFor, sketch — and
   renders the richer blocks only where an author has written one.

   But a half-written spine is worse than no spine, so anything present is
   checked as strictly as a required field would be.
   -------------------------------------------------------------------------- */

function checkDrillExtras(theoryModules) {
    const moduleIds = theoryModules.map((m) => m.id);
    const chapterIds = new Set();
    theoryModules.forEach((m) => (m.chapters || []).forEach((c) => chapterIds.add(`${m.id}:${c.id}`)));

    theoryModules.forEach((mod) => {
        (mod.chapters || []).forEach((chapter) => {
            (chapter.blocks || []).forEach((block) => {
                if (block.type !== 'drill') return;
                const where = `drill ${block.id}`;

                if (block.spine !== undefined) {
                    if (!Array.isArray(block.spine) || !block.spine.length) {
                        fail(where, 'spine must be a non-empty array');
                    } else {
                        block.spine.forEach((step, i) => {
                            if (!step || typeof step.do !== 'string' || !step.do.trim()) {
                                fail(where, `spine[${i}] needs a 'do' string — one line of instruction`);
                            }
                            if (!step || typeof step.nuance !== 'string' || !step.nuance.trim()) {
                                fail(where, `spine[${i}] needs a 'nuance' string — one line of why`);
                            }
                        });
                    }
                }

                (block.pullsFrom || []).forEach((ref, i) => {
                    if (!moduleIds.includes(ref.moduleId)) {
                        fail(where, `pullsFrom[${i}] names module '${ref.moduleId}', which does not exist`);
                    } else if (ref.chapterId && !chapterIds.has(`${ref.moduleId}:${ref.chapterId}`)) {
                        fail(where, `pullsFrom[${i}] names chapter '${ref.chapterId}', which is not in ${ref.moduleId}`);
                    }
                });

                (block.followUps || []).forEach((ref, i) => {
                    if (!ref.question || !String(ref.question).trim()) {
                        fail(where, `followUps[${i}] needs a question`);
                    }
                    if (!moduleIds.includes(ref.moduleId)) {
                        fail(where, `followUps[${i}] names module '${ref.moduleId}', which does not exist`);
                    }
                });

                // The screen gives this panel a heading of its own. Zero
                // entries means a heading over nothing.
                if (!(block.watchFor || []).length) {
                    fail(where, 'has no watchFor entries — the "Where candidates lose it" panel would be empty');
                }
            });
        });
    });
}

/* --------------------------------------------------------------------------
   Wiring
   -------------------------------------------------------------------------- */

function main() {
    const { topics, topicTracks, theoryTracks, theoryModules, appModes } = loadCorpus();

    checkTrackScope(theoryTracks);
    checkTopicTracks(topics, theoryTracks, topicTracks || {});
    checkModes(appModes || [], topics, theoryModules);
    checkTotals(topics, theoryModules, theoryTracks);
    checkDrillExtras(theoryModules);

    if (errors.length) {
        console.error(`\n${errors.length} problem(s):\n`);
        errors.forEach((e) => console.error(`  ✗ ${e}`));
        process.exit(1);
    }
    console.log('✓ navigation registry OK');
}

main();
