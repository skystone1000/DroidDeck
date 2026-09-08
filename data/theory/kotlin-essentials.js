/* ==========================================================================
   M1 — Kotlin essentials.

   Opens the curriculum. Assumes programming experience but not Kotlin, and
   not Java: the JVM arrives in M6, at the point where it starts to leak.
   ========================================================================== */

const kotlinEssentialsModule = {
    id: 'kotlin-essentials',
    trackId: 'language',
    order: 1,
    title: 'Kotlin Essentials',
    tagline: 'Values, types, and the null problem Kotlin was built to solve.',
    estimatedMinutes: 30,
    prerequisites: [],
    docHub: {
        title: 'Kotlin first steps',
        path: '/kotlin/first'
    },

    chapters: [
        {
            id: 'val-var-and-types',
            title: 'val, var and the type hierarchy',
            importance: 'must-know',
            summary: 'Declarations are read-only by default, types are inferred, and every type sits under Any.',
            interviewAngle: 'The val/var question is a warm-up. The real one hiding behind it is whether val means immutable — it does not.',
            buildsOn: [],
            blocks: [
                {
                    type: 'types',
                    title: 'Two declarations',
                    items: [
                        { name: 'val', html: '<p>Read-only. The reference cannot be reassigned after initialisation.</p>', whenToUse: 'always, until you have a reason not to' },
                        { name: 'var', html: '<p>Mutable. The reference can be reassigned.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p><code>val</code> means the <strong>reference</strong> is fixed, not the object. <code>val list = mutableListOf(1)</code> followed by <code>list.add(2)</code> compiles and works. Kotlin gives you read-only references and read-only <em>interfaces</em>; it does not give you deep immutability.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Declarations and inference',
                    code: `val name = "Ada"              // type inferred as String
val age: Int = 36             // explicit when it helps the reader
var count = 0                 // reassignable
count += 1

val list = mutableListOf(1)
list.add(2)                   // fine — the object is mutable
// list = mutableListOf(3)    // error — the reference is not

const val API = "v1"          // compile-time constant, top level or in an object`,
                    notes: '<code>const val</code> is inlined at compile time, so it must be a primitive or <code>String</code> known at compile time. A plain <code>val</code> is computed at runtime and has a getter.'
                },
                {
                    type: 'prose',
                    html: '<p>Kotlin has no primitive types in the source language. <code>Int</code>, <code>Boolean</code> and the rest are classes; the compiler emits JVM primitives where it can and boxes where it must. That is invisible until it is not, which is what M6 is for.</p>'
                },
                {
                    type: 'types',
                    title: 'Three types worth naming',
                    items: [
                        { name: 'Any', html: '<p>The root of the hierarchy — the supertype of every non-nullable type. Declares <code>equals</code>, <code>hashCode</code> and <code>toString</code>.</p>' },
                        { name: 'Unit', html: '<p>The type of a function that returns nothing useful. A real singleton object, not a void keyword, which is what lets it be a generic argument.</p>' },
                        { name: 'Nothing', html: '<p>The type with no values, and a subtype of <em>every</em> type. The return type of a function that never returns normally — <code>throw</code> is an expression of type <code>Nothing</code>, which is why it can appear on the right of an Elvis operator.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p><code>Nothing</code> is worth being able to explain. <code>val x = person.name ?: throw IllegalStateException()</code> type-checks because <code>Nothing</code> is a subtype of <code>String</code>, so the whole expression is still a <code>String</code>.</p>'
                }
            ],
            docs: [
                { title: 'Basic types', url: 'https://kotlinlang.org/docs/basic-types.html', kind: 'guide' },
                { title: 'Kotlin first steps', path: '/kotlin/first', kind: 'course' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-val-vs-var' },
                { topicId: 'kotlin', questionId: 'kotlin-const-advantage' }
            ]
        },

        {
            id: 'null-safety',
            title: 'Null safety',
            importance: 'must-know',
            summary: 'Nullability is part of the type, so the compiler can refuse the call that would have crashed.',
            interviewAngle: 'Guaranteed for any Kotlin role. The interesting part is platform types — what happens at the Java boundary, where the guarantee stops.',
            buildsOn: ['val-var-and-types'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Kotlin’s headline feature. <code>String</code> and <code>String?</code> are different types, and the compiler will not let you call a member on the nullable one without proving it is not null. The null pointer exception does not go away — it becomes something you have to ask for.</p>'
                },
                {
                    type: 'types',
                    title: 'The operators',
                    items: [
                        { name: '?', html: '<p>Type suffix marking a type as nullable: <code>val name: String? = null</code>.</p>' },
                        { name: '?. (safe call)', html: '<p>Calls the member if the receiver is non-null, otherwise evaluates to <code>null</code>. Chains: <code>a?.b?.c</code>.</p>' },
                        { name: '?: (Elvis)', html: '<p>Supplies a value when the left side is null: <code>name ?: "unknown"</code>. The right side may also <code>throw</code> or <code>return</code>.</p>' },
                        { name: '!! (not-null assertion)', html: '<p>Asserts non-null, throwing <code>NullPointerException</code> if wrong. A deliberate opt-out of the guarantee.</p>', whenToUse: 'when you can justify it out loud — otherwise treat it as a smell' },
                        { name: 'let with ?.', html: '<p><code>value?.let { … }</code> runs the block only when non-null, and smart-casts inside it.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Working with nullable values',
                    code: `fun greet(user: User?): String {
    // Safe call chain — null anywhere yields null.
    val city: String? = user?.address?.city

    // Elvis with a fallback.
    val display = user?.name ?: "Guest"

    // Elvis with an early return — the right side is Nothing.
    val id = user?.id ?: return "no user"

    // Smart cast: after the check, the compiler knows it is non-null.
    if (user != null) {
        println(user.name)      // no ?. needed
    }

    return "Hello \$display from \${city ?: "somewhere"} (\$id)"
}`
                },
                {
                    type: 'definition',
                    term: 'Smart cast',
                    html: '<p>The compiler narrowing a type automatically after a check — a <code>null</code> comparison or an <code>is</code> check. It only applies where the value cannot have changed in between, which is why it works on a <code>val</code> but not on a mutable property that another thread could write.</p>'
                },
                {
                    type: 'definition',
                    term: 'Platform type',
                    aka: 'String!',
                    important: true,
                    html: '<p>The type Kotlin assigns to a value coming from Java, where nullability is unknown. The compiler <strong>suspends</strong> its null checks: you may treat it as nullable or not, and if you choose wrong you get an NPE at runtime. This is the one hole in the guarantee.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Platform types are why a Kotlin file can still throw an NPE with no <code>!!</code> in sight. Java code annotated with <code>@Nullable</code>/<code>@NonNull</code> gives Kotlin the information it needs — unannotated Java does not, so assign an explicit type at the boundary rather than letting inference pick.</p>'
                }
            ],
            docs: [
                { title: 'Null safety', url: 'https://kotlinlang.org/docs/null-safety.html', kind: 'guide' },
                { title: 'Kotlin and Java interop nullability', path: '/kotlin/add-kotlin', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-elvis-operator' }
            ]
        },

        {
            id: 'lateinit-and-lazy',
            title: 'lateinit and by lazy',
            importance: 'must-know',
            summary: 'Two ways to declare a non-null property you cannot initialise yet — and they are not interchangeable.',
            interviewAngle: 'The comparison is a standard question. Naming the val/var restriction and the thread-safety difference is what makes the answer complete.',
            buildsOn: ['null-safety'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Sometimes a property genuinely cannot be initialised at construction — a view bound in <code>onCreate</code>, a dependency injected after the fact. Declaring it nullable would mean a <code>?.</code> on every use, so Kotlin offers two escapes.</p>'
                },
                {
                    type: 'comparison',
                    title: 'lateinit versus by lazy',
                    left: 'lateinit var',
                    right: 'by lazy',
                    rows: [
                        { aspect: 'Declaration', left: 'Must be <code>var</code>', right: 'Must be <code>val</code>' },
                        { aspect: 'Who initialises', left: 'You, from outside', right: 'The lambda, on first read' },
                        { aspect: 'When', left: 'Whenever you get to it', right: 'First access' },
                        { aspect: 'Primitives', left: 'Not allowed', right: 'Allowed' },
                        { aspect: 'If unset', left: '<code>UninitializedPropertyAccessException</code>', right: 'Cannot happen' },
                        { aspect: 'Thread safety', left: 'None', right: 'Synchronised by default' },
                        { aspect: 'Reassignable', left: 'Yes', right: 'No' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Each in its place',
                    code: `class ProfileFragment : Fragment() {

    // Set by the framework later; we cannot compute it ourselves.
    private lateinit var binding: FragmentProfileBinding

    // We know how to build it, we just do not want to pay until asked.
    private val adapter by lazy { ProfileAdapter(::onItemClick) }

    override fun onCreateView(...): View {
        binding = FragmentProfileBinding.inflate(inflater)
        return binding.root
    }

    fun isReady() = ::binding.isInitialized    // guard for lateinit
}`,
                    notes: '<code>by lazy</code> takes a mode: <code>LazyThreadSafetyMode.NONE</code> drops the synchronisation when you know access is single-threaded, which is the common case on the main thread.'
                },
                {
                    type: 'tip',
                    html: '<p>The one-line discriminator: <em>"lateinit is a promise you will set it; lazy is a recipe for computing it."</em> That also explains why one is <code>var</code> and the other <code>val</code>.</p>'
                }
            ],
            docs: [
                { title: 'Late-initialized properties', url: 'https://kotlinlang.org/docs/properties.html', kind: 'guide' },
                { title: 'Delegated properties', url: 'https://kotlinlang.org/docs/delegated-properties.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-lateinit-vs-lazy' },
                { topicId: 'kotlin', questionId: 'kotlin-lateinit' },
                { topicId: 'kotlin', questionId: 'kotlin-lateinit-check-initialized' },
                { topicId: 'kotlin', questionId: 'kotlin-lazy-initialization' }
            ]
        },

        {
            id: 'equality',
            title: 'Equality — == and ===',
            importance: 'must-know',
            summary: 'Kotlin flips Java\'s convention: == is structural, === is referential.',
            interviewAngle: 'Short and reliably asked, usually as a trap for people arriving from Java where == is the reference check.',
            buildsOn: ['val-var-and-types'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'The two operators',
                    left: '==',
                    right: '===',
                    rows: [
                        { aspect: 'Compares', left: 'Structure — calls <code>equals()</code>', right: 'Identity — same object' },
                        { aspect: 'Java equivalent', left: '<code>a.equals(b)</code>', right: '<code>a == b</code>' },
                        { aspect: 'Null-safe', left: 'Yes — <code>null == null</code> is true', right: 'Yes' },
                        { aspect: 'Overridable', left: 'Via <code>equals()</code>', right: 'No' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Structural versus referential',
                    code: `data class Point(val x: Int, val y: Int)

val a = Point(1, 2)
val b = Point(1, 2)
val c = a

a == b     // true  — data class equals compares the properties
a === b    // false — two distinct objects
a === c    // true  — same reference

// == compiles to a null-safe equals call:
//   a?.equals(b) ?: (b === null)`,
                    notes: 'This is why <code>==</code> on a nullable receiver does not need a safe call — the compiler already generates one.'
                },
                {
                    type: 'pitfall',
                    html: '<p>A class that does not override <code>equals</code> inherits identity comparison from <code>Any</code>, so <code>==</code> and <code>===</code> behave identically. That is why <code>data class</code> matters for value-like types, and why comparing two ordinary classes with <code>==</code> can silently be a reference check.</p>'
                }
            ],
            docs: [
                { title: 'Equality', url: 'https://kotlinlang.org/docs/equality.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-equality-operators' },
                { topicId: 'java', questionId: 'equals-vs-double-equals' }
            ]
        },

        {
            id: 'control-flow',
            title: 'Control flow as expressions',
            importance: 'should-know',
            summary: 'if, when and try are expressions that produce values, which changes how code is shaped.',
            interviewAngle: 'Rarely asked head-on, but exhaustive when over a sealed type is the payoff, and that is asked constantly.',
            buildsOn: ['val-var-and-types'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Kotlin has no ternary operator because it does not need one: <code>if</code> is already an expression. The same applies to <code>when</code> and <code>try</code>, which is why so much Kotlin is written as a single assignment rather than a mutable variable filled in by branches.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Expressions, not statements',
                    code: `val label = if (count == 0) "empty" else "\$count items"

val description = when {
    count == 0    -> "empty"
    count < 10    -> "a few"
    else          -> "many"
}

// when over a subject, with ranges, sets and types as branches
val kind = when (code) {
    in 200..299     -> "success"
    in setOf(301, 302) -> "redirect"
    is String       -> "unexpected string"
    else            -> "error"
}

val parsed = try { input.toInt() } catch (e: NumberFormatException) { 0 }`
                },
                {
                    type: 'prose',
                    html: '<p>When <code>when</code> is used as an <em>expression</em> it must be exhaustive — every possible value covered, or an <code>else</code>. Over a <code>sealed</code> type the compiler knows the full set of subtypes, so adding a new one turns every such <code>when</code> into a compile error until it is handled. That is the mechanism M3 builds on.</p>'
                },
                {
                    type: 'types',
                    title: 'Loops and jumps',
                    items: [
                        { name: 'for (x in collection)', html: '<p>Iterates anything providing an <code>iterator()</code>. Ranges: <code>for (i in 0 until n)</code>, <code>downTo</code>, <code>step</code>.</p>' },
                        { name: 'Labels', html: '<p><code>outer@ for (…) { break@outer }</code> — breaks or continues a named outer loop, and lets a lambda return to a specific place with <code>return@forEach</code>.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>A bare <code>return</code> inside a lambda returns from the <em>enclosing function</em>, not the lambda — and is only allowed at all in an inline lambda. To leave just the lambda, label it: <code>return@forEach</code>. This trips people up constantly and connects directly to <code>crossinline</code> in M2.</p>'
                }
            ],
            docs: [
                { title: 'Conditions and loops', url: 'https://kotlinlang.org/docs/control-flow.html', kind: 'guide' },
                { title: 'Returns and jumps', url: 'https://kotlinlang.org/docs/returns.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-labels' }
            ]
        }
    ]
};
