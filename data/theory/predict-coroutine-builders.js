/* ==========================================================================
   M51 — Predict the output: builders and ordering.

   The first module of the output track, and the one that decides whether the
   rest are worth reading. Every snippet here has been compiled and run by
   tools/run-snippets.js, and the lines recorded under it are what the program
   actually printed rather than what it looked like it would print.

   That distinction earned its keep during authoring: of the eleven puzzles,
   one printed something other than what the author expected, and it is now the
   most useful block in the module.
   ========================================================================== */

const predictCoroutineBuildersModule = {
    id: 'predict-coroutine-builders',
    trackId: 'output',
    order: 51,
    title: 'Builders and Ordering',
    tagline: 'Where the body runs is not where it is written.',
    estimatedMinutes: 25,
    prerequisites: ['coroutines-fundamentals', 'structured-concurrency'],
    docHub: {
        title: 'Kotlin coroutines on Android',
        path: '/kotlin/coroutines'
    },

    chapters: [
        {
            id: 'launch-ordering',
            title: 'launch, and when its body actually runs',
            importance: 'must-know',
            summary: 'A builder returns immediately. The body it was handed runs when the dispatcher reaches it, which is almost never the line it was written on.',
            interviewAngle: 'This is the shape the question takes when an interviewer wants to know whether you have a model or a vocabulary. Reciting "launch is fire-and-forget" is free; saying which line prints second is not.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Every puzzle in this chapter turns on one fact: <code>launch</code> returns a <code>Job</code> and keeps going. The block you passed it has been <em>scheduled</em>, not run. Everything that looks surprising below is that fact seen from a different angle.</p><p>Answer out loud before revealing. The point is not whether you know what <code>launch</code> does — it is whether your model produces the right order without being checked.</p>'
                },
                {
                    type: 'predict',
                    id: 'launch-does-not-wait',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Three lines print. In what order?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    println("start")
    launch { println("inside launch") }
    println("end")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['start', 'end', 'inside launch'],
                        explain: '<p><code>launch</code> schedules its block and returns straight away, so <code>"end"</code> is reached while the child has not run at all. The child gets its turn once the <code>runBlocking</code> body suspends or finishes — and <code>runBlocking</code> will not return until every child it started has completed, which is why <code>"inside launch"</code> appears rather than being lost.</p>'
                    },
                    distractor: '<p>Reading it top to bottom gives <code>start</code>, <code>inside launch</code>, <code>end</code> — the answer you get if you treat the braces as a block that runs where it sits rather than a lambda handed to a scheduler.</p>'
                },
                {
                    type: 'predict',
                    id: 'launches-print-in-delay-order',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Four lines. Which is first, and what order do the rest arrive in?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    launch { delay(300); println("third") }
    launch { delay(200); println("second") }
    launch { delay(100); println("first") }
    println("all three launched")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['all three launched', 'first', 'second', 'third'],
                        explain: '<p>All three are scheduled before any of them waits, so the declaration order stops mattering the moment they start — what orders them is the length of each <code>delay</code>. The concurrency is real: this takes about 300ms, not 600ms.</p><p>The first line is the giveaway that they were scheduled rather than run. Nothing in the body had a chance to execute before the enclosing block reached its last statement.</p>'
                    },
                    distractor: '<p>Naming them in declaration order — <code>third</code>, <code>second</code>, <code>first</code> — misses that these run concurrently rather than in sequence.</p>'
                },
                {
                    type: 'predict',
                    id: 'nested-launch-completes-last',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p><code>join()</code> waits for the parent. What has finished by the time it returns?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val parent = launch {
        println("parent body starts")
        launch {
            delay(100)
            println("child finishes")
        }
        println("parent body ends")
    }
    parent.join()
    println("only now is the parent job complete")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'parent body starts',
                            'parent body ends',
                            'child finishes',
                            'only now is the parent job complete'
                        ],
                        explain: '<p>This is structured concurrency in one snippet. A <code>Job</code> is not complete when its own body reaches the closing brace — it is complete when its body <strong>and every child it started</strong> have finished. So <code>join()</code> outlives the parent block by the full 100ms the child spends waiting.</p><p>That guarantee is the reason cancelling a scope cancels everything beneath it, and the reason a <code>viewModelScope</code> can promise that nothing survives <code>onCleared</code>.</p>'
                    },
                    distractor: '<p>Expecting <code>child finishes</code> last — after the join — treats the parent as done when its own code ends. The child would then outlive the job that owns it, which is exactly what structured concurrency exists to prevent.</p>'
                },
                {
                    type: 'predict',
                    id: 'delay-zero-does-not-yield',
                    importance: 'good-to-know',
                    language: 'kotlin',
                    prompt: '<p>The same two coroutines, twice. Does the second half interleave differently from the first?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    println("-- with delay(0) --")
    coroutineScope {
        launch { println("A1"); delay(0); println("A2") }
        launch { println("B1"); delay(0); println("B2") }
    }

    println("-- with yield() --")
    coroutineScope {
        launch { println("A1"); yield(); println("A2") }
        launch { println("B1"); yield(); println("B2") }
    }
    println("-- end --")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            '-- with delay(0) --',
                            'A1', 'A2', 'B1', 'B2',
                            '-- with yield() --',
                            'A1', 'B1', 'A2', 'B2',
                            '-- end --'
                        ],
                        explain: '<p><code>delay(0)</code> does not suspend. The implementation returns immediately for any non-positive duration, so <code>A1</code> and <code>A2</code> run in one uninterrupted go and <code>B</code> never gets a turn in between.</p><p><code>yield()</code> is the one that always gives the dispatcher a chance to run something else, which is what produces the interleaving people expect from the first half.</p><p>If you want a suspension point, ask for a suspension point.</p>'
                    },
                    distractor: '<p><code>A1 B1 A2 B2</code> for both halves is the natural answer — and it is what this module’s author predicted before running it. <code>delay(0)</code> looks like a yield and is not one.</p>'
                }
            ],
            docs: [
                { title: 'Coroutines basics', url: 'https://kotlinlang.org/docs/coroutines-basics.html', kind: 'guide' },
                { title: 'Kotlin coroutines on Android', path: '/kotlin/coroutines', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-launch-vs-async' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-structured-concurrency' },
                { topicId: 'kotlin', questionId: 'kotlin-thread-sleep-vs-delay' }
            ]
        },

        {
            id: 'async-and-await',
            title: 'async, await, and where the waiting happens',
            importance: 'must-know',
            summary: 'async starts work immediately; await decides when you stop and collect it. Putting await in the wrong place turns concurrency back into sequence.',
            interviewAngle: 'The launch-versus-async comparison is close to guaranteed, and the answer that separates candidates is not the definition — it is knowing that two awaits in the wrong position cost you the whole benefit.',
            buildsOn: ['launch-ordering'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p><code>async</code> differs from <code>launch</code> in exactly one way that matters here: it hands back a <code>Deferred</code> carrying a value. Everything else about scheduling is identical, including the part people forget — <strong>the body starts without being awaited</strong>.</p>'
                },
                {
                    type: 'predict',
                    id: 'async-starts-eagerly',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Nothing calls <code>await()</code>. Does the body run at all, and if so, when?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val deferred = async {
        println("the async body ran")
        42
    }
    println("nobody has awaited yet")
    delay(50)
    println("and still nobody has")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'nobody has awaited yet',
                            'the async body ran',
                            'and still nobody has'
                        ],
                        explain: '<p><code>async</code> is eager by default. The body is scheduled the moment the builder is called, and it runs at the first opportunity the dispatcher gets — here, the <code>delay(50)</code>. <code>await()</code> is not what starts the work; it is only how you collect the result.</p><p>This is why a <code>Deferred</code> you never await still does its work, and why an exception inside it still happened even though nothing has rethrown it yet.</p>'
                    },
                    distractor: '<p>Assuming <code>async</code> is lazy — that the body waits for <code>await()</code> — is the common answer. That behaviour exists, but you have to ask for it with <code>CoroutineStart.LAZY</code>.</p>'
                },
                {
                    type: 'predict',
                    id: 'await-immediately-is-sequential',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Two 300ms waits. Does the whole thing take about 300ms or about 600ms?</p>',
                    code: `import kotlinx.coroutines.*
import kotlin.system.measureTimeMillis

fun main() = runBlocking {
    val elapsed = measureTimeMillis {
        val one = async { delay(300); 1 }.await()
        val two = async { delay(300); 2 }.await()
        println("sum = \${one + two}")
    }
    println("took 600ms or more: \${elapsed >= 600}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['sum = 3', 'took 600ms or more: true'],
                        explain: '<p><code>.await()</code> written directly on the <code>async</code> call means the second coroutine is not even created until the first has finished. The two waits stack, and the <code>async</code> has bought nothing at all — this is more expensive than just calling two suspend functions in a row, because it adds a coroutine for no benefit.</p>'
                    },
                    distractor: '<p>Reading <code>async</code> as "concurrent" and answering 300ms. The builder does not make things concurrent; <strong>where you await</strong> does.</p>'
                },
                {
                    type: 'predict',
                    id: 'await-after-both-is-concurrent',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>The same two waits, with the awaits moved. Same answer as the last one?</p>',
                    code: `import kotlinx.coroutines.*
import kotlin.system.measureTimeMillis

fun main() = runBlocking {
    val elapsed = measureTimeMillis {
        val one = async { delay(300); 1 }
        val two = async { delay(300); 2 }
        println("sum = \${one.await() + two.await()}")
    }
    println("took 600ms or more: \${elapsed >= 600}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['sum = 3', 'took 600ms or more: false'],
                        explain: '<p>Identical work, identical result, half the wall clock. Both coroutines are started before either is awaited, so the two 300ms waits overlap and the whole block finishes in a little over 300ms.</p><p>The pair of these two puzzles is the entire practical lesson of <code>async</code>: <strong>start everything, then await everything</strong>. If an <code>await()</code> appears on the same line as its <code>async</code>, the concurrency has been written away.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'job-join-returns-unit',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Both wait for their coroutine. What does each one hand back?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val job = launch { delay(50); println("the work happened") }
    val fromJoin = job.join()
    println("join gave back: \$fromJoin")

    val deferred = async { delay(50); "a value" }
    val fromAwait = deferred.await()
    println("await gave back: \$fromAwait")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'the work happened',
                            'join gave back: kotlin.Unit',
                            'await gave back: a value'
                        ],
                        explain: '<p><code>join()</code> waits and yields nothing, because a <code>Job</code> has no result to give — <code>launch</code> was never asked for one. <code>await()</code> waits and yields the value, because a <code>Deferred&lt;T&gt;</code> is a <code>Job</code> that also carries a <code>T</code>.</p><p>That is the whole difference between the two builders, and it is also how you pick between them: need a value, use <code>async</code>; performing a side effect, use <code>launch</code>.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'lazy-does-not-start-itself',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>One is lazy, one is not. What prints, and what does <code>isActive</code> report before <code>start()</code>?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val lazy = launch(start = CoroutineStart.LAZY) { println("the lazy body") }
    launch { println("the eager body") }

    delay(100)
    println("has the lazy one started? \${lazy.isActive}")

    lazy.start()
    lazy.join()
    println("done")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'the eager body',
                            'has the lazy one started? false',
                            'the lazy body',
                            'done'
                        ],
                        explain: '<p>A lazily started coroutine sits in the <em>new</em> state until something asks for it, so <code>isActive</code> is <code>false</code> — it is neither running nor completed. A full 100ms passes with the body untouched while the eager sibling has already finished.</p><p><code>start()</code> and <code>await()</code> both trigger it. Forgetting to call either is a coroutine that silently never runs, which is the reason lazy is not the default.</p>'
                    },
                    distractor: '<p>Reading <code>isActive</code> as "has not been cancelled" and answering <code>true</code>. It means <em>currently running</em>, and a coroutine that has not started yet is not running.</p>'
                }
            ],
            docs: [
                { title: 'Composing suspending functions', url: 'https://kotlinlang.org/docs/composing-suspending-functions.html', kind: 'guide' },
                { title: 'Improve app performance with Kotlin coroutines', path: '/kotlin/coroutines/coroutines-adv', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-launch-vs-async' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-parallel-network-calls' }
            ]
        },

        {
            id: 'dispatch-and-blocking',
            title: 'runBlocking and withContext',
            importance: 'must-know',
            summary: 'One of these holds a thread and one moves work off it. Confusing them is how a coroutine ends up blocking the main thread.',
            interviewAngle: 'The follow-up to "what is runBlocking?" is "so why is it wrong in an Activity?" — and the answer is a sentence about which thread it holds, not a rule you memorised.',
            buildsOn: ['async-and-await'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>These two get confused because both look like they "run a block somewhere". Only one of them blocks the caller, and only one of them returns a value from the block it ran.</p>'
                },
                {
                    type: 'predict',
                    id: 'runblocking-blocks-its-thread',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Which thread does each line report, and when does the last line print?</p>',
                    code: `import kotlinx.coroutines.*

fun main() {
    println("main is on \${Thread.currentThread().name}")

    runBlocking {
        println("the runBlocking body is on \${Thread.currentThread().name}")
        launch {
            delay(50)
            println("its child is on \${Thread.currentThread().name}")
        }
    }

    println("main resumes only now")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'main is on main',
                            'the runBlocking body is on main',
                            'its child is on main',
                            'main resumes only now'
                        ],
                        explain: '<p>Everything is on <code>main</code>. <code>runBlocking</code> does not move work anywhere — it builds an event loop <strong>on the calling thread</strong> and refuses to return until every coroutine in it has finished. Its children run on that same thread by default.</p><p>Which is exactly why it does not belong in Android app code. Called from the main thread it holds the main thread, and a held main thread is a frozen screen. It is a bridge for <code>main()</code> functions and tests, where blocking is the point.</p>'
                    },
                    distractor: '<p>Expecting the child on a background thread. Nothing in this snippet names a dispatcher, and <code>runBlocking</code>’s default is the thread it was called on — not <code>Dispatchers.Default</code>.</p>'
                },
                {
                    type: 'predict',
                    id: 'withcontext-returns-last-expression',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Two <code>withContext</code> calls. What does each evaluate to?</p>',
                    code: `import kotlinx.coroutines.*

fun main() = runBlocking {
    val value = withContext(Dispatchers.Default) {
        delay(50)
        "computed"
    }
    println("withContext returned: \$value")

    val nothing = withContext(Dispatchers.Default) {
        println("this block ends on a println")
    }
    println("and this one returned: \$nothing")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'withContext returned: computed',
                            'this block ends on a println',
                            'and this one returned: kotlin.Unit'
                        ],
                        explain: '<p><code>withContext</code> is an expression, not a statement. It returns whatever its block’s last line evaluates to — a <code>String</code> in the first case, and <code>Unit</code> in the second because <code>println</code> returns <code>Unit</code>.</p><p>Unlike <code>launch</code> and <code>async</code>, it starts no new coroutine and returns no handle. It suspends the current one, moves it, runs the block, and moves the result back — which is why it is the right tool for "do this bit off the main thread" and the wrong one for "do these two things at once".</p>'
                    }
                }
            ],
            docs: [
                { title: 'Coroutine context and dispatchers', url: 'https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-runblocking' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-withcontext' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-dispatchers' }
            ]
        }
    ]
};
