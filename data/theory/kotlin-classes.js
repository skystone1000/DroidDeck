/* ==========================================================================
   M3 — Classes, objects and class modifiers.

   Also where OOP is taught, in Kotlin terms. The Java-flavoured version of
   the same material used to live in the java topic; here it arrives in the
   language the reader is actually writing.
   ========================================================================== */

const kotlinClassesModule = {
    id: 'kotlin-classes',
    trackId: 'language',
    order: 3,
    title: 'Classes and Objects',
    tagline: 'Four keywords carry most of the design work: data, sealed, object, companion.',
    estimatedMinutes: 35,
    prerequisites: ['kotlin-essentials'],
    docHub: {
        title: 'Classes',
        url: 'https://kotlinlang.org/docs/classes.html'
    },

    chapters: [
        {
            id: 'constructors-and-properties',
            title: 'Constructors, properties and init',
            importance: 'must-know',
            summary: 'The primary constructor is part of the class header, and properties come with accessors rather than fields.',
            interviewAngle: 'Initialisation order is the trap — init blocks and property initialisers run in declaration order, interleaved.',
            buildsOn: [],
            blocks: [
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The class header does the work',
                    code: `class User(
    val id: String,               // declares a read-only property
    var name: String,             // declares a mutable property
    email: String                 // constructor parameter only — not a property
) {
    private val domain = email.substringAfter("@")

    // Runs as part of the primary constructor
    init {
        require(id.isNotBlank()) { "id must not be blank" }
    }

    // Secondary constructor must delegate to the primary one
    constructor(id: String) : this(id, "anonymous", "none@example.com")

    // Custom accessors — no backing field is generated for isCorporate
    val isCorporate: Boolean
        get() = domain != "gmail.com"

    // A backing field, referred to as 'field' inside the setter
    var nickname: String = ""
        set(value) {
            field = value.trim()
        }
}`,
                    notes: 'A property with only a getter that computes from other state has no backing field at all. Kotlin generates a field only when <code>field</code> is referenced or an initialiser is present.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Initialisation runs <strong>in declaration order</strong>: property initialisers and <code>init</code> blocks are interleaved exactly as written. A property referenced by an earlier <code>init</code> block has not been assigned yet — which compiles in some arrangements and gives you a null or zero at runtime.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Kotlin classes are <strong>final by default</strong>. That is a deliberate inversion of Java: inheritance is opt-in via <code>open</code>, on the reasoning that a class not designed for extension should not accidentally allow it. The same applies to members — an <code>open</code> class still has final methods unless each is marked <code>open</code>.</p>'
                },
                {
                    type: 'table',
                    title: 'Visibility modifiers',
                    headers: ['Modifier', 'Visible to', 'Note'],
                    rows: [
                        ['<code>public</code>', 'Everywhere', 'The default — unlike Java’s package-private'],
                        ['<code>internal</code>', 'The same Gradle module', 'No Java equivalent; the reason modularisation can hide API'],
                        ['<code>protected</code>', 'The class and subclasses', 'Not the package, unlike Java'],
                        ['<code>private</code>', 'The class, or the file for top-level declarations', '']
                    ]
                }
            ],
            docs: [
                { title: 'Classes', url: 'https://kotlinlang.org/docs/classes.html', kind: 'guide' },
                { title: 'Visibility modifiers', url: 'https://kotlinlang.org/docs/visibility-modifiers.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-init-block' },
                { topicId: 'kotlin', questionId: 'kotlin-visibility-modifiers' },
                { topicId: 'kotlin', questionId: 'kotlin-internal-modifier' },
                { topicId: 'kotlin', questionId: 'kotlin-open-keyword' },
                { topicId: 'kotlin', questionId: 'kotlin-open-vs-public' }
            ]
        },

        {
            id: 'oop-in-kotlin',
            title: 'OOP, stated in Kotlin',
            importance: 'must-know',
            summary: 'The four pillars, plus the abstract-class versus interface decision that follows from them.',
            interviewAngle: '"Explain OOP" is asked everywhere and answered badly everywhere. Precision on abstraction versus encapsulation is what stands out.',
            buildsOn: ['constructors-and-properties'],
            blocks: [
                {
                    type: 'types',
                    title: 'The four pillars',
                    items: [
                        { name: 'Encapsulation', html: '<p>Bundling state with the code that operates on it, and controlling access to that state. The <em>mechanism</em>: private properties, public accessors.</p>' },
                        { name: 'Abstraction', html: '<p>Exposing what something does while hiding how. The <em>intent</em>: an interface named for a capability, not an implementation.</p>' },
                        { name: 'Inheritance', html: '<p>A type acquiring the behaviour of a supertype. In Kotlin, opt-in via <code>open</code>.</p>' },
                        { name: 'Polymorphism', html: '<p>One reference, many runtime behaviours. Subtype polymorphism through overriding; parametric polymorphism through generics.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Encapsulation and abstraction get conflated constantly. The distinction that lands: <em>"encapsulation hides data, abstraction hides implementation. One is about access, the other about design."</em></p>'
                },
                {
                    type: 'comparison',
                    title: 'Abstract class versus interface',
                    left: 'Abstract class',
                    right: 'Interface',
                    rows: [
                        { aspect: 'How many', left: 'One — single inheritance', right: 'Many' },
                        { aspect: 'Constructor', left: 'Yes', right: 'No' },
                        { aspect: 'State', left: 'Backing fields allowed', right: 'Properties allowed but no backing field' },
                        { aspect: 'Models', left: '"is a" — shared identity', right: '"can do" — a capability' },
                        { aspect: 'Reach for it when', left: 'Subtypes share state and partial implementation', right: 'Unrelated types share a capability' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Interfaces with defaults, and resolving a clash',
                    code: `interface Clickable {
    fun click()                      // abstract
    fun showOff() = println("clickable!")   // default implementation
}

interface Focusable {
    fun showOff() = println("focusable!")
}

// Implementing both forces you to resolve the collision explicitly —
// Kotlin's answer to the diamond problem.
class Button : Clickable, Focusable {
    override fun click() = Unit

    override fun showOff() {
        super<Clickable>.showOff()
        super<Focusable>.showOff()
    }
}`
                },
                {
                    type: 'prose',
                    html: '<p>Interfaces may declare properties, but only ones without backing fields — an interface has no storage, so the property must be abstract or defined by a getter. That is the practical line between an interface and an abstract class, more than the multiple-inheritance rule people usually quote.</p>'
                }
            ],
            docs: [
                { title: 'Interfaces', url: 'https://kotlinlang.org/docs/interfaces.html', kind: 'guide' },
                { title: 'Inheritance', url: 'https://kotlinlang.org/docs/inheritance.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'explain-oop-concepts' },
                { topicId: 'java', questionId: 'abstract-classes-vs-interfaces' },
                { topicId: 'java', questionId: 'polymorphism-and-inheritance' },
                { topicId: 'java', questionId: 'interface-implement-another-interface' },
                { topicId: 'java', questionId: 'diamond-problem-default-methods' }
            ]
        },

        {
            id: 'data-classes',
            title: 'data class',
            importance: 'must-know',
            summary: 'Generates equals, hashCode, toString, copy and componentN — from the primary constructor only.',
            interviewAngle: '"What does data class generate?" then "what happens to a property declared in the body?" The second one catches most people.',
            buildsOn: ['constructors-and-properties'],
            blocks: [
                {
                    type: 'types',
                    title: 'What the compiler generates',
                    items: [
                        { name: 'equals / hashCode', html: '<p>Structural, based on the primary constructor properties.</p>' },
                        { name: 'toString', html: '<p><code>User(id=1, name=Ada)</code> — readable in logs without effort.</p>' },
                        { name: 'copy(...)', html: '<p>A shallow copy with named overrides. The idiomatic way to produce new immutable state.</p>' },
                        { name: 'componentN()', html: '<p>Enables destructuring: <code>val (id, name) = user</code>. Positional, so reordering properties silently changes meaning.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The generated members in use',
                    code: `data class User(val id: String, val name: String) {
    var lastSeen: Long = 0      // in the BODY — excluded from equals/hashCode/copy
}

val a = User("1", "Ada").apply { lastSeen = 100 }
val b = User("1", "Ada").apply { lastSeen = 999 }

a == b            // true  — lastSeen is not part of equality
a.copy(name = "Grace").lastSeen   // 0 — copy does not carry it either

val (id, name) = a               // destructuring via component1/component2`,
                    notes: 'Only primary-constructor properties participate. A property in the body is real state that <code>equals</code>, <code>hashCode</code> and <code>copy</code> all ignore.'
                },
                {
                    type: 'pitfall',
                    html: '<p>That exclusion is a genuine source of bugs, and it interacts with <code>StateFlow</code>: two states differing only in a body property compare equal, so the conflating <code>StateFlow</code> drops the emission and the UI never updates. If a value matters to equality, it belongs in the constructor.</p>'
                },
                {
                    type: 'prose',
                    html: '<p><code>copy</code> is <strong>shallow</strong>. Copying a data class holding a <code>MutableList</code> gives you a new wrapper around the same list, so mutating it changes both. This is the Kotlin form of the shallow-versus-deep copy question.</p>'
                }
            ],
            docs: [
                { title: 'Data classes', url: 'https://kotlinlang.org/docs/data-classes.html', kind: 'guide' },
                { title: 'Destructuring declarations', url: 'https://kotlinlang.org/docs/destructuring-declarations.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-data-classes' },
                { topicId: 'java', questionId: 'shallow-vs-deep-copy' },
                { topicId: 'java', questionId: 'hashcode-and-equals' }
            ]
        },

        {
            id: 'sealed-and-enum',
            title: 'sealed classes, sealed interfaces and enums',
            importance: 'must-know',
            summary: 'A closed set of subtypes the compiler knows about, which makes when exhaustive.',
            interviewAngle: 'Very common in Android because UI state is the canonical use. The sealed-versus-enum distinction is the follow-up.',
            buildsOn: ['oop-in-kotlin'],
            blocks: [
                {
                    type: 'definition',
                    term: 'sealed class',
                    important: true,
                    html: '<p>A class whose direct subclasses must be declared in the same package and module, so the compiler knows the complete set. That makes a <code>when</code> over it exhaustive without an <code>else</code>, and turns adding a subtype into a compile error everywhere it is handled.</p>'
                },
                {
                    type: 'comparison',
                    title: 'sealed versus enum',
                    left: 'enum class',
                    right: 'sealed class',
                    rows: [
                        { aspect: 'Instances', left: 'One per constant', right: 'Any number per subtype' },
                        { aspect: 'Per-case data', left: 'Same fields for all', right: 'Each subtype has its own shape' },
                        { aspect: 'Subtypes', left: 'Cannot vary', right: 'Can be data classes, objects, or nested sealed' },
                        { aspect: 'Models', left: 'A fixed set of values', right: 'A fixed set of *cases*' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The Android idiom',
                    code: `sealed interface UiState {
    data object Loading : UiState
    data class Loaded(val items: List<Item>) : UiState
    data class Error(val cause: Throwable) : UiState
}

// Exhaustive: no else branch, and adding a fourth case breaks this
// at compile time rather than at runtime.
fun render(state: UiState) = when (state) {
    UiState.Loading  -> showSpinner()
    is UiState.Loaded -> showItems(state.items)   // smart cast to Loaded
    is UiState.Error  -> showError(state.cause)
}`,
                    notes: '<code>data object</code> (Kotlin 1.9+) gives a singleton a sensible <code>toString</code> and structural <code>equals</code> — worth preferring over bare <code>object</code> in a sealed hierarchy.'
                },
                {
                    type: 'prose',
                    html: '<p>Prefer <code>sealed interface</code> unless you need shared state. A sealed class occupies the single inheritance slot of every subtype; an interface leaves it free, and a subtype can belong to two sealed hierarchies at once.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>The exhaustiveness is the entire value proposition. Say it directly: <em>"adding a case turns every when over it into a compile error, so the compiler finds the places I need to update."</em></p>'
                }
            ],
            docs: [
                { title: 'Sealed classes and interfaces', url: 'https://kotlinlang.org/docs/sealed-classes.html', kind: 'guide' },
                { title: 'Enum classes', url: 'https://kotlinlang.org/docs/enum-classes.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-sealed-classes' },
                { topicId: 'kotlin', questionId: 'kotlin-sealed-classes-android-use-cases' },
                { topicId: 'java', questionId: 'enum-in-java' }
            ]
        },

        {
            id: 'object-and-companion',
            title: 'object and companion object',
            importance: 'must-know',
            summary: 'object is a singleton declared in one keyword; companion object is the closest thing to static.',
            interviewAngle: '"How do you make a singleton in Kotlin?" and "what is the equivalent of static?" — both answered here.',
            buildsOn: ['constructors-and-properties'],
            blocks: [
                {
                    type: 'types',
                    title: 'Three uses of object',
                    items: [
                        { name: 'Object declaration', html: '<p><code>object Registry { … }</code> — a thread-safe, lazily initialised singleton. The whole singleton pattern in one keyword, with no double-checked locking to get wrong.</p>' },
                        { name: 'Companion object', html: '<p>An object tied to a class, accessible through the class name. Where factory functions and constants live.</p>' },
                        { name: 'Object expression', html: '<p>Kotlin’s anonymous class: <code>object : Listener { … }</code>. Unlike Java, it can implement several interfaces at once.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Singletons, factories and constants',
                    code: `object AnalyticsRegistry {          // singleton, initialised on first access
    private val handlers = mutableListOf<Handler>()
    fun register(h: Handler) { handlers += h }
}

class Fragment private constructor() {
    companion object {
        const val TAG = "ProfileFragment"      // compile-time constant

        // Factory function — the Android newInstance idiom
        fun newInstance(id: String) = Fragment().apply {
            arguments = bundleOf("id" to id)
        }
    }
}

Fragment.newInstance("1")     // called through the class name`,
                    notes: 'A companion object is a real object, so it can implement an interface — which is how <code>companion object : Parcelable.Creator&lt;T&gt;</code> works.'
                },
                {
                    type: 'pitfall',
                    html: '<p>A companion object is <strong>not</strong> static. Its members compile to instance methods on a synthetic <code>Companion</code> class, so Java callers see <code>MyClass.Companion.foo()</code>. Add <code>@JvmStatic</code> to a member, or <code>@JvmField</code> to a property, to get the real static that Java expects.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>object</code> singletons live for the whole process. One holding a <code>Context</code>, a listener or a cache keyed by Activity is a leak that survives every screen — the most common misuse of the keyword on Android.</p>'
                }
            ],
            docs: [
                { title: 'Object declarations and expressions', url: 'https://kotlinlang.org/docs/object-declarations.html', kind: 'guide' },
                { title: 'Calling Kotlin from Java', url: 'https://kotlinlang.org/docs/java-to-kotlin-interop.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-companion-object' },
                { topicId: 'kotlin', questionId: 'kotlin-singleton' },
                { topicId: 'kotlin', questionId: 'kotlin-static-equivalent' },
                { topicId: 'kotlin', questionId: 'kotlin-jvmstatic' },
                { topicId: 'kotlin', questionId: 'kotlin-jvmfield' },
                { topicId: 'java', questionId: 'anonymous-classes' }
            ]
        }
    ]
};
