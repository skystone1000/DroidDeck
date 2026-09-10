/* ==========================================================================
   M6 — What Kotlin sits on.

   Placed last in the language track deliberately. This is the material the
   question bank files under "java", and it arrives here at the point where
   the abstraction leaks and the reader has questions — not as six chapters
   of prerequisite before they have written any Kotlin.
   ========================================================================== */

const jvmFoundationsModule = {
    id: 'jvm-foundations',
    trackId: 'language',
    order: 6,
    title: 'What Kotlin Sits On',
    tagline: 'The JVM shows through in exactly the places interviewers ask about.',
    estimatedMinutes: 35,
    prerequisites: ['kotlin-classes', 'kotlin-collections'],
    docHub: {
        title: 'Kotlin for Java developers',
        path: '/kotlin/add-kotlin'
    },

    chapters: [
        {
            id: 'runtime-and-memory',
            title: 'The runtime and its memory',
            importance: 'must-know',
            summary: 'Heap, stack, garbage collection and the reachability rule that decides what survives.',
            interviewAngle: '"How does garbage collection work?" — reachability from GC roots is the answer, not reference counting.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Kotlin compiles to JVM bytecode, and on Android that bytecode is translated to DEX and executed by <strong>ART</strong>. Everything in this chapter is shared with Java, which is why it is asked in Android interviews regardless of the language on the job description.</p>'
                },
                {
                    type: 'types',
                    title: 'Where things live',
                    items: [
                        { name: 'Heap', html: '<p>All objects. Shared across threads, and the only region the garbage collector manages.</p>' },
                        { name: 'Stack', html: '<p>One per thread. Holds frames with local variables and references into the heap. Freed automatically when a frame returns — this is why a deep recursion gives <code>StackOverflowError</code> rather than an OOM.</p>' },
                        { name: 'Metaspace', html: '<p>Class metadata. Outside the heap.</p>' }
                    ]
                },
                {
                    type: 'definition',
                    term: 'Garbage collection',
                    important: true,
                    html: '<p>Reclaiming objects that are no longer <strong>reachable</strong> from a set of GC roots — active thread stacks, static fields, JNI references. Reachability, not reference counting: a cycle of two objects referring only to each other is unreachable and is collected.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Collectors are generational, on the observation that most objects die young. New objects are allocated in a young generation and collected cheaply and often; survivors are promoted to an older generation collected rarely and more expensively.</p><p>This is the mechanism behind the advice not to allocate in <code>onBindViewHolder</code> or a composable body. The allocation is cheap; the collection pause it eventually causes lands inside a frame, and M7’s 16ms budget has no room for it.</p>'
                },
                {
                    type: 'types',
                    title: 'Reference strengths',
                    items: [
                        { name: 'Strong', html: '<p>The ordinary kind. Prevents collection.</p>' },
                        { name: 'WeakReference', html: '<p>Does not prevent collection. The standard fix for a cache or listener that must not keep its target alive.</p>' },
                        { name: 'SoftReference', html: '<p>Cleared only under memory pressure. Intended for caches, though on Android an explicit LRU cache is usually better.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>A memory leak on the JVM is not a failure to free — it is an object staying <em>reachable</em> longer than it is useful. A static field holding an Activity, a non-static inner class capturing its outer instance, or a <code>Handler</code> with a queued message all keep a whole screen alive. Nothing is broken; the object is simply still reachable.</p>'
                }
            ],
            docs: [
                { title: 'Overview of memory management', path: '/topic/performance/memory-overview', kind: 'guide' },
                { title: 'Manage your app\'s memory', path: '/topic/performance/memory', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'garbage-collector' },
                { topicId: 'java', questionId: 'pass-by-reference-or-value' }
            ]
        },

        {
            id: 'equals-and-hashcode',
            title: 'The equals and hashCode contract',
            importance: 'must-know',
            summary: 'Break the contract and hash-based collections stop working, silently.',
            interviewAngle: 'Asked as a contract question and answered as a definition question. State the rules, then say what breaks.',
            buildsOn: ['runtime-and-memory'],
            blocks: [
                {
                    type: 'types',
                    title: 'The contract',
                    items: [
                        { name: 'Equal objects have equal hash codes', html: '<p>If <code>a == b</code> then <code>a.hashCode() == b.hashCode()</code>. This is the one that breaks collections when violated.</p>' },
                        { name: 'Unequal objects may share a hash code', html: '<p>A collision is legal and expected — hash codes are an <code>Int</code>.</p>' },
                        { name: 'equals is reflexive, symmetric, transitive and consistent', html: '<p>And <code>a.equals(null)</code> is always false.</p>' },
                        { name: 'hashCode is stable', html: '<p>It must not change while the object is a key in a hash-based collection.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The consequence is concrete. <code>HashMap</code> finds a bucket from the hash code and only then compares with <code>equals</code>. Override <code>equals</code> without <code>hashCode</code> and two equal objects land in different buckets — <code>map.get(key)</code> returns null for a key that is definitely present, and <code>Set</code> holds two elements it considers equal.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Why data class is the right default',
                    code: `// Broken: equals overridden, hashCode inherited from Any (identity).
class BadKey(val id: String) {
    override fun equals(other: Any?) = other is BadKey && other.id == id
}

val map = hashMapOf(BadKey("1") to "value")
map[BadKey("1")]        // null — different bucket

// Correct, and generated for you:
data class GoodKey(val id: String)

val ok = hashMapOf(GoodKey("1") to "value")
ok[GoodKey("1")]        // "value"`,
                    notes: 'This is a second reason the M3 rule matters — a data class property declared in the body is excluded from both generated methods, so it cannot participate in the key.'
                },
                {
                    type: 'prose',
                    html: '<p><code>HashMap</code> itself is worth being able to sketch: an array of buckets, an index derived from the hash, and a linked list per bucket for collisions. Since Java 8 a bucket that grows past <strong>eight</strong> entries converts to a balanced tree, turning worst-case lookup from O(n) into O(log n). It resizes at a load factor of 0.75, rehashing everything.</p>'
                }
            ],
            docs: [
                { title: 'Equality', url: 'https://kotlinlang.org/docs/equality.html', kind: 'guide' },
                { title: 'Object.hashCode()', url: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/Object.html', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'hashcode-and-equals' },
                { topicId: 'java', questionId: 'hashmap-vs-set' },
                { topicId: 'java', questionId: 'equals-vs-double-equals' }
            ]
        },

        {
            id: 'boxing-and-strings',
            title: 'Boxing, caching and strings',
            importance: 'should-know',
            summary: 'Where Kotlin\'s uniform type system meets the JVM\'s primitives, and where String immutability pays off.',
            interviewAngle: 'The Integer cache question — why == works for 127 and fails for 128 — is a classic, and it is really a boxing question.',
            buildsOn: ['equals-and-hashcode'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Kotlin has no primitives in the source language, but the JVM does. The compiler uses a primitive <code>int</code> where it can and boxes to <code>Integer</code> where it must — nullable types, generic arguments, and collections.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The Integer cache, in Kotlin',
                    code: `val a: Int = 127
val b: Int = 127
a === b            // true

val c: Int? = 127
val d: Int? = 127
c === d            // true  — cached box

val e: Int? = 128
val f: Int? = 128
e === f            // false — outside the cache, two distinct objects

e == f             // true  — structural equality is unaffected`,
                    notes: 'The JVM caches boxed <code>Integer</code> values from -128 to 127, so identity comparison accidentally works in that range and stops working outside it. This is why you compare numbers with <code>==</code>, never <code>===</code>.'
                },
                {
                    type: 'prose',
                    html: '<p>Strings are immutable, which buys three things: they can be shared safely across threads, their hash code can be cached, and identical literals can be interned into a shared <strong>string pool</strong>. It also means every concatenation allocates — building a string in a loop with <code>+</code> is O(n²) copying, which is what <code>StringBuilder</code> exists to avoid.</p>'
                },
                {
                    type: 'comparison',
                    title: 'StringBuilder versus StringBuffer',
                    left: 'StringBuilder',
                    right: 'StringBuffer',
                    rows: [
                        { aspect: 'Synchronised', left: 'No', right: 'Yes' },
                        { aspect: 'Speed', left: 'Faster', right: 'Slower' },
                        { aspect: 'Use', left: 'Essentially always', right: 'Legacy; a shared mutable string is a design problem anyway' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Kotlin’s <code>buildString { }</code> is a <code>StringBuilder</code> with a receiver lambda — idiomatic, and it makes the M2 receiver-lambda pattern concrete.</p>'
                }
            ],
            docs: [
                { title: 'Basic types', url: 'https://kotlinlang.org/docs/basic-types.html', kind: 'guide' },
                { title: 'Numbers and boxing', url: 'https://kotlinlang.org/docs/numbers.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'integer-caching-wrapper-classes' },
                { topicId: 'java', questionId: 'autoboxing-and-unboxing' },
                { topicId: 'java', questionId: 'integer-vs-int' },
                { topicId: 'java', questionId: 'eight-primitive-types' },
                { topicId: 'java', questionId: 'string-class-implementation-immutability' },
                { topicId: 'java', questionId: 'string-pool-in-java' },
                { topicId: 'java', questionId: 'string-immutability-meaning' },
                { topicId: 'kotlin', questionId: 'kotlin-string-vs-stringbuffer-vs-stringbuilder' }
            ]
        },

        {
            id: 'exceptions',
            title: 'Exceptions, and why Kotlin dropped checked ones',
            importance: 'should-know',
            summary: 'Every Kotlin exception is unchecked, which is a deliberate reversal of a Java decision.',
            interviewAngle: 'The checked-versus-unchecked distinction is standard; the interesting version is why Kotlin removed the category.',
            buildsOn: ['runtime-and-memory'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'Checked versus unchecked',
                    left: 'Checked',
                    right: 'Unchecked',
                    rows: [
                        { aspect: 'Extends', left: '<code>Exception</code>, not <code>RuntimeException</code>', right: '<code>RuntimeException</code> or <code>Error</code>' },
                        { aspect: 'Java requires', left: 'Catch or declare <code>throws</code>', right: 'Nothing' },
                        { aspect: 'Represents', left: 'Recoverable, expected failure', right: 'Programming errors and unrecoverable faults' },
                        { aspect: 'In Kotlin', left: 'Does not exist', right: 'All of them' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Kotlin treats every exception as unchecked. The reasoning is that checked exceptions did not deliver in practice — at scale they produced <code>catch (e: Exception) { }</code> blocks that swallowed failures, and <code>throws</code> declarations that propagated up signatures without anyone handling anything. Removing the requirement lets error handling be a design decision instead of a compiler obligation.</p><p>The cost is real: nothing reminds you that a call can fail. Which is why Kotlin code tends to model expected failure in the <em>return type</em> — a <code>Result</code>, or a sealed hierarchy of outcomes — and reserve exceptions for genuine faults.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'try/finally, and modelling failure in the type',
                    code: `// finally always runs — including when the try block returns.
fun read(path: String): String {
    val stream = open(path)
    try {
        return stream.readText()
    } finally {
        stream.close()          // runs before the return completes
    }
}

// use { } does the same thing for any Closeable, and is idiomatic.
fun readBetter(path: String) = open(path).use { it.readText() }

// Expected failure as a value rather than an exception.
sealed interface LoadResult {
    data class Success(val user: User) : LoadResult
    data class Failure(val cause: Throwable) : LoadResult
}`,
                    notes: 'A <code>return</code> inside <code>finally</code> discards any in-flight exception, silently swallowing it. It compiles, and it is almost always a bug.'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>runCatching</code> catches <code>Throwable</code>, which includes <code>CancellationException</code>. Inside a coroutine that un-cancels the coroutine, exactly as the M9 pitfall described — the same trap wearing a more idiomatic hat.</p>'
                }
            ],
            docs: [
                { title: 'Exceptions', url: 'https://kotlinlang.org/docs/exceptions.html', kind: 'guide' },
                { title: 'Kotlin for Java developers', path: '/kotlin/add-kotlin', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'java', questionId: 'checked-vs-unchecked-exceptions' },
                { topicId: 'java', questionId: 'try-catch-finally' },
                { topicId: 'java', questionId: 'final-finally-finalize' }
            ]
        },

        {
            id: 'interop',
            title: 'Kotlin and Java interop',
            importance: 'should-know',
            summary: 'The annotations that make Kotlin look like Java to a Java caller.',
            interviewAngle: 'Common on teams with mixed codebases. @JvmStatic, @JvmOverloads and @JvmField are the three to name.',
            buildsOn: ['boxing-and-strings'],
            blocks: [
                {
                    type: 'table',
                    title: 'The interop annotations',
                    headers: ['Annotation', 'Without it, Java sees', 'With it'],
                    rows: [
                        ['<code>@JvmStatic</code>', '<code>Foo.Companion.bar()</code>', '<code>Foo.bar()</code>'],
                        ['<code>@JvmField</code>', '<code>foo.getBar()</code>', '<code>foo.bar</code> — a real field'],
                        ['<code>@JvmOverloads</code>', 'One method with every parameter', 'The full overload ladder'],
                        ['<code>@JvmName</code>', 'The Kotlin name, or a mangled one', 'The name you choose'],
                        ['<code>@Throws</code>', 'No <code>throws</code> clause', 'A checked exception Java can catch']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Going the other way, the important concept is the <strong>platform type</strong> from M1. Kotlin cannot know whether an unannotated Java method returns null, so it suspends its checks and trusts you. Annotating the Java side with <code>@Nullable</code> and <code>@NonNull</code> restores the guarantee, which is why those annotations are worth adding to legacy code you are migrating.</p>'
                },
                {
                    type: 'types',
                    title: 'Other interop details worth knowing',
                    items: [
                        { name: 'SAM conversion', html: '<p>A Java interface with a single abstract method accepts a Kotlin lambda directly. Kotlin interfaces need <code>fun interface</code> to get the same treatment.</p>' },
                        { name: 'Top-level functions', html: '<p>Compile into a class named after the file — <code>Utils.kt</code> becomes <code>UtilsKt</code>. <code>@JvmName</code> renames it.</p>' },
                        { name: 'Property access', html: '<p>A Kotlin <code>val</code> is a getter to Java; a <code>var</code> is a getter and setter.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>If asked how you would migrate a Java codebase: file by file, starting with leaves that nothing depends on, converting data classes and utilities first. Android Studio’s converter gets the syntax right and the nullability wrong, so the review pass is where the actual work is.</p>'
                }
            ],
            docs: [
                { title: 'Calling Kotlin from Java', url: 'https://kotlinlang.org/docs/java-to-kotlin-interop.html', kind: 'guide' },
                { title: 'Calling Java from Kotlin', url: 'https://kotlinlang.org/docs/java-interop.html', kind: 'guide' },
                { title: 'Add Kotlin to an existing app', path: '/kotlin/add-kotlin', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-jvmstatic' },
                { topicId: 'kotlin', questionId: 'kotlin-jvmfield' },
                { topicId: 'kotlin', questionId: 'kotlin-jvmoverloads' },
                { topicId: 'java', questionId: 'static-keyword' },
                { topicId: 'java', questionId: 'access-modifiers-in-java' }
            ]
        }
    ]
};
