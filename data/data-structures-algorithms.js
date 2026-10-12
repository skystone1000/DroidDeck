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
                    "title": "A singly linked list, and what indexing costs",
                    "code": "class Node<T>(val value: T, var next: Node<T>? = null)\n\nclass LinkedList<T> {\n    private var head: Node<T>? = null\n\n    fun addFirst(value: T) {           // O(1) -- no shifting, just repoint head\n        head = Node(value, head)\n    }\n\n    fun get(index: Int): T? {          // O(n) -- must walk from the head\n        var current = head\n        repeat(index) { current = current?.next }\n        return current?.value\n    }\n}\n\nfun main() {\n    val list = LinkedList<String>()\n    list.addFirst(\"c\")\n    list.addFirst(\"b\")\n    list.addFirst(\"a\")\n\n    println(\"get(0) = \" + list.get(0))\n    println(\"get(2) = \" + list.get(2))\n    println(\"get(5) = \" + list.get(5))\n\n    val array = arrayListOf(\"a\", \"b\", \"c\")\n    array.add(0, \"z\")\n    println(\"ArrayList after add(0): \" + array)\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "get(0) = a",
                            "get(2) = c",
                            "get(5) = null",
                            "ArrayList after add(0): [z, a, b, c]"
                        ],
                        "explain": "<p><code>get(0)</code> was instant, <code>get(2)</code> had to walk two nodes to reach <code>c</code>, and <code>get(5)</code> walked off the end and returned <code>null</code>. That walk is what makes indexing a linked list <code>O(n)</code> — there is no arithmetic that jumps to the fifth node, only five hops.</p><p>The last line is the opposite trade. <code>ArrayList.add(0, \"z\")</code> put <code>z</code> at the front, which meant shifting every other element one place right.</p>"
                    }
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
                    "title": "Stack and queue from one ArrayDeque",
                    "code": "fun main() {\n    val stack = ArrayDeque<Int>()\n    stack.addLast(1); stack.addLast(2); stack.addLast(3)\n    println(\"stack     = \" + stack)\n    println(\"removeLast -> \" + stack.removeLast())   // LIFO, O(1)\n    println(\"removeLast -> \" + stack.removeLast())\n\n    val queue = ArrayDeque<Int>()\n    queue.addLast(1); queue.addLast(2); queue.addLast(3)\n    println(\"queue     = \" + queue)\n    println(\"removeFirst -> \" + queue.removeFirst()) // FIFO, O(1)\n    println(\"removeFirst -> \" + queue.removeFirst())\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "stack     = [1, 2, 3]",
                            "removeLast -> 3",
                            "removeLast -> 2",
                            "queue     = [1, 2, 3]",
                            "removeFirst -> 1",
                            "removeFirst -> 2"
                        ],
                        "explain": "<p>Both structures were filled with the same <code>1, 2, 3</code>. The stack gave back 3 then 2 — last in, first out. The queue gave back 1 then 2 — first in, first out. Only the <em>end you remove from</em> differs, which is why a single <code>ArrayDeque</code> serves as both and why each operation is <code>O(1)</code>.</p>"
                    }
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
                    "title": "BST insert, in-order traversal, and how a tree degenerates",
                    "code": "class TreeNode(val value: Int) {\n    var left: TreeNode? = null\n    var right: TreeNode? = null\n}\n\nfun insert(root: TreeNode?, value: Int): TreeNode {   // O(log n) avg, O(n) worst\n    if (root == null) return TreeNode(value)\n    if (value < root.value) root.left = insert(root.left, value)\n    else root.right = insert(root.right, value)\n    return root\n}\n\nfun inOrder(node: TreeNode?, result: MutableList<Int>) { // O(n)\n    node ?: return\n    inOrder(node.left, result)\n    result.add(node.value)\n    inOrder(node.right, result)\n}\n\nfun height(node: TreeNode?): Int =\n    if (node == null) 0 else 1 + maxOf(height(node.left), height(node.right))\n\nfun main() {\n    var balanced: TreeNode? = null\n    for (v in listOf(50, 30, 70, 20, 40, 60, 80)) balanced = insert(balanced, v)\n\n    val sorted = mutableListOf<Int>()\n    inOrder(balanced, sorted)\n    println(\"in-order  = \" + sorted)\n    println(\"height    = \" + height(balanced))\n\n    // Inserting already-sorted data degenerates the tree into a linked list.\n    var skewed: TreeNode? = null\n    for (v in listOf(20, 30, 40, 50, 60, 70, 80)) skewed = insert(skewed, v)\n    println(\"skewed height = \" + height(skewed) + \" for the same 7 values\")\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "in-order  = [20, 30, 40, 50, 60, 70, 80]",
                            "height    = 3",
                            "skewed height = 7 for the same 7 values"
                        ],
                        "explain": "<p>In-order traversal printed the values sorted without sorting anything — that ordering <em>is</em> the BST invariant, not extra work done at the end.</p><p>The two heights are the warning. Seven values inserted in mixed order built a tree of height 3. The same seven inserted already sorted built a tree of height 7 — every node hanging off the right of the last, which is a linked list wearing a tree's type. Search has quietly gone from <code>O(log n)</code> to <code>O(n)</code>, and that is the whole reason AVL and red-black trees exist.</p>"
                    }
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
                    "title": "Which bucket a key lands in, and why equals matters",
                    "code": "data class Employee(val id: Int, val name: String) // data class generates hashCode/equals\n\nfun main() {\n    val ages = HashMap<String, Int>()\n    ages[\"Aditya\"] = 29                  // O(1) average\n    println(\"get -> \" + ages[\"Aditya\"])  // O(1) average\n\n    // What put/get actually do: reduce the key's hash to a bucket index.\n    // Capacity is a power of two, so the modulo is a bit-mask.\n    val capacity = 16\n    for (key in listOf(\"Aditya\", \"Riya\", \"Sam\")) {\n        val bucket = key.hashCode() and (capacity - 1)\n        println(key + \": hashCode=\" + key.hashCode() + \" bucket=\" + bucket)\n    }\n\n    // Equal objects must produce equal hash codes, or lookup fails.\n    val a = Employee(1, \"Aditya\")\n    val b = Employee(1, \"Aditya\")\n    println(\"a == b            -> \" + (a == b))\n    println(\"same hashCode     -> \" + (a.hashCode() == b.hashCode()))\n    println(\"found by equal key-> \" + hashMapOf(a to \"engineer\")[b])\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "get -> 29",
                            "Aditya: hashCode=1956490294 bucket=6",
                            "Riya: hashCode=2547615 bucket=15",
                            "Sam: hashCode=82879 bucket=15",
                            "a == b            -> true",
                            "same hashCode     -> true",
                            "found by equal key-> engineer"
                        ],
                        "explain": "<p>Look at the third and fourth lines. <code>Riya</code> and <code>Sam</code> have completely unrelated hash codes and still land in bucket 15. That is a <strong>collision</strong>, and it is ordinary — sixteen buckets cannot keep every possible string apart. The map copes by chaining both entries inside that one bucket, which is exactly why the worst case is <code>O(n)</code> and not <code>O(1)</code>.</p><p>The last three lines are why keys must implement <code>hashCode</code> and <code>equals</code> consistently: two separately constructed <code>Employee</code> objects compare equal, hash to the same bucket, and so one finds the other's entry. A class that overrode only <code>equals</code> would have printed <code>null</code> there — the lookup would have gone to a different bucket entirely.</p>"
                    }
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
                    "title": "Merge sort, printing every merge step",
                    "code": "fun mergeSort(arr: IntArray): IntArray {\n    if (arr.size <= 1) return arr\n    val mid = arr.size / 2\n    val left = mergeSort(arr.copyOfRange(0, mid))\n    val right = mergeSort(arr.copyOfRange(mid, arr.size))\n    return merge(left, right)\n}\n\nfun merge(left: IntArray, right: IntArray): IntArray {\n    val result = IntArray(left.size + right.size)\n    var i = 0; var j = 0; var k = 0\n    while (i < left.size && j < right.size) {\n        result[k++] = if (left[i] <= right[j]) left[i++] else right[j++]\n    }\n    while (i < left.size) result[k++] = left[i++]\n    while (j < right.size) result[k++] = right[j++]\n    println(\"merge \" + left.toList() + \" + \" + right.toList() + \" -> \" + result.toList())\n    return result\n}\n\nfun main() {\n    val input = intArrayOf(38, 27, 43, 3, 9, 82, 10)\n    println(\"input  = \" + input.toList())\n    println(\"sorted = \" + mergeSort(input).toList())\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "input  = [38, 27, 43, 3, 9, 82, 10]",
                            "merge [27] + [43] -> [27, 43]",
                            "merge [38] + [27, 43] -> [27, 38, 43]",
                            "merge [3] + [9] -> [3, 9]",
                            "merge [82] + [10] -> [10, 82]",
                            "merge [3, 9] + [10, 82] -> [3, 9, 10, 82]",
                            "merge [27, 38, 43] + [3, 9, 10, 82] -> [3, 9, 10, 27, 38, 43, 82]",
                            "sorted = [3, 9, 10, 27, 38, 43, 82]"
                        ],
                        "explain": "<p>Each <code>merge</code> line is one combine step, and they print from the bottom up: single elements pair off first, those pairs merge into larger runs, and the final line joins the two halves. Seven values took three levels of merging — that is the <code>log n</code> — and every level touches all <code>n</code> values, which gives <code>O(n log n)</code>.</p><p>Notice that both inputs to every <code>merge</code> are already sorted. That is the only reason merging can be a single linear pass, and it is why merge sort recurses <em>before</em> it merges rather than after.</p>"
                    }
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
                    "title": "Fibonacci: naive vs memoised vs tabulated, with call counts",
                    "code": "var naiveCalls = 0\nvar memoCalls = 0\n\n// Naive: O(2^n) time, O(n) stack space\nfun fibNaive(n: Int): Long {\n    naiveCalls++\n    return if (n < 2) n.toLong() else fibNaive(n - 1) + fibNaive(n - 2)\n}\n\n// Memoized (top-down): O(n) time, O(n) space\nfun fibMemo(n: Int, cache: MutableMap<Int, Long> = mutableMapOf()): Long {\n    memoCalls++\n    if (n < 2) return n.toLong()\n    return cache.getOrPut(n) { fibMemo(n - 1, cache) + fibMemo(n - 2, cache) }\n}\n\n// Tabulated (bottom-up): O(n) time, O(1) space\nfun fibTab(n: Int): Long {\n    if (n < 2) return n.toLong()\n    var a = 0L; var b = 1L\n    repeat(n - 1) { val next = a + b; a = b; b = next }\n    return b\n}\n\nfun main() {\n    val n = 30\n    println(\"fibNaive(\" + n + \") = \" + fibNaive(n) + \" in \" + naiveCalls + \" calls\")\n    println(\"fibMemo(\" + n + \")  = \" + fibMemo(n) + \" in \" + memoCalls + \" calls\")\n    println(\"fibTab(\" + n + \")   = \" + fibTab(n) + \" in 0 recursive calls\")\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "fibNaive(30) = 832040 in 2692537 calls",
                            "fibMemo(30)  = 832040 in 59 calls",
                            "fibTab(30)   = 832040 in 0 recursive calls"
                        ],
                        "explain": "<p>This is dynamic programming in three lines. All three functions return the same 832040. The naive version needed <strong>2,692,537</strong> calls to get there; memoising it needed <strong>59</strong>.</p><p>Nothing about the recurrence changed — the cache simply stops a subproblem being solved twice, and the exponential tree of calls collapses into a line of them. Raise <code>n</code> to 40 and the naive version takes minutes while the other two stay instant.</p>"
                    }
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
                    "title": "BFS and DFS over the same graph, O(V + E)",
                    "code": "fun bfs(start: Int, graph: Map<Int, List<Int>>): List<Int> {\n    val visited = mutableSetOf(start)\n    val order = mutableListOf<Int>()\n    val queue = ArrayDeque<Int>().apply { addLast(start) }\n    while (queue.isNotEmpty()) {\n        val node = queue.removeFirst()\n        order.add(node)\n        for (neighbor in graph[node].orEmpty()) {\n            if (visited.add(neighbor)) queue.addLast(neighbor)\n        }\n    }\n    return order\n}\n\nfun dfs(\n    node: Int,\n    graph: Map<Int, List<Int>>,\n    visited: MutableSet<Int> = mutableSetOf(),\n    order: MutableList<Int> = mutableListOf()\n): List<Int> {\n    if (!visited.add(node)) return order\n    order.add(node)\n    for (neighbor in graph[node].orEmpty()) dfs(neighbor, graph, visited, order)\n    return order\n}\n\nfun main() {\n    //     1\n    //    / \\\n    //   2   3\n    //  / \\   \\\n    // 4   5   6\n    val graph = mapOf(\n        1 to listOf(2, 3),\n        2 to listOf(4, 5),\n        3 to listOf(6),\n        4 to emptyList<Int>(),\n        5 to emptyList(),\n        6 to emptyList()\n    )\n\n    println(\"BFS from 1 = \" + bfs(1, graph))\n    println(\"DFS from 1 = \" + dfs(1, graph))\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "BFS from 1 = [1, 2, 3, 4, 5, 6]",
                            "DFS from 1 = [1, 2, 4, 5, 3, 6]"
                        ],
                        "explain": "<p>The two orders are the entire difference, and no amount of prose settles it as quickly. BFS reached <code>1, 2, 3</code> before touching anything at depth two — it finishes a level before going deeper, which is precisely why it finds the shortest path in an unweighted graph. DFS went <code>1, 2, 4</code>, straight down the leftmost branch to the bottom, then backtracked for 5, then crossed to 3 and 6.</p>"
                    }
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
                    "title": "The same graph as an adjacency list and as a matrix",
                    "code": "val graph: MutableMap<Int, MutableList<Int>> = mutableMapOf()\n\nfun addEdge(u: Int, v: Int) {          // O(1)\n    graph.getOrPut(u) { mutableListOf() }.add(v)\n    graph.getOrPut(v) { mutableListOf() }.add(u) // omit for a directed graph\n}\n\nfun main() {\n    addEdge(1, 2)\n    addEdge(1, 3)\n    addEdge(2, 4)\n\n    println(\"adjacency list = \" + graph)\n    println(\"neighbours of 1 = \" + graph[1])\n    println(\"edge 1-3 exists = \" + (graph[1]?.contains(3) ?: false))\n\n    // The same graph as a matrix over nodes 1..4: 16 cells to hold 3 edges.\n    val nodes = listOf(1, 2, 3, 4)\n    val matrix = Array(nodes.size) { IntArray(nodes.size) }\n    for ((u, neighbours) in graph) for (v in neighbours) matrix[u - 1][v - 1] = 1\n\n    println(\"adjacency matrix:\")\n    println(\"    \" + nodes.joinToString(\" \"))\n    nodes.forEachIndexed { i, node -> println(\"  $node \" + matrix[i].joinToString(\" \")) }\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "adjacency list = {1=[2, 3], 2=[1, 4], 3=[1], 4=[2]}",
                            "neighbours of 1 = [2, 3]",
                            "edge 1-3 exists = true",
                            "adjacency matrix:",
                            "    1 2 3 4",
                            "  1 0 1 1 0",
                            "  2 1 0 0 1",
                            "  3 1 0 0 0",
                            "  4 0 1 0 0"
                        ],
                        "explain": "<p>Three edges, stored twice. The adjacency list holds four entries and six references. The matrix underneath says exactly the same thing in sixteen cells, ten of which are zero. Scale both to a thousand nodes: the list still grows with the number of edges, while the matrix needs a million cells whether the graph is dense or nearly empty.</p><p>The matrix earns its keep on the third line's question. \"Is there an edge 1–3?\" is one cell lookup in a matrix, where the list has to scan node 1's neighbours.</p>"
                    }
                }
            ],
            "subsection": null,
            "id": "dsa-graph-representations",
            "importance": "good-to-know",
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
                    "code": "fun twoSum(nums: IntArray, target: Int): IntArray {\n    val seen = HashMap<Int, Int>() // value -> index\n    nums.forEachIndexed { index, num ->\n        val complement = target - num\n        seen[complement]?.let { return intArrayOf(it, index) }\n        seen[num] = index\n    }\n    return intArrayOf(-1, -1)\n}\n\nfun main() {\n    val nums = intArrayOf(2, 7, 11, 15)\n    println(\"twoSum([2, 7, 11, 15], 9)  = \" + twoSum(nums, 9).toList())\n    println(\"twoSum([2, 7, 11, 15], 26) = \" + twoSum(nums, 26).toList())\n    println(\"twoSum([2, 7, 11, 15], 100)= \" + twoSum(nums, 100).toList())\n}",
                    "output": {
                        "kind": "stdout",
                        "lines": [
                            "twoSum([2, 7, 11, 15], 9)  = [0, 1]",
                            "twoSum([2, 7, 11, 15], 26) = [2, 3]",
                            "twoSum([2, 7, 11, 15], 100)= [-1, -1]"
                        ],
                        "explain": "<p>The map is filled as the scan runs, so each element only ever looks backwards — one pass, no nested loop. For target 9 the answer landed at index 1: <code>7</code> looked for its complement <code>9 - 7 = 2</code>, and <code>2</code> had already been recorded at index 0.</p><p>The last call finds nothing and returns the <code>[-1, -1]</code> sentinel. Worth noticing, because a caller that assumes success will happily index into it.</p>"
                    }
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
