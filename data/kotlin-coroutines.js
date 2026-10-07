const kotlinCoroutinesData = {
    id: "kotlin-coroutines",
    title: "Kotlin Coroutines",
    subsections: null,
    keyTopics: ["Coroutines", "Suspend Functions", "launch", "async-await & withContext", "Dispatchers (Main, IO, Default)", "Coroutine Scope", "coroutineScope vs supervisorScope", "lifecycleScope/viewModelScope/GlobalScope", "CoroutineContext", "Job & SupervisorJob", "suspendCoroutine & suspendCancellableCoroutine", "runBlocking", "Callback to Coroutines", "Retrofit with Coroutines", "Parallel Multiple Network Calls", "Room Database with Coroutines", "Unit Testing ViewModel with Coroutines", "Exception Handling", "Structured Concurrency", "Cancellation"],
    questions: [
        {
            id: "coroutines-what-are-they",
            importance: "must-know",
            question: "What are Coroutines in Kotlin?",
            answer: "<p><strong>🚀 Concept</strong></p><ul><li><strong>Coroutines</strong> are lightweight, cooperative units of concurrency built on top of threads — you can run thousands of them on a handful of OS threads because they <strong>suspend</strong> instead of blocking.</li><li>A coroutine is defined by a suspending function plus a <code>CoroutineScope</code> that controls its lifetime; it always runs inside some scope, never detached.</li><li>The Kotlin compiler transforms suspending code into a state machine using <strong>Continuation-Passing Style (CPS)</strong> — each suspension point becomes a state, and the continuation is resumed later, often on a different thread.</li><li>Coroutines are started with builders like <code>launch</code>, <code>async</code>, or <code>runBlocking</code>, and their execution context (thread, error handling) is controlled by a <code>CoroutineDispatcher</code>.</li></ul><p><strong>⚙️ Why not just threads?</strong></p><ul><li>Threads are expensive (~1MB stack each, OS-scheduled); coroutines are cheap — spinning up 100k coroutines won't crash the app, 100k threads would.</li><li>Coroutines give you <strong>structured concurrency</strong>: a parent scope cancels all of its children automatically, avoiding leaks like an Activity holding a background thread after it's destroyed.</li></ul><p><strong>🎯 Interview tip:</strong> Lead with &quot;suspend, don't block&quot; — that one line is the fastest way to separate coroutines from raw threads.</p>",
            referenceLinks: [{ title: "Coroutines guide - Kotlin", url: "https://kotlinlang.org/docs/coroutines-guide.html" }, { title: "Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" }],
            tags: ["coroutines", "kotlin", "concurrency", "suspend", "async"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Coroutine execution flow",
                columns: 3,
                nodes: [
                    { label: "Main Thread", type: "terminal" },
                    { label: "launch / async" },
                    { label: "Suspend Point?", type: "decision" },
                    { label: "Background Work" },
                    { label: "Resume" },
                    { label: "Complete", type: "terminal" }
                ],
                connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3, label: "yes" }, { from: 3, to: 4 }, { from: 4, to: 5 }]
            },
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-suspend-function",
            importance: "must-know",
            question: "What is a suspend function?",
            answer: "<p><strong>⏸️ Concept</strong></p><ul><li>A <strong>suspend function</strong> is a function marked with the <code>suspend</code> modifier that can pause its execution at a suspension point (e.g. a network call) and resume later without blocking the underlying thread.</li><li>It can only be called from another suspend function or from within a coroutine (a <code>launch</code>/<code>async</code> block, or <code>runBlocking</code>).</li><li>The compiler rewrites it to accept a hidden <code>Continuation</code> parameter — this is how it knows where to resume execution after suspending.</li><li>Calling a suspend function does <strong>not</strong> create a new coroutine or thread by itself; it just marks a potential suspension point inside the current coroutine.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Marking a function <code>suspend</code> doesn't make it non-blocking automatically — if it calls blocking I/O directly, you still need <code>withContext(Dispatchers.IO)</code> inside it.</li><li>You can't call a suspend function from a plain lambda like <code>setOnClickListener</code> without first launching a coroutine.</li></ul>",
            referenceLinks: [{ title: "Coroutines basics - Kotlin", url: "https://kotlinlang.org/docs/coroutines-basics.html" }],
            tags: ["coroutines", "suspend", "kotlin", "continuation"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Suspend function calling suspend function",
                code: `class UserRepository(private val api: ApiService) {
    suspend fun fetchUser(id: String): User = withContext(Dispatchers.IO) {
        api.getUser(id) // suspends here, thread is released
    }
}

fun onLoadClicked() {
    viewModelScope.launch {
        val user = repository.fetchUser("42") // must be called from a coroutine
        _uiState.value = UiState.Loaded(user)
    }
}`
            }],
            subsection: null
        },
        {
            id: "coroutines-launch-vs-async",
            importance: "must-know",
            question: "What is the difference between launch and async in Kotlin Coroutines?",
            answer: "<p><strong>🔀 Concept</strong></p><ul><li>Both are <strong>coroutine builders</strong> that start a new coroutine, but they differ in what they return and how exceptions propagate.</li></ul><table><thead><tr><th>Aspect</th><th>launch</th><th>async</th></tr></thead><tbody><tr><td>Return type</td><td><code>Job</code></td><td><code>Deferred&lt;T&gt;</code></td></tr><tr><td>Result</td><td>No result (fire-and-forget)</td><td>Result via <code>.await()</code></td></tr><tr><td>Use case</td><td>Side effects (UI update, save to DB)</td><td>Concurrent computation you need a value from</td></tr><tr><td>Exception handling</td><td>Propagates immediately to parent/handler</td><td>Stored in the <code>Deferred</code>, thrown on <code>.await()</code></td></tr></tbody></table><p><strong>⚙️ How it works</strong></p><ul><li>Use <code>async</code> when you need two or more independent suspend calls running in parallel and combined — e.g. two Retrofit calls awaited together.</li><li>A root-level <code>async</code> that's never awaited still crashes the app on failure, same as <code>launch</code> — the exception isn't silently swallowed.</li></ul><p><strong>🎯 Interview tip:</strong> &quot;launch = do it, async = do it and give me the answer.&quot;</p>",
            referenceLinks: [{ title: "Composing suspending functions - Kotlin", url: "https://kotlinlang.org/docs/composing-suspending-functions.html" }],
            tags: ["coroutines", "launch", "async", "deferred", "job"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-withcontext",
            importance: "must-know",
            question: "What is withContext and when should you use it?",
            answer: "<p><strong>🔁 Concept</strong></p><ul><li><code>withContext</code> switches the <code>CoroutineContext</code> (typically the dispatcher) for a block of code, suspends the calling coroutine until that block completes, then returns its result — no new coroutine is created.</li><li>It's the idiomatic way to move work onto <code>Dispatchers.IO</code> or <code>Dispatchers.Default</code> from inside a suspend function and automatically return to the original context afterwards.</li><li>Unlike <code>launch</code>/<code>async</code>, it's sequential — the caller is suspended until the block finishes, there is no sibling coroutine.</li></ul><p><strong>⚖️ withContext vs async+await</strong></p><ul><li>Use <code>withContext</code> for a single sequential context switch; use <code>async</code> when multiple operations need to run <em>concurrently</em>.</li><li><code>withContext(Dispatchers.IO) { }</code> is cheaper than <code>async(Dispatchers.IO) { }.await()</code> for one call — no extra <code>Deferred</code> allocation.</li></ul>",
            referenceLinks: [{ title: "Coroutine context and dispatchers", url: "https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html" }],
            tags: ["coroutines", "withcontext", "dispatchers", "kotlin"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Switching dispatcher with withContext",
                code: `suspend fun getUserFromDb(id: String): User = withContext(Dispatchers.IO) {
    userDao.getUserById(id) // runs on IO dispatcher, resumes caller's dispatcher after
}`
            }],
            subsection: null
        },
        {
            id: "coroutines-dispatchers",
            importance: "must-know",
            question: "What are Coroutine Dispatchers?",
            answer: "<p><strong>🧵 Concept</strong></p><ul><li>A <strong>CoroutineDispatcher</strong> decides which thread(s) a coroutine runs and resumes on.</li><li><code>Dispatchers.Main</code> — Android's UI thread; use for UI updates and short, non-blocking work.</li><li><code>Dispatchers.IO</code> — a large, elastic shared pool tuned for blocking I/O: network, disk, database.</li><li><code>Dispatchers.Default</code> — sized to CPU core count, tuned for CPU-intensive work like sorting large lists or parsing JSON.</li><li><code>Dispatchers.Unconfined</code> — starts in the caller's thread and resumes wherever the suspension point resumed; rarely used in app code.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Dispatchers live in the <code>CoroutineContext</code>; set one via the builder (<code>launch(Dispatchers.IO)</code>) or switch mid-coroutine with <code>withContext</code>.</li><li><code>Dispatchers.IO</code> and <code>Dispatchers.Default</code> share the same underlying thread pool machinery but different thread limits, so switching between them is cheap.</li></ul><p><strong>🎯 Interview tip:</strong> Main for UI, IO for blocking calls, Default for CPU work — that rule of thumb answers most follow-ups.</p>",
            referenceLinks: [{ title: "Coroutine context and dispatchers", url: "https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html" }, { title: "Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" }],
            tags: ["coroutines", "dispatchers", "threads", "main", "io", "default"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-scope",
            importance: "must-know",
            question: "What is CoroutineScope?",
            answer: "<p><strong>🧭 Concept</strong></p><ul><li>A <strong>CoroutineScope</strong> defines the lifetime boundary for coroutines launched within it — it ties a <code>Job</code> and a <code>CoroutineContext</code> together.</li><li>Every coroutine builder (<code>launch</code>, <code>async</code>) is an extension function on <code>CoroutineScope</code>, so a coroutine can only be started inside one.</li><li>Cancelling the scope's <code>Job</code> cancels every coroutine launched in it — this is the mechanism behind structured concurrency.</li><li>Android provides lifecycle-aware scopes (<code>viewModelScope</code>, <code>lifecycleScope</code>) so app code rarely needs to construct <code>CoroutineScope(...)</code> manually.</li></ul>",
            referenceLinks: [{ title: "Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" }],
            tags: ["coroutines", "scope", "job", "lifecycle"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-coroutinescope-vs-supervisorscope",
            importance: "must-know",
            question: "What is the difference between coroutineScope and supervisorScope?",
            answer: "<p><strong>⚖️ Concept</strong></p><ul><li>Both are suspending functions that create a child scope and wait for all children to finish, but they differ in how a child's failure travels.</li></ul><table><thead><tr><th>Aspect</th><th>coroutineScope</th><th>supervisorScope</th></tr></thead><tbody><tr><td>Job type</td><td>Regular <code>Job</code></td><td><code>SupervisorJob</code></td></tr><tr><td>Child failure</td><td>Cancels all siblings and rethrows</td><td>Isolated — one child's failure doesn't cancel others</td></tr><tr><td>Use case</td><td>All-or-nothing parallel work</td><td>Independent tasks (e.g. multiple widgets loading separately)</td></tr></tbody></table><ul><li>Both still propagate cancellation from the <em>parent</em> downward — the difference is only in how a <em>child's</em> failure travels back up.</li><li>With <code>supervisorScope</code> you still need per-child <code>try/catch</code> or a <code>CoroutineExceptionHandler</code>, since exceptions no longer bubble up automatically.</li></ul>",
            referenceLinks: [{ title: "Exception handling - Kotlin", url: "https://kotlinlang.org/docs/exception-handling.html" }],
            tags: ["coroutines", "supervisorjob", "exceptions", "structured-concurrency"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-lifecycle-scopes",
            importance: "must-know",
            question: "What are lifecycleScope, viewModelScope, and GlobalScope?",
            answer: "<p><strong>📱 Concept</strong></p><ul><li><code>lifecycleScope</code> — tied to a <code>LifecycleOwner</code> (Activity/Fragment); cancelled automatically when the lifecycle reaches <code>DESTROYED</code>.</li><li><code>viewModelScope</code> — tied to a <code>ViewModel</code>; cancelled when <code>onCleared()</code> runs, so it survives configuration changes but dies when the screen is truly finished.</li><li><code>GlobalScope</code> — tied to the application process itself; nothing cancels it automatically, so it easily leaks work and is discouraged in app code except for genuinely process-lifetime tasks.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Using <code>GlobalScope.launch</code> inside a Fragment is a classic leak — the coroutine keeps running (and holding references) after the Fragment view is destroyed.</li><li>Prefer <code>lifecycleScope.launch { repeatOnLifecycle(Lifecycle.State.STARTED) { ... } }</code> over a raw <code>lifecycleScope.launch</code> when collecting Flows tied to UI visibility.</li></ul>",
            referenceLinks: [{ title: "Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" }, { title: "Lifecycle-aware components", url: "https://developer.android.com/topic/libraries/architecture/lifecycle" }],
            tags: ["coroutines", "lifecyclescope", "viewmodelscope", "globalscope", "android"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-context",
            importance: "must-know",
            question: "What is CoroutineContext?",
            answer: "<p><strong>🧩 Concept</strong></p><ul><li><code>CoroutineContext</code> is an indexed set of elements that configures how a coroutine runs — an immutable, persistent structure combined with the <code>+</code> operator.</li><li>Key elements: <code>Job</code> (lifecycle/cancellation), <code>CoroutineDispatcher</code> (which thread), <code>CoroutineName</code> (debugging), <code>CoroutineExceptionHandler</code> (uncaught exceptions).</li><li>Combining contexts with <code>+</code> merges elements of the same key, with the right-hand side overriding — e.g. <code>Dispatchers.IO + CoroutineName(&quot;sync&quot;)</code>.</li><li>Every coroutine has its own context, inherited from its parent and overridable at launch: <code>launch(Dispatchers.IO) { }</code>.</li></ul>",
            referenceLinks: [{ title: "Coroutine context and dispatchers", url: "https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html" }],
            tags: ["coroutines", "context", "job", "dispatcher"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-job-vs-supervisorjob",
            importance: "must-know",
            question: "What is the difference between Job and SupervisorJob?",
            answer: "<p><strong>⚖️ Concept</strong></p><ul><li>Both represent a cancellable unit of work with a lifecycle, but they differ in how they treat a failing child.</li></ul><table><thead><tr><th>Aspect</th><th>Job</th><th>SupervisorJob</th></tr></thead><tbody><tr><td>Child fails</td><td>Cancels the Job and all other children</td><td>Only that child is cancelled; siblings keep running</td></tr><tr><td>Typical scope</td><td><code>coroutineScope</code>, default <code>CoroutineScope(Dispatchers.IO)</code></td><td><code>supervisorScope</code>, <code>viewModelScope</code>'s underlying job</td></tr><tr><td>Grandchildren</td><td>N/A</td><td>Supervision applies only to direct children, not deeper descendants</td></tr></tbody></table><ul><li>Both still implement the same <code>Job</code> interface and support <code>cancel()</code>, <code>join()</code>, and parent-to-child cancellation propagation.</li></ul>",
            referenceLinks: [{ title: "Exception handling - Kotlin", url: "https://kotlinlang.org/docs/exception-handling.html" }],
            tags: ["coroutines", "job", "supervisorjob", "exception-handling"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-suspend-coroutine",
            importance: "should-know",
            question: "What are suspendCoroutine and suspendCancellableCoroutine?",
            answer: "<p><strong>🔌 Concept</strong></p><ul><li><code>suspendCoroutine</code> and <code>suspendCancellableCoroutine</code> are low-level builders that let you wrap a callback-based API as a suspend function by giving direct access to the underlying <code>Continuation</code>.</li><li>You call <code>continuation.resume(value)</code> or <code>continuation.resumeWithException(e)</code> from inside the callback to resume the suspended coroutine.</li><li><code>suspendCancellableCoroutine</code> additionally exposes <code>invokeOnCancellation { }</code>, letting you clean up (unregister a listener, close a socket) if the coroutine is cancelled while suspended — this is why it's preferred for almost all real integrations.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Calling <code>resume</code> more than once throws <code>IllegalStateException</code> — callback APIs that can fire twice need a one-shot guard.</li></ul>",
            referenceLinks: [{ title: "Coroutines guide - Kotlin", url: "https://kotlinlang.org/docs/coroutines-guide.html" }],
            tags: ["coroutines", "suspendcoroutine", "callback", "cancellation"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Wrapping a listener callback",
                code: `suspend fun awaitLocation(client: FusedLocationProviderClient): Location =
    suspendCancellableCoroutine { cont ->
        val callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                result.lastLocation?.let { cont.resume(it) }
                client.removeLocationUpdates(this)
            }
        }
        client.requestLocationUpdates(request, callback, Looper.getMainLooper())
        cont.invokeOnCancellation { client.removeLocationUpdates(callback) }
    }`
            }],
            subsection: null
        },
        {
            id: "coroutines-runblocking",
            importance: "must-know",
            question: "What is runBlocking?",
            answer: "<p><strong>🧱 Concept</strong></p><ul><li><code>runBlocking</code> is a coroutine builder that <strong>blocks the current thread</strong> until its body and all its children complete — it bridges regular blocking code with suspending code.</li><li>It's meant for <code>main()</code> functions and unit tests, where you need to wait synchronously for a coroutine's result.</li><li>Using it on the Main thread in production app code (e.g. inside an Activity callback) blocks the UI thread and defeats the entire purpose of coroutines — never do it there.</li></ul><p><strong>🎯 Interview tip:</strong> In tests, prefer <code>runTest { }</code> from <code>kotlinx-coroutines-test</code> over <code>runBlocking</code> — it auto-advances virtual time so <code>delay()</code> calls don't slow the test suite down.</p>",
            referenceLinks: [{ title: "Coroutines basics - Kotlin", url: "https://kotlinlang.org/docs/coroutines-basics.html" }],
            tags: ["coroutines", "runblocking", "testing", "blocking"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-callback-to-coroutines",
            importance: "should-know",
            question: "How do you convert Callbacks to Coroutines?",
            answer: "<p><strong>🔄 Concept</strong></p><ul><li>Wrap the callback-based API inside <code>suspendCancellableCoroutine</code>, resuming the continuation from inside the callback.</li><li>Register cleanup via <code>continuation.invokeOnCancellation { }</code> so cancelling the coroutine also unregisters the underlying listener.</li><li>For callbacks that can fire <strong>more than once</strong>, use <code>callbackFlow { }</code> instead — a single-shot <code>Continuation</code> can only be resumed once.</li></ul>",
            referenceLinks: [{ title: "Coroutines guide - Kotlin", url: "https://kotlinlang.org/docs/coroutines-guide.html" }],
            tags: ["coroutines", "callback", "suspendcancellablecoroutine", "interop"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Callback API to suspend function",
                code: `suspend fun getLocation(client: FusedLocationProviderClient): Location =
    suspendCancellableCoroutine { cont ->
        val listener = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                cont.resume(result.lastLocation!!)
                client.removeLocationUpdates(this)
            }
        }
        client.requestLocationUpdates(request, listener, Looper.getMainLooper())
        cont.invokeOnCancellation { client.removeLocationUpdates(listener) }
    }`
            }],
            subsection: null
        },
        {
            id: "coroutines-retrofit",
            importance: "must-know",
            question: "How do you use Retrofit with Coroutines?",
            answer: "<p><strong>🌐 Concept</strong></p><ul><li>Retrofit supports <code>suspend</code> functions natively — declare the interface method as <code>suspend fun</code> and Retrofit runs the call through OkHttp internally, returning the parsed body directly (no <code>Call&lt;T&gt;</code>/<code>enqueue</code> needed).</li><li>You don't need to wrap the call in <code>withContext(Dispatchers.IO)</code> yourself — Retrofit's coroutine adapter already dispatches off the main thread.</li><li>Exceptions (<code>IOException</code>, <code>HttpException</code>) propagate as normal Kotlin exceptions, so wrap calls in <code>try/catch</code> or return a <code>Result&lt;T&gt;</code> from the repository.</li></ul>",
            referenceLinks: [{ title: "Retrofit API reference", url: "https://javadoc.io/doc/com.squareup.retrofit2/retrofit/latest/index.html" }, { title: "Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" }],
            tags: ["coroutines", "retrofit", "networking", "suspend"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Suspend Retrofit call with Result wrapper",
                code: `interface ApiService {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: String): User
}

class UserRepository(private val api: ApiService) {
    suspend fun fetchUser(id: String): Result<User> = try {
        Result.success(api.getUser(id))
    } catch (e: HttpException) {
        Result.failure(e)
    } catch (e: IOException) {
        Result.failure(e)
    }
}`
            }],
            subsection: null
        },
        {
            id: "coroutines-parallel-network-calls",
            importance: "should-know",
            question: "How do you make parallel multiple network calls with Coroutines?",
            answer: "<p><strong>⚡ Concept</strong></p><ul><li>Launch each call with <code>async</code> inside a <code>coroutineScope</code> so they run concurrently, then call <code>.await()</code> on each — total time is the max of the calls, not the sum.</li><li>Wrapping in <code>coroutineScope</code> (not <code>GlobalScope</code>) ensures that if one call fails, the others are cancelled and the exception propagates cleanly to the caller.</li></ul>",
            referenceLinks: [{ title: "Composing suspending functions - Kotlin", url: "https://kotlinlang.org/docs/composing-suspending-functions.html" }],
            tags: ["coroutines", "async", "parallel", "networking", "retrofit"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Parallel network calls with async",
                code: `suspend fun loadDashboard(userId: String): Dashboard = coroutineScope {
    val userDeferred = async { api.getUser(userId) }
    val postsDeferred = async { api.getPosts(userId) }
    val friendsDeferred = async { api.getFriends(userId) }

    Dashboard(
        user = userDeferred.await(),
        posts = postsDeferred.await(),
        friends = friendsDeferred.await()
    )
}`
            }],
            subsection: null
        },
        {
            id: "coroutines-room-database",
            importance: "should-know",
            question: "How do you use Room Database with Coroutines?",
            answer: "<p><strong>🗄️ Concept</strong></p><ul><li>Room generates <code>suspend fun</code> DAO methods for one-shot reads/writes, dispatched off the main thread on Room's own executor — no manual <code>withContext(Dispatchers.IO)</code> is required, though repositories often add it for clarity and testability.</li><li>Write operations (<code>insert</code>/<code>update</code>/<code>delete</code>) should be <code>suspend fun</code>; reactive read streams should return <code>Flow&lt;T&gt;</code> instead (see the Kotlin Flow topic).</li><li>Room throws <code>SQLiteConstraintException</code> and similar exceptions like any normal suspend call, so wrap DAO calls in <code>try/catch</code> where a constraint violation is expected.</li></ul>",
            referenceLinks: [{ title: "Save data in a local database with Room", url: "https://developer.android.com/training/data-storage/room" }],
            tags: ["coroutines", "room", "database", "dao"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Room DAO with suspend functions",
                code: `@Dao
interface UserDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(user: UserEntity)

    @Query("SELECT * FROM users WHERE id = :id")
    suspend fun getUserById(id: String): UserEntity?

    @Delete
    suspend fun delete(user: UserEntity)
}

class UserRepository(private val dao: UserDao) {
    suspend fun cacheUser(user: UserEntity) = withContext(Dispatchers.IO) {
        dao.insert(user)
    }
}`
            }],
            subsection: null
        },
        {
            id: "coroutines-unit-testing-viewmodel",
            importance: "should-know",
            question: "How do you unit test a ViewModel with Coroutines?",
            answer: "<p><strong>🧪 Concept</strong></p><ul><li>Use <code>kotlinx-coroutines-test</code>'s <code>runTest { }</code>, which runs on a <code>TestDispatcher</code> and auto-advances virtual time, so <code>delay()</code> calls don't actually wait during the test.</li><li>Replace <code>Dispatchers.Main</code> with a test dispatcher via <code>Dispatchers.setMain(StandardTestDispatcher())</code> in <code>@Before</code>, and reset it with <code>Dispatchers.resetMain()</code> in <code>@After</code> — otherwise <code>viewModelScope</code> code crashes with &quot;Main dispatcher not available&quot;.</li><li>Inject a <code>TestDispatcher</code> into repositories that hardcode <code>Dispatchers.IO</code> so tests stay deterministic and don't depend on real threads.</li></ul>",
            referenceLinks: [{ title: "Test Kotlin coroutines on Android", url: "https://developer.android.com/kotlin/coroutines/test" }],
            tags: ["coroutines", "testing", "viewmodel", "runtest", "testdispatcher"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "ViewModel test with runTest",
                code: `@OptIn(ExperimentalCoroutinesApi::class)
class UserViewModelTest {
    private val testDispatcher = StandardTestDispatcher()

    @Before fun setUp() = Dispatchers.setMain(testDispatcher)
    @After fun tearDown() = Dispatchers.resetMain()

    @Test
    fun loadUser_emitsLoadedState() = runTest {
        val fakeRepo = FakeUserRepository(User("1", "Ada"))
        val viewModel = UserViewModel(fakeRepo)

        viewModel.loadUser("1")
        advanceUntilIdle()

        assertEquals(UiState.Loaded(User("1", "Ada")), viewModel.uiState.value)
    }
}`
            }],
            subsection: null
        },
        {
            id: "coroutines-exception-handling",
            importance: "must-know",
            question: "How does exception handling work in Coroutines?",
            answer: "<p><strong>🚨 Concept</strong></p><ul><li>Exceptions in coroutines propagate up through the <strong>Job hierarchy</strong>: an uncaught exception in a child cancels its parent (and siblings), unless the parent is a <code>SupervisorJob</code>.</li><li><code>try/catch</code> around a suspend call works exactly like regular Kotlin, and is the preferred way to handle expected failures (e.g. network errors in a repository).</li><li>A <code>CoroutineExceptionHandler</code> installed on a root coroutine (launched with <code>launch</code>, not <code>async</code>) catches exceptions that would otherwise crash the app — it's a last-resort, global handler, not a substitute for <code>try/catch</code>.</li><li><code>async</code> exceptions are stored in the resulting <code>Deferred</code> and only thrown when <code>.await()</code> is called — a <code>CoroutineExceptionHandler</code> does not catch them unless the <code>async</code> is itself the root coroutine.</li></ul>",
            referenceLinks: [{ title: "Coroutine exceptions handling", url: "https://kotlinlang.org/docs/exception-handling.html" }],
            tags: ["coroutines", "exceptions", "coroutineexceptionhandler", "error-handling"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Handler vs try/catch",
                code: `val handler = CoroutineExceptionHandler { _, exception ->
    Log.e("VM", "Unhandled error", exception)
}

viewModelScope.launch(handler) {
    val user = repository.fetchUser(id) // uncaught throw -> caught by handler
}

// Expected, recoverable errors: prefer try/catch
viewModelScope.launch {
    try {
        val user = repository.fetchUser(id)
        _uiState.value = UiState.Loaded(user)
    } catch (e: IOException) {
        _uiState.value = UiState.Error("Network error")
    }
}`
            }],
            subsection: null
        },
        {
            id: "coroutines-structured-concurrency",
            importance: "must-know",
            question: "What is structured concurrency?",
            answer: "<p><strong>🏗️ Concept</strong></p><ul><li><strong>Structured concurrency</strong> means every coroutine is launched within a scope tied to a well-defined lifetime — a coroutine can never outlive the scope that started it.</li><li>Cancelling a parent's <code>Job</code> recursively cancels all of its children; a <code>coroutineScope</code> call doesn't return until <em>all</em> of its children finish, successfully or by cancellation.</li><li>This guarantees no &quot;leaked&quot; coroutines running silently in the background after the owning component (Activity, ViewModel) is gone — the opposite of unstructured <code>GlobalScope</code> usage.</li><li>Failure of a child propagates to the parent by default (unless using <code>SupervisorJob</code>), which then cancels its other children — this is what makes error handling predictable.</li></ul><p><strong>🎯 Interview tip:</strong> Structured concurrency is Kotlin's answer to the &quot;fire-and-forget thread that leaks&quot; problem — mention <code>viewModelScope</code> as the concrete Android example.</p>",
            referenceLinks: [{ title: "Coroutines guide - Kotlin", url: "https://kotlinlang.org/docs/coroutines-guide.html" }],
            tags: ["coroutines", "structured-concurrency", "job", "scope"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Structured concurrency",
                columns: 3,
                nodes: [
                    { label: "Parent Scope", type: "terminal" },
                    { label: "launch Child A" },
                    { label: "launch Child B" },
                    { label: "Child A fails", type: "decision" },
                    { label: "Scope cancels" },
                    { label: "Child B cancelled", type: "terminal" }
                ],
                connections: [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 1, to: 3 }, { from: 3, to: 4, label: "exception" }, { from: 4, to: 5 }]
            },
            codeSnippets: [],
            subsection: null
        },
        {
            id: "coroutines-cancellation",
            importance: "must-know",
            question: "How do you cancel a coroutine?",
            answer: "<p><strong>🛑 Concept</strong></p><ul><li>Cancellation in coroutines is <strong>cooperative</strong> — calling <code>job.cancel()</code> just marks the Job as &quot;Cancelling&quot;; the coroutine must check for cancellation and stop itself.</li><li>Suspending functions from <code>kotlinx.coroutines</code> (<code>delay</code>, <code>yield</code>, dispatcher switches) are cancellation-aware and throw <code>CancellationException</code> automatically at their suspension point.</li><li>Long-running CPU-bound loops must check <code>isActive</code> or call <code>ensureActive()</code>/<code>yield()</code> periodically, or they keep running despite cancellation.</li><li><code>CancellationException</code> is special — a broad <code>catch (e: Exception)</code> around suspend calls will also swallow it unless you rethrow it, which silently breaks cancellation.</li><li>Use <code>withTimeout(ms) { }</code> / <code>withTimeoutOrNull(ms) { }</code> to cancel a block automatically after a deadline.</li></ul>",
            referenceLinks: [{ title: "Cancellation and timeouts - Kotlin", url: "https://kotlinlang.org/docs/cancellation-and-timeouts.html" }],
            tags: ["coroutines", "cancellation", "job", "cancellationexception", "isactive"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Cooperative cancellation",
                code: `viewModelScope.launch {
    val job = launch {
        var i = 0
        while (isActive) { // cooperative check
            i++
            delay(500)
        }
    }
    delay(2000)
    job.cancel() // requests cancellation
    job.join()   // waits for it to actually finish
}`
            }],
            subsection: null
        }
    ]
};
