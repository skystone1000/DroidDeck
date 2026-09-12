/* ==========================================================================
   M20 — Side effects and effect handlers.

   Composables must be side-effect free (M18). This module is where the side
   effects go instead, and the key-behaviour table is the thing that gets
   asked.
   ========================================================================== */

const composeSideEffectsModule = {
    id: 'compose-side-effects',
    trackId: 'ui',
    order: 20,
    title: 'Side Effects',
    tagline: 'Composition is not the place for effects. These APIs are.',
    estimatedMinutes: 25,
    prerequisites: ['compose-state', 'structured-concurrency'],
    docHub: {
        title: 'Side-effects in Compose',
        path: '/develop/ui/compose/side-effects'
    },

    chapters: [
        {
            id: 'why-effects-need-apis',
            title: 'Why effects need their own APIs',
            importance: 'must-know',
            summary: 'A composable can run at any time, any number of times, in any order — so an effect written inline runs at all of those times too.',
            interviewAngle: '"What are side effects in Compose?" The definition is easy; the reason they need special handling is the answer.',
            buildsOn: [],
            blocks: [
                {
                    type: 'definition',
                    term: 'Side effect',
                    important: true,
                    html: '<p>Any change to state outside the scope of the composable — starting a network call, showing a snackbar, writing to a repository, registering a listener, logging. Anything the composition itself does not own.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>M18 established that a composable must be side-effect free, and the reason is now concrete. Compose may recompose a function many times per second, skip it, restart it, or run it in parallel with its siblings. An effect written directly in the body inherits all of that.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The bug, and the fix',
                    code: `// Broken: fires on every recomposition — which is unbounded.
@Composable
fun Screen(userId: String, viewModel: VM) {
    viewModel.load(userId)          // network call, per recomposition
    val state by viewModel.state.collectAsStateWithLifecycle()
    Content(state)
}

// Fixed: runs once when Screen enters composition, and again only if
// userId changes.
@Composable
fun Screen(userId: String, viewModel: VM) {
    LaunchedEffect(userId) {
        viewModel.load(userId)
    }
    val state by viewModel.state.collectAsStateWithLifecycle()
    Content(state)
}`,
                    notes: 'The effect APIs all do the same two things: tie the effect to the composable’s presence in the composition, and give you control over when it restarts.'
                },
                {
                    type: 'pitfall',
                    html: '<p>The broken version often <em>appears</em> to work in development — the screen loads, the data arrives. It fails as a duplicated network call, a doubled analytics event, or an infinite loop when the call updates state that triggers the recomposition that fires the call again.</p>'
                }
            ],
            docs: [
                { title: 'Side-effects in Compose', path: '/develop/ui/compose/side-effects', kind: 'guide' },
                { title: 'Thinking in Compose', path: '/develop/ui/compose/mental-model', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-side-effects' }
            ]
        },

        {
            id: 'the-effect-handlers',
            title: 'The effect handlers',
            importance: 'must-know',
            summary: 'Six APIs, distinguished by when they run, whether they get a coroutine scope, and what a key change does.',
            interviewAngle: 'The LaunchedEffect versus DisposableEffect comparison is near-guaranteed; rememberUpdatedState is the senior follow-up.',
            buildsOn: ['why-effects-need-apis'],
            blocks: [
                {
                    type: 'table',
                    title: 'The whole set, in one table',
                    headers: ['API', 'Runs', 'Coroutine?', 'On key change'],
                    rows: [
                        ['<code>LaunchedEffect(key)</code>', 'On entering composition', 'Yes', 'Cancels and restarts'],
                        ['<code>DisposableEffect(key)</code>', 'On entering composition', 'No', 'Disposes, then re-runs'],
                        ['<code>SideEffect</code>', 'After every successful composition', 'No', 'n/a — no keys'],
                        ['<code>rememberCoroutineScope()</code>', 'n/a — returns a scope', 'Yes', 'n/a'],
                        ['<code>rememberUpdatedState(v)</code>', 'n/a — returns a State', 'No', 'n/a'],
                        ['<code>produceState</code>', 'On entering composition', 'Yes', 'Cancels and restarts']
                    ]
                },
                {
                    type: 'types',
                    title: 'What each is for',
                    items: [
                        {
                            name: 'LaunchedEffect',
                            html: '<p>Runs a suspending block scoped to the composition. Cancelled when the composable leaves, restarted when a key changes.</p>',
                            whenToUse: 'load on first display, show a snackbar, animate on a state change'
                        },
                        {
                            name: 'DisposableEffect',
                            html: '<p>For effects that need <strong>cleanup</strong>. Its block must end in <code>onDispose { }</code>.</p>',
                            whenToUse: 'registering a listener, a lifecycle observer, a broadcast receiver'
                        },
                        {
                            name: 'SideEffect',
                            html: '<p>Publishes Compose state to a non-Compose object after each successful composition. Deliberately has no keys — it runs every time.</p>',
                            whenToUse: 'handing a value to an analytics or legacy object that is not Compose-aware'
                        },
                        {
                            name: 'rememberCoroutineScope',
                            html: '<p>A scope tied to the composition that you launch into from a <strong>callback</strong> — you cannot call a suspend function from <code>onClick</code> directly.</p>',
                            whenToUse: 'scrolling a list or showing a snackbar in response to a click'
                        },
                        {
                            name: 'rememberUpdatedState',
                            html: '<p>Captures the latest value of something inside a long-running effect that must <strong>not</strong> restart.</p>',
                            whenToUse: 'a callback that may change while a timer or animation is running'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'DisposableEffect and rememberCoroutineScope',
                    code: `// Register and unregister with the composable's presence.
@Composable
fun LifecycleLogger(owner: LifecycleOwner) {
    DisposableEffect(owner) {
        val observer = LifecycleEventObserver { _, event -> Log.d("app", "\$event") }
        owner.lifecycle.addObserver(observer)

        onDispose { owner.lifecycle.removeObserver(observer) }   // required
    }
}

// A suspend call from a click — onClick is not a coroutine.
@Composable
fun ScrollToTop(listState: LazyListState) {
    val scope = rememberCoroutineScope()
    Button(onClick = { scope.launch { listState.animateScrollToItem(0) } }) {
        Text("Top")
    }
}`
                },
                {
                    type: 'comparison',
                    title: 'LaunchedEffect versus rememberCoroutineScope',
                    left: 'LaunchedEffect',
                    right: 'rememberCoroutineScope',
                    rows: [
                        { aspect: 'Started by', left: 'Entering composition', right: 'You, from a callback' },
                        { aspect: 'Callable from', left: 'The composable body', right: 'Anywhere you hold the scope' },
                        { aspect: 'Restarts', left: 'On key change', right: 'Never — you control it' },
                        { aspect: 'Right for', left: 'Effects driven by state', right: 'Effects driven by events' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Calling <code>rememberCoroutineScope()</code> inside a <code>LaunchedEffect</code>, or launching from the composable body rather than from a callback, both defeat the point. The rule: state drives <code>LaunchedEffect</code>, events drive the remembered scope.</p>'
                }
            ],
            docs: [
                { title: 'Side-effects in Compose', path: '/develop/ui/compose/side-effects', kind: 'guide' },
                { title: 'Lifecycle of composables', path: '/develop/ui/compose/lifecycle', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-launched-vs-disposable' },
                { topicId: 'jetpack-compose', questionId: 'compose-remember-coroutine-scope' },
                { topicId: 'jetpack-compose', questionId: 'compose-async-operations' }
            ]
        },

        {
            id: 'keys-and-restarting',
            title: 'Keys, and the restart problem',
            importance: 'must-know',
            summary: 'A key change cancels and restarts the effect — which is right for inputs and wrong for callbacks.',
            interviewAngle: 'rememberUpdatedState only makes sense once you can state the problem it solves. That is the question.',
            buildsOn: ['the-effect-handlers'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Every keyed effect faces the same tension. Pass <code>Unit</code> as the key and the effect never restarts — but it also captures its parameters at the moment it started, and those go stale. Pass the changing value as a key and it stays fresh — but restarts, throwing away whatever was in progress.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Both wrong answers, then the right one',
                    code: `// Wrong 1: onTimeout is captured once and goes stale. If the parent
// passes a new lambda, the timer still calls the original.
@Composable
fun Timer(onTimeout: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(5_000)
        onTimeout()
    }
}

// Wrong 2: fresh, but the lambda is a new instance on every recomposition,
// so the timer restarts constantly and never reaches five seconds.
@Composable
fun Timer(onTimeout: () -> Unit) {
    LaunchedEffect(onTimeout) {
        delay(5_000)
        onTimeout()
    }
}

// Right: the effect never restarts, and the callback is always current.
@Composable
fun Timer(onTimeout: () -> Unit) {
    val currentOnTimeout by rememberUpdatedState(onTimeout)

    LaunchedEffect(Unit) {
        delay(5_000)
        currentOnTimeout()
    }
}`,
                    notes: '<code>rememberUpdatedState</code> holds a <code>State</code> that is rewritten on each recomposition. The effect reads it at the moment it fires, so it sees the latest value without ever having been restarted.'
                },
                {
                    type: 'types',
                    title: 'Choosing a key',
                    items: [
                        { name: 'A value the effect depends on', html: '<p>The effect should restart when it changes — a <code>userId</code> whose data must be reloaded.</p>' },
                        { name: 'Unit or true', html: '<p>Run once for the lifetime of this composable. Combine with <code>rememberUpdatedState</code> for anything captured that may change.</p>' },
                        { name: 'Several keys', html: '<p><code>LaunchedEffect(a, b)</code> restarts if either changes.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Passing an unstable object as a key — a <code>List</code>, or a lambda that captures — restarts the effect on nearly every recomposition, because a new instance is not equal to the old one. This is the M19 stability problem showing up as an effect that never completes.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>State the trade-off out loud and the answer is complete: <em>"keys control restarting. Key on what the effect depends on; for a captured callback that must stay fresh without restarting, use <code>rememberUpdatedState</code>."</em></p>'
                }
            ],
            docs: [
                { title: 'Side-effects in Compose', path: '/develop/ui/compose/side-effects', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-remember-updated-state' }
            ]
        }
    ]
};
