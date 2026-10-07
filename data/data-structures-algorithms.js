const dataStructuresAlgorithmsData = {
    "id": "data-structures-algorithms",
    "title": "Data Structures and Algorithms",
    "subsections": null,
    "keyTopics": [
        "Big O Notation",
        "Arrays vs Linked Lists",
        "Stack and Queue",
        "Binary Trees and BST",
        "HashMap and Hashing",
        "Sorting Algorithms",
        "Dynamic Programming",
        "BFS and DFS",
        "Graph Representations",
        "Common Interview Problems"
    ],
    "questions": [
        {
            "referenceLinks": [
                {
                    "title": "Big O Cheat Sheet",
                    "url": "https://www.bigocheatsheet.com/"
                }
            ],
            "tags": [
                "big-o",
                "complexity",
                "algorithms",
                "fundamentals"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "dsa-big-o",
            "importance": "must-know",
            "question": "What is Big O Notation?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><strong>Big O notation</strong> describes how an algorithm's running time or memory use <strong>grows</strong> relative to input size <code>n</code>, in the <strong>worst case</strong> — it's about scalability, not exact runtime.</li><li>Constants and lower-order terms are dropped: <code>O(2n + 100)</code> is written <code>O(n)</code> because that's what dominates as <code>n</code> gets large.</li></ul><p><strong>⚙️ Common complexities, best to worst</strong></p><ul><li><code>O(1)</code> constant — array index access, HashMap get/put (average case).</li><li><code>O(log n)</code> logarithmic — binary search, balanced BST operations.</li><li><code>O(n)</code> linear — single pass through a list.</li><li><code>O(n log n)</code> linearithmic — efficient comparison sorts (merge sort, quicksort average case).</li><li><code>O(n²)</code> quadratic — nested loops, bubble/insertion sort.</li><li><code>O(2ⁿ)</code>/<code>O(n!)</code> exponential/factorial — brute-force subsets/permutations.</li></ul><p><strong>🎯 Interview tip:</strong> Always state both <strong>time</strong> and <strong>space</strong> complexity when answering a DSA question — interviewers explicitly listen for space complexity even when not asked.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Kotlin Collections overview",
                    "url": "https://kotlinlang.org/docs/collections-overview.html"
                }
            ],
            "tags": [
                "array",
                "linkedlist",
                "data-structures",
                "comparison",
                "complexity"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Simple singly linked list node",
                    "code": "class Node<T>(val value: T, var next: Node<T>? = null)\n\nclass LinkedList<T> {\n    private var head: Node<T>? = null\n\n    fun addFirst(value: T) {           // O(1)\n        head = Node(value, head)\n    }\n\n    fun get(index: Int): T? {          // O(n)\n        var current = head\n        repeat(index) { current = current?.next }\n        return current?.value\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "dsa-array-vs-linkedlist",
            "importance": "must-know",
            "question": "Explain Array vs LinkedList.",
            "answer": "<p><strong>🔑 Contiguous vs linked memory</strong></p><ul><li>An <strong>Array</strong> stores elements in <strong>contiguous</strong> memory with fixed size (in Kotlin/JVM, resizable variants like <code>ArrayList</code> reallocate under the hood).</li><li>A <strong>LinkedList</strong> stores elements as nodes, each holding a value and a pointer to the next (and previous, if doubly linked) node — memory is scattered, connected by references.</li></ul><table><thead><tr><th>Operation</th><th>Array / ArrayList</th><th>LinkedList</th></tr></thead><tbody><tr><td>Random access by index</td><td>O(1)</td><td>O(n)</td></tr><tr><td>Insert/delete at start</td><td>O(n) (shift elements)</td><td>O(1)</td></tr><tr><td>Insert/delete at end</td><td>O(1) amortized</td><td>O(1) with tail pointer</td></tr><tr><td>Insert/delete in middle</td><td>O(n)</td><td>O(1) once you have the node, O(n) to find it</td></tr><tr><td>Memory overhead</td><td>Low (just elements)</td><td>Higher (pointers per node)</td></tr><tr><td>Cache locality</td><td>Good (contiguous)</td><td>Poor (scattered)</td></tr></tbody></table><p><strong>✅ When to use</strong></p><ul><li>Array/ArrayList for frequent random access; LinkedList when you need frequent insert/delete at known positions (e.g. implementing a queue/deque) and don't need random access.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Kotlin ArrayDeque",
                    "url": "https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.collections/-array-deque/"
                }
            ],
            "tags": [
                "stack",
                "queue",
                "data-structures",
                "lifo",
                "fifo"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Stack and Queue via ArrayDeque",
                    "code": "val stack = ArrayDeque<Int>()\nstack.addLast(1); stack.addLast(2)\nval top = stack.removeLast()      // 2 -- LIFO, O(1)\n\nval queue = ArrayDeque<Int>()\nqueue.addLast(1); queue.addLast(2)\nval front = queue.removeFirst()   // 1 -- FIFO, O(1)"
                }
            ],
            "subsection": null,
            "id": "dsa-stack-queue",
            "importance": "must-know",
            "question": "What is a Stack and Queue?",
            "answer": "<p><strong>🔑 Two fundamental linear structures</strong></p><ul><li>A <strong>Stack</strong> is <strong>LIFO</strong> (Last In, First Out) — <code>push</code>/<code>pop</code>/<code>peek</code> all operate on the top; used for undo history, expression evaluation, DFS, call stacks.</li><li>A <strong>Queue</strong> is <strong>FIFO</strong> (First In, First Out) — <code>enqueue</code> at the back, <code>dequeue</code> from the front; used for task scheduling, BFS, producer-consumer buffering.</li></ul><p><strong>⚙️ Complexity</strong></p><ul><li>Both support <code>push/pop</code> or <code>enqueue/dequeue</code> in <strong>O(1)</strong> time when backed by a linked list or a circular buffer/deque; O(1) amortized when backed by a dynamic array (<code>ArrayDeque</code>).</li><li>Space complexity is <strong>O(n)</strong> for <code>n</code> stored elements.</li></ul><p><strong>✅ Kotlin/Java equivalents</strong></p><ul><li>Kotlin's <code>ArrayDeque</code> implements both efficiently — <code>addLast</code>/<code>removeLast</code> for a stack, <code>addLast</code>/<code>removeFirst</code> for a queue; avoid <code>java.util.Stack</code> (legacy, synchronized, slower).</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Binary Search Tree — GeeksforGeeks",
                    "url": "https://www.geeksforgeeks.org/dsa/binary-search-tree-data-structure/"
                }
            ],
            "tags": [
                "binary-tree",
                "bst",
                "data-structures",
                "recursion",
                "complexity"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "BST insert and in-order traversal",
                    "code": "class TreeNode(val value: Int) {\n    var left: TreeNode? = null\n    var right: TreeNode? = null\n}\n\nfun insert(root: TreeNode?, value: Int): TreeNode {   // O(log n) avg, O(n) worst\n    if (root == null) return TreeNode(value)\n    if (value < root.value) root.left = insert(root.left, value)\n    else root.right = insert(root.right, value)\n    return root\n}\n\nfun inOrder(node: TreeNode?, result: MutableList<Int>) { // O(n)\n    node ?: return\n    inOrder(node.left, result)\n    result.add(node.value)\n    inOrder(node.right, result)\n}"
                }
            ],
            "subsection": null,
            "id": "dsa-binary-tree-bst",
            "importance": "should-know",
            "question": "What is a Binary Tree and Binary Search Tree?",
            "answer": "<p><strong>🔑 Definitions</strong></p><ul><li>A <strong>Binary Tree</strong> is a hierarchical structure where each node has at most <strong>two children</strong> (left, right) — no ordering constraint.</li><li>A <strong>Binary Search Tree (BST)</strong> is a binary tree with an <strong>ordering invariant</strong>: for every node, all values in its left subtree are smaller and all values in its right subtree are larger.</li></ul><p><strong>⚙️ Complexity</strong></p><ul><li>BST search/insert/delete: <strong>O(log n)</strong> average (balanced tree), but degrades to <strong>O(n)</strong> worst case if the tree becomes skewed (e.g. inserting sorted data into a plain BST).</li><li>Self-balancing variants (<strong>AVL</strong>, <strong>Red-Black</strong> trees) guarantee <strong>O(log n)</strong> worst case by rebalancing on insert/delete.</li><li>Space complexity: <strong>O(n)</strong> for <code>n</code> nodes; O(h) extra space for recursive traversal, where h is tree height.</li></ul><p><strong>✅ Traversals</strong></p><ul><li><strong>In-order</strong> (left, node, right) visits a BST's values in sorted order; <strong>pre-order</strong> and <strong>post-order</strong> are used for copying/serializing and deleting a tree respectively.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "HashMap — Java Platform SE docs",
                    "url": "https://docs.oracle.com/javase/8/docs/api/java/util/HashMap.html"
                }
            ],
            "tags": [
                "hashmap",
                "hashing",
                "data-structures",
                "collisions",
                "complexity"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "HashMap usage and a manual hash bucket sketch",
                    "code": "val ages = HashMap<String, Int>()\nages[\"Aditya\"] = 29        // O(1) average\nval age = ages[\"Aditya\"]  // O(1) average\n\n// Conceptually: bucketIndex = key.hashCode() and (capacity - 1)\ndata class Employee(val id: Int, val name: String) // auto hashCode/equals"
                }
            ],
            "subsection": null,
            "id": "dsa-hashmap-hashing",
            "importance": "must-know",
            "question": "What is a HashMap and how does hashing work?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li>A <strong>HashMap</strong> stores key–value pairs and uses a <strong>hash function</strong> to convert each key into an array index (bucket), giving average <strong>O(1)</strong> get/put/remove regardless of map size.</li></ul><p><strong>⚙️ How hashing works</strong></p><ul><li>The key's <code>hashCode()</code> is computed, then reduced modulo the internal array's capacity (via bit-masking, since capacity is a power of two in Java/Kotlin's <code>HashMap</code>) to pick a bucket.</li><li><strong>Collisions</strong> (two keys hashing to the same bucket) are handled by chaining — each bucket holds a linked list of entries (Java 8+ converts a bucket to a red-black tree if it grows past a threshold, capping worst case at O(log n) instead of O(n)).</li><li>When the load factor (default <strong>0.75</strong>) is exceeded, the table <strong>resizes</strong> (typically doubles) and all entries are rehashed — an O(n) operation, but amortized O(1) per insert.</li></ul><p><strong>⚠️ Requirements</strong></p><ul><li>Keys must implement <code>hashCode()</code>/<code>equals()</code> consistently (equal objects <strong>must</strong> produce equal hash codes) — Kotlin <code>data class</code> generates both automatically, which is why they're safe HashMap keys.</li></ul><p><strong>🎯 Interview tip:</strong> State clearly: average-case <strong>O(1)</strong>, worst-case <strong>O(n)</strong> (all keys colliding into one bucket) — interviewers specifically probe whether you know the worst case exists.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Sorting algorithms — GeeksforGeeks",
                    "url": "https://www.geeksforgeeks.org/dsa/sorting-algorithms/"
                }
            ],
            "tags": [
                "sorting",
                "algorithms",
                "quicksort",
                "merge-sort",
                "complexity"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Merge sort — O(n log n) time, O(n) space",
                    "code": "fun mergeSort(arr: IntArray): IntArray {\n    if (arr.size <= 1) return arr\n    val mid = arr.size / 2\n    val left = mergeSort(arr.copyOfRange(0, mid))\n    val right = mergeSort(arr.copyOfRange(mid, arr.size))\n    return merge(left, right)\n}\n\nfun merge(left: IntArray, right: IntArray): IntArray {\n    val result = IntArray(left.size + right.size)\n    var i = 0; var j = 0; var k = 0\n    while (i < left.size && j < right.size) {\n        result[k++] = if (left[i] <= right[j]) left[i++] else right[j++]\n    }\n    while (i < left.size) result[k++] = left[i++]\n    while (j < right.size) result[k++] = right[j++]\n    return result\n}"
                }
            ],
            "subsection": null,
            "id": "dsa-sorting-algorithms",
            "importance": "should-know",
            "question": "What are common sorting algorithms?",
            "answer": "<p><strong>🔑 Comparison-based sorts</strong></p><ul><li><strong>Bubble/Insertion/Selection sort</strong> — <code>O(n²)</code> time, <code>O(1)</code> space; simple but only practical for tiny or nearly-sorted inputs (insertion sort is actually fast, O(n), on nearly-sorted data).</li><li><strong>Merge sort</strong> — <code>O(n log n)</code> time (always, including worst case), <code>O(n)</code> extra space; <strong>stable</strong>, divide-and-conquer.</li><li><strong>Quicksort</strong> — <code>O(n log n)</code> average, <code>O(n²)</code> worst case (bad pivot choices, e.g. already-sorted input with a naive pivot); <code>O(log n)</code> space for the recursion stack; not stable but usually fastest in practice due to cache locality.</li><li><strong>Heap sort</strong> — <code>O(n log n)</code> time always, <code>O(1)</code> extra space; not stable.</li></ul><p><strong>⚙️ Non-comparison sorts</strong></p><ul><li><strong>Counting sort</strong> / <strong>Radix sort</strong> — <code>O(n + k)</code> time (k = value range), beats the <code>O(n log n)</code> comparison lower bound but only works for bounded/integer-like keys.</li></ul><p><strong>✅ In practice</strong></p><ul><li>Kotlin/Java's <code>Collections.sort()</code>/<code>sorted()</code> use <strong>TimSort</strong> for objects (a hybrid, stable, adaptive merge/insertion sort, O(n log n) worst case) and a dual-pivot quicksort for primitive arrays.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Dynamic Programming — GeeksforGeeks",
                    "url": "https://www.geeksforgeeks.org/dsa/dynamic-programming/"
                }
            ],
            "tags": [
                "dynamic-programming",
                "memoization",
                "algorithms",
                "complexity"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Fibonacci: naive vs memoized vs tabulated",
                    "code": "// Naive: O(2^n) time, O(n) stack space\nfun fibNaive(n: Int): Long = if (n < 2) n.toLong() else fibNaive(n - 1) + fibNaive(n - 2)\n\n// Memoized (top-down): O(n) time, O(n) space\nfun fibMemo(n: Int, cache: MutableMap<Int, Long> = mutableMapOf()): Long {\n    if (n < 2) return n.toLong()\n    return cache.getOrPut(n) { fibMemo(n - 1, cache) + fibMemo(n - 2, cache) }\n}\n\n// Tabulated (bottom-up): O(n) time, O(1) space\nfun fibTab(n: Int): Long {\n    if (n < 2) return n.toLong()\n    var a = 0L; var b = 1L\n    repeat(n - 1) { val next = a + b; a = b; b = next }\n    return b\n}"
                }
            ],
            "subsection": null,
            "id": "dsa-dynamic-programming",
            "importance": "should-know",
            "question": "What is Dynamic Programming?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><strong>Dynamic Programming (DP)</strong> solves problems by breaking them into <strong>overlapping subproblems</strong>, solving each once, and <strong>caching</strong> the result — avoiding the exponential blow-up of recomputing the same subproblem repeatedly.</li><li>Requires two properties: <strong>optimal substructure</strong> (the optimal solution is built from optimal solutions to subproblems) and <strong>overlapping subproblems</strong> (the same subproblem recurs).</li></ul><p><strong>⚙️ Two approaches</strong></p><ul><li><strong>Top-down (memoization)</strong> — recursive solution + a cache (map/array) keyed by subproblem parameters.</li><li><strong>Bottom-up (tabulation)</strong> — build a table iteratively from the smallest subproblems up, usually O(1) extra call-stack space vs recursion's O(n).</li></ul><p><strong>📊 Classic example — Fibonacci</strong></p><ul><li>Naive recursion: <code>O(2ⁿ)</code> time. With memoization/tabulation: <code>O(n)</code> time, <code>O(n)</code> (or <code>O(1)</code> with two rolling variables) space.</li></ul><p><strong>🎯 Interview tip:</strong> Always name the recurrence relation and state complexity before/after adding memoization — that transition is exactly what interviewers want to see reasoned through.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "BFS vs DFS — GeeksforGeeks",
                    "url": "https://www.geeksforgeeks.org/dsa/breadth-first-search-or-bfs-for-a-graph/"
                }
            ],
            "tags": [
                "bfs",
                "dfs",
                "graph",
                "algorithms",
                "traversal",
                "complexity"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "BFS and DFS on an adjacency list, O(V + E)",
                    "code": "fun bfs(start: Int, graph: Map<Int, List<Int>>): List<Int> {\n    val visited = mutableSetOf(start)\n    val order = mutableListOf<Int>()\n    val queue = ArrayDeque<Int>().apply { addLast(start) }\n    while (queue.isNotEmpty()) {\n        val node = queue.removeFirst()\n        order.add(node)\n        for (neighbor in graph[node].orEmpty()) {\n            if (visited.add(neighbor)) queue.addLast(neighbor)\n        }\n    }\n    return order\n}\n\nfun dfs(node: Int, graph: Map<Int, List<Int>>, visited: MutableSet<Int> = mutableSetOf(), order: MutableList<Int> = mutableListOf()): List<Int> {\n    if (!visited.add(node)) return order\n    order.add(node)\n    for (neighbor in graph[node].orEmpty()) dfs(neighbor, graph, visited, order)\n    return order\n}"
                }
            ],
            "subsection": null,
            "id": "dsa-bfs-dfs",
            "importance": "should-know",
            "question": "What is BFS and DFS?",
            "answer": "<p><strong>🔑 Two fundamental graph/tree traversal strategies</strong></p><ul><li><strong>BFS (Breadth-First Search)</strong> explores level by level, visiting all neighbors of a node before moving deeper — implemented with a <strong>Queue</strong>. Finds the <strong>shortest path</strong> in an unweighted graph.</li><li><strong>DFS (Depth-First Search)</strong> explores as far as possible down one branch before backtracking — implemented with a <strong>Stack</strong> (explicit or via recursion). Good for detecting cycles, topological sort, connectivity.</li></ul><p><strong>⚙️ Complexity</strong></p><ul><li>Both run in <strong>O(V + E)</strong> time (V = vertices, E = edges) for an adjacency-list representation.</li><li>Space: BFS is <strong>O(V)</strong> for the queue (can hold an entire level, up to V nodes); DFS is <strong>O(h)</strong> for the recursion/explicit stack, where h is the max depth — better for wide, shallow graphs.</li></ul><p><strong>✅ When to use which</strong></p><ul><li>BFS for shortest path / \"closest\" search; DFS for exhaustive exploration, cycle detection, and when memory for a wide frontier is a concern.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Graph representations — GeeksforGeeks",
                    "url": "https://www.geeksforgeeks.org/dsa/graph-and-its-representations/"
                }
            ],
            "tags": [
                "graph",
                "adjacency-list",
                "adjacency-matrix",
                "data-structures",
                "complexity"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Adjacency list representation",
                    "code": "val graph: MutableMap<Int, MutableList<Int>> = mutableMapOf()\n\nfun addEdge(u: Int, v: Int) {          // O(1)\n    graph.getOrPut(u) { mutableListOf() }.add(v)\n    graph.getOrPut(v) { mutableListOf() }.add(u) // omit for a directed graph\n}"
                }
            ],
            "subsection": null,
            "id": "dsa-graph-representations",
            "importance": "should-know",
            "question": "What is a Graph and its representations?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li>A <strong>Graph</strong> is a set of <strong>vertices (nodes)</strong> connected by <strong>edges</strong> — can be directed/undirected, weighted/unweighted, cyclic/acyclic.</li></ul><p><strong>⚙️ Two main representations</strong></p><ul><li><strong>Adjacency List</strong> — a map/array of lists, each holding a node's neighbors. Space: <strong>O(V + E)</strong>. Efficient for sparse graphs and iterating neighbors; checking if a specific edge exists is O(degree).</li><li><strong>Adjacency Matrix</strong> — a V×V boolean/weight grid. Space: <strong>O(V²)</strong>. Edge-existence check is <strong>O(1)</strong>, but wasteful for sparse graphs and iterating a node's neighbors costs O(V).</li></ul><p><strong>✅ Choosing between them</strong></p><ul><li>Adjacency list for most real-world (sparse) graphs — social networks, road maps, dependency graphs.</li><li>Adjacency matrix when the graph is dense or you need frequent O(1) edge-existence checks and V is small.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "LruCache — Android developer docs",
                    "url": "https://developer.android.com/reference/android/util/LruCache"
                }
            ],
            "tags": [
                "algorithms",
                "interview-problems",
                "lru-cache",
                "linked-list",
                "two-sum"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Two Sum — O(n) time, O(n) space",
                    "code": "fun twoSum(nums: IntArray, target: Int): IntArray {\n    val seen = HashMap<Int, Int>() // value -> index\n    nums.forEachIndexed { index, num ->\n        val complement = target - num\n        seen[complement]?.let { return intArrayOf(it, index) }\n        seen[num] = index\n    }\n    return intArrayOf(-1, -1)\n}"
                }
            ],
            "subsection": null,
            "id": "dsa-common-problems",
            "importance": "must-know",
            "question": "Common algorithm problems for Android interviews.",
            "answer": "<p><strong>🔑 Patterns that come up repeatedly</strong></p><ul><li><strong>Two Sum / pair-sum</strong> — use a <code>HashMap</code> to find complements in a single pass: <strong>O(n)</strong> time, <strong>O(n)</strong> space (vs O(n²) brute force).</li><li><strong>Reverse a linked list</strong> — iterative pointer-rewiring: <strong>O(n)</strong> time, <strong>O(1)</strong> space.</li><li><strong>Detect a cycle in a linked list</strong> — Floyd's slow/fast pointer (\"tortoise and hare\"): <strong>O(n)</strong> time, <strong>O(1)</strong> space.</li><li><strong>Valid parentheses / balanced brackets</strong> — Stack-based matching: <strong>O(n)</strong> time, <strong>O(n)</strong> space.</li><li><strong>LRU Cache</strong> — <code>HashMap</code> + doubly linked list (or Kotlin's <code>LinkedHashMap</code> with access order) for O(1) get/put — a favorite because it mirrors real Android caching (e.g. <code>LruCache</code>).</li><li><strong>Merge intervals</strong> — sort by start time then sweep: <strong>O(n log n)</strong> time, <strong>O(n)</strong> space.</li><li><strong>Find the Kth largest element</strong> — a min-heap of size k, or Quickselect: <strong>O(n log k)</strong> (heap) or average <strong>O(n)</strong> (Quickselect).</li></ul><p><strong>🎯 Interview tip:</strong> Android interviewers often frame these in a platform context (e.g. \"design an LRU image cache\") — recognizing the underlying textbook pattern under a practical wrapper is the actual skill being tested.</p>"
        }
    ]
};
