/* ==========================================================================
   M33 — ViewModel and state holders.

   M13 established what survives a configuration change and what does not.
   This module is about the class built on top of that fact — what it is
   scoped to, what it must never hold, and when a plain class is better.
   ========================================================================== */

const viewModelModule = {
    id: 'viewmodel',
    trackId: 'architecture',
    order: 33,
    title: 'ViewModel and State Holders',
    tagline: 'Scoped to a lifecycle owner, and never holding a View.',
    estimatedMinutes: 30,
    prerequisites: ['architecture-principles'],
    docHub: {
        title: 'ViewModel overview',
        path: '/topic/libraries/architecture/viewmodel'
    },

    chapters: [
        {
            id: 'what-it-is',
            title: 'What a ViewModel actually is',
            importance: 'must-know',
            summary: 'An object held in a store that outlives the activity instance, and is cleared when the owner is finished for good.',
            interviewAngle: '"How does ViewModel survive rotation?" — the answer is a retained store, not magic.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The mechanism is worth knowing because it explains every rule that follows. A <code>ViewModelStore</code> is a map of <code>ViewModel</code>s, and <code>ComponentActivity</code> (M13) hands that store to the system as its <em>retained non-configuration instance</em> when it is destroyed for a configuration change. The new activity instance is given the same store back, so it receives the same objects.</p>'
                },
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'The two paths out of an activity',
                    code: `Rotation                              Back pressed / finish()
  onDestroy()                           onDestroy()
  isChangingConfigurations() == true    isChangingConfigurations() == false
       ↓                                     ↓
  ViewModelStore RETAINED               ViewModelStore.clear()
       ↓                                     ↓
  new Activity gets the same store      onCleared() on every ViewModel
       ↓
  same ViewModel instances

Process death: the store is in memory, so it is gone with the process.
That is what SavedStateHandle is for (M13).`,
                    notes: '<code>onCleared()</code> is the only reliable teardown hook a <code>ViewModel</code> gets, and it does not run on process death — so it is for cancelling and releasing, never for saving.'
                },
                {
                    type: 'pitfall',
                    html: '<p>A <code>ViewModel</code> must never hold a <code>View</code>, an <code>Activity</code>, a <code>Fragment</code>, or an activity <code>Context</code>. It deliberately outlives all of them, so holding one leaks the entire view hierarchy across every rotation for the life of the screen — the M16 leak, guaranteed rather than accidental. If you genuinely need a <code>Context</code>, use <code>AndroidViewModel</code>, which holds the <code>Application</code>, and treat needing it as a hint that the work belongs in the data layer.</p>'
                },
                {
                    type: 'types',
                    title: 'Scoping — what "the owner" is',
                    items: [
                        { name: 'Activity', html: '<p><code>by viewModels()</code> in an activity. Lives until the activity is finished.</p>' },
                        { name: 'Fragment', html: '<p><code>by viewModels()</code> in a fragment. Cleared when the fragment is destroyed for good — not when its view is (M14).</p>' },
                        { name: 'Activity, from a fragment', html: '<p><code>by activityViewModels()</code>. Two fragments in the same activity get the same instance, which is the standard way to share state between them.</p>' },
                        { name: 'A navigation graph', html: '<p>Scoped to a nested graph, so it is cleared when the whole flow is popped. The right scope for a multi-screen wizard, and better than an activity-scoped one that outlives the flow.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Scope is the decision that actually matters here. An activity-scoped <code>ViewModel</code> used to share state between two fragments keeps that state for as long as the activity exists — including long after the user has left the flow it belonged to. A graph-scoped one is cleared when the flow is, which is almost always what was meant.</p>'
                },
                {
                    type: 'tip',
                    html: '<p><code>viewModelScope</code> is a <code>CoroutineScope</code> cancelled in <code>onCleared</code>, which makes it the correct home for work tied to a screen (M30) and one more reason not to launch in <code>GlobalScope</code>. It runs on <code>Dispatchers.Main.immediate</code>, so state updates land without a post.</p>'
                }
            ],
            docs: [
                { title: 'ViewModel overview', path: '/topic/libraries/architecture/viewmodel', kind: 'guide' },
                { title: 'ViewModel APIs cheat sheet', path: '/topic/libraries/architecture/viewmodel/viewmodel-cheatsheet', kind: 'guide' },
                { title: 'ViewModel scoping APIs', path: '/topic/libraries/architecture/viewmodel/viewmodel-apis', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-viewmodel' },
                { topicId: 'android', questionId: 'android-viewmodel-internals' },
                { topicId: 'android', questionId: 'android-shared-viewmodel' },
                { topicId: 'android', questionId: 'android-share-viewmodel-fragments' },
                { topicId: 'android', questionId: 'android-architecture-components' }
            ]
        },

        {
            id: 'construction',
            title: 'Getting dependencies into one',
            importance: 'should-know',
            summary: 'You do not call the constructor, so anything it needs arrives through a factory.',
            interviewAngle: 'The factory question is really a DI question, and it is the natural bridge into M36.',
            buildsOn: ['what-it-is'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>You never instantiate a <code>ViewModel</code> yourself — the store does, so that it can hand back the existing one when there is one. That is why a <code>ViewModel</code> with constructor parameters needs a <strong>factory</strong>: something that knows how to build it when the store decides one is needed.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'By hand, and with Hilt',
                    code: `// By hand — the factory is the seam where dependencies enter.
class ProfileViewModelFactory(
    private val users: UserRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T =
        ProfileViewModel(users) as T
}

private val viewModel: ProfileViewModel by viewModels {
    ProfileViewModelFactory(appContainer.users)
}

// With Hilt (M36) — the factory is generated.
@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val users: UserRepository,
    private val handle: SavedStateHandle          // injected, no extra wiring
) : ViewModel()

private val viewModel: ProfileViewModel by viewModels()`,
                    notes: '<code>SavedStateHandle</code> is provided automatically by both routes — by <code>SavedStateViewModelFactory</code> in the manual case — so process-death survival (M13) does not cost extra wiring.'
                },
                {
                    type: 'types',
                    title: 'Related pieces',
                    items: [
                        { name: 'CreationExtras', html: '<p>The modern factory API, replacing the several overlapping <code>Factory</code> base classes. It is how a factory receives contextual values like the <code>SavedStateHandle</code> and the <code>Application</code>.</p>' },
                        { name: 'Assisted injection', html: '<p>For a <code>ViewModel</code> needing a runtime value that DI cannot know — an item id from navigation. Usually better solved by putting the id in <code>SavedStateHandle</code>, which survives process death; assisted injection does not.</p>' },
                        { name: 'Compose', html: '<p><code>viewModel()</code> inside a composable resolves the nearest <code>ViewModelStoreOwner</code>, which in a <code>NavHost</code> is the back stack entry — so scoping follows navigation without extra work.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Creating the <code>ViewModel</code> with <code>ProfileViewModel()</code> directly compiles and appears to work, and it defeats the entire mechanism: a new instance on every rotation, no retention, and the bug looks like "my state resets sometimes" rather than like a construction error.</p>'
                }
            ],
            docs: [
                { title: 'Create ViewModels with dependencies', path: '/topic/libraries/architecture/viewmodel/viewmodel-factories', kind: 'guide' },
                { title: 'Saved state module for ViewModel', path: '/topic/libraries/architecture/viewmodel/viewmodel-savedstate', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-viewmodel' },
                { topicId: 'design-pattern', questionId: 'design-pattern-dependency-injection' }
            ]
        },

        {
            id: 'state-holders',
            title: 'When a ViewModel is not the answer',
            importance: 'should-know',
            summary: 'Business logic needs a ViewModel; UI logic often just needs a plain class remembered in the composition.',
            interviewAngle: 'Knowing that not every state holder should be a ViewModel is a genuinely senior distinction.',
            buildsOn: ['what-it-is'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The reflex is that every screen gets a <code>ViewModel</code> and everything stateful goes in it. But a <code>ViewModel</code> buys exactly two things — surviving configuration change, and a scope that outlives the view — and plenty of state needs neither.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Two kinds of state holder',
                    left: 'ViewModel',
                    right: 'Plain state holder',
                    rows: [
                        { aspect: 'Holds', left: 'Screen state and business logic', right: 'UI logic — scroll, expansion, snackbars' },
                        { aspect: 'Survives rotation', left: 'Yes', right: 'Only via <code>rememberSaveable</code>' },
                        { aspect: 'Lives in', left: 'The <code>ViewModelStore</code>', right: 'The composition, or the view' },
                        { aspect: 'Knows the UI', left: 'Never', right: 'Yes — that is its job' },
                        { aspect: 'Example', left: '<code>ProfileViewModel</code>', right: '<code>ScaffoldState</code>, <code>LazyListState</code>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Compose is full of the right-hand column already — <code>rememberLazyListState</code>, <code>rememberScaffoldState</code> — and your own follow the same shape: a class holding UI state, created with <code>remember</code>, allowed to know about the UI because it is part of it. Putting scroll position in a <code>ViewModel</code> couples business logic to a widget for no gain.</p>'
                },
                {
                    type: 'types',
                    title: 'The dividing question',
                    items: [
                        { name: 'Would a user notice it after rotation?', html: '<p>If yes, it belongs in the <code>ViewModel</code> or in saved state. A half-filled form does; whether a tooltip is showing does not.</p>' },
                        { name: 'Does it need data or a repository?', html: '<p>Then it is business logic, and it belongs in the <code>ViewModel</code>.</p>' },
                        { name: 'Is it only meaningful with the UI present?', html: '<p>Then it is UI logic. A plain holder is simpler, testable without Android, and does not outlive the thing it describes.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The same reasoning explains why <code>LiveData</code> is legacy rather than wrong. It was lifecycle-aware before anything else was, and its cost is that it is an Android type — untestable on the JVM without a rule, and unusable in shared Kotlin code. <code>StateFlow</code> with <code>collectAsStateWithLifecycle</code> (M11) is the current answer; <code>setValue</code> versus <code>postValue</code> and <code>ObservableField</code> are the questions that come with the older one.</p>'
                }
            ],
            docs: [
                { title: 'State holders and UI state', path: '/topic/architecture/ui-layer/stateholders', kind: 'guide' },
                { title: 'ViewModel overview', path: '/topic/libraries/architecture/viewmodel', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-livedata' },
                { topicId: 'android', questionId: 'android-stateflow-vs-livedata' },
                { topicId: 'android', questionId: 'android-setvalue-vs-postvalue' },
                { topicId: 'android', questionId: 'android-livedata-vs-observablefield' }
            ]
        }
    ]
};
