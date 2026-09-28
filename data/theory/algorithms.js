/* ==========================================================================
   M44 — Data structures and algorithms for Android.

   Opens the synthesis track. Not a substitute for algorithm practice — no
   module is — but a map of what an Android loop actually asks, with the
   Android-specific corners the generic guides leave out.

   Note: DSA is language-agnostic and has no developer.android.com hub, so the
   docHub points at Kotlin's collections documentation, which is first-party
   per §9 and is the page closest to the Android-relevant half.
   ========================================================================== */

const algorithmsModule = {
    id: 'algorithms',
    trackId: 'synthesis',
    order: 44,
    title: 'Data Structures and Algorithms',
    tagline: 'Complexity you can justify, and the collections Android added.',
    estimatedMinutes: 35,
    prerequisites: ['kotlin-collections'],
    docHub: {
        title: 'Kotlin collections overview',
        url: 'https://kotlinlang.org/docs/collections-overview.html'
    },

    chapters: [
        {
            id: 'complexity-and-collections',
            title: 'Complexity, and the collections Android added',
            importance: 'must-know',
            summary: 'Big-O for the structures you use daily, plus the three map types Android ships and why.',
            interviewAngle: 'SparseArray and ArrayMap are Android-specific and come up precisely because they are.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Big-O describes how cost grows with input size, ignoring constants — which is why an O(n) scan can beat an O(log n) search on a small array, and why "asymptotically better" and "faster here" are different claims. On a phone, with small n and a cache that punishes pointer-chasing, that gap matters more than it does on a server.</p>'
                },
                {
                    type: 'table',
                    title: 'The operations worth knowing cold',
                    headers: ['Structure', 'Access', 'Search', 'Insert', 'Delete', 'Notes'],
                    rows: [
                        ['Array / ArrayList', 'O(1)', 'O(n)', 'O(n)', 'O(n)', 'Amortised O(1) append'],
                        ['LinkedList', 'O(n)', 'O(n)', 'O(1)*', 'O(1)*', '*given the node; rarely worth it'],
                        ['HashMap / HashSet', '—', 'O(1) avg', 'O(1) avg', 'O(1) avg', 'O(n) worst, on collisions'],
                        ['TreeMap / TreeSet', '—', 'O(log n)', 'O(log n)', 'O(log n)', 'Sorted iteration'],
                        ['Heap (PriorityQueue)', 'O(1) peek', 'O(n)', 'O(log n)', 'O(log n)', 'Top-K in O(n log k)'],
                        ['Balanced BST', '—', 'O(log n)', 'O(log n)', 'O(log n)', 'Ordered, with ranges']
                    ]
                },
                {
                    type: 'definition',
                    term: 'Amortised complexity',
                    html: '<p>The average cost per operation across a long sequence, not the worst single one. An <code>ArrayList</code> append is amortised O(1): most appends are free, and the occasional doubling-and-copy is O(n) spread across the n appends that earned it.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>A <code>HashMap</code> is O(1) on average because a good hash spreads keys across buckets. Collisions chain, and in the pathological case everything lands in one bucket and lookup degrades to O(n) — which is why <code>hashCode</code> and <code>equals</code> must agree: two objects that are equal must hash the same, or the map loses entries it is holding.</p>'
                },
                {
                    type: 'table',
                    title: 'The three map types on Android',
                    headers: ['', 'HashMap', 'ArrayMap', 'SparseArray'],
                    rows: [
                        ['Structure', 'Bucket array of nodes', 'Two arrays, binary searched', 'Two arrays, int keys'],
                        ['Lookup', 'O(1) avg', 'O(log n)', 'O(log n)'],
                        ['Memory', 'Highest — a node per entry', 'Lower', 'Lowest — no boxing'],
                        ['Boxes int keys', 'Yes — <code>Integer</code> per key', 'Yes', 'No'],
                        ['Best at', 'Large maps, hot lookups', 'A few hundred entries', '<code>int</code> keys, small maps']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The trade is memory against lookup speed, and Android leans on memory because the heap is the scarce resource (M42). <code>HashMap</code> allocates an entry object per mapping and boxes primitive keys; <code>SparseArray</code> keeps two parallel arrays and does a binary search, which is asymptotically worse and empirically better for small maps. The honest answer is "for a few hundred entries with <code>int</code> keys, <code>SparseArray</code>; past that, measure".</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Reaching for <code>SparseArray</code> everywhere is the overcorrection. On a map of thousands, O(log n) with array shifting on insert loses to O(1) decisively. The gain is real and it is bounded, which is exactly what makes it a good interview answer and a bad blanket rule.</p>'
                }
            ],
            docs: [
                { title: 'Kotlin collections overview', url: 'https://kotlinlang.org/docs/collections-overview.html', kind: 'guide' },
                { title: 'Manage your app\'s memory', path: '/topic/performance/memory', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'data-structures-algorithms', questionId: 'dsa-big-o' },
                { topicId: 'data-structures-algorithms', questionId: 'dsa-array-vs-linkedlist' },
                { topicId: 'data-structures-algorithms', questionId: 'dsa-hashmap-hashing' },
                { topicId: 'android', questionId: 'android-hashmap-arraymap-sparsearray' },
                { topicId: 'android', questionId: 'android-sparsearray-advantages' },
                { topicId: 'java', questionId: 'hashcode-and-equals' },
                { topicId: 'java', questionId: 'arrays-vs-arraylists' },
                { topicId: 'java', questionId: 'hashset-vs-treeset' }
            ]
        },

        {
            id: 'core-techniques',
            title: 'The patterns most problems reduce to',
            importance: 'must-know',
            summary: 'Two pointers, sliding window, a hash map for lookups, a stack for structure, binary search on the answer.',
            interviewAngle: 'Recognising which pattern applies is the skill being tested — far more than recalling an algorithm.',
            buildsOn: ['complexity-and-collections'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Interview problems are drawn from a small set of shapes. The work in the room is recognising the shape quickly, because the implementation follows once you have. These five cover most of what an Android loop asks.</p>'
                },
                {
                    type: 'types',
                    title: 'The five, with their tell',
                    items: [
                        {
                            name: 'Two pointers',
                            html: '<p><em>Tell:</em> a sorted array, or a pair or triple summing to a target. Two indices moving inward or in step turn an O(n²) double loop into O(n).</p>'
                        },
                        {
                            name: 'Sliding window',
                            html: '<p><em>Tell:</em> "longest" or "shortest" contiguous subarray or substring satisfying a condition. Grow the right edge, shrink the left when the condition breaks; each element enters and leaves once, so O(n).</p>'
                        },
                        {
                            name: 'A hash map for what you have seen',
                            html: '<p><em>Tell:</em> "has this appeared before", "count the occurrences", "find the complement". Trades memory for a scan — the single most reusable move in the set.</p>'
                        },
                        {
                            name: 'A stack for nesting or order',
                            html: '<p><em>Tell:</em> brackets, expressions, undo, or "the next greater element", which is the monotonic stack — a stack kept sorted so each element is pushed and popped once.</p>'
                        },
                        {
                            name: 'Binary search, including on the answer',
                            html: '<p><em>Tell:</em> a sorted input, or a monotonic predicate — "is a capacity of X enough?" If the answer to that is monotone in X, you can binary search X even with no sorted array in sight.</p>'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Sliding window, and the binary search boundary everyone gets wrong',
                    code: `// Longest substring with no repeated character — O(n), one pass.
fun longestUnique(s: String): Int {
    val lastSeen = HashMap<Char, Int>()
    var start = 0
    var best = 0
    for (end in s.indices) {
        lastSeen[s[end]]?.let { if (it >= start) start = it + 1 }
        lastSeen[s[end]] = end
        best = maxOf(best, end - start + 1)
    }
    return best
}

// First index where predicate becomes true — the "lower bound" variant.
// Loop invariant: the answer is always in [lo, hi].
fun firstTrue(lo0: Int, hi0: Int, predicate: (Int) -> Boolean): Int {
    var lo = lo0
    var hi = hi0                       // hi is INCLUSIVE and is a candidate
    while (lo < hi) {                  // not <=, or this never terminates
        val mid = lo + (hi - lo) / 2   // not (lo + hi) / 2 — that overflows
        if (predicate(mid)) hi = mid   // mid might be the answer: keep it
        else lo = mid + 1              // mid is not: discard it
    }
    return lo
}`,
                    notes: 'Almost every binary search bug is one of three things: the wrong comparison in the loop condition, discarding <code>mid</code> when it could be the answer, or integer overflow in the midpoint. Writing the invariant down first prevents all three.'
                },
                {
                    type: 'tip',
                    html: '<p>Say the complexity before you write anything, and say it again at the end. "Brute force is O(n²); a hash map makes it O(n) time and O(n) space" tells the interviewer you are choosing rather than recalling, and it is the sentence that turns a working answer into a good one.</p>'
                }
            ],
            docs: [
                { title: 'Kotlin collections overview', url: 'https://kotlinlang.org/docs/collections-overview.html', kind: 'guide' },
                { title: 'Kotlin sequences', url: 'https://kotlinlang.org/docs/sequences.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'data-structures-algorithms', questionId: 'dsa-stack-queue' },
                { topicId: 'data-structures-algorithms', questionId: 'dsa-common-problems' }
            ]
        },

        {
            id: 'trees-graphs-dp',
            title: 'Trees, graphs, sorting and DP',
            importance: 'should-know',
            summary: 'The heavier half — traversals, BFS versus DFS, top-K with a heap, and what dynamic programming actually is.',
            interviewAngle: 'BFS-versus-DFS has a one-line answer: shortest path in an unweighted graph needs BFS.',
            buildsOn: ['core-techniques'],
            blocks: [
                {
                    type: 'types',
                    title: 'Trees',
                    items: [
                        { name: 'Traversals', html: '<p>In-order on a BST yields sorted output — that is the property most problems lean on. Pre-order copies a tree; post-order frees one; level-order is BFS with a queue.</p>' },
                        { name: 'BST operations', html: '<p>O(log n) when balanced, O(n) when the input arrived sorted and the tree degenerated into a list. Which is why real implementations self-balance.</p>' },
                        { name: 'Heaps and top-K', html: '<p>A min-heap of size k, pushing every element and popping when it exceeds k, gives the k largest in O(n log k) with O(k) memory — better than sorting the whole input when k is small.</p>' },
                        { name: 'Tries', html: '<p>Prefix trees, which is what autocomplete is. Worth naming when a problem is about string prefixes at scale.</p>' }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'BFS versus DFS',
                    left: 'BFS',
                    right: 'DFS',
                    rows: [
                        { aspect: 'Uses', left: 'A queue', right: 'A stack, or recursion' },
                        { aspect: 'Explores', left: 'Level by level', right: 'One branch to the end' },
                        { aspect: 'Shortest path (unweighted)', left: 'Yes — first arrival is shortest', right: 'No' },
                        { aspect: 'Memory', left: 'O(width) — bad on wide graphs', right: 'O(depth) — bad on deep ones' },
                        { aspect: 'Also does', left: 'Level-order traversal', right: 'Cycle detection, topological sort, backtracking' }
                    ]
                },
                {
                    type: 'types',
                    title: 'Graphs, sorting and DP',
                    items: [
                        { name: 'Topological sort', html: '<p>An ordering of a DAG where every edge points forward. This is dependency resolution — Gradle’s task graph (M43) and Dagger’s object graph (M36) are both doing it, and cycles are what make both fail.</p>' },
                        { name: 'Dijkstra', html: '<p>Shortest path with non-negative weights, using a priority queue. Name it when weights appear; note that negative weights need Bellman–Ford.</p>' },
                        { name: 'Why Collections.sort is TimSort', html: '<p>A merge sort exploiting runs already in order. Stable, O(n log n) worst case, and O(n) on nearly-sorted input — which real data usually is. Primitives use a dual-pivot quicksort instead, since stability is meaningless without object identity.</p>' },
                        { name: 'Dynamic programming', html: '<p>Recursion where subproblems repeat, made cheap by remembering answers. Memoise the recursion first — it is the same solution written in the order you thought of it — and convert to a table only if you need the space or the speed.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The reliable DP move is to define the state out loud before coding: "<code>dp[i]</code> is the best answer using the first <code>i</code> items". Most DP failures in interviews are a state definition that was never made explicit, not a coding error.</p>'
                }
            ],
            docs: [
                { title: 'Kotlin collections overview', url: 'https://kotlinlang.org/docs/collections-overview.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'data-structures-algorithms', questionId: 'dsa-binary-tree-bst' },
                { topicId: 'data-structures-algorithms', questionId: 'dsa-bfs-dfs' },
                { topicId: 'data-structures-algorithms', questionId: 'dsa-graph-representations' },
                { topicId: 'data-structures-algorithms', questionId: 'dsa-sorting-algorithms' },
                { topicId: 'data-structures-algorithms', questionId: 'dsa-dynamic-programming' },
                { topicId: 'java', questionId: 'comparable-vs-comparator' }
            ]
        },

        {
            id: 'android-flavoured',
            title: 'The Android-flavoured questions',
            importance: 'should-know',
            summary: 'LRU cache, and the recycling problem — algorithm questions dressed as Android ones.',
            interviewAngle: 'These reward candidates who can connect the two halves, which is the point of this track.',
            buildsOn: ['trees-graphs-dp'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>"Design an LRU cache" is the most-asked algorithm question in Android interviews, because it is a real thing the platform ships: <code>LruCache</code> backs every image library’s memory cache (M28). The requirement is O(1) get and O(1) put with eviction of the least recently used entry.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The structure, and why it is two structures',
                    code: `// A hash map alone gives O(1) lookup but no order.
// A linked list alone gives O(1) reorder but O(n) lookup.
// Together: O(1) both — the map stores NODES in the list.

class LruCache<K, V>(private val capacity: Int) {
    private class Node<K, V>(val key: K, var value: V) {
        var prev: Node<K, V>? = null
        var next: Node<K, V>? = null
    }

    private val index = HashMap<K, Node<K, V>>()
    private var head: Node<K, V>? = null     // most recently used
    private var tail: Node<K, V>? = null     // evict from here

    fun get(key: K): V? = index[key]?.also { moveToFront(it) }?.value

    fun put(key: K, value: V) {
        index[key]?.let { it.value = value; moveToFront(it); return }
        if (index.size == capacity) tail?.let { index.remove(it.key); unlink(it) }
        val node = Node(key, value)
        index[key] = node
        addToFront(node)
    }
}

// In Kotlin, LinkedHashMap(capacity, 0.75f, true) does this already —
// accessOrder = true is the whole trick, and naming it is a good move.`,
                    notes: 'The insight worth stating explicitly is that neither structure can meet both requirements alone, and combining them costs only memory. That reasoning is what is being assessed.'
                },
                {
                    type: 'prose',
                    html: '<p>The other one is quieter: <strong>what problem does <code>RecyclerView</code> recycling actually solve?</strong> The answer is that inflating a view is expensive and allocating in a scroll costs frame time (M42), so a fixed pool of views is reused as the data window moves. It is object pooling — bounded memory, no allocation in the hot path — and the same reasoning explains bitmap pools and why <code>LazyColumn</code> reuses slot-table structure rather than views (M22).</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Where an algorithm question has an Android answer, give both. <em>"A min-heap for top-K in O(n log k) — which is what a bounded cache eviction policy does, and why LruCache pairs a map with a list."</em> Connecting the two is exactly what an Android loop is trying to find out, and it is what the earlier seven tracks were for.</p>'
                }
            ],
            docs: [
                { title: 'Manage your app\'s memory', path: '/topic/performance/memory', kind: 'guide' },
                { title: 'Lists and grids', path: '/develop/ui/compose/lists', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-system-design', questionId: 'design-lru-cache' },
                { topicId: 'android-system-design', questionId: 'design-caching-library' },
                { topicId: 'android', questionId: 'android-recyclerview-how-it-works' },
                { topicId: 'android', questionId: 'android-bitmap-pool' }
            ]
        }
    ]
};
