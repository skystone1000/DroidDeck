/* ==========================================================================
   M53 — Predict the output: Flow, hot and cold.

   The cold/hot distinction is the one Flow question every source agrees is
   asked, and it is also the one that cannot be answered convincingly from a
   definition. "A cold flow runs per collector" is a sentence; watching the
   builder print twice is an understanding.

   Every snippet was compiled, run, and run twice more to confirm the output
   does not vary. Several of these turn on timing, so the margins between a
   producer's delay and a consumer's are wide on purpose.
   ========================================================================== */

const predictFlowModule = {
    id: 'predict-flow',
    trackId: 'output',
    order: 53,
    title: 'Flow, Hot and Cold',
    tagline: 'Nothing happens until somebody collects. Then it happens again.',
    estimatedMinutes: 32,
    prerequisites: ['flow-fundamentals', 'reactive-state', 'predict-coroutine-failure'],
    docHub: {
        title: 'Kotlin flows on Android',
        path: '/kotlin/flow'
    },

    chapters: [
        {
            id: 'cold-by-default',
            title: 'Cold means the work belongs to the collector',
            importance: 'must-know',
            summary: 'A flow builder is a recipe, not a running thing. It executes once per collector, from the top, every time.',
            interviewAngle: 'Asked as "what is a cold flow?" and answered well by describing what happens when you collect the same flow twice — which is a fact, not a definition.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A <code>flow { }</code> block is stored, not started. Everything in this chapter follows from that one fact, including the parts that look like bugs.</p>'
                },
                {
                    type: 'predict',
                    id: 'flow-builder-does-not-run',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>When does <code>"the builder started"</code> print?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val numbers = flow {
        println("the builder started")
        emit(1)
        emit(2)
    }

    println("the flow has been created")
    delay(100)
    println("100ms later, nothing has emitted")

    numbers.collect { println("collected \$it") }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'the flow has been created',
                            '100ms later, nothing has emitted',
                            'the builder started',
                            'collected 1',
                            'collected 2'
                        ],
                        explain: '<p>Last, at the <code>collect</code>. Building a flow allocates an object that remembers the block; it runs nothing. A hundred milliseconds pass with the flow sitting there doing precisely nothing, because there is nobody to do it for.</p><p>This is what "cold" means, and it is why a cold flow needs no lifecycle management of its own — it only exists while something is collecting it.</p>'
                    },
                    distractor: '<p>Expecting the builder to run where it is written, like a normal block. <code>flow { }</code> is closer to a lambda you stored than to code you executed.</p>'
                },
                {
                    type: 'predict',
                    id: 'collecting-twice-runs-it-twice',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>One flow, two collectors. What is the final count?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    var runs = 0
    val numbers = flow {
        runs++
        println("builder run #\$runs")
        emit(1)
    }

    numbers.collect { println("A got \$it") }
    numbers.collect { println("B got \$it") }
    println("the builder ran \$runs times")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'builder run #1', 'A got 1',
                            'builder run #2', 'B got 1',
                            'the builder ran 2 times'
                        ],
                        explain: '<p>Twice, and sequentially — B does not start until A has finished. Each collector gets its own private execution of the block from the top.</p><p>If that block is a network call, two collectors are two requests. This is the single most expensive misunderstanding about cold flows in real code, and the reason <code>shareIn</code> and <code>stateIn</code> exist.</p>'
                    },
                    distractor: '<p>Answering 1, on the assumption that the flow is a stream that both collectors attach to. That is a <em>hot</em> flow, and it is a different type.</p>'
                },
                {
                    type: 'predict',
                    id: 'operator-order-changes-output',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>The same two operators, both orders. Do they agree?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val source = flowOf(1, 2, 3, 4)

    println("map then filter: " + source.map { it * 2 }.filter { it > 4 }.toList())
    println("filter then map: " + source.filter { it > 4 }.map { it * 2 }.toList())
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['map then filter: [6, 8]', 'filter then map: []'],
                        explain: '<p>Not remotely. Mapping first doubles everything and then keeps what exceeds 4, giving <code>[6, 8]</code>. Filtering first asks which of <code>1, 2, 3, 4</code> exceeds 4 — none do — and maps an empty flow.</p><p>Operators compose in the order written, each one seeing only what the previous one passed on. Obvious stated that way, and routinely got wrong when the chain is six operators long.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'take-cancels-upstream',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>The producer wants to emit five values. <code>take(2)</code> wants two. How many are produced?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val source = flow {
        for (i in 1..5) {
            println("emitting \$i")
            emit(i)
        }
        println("the producer finished")
    }

    source.take(2).collect { println("collected \$it") }
    println("done")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'emitting 1', 'collected 1',
                            'emitting 2', 'collected 2',
                            'done'
                        ],
                        explain: '<p>Two. <code>take</code> cancels the flow as soon as it has what it needs, so values 3 to 5 are never produced — and the producer’s own final line never runs, because the producer was cancelled rather than allowed to finish.</p><p>Note the strict alternation. Emission and collection are not two stages; each value is carried all the way down the chain before the next is produced.</p>'
                    },
                    distractor: '<p>Expecting all five to be emitted and three thrown away. Backpressure in Flow is structural — the consumer’s demand reaches back to the producer.</p>'
                }
            ],
            docs: [
                { title: 'Asynchronous Flow', url: 'https://kotlinlang.org/docs/flow.html', kind: 'guide' },
                { title: 'Kotlin flows on Android', path: '/kotlin/flow', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-cold-vs-hot' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-what-is-flow' }
            ]
        },

        {
            id: 'when-the-consumer-is-slow',
            title: 'When the consumer cannot keep up',
            importance: 'must-know',
            summary: 'Three operators for a fast producer and a slow collector, and they discard different things — the in-flight work, the intermediate values, or nothing at all.',
            interviewAngle: 'Why does collectLatest exist is a standard follow-up, and the convincing answer distinguishes it from conflate rather than describing it alone.',
            buildsOn: ['cold-by-default'],
            blocks: [
                {
                    type: 'predict',
                    id: 'collectlatest-drops-in-flight-work',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Each block wants 150ms. Values arrive every 100ms. How many blocks finish?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val source = flow {
        emit(1); delay(100)
        emit(2); delay(100)
        emit(3)
    }

    source.collectLatest { value ->
        println("started \$value")
        delay(150)
        println("finished \$value")
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['started 1', 'started 2', 'started 3', 'finished 3'],
                        explain: '<p>One. <code>collectLatest</code> <strong>cancels the block that is still running</strong> when a new value arrives, so 1 and 2 are started and abandoned halfway. Only the last value gets to finish, because nothing arrives to interrupt it.</p><p>That is exactly the behaviour a search field wants: a keystroke should abandon the request for the previous query, not queue behind it.</p>'
                    },
                    distractor: '<p>Expecting three <code>finished</code> lines in some order. The block is cancelled, not run to completion in the background.</p>'
                },
                {
                    type: 'predict',
                    id: 'conflate-skips-intermediates',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Five values arrive 30ms apart; the collector needs 200ms each. Which values does it see?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val source = flow {
        for (i in 1..5) { emit(i); delay(30) }
    }

    source.conflate().collect { value ->
        println("collecting \$value")
        delay(200)
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['collecting 1', 'collecting 5'],
                        explain: '<p>The first and the last. <code>conflate</code> keeps only the most recent value while the collector is busy, so 2, 3 and 4 are overwritten before they are ever delivered — and the block that <em>is</em> running is never cancelled.</p><p>That is the difference from <code>collectLatest</code>: <code>conflate</code> discards <strong>values</strong> and always finishes its work; <code>collectLatest</code> keeps every value and discards <strong>work</strong>. Choose by asking which one you can afford to lose.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'buffer-changes-the-timing',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Producing takes 100ms per value, collecting takes another 100ms. Three values. Does <code>buffer()</code> change the total?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlin.system.measureTimeMillis

fun main() = runBlocking {
    val source = flow {
        for (i in 1..3) { delay(100); emit(i) }
    }

    val plain = measureTimeMillis { source.collect { delay(100) } }
    val buffered = measureTimeMillis { source.buffer().collect { delay(100) } }

    println("without buffer, over 550ms: \${plain > 550}")
    println("with buffer, over 550ms: \${buffered > 550}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'without buffer, over 550ms: true',
                            'with buffer, over 550ms: false'
                        ],
                        explain: '<p>Yes — about 600ms becomes about 400ms. Without a buffer the producer and the collector take strict turns, so every value costs 200ms. <code>buffer()</code> runs them in separate coroutines, so the producer can be making the next value while the collector is still handling the last.</p><p>Nothing is discarded here, unlike the two operators above. <code>buffer</code> trades memory for overlap; the other two trade correctness-of-every-value for keeping up.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'flowon-affects-upstream-only',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p><code>flowOn</code> sits between the <code>map</code> and the <code>collect</code>. Which of the three moves?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    fun onMain() = Thread.currentThread().name == "main"

    flow {
        println("emitting on main? \${onMain()}")
        emit(1)
    }
        .map { println("mapping on main? \${onMain()}"); it }
        .flowOn(Dispatchers.Default)
        .collect { println("collecting on main? \${onMain()}") }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'emitting on main? false',
                            'mapping on main? false',
                            'collecting on main? true'
                        ],
                        explain: '<p>Everything <em>above</em> it. <code>flowOn</code> affects the upstream only, so the builder and the <code>map</code> move to <code>Dispatchers.Default</code> while the collector stays exactly where it was.</p><p>This is what makes it safe on Android: a repository can push its own work off the main thread without knowing or caring which thread the UI collects on. The collector’s context is the caller’s business, and <code>flowOn</code> cannot take it away.</p>'
                    },
                    distractor: '<p>Expecting the collector to move too. It never does — that is the entire design, and it is why there is no downstream equivalent.</p>'
                }
            ],
            docs: [
                { title: 'Asynchronous Flow', url: 'https://kotlinlang.org/docs/flow.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-common-operators' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-flowon' }
            ]
        },

        {
            id: 'hot-flows-and-what-they-remember',
            title: 'StateFlow, SharedFlow, and what a late collector gets',
            importance: 'must-know',
            summary: 'A hot flow exists whether or not anyone is listening. What separates the two types is what they hand a collector that arrives late.',
            interviewAngle: 'StateFlow versus SharedFlow is named by every source. The answer that lands describes what a collector subscribing at a given moment receives, rather than listing properties.',
            buildsOn: ['when-the-consumer-is-slow'],
            blocks: [
                {
                    type: 'predict',
                    id: 'stateflow-drops-an-equal-value',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>The value is set to 1 three times, then to 2. How many times does the collector fire?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val state = MutableStateFlow(0)

    val job = launch { state.collect { println("the collector saw \$it") } }
    delay(50)

    state.value = 1
    delay(50)
    state.value = 1
    delay(50)
    state.value = 1
    delay(50)
    state.value = 2
    delay(50)

    job.cancel()
    println("done")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'the collector saw 0',
                            'the collector saw 1',
                            'the collector saw 2',
                            'done'
                        ],
                        explain: '<p>Three times, not five. <code>StateFlow</code> compares each new value with the current one using <code>equals</code> and drops it if they match — <code>distinctUntilChanged</code> is built in and cannot be switched off.</p><p>The <code>0</code> is the initial value, delivered immediately on subscription. Note also that setting the same value twice is not the only thing dropped: a data class whose fields are unchanged is <em>equal</em>, so re-emitting a rebuilt-but-identical UI state does nothing at all.</p>'
                    },
                    distractor: '<p>Expecting five lines because there were four assignments plus the initial value. Equal values are not emissions.</p>'
                },
                {
                    type: 'predict',
                    id: 'stateflow-replays-the-current-value',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Three values are set before anyone subscribes. What does the collector see?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val state = MutableStateFlow("first")
    state.value = "second"
    state.value = "third"

    val job = launch { state.collect { println("a brand new collector saw: \$it") } }
    delay(50)

    job.cancel()
    println("it never saw first or second at all")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'a brand new collector saw: third',
                            'it never saw first or second at all'
                        ],
                        explain: '<p>Only <code>third</code> — the current value, immediately. A <code>StateFlow</code> holds exactly one value and replays it to every new collector; it has no memory of how it got there.</p><p>That is precisely the property a screen needs. After a rotation the new collector gets the current state at once, with no request replayed and no blank frame.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'sharedflow-loses-what-it-missed',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>One emission before the collector exists, one after. How many arrive?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val shared = MutableSharedFlow<String>()
    shared.emit("before anyone subscribed")

    val job = launch { shared.collect { println("the collector saw: \$it") } }
    delay(50)

    shared.emit("after subscribing")
    delay(50)

    job.cancel()
    println("done")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['the collector saw: after subscribing', 'done'],
                        explain: '<p>One. A default <code>MutableSharedFlow</code> has no replay and no buffer, so an emission with no subscribers goes nowhere at all — it is not queued, and <code>emit</code> does not even block waiting for one.</p><p>Which is the right behaviour for a one-off event. A navigation command or a toast that fires while no screen is listening should be lost, not delivered late to a screen that has moved on.</p>'
                    },
                    distractor: '<p>Expecting the first emission to be queued until somebody subscribes. Nothing is buffered unless you ask for it.</p>'
                },
                {
                    type: 'predict',
                    id: 'sharedflow-replay-one-changes-the-answer',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Identical to the last one but for <code>replay = 1</code>. Same answer?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val shared = MutableSharedFlow<String>(replay = 1)
    shared.emit("before anyone subscribed")

    val job = launch { shared.collect { println("the collector saw: \$it") } }
    delay(50)

    shared.emit("after subscribing")
    delay(50)

    job.cancel()
    println("done")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'the collector saw: before anyone subscribed',
                            'the collector saw: after subscribing',
                            'done'
                        ],
                        explain: '<p>Both now arrive. <code>replay = 1</code> keeps the last emission in a cache and hands it to every new subscriber, which is what makes a <code>SharedFlow</code> start behaving like a <code>StateFlow</code>.</p><p>The remaining differences are that <code>StateFlow</code> requires an initial value, conflates equal values, and exposes <code>.value</code>. If you find yourself writing <code>replay = 1</code> for UI state, you wanted a <code>StateFlow</code>.</p><p>And this is exactly the wrong setting for one-off events: a replayed navigation command fires again on the next subscriber, which is how a screen navigates twice after a rotation.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'zip-against-combine',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Three letters, two numbers, arriving at different times. What does each operator produce?</p>',
                    code: `import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

fun main() = runBlocking {
    val letters = flow { emit("A"); delay(100); emit("B"); delay(100); emit("C") }
    val numbers = flow { delay(50); emit(1); delay(100); emit(2) }

    println("zip:     " + letters.zip(numbers) { l, n -> "\$l\$n" }.toList())
    println("combine: " + letters.combine(numbers) { l, n -> "\$l\$n" }.toList())
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'zip:     [A1, B2]',
                            'combine: [A1, B1, B2, C2]'
                        ],
                        explain: '<p><code>zip</code> pairs strictly by position and stops when either side runs out, so <code>C</code> has no partner and is dropped — two values in, two values out.</p><p><code>combine</code> emits every time <strong>either</strong> side produces something, using the other side’s most recent value. So <code>B</code> arriving reuses <code>1</code>, and <code>C</code> arriving reuses <code>2</code>. Four emissions from five inputs.</p><p>For UI state you almost always want <code>combine</code>: if the user changes a filter, you want the new filter against the existing data, not a wait for both to change in lockstep.</p>'
                    },
                    distractor: '<p>Expecting the two to agree, or expecting <code>combine</code> to produce three values because there are three letters. The count depends on the interleaving, not on either flow’s length.</p>'
                }
            ],
            docs: [
                { title: 'StateFlow and SharedFlow', path: '/kotlin/flow/stateflow-and-sharedflow', kind: 'guide' },
                { title: 'Asynchronous Flow', url: 'https://kotlinlang.org/docs/flow.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-stateflow-sharedflow' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-zip-parallel-calls' }
            ]
        }
    ]
};
