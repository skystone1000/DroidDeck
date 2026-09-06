/* ==========================================================================
   M8 — Coroutines fundamentals.

   Picks up the problem M7 posed: work has to leave the main thread and its
   result has to come back. Everything here is a piece of that round trip.
   ========================================================================== */

const coroutinesFundamentalsModule = {
    id: 'coroutines-fundamentals',
    trackId: 'async',
    order: 8,
    title: 'Coroutines Fundamentals',
    tagline: 'Suspend, don’t block.',
    estimatedMinutes: 35,
    prerequisites: ['android-threading-model'],
    docHub: {
        title: 'Kotlin coroutines on Android',
        path: '/kotlin/coroutines'
    },

    chapters: [
        {
            id: 'suspend-and-continuation',
            title: 'suspend, and what the compiler does with it',
            importance: 'must-know',
            summary: 'A suspend function can pause and resume without holding a thread, because the compiler rewrites it into a state machine.',
            interviewAngle: 'Starts as "what is a suspend function?" and gets interesting at "how does it actually work?" — naming Continuation and the state machine is what separates a user from someone who understands it.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The previous module left us with a problem: a thread that waits is a thread that is occupied but doing nothing, and threads are expensive enough that you cannot have many of them. Coroutines solve it by making waiting free — a coroutine that is waiting is not sitting on a thread at all.</p>'
                },
                {
                    type: 'definition',
                    term: 'suspend',
                    important: true,
                    html: '<p>A function modifier marking a function that may <strong>suspend</strong>: pause at a well-defined point, release the thread it was running on, and resume later — possibly on a different thread. It can only be called from another suspend function or from inside a coroutine.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The word that matters is <em>release</em>. A blocking call keeps its thread and does nothing with it. A suspending call hands the thread back so it can run something else, and arranges to be resumed when its result is ready.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Blocking versus suspending',
                    left: 'Blocking',
                    right: 'Suspending',
                    rows: [
                        { aspect: 'The thread', left: 'Held for the whole wait', right: 'Released immediately' },
                        { aspect: 'Cost of waiting', left: 'One thread per concurrent wait', right: 'One object per concurrent wait' },
                        { aspect: 'Example', left: '<code>Thread.sleep(1000)</code>', right: '<code>delay(1000)</code>' },
                        { aspect: 'Callable from', left: 'Anywhere', right: 'A coroutine or another suspend function' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>How does a function pause halfway through and come back later? The compiler transforms it. Every suspend function secretly takes an extra parameter — a <code>Continuation</code>, which is the callback representing "the rest of this function".</p>'
                },
                {
                    type: 'definition',
                    term: 'Continuation',
                    html: '<p>An interface carrying the state of a suspended computation and a <code>resumeWith(Result)</code> method to continue it. This is the mechanism behind <strong>CPS</strong> (Continuation-Passing Style) — the compiler’s name for rewriting sequential code into callbacks you never have to see.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'What you write, and what the compiler produces',
                    code: `// What you write
suspend fun loadUser(id: String): User {
    val profile = api.fetchProfile(id)   // suspension point 1
    val avatar  = api.fetchAvatar(id)    // suspension point 2
    return User(profile, avatar)
}

// Roughly what the compiler emits — a state machine with a hidden
// Continuation parameter. Each suspension point becomes a label.
fun loadUser(id: String, cont: Continuation<User>): Any? {
    val sm = cont as? LoadUserStateMachine ?: LoadUserStateMachine(cont)
    when (sm.label) {
        0 -> { sm.label = 1; return api.fetchProfile(id, sm) }
        1 -> { sm.profile = sm.result; sm.label = 2; return api.fetchAvatar(id, sm) }
        2 -> return User(sm.profile, sm.result)
    }
}`,
                    notes: 'You never write this. The point is that suspension is a compile-time transform, not a thread trick — which is why coroutines need no runtime magic and no special VM support.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Marking a function <code>suspend</code> does <strong>not</strong> make it non-blocking. If the body calls blocking I/O directly, it blocks whatever thread it is on — it has simply become a blocking function you are allowed to call from a coroutine. Moving the work is <code>withContext</code>’s job, not the modifier’s.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Lead with <em>"suspend, don’t block"</em>, then explain that the compiler turns each suspension point into a state in a state machine and passes a <code>Continuation</code> to resume it. That is the whole answer in two sentences.</p>'
                }
            ],
            docs: [
                { title: 'Coroutines basics', url: 'https://kotlinlang.org/docs/coroutines-basics.html', kind: 'guide' },
                { title: 'Kotlin coroutines on Android', path: '/kotlin/coroutines', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-suspend-function' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-what-are-they' },
                { topicId: 'kotlin', questionId: 'kotlin-suspending-vs-blocking' },
                { topicId: 'kotlin', questionId: 'kotlin-thread-sleep-vs-delay' }
            ]
        },

        {
            id: 'builders',
            title: 'Coroutine builders — launch, async, runBlocking',
            importance: 'must-know',
            summary: 'Builders are the bridge from normal code into a coroutine; which one you pick is decided by whether you need a result.',
            interviewAngle: 'The launch-versus-async comparison is close to guaranteed. The good follow-up is how exceptions differ between them.',
            buildsOn: ['suspend-and-continuation'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Suspend functions can only be called from a coroutine, which raises the obvious question of how the first one starts. <strong>Coroutine builders</strong> are the bridge: ordinary functions you can call from ordinary code that start a coroutine and return a handle to it.</p>'
                },
                {
                    type: 'types',
                    title: 'The three builders',
                    items: [
                        {
                            name: 'launch',
                            html: '<p>Starts a coroutine and returns a <code>Job</code>. Fire-and-forget: it produces no value, and an exception inside it propagates <strong>immediately</strong> to the parent.</p>',
                            whenToUse: 'the coroutine performs a side effect — update UI state, write to a database, send analytics'
                        },
                        {
                            name: 'async',
                            html: '<p>Starts a coroutine and returns a <code>Deferred&lt;T&gt;</code>, a <code>Job</code> that also carries a result. The value is retrieved with <code>await()</code>, and an exception is <strong>stored</strong> in the <code>Deferred</code> and rethrown at the <code>await()</code> call.</p>',
                            whenToUse: 'you need a value back, and especially when two or more pieces of work should run concurrently'
                        },
                        {
                            name: 'runBlocking',
                            html: '<p>Bridges blocking and suspending worlds by <em>blocking</em> the current thread until its body completes. Belongs in <code>main()</code> functions and tests, not in Android app code.</p>',
                            whenToUse: 'a test, or the entry point of a JVM program — never on the main thread of an app'
                        }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'launch versus async',
                    left: 'launch',
                    right: 'async',
                    rows: [
                        { aspect: 'Returns', left: '<code>Job</code>', right: '<code>Deferred&lt;T&gt;</code>' },
                        { aspect: 'Result', left: 'None', right: 'Via <code>await()</code>' },
                        { aspect: 'On failure', left: 'Propagates to the parent at once', right: 'Held until <code>await()</code> is called' },
                        { aspect: 'Typical use', left: 'Side effects', right: 'Concurrent work you need values from' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Two calls concurrently, then combined',
                    code: `viewModelScope.launch {                 // side effect: updates UI state
    val profile = async { api.fetchProfile(id) }   // both start now
    val orders  = async { api.fetchOrders(id) }

    // Suspends until both are done; total time is the slower of the two,
    // not the sum.
    _uiState.value = Loaded(profile.await(), orders.await())
}`,
                    notes: 'Calling <code>await()</code> immediately after each <code>async</code> would make them sequential again — start both, then await both.'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>runBlocking</code> on the main thread is the fastest way to write an ANR. It blocks the very thread that coroutines exist to keep free — and because the code inside still <em>looks</em> asynchronous, the mistake reads as correct.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>"<code>launch</code> = do it. <code>async</code> = do it and give me the answer." Then add the exception difference, which is the half most candidates leave out.</p>'
                }
            ],
            docs: [
                { title: 'Composing suspending functions', url: 'https://kotlinlang.org/docs/composing-suspending-functions.html', kind: 'guide' },
                { title: 'Coroutines basics', url: 'https://kotlinlang.org/docs/coroutines-basics.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-launch-vs-async' },
                { topicId: 'kotlin', questionId: 'kotlin-runblocking' },
                { topicId: 'kotlin', questionId: 'kotlin-coroutines-series-parallel' },
                { topicId: 'kotlin', questionId: 'kotlin-combine-coroutine-results' }
            ]
        },

        {
            id: 'withcontext',
            title: 'withContext',
            importance: 'must-know',
            summary: 'Switches dispatcher for a block, suspends until it finishes, and returns to where it started — without creating a coroutine.',
            interviewAngle: '"When would you use withContext instead of async?" The answer is about concurrency, not about threads.',
            buildsOn: ['builders'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p><code>withContext</code> runs a block in a different <code>CoroutineContext</code> — almost always a different dispatcher — suspends the caller until the block returns, and then resumes the caller in its original context. It creates <strong>no new coroutine</strong>; it moves the existing one.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The idiomatic shape of a repository function',
                    code: `class UserRepository(private val dao: UserDao) {

    // The caller does not need to know this touches disk. Making the
    // function main-safe is the callee's job, not the caller's.
    suspend fun getUser(id: String): User = withContext(Dispatchers.IO) {
        dao.findById(id)
    }
}

// Called from the main thread; never blocks it.
viewModelScope.launch {
    val user = repository.getUser("42")
    _uiState.value = Loaded(user)      // back on Main automatically
}`,
                    notes: 'This is the <strong>main-safety</strong> convention: a suspend function is safe to call from any dispatcher, because it moves its own work.'
                },
                {
                    type: 'comparison',
                    title: 'withContext versus async + await',
                    left: 'withContext',
                    right: 'async { }.await()',
                    rows: [
                        { aspect: 'Coroutines created', left: 'None', right: 'One' },
                        { aspect: 'Execution', left: 'Sequential — caller waits', right: 'Concurrent, if you await later' },
                        { aspect: 'Allocation', left: 'Cheaper', right: 'Extra <code>Deferred</code>' },
                        { aspect: 'Right for', left: 'One context switch', right: 'Two or more things at once' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p><code>async { }.await()</code> back to back is <em>not</em> concurrent — it is <code>withContext</code> with extra allocation. Concurrency comes from starting both before awaiting either.</p>'
                }
            ],
            docs: [
                { title: 'Coroutine context and dispatchers', url: 'https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html', kind: 'guide' },
                { title: 'Improve app performance with Kotlin coroutines', path: '/kotlin/coroutines/coroutines-adv', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-withcontext' }
            ]
        },

        {
            id: 'coroutine-context',
            title: 'CoroutineContext and its elements',
            importance: 'must-know',
            summary: 'A coroutine carries an immutable set of elements — Job, dispatcher, name and exception handler — combined with +.',
            interviewAngle: 'Asked directly, and it is the concept that makes the scope and cancellation answers coherent rather than memorised.',
            buildsOn: ['withcontext'],
            blocks: [
                {
                    type: 'definition',
                    term: 'CoroutineContext',
                    important: true,
                    html: '<p>An immutable, indexed set of elements carried by every coroutine, behaving like a map keyed by element type. Elements combine with the <code>+</code> operator; a child inherits its parent’s context and may override individual elements.</p>'
                },
                {
                    type: 'types',
                    title: 'The four elements worth naming',
                    items: [
                        { name: 'Job', html: '<p>The coroutine’s handle and lifecycle — its state, its parent, its children, and the thing you cancel.</p>' },
                        { name: 'CoroutineDispatcher', html: '<p>Decides which thread or pool the coroutine runs and resumes on.</p>' },
                        { name: 'CoroutineName', html: '<p>A label used in debug output. Free, and worth setting on long-lived coroutines.</p>' },
                        { name: 'CoroutineExceptionHandler', html: '<p>The last-resort handler for uncaught exceptions. Only fires in a root coroutine, which is the detail interviewers probe.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Composing and inheriting context',
                    code: `val handler = CoroutineExceptionHandler { _, e -> Log.e("app", "failed", e) }

val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default + handler)

scope.launch(CoroutineName("sync")) {
    // Context here is: the scope's SupervisorJob (as this coroutine's parent),
    // Dispatchers.Default, the handler, and CoroutineName("sync").

    withContext(Dispatchers.IO) {
        // Same Job and handler; only the dispatcher is replaced.
    }
}`,
                    notes: 'A child always inherits the parent context and replaces only what it is given — which is why <code>withContext(Dispatchers.IO)</code> changes the thread without detaching the coroutine from its parent.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Passing a <code>Job</code> into <code>launch(...)</code> replaces the parent, quietly breaking the structured-concurrency relationship — the new coroutine is no longer a child of the scope and will not be cancelled with it.</p>'
                }
            ],
            docs: [
                { title: 'Coroutine context and dispatchers', url: 'https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html', kind: 'guide' },
                { title: 'CoroutineContext', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-context' },
                { topicId: 'kotlin', questionId: 'kotlin-coroutine-context' }
            ]
        },

        {
            id: 'dispatchers',
            title: 'Dispatchers',
            importance: 'must-know',
            summary: 'Main for UI, IO for blocking calls, Default for CPU work — and the reason the split exists is thread count.',
            interviewAngle: '"What is the difference between IO and Default?" The weak answer is "one is for IO". The strong one is about pool sizing.',
            buildsOn: ['coroutine-context'],
            blocks: [
                {
                    type: 'definition',
                    term: 'CoroutineDispatcher',
                    html: '<p>The context element that decides which thread a coroutine runs on and resumes on. Dispatching is per-resumption, not per-coroutine — that is how a coroutine can start on one thread and continue on another.</p>'
                },
                {
                    type: 'types',
                    title: 'The dispatchers',
                    items: [
                        { name: 'Dispatchers.Main', html: '<p>The Android UI thread. Required for touching views and UI state.</p>', whenToUse: 'updating UI, and any short non-blocking work' },
                        { name: 'Dispatchers.Main.immediate', html: '<p>Runs inline if already on the main thread instead of scheduling. Avoids a frame of latency when emitting UI state.</p>' },
                        { name: 'Dispatchers.IO', html: '<p>A large elastic pool — 64 threads by default, or the core count if higher. Sized for threads that will sit <em>blocked</em> on network or disk.</p>', whenToUse: 'network calls, file and database access, anything that blocks' },
                        { name: 'Dispatchers.Default', html: '<p>Sized to the number of CPU cores. More threads than cores would not make CPU-bound work finish sooner.</p>', whenToUse: 'sorting large lists, parsing, image processing, JSON work' },
                        { name: 'Dispatchers.Unconfined', html: '<p>Resumes on whichever thread completed the suspension. Rarely correct in app code; useful in some tests.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The reason for two background dispatchers is the whole answer to the common question. Blocking work wants <em>many</em> threads, because each one spends its time idle waiting on I/O and adding more increases throughput. CPU work wants <em>few</em> — exactly as many as there are cores — because extra threads only add context switching.</p><p>They share the same underlying thread pool and differ in how many of its threads each may use, which is why moving between them is cheap and usually does not involve an actual thread switch.</p>'
                },
                {
                    type: 'table',
                    title: 'Choosing one',
                    headers: ['Work', 'Dispatcher', 'Why'],
                    rows: [
                        ['Update UI state', '<code>Main</code>', 'Only this thread may touch views'],
                        ['Retrofit / OkHttp call', '<code>IO</code>', 'Blocks on the network'],
                        ['Room query', '<code>IO</code>', 'Blocks on disk'],
                        ['Sort 10k items', '<code>Default</code>', 'CPU-bound, wants core-count parallelism'],
                        ['Parse a large JSON string', '<code>Default</code>', 'CPU-bound'],
                        ['Bitmap decode', '<code>Default</code>', 'CPU-bound']
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Suspend functions from well-behaved libraries are already main-safe — Retrofit’s <code>suspend</code> functions and Room’s <code>suspend</code> DAOs move their own work. Wrapping them in <code>withContext(Dispatchers.IO)</code> is a harmless no-op that signals you have not read their contract.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Inject dispatchers rather than referencing <code>Dispatchers.IO</code> directly. It costs one constructor parameter and makes the class testable — which is what module 40 is about.</p>'
                }
            ],
            docs: [
                { title: 'Coroutine context and dispatchers', url: 'https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html', kind: 'guide' },
                { title: 'Kotlin coroutines on Android', path: '/kotlin/coroutines', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-dispatchers' }
            ]
        },

        {
            id: 'scopes',
            title: 'CoroutineScope and the lifecycle-aware scopes',
            importance: 'must-know',
            summary: 'A scope binds coroutines to a lifetime; cancelling the scope cancels everything launched in it.',
            interviewAngle: '"Why not GlobalScope?" and "what happens to a running coroutine when the ViewModel is cleared?" are the same question.',
            buildsOn: ['coroutine-context'],
            blocks: [
                {
                    type: 'definition',
                    term: 'CoroutineScope',
                    important: true,
                    html: '<p>An object holding a <code>CoroutineContext</code> whose <code>Job</code> becomes the parent of everything launched in it. <code>launch</code> and <code>async</code> are extension functions on <code>CoroutineScope</code>, so a coroutine can never be started without one.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The scope answers the question a raw thread could never answer: <em>when should this work stop?</em> Cancelling the scope’s <code>Job</code> cancels every coroutine started in it. Android supplies scopes already tied to the right lifetimes, so app code rarely constructs one.</p>'
                },
                {
                    type: 'types',
                    title: 'The scopes you should know',
                    items: [
                        { name: 'viewModelScope', html: '<p>Cancelled when the <code>ViewModel</code> is cleared. The default home for work whose result belongs to a screen’s state.</p>', whenToUse: 'almost all UI-driven work' },
                        { name: 'lifecycleScope', html: '<p>Tied to an Activity or Fragment lifecycle. Pair it with <code>repeatOnLifecycle</code> to also stop collecting while the screen is in the background.</p>', whenToUse: 'work bound to a view, not to state that survives rotation' },
                        { name: 'GlobalScope', html: '<p>Lives as long as the process, so nothing cancels it. Marked as a delicate API.</p>', whenToUse: 'essentially never in app code — a coroutine nobody can cancel is a leak with extra steps' },
                        { name: 'CoroutineScope(...)', html: '<p>A scope you own and must cancel yourself. Correct in a long-lived singleton such as a repository that genuinely outlives any screen.</p>', whenToUse: 'you have a clear owner with a defined teardown point' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Scoping to the right lifetime',
                    code: `class UserViewModel(private val repo: UserRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun load(id: String) {
        // Cancelled automatically when the ViewModel is cleared — rotate the
        // screen and this does not leak or double-run.
        viewModelScope.launch {
            _uiState.value = runCatching { repo.getUser(id) }
                .fold(UiState::Loaded, UiState::Error)
        }
    }
}`
                },
                {
                    type: 'pitfall',
                    html: '<p><code>GlobalScope.launch</code> inside an Activity keeps running after the screen is gone, holds anything it captured, and will happily deliver a result to a destroyed view. It is the coroutine equivalent of the leaked <code>AsyncTask</code> that coroutines were meant to end.</p>'
                },
                {
                    type: 'diagram',
                    diagramType: 'flowchart',
                    diagramConfig: {
                        title: 'Scope decides the lifetime',
                        columns: 3,
                        nodes: [
                            { label: 'ViewModel created', type: 'terminal' },
                            { label: 'viewModelScope.launch' },
                            { label: 'Work in progress' },
                            { label: 'onCleared()', type: 'decision' },
                            { label: 'Scope cancelled' },
                            { label: 'Children cancelled', type: 'terminal' }
                        ],
                        connections: [
                            { from: 0, to: 1 },
                            { from: 1, to: 2 },
                            { from: 2, to: 3 },
                            { from: 3, to: 4, label: 'yes' },
                            { from: 4, to: 5 }
                        ]
                    }
                }
            ],
            docs: [
                { title: 'Use Kotlin coroutines with lifecycle-aware components', path: '/topic/libraries/architecture/coroutines', kind: 'guide' },
                { title: 'Kotlin coroutines on Android', path: '/kotlin/coroutines', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-scope' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-lifecycle-scopes' },
                { topicId: 'kotlin', questionId: 'kotlin-coroutine-scopes-android' }
            ]
        }
    ]
};
