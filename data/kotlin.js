const kotlinData = {
    id: "kotlin",
    title: "Kotlin",
    subsections: null,
    keyTopics: [
        "const keyword advantages", "lateinit vs lazy initialization", "Inline functions (inline, noinline, crossinline)",
        "Companion objects", "Extension functions", "Data classes", "Sealed classes and use-cases",
        "Scope functions (let, run, with, apply, also)", "Reified keyword", "Higher-order functions and lambdas",
        "val vs var", "Visibility modifiers", "Singleton (object declaration)", "open vs public", "Labels in Kotlin",
        "Elvis operator (?:)", "== vs === (structural vs referential equality)", "Collections overview",
        "JvmStatic/JvmField/JvmOverloads annotations", "Delegates and delegation", "Coroutines basics",
        "Launch vs Async", "Coroutine Scope and Context", "Structured concurrency", "suspend vs blocking",
        "runBlocking", "Kotlin Flow (stateIn, shareIn, flatMap operators, collect vs collectLatest)",
        "Kotlin Multiplatform", "String vs StringBuffer vs StringBuilder", "Inline classes (value classes)",
        "Infix notation", "partition function", "associateBy (List to Map)", "Remove duplicates from array",
        "init block", "List vs Array", "Sequences vs Collections"
    ],
    questions: [
        {
            id: "kotlin-const-advantage",
            importance: "should-know",
            question: "What is the advantage of using const in Kotlin?",
            answer: "<p><strong>🔑 Compile-time constant</strong></p><ul><li><strong>const val</strong> is a <strong>compile-time constant</strong> — its value is inlined directly into every call site by the compiler, unlike a regular <code>val</code> whose value is resolved at runtime via a getter call.</li><li><strong>Performance</strong> — no getter invocation is generated, so reading a <code>const val</code> has zero runtime overhead.</li><li><strong>Restrictions</strong> — must be a top-level property, or a member of an <code>object</code>/<code>companion object</code>; must be initialized with a <code>String</code> or primitive type literal, never a function call or class instance.</li><li><strong>Use case</strong> — ideal for <code>API_KEY</code>, timeout values, annotation arguments (annotations require compile-time constants) and other fixed configuration values.</li><li><strong>Not usable</strong> inside a function body or as a local variable — only at the top level or inside an object.</li></ul><p><strong>🎯 Interview tip:</strong> if you need a value usable as an annotation parameter, it must be a <code>const val</code> — a plain <code>val</code> will not compile there.</p>",
            referenceLinks: [{ title: "Kotlin: Properties — const", url: "https://kotlinlang.org/docs/properties.html#compile-time-constants" }],
            tags: ["const", "val", "compile-time", "constants", "kotlin-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "const val vs val",
                code: "// Top-level or inside an object/companion object only\nconst val BASE_URL = \"https://api.example.com\"\nconst val MAX_RETRIES = 3\n\nclass NetworkConfig {\n    companion object {\n        const val TIMEOUT_MS = 30_000L   // inlined at every call site\n    }\n\n    // Regular val — resolved via getter call at runtime, not inlined\n    val requestId: String = java.util.UUID.randomUUID().toString()\n}\n\n@Deprecated(\"Use BASE_URL\")   // annotation args must be compile-time constants\nfun legacyCall() {}"
            }],
            subsection: null
        },
        {
            id: "kotlin-lateinit",
            importance: "must-know",
            question: "When to use lateinit keyword used in Kotlin?",
            answer: "<p><strong>🔑 Deferred initialization for non-null vars</strong></p><ul><li><strong>lateinit</strong> lets you declare a non-null <code>var</code> without initializing it immediately, promising the compiler it will be set before first use.</li><li><strong>Restrictions</strong> — only works on <code>var</code> (never <code>val</code>), must be a non-nullable type, and cannot be used with primitive types (<code>Int</code>, <code>Boolean</code>, etc.) since those are stored by value, not by reference.</li><li><strong>Common Android use cases</strong> — view bindings, dependency-injected fields (e.g. <code>@Inject lateinit var repository: UserRepository</code>), and objects set up in <code>onCreate()</code>/<code>setUp()</code> rather than the constructor.</li><li><strong>Risk</strong> — accessing the property before initialization throws <code>UninitializedPropertyAccessException</code> at runtime.</li><li><strong>Safety check</strong> — use <code>this::propertyName.isInitialized</code> to verify before access without triggering the exception.</li></ul><p><strong>🎯 Interview tip:</strong> prefer <code>lateinit</code> over a nullable type when null is never a valid business state — it keeps downstream code free of null-checks.</p>",
            referenceLinks: [{ title: "Kotlin: Late-initialized properties and variables", url: "https://kotlinlang.org/docs/properties.html#late-initialized-properties-and-variables" }],
            tags: ["lateinit", "null-safety", "initialization", "android", "properties"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "lateinit in an Activity",
                code: "class MainActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityMainBinding\n\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityMainBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n    }\n\n    private fun logIfReady() {\n        if (::binding.isInitialized) {\n            println(\"Binding ready\")\n        }\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-inline-function",
            importance: "must-know",
            question: "What is inline function in Kotlin?",
            answer: "<p><strong>🔑 Copy the body to the call site</strong></p><ul><li>An <strong>inline function</strong> tells the compiler to <strong>substitute the function's body (and its lambda parameters' bodies) directly at each call site</strong> instead of generating a real function call.</li><li><strong>Why</strong> — regular higher-order functions allocate a <code>Function</code> object for each lambda and incur a virtual call; inlining eliminates both, avoiding overhead for hot-path code.</li><li><strong>Non-local returns</strong> — because the lambda body is inlined into the caller, a bare <code>return</code> inside the lambda can exit the enclosing function directly — impossible with non-inline lambdas.</li><li><strong>Cost</strong> — inlining increases generated bytecode size (code duplicated at every call site), so it should be reserved for small, frequently-called functions, especially those taking lambda parameters.</li><li><strong>Standard library examples</strong> — <code>let</code>, <code>run</code>, <code>apply</code>, <code>also</code>, <code>with</code>, <code>forEach</code>, and <code>synchronized</code> are all <code>inline</code>.</li></ul><p><strong>🎯 Interview tip:</strong> the compiler only benefits from inlining when the function accepts one or more lambda parameters — inlining a function with no functional parameters buys nothing.</p>",
            referenceLinks: [{ title: "Kotlin: Inline functions", url: "https://kotlinlang.org/docs/inline-functions.html" }],
            tags: ["inline", "lambdas", "performance", "higher-order-functions", "compiler"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Inline function with non-local return",
                code: "inline fun <T> measureAndRun(label: String, block: () -> T): T {\n    val start = System.nanoTime()\n    val result = block()\n    println(\"$label took ${(System.nanoTime() - start) / 1_000_000}ms\")\n    return result\n}\n\nfun findFirstEven(nums: List<Int>): Int? {\n    measureAndRun(\"search\") {\n        for (n in nums) {\n            if (n % 2 == 0) return n   // non-local return — exits findFirstEven directly\n        }\n    }\n    return null\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-companion-object",
            importance: "must-know",
            question: "What are companion objects in Kotlin?",
            answer: "<p><strong>🔑 A singleton scoped to its class</strong></p><ul><li>A <strong>companion object</strong> is an object declared inside a class with the <code>companion</code> modifier — there is at most <strong>one per class</strong>, and its members are accessed via the class name directly (<code>ClassName.member</code>), similar to Java <code>static</code> members.</li><li><strong>Purpose</strong> — factory methods (e.g. <code>Fragment.newInstance()</code>), constants tied to the class, and utility functions that logically belong to the type but not to any instance.</li><li><strong>Interop with Java</strong> — by default a companion member compiles to <code>Companion.member()</code> from Java; annotate with <code>@JvmStatic</code> to expose it as a true static method.</li><li><strong>Can implement interfaces</strong> and be extended with extension functions, unlike a real Java <code>static</code> block.</li><li><strong>Naming</strong> — you may give it an explicit name (<code>companion object Factory { ... }</code>) or leave it unnamed, in which case it defaults to <code>Companion</code>.</li></ul><p><strong>🎯 Interview tip:</strong> a companion object is a real object instance — not compiler-erased like Java statics — so it can hold state and be passed around as a value.</p>",
            referenceLinks: [{ title: "Kotlin: Companion objects", url: "https://kotlinlang.org/docs/object-declarations.html#companion-objects" }],
            tags: ["companion-object", "object-declaration", "static", "factory-pattern", "singleton"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Companion object as a factory",
                code: "class UserFragment private constructor() : Fragment() {\n\n    companion object {\n        private const val ARG_USER_ID = \"user_id\"\n\n        @JvmStatic\n        fun newInstance(userId: String): UserFragment = UserFragment().apply {\n            arguments = Bundle().apply { putString(ARG_USER_ID, userId) }\n        }\n    }\n}\n\nval fragment = UserFragment.newInstance(\"42\")"
            }],
            subsection: null
        },
        {
            id: "kotlin-extension-functions",
            importance: "must-know",
            question: "What are extension functions in Kotlin?",
            answer: "<p><strong>🔑 Add behavior without inheritance</strong></p><ul><li>An <strong>extension function</strong> lets you add a new function to an existing class — even one you don't own, like a library or JDK type — without modifying its source or subclassing it.</li><li><strong>Syntax</strong> — <code>fun ReceiverType.functionName(args) { ... }</code>; inside the body, <code>this</code> refers to the receiver instance.</li><li><strong>Resolved statically</strong> — the extension called depends on the <strong>declared (compile-time) type</strong> of the expression, not the runtime type, so extension functions do not participate in true polymorphic dispatch.</li><li><strong>No real modification</strong> — under the hood, the compiler generates a static method taking the receiver as its first parameter; it cannot access private/protected members of the receiver class.</li><li><strong>Common use</strong> — utility helpers like <code>String.isValidEmail()</code>, <code>View.visible()</code>, or Android's own <code>Context.toast()</code>-style helpers.</li></ul><p><strong>🎯 Interview tip:</strong> if a member function and an extension function have the same signature, the <strong>member always wins</strong> — extensions cannot override existing members.</p>",
            referenceLinks: [{ title: "Kotlin: Extensions", url: "https://kotlinlang.org/docs/extensions.html" }],
            tags: ["extension-functions", "receiver", "kotlin-basics", "static-dispatch"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Extension functions on View and String",
                code: "fun View.visible() {\n    visibility = View.VISIBLE\n}\n\nfun View.gone() {\n    visibility = View.GONE\n}\n\nfun String.isValidEmail(): Boolean =\n    android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()\n\n// usage\nprogressBar.visible()\nif (emailField.text.toString().isValidEmail()) submitButton.visible() else submitButton.gone()"
            }],
            subsection: null
        },
        {
            id: "kotlin-data-classes",
            importance: "must-know",
            question: "What is a data class in Kotlin?",
            answer: "<p><strong>🔑 Value-holder classes with generated boilerplate</strong></p><ul><li>A <strong>data class</strong> (<code>data class User(val id: Int, val name: String)</code>) is a class whose primary purpose is to hold data — the compiler auto-generates <code>equals()</code>/<code>hashCode()</code>, <code>toString()</code>, <code>copy()</code>, and <code>componentN()</code> functions (for destructuring) based on the properties declared in the <strong>primary constructor</strong>.</li><li><strong>Requirements</strong> — the primary constructor must have at least one parameter, and all primary-constructor parameters must be marked <code>val</code> or <code>var</code>.</li><li><strong>Restrictions</strong> — a data class cannot be <code>abstract</code>, <code>open</code>, <code>sealed</code>, or <code>inner</code> (though since Kotlin 1.1 it can extend other classes/implement interfaces).</li><li><strong>copy()</strong> creates a shallow copy with selected properties changed, which pairs naturally with immutable state updates (e.g. in a <code>StateFlow</code> or Redux-style reducer).</li><li><strong>Equality/hashCode</strong> only consider properties declared in the primary constructor — properties declared in the class body are excluded.</li></ul><p><strong>🎯 Interview tip:</strong> data classes are the idiomatic replacement for Java's manually-written POJOs/DTOs and pair well with <code>sealed class</code> hierarchies for modeling UI state.</p>",
            referenceLinks: [{ title: "Kotlin: Data classes", url: "https://kotlinlang.org/docs/data-classes.html" }],
            tags: ["data-class", "equals", "hashcode", "copy", "destructuring"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Data class with copy() and destructuring",
                code: "data class User(val id: Int, val name: String, val isActive: Boolean = true)\n\nval user = User(1, \"Ada\")\nval renamed = user.copy(name = \"Ada Lovelace\")   // id and isActive unchanged\n\nval (id, name) = renamed   // destructuring via componentN()\nprintln(\"$id -> $name\")\nprintln(user == renamed)   // false: structural equality, name differs"
            }],
            subsection: null
        },
        {
            id: "kotlin-remove-duplicates",
            importance: "good-to-know",
            question: "How to remove duplicates from an array in Kotlin?",
            answer: "<p><strong>🔑 distinct() and its variants</strong></p><ul><li><strong>distinct()</strong> returns a new <code>List</code> keeping only the first occurrence of each element, using structural equality (<code>equals()</code>/<code>hashCode()</code>) to compare.</li><li><strong>distinctBy { selector }</strong> deduplicates using a derived key rather than the whole object — e.g. dedupe users by <code>id</code> while keeping full objects.</li><li><strong>toSet() / toMutableSet()</strong> converts the collection to a <code>Set</code>, which inherently has no duplicates — useful when order doesn't matter and you want set semantics going forward.</li><li><strong>toSortedSet()</strong> both deduplicates and orders the elements if a natural or custom ordering is desired.</li><li>All of these are <strong>immutable, non-mutating operations</strong> — they return a new collection rather than modifying the original array/list in place.</li></ul>",
            referenceLinks: [{ title: "Kotlin stdlib: distinct", url: "https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/distinct.html" }],
            tags: ["collections", "distinct", "duplicates", "array", "stdlib"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Removing duplicates",
                code: "val nums = intArrayOf(1, 2, 2, 3, 3, 3, 4)\nval unique = nums.distinct()                 // [1, 2, 3, 4]\n\ndata class User(val id: Int, val name: String)\nval users = listOf(User(1, \"Ada\"), User(1, \"Ada Dup\"), User(2, \"Grace\"))\nval byId = users.distinctBy { it.id }        // [User(1, Ada), User(2, Grace)]\n\nval asSet = nums.toSet()                     // {1, 2, 3, 4}"
            }],
            subsection: null
        },
        {
            id: "kotlin-jvmstatic",
            importance: "should-know",
            question: "What is a JvmStatic Annotation in Kotlin?",
            answer: "<p><strong>🔑 True static methods for Java callers</strong></p><ul><li><strong>@JvmStatic</strong> is applied to a function or property inside an <code>object</code> or <code>companion object</code> to instruct the compiler to additionally generate a genuine <code>static</code> method on the JVM, not just an instance method on the singleton.</li><li><strong>Without it</strong>, Java code must call companion members via <code>ClassName.Companion.method()</code>; <strong>with it</strong>, Java can call <code>ClassName.method()</code> directly, matching idiomatic Java static usage.</li><li><strong>Kotlin callers are unaffected</strong> — from Kotlin, <code>ClassName.method()</code> already works either way; <code>@JvmStatic</code> exists purely for Java interop.</li><li>Can be combined with <code>@JvmField</code> for static fields and <code>@JvmOverloads</code> for default-argument overloads to make a library fully Java-friendly.</li></ul><p><strong>🎯 Interview tip:</strong> this matters most when authoring an Android/Kotlin library consumed by Java modules or by legacy Java codebases mid-migration.</p>",
            referenceLinks: [{ title: "Kotlin: Static methods (Java interop)", url: "https://kotlinlang.org/docs/java-to-kotlin-interop.html#static-methods" }],
            tags: ["jvmstatic", "java-interop", "companion-object", "annotations"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "@JvmStatic for Java interop",
                code: "class Analytics {\n    companion object {\n        @JvmStatic\n        fun logEvent(name: String) {\n            println(\"event: $name\")\n        }\n    }\n}\n\n// From Java: Analytics.logEvent(\"click\");\n// Without @JvmStatic, Java would need: Analytics.Companion.logEvent(\"click\");"
            }],
            subsection: null
        },
        {
            id: "kotlin-jvmfield",
            importance: "should-know",
            question: "What is a JvmField Annotation in Kotlin?",
            answer: "<p><strong>🔑 Expose a property as a raw Java field</strong></p><ul><li><strong>@JvmField</strong> tells the compiler to expose a Kotlin property directly as a <strong>public field</strong> on the JVM, skipping the getter/setter it would normally generate.</li><li><strong>Requirements</strong> — the property must have no custom accessors, cannot be <code>private</code>, <code>protected</code>, or <code>open</code>, and cannot be <code>const</code> (use <code>const val</code> for that case instead) or a property of an interface.</li><li><strong>Why</strong> — reduces bytecode/reflection overhead in performance-sensitive code, and gives Java callers plain field access (<code>obj.field</code>) instead of <code>obj.getField()</code>.</li><li><strong>Trade-off</strong> — you lose Kotlin's ability to later add validation logic in a custom setter without a breaking API change.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Instance fields (Java interop)", url: "https://kotlinlang.org/docs/java-to-kotlin-interop.html#instance-fields" }],
            tags: ["jvmfield", "java-interop", "annotations", "properties"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-jvmoverloads",
            importance: "should-know",
            question: "What is a JvmOverloads Annotation in Kotlin?",
            answer: "<p><strong>🔑 Generate overloads for default parameters</strong></p><ul><li>Kotlin functions with <strong>default parameter values</strong> compile to a single method — Java has no concept of default arguments, so Java callers would be forced to pass every parameter explicitly.</li><li><strong>@JvmOverloads</strong> instructs the compiler to generate one additional overloaded method for each parameter that has a default value, progressively dropping trailing defaulted parameters.</li><li><strong>Applies to</strong> constructors, top-level functions, and member functions with default arguments.</li><li>Overloads are generated in <strong>declaration order</strong>, from the parameter list with the most defaults omitted to the full parameter list.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Overloads generation (Java interop)", url: "https://kotlinlang.org/docs/java-to-kotlin-interop.html#overloads-generation" }],
            tags: ["jvmoverloads", "java-interop", "default-parameters", "annotations"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "@JvmOverloads generating Java-friendly overloads",
                code: "class Toast @JvmOverloads constructor(\n    val message: String,\n    val durationMs: Long = 2000L,\n    val isError: Boolean = false\n)\n\n// Java can now call:\n// new Toast(\"Saved\")\n// new Toast(\"Saved\", 3000L)\n// new Toast(\"Saved\", 3000L, true)"
            }],
            subsection: null
        },
        {
            id: "kotlin-noinline",
            importance: "should-know",
            question: "What is noinline in Kotlin?",
            answer: "<p><strong>🔑 Opt a single lambda out of inlining</strong></p><ul><li>When a function is marked <code>inline</code>, <strong>all</strong> of its function-type parameters are inlined by default; <strong>noinline</strong> lets you exclude one specific lambda parameter from that inlining.</li><li><strong>Why you'd need it</strong> — an inlined lambda cannot be stored in a variable, returned, or passed to another non-inline function because it doesn't exist as a real object at runtime; marking it <code>noinline</code> makes it a real <code>Function</code> object again so it can be passed around.</li><li><strong>Trade-off</strong> — the <code>noinline</code> parameter loses the performance benefit (allocation + virtual call reintroduced) and cannot use non-local <code>return</code>.</li><li>Common when an inline function forwards one lambda to another API (e.g. storing it as a callback) while still inlining the rest for performance.</li></ul>",
            referenceLinks: [{ title: "Kotlin: noinline", url: "https://kotlinlang.org/docs/inline-functions.html#noinline" }],
            tags: ["noinline", "inline", "lambdas", "higher-order-functions"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "noinline lambda stored for later",
                code: "inline fun runTask(\n    onStart: () -> Unit,\n    noinline onComplete: () -> Unit   // stored, so cannot be inlined\n): () -> Unit {\n    onStart()\n    // ... work happens ...\n    return onComplete   // only possible because onComplete is a real object\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-crossinline",
            importance: "should-know",
            question: "What is crossinline in Kotlin?",
            answer: "<p><strong>🔑 Forbid non-local returns from a specific lambda</strong></p><ul><li><strong>crossinline</strong> marks a lambda parameter of an inline function as still inlined, but <strong>disallows a bare <code>return</code></strong> inside it — only <code>return@label</code> is permitted.</li><li><strong>Why it's needed</strong> — if the lambda is invoked from inside another execution context (e.g. inside a nested lambda, a separate object like a <code>Runnable</code>, or a coroutine builder), a non-local return could try to exit a function that has already returned, which is illegal.</li><li><strong>Typical case</strong> — an inline function that runs the lambda inside another higher-order function (like <code>thread { }</code> or an event listener registration), where the JVM call stack no longer matches the source-level nesting.</li></ul>",
            referenceLinks: [{ title: "Kotlin: crossinline", url: "https://kotlinlang.org/docs/inline-functions.html#returns" }],
            tags: ["crossinline", "inline", "lambdas", "non-local-return"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "crossinline preventing illegal non-local return",
                code: "inline fun runInBackground(crossinline action: () -> Unit) {\n    val runnable = Runnable {\n        action()   // action executes in a different call context —\n                   // a bare `return` here would be illegal without crossinline\n    }\n    Thread(runnable).start()\n}\n\nfun example() {\n    runInBackground {\n        println(\"working\")\n        // return   // COMPILE ERROR without crossinline\n        return@runInBackground   // allowed: labeled return only\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-scope-functions",
            importance: "must-know",
            question: "What are scope functions in Kotlin?",
            answer: "<p><strong>🔑 Execute a block in the context of an object</strong></p><ul><li><strong>Scope functions</strong> — <code>let</code>, <code>run</code>, <code>with</code>, <code>apply</code>, <code>also</code> — are stdlib <code>inline</code> functions that let you execute a lambda in the context of a receiver object, producing more concise, chainable code.</li><li>They differ along two axes: how the context object is referenced inside the lambda (<code>this</code> vs <code>it</code>) and what the expression <strong>returns</strong> (the context object itself, or the lambda's result).</li></ul><table><thead><tr><th>Function</th><th>Context reference</th><th>Returns</th><th>Typical use</th></tr></thead><tbody><tr><td><code>let</code></td><td><code>it</code></td><td>Lambda result</td><td>Null checks, scoping a variable, transforming a value</td></tr><tr><td><code>run</code></td><td><code>this</code></td><td>Lambda result</td><td>Object configuration + compute a result</td></tr><tr><td><code>with</code></td><td><code>this</code></td><td>Lambda result</td><td>Grouping calls on an object (not an extension)</td></tr><tr><td><code>apply</code></td><td><code>this</code></td><td>Context object</td><td>Object configuration / builder-style init</td></tr><tr><td><code>also</code></td><td><code>it</code></td><td>Context object</td><td>Side effects (logging) mid-chain</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> if you need the object back for further chaining, use <code>apply</code>/<code>also</code>; if you need a transformed/computed result, use <code>let</code>/<code>run</code>/<code>with</code>.</p>",
            referenceLinks: [{ title: "Kotlin: Scope functions", url: "https://kotlinlang.org/docs/scope-functions.html" }],
            tags: ["scope-functions", "let", "run", "with", "apply", "also"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-reified",
            importance: "must-know",
            question: "What is a reified keyword in Kotlin?",
            answer: "<p><strong>🔑 Access a generic type parameter at runtime</strong></p><ul><li>On the JVM, generic type information is normally <strong>erased</strong> at runtime — you can't write <code>T::class</code> or do <code>value is T</code> inside a regular generic function.</li><li><strong>reified</strong>, usable only on an <code>inline</code> function's type parameter, keeps the actual type available at each call site because the compiler substitutes the real type when it inlines the function body.</li><li>Enables patterns like <code>is T</code> checks, <code>T::class.java</code>, and <code>as T</code> casts directly inside a generic function.</li><li><strong>Common use</strong> — <code>inline fun &lt;reified T&gt; Gson.fromJson(json: String): T</code>, Android's <code>Intent</code> helpers, or <code>viewModels&lt;MyViewModel&gt;()</code>.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Reified type parameters", url: "https://kotlinlang.org/docs/inline-functions.html#reified-type-parameters" }],
            tags: ["reified", "generics", "inline", "type-erasure"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "reified type parameter",
                code: "inline fun <reified T> Gson.fromJson(json: String): T =\n    fromJson(json, T::class.java)\n\ninline fun <reified T : Activity> Context.startActivity() {\n    startActivity(Intent(this, T::class.java))\n}\n\n// usage — no Class<T> argument needed\nval user: User = gson.fromJson(jsonString)\ncontext.startActivity<ProfileActivity>()"
            }],
            subsection: null
        },
        {
            id: "kotlin-lateinit-vs-lazy",
            importance: "must-know",
            question: "What is the difference between lateinit and lazy in Kotlin?",
            answer: "<p><strong>⚖️ Two ways to defer initialization</strong></p><table><thead><tr><th>Aspect</th><th><code>lateinit</code></th><th><code>by lazy { }</code></th></tr></thead><tbody><tr><td>Applies to</td><td><code>var</code> only</td><td><code>val</code> only</td></tr><tr><td>Type</td><td>Non-null, non-primitive</td><td>Any type, including primitives</td></tr><tr><td>Initialization</td><td>Assigned manually, anywhere, any number of times</td><td>Computed once, automatically, on first access</td></tr><tr><td>Thread safety</td><td>None built in</td><td>Thread-safe by default (<code>SYNCHRONIZED</code> mode)</td></tr><tr><td>Access before ready</td><td>Throws <code>UninitializedPropertyAccessException</code></td><td>Not possible — value is computed on demand</td></tr><tr><td>Mechanism</td><td>Compiler flag on the backing field</td><td>Delegated property (<code>Lazy&lt;T&gt;</code> object)</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> use <code>lazy</code> when the value is derived from a pure computation; use <code>lateinit</code> when the value must be injected or assigned imperatively from outside (e.g. Android view binding, DI).</p>",
            referenceLinks: [{ title: "Kotlin: Late-initialized properties and variables", url: "https://kotlinlang.org/docs/properties.html#late-initialized-properties-and-variables" }],
            tags: ["lateinit", "lazy", "delegated-properties", "initialization"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-init-block",
            importance: "should-know",
            question: "What is an init block in Kotlin?",
            answer: "<p><strong>🔑 Initializer code tied to the primary constructor</strong></p><ul><li>An <strong>init block</strong> (<code>init { ... }</code>) contains initialization logic that runs as part of the <strong>primary constructor</strong>, since the primary constructor itself cannot contain a body.</li><li><strong>Execution order</strong> — a class can have multiple <code>init</code> blocks and property initializers; they all execute <strong>in the order they appear</strong> in the class body, top to bottom, interleaved with each other.</li><li><strong>Runs before</strong> any secondary constructor body — secondary constructors must delegate to the primary constructor (directly or transitively) via <code>this(...)</code>, so <code>init</code> blocks always run first.</li><li><strong>Common use</strong> — validating constructor arguments (e.g. <code>require(age &gt;= 0)</code>) or performing setup that depends on multiple properties.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Classes — initialization order", url: "https://kotlinlang.org/docs/classes.html#constructors" }],
            tags: ["init-block", "constructors", "initialization-order", "kotlin-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "init block execution order",
                code: "class Person(name: String) {\n    val firstProperty = \"First: $name\".also(::println)\n\n    init {\n        println(\"First init block: $name\")\n    }\n\n    val secondProperty = \"Second: ${name.length}\".also(::println)\n\n    init {\n        require(name.isNotBlank()) { \"name must not be blank\" }\n        println(\"Second init block\")\n    }\n}\n// Output order: First property -> First init -> Second property -> Second init"
            }],
            subsection: null
        },
        {
            id: "kotlin-equality-operators",
            importance: "must-know",
            question: "What is the difference between == and === in Kotlin?",
            answer: "<p><strong>⚖️ Structural vs referential equality</strong></p><table><thead><tr><th>Operator</th><th>Checks</th><th>Under the hood</th><th>Java equivalent</th></tr></thead><tbody><tr><td><code>==</code></td><td>Structural equality — are the contents equal?</td><td>Calls <code>a?.equals(b) ?: (b === null)</code>, null-safe</td><td><code>.equals()</code></td></tr><tr><td><code>!=</code></td><td>Structural inequality</td><td>Negated <code>equals()</code> call</td><td><code>!.equals()</code></td></tr><tr><td><code>===</code></td><td>Referential equality — same object in memory?</td><td>Direct reference comparison</td><td><code>==</code></td></tr><tr><td><code>!==</code></td><td>Referential inequality</td><td>Negated reference comparison</td><td><code>!=</code></td></tr></tbody></table><ul><li>For <strong>data classes</strong>, <code>==</code> uses the compiler-generated <code>equals()</code> based on primary-constructor properties, so two different instances with identical data are <code>==</code> but not <code>===</code>.</li><li>Boxed primitives can behave surprisingly with <code>===</code> due to JVM integer caching — always prefer <code>==</code> for value comparison.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Equality", url: "https://kotlinlang.org/docs/equality.html" }],
            tags: ["equality", "structural-equality", "referential-equality", "operators"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "== vs === on data classes",
                code: "data class Point(val x: Int, val y: Int)\n\nval a = Point(1, 2)\nval b = Point(1, 2)\nval c = a\n\nprintln(a == b)    // true  — same contents (structural)\nprintln(a === b)   // false — different instances\nprintln(a === c)   // true  — same reference"
            }],
            subsection: null
        },
        {
            id: "kotlin-higher-order-functions",
            importance: "must-know",
            question: "What are higher-order functions in Kotlin?",
            answer: "<p><strong>🔑 Functions as first-class values</strong></p><ul><li>A <strong>higher-order function</strong> is a function that either <strong>takes another function as a parameter</strong>, <strong>returns a function</strong>, or both — possible because Kotlin treats functions as first-class citizens with their own types (e.g. <code>(Int) -> Boolean</code>).</li><li><strong>Function types</strong> describe the shape: <code>(ParamTypes) -> ReturnType</code>; lambdas, anonymous functions, and function references (<code>::name</code>) can all be passed where a function type is expected.</li><li><strong>Stdlib examples</strong> — <code>map</code>, <code>filter</code>, <code>fold</code>, <code>forEach</code> all take a lambda parameter and are higher-order.</li><li>Frequently combined with <code>inline</code> to avoid the runtime cost of allocating a <code>Function</code> object per call.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Higher-order functions and lambdas", url: "https://kotlinlang.org/docs/lambdas.html" }],
            tags: ["higher-order-functions", "lambdas", "function-types", "functional-programming"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "A higher-order function",
                code: "fun <T, R> withRetry(times: Int, block: () -> R): R {\n    var lastError: Throwable? = null\n    repeat(times) {\n        try {\n            return block()\n        } catch (e: Throwable) {\n            lastError = e\n        }\n    }\n    throw lastError ?: IllegalStateException(\"retry failed\")\n}\n\nval result = withRetry(3) { fetchFromNetwork() }"
            }],
            subsection: null
        },
        {
            id: "kotlin-function-returning-function",
            importance: "should-know",
            question: "Write a Higher-Order Function that returns a function.",
            answer: "<p><strong>🔑 Functions producing functions (currying-style)</strong></p><ul><li>A function's return type can itself be a function type, e.g. <code>fun makeMultiplier(factor: Int): (Int) -> Int</code>, letting you build specialized functions from general ones.</li><li>The returned lambda forms a <strong>closure</strong>, capturing variables from the enclosing scope (like <code>factor</code> below) even after the outer function has returned.</li><li>This pattern underlies factory-style APIs, memoization helpers, and building composable validation/transform pipelines.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Function types", url: "https://kotlinlang.org/docs/lambdas.html#function-types" }],
            tags: ["higher-order-functions", "closures", "function-types", "lambdas"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Function returning a function (closure)",
                code: "fun makeMultiplier(factor: Int): (Int) -> Int {\n    return { value -> value * factor }   // closes over `factor`\n}\n\nval triple = makeMultiplier(3)\nval double = makeMultiplier(2)\n\nprintln(triple(10))   // 30\nprintln(double(10))   // 20"
            }],
            subsection: null
        },
        {
            id: "kotlin-lambdas",
            importance: "must-know",
            question: "What are Lambdas in Kotlin?",
            answer: "<p><strong>🔑 Anonymous, inline function literals</strong></p><ul><li>A <strong>lambda expression</strong> is an anonymous block of code that can be treated as a value: assigned to a variable, passed as an argument, or returned from a function — written as <code>{ params -> body }</code>.</li><li><strong>Implicit parameter</strong> — a single-parameter lambda can omit the parameter name and refer to it as <code>it</code>.</li><li><strong>Trailing lambda syntax</strong> — if a function's last parameter is a function type, the lambda can be written outside the parentheses (and the parentheses omitted entirely if it's the only argument) — this is what makes DSLs like <code>apply { }</code> and Compose read naturally.</li><li><strong>Closures</strong> — lambdas capture variables from their enclosing scope, including <code>var</code>s, which they can read and mutate.</li><li>Distinct from an <strong>anonymous function</strong> (<code>fun(x: Int): Int { return x }</code>), which supports multiple non-local returns and explicit return types but is used less often in idiomatic Kotlin.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Lambda expressions", url: "https://kotlinlang.org/docs/lambdas.html#lambda-expressions-and-anonymous-functions" }],
            tags: ["lambdas", "closures", "kotlin-basics", "functional-programming"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Lambda syntax variations",
                code: "val squares = listOf(1, 2, 3).map { it * it }             // implicit `it`\nval sums = listOf(1, 2, 3).map { n -> n + 1 }             // named param\n\nbutton.setOnClickListener { view -> handleClick(view) }   // trailing lambda\n\nvar counter = 0\nval increment = { counter++ }                             // captures `counter`\nrepeat(3) { increment() }\nprintln(counter)   // 3"
            }],
            subsection: null
        },
        {
            id: "kotlin-associateby",
            importance: "good-to-know",
            question: "How does associateBy work for List to Map conversion in Kotlin?",
            answer: "<p><strong>🔑 Turn a list into a lookup map</strong></p><ul><li><strong>associateBy { keySelector }</strong> builds a <code>Map&lt;K, T&gt;</code> from a <code>List&lt;T&gt;</code>, using the selector's result as the key and the <strong>original element</strong> as the value.</li><li>If multiple elements produce the same key, <strong>later elements overwrite earlier ones</strong> for that key — duplicates are silently dropped, not merged.</li><li><strong>associateBy(keySelector, valueTransform)</strong> — a two-lambda overload that also transforms the value, instead of keeping the whole element.</li><li>Related functions: <code>associate { it.key to it.value }</code> for full control over both key and value, and <code>associateWith { valueSelector }</code> which uses the <strong>elements themselves as keys</strong> and computes the value.</li></ul>",
            referenceLinks: [{ title: "Kotlin stdlib: associateBy", url: "https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/associate-by.html" }],
            tags: ["associateby", "collections", "map", "list", "stdlib"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "associateBy for List -> Map",
                code: "data class User(val id: Int, val name: String)\nval users = listOf(User(1, \"Ada\"), User(2, \"Grace\"), User(3, \"Alan\"))\n\nval byId: Map<Int, User> = users.associateBy { it.id }\nprintln(byId[2]?.name)   // Grace\n\nval nameById: Map<Int, String> = users.associateBy({ it.id }, { it.name })\nval usersById2: Map<User, Int> = users.associateWith { it.name.length }"
            }],
            subsection: null
        },
        {
            id: "kotlin-open-keyword",
            importance: "should-know",
            question: "What is the open keyword in Kotlin?",
            answer: "<p><strong>🔑 Kotlin classes and members are final by default</strong></p><ul><li>Unlike Java, Kotlin classes, member functions, and properties are <strong>final (non-overridable/non-inheritable) unless explicitly marked <code>open</code></strong> — a deliberate design choice to favor composition and prevent fragile base-class bugs.</li><li><code>open class Base</code> allows other classes to <code>: Base()</code> subclass it; <code>open fun foo()</code> allows a subclass to <code>override fun foo()</code> it.</li><li>Marking the class <code>open</code> alone does not open its members — <strong>each member you want overridable must itself be marked <code>open</code></strong>.</li><li><code>abstract</code> members are implicitly open (must be overridden); overriding a member with <code>override</code> makes it open for further overriding by default, unless the override is marked <code>final</code>.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Inheritance", url: "https://kotlinlang.org/docs/inheritance.html" }],
            tags: ["open", "inheritance", "final", "override"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "open class and members",
                code: "open class Animal(val name: String) {\n    open fun speak(): String = \"...\"\n}\n\nclass Dog(name: String) : Animal(name) {\n    override fun speak(): String = \"Woof\"\n}\n\n// class Cat : Dog(\"x\")  // ERROR: Dog isn't open, cannot be subclassed further"
            }],
            subsection: null
        },
        {
            id: "kotlin-internal-modifier",
            importance: "should-know",
            question: "What is the internal visibility modifier in Kotlin?",
            answer: "<p><strong>🔑 Module-scoped visibility</strong></p><ul><li><strong>internal</strong> makes a declaration visible to <strong>any code within the same module</strong> — a set of Kotlin files compiled together (a Gradle module, IntelliJ module, or Maven project) — but invisible outside it.</li><li>Sits between <code>public</code> (visible everywhere) and <code>private</code>/<code>protected</code> in scope, and is Kotlin's answer to Java's lack of a true module-visibility concept (Java's package-private has no direct Kotlin equivalent).</li><li><strong>Use case</strong> — expose implementation details to other files/classes in the same Gradle module (e.g. a library's internal helpers) while keeping them out of the module's public API surface for consumers.</li><li>Applies to classes, functions, properties, and constructors.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Visibility modifiers", url: "https://kotlinlang.org/docs/visibility-modifiers.html" }],
            tags: ["internal", "visibility-modifiers", "modules", "encapsulation"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-partition",
            importance: "good-to-know",
            question: "What is the partition filtering function in Kotlin?",
            answer: "<p><strong>🔑 Split a collection into two lists by a predicate</strong></p><ul><li><strong>partition { predicate }</strong> traverses a collection once and returns a <code>Pair&lt;List&lt;T&gt;, List&lt;T&gt;&gt;</code> — the first list holds elements where the predicate was <code>true</code>, the second holds the rest.</li><li>Semantically equivalent to calling <code>filter { predicate }</code> and <code>filterNot { predicate }</code> separately, but done in a <strong>single pass</strong>, which is more efficient.</li><li>Commonly destructured directly: <code>val (matched, unmatched) = list.partition { ... }</code>.</li></ul>",
            referenceLinks: [{ title: "Kotlin stdlib: partition", url: "https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/partition.html" }],
            tags: ["partition", "collections", "filter", "stdlib"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "partition into two lists",
                code: "val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8)\nval (even, odd) = numbers.partition { it % 2 == 0 }\n\nprintln(even)   // [2, 4, 6, 8]\nprintln(odd)    // [1, 3, 5, 7]"
            }],
            subsection: null
        },
        {
            id: "kotlin-infix-notation",
            importance: "good-to-know",
            question: "What is infix notation in Kotlin?",
            answer: "<p><strong>🔑 Call a function without a dot or parentheses</strong></p><ul><li><strong>Infix notation</strong> lets certain single-parameter member or extension functions be called as <code>receiver functionName argument</code> instead of <code>receiver.functionName(argument)</code>, reading more like natural language.</li><li><strong>Requirements</strong> — the function must be marked <code>infix</code>, be a member or extension function, take exactly <strong>one parameter</strong> with no default value, and not accept variable arguments (<code>vararg</code>).</li><li><strong>Standard library examples</strong> — <code>1 to \"one\"</code> (creates a <code>Pair</code>), <code>1 until 10</code>, <code>1 downTo 0</code>, <code>true and false</code>, <code>view setOnClick { }</code>-style DSL helpers.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Infix notation", url: "https://kotlinlang.org/docs/functions.html#infix-notation" }],
            tags: ["infix", "operators", "dsl", "kotlin-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Custom infix function",
                code: "infix fun Int.pow(exponent: Int): Int {\n    var result = 1\n    repeat(exponent) { result *= this }\n    return result\n}\n\nval value = 2 pow 10          // 1024, reads naturally\nval pair = \"key\" to \"value\"   // stdlib's infix `to`"
            }],
            subsection: null
        },
        {
            id: "kotlin-multiplatform",
            importance: "good-to-know",
            question: "How does the Kotlin Multiplatform work?",
            answer: "<p><strong>🔑 Share business logic across platforms, not UI</strong></p><ul><li><strong>Kotlin Multiplatform (KMP)</strong> lets you write shared code once — typically networking, data persistence, business/domain logic — and compile it for multiple targets: JVM/Android, iOS (via Kotlin/Native), JS/Wasm, and desktop.</li><li><strong>Source set structure</strong> — <code>commonMain</code> holds platform-agnostic code; <code>androidMain</code>, <code>iosMain</code>, etc. hold platform-specific implementations, all compiled from the same project.</li><li><strong>expect/actual mechanism</strong> — the common source set declares an <code>expect</code> function/class signature; each platform source set supplies a matching <code>actual</code> implementation, letting shared code call into platform APIs (e.g. file I/O, secure storage) without conditional logic.</li><li><strong>UI stays native by default</strong> — SwiftUI on iOS, Jetpack Compose or Views on Android — though Compose Multiplatform extends sharing to UI as an opt-in.</li><li><strong>Typical stack</strong> — Ktor for shared networking, SQLDelight/Room-KMP for shared persistence, kotlinx.coroutines/kotlinx.serialization for shared async and JSON handling.</li></ul>",
            referenceLinks: [{ title: "Kotlin Multiplatform overview", url: "https://kotlinlang.org/docs/multiplatform.html" }],
            tags: ["kotlin-multiplatform", "kmp", "expect-actual", "cross-platform"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "expect/actual in KMP",
                code: "// commonMain\nexpect fun currentPlatformName(): String\n\nclass Greeter {\n    fun greet(): String = \"Running on ${currentPlatformName()}\"\n}\n\n// androidMain\nactual fun currentPlatformName(): String = \"Android\"\n\n// iosMain\nactual fun currentPlatformName(): String = \"iOS\""
            }],
            subsection: null
        },
        {
            id: "kotlin-suspending-vs-blocking",
            importance: "must-know",
            question: "What is the difference between suspending and blocking in Kotlin Coroutines?",
            answer: "<p><strong>⚖️ Yielding a thread vs occupying it</strong></p><table><thead><tr><th>Aspect</th><th>Suspending</th><th>Blocking</th></tr></thead><tbody><tr><td>Thread behavior</td><td>Thread is <strong>freed</strong> to run other coroutines while waiting</td><td>Thread is <strong>held hostage</strong>, cannot do other work</td></tr><tr><td>Marker</td><td><code>suspend</code> function, e.g. <code>delay()</code></td><td>Regular function, e.g. <code>Thread.sleep()</code></td></tr><tr><td>Scalability</td><td>Thousands of coroutines can share few threads</td><td>Each blocked call ties up a whole OS thread</td></tr><tr><td>Cancellation</td><td>Cooperative — checks for cancellation at suspension points</td><td>Not cancellable by coroutine machinery</td></tr><tr><td>Caller requirement</td><td>Callable only from another <code>suspend</code> function or a coroutine builder</td><td>Callable from anywhere</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> calling a blocking function like <code>Thread.sleep()</code> inside a coroutine on a shared dispatcher (e.g. <code>Dispatchers.Main</code>) can starve every other coroutine on that thread — always prefer the suspending equivalent, or move blocking work to <code>Dispatchers.IO</code>.</p>",
            referenceLinks: [{ title: "Kotlin Coroutines basics", url: "https://kotlinlang.org/docs/coroutines-basics.html" }],
            tags: ["suspend", "blocking", "coroutines", "concurrency"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-runblocking",
            importance: "should-know",
            question: "What is runBlocking in Kotlin Coroutines?",
            answer: "<p><strong>🔑 Bridge between blocking and coroutine code</strong></p><ul><li><strong>runBlocking</strong> is a coroutine builder that <strong>blocks the current thread</strong> until the coroutine it launches — and all its children — complete.</li><li><strong>Purpose</strong> — it exists specifically to call suspend functions from non-suspend, non-coroutine contexts, most commonly a <code>main()</code> function or a unit test.</li><li><strong>Not for production Android code</strong> — using it on the main thread (e.g. inside an <code>onClick</code>) would freeze the UI, defeating the purpose of coroutines; prefer <code>lifecycleScope.launch</code>/<code>viewModelScope.launch</code> instead.</li><li><strong>Testing</strong> — largely superseded by <code>runTest</code> from <code>kotlinx-coroutines-test</code>, which additionally auto-skips <code>delay()</code> calls for fast, deterministic tests.</li></ul>",
            referenceLinks: [{ title: "Kotlin Coroutines: bridging blocking and non-blocking worlds", url: "https://kotlinlang.org/docs/coroutines-basics.html#bridging-blocking-and-non-blocking-worlds" }],
            tags: ["runblocking", "coroutines", "coroutine-builders", "testing"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "runBlocking as an entry point",
                code: "fun main() = runBlocking {\n    println(\"Start on ${Thread.currentThread().name}\")\n    val data = fetchData()   // suspend function\n    println(\"Got: $data\")\n}\n\nsuspend fun fetchData(): String {\n    delay(500)\n    return \"result\"\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-structured-concurrency",
            importance: "should-know",
            question: "What is the meaning of structured concurrency in Kotlin Coroutines?",
            answer: "<p><strong>🔑 Coroutines can't outlive their scope</strong></p><ul><li><strong>Structured concurrency</strong> means every coroutine runs inside a <code>CoroutineScope</code> that defines its lifetime — a coroutine launched from a scope becomes a <strong>child</strong> of that scope and cannot outlive it.</li><li><strong>Cancellation propagates down</strong> — cancelling the parent scope cancels every child coroutine automatically, eliminating leaked background work (a common source of bugs with raw threads).</li><li><strong>Exceptions propagate up</strong> — an unhandled exception in a child cancels its parent and siblings by default (unless a <code>SupervisorJob</code> is used), so failures are never silently swallowed.</li><li><strong>Completion waits for children</strong> — a scope is not considered complete until all of its child coroutines finish, making the code's control flow mirror its concurrency structure.</li><li><strong>Android application</strong> — <code>viewModelScope</code> and <code>lifecycleScope</code> tie coroutine lifetime to a <code>ViewModel</code>/<code>LifecycleOwner</code>, automatically cancelling work when the owner is cleared/destroyed.</li></ul><p><strong>🎯 Interview tip:</strong> structured concurrency is Kotlin's core answer to the &quot;forgot to cancel a background thread&quot; class of memory leaks.</p>",
            referenceLinks: [{ title: "Kotlin Coroutines: structured concurrency", url: "https://kotlinlang.org/docs/coroutines-basics.html#structured-concurrency" }],
            tags: ["structured-concurrency", "coroutines", "coroutinescope", "cancellation"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Structured concurrency",
                columns: 3,
                nodes: [
                    { label: "Parent Scope", type: "terminal" },
                    { label: "Child: launch A" },
                    { label: "Child: async B" },
                    { label: "Scope Cancelled?", type: "decision" },
                    { label: "Cancel A + B" },
                    { label: "Child Throws?", type: "decision" },
                    { label: "Cancel Parent + Siblings" },
                    { label: "All Children Done", type: "terminal" },
                    { label: "Scope Completes", type: "terminal" }
                ],
                connections: [
                    { from: 0, to: 1 },
                    { from: 0, to: 2 },
                    { from: 1, to: 3 },
                    { from: 2, to: 5 },
                    { from: 3, to: 4, label: "yes" },
                    { from: 5, to: 6, label: "yes" },
                    { from: 1, to: 7 },
                    { from: 2, to: 7 },
                    { from: 7, to: 8 }
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "Cancelling a parent cancels its children",
                code: "class SyncViewModel : ViewModel() {\n    fun startSync() {\n        viewModelScope.launch {          // parent\n            launch { uploadPhotos() }    // child A\n            launch { downloadFeed() }    // child B\n        }\n    }\n\n    override fun onCleared() {\n        // viewModelScope is cancelled automatically here,\n        // cancelling child A and child B — no manual bookkeeping needed\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-string-vs-stringbuffer-vs-stringbuilder",
            importance: "should-know",
            question: "What is the difference between String, StringBuffer, and StringBuilder?",
            answer: "<p><strong>⚖️ Immutable value vs mutable builders</strong></p><table><thead><tr><th>Type</th><th>Mutability</th><th>Thread safety</th><th>Performance</th><th>Use case</th></tr></thead><tbody><tr><td><code>String</code></td><td>Immutable — every modification creates a new object</td><td>Inherently thread-safe (immutable)</td><td>Slow for repeated concatenation (many intermediate objects)</td><td>Fixed or rarely-changed text</td></tr><tr><td><code>StringBuffer</code></td><td>Mutable, in place</td><td>Thread-safe — synchronized methods</td><td>Slower than <code>StringBuilder</code> due to synchronization overhead</td><td>Mutable text shared across threads (rare today)</td></tr><tr><td><code>StringBuilder</code></td><td>Mutable, in place</td><td>Not thread-safe</td><td>Fastest — no synchronization</td><td>Building strings in a loop, single-threaded contexts</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> in idiomatic Kotlin, <code>StringBuilder</code> is the default choice for programmatic string building (e.g. inside <code>buildString { }</code>); <code>StringBuffer</code> is essentially legacy from Java.</p>",
            referenceLinks: [{ title: "Java: StringBuilder", url: "https://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html" }],
            tags: ["string", "stringbuilder", "stringbuffer", "immutability", "performance"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "buildString for efficient concatenation",
                code: "val report = buildString {\n    append(\"Report\\n\")\n    for (i in 1..3) {\n        append(\"Line $i\\n\")   // mutated in place via StringBuilder\n    }\n}\nprintln(report)"
            }],
            subsection: null
        },
        {
            id: "kotlin-val-vs-var",
            importance: "must-know",
            question: "What is the difference between val and var in Kotlin?",
            answer: "<p><strong>⚖️ Read-only reference vs mutable reference</strong></p><table><thead><tr><th>Aspect</th><th><code>val</code></th><th><code>var</code></th></tr></thead><tbody><tr><td>Reassignment</td><td>Not allowed after initialization</td><td>Allowed any number of times</td></tr><tr><td>Java equivalent</td><td><code>final</code> variable</td><td>Regular variable</td></tr><tr><td>Underlying object mutability</td><td>Unaffected — a <code>val list = mutableListOf()</code> can still have items added</td><td>Same — mutability of the object is independent of the reference keyword</td></tr><tr><td>Custom accessors</td><td>Only a custom <code>get()</code></td><td>Custom <code>get()</code> and <code>set()</code></td></tr><tr><td>Default choice</td><td>Preferred — encourages immutability</td><td>Only when reassignment is genuinely needed (e.g. loop counters, accumulators)</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> &quot;<code>val</code> means read-only reference, not a deeply immutable object&quot; is a common interview trap — a <code>val</code> holding a <code>MutableList</code> can still be mutated in place.</p>",
            referenceLinks: [{ title: "Kotlin: Variables", url: "https://kotlinlang.org/docs/basic-syntax.html#variables" }],
            tags: ["val", "var", "immutability", "kotlin-basics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "val reference vs mutable content",
                code: "val list = mutableListOf(1, 2, 3)\nlist.add(4)          // fine: mutating contents, not reassigning the reference\n// list = mutableListOf(5)   // ERROR: val cannot be reassigned\n\nvar count = 0\ncount += 1            // fine: var can be reassigned"
            }],
            subsection: null
        },
        {
            id: "kotlin-lateinit-check-initialized",
            importance: "should-know",
            question: "How to check if a lateinit variable has been initialized?",
            answer: "<p><strong>🔑 The isInitialized reflection property</strong></p><ul><li>Kotlin exposes <strong><code>this::propertyName.isInitialized</code></strong> (or <code>ClassName::propertyName.isInitialized</code> for a top-level/companion property) — a boolean that reports whether a <code>lateinit</code> property has been assigned a value yet, <strong>without throwing</strong>.</li><li>Requires a <strong>property reference</strong> (<code>::</code>) — you cannot call <code>isInitialized</code> on the property value itself.</li><li>Only usable when the check is performed <strong>inside the same module</strong> for a property declared elsewhere, or anywhere for a property of the enclosing class/file — it relies on reflection-backed compiler support.</li><li>Prevents the alternative of wrapping every access in a <code>try/catch</code> for <code>UninitializedPropertyAccessException</code>.</li></ul>",
            referenceLinks: [{ title: "Kotlin: isInitialized", url: "https://kotlinlang.org/docs/properties.html#checking-whether-a-lateinit-var-is-initialized" }],
            tags: ["lateinit", "isinitialized", "null-safety", "reflection"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Checking lateinit initialization",
                code: "class ProfileActivity : AppCompatActivity() {\n    lateinit var binding: ActivityProfileBinding\n\n    override fun onDestroy() {\n        super.onDestroy()\n        if (::binding.isInitialized) {\n            binding.root.removeAllViews()\n        }\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-lazy-initialization",
            importance: "should-know",
            question: "How to do lazy initialization of variables in Kotlin?",
            answer: "<p><strong>🔑 by lazy { } delegated property</strong></p><ul><li><strong>by lazy { block }</strong> defers computing a <code>val</code>'s value until its <strong>first access</strong>, caching the result for all subsequent reads.</li><li>Implemented as a <strong>delegated property</strong> — the <code>lazy()</code> function returns a <code>Lazy&lt;T&gt;</code> instance that stores the computed value after the first call.</li><li><strong>Thread-safety modes</strong> (passed as an argument to <code>lazy(mode) { }</code>): <code>LazyThreadSafetyMode.SYNCHRONIZED</code> (default — locked, safe across threads), <code>PUBLICATION</code> (may compute more than once under contention, but only one result is kept), and <code>NONE</code> (no locking — fastest, but only safe if guaranteed single-threaded use).</li><li><strong>Use case</strong> — expensive computations or object graphs that may never be needed (e.g. a heavy parser or regex only built if a feature flag is on).</li></ul>",
            referenceLinks: [{ title: "Kotlin: Lazy properties", url: "https://kotlinlang.org/docs/delegated-properties.html#lazy-properties" }],
            tags: ["lazy", "delegated-properties", "initialization", "thread-safety"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "lazy with thread-safety mode",
                code: "class ImageProcessor {\n    val regexCache: Regex by lazy(LazyThreadSafetyMode.NONE) {\n        println(\"Compiling regex...\")\n        Regex(\"[a-z]+\\\\.png$\")\n    }\n}\n\nval processor = ImageProcessor()\n// Regex not compiled yet\nprintln(processor.regexCache.matches(\"photo.png\"))   // compiled here, then cached"
            }],
            subsection: null
        },
        {
            id: "kotlin-visibility-modifiers",
            importance: "must-know",
            question: "What are the visibility modifiers in Kotlin?",
            answer: "<p><strong>🔑 Four levels of access control</strong></p><table><thead><tr><th>Modifier</th><th>Top-level scope</th><th>Class member scope</th></tr></thead><tbody><tr><td><code>public</code> (default)</td><td>Visible everywhere</td><td>Visible everywhere the class is visible</td></tr><tr><td><code>internal</code></td><td>Visible within the same module</td><td>Visible within the same module</td></tr><tr><td><code>protected</code></td><td>Not applicable</td><td>Visible in the class and its subclasses only</td></tr><tr><td><code>private</code></td><td>Visible only within the same file</td><td>Visible only within the declaring class</td></tr></tbody></table><ul><li>Kotlin has no direct equivalent of Java's <strong>package-private</strong> — packages are purely for namespacing, not visibility, which is why <code>internal</code> (module-scoped) exists instead.</li><li>Default visibility, if omitted, is always <code>public</code>.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Visibility modifiers", url: "https://kotlinlang.org/docs/visibility-modifiers.html" }],
            tags: ["visibility-modifiers", "public", "private", "protected", "internal"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-static-equivalent",
            importance: "should-know",
            question: "What is the equivalent of Java static methods in Kotlin?",
            answer: "<p><strong>🔑 Kotlin has no static keyword</strong></p><ul><li>Kotlin removed <code>static</code> entirely; the two idiomatic replacements are <strong>top-level functions</strong> (declared directly in a file, outside any class — genuinely compiled as static JVM methods) and <strong>companion object members</strong> (for functions/constants logically tied to a specific class).</li><li>An <code>object</code> declaration is the equivalent of a class that is entirely static — a true singleton with a single instance.</li><li>For Java callers that need a real <code>static</code> method rather than <code>Companion.method()</code>, add <code>@JvmStatic</code> to the companion member.</li><li><strong>Preference in idiomatic Kotlin</strong> — top-level functions are favored over companion objects when the function doesn't need access to class internals, since companion objects still allocate a singleton instance.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Static methods (Java interop)", url: "https://kotlinlang.org/docs/java-to-kotlin-interop.html#static-methods" }],
            tags: ["static", "companion-object", "top-level-functions", "java-interop"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Top-level function vs companion object",
                code: "// Top-level — file: StringUtils.kt\nfun String.capitalizeWords(): String =\n    split(\" \").joinToString(\" \") { it.replaceFirstChar(Char::uppercase) }\n\n// Companion object — tied to the class\nclass Config {\n    companion object {\n        fun default(): Config = Config()\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-singleton",
            importance: "must-know",
            question: "How to create a Singleton class in Kotlin?",
            answer: "<p><strong>🔑 The object keyword</strong></p><ul><li>Kotlin builds singleton support directly into the language — <strong><code>object ClassName { ... }</code></strong> declares a class with exactly one instance, lazily created on first access and thread-safe by default.</li><li>No boilerplate double-checked locking or private constructor + static <code>getInstance()</code> like classic Java singletons require.</li><li>Can implement interfaces, extend classes, and hold state, just like a regular class — accessed simply via <code>ClassName.member</code>.</li><li><strong>Android use case</strong> — a shared <code>object AppDatabase</code> reference, an in-memory cache, or an analytics dispatcher, though for anything requiring lifecycle awareness or testability, dependency injection (Hilt) with a <code>@Singleton</code>-scoped class is generally preferred over a hard <code>object</code>.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Object declarations", url: "https://kotlinlang.org/docs/object-declarations.html" }],
            tags: ["singleton", "object-declaration", "design-patterns"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Singleton via object declaration",
                code: "object AppSettings {\n    var isDarkMode: Boolean = false\n    private val cache = mutableMapOf<String, String>()\n\n    fun put(key: String, value: String) {\n        cache[key] = value\n    }\n}\n\n// Usage — same instance everywhere\nAppSettings.isDarkMode = true\nAppSettings.put(\"lang\", \"en\")"
            }],
            subsection: null
        },
        {
            id: "kotlin-open-vs-public",
            importance: "should-know",
            question: "What is the difference between open and public in Kotlin?",
            answer: "<p><strong>⚖️ Two orthogonal concepts: visibility vs inheritability</strong></p><table><thead><tr><th>Aspect</th><th><code>public</code></th><th><code>open</code></th></tr></thead><tbody><tr><td>Controls</td><td><strong>Visibility</strong> — who can see/reference the declaration</td><td><strong>Inheritability</strong> — whether the class/member can be subclassed or overridden</td></tr><tr><td>Default</td><td>Yes — the default visibility if none is specified</td><td>No — every class/member is final unless marked <code>open</code></td></tr><tr><td>Applies to</td><td>Classes, functions, properties, constructors</td><td>Classes, functions, properties</td></tr><tr><td>Can combine?</td><td colspan=\"2\">Yes — a member is commonly both <code>public</code> and <code>open</code> at once, they're independent modifiers</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> a class can be <code>public</code> but not <code>open</code> (visible everywhere, but final) — this combination is actually Kotlin's default for every class you write.</p>",
            referenceLinks: [{ title: "Kotlin: Inheritance", url: "https://kotlinlang.org/docs/inheritance.html" }],
            tags: ["open", "public", "visibility-modifiers", "inheritance"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-apply-scope-function",
            importance: "should-know",
            question: "What is the apply scope function and its use cases?",
            answer: "<p><strong>🔑 Configure an object, get the object back</strong></p><ul><li><strong>apply</strong> executes its lambda with the receiver available as <code>this</code>, and <strong>returns the receiver itself</strong> — making it ideal for configuring an object right where it's created.</li><li><strong>Signature</strong> — <code>inline fun &lt;T&gt; T.apply(block: T.() -&gt; Unit): T</code>.</li><li><strong>Classic use case</strong> — object initialization/builder-style setup: creating a view, an <code>Intent</code>, or a data object and setting several properties in one expression.</li><li>Because it returns <code>this</code>, calls can be <strong>chained</strong> immediately after the <code>apply</code> block, unlike <code>also</code> which is functionally similar but uses <code>it</code> instead of <code>this</code>.</li></ul>",
            referenceLinks: [{ title: "Kotlin: apply", url: "https://kotlinlang.org/docs/scope-functions.html#apply" }],
            tags: ["apply", "scope-functions", "object-configuration"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "apply for object configuration",
                code: "val intent = Intent(this, DetailActivity::class.java).apply {\n    putExtra(\"user_id\", 42)\n    putExtra(\"source\", \"deep_link\")\n    flags = Intent.FLAG_ACTIVITY_NEW_TASK\n}\nstartActivity(intent)"
            }],
            subsection: null
        },
        {
            id: "kotlin-let-scope-function",
            importance: "should-know",
            question: "What is the let scope function and its use cases?",
            answer: "<p><strong>🔑 Scope a value and null-check it in one step</strong></p><ul><li><strong>let</strong> executes its lambda with the receiver available as <code>it</code>, and <strong>returns the lambda's result</strong> — useful for transforming a value or scoping it to a smaller block.</li><li><strong>Signature</strong> — <code>inline fun &lt;T, R&gt; T.let(block: (T) -&gt; R): R</code>.</li><li><strong>Most common use case</strong> — combined with the safe-call operator, <code>nullable?.let { ... }</code> executes the block only when the value is non-null, avoiding an explicit <code>if (x != null)</code> check.</li><li><strong>Other uses</strong> — limiting a variable's scope to avoid polluting the outer namespace, and chaining transformations (<code>value.let(::transform).let(::validate)</code>).</li></ul>",
            referenceLinks: [{ title: "Kotlin: let", url: "https://kotlinlang.org/docs/scope-functions.html#let" }],
            tags: ["let", "scope-functions", "null-safety"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "let for null-safety",
                code: "fun showUserName(name: String?) {\n    name?.let {\n        // executes only if name is non-null; `it` is smart-cast to String\n        println(\"Hello, $it\")\n    } ?: println(\"No user\")\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-scope-functions-use-cases",
            importance: "should-know",
            question: "Explain the use-case of let, run, with, also, apply in Kotlin.",
            answer: "<p><strong>🔑 Picking the right scope function for the job</strong></p><table><thead><tr><th>Scenario</th><th>Best fit</th><th>Why</th></tr></thead><tbody><tr><td>Null-check + transform a nullable value</td><td><code>let</code></td><td><code>it</code> reference reads naturally with <code>?.let</code>, returns transformed result</td></tr><tr><td>Configure an object right after creation</td><td><code>apply</code></td><td>Returns the receiver, so setup reads as one expression</td></tr><tr><td>Configure an object <strong>and</strong> compute a derived result</td><td><code>run</code></td><td>Same <code>this</code> context as <code>apply</code>, but returns the lambda result instead</td></tr><tr><td>Group several calls on an object that isn't the receiver expression</td><td><code>with</code></td><td>Not an extension function — takes the object as an explicit argument</td></tr><tr><td>Insert a side effect (logging, debug print) mid-chain</td><td><code>also</code></td><td>Returns the receiver unchanged, so the chain continues undisturbed</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> a good rule of thumb — need <strong>this</strong> back? use <code>apply</code>/<code>also</code>. Need a <strong>computed value</strong> back? use <code>let</code>/<code>run</code>/<code>with</code>.</p>",
            referenceLinks: [{ title: "Kotlin: Function selection", url: "https://kotlinlang.org/docs/scope-functions.html#function-selection" }],
            tags: ["scope-functions", "let", "run", "with", "also", "apply"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-apply-vs-with",
            importance: "should-know",
            question: "How to choose between apply and with in Kotlin?",
            answer: "<p><strong>⚖️ Extension function vs regular function</strong></p><table><thead><tr><th>Aspect</th><th><code>apply</code></th><th><code>with</code></th></tr></thead><tbody><tr><td>Called as</td><td>Extension: <code>receiver.apply { }</code></td><td>Regular function: <code>with(receiver) { }</code></td></tr><tr><td>Context reference</td><td><code>this</code></td><td><code>this</code></td></tr><tr><td>Returns</td><td>The receiver itself</td><td>The lambda's result</td></tr><tr><td>Works with nullable receiver + safe call</td><td>Yes — <code>obj?.apply { }</code></td><td>No — <code>with</code> takes the object as an argument, not a receiver, so no <code>?.</code> chaining</td></tr><tr><td>Typical use</td><td>Chained object configuration, especially returning it from a function</td><td>Grouping several calls on an already non-null object, when you don't need it back</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> if the object is nullable, or you want to keep chaining afterward, reach for <code>apply</code>; if you just need to group calls and get a computed answer, use <code>with</code>.</p>",
            referenceLinks: [{ title: "Kotlin: with", url: "https://kotlinlang.org/docs/scope-functions.html#with" }],
            tags: ["apply", "with", "scope-functions"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "apply vs with",
                code: "// apply — returns the receiver, chainable, works with nullable\nval view = TextView(context).apply {\n    text = \"Hello\"\n    textSize = 16f\n}\n\n// with — returns the lambda result, receiver passed as argument\nval summary = with(view) {\n    \"$text (${textSize}sp)\"\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-list-vs-array",
            importance: "should-know",
            question: "What is the difference between List and Array types in Kotlin?",
            answer: "<p><strong>⚖️ Fixed-size raw arrays vs collection-framework lists</strong></p><table><thead><tr><th>Aspect</th><th><code>Array</code></th><th><code>List</code></th></tr></thead><tbody><tr><td>Size</td><td>Fixed at creation</td><td><code>List</code> read-only view is fixed; <code>MutableList</code> can grow/shrink</td></tr><tr><td>Mutability of elements</td><td>Always mutable via index (<code>arr[i] = x</code>)</td><td>Depends: <code>List</code> is read-only, <code>MutableList</code> allows <code>set</code>/<code>add</code>/<code>remove</code></td></tr><tr><td>Primitives</td><td>Specialized types avoid boxing: <code>IntArray</code>, <code>DoubleArray</code>, etc.</td><td>Elements of primitive type are always boxed (e.g. <code>List&lt;Int&gt;</code> boxes each <code>Int</code>)</td></tr><tr><td>Variance</td><td>Invariant (<code>Array&lt;String&gt;</code> is not an <code>Array&lt;Any&gt;</code>)</td><td><code>List&lt;out T&gt;</code> is covariant — <code>List&lt;String&gt;</code> is a <code>List&lt;Any&gt;</code></td></tr><tr><td>Underlying type</td><td>JVM array (interop with Java arrays, varargs)</td><td>Kotlin collection interface, backed by <code>ArrayList</code> etc.</td></tr><tr><td>When to use</td><td>Interop with Java APIs expecting arrays, performance-critical primitive-heavy code</td><td>General-purpose collections — the idiomatic default in Kotlin code</td></tr></tbody></table>",
            referenceLinks: [{ title: "Kotlin: Arrays", url: "https://kotlinlang.org/docs/arrays.html" }],
            tags: ["list", "array", "collections", "variance"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Array vs List",
                code: "val intArray: IntArray = intArrayOf(1, 2, 3)   // unboxed primitives\nintArray[0] = 99                                // mutable by index, fixed size\n\nval list: List<Int> = listOf(1, 2, 3)          // read-only, boxed Ints\nval mutable: MutableList<Int> = mutableListOf(1, 2, 3)\nmutable.add(4)                                  // can grow"
            }],
            subsection: null
        },
        {
            id: "kotlin-labels",
            importance: "should-know",
            question: "What are Labels in Kotlin?",
            answer: "<p><strong>🔑 Named break/continue/return targets</strong></p><ul><li>A <strong>label</strong> (<code>loop@ for (...)</code>) marks a loop or lambda expression with an identifier so <code>break</code>, <code>continue</code>, or <code>return</code> can target it explicitly instead of only the nearest enclosing construct.</li><li><strong>Loop labels</strong> — <code>break@loop</code> exits the labeled outer loop directly from a nested inner loop; <code>continue@loop</code> skips to the labeled loop's next iteration.</li><li><strong>Lambda labels</strong> — inside a non-inline lambda, a bare <code>return</code> isn't allowed (no non-local return); <code>return@labelName</code> exits just that lambda invocation, returning to the caller. Every inline function call implicitly gets a label matching the function's name for this purpose.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Break and continue labels", url: "https://kotlinlang.org/docs/returns.html#break-and-continue-labels" }],
            tags: ["labels", "break", "continue", "return", "loops"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Labeled break and labeled return",
                code: "outer@ for (i in 1..3) {\n    for (j in 1..3) {\n        if (j == 2) continue@outer\n        if (i == 3) break@outer\n        println(\"i=$i j=$j\")\n    }\n}\n\nlistOf(1, 2, 3, 4).forEach {\n    if (it == 3) return@forEach   // skips just this iteration\n    println(it)\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-coroutines-basics",
            importance: "should-know",
            question: "What are Coroutines in Kotlin?",
            answer: "<p><strong>🔑 Lightweight concurrency via suspendable computations</strong></p><ul><li><strong>Coroutines</strong> are Kotlin's concurrency primitive — units of work that can <strong>suspend</strong> execution at defined points and resume later, without blocking the underlying OS thread.</li><li><strong>Lightweight</strong> — thousands of coroutines can run on a small pool of threads because a suspended coroutine releases its thread instead of holding it, unlike a blocked thread.</li><li><strong>suspend functions</strong> mark where suspension can occur; they compile (via the Kotlin compiler's continuation-passing transform) into state machines that can pause and resume.</li><li><strong>Coroutine builders</strong> — <code>launch</code> (fire-and-forget, returns <code>Job</code>), <code>async</code> (returns a <code>Deferred&lt;T&gt;</code> result), and <code>runBlocking</code> (bridges blocking code) all start new coroutines within a <code>CoroutineScope</code>.</li><li><strong>Library</strong> — provided by <code>kotlinx.coroutines</code>, not the language core, though <code>suspend</code> itself is a language keyword.</li></ul>",
            referenceLinks: [{ title: "Kotlin Coroutines overview", url: "https://kotlinlang.org/docs/coroutines-overview.html" }, { title: "Android: Coroutines on Android", url: "https://developer.android.com/kotlin/coroutines" }],
            tags: ["coroutines", "suspend", "concurrency", "kotlinx-coroutines"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Basic coroutine usage",
                code: "class UserViewModel(private val repo: UserRepository) : ViewModel() {\n    fun loadUser(id: String) {\n        viewModelScope.launch {\n            val user = repo.fetchUser(id)   // suspend call, no thread blocked\n            _uiState.value = UiState.Success(user)\n        }\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-coroutine-scope",
            importance: "should-know",
            question: "What is Coroutine Scope?",
            answer: "<p><strong>🔑 Ties coroutines to a lifetime</strong></p><ul><li>A <strong>CoroutineScope</strong> is an interface holding a <code>CoroutineContext</code> that defines the lifecycle boundary for the coroutines launched within it — every <code>launch</code>/<code>async</code> call needs a scope to run in.</li><li><strong>Enforces structured concurrency</strong> — cancelling the scope cancels every coroutine started from it; the scope isn't considered finished until all its children complete.</li><li><strong>CoroutineScope() factory</strong> creates a new independent scope with a given context, typically including a <code>Job</code> to track its children.</li><li><strong>coroutineScope { }</strong> (lowercase, a suspend function) creates a child scope that suspends the caller until all its children finish — useful for grouping concurrent work inside a suspend function.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Coroutine context and dispatchers", url: "https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html" }],
            tags: ["coroutinescope", "coroutines", "structured-concurrency"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "coroutineScope for concurrent child work",
                code: "suspend fun loadDashboard(): Dashboard = coroutineScope {\n    val profile = async { fetchProfile() }\n    val feed = async { fetchFeed() }\n    Dashboard(profile.await(), feed.await())\n    // coroutineScope suspends here until both children complete\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-coroutine-scopes-android",
            importance: "should-know",
            question: "What are the scopes in Kotlin Coroutines used in Android?",
            answer: "<p><strong>🔑 Lifecycle-aware scopes built for Android</strong></p><ul><li><strong>viewModelScope</strong> — a <code>CoroutineScope</code> extension on <code>ViewModel</code> (from <code>androidx.lifecycle</code>), automatically cancelled when the <code>ViewModel</code>'s <code>onCleared()</code> is called; runs on <code>Dispatchers.Main.immediate</code> by default.</li><li><strong>lifecycleScope</strong> — tied to a <code>LifecycleOwner</code> (Activity/Fragment), cancelled when the lifecycle reaches <code>DESTROYED</code>; often paired with <code>repeatOnLifecycle(Lifecycle.State.STARTED)</code> to safely collect flows only while the UI is visible.</li><li><strong>GlobalScope</strong> — application-lifetime scope, <strong>not tied to any component</strong>; strongly discouraged in app code because it bypasses structured concurrency and easily leaks work.</li><li><strong>Custom scopes</strong> — e.g. a repository-level <code>CoroutineScope(SupervisorJob() + Dispatchers.IO)</code> for work that should outlive a single screen but still be cancellable.</li></ul>",
            referenceLinks: [{ title: "Android: Coroutines and lifecycle-aware scopes", url: "https://developer.android.com/topic/libraries/architecture/coroutines" }],
            tags: ["viewmodelscope", "lifecyclescope", "coroutines", "android"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "viewModelScope and lifecycleScope",
                code: "class ProfileViewModel : ViewModel() {\n    fun refresh() {\n        viewModelScope.launch { /* cancelled on onCleared() */ }\n    }\n}\n\nclass ProfileFragment : Fragment() {\n    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n        viewLifecycleOwner.lifecycleScope.launch {\n            repeatOnLifecycle(Lifecycle.State.STARTED) {\n                viewModel.uiState.collect { render(it) }\n            }\n        }\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-coroutine-context",
            importance: "should-know",
            question: "What is Coroutine Context?",
            answer: "<p><strong>🔑 An indexed set of coroutine configuration elements</strong></p><ul><li><strong>CoroutineContext</strong> is a persistent, immutable collection of elements that configure how a coroutine runs — each element has a unique <code>Key</code>, similar to a type-indexed map.</li><li><strong>Common elements</strong> — <code>Job</code> (lifecycle/cancellation), a <code>CoroutineDispatcher</code> (which thread(s), e.g. <code>Dispatchers.Main</code>/<code>IO</code>/<code>Default</code>), <code>CoroutineName</code> (debug label), and <code>CoroutineExceptionHandler</code> (uncaught exception handling).</li><li><strong>Combined with +</strong> — contexts are merged with the plus operator; an element with the same key on the right overrides one on the left, e.g. <code>Dispatchers.IO + CoroutineName(\"sync\")</code>.</li><li><strong>Inheritance</strong> — a child coroutine inherits its parent's context by default, except its <code>Job</code>, which becomes a new child <code>Job</code> linked to the parent's for structured concurrency.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Coroutine context and dispatchers", url: "https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html" }],
            tags: ["coroutinecontext", "dispatchers", "job", "coroutines"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "CoroutineContext composition",
                columns: 2,
                nodes: [
                    { label: "Job", type: "terminal" },
                    { label: "Dispatcher (IO)", type: "terminal" },
                    { label: "CoroutineName", type: "terminal" },
                    { label: "ExceptionHandler", type: "terminal" },
                    { label: "Combined via +" },
                    { label: "CoroutineContext" }
                ],
                connections: [
                    { from: 0, to: 4 },
                    { from: 1, to: 4 },
                    { from: 2, to: 4 },
                    { from: 3, to: 4 },
                    { from: 4, to: 5 }
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "Composing a CoroutineContext",
                code: "val handler = CoroutineExceptionHandler { _, e -> println(\"Caught: $e\") }\nval context = Dispatchers.IO + CoroutineName(\"sync-job\") + handler\n\nCoroutineScope(context).launch {\n    println(coroutineContext[CoroutineName]?.name)   // \"sync-job\"\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-launch-vs-async",
            importance: "should-know",
            question: "What is the difference between launch and async in Kotlin Coroutines?",
            answer: "<p><strong>⚖️ Fire-and-forget vs a result you await</strong></p><table><thead><tr><th>Aspect</th><th><code>launch</code></th><th><code>async</code></th></tr></thead><tbody><tr><td>Returns</td><td><code>Job</code></td><td><code>Deferred&lt;T&gt;</code> (a <code>Job</code> that also holds a result)</td></tr><tr><td>Purpose</td><td>Fire-and-forget side effects</td><td>Compute and later retrieve a value with <code>.await()</code></td></tr><tr><td>Exception behavior</td><td>Propagates immediately to the parent scope</td><td>Stored in the <code>Deferred</code>; only re-thrown when <code>.await()</code> is called (unless top-level in a supervisor context)</td></tr><tr><td>Typical use</td><td>Updating UI state, writing to a database, logging</td><td>Running independent computations concurrently, then combining results</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> use multiple <code>async</code> calls inside a <code>coroutineScope { }</code> to run independent suspend calls truly in parallel, then <code>awaitAll()</code> them.</p>",
            referenceLinks: [{ title: "Kotlin: async", url: "https://kotlinlang.org/docs/composing-suspending-functions.html#async" }],
            tags: ["launch", "async", "deferred", "coroutine-builders"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "launch vs async",
                code: "viewModelScope.launch {\n    logEvent(\"screen_open\")   // fire-and-forget, no result needed\n}\n\nviewModelScope.launch {\n    val profile = async { repo.fetchProfile() }   // starts concurrently\n    val posts = async { repo.fetchPosts() }       // starts concurrently\n    render(profile.await(), posts.await())        // both awaited here\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-thread-sleep-vs-delay",
            importance: "must-know",
            question: "What is the difference between Thread.sleep() and delay() in Kotlin?",
            answer: "<p><strong>⚖️ Blocking a thread vs suspending a coroutine</strong></p><table><thead><tr><th>Aspect</th><th><code>Thread.sleep()</code></th><th><code>delay()</code></th></tr></thead><tbody><tr><td>Effect on thread</td><td>Blocks the calling thread entirely — no other work can run on it</td><td>Suspends the coroutine only — the thread is freed to run other coroutines</td></tr><tr><td>Caller type</td><td>Any function</td><td><code>suspend</code> function only</td></tr><tr><td>Cancellation</td><td>Not cancellable</td><td>Cancellable — throws <code>CancellationException</code> if the coroutine is cancelled while delayed</td></tr><tr><td>Cost at scale</td><td>Each sleeping call wastes a full OS thread</td><td>Thousands of delayed coroutines can share a small thread pool</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> calling <code>Thread.sleep()</code> inside a coroutine running on <code>Dispatchers.Main</code> freezes the UI just like it would in plain Android code — always use <code>delay()</code> in suspend functions instead.</p>",
            referenceLinks: [{ title: "Kotlin Coroutines basics", url: "https://kotlinlang.org/docs/coroutines-basics.html" }],
            tags: ["delay", "thread-sleep", "coroutines", "blocking"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "delay vs Thread.sleep",
                code: "suspend fun retryWithBackoff() {\n    repeat(3) { attempt ->\n        try {\n            return fetchData()\n        } catch (e: IOException) {\n            delay(1000L * (attempt + 1))   // suspends, thread stays free\n        }\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-inline-classes",
            importance: "good-to-know",
            question: "What are inline classes (value classes) in Kotlin?",
            answer: "<p><strong>🔑 Type safety without allocation overhead</strong></p><ul><li>A <strong>value class</strong> (<code>@JvmInline value class UserId(val value: String)</code>, formerly called an <em>inline class</em>) wraps a single value to give it a distinct, type-safe wrapper type, while the compiler tries to <strong>represent it as the underlying value at runtime</strong> rather than allocating a wrapper object.</li><li><strong>Requirement</strong> — exactly one property in the primary constructor; the class is implicitly <code>final</code> and cannot extend other classes (though it can implement interfaces).</li><li><strong>When boxing still happens</strong> — the value class is used as a generic type argument, stored in a nullable position, or referenced through an interface type — in those cases the JVM needs a real object.</li><li><strong>Use case</strong> — prevents mixing up primitives with the same underlying type but different meaning, e.g. distinguishing <code>UserId</code> from <code>OrderId</code> (both <code>String</code>) at compile time, with zero runtime cost in the common case.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Inline value classes", url: "https://kotlinlang.org/docs/inline-classes.html" }],
            tags: ["value-class", "inline-class", "type-safety", "jvminline"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "value class for type-safe IDs",
                code: "@JvmInline\nvalue class UserId(val value: String)\n\n@JvmInline\nvalue class OrderId(val value: String)\n\nfun fetchUser(id: UserId) { /* ... */ }\n\nfun example() {\n    val userId = UserId(\"u-1\")\n    // fetchUser(OrderId(\"o-1\"))   // COMPILE ERROR: type mismatch, catches bugs early\n    fetchUser(userId)\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-sealed-classes",
            importance: "must-know",
            question: "What are Sealed Classes in Kotlin?",
            answer: "<p><strong>🔑 Restricted, exhaustive class hierarchies</strong></p><ul><li>A <strong>sealed class</strong> restricts a type hierarchy so that <strong>all direct subclasses are known at compile time</strong> — they must be declared in the same module (and, prior to Kotlin 1.5, the same file).</li><li><strong>Exhaustive when</strong> — because the compiler knows every possible subtype, a <code>when</code> expression over a sealed class doesn't need an <code>else</code> branch to be exhaustive; adding a new subclass later will produce a compile error everywhere the <code>when</code> is not updated.</li><li><strong>vs enum</strong> — unlike an <code>enum</code>, each subclass can hold its own distinct set of properties and even be a class hierarchy itself (e.g. a <code>data class</code> or an <code>object</code>).</li><li><strong>sealed interface</strong> (Kotlin 1.5+) extends the same restriction to interfaces, useful when a type needs to implement multiple sealed hierarchies.</li><li>Implicitly <code>abstract</code> — a sealed class cannot be instantiated directly, only through its subclasses.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Sealed classes and interfaces", url: "https://kotlinlang.org/docs/sealed-classes.html" }],
            tags: ["sealed-class", "sealed-interface", "when-expression", "exhaustive"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Sealed class hierarchy",
                code: "sealed class Result<out T>\ndata class Success<T>(val data: T) : Result<T>()\ndata class Error(val message: String) : Result<Nothing>()\nobject Loading : Result<Nothing>()\n\nfun <T> render(result: Result<T>) = when (result) {\n    is Success -> println(\"Data: ${result.data}\")\n    is Error -> println(\"Error: ${result.message}\")\n    Loading -> println(\"Loading...\")\n    // no `else` needed — compiler verifies exhaustiveness\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-sealed-classes-android-use-cases",
            importance: "should-know",
            question: "What are common use-cases of Sealed classes in Android?",
            answer: "<p><strong>🔑 Modeling finite, exhaustive states</strong></p><ul><li><strong>UI state modeling</strong> — a screen's state as <code>sealed class UiState { object Loading; data class Success(val data: T); data class Error(val message: String) }</code>, rendered exhaustively in Compose or a <code>ViewModel</code> observer.</li><li><strong>One-time UI events</strong> — navigation events, snackbar triggers, or dialogs modeled as a sealed hierarchy emitted through a <code>SharedFlow</code>, avoiding stringly-typed event dispatch.</li><li><strong>Network/Resource wrapper</strong> — wrapping API responses (<code>Result.Success</code>/<code>Result.Failure</code>) to force callers to handle both success and error paths at compile time.</li><li><strong>Navigation destinations</strong> — representing each screen/route as a sealed class subclass, giving type-safe arguments instead of raw string routes.</li><li><strong>Form/validation state</strong> — representing a field's validation result as <code>Valid</code>/<code>Invalid(reason)</code> instead of a nullable error string.</li></ul>",
            referenceLinks: [{ title: "Android: Modeling UI state", url: "https://developer.android.com/topic/architecture/ui-layer/state-production" }],
            tags: ["sealed-class", "android", "ui-state", "mvvm"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Sealed class for screen UI state",
                code: "sealed interface ProfileUiState {\n    data object Loading : ProfileUiState\n    data class Loaded(val user: User) : ProfileUiState\n    data class Error(val throwable: Throwable) : ProfileUiState\n}\n\n@Composable\nfun ProfileScreen(state: ProfileUiState) {\n    when (state) {\n        ProfileUiState.Loading -> LoadingSpinner()\n        is ProfileUiState.Loaded -> ProfileContent(state.user)\n        is ProfileUiState.Error -> ErrorMessage(state.throwable.message)\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-collections",
            importance: "must-know",
            question: "Tell about the Collections in Kotlin.",
            answer: "<p><strong>🔑 Read-only interfaces over a mutable JVM implementation</strong></p><ul><li>Kotlin's collection framework separates <strong>read-only</strong> interfaces (<code>List</code>, <code>Set</code>, <code>Map</code>) from <strong>mutable</strong> ones (<code>MutableList</code>, <code>MutableSet</code>, <code>MutableMap</code>) at the type level, though at runtime both are typically backed by the same JVM classes (<code>ArrayList</code>, <code>LinkedHashSet</code>, <code>LinkedHashMap</code>).</li><li><strong>List</strong> — ordered, allows duplicates, indexed access; <strong>Set</strong> — unique elements, generally unordered except <code>LinkedHashSet</code>; <strong>Map</strong> — key-value pairs with unique keys.</li><li><strong>Factory functions</strong> — <code>listOf()</code>/<code>mutableListOf()</code>, <code>setOf()</code>/<code>mutableSetOf()</code>, <code>mapOf()</code>/<code>mutableMapOf()</code> create the respective collection, with an <code>arrayListOf()</code>/etc. family for the concrete implementation type.</li><li><strong>Rich stdlib</strong> — functional operators (<code>map</code>, <code>filter</code>, <code>fold</code>, <code>groupBy</code>, <code>sortedBy</code>) are all extension functions on these interfaces, enabling a fluent, chainable style.</li><li><strong>&quot;Read-only&quot; is not &quot;immutable&quot;</strong> — a <code>List</code> reference can still change if another reference to the same underlying <code>MutableList</code> mutates it elsewhere; true immutability requires an actually-immutable implementation.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Collections overview", url: "https://kotlinlang.org/docs/collections-overview.html" }],
            tags: ["collections", "list", "set", "map", "stdlib"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Collection basics",
                code: "val readOnly: List<Int> = listOf(1, 2, 3)\nval mutable: MutableList<Int> = mutableListOf(1, 2, 3)\nmutable.add(4)\n\nval uniqueSet: Set<String> = setOf(\"a\", \"b\", \"a\")   // {\"a\", \"b\"}\nval map: Map<String, Int> = mapOf(\"a\" to 1, \"b\" to 2)\n\nval evens = (1..10).filter { it % 2 == 0 }.map { it * it }"
            }],
            subsection: null
        },
        {
            id: "kotlin-elvis-operator",
            importance: "must-know",
            question: "What does ?: do in Kotlin? (Elvis Operator)",
            answer: "<p><strong>🔑 A concise fallback for null</strong></p><ul><li>The <strong>Elvis operator</strong> <code>?:</code> evaluates the left-hand expression; if it's <strong>non-null</strong>, that value is used, otherwise the <strong>right-hand expression</strong> is evaluated and used instead.</li><li>Shorthand for <code>if (x != null) x else y</code>, but as a single expression usable inline.</li><li><strong>Right side can be a control-flow expression</strong> — <code>return</code>, <code>throw</code>, or a function call that never returns — since Kotlin's <code>Nothing</code> type lets it type-check regardless of context: <code>val x = value ?: return</code>.</li><li>Frequently chained with the safe-call operator: <code>user?.address?.city ?: \"Unknown\"</code> walks a nullable chain and supplies a default at the end.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Elvis operator", url: "https://kotlinlang.org/docs/null-safety.html#elvis-operator" }],
            tags: ["elvis-operator", "null-safety", "operators"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Elvis operator patterns",
                code: "fun greet(name: String?): String = \"Hello, ${name ?: \"Guest\"}\"\n\nfun process(input: String?) {\n    val value = input ?: return   // early-exit if null\n    println(value.length)\n}\n\nval city = user?.address?.city ?: \"Unknown\""
            }],
            subsection: null
        },
        {
            id: "kotlin-coroutine-timeouts",
            importance: "should-know",
            question: "How do timeouts work in Kotlin Coroutines?",
            answer: "<p><strong>🔑 withTimeout and withTimeoutOrNull</strong></p><ul><li><strong>withTimeout(duration) { block }</strong> runs the block and, if it doesn't complete within the given time, <strong>cancels it and throws <code>TimeoutCancellationException</code></strong> (a subtype of <code>CancellationException</code>).</li><li><strong>withTimeoutOrNull(duration) { block }</strong> behaves the same but <strong>returns <code>null</code> instead of throwing</strong> when the timeout is exceeded — often more convenient when a timeout is an expected outcome, not an error.</li><li><strong>Cooperative cancellation still applies</strong> — the block must reach a suspension point (or check <code>isActive</code>/call <code>ensureActive()</code>) for the cancellation to actually take effect; a tight non-suspending CPU loop can ignore the timeout.</li><li><strong>Cleanup</strong> — resources should be released in a <code>finally</code> block or via <code>use { }</code>, since cancellation is delivered as an exception that unwinds the stack.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Cancellation and timeouts", url: "https://kotlinlang.org/docs/cancellation-and-timeouts.html" }],
            tags: ["timeout", "withtimeout", "coroutines", "cancellation"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Coroutine timeouts",
                code: "suspend fun fetchWithLimit(): String? =\n    withTimeoutOrNull(3000L) {\n        api.fetchSlowData()\n    }\n\nsuspend fun fetchOrThrow() {\n    try {\n        withTimeout(3000L) { api.fetchSlowData() }\n    } catch (e: TimeoutCancellationException) {\n        println(\"Timed out\")\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-combine-coroutine-results",
            importance: "should-know",
            question: "How do you combine multiple coroutine results?",
            answer: "<p><strong>🔑 Run concurrently with async, then await together</strong></p><ul><li><strong>async + await pattern</strong> — launch each independent unit of work with <code>async</code> inside a <code>coroutineScope { }</code>, then call <code>.await()</code> on each <code>Deferred</code> to collect results — the calls run <strong>concurrently</strong>, not sequentially.</li><li><strong>awaitAll(...)</strong> awaits a collection of <code>Deferred</code> values at once, propagating the first exception and cancelling the rest, which is cleaner than awaiting each one manually when they're homogeneous.</li><li><strong>Flow's combine/zip operators</strong> — for streaming results rather than one-shot suspend calls, <code>combine(flow1, flow2) { a, b -> ... }</code> emits whenever either flow emits, while <code>zip</code> pairs emissions positionally.</li><li><strong>coroutineScope { }</strong> ensures that if any child fails, the whole group is cancelled together — respecting structured concurrency.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Composing suspending functions", url: "https://kotlinlang.org/docs/composing-suspending-functions.html" }],
            tags: ["async", "awaitall", "coroutines", "combine"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Combining concurrent results",
                code: "suspend fun loadHome(): HomeData = coroutineScope {\n    val user = async { repo.fetchUser() }\n    val posts = async { repo.fetchPosts() }\n    val ads = async { repo.fetchAds() }\n\n    val (u, p, a) = awaitAll(user, posts, ads)\n    HomeData(u as User, p as List<Post>, a as List<Ad>)\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-coroutine-job",
            importance: "should-know",
            question: "What is a Job in Kotlin Coroutines?",
            answer: "<p><strong>🔑 A cancellable handle to a coroutine's lifecycle</strong></p><ul><li>A <strong>Job</strong> represents a cancellable unit of work with a lifecycle — it's what <code>launch</code> returns, and it's the element in a <code>CoroutineContext</code> that ties parent and child coroutines together for structured concurrency.</li><li><strong>Lifecycle states</strong> — New → Active → Completing → Completed, with Cancelling → Cancelled as an alternate path at any point after Active.</li><li><strong>Key operations</strong> — <code>job.cancel()</code> requests cancellation, <code>job.join()</code> suspends until the job completes, <code>job.isActive</code>/<code>isCompleted</code>/<code>isCancelled</code> inspect state.</li><li><strong>SupervisorJob</strong> is a variant where a child's failure does <strong>not</strong> cancel siblings or the parent — used when independent children shouldn't take each other down.</li><li>Every coroutine has exactly one <code>Job</code> in its context, forming a <strong>parent-child tree</strong> that structured concurrency relies on for cancellation propagation.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Job", url: "https://kotlinlang.org/docs/coroutines-basics.html#coroutines-are-light-weight" }],
            tags: ["job", "supervisorjob", "coroutines", "lifecycle"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Job lifecycle and SupervisorJob",
                code: "val job = viewModelScope.launch {\n    delay(1000)\n    println(\"done\")\n}\nprintln(job.isActive)   // true\njob.cancel()\n\n// SupervisorJob — sibling failures don't cancel each other\nval supervisor = CoroutineScope(SupervisorJob() + Dispatchers.IO)\nsupervisor.launch { throw RuntimeException(\"A failed\") }\nsupervisor.launch { println(\"B still runs\") }"
            }],
            subsection: null
        },
        {
            id: "kotlin-job-cancel-vs-scope-cancel",
            importance: "should-know",
            question: "What is the difference between job.cancel() and scope.cancel() in Coroutines?",
            answer: "<p><strong>⚖️ Cancelling one branch vs the whole tree</strong></p><table><thead><tr><th>Aspect</th><th><code>job.cancel()</code></th><th><code>scope.cancel()</code></th></tr></thead><tbody><tr><td>Scope</td><td>Cancels that specific <code>Job</code> and its children only</td><td>Cancels the <strong>entire scope</strong> — every coroutine launched from it</td></tr><tr><td>Reusability after</td><td>Sibling coroutines in the same scope keep running</td><td>The scope's underlying <code>Job</code> is cancelled — the scope becomes <strong>unusable</strong> for launching new coroutines</td></tr><tr><td>Typical target</td><td>A single background task the user opted out of (e.g. cancel one upload)</td><td>A whole component's lifecycle ending (e.g. <code>ViewModel.onCleared()</code>, which the framework already does for you)</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> calling <code>scope.cancel()</code> manually on <code>viewModelScope</code>/<code>lifecycleScope</code> is almost never necessary — the framework handles it; reach for <code>job.cancel()</code> on the specific <code>Job</code> returned by <code>launch</code> when you need finer-grained control.</p>",
            referenceLinks: [{ title: "Kotlin: Cancellation and timeouts", url: "https://kotlinlang.org/docs/cancellation-and-timeouts.html" }],
            tags: ["job", "coroutinescope", "cancellation", "coroutines"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "job.cancel vs scope.cancel",
                code: "val uploadJob = viewModelScope.launch { uploadFile() }\nval syncJob = viewModelScope.launch { syncData() }\n\nuploadJob.cancel()   // only the upload stops; syncJob keeps running\n\n// scope.cancel() would stop BOTH and disable viewModelScope entirely"
            }],
            subsection: null
        },
        {
            id: "kotlin-async-exception-no-await",
            importance: "should-know",
            question: "What happens if an exception is thrown inside an async coroutine, but await() is never called?",
            answer: "<p><strong>🔑 Depends on the parent Job type</strong></p><ul><li><strong>Under structured concurrency (normal Job)</strong> — an exception thrown inside an <code>async</code> block propagates <strong>immediately</strong> to its parent coroutine, regardless of whether <code>await()</code> is ever called; the parent scope is cancelled just like it would be for a failing <code>launch</code>.</li><li><strong>Under a SupervisorJob / top-level GlobalScope.async</strong> — the exception is <strong>stored inside the <code>Deferred</code></strong> and stays silent until something calls <code>.await()</code> on it — if nothing ever does, the exception is effectively swallowed and never surfaces.</li><li><strong>Practical risk</strong> — this makes <code>async</code> without an eventual <code>await()</code> a dangerous pattern for supervised/top-level scopes: failures can go completely unnoticed.</li><li><strong>Mitigation</strong> — always pair <code>async</code> with <code>await()</code>, or install a <code>CoroutineExceptionHandler</code> on the scope to at least log uncaught failures.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Exception handling", url: "https://kotlinlang.org/docs/exception-handling.html" }],
            tags: ["async", "exception-handling", "coroutines", "deferred"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Swallowed exception without await",
                code: "val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)\n\nscope.async {\n    throw RuntimeException(\"never seen!\")\n}\n// no .await() call — exception is silently held inside the Deferred\n\n// Under a plain Job (e.g. coroutineScope { async { ... } }),\n// the same throw would crash the parent immediately, await() or not."
            }],
            subsection: null
        },
        {
            id: "kotlin-debounce-coroutines",
            importance: "should-know",
            question: "How to implement debounce using Kotlin Coroutines?",
            answer: "<p><strong>🔑 Flow's built-in debounce operator</strong></p><ul><li>The idiomatic approach is <code>kotlinx.coroutines.flow.debounce(timeoutMillis)</code> — applied to a <code>Flow</code>, it emits an item only after the given quiet period has passed <strong>without a new emission</strong>, dropping intermediate values.</li><li><strong>Common source</strong> — a search box's text changes exposed as a <code>Flow&lt;String&gt;</code> (e.g. via <code>callbackFlow</code> or <code>MutableStateFlow</code>), debounced before triggering a network search.</li><li><strong>Manual debounce</strong> (without Flow) — cancel and relaunch a coroutine <code>Job</code> on every new event, using <code>delay()</code> before doing the actual work, so only the last scheduled job survives the quiet window.</li><li>Distinct from <code>throttleLatest</code>-style operators — debounce waits for silence, while throttling limits the <em>rate</em> of emissions regardless of gaps.</li></ul>",
            referenceLinks: [{ title: "Kotlin Flow: debounce", url: "https://kotlinlang.org/docs/flow.html#debounce" }],
            tags: ["debounce", "flow", "coroutines", "search"],
            hasDiagram: true,
            diagramType: "sequence",
            diagramConfig: {
                title: "Debounced search input",
                actors: ["User", "TextFlow", "debounce()", "Repository"],
                messages: [
                    { from: 0, to: 1, label: "type \"k\"" },
                    { from: 0, to: 1, label: "type \"ko\"" },
                    { from: 0, to: 1, label: "type \"kotlin\"" },
                    { from: 1, to: 2, label: "300ms silence" },
                    { from: 2, to: 3, label: "search(\"kotlin\")" },
                    { from: 3, to: 2, label: "results", dashed: true }
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "Debounced search with Flow",
                code: "private val query = MutableStateFlow(\"\")\n\nval results: Flow<List<Result>> = query\n    .debounce(300L)\n    .distinctUntilChanged()\n    .filter { it.length >= 2 }\n    .flatMapLatest { text -> repo.search(text) }\n\nfun onQueryChanged(text: String) {\n    query.value = text\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-coroutines-series-parallel",
            importance: "should-know",
            question: "How to run two coroutines in series and parallel in Kotlin?",
            answer: "<p><strong>🔑 Sequential suspend calls vs concurrent async</strong></p><ul><li><strong>Series (sequential)</strong> — simply call one <code>suspend</code> function after another in the same coroutine; each call suspends until it completes before the next line runs, exactly like normal sequential code.</li><li><strong>Parallel (concurrent)</strong> — wrap each call in its own <code>async { }</code> builder inside a <code>coroutineScope { }</code>; both start immediately and run concurrently, and you retrieve their results with <code>.await()</code> once both are needed.</li><li><strong>Total time</strong> — sequential execution takes the <strong>sum</strong> of each call's duration; parallel execution takes roughly the <strong>maximum</strong> of the two, since they overlap.</li><li><strong>When to choose which</strong> — use series when the second call depends on the first's result; use parallel when the calls are independent and both results are needed together.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Composing suspending functions", url: "https://kotlinlang.org/docs/composing-suspending-functions.html" }],
            tags: ["coroutines", "async", "parallel", "sequential"],
            hasDiagram: true,
            diagramType: "animation",
            diagramConfig: {
                title: "Series vs parallel execution",
                steps: [
                    "Series: call A, wait",
                    "Series: call B, wait",
                    "Series: total = A + B",
                    "Parallel: start A and B together",
                    "Parallel: await both",
                    "Parallel: total = max(A, B)"
                ]
            },
            codeSnippets: [{
                language: "kotlin",
                title: "Series vs parallel coroutine execution",
                code: "suspend fun runInSeries() {\n    val a = fetchA()   // waits fully before next line\n    val b = fetchB()\n    println(a + b)\n}\n\nsuspend fun runInParallel() = coroutineScope {\n    val a = async { fetchA() }   // starts immediately\n    val b = async { fetchB() }   // starts immediately, overlaps with A\n    println(a.await() + b.await())\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-yield",
            importance: "good-to-know",
            question: "What is yield in Kotlin Coroutines?",
            answer: "<p><strong>🔑 A cooperative suspension point</strong></p><ul><li><strong>yield()</strong> is a suspend function that <strong>voluntarily suspends</strong> the current coroutine, giving other coroutines on the same dispatcher a chance to run, and then resumes as soon as possible.</li><li><strong>Cancellation checkpoint</strong> — like other suspension points, <code>yield()</code> checks for cancellation; calling it periodically inside a CPU-heavy loop makes that loop cooperatively cancellable, since a tight non-suspending loop otherwise never checks.</li><li><strong>Sequence/iterator builders</strong> — inside a <code>sequence { }</code> or <code>iterator { }</code> builder, <code>yield(value)</code> has a different, related meaning: it emits a value and suspends the producer until the next value is requested (lazy generation, similar to Python generators).</li><li>Distinct from <code>delay()</code> — <code>yield()</code> doesn't wait for a specific time, it just relinquishes the thread momentarily.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Cancellation and timeouts", url: "https://kotlinlang.org/docs/cancellation-and-timeouts.html#making-computation-code-cancellable" }],
            tags: ["yield", "coroutines", "cancellation", "sequence"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "yield for cooperative cancellation",
                code: "suspend fun heavyComputation() {\n    for (i in 1..1_000_000) {\n        if (i % 1000 == 0) yield()   // allow cancellation + other coroutines to run\n        // CPU-bound work here\n    }\n}\n\nval naturals = sequence {\n    var n = 1\n    while (true) {\n        yield(n++)   // lazily produces the next value on demand\n    }\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-delegates",
            importance: "should-know",
            question: "What are Delegates in Kotlin?",
            answer: "<p><strong>🔑 Offload property or interface logic to another object</strong></p><ul><li><strong>Delegated properties</strong> — the <code>by</code> keyword hands off a property's <code>get()</code>/<code>set()</code> to a delegate object implementing <code>getValue()</code>/<code>setValue()</code>, letting reusable access patterns (laziness, observation, storage) be written once and applied anywhere.</li><li><strong>Standard delegates</strong> — <code>lazy</code> (deferred, cached computation), <code>Delegates.observable</code> (callback on every change), <code>Delegates.vetoable</code> (callback that can reject a change), and <code>Delegates.notNull</code> (like <code>lateinit</code> but works for any type, including generics).</li><li><strong>Class delegation</strong> (&quot;implementation by delegation&quot;) — a class can delegate an interface's implementation to another object via <code>class Foo(val impl: Bar) : Bar by impl</code>, avoiding manual forwarding of every method (composition over inheritance, built into the language).</li><li><strong>Map delegation</strong> — properties can even be backed by a <code>Map&lt;String, Any?&gt;</code>, useful for dynamic/JSON-like structures.</li></ul>",
            referenceLinks: [{ title: "Kotlin: Delegated properties", url: "https://kotlinlang.org/docs/delegated-properties.html" }],
            tags: ["delegates", "delegated-properties", "by-keyword", "lazy", "observable"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "Property delegation and class delegation",
                code: "class SettingsViewModel {\n    var theme: String by Delegates.observable(\"light\") { _, old, new ->\n        println(\"theme changed: $old -> $new\")\n    }\n}\n\ninterface Logger { fun log(msg: String) }\nclass ConsoleLogger : Logger { override fun log(msg: String) = println(msg) }\n\n// Delegates every Logger call to `impl` without writing forwarding methods\nclass Service(impl: Logger) : Logger by impl"
            }],
            subsection: null
        },
        {
            id: "kotlin-statein-vs-sharein",
            importance: "must-know",
            question: "What is the difference between stateIn and shareIn in Kotlin Flow?",
            answer: "<p><strong>⚖️ Converting a cold Flow into a hot, shareable one</strong></p><table><thead><tr><th>Aspect</th><th><code>stateIn</code></th><th><code>shareIn</code></th></tr></thead><tbody><tr><td>Result type</td><td><code>StateFlow&lt;T&gt;</code></td><td><code>SharedFlow&lt;T&gt;</code></td></tr><tr><td>Initial value</td><td><strong>Required</strong> — must supply one synchronously</td><td>Optional — no initial value needed</td></tr><tr><td>Replay behavior</td><td>Always replays exactly the latest value (replay = 1, conflated)</td><td>Configurable replay count (0, 1, or more)</td></tr><tr><td>Duplicate emissions</td><td>Conflated — only distinct-by-reference latest value matters for new collectors</td><td>Replays the configured buffer as-is, duplicates included</td></tr><tr><td>Typical use</td><td>Exposing UI state that always has a &quot;current&quot; value, e.g. from a <code>ViewModel</code></td><td>Sharing a stream of one-off events or a general hot stream among multiple collectors</td></tr></tbody></table><ul><li>Both take a <strong>SharingStarted</strong> policy — <code>Eagerly</code> (start immediately, keep running), <code>Lazily</code> (start on first collector, keep running), or <code>WhileSubscribed(stopTimeoutMs)</code> (start on first collector, stop shortly after the last one leaves — the common Android choice to avoid wasted work).</li></ul>",
            referenceLinks: [{ title: "Kotlin Flow: StateFlow and SharedFlow", url: "https://kotlinlang.org/docs/flow.html#stateflow-and-sharedflow" }],
            tags: ["statein", "sharein", "stateflow", "sharedflow", "flow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "stateIn in a ViewModel",
                code: "class FeedViewModel(repo: FeedRepository) : ViewModel() {\n    val uiState: StateFlow<List<Post>> = repo.observePosts()\n        .stateIn(\n            scope = viewModelScope,\n            started = SharingStarted.WhileSubscribed(5000L),\n            initialValue = emptyList()\n        )\n}"
            }],
            subsection: null
        },
        {
            id: "kotlin-flatmap-operators",
            importance: "should-know",
            question: "What is the difference between flatMapConcat, flatMapMerge, and flatMapLatest in Kotlin Flow?",
            answer: "<p><strong>⚖️ Three strategies for flattening a Flow of Flows</strong></p><table><thead><tr><th>Operator</th><th>Ordering</th><th>Concurrency</th><th>Typical use</th></tr></thead><tbody><tr><td><code>flatMapConcat</code></td><td>Preserves order — waits for each inner flow to finish before starting the next</td><td>Sequential, one inner flow at a time</td><td>Requests that must run strictly in order</td></tr><tr><td><code>flatMapMerge</code></td><td>Interleaved — emissions arrive as they occur</td><td>Concurrent, up to <code>concurrency</code> inner flows at once (default 16)</td><td>Independent parallel requests where order doesn't matter</td></tr><tr><td><code>flatMapLatest</code></td><td>Only the newest matters</td><td>Cancels the previous inner flow whenever a new value arrives from upstream</td><td>Search-as-you-type, always want the latest query's result only</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> <code>flatMapLatest</code> is the Flow equivalent of RxJava's <code>switchMap</code> — reach for it whenever a new upstream event should invalidate in-flight work from the previous one.</p>",
            referenceLinks: [{ title: "Kotlin Flow: Flattening flows", url: "https://kotlinlang.org/docs/flow.html#flattening-flows" }],
            tags: ["flatmapconcat", "flatmapmerge", "flatmaplatest", "flow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "flatMapLatest for search",
                code: "val searchResults: Flow<List<Result>> = queryFlow\n    .debounce(300)\n    .flatMapLatest { query ->\n        repo.search(query)   // previous in-flight search is cancelled automatically\n    }"
            }],
            subsection: null
        },
        {
            id: "kotlin-collect-vs-collectlatest",
            importance: "should-know",
            question: "What is the difference between collect and collectLatest in Kotlin Flow?",
            answer: "<p><strong>⚖️ Process every value vs only the latest</strong></p><table><thead><tr><th>Aspect</th><th><code>collect</code></th><th><code>collectLatest</code></th></tr></thead><tbody><tr><td>Guarantee</td><td>Every emitted value is fully processed by the collector block, in order</td><td>Only the <strong>latest</strong> value is guaranteed to finish processing — an in-progress block is cancelled if a new value arrives</td></tr><tr><td>Behavior on rapid emission</td><td>Collector block runs to completion for each value, potentially queuing/backpressuring upstream</td><td>Collector block for a stale value is cancelled mid-execution when a newer value shows up</td></tr><tr><td>Use case</td><td>Every update must be acted on — e.g. appending to a list, writing to a database log</td><td>Only the most recent state matters — e.g. updating a loading UI where a stale in-flight render should be dropped</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> because the collector body in <code>collectLatest</code> can be cancelled mid-execution, any suspend calls inside it must be cancellation-safe (e.g. no partial side effects left dangling).</p>",
            referenceLinks: [{ title: "Kotlin Flow: collect", url: "https://kotlinlang.org/docs/flow.html#terminal-flow-operators" }],
            tags: ["collect", "collectlatest", "flow", "coroutines"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "collect vs collectLatest",
                code: "// Every value processed fully, in order\nviewModelScope.launch {\n    repo.events.collect { event -> persistToLog(event) }\n}\n\n// Only the latest value's render survives; stale renders are cancelled\nviewModelScope.launch {\n    viewModel.uiState.collectLatest { state ->\n        renderExpensiveUi(state)   // cancelled if a newer state arrives mid-render\n    }\n}"
            }],
            subsection: null
        }
    ]
};
