const designPatternData = {
    id: "design-pattern",
    title: "Design Pattern",
    subsections: null,
    keyTopics: ["Builder Pattern", "Singleton Pattern", "Factory Pattern", "Observer Pattern", "Repository Pattern", "Adapter Pattern", "Facade Pattern", "Dependency Injection", "Strategy Pattern", "Patterns in Android Libraries (Retrofit, Glide)", "Patterns in AOSP"],
    questions: [
        {
            id: "design-pattern-builder",
            importance: "should-know",
            question: "What is the Builder Pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Builder</strong> — a creational pattern that constructs a complex object step by step via chained setter-like calls, separating construction from representation, and typically finishing with a <code>.build()</code> call that returns the immutable finished object.</li></ul><p><strong>✅ When to use</strong></p><ul><li>An object has many optional parameters/configuration — avoids <strong>telescoping constructors</strong> (multiple overloaded constructors for every parameter combination).</li><li>You want the constructed object to be immutable once built, but flexible to configure.</li></ul><p><strong>⚙️ Where you see it in Android</strong></p><ul><li><code>NotificationCompat.Builder()</code> — chained <code>.setContentTitle()</code>, <code>.setSmallIcon()</code>, <code>.build()</code>.</li><li><code>Retrofit.Builder()</code>, <code>OkHttpClient.Builder()</code>, <code>AlertDialog.Builder()</code>.</li></ul><p><strong>🎯 Interview tip:</strong> In Kotlin, named + default arguments often eliminate the need for a Builder for your own classes — mention this as a modern alternative when discussing trade-offs.</p>",
            referenceLinks: [{ title: "NotificationCompat.Builder", url: "https://developer.android.com/reference/androidx/core/app/NotificationCompat.Builder" }],
            tags: ["builder", "design-pattern", "creational"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Builder pattern with NotificationCompat",
                code: "val notification = NotificationCompat.Builder(context, CHANNEL_ID)\n    .setContentTitle(\"New message\")\n    .setContentText(\"You have a new message\")\n    .setSmallIcon(R.drawable.ic_notification)\n    .setPriority(NotificationCompat.PRIORITY_DEFAULT)\n    .setAutoCancel(true)\n    .build()\n\nNotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)"
            }],
            subsection: null
        },
        {
            id: "design-pattern-singleton",
            importance: "should-know",
            question: "What is the Singleton pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Singleton</strong> — a creational pattern that ensures a class has exactly one instance, globally accessible throughout the app's lifetime.</li></ul><p><strong>⚙️ How it works in Kotlin</strong></p><ul><li>Kotlin's <code>object</code> keyword gives you a thread-safe, lazily-initialized singleton for free — no manual double-checked locking needed like classic Java implementations.</li></ul><p><strong>⚠️ Why it hurts testability</strong></p><ul><li><strong>Global mutable state</strong> — hard to reset between tests, causing test pollution/order-dependence if state leaks across test cases.</li><li><strong>Hidden dependencies</strong> — a class referencing a singleton directly doesn't declare that dependency in its constructor, making it hard to see and hard to substitute a fake/mock in tests.</li><li><strong>Hard to mock</strong> — Kotlin <code>object</code>s can't be easily subclassed or swapped, unlike constructor-injected interfaces.</li><li><strong>Concurrency risk</strong> if mutable state isn't properly synchronized, since all callers share one instance.</li></ul><p><strong>✅ Better alternative</strong></p><ul><li>Let a DI framework (Hilt/Dagger with <code>@Singleton</code> scope, or Koin's <code>single {}</code>) manage single-instance lifetime behind an interface — you still get one instance app-wide, but it's injectable and swappable for tests.</li></ul><p><strong>🎯 Interview tip:</strong> This is a favorite trick question — mentioning the testability downside and the DI-scoped-singleton alternative shows depth beyond textbook GoF knowledge.</p>",
            referenceLinks: [{ title: "Dependency injection in Android", url: "https://developer.android.com/training/dependency-injection" }],
            tags: ["singleton", "design-pattern", "creational", "testability"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Kotlin object singleton vs DI-scoped singleton",
                code: "// Classic singleton — hard to test, global state\nobject AnalyticsTracker {\n    fun track(event: String) { /* ... */ }\n}\n\n// DI-scoped singleton — one instance, but injectable/mockable\n@Singleton\nclass AnalyticsTrackerImpl @Inject constructor(\n    private val client: AnalyticsClient\n) : AnalyticsTracker {\n    override fun track(event: String) = client.log(event)\n}"
            }],
            subsection: null
        },
        {
            id: "design-pattern-factory",
            importance: "should-know",
            question: "What is the Factory pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Factory</strong> — a creational pattern that centralizes object creation logic in a dedicated method/class, so callers ask for an object by intent rather than calling a constructor directly and knowing which concrete class to instantiate.</li></ul><p><strong>✅ When to use</strong></p><ul><li>The exact concrete type to create depends on runtime input (e.g. different <code>ViewHolder</code> subtypes based on item view type).</li><li>You want to hide/decouple construction logic (which may involve picking among several implementations) from consuming code.</li></ul><p><strong>⚙️ Where you see it in Android</strong></p><ul><li><code>ViewModelProvider.Factory</code> — supplies ViewModels with constructor arguments the framework can't provide itself.</li><li><code>LayoutInflater.Factory</code>, <code>Fragment.instantiate()</code>.</li></ul>",
            referenceLinks: [{ title: "ViewModelProvider.Factory", url: "https://developer.android.com/reference/androidx/lifecycle/ViewModelProvider.Factory" }],
            tags: ["factory", "design-pattern", "creational"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Custom ViewModel factory",
                code: "class UserViewModelFactory(\n    private val repository: UserRepository\n) : ViewModelProvider.Factory {\n    override fun <T : ViewModel> create(modelClass: Class<T>): T {\n        if (modelClass.isAssignableFrom(UserViewModel::class.java)) {\n            @Suppress(\"UNCHECKED_CAST\")\n            return UserViewModel(repository) as T\n        }\n        throw IllegalArgumentException(\"Unknown ViewModel class\")\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "design-pattern-observer",
            importance: "should-know",
            question: "What is the Observer pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Observer</strong> — a behavioral pattern where a <strong>subject</strong> maintains a list of dependent <strong>observers</strong> and automatically notifies them of state changes, decoupling the producer of data from its consumers.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Observers subscribe to a subject; when the subject's state changes, it pushes an update to every subscriber without needing to know their concrete type.</li><li>Decouples producer and consumer — the subject doesn't need to know how many observers exist or what they do with updates.</li></ul><p><strong>⚙️ Where you see it in Android</strong></p><ul><li><strong>LiveData</strong> — Activities/Fragments observe it lifecycle-aware; auto-unsubscribes on destroy.</li><li><strong>Kotlin Flow</strong> (<code>StateFlow</code>/<code>SharedFlow</code>) — coroutine-based observer pattern.</li><li><strong>RxJava Observable/Subject</strong> — the canonical reactive implementation of this pattern.</li><li><strong>BroadcastReceiver</strong>, <code>View.OnClickListener</code> — classic callback-based observer usage.</li></ul>",
            referenceLinks: [{ title: "LiveData overview", url: "https://developer.android.com/topic/libraries/architecture/livedata" }],
            tags: ["observer", "design-pattern", "behavioral", "livedata"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Observer pattern via StateFlow",
                code: "class UserViewModel : ViewModel() {\n    private val _state = MutableStateFlow<User?>(null)\n    val state: StateFlow<User?> = _state.asStateFlow() // subject\n}\n\n// observer — collects updates lifecycle-aware\nlifecycleScope.launch {\n    repeatOnLifecycle(Lifecycle.State.STARTED) {\n        viewModel.state.collect { user -> render(user) }\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "design-pattern-repository",
            importance: "must-know",
            question: "What is the Repository pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Repository</strong> — a structural pattern that abstracts data access behind a single API, hiding whether data comes from network, local database, or cache from the rest of the app.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Callers (typically ViewModels/use cases) depend on a repository <strong>interface</strong>, not on Retrofit/Room directly.</li><li>The implementation decides data source strategy — e.g. return cached Room data immediately, then refresh from network and update the cache (single source of truth pattern).</li><li>Multiple data sources (remote <code>ApiService</code>, local <code>Dao</code>) are composed inside the repository, invisible to consumers.</li></ul><p><strong>✅ Benefits</strong></p><ul><li>Swappable implementations for testing (fake repository with in-memory data, no real network/DB needed).</li><li>Single source of truth — UI always reads from one place (usually the local DB) which is kept in sync with remote data.</li></ul>",
            referenceLinks: [{ title: "Guide to app architecture — data layer", url: "https://developer.android.com/topic/architecture/data-layer" }],
            tags: ["repository", "design-pattern", "architecture", "data-layer"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Repository as single source of truth",
                columns: 3,
                nodes: [
                    { label: "ViewModel", type: "terminal" },
                    { label: "Repository" },
                    { label: "Room DB" },
                    { label: "Retrofit API" }
                ],
                connections: [
                    { from: 0, to: 1, label: "getUser()" },
                    { from: 1, to: 2 },
                    { from: 1, to: 3, label: "refresh" }
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "Repository combining local cache and network",
                code: "class UserRepository(\n    private val api: ApiService,\n    private val dao: UserDao\n) {\n    fun getUser(id: String): Flow<User> = flow {\n        emit(dao.getUser(id))\n        val fresh = api.fetchUser(id)\n        dao.insert(fresh)\n        emit(fresh)\n    }.flowOn(Dispatchers.IO)\n}"
            }],
            subsection: null
        },
        {
            id: "design-pattern-adapter",
            importance: "should-know",
            question: "What is the Adapter pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Adapter</strong> — a structural pattern that converts one interface into another that a client expects, letting otherwise-incompatible interfaces work together without modifying either.</li></ul><p><strong>⚙️ Where you see it in Android</strong></p><ul><li><strong><code>RecyclerView.Adapter</code></strong> — the textbook example: it adapts your raw data list into the <code>ViewHolder</code>/View interface <code>RecyclerView</code> expects, via <code>onCreateViewHolder</code>/<code>onBindViewHolder</code>.</li><li><code>CursorAdapter</code>/<code>ArrayAdapter</code> for <code>ListView</code>/<code>Spinner</code> — same idea, older API.</li><li>Retrofit's converter adapters (<code>GsonConverterFactory</code>, <code>CallAdapter</code>) — adapt raw OkHttp responses into typed Kotlin objects or RxJava/coroutine return types.</li></ul><p><strong>🎯 Interview tip:</strong> Distinguish from Facade — Adapter changes an interface to make it compatible; Facade simplifies a complex interface without necessarily changing what's underneath.</p>",
            referenceLinks: [{ title: "RecyclerView.Adapter", url: "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView.Adapter" }],
            tags: ["adapter", "design-pattern", "structural", "recyclerview"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "RecyclerView.Adapter as the Adapter pattern",
                code: "class UserAdapter(private val users: List<User>) :\n    RecyclerView.Adapter<UserAdapter.ViewHolder>() {\n\n    class ViewHolder(val binding: ItemUserBinding) :\n        RecyclerView.ViewHolder(binding.root)\n\n    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {\n        val binding = ItemUserBinding.inflate(\n            LayoutInflater.from(parent.context), parent, false\n        )\n        return ViewHolder(binding)\n    }\n\n    override fun onBindViewHolder(holder: ViewHolder, position: Int) {\n        holder.binding.name.text = users[position].name\n    }\n\n    override fun getItemCount() = users.size\n}"
            }],
            subsection: null
        },
        {
            id: "design-pattern-facade",
            importance: "should-know",
            question: "What is the Facade pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Facade</strong> — a structural pattern that provides a simplified, unified interface to a larger, more complex subsystem, hiding internal complexity from callers.</li></ul><p><strong>⚙️ Where you see it in Android</strong></p><ul><li>A <code>UserRepository</code> is itself a facade over multiple subsystems — Retrofit API, Room DAO, in-memory cache, mappers — exposing a single simple method like <code>getUser(id)</code>.</li><li><code>WorkManager</code> is a facade over choosing between <code>JobScheduler</code>, <code>AlarmManager</code>, and <code>Firebase JobDispatcher</code> depending on the API level — you call one simple API and it picks the right backend.</li><li>An <code>AnalyticsManager</code> wrapping multiple third-party SDKs (Firebase, Mixpanel, custom backend) behind one <code>track(event)</code> call.</li></ul><p><strong>🎯 Interview tip:</strong> Facade doesn't add new functionality — it just simplifies access to existing functionality behind one clean entry point.</p>",
            referenceLinks: [{ title: "WorkManager overview", url: "https://developer.android.com/develop/background-work/background-tasks/persistent" }],
            tags: ["facade", "design-pattern", "structural"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-pattern-dependency-injection",
            importance: "must-know",
            question: "What is Dependency Injection?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Dependency Injection (DI)</strong> — a technique where an object receives its dependencies from an external source rather than constructing them itself, applying the broader <strong>Inversion of Control</strong> principle.</li></ul><p><strong>⚙️ Injection styles</strong></p><ul><li><strong>Constructor injection</strong> — dependencies passed as constructor parameters (preferred — makes dependencies explicit and required).</li><li><strong>Field/setter injection</strong> — dependencies assigned after construction (used by Dagger/Hilt for Android framework classes like Activities you don't construct yourself).</li></ul><p><strong>✅ Benefits</strong></p><ul><li><strong>Testability</strong> — swap real dependencies for fakes/mocks in tests without touching the class under test.</li><li><strong>Decoupling</strong> — a class depends on an abstraction (interface), not a concrete implementation, following the Dependency Inversion Principle.</li><li><strong>Reusability</strong> — the same class works with different dependency configurations (e.g. different environments).</li></ul><p><strong>⚙️ On Android</strong></p><ul><li>Manual DI (passing dependencies through constructors yourself) works for small apps; Hilt/Dagger/Koin automate graph construction and scoping for larger ones.</li></ul>",
            referenceLinks: [{ title: "Dependency injection in Android", url: "https://developer.android.com/training/dependency-injection" }],
            tags: ["dependency-injection", "design-pattern", "di", "testability"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Constructor injection vs internal construction",
                code: "// Bad: hidden dependency, hard to test\nclass UserViewModel : ViewModel() {\n    private val repo = UserRepositoryImpl(ApiClient.retrofit)\n}\n\n// Good: injected dependency, easy to fake in tests\nclass UserViewModel(private val repo: UserRepository) : ViewModel()"
            }],
            subsection: null
        },
        {
            id: "design-pattern-strategy",
            importance: "should-know",
            question: "What is the Strategy Pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Strategy</strong> — a behavioral pattern that defines a family of interchangeable algorithms behind a common interface, letting the algorithm used vary independently from the client that uses it, chosen at runtime.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Define an interface (e.g. <code>SortStrategy</code>, <code>ValidationStrategy</code>) with one method; implement multiple concrete strategies; the context class holds a reference to the interface and delegates to whichever concrete strategy is injected/set.</li></ul><p><strong>⚙️ Where you see it in Android</strong></p><ul><li><code>RecyclerView.LayoutManager</code> — <code>LinearLayoutManager</code>, <code>GridLayoutManager</code>, <code>StaggeredGridLayoutManager</code> are interchangeable layout strategies plugged into the same <code>RecyclerView</code>.</li><li><code>Comparator</code> implementations passed to <code>sortedWith()</code>.</li><li>Payment/validation logic that varies by input type, selected at runtime via a strategy map.</li></ul><p><strong>🎯 Interview tip:</strong> In Kotlin, a simple <code>lambda: (T) -> R</code> parameter often replaces a full Strategy interface for simple cases — mention this as an idiomatic simplification.</p>",
            referenceLinks: [{ title: "RecyclerView.LayoutManager", url: "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView.LayoutManager" }],
            tags: ["strategy", "design-pattern", "behavioral"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Strategy pattern for validation",
                code: "interface ValidationStrategy {\n    fun isValid(input: String): Boolean\n}\n\nclass EmailValidation : ValidationStrategy {\n    override fun isValid(input: String) = Patterns.EMAIL_ADDRESS.matcher(input).matches()\n}\n\nclass PasswordValidation : ValidationStrategy {\n    override fun isValid(input: String) = input.length >= 8\n}\n\nclass Validator(private val strategy: ValidationStrategy) {\n    fun validate(input: String) = strategy.isValid(input)\n}"
            }],
            subsection: null
        },
        {
            id: "design-pattern-android-common",
            importance: "should-know",
            question: "What design patterns are commonly used in Android?",
            answer: "<table><thead><tr><th>Pattern</th><th>Example in Android</th></tr></thead><tbody><tr><td>Builder</td><td><code>NotificationCompat.Builder</code>, <code>AlertDialog.Builder</code></td></tr><tr><td>Singleton</td><td>Kotlin <code>object</code>, <code>@Singleton</code>-scoped DI bindings</td></tr><tr><td>Factory</td><td><code>ViewModelProvider.Factory</code></td></tr><tr><td>Observer</td><td><code>LiveData</code>, <code>Flow</code>, <code>BroadcastReceiver</code></td></tr><tr><td>Adapter</td><td><code>RecyclerView.Adapter</code></td></tr><tr><td>Facade</td><td><code>WorkManager</code>, repository classes</td></tr><tr><td>Strategy</td><td><code>RecyclerView.LayoutManager</code></td></tr><tr><td>Decorator</td><td>OkHttp Interceptors wrapping requests</td></tr><tr><td>Dependency Injection</td><td>Hilt/Dagger/Koin</td></tr><tr><td>MVC/MVP/MVVM/MVI</td><td>Overall app architecture patterns</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> Naming a pattern isn't enough — pair each with a concrete Android class/API as evidence you've actually recognized it in real code, not just memorized the GoF catalog.</p>",
            referenceLinks: [{ title: "Guide to app architecture", url: "https://developer.android.com/topic/architecture" }],
            tags: ["design-pattern", "android", "overview"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-pattern-kotlin-optional-vs-builder",
            importance: "should-know",
            question: "Kotlin Optional Parameters vs Builder Pattern",
            answer: "<table><thead><tr><th>Aspect</th><th>Named/Default Parameters</th><th>Builder Pattern</th></tr></thead><tbody><tr><td>Syntax</td><td><code>User(name = \"A\", age = 30)</code> — single constructor call</td><td><code>User.Builder().setName(\"A\").setAge(30).build()</code> — chained calls</td></tr><tr><td>Boilerplate</td><td>None — native Kotlin language feature</td><td>Requires a separate Builder class per data class</td></tr><tr><td>Validation</td><td>Limited to <code>init {}</code> block on the constructed object</td><td>Can validate incrementally per setter, or all-at-once in <code>build()</code></td></tr><tr><td>Step-by-step construction across time</td><td>Not supported — all args needed at call site</td><td>Supported — fields can be set incrementally, e.g. conditionally across a form flow</td></tr><tr><td>Java interop</td><td>Awkward from Java — default args aren't visible without <code>@JvmOverloads</code></td><td>Works naturally from Java</td></tr></tbody></table><p><strong>✅ When to use which</strong></p><ul><li>Prefer Kotlin's named/default parameters for pure-Kotlin code — it's simpler and idiomatic.</li><li>Keep Builder for Java interop, or when construction genuinely needs to happen incrementally/conditionally over multiple steps (as in <code>AlertDialog.Builder</code>).</li></ul>",
            referenceLinks: [{ title: "Kotlin function default arguments", url: "https://kotlinlang.org/docs/functions.html#default-arguments" }],
            tags: ["kotlin", "builder", "default-arguments", "comparison"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Named/default args replacing a Builder",
                code: "data class User(\n    val name: String,\n    val age: Int = 0,\n    val email: String? = null\n)\n\nval user = User(name = \"Aditya\", age = 28)"
            }],
            subsection: null
        },
        {
            id: "design-pattern-observer-android-examples",
            importance: "should-know",
            question: "What are examples of the Observer pattern in Android?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>The Observer pattern shows up anywhere Android lets a component subscribe to another's state or events without polling.</li></ul><p><strong>⚙️ Concrete examples</strong></p><ul><li><strong><code>LiveData</code></strong> — Activities/Fragments call <code>observe(lifecycleOwner) { }</code>; automatically stops delivering updates when the LifecycleOwner is destroyed.</li><li><strong><code>StateFlow</code>/<code>SharedFlow</code></strong> — collected via <code>collect { }</code> inside <code>repeatOnLifecycle</code> for lifecycle-aware observation.</li><li><strong><code>BroadcastReceiver</code></strong> — registers to observe system-wide or app-wide broadcast events (e.g. battery low, connectivity changed).</li><li><strong><code>View.OnClickListener</code> / <code>TextWatcher</code></strong> — the View is the subject, the listener is the observer of UI events.</li><li><strong><code>SharedPreferences.OnSharedPreferenceChangeListener</code></strong> — observe changes to persisted key-value data.</li><li><strong>RxJava <code>Observable</code>/<code>Subject</code></strong> — the reactive-library-level implementation of the same pattern.</li></ul>",
            referenceLinks: [{ title: "LiveData overview", url: "https://developer.android.com/topic/libraries/architecture/livedata" }],
            tags: ["observer", "design-pattern", "android", "livedata", "flow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-pattern-retrofit",
            importance: "should-know",
            question: "What design pattern is used in Retrofit library?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Retrofit is a showcase of multiple patterns working together, not just one.</li></ul><p><strong>⚙️ Patterns at play</strong></p><ul><li><strong>Builder</strong> — <code>Retrofit.Builder()</code> configures base URL, converter factories, call adapter factories, then <code>.build()</code> produces the immutable client.</li><li><strong>Facade</strong> — <code>Retrofit</code> itself is a simplified facade over OkHttp's lower-level request/response machinery.</li><li><strong>Proxy</strong> — <code>retrofit.create(ApiService::class.java)</code> uses Java's dynamic proxy mechanism to generate a runtime implementation of your interface; every method call is intercepted and translated into an HTTP request.</li><li><strong>Adapter</strong> — <code>CallAdapter</code>/<code>CallAdapter.Factory</code> adapts the raw <code>Call&lt;T&gt;</code> return type into other types (coroutine <code>suspend</code> functions, RxJava <code>Observable</code>/<code>Single</code>).</li><li><strong>Decorator</strong> — OkHttp interceptors (used under Retrofit) wrap the request/response pipeline with added behavior.</li></ul><p><strong>🎯 Interview tip:</strong> Mentioning Proxy specifically (how <code>retrofit.create()</code> works via <code>java.lang.reflect.Proxy</code>) is a strong signal you've looked past the surface API.</p>",
            referenceLinks: [{ title: "Retrofit API reference", url: "https://javadoc.io/doc/com.squareup.retrofit2/retrofit/latest/index.html" }],
            tags: ["retrofit", "design-pattern", "networking", "proxy", "builder"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-pattern-glide",
            importance: "should-know",
            question: "What design pattern is used in Glide library?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Glide also composes several patterns to give its fluent, extensible API.</li></ul><p><strong>⚙️ Patterns at play</strong></p><ul><li><strong>Builder</strong> — the fluent chain <code>Glide.with(context).load(url).placeholder(...).into(imageView)</code> reads like a builder even though it's implemented via a request-builder object under the hood.</li><li><strong>Singleton</strong> — <code>Glide.get(context)</code> returns a single app-wide <code>Glide</code> instance managing shared memory/disk caches.</li><li><strong>Strategy</strong> — pluggable caching strategies (<code>DiskCacheStrategy.ALL/NONE/DATA/RESOURCE</code>) and pluggable <code>Transformation</code> implementations (<code>CenterCrop</code>, <code>RoundedCorners</code>) are interchangeable algorithms selected by the caller.</li><li><strong>Observer</strong> — Glide ties requests to a <code>Lifecycle</code>, observing lifecycle events to pause/resume/clear loads automatically.</li><li><strong>Factory</strong> — <code>ModelLoaderFactory</code>/<code>ModelLoader</code> registry decides which loader handles a given model type (URL, file, resource id, byte array).</li></ul>",
            referenceLinks: [{ title: "Glide", url: "https://bumptech.github.io/glide/" }],
            tags: ["glide", "design-pattern", "image-loading", "builder", "strategy"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-pattern-aosp",
            importance: "should-know",
            question: "What design patterns are used in AOSP?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>The Android platform itself (AOSP) is built on classic GoF patterns — recognizing them helps explain <em>why</em> certain framework APIs are shaped the way they are.</li></ul><p><strong>⚙️ Examples</strong></p><ul><li><strong>Observer</strong> — <code>BroadcastReceiver</code>, <code>ContentObserver</code>, <code>SensorEventListener</code> all notify registered observers of system events.</li><li><strong>Singleton</strong> — system services returned by <code>Context.getSystemService()</code> (e.g. <code>ActivityManager</code>, <code>LocationManager</code>) are process-wide singletons.</li><li><strong>Factory</strong> — <code>LayoutInflater.from(context)</code>, <code>Fragment.instantiate()</code> create instances without exposing constructor details to the caller.</li><li><strong>Facade</strong> — <code>Context</code> itself is a facade over a huge range of subsystems (resources, system services, package manager, preferences) behind one simplified access point.</li><li><strong>Command</strong> — <code>Runnable</code> objects posted to a <code>Handler</code>/<code>Looper</code> encapsulate a unit of work as an object to be executed later, the classic Command pattern shape.</li><li><strong>Builder</strong> — <code>Notification.Builder</code>, <code>AlertDialog.Builder</code>, <code>PendingIntent</code>-related builder-style APIs.</li><li><strong>Template Method</strong> — <code>Activity</code>'s lifecycle callbacks (<code>onCreate</code>, <code>onStart</code>, <code>onResume</code>...) are a template method the framework calls in a fixed sequence, with subclasses overriding the steps.</li></ul><p><strong>🎯 Interview tip:</strong> Bringing up Template Method for the Activity lifecycle is a less obvious answer that shows deeper platform understanding beyond the usual Observer/Singleton examples.</p>",
            referenceLinks: [{ title: "Activity lifecycle", url: "https://developer.android.com/guide/components/activities/activity-lifecycle" }],
            tags: ["aosp", "design-pattern", "android-framework", "template-method"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        }
    ]
};
