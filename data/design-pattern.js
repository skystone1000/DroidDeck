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
                title: "The Builder shape, as NotificationCompat uses it",
                code: "// The shape NotificationCompat.Builder uses: each setter returns the builder,\n// and build() produces the finished, immutable object.\nclass Notification private constructor(\n    val title: String,\n    val text: String,\n    val priority: Int,\n    val autoCancel: Boolean\n) {\n    override fun toString() =\n        \"Notification(title='$title', text='$text', priority=$priority, autoCancel=$autoCancel)\"\n\n    class Builder(private val channelId: String) {\n        private var title = \"\"\n        private var text = \"\"\n        private var priority = 0\n        private var autoCancel = false\n\n        fun setContentTitle(value: String) = apply { title = value }\n        fun setContentText(value: String) = apply { text = value }\n        fun setPriority(value: Int) = apply { priority = value }\n        fun setAutoCancel(value: Boolean) = apply { autoCancel = value }\n\n        fun build() = Notification(title, text, priority, autoCancel)\n    }\n}\n\nfun main() {\n    val builder = Notification.Builder(\"messages\")\n        .setContentTitle(\"New message\")\n        .setContentText(\"You have a new message\")\n        .setPriority(1)\n        .setAutoCancel(true)\n\n    println(builder.build())\n\n    // Every setter returned the same builder, not a copy.\n    println(\"setters return the builder itself: \" + (builder.setPriority(2) === builder))\n\n    // Options left unset keep their defaults — no telescoping constructors.\n    println(Notification.Builder(\"messages\").setContentTitle(\"Minimal\").build())\n\n    // build() produces a new object each time, so the builder can be reused.\n    val first = builder.build()\n    val second = builder.build()\n    println(\"two builds are the same object? \" + (first === second))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Notification(title='New message', text='You have a new message', priority=1, autoCancel=true)",
                        "setters return the builder itself: true",
                        "Notification(title='Minimal', text='', priority=0, autoCancel=false)",
                        "two builds are the same object? false"
                    ],
                    explain: "<p>Two lines carry the pattern. Every setter returned <strong>the same builder</strong>, which is what makes the calls chain, and <code>build()</code> returned a <strong>new object</strong> each time, which is what makes the result immutable and the builder reusable.</p><p>The third line is the reason the pattern exists. <code>Notification</code> has four fields and only one was set; without a builder that means either a four-argument constructor with meaningless defaults at every call site, or a family of overloads for each combination. The builder lets a caller name only what it cares about.</p><p>Kotlin makes this pattern largely unnecessary for classes you own — see the named-arguments question — but every Android API predating Kotlin uses it, so it has to be read fluently.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "design-pattern-singleton",
            importance: "must-know",
            question: "What is the Singleton pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Singleton</strong> — a creational pattern that ensures a class has exactly one instance, globally accessible throughout the app's lifetime.</li></ul><p><strong>⚙️ How it works in Kotlin</strong></p><ul><li>Kotlin's <code>object</code> keyword gives you a thread-safe, lazily-initialized singleton for free — no manual double-checked locking needed like classic Java implementations.</li></ul><p><strong>⚠️ Why it hurts testability</strong></p><ul><li><strong>Global mutable state</strong> — hard to reset between tests, causing test pollution/order-dependence if state leaks across test cases.</li><li><strong>Hidden dependencies</strong> — a class referencing a singleton directly doesn't declare that dependency in its constructor, making it hard to see and hard to substitute a fake/mock in tests.</li><li><strong>Hard to mock</strong> — Kotlin <code>object</code>s can't be easily subclassed or swapped, unlike constructor-injected interfaces.</li><li><strong>Concurrency risk</strong> if mutable state isn't properly synchronized, since all callers share one instance.</li></ul><p><strong>✅ Better alternative</strong></p><ul><li>Let a DI framework (Hilt/Dagger with <code>@Singleton</code> scope, or Koin's <code>single {}</code>) manage single-instance lifetime behind an interface — you still get one instance app-wide, but it's injectable and swappable for tests.</li></ul><p><strong>🎯 Interview tip:</strong> This is a favorite trick question — mentioning the testability downside and the DI-scoped-singleton alternative shows depth beyond textbook GoF knowledge.</p>",
            referenceLinks: [{ title: "Dependency injection in Android", url: "https://developer.android.com/training/dependency-injection" }],
            tags: ["singleton", "design-pattern", "creational", "testability"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "object singleton against a DI-scoped one",
                code: "// Classic singleton: one instance, created by the language, reachable from\n// anywhere — which is also why it is hard to replace in a test.\nobject AnalyticsTracker {\n    var events = 0\n        private set\n    fun track(event: String) { events++; println(\"AnalyticsTracker: $event\") }\n}\n\n// The injectable form. Still one instance in production, because whatever\n// builds the graph decides that — not the class itself.\ninterface Analytics {\n    fun track(event: String)\n}\n\nclass AnalyticsTrackerImpl(private val client: (String) -> Unit) : Analytics {\n    override fun track(event: String) = client(\"impl: $event\")\n}\n\nclass FakeAnalytics : Analytics {\n    val recorded = mutableListOf<String>()\n    override fun track(event: String) { recorded += event }\n}\n\nclass CheckoutViewModel(private val analytics: Analytics) {\n    fun onPurchase() = analytics.track(\"purchase\")\n}\n\nfun main() {\n    AnalyticsTracker.track(\"app_open\")\n    AnalyticsTracker.track(\"screen_view\")\n    println(\"same instance every time: \" + (AnalyticsTracker === AnalyticsTracker))\n    println(\"events recorded globally: \" + AnalyticsTracker.events)\n\n    // Production wiring.\n    CheckoutViewModel(AnalyticsTrackerImpl { println(it) }).onPurchase()\n\n    // The same ViewModel under test, with the dependency replaced.\n    val fake = FakeAnalytics()\n    CheckoutViewModel(fake).onPurchase()\n    println(\"test saw: \" + fake.recorded)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "AnalyticsTracker: app_open",
                        "AnalyticsTracker: screen_view",
                        "same instance every time: true",
                        "events recorded globally: 2",
                        "impl: purchase",
                        "test saw: [purchase]"
                    ],
                    explain: "<p>Both halves produce one instance. The difference is <em>who decided</em>.</p><p><code>object AnalyticsTracker</code> decides for itself, and the count of 2 is the problem in miniature: that state is global, it survives between tests, and a test that wants to assert on tracking has nothing to substitute. There is no seam.</p><p>The bottom two lines are the same <code>CheckoutViewModel</code> run twice with different collaborators — the real implementation, then a fake that records what it was told. Neither the ViewModel nor the interface changed. Marking the implementation <code>@Singleton</code> still yields exactly one instance in production; the difference is that the decision now lives in the object graph rather than the class, and the graph can be rebuilt for a test.</p>"
                }
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
                title: "A factory, in the shape ViewModelProvider expects",
                code: "// The shape of ViewModelProvider.Factory: construction is moved out of the\n// caller and into an object that knows how to build the thing.\nopen class ViewModel\n\nclass UserRepository {\n    fun name() = \"Ada\"\n}\n\nclass UserViewModel(private val repository: UserRepository) : ViewModel() {\n    fun user() = repository.name()\n}\n\nclass SettingsViewModel : ViewModel()\n\nclass UserViewModelFactory(private val repository: UserRepository) {\n    fun <T : ViewModel> create(modelClass: Class<T>): T {\n        if (modelClass.isAssignableFrom(UserViewModel::class.java)) {\n            @Suppress(\"UNCHECKED_CAST\")\n            return UserViewModel(repository) as T\n        }\n        throw IllegalArgumentException(\"Unknown ViewModel class: ${modelClass.simpleName}\")\n    }\n}\n\nfun main() {\n    val factory = UserViewModelFactory(UserRepository())\n\n    val viewModel = factory.create(UserViewModel::class.java)\n    println(\"built \" + viewModel::class.simpleName + \", user = \" + viewModel.user())\n\n    // The caller never sees the constructor, so the dependency stays hidden\n    // from it — which is the whole point when the framework does the calling.\n    val another = factory.create(UserViewModel::class.java)\n    println(\"factory returns a new instance each time: \" + (viewModel !== another))\n\n    try {\n        factory.create(SettingsViewModel::class.java)\n    } catch (e: IllegalArgumentException) {\n        println(\"caught: \" + e.message)\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "built UserViewModel, user = Ada",
                        "factory returns a new instance each time: true",
                        "caught: Unknown ViewModel class: SettingsViewModel"
                    ],
                    explain: "<p>The factory exists because the caller is not the one doing the constructing. Android instantiates ViewModels itself, on rotation and process death, and it has no way to know your ViewModel needs a repository. Handing it a factory is how the dependency gets in.</p><p>The last line is the unsatisfying part of this particular API. <code>create</code> is generic over <code>T</code>, but type erasure means the check has to be done by hand against a <code>Class</code> object, with an unchecked cast and a runtime throw for anything unrecognised — a compile-time question answered at runtime.</p><p>Hilt's <code>@HiltViewModel</code> generates all of this, which is why hand-written factories are now mostly something you read in older code rather than write.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "design-pattern-observer",
            importance: "must-know",
            question: "What is the Observer pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Observer</strong> — a behavioral pattern where a <strong>subject</strong> maintains a list of dependent <strong>observers</strong> and automatically notifies them of state changes, decoupling the producer of data from its consumers.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Observers subscribe to a subject; when the subject's state changes, it pushes an update to every subscriber without needing to know their concrete type.</li><li>Decouples producer and consumer — the subject doesn't need to know how many observers exist or what they do with updates.</li></ul><p><strong>⚙️ Where you see it in Android</strong></p><ul><li><strong>LiveData</strong> — Activities/Fragments observe it lifecycle-aware; auto-unsubscribes on destroy.</li><li><strong>Kotlin Flow</strong> (<code>StateFlow</code>/<code>SharedFlow</code>) — coroutine-based observer pattern.</li><li><strong>RxJava Observable/Subject</strong> — the canonical reactive implementation of this pattern.</li><li><strong>BroadcastReceiver</strong>, <code>View.OnClickListener</code> — classic callback-based observer usage.</li></ul>",
            referenceLinks: [{ title: "LiveData overview", url: "https://developer.android.com/topic/libraries/architecture/livedata" }],
            tags: ["observer", "design-pattern", "behavioral", "livedata"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Observer via StateFlow",
                code: "import kotlinx.coroutines.*\nimport kotlinx.coroutines.flow.*\n\ndata class User(val name: String)\n\nclass UserViewModel {\n    private val _state = MutableStateFlow<User?>(null)   // the subject\n    val state: StateFlow<User?> = _state.asStateFlow()   // read-only to observers\n\n    fun load(name: String) { _state.value = User(name) }\n}\n\nfun main() = runBlocking {\n    val viewModel = UserViewModel()\n\n    // The observer. In an Activity this is lifecycleScope + repeatOnLifecycle.\n    val job = launch {\n        viewModel.state.collect { user -> println(\"render($user)\") }\n    }\n    delay(20)\n\n    viewModel.load(\"Ada\")\n    delay(20)\n\n    viewModel.load(\"Ada\")        // same value — StateFlow conflates it away\n    delay(20)\n\n    viewModel.load(\"Grace\")\n    delay(20)\n\n    println(\"current value without collecting: \" + viewModel.state.value)\n    job.cancel()                 // unsubscribing is what stops the leak\n    println(\"observer cancelled\")\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "render(null)",
                        "render(User(name=Ada))",
                        "render(User(name=Grace))",
                        "current value without collecting: User(name=Grace)",
                        "observer cancelled"
                    ],
                    explain: "<p>Look at what is missing: <code>load(\"Ada\")</code> was called twice and <code>render</code> ran once for it. <code>StateFlow</code> conflates — it compares with <code>equals</code> and does not re-emit a value equal to the current one — so the observer is not woken to redraw something identical.</p><p>The first line is the other half of the contract: the collector received <code>null</code>, the current value, the moment it subscribed. An observer never has to ask what it missed, which is why this shape suits UI state and why a screen returning from the background is correct immediately.</p><p>The subject exposes <code>MutableStateFlow</code> privately and <code>asStateFlow()</code> publicly, so observers can read and only the ViewModel can write. Cancelling the job is the unsubscribe — in an Activity, <code>repeatOnLifecycle</code> does that on every stop, which is what stops a background screen collecting forever.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "design-pattern-repository",
            importance: "must-know",
            question: "What is the Repository pattern?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Repository</strong> — a structural pattern that abstracts data access behind a single API, hiding whether data comes from network, local database, or cache from the rest of the app.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Callers (typically ViewModels/use cases) depend on a repository <strong>interface</strong>, not on Retrofit/Room directly.</li><li>The implementation decides data source strategy — e.g. return cached Room data immediately, then refresh from network and update the cache (single source of truth pattern).</li><li>Multiple data sources (remote <code>ApiService</code>, local <code>Dao</code>) are composed inside the repository, invisible to consumers.</li></ul><p><strong>✅ Benefits</strong></p><ul><li>Swappable implementations for testing (fake repository with in-memory data, no real network/DB needed).</li><li>Single source of truth — UI always reads from one place (usually the local DB) which is kept in sync with remote data.</li></ul>",
            referenceLinks: [{ title: "Guide to app architecture — data layer", url: "https://developer.android.com/topic/architecture/data-layer" }],
            images: [
                {
                    src: "assets/img/mad-arch-overview-data.png",
                    alt: "The data layer opened up: repositories above data sources, both inside the Data Layer box, with the UI Layer and Domain Layer (optional) greyed out above it",
                    caption: "The repository pattern in its Android form. Everything above the Data Layer reaches exactly one thing — the repository — and the data sources behind it can change without any of them noticing.",
                    sourceTitle: "Data layer",
                    sourceUrl: "https://developer.android.com/topic/architecture/data-layer"
                }
            ],
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
                title: "Repository over cache and network",
                code: "class UserRepository(\n    private val api: ApiService,\n    private val dao: UserDao\n) {\n    fun getUser(id: String): Flow<User> = flow {\n        emit(dao.getUser(id))\n        val fresh = api.fetchUser(id)\n        dao.insert(fresh)\n        emit(fresh)\n    }.flowOn(Dispatchers.IO)\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "The ViewModel collects getUser(id). Nothing has run yet — the flow is cold.",
                        "The builder emits whatever the DAO has cached, so the screen shows real data almost immediately, offline included.",
                        "The network call then runs. The collector is suspended; the UI keeps its cached content on screen.",
                        "The fresh response is written to the database, which is what makes the cache authoritative rather than a copy.",
                        "The fresh value is emitted, and the screen updates from stale to current.",
                        "flowOn(Dispatchers.IO) means all of that happened off the main thread, while the collector stayed on it.",
                        "If the network call fails, the cached emission has already been delivered — the screen keeps working and only the refresh is lost."
                    ],
                    explain: "<p>Steps 2 and 5 are the pattern: <strong>two emissions from one call</strong>, cached then fresh. The ViewModel does not know or care which storage answered, which is what the repository is hiding.</p><p>Step 7 is why this ordering matters. Emitting the cache first means a network failure degrades the screen instead of breaking it, and it is the reason the cache read is not wrapped in the same try as the fetch.</p><p>The weakness of this particular version is that it emits the cached value even when it is <code>null</code> or stale beyond usefulness. Production repositories usually add a freshness check, and Room + <code>NetworkBoundResource</code> is the fuller form of the same shape.</p>"
                }
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
                code: "class UserAdapter(private val users: List<User>) :\n    RecyclerView.Adapter<UserAdapter.ViewHolder>() {\n\n    class ViewHolder(val binding: ItemUserBinding) :\n        RecyclerView.ViewHolder(binding.root)\n\n    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {\n        val binding = ItemUserBinding.inflate(\n            LayoutInflater.from(parent.context), parent, false\n        )\n        return ViewHolder(binding)\n    }\n\n    override fun onBindViewHolder(holder: ViewHolder, position: Int) {\n        holder.binding.name.text = users[position].name\n    }\n\n    override fun getItemCount() = users.size\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "RecyclerView asks the adapter how many items exist, via getItemCount.",
                        "For the first visible row it calls onCreateViewHolder, which inflates a layout and wraps it in a ViewHolder.",
                        "onBindViewHolder is called with that holder and position 0, and copies data from the model into the views.",
                        "This repeats only for as many rows as fit on screen, plus a small buffer — not for the whole list.",
                        "As the user scrolls, a row leaving the top is handed back and RecyclerView calls onBindViewHolder on it again with a new position.",
                        "onCreateViewHolder is not called again for that row. The expensive inflation happened once and the view is reused.",
                        "The adapter is the only thing that knows both the data type and the view type; RecyclerView knows neither."
                    ],
                    explain: "<p>Step 7 is why this is the Adapter pattern rather than merely a class called Adapter. <code>RecyclerView</code> speaks in positions and <code>ViewHolder</code>s; your code speaks in <code>User</code> objects. The adapter translates between two interfaces that were never designed to meet.</p><p>Steps 5 and 6 are the recycling that gives the widget its name, and the source of its classic bug: because holders are reused, <code>onBindViewHolder</code> must set <em>every</em> field every time. Setting a value only inside an <code>if</code> leaves the previous row's content visible on a recycled view.</p>"
                }
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
                title: "Constructor injection against internal construction",
                code: "// Bad: hidden dependency, hard to test\nclass UserViewModel : ViewModel() {\n    private val repo = UserRepositoryImpl(ApiClient.retrofit)\n}\n\n// Good: injected dependency, easy to fake in tests\nclass UserViewModel(private val repo: UserRepository) : ViewModel()",
                output: {
                    kind: "trace",
                    lines: [
                        "In the first version, constructing UserViewModel also constructs UserRepositoryImpl, which constructs an ApiClient, which opens a real Retrofit stack.",
                        "A test that wants to check the ViewModel therefore gets a network client it never asked for.",
                        "There is no seam: the dependency is created inside the constructor, so nothing outside can replace it.",
                        "In the second version the repository arrives as a constructor parameter.",
                        "Production code passes UserRepositoryImpl, and the behaviour is identical.",
                        "A test passes FakeUserRepository, and the same ViewModel now runs with no network at all.",
                        "The dependency is also visible in the signature, so the ViewModel's requirements can be read without opening it."
                    ],
                    explain: "<p>Step 3 is the whole argument, and it is about testability rather than elegance. A dependency constructed inside a class cannot be substituted from outside it, so anything that class touches is dragged into every test of it.</p><p>Step 7 is the quieter benefit: a constructor is an honest list of what a class needs. The first version needs a network stack and says nothing about it.</p><p>Hilt and Dagger only automate step 5 — deciding what to pass. The property that makes the code testable is the parameter itself, and it costs nothing.</p>"
                }
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
                title: "Strategy for validation",
                code: "interface ValidationStrategy {\n    fun isValid(input: String): Boolean\n}\n\nclass EmailValidation : ValidationStrategy {\n    private val pattern = Regex(\"^[^@\\\\s]+@[^@\\\\s]+\\\\.[^@\\\\s]+$\")\n    override fun isValid(input: String) = pattern.matches(input)\n}\n\nclass PasswordValidation : ValidationStrategy {\n    override fun isValid(input: String) = input.length >= 8\n}\n\nclass NotEmptyValidation : ValidationStrategy {\n    override fun isValid(input: String) = input.isNotBlank()\n}\n\nclass Validator(private val strategy: ValidationStrategy) {\n    fun validate(input: String) = strategy.isValid(input)\n}\n\nfun main() {\n    val email = Validator(EmailValidation())\n    val password = Validator(PasswordValidation())\n\n    println(\"email  'ada@example.com' -> \" + email.validate(\"ada@example.com\"))\n    println(\"email  'ada@'            -> \" + email.validate(\"ada@\"))\n    println(\"passwd 'short'           -> \" + password.validate(\"short\"))\n    println(\"passwd 'longenough'      -> \" + password.validate(\"longenough\"))\n\n    // A new rule is a new class. Validator was not touched.\n    println(\"notEmpty '   '           -> \" + Validator(NotEmptyValidation()).validate(\"   \"))\n\n    // The strategy can also be chosen at runtime, which an if/else chain\n    // inside Validator could not do without knowing every case up front.\n    val byField = mapOf(\n        \"email\" to EmailValidation(),\n        \"password\" to PasswordValidation()\n    )\n    for ((field, strategy) in byField) {\n        println(\"$field via map -> \" + Validator(strategy).validate(\"ada@example.com\"))\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "email  'ada@example.com' -> true",
                        "email  'ada@'            -> false",
                        "passwd 'short'           -> false",
                        "passwd 'longenough'      -> true",
                        "notEmpty '   '           -> false",
                        "email via map -> true",
                        "password via map -> true"
                    ],
                    explain: "<p><code>Validator</code> contains no validation rules and was not modified when a third one arrived. It holds a <code>ValidationStrategy</code> and calls it, which is the pattern: behaviour that varies is moved behind an interface and passed in.</p><p>The last two lines show what an <code>if</code>/<code>else</code> chain inside <code>Validator</code> could not do — the rule is chosen from a map at runtime, keyed by field name, with no branch that has to know every case up front. Adding a rule is a new class and a new map entry.</p><p>This is Open/Closed from SOLID as a concrete arrangement, and it is the same shape as a <code>Comparator</code>: the algorithm is a parameter.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "design-pattern-android-common",
            importance: "must-know",
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
                title: "Named and default arguments instead of a Builder",
                code: "data class User(\n    val name: String,\n    val age: Int = 0,\n    val email: String? = null,\n    val premium: Boolean = false\n)\n\nfun main() {\n    // What a Builder exists to provide, the language provides directly.\n    val user = User(name = \"Aditya\", age = 28)\n    println(user)\n\n    // Arguments may be named in any order, and omitted ones take defaults.\n    println(User(email = \"ada@example.com\", name = \"Ada\"))\n\n    // No build() step, and the object is already immutable.\n    val upgraded = user.copy(premium = true)\n    println(upgraded)\n    println(\"copy left the original alone: $user\")\n\n    // data class also generates equals, so two identically built users match.\n    println(\"equal to a fresh identical User? \" + (user == User(name = \"Aditya\", age = 28)))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "User(name=Aditya, age=28, email=null, premium=false)",
                        "User(name=Ada, age=0, email=ada@example.com, premium=false)",
                        "User(name=Aditya, age=28, email=null, premium=true)",
                        "copy left the original alone: User(name=Aditya, age=28, email=null, premium=false)",
                        "equal to a fresh identical User? true"
                    ],
                    explain: "<p>This is the Builder question answered by the language. Two of four fields were named at the call site, the rest took defaults, and the second line shows the order does not matter — all the things a Builder is written to provide, with no builder class to maintain.</p><p><code>copy</code> covers what a builder's reuse covered: a modified version, with the original untouched, which the fourth line confirms. And because <code>data class</code> generates <code>equals</code>, two identically built users compare equal — something a hand-written Builder result gives you only if you remember to write it.</p><p>A Builder still earns its place in Kotlin when the API must be callable from Java, which has no named arguments, or when construction needs validation partway through.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "design-pattern-observer-android-examples",
            importance: "good-to-know",
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
            importance: "good-to-know",
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
            importance: "good-to-know",
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
