const jetpackComposeData = {
    "id": "jetpack-compose",
    "title": "Jetpack Compose",
    "subsections": null,
    "keyTopics": [
        "Declarative UI",
        "Composable Functions",
        "Recomposition",
        "State Management",
        "MutableState",
        "Side Effects (LaunchedEffect, DisposableEffect)",
        "remember vs rememberSaveable",
        "Compose Lifecycle",
        "Performance Optimization",
        "State Hoisting",
        "CompositionLocal",
        "Compose Phases",
        "Modifiers",
        "Semantics (Accessibility)",
        "Navigation in Compose",
        "Unidirectional Data Flow",
        "Custom Layouts"
    ],
    "questions": [
        {
            "referenceLinks": [
                {
                    "title": "Jetpack Compose overview",
                    "url": "https://developer.android.com/develop/ui/compose/documentation"
                },
                {
                    "title": "Compose mental model",
                    "url": "https://developer.android.com/develop/ui/compose/mental-model"
                }
            ],
            "tags": [
                "compose",
                "declarative-ui",
                "overview",
                "kotlin"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "compose-theory-references",
            "importance": "good-to-know",
            "question": "Jetpack Compose Theory and References",
            "answer": "<p><strong>🔑 What Jetpack Compose is</strong></p><ul><li><strong>Jetpack Compose</strong> is Android's modern, <strong>declarative</strong> UI toolkit — you describe <em>what</em> the UI should look like for a given state, and Compose figures out <em>how</em> to update the screen when that state changes.</li><li>It replaces the imperative <code>View</code>/<code>XML</code> system: no <code>findViewById</code>, no manual view mutation — UI is built entirely from Kotlin functions annotated <code>@Composable</code>.</li><li>Built on three pillars: a <strong>compiler plugin</strong> (Kotlin compiler plugin that transforms composable functions), a <strong>runtime</strong> (the Composer, slot table, snapshot state system) and the <strong>UI toolkit</strong> (Material components, layouts, gestures).</li><li>Fully <strong>Kotlin-first</strong>: leans on Kotlin lambdas, coroutines and the type system instead of XML/annotation-processing magic.</li></ul><p><strong>📚 Where to go deeper</strong></p><ul><li>Official <strong>Compose Pathway</strong> and codelabs on developer.android.com cover state, layouts, animation, testing end to end.</li><li>The <code>androidx.compose.runtime</code>, <code>.ui</code>, <code>.foundation</code> and <code>.material3</code> artifacts are the ones you'll touch daily.</li></ul><p><strong>🎯 Interview tip:</strong> Be ready to explain Compose in one sentence — \"a declarative, Kotlin-based UI framework that recomposes only the parts of the UI whose inputs changed\" — then let the interviewer drill into whichever piece they care about.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Why adopt Compose",
                    "url": "https://developer.android.com/develop/ui/compose/first"
                },
                {
                    "title": "Compose vs Views interop",
                    "url": "https://developer.android.com/develop/ui/compose/migrate/interoperability-apis"
                }
            ],
            "tags": [
                "compose",
                "views",
                "xml",
                "comparison",
                "ui-toolkit"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "xml",
                    "title": "Classic View system layout",
                    "code": "<TextView\n    android:id=\"@+id/greeting\"\n    android:layout_width=\"wrap_content\"\n    android:layout_height=\"wrap_content\" />\n\n<!-- In the Activity/Fragment -->\n<!--\nval greeting = findViewById<TextView>(R.id.greeting)\ngreeting.text = \"Hello, $name\"\n-->",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "The XML is inflated into a real TextView object in a view hierarchy.",
                                "findViewById walks that hierarchy at runtime looking for the id — a lookup that can fail and only fails when it runs.",
                                "The code holds a reference to the view and mutates it: greeting.text = \"Hello, Aditya\".",
                                "When the name changes, something must remember to run that assignment again.",
                                "If two code paths can change the name, both must update the view, and a missed one leaves the UI showing stale text.",
                                "The view is the source of truth for what is on screen, and the state lives in whatever code last wrote to it."
                            ],
                            "explain": "<p>Steps 4 and 5 are the whole cost of the imperative model. The UI is correct only if every path that changes data also remembers to update every view showing it, and nothing checks that. The bug is always the transition nobody thought of — an error state that does not clear, a spinner that stays after a retry.</p><p>Step 6 is the deeper problem: with the view holding the truth, \"what is on screen right now\" can only be answered by reading the views.</p>"
                        }
                },
                {
                    "language": "kotlin",
                    "title": "The same thing in Compose",
                    "code": "@Composable\nfun Greeting(name: String) {\n    Text(text = \"Hello, $name\")\n}\n\n// No findViewById, no manual mutation.\n// Calling Greeting(\"Aditya\") again with a new name\n// automatically updates the UI via recomposition.",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "Greeting(name) is called during composition and describes what should be on screen for that name.",
                                "Compose builds the UI from that description. No object is looked up and no id exists.",
                                "The name changes.",
                                "Compose calls Greeting again with the new value — this is recomposition.",
                                "It compares the new description against the previous one and updates only the text that actually differs.",
                                "There is no code path that can forget to update, because there is no update code to forget."
                            ],
                            "explain": "<p>Step 6 is the difference in one sentence. In the View system the developer writes the transition; in Compose the developer writes the destination and the framework works out the transition.</p><p>The state is now the source of truth and the UI is a function of it, which is why the same <code>Greeting</code> can be previewed, screenshot-tested and reused without an Activity anywhere near it.</p><p>The cost is that anything not expressed as state is invisible to recomposition — which is what the whole <code>remember</code>, <code>mutableStateOf</code> and stability machinery exists to manage.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-vs-view-system",
            "importance": "must-know",
            "question": "Jetpack Compose vs Android View System",
            "answer": "<p><strong>🔑 Two different UI paradigms</strong></p><ul><li>The <strong>View system</strong> is <strong>imperative</strong> and XML-based: you inflate a layout, then mutate widgets (<code>textView.text = ...</code>) as state changes.</li><li><strong>Compose</strong> is <strong>declarative</strong>: UI is a pure function of state — <code>@Composable</code> functions re-run (recompose) automatically when the state they read changes.</li></ul><table><thead><tr><th>Aspect</th><th>View System</th><th>Jetpack Compose</th></tr></thead><tbody><tr><td>Paradigm</td><td>Imperative</td><td>Declarative</td></tr><tr><td>UI definition</td><td>XML layouts + inflater</td><td>Kotlin @Composable functions</td></tr><tr><td>Updates</td><td>Manual (setText, notifyDataSetChanged)</td><td>Automatic recomposition</td></tr><tr><td>Boilerplate</td><td>findViewById, ViewHolders, adapters</td><td>None — direct function calls</td></tr><tr><td>Preview/tooling</td><td>Layout editor</td><td>@Preview, live edit</td></tr><tr><td>Interop</td><td>Native</td><td>ComposeView / AndroidView bridge</td></tr></tbody></table><p><strong>⚖️ Trade-offs</strong></p><ul><li>Compose reduces boilerplate and eliminates a whole class of state-sync bugs, but has a learning curve around recomposition and stability.</li><li>The View system still has the richest set of mature third-party libraries; Compose interops both ways so migration can be incremental.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Thinking in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/mental-model"
                }
            ],
            "tags": [
                "compose",
                "declarative-ui",
                "state",
                "recomposition"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "UI = f(state)",
                    "code": "@Composable\nfun Counter() {\n    var count by remember { mutableStateOf(0) }\n\n    // Describes what the UI looks like for the CURRENT count.\n    // No manual view updates -- Compose re-runs this on state change.\n    Column {\n        Text(text = \"Count: $count\")\n        Button(onClick = { count++ }) {\n            Text(\"Increment\")\n        }\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "Counter() is composed for the first time. remember stores a MutableState holding 0.",
                                "Text reads count. Compose records that this composable READ that state object.",
                                "The button is clicked and count++ writes 1 into the state.",
                                "The write invalidates every composable recorded as a reader — here, the Column's content.",
                                "On the next frame Compose re-runs the invalidated code with count now 1.",
                                "It diffs the result and updates only the text that changed; the Button is not rebuilt.",
                                "Nothing in the code says \"update the label\" — the label is simply described in terms of count."
                            ],
                            "explain": "<p>Step 2 is the mechanism the whole model rests on: Compose tracks state <strong>reads</strong>, so it knows which code depends on which value. Writing to state is not a command to redraw; it is an invalidation of everything that read it.</p><p>Step 7 is the practical consequence. There is no <code>setText</code>, so there is no path where the data changed and the UI did not. A screen can only be wrong if the state is wrong.</p><p><code>remember</code> is what keeps the value across recompositions — without it, <code>mutableStateOf(0)</code> would be re-created on every pass and the count would never leave zero.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-declarative-ui",
            "importance": "must-know",
            "question": "Explain the concept of declarative UI in Jetpack Compose.",
            "answer": "<p><strong>🔑 UI as a function of state</strong></p><ul><li>In a <strong>declarative</strong> model you describe <em>what</em> the UI should render for the current state: <code>UI = f(state)</code>. You never mutate widgets directly.</li><li>Each <code>@Composable</code> function emits a description of UI (\"there should be a Text with this string, a Button below it\"); Compose's runtime diffs this against what's already on screen.</li><li>When state read inside a composable changes, Compose <strong>re-invokes</strong> that function (recomposition) to produce updated output — it does not track and mutate individual widgets like the View system.</li><li>This removes an entire bug category: UI and state can never silently drift out of sync because the UI is derived, not stored.</li></ul><p><strong>⚙️ In practice</strong></p><ul><li>State lives in <code>State&lt;T&gt;</code>/<code>MutableState&lt;T&gt;</code> objects (e.g. from <code>remember { mutableStateOf(...) }</code>) or in a <code>ViewModel</code>.</li><li>Composables read that state and describe the tree; Compose handles diffing, skipping unchanged parts, and applying only the necessary changes to the actual UI.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Thinking in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/mental-model"
                }
            ],
            "tags": [
                "compose",
                "declarative-ui",
                "imperative",
                "comparison"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "compose-declarative-vs-imperative",
            "importance": "should-know",
            "question": "What is the difference between Declarative UI and Imperative UI?",
            "answer": "<p><strong>🔑 Core distinction</strong></p><ul><li><strong>Imperative UI</strong>: you write step-by-step instructions for <em>how</em> to change the UI (\"find this view, set its text, hide that one\"). The UI's history of mutations matters.</li><li><strong>Declarative UI</strong>: you describe <em>what</em> the UI should be for the current state; the framework computes the diff and applies it.</li></ul><table><thead><tr><th>Aspect</th><th>Imperative</th><th>Declarative</th></tr></thead><tbody><tr><td>Mental model</td><td>Mutate widgets step by step</td><td>Describe UI as a function of state</td></tr><tr><td>Example</td><td>Android View system, jQuery DOM</td><td>Jetpack Compose, SwiftUI, React</td></tr><tr><td>State sync bugs</td><td>Common (forget to update a view)</td><td>Rare (UI derives from state)</td></tr><tr><td>Testability</td><td>Requires simulating interaction sequences</td><td>Assert output for a given input state</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> Frame it as \"imperative describes the <em>how</em>, declarative describes the <em>what</em>\" — that one line usually satisfies the question, then be ready to give the Compose vs View example.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Composable functions",
                    "url": "https://developer.android.com/develop/ui/compose/kotlin"
                }
            ],
            "tags": [
                "compose",
                "composable",
                "annotation",
                "kotlin"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "What makes a composable well formed",
                    "code": "@Composable\nfun UserCard(\n    name: String,\n    onClick: () -> Unit,\n    modifier: Modifier = Modifier\n) {\n    Row(\n        modifier = modifier\n            .fillMaxWidth()\n            .clickable(onClick = onClick)\n            .padding(16.dp)\n    ) {\n        Text(text = name, style = MaterialTheme.typography.titleMedium)\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "The function is annotated @Composable, so it may only be called from another composable.",
                                "It takes its data as parameters and returns Unit — it describes UI rather than producing a value.",
                                "It holds no state of its own, so calling it twice with the same arguments produces the same UI.",
                                "The modifier parameter is last and defaults to Modifier, which is the convention every caller relies on.",
                                "Because the caller supplies the modifier, the caller controls size, padding and click behaviour from outside.",
                                "onClick is a lambda parameter, so the component reports the event upward instead of deciding what it means.",
                                "Compose may call this function on any frame, in any order, on any thread, or skip it entirely."
                            ],
                            "explain": "<p>Step 7 is the constraint that produces all the others. A composable can be re-run at any time, so it must be a <strong>pure description</strong>: no side effects in the body, no assumptions about how often it runs, nothing that would break if it ran twice.</p><p>Step 4 is the convention worth following exactly. A component with no <code>modifier</code> parameter cannot be positioned or sized by its caller, which makes it unusable in a layout it was not designed for.</p><p>Steps 5 and 6 together are what makes a component reusable: the caller decides how it looks in context and what its events mean.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-composable-functions",
            "importance": "must-know",
            "question": "What are Composable functions?",
            "answer": "<p><strong>🔑 Building blocks of Compose</strong></p><ul><li>A <strong>composable function</strong> is a regular Kotlin function annotated with <code>@Composable</code> that emits UI by calling other composables — it describes a piece of the UI tree.</li><li>The <code>@Composable</code> annotation tells the Kotlin compiler plugin to rewrite the function so it can be tracked by the Compose runtime (participate in the slot table, be skipped/recomposed independently).</li></ul><p><strong>⚙️ Rules composables must follow</strong></p><ul><li>Can be called only from other <code>@Composable</code> functions (or entry points like <code>setContent</code>).</li><li>Should be <strong>idempotent</strong> and free of side effects — calling it again with the same inputs must produce the same output; use effect handlers (<code>LaunchedEffect</code>, etc.) for actual side effects.</li><li>Can execute in <strong>any order</strong> and be <strong>skipped</strong> entirely if its inputs haven't changed, or run in <strong>parallel</strong> — never rely on execution order for correctness.</li><li>Can be <strong>recomposed</strong> many times, so avoid expensive work directly in the function body without memoizing it via <code>remember</code>.</li><li>By convention take an optional trailing <code>modifier: Modifier = Modifier</code> parameter so callers can control layout/behavior from outside.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Recomposition",
                    "url": "https://developer.android.com/develop/ui/compose/mental-model#recomposition"
                }
            ],
            "tags": [
                "compose",
                "recomposition",
                "state",
                "performance",
                "stability"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Which composables actually re-run",
                    "code": "@Composable\nfun Screen() {\n    var count by remember { mutableStateOf(0) }\n\n    Column {\n        Header() // does NOT read `count` -> never recomposes here\n        CounterText(count) // reads `count` -> recomposes on change\n        Button(onClick = { count++ }) { Text(\"+1\") }\n    }\n}\n\n@Composable\nfun CounterText(count: Int) {\n    Text(\"Count: $count\")\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "Screen() composes. remember creates the count state; Header, CounterText and Button are all called once.",
                                "CounterText(count) reads the value, so Compose records it as a reader of that state.",
                                "Header reads nothing and takes no parameters that change.",
                                "The button writes count = 1.",
                                "Compose invalidates the scope that read count. That scope is Screen's Column content, because the read happens when count is passed as an argument.",
                                "On recomposition, CounterText re-runs because its argument changed.",
                                "Header is called with the same (absent) arguments, so Compose SKIPS it entirely — its previous result is reused."
                            ],
                            "explain": "<p>Step 7 is the payoff and the thing to be able to say: Compose does not re-run everything on a state change, it re-runs the smallest scope that read the state and <strong>skips</strong> any child whose inputs are unchanged.</p><p>Skipping requires the parameters to be <em>stable</em> — types Compose can compare and be sure about. A <code>List&lt;User&gt;</code> parameter is unstable, so a composable taking one is re-run every time even when the contents are identical, which is the usual explanation for a Compose screen that is slower than it looks.</p><p>Hoisting <code>count</code> further down, so only <code>CounterText</code> reads it, would narrow the invalidated scope further.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-recomposition",
            "importance": "must-know",
            "question": "What is Recomposition in Jetpack Compose?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><strong>Recomposition</strong> is Compose re-invoking composable functions (or a subset of them) to update the UI when the <code>State</code> they read has changed.</li><li>Compose tracks, at fine granularity, which composables read which <code>State</code> objects (via the <strong>Snapshot</strong> system). Only composables that actually read a changed value are scheduled for recomposition.</li></ul><p><strong>⚙️ Smart recomposition</strong></p><ul><li>Compose <strong>skips</strong> a composable entirely if its inputs are unchanged and are all <strong>stable</strong> (see <code>@Stable</code>/<code>@Immutable</code>) — this is why stability of parameter types matters so much for performance.</li><li>Recomposition can happen out of order and can be interrupted/restarted; composable bodies must therefore be side-effect free.</li><li>Compose batches multiple state changes within a frame and recomposes once, not once per state write.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Reading state too high up in the tree causes large swaths of UI to recompose even though only a small part visually changed — push state reads down as close as possible to where they're used.</li><li>Unstable parameters (e.g. a plain <code>List&lt;T&gt;</code> from a non-Compose module, or lambdas capturing unstable state) defeat skipping.</li></ul><p><strong>🎯 Interview tip:</strong> Emphasize \"recomposition is not the whole UI tree re-running from scratch\" — it's targeted, and skippability is the key performance lever.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "State in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/state"
                }
            ],
            "tags": [
                "compose",
                "state",
                "mutablestate",
                "snapshot"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "compose-state",
            "importance": "must-know",
            "question": "What is State in Compose?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><code>State&lt;T&gt;</code> is a Compose runtime type that holds a value and notifies any composable reading it (via <code>.value</code>) when that value changes, triggering recomposition.</li><li>It's the read-only counterpart of <code>MutableState&lt;T&gt;</code>; composables typically read <code>State</code> and a separate layer (ViewModel, event handler) owns the mutation.</li><li>Backed by Compose's <strong>Snapshot system</strong> — a transactional, thread-safe mechanism for observing reads/writes, which is what makes fine-grained recomposition possible.</li></ul><p><strong>⚙️ How you get one</strong></p><ul><li><code>remember { mutableStateOf(value) }</code> — in-composition state.</li><li><code>collectAsStateWithLifecycle()</code> on a <code>Flow</code>/<code>StateFlow</code>, or <code>.observeAsState()</code> on <code>LiveData</code> — bridges external state into Compose <code>State</code>.</li><li><code>derivedStateOf { ... }</code> — computed <code>State</code> derived from other <code>State</code>.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "State and Jetpack Compose",
                    "url": "https://developer.android.com/develop/ui/compose/state"
                }
            ],
            "tags": [
                "compose",
                "mutablestate",
                "remember",
                "state"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "The by delegate on MutableState",
                    "code": "@Composable\nfun NameInput() {\n    // `by` delegates .value access to a plain `var`\n    var name by remember { mutableStateOf(\"\") }\n\n    OutlinedTextField(\n        value = name,\n        onValueChange = { name = it },\n        label = { Text(\"Name\") }\n    )\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "mutableStateOf(\"\") creates a MutableState<String> — an observable holder, not a plain variable.",
                                "remember keeps that holder across recompositions, so the text survives redraws.",
                                "Without by, every use would be name.value — reading and writing through the holder.",
                                "by delegates the property to it, so name reads like an ordinary var while still going through .value.",
                                "The TextField reads name, which registers this composable as a reader of the state.",
                                "onValueChange writes name = it, which sets .value and invalidates the readers.",
                                "The composable re-runs, TextField receives the new value, and the field shows what was typed."
                            ],
                            "explain": "<p>Steps 5 to 7 are the loop that makes a Compose text field work, and it is worth noticing that it is a <strong>loop</strong>. <code>TextField</code> does not hold the text — it displays the value it is given and reports edits upward. Nothing appears on screen until the state is updated and the composable re-runs.</p><p>That is why an <code>onValueChange</code> that does not write to state gives a field you cannot type in — a bug with no error and no obvious cause.</p><p>The three declarations are easy to confuse: <code>val x = mutableStateOf(0)</code> (holder), <code>var x by remember { mutableStateOf(0) }</code> (delegated, the usual form), and <code>var x = 0</code> (an ordinary variable Compose knows nothing about).</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-mutable-state",
            "importance": "should-know",
            "question": "What is MutableState in Compose?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><code>MutableState&lt;T&gt;</code> extends <code>State&lt;T&gt;</code> and adds a settable <code>.value</code> — writing to it notifies observers and schedules recomposition.</li><li>Created with <code>mutableStateOf(initialValue)</code>; almost always wrapped in <code>remember { }</code> so it survives recomposition (otherwise a fresh one is created every recomposition, losing the value).</li></ul><p><strong>⚙️ Variants</strong></p><ul><li><code>mutableStateOf</code> — single value, supports Kotlin <code>by</code> delegation for direct <code>var</code> access.</li><li><code>mutableStateListOf</code> / <code>mutableStateMapOf</code> — observable list/map without needing to reassign the whole collection.</li><li>Optional <code>SnapshotMutationPolicy</code> (e.g. <code>structuralEqualityPolicy()</code>, <code>referentialEqualityPolicy()</code>) controls when a write is considered a real change worth notifying observers about.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Manage state in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/state"
                }
            ],
            "tags": [
                "compose",
                "state-management",
                "viewmodel",
                "unidirectional-data-flow"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Screen state owned by a ViewModel",
                    "code": "class ProfileViewModel : ViewModel() {\n    private val _uiState = MutableStateFlow(ProfileUiState())\n    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()\n\n    fun onNameChanged(name: String) {\n        _uiState.update { it.copy(name = name) }\n    }\n}\n\n@Composable\nfun ProfileScreen(viewModel: ProfileViewModel = viewModel()) {\n    val uiState by viewModel.uiState.collectAsStateWithLifecycle()\n    ProfileContent(uiState = uiState, onNameChanged = viewModel::onNameChanged)\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "viewModel() obtains a ViewModel scoped to the host Activity or navigation entry, and returns the same one on recomposition.",
                                "The ViewModel holds the state in a MutableStateFlow and exposes a read-only StateFlow.",
                                "The composable collects that flow, which registers it as a reader.",
                                "A text change calls viewModel.onNameChanged — the event travels UP.",
                                "The ViewModel updates its state with copy, producing a new immutable state object.",
                                "The new state travels DOWN to the composable, which recomposes.",
                                "On rotation the ViewModel survives, so the same state is delivered immediately and nothing is refetched."
                            ],
                            "explain": "<p>Step 7 is the reason state that matters lives here rather than in <code>remember</code>. <code>remember</code> is scoped to the composition and dies with it; a ViewModel outlives configuration changes.</p><p>Step 5 is the discipline that keeps recomposition correct. Replacing the state with a copy is what Compose can compare; mutating a field inside the existing object changes nothing it can observe, and the screen does not update.</p><p>The asymmetric exposure — <code>MutableStateFlow</code> private, <code>StateFlow</code> public — is what stops the UI writing state directly and keeps every change going through a named function on the ViewModel.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-state-management",
            "importance": "must-know",
            "question": "How does state management work in Jetpack Compose?",
            "answer": "<p><strong>🔑 Core idea</strong></p><ul><li>Compose follows <strong>unidirectional data flow</strong>: state flows down into composables as parameters, events flow up as lambda calls; composables themselves stay as \"stateless\" as practical.</li><li>State should live at the <strong>lowest common ancestor</strong> of the composables that read or write it — a pattern called <strong>state hoisting</strong>.</li></ul><p><strong>⚙️ Where state lives</strong></p><ul><li><strong>UI-only / ephemeral state</strong> (scroll position, expanded/collapsed toggle) — <code>remember</code>/<code>rememberSaveable</code> inside the composable tree.</li><li><strong>Screen-level, survives config changes / process-independent</strong> — a <code>ViewModel</code> exposing <code>StateFlow</code>/<code>State</code>, consumed via <code>collectAsStateWithLifecycle()</code>.</li><li><strong>App-wide / cross-cutting</strong> — repositories, DataStore, or a <code>CompositionLocal</code> for theming/config.</li></ul><p><strong>✅ When to use what</strong></p><ul><li>Keep business logic and state ownership out of composables; composables should mostly render and forward events.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "State hoisting",
                    "url": "https://developer.android.com/develop/ui/compose/state-hoisting"
                }
            ],
            "tags": [
                "compose",
                "stateful",
                "stateless",
                "state-hoisting"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "A stateful wrapper around a stateless component",
                    "code": "// Stateless: fully controlled by the caller\n@Composable\nfun SearchBar(query: String, onQueryChange: (String) -> Unit) {\n    TextField(value = query, onValueChange = onQueryChange)\n}\n\n// Stateful: owns the state, delegates rendering\n@Composable\nfun StatefulSearchBar() {\n    var query by remember { mutableStateOf(\"\") }\n    SearchBar(query = query, onQueryChange = { query = it })\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "SearchBar takes query and onQueryChange. It owns nothing and remembers nothing.",
                                "It can therefore be previewed with any value, screenshot-tested, and driven entirely from a test.",
                                "StatefulSearchBar owns a query with remember and passes it down.",
                                "A keystroke calls onQueryChange, which writes the state in the wrapper.",
                                "The wrapper recomposes and passes the new query back down.",
                                "SearchBar renders whatever it was given — it is never the source of truth.",
                                "A screen needing the query for a network call uses SearchBar directly and hoists the state to its ViewModel instead."
                            ],
                            "explain": "<p>Step 7 is why the pair exists. A component that owns its state is convenient and unusable the moment anyone else needs that value; a stateless one is slightly more verbose at the call site and works everywhere.</p><p>The guidance follows: make components <strong>stateless by default</strong>, and add a stateful wrapper only as a convenience for callers who genuinely do not care.</p><p>This is state hoisting from the other direction, and the stateless half is the same shape as a controlled component in React.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-stateful-vs-stateless",
            "importance": "should-know",
            "question": "What is the difference between Stateful and Stateless composables?",
            "answer": "<p><strong>🔑 Definitions</strong></p><ul><li>A <strong>stateful</strong> composable owns and mutates its own state internally (e.g. holds a <code>remember { mutableStateOf(...) }</code>) — callers can't observe or control that state.</li><li>A <strong>stateless</strong> composable holds no state of its own; it receives everything via parameters and reports changes via callback lambdas — the classic <code>value</code> + <code>onValueChange</code> shape.</li></ul><table><thead><tr><th>Aspect</th><th>Stateful</th><th>Stateless</th></tr></thead><tbody><tr><td>Ownership</td><td>Composable owns state</td><td>Caller owns state, passed down</td></tr><tr><td>Reusability</td><td>Lower — hard to control from outside</td><td>Higher — easy to preview/test</td></tr><tr><td>Preview-friendly</td><td>Harder</td><td>Trivial — pass any state</td></tr><tr><td>Typical role</td><td>Screen-level wrapper</td><td>Reusable UI component</td></tr></tbody></table><p><strong>✅ Best practice</strong></p><ul><li>Build stateless, reusable components; keep a thin stateful wrapper at the top that hoists the state (often backed by a ViewModel).</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Side-effects in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/side-effects"
                }
            ],
            "tags": [
                "compose",
                "side-effects",
                "launchedeffect",
                "disposableeffect"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "compose-side-effects",
            "importance": "must-know",
            "question": "What are side effects in Jetpack Compose?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li>A <strong>side effect</strong> is any change that happens outside the scope of a composable function — network calls, logging, navigation, updating a database, starting a coroutine, registering a listener.</li><li>Composable functions must be side-effect free directly in their body (they can recompose unpredictably, out of order, or be skipped) — so Compose provides <strong>effect handler</strong> APIs to run side effects safely, tied to the composition lifecycle.</li></ul><p><strong>⚙️ The main effect handlers</strong></p><ul><li><code>LaunchedEffect(key)</code> — launches a coroutine scoped to the composition, restarted when <code>key</code> changes.</li><li><code>DisposableEffect(key)</code> — for effects needing explicit cleanup (listeners, callbacks) via <code>onDispose { }</code>.</li><li><code>SideEffect { }</code> — runs on every successful recomposition, for publishing Compose state to non-Compose code.</li><li><code>rememberCoroutineScope()</code> — a <code>CoroutineScope</code> tied to the composition, for launching coroutines from event callbacks (not during composition).</li><li><code>produceState</code> / <code>snapshotFlow</code> — convert non-Compose async sources into Compose <code>State</code>, and vice versa.</li></ul><p><strong>🎯 Interview tip:</strong> The unifying rule: composable bodies compute UI; effect handlers do everything that talks to the outside world.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "LaunchedEffect",
                    "url": "https://developer.android.com/develop/ui/compose/side-effects#launchedeffect"
                },
                {
                    "title": "DisposableEffect",
                    "url": "https://developer.android.com/develop/ui/compose/side-effects#disposableeffect"
                }
            ],
            "tags": [
                "compose",
                "launchedeffect",
                "disposableeffect",
                "side-effects",
                "comparison"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "LaunchedEffect for a one-shot suspending call",
                    "code": "@Composable\nfun UserScreen(userId: String, viewModel: UserViewModel = viewModel()) {\n    LaunchedEffect(userId) {\n        viewModel.loadUser(userId) // suspend call, cancelled if userId changes\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "UserScreen enters the composition. LaunchedEffect starts a coroutine in the composition's scope.",
                                "loadUser runs. Recomposition for unrelated reasons does NOT restart it, because the key has not changed.",
                                "The user navigates to a different user, so userId changes.",
                                "LaunchedEffect cancels the running coroutine and starts a new one with the new id.",
                                "The previous request stops mid-flight; its result can never arrive and overwrite the new one.",
                                "The screen leaves the composition, and the coroutine is cancelled with it.",
                                "Nothing here registers or unregisters anything, so no cleanup block is needed."
                            ],
                            "explain": "<p>Step 4 is the key parameter doing its job, and it is the whole reason not to use <code>LaunchedEffect(Unit)</code> here. With a constant key the effect would run once and never re-run, so navigating to a second user would show the first user's data.</p><p>Step 5 is the safety this buys for free: cancel-and-restart means an in-flight response for the old id cannot land after the new one.</p><p>Step 2 matters because composables re-run constantly. An effect that restarted on every recomposition would fire a request per frame; keys are how Compose distinguishes \"the inputs changed\" from \"we redrew\".</p>"
                        }
                },
                {
                    "language": "kotlin",
                    "title": "DisposableEffect for something that must be cleaned up",
                    "code": "@Composable\nfun WindowFocusObserver(onFocusChanged: (Boolean) -> Unit) {\n    val view = LocalView.current\n    DisposableEffect(view) {\n        val listener = ViewTreeObserver.OnWindowFocusChangeListener { hasFocus ->\n            onFocusChanged(hasFocus)\n        }\n        view.viewTreeObserver.addOnWindowFocusChangeListener(listener)\n        onDispose {\n            view.viewTreeObserver.removeOnWindowFocusChangeListener(listener)\n        }\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "The composable enters the composition and DisposableEffect runs its block.",
                                "A listener is created and registered with the ViewTreeObserver.",
                                "The block returns an onDispose lambda, which is required — the effect does not compile without it.",
                                "Focus changes are delivered to the listener for as long as the composable is in the composition.",
                                "The key — view — changes, or the composable leaves the composition.",
                                "onDispose runs first and unregisters the listener.",
                                "If the key changed rather than the composable leaving, the block then runs again and registers with the new view."
                            ],
                            "explain": "<p>Step 3 is enforced by the API, and step 6 is why. <code>DisposableEffect</code> is for anything with a registration that must be undone — listeners, observers, broadcast receivers, callbacks — and forgetting the cleanup is the leak the type system prevents here.</p><p>The division from <code>LaunchedEffect</code> is simple: use <code>LaunchedEffect</code> for suspending work, which cancellation cleans up on its own, and <code>DisposableEffect</code> for non-suspending resources, which it does not.</p><p>Step 7 is worth noticing — on a key change the cleanup runs <em>before</em> the new registration, so the two never overlap.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-launched-vs-disposable",
            "importance": "must-know",
            "question": "What is the difference between LaunchedEffect and DisposableEffect?",
            "answer": "<p><strong>🔑 Both are keyed effects tied to composition lifetime</strong></p><ul><li>Both re-run their block when their <code>key</code>(s) change, and cancel/clean up when the calling composable leaves composition.</li></ul><table><thead><tr><th>Aspect</th><th>LaunchedEffect</th><th>DisposableEffect</th></tr></thead><tbody><tr><td>Purpose</td><td>Run suspend/coroutine work</td><td>Run non-suspend code needing explicit cleanup</td></tr><tr><td>Body</td><td>Coroutine scope block</td><td>Regular block that must end with onDispose { }</td></tr><tr><td>Cleanup</td><td>Automatic coroutine cancellation</td><td>Manual, in onDispose</td></tr><tr><td>Typical use</td><td>One-shot API call, snackbar, animation</td><td>Register/unregister a listener or callback</td></tr></tbody></table><p><strong>⚠️ Pitfall</strong></p><ul><li>Forgetting <code>onDispose { }</code> in <code>DisposableEffect</code> is a compile error — Compose forces you to think about cleanup.</li><li>Using the wrong key (or no key) can cause the effect to never restart when it should, a very common source of stale-closure bugs.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "rememberCoroutineScope",
                    "url": "https://developer.android.com/develop/ui/compose/side-effects#remembercoroutinescope"
                }
            ],
            "tags": [
                "compose",
                "coroutines",
                "remembercoroutinescope",
                "side-effects"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Launching a coroutine from a click handler",
                    "code": "@Composable\nfun ScrollToTopButton(listState: LazyListState) {\n    val scope = rememberCoroutineScope()\n\n    Button(onClick = {\n        scope.launch {\n            listState.animateScrollToItem(0)\n        }\n    }) {\n        Text(\"Back to top\")\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "rememberCoroutineScope returns a scope bound to this point in the composition.",
                                "Nothing is launched during composition — the scope just sits there.",
                                "The user taps the button and onClick runs. onClick is not a composable, so it cannot call LaunchedEffect.",
                                "scope.launch starts the animated scroll from that ordinary callback.",
                                "The animation suspends and completes without blocking anything.",
                                "The composable leaves the composition and the scope is cancelled, taking any running animation with it."
                            ],
                            "explain": "<p>Step 3 is the entire reason this API exists. <code>LaunchedEffect</code> starts work when a composable <em>enters</em> or a key changes; a click is neither. Event handlers need a scope they can launch into, and <code>rememberCoroutineScope</code> is one whose lifetime matches the composition.</p><p>The rule to remember: <strong>effects for lifecycle, this for events.</strong> Using <code>LaunchedEffect</code> for a click means inventing a state flag to trigger it, which is a worse version of the same thing.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-remember-coroutine-scope",
            "importance": "should-know",
            "question": "What is rememberCoroutineScope and its use cases?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><code>rememberCoroutineScope()</code> returns a <code>CoroutineScope</code> bound to the point in the composition where it's called — it survives recomposition and is cancelled automatically when that composable leaves the composition.</li><li>Unlike <code>LaunchedEffect</code>, it does <strong>not</strong> start a coroutine itself — it just gives you a scope to launch coroutines <strong>from event callbacks</strong> (e.g. a button click), where you can't call <code>LaunchedEffect</code> directly since it's not composable code.</li></ul><p><strong>✅ Typical use cases</strong></p><ul><li>Launching a coroutine in response to a click, e.g. animating a scroll (<code>LazyListState.animateScrollToItem</code>) or showing a <code>Snackbar</code>.</li><li>Anything that should start <em>only</em> on user action, not automatically on composition/recomposition like <code>LaunchedEffect</code> would.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "collectAsStateWithLifecycle",
                    "url": "https://developer.android.com/develop/ui/compose/libraries#viewmodel"
                }
            ],
            "tags": [
                "compose",
                "flow",
                "livedata",
                "stateflow",
                "lifecycle"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Collecting a StateFlow safely",
                    "code": "@Composable\nfun WeatherScreen(viewModel: WeatherViewModel = viewModel()) {\n    val uiState by viewModel.weatherState.collectAsStateWithLifecycle()\n\n    when (uiState) {\n        is WeatherUiState.Loading -> LoadingSpinner()\n        is WeatherUiState.Success -> WeatherContent(uiState.data)\n        is WeatherUiState.Error -> ErrorMessage(uiState.message)\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "collectAsStateWithLifecycle subscribes to the flow and returns a State the composable reads.",
                                "The subscription is tied to the lifecycle owner, starting at STARTED.",
                                "Each emission updates the State, which invalidates readers and recomposes the when.",
                                "The app is backgrounded. The lifecycle drops below STARTED and the collection is CANCELLED.",
                                "Upstream work stops too — if the flow is a stateIn with WhileSubscribed, its source shuts down as well.",
                                "Returning to the foreground restarts the collection and delivers the current value immediately.",
                                "With plain collectAsState, step 4 would not happen: collection would continue while the app is in the background."
                            ],
                            "explain": "<p>Step 7 is the difference and the reason to prefer the lifecycle-aware version. <code>collectAsState</code> keeps collecting while the screen is not visible, so a location or database observer keeps running and updating a UI nobody is looking at — battery spent on frames that are never drawn.</p><p>It needs the <code>lifecycle-runtime-compose</code> artifact, which is the only reason the shorter one still gets used.</p><p>Step 3 shows why a sealed state type pairs so well with this: the <code>when</code> is exhaustive, so adding a state breaks compilation until the screen handles it.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-observe-flows-livedata",
            "importance": "must-know",
            "question": "How to observe Flows and LiveData states in Compose UI?",
            "answer": "<p><strong>🔑 Bridging external streams into Compose State</strong></p><ul><li><code>StateFlow&lt;T&gt;.collectAsStateWithLifecycle()</code> — the recommended way; collects only while the lifecycle is at least <code>STARTED</code>, avoiding wasted work when the screen is backgrounded (needs <code>lifecycle-runtime-compose</code>).</li><li><code>Flow&lt;T&gt;.collectAsState(initial)</code> — simpler, lifecycle-unaware version; fine for tests/previews but collects regardless of lifecycle state in production.</li><li><code>LiveData&lt;T&gt;.observeAsState(initial)</code> — from <code>androidx.compose.runtime:runtime-livedata</code>, bridges LiveData into Compose <code>State</code>.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>Plain <code>collectAsState()</code> on a screen that's not <code>STARTED</code> keeps collecting from a <code>StateFlow</code> in the background (e.g. after navigating away) — prefer the lifecycle-aware variant in production code.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Side-effects in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/side-effects"
                }
            ],
            "tags": [
                "compose",
                "coroutines",
                "async",
                "viewmodel",
                "launchedeffect"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Loading on entry, rendering from state",
                    "code": "@Composable\nfun ArticleScreen(articleId: String, viewModel: ArticleViewModel = viewModel()) {\n    LaunchedEffect(articleId) {\n        viewModel.loadArticle(articleId)\n    }\n    val state by viewModel.uiState.collectAsStateWithLifecycle()\n    ArticleContent(state)\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "ArticleScreen enters with an articleId. LaunchedEffect starts the load, keyed on that id.",
                                "The ViewModel sets its state to Loading, and the collected state updates.",
                                "The composable recomposes and ArticleContent draws a spinner.",
                                "The request completes and the ViewModel publishes Success.",
                                "The composable recomposes again and draws the article.",
                                "Navigating to a different article changes the key, so the effect cancels and restarts.",
                                "The composable itself performs no async work — it triggers it and renders whatever state comes back."
                            ],
                            "explain": "<p>Step 7 is the division of labour that makes this testable. The composable is still a pure function of state; the only thing it does beyond describing UI is start an effect keyed on its input.</p><p>Compose has no async primitives of its own beyond the effect handlers — this is <code>LaunchedEffect</code> and a flow, and there is nothing else to learn. The mistake it prevents is calling a suspending function directly in the composable body, which would fire on every recomposition.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-async-operations",
            "importance": "should-know",
            "question": "How can we handle asynchronous operations in Jetpack Compose?",
            "answer": "<p><strong>🔑 Compose delegates async work to coroutines</strong></p><ul><li>Compose itself has no async primitives beyond effect handlers — actual async work (network, DB) lives in a <code>ViewModel</code> using <code>viewModelScope</code>, and Compose just observes the resulting <code>State</code>/<code>StateFlow</code>.</li></ul><p><strong>⚙️ Tools available in the composition</strong></p><ul><li><code>LaunchedEffect(key)</code> — run a suspend call automatically tied to composition/key changes (e.g. load data when a screen appears).</li><li><code>rememberCoroutineScope()</code> — launch a coroutine from a callback (button click, drag gesture).</li><li><code>produceState</code> — turn any async source into Compose <code>State</code> declaratively.</li><li><code>collectAsStateWithLifecycle()</code> — the usual way to surface a <code>ViewModel</code>'s async results to the UI.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>Never launch a raw <code>GlobalScope.launch</code> from a composable — it isn't tied to any lifecycle and will leak.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "produceState",
                    "url": "https://developer.android.com/develop/ui/compose/side-effects#producestate"
                }
            ],
            "tags": [
                "compose",
                "producestate",
                "state",
                "interop"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "produceState around a callback API",
                    "code": "@Composable\nfun rememberLocation(locationClient: LocationClient): State<Location?> {\n    return produceState<Location?>(initialValue = null) {\n        val callback = LocationCallback { location -> value = location }\n        locationClient.register(callback)\n        awaitDispose { locationClient.unregister(callback) }\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "The composable enters and produceState immediately returns a State holding the initial value, null.",
                                "It launches a coroutine that runs the block.",
                                "The block registers a callback with the location client.",
                                "The first location arrives and the callback assigns value = location.",
                                "That write updates the State, so every composable reading it recomposes with the new location.",
                                "awaitDispose suspends, holding the effect open, exactly as awaitClose does in callbackFlow.",
                                "When the composable leaves, awaitDispose runs its body and unregisters the callback."
                            ],
                            "explain": "<p>Step 1 is what makes this convenient: there is a value to render from the very first frame, so no separate loading flag is needed for \"nothing has arrived yet\".</p><p><code>produceState</code> is <code>LaunchedEffect</code> and <code>remember { mutableStateOf() }</code> combined — the coroutine and the state it feeds, declared together. Step 6 is the part that is easy to leave out and the reason it is a compile-enforced suspension: a callback registered by an effect that has returned is a leak.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-non-compose-state",
            "importance": "should-know",
            "question": "How can we convert a non-compose state into a Compose state?",
            "answer": "<p><strong>🔑 Bridging APIs</strong></p><ul><li><code>produceState(initialValue, key)</code> — the general-purpose bridge: runs a coroutine block that can <code>value = ...</code> repeatedly, converting callbacks/Flows/futures into a Compose <code>State&lt;T&gt;</code>.</li><li><code>mutableStateOf</code> inside a <code>DisposableEffect</code> — register a listener/callback, write results into a <code>MutableState</code>, and unregister in <code>onDispose</code>.</li><li>For existing reactive types: <code>Flow.collectAsState()</code>, <code>LiveData.observeAsState()</code>, or <code>RxJava</code> via <code>subscribeAsState()</code> (compose-rxjava2/3 interop artifacts).</li></ul><p><strong>🎯 Interview tip:</strong> <code>produceState</code> is the answer to reach for when the source is a plain callback API (e.g. a location listener or a legacy SDK) that has no Flow/LiveData wrapper.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "derivedStateOf",
                    "url": "https://developer.android.com/develop/ui/compose/side-effects#derivedstateof"
                }
            ],
            "tags": [
                "compose",
                "derivedstateof",
                "performance",
                "state"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "derivedStateOf, and the recompositions it prevents",
                    "code": "@Composable\nfun ScrollToTopFab(listState: LazyListState) {\n    val showButton by remember {\n        derivedStateOf { listState.firstVisibleItemIndex > 0 }\n    }\n\n    if (showButton) {\n        FloatingActionButton(onClick = { /* scroll up */ }) {\n            Icon(Icons.Default.ArrowUpward, contentDescription = \"Scroll to top\")\n        }\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "listState.firstVisibleItemIndex changes on every scrolled item — many times per second.",
                                "Reading it directly in a composable would invalidate that composable on every one of those changes.",
                                "derivedStateOf wraps the calculation and produces a new State holding a Boolean.",
                                "The comparison runs on every change, because it must.",
                                "But the derived State only reports a change when its RESULT changes — false to true, or back.",
                                "Scrolling from item 5 to item 40 changes the index 35 times and the Boolean zero times.",
                                "So the FAB recomposes twice in a whole session: once when scrolling starts, once when it returns to the top."
                            ],
                            "explain": "<p>Step 6 against step 7 is the whole value, and it is the canonical example for a reason: a high-frequency input producing a low-frequency output. Without <code>derivedStateOf</code> this is a composable re-running on every frame of every scroll, to draw the same thing.</p><p>It is also frequently misapplied. If the derived value changes about as often as its input — mapping a name to an uppercase name, say — there is nothing to filter and <code>derivedStateOf</code> only adds overhead. The test is whether the output changes <em>less often</em> than the input.</p><p><code>remember</code> around it is required; without it the derived state is recreated every recomposition and remembers nothing.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-derived-state-of",
            "importance": "must-know",
            "question": "Explain derivedStateOf in Compose.",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><code>derivedStateOf { ... }</code> creates a <code>State</code> whose value is <strong>computed from other State objects</strong>, but only recomputes/notifies observers when the <strong>computed result actually changes</strong> — not on every recomposition of its inputs.</li></ul><p><strong>⚙️ Why it matters</strong></p><ul><li>Without it, a composable reading a fast-changing input (e.g. scroll offset on every pixel) but caring only about a coarse derived value (e.g. \"is scrolled past item 5\") would recompose on every tiny change.</li><li><code>derivedStateOf</code> decouples the read frequency of the input from the notification frequency of the output — it only triggers recomposition when the boolean/derived value flips.</li><li>Should itself be wrapped in <code>remember { derivedStateOf { ... } } }</code> so the derived <code>State</code> object isn't recreated every recomposition.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>Don't reach for it by default — it adds overhead and is only worth it when the input changes far more often than the derived output.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "rememberUpdatedState",
                    "url": "https://developer.android.com/develop/ui/compose/side-effects#rememberupdatedstate"
                }
            ],
            "tags": [
                "compose",
                "rememberupdatedstate",
                "side-effects",
                "closures"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "rememberUpdatedState and the stale closure",
                    "code": "@Composable\nfun SplashScreen(onTimeout: () -> Unit) {\n    val currentOnTimeout by rememberUpdatedState(onTimeout)\n\n    LaunchedEffect(true) {\n        delay(3000)\n        currentOnTimeout() // always calls the LATEST lambda\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "SplashScreen composes with an onTimeout lambda and starts a LaunchedEffect keyed on true.",
                                "The effect suspends for three seconds.",
                                "Meanwhile the parent recomposes and passes a NEW onTimeout lambda — a different object, capturing different values.",
                                "The key has not changed, so the effect is NOT restarted. It is still the coroutine that started at step 1.",
                                "That coroutine captured the ORIGINAL lambda when it began.",
                                "rememberUpdatedState holds a State whose value is replaced on every recomposition.",
                                "The coroutine reads currentOnTimeout at call time, so it invokes the latest lambda rather than the captured one."
                            ],
                            "explain": "<p>Steps 4 and 5 are the bug this exists to fix, and it is genuinely hard to see by reading. A long-running effect closes over whatever it captured when it started, and anything passed later never reaches it.</p><p>The obvious alternative — adding <code>onTimeout</code> to the key — is wrong for a different reason: a new lambda instance is created on most recompositions, so the effect would restart constantly and the three seconds would never elapse.</p><p><code>rememberUpdatedState</code> is the way to say \"do not restart, but do use the newest value\", and it is needed exactly when an effect outlives the values it uses.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-remember-updated-state",
            "importance": "should-know",
            "question": "Explain rememberUpdatedState in Compose.",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><code>rememberUpdatedState(value)</code> wraps a value so a <strong>long-lived effect</strong> (like a <code>LaunchedEffect</code> with a key that rarely changes) can always read the <strong>latest</strong> value without restarting the effect every time that value changes.</li></ul><p><strong>⚙️ The problem it solves</strong></p><ul><li>If a <code>LaunchedEffect(Unit)</code> captures a lambda parameter directly, that lambda is <strong>frozen</strong> to whatever it was on first composition (a stale closure) — because the key <code>Unit</code> never causes the effect to restart.</li><li>Wrapping the captured value with <code>rememberUpdatedState</code> gives you a <code>State</code> reference that's always current, read inside the effect via <code>.value</code>, without needing to add it as a key (which would restart the effect unnecessarily, e.g. cancelling an in-flight delay/animation).</li></ul><p><strong>🎯 Interview tip:</strong> Use case to quote: a splash screen delay that calls <code>onTimeout()</code> after a fixed delay — you want the delay to run once (<code>LaunchedEffect(true)</code>), but call the <em>latest</em> <code>onTimeout</code> lambda, so wrap it in <code>rememberUpdatedState</code>.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Save UI state",
                    "url": "https://developer.android.com/develop/ui/compose/state-saving"
                }
            ],
            "tags": [
                "compose",
                "remember",
                "remembersaveable",
                "state",
                "comparison"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "remember against rememberSaveable",
                    "code": "@Composable\nfun SurveyForm() {\n    // Lost on rotation\n    var isExpanded by remember { mutableStateOf(false) }\n\n    // Survives rotation and process death\n    var answer by rememberSaveable { mutableStateOf(\"\") }\n\n    Column {\n        TextField(value = answer, onValueChange = { answer = it })\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "Both store a value across recompositions, which is what remember means.",
                                "The device rotates. The Activity is destroyed and recreated, and the composition is thrown away.",
                                "isExpanded was stored with remember, so it is gone and resets to false.",
                                "answer was stored with rememberSaveable, so it was written into the saved instance state Bundle.",
                                "On recreation rememberSaveable restores it and the field still holds what was typed.",
                                "The process is killed in the background and the user returns. The Bundle is restored from disk, and answer survives that too.",
                                "rememberSaveable can only store what fits in a Bundle, unless a custom Saver is supplied."
                            ],
                            "explain": "<p>The rule follows from steps 3 and 6: <strong>use <code>rememberSaveable</code> for anything the user produced</strong> — typed text, a scroll position, a selection — and plain <code>remember</code> for things that are cheap to rebuild, like whether a section is expanded.</p><p>Step 7 is the practical limit. A custom type needs a <code>Saver</code>, and reaching for one is often a sign the state belongs in a ViewModel instead — which survives rotation without a Bundle, though not process death.</p><p>The two are complementary rather than alternatives: a ViewModel handles rotation and large state, <code>rememberSaveable</code> handles process death for small values.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-remember-vs-saveable",
            "importance": "must-know",
            "question": "What is the difference between remember and rememberSaveable?",
            "answer": "<p><strong>🔑 Both cache a value across recomposition</strong></p><ul><li>Both store a computed value so it isn't recreated on every recomposition, keyed to the composable's position in the slot table.</li></ul><table><thead><tr><th>Aspect</th><th>remember</th><th>rememberSaveable</th></tr></thead><tbody><tr><td>Survives recomposition</td><td>Yes</td><td>Yes</td></tr><tr><td>Survives configuration change (rotation)</td><td>No</td><td>Yes</td></tr><tr><td>Survives process death</td><td>No</td><td>Yes (via SavedStateHandle/Bundle)</td></tr><tr><td>Storage</td><td>In-memory only</td><td>Bundle (must be Parcelable/Serializable or use a Saver)</td></tr><tr><td>Custom types</td><td>Any type</td><td>Needs a Saver/mapSaver/listSaver for non-Bundle-able types</td></tr></tbody></table><p><strong>✅ When to use which</strong></p><ul><li>Use <code>rememberSaveable</code> for UI state the user would be annoyed to lose on rotation (form input, scroll position, selected tab); plain <code>remember</code> for cheap-to-recompute or purely transient state.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Lifecycle of composables",
                    "url": "https://developer.android.com/develop/ui/compose/lifecycle"
                }
            ],
            "tags": [
                "compose",
                "lifecycle",
                "composition",
                "recomposition"
            ],
            "hasDiagram": true,
            "diagramType": "animation",
            "diagramConfig": {
                "title": "Composable lifecycle",
                "steps": [
                    "Enter composition (first call)",
                    "Recompose (0+ times on state change)",
                    "Leave composition (removed / disposed)"
                ]
            },
            "codeSnippets": [],
            "subsection": null,
            "id": "compose-lifecycle",
            "importance": "must-know",
            "question": "Explain the Lifecycle of a Composable in Jetpack Compose.",
            "answer": "<p><strong>🔑 Three stages</strong></p><ul><li><strong>Enter the composition</strong> — the composable is called for the first time and added to the composition; <code>remember</code> blocks initialize, <code>LaunchedEffect</code>/<code>DisposableEffect</code> start.</li><li><strong>Recompose zero or more times</strong> — the composable re-runs whenever a <code>State</code> it reads changes; this can happen any number of times, including zero.</li><li><strong>Leave the composition</strong> — the composable is removed (e.g. an <code>if</code> branch stops being taken, navigated away from); <code>DisposableEffect.onDispose</code> and coroutine cancellation run here.</li></ul><p><strong>⚙️ Key nuance</strong></p><ul><li>This is the <strong>composition</strong> lifecycle, distinct from the <strong>Activity/Fragment lifecycle</strong> — a composable can enter/leave composition many times within a single Activity lifecycle (e.g. inside a <code>LazyColumn</code> as items scroll on/off screen, or behind an <code>if</code>).</li><li>Identity across recomposition is based on call-site position (and any explicit <code>key()</code>), which is why list items need stable <code>key</code>s in <code>LazyColumn</code>.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Lifecycle of composables",
                    "url": "https://developer.android.com/develop/ui/compose/lifecycle"
                }
            ],
            "tags": [
                "compose",
                "lifecycle",
                "disposableeffect",
                "lifecycleowner"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Observing Activity lifecycle events from a composable",
                    "code": "@Composable\nfun CameraPreviewScreen(analytics: Analytics) {\n    val lifecycleOwner = LocalLifecycleOwner.current\n\n    DisposableEffect(lifecycleOwner) {\n        val observer = LifecycleEventObserver { _, event ->\n            when (event) {\n                Lifecycle.Event.ON_START -> analytics.startSession()\n                Lifecycle.Event.ON_STOP -> analytics.endSession()\n                else -> Unit\n            }\n        }\n        lifecycleOwner.lifecycle.addObserver(observer)\n        onDispose {\n            lifecycleOwner.lifecycle.removeObserver(observer)\n        }\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "LocalLifecycleOwner.current gives the composable the hosting lifecycle owner.",
                                "DisposableEffect keyed on that owner registers a LifecycleEventObserver.",
                                "The user backgrounds the app. ON_PAUSE and ON_STOP fire and the observer receives them.",
                                "The camera preview is released in response — something composition alone would never tell you about.",
                                "Returning to the foreground fires ON_START and ON_RESUME, and the preview is restarted.",
                                "The composable leaves the composition, and onDispose removes the observer.",
                                "Without that removal the observer would outlive the screen and keep receiving events."
                            ],
                            "explain": "<p>The reason this is needed at all: <strong>composition lifetime and Activity lifecycle are not the same thing</strong>. A composable can remain composed while the app is backgrounded, so entering and leaving the composition does not tell you about pause and resume.</p><p>That matters for anything holding a hardware resource — a camera, a sensor, a media player — where the platform expects release on pause. Most screens need none of this, and reaching for it when a <code>LaunchedEffect</code> would do is a sign the state is in the wrong place.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-lifecycle-events",
            "importance": "should-know",
            "question": "How do you handle lifecycle events in Compose functions?",
            "answer": "<p><strong>🔑 Bridging Activity/Fragment lifecycle into Compose</strong></p><ul><li><code>LocalLifecycleOwner.current</code> gives access to the enclosing <code>Lifecycle</code> from within a composable.</li><li>Combine it with <code>DisposableEffect</code> and a <code>LifecycleEventObserver</code> to react to <code>ON_START</code>, <code>ON_STOP</code>, <code>ON_RESUME</code>, <code>ON_PAUSE</code>, etc. — e.g. starting/stopping a camera preview or analytics session.</li><li>For simpler cases, <code>collectAsStateWithLifecycle()</code> already handles start/stop internally, so you often don't need to hook the observer manually at all.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Compose performance",
                    "url": "https://developer.android.com/develop/ui/compose/performance"
                },
                {
                    "title": "Stability in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/performance/stability"
                }
            ],
            "tags": [
                "compose",
                "performance",
                "stability",
                "recomposition",
                "lazycolumn"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Stability and keys in a LazyColumn",
                    "code": "@Immutable\ndata class UserUi(val id: String, val name: String)\n\n@Composable\nfun UserList(users: List<UserUi>) {\n    LazyColumn {\n        items(items = users, key = { it.id }) { user ->\n            UserRow(user) // skippable: UserUi is @Immutable\n        }\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "UserList recomposes because its list parameter changed.",
                                "LazyColumn composes only the items currently visible, plus a small buffer.",
                                "key = { it.id } gives each item a stable identity across recompositions.",
                                "An item inserted at the top therefore does not shift every other item's identity — the rest keep their state and are not rebuilt.",
                                "Without a key, position is the identity, so inserting at the top invalidates everything below it.",
                                "@Immutable tells the compiler UserUi never changes, so Compose may compare instances and skip.",
                                "UserRow is therefore skipped for every item whose UserUi is unchanged, and only genuinely new rows recompose."
                            ],
                            "explain": "<p>Steps 4 and 5 are the same bug that <code>DiffUtil</code> and stable ids solve in <code>RecyclerView</code>, and it has the same symptom: scroll position jumping and per-item state resetting when the list changes.</p><p>Step 6 is the stability contract, and it is where most Compose performance work actually lives. Compose can only skip a composable when it can prove the arguments are unchanged, and an unstable type — a <code>List</code>, a class from a module without the Compose compiler — can never be proven unchanged. <code>@Immutable</code> is a promise the compiler takes at face value, so it is a lie with consequences if the class is in fact mutable.</p><p>Layout Inspector's recomposition counts are how to find these rather than guess.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-performance-optimization",
            "importance": "must-know",
            "question": "What are the best practices for performance optimization in Jetpack Compose?",
            "answer": "<p><strong>🔑 Make recomposition cheap and skippable</strong></p><ul><li>Prefer <strong>stable</strong>/<strong>immutable</strong> types for composable parameters (data classes with <code>val</code>s, <code>ImmutableList</code>) and annotate custom classes with <code>@Stable</code>/<code>@Immutable</code> where the compiler can't infer it — this lets Compose <strong>skip</strong> unchanged composables.</li><li>Read state as <strong>low</strong> in the tree as possible so only the smallest subtree recomposes.</li></ul><p><strong>⚙️ Concrete techniques</strong></p><ul><li>Give <code>LazyColumn</code>/<code>LazyRow</code> items a stable <code>key</code> to preserve identity, scroll position, and remembered state across reordering.</li><li>Use <code>derivedStateOf</code> to decouple fast-changing inputs from coarse-grained outputs.</li><li>Avoid creating lambdas/objects with unstable captures inline in hot paths; hoist them or wrap with <code>remember</code>.</li><li>Use the <strong>Layout Inspector</strong>'s recomposition counts and the <strong>Compose compiler metrics/reports</strong> to find unstable classes and unnecessary recompositions.</li><li>Adopt <strong>Baseline Profiles</strong> to reduce JIT/AOT compilation cost on cold start for Compose-heavy screens.</li></ul><p><strong>🎯 Interview tip:</strong> Say the words \"stability\" and \"skippability\" explicitly — that's the vocabulary interviewers listen for.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Compose in Views / Views in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/migrate/interoperability-apis"
                }
            ],
            "tags": [
                "compose",
                "interop",
                "views",
                "androidview",
                "composeview"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Hosting a legacy View inside Compose",
                    "code": "@Composable\nfun MapScreen() {\n    AndroidView(\n        factory = { context -> MapView(context).apply { onCreate(null) } },\n        update = { mapView -> mapView.getMapAsync { /* configure map */ } },\n        modifier = Modifier.fillMaxSize()\n    )\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "AndroidView composes and calls factory exactly once, creating the real MapView.",
                                "That View is inserted into the underlying Android view hierarchy that Compose is drawing into.",
                                "update runs after factory, and again on every recomposition where its captured state changed.",
                                "So factory is for construction, and update is for applying current state to the existing View.",
                                "The modifier positions and sizes the View exactly as it would any composable.",
                                "When the composable leaves the composition, the View is removed and released.",
                                "A View with its own lifecycle — MapView, VideoView — still needs its lifecycle methods called, which AndroidView does not do."
                            ],
                            "explain": "<p>Step 7 is the gap that causes real bugs. <code>MapView</code> expects <code>onCreate</code>, <code>onResume</code>, <code>onPause</code> and <code>onDestroy</code>, and <code>AndroidView</code> knows nothing about any of them — the usual fix is a <code>DisposableEffect</code> on <code>LocalLifecycleOwner</code> forwarding the events.</p><p>Steps 3 and 4 are the division that keeps this efficient: expensive construction happens once, and cheap state application happens per recomposition. Putting configuration in <code>factory</code> means it never updates; putting construction in <code>update</code> means rebuilding the map on every frame.</p><p>The reverse direction is <code>ComposeView</code>, for putting Compose inside an existing XML layout — which is how most incremental migrations actually start.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-with-views",
            "importance": "should-know",
            "question": "Can we use both Jetpack Compose and Android View in a Single App?",
            "answer": "<p><strong>🔑 Yes — Compose interops bidirectionally with Views</strong></p><ul><li><strong>Compose in Views</strong>: add a <code>ComposeView</code> to an XML layout (or use it directly in a Fragment) and call <code>setContent { ... }</code> to host Compose UI inside a View-based screen.</li><li><strong>Views in Compose</strong>: use the <code>AndroidView</code> composable to wrap and host a legacy <code>View</code>/<code>ViewGroup</code> (e.g. a <code>MapView</code>, an ad SDK's View) inside a Compose tree.</li></ul><p><strong>✅ Why this matters</strong></p><ul><li>Enables <strong>incremental migration</strong> screen by screen instead of a risky big-bang rewrite.</li><li>Lets you keep using View-only third-party SDKs while adopting Compose elsewhere.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "State hoisting",
                    "url": "https://developer.android.com/develop/ui/compose/state-hoisting"
                }
            ],
            "tags": [
                "compose",
                "state-hoisting",
                "unidirectional-data-flow",
                "state"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Hoisting state out of a component",
                    "code": "@Composable\nfun TermsCheckbox(\n    checked: Boolean,\n    onCheckedChange: (Boolean) -> Unit\n) {\n    Row(verticalAlignment = Alignment.CenterVertically) {\n        Checkbox(checked = checked, onCheckedChange = onCheckedChange)\n        Text(\"I agree to the terms\")\n    }\n}\n\n// Caller owns and hoists the state:\n// var accepted by remember { mutableStateOf(false) }\n// TermsCheckbox(checked = accepted, onCheckedChange = { accepted = it })",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "TermsCheckbox holds no state. It takes checked and reports changes through onCheckedChange.",
                                "Tapping the checkbox does not change anything by itself — it calls the lambda.",
                                "The caller updates whatever holds the truth: a remember, a ViewModel, a form state object.",
                                "That change flows back down as a new checked value.",
                                "The component recomposes and draws the new state.",
                                "Because the caller owns the value, a Continue button elsewhere can read the same value to enable itself.",
                                "And a test can render the component in either state directly, with no interaction at all."
                            ],
                            "explain": "<p>Steps 6 and 7 are why hoisting is the default advice. A checkbox that owns its state cannot tell anyone else what it is, so a form that needs to enable a button has to reach into it or duplicate the value — and duplicated state goes out of sync.</p><p>The pattern is a value parameter plus an <code>on&lt;Value&gt;Change</code> callback, and it is a one-way loop: state down, events up. There is no path where the component and its owner disagree, because only one of them holds anything.</p><p>Hoist to the <strong>lowest common ancestor</strong> of everything that needs the value. Hoisting further than that makes components harder to reuse for no benefit.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-state-hoisting",
            "importance": "must-know",
            "question": "What is State Hoisting in Compose?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><strong>State hoisting</strong> is the pattern of moving state <strong>up</strong> out of a composable to its caller, turning the composable into a <strong>stateless</strong>, reusable component driven by <code>value</code> and <code>onValueChange</code> parameters.</li><li>It's the Compose expression of <strong>unidirectional data flow</strong>: state flows down, events flow up.</li></ul><p><strong>✅ Benefits</strong></p><ul><li>Single source of truth — no duplicated/desynchronized state.</li><li>Stateless composables are trivially reusable, testable, and previewable with any input.</li><li>The caller decides <em>where</em> the state actually lives (local <code>remember</code>, a ViewModel, a parent composable) without the child needing to know.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "CompositionLocal",
                    "url": "https://developer.android.com/develop/ui/compose/compositionlocal"
                }
            ],
            "tags": [
                "compose",
                "compositionlocal",
                "theming",
                "dependency-injection"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Providing and reading a CompositionLocal",
                    "code": "val LocalSpacing = compositionLocalOf { 8.dp }\n\n@Composable\nfun ScreenWithCustomSpacing() {\n    CompositionLocalProvider(LocalSpacing provides 16.dp) {\n        SpacedColumn() // reads LocalSpacing.current internally\n    }\n}\n\n@Composable\nfun SpacedColumn() {\n    Column(verticalArrangement = Arrangement.spacedBy(LocalSpacing.current)) {\n        Text(\"A\"); Text(\"B\")\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "compositionLocalOf { 8.dp } declares a key with a default value.",
                                "CompositionLocalProvider binds 16.dp to that key for the composables inside its block.",
                                "SpacedColumn is called without being passed anything about spacing.",
                                "Deep inside, some composable reads LocalSpacing.current.",
                                "Compose walks up the composition to the nearest provider and returns 16.dp.",
                                "A composable outside any provider reads the default, 8.dp, rather than failing.",
                                "Changing the provided value recomposes only the composables that actually READ it."
                            ],
                            "explain": "<p>Step 3 is the appeal and step 3 is also the objection: the dependency is invisible at the call site. A composable's parameters no longer tell you everything it needs, which makes it harder to reason about and easier to break by moving.</p><p>So this is for values that are genuinely ambient and read by many things at many depths — theme colours, typography, density, the current lifecycle owner. Passing a ViewModel or screen data this way is the common misuse.</p><p>Step 7 is what keeps it efficient: reading is tracked like any other state read, so a changed value does not invalidate the whole subtree.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-composition-local",
            "importance": "should-know",
            "question": "Explain CompositionLocal in Compose.",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><code>CompositionLocal</code> lets you implicitly pass data down the composition tree without threading it through every function's parameters — similar in spirit to React Context or dependency injection scoped to the UI tree.</li><li>Values are provided via <code>CompositionLocalProvider(LocalX provides value) { ... }</code> and read anywhere below with <code>LocalX.current</code>.</li></ul><p><strong>⚙️ Two flavors</strong></p><ul><li><code>compositionLocalOf { default }</code> — tracks reads and only recomposes readers when the value actually changes; use when the value changes at runtime (e.g. a theme toggle).</li><li><code>staticCompositionLocalOf { default }</code> — no change tracking, causes the <strong>entire content</strong> under the provider to recompose on change; cheaper for values that rarely/never change (e.g. static config).</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>It's for cross-cutting, tree-scoped concerns (theme, layout direction, content alpha) — not a substitute for explicit parameters or proper state management; overusing it makes data flow hard to trace.</li></ul><p><strong>🎯 Interview tip:</strong> <code>MaterialTheme.colorScheme</code>/<code>LocalContext.current</code> are CompositionLocals you already use daily — good concrete examples to cite.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Phases of Compose",
                    "url": "https://developer.android.com/develop/ui/compose/phases"
                }
            ],
            "tags": [
                "compose",
                "phases",
                "composition",
                "layout",
                "drawing",
                "performance"
            ],
            "hasDiagram": true,
            "diagramType": "flowchart",
            "diagramConfig": {
                "title": "Compose phases",
                "columns": 3,
                "nodes": [
                    {
                        "label": "Composition",
                        "type": "terminal"
                    },
                    {
                        "label": "Layout (measure/place)"
                    },
                    {
                        "label": "Drawing"
                    }
                ],
                "connections": [
                    {
                        "from": 0,
                        "to": 1,
                        "label": "what"
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "where"
                    }
                ]
            },
            "codeSnippets": [],
            "subsection": null,
            "id": "compose-phases",
            "importance": "must-know",
            "question": "Explain Jetpack Compose Phases.",
            "answer": "<p><strong>🔑 Three phases, every frame</strong></p><ul><li><strong>Composition</strong> — <em>what</em> to show: composable functions run and build up a tree describing the UI (the slot table).</li><li><strong>Layout</strong> — <em>where</em> to place it: each node is measured (via its <code>MeasurePolicy</code>) and placed, in a single pass that's both top-down (constraints) and bottom-up (sizes) — children are measured first, then the parent decides their position.</li><li><strong>Drawing</strong> — <em>how</em> it looks: the tree is rendered onto the canvas, back to front.</li></ul><p><strong>⚙️ Why this separation matters</strong></p><ul><li>Each phase can start before the previous fully finishes for other parts of the tree, and layout/drawing can be recalculated <strong>without</strong> rerunning composition if only visual properties changed (e.g. via <code>Modifier.graphicsLayer</code>, which can skip straight to drawing).</li><li>Understanding phases explains why some optimizations (like reading animated values inside a draw-phase lambda instead of a composable parameter) avoid triggering a full recomposition.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Modifiers in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/modifiers"
                }
            ],
            "tags": [
                "compose",
                "modifier",
                "layout",
                "ordering"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Modifier order changes the result",
                    "code": "// Background OUTSIDE the padding (gray border visible)\nBox(\n    modifier = Modifier\n        .padding(16.dp)\n        .background(Color.Gray)\n        .size(100.dp)\n)\n\n// Background INSIDE, fills the padded space too\nBox(\n    modifier = Modifier\n        .background(Color.Gray)\n        .padding(16.dp)\n        .size(100.dp)\n)",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "A Modifier chain is an ordered list, applied outermost first.",
                                "In the first case padding comes before background, so the padding is applied outside the drawn area.",
                                "The background then fills only what is left inside that padding, leaving a visible unpainted border.",
                                "In the second case background comes first, so it fills the full area.",
                                "The padding is then applied inside it, and the background shows through the padded region.",
                                "The same two modifiers in two orders give two visibly different results, with no error either way.",
                                "clickable follows the same rule: placed before padding the padded area is not tappable, placed after it is."
                            ],
                            "explain": "<p>Step 6 is what makes this an interview question. Both orders compile and both look plausible; only one matches the intent, and the difference is a few pixels of unpainted space or a tap target that is smaller than it looks.</p><p>Step 7 is the version that reaches users. A <code>clickable</code> placed before <code>padding</code> produces a button whose touch area excludes its own padding — which fails accessibility guidance on minimum target size and feels unresponsive at the edges.</p><p>The mental model: read the chain top to bottom as moving from the outside inward.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-modifier",
            "importance": "must-know",
            "question": "What is the role of Modifier in Jetpack Compose?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li>A <code>Modifier</code> is an immutable, chainable element used to decorate or configure a composable: size, padding, background, border, click handling, semantics, layout behavior — all without the composable needing dedicated parameters for each.</li><li>By convention every composable exposes a single trailing <code>modifier: Modifier = Modifier</code> parameter, letting callers compose behavior externally instead of the component exploding with boolean flags.</li></ul><p><strong>⚠️ Order matters</strong></p><ul><li>Modifiers are applied <strong>in the order they're chained</strong> — each wraps the next, so <code>padding().background()</code> and <code>background().padding()</code> produce visually different results (padding-then-background leaves the background outside the padding; background-then-padding fills including the padding area).</li><li><code>clickable</code> placed before <code>padding</code> makes the whole padded area clickable; placed after, only the inner content area is clickable.</li></ul><p><strong>🎯 Interview tip:</strong> Be ready to draw/describe the padding-vs-background order example — it's the canonical way interviewers test whether you actually understand modifier chaining.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Semantics in Compose",
                    "url": "https://developer.android.com/develop/ui/compose/accessibility/semantics"
                }
            ],
            "tags": [
                "compose",
                "semantics",
                "accessibility",
                "testing"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Semantics for accessibility and for tests",
                    "code": "@Composable\nfun FavoriteIcon(isFavorite: Boolean, onToggle: () -> Unit) {\n    Icon(\n        imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,\n        contentDescription = if (isFavorite) \"Remove from favorites\" else \"Add to favorites\",\n        modifier = Modifier\n            .clickable(onClick = onToggle)\n            .testTag(\"favorite_icon\")\n    )\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "Compose builds a semantics tree alongside the UI tree, describing meaning rather than pixels.",
                                "contentDescription on the Icon supplies the label TalkBack reads aloud.",
                                "It changes with isFavorite, so the announcement is \"Remove from favorites\" or \"Add to favorites\" — the current state, not just the control.",
                                "clickable adds a click action to the semantics node, so TalkBack announces the element as actionable.",
                                "testTag adds an identifier that assistive technology ignores and tests can find.",
                                "A UI test locates the node by that tag, or by the content description, without knowing anything about layout.",
                                "A decorative image would take contentDescription = null, which removes it from the tree so screen readers skip it."
                            ],
                            "explain": "<p>Step 3 is the difference between a label that helps and one that does not. A static \"favorite\" tells a screen-reader user what the control is and not what tapping it will do; the state-dependent version tells them both.</p><p>Step 7 is equally important and often missed — <code>null</code> is the correct value for decoration, and it is not the same as an empty string. An icon that adds no information should not be announced at all.</p><p>Step 6 is why this pays off even for teams not yet thinking about accessibility: the same tree is what UI tests query, so semantics and testability are the same work.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-semantics",
            "importance": "should-know",
            "question": "What are Semantics in Compose?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><strong>Semantics</strong> describe the <strong>meaning</strong> of UI elements to accessibility services (TalkBack), the testing framework, and autofill — separate from how they look. Compose builds a <strong>semantics tree</strong> alongside the UI tree.</li><li>Most built-in components (<code>Text</code>, <code>Button</code>, <code>Image</code>) already emit sensible default semantics; custom components/graphics often need to add them explicitly.</li></ul><p><strong>⚙️ Key APIs</strong></p><ul><li><code>Modifier.semantics { contentDescription = \"...\" }</code> — describe an element (essential for <code>Image</code>/<code>Icon</code> without visible text).</li><li><code>Modifier.clearAndSetSemantics { }</code> — override/merge children's semantics, e.g. to describe a compound component as one unit.</li><li><code>mergeDescendants = true</code> — groups a subtree's semantics into a single accessibility node (used automatically by clickable rows).</li><li><code>Modifier.testTag(\"...\")</code> — a semantics property used purely for UI tests (<code>onNodeWithTag</code>), not exposed to accessibility services.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Handle user input",
                    "url": "https://developer.android.com/develop/ui/compose/touch-input"
                }
            ],
            "tags": [
                "compose",
                "user-input",
                "gestures",
                "textfield",
                "clickable"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Click, text and drag, all through state",
                    "code": "@Composable\nfun InputDemo() {\n    var text by remember { mutableStateOf(\"\") }\n    var offsetX by remember { mutableStateOf(0f) }\n\n    Column {\n        TextField(value = text, onValueChange = { text = it })\n        Box(\n            modifier = Modifier\n                .size(80.dp)\n                .offset { IntOffset(offsetX.roundToInt(), 0) }\n                .pointerInput(Unit) {\n                    detectDragGestures { change, dragAmount ->\n                        change.consume()\n                        offsetX += dragAmount.x\n                    }\n                }\n                .background(Color.Blue)\n        )\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "The TextField reads text and reports edits through onValueChange, which writes the state.",
                                "The composable recomposes and the field shows the new value — the field itself stores nothing.",
                                "pointerInput installs a gesture detector on the Box.",
                                "A drag produces a stream of deltas; each one is added to offsetX in state.",
                                "offset reads offsetX, so the Box moves — again because the state changed, not because anything was told to move.",
                                "clickable adds a click handler and, with it, ripple feedback and accessibility semantics.",
                                "Every interaction follows the same loop: the gesture updates state, and the UI is redrawn from state."
                            ],
                            "explain": "<p>Step 7 is the reason there is no separate input API to learn. Input handling in Compose is not a set of listeners that mutate views; it is a set of modifiers that update state, and the UI follows because it always follows state.</p><p>Step 6 is worth choosing deliberately. <code>clickable</code> brings the ripple, the minimum touch target and the semantics; <code>pointerInput</code> with <code>detectTapGestures</code> brings none of them, and is the right choice only when you genuinely do not want them.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-user-input",
            "importance": "should-know",
            "question": "How can you handle user input and events in Jetpack Compose?",
            "answer": "<p><strong>🔑 Input flows in through Modifiers and callbacks</strong></p><ul><li><strong>Clicks/taps</strong>: <code>Modifier.clickable { }</code>, <code>combinedClickable</code> (long-press/double-click), or component-level <code>onClick</code> (e.g. <code>Button</code>).</li><li><strong>Text input</strong>: <code>TextField(value, onValueChange)</code> — a controlled/stateless component; the caller owns the text state.</li><li><strong>Gestures/drag</strong>: <code>Modifier.pointerInput(key) { detectDragGestures { ... } }</code>, <code>draggable</code>, <code>scrollable</code>, <code>transformable</code> for pinch/zoom.</li><li><strong>Focus</strong>: <code>Modifier.focusRequester()</code>/<code>focusable()</code> plus <code>FocusManager</code> for programmatic focus control (e.g. move to next field on IME action).</li></ul><p><strong>⚙️ Event flow</strong></p><ul><li>All of these follow unidirectional data flow: the UI reports the raw event via a callback; the caller (often a ViewModel) decides how state should change, and the new state flows back down.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Navigation with Compose",
                    "url": "https://developer.android.com/guide/navigation"
                }
            ],
            "tags": [
                "compose",
                "navigation",
                "navhost",
                "navcontroller"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "A NavHost and an argument",
                    "code": "@Composable\nfun AppNavGraph() {\n    val navController = rememberNavController()\n\n    NavHost(navController = navController, startDestination = \"home\") {\n        composable(\"home\") {\n            HomeScreen(onOpenDetail = { id -> navController.navigate(\"detail/$id\") })\n        }\n        composable(\n            route = \"detail/{itemId}\",\n            arguments = listOf(navArgument(\"itemId\") { type = NavType.StringType })\n        ) { backStackEntry ->\n            val itemId = backStackEntry.arguments?.getString(\"itemId\")\n            DetailScreen(itemId = itemId, onBack = { navController.popBackStack() })\n        }\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "rememberNavController creates the controller and remembers it across recompositions.",
                                "NavHost declares the graph and composes the start destination, \"home\".",
                                "HomeScreen receives a lambda rather than the controller itself, so it does not know navigation exists.",
                                "A tap calls navController.navigate(\"detail/42\"). The route is a string, built by substitution.",
                                "NavHost matches it against \"detail/{itemId}\", extracts the argument, and composes the detail destination.",
                                "The back stack now holds home and detail; system back pops to home and recomposes it.",
                                "Each destination gets its own ViewModel scope, so a ViewModel obtained there is cleared when it is popped."
                            ],
                            "explain": "<p>Step 3 is the design decision worth defending in an interview. Passing the <code>NavController</code> down makes every screen depend on navigation and impossible to preview or test in isolation; passing lambdas keeps screens ignorant of where the button leads.</p><p>Step 4 is the weakness of string routes — they are built by concatenation and checked at runtime, so a typo is a crash rather than a compile error. Type-safe navigation with serializable route classes exists precisely to remove that.</p><p>Step 7 is the useful consequence of destination-scoped ViewModels: state is cleaned up when the screen is popped, without any explicit teardown.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-navigation",
            "importance": "must-know",
            "question": "How do you handle navigation in Jetpack Compose?",
            "answer": "<p><strong>🔑 Navigation-Compose building blocks</strong></p><ul><li><code>NavController</code> — holds navigation state and back stack, created with <code>rememberNavController()</code>.</li><li><code>NavHost</code> — a composable container that swaps its content based on the current route, mapping routes to destination composables via a <code>NavGraphBuilder</code> DSL (<code>composable(route) { ... }</code>).</li><li>Navigate with <code>navController.navigate(\"route/$id\")</code>; pop with <code>popBackStack()</code>; pass arguments as part of the route string, retrieved via <code>backStackEntry.arguments</code>.</li></ul><p><strong>⚙️ Modern additions</strong></p><ul><li><strong>Type-safe navigation</strong> (Navigation-Compose 2.8+) lets you define destinations as <code>@Serializable</code> classes/objects instead of raw string routes, catching argument mistakes at compile time.</li><li>Nested graphs and <code>hiltViewModel()</code>/scoped ViewModels integrate cleanly for feature-module navigation.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Save UI state",
                    "url": "https://developer.android.com/develop/ui/compose/state-saving"
                },
                {
                    "title": "Window size classes",
                    "url": "https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes"
                }
            ],
            "tags": [
                "compose",
                "orientation",
                "configuration-change",
                "rememberSaveable",
                "viewmodel"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "compose-orientation-changes",
            "importance": "should-know",
            "question": "How do you handle orientation changes in Jetpack Compose?",
            "answer": "<p><strong>🔑 Same rules as the rest of the app</strong></p><ul><li>By default a configuration change (rotation) recreates the Activity; any state held only via plain <code>remember</code> is lost, then reset to its initial value.</li><li>Use <code>rememberSaveable</code> for UI state that must survive rotation (form input, expanded/collapsed flags, selected tab, scroll position via <code>rememberLazyListState</code> wrapped in <code>rememberSaveable</code>-friendly APIs).</li><li><code>ViewModel</code>-held state survives configuration changes automatically since the <code>ViewModel</code> outlives the recreated Activity (scoped to the <code>ViewModelStore</code>).</li></ul><p><strong>⚙️ Adapting layout to orientation</strong></p><ul><li>Use <code>BoxWithConstraints</code> or <code>WindowSizeClass</code> (from <code>material3-window-size-class</code>) to branch layout based on available width/height instead of hardcoding orientation checks — this also handles foldables and multi-window correctly.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Manage state — UDF",
                    "url": "https://developer.android.com/develop/ui/compose/state#udf"
                }
            ],
            "tags": [
                "compose",
                "unidirectional-data-flow",
                "state-hoisting",
                "viewmodel"
            ],
            "hasDiagram": true,
            "diagramType": "flowchart",
            "diagramConfig": {
                "title": "Unidirectional data flow",
                "columns": 2,
                "nodes": [
                    {
                        "label": "State Holder (ViewModel)",
                        "type": "terminal"
                    },
                    {
                        "label": "Composable UI"
                    }
                ],
                "connections": [
                    {
                        "from": 0,
                        "to": 1,
                        "label": "state down"
                    },
                    {
                        "from": 1,
                        "to": 0,
                        "label": "event up"
                    }
                ]
            },
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "State down, events up",
                    "code": "@Composable\nfun TodoScreen(viewModel: TodoViewModel = viewModel()) {\n    val uiState by viewModel.uiState.collectAsStateWithLifecycle()\n\n    TodoList(\n        items = uiState.items,           // state DOWN\n        onItemChecked = viewModel::onItemChecked // event UP\n    )\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "The ViewModel owns the state and exposes it read-only.",
                                "The screen collects it and passes plain values DOWN into TodoList.",
                                "TodoList renders those values and holds none of its own.",
                                "The user checks an item. TodoList does not change anything — it calls the lambda it was given.",
                                "That event travels UP to viewModel::onItemChecked.",
                                "The ViewModel produces a new state with the item toggled.",
                                "The new state flows DOWN again, and the screen recomposes. The loop closes."
                            ],
                            "explain": "<p>Step 4 is what makes this one-directional rather than merely tidy. The component that displays the checkbox is not allowed to change it, so there is exactly one place where the truth can change and exactly one place to look when it is wrong.</p><p>The debugging property that follows is the real benefit: given a state object you can reproduce the screen exactly, and given a bug you can find the one function that produced that state.</p><p>The failure mode is a component keeping its own copy \"for responsiveness\" — two sources of truth that agree until they do not.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-unidirectional-data-flow",
            "importance": "should-know",
            "question": "Explain unidirectional data flow in Jetpack Compose.",
            "answer": "<p><strong>🔑 State down, events up</strong></p><ul><li><strong>Unidirectional data flow (UDF)</strong> is a pattern where state flows in one direction — from a state holder (ViewModel/parent composable) <strong>down</strong> into composables as parameters — and events flow in the opposite direction — <strong>up</strong> from composables to the state holder via callback lambdas.</li><li>The state holder is the single source of truth; composables never mutate state directly, they only report <em>what happened</em> (a click, a text change) and let the owner decide the new state.</li></ul><p><strong>✅ Why it's used</strong></p><ul><li>Makes state changes predictable and traceable — you can reason about the whole screen by reading one state holder instead of chasing mutations scattered across the view tree.</li><li>Composables built this way are naturally stateless and reusable (see state hoisting).</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Custom layouts",
                    "url": "https://developer.android.com/develop/ui/compose/layouts/custom"
                }
            ],
            "tags": [
                "compose",
                "custom-layout",
                "measurepolicy",
                "layout"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Writing a custom Layout",
                    "code": "@Composable\nfun StackedLayout(\n    modifier: Modifier = Modifier,\n    overlapPx: Int = 40,\n    content: @Composable () -> Unit\n) {\n    Layout(content = content, modifier = modifier) { measurables, constraints ->\n        val placeables = measurables.map { it.measure(constraints) }\n        val width = placeables.maxOf { it.width }\n        val height = placeables.sumOf { it.height } - overlapPx * (placeables.size - 1)\n\n        layout(width, height.coerceAtLeast(0)) {\n            var y = 0\n            placeables.forEach { placeable ->\n                placeable.placeRelative(x = 0, y = y)\n                y += placeable.height - overlapPx\n            }\n        }\n    }\n}",
                        "output": {
                            "kind": "trace",
                            "lines": [
                                "Layout takes the content and a measure block, replacing the built-in Column or Row.",
                                "measurables are the children, not yet measured. Each is measured exactly once — measuring twice throws.",
                                "Each child is measured against the incoming constraints and becomes a placeable with a fixed size.",
                                "The parent computes its own size from those: the widest child, and the summed heights minus the overlap.",
                                "layout(width, height) declares that size to the parent.",
                                "Inside it, each placeable is positioned with placeRelative at a y that steps back by the overlap.",
                                "placeRelative rather than place is what makes the layout mirror correctly in right-to-left locales."
                            ],
                            "explain": "<p>Step 2 is the constraint that makes Compose layout single-pass and therefore linear: <strong>measure once</strong>. The View system permits multiple measure passes, which is how a deep hierarchy of nested weights becomes exponentially slow. Compose forbids it outright.</p><p>Step 6 is the shape of every custom layout — measure children, decide your own size, place them — and it is the same three steps whether the layout is this simple or a full flow layout.</p><p>Step 7 is the detail worth knowing: <code>placeRelative</code> respects layout direction and <code>place</code> does not.</p>"
                        }
                }
            ],
            "subsection": null,
            "id": "compose-custom-layouts",
            "importance": "should-know",
            "question": "How to create Custom Layouts in Compose?",
            "answer": "<p><strong>🔑 The Layout composable</strong></p><ul><li>For layout behavior no built-in (<code>Row</code>, <code>Column</code>, <code>Box</code>, <code>ConstraintLayout</code>) provides, use the low-level <code>Layout</code> composable, which lets you supply a custom <strong>measure and placement</strong> policy.</li><li>Inside its lambda you receive the list of <code>Measurable</code> children and incoming <code>Constraints</code>; you call <code>measurable.measure(constraints)</code> on each to get a <code>Placeable</code>, compute the layout's own size, then call <code>layout(width, height) { placeable.placeRelative(x, y) }</code> to position each child.</li><li>For a reusable custom layout <em>modifier</em> (affecting a single child's measurement, like a custom padding), implement <code>LayoutModifier</code>/use <code>Modifier.layout { measurable, constraints -> ... }</code> instead of a whole composable.</li></ul><p><strong>🎯 Interview tip:</strong> Mention that this is exactly the mechanism <code>Row</code>/<code>Column</code>/<code>Box</code> are themselves built on — Compose's built-in layouts are just <code>Layout</code> with specific measure policies, nothing magic.</p>"
        }
    ]
};
