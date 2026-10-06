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
                    "code": "<TextView\n    android:id=\"@+id/greeting\"\n    android:layout_width=\"wrap_content\"\n    android:layout_height=\"wrap_content\" />\n\n<!-- In the Activity/Fragment -->\n<!--\nval greeting = findViewById<TextView>(R.id.greeting)\ngreeting.text = \"Hello, $name\"\n-->"
                },
                {
                    "language": "kotlin",
                    "title": "Equivalent in Compose",
                    "code": "@Composable\nfun Greeting(name: String) {\n    Text(text = \"Hello, $name\")\n}\n\n// No findViewById, no manual mutation.\n// Calling Greeting(\"Aditya\") again with a new name\n// automatically updates the UI via recomposition."
                }
            ],
            "subsection": null,
            "id": "compose-vs-view-system",
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
                    "code": "@Composable\nfun Counter() {\n    var count by remember { mutableStateOf(0) }\n\n    // Describes what the UI looks like for the CURRENT count.\n    // No manual view updates -- Compose re-runs this on state change.\n    Column {\n        Text(text = \"Count: $count\")\n        Button(onClick = { count++ }) {\n            Text(\"Increment\")\n        }\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-declarative-ui",
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
                    "title": "A well-formed composable",
                    "code": "@Composable\nfun UserCard(\n    name: String,\n    onClick: () -> Unit,\n    modifier: Modifier = Modifier\n) {\n    Row(\n        modifier = modifier\n            .fillMaxWidth()\n            .clickable(onClick = onClick)\n            .padding(16.dp)\n    ) {\n        Text(text = name, style = MaterialTheme.typography.titleMedium)\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-composable-functions",
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
                    "title": "Only the reading composable recomposes",
                    "code": "@Composable\nfun Screen() {\n    var count by remember { mutableStateOf(0) }\n\n    Column {\n        Header() // does NOT read `count` -> never recomposes here\n        CounterText(count) // reads `count` -> recomposes on change\n        Button(onClick = { count++ }) { Text(\"+1\") }\n    }\n}\n\n@Composable\nfun CounterText(count: Int) {\n    Text(\"Count: $count\")\n}"
                }
            ],
            "subsection": null,
            "id": "compose-recomposition",
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
                    "title": "MutableState delegate syntax",
                    "code": "@Composable\nfun NameInput() {\n    // `by` delegates .value access to a plain `var`\n    var name by remember { mutableStateOf(\"\") }\n\n    OutlinedTextField(\n        value = name,\n        onValueChange = { name = it },\n        label = { Text(\"Name\") }\n    )\n}"
                }
            ],
            "subsection": null,
            "id": "compose-mutable-state",
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
                    "title": "ViewModel-backed screen state",
                    "code": "class ProfileViewModel : ViewModel() {\n    private val _uiState = MutableStateFlow(ProfileUiState())\n    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()\n\n    fun onNameChanged(name: String) {\n        _uiState.update { it.copy(name = name) }\n    }\n}\n\n@Composable\nfun ProfileScreen(viewModel: ProfileViewModel = viewModel()) {\n    val uiState by viewModel.uiState.collectAsStateWithLifecycle()\n    ProfileContent(uiState = uiState, onNameChanged = viewModel::onNameChanged)\n}"
                }
            ],
            "subsection": null,
            "id": "compose-state-management",
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
                    "title": "Stateful wrapper around a stateless component",
                    "code": "// Stateless: fully controlled by the caller\n@Composable\nfun SearchBar(query: String, onQueryChange: (String) -> Unit) {\n    TextField(value = query, onValueChange = onQueryChange)\n}\n\n// Stateful: owns the state, delegates rendering\n@Composable\nfun StatefulSearchBar() {\n    var query by remember { mutableStateOf(\"\") }\n    SearchBar(query = query, onQueryChange = { query = it })\n}"
                }
            ],
            "subsection": null,
            "id": "compose-stateful-vs-stateless",
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
                    "title": "LaunchedEffect for a one-shot suspend call",
                    "code": "@Composable\nfun UserScreen(userId: String, viewModel: UserViewModel = viewModel()) {\n    LaunchedEffect(userId) {\n        viewModel.loadUser(userId) // suspend call, cancelled if userId changes\n    }\n}"
                },
                {
                    "language": "kotlin",
                    "title": "DisposableEffect for listener cleanup",
                    "code": "@Composable\nfun WindowFocusObserver(onFocusChanged: (Boolean) -> Unit) {\n    val view = LocalView.current\n    DisposableEffect(view) {\n        val listener = ViewTreeObserver.OnWindowFocusChangeListener { hasFocus ->\n            onFocusChanged(hasFocus)\n        }\n        view.viewTreeObserver.addOnWindowFocusChangeListener(listener)\n        onDispose {\n            view.viewTreeObserver.removeOnWindowFocusChangeListener(listener)\n        }\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-launched-vs-disposable",
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
                    "code": "@Composable\nfun ScrollToTopButton(listState: LazyListState) {\n    val scope = rememberCoroutineScope()\n\n    Button(onClick = {\n        scope.launch {\n            listState.animateScrollToItem(0)\n        }\n    }) {\n        Text(\"Back to top\")\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-remember-coroutine-scope",
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
                    "title": "Observing StateFlow safely",
                    "code": "@Composable\nfun WeatherScreen(viewModel: WeatherViewModel = viewModel()) {\n    val uiState by viewModel.weatherState.collectAsStateWithLifecycle()\n\n    when (uiState) {\n        is WeatherUiState.Loading -> LoadingSpinner()\n        is WeatherUiState.Success -> WeatherContent(uiState.data)\n        is WeatherUiState.Error -> ErrorMessage(uiState.message)\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-observe-flows-livedata",
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
                    "title": "Async load on screen entry",
                    "code": "@Composable\nfun ArticleScreen(articleId: String, viewModel: ArticleViewModel = viewModel()) {\n    LaunchedEffect(articleId) {\n        viewModel.loadArticle(articleId)\n    }\n    val state by viewModel.uiState.collectAsStateWithLifecycle()\n    ArticleContent(state)\n}"
                }
            ],
            "subsection": null,
            "id": "compose-async-operations",
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
                    "title": "Wrapping a callback API with produceState",
                    "code": "@Composable\nfun rememberLocation(locationClient: LocationClient): State<Location?> {\n    return produceState<Location?>(initialValue = null) {\n        val callback = LocationCallback { location -> value = location }\n        locationClient.register(callback)\n        awaitDispose { locationClient.unregister(callback) }\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-non-compose-state",
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
                    "title": "Classic derivedStateOf use case",
                    "code": "@Composable\nfun ScrollToTopFab(listState: LazyListState) {\n    val showButton by remember {\n        derivedStateOf { listState.firstVisibleItemIndex > 0 }\n    }\n\n    if (showButton) {\n        FloatingActionButton(onClick = { /* scroll up */ }) {\n            Icon(Icons.Default.ArrowUpward, contentDescription = \"Scroll to top\")\n        }\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-derived-state-of",
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
                    "title": "Avoiding a stale closure",
                    "code": "@Composable\nfun SplashScreen(onTimeout: () -> Unit) {\n    val currentOnTimeout by rememberUpdatedState(onTimeout)\n\n    LaunchedEffect(true) {\n        delay(3000)\n        currentOnTimeout() // always calls the LATEST lambda\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-remember-updated-state",
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
                    "title": "remember vs rememberSaveable",
                    "code": "@Composable\nfun SurveyForm() {\n    // Lost on rotation\n    var isExpanded by remember { mutableStateOf(false) }\n\n    // Survives rotation and process death\n    var answer by rememberSaveable { mutableStateOf(\"\") }\n\n    Column {\n        TextField(value = answer, onValueChange = { answer = it })\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-remember-vs-saveable",
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
                    "title": "Observing Activity lifecycle events from Compose",
                    "code": "@Composable\nfun CameraPreviewScreen(analytics: Analytics) {\n    val lifecycleOwner = LocalLifecycleOwner.current\n\n    DisposableEffect(lifecycleOwner) {\n        val observer = LifecycleEventObserver { _, event ->\n            when (event) {\n                Lifecycle.Event.ON_START -> analytics.startSession()\n                Lifecycle.Event.ON_STOP -> analytics.endSession()\n                else -> Unit\n            }\n        }\n        lifecycleOwner.lifecycle.addObserver(observer)\n        onDispose {\n            lifecycleOwner.lifecycle.removeObserver(observer)\n        }\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-lifecycle-events",
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
                    "title": "Stable data class + list keys",
                    "code": "@Immutable\ndata class UserUi(val id: String, val name: String)\n\n@Composable\nfun UserList(users: List<UserUi>) {\n    LazyColumn {\n        items(items = users, key = { it.id }) { user ->\n            UserRow(user) // skippable: UserUi is @Immutable\n        }\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-performance-optimization",
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
                    "code": "@Composable\nfun MapScreen() {\n    AndroidView(\n        factory = { context -> MapView(context).apply { onCreate(null) } },\n        update = { mapView -> mapView.getMapAsync { /* configure map */ } },\n        modifier = Modifier.fillMaxSize()\n    )\n}"
                }
            ],
            "subsection": null,
            "id": "compose-with-views",
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
                    "title": "Hoisting state out of a checkbox row",
                    "code": "@Composable\nfun TermsCheckbox(\n    checked: Boolean,\n    onCheckedChange: (Boolean) -> Unit\n) {\n    Row(verticalAlignment = Alignment.CenterVertically) {\n        Checkbox(checked = checked, onCheckedChange = onCheckedChange)\n        Text(\"I agree to the terms\")\n    }\n}\n\n// Caller owns and hoists the state:\n// var accepted by remember { mutableStateOf(false) }\n// TermsCheckbox(checked = accepted, onCheckedChange = { accepted = it })"
                }
            ],
            "subsection": null,
            "id": "compose-state-hoisting",
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
                    "title": "Defining and providing a CompositionLocal",
                    "code": "val LocalSpacing = compositionLocalOf { 8.dp }\n\n@Composable\nfun ScreenWithCustomSpacing() {\n    CompositionLocalProvider(LocalSpacing provides 16.dp) {\n        SpacedColumn() // reads LocalSpacing.current internally\n    }\n}\n\n@Composable\nfun SpacedColumn() {\n    Column(verticalArrangement = Arrangement.spacedBy(LocalSpacing.current)) {\n        Text(\"A\"); Text(\"B\")\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-composition-local",
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
                    "title": "Order changes the result",
                    "code": "// Background OUTSIDE the padding (gray border visible)\nBox(\n    modifier = Modifier\n        .padding(16.dp)\n        .background(Color.Gray)\n        .size(100.dp)\n)\n\n// Background INSIDE, fills the padded space too\nBox(\n    modifier = Modifier\n        .background(Color.Gray)\n        .padding(16.dp)\n        .size(100.dp)\n)"
                }
            ],
            "subsection": null,
            "id": "compose-modifier",
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
                    "title": "Adding accessibility semantics",
                    "code": "@Composable\nfun FavoriteIcon(isFavorite: Boolean, onToggle: () -> Unit) {\n    Icon(\n        imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,\n        contentDescription = if (isFavorite) \"Remove from favorites\" else \"Add to favorites\",\n        modifier = Modifier\n            .clickable(onClick = onToggle)\n            .testTag(\"favorite_icon\")\n    )\n}"
                }
            ],
            "subsection": null,
            "id": "compose-semantics",
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
                    "title": "Click, text input and drag in one screen",
                    "code": "@Composable\nfun InputDemo() {\n    var text by remember { mutableStateOf(\"\") }\n    var offsetX by remember { mutableStateOf(0f) }\n\n    Column {\n        TextField(value = text, onValueChange = { text = it })\n        Box(\n            modifier = Modifier\n                .size(80.dp)\n                .offset { IntOffset(offsetX.roundToInt(), 0) }\n                .pointerInput(Unit) {\n                    detectDragGestures { change, dragAmount ->\n                        change.consume()\n                        offsetX += dragAmount.x\n                    }\n                }\n                .background(Color.Blue)\n        )\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-user-input",
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
                    "title": "Basic NavHost setup",
                    "code": "@Composable\nfun AppNavGraph() {\n    val navController = rememberNavController()\n\n    NavHost(navController = navController, startDestination = \"home\") {\n        composable(\"home\") {\n            HomeScreen(onOpenDetail = { id -> navController.navigate(\"detail/$id\") })\n        }\n        composable(\n            route = \"detail/{itemId}\",\n            arguments = listOf(navArgument(\"itemId\") { type = NavType.StringType })\n        ) { backStackEntry ->\n            val itemId = backStackEntry.arguments?.getString(\"itemId\")\n            DetailScreen(itemId = itemId, onBack = { navController.popBackStack() })\n        }\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-navigation",
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
                    "title": "UDF between ViewModel and UI",
                    "code": "@Composable\nfun TodoScreen(viewModel: TodoViewModel = viewModel()) {\n    val uiState by viewModel.uiState.collectAsStateWithLifecycle()\n\n    TodoList(\n        items = uiState.items,           // state DOWN\n        onItemChecked = viewModel::onItemChecked // event UP\n    )\n}"
                }
            ],
            "subsection": null,
            "id": "compose-unidirectional-data-flow",
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
                    "title": "A simple custom vertical-stack layout",
                    "code": "@Composable\nfun StackedLayout(\n    modifier: Modifier = Modifier,\n    overlapPx: Int = 40,\n    content: @Composable () -> Unit\n) {\n    Layout(content = content, modifier = modifier) { measurables, constraints ->\n        val placeables = measurables.map { it.measure(constraints) }\n        val width = placeables.maxOf { it.width }\n        val height = placeables.sumOf { it.height } - overlapPx * (placeables.size - 1)\n\n        layout(width, height.coerceAtLeast(0)) {\n            var y = 0\n            placeables.forEach { placeable ->\n                placeable.placeRelative(x = 0, y = y)\n                y += placeable.height - overlapPx\n            }\n        }\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "compose-custom-layouts",
            "question": "How to create Custom Layouts in Compose?",
            "answer": "<p><strong>🔑 The Layout composable</strong></p><ul><li>For layout behavior no built-in (<code>Row</code>, <code>Column</code>, <code>Box</code>, <code>ConstraintLayout</code>) provides, use the low-level <code>Layout</code> composable, which lets you supply a custom <strong>measure and placement</strong> policy.</li><li>Inside its lambda you receive the list of <code>Measurable</code> children and incoming <code>Constraints</code>; you call <code>measurable.measure(constraints)</code> on each to get a <code>Placeable</code>, compute the layout's own size, then call <code>layout(width, height) { placeable.placeRelative(x, y) }</code> to position each child.</li><li>For a reusable custom layout <em>modifier</em> (affecting a single child's measurement, like a custom padding), implement <code>LayoutModifier</code>/use <code>Modifier.layout { measurable, constraints -> ... }</code> instead of a whole composable.</li></ul><p><strong>🎯 Interview tip:</strong> Mention that this is exactly the mechanism <code>Row</code>/<code>Column</code>/<code>Box</code> are themselves built on — Compose's built-in layouts are just <code>Layout</code> with specific measure policies, nothing magic.</p>"
        }
    ]
};
