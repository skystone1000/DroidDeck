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
            answer: "<p><strong>🔑 A coroutine is work that can pause in the middle and let the thread go and do something else. Suspend, don't block.</strong></p><ul><li>A suspended coroutine holds no thread, so a handful of threads can run thousands of them. A thread costs about a megabyte of stack; a coroutine costs an object.</li><li>Every coroutine runs inside a <code>CoroutineScope</code> that owns its lifetime. There is no detached coroutine.</li><li>The compiler rewrites a <code>suspend</code> function into a state machine and passes a <code>Continuation</code> from one suspension point to the next — <strong>Continuation-Passing Style</strong>. That is why resuming can land on a different thread.</li><li>You start one with a builder — <code>launch</code>, <code>async</code>, <code>runBlocking</code> — and a <code>CoroutineDispatcher</code> decides which thread it runs on.</li><li><strong>Structured concurrency</strong> is the other half: cancel a scope and every child dies with it, so an Activity cannot leave background work running after it is destroyed.</li></ul><p><strong>🎯 Interview tip:</strong> The comparison that settles it — launch 100,000 coroutines and the app is fine. Start 100,000 threads and it is not.</p>",
            referenceLinks: [{ title: "Coroutines guide - Kotlin", url: "https://kotlinlang.org/docs/coroutines-guide.html" }, { title: "Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" }],
            images: [
                {
                    src: "assets/img/coroutines-and-threads.svg",
                    alt: "Six small boxes labelled Coroutine, each about ten kilobytes of heap memory, with lines running down into two much larger boxes labelled Thread, each with about two megabytes of allocated memory",
                    caption: "The ratio, drawn. Six coroutines at roughly 10&nbsp;KB of heap each, running on two threads at roughly 2&nbsp;MB each — which is why the count that crashes is threads, not coroutines.",
                    sourceTitle: "Coroutine basics",
                    sourceUrl: "https://kotlinlang.org/docs/coroutines-basics.html"
                }
            ],
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
                title: "A suspend function, and what suspending looks like from outside",
                code: `import kotlinx.coroutines.*

data class User(val id: String, val name: String)

class ApiService {
    // A real one would be a Retrofit \`suspend fun\`; the delay stands in for the network.
    suspend fun getUser(id: String): User {
        delay(100)
        return User(id, "Ada")
    }
}

class UserRepository(private val api: ApiService) {
    suspend fun fetchUser(id: String): User = withContext(Dispatchers.IO) {
        println("  fetchUser: about to suspend, releasing the thread")
        val user = api.getUser(id)
        println("  fetchUser: resumed with \${user.name}")
        user
    }
}

fun main() = runBlocking {
    val repository = UserRepository(ApiService())

    println("before launch")

    // In an Android app this would be viewModelScope.launch { }.
    val job = launch {
        val user = repository.fetchUser("42")
        println("ui state = Loaded(\${user.name})")
    }

    println("after launch — this line did not wait")
    job.join()
    println("done")
}`,
                output: {
                    kind: "stdout",
                    lines: [
                        "before launch",
                        "after launch — this line did not wait",
                        "  fetchUser: about to suspend, releasing the thread",
                        "  fetchUser: resumed with Ada",
                        "ui state = Loaded(Ada)",
                        "done"
                    ],
                    explain: "<p>Read the first two lines together. <code>launch</code> returned <em>before</em> the repository had done anything — that is what \"does not block\" means, and it is why the UI thread stays responsive while a call is in flight.</p><p>The two indented lines are the suspension itself. Between them the coroutine was not running and no thread was held waiting for it; <code>withContext(Dispatchers.IO)</code> handed the work to a background thread and gave the caller's thread back. The function then resumed exactly where it left off, with a local variable it had before suspending, which is what makes suspending code read like blocking code.</p><p>The <code>ApiService</code> here is a stand-in with a <code>delay</code> in place of a network call, so the snippet actually runs. In an app it would be a Retrofit interface and the <code>launch</code> would be <code>viewModelScope.launch</code>.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "coroutines-launch-vs-async",
            importance: "must-know",
            question: "What is the difference between launch and async in Kotlin Coroutines?",
            answer: "<p><strong>🔑 <code>launch</code> starts work and hands you a <code>Job</code>. <code>async</code> starts work and hands you a <code>Deferred</code> you can <code>await()</code> for a value.</strong></p><table><thead><tr><th>Aspect</th><th>launch</th><th>async</th></tr></thead><tbody><tr><td>Returns</td><td><code>Job</code></td><td><code>Deferred&lt;T&gt;</code></td></tr><tr><td>Result</td><td>None — fire and forget</td><td>The value, from <code>.await()</code></td></tr><tr><td>Reach for it when</td><td>You want a side effect: update the UI, write to the database</td><td>You want a value computed alongside another one</td></tr><tr><td>A failure</td><td>Propagates up the <code>Job</code> tree straight away</td><td>Is stored in the <code>Deferred</code> and rethrown by <code>.await()</code></td></tr></tbody></table><ul><li>Use <code>async</code> when two independent suspend calls should run at the same time and be combined — two Retrofit calls, awaited together.</li><li><strong>A root <code>async</code> that is never awaited swallows its failure completely.</strong> The exceptions guide is blunt about it: <code>async</code> <em>&quot;always catches all exceptions and represents them in the resulting <code>Deferred</code> object, so its <code>CoroutineExceptionHandler</code> has no effect either&quot;</em>. Its own sample throws from a <code>GlobalScope.async</code> and comments <em>&quot;Nothing is printed, relying on user to call await&quot;</em>.</li><li>A <strong>non-root</strong> <code>async</code> is the opposite case. Being a child, its failure cancels the parent and travels up the tree exactly like <code>launch</code>, and <code>await()</code> rethrows it as well. &quot;Root&quot; here means not a child of another coroutine.</li></ul><p><strong>🎯 Interview tip:</strong> &quot;launch = do it, async = do it and give me the answer.&quot; Then add the root-<code>async</code> trap — it is the follow-up that separates people who have read the guide from people who have not.</p>",
            referenceLinks: [{ title: "Composing suspending functions - Kotlin", url: "https://kotlinlang.org/docs/composing-suspending-functions.html" }, { title: "Coroutine exceptions handling", url: "https://kotlinlang.org/docs/exception-handling.html" }],
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
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "The caller is already inside a coroutine — say viewModelScope, which runs on the main thread.",
                        "It calls getUserFromDb, which immediately hits withContext(Dispatchers.IO).",
                        "withContext suspends the coroutine and reschedules its body onto a thread from the IO pool. The main thread is released, not blocked.",
                        "userDao.getUserById runs on that IO thread. The main thread is free to draw frames the whole time.",
                        "When the query returns, withContext resumes the coroutine back on the dispatcher the caller came from — the main thread.",
                        "getUserFromDb returns the User to code that has never left the main thread, and never needed a callback to get back to it."
                    ],
                    explain: "<p>Step 5 is the part that distinguishes <code>withContext</code> from <code>launch(Dispatchers.IO)</code>: it puts you back where you started. The dispatcher change lasts exactly as long as the block, so the caller does not have to switch back by hand and cannot forget to.</p><p><code>withContext</code> also returns a value and suspends until the block finishes, which makes it the right tool for \"do this bit somewhere else and give me the answer\" — as opposed to <code>launch</code>, which is fire-and-forget.</p>"
                }
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
            importance: "should-know",
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
            importance: "should-know",
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
            importance: "should-know",
            question: "What is CoroutineContext?",
            answer: "<p><strong>🔑 A <code>CoroutineContext</code> is the set of settings a coroutine runs with: which thread, which <code>Job</code>, what name, and who hears about crashes.</strong></p><ul><li>Four elements do the work — <code>Job</code> (lifetime and cancellation), <code>CoroutineDispatcher</code> (which thread), <code>CoroutineName</code> (debugging), <code>CoroutineExceptionHandler</code> (uncaught exceptions).</li><li>It is a set keyed by element type, so <code>+</code> merges rather than appends and the right-hand side wins: <code>Dispatchers.IO + CoroutineName(&quot;sync&quot;)</code>.</li><li>A coroutine inherits its parent's context and replaces only what you pass to the builder. <code>launch(Dispatchers.IO) { }</code> swaps the dispatcher and keeps the rest.</li></ul>",
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
    }`,
                output: {
                    kind: "trace",
                    lines: [
                        "A coroutine calls awaitLocation and suspends at suspendCancellableCoroutine.",
                        "The block runs immediately, on the calling thread, and registers a LocationCallback with the framework.",
                        "The block returns, but the coroutine stays suspended. It is now waiting on the continuation, holding no thread.",
                        "Some time later the location framework invokes onLocationResult on its own thread.",
                        "cont.resume(location) hands the value back and the coroutine resumes, on its own dispatcher rather than the framework's.",
                        "The callback is unregistered, so the framework stops delivering updates nobody is waiting for.",
                        "If instead the coroutine is cancelled while suspended, invokeOnCancellation runs and unregisters the callback the same way."
                    ],
                    explain: "<p>Step 7 is why this uses <code>suspendCancellableCoroutine</code> rather than plain <code>suspendCoroutine</code>. Without <code>invokeOnCancellation</code> a cancelled coroutine leaves the listener registered, and the framework keeps calling back into an object that will never resume anything — a leak that outlives the screen that caused it.</p><p>The other rule the code obeys: a continuation may be resumed <strong>exactly once</strong>. Resuming twice throws, which is why the callback is removed on the first result.</p>"
                }
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
                title: "Turning a callback API into a suspend function",
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
    }`,
                output: {
                    kind: "trace",
                    lines: [
                        "Caller writes val location = getLocation(client) — one line, no callback in sight.",
                        "suspendCancellableCoroutine captures the coroutine's continuation and suspends it.",
                        "The listener is registered with the callback-based API, exactly as it would be without coroutines.",
                        "onLocationResult fires on the framework's thread and calls cont.resume(...).",
                        "The suspended coroutine resumes with that value as the return value of getLocation.",
                        "The listener is removed, and invokeOnCancellation guarantees it is also removed if the coroutine dies first."
                    ],
                    explain: "<p>This is the adapter that lets everything else in the codebase stop dealing in callbacks. The API on the outside is a plain suspending function returning a value, so calls sequence and errors propagate like ordinary code — while the callback machinery stays sealed inside the wrapper.</p><p>The one hazard is <code>result.lastLocation!!</code>: a callback that fires with nothing would throw inside the framework's thread rather than at the call site. Resuming with <code>resumeWithException</code> on the failure path is the more careful form.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "coroutines-retrofit",
            importance: "should-know",
            question: "How do you use Retrofit with Coroutines?",
            answer: "<p><strong>🔑 Mark the interface function <code>suspend</code> and Retrofit does the rest — no <code>Call&lt;T&gt;</code>, no <code>enqueue</code>, no <code>withContext</code>.</strong></p><ul><li>Retrofit has supported the modifier since 2.6.0, and its changelog says exactly what it compiles to: <em>&quot;Behind the scenes this behaves as if defined as <code>fun user(...): Call&lt;User&gt;</code> and then invoked with <code>Call.enqueue</code>.&quot;</em></li><li>That is why wrapping it in <code>withContext(Dispatchers.IO)</code> is redundant. <code>enqueue</code> runs on OkHttp's own dispatcher, so both the request and the response parsing happen off the main thread — the function is already main-safe.</li><li>Return the body type to get the parsed body, or <code>Response&lt;T&gt;</code> when you need the status code and headers too.</li><li>Failures arrive as ordinary exceptions — <code>IOException</code> for the network, <code>HttpException</code> for a non-2xx — so <code>try</code>/<code>catch</code> at the repository boundary, or map them into a <code>Result&lt;T&gt;</code>.</li></ul>",
            referenceLinks: [{ title: "Retrofit API reference", url: "https://javadoc.io/doc/com.squareup.retrofit2/retrofit/latest/index.html" }, { title: "Retrofit CHANGELOG — 2.6.0", url: "https://github.com/lysine-dev/retrofit/blob/trunk/CHANGELOG.md" }, { title: "Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" }],
            tags: ["coroutines", "retrofit", "networking", "suspend"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Suspend Retrofit call wrapped in Result",
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
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "The caller, inside a coroutine, calls fetchUser.",
                        "api.getUser is a suspend function, so Retrofit enqueues the request and suspends the coroutine rather than blocking it.",
                        "Retrofit performs the call on OkHttp's own dispatcher and thread pool, which is why no withContext(Dispatchers.IO) is needed here.",
                        "On a 2xx response the body is parsed and the coroutine resumes with the User, which is wrapped in Result.success.",
                        "On a 4xx or 5xx, Retrofit throws HttpException at the point of resumption, which the first catch turns into Result.failure.",
                        "On a socket or DNS failure it throws IOException instead, which the second catch handles the same way.",
                        "Either way the caller receives a Result and never sees an exception cross the repository boundary."
                    ],
                    explain: "<p>Step 3 is the detail most often got wrong: wrapping a suspending Retrofit call in <code>withContext(Dispatchers.IO)</code> is redundant. Retrofit already moves the work off the caller's thread, so the extra dispatcher switch buys nothing.</p><p>Steps 5 and 6 are why there are two catches. <code>HttpException</code> means the server answered and the answer was an error; <code>IOException</code> means the conversation never happened. They usually deserve different messages on screen, and catching <code>Exception</code> flattens the distinction — while also swallowing <code>CancellationException</code>, which must be allowed to propagate.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "coroutines-parallel-network-calls",
            importance: "should-know",
            question: "How do you make parallel multiple network calls with Coroutines?",
            answer: "<p><strong>⚡ Concept</strong></p><ul><li>Launch each call with <code>async</code> inside a <code>coroutineScope</code> so they run concurrently, then call <code>.await()</code> on each — total time is the max of the calls, not the sum.</li><li>Wrapping in <code>coroutineScope</code> (not <code>GlobalScope</code>) ensures that if one call fails, the others are cancelled and the exception propagates cleanly to the caller.</li></ul>",
            referenceLinks: [{ title: "Composing suspending functions - Kotlin", url: "https://kotlinlang.org/docs/composing-suspending-functions.html" }],
            images: [
                {
                    src: "assets/img/parallelism-and-concurrency.svg",
                    alt: "Three panels. Parallel shows three threads each running one unbroken task at the same time. Concurrent shows a single thread with several tasks interleaved as alternating coloured segments. Parallel and concurrent shows two threads each interleaving several tasks",
                    caption: "Two calls at once is the left panel; two calls taking turns on one thread is the middle. <code>async</code> gives you the first only when there is a thread free to take it.",
                    sourceTitle: "Coroutine basics",
                    sourceUrl: "https://kotlinlang.org/docs/coroutines-basics.html"
                }
            ],
            tags: ["coroutines", "async", "parallel", "networking", "retrofit"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Three calls at once with async",
                code: `import kotlinx.coroutines.*

data class Dashboard(val user: String, val posts: Int, val friends: Int)

class Api {
    suspend fun getUser(id: String): String   { delay(300); println("  user arrived");    return "Ada" }
    suspend fun getPosts(id: String): Int     { delay(200); println("  posts arrived");   return 12 }
    suspend fun getFriends(id: String): Int   { delay(100); println("  friends arrived"); return 5 }
}

val api = Api()

suspend fun loadDashboard(userId: String): Dashboard = coroutineScope {
    // async starts all three immediately; await only collects the results.
    val userDeferred = async { api.getUser(userId) }
    val postsDeferred = async { api.getPosts(userId) }
    val friendsDeferred = async { api.getFriends(userId) }

    Dashboard(
        user = userDeferred.await(),
        posts = postsDeferred.await(),
        friends = friendsDeferred.await()
    )
}

fun main() = runBlocking {
    println("requesting all three")
    println("dashboard = " + loadDashboard("42"))
}`,
                output: {
                    kind: "stdout",
                    lines: [
                        "requesting all three",
                        "  friends arrived",
                        "  posts arrived",
                        "  user arrived",
                        "dashboard = Dashboard(user=Ada, posts=12, friends=5)"
                    ],
                    explain: "<p>The arrival order is the proof. The three calls were <em>started</em> in the order user, posts, friends, and they <em>finished</em> in the reverse order — friends first, because its delay is shortest. If <code>async</code> had run them one after another the order would have matched the source.</p><p>The reason is that <code>async</code> starts the work immediately and returns a <code>Deferred</code>; <code>await</code> only collects a result that is already on its way. Calling <code>await()</code> on each one in turn does not serialise them, because by then all three are already running.</p><p>The common mistake is <code>async { }.await()</code> on one line, which starts a coroutine and immediately waits for it — all the machinery of concurrency and none of the benefit.</p>"
                }
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
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "Room sees suspend on the DAO methods at compile time and generates implementations that do not block.",
                        "A caller inside a coroutine calls dao.insert(user).",
                        "The generated code dispatches the query to Room's own executor and suspends the coroutine.",
                        "The write runs on that background thread; the caller's thread is released.",
                        "When it completes the coroutine resumes on its original dispatcher.",
                        "Because the DAO is suspend, Room's main-thread check never fires — a blocking DAO call from the main thread would have thrown IllegalStateException instead."
                    ],
                    explain: "<p>Step 6 is the practical point. Room refuses to run a blocking query on the main thread and crashes rather than dropping frames silently. Marking DAO functions <code>suspend</code> is what removes that whole category of mistake.</p><p>It also makes the <code>withContext(Dispatchers.IO)</code> in <code>cacheUser</code> unnecessary: Room already dispatches its own work, exactly as Retrofit does. It is harmless, and it is one of the most common redundant lines in Android codebases.</p>"
                }
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
                title: "Testing a coroutine ViewModel with runTest",
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
}`,
                output: {
                    kind: "trace",
                    lines: [
                        "setUp installs a StandardTestDispatcher as Dispatchers.Main, so viewModelScope inside the ViewModel uses it instead of the real Android main looper.",
                        "runTest starts the test body on a scheduler that controls virtual time.",
                        "viewModel.loadUser(\"1\") launches a coroutine on viewModelScope — which is queued on the test dispatcher, not executed yet.",
                        "advanceUntilIdle runs everything the scheduler has queued, including any delay(), instantly and in order.",
                        "Any delay in the ViewModel is skipped rather than waited out, so a two-second retry backoff costs the test nothing.",
                        "The assertion runs with all coroutines settled, so the state is final rather than whatever happened to be there.",
                        "tearDown resets Dispatchers.Main, because setMain is global and would leak into the next test class."
                    ],
                    explain: "<p>Steps 4 and 5 are the reason this setup exists. Without a test dispatcher the assertion races the coroutine and the test either sleeps or flakes; with one, virtual time makes the ordering exact and the suite stays fast.</p><p>Step 7 is the one people forget. <code>Dispatchers.setMain</code> mutates global state, and skipping <code>resetMain</code> produces failures in an unrelated test class that ran afterwards — the hardest kind to trace.</p><p><code>StandardTestDispatcher</code> queues work until you advance it, which is what makes the ordering above observable. <code>UnconfinedTestDispatcher</code> runs eagerly instead, which is convenient and hides exactly the ordering bugs a test like this should catch.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "coroutines-exception-handling",
            importance: "must-know",
            question: "How does exception handling work in Coroutines?",
            answer: "<p><strong>🔑 Two rules. <code>try</code>/<code>catch</code> works normally around a suspend call, and anything uncaught travels up the <code>Job</code> tree, cancelling the parent and its siblings on the way.</strong></p><ul><li><code>try</code>/<code>catch</code> around a suspend call behaves exactly like ordinary Kotlin, and it is the right tool for failures you expect — a network error inside a repository.</li><li>An uncaught exception in a child cancels its parent, and therefore its siblings. A <code>SupervisorJob</code> or <code>supervisorScope</code> cuts that link so one failed child does not take the others down.</li><li><code>CoroutineExceptionHandler</code> is a last resort, and it belongs on a <strong>root</strong> coroutine. The guide: it is <em>&quot;invoked only on uncaught exceptions — exceptions that were not handled in any other way&quot;</em>, and children delegate to their parent, so a handler installed in a child's context is never used.</li><li>It never sees an <code>async</code> failure at all. <code>async</code> <em>&quot;always catches all exceptions and represents them in the resulting <code>Deferred</code> object, so its <code>CoroutineExceptionHandler</code> has no effect either&quot;</em>. You get that exception from <code>await()</code> or you never get it.</li><li>A <code>CancellationException</code> is ignored by the machinery — it is how cancellation is signalled, not a failure, so handlers do not fire for it.</li></ul>",
            referenceLinks: [{ title: "Coroutine exceptions handling", url: "https://kotlinlang.org/docs/exception-handling.html" }],
            tags: ["coroutines", "exceptions", "coroutineexceptionhandler", "error-handling"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Handler versus try/catch, and what neither one catches",
                code: `import kotlinx.coroutines.*
