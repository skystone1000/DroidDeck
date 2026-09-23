/* ==========================================================================
   M37 — Design patterns in Android.

   Every pattern here is taught through a class from the framework or a
   library the reader already uses, because "what is the Builder pattern?"
   answered with Notification.Builder lands, and answered with a Pizza
   example does not.

   Note: there is no first-party hub for GoF patterns, so the docHub points
   at the architecture recommendations — the closest first-party page, per
   the documentation policy's first-party rule.
   ========================================================================== */

const designPatternsModule = {
    id: 'design-patterns',
    trackId: 'architecture',
    order: 37,
    title: 'Design Patterns in Android',
    tagline: 'You already use most of them; the interview wants the names.',
    estimatedMinutes: 30,
    prerequisites: ['architecture-principles'],
    docHub: {
        title: 'Architecture recommendations',
        path: '/topic/architecture/recommendations'
    },

    chapters: [
        {
            id: 'creational',
            title: 'Creational patterns',
            importance: 'should-know',
            summary: 'Singleton, Factory and Builder — and Kotlin makes two of the three nearly disappear.',
            interviewAngle: 'The good answer to "what is the Builder pattern?" ends with why Kotlin usually does not need it.',
            buildsOn: [],
            blocks: [
                {
                    type: 'types',
                    title: 'The three you will be asked about',
                    items: [
                        {
                            name: 'Singleton',
                            html: '<p>One instance, globally reachable. Kotlin’s <code>object</code> is one, thread-safely and lazily, with no double-checked locking to get wrong. In Android: <code>Room</code>’s database instance, one <code>OkHttpClient</code> (M28).</p>'
                        },
                        {
                            name: 'Factory',
                            html: '<p>Creation behind a function, so the caller does not name a concrete class. In Android: <code>ViewModelProvider.Factory</code> (M33), <code>LayoutInflater.from</code>, <code>Retrofit.create</code>.</p>'
                        },
                        {
                            name: 'Builder',
                            html: '<p>Step-by-step construction of an object with many optional parts, ending in <code>build()</code>. In Android: <code>NotificationCompat.Builder</code>, <code>AlertDialog.Builder</code>, <code>OkHttpClient.Builder</code>, <code>Retrofit.Builder</code>.</p>'
                        }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Builder versus Kotlin default arguments',
                    left: 'Builder',
                    right: 'Named and default arguments',
                    rows: [
                        { aspect: 'Solves', left: 'Telescoping constructors', right: 'The same problem' },
                        { aspect: 'Code required', left: 'A whole class', right: 'None' },
                        { aspect: 'Required fields', left: 'Checked at runtime in <code>build()</code>', right: 'Checked by the compiler' },
                        { aspect: 'Still needed for', left: 'Java callers, staged construction, DSLs', right: '—' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>That last row is the honest part of the answer. Builders survive in Android because the APIs are Java-first and Java has no default arguments — and because some construction is genuinely staged, where later options depend on earlier ones. For new Kotlin-only code, named arguments with defaults do the job with no class at all.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Singleton is the pattern most often misused. It is global mutable state with a friendlier name: it makes tests order-dependent, hides dependencies (the service-locator problem from M36), and on Android it lives per-process, so an app with a second process gets two. Prefer a single <em>instance</em> managed by DI over a global <em>access point</em>.</p>'
                }
            ],
            docs: [
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'Object declarations and expressions', url: 'https://kotlinlang.org/docs/object-declarations.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'design-pattern', questionId: 'design-pattern-singleton' },
                { topicId: 'design-pattern', questionId: 'design-pattern-factory' },
                { topicId: 'design-pattern', questionId: 'design-pattern-builder' },
                { topicId: 'design-pattern', questionId: 'design-pattern-kotlin-optional-vs-builder' },
                { topicId: 'design-pattern', questionId: 'design-pattern-retrofit' }
            ]
        },

        {
            id: 'structural-and-behavioural',
            title: 'Structural and behavioural patterns',
            importance: 'should-know',
            summary: 'Adapter, Decorator, Facade — then Observer, Strategy, Command and State.',
            interviewAngle: 'Naming the Android class that implements each is what turns a definition into an answer.',
            buildsOn: ['creational'],
            blocks: [
                {
                    type: 'table',
                    title: 'Structural — how objects are composed',
                    headers: ['Pattern', 'Does', 'In Android'],
                    rows: [
                        ['Adapter', 'Makes one interface usable as another', '<code>RecyclerView.Adapter</code> (M25) — data to views'],
                        ['Decorator', 'Wraps an object to add behaviour', 'OkHttp interceptors (M28); <code>ContextWrapper</code>'],
                        ['Facade', 'One simple face over a complex subsystem', 'Retrofit over OkHttp; a repository over its sources'],
                        ['Proxy', 'A stand-in controlling access', 'A Binder proxy across processes (M15)'],
                        ['Composite', 'Treat a tree like a single object', '<code>ViewGroup</code> — a View that contains Views']
                    ]
                },
                {
                    type: 'table',
                    title: 'Behavioural — how objects interact',
                    headers: ['Pattern', 'Does', 'In Android'],
                    rows: [
                        ['Observer', 'Notify subscribers of change', '<code>StateFlow</code>, <code>LiveData</code>, click listeners'],
                        ['Strategy', 'Interchangeable algorithms behind one interface', '<code>LayoutManager</code>; an <code>Interpolator</code>'],
                        ['Command', 'An action as an object, run later', '<code>Runnable</code> on a <code>Handler</code> (M7); a <code>WorkRequest</code>'],
                        ['State', 'Behaviour changes with internal state', 'A sealed UI state and its <code>when</code> (M34)'],
                        ['Template method', 'A fixed skeleton, overridable steps', 'The <code>Activity</code> lifecycle callbacks (M13)']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Observer is the one worth expanding, because it is everywhere and because the modern version fixed its historic flaw. A raw listener has no lifecycle, so an observer registered and never removed leaks its subscriber (M16). <code>LiveData</code> made observation lifecycle-aware; <code>Flow</code> collected in <code>repeatOnLifecycle</code> or <code>collectAsStateWithLifecycle</code> does the same with cancellation (M11).</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Libraries make good short answers because they combine several visibly. Retrofit is a Facade over OkHttp, a Builder for configuration, a Factory in <code>create</code>, and a Proxy for the generated interface. Glide is a Builder for the request, a Facade over decoding and caching, a Strategy for the transformation, and an object pool for bitmaps.</p>'
                }
            ],
            docs: [
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'design-pattern', questionId: 'design-pattern-adapter' },
                { topicId: 'design-pattern', questionId: 'design-pattern-facade' },
                { topicId: 'design-pattern', questionId: 'design-pattern-observer' },
                { topicId: 'design-pattern', questionId: 'design-pattern-observer-android-examples' },
                { topicId: 'design-pattern', questionId: 'design-pattern-strategy' },
                { topicId: 'design-pattern', questionId: 'design-pattern-android-common' },
                { topicId: 'design-pattern', questionId: 'design-pattern-glide' },
                { topicId: 'design-pattern', questionId: 'design-pattern-aosp' }
            ]
        },

        {
            id: 'anti-patterns',
            title: 'Patterns applied badly',
            importance: 'should-know',
            summary: 'A pattern used without its problem is just indirection you now maintain.',
            interviewAngle: 'Being able to criticise a pattern you use is a stronger signal than being able to list ten.',
            buildsOn: ['structural-and-behavioural'],
            blocks: [
                {
                    type: 'types',
                    title: 'The ones that actually appear in Android codebases',
                    items: [
                        {
                            name: 'The God Activity',
                            html: '<p>One class doing networking, parsing, caching, formatting and rendering. Fails M32’s single responsibility on every count, and is the direct consequence of MVC’s bad fit for the platform (M35).</p>'
                        },
                        {
                            name: 'Singleton soup',
                            html: '<p>Every collaborator reachable as <code>Something.getInstance()</code>. Nothing declares its dependencies, tests share state and run order matters, and the fix is M36’s injection rather than a better singleton.</p>'
                        },
                        {
                            name: 'Leaking observers',
                            html: '<p>Registered in <code>onCreate</code>, never unregistered; or observed with <code>this</code> instead of <code>viewLifecycleOwner</code> (M14). The pairing rule from M13 is the general fix.</p>'
                        },
                        {
                            name: 'Cargo-cult Repository',
                            html: '<p>A repository per API endpoint that maps nothing and decides nothing, plus an interface with one implementation. The pattern is for choosing between sources (M26); without that choice it is a file.</p>'
                        },
                        {
                            name: 'A ViewModel per widget',
                            html: '<p>Following "everything stateful is a ViewModel" past the point it helps. Scroll position and expansion belong in a plain state holder (M33).</p>'
                        },
                        {
                            name: 'Premature interfaces',
                            html: '<p>An interface for every class on the grounds that it is good practice. It earns its place when there is a second implementation — a fake counts — or a boundary to defend.</p>'
                        }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The shared shape is applying a solution without its problem. Every pattern is a trade — indirection bought with flexibility — and when the flexibility is never used the trade was a loss. That is why the useful interview move is to name the problem a pattern solves before naming the pattern.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>If asked which patterns you use, answer with two or three you can defend and one you have stopped using and why. <em>"Repository, because we read from Room and the network and something has to decide; and we dropped a use-case layer that only forwarded calls."</em> That reads as judgement; a list of ten reads as revision.</p>'
                }
            ],
            docs: [
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'Data layer', path: '/topic/architecture/data-layer', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'design-pattern', questionId: 'design-pattern-repository' },
                { topicId: 'other-topics', questionId: 'android-development-best-practices' },
                { topicId: 'android', questionId: 'android-find-memory-leaks' }
            ]
        }
    ]
};
