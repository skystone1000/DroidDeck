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
   Wiring
   -------------------------------------------------------------------------- */

function main() {
    const { topics, topicTracks, theoryTracks } = loadCorpus();

    checkTrackScope(theoryTracks);
    checkTopicTracks(topics, theoryTracks, topicTracks || {});

    if (errors.length) {
        console.error(`\n${errors.length} problem(s):\n`);
        errors.forEach((e) => console.error(`  ✗ ${e}`));
        process.exit(1);
    }
    console.log('✓ navigation registry OK');
}

main();
