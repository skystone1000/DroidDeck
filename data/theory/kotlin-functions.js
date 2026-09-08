/* ==========================================================================
   M2 — Functions, lambdas and higher-order functions.

   The module that makes the rest of Kotlin readable: coroutine builders,
   Compose composables and every Flow operator are higher-order functions
   taking trailing lambdas.
   ========================================================================== */

const kotlinFunctionsModule = {
    id: 'kotlin-functions',
    trackId: 'language',
    order: 2,
    title: 'Functions and Lambdas',
    tagline: 'Functions are values, and that is why the rest of Kotlin looks the way it does.',
    estimatedMinutes: 35,
    prerequisites: ['kotlin-essentials'],
    docHub: {
        title: 'Functions',
        url: 'https://kotlinlang.org/docs/functions.html'
    },

    chapters: [
        {
            id: 'function-basics',
            title: 'Declaring functions',
            importance: 'must-know',
            summary: 'Default and named arguments remove most overloads; single-expression bodies remove most braces.',
            interviewAngle: 'Default arguments come up via @JvmOverloads — why Java callers cannot see them without it.',
            buildsOn: [],
            blocks: [
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The forms',
                    code: `// Block body with an explicit return type
fun add(a: Int, b: Int): Int {
    return a + b
}

// Single-expression body — return type inferred
fun add(a: Int, b: Int) = a + b

// Default arguments: one function instead of four overloads
fun format(
    value: Double,
    decimals: Int = 2,
    prefix: String = "",
    grouping: Boolean = true
): String = TODO()

// Named arguments — skip the middle, stay readable
format(1234.5, grouping = false)

// vararg, and spreading an existing array into it
fun log(vararg parts: String) = parts.joinToString(" ")
val words = arrayOf("a", "b")
log(*words)

// infix — single parameter, member or extension
infix fun Int.pow(n: Int): Int = generateSequence(1) { it * this }.elementAt(n)
val eight = 2 pow 3`
                },
                {
                    type: 'pitfall',
                    html: '<p>Default arguments are a Kotlin-side feature. Java callers see a single method with every parameter required, plus a synthetic bridge. Annotate with <code>@JvmOverloads</code> to generate the overload ladder Java expects — which is exactly why custom <code>View</code> subclasses written in Kotlin carry it.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Kotlin also has local functions — a function declared inside another, closing over its variables. Useful for a helper that has no meaning outside its parent, and a cleaner alternative to a private method that takes six parameters just to pass state along.</p>'
                }
            ],
            docs: [
                { title: 'Functions', url: 'https://kotlinlang.org/docs/functions.html', kind: 'guide' },
                { title: 'Calling Kotlin from Java', url: 'https://kotlinlang.org/docs/java-to-kotlin-interop.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-infix-notation' },
                { topicId: 'kotlin', questionId: 'kotlin-jvmoverloads' },
                { topicId: 'java', questionId: 'varargs-in-java' }
            ]
        },

        {
            id: 'extension-functions',
            title: 'Extension functions',
            importance: 'must-know',
            summary: 'Add functions to a type you do not own — resolved statically, which is the whole catch.',
            interviewAngle: '"Can an extension function override a member?" No, and explaining why is the real question.',
            buildsOn: ['function-basics'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Extension function',
                    important: true,
                    html: '<p>A function declared outside a class but callable as if it were a member, with the receiver available as <code>this</code>. The compiler turns it into a static function taking the receiver as its first parameter — it does <strong>not</strong> modify the class.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Declaring and the dispatch trap',
                    code: `fun String.initials(): String =
    split(" ").mapNotNull { it.firstOrNull() }.joinToString("")

"Ada Lovelace".initials()      // "AL"

// Nullable receiver — the extension handles null itself
fun String?.orPlaceholder(): String = this ?: "—"

// --- Static dispatch ---
open class Base
class Derived : Base()

fun Base.name() = "Base"
fun Derived.name() = "Derived"

val item: Base = Derived()
item.name()      // "Base" — chosen by the DECLARED type, not the runtime type`,
                    notes: 'Members always win over extensions with the same signature, and extensions are picked by the static type. If you need polymorphism, you need a real member.'
                },
                {
                    type: 'prose',
                    html: '<p>Extensions are how Kotlin adds to types it cannot change — the entire standard library on collections is extension functions, as is Android KTX. They are also scoped: an extension is only visible where it is imported, so you can add a domain-specific helper to <code>String</code> without polluting every file.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Extension <em>properties</em> exist too, but they cannot hold state — there is nowhere to put it. They must be defined by a getter, which is why <code>val List&lt;T&gt;.lastIndex</code> is a computation rather than a field.</p>'
                }
            ],
            docs: [
                { title: 'Extensions', url: 'https://kotlinlang.org/docs/extensions.html', kind: 'guide' },
                { title: 'Android KTX', path: '/kotlin/ktx', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-extension-functions' }
            ]
        },

        {
            id: 'lambdas-and-higher-order',
            title: 'Lambdas and higher-order functions',
            importance: 'must-know',
            summary: 'Functions are values with types, which is what makes the trailing-lambda syntax everywhere in Kotlin possible.',
            interviewAngle: 'Asked directly, and it underpins every DSL question — Compose, Gradle KTS and coroutine builders all rely on this.',
            buildsOn: ['function-basics'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Higher-order function',
                    important: true,
                    html: '<p>A function that takes a function as a parameter, returns one, or both. Its parameter has a <strong>function type</strong> such as <code>(Int) -> String</code> or <code>suspend () -> Unit</code>.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Function types, lambdas and the trailing-lambda rule',
                    code: `// A function type as a parameter
fun <T> retry(times: Int, block: () -> T): T {
    repeat(times - 1) {
        runCatching { return block() }
    }
    return block()
}

// Trailing lambda: a final function parameter moves outside the parens.
// This single rule is why coroutine builders and Compose read like syntax.
retry(3) { api.load() }

// Implicit 'it' for a single parameter
listOf(1, 2, 3).map { it * 2 }

// Function references instead of a lambda
listOf("a", "bb").map(String::length)
val printer: (String) -> Unit = ::println

// Returning a function — a closure over 'factor'
fun multiplier(factor: Int): (Int) -> Int = { it * factor }
val triple = multiplier(3)
triple(5)   // 15

// Receiver lambda: 'this' inside the block is a StringBuilder.
// This is the mechanism behind every Kotlin DSL.
fun build(block: StringBuilder.() -> Unit) = StringBuilder().apply(block).toString()
build { append("hi"); append("!") }`
                },
                {
                    type: 'comparison',
                    title: 'Two lambda shapes',
                    left: '(T) -> R',
                    right: 'T.() -> R',
                    rows: [
                        { aspect: 'Receiver bound to', left: 'A parameter — <code>it</code>', right: '<code>this</code>' },
                        { aspect: 'Reads like', left: 'A callback', right: 'A block of configuration' },
                        { aspect: 'Used by', left: '<code>let</code>, <code>also</code>, <code>map</code>', right: '<code>apply</code>, <code>run</code>, <code>with</code>, DSLs' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>A lambda that captures a variable is a <strong>closure</strong>: it keeps the variable alive, not a copy of its value. Unlike Java, Kotlin lets you capture and mutate a <code>var</code> — which is convenient and is also how a lambda can accidentally hold a reference to an Activity for as long as the lambda lives.</p>'
                }
            ],
            docs: [
                { title: 'Higher-order functions and lambdas', url: 'https://kotlinlang.org/docs/lambdas.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-higher-order-functions' },
                { topicId: 'kotlin', questionId: 'kotlin-lambdas' },
                { topicId: 'kotlin', questionId: 'kotlin-function-returning-function' }
            ]
        },

        {
            id: 'inline-functions',
            title: 'inline, noinline, crossinline and reified',
            importance: 'must-know',
            summary: 'Inlining copies the function body to the call site, which removes lambda allocation and unlocks reified generics.',
            interviewAngle: 'A four-part question that most candidates can only half-answer. Reified is the part worth being sure of.',
            buildsOn: ['lambdas-and-higher-order'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Every lambda is normally an object. A higher-order function called in a loop therefore allocates, and on Android that used to matter a great deal. <code>inline</code> tells the compiler to copy the function’s body — and its lambdas’ bodies — directly into the call site, so no object exists at all.</p>'
                },
                {
                    type: 'types',
                    title: 'The four modifiers',
                    items: [
                        {
                            name: 'inline',
                            html: '<p>On the function. Copies the body to every call site, eliminating the lambda object and the call overhead.</p>',
                            whenToUse: 'small functions taking lambdas — the entire collection API is inline'
                        },
                        {
                            name: 'noinline',
                            html: '<p>On one lambda parameter of an inline function. Keeps <em>that</em> lambda as a real object, because inlined lambdas cannot be stored or passed on.</p>',
                            whenToUse: 'you need to save the lambda in a field or hand it to another function'
                        },
                        {
                            name: 'crossinline',
                            html: '<p>On a lambda parameter. Keeps it inlined but forbids a non-local <code>return</code> from it — required when the lambda will be executed from inside another context, such as a <code>Runnable</code>.</p>',
                            whenToUse: 'the lambda is invoked indirectly rather than called straight through'
                        },
                        {
                            name: 'reified',
                            html: '<p>On a type parameter of an inline function. Because the body is copied to the call site, the concrete type is known there, so <code>T</code> survives erasure and <code>is T</code> and <code>T::class</code> become legal.</p>',
                            whenToUse: 'you need the type at runtime — the classic case is a typed <code>startActivity</code> or JSON parse'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'reified, and why it needs inline',
                    code: `// Without reified you must pass the class explicitly:
fun <T> fromJson(json: String, type: Class<T>): T = gson.fromJson(json, type)
fromJson(json, User::class.java)

// With reified the type parameter survives to runtime:
inline fun <reified T> fromJson(json: String): T = gson.fromJson(json, T::class.java)
val user: User = fromJson(json)

// The Android idiom this enables:
inline fun <reified T : Activity> Context.start() =
    startActivity(Intent(this, T::class.java))

context.start<ProfileActivity>()

// crossinline: the lambda runs inside a Runnable, so a bare 'return'
// from it would have nowhere sensible to go.
inline fun onUi(crossinline block: () -> Unit) {
    Handler(Looper.getMainLooper()).post { block() }
}`,
                    notes: 'Generics are erased on the JVM, so a normal function cannot know <code>T</code> at runtime. Inlining sidesteps erasure rather than defeating it — the type is substituted at compile time.'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>inline</code> is not free. A large inline function called from many places multiplies bytecode, which costs method count and instruction cache. The compiler warns when inlining a function with no lambda parameters, because there is nothing to gain. Inline for the lambda, not for speed.</p>'
                }
            ],
            docs: [
                { title: 'Inline functions', url: 'https://kotlinlang.org/docs/inline-functions.html', kind: 'guide' },
                { title: 'Generics and type erasure', url: 'https://kotlinlang.org/docs/generics.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-inline-function' },
                { topicId: 'kotlin', questionId: 'kotlin-noinline' },
                { topicId: 'kotlin', questionId: 'kotlin-crossinline' },
                { topicId: 'kotlin', questionId: 'kotlin-reified' }
            ]
        },

        {
            id: 'scope-functions',
            title: 'The five scope functions',
            importance: 'must-know',
            summary: 'let, run, with, apply and also differ on two axes only: how the receiver is referred to, and what comes back.',
            interviewAngle: 'Very common. The strong answer is the two-axis rule, not five memorised descriptions.',
            buildsOn: ['lambdas-and-higher-order'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Five functions that all execute a block against an object. They look interchangeable and are not, but the difference reduces to two questions: <strong>is the object <code>this</code> or <code>it</code></strong>, and <strong>does the call return the object or the block’s result</strong>?</p>'
                },
                {
                    type: 'table',
                    title: 'The whole decision in one table',
                    headers: ['Function', 'Object is', 'Returns', 'Reach for it when'],
                    rows: [
                        ['<code>let</code>', '<code>it</code>', 'Block result', 'Null-checking, or transforming into something else'],
                        ['<code>run</code>', '<code>this</code>', 'Block result', 'Configure then compute a result'],
                        ['<code>with</code>', '<code>this</code>', 'Block result', 'Several calls on one object (not an extension)'],
                        ['<code>apply</code>', '<code>this</code>', 'The object', 'Configure and hand the object back'],
                        ['<code>also</code>', '<code>it</code>', 'The object', 'A side effect — logging, validation — in a chain']
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Each doing the job it is best at',
                    code: `// let — operate only when non-null, and transform
val length: Int? = name?.let { it.trim().length }

// apply — configure and return the same object
val intent = Intent(context, MainActivity::class.java).apply {
    putExtra("id", id)
    flags = Intent.FLAG_ACTIVITY_NEW_TASK
}

// also — a side effect that does not disturb the chain
val user = repository.load(id)
    .also { Log.d("app", "loaded \$it") }

// run — configure, then produce something else
val summary = report.run {
    normalise()
    "\$title: \$total"
}

// with — several calls on one receiver
with(binding) {
    title.text = user.name
    subtitle.text = user.email
}`
                },
                {
                    type: 'pitfall',
                    html: '<p>Nesting scope functions makes <code>this</code> and <code>it</code> ambiguous fast — an inner <code>apply</code> shadows the outer receiver, and the code silently configures the wrong object. If a block needs two receivers, name one of them: <code>let { user -> … }</code>.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Answer with the axes: <em>"<code>apply</code> and <code>also</code> return the receiver, the other three return the block. <code>let</code> and <code>also</code> use <code>it</code>, the other three use <code>this</code>."</em> Everything else follows.</p>'
                }
            ],
            docs: [
                { title: 'Scope functions', url: 'https://kotlinlang.org/docs/scope-functions.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-scope-functions' },
                { topicId: 'kotlin', questionId: 'kotlin-scope-functions-use-cases' },
                { topicId: 'kotlin', questionId: 'kotlin-apply-scope-function' },
                { topicId: 'kotlin', questionId: 'kotlin-let-scope-function' },
                { topicId: 'kotlin', questionId: 'kotlin-apply-vs-with' }
            ]
        }
    ]
};
