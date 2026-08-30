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
