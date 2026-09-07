/* ==========================================================================
   M10 — Flow fundamentals.

   A suspend function returns one value. This module is what happens when the
   answer arrives more than once.
   ========================================================================== */

const flowFundamentalsModule = {
    id: 'flow-fundamentals',
    trackId: 'async',
    order: 10,
    title: 'Flow Fundamentals',
    tagline: 'A suspend function returns once. A Flow keeps answering.',
    estimatedMinutes: 30,
    prerequisites: ['coroutines-fundamentals', 'structured-concurrency'],
    docHub: {
        title: 'Kotlin flows on Android',
        path: '/kotlin/flow'
    },

    chapters: [
        {
            id: 'what-a-flow-is',
            title: 'What a Flow is',
            importance: 'must-know',
            summary: 'A cold asynchronous stream: nothing runs until something collects it, and each collector gets its own run.',
            interviewAngle: 'Almost always opens with cold versus hot. Getting "cold" right — the producer restarts per collector — is the whole first half of the answer.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A suspend function produces a single value and returns. Plenty of things produce many values over time — database rows that change, location updates, keystrokes in a search box. <code>Flow</code> is the type for those.</p>'
                },
                {
                    type: 'definition',
                    term: 'Flow',
                    important: true,
                    html: '<p>A <strong>cold asynchronous stream</strong> that emits values sequentially and completes normally or with an exception. Cold means the producer block does not run until a terminal operator collects it, and it runs again, from the start, for every collector.</p>'
                },
                {
                    type: 'types',
                    title: 'The three parts of a flow',
                    items: [
                        { name: 'Builder', html: '<p>Creates the flow and produces values — <code>flow { }</code>, <code>flowOf</code>, <code>asFlow</code>, <code>callbackFlow</code>, <code>channelFlow</code>.</p>' },
                        { name: 'Intermediate operator', html: '<p>Describes a transformation and returns a new flow. Lazy: declaring <code>map</code> runs nothing.</p>' },
                        { name: 'Terminal operator', html: '<p>Starts the whole thing and consumes it — <code>collect</code>, <code>first</code>, <code>toList</code>, <code>launchIn</code>. Suspending, so it needs a coroutine.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Nothing happens until collect',
                    code: `val numbers: Flow<Int> = flow {
    println("producer starts")     // does not print here
    repeat(3) { emit(it); delay(100) }
}

val doubled = numbers.map { it * 2 }   // still nothing has run

viewModelScope.launch {
    doubled.collect { println(it) }    // now the producer runs: 0, 2, 4
    doubled.collect { println(it) }    // and runs again, from scratch
}`,
                    notes: 'Two collections mean two independent runs. That is what "cold" buys you — and what makes it the wrong default for something like a shared UI state.'
                },
                {
                    type: 'comparison',
                    title: 'Cold versus hot',
                    left: 'Cold (Flow)',
                    right: 'Hot (StateFlow, SharedFlow)',
                    rows: [
                        { aspect: 'Starts when', left: 'Collected', right: 'Created' },
                        { aspect: 'Per collector', left: 'A fresh, independent run', right: 'Shared — everyone sees the same emissions' },
                        { aspect: 'Without collectors', left: 'Does nothing', right: 'Still active' },
                        { aspect: 'Suits', left: 'A request, a query, a one-off stream', right: 'State and events shared by a screen' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Flows respect structured concurrency: collection happens inside a coroutine, so cancelling that coroutine stops the producer. There is no separate subscription object to dispose, which is the main ergonomic difference from RxJava.</p>'
                }
            ],
            docs: [
                { title: 'Asynchronous Flow', url: 'https://kotlinlang.org/docs/flow.html', kind: 'guide' },
                { title: 'Kotlin flows on Android', path: '/kotlin/flow', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-what-is-flow' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-cold-vs-hot' }
            ]
        },

        {
            id: 'builders-and-terminals',
            title: 'Builders and terminal operators',
            importance: 'must-know',
            summary: 'How a flow is created, and how it is started.',
            interviewAngle: '"How would you turn this callback listener into a Flow?" — callbackFlow is the expected answer, with awaitClose as the detail.',
            buildsOn: ['what-a-flow-is'],
            blocks: [
                {
                    type: 'types',
                    title: 'Builders',
                    items: [
                        { name: 'flow { emit(x) }', html: '<p>The general builder. The block is suspending, so it can call other suspend functions between emissions.</p>', whenToUse: 'you are producing values yourself' },
                        { name: 'flowOf(a, b, c)', html: '<p>A fixed set of values.</p>' },
                        { name: 'Iterable.asFlow()', html: '<p>Turns a collection or sequence into a flow.</p>' },
                        { name: 'callbackFlow { }', html: '<p>Wraps a callback API that fires repeatedly. Emits with <code>trySend</code>, and <strong>must</strong> end in <code>awaitClose</code>, which keeps the flow alive and unregisters the callback on cancellation.</p>', whenToUse: 'a listener API — location, sensors, Firebase, a text watcher' },
                        { name: 'channelFlow { }', html: '<p>Like <code>callbackFlow</code> but for producing concurrently from several coroutines. <code>callbackFlow</code> is a specialisation of it.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A listener as a flow',
                    code: `fun LocationClient.locations(): Flow<Location> = callbackFlow {
    val callback = object : LocationCallback() {
        override fun onLocation(location: Location) {
            trySend(location)          // never suspends; drops if the buffer is full
        }
    }
    requestUpdates(callback)

    // Suspends until the collector goes away, then cleans up. Omitting this
    // closes the flow immediately and the callback leaks.
    awaitClose { removeUpdates(callback) }
}`,
                    notes: '<code>callbackFlow</code> is the multi-value counterpart to <code>suspendCancellableCoroutine</code> from M9 — use that for a callback that fires once, this for one that fires repeatedly.'
                },
                {
                    type: 'types',
                    title: 'Terminal operators',
                    items: [
                        { name: 'collect { }', html: '<p>The fundamental one. Suspends until the flow completes.</p>' },
                        { name: 'first() / firstOrNull()', html: '<p>Takes one value and cancels the flow.</p>' },
                        { name: 'toList() / toSet()', html: '<p>Collects everything into a collection. Only for finite flows.</p>' },
                        { name: 'launchIn(scope)', html: '<p>Shorthand for <code>scope.launch { onEach { … }.collect() }</code>. Returns a <code>Job</code> rather than suspending.</p>', whenToUse: 'you want to start collection without suspending the caller' },
                        { name: 'stateIn / shareIn', html: '<p>Convert a cold flow into a hot one. Covered in M11.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Forgetting <code>awaitClose</code> in a <code>callbackFlow</code> is a compile-time error in recent versions, but the subtler bug is doing cleanup <em>outside</em> it — the block only runs when the collector is gone, which is exactly when unregistering is correct.</p>'
                }
            ],
            docs: [
                { title: 'Asynchronous Flow', url: 'https://kotlinlang.org/docs/flow.html', kind: 'guide' },
                { title: 'callbackFlow', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/callback-flow.html', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-builders' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-terminal-operators' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-callbackflow' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-channelflow' }
            ]
        },

        {
            id: 'operators',
            title: 'Intermediate operators',
            importance: 'must-know',
            summary: 'Transform, filter, combine and flatten — all lazy, all returning a new flow.',
            interviewAngle: 'The flatMap family is the discriminating question, and instant search is the worked example interviewers reach for.',
            buildsOn: ['builders-and-terminals'],
            blocks: [
                {
                    type: 'table',
                    title: 'The operators worth knowing by name',
                    headers: ['Operator', 'Does'],
                    rows: [
                        ['<code>map</code>', 'Transforms each value'],
                        ['<code>filter</code>', 'Drops values failing a predicate'],
                        ['<code>transform</code>', 'Emits any number of values per input — the general case'],
                        ['<code>onEach</code>', 'Side effect, passes the value through'],
                        ['<code>debounce(ms)</code>', 'Waits for a quiet period before emitting the latest'],
                        ['<code>distinctUntilChanged</code>', 'Drops consecutive duplicates'],
                        ['<code>take(n)</code> / <code>drop(n)</code>', 'Truncates the stream'],
                        ['<code>zip</code>', 'Pairs values from two flows one for one'],
                        ['<code>combine</code>', 'Emits whenever <em>either</em> flow emits, using both latest values'],
                        ['<code>merge</code>', 'Interleaves several flows into one']
                    ]
                },
                {
                    type: 'types',
                    title: 'The flatMap family — the one that gets asked',
                    items: [
                        { name: 'flatMapConcat', html: '<p>Waits for each inner flow to finish before starting the next. Order preserved, no concurrency.</p>', whenToUse: 'order matters and requests must not overlap' },
                        { name: 'flatMapMerge', html: '<p>Runs inner flows concurrently and interleaves results. Fastest, order not guaranteed.</p>', whenToUse: 'independent requests where order does not matter' },
                        { name: 'flatMapLatest', html: '<p>Cancels the previous inner flow as soon as a new value arrives. Only the newest survives.</p>', whenToUse: 'search-as-you-type, or any case where a stale result is worthless' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Instant search — four operators doing the work',
                    code: `val results: Flow<List<Item>> = queryFlow
    .debounce(300)                  // wait for a pause in typing
    .filter { it.length >= 2 }      // ignore one-character noise
    .distinctUntilChanged()         // ignore re-emissions of the same query
    .flatMapLatest { query ->       // cancel the in-flight search
        repository.search(query)
    }
    .flowOn(Dispatchers.IO)`,
                    notes: 'This is the canonical whiteboard answer for "implement search-as-you-type". Each operator maps to a requirement you can name out loud.'
                },
                {
                    type: 'definition',
                    term: 'flowOn',
                    important: true,
                    html: '<p>Changes the dispatcher for everything <strong>upstream</strong> of it, leaving the collector where it was. Flows preserve context: a flow cannot change the context its collector runs in, so emission must be moved from the producer side.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Calling <code>withContext(Dispatchers.IO)</code> around an <code>emit</code> throws <code>IllegalStateException: Flow invariant is violated</code>. Emitting from a different context than the one the flow was collected in is forbidden — that is exactly what <code>flowOn</code> exists to do safely.</p>'
                },
                {
                    type: 'types',
                    title: 'Buffering and back-pressure',
                    items: [
                        { name: 'buffer()', html: '<p>Lets the producer run ahead of a slow collector, into a buffer.</p>' },
                        { name: 'conflate()', html: '<p>Keeps only the latest value; intermediate ones are dropped.</p>', whenToUse: 'UI state, where a skipped intermediate frame does not matter' },
                        { name: 'collectLatest { }', html: '<p>Cancels the previous collector body when a new value arrives.</p>', whenToUse: 'the collector itself is slow and only the latest matters' }
                    ]
                }
            ],
            docs: [
                { title: 'Asynchronous Flow', url: 'https://kotlinlang.org/docs/flow.html', kind: 'guide' },
                { title: 'Kotlin flows on Android', path: '/kotlin/flow', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-common-operators' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-flowon' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-instant-search' },
                { topicId: 'kotlin', questionId: 'kotlin-flatmap-operators' },
                { topicId: 'kotlin', questionId: 'kotlin-collect-vs-collectlatest' }
            ]
        },

        {
            id: 'errors-and-completion',
            title: 'Errors, retries and completion',
            importance: 'should-know',
            summary: 'catch handles upstream failures only, and it must sit downstream of what it protects.',
            interviewAngle: '"Where do you put catch?" — placement is the whole question, because it only sees what is above it.',
            buildsOn: ['operators'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Flow error handling follows one rule: <strong>an operator only sees what is upstream of it</strong>. <code>catch</code> placed before a <code>map</code> will not catch anything the <code>map</code> throws.</p>'
                },
                {
                    type: 'types',
                    title: 'The operators',
                    items: [
                        { name: 'catch { }', html: '<p>Catches exceptions from upstream. Can emit a fallback value, log, or rethrow. Never catches downstream failures, including those from the collector itself.</p>' },
                        { name: 'retry(n) / retryWhen', html: '<p>Resubscribes upstream on failure. <code>retryWhen</code> gives the attempt count so you can back off.</p>' },
                        { name: 'onCompletion { }', html: '<p>Runs on completion whether it succeeded, failed or was cancelled. The nullable cause tells you which.</p>', whenToUse: 'hiding a loading spinner regardless of outcome' },
                        { name: 'onStart { }', html: '<p>Runs before the first emission. Often used to emit a loading state.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A repository stream with retry and fallback',
                    code: `fun items(): Flow<UiState> = repository.observeItems()
    .map<List<Item>, UiState> { UiState.Loaded(it) }
    .onStart { emit(UiState.Loading) }
    .retryWhen { cause, attempt ->
        // Retry transient network failures up to three times, backing off.
        if (cause is IOException && attempt < 3) {
            delay(1000 * (attempt + 1))
            true
        } else {
            false
        }
    }
    .catch { emit(UiState.Error(it)) }   // last, so it sees everything above
    .flowOn(Dispatchers.IO)`,
                    notes: '<code>catch</code> comes last among the transformations for exactly the reason above. Putting it first would leave the <code>map</code> unprotected.'
                },
                {
                    type: 'pitfall',
                    html: '<p>A try/catch wrapped around the body of a <code>flow { }</code> builder can swallow the <code>CancellationException</code> used to stop collection — the same trap as M9, in a new place. Prefer the <code>catch</code> operator, which knows to leave cancellation alone.</p>'
                }
            ],
            docs: [
                { title: 'Asynchronous Flow', url: 'https://kotlinlang.org/docs/flow.html', kind: 'guide' },
                { title: 'catch', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/catch.html', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-exception-handling' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-retry-operator' }
            ]
        }
    ]
};
