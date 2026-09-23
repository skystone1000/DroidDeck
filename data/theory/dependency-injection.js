/* ==========================================================================
   M36 — Dependency injection.

   The pattern before the library, because "what is DI?" and "how does Dagger
   work?" are different questions and candidates routinely answer the first
   with the second.
   ========================================================================== */

const dependencyInjectionModule = {
    id: 'dependency-injection',
    trackId: 'architecture',
    order: 36,
    title: 'Dependency Injection',
    tagline: 'Take what you need; do not go and find it.',
    estimatedMinutes: 30,
    prerequisites: ['architecture-principles'],
    docHub: {
        title: 'Dependency injection in Android',
        path: '/training/dependency-injection'
    },

    chapters: [
        {
            id: 'di-as-a-pattern',
            title: 'The pattern, before any library',
            importance: 'must-know',
            summary: 'A class receives its dependencies instead of constructing or locating them.',
            interviewAngle: '"What is dependency injection?" — answer the pattern, not Dagger. Then say what it buys.',
            buildsOn: [],
            blocks: [
                {
                    type: 'definition',
                    term: 'Dependency injection',
                    important: true,
                    html: '<p>A class declares what it needs and is given it from outside, rather than creating it or looking it up. That is the whole pattern — no framework is required, and constructor parameters are the purest form of it.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The same class, three ways',
                    code: `// 1 — constructing its own dependency. Untestable: there is no seam.
class ProfileViewModel : ViewModel() {
    private val users = RoomUserRepository(AppDatabase.getInstance())
}

// 2 — service locator. A seam exists, but it is hidden inside the class,
//     and the dependency is invisible from the outside.
class ProfileViewModel : ViewModel() {
    private val users = ServiceLocator.get<UserRepository>()
}

// 3 — dependency injection. The needs are in the signature, so the compiler
//     enforces them and a test supplies whatever it likes.
class ProfileViewModel(private val users: UserRepository) : ViewModel()`,
                    notes: 'The difference between 2 and 3 is who reads the dependency list. With a locator only the class knows; with injection the caller, the compiler and the reader all do.'
                },
                {
                    type: 'types',
                    title: 'What it actually buys',
                    items: [
                        { name: 'Testability', html: '<p>Swap the real repository for a fake with no framework and no device — the reason M32’s dependency inversion is worth anything in practice.</p>' },
                        { name: 'Honest signatures', html: '<p>A constructor with eight parameters is telling you the class does too much. A service locator hides that same fact.</p>' },
                        { name: 'Lifetime control', html: '<p>One instance of the database, one <code>OkHttpClient</code> (M28), a new <code>ViewModel</code> per screen. Deciding this in one place is most of what a DI framework is for.</p>' },
                        { name: 'Not: less code', html: '<p>DI adds wiring. What it buys is that the wiring is in one place and checked, rather than scattered through constructors.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Manual DI works, and works for longer than people expect: a container object built in <code>Application</code>, holding the singletons, passed down. It stops scaling for specific reasons — every new dependency edits the container and every constructor between the owner and the user, scopes become manual bookkeeping, and in a multi-module app the container has to know about every module, which is precisely the coupling modularisation was meant to remove.</p>'
                }
            ],
            docs: [
                { title: 'Dependency injection in Android', path: '/training/dependency-injection', kind: 'guide' },
                { title: 'Manual dependency injection', path: '/training/dependency-injection/manual', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'design-pattern', questionId: 'design-pattern-dependency-injection' },
                { topicId: 'java', questionId: 'dependency-injection-in-java' },
                { topicId: 'android-libraries', questionId: 'android-dagger-why' }
            ]
        },

        {
            id: 'hilt',
            title: 'Hilt and the generated graph',
            importance: 'must-know',
            summary: 'Dagger with Android’s components pre-defined, checked at compile time.',
            interviewAngle: '"How does Dagger work internally?" — annotation processing that generates the factories you would have written.',
            buildsOn: ['di-as-a-pattern'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Dagger reads your annotations at compile time and generates the code you would otherwise write by hand: a factory per injectable type, and a component that wires them together. Nothing is resolved by reflection at runtime — which is why a missing binding is a <strong>build error</strong> rather than a crash, and why startup cost is essentially zero.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Hilt is Dagger with the Android parts already decided. Dagger asks you to define components and their lifetimes; Hilt ships a standard set — <code>SingletonComponent</code>, <code>ActivityRetainedComponent</code>, <code>ViewModelComponent</code>, <code>ActivityComponent</code> and so on — already attached to the right lifecycles, which removes most of the boilerplate that gave Dagger its reputation.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The annotations that come up',
                    code: `@HiltAndroidApp                       // generates the root component
class DeckApplication : Application()

// @Inject on a constructor: Hilt now knows how to build it.
class RoomUserRepository @Inject constructor(
    private val dao: UserDao
) : UserRepository

@Module
@InstallIn(SingletonComponent::class)   // the scope this module belongs to
abstract class DataModule {

    // @Binds: "when someone asks for the interface, give them this impl."
    // Abstract, so nothing is generated beyond the mapping — cheaper.
    @Binds
    abstract fun bindUserRepository(impl: RoomUserRepository): UserRepository

    companion object {
        // @Provides: for types you cannot annotate — third-party or built.
        @Provides
        @Singleton
        fun database(@ApplicationContext ctx: Context): AppDatabase =
            Room.databaseBuilder(ctx, AppDatabase::class.java, "app.db").build()
    }
}

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val users: UserRepository
) : ViewModel()

@AndroidEntryPoint                      // injection into a framework class
class ProfileActivity : ComponentActivity()`,
                    notes: '<code>@Binds</code> where you own the class and it needs no construction logic; <code>@Provides</code> where you must build the object yourself. Preferring <code>@Binds</code> generates less code.'
                },
                {
                    type: 'table',
                    title: 'Scopes, and what each one’s lifetime is',
                    headers: ['Annotation', 'Component', 'One instance per', 'Typical'],
                    rows: [
                        ['@Singleton', 'SingletonComponent', 'The application', 'Database, OkHttpClient'],
                        ['@ActivityRetainedScoped', 'ActivityRetainedComponent', 'Activity, across rotation', 'Shared per-screen state'],
                        ['@ViewModelScoped', 'ViewModelComponent', 'A ViewModel', 'A use case with state'],
                        ['@ActivityScoped', 'ActivityComponent', 'An activity instance', 'Anything needing an activity'],
                        ['(none)', 'any', 'Every request', 'The default — prefer it']
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Unscoped is the right default, and scoping everything is the common overcorrection. A scope means "keep this alive as long as the component", so a <code>@Singleton</code> holding a <code>ViewModel</code>’s worth of state keeps it for the life of the process — and a scoped binding that transitively holds an <code>Activity</code> is the M16 leak with a DI graph attached.</p>'
                },
                {
                    type: 'types',
                    title: 'Errors you will actually see',
                    items: [
                        { name: '"cannot be provided without an @Provides-annotated method"', html: '<p>Nothing tells Hilt how to build the type. Add <code>@Inject</code> to its constructor, or a binding in a module.</p>' },
                        { name: '"@Singleton may not reference bindings with different scopes"', html: '<p>A longer-lived object depends on a shorter-lived one. The dependency direction is wrong, and the error is Dagger catching a leak at compile time.</p>' },
                        { name: 'A dependency cycle', html: '<p>A needs B needs A. Break it by extracting the shared part, or with <code>Lazy&lt;T&gt;</code> / <code>Provider&lt;T&gt;</code> to defer one side.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Dependency injection with Hilt', path: '/training/dependency-injection/hilt-android', kind: 'guide' },
                { title: 'Hilt and Jetpack integrations', path: '/training/dependency-injection/hilt-jetpack', kind: 'guide' },
                { title: 'Hilt and Dagger annotations cheat sheet', path: '/training/dependency-injection/hilt-cheatsheet', kind: 'guide' },
                { title: 'Dagger basics', path: '/training/dependency-injection/dagger-basics', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-libraries', questionId: 'android-dagger-annotations' },
                { topicId: 'android-libraries', questionId: 'android-dagger-how-works' },
                { topicId: 'android-libraries', questionId: 'android-dagger-component' },
                { topicId: 'android-libraries', questionId: 'android-dagger-module' },
                { topicId: 'android-libraries', questionId: 'android-dagger-custom-scope' },
                { topicId: 'android-libraries', questionId: 'android-dagger-vs-hilt' }
            ]
        },

        {
            id: 'scaling-and-alternatives',
            title: 'Multi-module Hilt, and the alternatives',
            importance: 'should-know',
            summary: 'Compile-time graphs cost build time and repay it in certainty.',
            interviewAngle: 'Hilt versus Koin is a fair question with a real trade-off. State it as a trade, not a verdict.',
            buildsOn: ['hilt'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>In a multi-module app (M38) Hilt’s components are still assembled in the app module, and each feature module contributes its own <code>@Module</code>s with <code>@InstallIn</code>. The pattern that keeps modules independent is the M32 one: a feature depends on an <em>interface</em> from a core module, and the implementation is bound wherever it lives, so nothing has to depend on anything concrete.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Hilt versus Koin',
                    left: 'Hilt (Dagger)',
                    right: 'Koin',
                    rows: [
                        { aspect: 'Resolves', left: 'At compile time', right: 'At runtime' },
                        { aspect: 'A missing binding is', left: 'A build failure', right: 'A crash, when that screen opens' },
                        { aspect: 'Build time', left: 'Higher — annotation processing', right: 'Effectively none' },
                        { aspect: 'Startup cost', left: 'Negligible', right: 'Small; grows with the graph' },
                        { aspect: 'Learning curve', left: 'Steeper; errors are cryptic', right: 'Gentle — it is a Kotlin DSL' },
                        { aspect: 'Suits', left: 'Large or multi-module apps', right: 'Smaller apps; KMP-friendly' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The honest summary is that the axis is <em>when you find out</em>. Hilt spends build time to guarantee the graph is complete before the app runs; Koin spends nothing and tells you on the device. On a large app with many contributors that guarantee is worth real money; on a small one the build-time cost is the more visible number.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Two details worth having ready. Hilt supports testing directly — <code>@HiltAndroidTest</code> with <code>@UninstallModules</code> replaces a real binding with a fake for one test, which is the whole payoff of M32’s inversion arriving at once. And <code>@EntryPoint</code> exists for classes Hilt cannot inject into, such as a <code>ContentProvider</code> or a third-party-instantiated class, which is the standard answer to "what if I cannot use <code>@AndroidEntryPoint</code>?"</p>'
                }
            ],
            docs: [
                { title: 'Hilt in multi-module apps', path: '/training/dependency-injection/hilt-multi-module', kind: 'guide' },
                { title: 'Hilt testing guide', path: '/training/dependency-injection/hilt-testing', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-libraries', questionId: 'android-dagger-vs-hilt' },
                { topicId: 'android-architecture', questionId: 'arch-multi-module-benefits' }
            ]
        }
    ]
};
