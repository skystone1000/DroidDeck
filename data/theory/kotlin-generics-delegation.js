/* ==========================================================================
   M5 — Generics, delegation and the idiomatic corners.

   Closes the Kotlin language track. Variance is the hardest thing in the
   track and is taught from the problem it solves rather than from the
   keywords.
   ========================================================================== */

const kotlinGenericsDelegationModule = {
    id: 'kotlin-generics-delegation',
    trackId: 'language',
    order: 5,
    title: 'Generics and Delegation',
    tagline: 'Variance, by, and the corners of the language worth knowing.',
    estimatedMinutes: 30,
    prerequisites: ['kotlin-classes', 'kotlin-collections'],
    docHub: {
        title: 'Generics: in, out, where',
        url: 'https://kotlinlang.org/docs/generics.html'
    },

    chapters: [
        {
            id: 'generics-and-variance',
            title: 'Generics and variance',
            importance: 'should-know',
            summary: 'out for producers, in for consumers — declared once at the class rather than at every use.',
            interviewAngle: 'The senior-level language question. Being able to say why List is covariant and MutableList is not is the whole thing.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Start from the problem. <code>Dog</code> is a <code>Animal</code>. Is <code>List&lt;Dog&gt;</code> a <code>List&lt;Animal&gt;</code>? It would be convenient, and if collections were mutable it would also be unsound — you could add a <code>Cat</code> through the <code>Animal</code>-typed reference.</p><p>Kotlin resolves this by letting a class declare, once, which direction its type parameter flows.</p>'
                },
                {
                    type: 'types',
                    title: 'The two modifiers',
                    items: [
                        {
                            name: 'out T (covariant)',
                            html: '<p>The class only ever <strong>produces</strong> <code>T</code> — it appears in return positions, never as a parameter. Then <code>Box&lt;Dog&gt;</code> is a subtype of <code>Box&lt;Animal&gt;</code>.</p>',
                            whenToUse: 'read-only sources: <code>List&lt;out E&gt;</code>, <code>Flow&lt;out T&gt;</code>'
                        },
                        {
                            name: 'in T (contravariant)',
                            html: '<p>The class only ever <strong>consumes</strong> <code>T</code> — it appears as a parameter, never as a return type. Then <code>Sink&lt;Animal&gt;</code> is a subtype of <code>Sink&lt;Dog&gt;</code>, which is the reverse direction.</p>',
                            whenToUse: 'sinks and comparators: <code>Comparable&lt;in T&gt;</code>'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Why MutableList cannot be covariant',
                    code: `open class Animal
class Dog : Animal()
class Cat : Animal()

// List<out E> — produces only, so this is allowed:
val dogs: List<Dog> = listOf(Dog())
val animals: List<Animal> = dogs        // fine

// MutableList<E> is invariant. If it were not:
// val bad: MutableList<Animal> = mutableListOf<Dog>()
// bad.add(Cat())                        // a Cat in a List<Dog>

// in — a consumer of Animal can consume any Dog
fun interface Sink<in T> { fun accept(value: T) }
val animalSink: Sink<Animal> = Sink { println(it) }
val dogSink: Sink<Dog> = animalSink      // fine

// Star projection: "some type, but I do not care which"
fun sizeOf(items: List<*>): Int = items.size`,
                    notes: 'The mnemonic is <strong>PECS</strong> from Java — Producer Extends, Consumer Super. Kotlin declares it at the class instead of at every use site, so <code>List&lt;out E&gt;</code> is written once rather than <code>List&lt;? extends E&gt;</code> everywhere.'
                },
                {
                    type: 'comparison',
                    title: 'Kotlin versus Java variance',
                    left: 'Kotlin',
                    right: 'Java',
                    rows: [
                        { aspect: 'Declared', left: 'At the class — declaration site', right: 'At each use — use site' },
                        { aspect: 'Covariant', left: '<code>out T</code>', right: '<code>? extends T</code>' },
                        { aspect: 'Contravariant', left: '<code>in T</code>', right: '<code>? super T</code>' },
                        { aspect: 'Unknown', left: '<code>Foo&lt;*&gt;</code>', right: '<code>Foo&lt;?&gt;</code>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Generics are <strong>erased</strong> on the JVM: at runtime a <code>List&lt;String&gt;</code> is just a <code>List</code>. That is why <code>is List&lt;String&gt;</code> will not compile, and why <code>reified</code> from M2 exists — inlining substitutes the type before erasure can apply.</p>'
                }
            ],
            docs: [
                { title: 'Generics: in, out, where', url: 'https://kotlinlang.org/docs/generics.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'generics-in-java' },
                { topicId: 'kotlin', questionId: 'kotlin-reified' }
            ]
        },

        {
            id: 'delegation',
            title: 'Delegation with by',
            importance: 'should-know',
            summary: 'One keyword for two things: forwarding an interface to another object, and handing a property its storage.',
            interviewAngle: '"What are delegates?" — a strong answer covers both forms and names the getValue/setValue contract.',
            buildsOn: ['generics-and-variance'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p><code>by</code> does two unrelated jobs that share a keyword because both mean "someone else handles this".</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Class delegation — composition without boilerplate',
                    code: `interface Repository {
    fun load(id: String): Item
    fun save(item: Item)
}

// Every member is forwarded to 'delegate' automatically; override only
// what you want to change. Composition with none of the typing.
class LoggingRepository(
    private val delegate: Repository
) : Repository by delegate {

    override fun save(item: Item) {
        Log.d("repo", "saving \$item")
        delegate.save(item)
    }
}`,
                    notes: 'This is the Decorator pattern with the forwarding generated for you — the main practical answer to "favour composition over inheritance" in Kotlin.'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Property delegation — and writing your own',
                    code: `class Settings(private val prefs: SharedPreferences) {
    // Standard delegates
    val expensive by lazy { compute() }
    var tracked by Delegates.observable("") { _, old, new ->
        Log.d("settings", "\$old -> \$new")
    }

    // A custom delegate: any object with getValue/setValue works
    var theme: String by PrefDelegate(prefs, "theme", "system")
}

class PrefDelegate(
    private val prefs: SharedPreferences,
    private val key: String,
    private val default: String
) {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String =
        prefs.getString(key, default) ?: default

    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        prefs.edit().putString(key, value).apply()
    }
}`
                },
                {
                    type: 'types',
                    title: 'The standard delegates',
                    items: [
                        { name: 'lazy', html: '<p>Computes on first read, then caches. Synchronised by default.</p>' },
                        { name: 'Delegates.observable', html: '<p>Fires a callback after each assignment.</p>' },
                        { name: 'Delegates.vetoable', html: '<p>Fires before assignment and can reject it.</p>' },
                        { name: 'Delegates.notNull', html: '<p>A <code>lateinit</code> substitute that works for primitives.</p>' },
                        { name: 'Map delegation', html: '<p><code>val name: String by map</code> reads the property out of a map by its own name.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Delegation', url: 'https://kotlinlang.org/docs/delegation.html', kind: 'guide' },
                { title: 'Delegated properties', url: 'https://kotlinlang.org/docs/delegated-properties.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-delegates' },
                { topicId: 'kotlin', questionId: 'kotlin-lazy-initialization' }
            ]
        },

        {
            id: 'idiomatic-corners',
            title: 'The corners worth knowing',
            importance: 'good-to-know',
            summary: 'Value classes, typealias, operator overloading, destructuring and context parameters.',
            interviewAngle: 'Individually minor, collectively the difference between writing Kotlin and writing Java in Kotlin.',
            buildsOn: ['delegation'],
            blocks: [
                {
                    type: 'types',
                    title: 'Small features that change how code reads',
                    items: [
                        {
                            name: 'value class',
                            html: '<p>A wrapper erased at runtime to the type it wraps. Gives you a distinct type with no allocation — <code>UserId</code> and <code>OrderId</code> stop being interchangeable <code>String</code>s.</p>',
                            whenToUse: 'domain identifiers and units, where mixing them up is a real bug class'
                        },
                        {
                            name: 'typealias',
                            html: '<p>A new name for an existing type. No new type and no safety — purely readability, especially for function types.</p>'
                        },
                        {
                            name: 'Operator overloading',
                            html: '<p><code>operator fun plus</code>, <code>get</code>, <code>invoke</code>, <code>contains</code> and friends map to <code>+</code>, <code>[]</code>, <code>()</code> and <code>in</code>.</p>'
                        },
                        {
                            name: 'Destructuring',
                            html: '<p>Any type with <code>componentN()</code> operators, which data classes get for free.</p>'
                        },
                        {
                            name: 'Context parameters',
                            html: '<p>Stable since <strong>Kotlin 2.4</strong>. Lets a function require ambient context without threading it through every signature — the successor to the experimental context receivers.</p>'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Value classes and typealias',
                    code: `@JvmInline
value class UserId(val raw: String)

@JvmInline
value class OrderId(val raw: String)

// Now this will not compile, where two Strings would have been silently
// interchangeable:
fun load(id: UserId): User = TODO()
// load(OrderId("1"))

// typealias — readability only, no type safety added
typealias OnItemClick = (Item, Int) -> Unit

class Adapter(private val onClick: OnItemClick)`,
                    notes: 'A <code>value class</code> is erased where it can be, so wrapping a <code>String</code> costs nothing at runtime — but it does box when used as a generic argument or a nullable.'
                },
                {
                    type: 'prose',
                    html: '<p>Kotlin also ships a coding-convention document, and following it matters more than it sounds: expression bodies for single-expression functions, trailing lambdas outside the parentheses, named arguments for booleans at call sites. Interviewers reading a take-home notice idiom quickly, and non-idiomatic Kotlin reads as Java habits carried over.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>If asked what you like about Kotlin, avoid "less boilerplate" — everyone says it. Null safety in the type system, sealed types making <code>when</code> exhaustive, and coroutines are three concrete answers with real consequences.</p>'
                }
            ],
            docs: [
                { title: 'Inline value classes', url: 'https://kotlinlang.org/docs/inline-classes.html', kind: 'guide' },
                { title: 'Coding conventions', url: 'https://kotlinlang.org/docs/coding-conventions.html', kind: 'guide' },
                { title: 'Kotlin language features and proposals', url: 'https://kotlinlang.org/docs/kotlin-language-features-and-proposals.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-inline-classes' }
            ]
        }
    ]
};
