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

/* `scope` is what separates a track the sidebar lists from a track that has
   become a mode of its own. The seven subjects are the organising axis inside
   Questions and Theory and a filter inside the Glossary; `synthesis` and
   `output` still own their modules, but the rail addresses them directly and
   they never appear in a track list again.

   No module is re-tracked by this field. It describes where a track is
   *shown*, not what it contains — which is why the prerequisite ordering the
   validator enforces is untouched by the promotion. */
const theoryTracks = [
    { id: 'language',     title: 'Language Foundations',           order: 1, scope: 'subject' },
    { id: 'async',        title: 'Asynchrony & State',             order: 2, scope: 'subject' },
    { id: 'platform',     title: 'The Android Platform',           order: 3, scope: 'subject' },
    { id: 'ui',           title: 'Building UI',                    order: 4, scope: 'subject' },
    { id: 'data',         title: 'Data & Background Work',         order: 5, scope: 'subject' },
    { id: 'architecture', title: 'Architecture & Design',          order: 6, scope: 'subject' },
    { id: 'quality',      title: 'Testing, Performance & Tooling', order: 7, scope: 'subject' },
    { id: 'synthesis',    title: 'Interview Synthesis',            order: 8, scope: 'mode' },
    { id: 'output',       title: 'Predict the Output',             order: 9, scope: 'mode' }
];

/** The seven the sidebar lists, in reading order. */
function subjectTracks() {
    return theoryTracks
        .filter((track) => track.scope === 'subject')
        .sort((a, b) => a.order - b.order);
}

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
    theRestOfTheLoopModule,
    predictCoroutineBuildersModule,
    predictCoroutineFailureModule,
    predictFlowModule,
    predictKotlinModule,
    predictJavaModule,
    predictComposeModule,
    predictLifecycleModule
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