import java.io.IOException

class Repository {
    suspend fun fetchUser(id: String): String {
        delay(10)
        throw IOException("no network")
    }
}

val repository = Repository()

fun main() = runBlocking {
    val handler = CoroutineExceptionHandler { _, exception ->
        println("handler: \${exception::class.simpleName} — \${exception.message}")
    }

    // 1. Unexpected failure: the handler is the last line of defence.
    //    In a ViewModel this is viewModelScope.launch(handler) { }.
    CoroutineScope(Job() + handler)
        .launch { repository.fetchUser("42") }
        .join()

    // 2. Expected failure: try/catch keeps the recovery beside the call.
    launch {
        try {
            val user = repository.fetchUser("42")
            println("ui state = Loaded($user)")
        } catch (e: IOException) {
            println("ui state = Error(\\"Network error\\")")
        }
    }.join()

    // 3. try/catch AROUND launch catches nothing. launch returns immediately;
    //    the throw happens later, inside the child, on another stack.
    try {
        CoroutineScope(Job() + handler)
            .launch { repository.fetchUser("42") }
            .join()
    } catch (e: IOException) {
        println("this line never runs")
    }

    println("done")
}`,
                output: {
                    kind: "stdout",
                    lines: [
                        "handler: IOException — no network",
                        "ui state = Error(\"Network error\")",
                        "handler: IOException — no network",
                        "done"
                    ],
                    explain: "<p>Three cases, and the third is the one that catches people out. The <code>try</code> wrapped around <code>launch</code> printed nothing — its <code>catch</code> never ran, and the handler reported the failure instead. <code>launch</code> returns as soon as the coroutine is scheduled, so by the time the exception is thrown the <code>try</code> block has long since been left. There is no stack frame for it to unwind into.</p><p>That is the rule: <strong>try/catch has to be inside the coroutine</strong>, around the call that can fail, which is what the middle case does. Use it for failures you expect and can recover from — a network error becoming an error state on screen.</p><p>A <code>CoroutineExceptionHandler</code> is the other end: a last resort for failures you did not anticipate, where the only sensible response is to log. It cannot recover anything, because by the time it runs the coroutine is already dead.</p>"
                }
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
                title: "Cancellation is cooperative, and what happens when code does not cooperate",
                code: `import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel

