/* ==========================================================================
   M19 — State and recomposition.

   The module that decides whether a Compose codebase is fast or not.
   Stability lives here rather than in a performance appendix, because
   skipping is a correctness-shaped concern before it is a speed one.
   ========================================================================== */

const composeStateModule = {
    id: 'compose-state',
    trackId: 'ui',
    order: 19,
    title: 'State and Recomposition',
    tagline: 'State flows down, events flow up, and stability decides what gets skipped.',
    estimatedMinutes: 35,
    prerequisites: ['compose-mental-model', 'reactive-state'],
    docHub: {
        title: 'State and Jetpack Compose',
        path: '/develop/ui/compose/state'
    },

    chapters: [
        {
            id: 'state-and-remember',
            title: 'State, remember and rememberSaveable',
            importance: 'must-know',
            summary: 'mutableStateOf makes a value observable; remember makes it survive recomposition; rememberSaveable makes it survive process death.',
            interviewAngle: 'The remember-versus-rememberSaveable comparison is standard. The sharper question is what happens if you omit remember entirely.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Three separate jobs get conflated into one line of idiomatic Compose, and separating them is most of the understanding.</p>'
                },
                {
                    type: 'types',
                    title: 'The three pieces of `var x by remember { mutableStateOf(0) }`',
                    items: [
                        { name: 'mutableStateOf(0)', html: '<p>Creates an observable holder. Reads are tracked, writes trigger recomposition of whatever read it.</p>' },
                        { name: 'remember { … }', html: '<p>Stores the result in the composition at this call site, so the next recomposition gets the same object instead of a fresh one.</p>' },
                        { name: 'by', html: '<p>Property delegation from M5 — turns <code>state.value</code> into <code>state</code>.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'What each part contributes',
                    code: `@Composable
fun Counter() {
    // Without remember: a new MutableState every recomposition, so the
    // value resets and the counter never appears to increment.
    // var count by mutableStateOf(0)

    var count by remember { mutableStateOf(0) }          // survives recomposition
    var name  by rememberSaveable { mutableStateOf("") } // also survives process death

    Button(onClick = { count++ }) { Text("Count: \$count") }
}

// remember with keys: recompute when the key changes, keep otherwise.
@Composable
fun Formatted(value: Double, locale: Locale) {
    val formatter = remember(locale) { NumberFormat.getInstance(locale) }
    Text(formatter.format(value))
}`,
                    notes: 'Omitting <code>remember</code> is the classic beginner bug: the state is recreated on every recomposition, so it appears never to change.'
                },
                {
                    type: 'comparison',
                    title: 'remember versus rememberSaveable',
                    left: 'remember',
                    right: 'rememberSaveable',
                    rows: [
                        { aspect: 'Survives recomposition', left: 'Yes', right: 'Yes' },
                        { aspect: 'Survives configuration change', left: 'No', right: 'Yes' },
                        { aspect: 'Survives process death', left: 'No', right: 'Yes' },
                        { aspect: 'Storage', left: 'The composition', right: 'A <code>Bundle</code>, via saved instance state' },
                        { aspect: 'Type limits', left: 'Anything', right: 'Must be <code>Parcelable</code> or have a <code>Saver</code>' },
                        { aspect: 'Right for', left: 'Derived or cheap-to-rebuild UI state', right: 'Scroll position, text input, expanded/collapsed' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p><code>rememberSaveable</code> writes into the same <code>Bundle</code> as <code>onSaveInstanceState</code>, which has a hard size limit enforced by the Binder transaction. Storing a list of results there risks <code>TransactionTooLargeException</code> — that data belongs in a <code>ViewModel</code> or a repository, not in saved state.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>There are other holders worth naming. <code>mutableStateListOf</code> and <code>mutableStateMapOf</code> are observable collections — mutating them triggers recomposition, where a plain <code>MutableList</code> inside a <code>mutableStateOf</code> would not. And <code>mutableIntStateOf</code> avoids boxing for primitives, which matters in a list.</p>'
                }
            ],
            docs: [
                { title: 'State and Jetpack Compose', path: '/develop/ui/compose/state', kind: 'guide' },
                { title: 'Save UI state in Compose', path: '/develop/ui/compose/state-saving', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-state' },
                { topicId: 'jetpack-compose', questionId: 'compose-mutable-state' },
                { topicId: 'jetpack-compose', questionId: 'compose-remember-vs-saveable' },
                { topicId: 'jetpack-compose', questionId: 'compose-orientation-changes' }
            ]
        },

        {
            id: 'hoisting-and-udf',
            title: 'State hoisting and unidirectional data flow',
            importance: 'must-know',
            summary: 'Move state up to the lowest common ancestor that needs it; pass values down and events up.',
            interviewAngle: '"What is state hoisting?" then "how do you decide how far up?" The second is where the reasoning shows.',
            buildsOn: ['state-and-remember'],
            blocks: [
                {
                    type: 'definition',
                    term: 'State hoisting',
                    important: true,
                    html: '<p>Moving state out of a composable and into its caller, replacing it with a <strong>value</strong> parameter and an <strong>event</strong> callback. The composable becomes stateless: it renders what it is given and reports what happened.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Stateful wrapper, stateless content',
                    code: `// Stateless: testable, previewable, reusable. No memory of its own.
@Composable
fun SearchField(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    TextField(value = query, onValueChange = onQueryChange, modifier = modifier)
}

// Stateful: owns the state and delegates rendering.
@Composable
fun SearchFieldWithState() {
    var query by rememberSaveable { mutableStateOf("") }
    SearchField(query = query, onQueryChange = { query = it })
}`,
                    notes: 'The pairing is the convention: a stateless composable that takes value + callback, and a thin stateful wrapper. Tests and <code>@Preview</code> use the stateless one.'
                },
                {
                    type: 'types',
                    title: 'How far up to hoist',
                    items: [
                        { name: 'To the lowest common ancestor', html: '<p>State should live at the lowest level that all its readers and writers can see. Higher than that and unrelated subtrees recompose; lower and someone cannot reach it.</p>' },
                        { name: 'To the ViewModel', html: '<p>When the state outlives the composition — it survives configuration change, is fetched from a repository, or is business state rather than UI state.</p>' },
                        { name: 'Keep it local', html: '<p>Genuinely UI-only state — whether a dropdown is expanded, an animation’s progress — belongs where it is used. Hoisting it to a ViewModel is over-engineering.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The result is <strong>unidirectional data flow</strong>: state descends from a single owner, events ascend to it, and there is exactly one place that can change any given value. That is the same shape as M11’s <code>StateFlow</code> in a <code>ViewModel</code> — Compose did not invent it, it just makes the alternative hard to write.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>A useful heuristic to say out loud: <em>"if it would be wrong to lose it on rotation, it belongs in the ViewModel; if losing it would be fine, keep it in the composable."</em></p>'
                }
            ],
            docs: [
                { title: 'State hoisting', path: '/develop/ui/compose/state-hoisting', kind: 'guide' },
                { title: 'State holders and UI state', path: '/topic/architecture/ui-layer/stateholders', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-state-hoisting' },
                { topicId: 'jetpack-compose', questionId: 'compose-stateful-vs-stateless' },
                { topicId: 'jetpack-compose', questionId: 'compose-unidirectional-data-flow' },
                { topicId: 'jetpack-compose', questionId: 'compose-state-management' }
            ]
        },

        {
            id: 'stability-and-skipping',
            title: 'Stability and skipping',
            importance: 'must-know',
            summary: 'Compose skips a composable when it can prove the parameters have not changed — and it cannot always prove it.',
            interviewAngle: 'The senior Compose question. "Why does this composable recompose when nothing changed?" is almost always an unstable parameter.',
            buildsOn: ['hoisting-and-udf'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Recomposition is cheap because most composables are <strong>skipped</strong>. Compose skips one when every parameter is equal to last time — but that requires knowing that equality is meaningful, which is not true of every type.</p>'
                },
                {
                    type: 'definition',
                    term: 'Stable type',
                    important: true,
                    html: '<p>A type whose <code>equals</code> is a reliable indicator of whether the UI would change, and which notifies Compose if any public property it exposes changes. Primitives, <code>String</code>, function types and immutable data classes of stable types all qualify.</p>'
                },
                {
                    type: 'table',
                    title: 'What Compose infers',
                    headers: ['Type', 'Stable?', 'Why'],
                    rows: [
                        ['<code>Int</code>, <code>String</code>, <code>Boolean</code>', 'Yes', 'Immutable primitives'],
                        ['<code>data class</code> of <code>val</code> stable types', 'Yes', 'Cannot change; equality is meaningful'],
                        ['A class with a <code>var</code> property', 'No', 'Can change without telling Compose'],
                        ['<code>List</code>, <code>Map</code>, <code>Set</code>', 'No', 'The interface is read-only, but the instance may be a <code>MutableList</code>'],
                        ['<code>ImmutableList</code> (kotlinx.collections.immutable)', 'Yes', 'Immutability is in the type'],
                        ['Lambdas', 'Usually', 'Capture-free lambdas are memoised by the compiler'],
                        ['Interfaces', 'No', 'The implementation is unknown at compile time']
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>The <code>List</code> row is the one that surprises everyone. <code>List&lt;Item&gt;</code> is read-only but not immutable — the runtime instance could be a <code>MutableList</code> someone else is writing to (exactly the M4 point). So a composable taking a <code>List</code> parameter <strong>never skips</strong>, and a list screen recomposes on every unrelated state change.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Three ways to make it skippable',
                    code: `// Never skips: List is not stable.
@Composable
fun ItemList(items: List<Item>) { /* … */ }

// 1. kotlinx.collections.immutable — immutability in the type
@Composable
fun ItemList(items: ImmutableList<Item>) { /* … */ }

// 2. Annotate when you know the contract holds and Compose cannot infer it
@Immutable
data class ItemsUiState(val items: List<Item>)

@Composable
fun ItemList(state: ItemsUiState) { /* … */ }

// 3. Stability configuration file (Compose compiler) for types you do
//    not own — listed in a .conf file referenced from the Gradle config.`,
                    notes: '<code>@Immutable</code> is a <em>promise</em>, not a check. Annotating a type whose contents actually change gives you a UI that silently stops updating.'
                },
                {
                    type: 'comparison',
                    title: '@Stable versus @Immutable',
                    left: '@Stable',
                    right: '@Immutable',
                    rows: [
                        { aspect: 'Promises', left: 'Changes are notified to Compose', right: 'Nothing ever changes after construction' },
                        { aspect: 'Properties may change', left: 'Yes, if observable', right: 'No' },
                        { aspect: 'Example', left: 'A class holding <code>MutableState</code>', right: 'A data class of vals' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Do not guess at this. The Compose compiler emits stability metrics — a report listing every composable as skippable or not, and every class as stable or not. Saying "I would check the compiler metrics rather than guess" is a strong answer to any Compose performance question.</p>'
                }
            ],
            docs: [
                { title: 'Compose performance', path: '/develop/ui/compose/performance', kind: 'guide' },
                { title: 'Stability in Compose', path: '/develop/ui/compose/performance/stability', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-performance-optimization' },
                { topicId: 'jetpack-compose', questionId: 'compose-recomposition' }
            ]
        },

        {
            id: 'derived-and-external-state',
            title: 'derivedStateOf and bringing state in',
            importance: 'must-know',
            summary: 'derivedStateOf narrows a noisy state into a quiet one; collectAsStateWithLifecycle brings a Flow into composition.',
            interviewAngle: 'derivedStateOf is frequently misused as a memo. Knowing when it is *not* the answer is the discriminating detail.',
            buildsOn: ['stability-and-skipping'],
            blocks: [
                {
                    type: 'definition',
                    term: 'derivedStateOf',
                    important: true,
                    html: '<p>Creates a state whose value is computed from other state, and which only notifies readers when the <strong>computed result</strong> changes. It converts a frequently-changing input into a rarely-changing output.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The canonical use, and the common misuse',
                    code: `// RIGHT: scroll position changes every frame; showButton changes twice.
val showButton by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
}

// WRONG: derivedStateOf here is pure overhead. The output changes exactly
// as often as the input, so there is nothing to narrow — use remember(key).
val upper by remember { derivedStateOf { name.uppercase() } }

// RIGHT for that case:
val upper = remember(name) { name.uppercase() }`,
                    notes: 'The test: does the output change <em>less often</em> than the input? If yes, <code>derivedStateOf</code>. If it changes just as often, <code>remember</code> with a key.'
                },
                {
                    type: 'types',
                    title: 'Bringing external state into composition',
                    items: [
                        {
                            name: 'collectAsStateWithLifecycle()',
                            html: '<p>Collects a <code>Flow</code> and stops while the lifecycle is below STARTED. <strong>The correct default on Android.</strong></p>',
                            whenToUse: 'always, for a Flow from a ViewModel'
                        },
                        {
                            name: 'collectAsState()',
                            html: '<p>Collects for as long as the composition exists, with no lifecycle awareness — it keeps collecting behind a backgrounded screen.</p>',
                            whenToUse: 'non-Android Compose, or a flow with no upstream cost'
                        },
                        {
                            name: 'produceState',
                            html: '<p>Turns a non-Compose async source into <code>State</code>, running a coroutine scoped to the composition.</p>'
                        },
                        {
                            name: 'snapshotFlow',
                            html: '<p>The reverse direction — turns Compose <code>State</code> reads into a <code>Flow</code>, so you can apply operators like <code>debounce</code> from M10.</p>'
                        }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The lifecycle distinction is the same one M11 made about <code>repeatOnLifecycle</code>, arriving in Compose clothing. <code>collectAsState</code> keeps the upstream flow alive while the user is elsewhere; <code>collectAsStateWithLifecycle</code> does not. It ships in <code>lifecycle-runtime-compose</code>, and its absence is one of the more common review comments on Compose code.</p>'
                }
            ],
            docs: [
                { title: 'State and Jetpack Compose', path: '/develop/ui/compose/state', kind: 'guide' },
                { title: 'Use Kotlin coroutines with lifecycle-aware components', path: '/topic/libraries/architecture/coroutines', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-derived-state-of' },
                { topicId: 'jetpack-compose', questionId: 'compose-observe-flows-livedata' },
                { topicId: 'jetpack-compose', questionId: 'compose-non-compose-state' }
            ]
        }
    ]
};
