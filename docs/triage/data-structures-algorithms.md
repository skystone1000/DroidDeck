# Triage — Data Structures and Algorithms

**Pass:** 2026-08-17 · 10 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 5 | 5 |
| should-know | 5 | **4** |
| good-to-know | 0 | **1** |

Barely moved, because the seed happened to match how Android interviews use
DSA: complexity, the linear structures, hashing and the recurring problem
patterns get asked; the rest is there for the occasional company that screens on
LeetCode.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `dsa-big-o` | must | — | — | — |
| 2 | `dsa-array-vs-linkedlist` | must | — | `[0]` **stdout** | — |
| 3 | `dsa-stack-queue` | must | — | `[0]` **stdout** | — |
| 4 | `dsa-binary-tree-bst` | should | — | `[0]` **stdout** | — |
| 5 | `dsa-hashmap-hashing` | must | — | `[0]` **stdout** | — |
| 6 | `dsa-sorting-algorithms` | should | — | `[0]` **stdout** | — |
| 7 | `dsa-dynamic-programming` | should | — | `[0]` **stdout** | — |
| 8 | `dsa-bfs-dfs` | should | — | `[0]` **stdout** | — |
| 9 | `dsa-graph-representations` | should → **good** | — | `[0]` **stdout** | — |
| 10 | `dsa-common-problems` | must | — | `[0]` **stdout** | — |

## Why the tier moved

**9 · `dsa-graph-representations` → good-to-know.** Adjacency list against
matrix is a computer-science question that Android interviews essentially never
ask. BFS and DFS (8) survive at should-know because they do get asked as
traversal problems — but the representation choice underneath them does not.

## Output candidates — this is the topic

**Nine of the ten snippets should print, and every one of them can.** This is
the only topic in the bank so far where that is true, and it is not a
coincidence: these are pure Kotlin functions over plain data with no Android, no
network and no framework anywhere near them. Each is a `fun main` away from
being a runnable demonstration.

It is also where printed output does the most work, because in this topic the
output *is* the answer:

- **7 · dynamic programming** — the strongest case in the entire bank. The
  snippet holds naive, memoised and tabulated Fibonacci side by side. Printing
  the call counts, or simply the time for `fibNaive(40)` against `fibMemo(40)`,
  turns "avoids exponential blow-up" from a claim into something the reader
  watches happen.
- **8 · BFS and DFS** — the traversal orders printed side by side are the whole
  distinction. Level-by-level against down-one-branch is a sentence you can
  argue with and a pair of printed lists you cannot.
- **3 · stack and queue** — LIFO against FIFO, four lines of output.
- **6 · sorting** — merge sort on a small array, printing each merge step.
- **5 · hashing** — printing which bucket a key lands in makes "reduced modulo
  capacity" concrete.
- **2, 4, 9, 10** — all straightforwardly runnable.

Phase 3 should do this topic **first**. It is the cheapest to verify with
`run-snippets.js`, it has no external dependencies to stub, and it produces the
clearest before-and-after for judging whether the output pane is pulling its
weight.

## Image candidates

None, and none are likely. Neither developer.android.com nor kotlinlang.org
documents data structures — that is not what they are for. The obvious sources
are GeeksforGeeks and Wikipedia, and neither is licensed the way §3.5 requires,
so the honest answer is that this topic keeps its prose and its tables.

Question 1 (Big O) is the one place a figure would genuinely help — a growth-rate
curve comparing O(1), O(log n), O(n), O(n log n) and O(n²). Nothing official
exists to vendor, so if it is ever wanted it would have to be drawn, which makes
it a diagram question rather than an image one and therefore outside this plan.

## Words

Nothing flagged, for either simplification or verification. This topic is the
best-written in the bank: every answer states time *and* space complexity, the
tables are used where tables belong, and the claims are the kind that are either
right or obviously wrong — Java 8's tree-ification of long buckets, TimSort as
the default object sort, quicksort's worst case on sorted input with a naive
pivot. All correct.

## Notes

**The one thing this topic gets wrong is scope, not accuracy.** Ten questions is
thin for a subject some companies screen entirely on, and question 10 is a list
of seven problem patterns that each deserve their own entry. That is a content
gap rather than a defect, and it is outside this plan — recorded because it is
the obvious next thing to do to this topic.
