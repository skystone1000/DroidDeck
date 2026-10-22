/* ==========================================================================
   Topic registry.

   Load order matters: every topic file above declares the global this array
   references, so this script must come last in index.html. The array order is
   the sidebar order, and topics[0] is the default route when the hash is empty.
   ========================================================================== */

const topics = [
    kotlinCoroutinesData,
    kotlinFlowApiData,
    kotlinData,
    androidData,
    androidLibrariesData,
    androidArchitectureData,
    designPatternData,
    androidSystemDesignData,
    androidUnitTestingData,
    androidToolsTechnologiesData,
    jetpackComposeData,
    javaData,
    otherTopicsData,
    dataStructuresAlgorithmsData
];

/* Which subject track a question topic belongs to.

   This mapping is not new — js/navigation.js has carried it since the emoji
   were removed, encoded as a hue, with the note that "a topic takes the hue of
   the theory track its subject belongs to". Writing it down as an id rather
   than as a colour is what lets the sidebar group by it, the glossary filter
   by it, and a synthesis prompt link back through it. Hue now derives from the
   track instead of being repeated beside it, so the two cannot drift apart.

   Two topics have no subject track of their own, because their theory lives in
   a track that is now a mode: android-system-design and
   data-structures-algorithms. They file under the nearest subject rather than
   vanishing from the sidebar.

   `other-topics` is a deliberate null. It is precisely the material that
   belongs to no subject, and it renders in the "Everything else" group at the
   foot of the list — one rule, rather than an invented eighth track. */
const topicTracks = {
    'kotlin':                     'language',
    'java':                       'language',
    'data-structures-algorithms': 'language',
    'kotlin-coroutines':          'async',
    'kotlin-flow-api':            'async',
    'android':                    'platform',
    'jetpack-compose':            'ui',
    'android-libraries':          'data',
    'android-architecture':       'architecture',
    'design-pattern':             'architecture',
    'android-system-design':      'architecture',
    'android-unit-testing':       'quality',
    'android-tools-technologies': 'quality',
    'other-topics':               null
};

/** Topics in a subject track, in registry order. `null` gives the strays. */
function topicsInTrack(trackId) {
    return topics.filter((topic) => (topicTracks[topic.id] || null) === trackId);
}
