/* ==========================================================================
   M56 — Predict the output: Compose recomposition.

   The first module in this track whose answers are reasoned rather than
   proved. There is no Compose compiler plugin on the snippet classpath, so
   tools/run-snippets.js cannot compile any of this, and every block says so in
   an `unrunnable` field rather than quietly choosing the kind that is not
   checked. validate-theory.js counts those exemptions and prints the number on
   every run.

   The questions are all about *when things run* rather than what they render,
   which is what every source surveyed for the plan described — and which is
   also why a trace is the honest shape for them. There is no console here to
   be right about.
   ========================================================================== */

const COMPOSE_UNRUNNABLE = 'Compose: no compiler plugin on the snippet classpath';

const predictComposeModule = {
    id: 'predict-compose',
    trackId: 'output',
    order: 56,
    title: 'Compose Recomposition',
    tagline: 'The question is never what it draws. It is when it runs again.',
    estimatedMinutes: 25,
    prerequisites: ['compose-mental-model', 'compose-state', 'compose-side-effects'],
    docHub: {
        title: 'Compose',
        path: '/develop/ui/compose/documentation'
    },

    chapters: [
        {
            id: 'what-survives-a-recomposition',
            title: 'What survives a recomposition, and what survives a rotation',
            importance: 'must-know',
            summary: 'A composable function is re-invoked from the top. Anything not remembered is rebuilt, and remember itself does not survive the Activity being recreated.',
            interviewAngle: 'Asked as "what does remember do?" and answered convincingly by describing what happens without it — the state is recreated on every recomposition, so the screen never changes.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>These answers describe behaviour rather than console output, because no toolchain here can run a Composable. Each one is labelled <em>What happens, in order</em> instead of <em>Output</em>, and that difference is deliberate — a reasoned answer is worth less than a proved one and should say which it is.</p>'
                },
                {
                    type: 'predict',
                    id: 'state-without-remember-resets',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>The <code>remember</code> is missing. What does the counter do when you tap it?</p>',
                    code: `@Composable
fun Counter() {
    var count by mutableStateOf(0)      // note: no remember

    Column {
        Text("count = \$count")
        Button(onClick = { count++ }) { Text("increment") }
    }
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'First composition runs the function, creates a MutableState holding 0, and shows "count = 0".',
                            'You tap the button. count++ writes 1 into that state object.',
                            'The write is observed, so Compose schedules a recomposition of the enclosing scope.',
                            'Recomposition re-invokes Counter() from the top — and mutableStateOf(0) is a line in that function, so it runs again.',
                            'A brand new state object is created, holding 0. The one holding 1 is discarded.',
                            'Text shows "count = 0". The number on screen never changes, no matter how many times you tap.'
                        ],
                        explain: '<p>The state is not lost, exactly — it is <strong>recreated</strong>. A composable is an ordinary function that Compose calls again whenever something it read has changed, so every line in it runs again, including the one that builds the state.</p><p><code>remember</code> is what makes a value survive that re-invocation: it stores the value in the composition against the call site and returns the stored one instead of re-running the lambda. Without it the write and the reset chase each other forever.</p>'
                    },
                    distractor: '<p>Expecting the counter to work, on the grounds that <code>mutableStateOf</code> is the observable state type. It is — recomposition observes the write perfectly. The problem is what recomposition then does to the object that recorded it.</p>'
                },
                {
                    type: 'predict',
                    id: 'remember-against-remembersaveable',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>Both fields are typed into, then the device is rotated. What is in each one afterwards?</p>',
                    code: `@Composable
fun Fields() {
    var remembered by remember { mutableStateOf("") }
    var saved by rememberSaveable { mutableStateOf("") }

    Column {
        TextField(value = remembered, onValueChange = { remembered = it })
        TextField(value = saved, onValueChange = { saved = it })
    }
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'While the screen is simply recomposing, both behave identically — each survives every recomposition.',
                            'You rotate. The Activity is destroyed and recreated, and the whole composition is torn down with it.',
                            'remember stored its value in the composition only, so that value is gone. The field comes back empty.',
                            'rememberSaveable also wrote its value into the saved instance state Bundle before the Activity was destroyed.',
                            'On recreation it restores from that Bundle, and the field comes back with what was typed.',
                            'After process death and restoration the answer is the same: remember empty, rememberSaveable restored — because the Bundle is what survives both.'
                        ],
                        explain: '<p><code>remember</code> survives <strong>recomposition</strong>. <code>rememberSaveable</code> survives <strong>recreation</strong>. Those are two different lifetimes and the similar names hide it.</p><p>The cost is that <code>rememberSaveable</code> can only store what a <code>Bundle</code> can hold — primitives, <code>Parcelable</code>, or a type you give a custom <code>Saver</code>. That constraint is the reason not to use it for everything.</p><p>Screen state large enough to matter belongs in a <code>ViewModel</code>, which survives rotation without a <code>Bundle</code> — but not process death, which is why the two mechanisms coexist rather than one replacing the other.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'mutablestateof-a-list-misses-mutation',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>Two lists, two ways of adding to them. Which one redraws?</p>',
                    code: `@Composable
fun Lists() {
    val wrapped = remember { mutableStateOf(mutableListOf("a")) }
    val observed = remember { mutableStateListOf("a") }

    Column {
        Text("wrapped:  \${wrapped.value.size}")
        Text("observed: \${observed.size}")

        Button(onClick = { wrapped.value.add("b") })  { Text("add to wrapped") }
        Button(onClick = { observed.add("b") })       { Text("add to observed") }
    }
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'Tapping "add to wrapped" appends to the list. The list now genuinely has two items.',
                            'But the MutableState still points at the same list object, and .value was never assigned.',
                            'Nothing was written to observable state, so no recomposition is scheduled and the Text keeps showing 1.',
                            'Tapping "add to observed" appends to a SnapshotStateList, which records the mutation itself.',
                            'That write is observed, recomposition is scheduled, and the Text updates to 2.',
                            'Rotating or otherwise forcing a recomposition later would reveal the wrapped count jumping to 2 — the data was always correct, only the notification was missing.'
                        ],
                        explain: '<p><code>MutableState</code> observes <strong>assignments to <code>.value</code></strong>, not what happens inside the object it holds. Mutating a plain list through it is invisible.</p><p>Two fixes, and they are different designs. <code>mutableStateListOf</code> gives an observable collection that reports its own mutations. Or keep an immutable <code>List</code> and assign a new one — <code>wrapped.value = wrapped.value + "b"</code> — which is the approach that composes better with unidirectional data flow, because the state is then genuinely a value.</p><p>The last line is what makes this hard to spot: the bug presents as a stale screen that mysteriously corrects itself later.</p>'
                    },
                    distractor: '<p>Expecting both to redraw because both lists are inside a <code>remember</code>. <code>remember</code> controls lifetime; it has nothing to do with change notification.</p>'
                }
            ],
            docs: [
                { title: 'State and Jetpack Compose', path: '/develop/ui/compose/state', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-remember-vs-saveable' },
                { topicId: 'jetpack-compose', questionId: 'compose-state-management' }
            ]
        },

        {
            id: 'when-effects-run',
            title: 'When each effect runs, and how many times',
            importance: 'must-know',
            summary: 'Effects register during composition and run after it commits. Which one you pick, and what you key it on, decides whether it runs once or on every frame.',
            interviewAngle: 'The sources converge on execution order here: registered during composition, executed after commit, restarted on key change. Being able to say what a constant key means is the part that separates users from readers.',
            buildsOn: ['what-survives-a-recomposition'],
            blocks: [
                {
                    type: 'predict',
                    id: 'launchedeffect-unit-runs-once-per-enter',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>The key is <code>Unit</code> and the screen is shown for user A, then the same screen is shown for user B. How many loads happen?</p>',
                    code: `@Composable
fun Profile(userId: String, vm: ProfileViewModel) {
    LaunchedEffect(Unit) {
        vm.load(userId)
    }

    Text("showing \$userId")
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'Profile("A") composes. The effect is registered during composition and does not run yet.',
                            'Composition commits. Only now does the coroutine start, and vm.load("A") runs.',
                            'Any number of recompositions follow — the key Unit never changes, so the effect is not restarted.',
                            'userId changes to "B". Profile recomposes and the Text updates to "showing B".',
                            'The effect does NOT restart, because its key is still Unit. vm.load("B") is never called.',
                            'The screen now shows B’s name over A’s data, and stays that way until Profile leaves the composition and re-enters.'
                        ],
                        explain: '<p>Once. <code>LaunchedEffect(Unit)</code> means "once per entry into the composition", and that is exactly right for something that genuinely happens once — a one-off analytics event, a snackbar shown on arrival.</p><p>It is exactly wrong here. The effect depends on <code>userId</code> and does not say so, so it goes stale the moment the parameter changes. The key list is the dependency list, and <code>Unit</code> is a claim that there are no dependencies.</p><p>The fix is one character of meaning: <code>LaunchedEffect(userId)</code>.</p>'
                    },
                    distractor: '<p>Expecting two loads because the composable clearly ran again with a new argument. Recomposition and effect restart are separate things, decided by separate inputs.</p>'
                },
                {
                    type: 'predict',
                    id: 'changing-the-key-cancels-and-restarts',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>The key is fixed. The user switches from A to B while A’s five-second load is still running. What happens to the first coroutine?</p>',
                    code: `@Composable
fun Profile(userId: String, vm: ProfileViewModel) {
    LaunchedEffect(userId) {
        vm.load(userId)          // suspends for about five seconds
    }

    Text("showing \$userId")
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'Profile("A") commits. A coroutine starts and vm.load("A") begins suspending.',
                            'Two seconds later userId becomes "B". Profile recomposes.',
                            'Compose compares the new key with the old one and finds they differ.',
                            'The running coroutine is CANCELLED. load("A") stops where it was suspended; its result is never delivered.',
                            'A new coroutine is launched for the new key, and vm.load("B") begins.',
                            'Leaving the composition entirely cancels whatever is running, with no replacement.'
                        ],
                        explain: '<p>Cancelled, not left to finish. That is the whole value of keying correctly: the stale request cannot arrive after the fresh one and overwrite it, because it was stopped rather than raced.</p><p><code>LaunchedEffect</code> is a scope tied to a call site, and its cancellation is ordinary structured concurrency — the same machinery that makes <code>collectLatest</code> abandon in-flight work.</p><p>Which also means the load must be cooperatively cancellable. A suspending Retrofit call is; a <code>Thread.sleep</code> in the middle of it is not.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'sideeffect-runs-every-successful-composition',
                    importance: 'should-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>Three effects in one composable, and the screen recomposes four times. How many times does each run?</p>',
                    code: `@Composable
fun Screen(count: Int) {
    LaunchedEffect(Unit) { analytics.screenView() }
    SideEffect            { analytics.setCurrentCount(count) }

    Text("count = \$count")
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'First composition: both are registered, and neither has run yet.',
                            'Composition commits. LaunchedEffect starts its coroutine and screenView() runs once.',
                            'SideEffect runs too, and setCurrentCount is called with the first count.',
                            'Recomposition 2, 3 and 4: LaunchedEffect does not restart, because Unit has not changed.',
                            'SideEffect runs after every single one of them — four calls to setCurrentCount in total.',
                            'A composition that is started and then abandoned commits nothing, so neither effect runs for it.'
                        ],
                        explain: '<p><code>SideEffect</code> has no keys and no coroutine. It is the hook for "publish this value to something that is not Compose, every time the composition succeeds" — updating a non-Compose object that needs the current state.</p><p>The distinction that matters is <em>successful</em>. Compose may start a composition and throw it away; neither effect runs for an abandoned one, which is what makes both safe places to do something with a visible consequence.</p>'
                    },
                    distractor: '<p>Expecting <code>SideEffect</code> to be the "run once" one because it has no key list. No keys means no restart condition to fail, so it runs every time.</p>'
                },
                {
                    type: 'predict',
                    id: 'disposableeffect-disposes-before-it-restarts',
                    importance: 'should-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>The key changes from A to B. In what order do register and unregister happen?</p>',
                    code: `@Composable
fun Listener(target: String) {
    DisposableEffect(target) {
        val listener = register(target)
        onDispose { unregister(listener) }
    }
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'First composition commits. register("A") runs. The onDispose block is stored, not run.',
                            'target becomes "B" and the composable recomposes.',
                            'onDispose runs FIRST — unregister is called for A’s listener.',
                            'Only then does the effect body run again, and register("B") is called.',
                            'Leaving the composition runs onDispose one final time, with no re-registration after it.',
                            'So there is never a moment where both listeners are registered.'
                        ],
                        explain: '<p>Dispose then register, always in that order, which is the guarantee that makes the effect leak-proof: a listener, a callback, or a broadcast receiver registered here cannot accumulate.</p><p><code>DisposableEffect</code> is the one to reach for whenever the setup has a matching teardown. <code>LaunchedEffect</code> covers the case where the teardown is just "cancel the coroutine", because cancellation already is the cleanup.</p>'
                    }
                }
            ],
            docs: [
                { title: 'Side-effects in Compose', path: '/develop/ui/compose/side-effects', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-launched-vs-disposable' },
                { topicId: 'jetpack-compose', questionId: 'compose-side-effects' }
            ]
        },

        {
            id: 'what-actually-recomposes',
            title: 'Where you read state decides what recomposes',
            importance: 'must-know',
            summary: 'Compose invalidates the scope that read the state. Reading it higher up than you need is what turns a one-line update into a whole-screen redraw.',
            interviewAngle: 'Recomposition scope is the performance question, and the answer that lands is that you control it by moving the read rather than by adding keys.',
            buildsOn: ['when-effects-run'],
            blocks: [
                {
                    type: 'predict',
                    id: 'where-you-read-state-decides-what-recomposes',
                    importance: 'must-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>Two versions of the same screen. When <code>count</code> changes, what recomposes in each?</p>',
                    code: `// Version 1 — the value is read in the parent
@Composable
fun ScreenA(count: Int) {
    Column {
        ExpensiveHeader()
        Text("count = \$count")
    }
}

// Version 2 — the read is deferred into the child
@Composable
fun ScreenB(count: () -> Int) {
    Column {
        ExpensiveHeader()
        Text("count = \${count()}")
    }
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'Version 1: count is a parameter of ScreenA, so a change to it means ScreenA itself is called again.',
                            'Everything in ScreenA’s body is re-invoked, including ExpensiveHeader().',
                            'ExpensiveHeader takes no parameters, so Compose can skip its body — but only if it is skippable, and it was still visited.',
                            'Version 2: ScreenB takes a lambda whose identity does not change, so ScreenB is not invalidated at all.',
                            'The state is read inside the Text lambda, so the recomposition scope is that Text and nothing else.',
                            'ExpensiveHeader is never revisited.'
                        ],
                        explain: '<p>Compose records, per scope, which state objects were read while that scope was running. When one of them changes it invalidates <strong>the scopes that read it</strong> — so the read location, not the data flow, decides the blast radius.</p><p>Passing a lambda instead of a value is the standard way to push a read downwards. It is why <code>Modifier.offset { }</code> exists alongside <code>Modifier.offset()</code>: the lambda version defers the read to the layout phase, so a value changing every frame does not recompose anything at all.</p><p>This is a targeted fix for a measured problem, not a style to apply everywhere — the indirection costs readability.</p>'
                    },
                    distractor: '<p>Assuming a child that takes no parameters cannot be affected. It is still visited; whether its body re-runs depends on it being skippable, which depends on its parameters all being stable.</p>'
                },
                {
                    type: 'predict',
                    id: 'derivedstateof-cuts-the-recomposition-count',
                    importance: 'should-know',
                    language: 'kotlin',
                    unrunnable: COMPOSE_UNRUNNABLE,
                    prompt: '<p>The user scrolls through 40 items. How many times does each version recompose the button?</p>',
                    code: `// Version 1
@Composable
fun ScrollToTopA(state: LazyListState) {
    val show = state.firstVisibleItemIndex > 0
    if (show) ScrollToTopButton()
}

// Version 2
@Composable
fun ScrollToTopB(state: LazyListState) {
    val show by remember { derivedStateOf { state.firstVisibleItemIndex > 0 } }
    if (show) ScrollToTopButton()
}`,
                    output: {
                        kind: 'trace',
                        lines: [
                            'Version 1 reads firstVisibleItemIndex directly, so the composable is invalidated every time that index changes.',
                            'Scrolling past 40 items changes it roughly 40 times, so the composable recomposes roughly 40 times.',
                            'The boolean it computes changed exactly once — from false to true when the index left 0.',
                            'Version 2 reads the index inside derivedStateOf, so that read belongs to the derived state rather than to the composable.',
                            'derivedStateOf recomputes on every index change, but only notifies when its RESULT changes.',
                            'The composable is invalidated once. Thirty-nine recompositions do not happen.'
                        ],
                        explain: '<p>The rule of thumb is the shape of the data: use <code>derivedStateOf</code> when a state changes <strong>more often than the thing you derive from it</strong>. A scroll index against a boolean is the textbook case; a name against an uppercase name is not, because they change in lockstep and the wrapper only adds cost.</p><p>The <code>remember</code> is not optional. Without it the derived state is rebuilt on every recomposition and remembers nothing, which is the same failure as state without <code>remember</code> one chapter earlier.</p>'
                    },
                    distractor: '<p>Reading <code>derivedStateOf</code> as a caching or memoisation tool. It does not avoid the computation — it recomputes every time. What it avoids is the <em>notification</em>.</p>'
                }
            ],
            docs: [
                { title: 'Compose performance', path: '/develop/ui/compose/performance', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-recomposition' },
                { topicId: 'jetpack-compose', questionId: 'compose-derived-state-of' }
            ]
        }
    ]
};
