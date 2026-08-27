const kotlinFlowApiData = {
    id: "kotlin-flow-api",
    title: "Kotlin Flow API",
    subsections: null,
    keyTopics: ["Flow Builder/Operator/Collector", "flowOn & Dispatchers", "Creating Flow Using Flow Builder", "Operators (filter, map, zip, flatMapConcat, retry, debounce, distinctUntilChanged, flatMapLatest)", "Terminal Operators", "Cold Flow vs Hot Flow", "StateFlow and SharedFlow", "callbackFlow", "channelFlow", "Long-running tasks in parallel with Kotlin Flow", "Retry Operator", "Retrofit with Kotlin Flow", "Room Database with Kotlin Flow", "Zip Operator for Parallel Multiple Network Calls", "Instant Search Using Kotlin Flow Operators", "Exception Handling in Kotlin Flow", "Unit Testing ViewModel with Kotlin Flow and StateFlow"],
    questions: [
        {
            id: "flow-what-is-flow",
            question: "What is Flow in Kotlin? Explain the concepts of Flow Builder, Operator, and Collector.",
            answer: "<p><strong>🌊 Concept</strong></p><ul><li><code>Flow&lt;T&gt;</code> is Kotlin's cold, asynchronous stream type — it represents a sequence of values computed and emitted over time, using suspend functions internally.</li><li><strong>Flow Builder</strong> — creates a Flow, e.g. <code>flow { emit(value) }</code>, <code>flowOf(1, 2, 3)</code>, or <code>.asFlow()</code> on a collection.</li><li><strong>Operator</strong> — an intermediate function (<code>map</code>, <code>filter</code>, <code>flowOn</code>...) that transforms the stream and returns a new Flow; operators are lazy and don't run until collected.</li><li><strong>Collector</strong> — the terminal consumer, typically <code>collect { }</code>, which triggers execution and receives each emitted value.</li><li>Nothing runs until a terminal operator is called — Flow is <strong>cold</strong>, so each new collector re-runs the builder block from scratch.</li></ul><p><strong>🎯 Interview tip:</strong> Draw the pipeline mentally: builder → operators (lazy) → collector (triggers execution). It mirrors Kotlin sequences but is suspend-aware.</p>",
            referenceLinks: [{ title: "Asynchronous Flow - Kotlin", url: "https://kotlinlang.org/docs/flow.html" }, { title: "Kotlin Flow on Android", url: "https://developer.android.com/kotlin/flow" }],
            tags: ["flow", "kotlin", "builder", "operator", "collector", "cold-stream"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Flow pipeline",
                columns: 4,
                nodes: [
                    { label: "Flow Builder", type: "terminal" },
                    { label: "Operator" },
                    { label: "Operator" },
                    { label: "Collector", type: "terminal" }
                ],
                connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "Flow builder, operators, collector",
                code: `fun tickerFlow(): Flow<Int> = flow {
    var count = 0
    while (true) {
        emit(count++)
        delay(1000)
    }
}

viewModelScope.launch {
    tickerFlow()
        .map { it * 2 }
        .filter { it % 4 == 0 }
        .collect { value -> println(value) }
}`
            }],
            subsection: null
        },
        {
            id: "flow-flowon",
            question: "What is flowOn and how does it change dispatchers?",
            answer: "<p><strong>🔀 Concept</strong></p><ul><li><code>flowOn</code> changes the <strong>upstream</strong> dispatcher — everything above it in the chain (the builder and earlier operators) runs on the specified dispatcher, while everything below (later operators, the collector) stays on the original context.</li><li>It works by inserting a channel-based boundary, making it the Flow equivalent of <code>withContext</code> for a stream rather than a single value.</li><li>Only one <code>flowOn</code> is needed per &quot;region&quot; of the chain — calling it again further upstream just moves the switch point.</li><li>The collector's dispatcher (e.g. <code>Dispatchers.Main</code> from <code>viewModelScope</code>) is unaffected, so UI updates inside <code>collect</code> remain safe on the Main thread.</li></ul>",
            referenceLinks: [{ title: "Asynchronous Flow - flowOn", url: "https://kotlinlang.org/docs/flow.html#flow-context" }],
            tags: ["flow", "flowon", "dispatchers", "kotlin"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "flowOn moves the upstream dispatcher",
                code: `fun observeUsers(): Flow<List<User>> = userDao.getAllUsers()
    .map { entities -> entities.map { it.toDomainModel() } } // runs on IO
    .flowOn(Dispatchers.IO)
// downstream .collect { } still runs on the caller's (e.g. Main) dispatcher`
            }],
            subsection: null
        },
        {
            id: "flow-builders",
            question: "What are the different ways to create a Flow (Flow Builders)?",
            answer: "<p><strong>🏗️ Concept</strong></p><ul><li><code>flow { emit(...) }</code> — the general-purpose builder for arbitrary suspend logic, including loops and delays.</li><li><code>flowOf(1, 2, 3)</code> — creates a Flow from a fixed set of values.</li><li><code>.asFlow()</code> — converts an existing collection, sequence, or range into a Flow.</li><li><code>callbackFlow { }</code> / <code>channelFlow { }</code> — channel-backed builders for wrapping callback APIs or emitting from multiple coroutines concurrently.</li><li><code>MutableStateFlow(initial)</code> / <code>MutableSharedFlow()</code> — hot builders whose lifetime is independent of collectors, used for state holders rather than one-shot streams.</li></ul>",
            referenceLinks: [{ title: "Asynchronous Flow - Kotlin", url: "https://kotlinlang.org/docs/flow.html" }],
            tags: ["flow", "builders", "flowof", "asflow", "callbackflow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "flow-common-operators",
            question: "What are the common Flow operators like filter, map, zip, flatMapConcat, retry, debounce, distinctUntilChanged, flatMapLatest?",
            answer: "<p><strong>🛠️ Concept</strong></p><ul><li><strong>map</strong> — transforms each emitted value.</li><li><strong>filter</strong> — only emits values matching a predicate.</li><li><strong>zip</strong> — pairs the <em>n-th</em> emission of one Flow with the <em>n-th</em> emission of another, waiting for both sides.</li><li><strong>flatMapConcat</strong> — maps each value to a new Flow and collects them sequentially, one at a time, preserving order.</li><li><strong>flatMapLatest</strong> — maps each value to a new Flow but cancels the previous inner Flow when a new value arrives (used for search-as-you-type).</li><li><strong>retry</strong> — resubscribes to the upstream Flow on failure, up to a predicate/condition.</li><li><strong>debounce(ms)</strong> — only emits after a quiet period with no new emissions.</li><li><strong>distinctUntilChanged</strong> — suppresses consecutive duplicate emissions.</li></ul>",
            referenceLinks: [{ title: "Flow operators reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/" }],
            tags: ["flow", "operators", "map", "filter", "flatmaplatest", "debounce"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "flow-terminal-operators",
            question: "What are terminal operators in Kotlin Flow?",
            answer: "<p><strong>🏁 Concept</strong></p><ul><li><strong>Terminal operators</strong> are suspend functions that actually start collection and consume the Flow — without one, nothing in the chain executes.</li><li><code>collect { }</code> — the fundamental terminal operator; invokes the lambda for every emission.</li><li><code>toList()</code> / <code>toSet()</code> — collects all emissions into a collection (only safe for finite Flows).</li><li><code>first()</code> / <code>firstOrNull()</code> — collects and cancels after the first emission.</li><li><code>reduce</code> / <code>fold</code> — accumulate emissions into a single result.</li><li><code>single()</code> — expects exactly one emission and throws otherwise.</li></ul>",
            referenceLinks: [{ title: "Asynchronous Flow - Kotlin", url: "https://kotlinlang.org/docs/flow.html#terminal-flow-operators" }],
            tags: ["flow", "terminal-operators", "collect", "reduce", "first"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "flow-cold-vs-hot",
            question: "What is the difference between Cold Flow and Hot Flow?",
            answer: "<p><strong>❄️🔥 Concept</strong></p><table><thead><tr><th>Aspect</th><th>Cold Flow</th><th>Hot Flow</th></tr></thead><tbody><tr><td>Execution</td><td>Starts fresh per collector</td><td>Runs independently of collectors</td></tr><tr><td>Examples</td><td><code>flow { }</code>, <code>flowOf</code>, Room query Flow</td><td><code>StateFlow</code>, <code>SharedFlow</code>, <code>Channel</code></td></tr><tr><td>Sharing state</td><td>No — each collector gets its own run</td><td>Yes — all collectors see the same emissions</td></tr><tr><td>Emits when</td><td>Only while being collected</td><td>Can emit even with zero collectors</td></tr></tbody></table><ul><li>A cold Flow is like a recipe — nothing happens until someone &quot;cooks&quot; it (collects); a hot Flow is more like a live broadcast, always running.</li></ul>",
            referenceLinks: [{ title: "Flows are cold - Kotlin", url: "https://kotlinlang.org/docs/flow.html#flows-are-cold" }, { title: "StateFlow and SharedFlow", url: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow" }],
            tags: ["flow", "cold-flow", "hot-flow", "stateflow", "sharedflow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "flow-stateflow-sharedflow",
            question: "What is StateFlow and SharedFlow?",
            answer: "<p><strong>📡 Concept</strong></p><ul><li><strong>StateFlow</strong> is a hot, <strong>conflated</strong> state holder — it always has a current value (<code>.value</code>), only emits distinct consecutive values, and new collectors immediately receive the latest value.</li><li><strong>SharedFlow</strong> is a more general hot stream with a configurable <code>replay</code> cache (how many past values new collectors receive) and no requirement to hold a current value.</li><li><code>StateFlow</code> is essentially <code>SharedFlow(replay = 1)</code> with conflation and distinct-until-changed built in, specialized for representing UI state.</li><li>Use <strong>StateFlow</strong> for observable state (a ViewModel's <code>uiState</code>); use <strong>SharedFlow</strong> for one-off events (snackbar messages, navigation) where conflation/replay-of-latest isn't wanted.</li><li><code>MutableSharedFlow(replay = 0, extraBufferCapacity = 1, onBufferOverflow = DROP_OLDEST)</code> is a common pattern for a single-shot event channel.</li></ul><p><strong>⚖️ vs LiveData</strong></p><ul><li>Both are hot and lifecycle-friendly (<code>collectAsStateWithLifecycle</code> / <code>observe</code>), but StateFlow is dispatcher-aware, testable without instrumentation, and composes with the rest of the Flow operator set.</li></ul>",
            referenceLinks: [{ title: "StateFlow and SharedFlow", url: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow" }],
            tags: ["flow", "stateflow", "sharedflow", "hot-flow", "viewmodel"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Exposing StateFlow from a ViewModel",
                code: `class UserViewModel(private val repo: UserRepository) : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<UiEvent>(extraBufferCapacity = 1)
    val events: SharedFlow<UiEvent> = _events.asSharedFlow()

    fun loadUser(id: String) = viewModelScope.launch {
        _uiState.value = UiState.Loading
        runCatching { repo.fetchUser(id) }
            .onSuccess { _uiState.value = UiState.Loaded(it) }
            .onFailure { _events.tryEmit(UiEvent.ShowError(it.message.orEmpty())) }
    }
}`
            }],
            subsection: null
        },
        {
            id: "flow-callbackflow",
            question: "What is callbackFlow and how do you convert callbacks to Flow?",
            answer: "<p><strong>📞 Concept</strong></p><ul><li><code>callbackFlow { }</code> is a builder for wrapping callback-based APIs (listeners, broadcast receivers) as a cold Flow — it exposes a <code>ProducerScope</code> with <code>trySend()</code> instead of <code>emit()</code>.</li><li>Register the callback inside the block, call <code>trySend(value)</code> whenever it fires, and clean up inside <code>awaitClose { }</code>, which runs when the collector is cancelled or the channel closes.</li><li>Unlike <code>suspendCancellableCoroutine</code> (single value, single resume), <code>callbackFlow</code> is for callbacks that can fire <strong>multiple times</strong>.</li></ul>",
            referenceLinks: [{ title: "callbackFlow reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/callback-flow.html" }],
            tags: ["flow", "callbackflow", "callback", "interop"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Wrapping location updates with callbackFlow",
                code: `fun locationUpdates(client: FusedLocationProviderClient): Flow<Location> = callbackFlow {
    val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { trySend(it) }
        }
    }
    client.requestLocationUpdates(request, callback, Looper.getMainLooper())
    awaitClose { client.removeLocationUpdates(callback) }
}`
            }],
            subsection: null
        },
        {
            id: "flow-channelflow",
            question: "What is channelFlow and how is it different from callbackFlow?",
            answer: "<p><strong>🔀 Concept</strong></p><ul><li><code>channelFlow { }</code> is like <code>flow { }</code> but backed by a <code>Channel</code>, which allows emitting (<code>send</code>) from <strong>multiple coroutines concurrently</strong> — the plain <code>flow { }</code> builder is not safe for concurrent <code>emit</code> calls.</li><li>Use it when the builder needs to launch child coroutines internally (e.g. fan-in from two sources) that all emit into the same stream.</li></ul><table><thead><tr><th>Aspect</th><th>callbackFlow</th><th>channelFlow</th></tr></thead><tbody><tr><td>Purpose</td><td>Bridge callback APIs</td><td>Concurrent emission from coroutines</td></tr><tr><td>Typical use</td><td>Sensor/location listeners</td><td>Fan-in from multiple suspend sources</td></tr><tr><td>Cleanup</td><td><code>awaitClose { }</code> required</td><td>No external callback to unregister</td></tr></tbody></table>",
            referenceLinks: [{ title: "channelFlow reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/channel-flow.html" }],
            tags: ["flow", "channelflow", "callbackflow", "channel", "concurrency"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "flow-parallel-tasks",
            question: "How do you run long-running tasks in parallel with Kotlin Flow?",
            answer: "<p><strong>⚡ Concept</strong></p><ul><li>Model each long task as its own Flow, then combine them with <code>combine</code> or <code>zip</code>, or fan-in with <code>merge</code> — all three collect their source Flows concurrently under the hood.</li><li><code>merge(flowA, flowB)</code> interleaves emissions from multiple Flows as they arrive, useful when order/timing across sources doesn't matter.</li><li><code>combine</code> re-emits a new combined value every time <em>any</em> source Flow emits, using the latest value from the others — good for tasks that periodically update independently.</li></ul>",
            referenceLinks: [{ title: "Flow operators reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/" }],
            tags: ["flow", "parallel", "combine", "merge", "concurrency"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "flow-retry-operator",
            question: "How does the Retry operator work in Kotlin Flow?",
            answer: "<p><strong>🔁 Concept</strong></p><ul><li><code>retry(retries) { cause -&gt; ... }</code> resubscribes to the upstream Flow when an exception occurs, up to <code>retries</code> times, only if the predicate lambda returns <code>true</code> for that exception.</li><li><code>retryWhen { cause, attempt -&gt; ... }</code> gives full control — e.g. exponential backoff with <code>delay</code> before deciding whether to retry.</li><li>Retry only re-runs the flow builder itself (e.g. the network call), not downstream operators that already executed successfully.</li></ul>",
            referenceLinks: [{ title: "retryWhen reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry-when.html" }],
            tags: ["flow", "retry", "retrywhen", "error-handling", "backoff"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Retry with exponential backoff",
                code: `fun fetchUserFlow(id: String): Flow<User> = flow {
    emit(api.getUser(id))
}.retryWhen { cause, attempt ->
    if (cause is IOException && attempt < 3) {
        delay(1000L * (attempt + 1)) // backoff
        true
    } else {
        false
    }
}`
            }],
            subsection: null
        },
        {
            id: "flow-retrofit",
            question: "How do you use Retrofit with Kotlin Flow?",
            answer: "<p><strong>🌐 Concept</strong></p><ul><li>Retrofit doesn't return <code>Flow</code> natively — the idiomatic pattern is a <code>suspend fun</code> in the API interface, wrapped in <code>flow { emit(api.call()) }</code> at the repository layer so callers can chain Flow operators (<code>retry</code>, <code>flowOn</code>, <code>catch</code>).</li><li>Keeping the wrap manual (instead of a third-party Flow call adapter) keeps dispatcher choice and error handling explicit and easy to test.</li></ul>",
            referenceLinks: [{ title: "Retrofit", url: "https://square.github.io/retrofit/" }, { title: "Kotlin Flow on Android", url: "https://developer.android.com/kotlin/flow" }],
            tags: ["flow", "retrofit", "networking", "repository"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Retrofit call wrapped as a Flow",
                code: `fun getUserFlow(id: String): Flow<User> = flow {
    emit(api.getUser(id))
}
    .flowOn(Dispatchers.IO)
    .catch { e -> Log.e("Repo", "fetch failed", e) }`
            }],
            subsection: null
        },
        {
            id: "flow-room-database",
            question: "How do you use Room Database with Kotlin Flow?",
            answer: "<p><strong>🗄️ Concept</strong></p><ul><li>Room DAO methods that return <code>Flow&lt;T&gt;</code> automatically re-emit whenever the underlying table changes — Room registers an <code>InvalidationTracker</code> and re-runs the query for you, no manual observation code needed.</li><li>These Flows are cold and run on Room's own executor internally, so no <code>withContext</code> is required just to observe them.</li><li>Add <code>.distinctUntilChanged()</code> downstream if the query can emit an equal list after an unrelated table write.</li></ul>",
            referenceLinks: [{ title: "Access data using Room DAOs", url: "https://developer.android.com/training/data-storage/room/accessing-data" }],
            tags: ["flow", "room", "database", "dao", "reactive"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Room DAO returning Flow",
                code: `@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :id")
    fun observeUser(id: String): Flow<UserEntity>
}

class UserRepository(private val dao: UserDao) {
    fun observeUser(id: String): Flow<User> =
        dao.observeUser(id)
            .map { it.toDomainModel() }
            .flowOn(Dispatchers.IO)
}`
            }],
            subsection: null
        },
        {
            id: "flow-zip-parallel-calls",
            question: "How do you use the Zip operator for parallel multiple network calls?",
            answer: "<p><strong>🤝 Concept</strong></p><ul><li><code>zip</code> combines the <em>n-th</em> emission of one Flow with the <em>n-th</em> emission of another — for one-shot network calls wrapped as single-emission Flows, this effectively waits for both to complete and pairs their results, similar to <code>async</code> + <code>await</code> but expressed with Flow operators.</li><li>Unlike <code>combine</code>, <code>zip</code> doesn't re-fire when only one side emits again — it always waits for a fresh pair from both sources.</li></ul>",
            referenceLinks: [{ title: "zip reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/zip.html" }],
            tags: ["flow", "zip", "parallel", "networking"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Zipping two network Flows",
                code: `val userFlow: Flow<User> = flow { emit(api.getUser(id)) }
val postsFlow: Flow<List<Post>> = flow { emit(api.getPosts(id)) }

userFlow.zip(postsFlow) { user, posts -> Dashboard(user, posts) }
    .flowOn(Dispatchers.IO)
    .collect { dashboard -> _uiState.value = UiState.Loaded(dashboard) }`
            }],
            subsection: null
        },
        {
            id: "flow-instant-search",
            question: "How do you implement Instant Search using Kotlin Flow operators?",
            answer: "<p><strong>🔎 Concept</strong></p><ul><li>Expose the search text as a <code>MutableStateFlow&lt;String&gt;</code>, then chain <code>debounce(300)</code> → <code>distinctUntilChanged()</code> → <code>flatMapLatest</code> to call the API — <code>flatMapLatest</code> cancels the in-flight request if the user types again before it completes.</li><li><code>debounce</code> avoids firing a request on every keystroke; <code>distinctUntilChanged</code> avoids re-searching identical text (e.g. after a delete-and-retype).</li><li><code>stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), initial)</code> turns the resulting cold pipeline into a hot, UI-observable <code>StateFlow</code>.</li></ul>",
            referenceLinks: [{ title: "StateFlow and SharedFlow", url: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow" }],
            tags: ["flow", "search", "debounce", "flatmaplatest", "stateflow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Instant search pipeline",
                code: `private val query = MutableStateFlow("")

val results: StateFlow<List<Repo>> = query
    .debounce(300)
    .distinctUntilChanged()
    .filter { it.length >= 2 }
    .flatMapLatest { text -> api.searchFlow(text) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

fun onQueryChanged(text: String) {
    query.value = text
}`
            }],
            subsection: null
        },
        {
            id: "flow-exception-handling",
            question: "How does exception handling work in Kotlin Flow?",
            answer: "<p><strong>🚨 Concept</strong></p><ul><li><code>catch { }</code> is a Flow operator that intercepts exceptions thrown <em>upstream</em> of it (the builder and earlier operators) — it cannot catch exceptions from downstream operators or from the collector's own lambda.</li><li>A plain <code>try/catch</code> around <code>collect { }</code> also works and additionally catches exceptions thrown inside the collector body, which <code>catch { }</code> does not.</li><li><code>catch</code> can itself <code>emit()</code> a fallback value, effectively turning a failure into a recovery emission.</li><li><code>CancellationException</code> is never swallowed by <code>catch</code> — Flow's <code>catch</code> operator rethrows it instead of treating it as a normal error, so cancellation stays intact.</li></ul>",
            referenceLinks: [{ title: "Exception transparency - Kotlin Flow", url: "https://kotlinlang.org/docs/flow.html#exception-transparency" }],
            tags: ["flow", "exception-handling", "catch", "error-handling"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "catch operator with fallback emission",
                code: `userFlow
    .catch { e ->
        Log.e("VM", "Stream failed", e)
        emit(User.EMPTY) // fallback
    }
    .collect { user -> _uiState.value = UiState.Loaded(user) }`
            }],
            subsection: null
        },
        {
            id: "flow-unit-testing",
            question: "How do you unit test ViewModels with Kotlin Flow and StateFlow?",
            answer: "<p><strong>🧪 Concept</strong></p><ul><li>Use <code>runTest { }</code> from <code>kotlinx-coroutines-test</code> plus Turbine's <code>flow.test { }</code> to assert emissions in order with <code>awaitItem()</code>, <code>awaitComplete()</code>, and <code>awaitError()</code>.</li><li>For <code>StateFlow</code>, read <code>.value</code> directly for simple one-shot assertions, or use Turbine to assert a sequence of state transitions over time.</li><li>Swap <code>Dispatchers.Main</code> for a <code>StandardTestDispatcher</code> in <code>@Before</code>/<code>@After</code> exactly as with regular coroutine ViewModel tests, since <code>stateIn(viewModelScope, ...)</code> depends on <code>Dispatchers.Main</code>.</li></ul>",
            referenceLinks: [{ title: "Turbine - testing library for Kotlin Flow", url: "https://github.com/cashapp/turbine" }, { title: "Test Kotlin coroutines on Android", url: "https://developer.android.com/kotlin/coroutines/test" }],
            tags: ["flow", "testing", "turbine", "stateflow", "runtest"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Testing a StateFlow pipeline with Turbine",
                code: `@Test
fun searchEmitsLoadingThenResults() = runTest {
    val viewModel = SearchViewModel(FakeSearchRepository())

    viewModel.results.test {
        assertEquals(emptyList<Repo>(), awaitItem())
        viewModel.onQueryChanged("kotlin")
        advanceTimeBy(400) // past the debounce window
        assertEquals(listOf(Repo("kotlin")), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}`
            }],
            subsection: null
        }
    ]
};
