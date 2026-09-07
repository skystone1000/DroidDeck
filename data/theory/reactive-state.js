/* ==========================================================================
   M11 — StateFlow, SharedFlow and reactive UI state.

   Closes the async track by answering the question M10 opened: a cold flow
   restarts per collector, and a screen needs one shared, always-available
   value instead.
   ========================================================================== */

const reactiveStateModule = {
    id: 'reactive-state',
    trackId: 'async',
    order: 11,
    title: 'Reactive UI State',
    tagline: 'One value, shared, always available.',
    estimatedMinutes: 30,
    prerequisites: ['flow-fundamentals'],
    docHub: {
        title: 'StateFlow and SharedFlow',
        path: '/kotlin/flow/stateflow-and-sharedflow'
    },

    chapters: [
        {
            id: 'stateflow-and-sharedflow',
            title: 'StateFlow and SharedFlow',
            importance: 'must-know',
            summary: 'Hot flows that stay alive independently of collectors — one holding a current value, one broadcasting events.',
            interviewAngle: 'The comparison table is close to guaranteed, usually with LiveData added as a third column.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A cold <code>Flow</code> restarts for every collector. That is wrong for UI state: two collectors of the same screen state would each trigger their own database read, and a collector arriving late would have no value at all until the next emission.</p><p>Hot flows fix both. They exist independently of collectors, and they share.</p>'
                },
                {
                    type: 'definition',
                    term: 'StateFlow',
                    important: true,
                    html: '<p>A hot flow that always holds exactly one current value, readable synchronously through <code>.value</code>. New collectors immediately receive the current value. It conflates — a fast producer means slow collectors skip intermediate values — and it drops emissions equal to the current one.</p>'
                },
                {
                    type: 'definition',
                    term: 'SharedFlow',
                    important: true,
                    html: '<p>A hot flow with no current value and a configurable replay buffer. Collectors receive emissions made while they are subscribed, plus whatever the replay cache holds. No conflation and no equality filtering by default.</p>'
                },
                {
                    type: 'comparison',
                    title: 'StateFlow versus SharedFlow',
                    left: 'StateFlow',
                    right: 'SharedFlow',
                    rows: [
                        { aspect: 'Holds a value', left: 'Always — <code>.value</code>', right: 'Only if <code>replay &gt; 0</code>' },
                        { aspect: 'Initial value', left: 'Required', right: 'None' },
                        { aspect: 'New collector gets', left: 'The current value at once', right: 'The replay cache, if any' },
                        { aspect: 'Duplicates', left: 'Dropped — conflates on equality', right: 'Delivered' },
                        { aspect: 'Models', left: 'State', right: 'Events' },
                        { aspect: 'Typical use', left: 'Screen UI state', right: 'Show a snackbar, navigate once' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p><code>StateFlow</code> compares with <code>equals</code>. Emitting a <code>data class</code> whose contents are unchanged is silently dropped — correct and efficient. But mutating a list <em>in place</em> and re-assigning it emits an object equal to the previous one, so nothing updates. Always emit a new instance.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'State exposed read-only',
                    code: `class ItemsViewModel(repo: ItemRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    // Events, not state: a snackbar should fire once, not replay on rotation.
    private val _messages = MutableSharedFlow<String>()
    val messages: SharedFlow<String> = _messages.asSharedFlow()

    fun refresh() = viewModelScope.launch {
        _uiState.value = UiState.Loading
        runCatching { repo.load() }
            .onSuccess { _uiState.value = UiState.Loaded(it) }
            .onFailure { _messages.emit("Couldn't refresh") }
    }
}`,
                    notes: 'The private mutable / public read-only pair is the convention. <code>asStateFlow()</code> prevents a consumer casting back to the mutable type.'
                }
            ],
            docs: [
                { title: 'StateFlow and SharedFlow', path: '/kotlin/flow/stateflow-and-sharedflow', kind: 'guide' },
                { title: 'StateFlow', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/-state-flow/', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-stateflow-sharedflow' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-cold-vs-hot' }
            ]
        },

        {
            id: 'versus-livedata',
            title: 'StateFlow versus LiveData',
            importance: 'must-know',
            summary: 'LiveData is lifecycle-aware by design; StateFlow is not, and needs help to be.',
            interviewAngle: '"Why did the ecosystem move to StateFlow?" A fair answer names what LiveData did better, not just what it did worse.',
            buildsOn: ['stateflow-and-sharedflow'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'The two side by side',
                    left: 'LiveData',
                    right: 'StateFlow',
                    rows: [
                        { aspect: 'Lifecycle awareness', left: 'Built in — stops at STOPPED', right: 'None — needs <code>repeatOnLifecycle</code>' },
                        { aspect: 'Initial value', left: 'Optional', right: 'Required' },
                        { aspect: 'Operators', left: 'A handful via <code>Transformations</code>', right: 'The whole Flow operator set' },
                        { aspect: 'Threading', left: 'Main thread, <code>postValue</code> to cross', right: 'Any dispatcher' },
                        { aspect: 'Platform dependency', left: 'Android only', right: 'Pure Kotlin — works in shared code' },
                        { aspect: 'Backpressure', left: 'Conflates', right: 'Conflates' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The honest summary: <code>LiveData</code> solved lifecycle safety and nothing else, at a time when that was the problem worth solving. <code>StateFlow</code> is a better primitive — richer operators, no Android dependency, usable in a shared Kotlin module — but it gave up the one thing <code>LiveData</code> did automatically. Collecting a <code>StateFlow</code> naively in a Fragment keeps collecting while the screen is in the background.</p>'
                },
                {
                    type: 'definition',
                    term: 'repeatOnLifecycle',
                    important: true,
                    html: '<p>A suspending function that runs its block whenever the lifecycle reaches at least the given state and <strong>cancels</strong> it when it drops below. This is what restores lifecycle safety to flow collection.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Collecting safely in a Fragment, and in Compose',
                    code: `// Views: the block is cancelled at STOPPED and restarted at STARTED.
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { render(it) }
    }
}

// Compose: does the same thing, and is the reason to prefer it over
// collectAsState() in Android UI.
@Composable
fun ItemsScreen(viewModel: ItemsViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ItemsContent(state)
}`,
                    notes: '<code>lifecycleScope.launch</code> alone is not enough — it cancels at <em>destroy</em>, not at stop, so collection continues behind a backgrounded screen.'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>launchWhenStarted</code> looks like it does the same job. It <em>suspends</em> the coroutine instead of cancelling it, so an upstream flow stays subscribed and keeps producing while the screen is in the background. It is deprecated in favour of <code>repeatOnLifecycle</code>.</p>'
                }
            ],
            docs: [
                { title: 'StateFlow and SharedFlow', path: '/kotlin/flow/stateflow-and-sharedflow', kind: 'guide' },
                { title: 'Use Kotlin coroutines with lifecycle-aware components', path: '/topic/libraries/architecture/coroutines', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-stateflow-vs-livedata' },
                { topicId: 'android', questionId: 'android-livedata' },
                { topicId: 'android', questionId: 'android-setvalue-vs-postvalue' }
            ]
        },

        {
            id: 'statein-and-sharein',
            title: 'stateIn and shareIn',
            importance: 'must-know',
            summary: 'Convert a cold flow into a hot one, and choose how long it stays alive without collectors.',
            interviewAngle: 'The follow-up is always "why five seconds?" — and the answer is configuration change, not a magic number.',
            buildsOn: ['versus-livedata'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Repositories expose cold flows — a Room query, a network poll. Screens need hot state. <code>stateIn</code> and <code>shareIn</code> are the conversion, and they take a scope because the resulting hot flow needs a lifetime.</p>'
                },
                {
                    type: 'types',
                    title: 'The two conversions',
                    items: [
                        { name: 'stateIn(scope, started, initialValue)', html: '<p>Produces a <code>StateFlow</code>. Requires an initial value because a <code>StateFlow</code> always has one.</p>', whenToUse: 'the upstream represents state' },
                        { name: 'shareIn(scope, started, replay)', html: '<p>Produces a <code>SharedFlow</code>. No initial value; <code>replay</code> decides what a late collector sees.</p>', whenToUse: 'the upstream represents events' }
                    ]
                },
                {
                    type: 'types',
                    title: 'SharingStarted — when the upstream runs',
                    items: [
                        { name: 'Eagerly', html: '<p>Starts immediately and never stops. Work happens even with nobody watching.</p>' },
                        { name: 'Lazily', html: '<p>Starts on the first collector and never stops after that.</p>' },
                        { name: 'WhileSubscribed(stopTimeoutMillis)', html: '<p>Starts on the first collector and stops when the last one leaves, after the timeout. The right default for a screen.</p>', whenToUse: 'essentially always in a ViewModel' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The standard ViewModel shape',
                    code: `val uiState: StateFlow<UiState> = repository.observeItems()
    .map { UiState.Loaded(it) }
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = UiState.Loading
    )`,
                    notes: 'This is the shape to be able to write from memory — it appears in essentially every modern Android codebase.'
                },
                {
                    type: 'prose',
                    html: '<p>The five seconds is the part worth understanding rather than copying. On a configuration change the Activity is destroyed and recreated, so every collector unsubscribes and then resubscribes a moment later. With a timeout of zero the upstream would be torn down and restarted on every rotation — a fresh database query and a lost cache for nothing. Five seconds comfortably outlasts a rotation while still stopping work when the user genuinely leaves.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>SharingStarted.Eagerly</code> in a <code>ViewModel</code> keeps the upstream running for the ViewModel’s whole life — including while the app is backgrounded. It looks like a safe default and is quietly the reason for background network and battery drain.</p>'
                },
                {
                    type: 'diagram',
                    diagramType: 'flowchart',
                    diagramConfig: {
                        title: 'Cold repository flow to hot screen state',
                        columns: 3,
                        nodes: [
                            { label: 'Room query (cold)', type: 'terminal' },
                            { label: 'map to UiState' },
                            { label: 'stateIn(viewModelScope)' },
                            { label: 'StateFlow' },
                            { label: 'collectAsStateWithLifecycle' },
                            { label: 'Composable', type: 'terminal' }
                        ],
                        connections: [
                            { from: 0, to: 1 },
                            { from: 1, to: 2 },
                            { from: 2, to: 3 },
                            { from: 3, to: 4 },
                            { from: 4, to: 5 }
                        ]
                    }
                }
            ],
            docs: [
                { title: 'StateFlow and SharedFlow', path: '/kotlin/flow/stateflow-and-sharedflow', kind: 'guide' },
                { title: 'stateIn', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/state-in.html', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-statein-vs-sharein' }
            ]
        },

        {
            id: 'one-off-events',
            title: 'The one-off event problem',
            importance: 'should-know',
            summary: 'State survives recreation by design, which is exactly wrong for a snackbar or a navigation command.',
            interviewAngle: 'A senior-level question with no settled answer — knowing the trade-offs matters more than picking a side.',
            buildsOn: ['statein-and-sharein'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>State is meant to be re-delivered: rotate the screen, get the current state, re-render. Events are not. A snackbar that reappears on every rotation, or a navigation command that fires twice, is the same mechanism working correctly against a case it does not fit.</p>'
                },
                {
                    type: 'types',
                    title: 'The approaches, and what each costs',
                    items: [
                        {
                            name: 'SharedFlow with replay = 0',
                            html: '<p>Events are delivered only to current collectors. Simple and idiomatic — but an event emitted while the screen is stopped is <strong>lost</strong>, not queued.</p>',
                            whenToUse: 'the event is genuinely disposable, like a toast'
                        },
                        {
                            name: 'Channel + receiveAsFlow',
                            html: '<p>Buffers events and guarantees each is delivered exactly once, to exactly one collector. Survives a stopped screen.</p>',
                            whenToUse: 'the event must not be lost — a navigation command or a completed purchase'
                        },
                        {
                            name: 'Event in the state, consumed explicitly',
                            html: '<p>Model the event as a field of the UI state and have the UI call back to clear it. Verbose, and the most robust — nothing is lost and nothing repeats.</p>',
                            whenToUse: 'correctness matters more than ergonomics'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Channel-based events, delivered exactly once',
                    code: `class CheckoutViewModel : ViewModel() {

    private val events = Channel<CheckoutEvent>(Channel.BUFFERED)
    val eventFlow = events.receiveAsFlow()   // single consumer, each event once

    fun onPaid() = viewModelScope.launch {
        events.send(CheckoutEvent.NavigateToReceipt)
    }
}

// The collector must still be lifecycle-aware, or an event can be
// delivered to a screen that is no longer there.
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.eventFlow.collect(::handleEvent)
    }
}`,
                    notes: '<code>receiveAsFlow</code> is single-consumer by design. Two collectors would split the events between them rather than each seeing all of them.'
                },
                {
                    type: 'tip',
                    html: '<p>Google’s own guidance leans towards modelling everything as state and avoiding one-off events where possible — a navigation command can often be expressed as a state the UI reacts to. Saying that, and then explaining why a <code>Channel</code> is still pragmatic, is a stronger answer than defending either extreme.</p>'
                }
            ],
            docs: [
                { title: 'UI events', path: '/topic/architecture/ui-layer/events', kind: 'guide' },
                { title: 'State holders and UI state', path: '/topic/architecture/ui-layer/stateholders', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-unit-testing' }
            ]
        }
    ]
};
