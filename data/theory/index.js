/* ==========================================================================
   Theory registry.

   Load order matters: every module file above declares the global this script
   references, so it must come last among the theory files. `theoryModules` is
   ordered by the reading path, which is what the curriculum overview and the
   prerequisite checks depend on.

   Tracks are declaration-only — they carry order and identity, never content.
   They map onto the sidebar's existing two levels: a track renders as a nav
   group, its modules as the entries inside it.
   ========================================================================== */

const theoryTracks = [
    { id: 'language',     title: 'Language Foundations',            icon: '🟣', order: 1 },
    { id: 'async',        title: 'Asynchrony & State',              icon: '⚡', order: 2 },
    { id: 'platform',     title: 'The Android Platform',            icon: '🤖', order: 3 },
    { id: 'ui',           title: 'Building UI',                     icon: '🎨', order: 4 },
    { id: 'data',         title: 'Data & Background Work',          icon: '💾', order: 5 },
    { id: 'architecture', title: 'Architecture & Design',           icon: '🏗️', order: 6 },
    { id: 'quality',      title: 'Testing, Performance & Tooling',  icon: '🧪', order: 7 },
    { id: 'synthesis',    title: 'Interview Synthesis',             icon: '🎯', order: 8 }
];

/* Ordered by the reading path. Appended to as each module is authored. */
const theoryModules = [
    androidThreadingModelModule,
    coroutinesFundamentalsModule,
    structuredConcurrencyModule,
    flowFundamentalsModule,
    reactiveStateModule,
    kotlinEssentialsModule,
    kotlinFunctionsModule,
    kotlinClassesModule,
    kotlinCollectionsModule,
    kotlinGenericsDelegationModule,
    jvmFoundationsModule,
    platformArchitectureModule,
    activitiesLifecycleModule,
    fragmentsModule,
    intentsDeepLinksModule,
    contextResourcesModule,
    permissionsPrivacyModule,
    composeMentalModelModule,
    composeStateModule,
    composeSideEffectsModule,
    composeLayoutModule,
    composeListsPerformanceModule,
    composeThemingModule,
    navigationModule,
    viewSystemModule,
    dataLayerModule,
    localPersistenceModule,
    networkingModule,
    offlineFirstModule,
    backgroundWorkModule,
    servicesModule,
    architecturePrinciplesModule,
    viewModelModule,
    uiStateModule,
    architecturePatternsModule,
    dependencyInjectionModule,
    designPatternsModule,
    modularizationModule,
    testingFundamentalsModule,
    testingCoroutinesModule,
    uiTestingModule,
    performanceModule,
    buildAndToolingModule,
    algorithmsModule,
    machineCodingRoundModule,
    machineCodingSpineModule,
    featureDrillsModule,
    utilityDrillsModule,
    systemDesignModule,
    theRestOfTheLoopModule
];

const theoryByModuleId = theoryModules.reduce((map, mod) => {
    map[mod.id] = mod;
    return map;
}, {});

/** Modules belonging to a track, in reading order. */
function modulesInTrack(trackId) {
    return theoryModules
        .filter((mod) => mod.trackId === trackId)
        .sort((a, b) => a.order - b.order);
}
