/* ==========================================================================
   M18 — Thinking in Compose.

   Opens the UI track. Everything here is the mental model; the state APIs
   that follow in M19 only make sense once recomposition does.
   ========================================================================== */

const composeMentalModelModule = {
    id: 'compose-mental-model',
    trackId: 'ui',
    order: 18,
    title: 'Thinking in Compose',
    tagline: 'You describe the UI for a state. The runtime works out the difference.',
    estimatedMinutes: 30,
    prerequisites: ['kotlin-functions'],
    docHub: {
        title: 'Thinking in Compose',
        path: '/develop/ui/compose/mental-model'
    },

    chapters: [
        {
            id: 'declarative-vs-imperative',
            title: 'Declarative versus imperative UI',
            importance: 'must-know',
            summary: 'Instead of mutating a view tree, you describe what the UI should look like for the current state.',
            interviewAngle: 'Nearly always the opening Compose question. The weak answer is "less code"; the strong one is about who owns consistency.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>In the View system you build a tree once from XML and then <em>mutate</em> it: <code>findViewById</code>, <code>setText</code>, <code>setVisibility</code>. Every piece of state has to be pushed into the right widget by hand, and every path through the code has to remember to do it. The bug is always the same shape — one branch forgets, and the UI shows something that is no longer true.</p><p>In Compose you write a function that describes the UI <strong>for a given state</strong>. When the state changes the function runs again, and the runtime works out what actually changed.</p>'
                },
                {
                    type: 'comparison',
                    title: 'The two models',
                    left: 'Imperative (Views)',
                    right: 'Declarative (Compose)',
                    rows: [
                        { aspect: 'You write', left: 'How to change the UI', right: 'What the UI is for this state' },
                        { aspect: 'UI tree', left: 'Built once, mutated', right: 'Described, rebuilt conceptually' },
                        { aspect: 'Consistency', left: 'Your responsibility', right: 'The runtime’s' },
                        { aspect: 'State lives', left: 'In the widgets, and also in your model', right: 'In one place, read by the UI' },
                        { aspect: 'Typical bug', left: 'A branch that forgot to update a view', right: 'A state read the runtime cannot see' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Notice the last row. Compose does not remove bugs, it moves them. The View system’s failure is stale UI; Compose’s failure is a recomposition that does not happen, or one that happens far more often than it should. Both later chapters in this track are about that.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The same screen, both ways',
                    code: `// Imperative: every state change must be pushed into the widget.
fun render(state: UiState) {
    when (state) {
        is Loading -> {
            progress.visibility = View.VISIBLE
            list.visibility = View.GONE
            error.visibility = View.GONE          // easy to forget one
        }
        is Loaded -> {
            progress.visibility = View.GONE
            list.visibility = View.VISIBLE
            error.visibility = View.GONE
            adapter.submitList(state.items)
        }
    }
}

// Declarative: the description IS the update.
@Composable
fun Screen(state: UiState) {
    when (state) {
        is Loading -> CircularProgressIndicator()
        is Loaded  -> ItemList(state.items)
        is Error   -> ErrorMessage(state.cause)
    }
}`,
                    notes: 'There is no branch that can forget to hide something, because nothing was shown in the first place — the description is complete by construction.'
                },
                {
                    type: 'tip',
                    html: '<p>The line that lands: <em>"In Views I tell the UI how to change. In Compose I describe what it should be, and the runtime figures out the change. That moves consistency from my responsibility to the framework’s."</em></p>'
                }
            ],
            docs: [
                { title: 'Thinking in Compose', path: '/develop/ui/compose/mental-model', kind: 'guide' },
                { title: 'Compose for UI', path: '/compose', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-declarative-ui' },
                { topicId: 'jetpack-compose', questionId: 'compose-declarative-vs-imperative' },
                { topicId: 'jetpack-compose', questionId: 'compose-vs-view-system' }
            ]
        },

        {
            id: 'composable-functions',
            title: 'Composable functions',
            importance: 'must-know',
            summary: 'A @Composable function emits UI rather than returning it, and the compiler gives it a memory of where it is in the tree.',
            interviewAngle: '"What does the @Composable annotation actually do?" — the answer is a compiler plugin and an implicit Composer parameter.',
            buildsOn: ['declarative-vs-imperative'],
            blocks: [
                {
                    type: 'definition',
                    term: '@Composable',
                    important: true,
                    html: '<p>An annotation processed by the Compose compiler plugin. It changes the function’s calling convention: the compiler adds a hidden <code>Composer</code> parameter and a group key identifying the call site. A composable <strong>emits</strong> UI into the composition rather than returning a view object.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The mechanism is the same shape as <code>suspend</code> from M8: an annotation whose real effect is a compiler transform adding a hidden parameter. <code>suspend</code> gets a <code>Continuation</code>; <code>@Composable</code> gets a <code>Composer</code>. In both cases the annotation is not metadata — it is a different calling convention.</p>'
                },
                {
                    type: 'definition',
                    term: 'Positional memoisation',
                    html: '<p>The runtime identifying a piece of composition by <strong>where it is called</strong> rather than by an identity you supply. That call-site identity is what lets <code>remember</code> retrieve the same value across recompositions without any key.</p>'
                },
                {
                    type: 'types',
                    title: 'Rules a composable must follow',
                    items: [
                        { name: 'Side-effect free', html: '<p>The function body must not modify anything outside itself. It may run at any time, in any order, and be skipped or re-run repeatedly.</p>' },
                        { name: 'Fast', html: '<p>It can run on every frame. Anything expensive belongs in <code>remember</code>, or off the composition entirely.</p>' },
                        { name: 'Idempotent', html: '<p>Called twice with the same inputs it must produce the same UI.</p>' },
                        { name: 'Order-independent', html: '<p>Sibling composables may execute in any order, and potentially in parallel.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Those rules are not style advice. Compose reserves the right to run composables in parallel, to skip them, and to run them out of order — so a composable that mutates a shared variable, writes to a repository or increments a counter is genuinely broken, not merely untidy. Effects have their own APIs, which is M20.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Emitting, not returning',
                    code: `// Composables return Unit and emit into the composition.
@Composable
fun Greeting(name: String) {
    Text("Hello, \$name")
}

// This is broken: it mutates state during composition.
@Composable
fun Broken(items: List<Item>) {
    var count = 0
    items.forEach { count++ }        // fine — local
    analytics.log("rendered")        // NOT fine — a side effect
    Text("\$count items")
}`,
                    notes: 'A composable naming convention worth following: composables that emit UI are PascalCase nouns and return <code>Unit</code>; those that return a value are camelCase, like <code>rememberScrollState()</code>.'
                }
            ],
            docs: [
                { title: 'Thinking in Compose', path: '/develop/ui/compose/mental-model', kind: 'guide' },
                { title: 'Lifecycle of composables', path: '/develop/ui/compose/lifecycle', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-composable-functions' },
                { topicId: 'jetpack-compose', questionId: 'compose-lifecycle' }
            ]
        },

        {
            id: 'the-three-phases',
            title: 'The three phases',
            importance: 'must-know',
            summary: 'Composition, layout and drawing — and the trick is arranging for a change to skip the earlier ones.',
            interviewAngle: 'Asked directly, and it is the foundation of every Compose performance answer.',
            buildsOn: ['composable-functions'],
            blocks: [
                {
                    type: 'types',
                    title: 'What each phase does',
                    items: [
                        { name: '1. Composition', html: '<p><em>What</em> to show. Composables run and build a tree of nodes describing the UI.</p>' },
                        { name: '2. Layout', html: '<p><em>Where</em> to put it. Each node measures its children, decides its own size, and places them. Single-pass: measure once, place once.</p>' },
                        { name: '3. Drawing', html: '<p><em>How</em> it looks. Each node renders into the canvas.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The phases run in that order, but a state change does not necessarily start at the top. Compose can skip straight to layout, or straight to drawing, depending on <strong>which phase reads the state</strong>. Getting a frequently-changing value to be read in a later phase is the single most effective Compose optimisation there is.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Deferring a state read to a later phase',
                    code: `// Reads offset during COMPOSITION: every scroll pixel recomposes.
@Composable
fun Bad(offset: State<Float>) {
    Box(Modifier.offset(y = offset.value.dp))
}

// Reads offset during LAYOUT: composition is skipped entirely.
@Composable
fun Good(offset: State<Float>) {
    Box(Modifier.offset { IntOffset(0, offset.value.roundToInt()) })
}

// Reads during DRAW: composition and layout are both skipped.
@Composable
fun Best(color: State<Color>) {
    Box(Modifier.drawBehind { drawRect(color.value) })
}`,
                    notes: 'The lambda-taking overloads of modifiers exist precisely for this. <code>Modifier.offset(y = …)</code> takes a value read at composition; <code>Modifier.offset { … }</code> takes a lambda invoked at layout.'
                },
                {
                    type: 'diagram',
                    diagramType: 'flowchart',
                    diagramConfig: {
                        title: 'Which phase a state read triggers',
                        columns: 3,
                        nodes: [
                            { label: 'State changes', type: 'terminal' },
                            { label: 'Read in composition?', type: 'decision' },
                            { label: 'Recompose' },
                            { label: 'Read in layout?', type: 'decision' },
                            { label: 'Re-layout' },
                            { label: 'Redraw only', type: 'terminal' }
                        ],
                        connections: [
                            { from: 0, to: 1 },
                            { from: 1, to: 2, label: 'yes' },
                            { from: 1, to: 3, label: 'no' },
                            { from: 3, to: 4, label: 'yes' },
                            { from: 3, to: 5, label: 'no' }
                        ]
                    }
                },
                {
                    type: 'prose',
                    html: '<p>Layout being <strong>single-pass</strong> is worth stating explicitly, because it is the structural difference from the View system. A View can be measured many times — nested weights in a <code>LinearLayout</code> measure children twice, and nesting those multiplies exponentially. A Compose layout measures each child exactly once, which is why deep nesting is not the performance concern it is in Views.</p>'
                }
            ],
            docs: [
                { title: 'Jetpack Compose phases', path: '/develop/ui/compose/phases', kind: 'guide' },
                { title: 'Compose performance', path: '/develop/ui/compose/performance', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-phases' }
            ]
        },

        {
            id: 'recomposition',
            title: 'Recomposition',
            importance: 'must-know',
            summary: 'Composables re-run when the state they read changes — and only those composables.',
            interviewAngle: '"What triggers recomposition?" Reading a state object, not passing a parameter. That distinction is the answer.',
            buildsOn: ['the-three-phases'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Recomposition',
                    important: true,
                    html: '<p>Re-running a composable because a <code>State</code> object it <strong>read</strong> has changed. The runtime tracks reads during composition, so it knows exactly which composables depend on which state, and re-runs only those.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The word "read" is doing the work. Compose does not re-run a composable because you passed it a new argument — it re-runs it because it observed that composable reading a snapshot state whose value changed. That is why the scope of a recomposition can be much smaller than the function that appears to own the data.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Recomposition scope follows the read',
                    code: `@Composable
fun Screen(viewModel: VM) {
    val count by viewModel.count.collectAsStateWithLifecycle()

    Column {
        Header()                 // skipped — reads nothing that changed
        Text("Count: \$count")    // recomposes
        Footer()                 // skipped
    }
}

// Deferring the read shrinks the scope further: passing a lambda means
// Screen does not read count at all — only Text does.
@Composable
fun Better(countProvider: () -> Int) {
    Column {
        Header()
        Text("Count: \${countProvider()}")   // the read happens HERE
        Footer()
    }
}`,
                    notes: 'This is the same idea as deferring to a later phase, applied to composition: push the read as far down the tree as it will go.'
                },
                {
                    type: 'types',
                    title: 'Why a composable might not skip',
                    items: [
                        { name: 'An unstable parameter', html: '<p>If Compose cannot prove a parameter’s equality is reliable, it cannot skip. Covered properly in M19.</p>' },
                        { name: 'It reads state that changed', html: '<p>Working as intended.</p>' },
                        { name: 'A non-restartable scope', html: '<p>Some composables — inline ones like <code>Column</code>’s content lambda — have no scope of their own, so the change propagates to the nearest restartable parent.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Recomposition is normal and frequent. The mistake is treating any recomposition as a bug and trying to eliminate it. The things worth fixing are recompositions that happen <em>every frame</em>, and composables that never skip when they obviously should — both of which you find by measuring, not by reading the code.</p>'
                }
            ],
            docs: [
                { title: 'Thinking in Compose', path: '/develop/ui/compose/mental-model', kind: 'guide' },
                { title: 'Lifecycle of composables', path: '/develop/ui/compose/lifecycle', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-recomposition' },
                { topicId: 'jetpack-compose', questionId: 'compose-lifecycle-events' }
            ]
        },

        {
            id: 'layering',
            title: 'How Compose is layered',
            importance: 'good-to-know',
            summary: 'Compose is a general runtime with a UI toolkit on top, not a single monolithic library.',
            interviewAngle: 'Rarely asked directly, but it explains why Compose can target things that are not Android UI.',
            buildsOn: ['recomposition'],
            blocks: [
                {
                    type: 'types',
                    title: 'The layers, bottom up',
                    items: [
                        { name: 'Compose Compiler', html: '<p>A Kotlin compiler plugin. Since Kotlin 2.0 it ships from the Kotlin repository itself, which ended the version-matching problem between Kotlin and Compose.</p>' },
                        { name: 'Compose Runtime', html: '<p>Snapshot state, recomposition and the tree-management machinery. Knows nothing about Android or even about UI — it manages a tree of nodes.</p>' },
                        { name: 'Compose UI', html: '<p>The node type that is a UI element: measure, layout, draw, input.</p>' },
                        { name: 'Foundation', html: '<p>Building blocks with no design opinion — <code>Row</code>, <code>Column</code>, <code>Box</code>, <code>LazyColumn</code>, gestures.</p>' },
                        { name: 'Material 3', html: '<p>An opinionated design system on top of Foundation.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The split between runtime and UI is why Compose is more general than it looks. The runtime manages any tree, which is how Compose targets desktop, web and iOS through Compose Multiplatform, and how Glance renders app widgets using the same programming model against a completely different node type.</p><p>Practically, the layering is also advice: prefer the lowest layer that does the job. Reaching for Foundation instead of Material when you have a custom design keeps you out of fights with someone else’s opinions.</p>'
                }
            ],
            docs: [
                { title: 'Architectural layering', path: '/develop/ui/compose/layering', kind: 'guide' },
                { title: 'Compose and other libraries', path: '/develop/ui/compose/libraries', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-theory-references' }
            ]
        }
    ]
};
