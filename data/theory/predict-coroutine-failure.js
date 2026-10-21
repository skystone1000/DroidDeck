/* ==========================================================================
   M52 — Predict the output: cancellation and exceptions.

   Where M51 asked when a body runs, this asks what happens when it stops early
   or goes wrong. Both are the same underlying question — who is waiting for
   whom — seen from the failure side.

   Every snippet was compiled, run, and then run twice more to confirm its
   output does not vary between runs. A verifier that fails intermittently gets
   switched off, which would cost more than any puzzle here is worth.
   ========================================================================== */

const predictCoroutineFailureModule = {
    id: 'predict-coroutine-failure',
    trackId: 'output',
    order: 52,
    title: 'Cancellation and Exceptions',
    tagline: 'Cancellation is a request, not a stop button.',
    estimatedMinutes: 30,
    prerequisites: ['structured-concurrency', 'predict-coroutine-builders'],
    docHub: {
        title: 'Kotlin coroutines on Android',
        path: '/kotlin/coroutines'
    },

    chapters: [
        {
            id: 'cooperative-cancellation',
            title: 'Cancellation is cooperative',
            importance: 'must-know',
            summary: 'Cancelling a job sets a flag. Code that never checks it, and never suspends, runs to completion regardless.',
            interviewAngle: 'The question is usually "how do you cancel a coroutine?", and the answer that lands is that you cannot — you can only ask, and the coroutine has to be written to listen.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The word <em>cooperative</em> is doing all the work in this chapter. <code>cancel()</code> does not stop anything: it moves the job into a cancelling state, and every suspension point in <code>kotlinx.coroutines</code> checks that state and throws. A coroutine with no suspension points never checks, so nothing happens to it.</p>'
                },
                {
                    type: 'predict',
                    id: 'cancel-does-not-stop-a-cpu-loop',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>The job is cancelled after 150ms, but the loop wants 400ms. How many iterations print?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch(Dispatchers.Default) {
        var i = 0
        while (i < 4) {
            Thread.sleep(100)
            println("still working: \${i++}")
        }
        println("the loop finished on its own")
    }

    delay(150)
    job.cancelAndJoin()
    println("cancelAndJoin returned")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'still working: 0', 'still working: 1',
                            'still working: 2', 'still working: 3',
                            'the loop finished on its own',
                            'cancelAndJoin returned'
                        ],
                        explain: '<p>All four. The cancellation had no effect whatsoever, because there is no suspension point anywhere in the loop for it to act on — <code>Thread.sleep</code> is blocking, not suspending, and blocking calls do not check for cancellation.</p><p><code>cancelAndJoin</code> then does exactly what it says: it requests cancellation and <strong>waits</strong>. So the last line arrives only after the loop it failed to stop has finished on its own.</p>'
                    },
                    distractor: '<p>Expecting one or two iterations. Cancelling a job that never suspends is a no-op, and the <code>join</code> half of <code>cancelAndJoin</code> quietly waits for the whole thing anyway.</p>'
                },
                {
                    type: 'predict',
                    id: 'ensure-active-makes-it-cooperative',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>The same loop with one line added, cancelled after 500ms. How far does it get?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch(Dispatchers.Default) {
        var i = 0
        while (i < 4) {
            ensureActive()
            Thread.sleep(200)
            println("still working: \${i++}")
        }
        println("the loop finished on its own")
    }

    delay(500)
    job.cancelAndJoin()
    println("cancelAndJoin returned")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'still working: 0', 'still working: 1', 'still working: 2',
                            'cancelAndJoin returned'
                        ],
                        explain: '<p>Three iterations, and crucially <strong>no</strong> "finished on its own" line — the loop was stopped rather than allowed to complete. <code>ensureActive()</code> is the whole difference: it throws a <code>CancellationException</code> the moment the job is no longer active, which turns a blocking loop into a cancellable one.</p><p><code>isActive</code> is the same check as a boolean, for when you want to break cleanly rather than throw.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'catching-exception-swallows-cancellation',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>What does the catch block see, and does the coroutine stop?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        try {
            delay(1000)
            println("never reached")
        } catch (e: Exception) {
            println("caught a CancellationException: \${e is CancellationException}")
        }
        println("and the coroutine carried on regardless")
    }

    delay(100)
    job.cancelAndJoin()
    println("done")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'caught a CancellationException: true',
                            'and the coroutine carried on regardless',
                            'done'
                        ],
                        explain: '<p>Cancellation is delivered <em>as an exception</em>, and <code>CancellationException</code> is an <code>Exception</code>. So a bare <code>catch (e: Exception)</code> catches it, swallows it, and the coroutine keeps running past the point it was supposed to stop at.</p><p>This is the most common real bug in coroutine code, and it hides inside perfectly ordinary-looking error handling. Either catch something narrower, or rethrow: <code>if (e is CancellationException) throw e</code>.</p>'
                    },
                    distractor: '<p>Assuming cancellation is out of band and cannot be caught. It is an ordinary exception travelling the ordinary path, which is exactly why generic error handling breaks it.</p>'
                },
                {
                    type: 'predict',
                    id: 'finally-needs-noncancellable',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Two suspending cleanups in a <code>finally</code>, after cancellation. Which of them completes?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch {
        try {
            delay(1000)
        } finally {
            println("entering cleanup")
            try {
                delay(50)
                println("the plain cleanup finished")
            } catch (e: CancellationException) {
                println("the plain cleanup was itself cancelled")
            }
            withContext(NonCancellable) {
                delay(50)
                println("the NonCancellable cleanup finished")
            }
        }
    }

    delay(100)
    job.cancelAndJoin()
    println("done")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'entering cleanup',
                            'the plain cleanup was itself cancelled',
                            'the NonCancellable cleanup finished',
                            'done'
                        ],
                        explain: '<p>The <code>finally</code> runs, but the coroutine is already cancelled — so the first suspending call inside it is cancelled immediately, before it can do anything. A cleanup that needs to suspend cannot suspend in a job that is being torn down.</p><p><code>withContext(NonCancellable)</code> is the escape hatch, and the only legitimate use of it: closing a file, flushing a write, releasing a lock. Not for doing more work.</p>'
                    },
                    distractor: '<p>Expecting both cleanups to run because <code>finally</code> always runs. The block does run — what fails is every <em>suspending</em> call inside it.</p>'
                }
            ],
            docs: [
                { title: 'Cancellation and timeouts', url: 'https://kotlinlang.org/docs/cancellation-and-timeouts.html', kind: 'guide' },
                { title: 'Cancellation in coroutines', path: '/kotlin/coroutines/coroutines-adv', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-cancellation' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-structured-concurrency' }
            ]
        },

        {
            id: 'when-a-child-fails',
            title: 'What one failing child does to its family',
            importance: 'must-know',
            summary: 'A failure travels up to the parent and back down to every sibling — unless the parent is a SupervisorJob, which is the whole reason that type exists.',
            interviewAngle: 'Job versus SupervisorJob is asked constantly and answered vaguely. Being able to say which coroutines die, in which order, is the version of the answer that convinces.',
            buildsOn: ['cooperative-cancellation'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>These next two snippets are the same program with one word changed. Read the first, commit to an answer, then check whether your answer for the second differs in the way you expected.</p>'
                },
                {
                    type: 'predict',
                    id: 'job-lets-a-sibling-kill-a-sibling',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>B fails at 100ms. A wants to finish at 300ms. What happens to A, and to the scope?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val quiet = CoroutineExceptionHandler { _, _ -> }
    val scope = CoroutineScope(Job() + quiet)

    scope.launch {
        try {
            delay(300)
            println("sibling A finished")
        } catch (e: CancellationException) {
            println("sibling A was cancelled")
        }
    }
    scope.launch {
        delay(100)
        throw RuntimeException("B failed")
    }

    delay(400)
    println("is the scope still active? \${scope.isActive}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['sibling A was cancelled', 'is the scope still active? false'],
                        explain: '<p>B’s failure propagates <strong>up</strong> to the shared <code>Job</code>, which fails, and a failed job cancels all of its remaining children — so A dies for a reason that had nothing to do with A.</p><p>The scope is now permanently dead. A cancelled <code>Job</code> does not recover, which means anything launched into this scope afterwards will not run either.</p>'
                    },
                    distractor: '<p>Expecting A to finish on the grounds that it did nothing wrong. Under a plain <code>Job</code>, siblings share a fate.</p>'
                },
                {
                    type: 'predict',
                    id: 'supervisorjob-isolates-siblings',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Identical, except for one word on line 4. Does anything change?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val quiet = CoroutineExceptionHandler { _, _ -> }
    val scope = CoroutineScope(SupervisorJob() + quiet)

    scope.launch {
        try {
            delay(300)
            println("sibling A finished")
        } catch (e: CancellationException) {
            println("sibling A was cancelled")
        }
    }
    scope.launch {
        delay(100)
        throw RuntimeException("B failed")
    }

    delay(400)
    println("is the scope still active? \${scope.isActive}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['sibling A finished', 'is the scope still active? true'],
                        explain: '<p>Both lines change. A <code>SupervisorJob</code> lets failure travel up but not back down: the child that failed is finished, and every sibling carries on untouched. The scope survives and can still be launched into.</p><p>This is why a screen-level scope should be supervised. One failed analytics call should not take the screen’s data loading with it.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'child-failure-cancels-the-parent',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>A grandchild throws. What happens to the parent that was busy doing something else?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val quiet = CoroutineExceptionHandler { _, _ -> }
    val scope = CoroutineScope(Job() + quiet)

    val parent = scope.launch {
        launch {
            delay(50)
            throw RuntimeException("the grandchild failed")
        }
        try {
            delay(500)
            println("the parent finished its own work")
        } catch (e: CancellationException) {
            println("the parent was cancelled by its child")
        }
    }

    parent.join()
    println("parent cancelled: \${parent.isCancelled}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['the parent was cancelled by its child', 'parent cancelled: true'],
                        explain: '<p>Failure propagates <em>upward</em> as well as downward. The parent was in the middle of its own unrelated <code>delay(500)</code> and was cancelled by a child it launched and then forgot about.</p><p>This is the direction people miss. Cancelling a parent cancelling its children is intuitive; a child taking down the parent is the half that makes <code>SupervisorJob</code> necessary rather than merely convenient.</p>'
                    },
                    distractor: '<p>Expecting the parent to finish its own work and only the child to die. Under structured concurrency a parent cannot succeed while a child has failed.</p>'
                }
            ],
            docs: [
                { title: 'Coroutine exceptions handling', url: 'https://kotlinlang.org/docs/exception-handling.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-job-vs-supervisorjob' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-coroutinescope-vs-supervisorscope' }
            ]
        },

        {
            id: 'where-an-exception-surfaces',
            title: 'Where the exception actually surfaces',
            importance: 'must-know',
            summary: 'launch throws where it happens; async stores the failure and rethrows it at await. Which means an unawaited async can lose an exception entirely.',
            interviewAngle: 'The good follow-up to launch-versus-async is how exceptions differ between them, and the strongest answer names the case where the exception is silently lost.',
            buildsOn: ['when-a-child-fails'],
            blocks: [
                {
                    type: 'predict',
                    id: 'async-exception-surfaces-at-await',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>The async body throws immediately. When does anything notice?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    supervisorScope {
        val deferred = async { throw RuntimeException("boom") }
        println("async returned without throwing")

        delay(100)
        println("100ms later, still nothing has thrown")

        try {
            deferred.await()
        } catch (e: RuntimeException) {
            println("await threw: \${e.message}")
        }
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'async returned without throwing',
                            '100ms later, still nothing has thrown',
                            'await threw: boom'
                        ],
                        explain: '<p>The exception is <strong>stored</strong> in the <code>Deferred</code> rather than thrown. <code>async</code> returns normally, a hundred milliseconds pass with the failure sitting there unreported, and it is <code>await()</code> that rethrows it — at the call site, not where it happened.</p><p>That is the difference from <code>launch</code>, which has nowhere to store anything and so propagates immediately.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'async-in-supervisorscope-still-throws',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>The async throws and nobody awaits it. What is reported?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    supervisorScope {
        async { throw RuntimeException("boom") }
        launch { delay(100); println("the sibling finished fine") }
    }
    println("nothing threw, and nothing was reported")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['the sibling finished fine', 'nothing threw, and nothing was reported'],
                        explain: '<p>Nothing. The exception went into the <code>Deferred</code> and stayed there, because nobody ever asked for the value. Under a supervisor it does not cancel the sibling, it does not reach a <code>CoroutineExceptionHandler</code>, and it does not reach the default handler either — it is simply gone.</p><p>An <code>async</code> you do not <code>await</code> is a way to lose a failure silently. If you are not going to await it, use <code>launch</code>.</p>'
                    },
                    distractor: '<p>Expecting a stack trace somewhere. A <code>Deferred</code>’s exception is only ever delivered to whoever awaits it, and here nobody does.</p>'
                },
                {
                    type: 'predict',
                    id: 'handler-ignored-by-async',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>One handler, two failing coroutines. How many does it see?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val handler = CoroutineExceptionHandler { _, e -> println("the handler saw: \${e.message}") }
    val scope = CoroutineScope(SupervisorJob() + handler)

    scope.launch { throw RuntimeException("from launch") }
    delay(100)

    val deferred = scope.async { throw RuntimeException("from async") }
    delay(100)
    println("the handler was not called for async")

    try {
        deferred.await()
    } catch (e: RuntimeException) {
        println("await threw: \${e.message}")
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'the handler saw: from launch',
                            'the handler was not called for async',
                            'await threw: from async'
                        ],
                        explain: '<p>One. A <code>CoroutineExceptionHandler</code> is the last resort for an exception nobody else will deal with, and an <code>async</code> always has somebody who might — whoever calls <code>await()</code>. So the handler is never consulted for it, whether or not the await ever happens.</p><p>Installing a handler and assuming it covers everything in the scope is a reasonable-looking mistake that leaves half the failures unhandled.</p>'
                    },
                    distractor: '<p>Expecting both, on the basis that the handler is installed on the scope and both coroutines are in it. The handler applies to <code>launch</code> only.</p>'
                }
            ],
            docs: [
                { title: 'Coroutine exceptions handling', url: 'https://kotlinlang.org/docs/exception-handling.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-exception-handling' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-launch-vs-async' }
            ]
        },

        {
            id: 'timeouts-and-dead-scopes',
            title: 'Timeouts, and a scope that is already gone',
            importance: 'must-know',
            summary: 'Two spellings of timeout with two different failure modes, and what happens when you launch into a scope that has already been cancelled.',
            interviewAngle: 'The timeout pair is a quick one; the dead scope is the one that explains a real bug people have shipped — work that silently never runs after a screen is closed.',
            buildsOn: ['where-an-exception-surfaces'],
            blocks: [
                {
                    type: 'predict',
                    id: 'withtimeout-throws-ortimeoutornull-does-not',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Three timeouts, two of which expire. What does each produce?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val orNull = withTimeoutOrNull(100) {
        delay(500)
        "finished"
    }
    println("withTimeoutOrNull gave: \$orNull")

    try {
        withTimeout(100) {
            delay(500)
            "finished"
        }
    } catch (e: TimeoutCancellationException) {
        println("withTimeout threw: \${e::class.simpleName}")
    }

    val inTime = withTimeoutOrNull(500) { delay(50); "finished" }
    println("and with enough time: \$inTime")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'withTimeoutOrNull gave: null',
                            'withTimeout threw: TimeoutCancellationException',
                            'and with enough time: finished'
                        ],
                        explain: '<p>Same mechanism, two ways of reporting it. <code>withTimeoutOrNull</code> returns <code>null</code> on expiry and the value otherwise; <code>withTimeout</code> throws.</p><p>What it throws matters: <code>TimeoutCancellationException</code> is a <code>CancellationException</code>. So a <code>catch (e: Exception)</code> around it swallows the timeout the same way it swallows a cancellation — the pitfall from the first chapter, arriving from a different direction.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'launch-in-a-cancelled-scope',
                    importance: 'good-to-know',
                    language: 'kotlin',
                    prompt: '<p>The scope is cancelled before anything is launched into it. Does <code>launch</code> fail, or does it just do nothing?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val scope = CoroutineScope(Job())
    scope.cancel()

    val job = scope.launch { println("this body never runs") }

    println("is it active? \${job.isActive}")
    println("is it cancelled? \${job.isCancelled}")
    job.join()
    println("join returned without complaint")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'is it active? false',
                            'is it cancelled? true',
                            'join returned without complaint'
                        ],
                        explain: '<p>Neither. <code>launch</code> returns a perfectly ordinary <code>Job</code> that is already cancelled, the body never runs, and <code>join()</code> returns immediately without error. Nothing anywhere reports a problem.</p><p>This is the failure mode behind "the request just never fired". A cancelled scope is not reusable, and launching into one is silent — so the bug shows up as missing work rather than as an exception.</p>'
                    },
                    distractor: '<p>Expecting an exception. A cancelled scope accepts work and discards it, which is quieter and considerably harder to debug.</p>'
                }
            ],
            docs: [
                { title: 'Cancellation and timeouts', url: 'https://kotlinlang.org/docs/cancellation-and-timeouts.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-cancellation' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-lifecycle-scopes' }
            ]
        }
    ]
};
