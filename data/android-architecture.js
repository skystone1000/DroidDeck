const androidArchitectureData = {
    id: "android-architecture",
    title: "Android Architecture",
    subsections: null,
    keyTopics: ["MVVM", "MVP", "MVC", "MVI", "Clean Architecture", "Multi-Module Architecture", "Software Architecture vs Design", "Repository Pattern", "Separation of Concerns"],
    questions: [
        {
            id: "arch-describe-last-app",
            question: "Describe the architecture of your last app.",
            answer: "<p><strong>🔑 How to answer</strong></p><ul><li>This is an open-ended behavioral question — structure the answer around layers, not just buzzwords: <strong>UI layer</strong> (Activities/Fragments/Compose screens + ViewModels), <strong>domain layer</strong> (use cases/interactors, optional for smaller apps), and <strong>data layer</strong> (repositories backed by Room + Retrofit).</li></ul><p><strong>⚙️ What to cover</strong></p><ul><li>State management — e.g. <code>StateFlow</code>/<code>LiveData</code> exposed from ViewModel, collected lifecycle-aware in the UI via <code>repeatOnLifecycle</code>.</li><li>Dependency injection setup — Hilt modules, scoping decisions.</li><li>Module boundaries if the app was multi-module, and why they were drawn where they were.</li><li>Testing strategy — unit tests on ViewModel/use case layer, fakes for repositories.</li><li>One concrete trade-off you made and why (e.g. chose MVVM over MVI for team familiarity, or single-module over multi-module because the app was small).</li></ul><p><strong>🎯 Interview tip:</strong> Interviewers use this to gauge whether you actually understand architecture or just recite pattern names — anchor every claim in a real decision you made and its trade-off.</p>",
            referenceLinks: [{ title: "Guide to app architecture", url: "https://developer.android.com/topic/architecture" }],
            tags: ["architecture", "mvvm", "project-experience", "behavioral"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "arch-mvvm",
            question: "Describe MVVM architecture.",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>MVVM</strong> (Model-View-ViewModel) — separates UI (View) from presentation logic (ViewModel) and data (Model), with the ViewModel exposing observable state that the View passively renders.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Model</strong> — data and business logic: repositories, data sources, domain entities.</li><li><strong>ViewModel</strong> — holds UI state (<code>StateFlow</code>/<code>LiveData</code>), survives configuration changes via Jetpack's <code>ViewModel</code> class, has zero reference to View/Context, making it independently unit-testable.</li><li><strong>View</strong> — Activity/Fragment/Composable; observes ViewModel state and forwards user events (clicks, text input) to it; contains no business logic.</li><li>Data flows one way: View → events → ViewModel → state → View (unidirectional binding), unlike MVP's more chatty bidirectional interface calls.</li></ul><p><strong>✅ Why it's the Android-recommended default</strong></p><ul><li>Jetpack's <code>ViewModel</code> + <code>Lifecycle</code> + <code>LiveData</code>/<code>Flow</code> are built specifically to support this pattern, with automatic lifecycle-aware observation and configuration-change survival.</li></ul>",
            referenceLinks: [{ title: "ViewModel overview", url: "https://developer.android.com/topic/libraries/architecture/viewmodel" }, { title: "Guide to app architecture", url: "https://developer.android.com/topic/architecture" }],
            tags: ["mvvm", "architecture", "viewmodel", "livedata"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "MVVM Data Flow",
                columns: 3,
                nodes: [
                    { label: "View", type: "terminal" },
                    { label: "ViewModel" },
                    { label: "Model / Repository" }
                ],
                connections: [
                    { from: 0, to: 1, label: "events" },
                    { from: 1, to: 2, label: "fetch" },
                    { from: 2, to: 1, label: "data" },
                    { from: 1, to: 0, label: "state" }
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "Minimal MVVM ViewModel",
                code: "class UserViewModel(private val repo: UserRepository) : ViewModel() {\n    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)\n    val uiState: StateFlow<UiState> = _uiState.asStateFlow()\n\n    fun loadUser(id: String) {\n        viewModelScope.launch {\n            _uiState.value = UiState.Loading\n            _uiState.value = try {\n                UiState.Success(repo.getUser(id))\n            } catch (e: Exception) {\n                UiState.Error(e.message)\n            }\n        }\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "arch-mvc-mvp-mvvm",
            question: "What is the difference between MVC, MVP, and MVVM?",
            answer: "<table><thead><tr><th>Aspect</th><th>MVC</th><th>MVP</th><th>MVVM</th></tr></thead><tbody><tr><td>Middle layer</td><td>Controller</td><td>Presenter</td><td>ViewModel</td></tr><tr><td>View reference</td><td>Controller often holds/manipulates View directly</td><td>Presenter holds an explicit View <strong>interface</strong> reference, calls its methods directly</td><td>ViewModel holds <strong>no</strong> reference to View — exposes observable state instead</td></tr><tr><td>Coupling</td><td>Tightest — Activity often plays both View and Controller on Android</td><td>Tight — one Presenter typically maps 1:1 to one View, verbose interface contracts</td><td>Loose — View observes state; ViewModel is unaware View exists</td></tr><tr><td>Testability</td><td>Hard — Controller/View blended together (Activity does both)</td><td>Good — Presenter is testable by mocking the View interface</td><td>Best — ViewModel tested with no Android/View dependency at all</td></tr><tr><td>Boilerplate</td><td>Low</td><td>High — interface per screen</td><td>Low-medium — no interfaces needed, just observable state</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> The key evolution to articulate: MVC couples View and logic on Android because Activity plays both roles; MVP decouples them via explicit interfaces but is verbose; MVVM removes the View reference entirely using observable state, which is what Jetpack's <code>ViewModel</code>/<code>LiveData</code>/<code>Flow</code> were purpose-built for.</p>",
            referenceLinks: [{ title: "Guide to app architecture", url: "https://developer.android.com/topic/architecture" }],
            tags: ["mvc", "mvp", "mvvm", "comparison", "architecture"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "arch-clean",
            question: "What is Clean Architecture?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Clean Architecture</strong> (Robert C. Martin) — organizes code into concentric layers where <strong>dependencies point inward only</strong>: outer layers depend on inner layers, never the reverse, keeping business logic independent of frameworks, UI, and databases.</li></ul><p><strong>⚙️ Layers (outer to inner)</strong></p><ul><li><strong>Presentation</strong> — Activities/Fragments/Compose, ViewModels; depends on domain.</li><li><strong>Domain</strong> — use cases/interactors and business entities; the innermost, framework-free layer with <strong>zero Android imports</strong>, containing pure business rules.</li><li><strong>Data</strong> — repository implementations, remote/local data sources (Retrofit, Room); implements interfaces defined by the domain layer.</li></ul><p><strong>⚙️ The Dependency Inversion trick</strong></p><ul><li>The domain layer <strong>defines</strong> repository interfaces; the data layer <strong>implements</strong> them. This means domain doesn't depend on data — data depends on domain, inverting the naive dependency direction and keeping business rules pluggable/testable.</li></ul><p><strong>✅ Benefits</strong></p><ul><li>Domain logic is unit-testable with zero Android framework dependency, UI/data sources are swappable without touching business rules.</li></ul><p><strong>⚠️ Trade-offs</strong></p><ul><li>More files/indirection per feature — can be overkill for small apps or prototypes.</li></ul>",
            referenceLinks: [{ title: "Guide to app architecture", url: "https://developer.android.com/topic/architecture" }],
            tags: ["clean-architecture", "layers", "domain", "use-case"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Clean Architecture Layers",
                columns: 3,
                nodes: [
                    { label: "Presentation", type: "terminal" },
                    { label: "Domain (Use Cases)" },
                    { label: "Data (Repositories)" }
                ],
                connections: [
                    { from: 0, to: 1, label: "depends on" },
                    { from: 2, to: 1, label: "implements" }
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "Use case with domain-owned repository interface",
                code: "// domain layer — no Android imports\ninterface UserRepository {\n    suspend fun getUser(id: String): User\n}\n\nclass GetUserUseCase(private val repo: UserRepository) {\n    suspend operator fun invoke(id: String): User = repo.getUser(id)\n}\n\n// data layer — implements the domain interface\nclass UserRepositoryImpl(\n    private val api: ApiService,\n    private val dao: UserDao\n) : UserRepository {\n    override suspend fun getUser(id: String): User =\n        dao.getUser(id) ?: api.fetchUser(id).also { dao.insert(it) }\n}"
            }],
            subsection: null
        },
        {
            id: "arch-mvi",
            question: "What is MVI (Model-View-Intent) architecture?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>MVI</strong> — a strictly <strong>unidirectional</strong> pattern where the View emits <code>Intent</code>s (user actions), a reducer/processor turns them into a new immutable <code>State</code>, and the View renders that single state object — there's no partial mutation.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Intent</strong> — represents user intention (e.g. <code>LoadUser</code>, <code>Refresh</code>), typically a sealed class/interface.</li><li><strong>Model</strong> — a single immutable <strong>State</strong> data class capturing the entire screen's UI state at any moment (loading, data, error) — never partially updated, always replaced wholesale.</li><li><strong>Reducer</strong> — a pure function <code>(State, Intent) -> State</code> that computes the next state; makes state transitions predictable and easy to test/replay.</li><li><strong>View</strong> — renders the single State object and dispatches Intents back; strictly one-directional, no callbacks into the middle layer beyond intents.</li></ul><p><strong>⚖️ vs MVVM</strong></p><ul><li>MVVM often exposes multiple independent LiveData/StateFlow properties that can update out of sync; MVI's single state object guarantees the UI is always rendering one consistent, complete snapshot.</li></ul><p><strong>⚠️ Trade-offs</strong></p><ul><li>More boilerplate (sealed Intent/State classes, reducer logic) — better suited to complex screens with many interacting states than simple ones.</li></ul>",
            referenceLinks: [{ title: "Guide to app architecture — UI layer", url: "https://developer.android.com/topic/architecture/ui-layer" }],
            tags: ["mvi", "architecture", "unidirectional", "state"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Minimal MVI state and reducer",
                code: "sealed interface UserIntent {\n    data class Load(val id: String) : UserIntent\n    object Refresh : UserIntent\n}\n\ndata class UserState(\n    val isLoading: Boolean = false,\n    val user: User? = null,\n    val error: String? = null\n)\n\nclass UserViewModel(private val repo: UserRepository) : ViewModel() {\n    private val _state = MutableStateFlow(UserState())\n    val state: StateFlow<UserState> = _state.asStateFlow()\n\n    fun dispatch(intent: UserIntent) {\n        when (intent) {\n            is UserIntent.Load -> loadUser(intent.id)\n            UserIntent.Refresh -> _state.value.user?.let { loadUser(it.id) }\n        }\n    }\n\n    private fun loadUser(id: String) = viewModelScope.launch {\n        _state.value = _state.value.copy(isLoading = true)\n        _state.value = try {\n            _state.value.copy(isLoading = false, user = repo.getUser(id), error = null)\n        } catch (e: Exception) {\n            _state.value.copy(isLoading = false, error = e.message)\n        }\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "arch-vs-design",
            question: "What is the difference between Software Architecture and Software Design?",
            answer: "<table><thead><tr><th>Aspect</th><th>Software Architecture</th><th>Software Design</th></tr></thead><tbody><tr><td>Scope</td><td>System-wide — high-level structure, module boundaries, layer responsibilities</td><td>Local — how an individual class, function, or small component is implemented</td></tr><tr><td>Concerns</td><td>Communication between components, technology choices, scalability, deployment topology (e.g. app layers, multi-module split, MVVM vs MVI)</td><td>Class-level decisions — which design pattern to use, method signatures, data structures</td></tr><tr><td>Change cost</td><td>Expensive/risky to change later — affects the whole system</td><td>Cheaper to change — usually localized, refactorable without wide blast radius</td></tr><tr><td>Example</td><td>&quot;We'll use Clean Architecture with a multi-module Gradle setup and MVVM in the presentation layer&quot;</td><td>&quot;This repository class will use the Adapter pattern to wrap two different network clients&quot;</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> A useful shorthand: architecture is about the <strong>big rocks</strong> (how modules/layers talk to each other), design is about the <strong>small rocks</strong> (how one class is structured) — design patterns live at the design level, architectural patterns (MVVM, Clean Architecture) live at the architecture level.</p>",
            referenceLinks: [{ title: "Guide to app architecture", url: "https://developer.android.com/topic/architecture" }],
            tags: ["architecture", "software-design", "comparison"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "arch-multi-module-benefits",
            question: "What are the benefits of Multi-Module Architecture?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Multi-module architecture</strong> splits an app into separate Gradle modules (e.g. <code>:app</code>, <code>:feature:login</code>, <code>:core:network</code>, <code>:core:ui</code>) with explicit dependency boundaries instead of one monolithic module.</li></ul><p><strong>✅ Benefits</strong></p><ul><li><strong>Faster builds</strong> — Gradle can build and cache modules in parallel, and incremental builds only recompile changed modules and their dependents.</li><li><strong>Enforced boundaries</strong> — a feature module can't accidentally reach into another feature's internals if it's not an explicit dependency; encourages loose coupling.</li><li><strong>Reusability</strong> — core/shared modules (networking, design system, analytics) can be reused across features or even other apps.</li><li><strong>Parallel team ownership</strong> — different teams can own different modules with less merge contention.</li><li><strong>Dynamic feature delivery</strong> — modules can map to Play Feature Delivery, allowing on-demand/conditional install to reduce initial APK size.</li><li><strong>Better test isolation</strong> — a module's tests only need its own dependencies configured, not the whole app graph.</li></ul>",
            referenceLinks: [{ title: "Guide to Android app modularization", url: "https://developer.android.com/topic/modularization" }],
            tags: ["multi-module", "modularization", "gradle", "architecture"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "arch-multi-module-when",
            question: "When should you adopt Multi-Module Architecture?",
            answer: "<p><strong>✅ Good signals to adopt it</strong></p><ul><li>The app is growing large enough that full clean builds are noticeably slow and hurting developer iteration speed.</li><li>Multiple teams work on the codebase concurrently and need clear ownership boundaries to reduce merge conflicts.</li><li>You need Play Feature Delivery (on-demand/conditional modules) to keep base APK size down.</li><li>You want to share code (design system, networking) across multiple apps or app variants.</li><li>You want compile-time enforcement that feature code can't reach into another feature's internals.</li></ul><p><strong>⚠️ When to hold off</strong></p><ul><li>Small apps / early-stage prototypes — the upfront cost of defining module boundaries and Gradle configuration outweighs the benefit before the app has grown.</li><li>A single small team where merge conflicts and build times aren't yet a real pain point — premature modularization adds ceremony without payoff.</li></ul><p><strong>🎯 Interview tip:</strong> Frame it as a cost/benefit call tied to team size and codebase size, not a default best practice to apply everywhere from day one.</p>",
            referenceLinks: [{ title: "Guide to Android app modularization", url: "https://developer.android.com/topic/modularization" }],
            tags: ["multi-module", "modularization", "gradle", "when-to-use"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        }
    ]
};
