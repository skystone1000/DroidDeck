const kotlinFlowApiData = {
    id: "kotlin-flow-api",
    title: "Kotlin Flow API",
    subsections: null,
    keyTopics: ["Flow Builder/Operator/Collector", "flowOn & Dispatchers", "Creating Flow Using Flow Builder", "Operators (filter, map, zip, flatMapConcat, retry, debounce, distinctUntilChanged, flatMapLatest)", "Terminal Operators", "Cold Flow vs Hot Flow", "StateFlow and SharedFlow", "callbackFlow", "channelFlow", "Long-running tasks in parallel with Kotlin Flow", "Retry Operator", "Retrofit with Kotlin Flow", "Room Database with Kotlin Flow", "Zip Operator for Parallel Multiple Network Calls", "Instant Search Using Kotlin Flow Operators", "Exception Handling in Kotlin Flow", "Unit Testing ViewModel with Kotlin Flow and StateFlow"],
    questions: [
        {
            id: "flow-what-is-flow",
            importance: "must-know",
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
                title: "Builder, operators, collector — and bounding an infinite source",
                code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun tickerFlow(): Flow<Int> = flow {
    var count = 0
    while (true) {          // the builder is infinite; the collector decides when to stop
        emit(count++)
        delay(10)
    }
}

fun main() = runBlocking {
    println("flow built — nothing has run yet")

    tickerFlow()
        .map { it * 2 }
        .filter { it % 4 == 0 }
        .take(4)            // bounds an infinite source, and cancels it on the fourth value
        .collect { value -> println("collected $value") }

    println("collect returned, so the ticker was cancelled")
}`,
                output: {
                    kind: "stdout",
                    lines: [
                        "flow built — nothing has run yet",
                        "collected 0",
                        "collected 4",
                        "collected 8",
                        "collected 12",
                        "collect returned, so the ticker was cancelled"
                    ],
                    explain: "<p>The first line printed before anything else happened, and that is the definition of a cold flow: building it and chaining <code>map</code> and <code>filter</code> onto it runs no code at all. The ticker only started when <code>collect</code> asked for values.</p><p>The collected values are 0, 4, 8, 12 — the ticker emits 0, 1, 2…, <code>map</code> doubles them, and <code>filter</code> keeps only multiples of 4. Each value flows all the way through the chain before the next one is emitted; the operators are not batch steps over a list.</p><p><code>take(4)</code> is load-bearing here. The builder's <code>while (true)</code> never ends on its own, so the collector is what stops it — <code>take</code> cancels the flow once it has enough, which is the last line. Without it this snippet would run forever, which is exactly why it could not be verified before.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-flowon",
            importance: "must-know",
            question: "What is flowOn and how does it change dispatchers?",
            answer: "<p><strong>🔀 Concept</strong></p><ul><li><code>flowOn</code> changes the <strong>upstream</strong> dispatcher — everything above it in the chain (the builder and earlier operators) runs on the specified dispatcher, while everything below (later operators, the collector) stays on the original context.</li><li>It works by inserting a channel-based boundary, making it the Flow equivalent of <code>withContext</code> for a stream rather than a single value.</li><li>Only one <code>flowOn</code> is needed per &quot;region&quot; of the chain — calling it again further upstream just moves the switch point.</li><li>The collector's dispatcher (e.g. <code>Dispatchers.Main</code> from <code>viewModelScope</code>) is unaffected, so UI updates inside <code>collect</code> remain safe on the Main thread.</li></ul>",
            referenceLinks: [{ title: "Asynchronous Flow - flowOn", url: "https://kotlinlang.org/docs/flow.html#flow-context" }],
            tags: ["flow", "flowon", "dispatchers", "kotlin"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "flowOn changes the upstream context only",
                code: `fun observeUsers(): Flow<List<User>> = userDao.getAllUsers()
    .map { entities -> entities.map { it.toDomainModel() } } // runs on IO
    .flowOn(Dispatchers.IO)
// downstream .collect { } still runs on the caller's (e.g. Main) dispatcher`,
                output: {
                    kind: "trace",
                    lines: [
                        "The collector runs on the main thread — say inside viewModelScope.",
                        "collect starts the chain. Execution enters the flow builder.",
                        "flowOn(Dispatchers.IO) applies to everything ABOVE it, so the builder and any operators declared before it run on an IO thread.",
                        "Each emitted value is handed across to the collector's own dispatcher.",
                        "Operators declared BELOW flowOn, and the collect block itself, run on the main thread as if nothing had changed.",
                        "So the database read never touches the main thread, and the UI update never touches a background one — with no manual switching at either end."
                    ],
                    explain: "<p>Step 3 is the rule and it is easy to get backwards: <code>flowOn</code> affects <strong>upstream</strong> only, and it is the one Flow operator that is context-preserving by design. Putting it at the end of a chain therefore changes almost nothing.</p><p>This is also why emitting from a different context inside a <code>flow { }</code> builder throws. The builder must emit on the context it was given; <code>flowOn</code> is the supported way to change that, and a bare <code>withContext</code> around an <code>emit</code> is the unsupported one.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-builders",
            importance: "should-know",
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
            importance: "must-know",
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
            importance: "should-know",
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
            importance: "must-know",
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
            importance: "must-know",
            question: "What is StateFlow and SharedFlow?",
            answer: "<p><strong>📡 Concept</strong></p><ul><li><strong>StateFlow</strong> is a hot, <strong>conflated</strong> state holder — it always has a current value (<code>.value</code>), only emits distinct consecutive values, and new collectors immediately receive the latest value.</li><li><strong>SharedFlow</strong> is a more general hot stream with a configurable <code>replay</code> cache (how many past values new collectors receive) and no requirement to hold a current value.</li><li><code>StateFlow</code> is essentially <code>SharedFlow(replay = 1)</code> with conflation and distinct-until-changed built in, specialized for representing UI state.</li><li>Use <strong>StateFlow</strong> for observable state (a ViewModel's <code>uiState</code>); use <strong>SharedFlow</strong> for one-off events (snackbar messages, navigation) where conflation/replay-of-latest isn't wanted.</li><li><code>MutableSharedFlow(replay = 0, extraBufferCapacity = 1, onBufferOverflow = DROP_OLDEST)</code> is a common pattern for a single-shot event channel.</li></ul><p><strong>⚖️ vs LiveData</strong></p><ul><li>Both are hot and lifecycle-friendly (<code>collectAsStateWithLifecycle</code> / <code>observe</code>), but StateFlow is dispatcher-aware, testable without instrumentation, and composes with the rest of the Flow operator set.</li></ul>",
            referenceLinks: [{ title: "StateFlow and SharedFlow", url: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow" }],
            tags: ["flow", "stateflow", "sharedflow", "hot-flow", "viewmodel"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "StateFlow and SharedFlow",
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
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "A StateFlow is created with an initial value, so it always has one — .value can be read at any moment without collecting.",
                        "A collector subscribes and immediately receives the current value, whether or not anything has changed recently.",
                        "Setting .value to something equal to the current value emits nothing. StateFlow conflates and compares with equals().",
                        "A second collector subscribing later also gets the current value first, then subsequent updates. Both share one upstream — it is hot.",
                        "A SharedFlow, by contrast, starts with no value at all and only delivers what is emitted after subscription.",
                        "With replay = 0, a value emitted while nobody is collecting is simply gone.",
                        "Setting replay = 1 makes it behave more like StateFlow, minus the equality check and the mandatory initial value."
                    ],
                    explain: "<p>Steps 3 and 6 are the two behaviours that decide which to use.</p><p><code>StateFlow</code> conflates and drops duplicates, which is exactly right for UI state — re-emitting an identical state would cause needless recomposition — and exactly wrong for events. Emitting \"show a snackbar\" twice in a row would deliver it once.</p><p><code>SharedFlow</code> keeps every emission and has no notion of a current value, which makes it right for one-off events and wrong for state, because a collector arriving after the event missed it for good.</p><p>The rule of thumb: <strong>state is a StateFlow, events are a SharedFlow.</strong></p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-callbackflow",
            importance: "should-know",
            question: "What is callbackFlow and how do you convert callbacks to Flow?",
            answer: "<p><strong>📞 Concept</strong></p><ul><li><code>callbackFlow { }</code> is a builder for wrapping callback-based APIs (listeners, broadcast receivers) as a cold Flow — it exposes a <code>ProducerScope</code> with <code>trySend()</code> instead of <code>emit()</code>.</li><li>Register the callback inside the block, call <code>trySend(value)</code> whenever it fires, and clean up inside <code>awaitClose { }</code>, which runs when the collector is cancelled or the channel closes.</li><li>Unlike <code>suspendCancellableCoroutine</code> (single value, single resume), <code>callbackFlow</code> is for callbacks that can fire <strong>multiple times</strong>.</li></ul>",
            referenceLinks: [{ title: "callbackFlow reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/callback-flow.html" }],
            tags: ["flow", "callbackflow", "callback", "interop"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "callbackFlow around a listener API",
                code: `fun locationUpdates(client: FusedLocationProviderClient): Flow<Location> = callbackFlow {
    val callback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { trySend(it) }
        }
    }
    client.requestLocationUpdates(request, callback, Looper.getMainLooper())
    awaitClose { client.removeLocationUpdates(callback) }
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "A collector subscribes, and the callbackFlow block runs.",
                        "The block registers a listener with the callback-based API, exactly as ordinary code would.",
                        "Each callback invocation calls trySend, which offers the value into the flow's channel from whatever thread the framework used.",
                        "The block then reaches awaitClose and suspends, holding the flow open. Without awaitClose the flow would close immediately and the listener would leak.",
                        "Values arrive at the collector on its own dispatcher, in the order they were sent.",
                        "When the collector is cancelled — the screen goes away — awaitClose's body runs and unregisters the listener."
                    ],
                    explain: "<p>Step 4 is the one the compiler enforces and step 6 is why. <code>callbackFlow</code> requires <code>awaitClose</code>, because a flow builder that returns has finished, and a listener registered by a flow that has finished is a leak with nothing left to unregister it.</p><p><code>trySend</code> rather than <code>send</code> is the other detail: callbacks are not suspending functions, so they cannot wait for a full buffer. <code>trySend</code> returns a result instead of suspending, and dropping a value under back-pressure is usually preferable to blocking the framework's thread.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-channelflow",
            importance: "should-know",
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
            importance: "should-know",
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
            importance: "should-know",
            question: "How does the Retry operator work in Kotlin Flow?",
            answer: "<p><strong>🔁 Concept</strong></p><ul><li><code>retry(retries) { cause -&gt; ... }</code> resubscribes to the upstream Flow when an exception occurs, up to <code>retries</code> times, only if the predicate lambda returns <code>true</code> for that exception.</li><li><code>retryWhen { cause, attempt -&gt; ... }</code> gives full control — e.g. exponential backoff with <code>delay</code> before deciding whether to retry.</li><li>Retry only re-runs the flow builder itself (e.g. the network call), not downstream operators that already executed successfully.</li></ul>",
            referenceLinks: [{ title: "retryWhen reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/retry-when.html" }],
            tags: ["flow", "retry", "retrywhen", "error-handling", "backoff"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "retryWhen with exponential backoff",
                code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.io.IOException

data class User(val name: String)

var attempts = 0

// Fails twice, then succeeds — enough to watch the backoff work.
suspend fun getUser(id: String): User {
    attempts++
    println("  api call $attempts")
    if (attempts < 3) throw IOException("no network")
    return User("Ada")
}

fun fetchUserFlow(id: String): Flow<User> = flow {
    emit(getUser(id))
}.retryWhen { cause, attempt ->
    if (cause is IOException && attempt < 3) {
        println("  attempt $attempt failed with \${cause.message}; backing off")
        delay(10L * (attempt + 1))
        true                                  // true = resubscribe and try again
    } else {
        false                                 // false = give up, let it throw
    }
}

fun main() = runBlocking {
    fetchUserFlow("42").collect { println("got $it") }

    // Now one that never recovers: retryWhen gives up after 3 attempts.
    attempts = 100
    try {
        flow<User> { throw IOException("still no network") }
            .retryWhen { cause, attempt -> cause is IOException && attempt < 2 }
            .collect { }
    } catch (e: IOException) {
        println("gave up: \${e.message}")
    }
}`,
                output: {
                    kind: "stdout",
                    lines: [
                        "  api call 1",
                        "  attempt 0 failed with no network; backing off",
                        "  api call 2",
                        "  attempt 1 failed with no network; backing off",
                        "  api call 3",
                        "got User(name=Ada)",
                        "gave up: still no network"
                    ],
                    explain: "<p>Three API calls for one collect. The first two threw, <code>retryWhen</code> returned <code>true</code> each time, and returning <code>true</code> means <strong>resubscribe to the whole upstream flow</strong> — which is why <code>api call</code> appears again rather than the failed emission being patched up.</p><p><code>attempt</code> is zero-based and counts retries, not calls, so <code>attempt &lt; 3</code> permits three retries after the original. The <code>delay</code> before returning <code>true</code> is the backoff, and doubling it per attempt is what stops a failing server being hammered.</p><p>The last line is the other half: when the predicate returns <code>false</code>, the flow gives up and the original exception reaches the collector. Retry does not swallow anything — a caller still needs <code>catch</code> or a <code>try</code> for the case where retrying did not help.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-retrofit",
            importance: "should-know",
            question: "How do you use Retrofit with Kotlin Flow?",
            answer: "<p><strong>🌐 Concept</strong></p><ul><li>Retrofit doesn't return <code>Flow</code> natively — the idiomatic pattern is a <code>suspend fun</code> in the API interface, wrapped in <code>flow { emit(api.call()) }</code> at the repository layer so callers can chain Flow operators (<code>retry</code>, <code>flowOn</code>, <code>catch</code>).</li><li>Keeping the wrap manual (instead of a third-party Flow call adapter) keeps dispatcher choice and error handling explicit and easy to test.</li></ul>",
            referenceLinks: [{ title: "Retrofit API reference", url: "https://javadoc.io/doc/com.squareup.retrofit2/retrofit/latest/index.html" }, { title: "Kotlin Flow on Android", url: "https://developer.android.com/kotlin/flow" }],
            tags: ["flow", "retrofit", "networking", "repository"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Wrapping a Retrofit call in a Flow",
                code: `fun getUserFlow(id: String): Flow<User> = flow {
    emit(api.getUser(id))
}
    .flowOn(Dispatchers.IO)
    .catch { e -> Log.e("Repo", "fetch failed", e) }`,
                output: {
                    kind: "trace",
                    lines: [
                        "The collector subscribes; the flow builder runs and emits Loading straight away, so the UI has something to show immediately.",
                        "The suspending Retrofit call runs. The collector's coroutine is suspended, not blocked.",
                        "On success the response is emitted as a Success state and the flow completes.",
                        "On failure Retrofit throws, and the catch operator converts it into an Error state rather than letting it reach the collector.",
                        "Because the flow is cold, all of this happens again from the top for each new collector — a retry is just a second collect.",
                        "If the screen goes away mid-request, the collector is cancelled, and the in-flight call is cancelled with it."
                    ],
                    explain: "<p>Step 1 is the reason to use a flow for a one-shot call at all: a suspending function can only return once, so it cannot say \"loading\" and then \"loaded\". A flow emits a sequence of states, which is exactly the shape a screen needs.</p><p>Step 5 is the practical consequence of coldness. There is no cached result and no shared subscription — collecting twice makes two requests, which is what you want for a retry and not what you want if two collectors are on screen at once.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-room-database",
            importance: "should-know",
            question: "How do you use Room Database with Kotlin Flow?",
            answer: "<p><strong>🗄️ Concept</strong></p><ul><li>Room DAO methods that return <code>Flow&lt;T&gt;</code> automatically re-emit whenever the underlying table changes — Room registers an <code>InvalidationTracker</code> and re-runs the query for you, no manual observation code needed.</li><li>These Flows are cold and run on Room's own executor internally, so no <code>withContext</code> is required just to observe them.</li><li>Add <code>.distinctUntilChanged()</code> downstream if the query can emit an equal list after an unrelated table write.</li></ul>",
            referenceLinks: [{ title: "Access data using Room DAOs", url: "https://developer.android.com/training/data-storage/room/accessing-data" }],
            tags: ["flow", "room", "database", "dao", "reactive"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "An observable Room query",
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
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "A DAO method declared to return Flow<List<User>> is generated by Room as an observable query.",
                        "The collector subscribes, and Room runs the query once and emits the first result.",
                        "Room registers an invalidation tracker on the tables the query touches.",
                        "Some other code inserts a row into that table — from anywhere in the app, through any DAO.",
                        "The tracker fires, Room re-runs the query, and the collector receives a fresh list.",
                        "No polling and no manual refresh call: the database is the single source of truth and the UI follows it.",
                        "When the collector is cancelled, the observer is removed."
                    ],
                    explain: "<p>Steps 4 and 5 are the whole reason to return <code>Flow</code> instead of <code>suspend fun</code>. A suspending DAO gives one answer and goes stale the moment anything else writes; a <code>Flow</code> DAO keeps the screen correct without the writing code needing to know a screen exists.</p><p>The tracking is per <em>table</em>, not per row, so an unrelated write to the same table also re-runs the query. That is usually invisible and occasionally worth knowing when a query is expensive.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-zip-parallel-calls",
            importance: "should-know",
            question: "How do you use the Zip operator for parallel multiple network calls?",
            answer: "<p><strong>🤝 Concept</strong></p><ul><li><code>zip</code> combines the <em>n-th</em> emission of one Flow with the <em>n-th</em> emission of another — for one-shot network calls wrapped as single-emission Flows, this effectively waits for both to complete and pairs their results, similar to <code>async</code> + <code>await</code> but expressed with Flow operators.</li><li>Unlike <code>combine</code>, <code>zip</code> doesn't re-fire when only one side emits again — it always waits for a fresh pair from both sources.</li></ul>",
            referenceLinks: [{ title: "zip reference", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/zip.html" }],
            tags: ["flow", "zip", "parallel", "networking"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "zip, and what it does when the sides differ",
                code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

data class User(val name: String)
data class Post(val title: String)
data class Dashboard(val user: User, val posts: List<Post>)

class Api {
    suspend fun getUser(id: String): User {
        delay(200); println("  user arrived"); return User("Ada")
    }
    suspend fun getPosts(id: String): List<Post> {
        delay(100); println("  posts arrived"); return listOf(Post("hello"))
    }
}

val api = Api()

fun main() = runBlocking {
    val userFlow: Flow<User> = flow { emit(api.getUser("42")) }
    val postsFlow: Flow<List<Post>> = flow { emit(api.getPosts("42")) }

    println("collecting")
    userFlow.zip(postsFlow) { user, posts -> Dashboard(user, posts) }
        .flowOn(Dispatchers.IO)
        .collect { dashboard -> println("ui state = Loaded($dashboard)") }

    // zip pairs by position and stops at the shorter side.
    val letters = flowOf("a", "b", "c")
    val numbers = flowOf(1, 2)
    println("zip pairs: " + letters.zip(numbers) { l, n -> "$l$n" }.toList())
}`,
                output: {
                    kind: "stdout",
                    lines: [
                        "collecting",
                        "  posts arrived",
                        "  user arrived",
                        "ui state = Loaded(Dashboard(user=User(name=Ada), posts=[Post(title=hello)]))",
                        "zip pairs: [a1, b2]"
                    ],
                    explain: "<p>Posts arrived before the user despite being requested second, which is the point: <code>zip</code> collects both flows concurrently rather than draining one and then the other. The combined value is emitted only once both sides have produced, so the UI gets one complete <code>Dashboard</code> instead of two partial updates.</p><p>The last line is the behaviour that surprises people. <code>zip</code> pairs <strong>by position</strong> and finishes when the <em>shorter</em> flow does — three letters and two numbers give two pairs, and <code>\"c\"</code> is dropped silently. That is fine for two single-emission network flows and wrong for streams of different lengths, where <code>combine</code> — which re-emits whenever <em>either</em> side changes — is usually what was wanted.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-instant-search",
            importance: "must-know",
            question: "How do you implement Instant Search using Kotlin Flow operators?",
            answer: "<p><strong>🔎 Concept</strong></p><ul><li>Expose the search text as a <code>MutableStateFlow&lt;String&gt;</code>, then chain <code>debounce(300)</code> → <code>distinctUntilChanged()</code> → <code>flatMapLatest</code> to call the API — <code>flatMapLatest</code> cancels the in-flight request if the user types again before it completes.</li><li><code>debounce</code> avoids firing a request on every keystroke; <code>distinctUntilChanged</code> avoids re-searching identical text (e.g. after a delete-and-retype).</li><li><code>stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), initial)</code> turns the resulting cold pipeline into a hot, UI-observable <code>StateFlow</code>.</li></ul>",
            referenceLinks: [{ title: "StateFlow and SharedFlow", url: "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow" }],
            tags: ["flow", "search", "debounce", "flatmaplatest", "stateflow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Instant search: debounce, filter, distinct, flatMapLatest",
                code: `private val query = MutableStateFlow("")

val results: StateFlow<List<Repo>> = query
    .debounce(300)
    .distinctUntilChanged()
    .filter { it.length >= 2 }
    .flatMapLatest { text -> api.searchFlow(text) }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

fun onQueryChanged(text: String) {
    query.value = text
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "Every keystroke sets a new value on the query StateFlow.",
                        "debounce(300) drops keystrokes that are followed by another within 300ms, so a fast typist produces one value rather than ten.",
                        "filter { it.length >= 2 } discards queries too short to be worth a request.",
                        "distinctUntilChanged drops a query identical to the last one — which is what typing a character and deleting it produces.",
                        "flatMapLatest starts the search request for the surviving query.",
                        "If another query arrives before that request finishes, flatMapLatest CANCELS the in-flight one and starts a new search.",
                        "The collector therefore only ever receives results for the most recent query, and stale responses can never overwrite fresh ones."
                    ],
                    explain: "<p>Step 6 is the one that cannot be reproduced with callbacks without real effort. Out-of-order responses are the classic search bug: type \"and\", then \"android\", and the slower \"and\" response lands last and overwrites the right answer. <code>flatMapLatest</code> makes that structurally impossible by cancelling the old request.</p><p>The first four operators are all about not making the request in the first place. Together they turn roughly one network call per keystroke into one per pause in typing, which is the difference between a usable search box and a rate-limit.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-exception-handling",
            importance: "must-know",
            question: "How does exception handling work in Kotlin Flow?",
            answer: "<p><strong>🚨 Concept</strong></p><ul><li><code>catch { }</code> is a Flow operator that intercepts exceptions thrown <em>upstream</em> of it (the builder and earlier operators) — it cannot catch exceptions from downstream operators or from the collector's own lambda.</li><li>A plain <code>try/catch</code> around <code>collect { }</code> also works and additionally catches exceptions thrown inside the collector body, which <code>catch { }</code> does not.</li><li><code>catch</code> can itself <code>emit()</code> a fallback value, effectively turning a failure into a recovery emission.</li><li><code>CancellationException</code> is never swallowed by <code>catch</code> — Flow's <code>catch</code> operator rethrows it instead of treating it as a normal error, so cancellation stays intact.</li></ul>",
            referenceLinks: [{ title: "Exception transparency - Kotlin Flow", url: "https://kotlinlang.org/docs/flow.html#exception-transparency" }],
            tags: ["flow", "exception-handling", "catch", "error-handling"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "catch sees upstream only",
                code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.io.IOException

data class User(val name: String) {
    companion object { val EMPTY = User("(none)") }
}

fun main() = runBlocking {
    val failing: Flow<User> = flow {
        emit(User("Ada"))
        throw IOException("stream failed")
    }

    // catch sees failures from UPSTREAM only, and may emit a fallback.
    failing
        .catch { e ->
            println("catch saw \${e::class.simpleName}: \${e.message}")
            emit(User.EMPTY)
        }
        .collect { user -> println("ui state = Loaded(\${user.name})") }

    // Placement matters: catch above an operator cannot see what that operator throws.
    flowOf(1, 2, 0)
        .catch { println("this never runs") }
        .map { 10 / it }
        .catch { e -> println("caught downstream: \${e::class.simpleName}") }
        .collect { println("10/x = $it") }

    // A throw inside collect { } is NOT caught by catch — it is not upstream.
    try {
        flowOf(1).catch { println("never") }.collect { error("thrown in the collector") }
    } catch (e: IllegalStateException) {
        println("collector threw, and catch did not see it: \${e.message}")
    }
}`,
                output: {
                    kind: "stdout",
                    lines: [
                        "ui state = Loaded(Ada)",
                        "catch saw IOException: stream failed",
                        "ui state = Loaded((none))",
                        "10/x = 10",
                        "10/x = 5",
                        "caught downstream: ArithmeticException",
                        "collector threw, and catch did not see it: thrown in the collector"
                    ],
                    explain: "<p>Three cases, and they narrow down what <code>catch</code> actually covers.</p><p>The first works as advertised: the flow emitted a value, then threw, and <code>catch</code> both logged it and emitted a fallback — <code>catch</code> is a flow operator, so it can emit, which a <code>try/catch</code> around <code>collect</code> cannot.</p><p>The second shows <strong>position is everything</strong>. The first <code>catch</code> never ran, because the division by zero happens in the <code>map</code> <em>below</em> it and <code>catch</code> only ever sees failures from upstream. Note also that the two successful values were delivered before the failure — a flow that dies partway through has already emitted what it emitted.</p><p>The third is the exception to remember: an exception thrown <em>inside</em> <code>collect</code> is not upstream of anything, so no <code>catch</code> will see it. That one needs an ordinary <code>try</code> around the collector.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "flow-unit-testing",
            importance: "should-know",
            question: "How do you unit test ViewModels with Kotlin Flow and StateFlow?",
            answer: "<p><strong>🧪 Concept</strong></p><ul><li>Use <code>runTest { }</code> from <code>kotlinx-coroutines-test</code> plus Turbine's <code>flow.test { }</code> to assert emissions in order with <code>awaitItem()</code>, <code>awaitComplete()</code>, and <code>awaitError()</code>.</li><li>For <code>StateFlow</code>, read <code>.value</code> directly for simple one-shot assertions, or use Turbine to assert a sequence of state transitions over time.</li><li>Swap <code>Dispatchers.Main</code> for a <code>StandardTestDispatcher</code> in <code>@Before</code>/<code>@After</code> exactly as with regular coroutine ViewModel tests, since <code>stateIn(viewModelScope, ...)</code> depends on <code>Dispatchers.Main</code>.</li></ul>",
            referenceLinks: [{ title: "Turbine - testing library for Kotlin Flow", url: "https://github.com/cashapp/turbine" }, { title: "Test Kotlin coroutines on Android", url: "https://developer.android.com/kotlin/coroutines/test" }],
            tags: ["flow", "testing", "turbine", "stateflow", "runtest"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Testing a Flow with Turbine",
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
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "runTest provides a scheduler with virtual time, so any delay or debounce in the flow costs the test nothing.",
                        "flow.test { } subscribes to the flow and starts recording emissions.",
                        "awaitItem() suspends until the next value arrives and returns it, so assertions run in emission order rather than racing it.",
                        "Each awaitItem consumes one emission; asserting on three values means three calls.",
                        "awaitComplete() asserts the flow finished, and awaitError() asserts it failed — a flow that does neither fails the test rather than hanging.",
                        "cancelAndIgnoreRemainingEvents() ends the subscription for an infinite flow that will never complete.",
                        "If the flow emits something the test never consumed, Turbine fails at the end of the block rather than passing quietly."
                    ],
                    explain: "<p>Step 7 is why this is worth a library rather than a <code>toList()</code>. Collecting into a list and asserting on it passes when the flow emits <em>extra</em> values nobody expected; Turbine treats unconsumed emissions as a failure, so the test asserts the whole sequence rather than a prefix of it.</p><p>Step 1 matters for anything with a <code>debounce</code> or a retry backoff. On real time those tests are slow and flaky; on virtual time they are instant and exact.</p>"
                }
            }],
            subsection: null
        }
    ]
};