fun main() = runBlocking {
    val ticked = Channel<Int>(Channel.UNLIMITED)

    // Cooperative: the loop tests isActive, and delay() is a suspension point.
    val cooperative = launch {
        try {
            var i = 0
            while (isActive) {
                ticked.send(i)
                i++
                delay(1)
            }
        } finally {
            println("cooperative: finally still runs on cancellation")
        }
    }

    repeat(3) { println("tick \${ticked.receive()}") }
    cooperative.cancelAndJoin()
    println("cooperative.isCancelled = \${cooperative.isCancelled}")

    // Not cooperative: no suspension point and no isActive check, so cancel()
    // sets a flag that nothing ever looks at.
    val started = CompletableDeferred<Unit>()
    val stubborn = launch(Dispatchers.Default) {
        started.complete(Unit)
        var i = 0
        while (i < 3) {
            Thread.sleep(5)
            println("stubborn keeps going: $i")
            i++
        }
        println("stubborn: ran to completion despite being cancelled")
    }

    started.await()
    stubborn.cancel()
    stubborn.join()
    println("stubborn.isCancelled = \${stubborn.isCancelled}")
}`,
                output: {
                    kind: "stdout",
                    lines: [
                        "tick 0",
                        "tick 1",
                        "tick 2",
                        "cooperative: finally still runs on cancellation",
                        "cooperative.isCancelled = true",
                        "stubborn keeps going: 0",
                        "stubborn keeps going: 1",
                        "stubborn keeps going: 2",
                        "stubborn: ran to completion despite being cancelled",
                        "stubborn.isCancelled = true"
                    ],
                    explain: "<p>The two halves are the same <code>cancel()</code> call with opposite outcomes.</p><p>The cooperative coroutine stopped, because it does two things right: it tests <code>isActive</code>, and it calls <code>delay</code>, which is a suspension point that throws <code>CancellationException</code> when the job is cancelled. Its <code>finally</code> block still ran — cancellation unwinds the coroutine normally, so cleanup is not skipped.</p><p>The stubborn one printed all three iterations and its completion message <em>after</em> being cancelled, and <code>isCancelled</code> was <code>true</code> the whole time. <code>cancel()</code> does not stop a thread; it sets a flag and throws at the next suspension point. A loop with no suspension point and no <code>isActive</code> check never reaches one, so it runs to the end regardless.</p><p>This is why a long CPU-bound loop in a coroutine needs an explicit <code>ensureActive()</code> or <code>yield()</code> — otherwise leaving the screen does not stop the work.</p>"
                }
            }],
            subsection: null
        }
    ]
};
