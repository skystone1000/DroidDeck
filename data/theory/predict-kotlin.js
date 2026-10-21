/* ==========================================================================
   M54 — Predict the output: Kotlin language semantics.

   The research behind docs/plans/2026-08-19-output-prediction.md found the
   thinnest material here: sources name the scope functions universally but
   almost always as "what is the difference" rather than as a snippet. That is
   the argument for verifying this module hardest rather than for writing less
   of it, and two of the fifteen printed something other than what the author
   expected.
   ========================================================================== */

const predictKotlinModule = {
    id: 'predict-kotlin',
    trackId: 'output',
    order: 54,
    title: 'Kotlin Language Semantics',
    tagline: 'The language is not doing what the line looks like it says.',
    estimatedMinutes: 35,
    prerequisites: ['kotlin-essentials', 'kotlin-functions', 'kotlin-classes', 'kotlin-collections'],
    docHub: {
        title: 'Kotlin docs',
        url: 'https://kotlinlang.org/docs/home.html'
    },

    chapters: [
        {
            id: 'scope-functions',
            title: 'The five scope functions, by what they return',
            importance: 'must-know',
            summary: 'Two questions separate all five: is the receiver `this` or `it`, and does the call evaluate to the receiver or to the lambda?',
            interviewAngle: 'Every source names scope functions and almost none of them as a snippet. Being able to say what an expression evaluates to, rather than when you would use it, is the version that demonstrates you have written them rather than read about them.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The table everyone memorises has two columns — <code>this</code> against <code>it</code>, and receiver against lambda result. These puzzles ask you to use it rather than recite it.</p>'
                },
                {
                    type: 'predict',
                    id: 'let-returns-the-lambda-apply-returns-the-receiver',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Two almost identical calls. What is each variable holding?</p>',
                    code: `data class User(var name: String, var age: Int)

fun main() {
    val fromLet = User("Ana", 30).let { it.name = "Bea"; "just a string" }
    val fromApply = User("Ana", 30).apply { name = "Bea" }

    println("let gave:   \$fromLet")
    println("apply gave: \$fromApply")
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['let gave:   just a string', 'apply gave: User(name=Bea, age=30)'],
                        explain: '<p><code>let</code> evaluates to whatever its lambda evaluated to — here a <code>String</code>, and the <code>User</code> it modified is discarded entirely. <code>apply</code> evaluates to the receiver regardless of what the lambda returned, which is what makes it a configuration block.</p><p>That is the whole distinction, and it decides which one you can put on the right of an <code>=</code>.</p>'
                    },
                    distractor: '<p>Expecting <code>let</code> to give back the <code>User</code> because that is what the lambda operated on. It gives back the last expression, and the last expression is a string literal.</p>'
                },
                {
                    type: 'predict',
                    id: 'a-local-shadows-the-apply-receiver',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>There is a local <code>name</code> and the receiver has a <code>name</code>. Which one does the bare reference find?</p>',
                    code: `data class User(var name: String, var age: Int)

fun main() {
    val name = "outer"

    User("Ana", 30).apply {
        println("apply, bare name: \$name")
        println("apply, this.name: \${this.name}")
    }

    User("Ana", 30).also {
        println("also,  bare name: \$name")
        println("also,  it.name:   \${it.name}")
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'apply, bare name: outer',
                            'apply, this.name: Ana',
                            'also,  bare name: outer',
                            'also,  it.name:   Ana'
                        ],
                        explain: '<p>The <strong>local variable wins</strong>. An implicit receiver does not shadow a local in scope, so the bare <code>name</code> inside <code>apply</code> is <code>"outer"</code> and reaching the property requires writing <code>this.name</code>.</p><p>Which quietly removes most of <code>apply</code>’s advantage over <code>also</code> in any function that has a local of the same name — and it fails silently, because both are valid <code>String</code>s and nothing warns you.</p>'
                    },
                    distractor: '<p>Expecting <code>Ana</code> from the <code>apply</code> block, on the grounds that <code>this</code> is the receiver and its members are in scope. They are, but they lose to a local. This module’s author predicted <code>Ana</code> and was wrong.</p>'
                },
                {
                    type: 'predict',
                    id: 'run-against-with',
                    importance: 'good-to-know',
                    language: 'kotlin',
                    prompt: '<p><code>run</code> and <code>with</code> do the same thing here. What can only one of them do?</p>',
                    code: `data class User(var name: String, var age: Int)

fun main() {
    val user = User("Ana", 30)

    println("run:  " + user.run { "\$name is \$age" })
    println("with: " + with(user) { "\$name is \$age" })

    val nobody: User? = null
    println(nobody?.run { "never" } ?: "run was skipped entirely")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'run:  Ana is 30',
                            'with: Ana is 30',
                            'run was skipped entirely'
                        ],
                        explain: '<p>Identical results, one real difference: <code>run</code> is an extension function and <code>with</code> takes its subject as a parameter. So <code>run</code> can be safe-called — <code>nobody?.run { }</code> skips the whole block — and <code>with</code> cannot, because there is nothing to put the <code>?.</code> on.</p><p>That is the entire reason to prefer <code>run</code>, and the reason <code>with</code> survives mostly in code written before anyone thought about it.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'safe-call-let-skips-on-null',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Four <code>let</code> calls, one without a safe call. How many bodies run?</p>',
                    code: `fun main() {
    val present: String? = "hello"
    val absent: String? = null

    present?.let { println("let ran for: \$it") }
    absent?.let { println("this line never prints") }

    println("a = " + (present?.let { it.length } ?: -1))
    println("b = " + (absent?.let { it.length } ?: -1))

    absent.let { println("without the safe call, let still runs: it = \$it") }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'let ran for: hello',
                            'a = 5',
                            'b = -1',
                            'without the safe call, let still runs: it = null'
                        ],
                        explain: '<p>Three of four. The null-skipping is done by <code>?.</code>, not by <code>let</code> — the safe call short-circuits the entire chain, so the lambda is never entered and the expression evaluates to <code>null</code>.</p><p>The last line is the point. <code>let</code> on its own happily runs with a null <code>it</code>, because <code>let</code> is an ordinary extension function on any type including a nullable one. It has no opinion about null at all.</p>'
                    },
                    distractor: '<p>Believing <code>let</code> is the null check. Drop the <code>?</code> and every "null-safe" block you wrote runs against null.</p>'
                }
            ],
            docs: [
                { title: 'Scope functions', url: 'https://kotlinlang.org/docs/scope-functions.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-scope-functions' },
                { topicId: 'kotlin', questionId: 'kotlin-apply-scope-function' },
                { topicId: 'kotlin', questionId: 'kotlin-let-scope-function' }
            ]
        },

        {
            id: 'data-classes-and-initialisation',
            title: 'Data classes, copies, and the order things are built in',
            importance: 'must-know',
            summary: 'The generated members cover the primary constructor and nothing else, copy is shallow, and initialisers run interleaved with init blocks in declaration order.',
            interviewAngle: 'The data class question is usually answered by listing what is generated. The follow-up worth preparing for is what is *not* — and why that makes two unequal objects compare equal.',
            buildsOn: ['scope-functions'],
            blocks: [
                {
                    type: 'predict',
                    id: 'data-class-equals-ignores-the-body',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Two points with the same coordinates and different labels. Are they equal?</p>',
                    code: `data class Point(val x: Int, val y: Int) {
    var label: String = ""
}

fun main() {
    val a = Point(1, 2).apply { label = "first" }
    val b = Point(1, 2).apply { label = "second" }

    println("a = \$a")
    println("b = \$b")
    println("a == b:        \${a == b}")
    println("same hashCode: \${a.hashCode() == b.hashCode()}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'a = Point(x=1, y=2)',
                            'b = Point(x=1, y=2)',
                            'a == b:        true',
                            'same hashCode: true'
                        ],
                        explain: '<p>Equal, same hash, and <code>toString</code> does not even mention the label. Every generated member is built from the <strong>primary constructor parameters only</strong> — a property declared in the class body is invisible to all of them.</p><p>Two consequences worth carrying: a property that matters to identity belongs in the constructor, and a <code>StateFlow</code> holding a data class will drop an update where only a body property changed, because the new value compares equal to the old one.</p>'
                    },
                    distractor: '<p>Expecting <code>false</code> because the objects visibly differ. They do differ — <code>equals</code> simply was not told about the part that differs.</p>'
                },
                {
                    type: 'predict',
                    id: 'copy-is-shallow',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>The copy adds a member. What does the original contain afterwards?</p>',
                    code: `data class Team(val name: String, val members: MutableList<String>)

fun main() {
    val original = Team("A", mutableListOf("Ana"))
    val copy = original.copy(name = "B")

    copy.members.add("Bea")

    println("original: \$original")
    println("copy:     \$copy")
    println("same list object: \${original.members === copy.members}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'original: Team(name=A, members=[Ana, Bea])',
                            'copy:     Team(name=B, members=[Ana, Bea])',
                            'same list object: true'
                        ],
                        explain: '<p>Both. <code>copy</code> creates a new <code>Team</code> and carries every property across <strong>by reference</strong> — it does not clone anything. The two objects share one list, so mutating it through either is visible through both.</p><p>This is what makes a mutable collection inside a "immutable" state class dangerous: the state looks copied and is not.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'initialisers-run-in-declaration-order',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>Two property initialisers, two <code>init</code> blocks, one constructor body. In what order do the five lines print?</p>',
                    code: `fun log(what: String): String {
    println(what)
    return what
}

class Thing {
    val first = log("property first")
    init { log("init block 1") }
    val second = log("property second")
    init { log("init block 2") }

    constructor() { log("constructor body") }
}

fun main() {
    Thing()
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'property first',
                            'init block 1',
                            'property second',
                            'init block 2',
                            'constructor body'
                        ],
                        explain: '<p>Strictly top to bottom, with property initialisers and <code>init</code> blocks <strong>interleaved</strong> in the order they are written — they are not two phases. The secondary constructor body runs last, after all of it.</p><p>Which is why an <code>init</code> block that reads a property declared below it fails: at that moment the property genuinely has not been assigned yet.</p>'
                    },
                    distractor: '<p>Expecting all properties to be initialised first and then the <code>init</code> blocks. Moving an <code>init</code> block up or down the file changes what it can see.</p>'
                }
            ],
            docs: [
                { title: 'Data classes', url: 'https://kotlinlang.org/docs/data-classes.html', kind: 'guide' },
                { title: 'Classes', url: 'https://kotlinlang.org/docs/classes.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-data-classes' },
                { topicId: 'kotlin', questionId: 'kotlin-init-block' }
            ]
        },

        {
            id: 'collections-and-laziness',
            title: 'Read-only is not immutable, and lazy is not just faster',
            importance: 'must-know',
            summary: 'A List is a view that forbids you from writing, not a guarantee nobody else can. And a Sequence changes the order operations happen in, not only how many run.',
            interviewAngle: 'The sequence question is usually answered with "it is lazy, so it is faster on big collections". The answer that shows understanding describes the interleaving.',
            buildsOn: ['data-classes-and-initialisation'],
            blocks: [
                {
                    type: 'predict',
                    id: 'list-is-read-only-not-immutable',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>The <code>List</code> has no <code>add</code>. Can its contents still change?</p>',
                    code: `fun main() {
    val mutable = mutableListOf("a", "b")
    val readOnly: List<String> = mutable

    println("read-only sees: \$readOnly")
    mutable.add("c")
    println("and now:        \$readOnly")
    println("same object:    \${readOnly === mutable}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'read-only sees: [a, b]',
                            'and now:        [a, b, c]',
                            'same object:    true'
                        ],
                        explain: '<p>They are the same object. <code>List</code> is an interface that omits the mutating methods — it is a <strong>read-only view</strong>, not an immutable collection. Anyone still holding the <code>MutableList</code> can change what your <code>List</code> shows.</p><p>Exposing <code>List</code> from a class therefore protects you from callers, not from yourself. If it must not change, hand out <code>toList()</code>.</p>'
                    },
                    distractor: '<p>Reading <code>List</code> as immutable, which is what the name suggests and what most other languages mean by it. Kotlin makes no such promise.</p>'
                },
                {
                    type: 'predict',
                    id: 'sequence-interleaves-list-does-not',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>The same chain, once on a list and once on a sequence. Do the print statements arrive in the same order?</p>',
                    code: `fun main() {
    println("-- list --")
    listOf(1, 2, 3)
        .map { println("map \$it"); it * 2 }
        .filter { println("filter \$it"); it > 2 }
        .forEach { println("got \$it") }

    println("-- sequence --")
    listOf(1, 2, 3).asSequence()
        .map { println("map \$it"); it * 2 }
        .filter { println("filter \$it"); it > 2 }
        .forEach { println("got \$it") }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            '-- list --',
                            'map 1', 'map 2', 'map 3',
                            'filter 2', 'filter 4', 'filter 6',
                            'got 4', 'got 6',
                            '-- sequence --',
                            'map 1', 'filter 2',
                            'map 2', 'filter 4', 'got 4',
                            'map 3', 'filter 6', 'got 6'
                        ],
                        explain: '<p>Completely different. The list runs each operation over the <strong>whole collection</strong> before starting the next, allocating an intermediate list every time — three maps, then three filters, then the results.</p><p>The sequence carries <strong>one element</strong> all the way down the chain before touching the next, and allocates nothing in between. Same answers, different order of work.</p><p>Note the first sequence element: <code>map 1</code> then <code>filter 2</code>, and no <code>got</code> — it was filtered out, and the chain moved straight on. That is what makes <code>first()</code> on a sequence stop early and <code>first()</code> on a list not.</p>'
                    },
                    distractor: '<p>Expecting the same order with fewer allocations. The allocation saving is real, but the observable difference is the order — which matters the moment an operator has a side effect or the chain is infinite.</p>'
                }
            ],
            docs: [
                { title: 'Collections overview', url: 'https://kotlinlang.org/docs/collections-overview.html', kind: 'guide' },
                { title: 'Sequences', url: 'https://kotlinlang.org/docs/sequences.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-collections' }
            ]
        },

        {
            id: 'resolution-and-nullability',
            title: 'What the compiler decided before it ran',
            importance: 'must-know',
            summary: 'Extension functions bind to the declared type, default arguments are evaluated per call, and boxed equality has a cache underneath it.',
            interviewAngle: 'Static versus dynamic dispatch for extension functions is a favourite because the wrong answer is the intuitive one, and because it explains why you cannot override an extension.',
            buildsOn: ['collections-and-laziness'],
            blocks: [
                {
                    type: 'predict',
                    id: 'extension-functions-dispatch-statically',
                    importance: 'must-know',
                    language: 'kotlin',
                    prompt: '<p>A <code>Dog</code> held in an <code>Animal</code> variable. Which member runs, and which extension?</p>',
                    code: `open class Animal { open fun member() = "Animal member" }
class Dog : Animal() { override fun member() = "Dog member" }

fun Animal.extension() = "Animal extension"
fun Dog.extension() = "Dog extension"

fun main() {
    val asAnimal: Animal = Dog()

    println(asAnimal.member())
    println(asAnimal.extension())
}`,
                    output: {
                        kind: 'stdout',
                        lines: ['Dog member', 'Animal extension'],
                        explain: '<p>The member dispatches on the <strong>runtime</strong> type and the extension on the <strong>declared</strong> type. They disagree, in the same expression, on the same object.</p><p>An extension is not part of the class — it compiles to a static function taking the receiver as its first argument, and the compiler picks which one by the static type it can see. That is why an extension cannot be overridden, and why declaring one with the same signature as a member means the member always wins.</p>'
                    },
                    distractor: '<p>Answering <code>Dog extension</code>, because the object really is a <code>Dog</code>. Polymorphism applies to members; extensions were resolved at compile time.</p>'
                },
                {
                    type: 'predict',
                    id: 'lateinit-before-assignment',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>A <code>lateinit var</code> read before it is assigned. What comes back?</p>',
                    code: `class Screen {
    lateinit var title: String

    // isInitialized is only reachable from inside the declaring class.
    fun ready() = ::title.isInitialized
}

fun main() {
    val screen = Screen()
    println("initialised? \${screen.ready()}")

    try {
        println(screen.title)
    } catch (e: UninitializedPropertyAccessException) {
        println("threw: \${e.message}")
    }

    screen.title = "Home"
    println("initialised? \${screen.ready()}")
    println("now: \${screen.title}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'initialised? false',
                            'threw: lateinit property title has not been initialized',
                            'initialised? true',
                            'now: Home'
                        ],
                        explain: '<p>Not <code>null</code> — a dedicated <code>UninitializedPropertyAccessException</code>. The type is non-null <code>String</code> and <code>lateinit</code> is a promise to the compiler that you will assign it before reading; breaking that promise is an error rather than a null.</p><p><code>isInitialized</code> is how you check, and it is deliberately awkward: it is only reachable from inside the declaring class, so callers cannot build logic on whether your object is half-constructed.</p>'
                    },
                    distractor: '<p>Expecting <code>null</code>. That would require the property to be nullable, which is exactly what <code>lateinit</code> exists to avoid.</p>'
                },
                {
                    type: 'predict',
                    id: 'smart-cast-fails-on-a-mutable-property',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Why will the compiler not let you write <code>box.text.length</code> after a null check? This snippet shows the reason.</p>',
                    code: `class Box { var text: String? = "hello" }

fun main() {
    val box = Box()

    // box.text.length would not compile: the compiler cannot prove the
    // property is still non-null by the time it is read.
    val snapshot = box.text

    if (snapshot != null) {
        box.text = null
        println("the snapshot is still \\"\$snapshot\\", length \${snapshot.length}")
        println("but box.text is now \${box.text}")
    }
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'the snapshot is still "hello", length 5',
                            'but box.text is now null'
                        ],
                        explain: '<p>Because the property can change between the check and the read — as it visibly does here, on the line between them. A smart cast would have been a promise the compiler could not keep.</p><p>The fix is the first line of the <code>if</code>: copy into a local <code>val</code>. A local cannot be reassigned by anyone else, so the compiler can smart-cast it and the value you checked is the value you use.</p><p>The same reasoning covers a <code>var</code> from another module and any property with a custom getter, which could return something different each time it is read.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'default-arguments-evaluate-per-call',
                    importance: 'good-to-know',
                    language: 'kotlin',
                    prompt: '<p>The default argument is a function call. How many times does it run across four calls?</p>',
                    code: `var counter = 0

fun next(): Int {
    counter++
    return counter
}

fun show(value: Int = next()) = println("value = \$value, counter = \$counter")

fun main() {
    show()
    show()
    show(99)
    show()
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'value = 1, counter = 1',
                            'value = 2, counter = 2',
                            'value = 99, counter = 2',
                            'value = 3, counter = 3'
                        ],
                        explain: '<p>Three times — once per call that omitted the argument, and <strong>not</strong> for the call that supplied one. A default is an expression evaluated at the call site, not a value fixed when the function was declared.</p><p>Which makes <code>fun log(at: Long = System.currentTimeMillis())</code> do the right thing, and makes a default of <code>mutableListOf()</code> safe here in a way it notoriously is not in Python.</p>'
                    }
                },
                {
                    type: 'predict',
                    id: 'equals-against-referential-equality',
                    importance: 'should-know',
                    language: 'kotlin',
                    prompt: '<p>Two boxed 127s and two boxed 128s, compared both ways. Which of the four lines is the odd one out?</p>',
                    code: `fun main() {
    val smallA: Int? = 127
    val smallB: Int? = 127
    val bigA: Int? = 128
    val bigB: Int? = 128

    println("127 ==  127: \${smallA == smallB}")
    println("127 === 127: \${smallA === smallB}")
    println("128 ==  128: \${bigA == bigB}")
    println("128 === 128: \${bigA === bigB}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            '127 ==  127: true',
                            '127 === 127: true',
                            '128 ==  128: true',
                            '128 === 128: false'
                        ],
                        explain: '<p>The last one. Making the type <code>Int?</code> forces boxing, and the JVM caches boxed integers from −128 to 127 — so the two 127s are literally the same object and the two 128s are not.</p><p><code>==</code> compares values and is correct in all four cases. <code>===</code> compares identity, which for a boxed number is an implementation detail you should never depend on. The rule falls straight out: use <code>==</code> for values, and reserve <code>===</code> for asking whether two references are the same object on purpose.</p>'
                    },
                    distractor: '<p>Expecting <code>===</code> to be false for both pairs, since these are four separately declared values. The cache makes the small pair share one object.</p>'
                },
                {
                    type: 'predict',
                    id: 'elvis-evaluates-lazily',
                    importance: 'good-to-know',
                    language: 'kotlin',
                    prompt: '<p>The right-hand side of the elvis prints when it runs. How many times does it print?</p>',
                    code: `fun fallback(): String {
    println("fallback was evaluated")
    return "fallback"
}

fun main() {
    val present: String? = "value"
    val absent: String? = null

    println("result: \${present ?: fallback()}")
    println("--")
    println("result: \${absent ?: fallback()}")
}`,
                    output: {
                        kind: 'stdout',
                        lines: [
                            'result: value',
                            '--',
                            'fallback was evaluated',
                            'result: fallback'
                        ],
                        explain: '<p>Once. <code>?:</code> short-circuits: the right-hand side is only evaluated when the left is null, so the first call never happens at all.</p><p>That is what makes <code>value ?: expensiveDefault()</code> safe, and what makes <code>value ?: throw IllegalStateException()</code> work as a one-line assertion.</p><p>The ordering in the second half is worth noticing too — the fallback prints <em>before</em> the line containing it, because the string template has to be evaluated before <code>println</code> can be handed a string.</p>'
                    }
                }
            ],
            docs: [
                { title: 'Extensions', url: 'https://kotlinlang.org/docs/extensions.html', kind: 'guide' },
                { title: 'Null safety', url: 'https://kotlinlang.org/docs/null-safety.html', kind: 'guide' },
                { title: 'Equality', url: 'https://kotlinlang.org/docs/equality.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-extension-functions' },
                { topicId: 'kotlin', questionId: 'kotlin-lateinit' },
                { topicId: 'kotlin', questionId: 'kotlin-equality-operators' }
            ]
        }
    ]
};
