/* ==========================================================================
   M4 — Collections and sequences.

   The read-only/mutable split is the part that gets misremembered as
   immutability, and sequences are the part nobody reaches for until they
   understand what eager evaluation costs.
   ========================================================================== */

const kotlinCollectionsModule = {
    id: 'kotlin-collections',
    trackId: 'language',
    order: 4,
    title: 'Collections and Sequences',
    tagline: 'Read-only is not immutable, and eager is not always right.',
    estimatedMinutes: 30,
    prerequisites: ['kotlin-functions'],
    docHub: {
        title: 'Collections overview',
        url: 'https://kotlinlang.org/docs/collections-overview.html'
    },

    chapters: [
        {
            id: 'the-hierarchy',
            title: 'The hierarchy, and what read-only means',
            importance: 'must-know',
            summary: 'Kotlin splits each collection into a read-only interface and a mutable one — a view restriction, not a guarantee.',
            interviewAngle: '"Is List immutable in Kotlin?" No. Knowing why is the difference between a good and a wrong answer.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Kotlin has no separate immutable collection library. It has two <em>interfaces</em> onto the same underlying objects: <code>List</code> exposes no mutators, <code>MutableList</code> does. Both are usually backed by <code>java.util.ArrayList</code>.</p>'
                },
                {
                    type: 'definition',
                    term: 'Read-only collection',
                    important: true,
                    html: '<p>A <code>List</code>, <code>Set</code> or <code>Map</code> reference through which you cannot mutate. It does <strong>not</strong> promise the underlying collection is unchanging — another reference of the mutable type may still be writing to it.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Read-only is a view, not a guarantee',
                    code: `val mutable = mutableListOf(1, 2, 3)
val readOnly: List<Int> = mutable    // same object, narrower interface

mutable.add(4)
println(readOnly)      // [1, 2, 3, 4] — it changed underneath us

// A defensive copy is what actually detaches it
val snapshot = mutable.toList()
mutable.add(5)
println(snapshot)      // [1, 2, 3, 4]`,
                    notes: 'Exposing a <code>MutableList</code> as a <code>List</code> from a class is not enough on its own — return <code>toList()</code> if callers must not observe later mutation.'
                },
                {
                    type: 'table',
                    title: 'The three families',
                    headers: ['Read-only', 'Mutable', 'Ordering / duplicates', 'Backed by'],
                    rows: [
                        ['<code>List</code>', '<code>MutableList</code>', 'Ordered, duplicates allowed', '<code>ArrayList</code>'],
                        ['<code>Set</code>', '<code>MutableSet</code>', 'No duplicates', '<code>LinkedHashSet</code>'],
                        ['<code>Map</code>', '<code>MutableMap</code>', 'Unique keys', '<code>LinkedHashMap</code>']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The default factories preserve insertion order — <code>setOf</code> gives a <code>LinkedHashSet</code>, <code>mapOf</code> a <code>LinkedHashMap</code>. That is a deliberate departure from Java’s <code>HashSet</code>/<code>HashMap</code> defaults, and it means iteration order is stable unless you ask for <code>hashSetOf</code>.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Array versus List',
                    left: 'Array<T>',
                    right: 'List<T>',
                    rows: [
                        { aspect: 'Size', left: 'Fixed at creation', right: 'Fixed for <code>List</code>, growable for <code>MutableList</code>' },
                        { aspect: 'Contents', left: 'Always mutable — <code>arr[0] = x</code>', right: 'Depends on the interface' },
                        { aspect: 'Variance', left: 'Invariant', right: 'Covariant in <code>T</code>' },
                        { aspect: 'Primitives', left: '<code>IntArray</code> avoids boxing', right: '<code>List&lt;Int&gt;</code> boxes' },
                        { aspect: 'Use', left: 'Interop, primitives, performance', right: 'Everything else' }
                    ]
                }
            ],
            docs: [
                { title: 'Collections overview', url: 'https://kotlinlang.org/docs/collections-overview.html', kind: 'guide' },
                { title: 'Arrays', url: 'https://kotlinlang.org/docs/arrays.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-collections' },
                { topicId: 'kotlin', questionId: 'kotlin-list-vs-array' },
                { topicId: 'java', questionId: 'arrays-vs-arraylists' },
                { topicId: 'java', questionId: 'hashset-vs-treeset' }
            ]
        },

        {
            id: 'operators',
            title: 'The operator catalogue',
            importance: 'must-know',
            summary: 'Transform, filter, aggregate and group — enough of the standard library to stop writing loops.',
            interviewAngle: 'Usually a live exercise rather than a question: "given this list, produce that map." Knowing associateBy and groupBy is what makes it quick.',
            buildsOn: ['the-hierarchy'],
            blocks: [
                {
                    type: 'table',
                    title: 'The ones worth knowing cold',
                    headers: ['Operator', 'Produces'],
                    rows: [
                        ['<code>map</code> / <code>mapNotNull</code>', 'A new list, dropping nulls in the second case'],
                        ['<code>filter</code> / <code>filterNot</code> / <code>filterIsInstance</code>', 'A subset'],
                        ['<code>flatMap</code>', 'One flat list from a list of lists'],
                        ['<code>partition</code>', 'A <code>Pair</code> of matching and non-matching'],
                        ['<code>groupBy</code>', '<code>Map&lt;K, List&lt;V&gt;&gt;</code> — many values per key'],
                        ['<code>associateBy</code>', '<code>Map&lt;K, V&gt;</code> — one value per key, last wins'],
                        ['<code>fold</code> / <code>reduce</code>', 'A single accumulated value; <code>fold</code> takes an initial one'],
                        ['<code>sortedBy</code> / <code>sortedWith</code>', 'A sorted copy'],
                        ['<code>distinct</code> / <code>distinctBy</code>', 'Duplicates removed'],
                        ['<code>any</code> / <code>all</code> / <code>none</code> / <code>count</code>', 'A boolean or a count'],
                        ['<code>first</code> / <code>firstOrNull</code> / <code>find</code>', 'One element, or null'],
                        ['<code>zip</code> / <code>chunked</code> / <code>windowed</code>', 'Restructured groupings']
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'groupBy versus associateBy — the one that gets confused',
                    code: `data class User(val id: String, val city: String)

val users = listOf(
    User("1", "Pune"), User("2", "Delhi"), User("3", "Pune")
)

// One key -> many values
users.groupBy { it.city }
// {Pune=[User(1), User(3)], Delhi=[User(2)]}

// One key -> one value; later entries overwrite earlier ones
users.associateBy { it.city }
// {Pune=User(3), Delhi=User(2)}     <- User(1) is gone

// Keyed by something unique, which is what associateBy is really for
users.associateBy { it.id }

// Removing duplicates, three ways
users.map { it.city }.distinct()
users.distinctBy { it.city }
users.map { it.city }.toSet()`,
                    notes: 'Reaching for <code>associateBy</code> on a non-unique key silently loses data. If the key can repeat, you want <code>groupBy</code>.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Every one of these returns a <strong>new collection</strong>. A chain of five operators over a 10,000-element list allocates five intermediate lists — which is fine at small sizes and is exactly the problem sequences solve.</p>'
                }
            ],
            docs: [
                { title: 'Collection operations overview', url: 'https://kotlinlang.org/docs/collection-operations.html', kind: 'guide' },
                { title: 'Grouping', url: 'https://kotlinlang.org/docs/collection-grouping.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-associateby' },
                { topicId: 'kotlin', questionId: 'kotlin-partition' },
                { topicId: 'kotlin', questionId: 'kotlin-remove-duplicates' }
            ]
        },

        {
            id: 'sequences',
            title: 'Sequences',
            importance: 'must-know',
            summary: 'Lazy evaluation: one element travels the whole chain before the next starts, so no intermediate collections exist.',
            interviewAngle: '"When would you use a Sequence?" The answer is about intermediate allocations and short-circuiting, not raw speed.',
            buildsOn: ['operators'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'Collection versus Sequence',
                    left: 'Collection',
                    right: 'Sequence',
                    rows: [
                        { aspect: 'Evaluation', left: 'Eager — each operator runs fully', right: 'Lazy — nothing until a terminal operation' },
                        { aspect: 'Order of work', left: 'Operator by operator', right: 'Element by element, through the whole chain' },
                        { aspect: 'Intermediates', left: 'A new collection per step', right: 'None' },
                        { aspect: 'Short-circuits', left: 'No — the whole list is mapped first', right: 'Yes — stops at the first match' },
                        { aspect: 'Best for', left: 'Small collections, few steps', right: 'Large collections, long chains, or infinite' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The difference in evaluation order',
                    code: `val items = (1..5).toList()

// Eager: map runs on all five, THEN first() takes one.
items.map { println("map \$it"); it * 2 }.first { it > 4 }
// map 1, map 2, map 3, map 4, map 5  -> then picks 6

// Lazy: each element goes through the chain until one matches.
items.asSequence().map { println("map \$it"); it * 2 }.first { it > 4 }
// map 1, map 2, map 3  -> stops

// Infinite sequences are possible precisely because of laziness
generateSequence(1) { it * 2 }
    .takeWhile { it < 1000 }
    .toList()`,
                    notes: 'A sequence needs a terminal operation — <code>toList</code>, <code>first</code>, <code>sum</code>, <code>forEach</code> — or nothing runs at all. This is the same cold/hot distinction as <code>Flow</code> in M10, without the asynchrony.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Sequences are not automatically faster. For a short chain over a small list the lazy machinery costs more than the intermediate collections it avoids. The rule of thumb: large collection, several operators, or an early exit — otherwise stay eager.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>The connection worth drawing out loud: <code>Sequence</code> is to <code>List</code> what <code>Flow</code> is to a list of values you already have. Both are cold, both do nothing until collected, and both process one element through the entire chain at a time.</p>'
                }
            ],
            docs: [
                { title: 'Sequences', url: 'https://kotlinlang.org/docs/sequences.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-collections' }
            ]
        }
    ]
};
