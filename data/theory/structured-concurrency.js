/* ==========================================================================
   M9 — Structured concurrency, cancellation and exceptions.

   The three subjects are one module because they are one mechanism: the
   parent/child job tree explains cancellation, and cancellation explains why
   exceptions travel the way they do.
   ========================================================================== */

const structuredConcurrencyModule = {
    id: 'structured-concurrency',
    trackId: 'async',
    order: 9,
    title: 'Structured Concurrency',
    tagline: 'A parent does not finish before its children.',
    estimatedMinutes: 30,
    prerequisites: ['coroutines-fundamentals'],
    docHub: {
        title: 'Coroutine exceptions handling',
        url: 'https://kotlinlang.org/docs/exception-handling.html'
    },

    chapters: [
        {
            id: 'the-job-tree',
            title: 'Jobs form a tree',
            importance: 'must-know',
            summary: 'Every coroutine has a Job with a parent and children, and that tree is what makes concurrency structured.',
            interviewAngle: 'Underpins every other answer in this module. Asked directly as "what is a Job?" and implicitly whenever cancellation comes up.',
            buildsOn: [],
            blocks: [
                {
                    type: 'definition',
                    term: 'Job',
                    important: true,
                    html: '<p>The handle to a coroutine’s lifecycle: its state, its parent, its children, and the thing you call <code>cancel()</code> on. Launching a coroutine inside another automatically makes the new <code>Job</code> a <strong>child</strong> of the enclosing one.</p>'
                },
                {
                    type: 'definition',
                    term: 'Structured concurrency',
                    important: true,
                    html: '<p>The guarantee that a coroutine cannot outlive the scope that started it. A parent waits for its children before completing, cancellation flows down the tree, and no coroutine is ever orphaned.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>This is the property that separates coroutines from threads. A thread you start is on its own — nothing tracks it, nothing cancels it, and nobody waits for it. A coroutine is always attached to a parent, which gives three guarantees for free:</p><ol><li>A parent does not complete until every child has completed.</li><li>Cancelling a parent cancels every child.</li><li>A failing child, by default, cancels its parent and therefore its siblings.</li></ol><p>The third is the surprising one, and the next chapter is about when you want it and when you do not.</p>'
                },
                {
                    type: 'table',
                    title: 'Job states',
                    headers: ['State', 'isActive', 'isCompleted', 'isCancelled'],
                    rows: [
                        ['New (lazy start)', 'false', 'false', 'false'],
                        ['Active', 'true', 'false', 'false'],
                        ['Completing', 'true', 'false', 'false'],
                        ['Cancelling', 'false', 'false', 'true'],
                        ['Cancelled', 'false', 'true', 'true'],
                        ['Completed', 'false', 'true', 'false']
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>A cancelled job reports <code>isCompleted == true</code>. "Completed" means "finished", not "succeeded" — check <code>isCancelled</code> if you need to distinguish them.</p>'
                }
            ],
            docs: [
                { title: 'Cancellation and timeouts', url: 'https://kotlinlang.org/docs/cancellation-and-timeouts.html', kind: 'guide' },
                { title: 'Job', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-coroutine-job' },
                { topicId: 'kotlin', questionId: 'kotlin-structured-concurrency' }
            ]
        },

        {
            id: 'scope-vs-supervisor',
            title: 'coroutineScope vs supervisorScope',
            importance: 'must-know',
            summary: 'Both wait for their children; they differ in whether one child failing takes down its siblings.',
            interviewAngle: 'A reliable question because the answer is a single sentence about failure propagation, and most candidates only know half of it.',
            buildsOn: ['the-job-tree'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Both are suspending functions that create a child scope and wait for everything launched inside to finish. The only difference is the kind of <code>Job</code> they install, and therefore what a child’s failure does to its siblings.</p>'
                },
                {
                    type: 'comparison',
                    title: 'The difference in one table',
                    left: 'coroutineScope',
                    right: 'supervisorScope',
                    rows: [
                        { aspect: 'Job type', left: 'Regular <code>Job</code>', right: '<code>SupervisorJob</code>' },
                        { aspect: 'One child fails', left: 'Cancels all siblings, rethrows', right: 'Siblings continue' },
                        { aspect: 'Failure travels', left: 'Up to the parent', right: 'Stops at that child' },
                        { aspect: 'Error handling', left: 'One try/catch around the block', right: 'Per-child try/catch or a handler' },
                        { aspect: 'Right for', left: 'All-or-nothing work', right: 'Independent work' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'All-or-nothing versus independent',
                    code: `// A screen that is useless without both calls: if either fails, abandon
// the other and show an error.
suspend fun loadScreen(id: String): Screen = coroutineScope {
    val user  = async { api.user(id) }
    val feed  = async { api.feed(id) }
    Screen(user.await(), feed.await())
}

// A dashboard of independent widgets: one failing should not blank the
// others, so each handles its own failure.
suspend fun loadWidgets() = supervisorScope {
    launch { runCatching { loadWeather() }.onFailure(::report) }
    launch { runCatching { loadCalendar() }.onFailure(::report) }
    launch { runCatching { loadStocks() }.onFailure(::report) }
}`,
                    notes: 'With <code>supervisorScope</code> the failure no longer reaches the parent, so nothing else will handle it — if you do not catch it per child, it is lost.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Cancellation still flows <strong>downward</strong> through a <code>SupervisorJob</code>. Supervision only changes how a <em>child’s failure</em> travels upward — cancel the parent and every child still dies.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>SupervisorJob()</code> passed to a builder — <code>launch(SupervisorJob())</code> — does nothing useful. Supervision is a property of the <em>parent</em> of the failing coroutines, so it belongs on a scope or on <code>supervisorScope</code>, not on the child.</p>'
                }
            ],
            docs: [
                { title: 'Coroutine exceptions handling', url: 'https://kotlinlang.org/docs/exception-handling.html', kind: 'guide' },
                { title: 'Composing suspending functions', url: 'https://kotlinlang.org/docs/composing-suspending-functions.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-coroutinescope-vs-supervisorscope' }
            ]
        },

        {
            id: 'cancellation',
            title: 'Cancellation is cooperative',
            importance: 'must-know',
            summary: 'Cancelling sets a flag; code that never suspends and never checks will run to completion regardless.',
            interviewAngle: 'Arrives as "you cancelled the job — why is the work still running?" The answer is the word cooperative.',
            buildsOn: ['the-job-tree'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Calling <code>cancel()</code> does not stop anything by force. It moves the <code>Job</code> into a cancelling state and sets a flag. The coroutine stops only when it reaches a point that <em>checks</em> that flag.</p><p>Every suspending function in <code>kotlinx.coroutines</code> checks — <code>delay</code>, <code>withContext</code>, <code>await</code> and the rest all throw <code>CancellationException</code> if the job is no longer active. So ordinary suspending code cancels promptly and you never think about it. A tight CPU loop that never suspends does not check, and runs to the end.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A loop that ignores cancellation, and two fixes',
                    code: `// Ignores cancellation: no suspension point, no check.
launch {
    var i = 0
    while (i < 1_000_000) { crunch(i++) }
}

// Fix 1 — check the flag explicitly.
launch {
    var i = 0
    while (isActive && i < 1_000_000) { crunch(i++) }
}

// Fix 2 — ensureActive() throws, so cancellation surfaces as an exception
// rather than a silent early exit.
launch {
    var i = 0
    while (i < 1_000_000) { ensureActive(); crunch(i++) }
}`
                },
                {
                    type: 'types',
                    title: 'Ways to cooperate',
                    items: [
                        { name: 'isActive', html: '<p>A boolean on the scope. Exits the loop quietly, treating cancellation as a normal finish.</p>' },
                        { name: 'ensureActive()', html: '<p>Throws <code>CancellationException</code> if cancelled. Prefer this when the work is only meaningful complete.</p>' },
                        { name: 'yield()', html: '<p>Checks for cancellation and gives other coroutines a turn. Useful in long loops on a shared dispatcher.</p>' }
                    ]
                },
                {
                    type: 'definition',
                    term: 'CancellationException',
                    important: true,
                    html: '<p>The exception thrown to unwind a cancelled coroutine. It is treated as <strong>normal completion</strong>: the machinery ignores it rather than reporting a failure, and it does not cancel the parent.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>try { … } catch (e: Exception) { … }</code> around suspending code swallows <code>CancellationException</code> too, because it is an <code>Exception</code>. The coroutine then keeps going after being cancelled. Either catch specific types, or rethrow it:</p><p><code>catch (e: CancellationException) { throw e }</code> before the general branch.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Cleanup after cancellation has a related trap. In a <code>finally</code> block the job is already cancelling, so any suspending call there throws immediately. Work that <em>must</em> run — closing a socket, flushing a write — goes inside <code>withContext(NonCancellable)</code>.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Cleanup that must survive cancellation',
                    code: `val job = launch {
    try {
        streamUpdates()
    } finally {
        // Suspending here would throw instantly — the job is cancelling.
        withContext(NonCancellable) {
            connection.closeGracefully()
        }
    }
}

job.cancelAndJoin()   // cancel, then wait for the cleanup to finish`,
                    notes: '<code>cancel()</code> only requests cancellation and returns. <code>cancelAndJoin()</code> waits until the coroutine has actually finished unwinding.'
                }
            ],
            docs: [
                { title: 'Cancellation and timeouts', url: 'https://kotlinlang.org/docs/cancellation-and-timeouts.html', kind: 'guide' },
                { title: 'Cancellation in coroutines', path: '/kotlin/coroutines/coroutines-adv', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-cancellation' },
                { topicId: 'kotlin', questionId: 'kotlin-job-cancel-vs-scope-cancel' },
                { topicId: 'kotlin', questionId: 'kotlin-yield' },
                { topicId: 'kotlin', questionId: 'kotlin-coroutine-timeouts' }
            ]
        },

        {
            id: 'exceptions',
            title: 'How exceptions travel',
            importance: 'must-know',
            summary: 'launch propagates immediately, async holds the failure until await, and a handler only fires at the root.',
            interviewAngle: '"Where do you put a CoroutineExceptionHandler?" is a trick question — most placements never fire.',
            buildsOn: ['scope-vs-supervisor', 'cancellation'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Exception handling is where structured concurrency stops being an abstraction. The rules are short, and they follow from the job tree.</p>'
                },
                {
                    type: 'types',
                    title: 'The rules',
                    items: [
                        { name: 'launch propagates', html: '<p>An uncaught exception cancels the parent immediately, which cancels the siblings, and travels up to the root.</p>' },
                        { name: 'async stores', html: '<p>The exception is kept in the <code>Deferred</code> and rethrown when <code>await()</code> is called. If nobody awaits, a <em>child</em> async still cancels its parent — but a <strong>root</strong> async swallows it entirely until awaited.</p>' },
                        { name: 'CancellationException is special', html: '<p>Ignored by the machinery — it signals normal cancellation, not failure.</p>' },
                        { name: 'The handler is a last resort', html: '<p>A <code>CoroutineExceptionHandler</code> only fires in a <strong>root</strong> coroutine. Installed on a child it is ignored, because the exception is handled by the parent instead.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Where a handler does and does not fire',
                    code: `val handler = CoroutineExceptionHandler { _, e -> Log.e("app", "caught", e) }

val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

// Fires: this launch is a root coroutine of the scope.
scope.launch(handler) { throw IllegalStateException("boom") }

// Does NOT fire: the handler is on a child, so the parent handles the
// failure and the handler is ignored.
scope.launch {
    launch(handler) { throw IllegalStateException("boom") }
}

// try/catch works wherever the exception is actually thrown.
scope.launch {
    try {
        riskyCall()
    } catch (e: CancellationException) {
        throw e                    // never swallow cancellation
    } catch (e: IOException) {
        _uiState.value = UiState.Error(e)
    }
}`
                },
                {
                    type: 'comparison',
                    title: 'Failure in launch versus async',
                    left: 'launch',
                    right: 'async',
                    rows: [
                        { aspect: 'When it surfaces', left: 'Immediately', right: 'At <code>await()</code>' },
                        { aspect: 'Caught by', left: 'Handler, or the parent', right: 'try/catch around <code>await()</code>' },
                        { aspect: 'If never observed', left: 'Still crashes', right: 'Root async: silent until awaited' },
                        { aspect: 'Effect on siblings', left: 'Cancels them, unless supervised', right: 'Same, if it is a child' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The reliable answer: <em>"try/catch where the call is, a handler only at the root, and never swallow <code>CancellationException</code>."</em> Then mention that <code>supervisorScope</code> changes who is responsible, because it stops the failure travelling up.</p>'
                }
            ],
            docs: [
                { title: 'Coroutine exceptions handling', url: 'https://kotlinlang.org/docs/exception-handling.html', kind: 'guide' },
                { title: 'CoroutineExceptionHandler', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-coroutine-exception-handler/', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-exception-handling' },
                { topicId: 'kotlin', questionId: 'kotlin-async-exception-no-await' }
            ]
        },

        {
            id: 'bridging-callbacks',
            title: 'Bridging callback APIs',
            importance: 'should-know',
            summary: 'suspendCancellableCoroutine turns a callback into a suspend function that respects cancellation.',
            interviewAngle: '"How would you wrap this legacy callback API in a coroutine?" — and the expected detail is why the cancellable variant is the right default.',
            buildsOn: ['cancellation'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Plenty of Android APIs still take callbacks. The bridge is a builder that hands you a <code>Continuation</code> to resume when the callback fires.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Which builder',
                    left: 'suspendCoroutine',
                    right: 'suspendCancellableCoroutine',
                    rows: [
                        { aspect: 'Responds to cancellation', left: 'No', right: 'Yes' },
                        { aspect: 'Can release resources', left: 'No hook', right: '<code>invokeOnCancellation</code>' },
                        { aspect: 'Use', left: 'Rarely correct', right: 'The default choice' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Wrapping a callback API',
                    code: `suspend fun awaitLocation(): Location = suspendCancellableCoroutine { cont ->
    val callback = object : LocationCallback() {
        override fun onLocation(result: Location) = cont.resume(result)
        override fun onError(e: Exception)        = cont.resumeWithException(e)
    }

    client.requestLocation(callback)

    // Cancelling the coroutine must also stop the underlying request,
    // otherwise the callback outlives the caller and leaks it.
    cont.invokeOnCancellation { client.removeCallback(callback) }
}`,
                    notes: 'Resume the continuation exactly once. Resuming twice throws <code>IllegalStateException</code>, and callback APIs that fire more than once need <code>callbackFlow</code> instead — which is where the next module starts.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Without <code>invokeOnCancellation</code> the cancelled coroutine stops waiting but the underlying request keeps running, still holding the callback and whatever it captured. The coroutine looks cancelled; the leak is not.</p>'
                }
            ],
            docs: [
                { title: 'suspendCancellableCoroutine', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/suspend-cancellable-coroutine.html', kind: 'api' },
                { title: 'Improve app performance with Kotlin coroutines', path: '/kotlin/coroutines/coroutines-adv', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-suspend-coroutine' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-callback-to-coroutines' }
            ]
        }
    ]
};
