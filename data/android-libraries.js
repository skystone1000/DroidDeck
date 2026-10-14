const androidLibrariesData = {
    id: "android-libraries",
    title: "Android Libraries",
    subsections: null,
    keyTopics: ["OkHttp Interceptors and Caching", "Dependency Injection (Dagger, Hilt)", "Dagger Components/Modules/Scopes", "RxJava Operators (map, flatMap, zip, concat, merge)", "RxJava Subjects and Observable types", "Kotlin Flow", "Image Loading (Glide, Fresco)", "Retrofit and Networking", "CompositeDisposable lifecycle", "App Startup Library", "Schedulers (io vs computation)", "Search implementation with RxJava", "Pagination with RxJava"],
    questions: [
        {
            id: "okhttp-interceptor",
            importance: "must-know",
            question: "Explain OkHttp Interceptor.",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Interceptor</strong> — a component that observes, modifies, or short-circuits HTTP requests and responses as they flow through OkHttp's call chain. It implements the <code>Interceptor</code> interface with a single <code>intercept(chain)</code> method.</li><li><strong>Application interceptors</strong> — registered via <code>addInterceptor()</code>; run once per call regardless of retries/redirects, and see the original request you made.</li><li><strong>Network interceptors</strong> — registered via <code>addNetworkInterceptor()</code>; sit closer to the wire, can be invoked multiple times for redirects/retries, and see the request actually sent over the network (with headers like <code>Content-Length</code> added).</li><li>Common uses: adding auth headers, logging, gzip compression, caching headers, retry/refresh-token logic.</li><li>Each interceptor calls <code>chain.proceed(request)</code> to pass control down the chain, forming a classic chain-of-responsibility pipeline.</li></ul><p><strong>🎯 Interview tip:</strong> Be ready to explain the difference between application and network interceptors with a concrete example (e.g., auth header vs gzip decompression).</p>",
            referenceLinks: [{ title: "OkHttp Interceptor (API reference)", url: "https://javadoc.io/doc/com.squareup.okhttp3/okhttp/latest/okhttp3/Interceptor.html" }],
            tags: ["okhttp", "interceptor", "networking", "retrofit"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "OkHttp Interceptor Chain",
                columns: 3,
                nodes: [
                    { label: "App Request", type: "terminal" },
                    { label: "App Interceptors" },
                    { label: "Network Interceptors" },
                    { label: "Server", type: "terminal" }
                ],
                connections: [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 3 }
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "An application interceptor adding an auth header",
                code: "class AuthInterceptor(private val tokenProvider: () -> String) : Interceptor {\n    override fun intercept(chain: Interceptor.Chain): Response {\n        val original = chain.request()\n        val authorized = original.newBuilder()\n            .header(\"Authorization\", \"Bearer ${tokenProvider()}\")\n            .build()\n        return chain.proceed(authorized)\n    }\n}\n\nval client = OkHttpClient.Builder()\n    .addInterceptor(AuthInterceptor { tokenStore.accessToken })\n    .build()",
                    output: {
                        kind: "trace",
                        lines: [
                            "A call is made. OkHttp passes the request into the interceptor chain before any connection is opened.",
                            "The interceptor cannot modify the request in place — Request is immutable — so it builds a copy with newBuilder().",
                            "header() replaces any existing Authorization value; addHeader() would have appended a second one.",
                            "chain.proceed(authorized) hands the modified request onward and blocks until a response comes back.",
                            "The response returns up through the chain to the caller.",
                            "Because the token is read inside intercept rather than captured at construction, every request picks up the current token.",
                            "Registered with addInterceptor, this runs once per call — even if OkHttp follows a redirect or retries."
                        ],
                        explain: "<p>Step 6 is a small decision with real consequences. The interceptor takes a <code>() -&gt; String</code> rather than a <code>String</code>, so a token refreshed after the client was built is still used. Passing the token itself would freeze the value at startup, and every request after the first refresh would carry a stale one.</p><p>Step 7 is the <code>addInterceptor</code> versus <code>addNetworkInterceptor</code> distinction, which gets asked. An <strong>application</strong> interceptor runs once per call and sees the request you made. A <strong>network</strong> interceptor runs once per actual network round trip, sees redirects and retries separately, and sees the headers OkHttp adds itself.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "okhttp-caching",
            importance: "should-know",
            question: "How does HTTP Caching work with OkHttp?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>OkHttp implements HTTP caching per RFC 7234 through a <code>Cache</code> instance backed by a directory on disk, keyed by request URL.</li><li>Configure it with <code>OkHttpClient.Builder().cache(Cache(dir, maxSize))</code>; OkHttp then honors standard headers automatically.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Cache-Control</strong> response headers (<code>max-age</code>, <code>no-cache</code>, <code>no-store</code>) from the server drive freshness decisions.</li><li>If the server doesn't send proper cache headers, you can force caching client-side with a network interceptor that rewrites <code>Cache-Control</code> on the response.</li><li>For offline support, an application interceptor can rewrite the request's <code>Cache-Control</code> to <code>only-if-cached, max-stale=&lt;seconds&gt;</code> when there is no network.</li><li>Stale responses trigger a conditional GET (<code>If-None-Match</code>/<code>If-Modified-Since</code>); a <code>304 Not Modified</code> lets OkHttp reuse the cached body.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>POST/PUT/DELETE responses are never cached by default — only GET.</li><li>Cache size and eviction (LRU) must be sized deliberately; too small and you thrash, too large and you waste disk.</li></ul>",
            referenceLinks: [{ title: "OkHttp Cache (API reference)", url: "https://javadoc.io/doc/com.squareup.okhttp3/okhttp/latest/okhttp3/Cache.html" }],
            tags: ["okhttp", "caching", "http", "networking"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "okhttp-logging",
            importance: "should-know",
            question: "How to enable logging in OkHttp?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Add Square's <code>logging-interceptor</code> artifact (<code>com.squareup.okhttp3:logging-interceptor</code>) and register a <code>HttpLoggingInterceptor</code> as a <strong>network interceptor</strong> so it sees the final wire-level request/response.</li></ul><p><strong>⚙️ Levels</strong></p><ul><li><code>NONE</code> — no logs (default, used for production release builds).</li><li><code>BASIC</code> — request/response line only.</li><li><code>HEADERS</code> — request/response lines plus headers, no body.</li><li><code>BODY</code> — everything, including request/response bodies — verbose, use only in debug builds since bodies may contain sensitive data.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Never ship <code>BODY</code> level logging in a release build — it can leak tokens, PII, and payment data into logcat.</li><li>Gate the interceptor behind <code>BuildConfig.DEBUG</code>.</li></ul>",
            referenceLinks: [{ title: "HttpLoggingInterceptor (API reference)", url: "https://javadoc.io/doc/com.squareup.okhttp3/logging-interceptor/latest/okhttp3/logging/HttpLoggingInterceptor.html" }],
            tags: ["okhttp", "logging", "debugging", "networking"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "A logging interceptor that is off in release",
                code: "val logging = HttpLoggingInterceptor().apply {\n    level = if (BuildConfig.DEBUG) {\n        HttpLoggingInterceptor.Level.BODY\n    } else {\n        HttpLoggingInterceptor.Level.NONE\n    }\n}\n\nval client = OkHttpClient.Builder()\n    .addInterceptor(logging)\n    .build()",
                    output: {
                        kind: "trace",
                        lines: [
                            "HttpLoggingInterceptor is created and its level is chosen from BuildConfig.DEBUG.",
                            "In a debug build the level is BODY: request line, headers, and the full request and response bodies go to Logcat.",
                            "In a release build the level is NONE, and intercept becomes a pass-through that formats nothing.",
                            "The interceptor is added last, so it sees the request after every other interceptor has finished modifying it.",
                            "That means it logs the Authorization header the auth interceptor added — which is the point when debugging, and a leak in a release build.",
                            "Because the level is NONE in release, nothing is written and there is nothing to leak."
                        ],
                        explain: "<p>Step 5 is the reason this question is worth asking. <code>Level.BODY</code> prints headers and bodies, which means auth tokens, session cookies and personal data land in Logcat — readable by anything on a rooted device and captured by bug reports.</p><p>Making the level conditional is the standard fix. Adding the interceptor conditionally is safer still, and <code>redactHeader(\"Authorization\")</code> covers the case where body logging is genuinely needed in a shipped build.</p><p>Order matters both ways: added last, it logs the final request; added first, it logs what your code asked for before any interceptor touched it.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-dagger-why",
            importance: "must-know",
            question: "Why do we use a Dependency Injection Framework like Dagger in Android?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Dependency Injection (DI)</strong> — supplying an object's dependencies from outside rather than having it construct them itself, decoupling construction from use.</li></ul><p><strong>⚙️ Why Dagger specifically</strong></p><ul><li><strong>Compile-time safety</strong> — Dagger generates Java/Kotlin code via annotation processing (KAPT/KSP), so missing or ambiguous bindings are caught at build time, not runtime like reflection-based frameworks.</li><li><strong>Performance</strong> — no reflection at runtime, so object graph creation is fast, important on resource-constrained devices.</li><li><strong>Testability</strong> — dependencies can be swapped for fakes/mocks in tests without touching production code.</li><li><strong>Scoped lifecycles</strong> — Dagger models Activity/Fragment/ViewModel-scoped singletons cleanly via component scoping, avoiding memory leaks from manually held statics.</li><li><strong>Reduced boilerplate</strong> — no more manual factory classes or service locators passed through constructors.</li></ul><p><strong>🎯 Interview tip:</strong> Contrast with a hand-rolled service locator — DI inverts control and is unit-testable; service locators hide dependencies and are harder to mock.</p>",
            referenceLinks: [{ title: "Dependency injection in Android", url: "https://developer.android.com/training/dependency-injection" }],
            tags: ["dagger", "dependency-injection", "di", "hilt"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-dagger-annotations",
            importance: "must-know",
            question: "Explain @Inject, @Module, @Provides, @Component in Dagger 2.",
            answer: "<table><thead><tr><th>Annotation</th><th>Purpose</th></tr></thead><tbody><tr><td><code>@Inject</code></td><td>Marks a constructor, field, or method Dagger should fill in. On a constructor, it tells Dagger how to build that class directly.</td></tr><tr><td><code>@Module</code></td><td>Marks a class that provides bindings for types Dagger can't construct itself (interfaces, third-party classes like <code>Retrofit</code>).</td></tr><tr><td><code>@Provides</code></td><td>Inside a module, marks a method whose return value becomes an available binding in the graph.</td></tr><tr><td><code>@Component</code></td><td>An interface that bridges modules and injection targets; Dagger generates an implementation (<code>DaggerXComponent</code>) that wires everything together.</td></tr></tbody></table><p><strong>⚙️ How they fit together</strong></p><ul><li><code>@Inject</code>-annotated constructors are used directly; classes you don't own (interfaces, SDK types) need a <code>@Module</code> with <code>@Provides</code> methods instead.</li><li>The <code>@Component</code> declares which modules it uses and exposes injection entry points (e.g. <code>fun inject(activity: MainActivity)</code>).</li></ul>",
            referenceLinks: [{ title: "Dagger 2 User's Guide", url: "https://dagger.dev/dev-guide/" }],
            tags: ["dagger", "annotations", "di", "modules"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "How Dagger resolves a dependency graph",
                code: "class UserRepository @Inject constructor(\n    private val api: ApiService\n)\n\n@Module\nclass NetworkModule {\n    @Provides\n    fun provideRetrofit(): Retrofit =\n        Retrofit.Builder()\n            .baseUrl(\"https://api.example.com\")\n            .build()\n\n    @Provides\n    fun provideApiService(retrofit: Retrofit): ApiService =\n        retrofit.create(ApiService::class.java)\n}\n\n@Component(modules = [NetworkModule::class])\ninterface AppComponent {\n    fun inject(activity: MainActivity)\n}",
                    output: {
                        kind: "trace",
                        lines: [
                            "@Inject on the UserRepository constructor tells Dagger it may build one, and that doing so needs an ApiService.",
                            "@Provides methods in the module tell it how to build the things it cannot construct itself — Retrofit and ApiService come from a builder, not a constructor.",
                            "At compile time Dagger walks the graph: to build UserRepository it needs ApiService, which needs Retrofit, which needs nothing.",
                            "It generates factory classes for each, plus an implementation of the @Component interface.",
                            "A missing binding anywhere in that walk is a compile error naming the exact type — nothing fails at runtime.",
                            "At runtime the component instantiates from the bottom up: Retrofit, then ApiService, then UserRepository.",
                            "Without a scope annotation each request builds a fresh instance, so two injection sites get two Retrofits."
                        ],
                        explain: "<p>Step 5 is what separates Dagger from a reflective injector like Guice or Koin: the graph is verified when the project builds, so a missing dependency is a red squiggle rather than a crash on the screen that needed it.</p><p>Step 7 is the one that catches people. <code>@Provides</code> without a scope is not a singleton — <code>provideRetrofit</code> runs once per injection point, and building several OkHttp clients means several connection pools and thread pools. Scoping is not an optimisation here, it is usually the correct behaviour.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-dagger-how-works",
            importance: "should-know",
            question: "How does Dagger work internally?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Dagger is an <strong>annotation processor</strong> (KAPT for Java-style stubs, or KSP for newer, faster processing) that runs at compile time and generates plain Java/Kotlin source implementing your dependency graph — there is no runtime reflection.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>It scans <code>@Inject</code>, <code>@Module</code>/<code>@Provides</code>, and <code>@Component</code> annotations to build a static graph of bindings.</li><li>For each <code>@Component</code>, it generates a class named <code>Dagger&lt;ComponentName&gt;</code> containing factory methods and <code>Provider</code>/<code>Lazy</code> wrappers that directly call constructors or provider methods — essentially hand-written-looking builder code.</li><li>Object creation becomes a chain of plain constructor calls resolved at build time, so the graph is validated when you compile: missing bindings, duplicate bindings, and circular dependencies all fail the build with a clear error.</li><li>Scoped bindings (e.g. <code>@Singleton</code>) are cached as fields inside the generated component instance, tied to that component's lifecycle.</li></ul><p><strong>🎯 Interview tip:</strong> The key differentiator to mention versus Koin/Guice: Dagger's graph is fully resolved at compile time with generated code, not reflection at runtime.</p>",
            referenceLinks: [{ title: "How Dagger Works", url: "https://dagger.dev/dev-guide/" }],
            tags: ["dagger", "annotation-processing", "di", "internals"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-dagger-vs-hilt",
            importance: "must-know",
            question: "How will you choose between Dagger 2 and Dagger-Hilt?",
            answer: "<table><thead><tr><th>Aspect</th><th>Dagger 2</th><th>Hilt</th></tr></thead><tbody><tr><td>Boilerplate</td><td>You write every Component/Subcomponent by hand</td><td>Standard components (SingletonComponent, ViewModelComponent, ActivityComponent...) generated for you</td></tr><tr><td>Android integration</td><td>Manual — you wire Application/Activity/Fragment injection yourself</td><td>Built-in via <code>@AndroidEntryPoint</code>, <code>@HiltViewModel</code>, <code>@HiltAndroidApp</code></td></tr><tr><td>Scoping</td><td>Custom scopes you define</td><td>Predefined scopes matching Android component lifecycles</td></tr><tr><td>Flexibility</td><td>Full control over graph shape — good for non-standard/multi-module setups</td><td>Opinionated conventions — faster for typical app architecture</td></tr><tr><td>Testing</td><td>Manual test components</td><td><code>Hilt-testing</code> artifact with <code>@HiltAndroidTest</code>, easy replacement bindings via <code>@TestInstallIn</code></td></tr></tbody></table><p><strong>✅ When to use</strong></p><ul><li>Choose <strong>Hilt</strong> for standard Android apps — less boilerplate, Google-recommended, integrates with Jetpack (ViewModel, WorkManager, Navigation).</li><li>Choose <strong>plain Dagger</strong> for non-Android modules (pure Kotlin/Java libraries), highly custom component graphs, or legacy codebases already invested in it.</li></ul>",
            referenceLinks: [{ title: "Hilt and Dagger annotations", url: "https://developer.android.com/training/dependency-injection/hilt-android" }],
            tags: ["dagger", "hilt", "di", "comparison"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-dagger-component",
            importance: "should-know",
            question: "What is a Component in Dagger?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A <strong>Component</strong> is an interface annotated with <code>@Component</code> that acts as the bridge between the modules providing bindings and the classes that need them — Dagger generates a concrete implementation of it.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Declares which <code>@Module</code>s feed the graph: <code>@Component(modules = [NetworkModule::class, DbModule::class])</code>.</li><li>Exposes <strong>injection entry points</strong>, e.g. <code>fun inject(activity: MainActivity)</code>, or <strong>provision methods</strong> that return a dependency directly, e.g. <code>fun apiService(): ApiService</code>.</li><li>Its scope annotation (e.g. <code>@Singleton</code>) determines the lifetime of bindings cached within it — one instance of the component means one instance of each scoped binding.</li><li>Subcomponents can be nested inside a parent component to create shorter-lived scopes (e.g. an <code>ActivityComponent</code> inside an <code>AppComponent</code>).</li></ul>",
            referenceLinks: [{ title: "Dagger Components", url: "https://dagger.dev/dev-guide/" }],
            tags: ["dagger", "component", "di", "graph"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-dagger-module",
            importance: "should-know",
            question: "What is a Module in Dagger?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A <strong>Module</strong> (<code>@Module</code>-annotated class) groups <code>@Provides</code> (or <code>@Binds</code>) methods that tell Dagger how to construct types it cannot build via a plain <code>@Inject</code> constructor — interfaces, third-party SDK classes, or objects requiring custom construction logic (e.g. a configured <code>Retrofit</code> or <code>Room</code> database).</li><li><code>@Provides</code> methods contain imperative construction code and return the built instance; they can take other bindings as parameters, which Dagger resolves and injects automatically.</li><li><code>@Binds</code> is a lighter alternative for interface-to-implementation bindings — an abstract method Dagger implements without generating a factory call, more efficient than <code>@Provides</code> for that case.</li><li>Modules are attached to a <code>@Component</code> via <code>@Component(modules = [MyModule::class])</code>.</li></ul>",
            referenceLinks: [{ title: "Dagger Modules", url: "https://dagger.dev/dev-guide/" }],
            tags: ["dagger", "module", "provides", "binds"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-dagger-custom-scope",
            importance: "should-know",
            question: "How does a custom scope work in Dagger?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A <strong>scope</strong> is a custom annotation (e.g. <code>@ActivityScope</code>) you define with <code>@Scope</code> meta-annotation, used to bind an object's lifetime to a particular subcomponent rather than the whole app.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Define it: <code>@Scope @Retention(RUNTIME) annotation class ActivityScope</code>.</li><li>Annotate both the <code>@Subcomponent</code> and the <code>@Provides</code>/<code>@Inject</code> class with the same scope annotation.</li><li>Dagger then caches exactly one instance of that binding <strong>per instance of the owning (sub)component</strong> — e.g. one instance per Activity, discarded when the Activity's component is discarded (typically in <code>onDestroy</code>).</li><li>Scope mismatches (using an unscoped module inside a scoped component incorrectly, or referencing a narrower scope from a broader one) are caught at compile time.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>A component can only carry <strong>one</strong> scope annotation; mixing scope annotations on the same component is a compile error.</li><li>Unscoped bindings are created fresh every time they're requested — don't forget to scope things meant to be singletons within that boundary.</li></ul>",
            referenceLinks: [{ title: "Dagger scopes", url: "https://dagger.dev/dev-guide/" }],
            tags: ["dagger", "scope", "custom-scope", "di"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "What a custom scope actually does",
                code: "@Scope\n@Retention(AnnotationRetention.RUNTIME)\nannotation class ActivityScope\n\n@ActivityScope\n@Subcomponent(modules = [ActivityModule::class])\ninterface ActivityComponent {\n    fun inject(activity: MainActivity)\n}\n\n@Module\nclass ActivityModule {\n    @ActivityScope\n    @Provides\n    fun provideImageLoader(context: Context): ImageLoader =\n        ImageLoader(context)\n}",
                    output: {
                        kind: "trace",
                        lines: [
                            "@Scope marks ActivityScope as a scope annotation; on its own it means nothing.",
                            "The subcomponent is annotated @ActivityScope, which gives it a lifetime.",
                            "A @Provides method annotated @ActivityScope tells Dagger to cache that instance IN this subcomponent.",
                            "MainActivity creates the subcomponent in onCreate and injects itself from it.",
                            "Every @ActivityScope dependency requested through that subcomponent is the same object.",
                            "A second Activity creates a second subcomponent, with its own instances — the scope is per component, not per annotation.",
                            "When the Activity is destroyed it drops the subcomponent, and everything cached in it becomes garbage."
                        ],
                        explain: "<p>Step 6 is the sentence to have ready: <strong>a scope does not create a lifetime, it binds an instance to one that already exists</strong>. <code>@ActivityScope</code> means \"one per ActivityComponent\", and how long that lasts is decided by whoever holds the component.</p><p>Step 7 is where the leaks come from. Holding a subcomponent past the Activity keeps everything scoped to it alive, including anything that captured a <code>Context</code>. Injecting an Activity-scoped object into a <code>@Singleton</code> is the same mistake from the other direction, and Dagger rejects it at compile time.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-composite-disposable",
            importance: "should-know",
            question: "When to call dispose and clear on CompositeDisposable in RxJava?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>CompositeDisposable</strong> — a container that holds multiple <code>Disposable</code> subscriptions so they can be disposed together, preventing memory leaks from subscriptions that outlive their owning component.</li></ul><table><thead><tr><th>Method</th><th>Effect</th></tr></thead><tbody><tr><td><code>clear()</code></td><td>Disposes all current disposables and empties the container, but the <code>CompositeDisposable</code> itself remains usable — you can keep adding new disposables afterward.</td></tr><tr><td><code>dispose()</code></td><td>Disposes all current disposables AND marks the container itself as disposed — any disposable added afterward is immediately disposed and never runs.</td></tr></tbody></table><p><strong>✅ When to use</strong></p><ul><li>Call <code>clear()</code> in <code>onStop()</code>/lifecycle points you want to reuse the container again, e.g. Fragment view lifecycle where the view is recreated.</li><li>Call <code>dispose()</code> in <code>onDestroy()</code> when the owning component (Activity/Fragment/ViewModel) is permanently gone and the container will never be reused.</li></ul><p><strong>🎯 Interview tip:</strong> Mixing them up is a classic bug source — calling <code>dispose()</code> too early silently drops all future subscriptions.</p>",
            referenceLinks: [{ title: "CompositeDisposable Javadoc", url: "https://javadoc.io/doc/io.reactivex.rxjava3/rxjava/latest/io/reactivex/rxjava3/disposables/CompositeDisposable.html" }],
            tags: ["rxjava", "compositedisposable", "memory-leak", "lifecycle"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "CompositeDisposable as manual lifecycle management",
                code: "class UserViewModel(private val repo: UserRepository) : ViewModel() {\n    private val disposables = CompositeDisposable()\n\n    fun loadUser(id: String) {\n        val d = repo.getUser(id)\n            .subscribeOn(Schedulers.io())\n            .observeOn(AndroidSchedulers.mainThread())\n            .subscribe({ user -> _state.value = user }, { e -> _error.value = e })\n        disposables.add(d)\n    }\n\n    override fun onCleared() {\n        disposables.dispose()\n    }\n}",
                    output: {
                        kind: "trace",
                        lines: [
                            "subscribe() starts the work and returns a Disposable — the handle for stopping it.",
                            "subscribeOn(Schedulers.io()) puts the work on an IO thread; observeOn(mainThread()) moves the callbacks back.",
                            "The Disposable is added to a CompositeDisposable held by the ViewModel.",
                            "The user leaves the screen and onCleared runs.",
                            "dispose() cancels every Disposable in the collection at once.",
                            "Any in-flight request is cancelled, and its callbacks — which capture the ViewModel — never fire.",
                            "A Disposable that was never added to the collection is not cancelled, and keeps its references alive."
                        ],
                        explain: "<p>Step 7 is the whole reason this pattern is a question. RxJava has no structured concurrency: every subscription must be collected and disposed by hand, and the one you forget is a leak with no compiler help and no warning.</p><p>This is precisely what coroutines removed. <code>viewModelScope.launch</code> registers the child automatically and cancels it in <code>onCleared</code>, so the <code>CompositeDisposable</code>, the <code>add</code> call and the <code>onCleared</code> override all disappear.</p><p>Worth knowing because a lot of production Android still runs on RxJava — and worth saying plainly that it is not what a new screen should use.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-multipart-request",
            importance: "should-know",
            question: "What is a Multipart Request in Networking?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A <strong>multipart request</strong> (<code>multipart/form-data</code>) bundles multiple independent parts — text fields and binary data like files/images — into a single HTTP request body, each part separated by a boundary marker.</li></ul><p><strong>⚙️ How it works with Retrofit/OkHttp</strong></p><ul><li>File parts are represented as <code>MultipartBody.Part</code>, built from a <code>RequestBody</code> with the file's <code>MediaType</code> (e.g. <code>image/jpeg</code>).</li><li>Text fields can be sent as separate <code>@Part</code> parameters or as a <code>Map&lt;String, RequestBody&gt;</code> with <code>@PartMap</code>.</li><li>The Retrofit method is annotated <code>@Multipart</code> and each parameter with <code>@Part</code>.</li></ul><p><strong>✅ When to use</strong></p><ul><li>Uploading images/files alongside metadata (e.g. profile picture upload with a caption) in one round trip.</li></ul>",
            referenceLinks: [{ title: "Retrofit @Multipart (API reference)", url: "https://javadoc.io/doc/com.squareup.retrofit2/retrofit/latest/retrofit2/http/Multipart.html" }],
            tags: ["multipart", "retrofit", "file-upload", "networking"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-kotlin-flow",
            importance: "should-know",
            question: "What is Flow in Kotlin?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Flow</strong> — Kotlin's coroutine-based cold asynchronous stream type (<code>kotlinx.coroutines.flow.Flow&lt;T&gt;</code>) that emits multiple values sequentially over time, built from the ground up on <code>suspend</code> functions.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Cold</strong> — the producer block only runs when a terminal operator like <code>collect</code> is called; each new collector re-executes it independently, unlike a hot RxJava <code>Observable</code>.</li><li>Built via <code>flow { emit(value) }</code>, or converted from existing sources (<code>asFlow()</code>, <code>callbackFlow</code> for callback-based APIs).</li><li>Operators (<code>map</code>, <code>filter</code>, <code>debounce</code>, <code>flatMapLatest</code>, <code>combine</code>) are suspend-aware and structured-concurrency-friendly — cancellation propagates automatically with the collecting scope.</li><li><code>StateFlow</code>/<code>SharedFlow</code> are hot variants for state-holding and event-broadcasting respectively.</li><li>Flow context is preserved by default (<code>flowOn</code> to change the upstream dispatcher) — this is enforced at compile time via context preservation rules.</li></ul><p><strong>⚖️ vs RxJava</strong></p><ul><li>Flow integrates natively with coroutines/structured concurrency, has a smaller, more Kotlin-idiomatic API, and no separate threading model to learn (just dispatchers).</li></ul>",
            referenceLinks: [{ title: "Kotlin Flow", url: "https://kotlinlang.org/docs/flow.html" }],
            tags: ["flow", "kotlin", "coroutines", "reactive"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "A cold Flow with map and flowOn",
                code: "fun searchResults(query: String): Flow<List<Result>> = flow {\n    val results = api.search(query)\n    emit(results)\n}\n    .map { it.filter { r -> r.isValid } }\n    .flowOn(Dispatchers.IO)\n\nviewModelScope.launch {\n    searchResults(\"kotlin\").collect { results ->\n        _uiState.value = results\n    }\n}",
                    output: {
                        kind: "trace",
                        lines: [
                            "searchResults(\"kotlin\") builds a Flow. Nothing runs — no request, no filtering.",
                            "collect subscribes, and only then does the builder execute.",
                            "The api.search call and the map both run on Dispatchers.IO, because flowOn applies to everything declared above it.",
                            "Each result list passes through map to be filtered.",
                            "The value crosses to the collector's dispatcher — the main thread, since this is viewModelScope.",
                            "The collect block sets _uiState, on the main thread, where UI state must be written.",
                            "Collecting a second time re-runs the whole thing including the network call, because the flow is cold."
                        ],
                        explain: "<p>Step 3 is the rule that gets remembered backwards: <code>flowOn</code> affects <strong>upstream</strong> only. Anything declared after it, and the <code>collect</code> block itself, stay on the collector's context — which is exactly the split you want, and it happens without a single manual thread switch.</p><p>Step 7 is the property that makes cold flows right for a request and wrong for shared state. Two screens collecting this make two network calls; <code>stateIn</code> or <code>shareIn</code> is what turns it into one shared stream.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-app-startup-library",
            importance: "should-know",
            question: "What is the App Startup Library?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>App Startup</strong> (<code>androidx.startup</code>) — a Jetpack library that lets multiple libraries/components initialize themselves at app launch <strong>without each declaring its own <code>ContentProvider</code></strong>, consolidating them into a single provider.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>You implement <code>Initializer&lt;T&gt;</code> with a <code>create(context)</code> method and a <code>dependencies()</code> list declaring other initializers that must run first.</li><li>All registered initializers are declared as <code>meta-data</code> entries under a single <code>InitializationProvider</code> in the manifest, so only one <code>ContentProvider</code> is instantiated at process start regardless of how many components use App Startup.</li><li>Initializers run synchronously on the main thread in dependency order before <code>Application.onCreate()</code> returns control to app code — dependency cycles are detected and throw at runtime.</li><li>You can disable automatic (manifest-driven) init for a component and trigger it manually via <code>AppInitializer.getInstance(context).initializeComponent(...)</code> when you need lazy/on-demand init.</li></ul><p><strong>✅ When to use</strong></p><ul><li>Reduces process-start overhead versus each library/SDK registering its own <code>ContentProvider</code> — fewer providers means faster cold start.</li></ul>",
            referenceLinks: [{ title: "App Startup", url: "https://developer.android.com/topic/libraries/app-startup" }],
            tags: ["app-startup", "initialization", "jetpack", "cold-start"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "A custom Initializer",
                code: "class LoggerInitializer : Initializer<Logger> {\n    override fun create(context: Context): Logger {\n        return Logger.init(context)\n    }\n\n    override fun dependencies(): List<Class<out Initializer<*>>> {\n        return emptyList()\n    }\n}",
                    output: {
                        kind: "trace",
                        lines: [
                            "Without App Startup, every library that needs early initialisation declares its own ContentProvider, and each one costs measurable startup time.",
                            "App Startup declares a single ContentProvider — InitializationProvider — for all of them.",
                            "At process start it reads the merged manifest for Initializer entries.",
                            "dependencies() declares what must be initialised first, forming a graph rather than a list.",
                            "App Startup topologically sorts that graph and runs each create() once, in order.",
                            "LoggerInitializer.create returns the Logger, which is cached and handed to anything that depends on it.",
                            "An initializer can also be removed from the manifest and run lazily later via AppInitializer."
                        ],
                        explain: "<p>Steps 1 and 2 are the whole justification. A <code>ContentProvider</code> is created before <code>Application.onCreate</code>, which made it the standard trick for library auto-initialisation — and an app with a dozen such libraries pays a dozen provider creations before it can draw anything.</p><p>Step 4 is the added benefit over doing it by hand: ordering is declared rather than implied by the sequence of calls in <code>onCreate</code>, so a dependency between two libraries cannot be got wrong silently.</p><p>Step 7 is the more valuable option in practice: the fastest initialisation is the one that does not happen at startup at all.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-overview",
            importance: "should-know",
            question: "What is RxJava?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>RxJava</strong> — a Java/Kotlin implementation of Reactive Extensions (ReactiveX), a library for composing asynchronous and event-based programs using observable sequences and functional-style operators.</li></ul><p><strong>⚙️ Core building blocks</strong></p><ul><li><strong>Observable/Flowable</strong> — a source that emits a stream of items (0..N) followed by completion or error.</li><li><strong>Observer/Subscriber</strong> — consumes emitted items via <code>onNext</code>, <code>onError</code>, <code>onComplete</code>.</li><li><strong>Operators</strong> — pure functions (<code>map</code>, <code>filter</code>, <code>flatMap</code>, <code>zip</code>...) that transform one stream into another, composed via <code>.chain()</code> calls.</li><li><strong>Schedulers</strong> — control which thread each part of the chain runs on (<code>subscribeOn</code> for the source, <code>observeOn</code> for downstream).</li></ul><p><strong>✅ When to use</strong></p><ul><li>Complex async pipelines — combining multiple network calls, debounced search, retry-with-backoff — where composing streams is clearer than nested callbacks.</li></ul><p><strong>🎯 Interview tip:</strong> Many teams have migrated from RxJava to Kotlin Flow/coroutines; know both and be ready to compare them.</p>",
            referenceLinks: [{ title: "ReactiveX", url: "https://reactivex.io/" }, { title: "RxJava GitHub", url: "https://github.com/ReactiveX/RxJava" }],
            tags: ["rxjava", "reactive", "observable", "async"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-rxjava-error-handling",
            importance: "should-know",
            question: "How do you handle errors in RxJava?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Errors terminate a stream by default — once <code>onError</code> fires, no further <code>onNext</code> events are delivered, so RxJava provides dedicated operators to recover.</li></ul><p><strong>⚙️ Key operators</strong></p><ul><li><code>onErrorReturn { default }</code> — replace the error with a fallback value and complete normally.</li><li><code>onErrorResumeNext { fallbackObservable }</code> — switch to an entirely different source stream on error.</li><li><code>retry(n)</code> / <code>retryWhen { errors -> ... }</code> — resubscribe to the source, optionally with backoff logic via <code>retryWhen</code>.</li><li><code>doOnError { }</code> — side-effect hook (e.g. logging) without altering the error propagation.</li><li>The two-argument <code>subscribe(onNext, onError)</code> lets you handle the error at the terminal point directly.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Forgetting an <code>onError</code> handler in <code>subscribe()</code> causes RxJava to rethrow the exception as an <code>OnErrorNotImplementedException</code>, potentially crashing the app.</li></ul>",
            referenceLinks: [{ title: "RxJava Error Handling", url: "https://github.com/ReactiveX/RxJava/wiki/Error-Handling" }],
            tags: ["rxjava", "error-handling", "retry", "resilience"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "retryWhen with backoff, then a fallback",
                code: "api.getUser(id)\n    .retryWhen { errors ->\n        errors.zipWith(Observable.range(1, 3)) { _, i -> i }\n            .flatMap { i -> Observable.timer(i * 1000L, TimeUnit.MILLISECONDS) }\n    }\n    .onErrorReturn { User.guest() }\n    .subscribeOn(Schedulers.io())\n    .observeOn(AndroidSchedulers.mainThread())\n    .subscribe { user -> render(user) }",
                    output: {
                        kind: "trace",
                        lines: [
                            "The request fails. The error travels down the chain to retryWhen.",
                            "retryWhen receives an Observable of the errors, not a single error — you return an Observable that signals when to retry.",
                            "zipWith(range(1, 3)) pairs each error with an attempt number, and stops after three because range completes.",
                            "flatMap turns the attempt number into a timer, so retry 1 waits a second, retry 2 waits two, retry 3 waits three.",
                            "Each timer emission signals a resubscribe, and the whole upstream runs again.",
                            "After three attempts the zip completes, retryWhen stops retrying, and the error passes through.",
                            "onErrorReturn catches it and substitutes User.guest(), so the subscriber gets a value rather than an error."
                        ],
                        explain: "<p>Step 2 is what makes <code>retryWhen</code> confusing and powerful: you are not returning a boolean, you are returning a stream whose emissions mean \"try again\". Emit and it retries; complete and it stops; error and that error is propagated.</p><p>Step 3 is the idiom worth memorising, because the completion of <code>range</code> is what bounds the retries — there is no attempt count parameter.</p><p>Step 7 is a design decision worth questioning: <code>onErrorReturn</code> makes a total failure look like a success with guest data, and the screen has no way to tell the difference. A sealed result type would keep the distinction.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-flatmap-vs-map",
            importance: "should-know",
            question: "What is the difference between FlatMap and Map in RxJava?",
            answer: "<table><thead><tr><th>Aspect</th><th><code>map</code></th><th><code>flatMap</code></th></tr></thead><tbody><tr><td>Transformation</td><td>Synchronous, one-to-one — transforms each item in place</td><td>One-to-Observable — each item becomes a new inner Observable</td></tr><tr><td>Return type</td><td>Returns a plain value <code>R</code></td><td>Returns an <code>Observable&lt;R&gt;</code> (or Flowable/Single) that gets merged</td></tr><tr><td>Use case</td><td>Simple transformation, e.g. DTO to UI model</td><td>Chaining async calls, e.g. fetch user then fetch their posts</td></tr><tr><td>Ordering</td><td>Preserves order trivially</td><td>Inner Observables are merged — <strong>order is not guaranteed</strong> unless you use <code>concatMap</code></td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> If order matters, use <code>concatMap</code> instead of <code>flatMap</code> — it subscribes to inner sources sequentially.</p>",
            referenceLinks: [{ title: "RxJava flatMap", url: "https://reactivex.io/documentation/operators/flatmap.html" }],
            tags: ["rxjava", "flatmap", "map", "operators"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-rxjava-create-vs-fromcallable",
            importance: "good-to-know",
            question: "When to use Create operator and when to use fromCallable operator of RxJava?",
            answer: "<table><thead><tr><th>Aspect</th><th><code>Observable.create</code></th><th><code>Observable.fromCallable</code></th></tr></thead><tbody><tr><td>Emission model</td><td>Manual — you call <code>emitter.onNext()</code>/<code>onComplete()</code>/<code>onError()</code> yourself</td><td>Automatic — wraps a single <code>Callable</code>, its return value becomes the one emission</td></tr><tr><td>Use case</td><td>Wrapping callback-based APIs (e.g. a listener SDK) that can emit 0..N items over time</td><td>Wrapping a single blocking/synchronous computation, e.g. a DB read or file parse</td></tr><tr><td>Error safety</td><td>You must handle try/catch and emitter disposal manually</td><td>Exceptions thrown inside are automatically caught and routed to <code>onError</code></td></tr><tr><td>Laziness</td><td>Lazy — runs on subscribe</td><td>Lazy — runs on subscribe (unlike <code>Observable.just</code>, which evaluates eagerly)</td></tr></tbody></table><p><strong>✅ When to use</strong></p><ul><li>Use <code>fromCallable</code> whenever you just need to defer a single synchronous, possibly-throwing computation — it's simpler and safer.</li><li>Reach for <code>create</code> only when bridging a genuine event-driven/callback API into RxJava.</li></ul>",
            referenceLinks: [{ title: "RxJava Create", url: "https://reactivex.io/documentation/operators/create.html" }],
            tags: ["rxjava", "create", "fromcallable", "operators"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "fromCallable around a blocking call",
                code: "Observable.fromCallable {\n    database.userDao().getUserBlocking(id) // throws are auto-caught\n}\n    .subscribeOn(Schedulers.io())\n    .observeOn(AndroidSchedulers.mainThread())\n    .subscribe({ user -> render(user) }, { e -> showError(e) })",
                    output: {
                        kind: "trace",
                        lines: [
                            "fromCallable takes a lambda and does not run it — the work happens per subscription.",
                            "subscribeOn(Schedulers.io()) means that when a subscriber arrives, the lambda runs on an IO thread.",
                            "The blocking DAO call executes there. Nothing is blocked on the main thread.",
                            "The returned value is emitted, followed immediately by onComplete.",
                            "observeOn(mainThread()) moves the emission to the main thread for render.",
                            "If the DAO throws, fromCallable catches it and routes it to onError — no try/catch is written.",
                            "With Observable.create, that same throw would have escaped the emitter and crashed, unless the code called onError itself."
                        ],
                        explain: "<p>Step 6 against step 7 is the entire question. <code>fromCallable</code> handles the contract for you: exactly one value or one error, exception routing, and disposal. <code>create</code> hands you an emitter and trusts you to honour all of it — call <code>onNext</code> twice, forget <code>onComplete</code>, let an exception escape, and there is nothing to catch it.</p><p><code>create</code> earns its place when wrapping a genuine callback or listener API, where registration and unregistration have to be managed. For \"run this blocking thing\", <code>fromCallable</code> is both shorter and safer.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-defer",
            importance: "good-to-know",
            question: "When to use the defer operator of RxJava?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong><code>Observable.defer { }</code></strong> — creates a fresh Observable instance for <strong>each new subscriber</strong> at subscription time, rather than sharing one instance built once eagerly.</li></ul><p><strong>✅ When to use</strong></p><ul><li>When the Observable depends on state that can change between subscriptions — e.g. a query built from a variable that's mutated after the Observable was declared but before it's subscribed to.</li><li>Common pattern: caching/refreshing — decide dynamically at subscribe time whether to return cached data or hit the network.</li></ul><p><strong>⚖️ vs plain construction</strong></p><ul><li><code>Observable.just(getCurrentTime())</code> evaluates <code>getCurrentTime()</code> once, immediately, when the statement runs — every subscriber gets the same stale value.</li><li><code>Observable.defer { Observable.just(getCurrentTime()) }</code> re-evaluates the lambda on every subscription, so each subscriber gets a fresh, current value.</li></ul>",
            referenceLinks: [{ title: "RxJava Defer", url: "https://reactivex.io/documentation/operators/defer.html" }],
            tags: ["rxjava", "defer", "operators", "lazy"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "defer, and when the value is decided",
                code: "fun currentTimeObservable(): Observable<Long> =\n    Observable.defer {\n        Observable.just(System.currentTimeMillis())\n    }\n\nval obs = currentTimeObservable()\nThread.sleep(2000)\nobs.subscribe { t -> println(t) } // reflects time at subscribe, not declare",
                    output: {
                        kind: "trace",
                        lines: [
                            "currentTimeObservable() is called. Without defer, Observable.just would evaluate System.currentTimeMillis() right here, at declaration.",
                            "defer wraps it, so nothing is evaluated and the factory lambda is stored instead.",
                            "Two seconds pass. Nothing has been observed yet.",
                            "subscribe() runs, and only now does defer invoke the factory.",
                            "System.currentTimeMillis() is read at that moment, and the printed value reflects the subscribe time, not the declare time.",
                            "A second subscriber invokes the factory again and gets a different, newer value."
                        ],
                        explain: "<p>Step 1 is the trap in one line: <strong>arguments to <code>just</code> are evaluated eagerly</strong>, when the Observable is built, however long before subscription that is. An Observable that is supposed to read \"the current token\" or \"the current time\" and is built at startup will serve the startup value forever.</p><p>Step 6 is the other half: <code>defer</code> gives each subscriber its own fresh evaluation, which is what makes a deferred Observable safely reusable.</p><p>The Flow equivalent is the <code>flow { }</code> builder, which is cold for the same reason and by default.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-timer-delay-interval",
            importance: "good-to-know",
            question: "How are Timer, Delay, and Interval operators used in RxJava?",
            answer: "<table><thead><tr><th>Operator</th><th>Behavior</th></tr></thead><tbody><tr><td><code>Observable.timer(t, unit)</code></td><td>Emits a single <code>0L</code> after the given delay, then completes.</td></tr><tr><td><code>.delay(t, unit)</code></td><td>Delays each emission from an existing source by a fixed time, preserving items and order.</td></tr><tr><td><code>Observable.interval(t, unit)</code></td><td>Emits an incrementing <code>Long</code> (0, 1, 2...) repeatedly every <code>t</code> units, forever, until disposed.</td></tr></tbody></table><p><strong>✅ When to use</strong></p><ul><li><code>timer</code> — one-shot delayed action, e.g. splash screen navigation, debounce fallback.</li><li><code>delay</code> — throttling/staggering emissions from an existing stream, e.g. simulating network latency.</li><li><code>interval</code> — polling, e.g. periodic refresh of a dashboard every 30 seconds.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>All three run on <code>Schedulers.computation()</code> by default — always <code>observeOn(AndroidSchedulers.mainThread())</code> before touching UI.</li><li><code>interval</code> runs indefinitely — must be disposed (e.g. via <code>CompositeDisposable</code>) to avoid leaking.</li></ul>",
            referenceLinks: [{ title: "RxJava Timer", url: "https://reactivex.io/documentation/operators/timer.html" }],
            tags: ["rxjava", "timer", "interval", "delay"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-rxjava-parallel-calls",
            importance: "good-to-know",
            question: "How to make two network calls in parallel using RxJava?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Use the <strong><code>zip</code></strong> operator to run two (or more) Observables/Singles concurrently and combine their results once <strong>all</strong> have emitted.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Each source must have its own <code>subscribeOn(Schedulers.io())</code> so they actually run on separate threads concurrently rather than sequentially.</li><li><code>Single.zip(single1, single2) { r1, r2 -> combine(r1, r2) }</code> subscribes to both immediately; the combining function fires only once both have completed.</li><li>Alternative: <code>Observable.merge</code> if you don't need to wait for both to combine results, just want both streams interleaved.</li></ul>",
            referenceLinks: [{ title: "RxJava Zip", url: "https://reactivex.io/documentation/operators/zip.html" }],
            tags: ["rxjava", "zip", "parallel", "networking"],
            hasDiagram: true,
            diagramType: "sequence",
            diagramConfig: {
                title: "Parallel calls with zip",
                actors: ["ViewModel", "UserApi", "PostsApi"],
                messages: [
                    { from: 0, to: 1, label: "getUser()" },
                    { from: 0, to: 2, label: "getPosts()" },
                    { from: 1, to: 0, label: "User", dashed: true },
                    { from: 2, to: 0, label: "Posts", dashed: true }
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "zip for two concurrent calls",
                code: "Single.zip(\n    api.getUser(id).subscribeOn(Schedulers.io()),\n    api.getPosts(id).subscribeOn(Schedulers.io())\n) { user, posts -> UserProfile(user, posts) }\n    .observeOn(AndroidSchedulers.mainThread())\n    .subscribe({ profile -> render(profile) }, { e -> showError(e) })",
                    output: {
                        kind: "trace",
                        lines: [
                            "Both Singles are given subscribeOn(Schedulers.io()) individually — this is what makes them run in parallel.",
                            "zip subscribes to both at once, so both requests are in flight together.",
                            "Each completes on its own IO thread, in whatever order the network decides.",
                            "zip holds the first result until the second arrives.",
                            "With both in hand, the combining function builds one UserProfile.",
                            "observeOn moves that single result to the main thread.",
                            "If either call fails, zip propagates the error immediately and the other subscription is disposed."
                        ],
                        explain: "<p>Step 1 is the line that does the work, and the one most often missed. Putting a single <code>subscribeOn</code> after <code>zip</code> instead of on each source makes both calls share one thread and run <strong>sequentially</strong> — same code shape, none of the concurrency, and no visible symptom beyond being slow.</p><p>Step 4 is the semantics: <code>zip</code> waits for both, so the combined result arrives at the pace of the slower call rather than the sum of the two.</p><p>Step 7 is worth knowing for the failure case: one failure discards the other result even if it had already arrived.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-concat-vs-merge",
            importance: "good-to-know",
            question: "What is the difference between Concat and Merge in RxJava?",
            answer: "<table><thead><tr><th>Aspect</th><th><code>concat</code></th><th><code>merge</code></th></tr></thead><tbody><tr><td>Subscription order</td><td>Sequential — subscribes to the second source only after the first completes</td><td>Concurrent — subscribes to all sources immediately</td></tr><tr><td>Emission order</td><td>Strictly preserved — source A's items always before source B's</td><td>Interleaved based on whichever source emits first — not guaranteed order</td></tr><tr><td>Performance</td><td>Slower overall when sources are independent (waits for A to finish before starting B)</td><td>Faster wall-clock time since sources run concurrently</td></tr><tr><td>Use case</td><td>Order-dependent operations, e.g. write then read</td><td>Independent sources where only combined results matter, e.g. merging two live update streams</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> If asked to combine two independent async calls where order doesn't matter but you want both to start immediately, mention <code>merge</code>; if you need a paired result from both, mention <code>zip</code> instead.</p>",
            referenceLinks: [{ title: "RxJava Concat", url: "https://reactivex.io/documentation/operators/concat.html" }, { title: "RxJava Merge", url: "https://reactivex.io/documentation/operators/merge.html" }],
            tags: ["rxjava", "concat", "merge", "operators"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-rxjava-subject",
            importance: "should-know",
            question: "Explain Subject in RxJava.",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A <strong>Subject</strong> is both an <code>Observable</code> and an <code>Observer</code> at once — it can be subscribed to like a stream, and also manually fed values via <code>onNext()</code>, making it a bridge between imperative and reactive code. Subjects are <strong>hot</strong> — they emit regardless of whether anyone is subscribed.</li></ul><table><thead><tr><th>Type</th><th>Behavior</th></tr></thead><tbody><tr><td><code>PublishSubject</code></td><td>Emits only items pushed after subscription; late subscribers miss earlier ones.</td></tr><tr><td><code>BehaviorSubject</code></td><td>Replays the most recent item (or a seeded default) to new subscribers, then continues live.</td></tr><tr><td><code>ReplaySubject</code></td><td>Replays some or all historical items to every new subscriber.</td></tr><tr><td><code>AsyncSubject</code></td><td>Emits only the very last value, and only after <code>onComplete()</code> is called.</td></tr></tbody></table><p><strong>⚠️ Pitfalls</strong></p><ul><li>Subjects break some reactive guarantees (not thread-safe by default for concurrent <code>onNext</code> calls) — wrap with <code>toSerialized()</code> if multiple threads emit into it.</li></ul>",
            referenceLinks: [{ title: "RxJava Subject", url: "https://reactivex.io/documentation/subject.html" }],
            tags: ["rxjava", "subject", "hot-observable", "behaviorsubject"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "BehaviorSubject as a state holder",
                code: "class SearchViewModel {\n    private val querySubject = BehaviorSubject.createDefault(\"\")\n\n    fun onQueryChanged(query: String) = querySubject.onNext(query)\n\n    val results: Observable<List<Result>> = querySubject\n        .debounce(300, TimeUnit.MILLISECONDS)\n        .distinctUntilChanged()\n        .switchMap { q -> api.search(q).subscribeOn(Schedulers.io()) }\n}",
                    output: {
                        kind: "trace",
                        lines: [
                            "createDefault(\"\") gives the subject a current value immediately, before anything has been pushed into it.",
                            "A subscriber arriving at any time receives that current value first, then subsequent ones.",
                            "onQueryChanged pushes each keystroke in — the subject is both an observer and an observable.",
                            "debounce holds each value for 300ms and emits it only if nothing newer arrived.",
                            "distinctUntilChanged drops a query identical to the previous one.",
                            "switchMap starts the search, and CANCELS any search still in flight from an earlier query.",
                            "The subscriber therefore only ever receives results for the latest query."
                        ],
                        explain: "<p>Step 1 and 2 are what make <code>BehaviorSubject</code> the state-shaped one. <code>PublishSubject</code> has no current value, so a late subscriber sees nothing until the next emission — fine for events, wrong for state. This is the same distinction as <code>StateFlow</code> against <code>SharedFlow</code>, and <code>BehaviorSubject</code> is the direct ancestor of <code>StateFlow</code>.</p><p>Step 6 is the correctness guarantee: without <code>switchMap</code>, a slow response for an earlier query can land last and overwrite the right results.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-observable-types",
            importance: "should-know",
            question: "What are the types of Observables in RxJava?",
            answer: "<table><thead><tr><th>Type</th><th>Emits</th><th>Use case</th></tr></thead><tbody><tr><td><code>Observable&lt;T&gt;</code></td><td>0..N items, then complete/error, no backpressure support</td><td>General streams, UI events</td></tr><tr><td><code>Flowable&lt;T&gt;</code></td><td>0..N items with <strong>backpressure</strong> support</td><td>High-frequency sources (sensors, DB cursors) where consumer may be slower than producer</td></tr><tr><td><code>Single&lt;T&gt;</code></td><td>Exactly 1 item or an error</td><td>One-shot async results, e.g. a network response</td></tr><tr><td><code>Maybe&lt;T&gt;</code></td><td>0 or 1 item, or an error</td><td>Optional results, e.g. a cache lookup that might miss</td></tr><tr><td><code>Completable</code></td><td>No items — only completion or error</td><td>Fire-and-forget async work, e.g. writing to disk</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> Picking the narrowest type that matches your semantics (e.g. <code>Single</code> for a network call instead of <code>Observable</code>) communicates intent and avoids unnecessary null/empty handling.</p>",
            referenceLinks: [{ title: "ReactiveX Observable types", url: "https://reactivex.io/documentation/observable.html" }],
            tags: ["rxjava", "observable", "single", "flowable", "maybe", "completable"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "android-rxjava-search",
            importance: "should-know",
            question: "How to implement search feature using RxJava?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A reactive search bar chains operators to turn raw keystrokes into throttled, deduplicated, cancel-safe network queries.</li></ul><p><strong>⚙️ Typical operator chain</strong></p><ul><li><code>debounce(300ms)</code> — wait for the user to pause typing before firing a query, avoiding a request per keystroke.</li><li><code>distinctUntilChanged()</code> — skip re-querying if the text is unchanged (e.g. a debounce firing after a delete-then-retype-same-text).</li><li><code>switchMap { query -> api.search(query) }</code> — cancels the previous in-flight request when a new query arrives, so stale responses never race ahead of fresh ones.</li><li><code>filter { it.length >= 2 }</code> — skip querying on empty/too-short input.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Using <code>flatMap</code> instead of <code>switchMap</code> is a common bug — it lets multiple requests run concurrently and a slow earlier response can overwrite a newer one.</li></ul>",
            referenceLinks: [{ title: "RxJava switchMap", url: "https://reactivex.io/documentation/operators/flatmap.html" }],
            tags: ["rxjava", "search", "debounce", "switchmap"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Reactive search with debounce and switchMap",
                code: "val searchSubject = PublishSubject.create<String>()\n\nsearchSubject\n    .debounce(300, TimeUnit.MILLISECONDS)\n    .distinctUntilChanged()\n    .filter { it.length >= 2 }\n    .switchMap { query ->\n        api.search(query)\n            .subscribeOn(Schedulers.io())\n            .onErrorReturn { emptyList() }\n    }\n    .observeOn(AndroidSchedulers.mainThread())\n    .subscribe { results -> adapter.submitList(results) }\n\nfun onSearchTextChanged(text: String) = searchSubject.onNext(text)",
                    output: {
                        kind: "trace",
                        lines: [
                            "Each keystroke calls onNext on a PublishSubject.",
                            "debounce(300ms) waits for a pause, so a burst of typing produces one value rather than one per character.",
                            "distinctUntilChanged drops a repeat of the previous query — what typing a character and deleting it produces.",
                            "filter discards queries under two characters.",
                            "switchMap starts the search for whatever survived, and disposes the previous search if it is still running.",
                            "onErrorReturn inside the switchMap returns an empty list for a failed search.",
                            "observeOn moves the results to the main thread and the adapter is updated."
                        ],
                        explain: "<p>Step 6 is placed where it is on purpose, and this is the detail worth taking away. <code>onErrorReturn</code> is <strong>inside</strong> the <code>switchMap</code>, so a failure ends that inner search only. Placed on the outer chain instead, the error would terminate the whole subscription — the search box would stop responding to typing entirely after one failed request, which is a bug that only shows up on a bad connection.</p><p>Steps 2 to 4 exist to avoid making requests; step 5 exists to make sure stale ones cannot win.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-pagination",
            importance: "should-know",
            question: "How to implement pagination in RecyclerView using RxJava?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Drive a page-request stream that increments a page counter and triggers a network fetch each time the user scrolls near the end of the current list.</li></ul><p><strong>⚙️ Typical approach</strong></p><ul><li>A <code>RecyclerView.OnScrollListener</code> detects when the last visible item index is within a threshold of the adapter's item count, and pushes the next page number into a <code>PublishSubject&lt;Int&gt;</code>.</li><li><code>concatMap</code> (not <code>flatMap</code>) processes page requests in strict order so pages don't arrive out of sequence.</li><li>A loading flag/<code>BehaviorSubject&lt;Boolean&gt;</code> guards against firing a new page request while one is still in flight.</li><li>Results are appended to the existing list (<code>scan</code> operator or manual accumulation) and submitted to the adapter.</li></ul>",
            referenceLinks: [{ title: "Paging with RecyclerView", url: "https://developer.android.com/topic/libraries/architecture/paging/v3-overview" }],
            tags: ["rxjava", "pagination", "recyclerview", "concatmap"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Infinite scroll with concatMap and scan",
                code: "val pageRequests = PublishSubject.create<Int>()\nvar isLoading = false\n\npageRequests\n    .filter { !isLoading }\n    .doOnNext { isLoading = true }\n    .concatMap { page ->\n        api.getItems(page)\n            .subscribeOn(Schedulers.io())\n            .doFinally { isLoading = false }\n    }\n    .scan(emptyList<Item>()) { acc, page -> acc + page }\n    .observeOn(AndroidSchedulers.mainThread())\n    .subscribe { items -> adapter.submitList(items) }\n\nrecyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {\n    override fun onScrolled(rv: RecyclerView, dx: Int, dy: Int) {\n        val lm = rv.layoutManager as LinearLayoutManager\n        if (lm.findLastVisibleItemPosition() >= adapter.itemCount - 5) {\n            pageRequests.onNext(currentPage++)\n        }\n    }\n})",
                    output: {
                        kind: "trace",
                        lines: [
                            "The scroll listener pushes the next page number into a PublishSubject.",
                            "filter { !isLoading } drops requests that arrive while one is already running.",
                            "doOnNext sets the flag, and doFinally clears it whether the request succeeded or failed.",
                            "concatMap — not flatMap — runs the requests one at a time, in order.",
                            "That ordering is what keeps pages appended correctly; flatMap could deliver page 3 before page 2.",
                            "scan accumulates: it holds the list so far and emits the previous list plus the new page.",
                            "The adapter receives the full list each time, so the UI never has to track offsets."
                        ],
                        explain: "<p>Steps 4 and 5 are the answer to \"why not <code>flatMap</code>\". <code>flatMap</code> runs the requests concurrently and emits in completion order, so a slow page 2 lands after page 3 and the list is silently out of order. <code>concatMap</code> trades a little latency for correct sequence, which is the right trade for pagination.</p><p>Step 6 is the neat part: <code>scan</code> is a running fold, so the accumulated list lives in the stream rather than in a mutable field beside it.</p><p>The <code>isLoading</code> flag is the weak point — a mutable variable read and written from the stream, which is exactly the shared state Rx is supposed to remove. Paging 3 exists because all of this is harder to get right than it looks.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-glide-fresco",
            importance: "must-know",
            question: "How do Android Image Loading Libraries (Glide, Fresco) work?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Image loading libraries handle async download, decoding, memory-efficient caching, resizing, and lifecycle-aware cancellation for images so apps avoid <code>OutOfMemoryError</code>s and jank.</li></ul><p><strong>⚙️ How Glide works</strong></p><ul><li>Three-tier caching: <strong>active resources</strong> (in-use bitmaps), an <strong>in-memory LRU cache</strong>, and a <strong>disk cache</strong> (encoded and/or transformed variants).</li><li>Ties requests to a <code>Lifecycle</code> (Activity/Fragment) via <code>Glide.with(context)</code>, automatically pausing/clearing/resuming loads with lifecycle events to avoid leaks and wasted work.</li><li>Decodes images downsampled to the target <code>ImageView</code>'s dimensions to minimize memory footprint (<code>BitmapFactory.Options.inSampleSize</code> under the hood).</li><li>Supports transformations (<code>CenterCrop</code>, <code>RoundedCorners</code>), placeholder/error drawables, and request prioritization/thumbnailing.</li></ul><p><strong>⚙️ How Fresco differs</strong></p><ul><li>Uses <code>SimpleDraweeView</code> and, on older Android versions, stored decoded bitmaps in a special ashmem region <strong>outside</strong> the regular Java heap to reduce GC pressure and OOMs — its main historical differentiator (less critical since Android moved to a better GC).</li></ul><p><strong>⚖️ Glide vs Fresco vs Coil</strong></p><ul><li><strong>Coil</strong> is the modern Kotlin-first, coroutine-based alternative, smaller and simpler, now often preferred for new Compose-based apps.</li></ul>",
            referenceLinks: [{ title: "Glide", url: "https://bumptech.github.io/glide/" }, { title: "Fresco", url: "https://frescolib.org/" }],
            tags: ["glide", "fresco", "coil", "image-loading"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "A Glide request, end to end",
                code: "Glide.with(imageView.context)\n    .load(user.avatarUrl)\n    .placeholder(R.drawable.avatar_placeholder)\n    .error(R.drawable.avatar_error)\n    .transform(CenterCrop(), RoundedCorners(16))\n    .diskCacheStrategy(DiskCacheStrategy.ALL)\n    .into(imageView)",
                    output: {
                        kind: "trace",
                        lines: [
                            "Glide.with(context) binds the request to that context's lifecycle — an Activity or Fragment.",
                            "The placeholder is shown immediately, so the row never renders empty.",
                            "Glide checks the active resources, then the memory cache, then the disk cache, then the network.",
                            "The cache key includes the transformations, so a CenterCrop + RoundedCorners version is cached separately from the original.",
                            "On a hit at any level the bitmap is set and no further work happens.",
                            "The transformations are applied on a background thread, and the result is set on the ImageView.",
                            "If the Activity is destroyed while the request is in flight, Glide cancels it — because of step 1 — and the ImageView is cleared."
                        ],
                        explain: "<p>Steps 1 and 7 are why <code>Glide.with</code> takes a context rather than being a static call. That context is how Glide knows to pause requests when the screen goes away and cancel them when it is destroyed, which is what makes it safe to call from <code>onBindViewHolder</code> without any cancellation code.</p><p>Step 4 explains a common surprise: two <code>ImageView</code>s loading the same URL with different transformations produce two cache entries and two decodes.</p><p><code>DiskCacheStrategy.ALL</code> stores both the original and the transformed result — good for a URL displayed at several sizes, wasteful when there is only ever one.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "android-rxjava-schedulers-io-vs-computation",
            importance: "should-know",
            question: "What is the difference between Schedulers.io() and Schedulers.computation() in RxJava?",
            answer: "<table><thead><tr><th>Aspect</th><th><code>Schedulers.io()</code></th><th><code>Schedulers.computation()</code></th></tr></thead><tbody><tr><td>Thread pool</td><td>Unbounded, elastic, grows/shrinks and caches idle threads</td><td>Fixed size, capped to number of available CPU cores</td></tr><tr><td>Intended for</td><td>Blocking I/O — network calls, disk/file access, database queries</td><td>CPU-intensive work — sorting, parsing, math-heavy transforms</td></tr><tr><td>Why the difference matters</td><td>I/O work spends most time waiting, so many concurrent threads is fine</td><td>Too many threads for CPU-bound work causes context-switch overhead with no throughput gain</td></tr></tbody></table><p><strong>⚠️ Pitfalls</strong></p><ul><li>Running blocking I/O on <code>computation()</code> can starve the small fixed pool and stall unrelated CPU-bound work elsewhere in the app.</li><li>Running heavy CPU work on <code>io()</code> can spawn excessive threads and hurt overall throughput.</li></ul><p><strong>🎯 Interview tip:</strong> There's also <code>Schedulers.single()</code> (one thread, sequential tasks) and <code>Schedulers.newThread()</code> (always a fresh thread, rarely recommended) — mention them if pressed further.</p>",
            referenceLinks: [{ title: "RxJava Schedulers", url: "https://reactivex.io/documentation/scheduler.html" }],
            tags: ["rxjava", "schedulers", "threading", "io", "computation"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        }
    ]
};
