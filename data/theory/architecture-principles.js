/* ==========================================================================
   M32 — Architecture principles and layers.

   SOLID is taught here rather than in the Java track on purpose. Each
   principle is easier to believe when it is attached to a decision you have
   already made — a repository interface, a sealed UI state — than when it is
   five acronyms with shape examples.
   ========================================================================== */

const architecturePrinciplesModule = {
    id: 'architecture-principles',
    trackId: 'architecture',
    order: 32,
    title: 'Architecture Principles and Layers',
    tagline: 'Dependencies point inward, and data flows one way.',
    estimatedMinutes: 35,
    prerequisites: ['data-layer'],
    docHub: {
        title: 'Guide to app architecture',
        path: '/topic/architecture'
    },

    chapters: [
        {
            id: 'principles-and-layers',
            title: 'The principles, and the three layers',
            importance: 'must-know',
            summary: 'Separation of concerns, UI driven from data, one source of truth, and data flowing one way.',
            interviewAngle: '"Describe your app’s architecture" is the most common senior opener. Have layers and a dependency rule ready.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Google’s guidance is four principles, and they are not independent — each one is what makes the next possible. Separating concerns is what lets the UI be driven from data; driving the UI from data is what makes a single source of truth meaningful; a single source of truth is what makes one-way data flow enforceable.</p>'
                },
                {
                    type: 'types',
                    title: 'The four principles',
                    items: [
                        { name: 'Separation of concerns', html: '<p>Activities and fragments are the operating system’s classes, not yours — they can be destroyed at any time and you do not control their lifecycle. Put as little logic in them as possible.</p>' },
                        { name: 'Drive the UI from data models', html: '<p>Preferably persistent ones. Data models are independent of the view hierarchy, so they survive the destruction the platform inflicts and can be tested with no device involved.</p>' },
                        { name: 'Single source of truth', html: '<p>One owner per piece of data, which is the M26 rule applied to the whole app rather than to one repository.</p>' },
                        { name: 'Unidirectional data flow', html: '<p>State flows down, events flow up. The layer that owns state is the only layer that changes it.</p>' }
                    ]
                },
                {
                    type: 'table',
                    title: 'The three layers',
                    headers: ['Layer', 'Owns', 'Knows about', 'Never knows about'],
                    rows: [
                        ['UI', 'Rendering, user input', 'The layers below it', 'Room, Retrofit, the network'],
                        ['Domain (optional)', 'Business rules and use cases', 'The data layer', 'Anything about the UI'],
                        ['Data', 'Application data and its origins', 'Nothing above it', 'ViewModels, screens, navigation']
                    ]
                },
                {
                    type: 'definition',
                    term: 'The dependency rule',
                    important: true,
                    html: '<p>Dependencies point in one direction only — inward, from UI toward data. A lower layer never imports a type from a higher one, and never holds a reference to it. Everything else in this module is a consequence of that one constraint.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The rule is what makes the layers worth having. Because the data layer knows nothing about the UI, it can be tested on the JVM with no Android at all; because the UI knows nothing about Retrofit, swapping the backend does not touch a screen. When someone says an architecture "did not help", the dependency rule is almost always the thing that was quietly broken.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>The commonest violation is subtle: a repository returning a type the UI defined, or a data-layer function taking a <code>Context</code> to read a string resource. Neither looks like a layering breach, and both make the lower layer untestable and unmovable — which is the whole cost, arriving without the compile error that should have announced it.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>For "describe the architecture of your last app", answer in this order: the layers and what each owns, how state reaches the UI, where the source of truth lives, and one trade-off you would revisit. Naming a regret is what makes the answer sound like experience rather than a diagram you memorised.</p>'
                }
            ],
            docs: [
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' },
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'Architecture learning pathway', path: '/courses/pathways/android-architecture', kind: 'course' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' },
                { topicId: 'android-architecture', questionId: 'arch-vs-design' },
                { topicId: 'jetpack-compose', questionId: 'compose-unidirectional-data-flow' }
            ]
        },

        {
            id: 'solid',
            title: 'SOLID, attached to real decisions',
            importance: 'must-know',
            summary: 'Five principles that each explain a layering choice you have already met.',
            interviewAngle: 'Reciting the acronym is easy. Giving an Android example per letter is what distinguishes the answer.',
            buildsOn: ['principles-and-layers'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>SOLID is usually taught with shapes and animals, which is why it rarely sticks. Every one of the five has already appeared in this curriculum as a concrete decision, so the useful version is to name that decision.</p>'
                },
                {
                    type: 'types',
                    title: 'The five, with the Android version',
                    items: [
                        {
                            name: 'S — Single responsibility',
                            html: '<p>A class has one reason to change. The God Activity that fetches, parses, caches and renders has four, which is why it is the canonical Android smell. A <code>ViewModel</code> holding only presentation state has one.</p>'
                        },
                        {
                            name: 'O — Open/closed',
                            html: '<p>Open to extension, closed to modification. A sealed UI state you add a case to, versus an <code>if/else</code> chain you edit in six places — and Kotlin’s <code>when</code> exhaustiveness is what makes the first safe.</p>'
                        },
                        {
                            name: 'L — Liskov substitution',
                            html: '<p>A subtype must be usable wherever its supertype is, without surprises. A fake repository in a test must honour the same contract as the real one — if the fake returns instantly and the real one suspends, the test proves nothing about the real path.</p>'
                        },
                        {
                            name: 'I — Interface segregation',
                            html: '<p>No client should depend on methods it does not use. A twenty-method <code>DataSource</code> interface forces every fake to stub twenty methods; several small interfaces do not.</p>'
                        },
                        {
                            name: 'D — Dependency inversion',
                            html: '<p>Depend on abstractions, not concretions. The <code>ViewModel</code> takes a <code>UserRepository</code> interface, not <code>UserRepositoryImpl</code> — which is the dependency rule from the previous chapter, and the reason M36 exists.</p>'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'D, and what it buys',
                    code: `// The abstraction is declared where it is USED, not where it is implemented.
interface UserRepository {
    fun observe(id: String): Flow<User>
    suspend fun refresh(id: String)
}

class ProfileViewModel(private val users: UserRepository) : ViewModel()

// Production
class RoomUserRepository(…) : UserRepository

// Test — no Room, no Retrofit, no Robolectric, no device.
class FakeUserRepository(private val user: User) : UserRepository {
    override fun observe(id: String) = flowOf(user)
    override suspend fun refresh(id: String) = Unit
}`,
                    notes: 'Declaring the interface next to its consumer rather than next to its implementation is the detail that makes this dependency <em>inversion</em> rather than just an interface.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Applied without judgement, SOLID produces an interface per class and a package of one-method abstractions with exactly one implementation each. An interface earns its place when there is a second implementation — including a test fake — or a real boundary to defend. Adding one on principle is indirection you pay for and never use.</p>'
                }
            ],
            docs: [
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'single-responsibility-principle' },
                { topicId: 'java', questionId: 'open-closed-principle' },
                { topicId: 'java', questionId: 'liskov-substitution-principle' },
                { topicId: 'java', questionId: 'interface-segregation-principle' },
                { topicId: 'java', questionId: 'dependency-inversion-principle' }
            ]
        },

        {
            id: 'domain-and-clean',
            title: 'The domain layer and Clean Architecture',
            importance: 'should-know',
            summary: 'Use cases are optional, and Clean Architecture is a set of circles most Android apps should read loosely.',
            interviewAngle: '"Do you use Clean Architecture?" is best answered with what you took from it and what you left.',
            buildsOn: ['solid'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Use case',
                    html: '<p>A single unit of business logic, named for what it does — <code>GetUnreadCountUseCase</code>, <code>SubmitOrderUseCase</code> — depending on repositories and depended on by <code>ViewModel</code>s. Usually a class with one <code>operator fun invoke</code>.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Google’s guidance calls the domain layer <strong>optional</strong>, and takes it seriously. A use case earns its place when logic is genuinely shared between screens, when combining several repositories is getting complicated, or when a rule is worth testing on its own. A use case that forwards one call to one repository is a file, an interface and an injection binding in exchange for nothing.</p>'
                },
                {
                    type: 'types',
                    title: 'Clean Architecture, read pragmatically',
                    items: [
                        { name: 'What it says', html: '<p>Concentric circles — entities, use cases, interface adapters, frameworks — with source dependencies pointing only inward, and the framework kept at the outermost ring.</p>' },
                        { name: 'What is worth keeping', html: '<p>The dependency rule, and the idea that business rules should not import a framework. Both survive translation to Android intact.</p>' },
                        { name: 'What is usually over-applied', html: '<p>A mapper and a model per boundary. Three near-identical data classes for the same user, plus the code to convert between them, is real cost for a boundary a phone app rarely needs to defend that hard.</p>' },
                        { name: 'The honest position', html: '<p>Most well-built Android apps are Clean-influenced rather than Clean: three layers, dependencies inward, a domain layer where it pays. Saying that is a stronger answer than claiming full adherence.</p>' }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Architecture versus design',
                    left: 'Architecture',
                    right: 'Design',
                    rows: [
                        { aspect: 'Scale', left: 'The system — layers, modules, boundaries', right: 'A class or a small group of them' },
                        { aspect: 'Answers', left: 'How the parts fit and depend', right: 'How one part is built' },
                        { aspect: 'Cost of change', left: 'High — it touches everything', right: 'Low — local and reversible' },
                        { aspect: 'Example', left: 'Three layers; feature modules', right: 'A builder; a sealed state class' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The distinction matters in interviews because the two questions get mixed. "How would you structure this app?" is architecture; "how would you build this component?" is design (M37). Answering one with the other is a common way to sound unfocused.</p>'
                }
            ],
            docs: [
                { title: 'Domain layer', path: '/topic/architecture/domain-layer', kind: 'guide' },
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-clean' },
                { topicId: 'android-architecture', questionId: 'arch-vs-design' }
            ]
        }
    ]
};
