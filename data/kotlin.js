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
                title: "const val against a plain val",
                code: "// Top level, or inside an object or companion object — nowhere else.\nconst val BASE_URL = \"https://api.example.com\"\nconst val MAX_RETRIES = 3\n\nclass NetworkConfig {\n    companion object {\n        const val TIMEOUT_MS = 30_000L      // inlined into every call site\n        private var counter = 0\n    }\n\n    // A plain val is a property with a getter, evaluated per instance.\n    val requestId: String = \"req-\" + (++counter)\n}\n\n@Deprecated(\"Use BASE_URL\")   // annotation arguments must be compile-time constants\nfun legacyCall() = \"legacy\"\n\nfun main() {\n    println(\"BASE_URL   = $BASE_URL\")\n    println(\"TIMEOUT_MS = ${NetworkConfig.TIMEOUT_MS}\")\n\n    // const is a compile-time value, so it is legal where only constants are:\n    // annotation arguments, when branches, array sizes.\n    val branch = when (MAX_RETRIES) {\n        3 -> \"three retries\"\n        else -> \"something else\"\n    }\n    println(\"when on a const -> $branch\")\n\n    // A val belongs to the instance and is computed when that instance is built.\n    println(\"first  requestId = \" + NetworkConfig().requestId)\n    println(\"second requestId = \" + NetworkConfig().requestId)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "BASE_URL   = https://api.example.com",
                        "TIMEOUT_MS = 30000",
                        "when on a const -> three retries",
                        "first  requestId = req-1",
                        "second requestId = req-2"
                    ],
                    explain: "<p>A <code>const val</code> is settled at compile time, so the compiler copies the value into every place it is used and there is no property to read at runtime. That is what makes it legal in an annotation argument and in a <code>when</code> branch, neither of which can call a getter.</p><p>A plain <code>val</code> is a property with a getter, belonging to an instance and evaluated when that instance is built — which is why the two request ids differ. <code>const</code> could not express that even if you wanted it to: its value has to be known before the program runs, so it is limited to primitives and <code>String</code>, at the top level or inside an <code>object</code> or companion.</p>"
                }
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
                code: "class MainActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityMainBinding\n\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityMainBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n    }\n\n    private fun logIfReady() {\n        if (::binding.isInitialized) {\n            println(\"Binding ready\")\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "MainActivity is constructed by the framework. binding has no value, and is not null either — it is simply unset.",
                        "onCreate runs, inflates the binding, and assigns it.",
                        "Any code after that reads binding as a non-null ActivityMainBinding, with no ?. and no !!.",
                        "If something read binding before onCreate, it would throw UninitializedPropertyAccessException — not a NullPointerException.",
                        "::binding.isInitialized answers whether the assignment has happened, which is the only safe check.",
                        "That check matters in teardown code, which can run on a screen that was destroyed before it finished being set up."
                    ],
                    explain: "<p><code>lateinit</code> exists for exactly this shape: a property that cannot be set in the constructor because the framework constructs the object, but which is never legitimately null once the lifecycle is under way.</p><p>The alternative is a nullable property and a <code>?.</code> on every use — noise that says \"this might be missing\" when it never is after <code>onCreate</code>.</p><p>The restrictions follow from the implementation: <code>lateinit</code> works only on a <code>var</code>, only on a non-null reference type, and never on a primitive, because there is no spare value to mean \"unset\".</p>"
                }
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
                title: "inline, and the non-local return it permits",
                code: "inline fun <T> measureAndRun(label: String, block: () -> T): T {\n    println(\"$label: starting\")\n    val result = block()\n    println(\"$label: finished\")\n    return result\n}\n\nfun findFirstEven(nums: List<Int>): Int? {\n    measureAndRun(\"search\") {\n        for (n in nums) {\n            if (n % 2 == 0) return n     // non-local: returns from findFirstEven itself\n        }\n    }\n    println(\"no even number found\")\n    return null\n}\n\n// A non-inline function cannot do that: the lambda is an object, and `return`\n// inside it can only return from the lambda.\nfun <T> notInlined(block: () -> T): T = block()\n\nfun searchWithoutInline(nums: List<Int>): Int? {\n    notInlined {\n        for (n in nums) {\n            if (n % 2 == 0) return@notInlined n   // only a labelled return is legal\n        }\n        null\n    }\n    return null\n}\n\nfun main() {\n    println(\"findFirstEven([1, 3, 4, 5]) = \" + findFirstEven(listOf(1, 3, 4, 5)))\n    println(\"---\")\n    println(\"findFirstEven([1, 3, 5])    = \" + findFirstEven(listOf(1, 3, 5)))\n    println(\"---\")\n    println(\"searchWithoutInline([1,3,4]) = \" + searchWithoutInline(listOf(1, 3, 4)))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "search: starting",
                        "findFirstEven([1, 3, 4, 5]) = 4",
                        "---",
                        "search: starting",
                        "search: finished",
                        "no even number found",
                        "findFirstEven([1, 3, 5])    = null",
                        "---",
                        "searchWithoutInline([1,3,4]) = null"
                    ],
                    explain: "<p>Compare the first block with the second. In the first, <code>\"search: finished\"</code> <strong>never printed</strong> — the <code>return n</code> inside the lambda returned from <code>findFirstEven</code> itself, jumping straight out of <code>measureAndRun</code> and skipping the rest of its body. In the second, no even number was found, the lambda ended normally, and the finishing line appeared.</p><p>That is what <code>inline</code> buys. The lambda's body is copied into the call site, so a <code>return</code> in it is an ordinary return from the enclosing function. Without <code>inline</code> the lambda is a separate object with its own frame and cannot do that — the third case has to use a labelled <code>return@notInlined</code>, which only leaves the lambda.</p><p>The performance argument for <code>inline</code> is real but secondary: no lambda object is allocated. Non-local return is the part that changes what you can write.</p>"
                }
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
                title: "A companion object as a factory",
                code: "// The Android idiom: a private constructor plus a factory in the companion,\n// so callers cannot build one the wrong way.\nclass UserScreen private constructor() {\n    val arguments = mutableMapOf<String, String>()\n\n    companion object {\n        private const val ARG_USER_ID = \"user_id\"\n\n        @JvmStatic\n        fun newInstance(userId: String): UserScreen = UserScreen().apply {\n            arguments[ARG_USER_ID] = userId\n        }\n    }\n\n    override fun toString() = \"UserScreen(arguments=$arguments)\"\n}\n\nclass Counter {\n    companion object {\n        var created = 0                  // shared by every instance\n    }\n    init { created++ }\n}\n\nfun main() {\n    val screen = UserScreen.newInstance(\"42\")\n    println(screen)\n\n    // The companion is a real object, and there is exactly one of it.\n    println(\"companion is a singleton: \" + (UserScreen.Companion === UserScreen.Companion))\n\n    Counter(); Counter(); Counter()\n    println(\"instances created: \" + Counter.created)\n\n    // Each newInstance call still produces a distinct object.\n    println(\"two screens are the same? \" + (UserScreen.newInstance(\"1\") === UserScreen.newInstance(\"1\")))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "UserScreen(arguments={user_id=42})",
                        "companion is a singleton: true",
                        "instances created: 3",
                        "two screens are the same? false"
                    ],
                    explain: "<p>The constructor is private, so the only way to get a <code>UserScreen</code> is through <code>newInstance</code> — which is how the Fragment idiom guarantees arguments are always set. Callers cannot build a half-configured one.</p><p>The second line is the part that distinguishes a companion from Java's <code>static</code>: <code>UserScreen.Companion</code> is a real object with a real type, so it can implement an interface, be passed as a value, and carry state — which the <code>Counter</code> shows, sharing one <code>created</code> across every instance.</p><p><code>@JvmStatic</code> exists only for Java callers, letting them write <code>UserScreen.newInstance(...)</code> rather than <code>UserScreen.Companion.newInstance(...)</code>.</p>"
                }
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
                title: "Extension functions, and where they stop being like methods",
                code: "// Stands in for android.view.View, which cannot run here.\nclass View(var visibility: String = \"VISIBLE\") {\n    companion object { const val VISIBLE = \"VISIBLE\"; const val GONE = \"GONE\" }\n    override fun toString() = \"View(visibility=$visibility)\"\n}\n\nfun View.visible() { visibility = View.VISIBLE }\nfun View.gone() { visibility = View.GONE }\n\nfun String.isValidEmail(): Boolean =\n    Regex(\"^[^@\\\\s]+@[^@\\\\s]+\\\\.[^@\\\\s]+$\").matches(this)\n\n// Extensions are resolved statically, on the DECLARED type, not the runtime one.\nopen class Base\nclass Derived : Base()\nfun Base.name() = \"Base extension\"\nfun Derived.name() = \"Derived extension\"\n\nfun main() {\n    val progressBar = View()\n    progressBar.gone()\n    println(\"after gone(): $progressBar\")\n    progressBar.visible()\n    println(\"after visible(): $progressBar\")\n\n    println(\"'ada@example.com'.isValidEmail() = \" + \"ada@example.com\".isValidEmail())\n    println(\"'ada@'.isValidEmail()            = \" + \"ada@\".isValidEmail())\n\n    // An extension is not a member, so there is no dynamic dispatch.\n    val asBase: Base = Derived()\n    println(\"declared Base, holding Derived -> \" + asBase.name())\n    println(\"declared Derived              -> \" + Derived().name())\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "after gone(): View(visibility=GONE)",
                        "after visible(): View(visibility=VISIBLE)",
                        "'ada@example.com'.isValidEmail() = true",
                        "'ada@'.isValidEmail()            = false",
                        "declared Base, holding Derived -> Base extension",
                        "declared Derived              -> Derived extension"
                    ],
                    explain: "<p>The first four lines are why extensions are everywhere in Android code: <code>view.gone()</code> reads like a method on a class you do not own and cannot subclass.</p><p>The last two lines are the limit. An extension is <strong>resolved statically</strong>, from the <em>declared</em> type of the variable — so a <code>Base</code> variable holding a <code>Derived</code> ran the <code>Base</code> extension. A real method would have dispatched on the object. Extensions are compiled to static functions taking the receiver as a parameter; they are not added to the class, and they cannot be overridden.</p><p>The other consequence of that: an extension cannot see private members, and a member function always wins over an extension with the same signature.</p>"
                }
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
                title: "What data adds: toString, equals, hashCode, copy, componentN",
                code: "data class User(val id: Int, val name: String, val isActive: Boolean = true)\n\nclass PlainUser(val id: Int, val name: String)\n\nfun main() {\n    val user = User(1, \"Ada\")\n    val renamed = user.copy(name = \"Ada Lovelace\")   // id and isActive carried over\n\n    println(\"toString()   \" + renamed)\n    println(\"original     \" + user)\n\n    val (id, name) = renamed                         // destructuring via componentN()\n    println(\"destructured $id -> $name\")\n\n    println(\"user == renamed        \" + (user == renamed))\n    println(\"user == User(1, \\\"Ada\\\") \" + (user == User(1, \"Ada\")))\n    println(\"same hashCode          \" + (user.hashCode() == User(1, \"Ada\").hashCode()))\n\n    // Without `data`, none of that is generated: equals falls back to identity.\n    println(\"plain class equals     \" + (PlainUser(1, \"Ada\") == PlainUser(1, \"Ada\")))\n    println(\"plain class toString   \" + PlainUser(1, \"Ada\").toString().substringBefore('@'))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "toString()   User(id=1, name=Ada Lovelace, isActive=true)",
                        "original     User(id=1, name=Ada, isActive=true)",
                        "destructured 1 -> Ada Lovelace",
                        "user == renamed        false",
                        "user == User(1, \"Ada\") true",
                        "same hashCode          true",
                        "plain class equals     false",
                        "plain class toString   PlainUser"
                    ],
                    explain: "<p>The last two lines are the control. The identical class without <code>data</code> compares unequal to a copy of itself and prints as a bare class name, because it inherits <code>Object</code>'s versions of both.</p><p>Everything above is generated from the <strong>constructor properties only</strong>. <code>copy</code> takes named arguments and carries the rest over, which is how you get an edited version of an immutable object. Destructuring works because <code>component1()</code> and <code>component2()</code> exist, and they are positional — reordering the constructor silently changes what a destructuring declaration means.</p><p>A property declared in the class body rather than the constructor is excluded from all of it, which is a common surprise: two objects differing only in such a property compare equal.</p>"
                }
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
                title: "distinct, distinctBy and toSet",
                code: "data class User(val id: Int, val name: String)\n\nfun main() {\n    val nums = listOf(1, 2, 2, 3, 3, 3, 4)\n\n    println(\"distinct()  \" + nums.distinct())      // keeps order, keeps first occurrence\n    println(\"toSet()     \" + nums.toSet())         // a Set, also order-preserving (LinkedHashSet)\n\n    val users = listOf(User(1, \"Ada\"), User(1, \"Ada Dup\"), User(2, \"Grace\"))\n    println(\"distinctBy  \" + users.distinctBy { it.id })\n\n    // distinct() on data classes compares contents, so these are duplicates.\n    val dupes = listOf(User(1, \"Ada\"), User(1, \"Ada\"))\n    println(\"distinct on data class \" + dupes.distinct())\n\n    // Order matters: distinctBy keeps the FIRST of each key, not the last.\n    println(\"first kept, not last   \" + users.distinctBy { it.id }.map { it.name })\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "distinct()  [1, 2, 3, 4]",
                        "toSet()     [1, 2, 3, 4]",
                        "distinctBy  [User(id=1, name=Ada), User(id=2, name=Grace)]",
                        "distinct on data class [User(id=1, name=Ada)]",
                        "first kept, not last   [Ada, Grace]"
                    ],
                    explain: "<p><code>distinct()</code> compares with <code>equals</code>, so it removes duplicate <em>values</em>; on a <code>data class</code> that means structurally identical objects, which the fourth line shows. <code>toSet()</code> does the same thing and gives you a <code>Set</code> — and because it is a <code>LinkedHashSet</code>, the order still survives.</p><p><code>distinctBy</code> is the one worth remembering: it deduplicates on a key rather than the whole object, which is how you collapse records sharing an id. The last line is its rule — <strong>the first occurrence of each key is kept</strong>, so \"Ada\" survives and \"Ada Dup\" is dropped. If the newest record should win, the list has to be reversed first.</p>"
                }
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
                title: "@JvmStatic for Java callers",
                code: "class Analytics {\n    companion object {\n        @JvmStatic\n        fun logEvent(name: String) {\n            println(\"event: $name\")\n        }\n    }\n}\n\n// From Java: Analytics.logEvent(\"click\");\n// Without @JvmStatic, Java would need: Analytics.Companion.logEvent(\"click\");",
                output: {
                    kind: "trace",
                    lines: [
                        "Kotlin compiles a companion object into a real inner class named Companion, holding a single instance.",
                        "logEvent therefore becomes an instance method on that Companion object.",
                        "Kotlin callers write Analytics.logEvent(\"click\") and the compiler fills in the Companion hop.",
                        "Java has no such shorthand, so without @JvmStatic a Java caller must write Analytics.Companion.logEvent(\"click\").",
                        "@JvmStatic tells the compiler to ALSO emit a genuine static method on the Analytics class itself.",
                        "Java can now write Analytics.logEvent(\"click\"), and Kotlin call sites are unchanged."
                    ],
                    explain: "<p>Step 5 is the key word: <strong>also</strong>. <code>@JvmStatic</code> adds a static bridge; it does not move the function. The companion instance method still exists, so nothing about the Kotlin side changes.</p><p>This matters wherever a framework reflects on your code expecting a static member — JUnit 4's <code>@BeforeClass</code>, and Parcelable's <code>CREATOR</code> field, are the two that bite most often.</p><p>If the project has no Java in it and no such framework, <code>@JvmStatic</code> is pure noise.</p>"
                }
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
                title: "@JvmOverloads for default arguments",
                code: "class Toast @JvmOverloads constructor(\n    val message: String,\n    val durationMs: Long = 2000L,\n    val isError: Boolean = false\n)\n\n// Java can now call:\n// new Toast(\"Saved\")\n// new Toast(\"Saved\", 3000L)\n// new Toast(\"Saved\", 3000L, true)",
                output: {
                    kind: "trace",
                    lines: [
                        "Kotlin compiles a function with default arguments into ONE method taking every parameter, plus a synthetic bitmask marking which were omitted.",
                        "A Kotlin call site fills in the defaults at compile time, so all three call shapes work.",
                        "Java has no defaults, so a Java caller sees only the full three-argument constructor and must pass every value.",
                        "@JvmOverloads makes the compiler emit the intermediate overloads as well: one argument, two arguments, three arguments.",
                        "Java can now call any of the three forms.",
                        "On a custom View this is what lets the constructor serve code, XML inflation, and styled attributes with one declaration."
                    ],
                    explain: "<p>Step 1 explains why Java sees something so awkward: the default is not encoded in a signature Java can use, it is a bitmask the Kotlin compiler passes.</p><p>Step 6 is where nearly every Android developer meets this. A custom <code>View</code> needs three constructors for the framework to inflate it from XML, and <code>@JvmOverloads</code> generates all three from one declaration with defaults.</p><p>The caution: adding a parameter in the middle of the list silently changes every generated overload, so a library using <code>@JvmOverloads</code> can break Java callers without any visible signature change.</p>"
                }
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
                title: "noinline, for a lambda that has to outlive the call",
                code: "inline fun runTask(\n    onStart: () -> Unit,\n    noinline onComplete: () -> Unit    // stored and returned, so it must stay an object\n): () -> Unit {\n    onStart()\n    println(\"task: doing the work\")\n    return onComplete                  // only legal because onComplete is not inlined\n}\n\nfun main() {\n    val completion = runTask(\n        onStart = { println(\"task: starting\") },\n        onComplete = { println(\"task: completed (called later)\") }\n    )\n\n    println(\"runTask returned; the completion lambda has not run yet\")\n    completion()\n\n    // A noinline lambda is a real object, so it can be stored in a list too.\n    val callbacks = mutableListOf(completion)\n    println(\"stored ${callbacks.size} callback for later\")\n    callbacks.first()()\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "task: starting",
                        "task: doing the work",
                        "runTask returned; the completion lambda has not run yet",
                        "task: completed (called later)",
                        "stored 1 callback for later",
                        "task: completed (called later)"
                    ],
                    explain: "<p><code>runTask</code> returns <code>onComplete</code>, and the third and fourth lines show it being called after <code>runTask</code> has already finished. That is only possible because <code>onComplete</code> is a real object.</p><p>An inlined lambda has no object — its body is pasted into the call site — so it cannot be stored, returned, or put in a list. <code>noinline</code> opts one parameter out of inlining so it becomes an ordinary function object again, while <code>onStart</code> stays inlined and free.</p><p>The rule of thumb: mark a parameter <code>noinline</code> when the lambda is used as a <em>value</em> rather than merely called.</p>"
                }
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
                title: "crossinline, and the return it forbids",
                code: "inline fun runInBackground(crossinline action: () -> Unit) {\n    val runnable = Runnable {\n        action()          // runs in another object's context, so a bare `return`\n                          // out of the caller would be impossible — hence crossinline\n    }\n    val thread = Thread(runnable)\n    thread.start()\n    thread.join()         // joined so the output is in a fixed order\n}\n\nfun example() {\n    println(\"example: before\")\n    runInBackground {\n        println(\"background: working\")\n        // return        // COMPILE ERROR: non-local return is not allowed here\n        return@runInBackground\n    }\n    println(\"example: after\")\n}\n\n// Compare with a plain inline lambda, where a bare return IS allowed.\ninline fun runHere(action: () -> Unit) { action() }\n\nfun withNonLocalReturn(): String {\n    runHere {\n        return \"returned from withNonLocalReturn, out of the lambda\"\n    }\n    @Suppress(\"UNREACHABLE_CODE\")\n    return \"never reached\"\n}\n\nfun main() {\n    example()\n    println(withNonLocalReturn())\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "example: before",
                        "background: working",
                        "example: after",
                        "returned from withNonLocalReturn, out of the lambda"
                    ],
                    explain: "<p>The bottom line is the behaviour <code>crossinline</code> exists to prevent. <code>withNonLocalReturn</code> has a plain <code>inline</code> lambda, and a bare <code>return</code> inside it returned from <code>withNonLocalReturn</code> — skipping everything after the call.</p><p>Now imagine that in <code>runInBackground</code>, where the lambda is wrapped in a <code>Runnable</code> and executed later, on another thread. There is no enclosing frame left to return from. <code>crossinline</code> is how the function says \"this lambda is inlined, but it will run somewhere else, so non-local return is not allowed\" — and the compiler enforces it at the call site rather than letting it fail at runtime.</p><p>A labelled <code>return@runInBackground</code> remains legal, because that only ends the lambda.</p>"
                }
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
                title: "reified, and what erasure takes away",
                code: "// Without reified, a generic function cannot see T at runtime — erasure removed\n// it — so the caller has to pass a Class object by hand.\nfun <T> decodeErased(json: String, type: Class<T>): String =\n    \"decoded into ${type.simpleName}\"\n\n// With reified, the compiler inlines the function and substitutes the real type.\ninline fun <reified T> decode(json: String): String =\n    \"decoded into ${T::class.simpleName}\"\n\ninline fun <reified T> isInstance(value: Any): Boolean = value is T\n\ndata class User(val name: String)\ndata class Post(val title: String)\n\nfun main() {\n    println(decodeErased(\"{}\", User::class.java))\n    println(decode<User>(\"{}\"))\n    println(decode<Post>(\"{}\"))\n\n    // `value is T` is only legal because T survives to runtime.\n    println(\"User is User? \" + isInstance<User>(User(\"Ada\")))\n    println(\"Post is User? \" + isInstance<User>(Post(\"hello\")))\n\n    // The same trick behind context.startActivity<ProfileActivity>().\n    println(\"class token = \" + User::class.java.simpleName)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "decoded into User",
                        "decoded into User",
                        "decoded into Post",
                        "User is User? true",
                        "Post is User? false",
                        "class token = User"
                    ],
                    explain: "<p>The first two lines do the same job with and without <code>reified</code>. Without it, the type argument is erased before the program runs, so the function cannot name <code>T</code> at runtime and the caller has to hand over a <code>Class</code> object to compensate — every Gson call before Kotlin looked like that.</p><p><code>reified</code> works only on an <code>inline</code> function, and that is the whole trick: because the body is copied into the call site, the compiler can substitute the real type there. <code>T::class</code> and <code>value is T</code> become legal, and the caller writes <code>decode&lt;User&gt;(json)</code> with nothing redundant in the parentheses.</p><p>Same mechanism behind <code>context.startActivity&lt;ProfileActivity&gt;()</code> and <code>viewModels&lt;UserViewModel&gt;()</code>.</p>"
                }
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
                title: "Initialisation order",
                code: "class Person(name: String) {\n    val firstProperty = \"First: $name\".also(::println)\n\n    init {\n        println(\"First init block: $name\")\n    }\n\n    val secondProperty = \"Second: ${name.length}\".also(::println)\n\n    init {\n        require(name.isNotBlank()) { \"name must not be blank\" }\n        println(\"Second init block\")\n    }\n}\n\nfun main() {\n    Person(\"Ada\")\n\n    println(\"---\")\n    // require() inside init is how a constructor rejects bad arguments.\n    try {\n        Person(\"  \")\n    } catch (e: IllegalArgumentException) {\n        println(\"construction rejected: ${e.message}\")\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "First: Ada",
                        "First init block: Ada",
                        "Second: 3",
                        "Second init block",
                        "---",
                        "First:   ",
                        "First init block:   ",
                        "Second: 2",
                        "construction rejected: name must not be blank"
                    ],
                    explain: "<p>The order is <strong>source order</strong>, with property initialisers and <code>init</code> blocks interleaved exactly as written — not all properties and then all blocks. That is why the first property, first block, second property and second block print in that sequence.</p><p>It also means an <code>init</code> block cannot read a property declared below it: the property has not been assigned yet, and the compiler rejects it.</p><p>The second half shows what <code>init</code> is usually for. <code>require</code> throws <code>IllegalArgumentException</code> before the object exists, so an invalid instance can never be handed to anyone.</p>"
                }
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
                title: "== is structural, === is referential",
                code: "data class Point(val x: Int, val y: Int)\n\nclass PlainPoint(val x: Int, val y: Int)\n\nfun main() {\n    val a = Point(1, 2)\n    val b = Point(1, 2)\n    val c = a\n\n    println(\"a == b   \" + (a == b))     // structural: contents match\n    println(\"a === b  \" + (a === b))    // referential: different objects\n    println(\"a === c  \" + (a === c))    // same object\n\n    // == calls equals(), so a class without one falls back to identity.\n    println(\"plain == \" + (PlainPoint(1, 2) == PlainPoint(1, 2)))\n\n    // == is null-safe in Kotlin; it never throws on a null receiver.\n    val maybe: Point? = null\n    println(\"null == a \" + (maybe == a))\n\n    // For primitives there is no identity to compare, so === is not allowed\n    // on Int at all — but boxed types show the same trap Java has.\n    val x: Int? = 1000\n    val y: Int? = 1000\n    println(\"boxed 1000 == \" + (x == y))\n    println(\"boxed 1000 === \" + (x === y))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "a == b   true",
                        "a === b  false",
                        "a === c  true",
                        "plain == false",
                        "null == a false",
                        "boxed 1000 == true",
                        "boxed 1000 === false"
                    ],
                    explain: "<p>In Kotlin <code>==</code> calls <code>equals()</code> and <code>===</code> compares identity, which is the reverse of the Java habit where <code>==</code> is the identity check. A <code>data class</code> generates <code>equals</code>, so two separately built points are <code>==</code> and not <code>===</code>; a plain class inherits identity comparison and is neither.</p><p><code>==</code> is also null-safe — <code>null == a</code> returns <code>false</code> rather than throwing, so no null check is needed before comparing.</p><p>The last pair is the trap that survives from Java: boxed <code>Int?</code> values above 127 are distinct objects, so <code>===</code> is <code>false</code> while <code>==</code> is <code>true</code>. On a non-null <code>Int</code> the compiler will not even let you write <code>===</code>.</p>"
                }
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
                title: "A function that takes a function",
                code: "fun <R> withRetry(times: Int, block: () -> R): R {\n    var lastError: Throwable? = null\n    repeat(times) { attempt ->\n        try {\n            return block()\n        } catch (e: Throwable) {\n            println(\"  attempt $attempt failed: ${e.message}\")\n            lastError = e\n        }\n    }\n    throw lastError ?: IllegalStateException(\"retry failed\")\n}\n\nvar calls = 0\nfun fetchFromNetwork(): String {\n    calls++\n    if (calls < 3) throw IllegalStateException(\"timeout\")\n    return \"payload\"\n}\n\nfun main() {\n    println(\"result = \" + withRetry(3) { fetchFromNetwork() })\n\n    // A function taking a function can also take a reference to a named one.\n    calls = 0\n    println(\"with a function reference = \" + withRetry(5, ::fetchFromNetwork))\n\n    // And when every attempt fails, the last error is rethrown.\n    try {\n        withRetry(2) { throw IllegalStateException(\"always broken\") }\n    } catch (e: IllegalStateException) {\n        println(\"gave up with: \" + e.message)\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "  attempt 0 failed: timeout",
                        "  attempt 1 failed: timeout",
                        "result = payload",
                        "  attempt 0 failed: timeout",
                        "  attempt 1 failed: timeout",
                        "with a function reference = payload",
                        "  attempt 0 failed: always broken",
                        "  attempt 1 failed: always broken",
                        "gave up with: always broken"
                    ],
                    explain: "<p><code>withRetry</code> knows nothing about networks. It takes a <code>() -&gt; R</code> and calls it, which is what makes it reusable for anything worth retrying — the policy is separated from the operation.</p><p>The second call passes <code>::fetchFromNetwork</code>, a reference to a named function rather than a lambda. Anything matching the type works: a lambda, a function reference, or a variable holding one.</p><p>The final case shows the part that is easy to get wrong. When every attempt fails, something has to happen — here the last exception is rethrown. A retry helper that silently returns a default would hide a total outage.</p>"
                }
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
                title: "Returning a function, and what a closure captures",
                code: "fun makeMultiplier(factor: Int): (Int) -> Int {\n    return { value -> value * factor }      // closes over `factor`\n}\n\n// A closure captures the variable, not a snapshot of its value.\nfun makeCounter(): () -> Int {\n    var count = 0\n    return { ++count }\n}\n\nfun main() {\n    val triple = makeMultiplier(3)\n    val double = makeMultiplier(2)\n\n    println(\"triple(10) = \" + triple(10))\n    println(\"double(10) = \" + double(10))\n\n    // Each call to makeMultiplier produced its own closure over its own factor.\n    println(\"same function object? \" + (triple === double))\n\n    val next = makeCounter()\n    println(\"counter: ${next()}, ${next()}, ${next()}\")\n\n    // A second counter has its own captured variable.\n    val other = makeCounter()\n    println(\"a fresh counter starts again at ${other()}\")\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "triple(10) = 30",
                        "double(10) = 20",
                        "same function object? false",
                        "counter: 1, 2, 3",
                        "a fresh counter starts again at 1"
                    ],
                    explain: "<p><code>triple</code> and <code>double</code> came from the same function and behave differently, because each closed over its own <code>factor</code>. They are also different objects, which the third line confirms — every call to <code>makeMultiplier</code> builds a new closure.</p><p><code>makeCounter</code> shows the sharper point: a closure captures the <strong>variable</strong>, not a snapshot of its value. <code>count</code> keeps increasing across calls because the lambda holds the variable itself, and it stays alive after <code>makeCounter</code> has returned. A second counter gets its own.</p><p>Kotlin allows this for <code>var</code>s, unlike Java, where a captured local must be effectively final.</p>"
                }
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
                title: "Lambda forms, and what they capture",
                code: "fun interface OnClickListener {\n    fun onClick(view: String)\n}\n\nclass Button(val id: String) {\n    private var listener: OnClickListener? = null\n    fun setOnClickListener(l: OnClickListener) { listener = l }\n    fun performClick() { listener?.onClick(id) }\n}\n\nfun main() {\n    println(\"implicit it  \" + listOf(1, 2, 3).map { it * it })\n    println(\"named param  \" + listOf(1, 2, 3).map { n -> n + 1 })\n\n    // Trailing lambda: the last argument moves outside the parentheses.\n    val button = Button(\"submit\")\n    button.setOnClickListener { view -> println(\"clicked $view\") }\n    button.performClick()\n\n    // A lambda captures variables, and in Kotlin it may modify them.\n    var counter = 0\n    val increment = { counter++ }\n    repeat(3) { increment() }\n    println(\"captured counter = $counter\")\n\n    // The last expression is the return value; there is no `return` keyword.\n    val describe: (Int) -> String = { n ->\n        val half = n / 2\n        \"$n halves to $half\"\n    }\n    println(describe(10))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "implicit it  [1, 4, 9]",
                        "named param  [2, 3, 4]",
                        "clicked submit",
                        "captured counter = 3",
                        "10 halves to 5"
                    ],
                    explain: "<p>Four forms of the same thing. A single-parameter lambda gets <code>it</code> for free; naming the parameter is worth it as soon as there is more than one, or the lambda is more than a line.</p><p>The trailing-lambda rule — a last argument that is a lambda moves outside the parentheses — is what makes <code>setOnClickListener { }</code>, <code>repeat { }</code> and every DSL in Kotlin read the way they do.</p><p><code>counter</code> reaching 3 is the capture: a lambda may read <em>and write</em> a captured <code>var</code>, which Java does not permit. And the last case shows there is no <code>return</code> keyword — the final expression is the value, which is why a multi-line lambda still needs no ceremony.</p>"
                }
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
                title: "associateBy, associateWith, and duplicate keys",
                code: "data class User(val id: Int, val name: String)\n\nfun main() {\n    val users = listOf(User(1, \"Ada\"), User(2, \"Grace\"), User(3, \"Alan\"))\n\n    val byId: Map<Int, User> = users.associateBy { it.id }\n    println(\"byId[2]?.name = \" + byId[2]?.name)\n    println(\"byId keys     = \" + byId.keys)\n\n    // Two lambdas: one picks the key, one picks the value.\n    val nameById: Map<Int, String> = users.associateBy({ it.id }, { it.name })\n    println(\"nameById      = \" + nameById)\n\n    // associateWith flips it: the element is the key, the lambda makes the value.\n    println(\"associateWith = \" + users.associateWith { it.name.length })\n\n    // Duplicate keys: the LAST one wins, silently.\n    val dupes = listOf(User(1, \"Ada\"), User(1, \"Ada Dup\"))\n    println(\"duplicate key -> \" + dupes.associateBy { it.id })\n\n    // groupBy keeps them all instead.\n    println(\"groupBy       -> \" + dupes.groupBy { it.id })\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "byId[2]?.name = Grace",
                        "byId keys     = [1, 2, 3]",
                        "nameById      = {1=Ada, 2=Grace, 3=Alan}",
                        "associateWith = {User(id=1, name=Ada)=3, User(id=2, name=Grace)=5, User(id=3, name=Alan)=4}",
                        "duplicate key -> {1=User(id=1, name=Ada Dup)}",
                        "groupBy       -> {1=[User(id=1, name=Ada), User(id=1, name=Ada Dup)]}"
                    ],
                    explain: "<p><code>associateBy</code> turns a list into a map keyed by whatever the lambda returns, which is the standard fix for repeatedly scanning a list to find an item by id. The two-lambda form picks the value as well as the key.</p><p><code>associateWith</code> is the mirror image: the element becomes the key and the lambda produces the value.</p><p>The last two lines are the one to be careful about. On a duplicate key, <strong>the last entry silently wins</strong> — \"Ada\" is gone and only \"Ada Dup\" remains, with no error and no warning. When keys may repeat, <code>groupBy</code> is almost always what was meant: it keeps every element, in a list per key.</p>"
                }
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
                title: "open, override, and final override",
                code: "open class Animal(val name: String) {\n    open fun speak(): String = \"...\"\n    fun sleep(): String = \"$name sleeps\"      // not open: cannot be overridden\n}\n\nclass Dog(name: String) : Animal(name) {\n    override fun speak(): String = \"Woof\"\n}\n\n// `override` is itself open unless you close it.\nopen class Cat(name: String) : Animal(name) {\n    final override fun speak(): String = \"Meow\"   // final stops it here\n}\n\nclass Kitten(name: String) : Cat(name)            // may subclass, may not override speak\n\nfun main() {\n    val animals = listOf(Animal(\"Generic\"), Dog(\"Rex\"), Cat(\"Tom\"), Kitten(\"Tiny\"))\n    for (a in animals) println(a.name.padEnd(8) + a.speak())\n\n    println(Dog(\"Rex\").sleep())\n\n    // Classes are final by default, which is why `open` has to be written at\n    // all — and why Kitten can exist but cannot change speak().\n    println(Kitten(\"Tiny\").speak() + \" (inherited from Cat, and final there)\")\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Generic ...",
                        "Rex     Woof",
                        "Tom     Meow",
                        "Tiny    Meow",
                        "Rex sleeps",
                        "Meow (inherited from Cat, and final there)"
                    ],
                    explain: "<p>Kotlin classes and members are <strong>final by default</strong>, the opposite of Java. Inheritance has to be designed for deliberately, which is why <code>open</code> exists at all — <code>sleep()</code> has no <code>open</code>, so no subclass can change it.</p><p>The subtlety is that <code>override</code> is <em>itself</em> open. A subclass of <code>Dog</code> could override <code>speak</code> again unless something stops it. <code>Cat</code> writes <code>final override</code>, so <code>Kitten</code> inherits <code>Meow</code> and cannot replace it — which the last line shows.</p><p>The loop is the reason any of this matters: one <code>speak()</code> call site, four different results, chosen by the object.</p>"
                }
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
                title: "partition keeps both halves",
                code: "data class User(val name: String, val active: Boolean)\n\nfun main() {\n    val numbers = listOf(1, 2, 3, 4, 5, 6, 7, 8)\n    val (even, odd) = numbers.partition { it % 2 == 0 }\n\n    println(\"even \" + even)\n    println(\"odd  \" + odd)\n\n    // partition keeps BOTH sides. filter throws the other half away.\n    println(\"filter only   \" + numbers.filter { it % 2 == 0 })\n\n    val users = listOf(User(\"Ada\", true), User(\"Grace\", false), User(\"Alan\", true))\n    val (active, inactive) = users.partition { it.active }\n    println(\"active   \" + active.map { it.name })\n    println(\"inactive \" + inactive.map { it.name })\n\n    // Order within each list is the original order.\n    println(\"order preserved \" + (even == listOf(2, 4, 6, 8)))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "even [2, 4, 6, 8]",
                        "odd  [1, 3, 5, 7]",
                        "filter only   [2, 4, 6, 8]",
                        "active   [Ada, Alan]",
                        "inactive [Grace]",
                        "order preserved true"
                    ],
                    explain: "<p><code>partition</code> returns a <code>Pair</code> of lists — matching and non-matching — and destructuring it into two names is what makes it read well. <code>filter</code> answers the same question and throws the other half away, so getting both means running the predicate twice and keeping the negation in step.</p><p>Order inside each list is the original order, which the last line confirms. That matters when partitioning something already sorted.</p>"
                }
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
                title: "infix functions, and how they bind",
                code: "infix fun Int.pow(exponent: Int): Int {\n    var result = 1\n    repeat(exponent) { result *= this }\n    return result\n}\n\ndata class Money(val amount: Int, val currency: String)\ninfix fun Int.of(currency: String) = Money(this, currency)\n\nfun main() {\n    println(\"2 pow 10 = \" + (2 pow 10))\n    println(\"3 pow 3  = \" + (3 pow 3))\n\n    // The stdlib's `to` is an ordinary infix function, not syntax.\n    val pair = \"key\" to \"value\"\n    println(\"\\\"key\\\" to \\\"value\\\" = $pair\")\n\n    println(\"50 of \\\"USD\\\" = \" + (50 of \"USD\"))\n\n    // Infix binds looser than arithmetic, which is a common surprise.\n    println(\"2 pow 2 + 1  = \" + (2 pow 2 + 1) + \"   (parsed as 2 pow 3)\")\n    println(\"(2 pow 2) + 1 = \" + ((2 pow 2) + 1))\n\n    // Dotted form still works; infix only removes the dot and parentheses.\n    println(\"2.pow(10) = \" + 2.pow(10))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "2 pow 10 = 1024",
                        "3 pow 3  = 27",
                        "\"key\" to \"value\" = (key, value)",
                        "50 of \"USD\" = Money(amount=50, currency=USD)",
                        "2 pow 2 + 1  = 8   (parsed as 2 pow 3)",
                        "(2 pow 2) + 1 = 5",
                        "2.pow(10) = 1024"
                    ],
                    explain: "<p><code>infix</code> only removes the dot and the parentheses — the last line calls the same function the ordinary way. It is available on single-parameter member or extension functions, and Kotlin's own <code>to</code> is exactly this, not syntax.</p><p>The two middle lines are the catch. Infix binds <strong>looser than arithmetic</strong>, so <code>2 pow 2 + 1</code> parses as <code>2 pow 3</code> and gives 8, not 5. That is the reason to reserve <code>infix</code> for operations where the reading order is obvious — <code>50 of \"USD\"</code>, <code>\"key\" to \"value\"</code> — and not for anything that will sit inside a larger expression.</p>"
                }
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
                title: "expect and actual in KMP",
                code: "// commonMain\nexpect fun currentPlatformName(): String\n\nclass Greeter {\n    fun greet(): String = \"Running on ${currentPlatformName()}\"\n}\n\n// androidMain\nactual fun currentPlatformName(): String = \"Android\"\n\n// iosMain\nactual fun currentPlatformName(): String = \"iOS\"",
                output: {
                    kind: "trace",
                    lines: [
                        "commonMain declares expect fun currentPlatformName(). It has no body — it is a promise that every target will supply one.",
                        "Shared code such as Greeter is written against that declaration and compiles without knowing any platform.",
                        "androidMain supplies actual fun currentPlatformName() returning \"Android\".",
                        "iosMain supplies its own actual, returning \"iOS\".",
                        "Each target is compiled separately, and the compiler pairs every expect with exactly one actual for that target.",
                        "A missing actual is a compile error for that target, so a platform cannot be forgotten.",
                        "The result is one Greeter, compiled into an Android library and an iOS framework, giving different answers."
                    ],
                    explain: "<p>Step 6 is the property that makes this more than an interface: the pairing is checked at compile time per target, so an unimplemented platform fails the build rather than at run time.</p><p><code>expect</code>/<code>actual</code> is deliberately a last resort. Most shared code needs no platform hook at all, and where it does, an interface implemented per platform and injected is often easier to test. <code>expect</code>/<code>actual</code> earns its place for things with no sensible abstraction — the current platform name, a file path, a UUID generator.</p>"
                }
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
                code: "import kotlinx.coroutines.*\n\nsuspend fun fetchData(): String {\n    delay(50)\n    return \"result\"\n}\n\nfun main() = runBlocking {\n    println(\"start on ${Thread.currentThread().name}\")\n    val data = fetchData()\n    println(\"got: $data\")\n    println(\"still on ${Thread.currentThread().name}\")\n\n    // runBlocking BLOCKS its thread until everything inside finishes — which is\n    // exactly why it belongs in main() and tests, and never in Android code.\n    val job = launch { delay(20); println(\"child finished before runBlocking returns\") }\n    println(\"child launched, runBlocking will wait for it\")\n    job.join()\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "start on main",
                        "got: result",
                        "still on main",
                        "child launched, runBlocking will wait for it",
                        "child finished before runBlocking returns"
                    ],
                    explain: "<p><code>runBlocking</code> is the bridge from ordinary blocking code into suspending code. It starts a coroutine and <strong>blocks the calling thread</strong> until everything inside has finished — including the child launched at the end, which is why its line prints before <code>main</code> returns.</p><p>That blocking is exactly why it belongs in <code>main</code> and in tests and nowhere else. Calling it on Android's main thread would freeze the UI for the duration, which is the opposite of what coroutines are for. Inside a coroutine you already have <code>launch</code>, <code>async</code> and <code>withContext</code>, none of which block anything.</p>"
                }
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
                code: "class SyncViewModel : ViewModel() {\n    fun startSync() {\n        viewModelScope.launch {          // parent\n            launch { uploadPhotos() }    // child A\n            launch { downloadFeed() }    // child B\n        }\n    }\n\n    override fun onCleared() {\n        // viewModelScope is cancelled automatically here,\n        // cancelling child A and child B — no manual bookkeeping needed\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "viewModelScope.launch starts a parent coroutine, whose Job is a child of the scope's Job.",
                        "The two inner launches create children of that parent, forming a tree.",
                        "The parent does not complete until both children have completed — even though its own body finished immediately.",
                        "The user leaves the screen, and the ViewModel is cleared.",
                        "onCleared cancels viewModelScope, which cancels its child, which cancels both grandchildren.",
                        "The uploads and downloads stop at their next suspension point, and their finally blocks run.",
                        "No job references were stored and no cancellation was written by hand."
                    ],
                    explain: "<p>Step 7 is the whole benefit. The callback-era version of this needed a field per in-flight operation and a cancel call for each in <code>onDestroy</code>, and the bug was always the one you forgot.</p><p>Step 3 is the less obvious half of the contract: a coroutine is not finished until its children are. That is what makes <code>coroutineScope { }</code> a reliable boundary, and it is why a leaked child cannot outlive the scope that created it.</p>"
                }
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
                title: "buildString, and why += in a loop is different",
                code: "fun main() {\n    val report = buildString {\n        append(\"Report\\n\")\n        for (i in 1..3) {\n            append(\"Line $i\\n\")       // one StringBuilder, mutated in place\n        }\n    }\n    print(report)\n\n    println(\"---\")\n\n    // The same text built by concatenation allocates a new String per pass.\n    var slow = \"Report\\n\"\n    for (i in 1..3) slow += \"Line $i\\n\"\n    println(\"identical text? \" + (slow == report))\n\n    // A StringBuilder mutates and returns itself; a String never does.\n    val sb = StringBuilder(\"a\")\n    println(\"append returns the same object? \" + (sb.append(\"b\") === sb))\n\n    val s = \"a\"\n    println(\"plus returns a new object?      \" + (s.plus(\"b\") !== s))\n\n    // joinToString is usually shorter than either for a collection.\n    println((1..3).joinToString(prefix = \"Report: \") { \"Line $it\" })\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Report",
                        "Line 1",
                        "Line 2",
                        "Line 3",
                        "---",
                        "identical text? true",
                        "append returns the same object? true",
                        "plus returns a new object?      true",
                        "Report: Line 1, Line 2, Line 3"
                    ],
                    explain: "<p>Both loops produce identical text and do very different work. <code>buildString</code> gives the block a <code>StringBuilder</code> and returns its contents — one buffer, appended to in place. The <code>+=</code> loop creates a new <code>String</code> on every pass and copies everything so far into it, which turns a linear job into a quadratic one.</p><p>The two identity checks are that difference stated precisely: <code>append</code> returned the same object, <code>plus</code> returned a different one. Strings are immutable, so there is no other way for them to behave.</p><p>For a collection, <code>joinToString</code> is shorter than either and does the same thing underneath. <code>StringBuffer</code> is the synchronised variant and is almost never the right choice on Android.</p>"
                }
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
                title: "val is about the reference, not the object",
                code: "class Score {\n    var backing = 10                       // var: reassignable\n    val doubled: Int get() = backing * 2   // val with a getter: recomputed on read\n}\n\nfun main() {\n    val list = mutableListOf(1, 2, 3)\n    list.add(4)                    // fine: the CONTENTS change, not the reference\n    // list = mutableListOf(5)     // ERROR: val cannot be reassigned\n    println(\"val list after add: $list\")\n\n    var count = 0\n    count += 1                     // fine: a var may be reassigned\n    println(\"var count: $count\")\n\n    // val controls the reference, not the object it points at.\n    val readOnlyView: List<Int> = list\n    list.add(5)\n    println(\"val List changed underneath: $readOnlyView\")\n\n    // For real immutability the object has to be immutable too.\n    val frozen: List<Int> = listOf(1, 2, 3)\n    println(\"listOf is readable, not mutable: $frozen\")\n\n    // A val is not the same as a constant: a custom getter runs on every read.\n    val score = Score()\n    println(\"doubled = ${score.doubled}\")\n    score.backing = 20\n    println(\"doubled = ${score.doubled}  (still a val, still changed)\")\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "val list after add: [1, 2, 3, 4]",
                        "var count: 1",
                        "val List changed underneath: [1, 2, 3, 4, 5]",
                        "listOf is readable, not mutable: [1, 2, 3]",
                        "doubled = 20",
                        "doubled = 40  (still a val, still changed)"
                    ],
                    explain: "<p>The first line is the whole misunderstanding. <code>list</code> is a <code>val</code> and it changed — because <code>val</code> forbids <strong>reassigning the reference</strong> and says nothing about the object it points at. <code>list = mutableListOf(5)</code> would not compile; <code>list.add(4)</code> is fine.</p><p>The third line takes it further: a <code>List</code> declared read-only can still change underneath you if something else holds the same object as a <code>MutableList</code>. <code>List</code> is a read-only <em>view</em>, not a guarantee of immutability.</p><p>And the last pair shows a <code>val</code> is not a constant. With a custom getter it is recomputed on every read — for a genuine compile-time constant you need <code>const val</code>.</p>"
                }
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
                title: "isInitialized, and what happens without it",
                code: "class Binding(val root: String) {\n    fun removeAllViews() = println(\"  binding: views removed\")\n}\n\n// Stands in for an Activity holding a view binding.\nclass ProfileScreen {\n    lateinit var binding: Binding\n\n    fun onCreate() {\n        binding = Binding(\"profile_root\")\n        println(\"  onCreate: binding assigned\")\n    }\n\n    fun onDestroy() {\n        if (::binding.isInitialized) {\n            binding.removeAllViews()\n        } else {\n            println(\"  onDestroy: nothing to clean up\")\n        }\n    }\n}\n\nfun main() {\n    println(\"destroyed without ever being created:\")\n    ProfileScreen().onDestroy()\n\n    println(\"normal lifecycle:\")\n    val screen = ProfileScreen()\n    screen.onCreate()\n    screen.onDestroy()\n\n    // Reading a lateinit before assignment throws, which is the whole reason\n    // the isInitialized check exists.\n    try {\n        println(ProfileScreen().binding.root)\n    } catch (e: UninitializedPropertyAccessException) {\n        println(\"reading it early threw: \" + e.message)\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "destroyed without ever being created:",
                        "  onDestroy: nothing to clean up",
                        "normal lifecycle:",
                        "  onCreate: binding assigned",
                        "  binding: views removed",
                        "reading it early threw: lateinit property binding has not been initialized"
                    ],
                    explain: "<p>The last line is why the check exists. Reading a <code>lateinit</code> property before anything assigned it throws <code>UninitializedPropertyAccessException</code> — not a <code>NullPointerException</code>, because as far as the type system is concerned the property is not nullable at all.</p><p><code>::binding.isInitialized</code> is the only safe way to ask, and cleanup code is where it earns its place: <code>onDestroy</code> can run on a screen that was torn down before it finished being set up, and a bare <code>binding.removeAllViews()</code> there would crash.</p><p>The syntax only works on a <code>lateinit</code> property from inside the class that declares it.</p>"
                }
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
                title: "lazy runs once, on first read",
                code: "class ImageProcessor {\n    val regexCache: Regex by lazy(LazyThreadSafetyMode.NONE) {\n        println(\"  compiling regex (this runs once)\")\n        Regex(\"[a-z]+\\\\.png$\")\n    }\n}\n\nfun main() {\n    val processor = ImageProcessor()\n    println(\"processor built — the regex has NOT been compiled yet\")\n\n    println(\"matches('photo.png') = \" + processor.regexCache.matches(\"photo.png\"))\n    println(\"matches('photo.jpg') = \" + processor.regexCache.matches(\"photo.jpg\"))\n\n    // The initialiser never runs a second time; the value is cached.\n    println(\"same Regex instance both times: \" + (processor.regexCache === processor.regexCache))\n\n    // A second object has its own lazy property, and its own initialiser run.\n    println(\"second processor:\")\n    ImageProcessor().regexCache\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "processor built — the regex has NOT been compiled yet",
                        "  compiling regex (this runs once)",
                        "matches('photo.png') = true",
                        "matches('photo.jpg') = false",
                        "same Regex instance both times: true",
                        "second processor:",
                        "  compiling regex (this runs once)"
                    ],
                    explain: "<p>Building the object printed nothing — the regex was compiled only when the property was first read, and the second read reused the cached value rather than running the initialiser again. The identity check confirms it is genuinely the same object.</p><p>The last two lines are the part people assume wrongly: <code>lazy</code> is <strong>per instance</strong>, not per class. A second <code>ImageProcessor</code> compiles its own regex.</p><p><code>LazyThreadSafetyMode.NONE</code> drops the synchronisation that the default mode uses to guarantee the initialiser runs once even under concurrent access. It is the right choice for anything only ever touched from the main thread, and a race waiting to happen anywhere else.</p>"
                }
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
                title: "Three replacements for static",
                code: "// Top-level: no class needed. Compiled to a static method on StaticEquivalentKt.\nfun String.capitalizeWords(): String =\n    split(\" \").joinToString(\" \") { it.replaceFirstChar(Char::uppercase) }\n\nconst val APP_NAME = \"DroidDeck\"\n\n// Companion object: tied to a class, and it is a real object with a real type.\nclass Config private constructor(val theme: String) {\n    companion object {\n        fun default(): Config = Config(\"light\")\n        fun dark(): Config = Config(\"dark\")\n    }\n    override fun toString() = \"Config(theme=$theme)\"\n}\n\nobject Singleton {          // an object declaration, not attached to a class\n    fun describe() = \"one instance, created on first use\"\n}\n\nfun main() {\n    println(\"ada lovelace\".capitalizeWords())\n    println(\"APP_NAME = $APP_NAME\")\n\n    println(Config.default())\n    println(Config.dark())\n\n    // Unlike Java's static, a companion is an object you can hold and pass.\n    val companion = Config.Companion\n    println(\"companion held in a variable -> \" + companion.default())\n\n    println(Singleton.describe())\n    println(\"Singleton is one instance: \" + (Singleton === Singleton))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Ada Lovelace",
                        "APP_NAME = DroidDeck",
                        "Config(theme=light)",
                        "Config(theme=dark)",
                        "companion held in a variable -> Config(theme=light)",
                        "one instance, created on first use",
                        "Singleton is one instance: true"
                    ],
                    explain: "<p>Kotlin has no <code>static</code>, and offers three different things in its place.</p><p>A <strong>top-level function</strong> needs no class at all — it compiles to a static method on a file class, and it is the right home for a utility that is not tied to any type. A <strong>companion object</strong> attaches to a class, which is what you want for a factory, since <code>Config.default()</code> belongs with <code>Config</code>. An <strong>object declaration</strong> is a standalone singleton.</p><p>The line that holds a companion in a variable is the real difference from Java. A companion is an object with a type, so it can implement an interface and be passed around; <code>static</code> members are just members and cannot.</p>"
                }
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
                title: "object, and the reach that comes with it",
                code: "object AppSettings {\n    var isDarkMode: Boolean = false\n    private val cache = mutableMapOf<String, String>()\n\n    fun put(key: String, value: String) { cache[key] = value }\n    fun get(key: String): String? = cache[key]\n    fun size() = cache.size\n}\n\nfun somewhereElse() {\n    // No reference was passed in; the object is reachable from anywhere.\n    println(\"elsewhere sees isDarkMode = \" + AppSettings.isDarkMode)\n    println(\"elsewhere sees lang       = \" + AppSettings.get(\"lang\"))\n}\n\nfun main() {\n    AppSettings.isDarkMode = true\n    AppSettings.put(\"lang\", \"en\")\n\n    somewhereElse()\n\n    println(\"one instance: \" + (AppSettings === AppSettings))\n    println(\"cache size:   \" + AppSettings.size())\n\n    // That reach is the cost as well as the point: this state outlives every\n    // caller and there is no seam to replace it in a test.\n    AppSettings.put(\"lang\", \"hi\")\n    somewhereElse()\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "elsewhere sees isDarkMode = true",
                        "elsewhere sees lang       = en",
                        "one instance: true",
                        "cache size:   1",
                        "elsewhere sees isDarkMode = true",
                        "elsewhere sees lang       = hi"
                    ],
                    explain: "<p><code>object</code> is Kotlin's singleton: one instance, created lazily on first use, thread-safely, with no boilerplate. <code>somewhereElse()</code> takes no parameters and still sees the state, which is exactly the convenience being offered.</p><p>It is also the cost, and the last two lines show it. That state is global and mutable, it outlives every caller, and there is no way to substitute it. A test asserting on <code>AppSettings</code> is asserting on state some earlier test may have written.</p><p>Reach for <code>object</code> for stateless helpers and constants. For anything holding mutable state, an injected <code>@Singleton</code> gives you the same single instance with a seam to replace it.</p>"
                }
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
                title: "apply configures and returns the receiver",
                code: "// Stands in for android.content.Intent.\nclass Intent(val target: String) {\n    val extras = mutableMapOf<String, Any>()\n    var flags = 0\n    fun putExtra(key: String, value: Any) { extras[key] = value }\n    override fun toString() = \"Intent(target=$target, extras=$extras, flags=$flags)\"\n}\n\nfun main() {\n    val intent = Intent(\"DetailActivity\").apply {\n        putExtra(\"user_id\", 42)          // `this` is the Intent; no name repeated\n        putExtra(\"source\", \"deep_link\")\n        flags = 268435456\n    }\n    println(intent)\n\n    // apply returns the RECEIVER, so it can be used inline.\n    println(\"apply returns the same object: \" + (Intent(\"X\").apply { flags = 1 } is Intent))\n\n    val chained = Intent(\"Chained\").apply { putExtra(\"a\", 1) }.apply { putExtra(\"b\", 2) }\n    println(chained)\n\n    // The equivalent without apply: the variable name on every line.\n    val verbose = Intent(\"Verbose\")\n    verbose.putExtra(\"user_id\", 42)\n    verbose.putExtra(\"source\", \"deep_link\")\n    verbose.flags = 268435456\n    println(\"same result, more repetition: \" + (verbose.extras == intent.extras))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Intent(target=DetailActivity, extras={user_id=42, source=deep_link}, flags=268435456)",
                        "apply returns the same object: true",
                        "Intent(target=Chained, extras={a=1, b=2}, flags=0)",
                        "same result, more repetition: true"
                    ],
                    explain: "<p>Inside <code>apply</code> the object is <code>this</code>, so its members are in scope unqualified and the variable name disappears from every line — compare the block at the bottom, which is the same four operations with <code>verbose.</code> written four times.</p><p>Because <code>apply</code> returns <strong>the receiver</strong>, the whole thing is an expression: the configured object can be assigned, chained, or passed straight to a function, which is why the Android idiom is <code>startActivity(Intent(...).apply { })</code>.</p><p>That return value is the whole difference from <code>run</code> and <code>with</code>, which return the lambda's result instead.</p>"
                }
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
                title: "let for null-safety, and where the idiom leaks",
                code: "data class Address(val city: String?)\ndata class User(val name: String, val address: Address?)\n\nfun showUserName(name: String?) {\n    name?.let {\n        println(\"Hello, $it\")        // runs only when name is not null\n    } ?: println(\"No user\")\n}\n\nfun main() {\n    showUserName(\"Ada\")\n    showUserName(null)\n\n    // let returns the lambda's value, so it can transform as well as guard.\n    val length: Int = \"Ada\".let { it.length }\n    println(\"let returns the lambda result: $length\")\n\n    // Chaining through nullable properties.\n    val user = User(\"Ada\", Address(null))\n    println(\"city = \" + (user.address?.city?.let { \"in $it\" } ?: \"unknown\"))\n\n    // The trap: ?.let { } ?: run { } also fires the elvis branch when the\n    // lambda itself returns null.\n    val surprising = \"Ada\".let { null } ?: \"elvis branch ran anyway\"\n    println(surprising)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Hello, Ada",
                        "No user",
                        "let returns the lambda result: 3",
                        "city = unknown",
                        "elvis branch ran anyway"
                    ],
                    explain: "<p><code>?.let { }</code> runs the block only when the receiver is non-null, and inside it <code>it</code> is the non-null type — which is why no further checks are needed. <code>let</code> also returns the lambda's value, so it transforms as well as guards.</p><p>The last line is the flaw in the popular <code>?.let { } ?: run { }</code> pattern. The elvis operator does not know <em>why</em> the left side was null: if the receiver was non-null but the <strong>lambda returned null</strong>, the fallback runs anyway. Here the receiver was a perfectly good <code>\"Ada\"</code> and the \"no user\" branch still fired.</p><p>When both branches matter, an <code>if (x != null)</code> is clearer and cannot misfire.</p>"
                }
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
                title: "apply, with, also and run",
                code: "class TextView {\n    var text: String = \"\"\n    var textSize: Float = 14f\n}\n\nfun main() {\n    // apply: configure and return the receiver.\n    val view = TextView().apply {\n        text = \"Hello\"\n        textSize = 16f\n    }\n    println(\"apply gave back a \" + view::class.simpleName)\n\n    // with: operate on a receiver and return the LAMBDA's value.\n    val summary: String = with(view) {\n        \"$text (${textSize}sp)\"\n    }\n    println(\"with gave back    \" + summary)\n\n    // also: like apply, but the receiver is `it` rather than `this`.\n    val logged = view.also { println(\"also sees text = \" + it.text) }\n    println(\"also returns the receiver too: \" + (logged === view))\n\n    // run: like with, but called on the receiver, and null-safe with ?.\n    println(\"run gives        \" + view.run { text.length })\n\n    val missing: TextView? = null\n    println(\"null?.run gives  \" + missing?.run { text })\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "apply gave back a TextView",
                        "with gave back    Hello (16.0sp)",
                        "also sees text = Hello",
                        "also returns the receiver too: true",
                        "run gives        5",
                        "null?.run gives  null"
                    ],
                    explain: "<p>Two questions separate all four: <strong>what is the object called inside the block</strong>, and <strong>what comes out</strong>.</p><p><code>apply</code> and <code>also</code> return the receiver, so they are for configuring or observing something and carrying on with it — <code>apply</code> calls it <code>this</code>, <code>also</code> calls it <code>it</code>, which is handier when you want to log it or the name would shadow something.</p><p><code>with</code> and <code>run</code> return the lambda's value, so they are for computing something <em>from</em> the object. The difference is only how they are called, and that matters: <code>run</code> is an extension, so it chains off a nullable with <code>?.</code>, which the last line uses. <code>with</code> takes its receiver as an argument and cannot.</p>"
                }
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
                title: "Array, List and MutableList",
                code: "fun main() {\n    val intArray: IntArray = intArrayOf(1, 2, 3)   // unboxed primitives\n    intArray[0] = 99                               // mutable by index, fixed size\n    println(\"IntArray        \" + intArray.joinToString())\n    println(\"size is fixed:  \" + intArray.size)\n\n    val list: List<Int> = listOf(1, 2, 3)          // read-only view, boxed Ints\n    println(\"List            \" + list)\n\n    val mutable: MutableList<Int> = mutableListOf(1, 2, 3)\n    mutable.add(4)\n    println(\"MutableList     \" + mutable)\n\n    // `List` is read-only, not immutable: the same object can be seen as both.\n    val readOnly: List<Int> = mutable\n    mutable.add(5)\n    println(\"read-only view changed underneath: \" + readOnly)\n\n    // Arrays compare by identity; lists compare by content.\n    println(\"arrays ==       \" + (intArrayOf(1, 2) == intArrayOf(1, 2)))\n    println(\"arrays contentEquals \" + intArrayOf(1, 2).contentEquals(intArrayOf(1, 2)))\n    println(\"lists ==        \" + (listOf(1, 2) == listOf(1, 2)))\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "IntArray        99, 2, 3",
                        "size is fixed:  3",
                        "List            [1, 2, 3]",
                        "MutableList     [1, 2, 3, 4]",
                        "read-only view changed underneath: [1, 2, 3, 4, 5]",
                        "arrays ==       false",
                        "arrays contentEquals true",
                        "lists ==        true"
                    ],
                    explain: "<p>An <code>IntArray</code> holds unboxed primitives in a fixed-size block — mutable by index, never growable. That makes it the right choice for large numeric data and the wrong choice for almost everything else.</p><p>The line about the read-only view is the one to remember: <code>List</code> means <em>read-only</em>, not immutable. The same object was handed out as a <code>List</code> and mutated through the <code>MutableList</code> reference, and the read-only view saw the change. Returning <code>list.toList()</code> is what actually protects a caller.</p><p>The comparison lines are a genuine trap: arrays compare by identity even with <code>==</code>, so two arrays with identical contents are unequal. <code>contentEquals</code> is the one you want, and lists need no such care.</p>"
                }
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
                title: "Labelled break, continue and return",
                code: "fun main() {\n    outer@ for (i in 1..3) {\n        for (j in 1..3) {\n            if (j == 2) continue@outer     // next i, not next j\n            if (i == 3) break@outer        // leaves both loops\n            println(\"i=$i j=$j\")\n        }\n    }\n\n    println(\"---\")\n\n    listOf(1, 2, 3, 4).forEach {\n        if (it == 3) return@forEach        // skips this element only, like `continue`\n        println(\"forEach $it\")\n    }\n\n    println(\"---\")\n\n    // Without a label, `return` inside forEach would return from main itself,\n    // because forEach is inline. The label is what keeps it local.\n    val firstOdd = run {\n        listOf(2, 4, 5, 6).forEach { if (it % 2 == 1) return@run it }\n        -1\n    }\n    println(\"first odd = $firstOdd\")\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "i=1 j=1",
                        "i=2 j=1",
                        "---",
                        "forEach 1",
                        "forEach 2",
                        "forEach 4",
                        "---",
                        "first odd = 5"
                    ],
                    explain: "<p>The nested loops show why labels exist. A plain <code>continue</code> would go to the next <code>j</code>; <code>continue@outer</code> skips to the next <code>i</code>, and <code>break@outer</code> leaves both loops at once — which is otherwise a flag variable and an extra condition.</p><p><code>return@forEach</code> is the one seen most in real code, and it is the least obvious. Because <code>forEach</code> is inline, a bare <code>return</code> inside it returns from the <strong>enclosing function</strong>, not from the iteration — the same non-local return the <code>inline</code> question is about. The label is what makes it behave like <code>continue</code>.</p><p>The <code>run { }</code> block at the end is the idiom for breaking out of a <code>forEach</code> entirely with a value.</p>"
                }
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
                title: "A coroutine in a ViewModel",
                code: "class UserViewModel(private val repo: UserRepository) : ViewModel() {\n    fun loadUser(id: String) {\n        viewModelScope.launch {\n            val user = repo.fetchUser(id)   // suspend call, no thread blocked\n            _uiState.value = UiState.Success(user)\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "loadUser is called from the UI thread and returns immediately — launch does not wait.",
                        "The coroutine body starts on Dispatchers.Main, because that is viewModelScope's default.",
                        "repo.fetchUser suspends. The main thread is released and goes back to drawing frames.",
                        "The repository does its work on whichever dispatcher it chose, typically IO.",
                        "When it returns, the coroutine resumes on the main thread.",
                        "_uiState.value is set from the main thread, which is where UI state must be written.",
                        "If the ViewModel is cleared while the call is in flight, viewModelScope cancels the coroutine and the assignment never happens."
                    ],
                    explain: "<p>Steps 3 and 5 are why this reads like blocking code and is not. There is no callback, no thread handoff written by hand, and the line after the suspending call is already back on the main thread.</p><p>Step 7 is the safety property. Without it, a response arriving after the screen is gone would write to a dead ViewModel — the callback-era leak that this structure removes by construction.</p>"
                }
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
                title: "coroutineScope for concurrent children",
                code: "import kotlinx.coroutines.*\n\ndata class Dashboard(val profile: String, val feed: String)\n\nsuspend fun fetchProfile(): String { delay(100); println(\"  profile done\"); return \"Ada\" }\nsuspend fun fetchFeed(): String { delay(50); println(\"  feed done\"); return \"3 posts\" }\n\nsuspend fun loadDashboard(): Dashboard = coroutineScope {\n    val profile = async { fetchProfile() }\n    val feed = async { fetchFeed() }\n    Dashboard(profile.await(), feed.await())\n    // coroutineScope does not return until both children are done\n}\n\nfun main() = runBlocking<Unit> {\n    println(\"loading\")\n    println(\"loaded: \" + loadDashboard())\n\n    // If one child fails, coroutineScope cancels the others and rethrows.\n    try {\n        coroutineScope {\n            launch { delay(200); println(\"this never prints\") }\n            launch { delay(10); throw IllegalStateException(\"child failed\") }\n        }\n    } catch (e: IllegalStateException) {\n        println(\"coroutineScope rethrew: \" + e.message)\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "loading",
                        "  feed done",
                        "  profile done",
                        "loaded: Dashboard(profile=Ada, feed=3 posts)",
                        "coroutineScope rethrew: child failed"
                    ],
                    explain: "<p><code>coroutineScope</code> suspends until every child inside it has finished, which is why the dashboard is complete on the next line. It is a suspending function, not a scope you store — it exists to give a group of concurrent children a well-defined lifetime.</p><p>The second half is the guarantee that matters. When one child threw, the other was <strong>cancelled</strong> — its 200ms wait never completed and its line never printed — and the exception was rethrown to the caller. That is structured concurrency: no child outlives the block, and no failure gets lost.</p><p><code>supervisorScope</code> is the same shape with the opposite rule for siblings.</p>"
                }
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
                code: "class ProfileViewModel : ViewModel() {\n    fun refresh() {\n        viewModelScope.launch { /* cancelled on onCleared() */ }\n    }\n}\n\nclass ProfileFragment : Fragment() {\n    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n        viewLifecycleOwner.lifecycleScope.launch {\n            repeatOnLifecycle(Lifecycle.State.STARTED) {\n                viewModel.uiState.collect { render(it) }\n            }\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "viewModelScope is tied to the ViewModel and is cancelled in onCleared.",
                        "It therefore survives configuration changes: a rotation does not clear the ViewModel, so an in-flight request continues.",
                        "lifecycleScope is tied to a lifecycle owner and is cancelled when that owner is destroyed.",
                        "In a Fragment, viewLifecycleOwner.lifecycleScope matters more than lifecycleScope, because a Fragment's view is destroyed and recreated while the Fragment itself lives on.",
                        "repeatOnLifecycle(STARTED) goes further: it starts the collection when the screen reaches STARTED and CANCELS it when the screen stops.",
                        "On returning to the foreground, it starts a fresh collection.",
                        "Without repeatOnLifecycle, a plain launch keeps collecting while the screen is in the background, updating a UI nobody is looking at."
                    ],
                    explain: "<p>Step 4 is the mistake that leaks in practice. Using <code>lifecycleScope</code> instead of <code>viewLifecycleOwner.lifecycleScope</code> in a Fragment binds the collection to the Fragment, which outlives its view — so the collector holds a destroyed view hierarchy.</p><p>Step 2 is the division of labour: work that should survive rotation goes in the ViewModel, and anything touching views goes in the view scope.</p>"
                }
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
                code: "import kotlinx.coroutines.*\n\nfun main() = runBlocking<Unit> {\n    val handler = CoroutineExceptionHandler { _, e -> println(\"caught: ${e.message}\") }\n\n    // A context is a set of elements, combined with +, keyed by type.\n    val context = Dispatchers.Default + CoroutineName(\"sync-job\") + handler\n\n    val scope = CoroutineScope(context)\n    scope.launch {\n        println(\"name        = \" + coroutineContext[CoroutineName]?.name)\n        println(\"has a job   = \" + (coroutineContext[Job] != null))\n        println(\"on a pool thread = \" + Thread.currentThread().name.startsWith(\"DefaultDispatcher\"))\n    }.join()\n\n    // A child inherits the parent's context, and can override one element.\n    scope.launch(CoroutineName(\"child\")) {\n        println(\"child name  = \" + coroutineContext[CoroutineName]?.name)\n    }.join()\n\n    // Adding the same key twice keeps the right-hand one.\n    val overridden = CoroutineName(\"first\") + CoroutineName(\"second\")\n    println(\"last wins   = \" + overridden[CoroutineName]?.name)\n\n    scope.launch { throw IllegalStateException(\"boom\") }.join()\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "name        = sync-job",
                        "has a job   = true",
                        "on a pool thread = true",
                        "child name  = child",
                        "last wins   = second",
                        "caught: boom"
                    ],
                    explain: "<p>A context is a set of elements keyed by type, combined with <code>+</code> — a dispatcher, a name, a job, an exception handler. Every coroutine has one, and <code>coroutineContext[Key]</code> reads an element back out.</p><p>Two rules come out of the output. A child <strong>inherits</strong> its parent's context and may override individual elements, which is how <code>launch(Dispatchers.IO)</code> changes only the dispatcher. And combining two elements with the same key keeps the <strong>right-hand</strong> one, which is why the order in <code>Dispatchers.IO + CoroutineName(...)</code> matters when the same kind appears twice.</p><p>The one element you never inherit is <code>Job</code>: every coroutine gets its own, and that is what builds the parent-child tree.</p>"
                }
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
                title: "launch against async",
                code: "viewModelScope.launch {\n    logEvent(\"screen_open\")   // fire-and-forget, no result needed\n}\n\nviewModelScope.launch {\n    val profile = async { repo.fetchProfile() }   // starts concurrently\n    val posts = async { repo.fetchPosts() }       // starts concurrently\n    render(profile.await(), posts.await())        // both awaited here\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "launch starts a coroutine and returns a Job — a handle for cancelling and joining, with no result.",
                        "The logging call needs nothing back, so launch is the right shape and there is nothing to await.",
                        "In the second block, async starts fetchProfile and returns a Deferred immediately, without waiting.",
                        "The second async starts fetchPosts, so both requests are now in flight.",
                        "profile.await() suspends until the first result is ready.",
                        "posts.await() usually returns straight away, because that request has been running the whole time.",
                        "An exception in launch propagates to the parent at once; in async it is held in the Deferred until await is called."
                    ],
                    explain: "<p>Steps 3 and 4 are the point people miss: <strong>the concurrency comes from <code>async</code>, not from <code>await</code></strong>. Both requests are running before either is awaited, which is why the pair costs the longer of the two rather than the sum.</p><p>Which means <code>async { }.await()</code> written on one line is a mistake — it starts a coroutine and immediately waits for it, so nothing overlaps.</p><p>Step 7 is the other half of choosing between them, and it is the reason an <code>async</code> whose result is never awaited can swallow a failure entirely.</p>"
                }
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
                title: "delay suspends, Thread.sleep blocks",
                code: "import kotlinx.coroutines.*\n\nfun main() = runBlocking {\n    // delay() suspends: the coroutine stops, the thread does not.\n    val started = mutableListOf<String>()\n    coroutineScope {\n        launch { started += \"A start\"; delay(50); started += \"A end\" }\n        launch { started += \"B start\"; delay(20); started += \"B end\" }\n    }\n    println(\"with delay():        $started\")\n\n    // Thread.sleep() blocks: nothing else on that thread can run meanwhile.\n    val blocking = mutableListOf<String>()\n    coroutineScope {\n        launch { blocking += \"A start\"; Thread.sleep(50); blocking += \"A end\" }\n        launch { blocking += \"B start\"; Thread.sleep(20); blocking += \"B end\" }\n    }\n    println(\"with Thread.sleep(): $blocking\")\n\n    // delay is also a cancellation point; Thread.sleep is not.\n    val job = launch { try { delay(1000) } finally { println(\"delay was cancelled\") } }\n    delay(20)\n    job.cancelAndJoin()\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "with delay():        [A start, B start, B end, A end]",
                        "with Thread.sleep(): [A start, A end, B start, B end]",
                        "delay was cancelled"
                    ],
                    explain: "<p>The two lists are the whole answer. With <code>delay</code>: <code>A start, B start, B end, A end</code> — both coroutines started, A suspended and released the thread, B ran and finished first because its wait was shorter. With <code>Thread.sleep</code>: <code>A start, A end, B start, B end</code> — A held the thread for its full 50ms and B could not even begin.</p><p>Same structure, same dispatcher, and one of them is concurrent while the other is not. A blocking call inside a coroutine does not just slow that coroutine down; it takes a thread out of the pool that everything else is sharing.</p><p>The last line adds the other difference: <code>delay</code> is a cancellation point and <code>Thread.sleep</code> is not, so a blocked coroutine cannot be cancelled until it wakes up on its own.</p>"
                }
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
                title: "value class, for types that cannot be mixed up",
                code: "@JvmInline\nvalue class UserId(val value: String)\n\n@JvmInline\nvalue class OrderId(val value: String)\n\nfun fetchUser(id: UserId) = \"fetching user ${id.value}\"\nfun fetchOrder(id: OrderId) = \"fetching order ${id.value}\"\n\nfun main() {\n    val userId = UserId(\"u-1\")\n    val orderId = OrderId(\"o-1\")\n\n    println(fetchUser(userId))\n    println(fetchOrder(orderId))\n\n    // fetchUser(orderId)   // COMPILE ERROR — and that is the entire point.\n    // Both wrap a String, so without value classes this mix-up compiles fine.\n\n    println(\"underlying value  \" + userId.value)\n    println(\"wrapper toString  \" + userId)\n\n    // Equality is by the wrapped value.\n    println(\"UserId(\\\"u-1\\\") == UserId(\\\"u-1\\\") \" + (userId == UserId(\"u-1\")))\n\n    // At runtime the wrapper is usually erased to the String itself — but not\n    // when it is boxed, for instance inside a collection.\n    val ids: List<UserId> = listOf(userId)\n    println(\"boxed in a list   \" + ids)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "fetching user u-1",
                        "fetching order o-1",
                        "underlying value  u-1",
                        "wrapper toString  UserId(value=u-1)",
                        "UserId(\"u-1\") == UserId(\"u-1\") true",
                        "boxed in a list   [UserId(value=u-1)]"
                    ],
                    explain: "<p>The commented-out line is the feature. <code>UserId</code> and <code>OrderId</code> both wrap a <code>String</code>, and passing one where the other is expected does not compile. Without them both parameters are <code>String</code>, the arguments can be swapped at any call site, and nothing complains until production.</p><p>The cost is usually nothing. A <code>value class</code> is erased at runtime to the type it wraps, so <code>fetchUser(userId)</code> passes a bare <code>String</code> with no allocation — the safety is entirely a compile-time construct.</p><p>\"Usually\", because boxing brings the wrapper back: putting one in a collection, or using it as a generic argument or a nullable, allocates a real object. The last line shows that boxed form.</p>"
                }
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
                title: "A sealed hierarchy, and exhaustive when",
                code: "sealed class Result<out T>\ndata class Success<T>(val data: T) : Result<T>()\ndata class Error(val message: String) : Result<Nothing>()\nobject Loading : Result<Nothing>()\n\nfun <T> render(result: Result<T>): String = when (result) {\n    is Success -> \"Data: ${result.data}\"\n    is Error -> \"Error: ${result.message}\"\n    Loading -> \"Loading...\"\n    // no `else` branch — the compiler knows the hierarchy is closed\n}\n\nfun main() {\n    val states: List<Result<String>> = listOf(\n        Loading,\n        Success(\"Ada\"),\n        Error(\"no network\")\n    )\n    states.forEach { println(render(it)) }\n\n    // Success is a data class, so equality is structural.\n    println(\"two Successes equal? \" + (Success(\"Ada\") == Success(\"Ada\")))\n\n    // Loading is an object: there is only one, so == and === agree.\n    println(\"Loading is a singleton \" + (Loading === Loading))\n\n    // Smart casting is what makes result.data reachable without a cast.\n    val r: Result<String> = Success(\"Grace\")\n    if (r is Success) println(\"smart cast gives \" + r.data)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Loading...",
                        "Data: Ada",
                        "Error: no network",
                        "two Successes equal? true",
                        "Loading is a singleton true",
                        "smart cast gives Grace"
                    ],
                    explain: "<p>The <code>when</code> has no <code>else</code> branch and compiles, because <code>sealed</code> tells the compiler the full list of subclasses — they must be declared in the same package and module. That is the property worth having: add a fourth state and every <code>when</code> over <code>Result</code> stops compiling until it is handled. An <code>else</code> branch would have swallowed the new case silently.</p><p>Smart casting is the other half. Inside <code>is Success -&gt;</code> the compiler knows the type, so <code>result.data</code> needs no cast.</p><p>The mix of <code>data class</code> and <code>object</code> is deliberate: states carrying data are classes, and a state with nothing to carry is an <code>object</code>, so there is exactly one <code>Loading</code> and <code>===</code> holds.</p>"
                }
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
                title: "A sealed hierarchy for screen state",
                code: "sealed interface ProfileUiState {\n    data object Loading : ProfileUiState\n    data class Loaded(val user: User) : ProfileUiState\n    data class Error(val throwable: Throwable) : ProfileUiState\n}\n\n@Composable\nfun ProfileScreen(state: ProfileUiState) {\n    when (state) {\n        ProfileUiState.Loading -> LoadingSpinner()\n        is ProfileUiState.Loaded -> ProfileContent(state.user)\n        is ProfileUiState.Error -> ErrorMessage(state.throwable.message)\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "ProfileUiState is sealed, so the compiler knows Loading, Loaded and Error are the only possibilities.",
                        "The ViewModel exposes a StateFlow<ProfileUiState> and sets it to Loading before starting work.",
                        "On success it sets Loaded(user); on failure, Error(throwable).",
                        "The screen collects that flow and runs one when over the state.",
                        "That when needs no else branch, and the compiler checks every case is handled.",
                        "Adding a fourth state — say Empty — breaks compilation everywhere the state is consumed, until each site handles it.",
                        "Because the states are distinct types, an impossible combination such as \"loading with an error\" cannot be represented at all."
                    ],
                    explain: "<p>Step 7 is why this beats the older habit of a data class with <code>isLoading</code>, <code>user</code> and <code>error</code> fields. That shape allows sixteen combinations for three fields, most of them meaningless, and every consumer has to decide what \"loading and error at once\" means. A sealed hierarchy allows exactly the states that exist.</p><p>Step 6 is the safety net: an <code>else</code> branch would have made a new state compile silently and behave wrongly at runtime. Exhaustiveness turns adding a state into a task the compiler hands you a checklist for.</p><p><code>data object Loading</code> rather than <code>object</code> is a Kotlin 1.9 refinement — it just gives a readable <code>toString</code>.</p>"
                }
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
                title: "Lists, sets, maps and the operator chain",
                code: "fun main() {\n    val readOnly: List<Int> = listOf(1, 2, 3)\n    val mutable: MutableList<Int> = mutableListOf(1, 2, 3)\n    mutable.add(4)\n    println(\"List        \" + readOnly)\n    println(\"MutableList \" + mutable)\n\n    val uniqueSet: Set<String> = setOf(\"a\", \"b\", \"a\")\n    println(\"Set         \" + uniqueSet + \"  (duplicate dropped, order kept)\")\n\n    val map: Map<String, Int> = mapOf(\"a\" to 1, \"b\" to 2)\n    println(\"Map         \" + map)\n    println(\"map[\\\"a\\\"]    \" + map[\"a\"] + \", missing key -> \" + map[\"z\"])\n\n    // Operators are lazy only in a Sequence; on a List each step builds a list.\n    val evens = (1..10).filter { it % 2 == 0 }.map { it * it }\n    println(\"chained     \" + evens)\n\n    println(\"sum/max     \" + evens.sum() + \" / \" + evens.max())\n    println(\"grouped     \" + (1..6).groupBy { if (it % 2 == 0) \"even\" else \"odd\" })\n    println(\"flatten     \" + listOf(listOf(1, 2), listOf(3)).flatten())\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "List        [1, 2, 3]",
                        "MutableList [1, 2, 3, 4]",
                        "Set         [a, b]  (duplicate dropped, order kept)",
                        "Map         {a=1, b=2}",
                        "map[\"a\"]    1, missing key -> null",
                        "chained     [4, 16, 36, 64, 100]",
                        "sum/max     220 / 100",
                        "grouped     {odd=[1, 3, 5], even=[2, 4, 6]}",
                        "flatten     [1, 2, 3]"
                    ],
                    explain: "<p>Kotlin splits every collection into a read-only interface and a mutable one, which is why <code>listOf</code> and <code>mutableListOf</code> are different calls rather than a flag.</p><p><code>setOf</code> dropped the duplicate and kept insertion order, because the default implementation is a <code>LinkedHashSet</code> — the same is true of <code>mapOf</code>, so iteration order is predictable rather than arbitrary.</p><p>Indexing a map returns <code>null</code> for a missing key rather than throwing, which is why the result type is nullable.</p><p>One thing the output cannot show: on a <code>List</code>, <code>filter</code> then <code>map</code> builds an intermediate list at each step. For a long chain over a large collection, <code>asSequence()</code> makes it lazy and single-pass.</p>"
                }
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
                title: "Elvis: default, early return, and throw",
                code: "data class Address(val city: String?)\ndata class User(val name: String, val address: Address?)\n\nfun greet(name: String?): String = \"Hello, ${name ?: \"Guest\"}\"\n\nfun process(input: String?) {\n    val value = input ?: return println(\"  process: nothing to do\")\n    println(\"  process: length is ${value.length}\")\n}\n\nfun main() {\n    println(greet(\"Ada\"))\n    println(greet(null))\n\n    process(\"hello\")\n    process(null)\n\n    val user: User? = User(\"Ada\", Address(null))\n    println(\"city = \" + (user?.address?.city ?: \"Unknown\"))\n\n    val noUser: User? = null\n    println(\"city = \" + (noUser?.address?.city ?: \"Unknown\"))\n\n    // The right-hand side can also throw, which is the \"require or fail\" idiom.\n    try {\n        val required = noUser ?: throw IllegalStateException(\"user is required here\")\n        println(required)\n    } catch (e: IllegalStateException) {\n        println(\"threw: \" + e.message)\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "Hello, Ada",
                        "Hello, Guest",
                        "  process: length is 5",
                        "  process: nothing to do",
                        "city = Unknown",
                        "city = Unknown",
                        "threw: user is required here"
                    ],
                    explain: "<p>Three uses of one operator. As a <strong>default</strong> it replaces a null with something usable. As an <strong>early exit</strong> — <code>val value = input ?: return</code> — it turns a null check into a guard clause, and because <code>return</code> has type <code>Nothing</code> the compiler accepts it on the right-hand side and smart-casts <code>value</code> to non-null afterwards.</p><p>As a <strong>throw</strong> it is the \"this must not be null here\" assertion, and it is strictly better than <code>!!</code> because it can say why.</p><p>Chained with <code>?.</code> it collapses a whole nested null check into one line: any null anywhere in <code>user?.address?.city</code> short-circuits to the fallback.</p>"
                }
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
                title: "withTimeout and withTimeoutOrNull",
                code: "import kotlinx.coroutines.*\n\nsuspend fun fetchSlowData(): String { delay(300); return \"data\" }\nsuspend fun fetchFastData(): String { delay(10); return \"data\" }\n\nfun main() = runBlocking {\n    // withTimeoutOrNull returns null instead of throwing.\n    println(\"slow within 100ms -> \" + withTimeoutOrNull(100) { fetchSlowData() })\n    println(\"fast within 100ms -> \" + withTimeoutOrNull(100) { fetchFastData() })\n\n    // withTimeout throws TimeoutCancellationException instead.\n    try {\n        withTimeout(100) { fetchSlowData() }\n    } catch (e: TimeoutCancellationException) {\n        println(\"withTimeout threw \" + e::class.simpleName)\n    }\n\n    // The timeout cancels the block, so cleanup in finally still runs.\n    withTimeoutOrNull(50) {\n        try {\n            delay(1000)\n        } finally {\n            println(\"finally ran when the timeout fired\")\n        }\n    }\n    println(\"done\")\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "slow within 100ms -> null",
                        "fast within 100ms -> data",
                        "withTimeout threw TimeoutCancellationException",
                        "finally ran when the timeout fired",
                        "done"
                    ],
                    explain: "<p>The two differ only in how they fail. <code>withTimeoutOrNull</code> returns <code>null</code>, which suits a value you can do without; <code>withTimeout</code> throws <code>TimeoutCancellationException</code>, which suits a case where carrying on makes no sense.</p><p>The last case is the important one: a timeout <strong>cancels</strong> the block rather than abandoning it, so the work actually stops and a <code>finally</code> still runs. The request is not left in flight consuming a connection.</p><p>The catch to know: because <code>TimeoutCancellationException</code> is a <code>CancellationException</code>, a broad <code>catch (e: Exception)</code> inside the block will swallow it and break cancellation.</p>"
                }
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
                title: "awaitAll for several concurrent results",
                code: "import kotlinx.coroutines.*\n\nclass Repo {\n    suspend fun fetchUser(): String { delay(150); println(\"  user done\"); return \"Ada\" }\n    suspend fun fetchPosts(): Int { delay(100); println(\"  posts done\"); return 3 }\n    suspend fun fetchAds(): Int { delay(50); println(\"  ads done\"); return 1 }\n}\n\nval repo = Repo()\n\nsuspend fun loadHome() = coroutineScope {\n    val user = async { repo.fetchUser() }\n    val posts = async { repo.fetchPosts() }\n    val ads = async { repo.fetchAds() }\n\n    // awaitAll waits for every Deferred and fails fast if any one of them does.\n    val results = awaitAll(user, posts, ads)\n    \"HomeData(user=${results[0]}, posts=${results[1]}, ads=${results[2]})\"\n}\n\nfun main() = runBlocking<Unit> {\n    println(\"loading\")\n    println(loadHome())\n\n    // awaitAll fails as soon as ONE fails, without waiting for the rest.\n    try {\n        coroutineScope {\n            val ok = async { delay(200); \"slow but fine\" }\n            val bad = async<String> { delay(10); throw IllegalStateException(\"one failed\") }\n            awaitAll(ok, bad)\n        }\n    } catch (e: IllegalStateException) {\n        println(\"awaitAll failed fast: \" + e.message)\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "loading",
                        "  ads done",
                        "  posts done",
                        "  user done",
                        "HomeData(user=Ada, posts=3, ads=1)",
                        "awaitAll failed fast: one failed"
                    ],
                    explain: "<p>The three calls overlap — ads finish first despite being requested last — and <code>awaitAll</code> collects them once all three are done. It is <code>await()</code> on each <code>Deferred</code> in turn, with better failure behaviour.</p><p>That behaviour is the second half. <code>awaitAll</code> <strong>fails fast</strong>: the moment one child throws, it stops waiting for the rest rather than sitting through the slowest one before reporting an error it already knew about. Because this is inside <code>coroutineScope</code>, the surviving children are cancelled too.</p><p>The cost is that <code>awaitAll</code> returns <code>List&lt;T&gt;</code> of a common type, so heterogeneous results need casting — which is why hand-written <code>await()</code> calls are still common when the types differ.</p>"
                }
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
                title: "Job state, and what SupervisorJob changes",
                code: "import kotlinx.coroutines.*\n\nfun main() = runBlocking<Unit> {\n    val job = launch {\n        delay(50)\n        println(\"job finished\")\n    }\n    println(\"isActive right after launch = \" + job.isActive)\n    job.join()\n    println(\"isCompleted after join      = \" + job.isCompleted)\n\n    // A handler that records rather than prints, so the output does not depend\n    // on when the handler thread gets a turn.\n    val seen = mutableListOf<String>()\n    val handler = CoroutineExceptionHandler { _, e -> seen += e.message ?: \"?\" }\n\n    // Under a plain Job, a failing child cancels the whole scope.\n    val plain = CoroutineScope(Job() + handler)\n    plain.launch { throw RuntimeException(\"A failed\") }.join()\n    plain.launch { println(\"B under a plain Job\") }.join()\n    println(\"plain Job scope still active?   \" + plain.isActive)\n\n    // Under a SupervisorJob, failure does not travel sideways.\n    val supervisor = CoroutineScope(SupervisorJob() + handler)\n    supervisor.launch { throw RuntimeException(\"A failed\") }.join()\n    supervisor.launch { println(\"B under a SupervisorJob ran\") }.join()\n    println(\"supervisor scope still active?  \" + supervisor.isActive)\n\n    println(\"failures reported to handler:   \" + seen)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "isActive right after launch = true",
                        "job finished",
                        "isCompleted after join      = true",
                        "plain Job scope still active?   false",
                        "B under a SupervisorJob ran",
                        "supervisor scope still active?  true",
                        "failures reported to handler:   [A failed, A failed]"
                    ],
                    explain: "<p>A <code>Job</code> is the handle on a coroutine's lifecycle — <code>isActive</code>, <code>isCompleted</code>, <code>isCancelled</code>, plus <code>cancel</code> and <code>join</code>.</p><p>The middle block is the behaviour worth internalising. Under a plain <code>Job</code>, one child failing cancelled the entire scope: <strong>\"B under a plain Job\" never printed</strong>, and the scope reported itself inactive. Anything launched afterwards is dead on arrival — the usual cause of a screen that silently stops responding after one unrelated error.</p><p>A <code>SupervisorJob</code> lets failure travel up but not sideways, so B ran and the scope stayed usable. That is why <code>viewModelScope</code> uses one.</p><p>Both failures still reached the handler, which is what the last line records.</p>"
                }
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
                title: "job.cancel against scope.cancel",
                code: "val uploadJob = viewModelScope.launch { uploadFile() }\nval syncJob = viewModelScope.launch { syncData() }\n\nuploadJob.cancel()   // only the upload stops; syncJob keeps running\n\n// scope.cancel() would stop BOTH and disable viewModelScope entirely",
                output: {
                    kind: "trace",
                    lines: [
                        "Two coroutines are launched in viewModelScope. Each returns its own Job.",
                        "uploadJob.cancel() cancels that coroutine and its children only.",
                        "syncJob is a sibling, not a child, so it is untouched and keeps running.",
                        "The scope itself remains active, and new coroutines can still be launched into it.",
                        "scope.cancel() instead cancels the scope's own Job.",
                        "That cancels every child, so both the upload and the sync stop.",
                        "It also puts the scope permanently in a cancelled state: anything launched afterwards will not run at all."
                    ],
                    explain: "<p>Step 7 is the trap. A cancelled scope is not reusable — it is finished. Calling <code>viewModelScope.cancel()</code> by hand leaves a ViewModel that silently ignores every later <code>launch</code>, and there is no error to notice.</p><p>Cancel the <em>job</em> to stop one operation; let the framework cancel the <em>scope</em> when the owner dies. Cancelling a lifecycle scope yourself is almost always a mistake.</p>"
                }
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
                title: "The exception an un-awaited async holds",
                code: "import kotlinx.coroutines.*\n\nfun main() = runBlocking<Unit> {\n    // Under a SupervisorJob, an async whose result is never awaited holds its\n    // exception inside the Deferred, and nothing ever reports it.\n    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)\n    val neverAwaited = scope.async { throw RuntimeException(\"never seen!\") }\n    delay(50)\n    println(\"the coroutine has failed:      \" + neverAwaited.isCancelled)\n    println(\"but nothing was reported, and execution continues\")\n\n    // The exception only surfaces when someone asks for the value.\n    try {\n        neverAwaited.await()\n    } catch (e: RuntimeException) {\n        println(\"await() finally surfaced it:   \" + e.message)\n    }\n\n    // Under a plain Job the failure propagates to the parent regardless.\n    try {\n        coroutineScope {\n            async<Unit> { throw IllegalStateException(\"propagates without await\") }\n        }\n    } catch (e: IllegalStateException) {\n        println(\"plain Job propagated it anyway: \" + e.message)\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "the coroutine has failed:      true",
                        "but nothing was reported, and execution continues",
                        "await() finally surfaced it:   never seen!",
                        "plain Job propagated it anyway: propagates without await"
                    ],
                    explain: "<p>The first two lines are the bug. The coroutine failed — <code>isCancelled</code> is <code>true</code> — and <strong>nothing was reported</strong>. <code>async</code> stores its exception inside the <code>Deferred</code> to rethrow when someone asks for the value, and if nobody ever calls <code>await()</code>, nobody ever asks.</p><p>Not even the <code>CoroutineExceptionHandler</code> helps, because as far as the machinery is concerned the failure has an owner: the <code>Deferred</code>. It is only genuinely lost under a <code>SupervisorJob</code>, where the failure has nowhere else to go.</p><p>Under a plain <code>Job</code> — the last line — the exception propagates to the parent whether or not it is awaited. So the rule is simple: <strong>if you are not going to await it, use <code>launch</code>.</strong></p>"
                }
            }],
            subsection: null
        },
        {
            id: "kotlin-debounce-coroutines",
            importance: "should-know",
            question: "How to implement debounce using Kotlin Coroutines?",
            answer: "<p><strong>🔑 Flow's built-in debounce operator</strong></p><ul><li>The idiomatic approach is <code>kotlinx.coroutines.flow.debounce(timeoutMillis)</code> — applied to a <code>Flow</code>, it emits an item only after the given quiet period has passed <strong>without a new emission</strong>, dropping intermediate values.</li><li><strong>Common source</strong> — a search box's text changes exposed as a <code>Flow&lt;String&gt;</code> (e.g. via <code>callbackFlow</code> or <code>MutableStateFlow</code>), debounced before triggering a network search.</li><li><strong>Manual debounce</strong> (without Flow) — cancel and relaunch a coroutine <code>Job</code> on every new event, using <code>delay()</code> before doing the actual work, so only the last scheduled job survives the quiet window.</li><li>Distinct from <code>throttleLatest</code>-style operators — debounce waits for silence, while throttling limits the <em>rate</em> of emissions regardless of gaps.</li></ul>",
            referenceLinks: [{ title: "Kotlin Flow: debounce", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/debounce.html" }],
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
                code: "private val query = MutableStateFlow(\"\")\n\nval results: Flow<List<Result>> = query\n    .debounce(300L)\n    .distinctUntilChanged()\n    .filter { it.length >= 2 }\n    .flatMapLatest { text -> repo.search(text) }\n\nfun onQueryChanged(text: String) {\n    query.value = text\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "Each keystroke sets query.value, and StateFlow conflates duplicates automatically.",
                        "debounce(300) waits for a 300ms gap, so a burst of typing yields one value instead of one per character.",
                        "distinctUntilChanged drops a query identical to the previous one — what typing a character and deleting it produces.",
                        "filter discards queries shorter than two characters, which are not worth a request.",
                        "flatMapLatest starts the search for whatever survived.",
                        "If a newer query arrives first, the in-flight search is cancelled and replaced.",
                        "The collector therefore only ever sees results for the most recent query."
                    ],
                    explain: "<p>Steps 2 to 4 exist to <em>not</em> make requests. Together they turn roughly one call per keystroke into one per pause, which is the difference between a usable search and a rate limit.</p><p>Step 6 is the correctness half rather than the efficiency half. Without <code>flatMapLatest</code>, a slow response for \"and\" can land after the response for \"android\" and overwrite the right answer — the classic out-of-order search bug, made impossible here by cancellation.</p>"
                }
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
                title: "Series against parallel",
                code: "import kotlinx.coroutines.*\n\nsuspend fun fetchA(): String { delay(100); println(\"  A finished\"); return \"A\" }\nsuspend fun fetchB(): String { delay(60); println(\"  B finished\"); return \"B\" }\n\nsuspend fun runInSeries(): String {\n    val a = fetchA()      // nothing else happens until this returns\n    val b = fetchB()\n    return a + b\n}\n\nsuspend fun runInParallel(): String = coroutineScope {\n    val a = async { fetchA() }   // starts immediately\n    val b = async { fetchB() }   // starts immediately, overlapping with A\n    a.await() + b.await()\n}\n\nfun main() = runBlocking {\n    println(\"series:\")\n    println(\"  result = \" + runInSeries())\n\n    println(\"parallel:\")\n    println(\"  result = \" + runInParallel())\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "series:",
                        "  A finished",
                        "  B finished",
                        "  result = AB",
                        "parallel:",
                        "  B finished",
                        "  A finished",
                        "  result = AB"
                    ],
                    explain: "<p>Same two calls, same result, different arrival order — and that order is the evidence. In series A finished before B started, because the second line could not run until the first returned. In parallel B finished first, since it is the shorter of the two and both were already running.</p><p>The time taken follows from that: series costs A + B, parallel costs whichever is longer. The rule is about dependency — if B needs A's result, series is not a choice, it is the only option. When they are independent, <code>async</code> is close to free.</p>"
                }
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
                title: "Two different yields",
                code: "import kotlinx.coroutines.*\n\nfun main() = runBlocking<Unit> {\n    // A sequence yields values lazily, one per request — an infinite source\n    // that costs nothing until taken from.\n    val naturals = sequence {\n        var n = 1\n        while (true) {\n            yield(n++)\n        }\n    }\n    println(\"first 5 naturals = \" + naturals.take(5).toList())\n\n    // The coroutine yield() is a different function with a related job: it is a\n    // suspension point, which makes a CPU-bound loop cancellable.\n    val cancellable = launch(Dispatchers.Default) {\n        var i = 0\n        try {\n            while (true) {\n                i++\n                if (i % 1000 == 0) yield()   // gives cancellation a chance to land\n            }\n        } finally {\n            println(\"cancellable loop stopped after being cancelled\")\n        }\n    }\n    delay(50)\n    cancellable.cancelAndJoin()\n\n    // yield() also lets other coroutines on the same dispatcher take a turn.\n    coroutineScope {\n        launch { repeat(3) { println(\"  first $it\"); yield() } }\n        launch { repeat(3) { println(\"  second $it\"); yield() } }\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "first 5 naturals = [1, 2, 3, 4, 5]",
                        "cancellable loop stopped after being cancelled",
                        "  first 0",
                        "  second 0",
                        "  first 1",
                        "  second 1",
                        "  first 2",
                        "  second 2"
                    ],
                    explain: "<p>The name is shared by two unrelated things.</p><p><code>yield(n)</code> in a <code>sequence { }</code> builder <strong>produces a value</strong> lazily. The generator is an infinite <code>while (true)</code> and costs nothing, because nothing runs until <code>take(5)</code> asks.</p><p><code>yield()</code> in a coroutine <strong>produces the thread</strong>. It takes no argument and returns nothing; it is a suspension point, which does two jobs. It gives cancellation somewhere to land — the CPU-bound loop stops when cancelled only because of it — and it lets other coroutines on the same dispatcher take a turn, which is why the last block interleaves rather than running one to completion and then the other.</p>"
                }
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
                code: "import kotlin.properties.Delegates\n\nclass SettingsViewModel {\n    var theme: String by Delegates.observable(\"light\") { _, old, new ->\n        println(\"  theme changed: $old -> $new\")\n    }\n\n    // vetoable can reject a change outright.\n    var fontScale: Int by Delegates.vetoable(100) { _, _, new -> new in 50..200 }\n}\n\ninterface Logger { fun log(msg: String) }\nclass ConsoleLogger : Logger { override fun log(msg: String) = println(\"  log: $msg\") }\n\n// Class delegation: every Logger call is forwarded to `impl`, with no\n// forwarding methods written by hand.\nclass Service(impl: Logger) : Logger by impl {\n    fun work() = log(\"working\")\n}\n\nfun main() {\n    val vm = SettingsViewModel()\n    vm.theme = \"dark\"\n    vm.theme = \"light\"\n\n    vm.fontScale = 150\n    println(\"fontScale accepted: \" + vm.fontScale)\n    vm.fontScale = 900\n    println(\"fontScale after a rejected change: \" + vm.fontScale)\n\n    Service(ConsoleLogger()).work()\n\n    // by lazy is the same mechanism: a property backed by an object.\n    val expensive: String by lazy { \"  computed once\"; \"computed once\" }\n    println(expensive)\n    println(expensive)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "  theme changed: light -> dark",
                        "  theme changed: dark -> light",
                        "fontScale accepted: 150",
                        "fontScale after a rejected change: 150",
                        "  log: working",
                        "computed once",
                        "computed once"
                    ],
                    explain: "<p>Two different features that share a keyword.</p><p><strong>Property delegation</strong> hands get and set to another object. <code>observable</code> fires a callback after each change, and <code>vetoable</code> can refuse one — the font scale stayed at 150 because 900 failed the predicate, with no exception and no separate validation code. <code>by lazy</code> is the same mechanism.</p><p><strong>Class delegation</strong> is the last part: <code>Service</code> implements <code>Logger</code> without writing a single forwarding method, because <code>by impl</code> generates them. That is composition with the boilerplate removed, and it is the practical answer to \"prefer composition over inheritance\" — the usual objection being how much typing it takes.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "kotlin-statein-vs-sharein",
            importance: "must-know",
            question: "What is the difference between stateIn and shareIn in Kotlin Flow?",
            answer: "<p><strong>⚖️ Converting a cold Flow into a hot, shareable one</strong></p><table><thead><tr><th>Aspect</th><th><code>stateIn</code></th><th><code>shareIn</code></th></tr></thead><tbody><tr><td>Result type</td><td><code>StateFlow&lt;T&gt;</code></td><td><code>SharedFlow&lt;T&gt;</code></td></tr><tr><td>Initial value</td><td><strong>Required</strong> — must supply one synchronously</td><td>Optional — no initial value needed</td></tr><tr><td>Replay behavior</td><td>Always replays exactly the latest value (replay = 1, conflated)</td><td>Configurable replay count (0, 1, or more)</td></tr><tr><td>Duplicate emissions</td><td>Conflated — only distinct-by-reference latest value matters for new collectors</td><td>Replays the configured buffer as-is, duplicates included</td></tr><tr><td>Typical use</td><td>Exposing UI state that always has a &quot;current&quot; value, e.g. from a <code>ViewModel</code></td><td>Sharing a stream of one-off events or a general hot stream among multiple collectors</td></tr></tbody></table><ul><li>Both take a <strong>SharingStarted</strong> policy — <code>Eagerly</code> (start immediately, keep running), <code>Lazily</code> (start on first collector, keep running), or <code>WhileSubscribed(stopTimeoutMs)</code> (start on first collector, stop shortly after the last one leaves — the common Android choice to avoid wasted work).</li></ul>",
            referenceLinks: [{ title: "Kotlin Flow: StateFlow and SharedFlow", url: "https://kotlinlang.org/docs/coroutines-flow.html#hot-flows" }],
            tags: ["statein", "sharein", "stateflow", "sharedflow", "flow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "stateIn in a ViewModel",
                code: "class FeedViewModel(repo: FeedRepository) : ViewModel() {\n    val uiState: StateFlow<List<Post>> = repo.observePosts()\n        .stateIn(\n            scope = viewModelScope,\n            started = SharingStarted.WhileSubscribed(5000L),\n            initialValue = emptyList()\n        )\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "repo.observePosts() is a cold Flow: each collector would start its own database observation.",
                        "stateIn converts it to a hot StateFlow, shared by every collector, running in viewModelScope.",
                        "initialValue gives the StateFlow a value before the source has emitted anything, so the screen has something to draw immediately.",
                        "WhileSubscribed(5000) starts the upstream when the first collector subscribes.",
                        "When the last collector goes away — the screen stops — a five second timer starts.",
                        "If the screen comes back within those five seconds, the same upstream is still running and the current value is delivered at once.",
                        "If it does not, the upstream is cancelled and the database observation stops."
                    ],
                    explain: "<p>The five seconds in step 5 is chosen for one specific event: a screen rotation, which destroys and recreates the view in well under that. Without the timeout, rotating would tear down the database observation and immediately start it again.</p><p><code>stateIn</code> takes an <code>initialValue</code> and conflates; <code>shareIn</code> does neither, and is the right choice for events, where there is no \"current value\" and dropping duplicates would be wrong.</p><p><code>SharingStarted.Eagerly</code> and <code>Lazily</code> keep the upstream alive for the whole scope, which for a database or location observer means work continuing while the app is in the background.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "kotlin-flatmap-operators",
            importance: "should-know",
            question: "What is the difference between flatMapConcat, flatMapMerge, and flatMapLatest in Kotlin Flow?",
            answer: "<p><strong>⚖️ Three strategies for flattening a Flow of Flows</strong></p><table><thead><tr><th>Operator</th><th>Ordering</th><th>Concurrency</th><th>Typical use</th></tr></thead><tbody><tr><td><code>flatMapConcat</code></td><td>Preserves order — waits for each inner flow to finish before starting the next</td><td>Sequential, one inner flow at a time</td><td>Requests that must run strictly in order</td></tr><tr><td><code>flatMapMerge</code></td><td>Interleaved — emissions arrive as they occur</td><td>Concurrent, up to <code>concurrency</code> inner flows at once (default 16)</td><td>Independent parallel requests where order doesn't matter</td></tr><tr><td><code>flatMapLatest</code></td><td>Only the newest matters</td><td>Cancels the previous inner flow whenever a new value arrives from upstream</td><td>Search-as-you-type, always want the latest query's result only</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> <code>flatMapLatest</code> is the Flow equivalent of RxJava's <code>switchMap</code> — reach for it whenever a new upstream event should invalidate in-flight work from the previous one.</p>",
            referenceLinks: [{ title: "Kotlin Flow: Flattening flows", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/flat-map-latest.html" }],
            tags: ["flatmapconcat", "flatmapmerge", "flatmaplatest", "flow"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "flatMapLatest against flatMapConcat",
                code: "import kotlinx.coroutines.*\nimport kotlinx.coroutines.flow.*\n\nclass Repo {\n    fun search(query: String): Flow<String> = flow {\n        delay(30)                        // the request\n        emit(\"results for '$query'\")\n    }\n}\n\nval repo = Repo()\n\nfun main() = runBlocking {\n    val queries = flow {\n        emit(\"an\")\n        delay(10)\n        emit(\"and\")      // arrives before \"an\" finished — cancels it\n        delay(10)\n        emit(\"android\")  // cancels \"and\" too\n        delay(100)\n    }\n\n    println(\"flatMapLatest — only the newest search survives:\")\n    queries.flatMapLatest { repo.search(it) }.collect { println(\"  $it\") }\n\n    println(\"flatMapConcat — every search runs, in order, to completion:\")\n    queries.flatMapConcat { repo.search(it) }.collect { println(\"  $it\") }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "flatMapLatest — only the newest search survives:",
                        "  results for 'android'",
                        "flatMapConcat — every search runs, in order, to completion:",
                        "  results for 'an'",
                        "  results for 'and'",
                        "  results for 'android'"
                    ],
                    explain: "<p>Three queries typed in quick succession. <code>flatMapLatest</code> produced <strong>one result</strong>, for the newest query, because each new query cancelled the in-flight search before it could emit. <code>flatMapConcat</code> produced <strong>all three</strong>, in order, waiting for each to finish before starting the next.</p><p>For a search box the first is correct and the second is the classic bug: with <code>flatMapConcat</code>, results for \"an\" and \"and\" arrive after the user has finished typing \"android\", and the last one to land wins. Cancelling is what makes out-of-order results impossible rather than merely unlikely.</p><p><code>flatMapMerge</code> is the third option — everything concurrent, results in completion order — which suits independent parallel work and never suits search.</p>"
                }
            }],
            subsection: null
        },
        {
            id: "kotlin-collect-vs-collectlatest",
            importance: "should-know",
            question: "What is the difference between collect and collectLatest in Kotlin Flow?",
            answer: "<p><strong>⚖️ Process every value vs only the latest</strong></p><table><thead><tr><th>Aspect</th><th><code>collect</code></th><th><code>collectLatest</code></th></tr></thead><tbody><tr><td>Guarantee</td><td>Every emitted value is fully processed by the collector block, in order</td><td>Only the <strong>latest</strong> value is guaranteed to finish processing — an in-progress block is cancelled if a new value arrives</td></tr><tr><td>Behavior on rapid emission</td><td>Collector block runs to completion for each value, potentially queuing/backpressuring upstream</td><td>Collector block for a stale value is cancelled mid-execution when a newer value shows up</td></tr><tr><td>Use case</td><td>Every update must be acted on — e.g. appending to a list, writing to a database log</td><td>Only the most recent state matters — e.g. updating a loading UI where a stale in-flight render should be dropped</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> because the collector body in <code>collectLatest</code> can be cancelled mid-execution, any suspend calls inside it must be cancellation-safe (e.g. no partial side effects left dangling).</p>",
            referenceLinks: [{ title: "Kotlin Flow: collect", url: "https://kotlinlang.org/docs/coroutines-flow-operators.html#terminal-operators" }],
            tags: ["collect", "collectlatest", "flow", "coroutines"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "collect against collectLatest",
                code: "import kotlinx.coroutines.*\nimport kotlinx.coroutines.flow.*\n\nfun states(): Flow<String> = flow {\n    emit(\"state 1\")\n    delay(20)\n    emit(\"state 2\")\n    delay(20)\n    emit(\"state 3\")\n}\n\nfun main() = runBlocking {\n    println(\"collect — every value is processed to completion:\")\n    states().collect { state ->\n        delay(30)                       // slower than the producer\n        println(\"  finished $state\")\n    }\n\n    println(\"collectLatest — a new value cancels the previous block:\")\n    states().collectLatest { state ->\n        delay(30)\n        println(\"  finished $state\")    // only the last one survives\n    }\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "collect — every value is processed to completion:",
                        "  finished state 1",
                        "  finished state 2",
                        "  finished state 3",
                        "collectLatest — a new value cancels the previous block:",
                        "  finished state 3"
                    ],
                    explain: "<p>Three values in, and the difference is stark: <code>collect</code> finished all three, <code>collectLatest</code> finished <strong>only the last</strong>.</p><p>The collector here is slower than the producer, and that is the case that separates them. <code>collect</code> processes every value to completion, so it falls further behind and eventually does work nobody needs. <code>collectLatest</code> cancels the block the moment a newer value arrives, so only the most recent one is ever completed.</p><p>Which you want depends on whether the values are <em>state</em> or <em>events</em>. Rendering the newest UI state — throw away the stale one. Writing events to a log — you need every single one, and <code>collectLatest</code> would silently drop them.</p>"
                }
            }],
            subsection: null
        }
    ]
};
