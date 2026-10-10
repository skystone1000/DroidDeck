# Triage — Java

**Pass:** 2026-08-17 · 48 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 24 | **12** |
| should-know | 21 | **30** |
| good-to-know | 3 | **6** |

Halved. Java is still asked in Android interviews — the JVM underneath does not
go away — but it is asked as fundamentals: OOP, equality, collections,
concurrency basics. The language trivia that fills the back half of this topic
is lookup material.

## The pass

| # | Question | Tier | Output | Words |
|---|---|---|---|---|
| 1 | `single-responsibility-principle` | must | `[0]` stdout ‡ | — |
| 2 | `open-closed-principle` | must → **should** | `[0]` stdout ‡ | — |
| 3 | `liskov-substitution-principle` | must → **should** | — | — |
| 4 | `interface-segregation-principle` | must → **should** | `[0]` stdout ‡ | — |
| 5 | `dependency-inversion-principle` | must | `[0]` stdout ‡ | — |
| 6 | `explain-oop-concepts` | must | — | — |
| 7 | `abstract-classes-vs-interfaces` | must | `[0]` stdout ‡ | simplify |
| 8 | `method-overloading-vs-overriding` | must | `[0]` **stdout ‡** | — |
| 9 | `string-pool-in-java` | should | `[0]` **stdout ‡** | — |
| 10 | `access-modifiers-in-java` | should | — | — |
| 11 | `interface-implement-another-interface` | must → **should** | `[0]` stdout ‡ | — |
| 12 | `polymorphism-and-inheritance` | must → **should** | `[0]` stdout ‡ | — |
| 13 | `arrays-vs-arraylists` | must | `[0]` stdout ‡ | — |
| 14 | `hashset-vs-treeset` | must → **should** | — | — |
| 15 | `hashmap-vs-set` | must → **should** | `[0]` stdout ‡ | — |
| 16 | `generics-in-java` | should | `[0]` stdout ‡ | — |
| 17 | `string-class-implementation-immutability` | should | `[0]` stdout ‡ | — |
| 18 | `string-immutability-meaning` | should → **good** | `[0]` stdout ‡ | — |
| 19 | `eight-primitive-types` | should → **good** | — | — |
| 20 | `integer-vs-int` | should | `[0]` **stdout ‡** | — |
| 21 | `pass-by-reference-or-value` | must | `[0]` **stdout ‡** | — |
| 22 | `garbage-collector` | must | — | simplify |
| 23 | `synchronized-keyword` | should → **must** | `[0]` stdout ‡ | — |
| 24 | `threadpoolexecutor` | should | `[0]` stdout ‡ | simplify |
| 25 | `volatile-modifier` | should | `[0]` stdout ‡ | — |
| 26 | `object-level-vs-class-level-lock` | should | `[0]` stdout ‡ | — |
| 27 | `concurrency-vs-parallelism` | should | — | — |
| 28 | `atomic-operations` | should | `[0]` stdout ‡ | simplify |
| 29 | `try-catch-finally` | should | `[0]` **stdout ‡** | — |
| 30 | `checked-vs-unchecked-exceptions` | should | `[0]` stdout ‡ | — |
| 31 | `shallow-vs-deep-copy` | must → **should** | `[0]` **stdout ‡** | — |
| 32 | `serialization-deserialization` | should | `[0]` stdout ‡ | — |
| 33 | `transient-modifier` | good | — | — |
| 34 | `anonymous-classes` | must → **should** | `[0]` stdout ‡ | — |
| 35 | `equals-vs-double-equals` | must | `[0]` **stdout ‡** | — |
| 36 | `hashcode-and-equals` | must | `[0]` **stdout ‡** | — |
| 37 | `final-finally-finalize` | should | — | — |
| 38 | `static-keyword` | should | `[0]` stdout ‡ | — |
| 39 | `reflection-in-java` | good | `[0]` stdout ‡ | — |
| 40 | `stringbuffer-vs-stringbuilder` | must | `[0]` stdout ‡ | — |
| 41 | `dependency-injection-in-java` | must → **should** | `[0]` trace | — |
| 42 | `marker-interface-in-java` | good | `[0]` stdout ‡ | — |
| 43 | `comparable-vs-comparator` | should | `[0]` stdout ‡ | — |
| 44 | `enum-in-java` | must → **should** | `[0]` stdout ‡ | — |
| 45 | `autoboxing-and-unboxing` | should | `[0]` **stdout ‡** | — |
| 46 | `varargs-in-java` | must → **good** | `[0]` stdout ‡ | — |
| 47 | `integer-caching-wrapper-classes` | should | `[0]` **stdout ‡** | — |
| 48 | `diamond-problem-default-methods` | must → **should** | `[0]` stdout ‡ | — |

‡ **Every snippet in this topic is Java, and `run-snippets.js` is Kotlin-only.**
See below — this is the single biggest finding of the pass.

## Why the tiers moved

**SOLID goes from five must-know to two.** "Explain SOLID" is one question, and
five slots for it is the filter counting one subject five times. Single
Responsibility stays because it is the one people are asked to *apply*;
Dependency Inversion stays because it is the reasoning behind dependency
injection, which is must-know in two other topics. Open/Closed, Liskov and
Interface Segregation are should-know — worth knowing, rarely the question.

**12 · polymorphism and inheritance → should-know.** Question 6 (explain OOP
concepts) is where this gets asked; asking it again separately is duplication.

**14, 15 · HashSet/TreeSet and HashMap/Set → should-know.** The collections
question that gets asked is arrays against ArrayList (13, which stays) and
`hashCode`/`equals` (36, which stays). The set comparisons are lookup.

**23 · `synchronized` → must-know.** The promotion. Thread safety is the Java
question Android interviews actually reach for, and `synchronized` is where it
starts.

**41 · dependency injection → should-know.** A third copy — DI is already
must-know in `design-pattern` and `android-libraries`.

**46 · varargs → good-to-know**, **19 · the eight primitives → good-to-know**,
**18 · what immutability means → good-to-know.** Trivia, a list, and a
restatement of question 17.

## Output candidates — and the constraint that blocks them

**Thirty-eight snippets here would print, and none of them can be verified
today.** `run-snippets.js` compiles Kotlin. Every snippet in this topic is Java.

That is worth more than a note, because this is the topic where printed output
would teach the most. Java's classic interview questions are *exactly* the ones
whose answers people get wrong until they see them run:

- **47 · Integer caching** — `Integer a = 127, b = 127; a == b` is `true`, and
  at `128` it is `false`. The canonical surprise, and unanswerable from prose.
- **35 · `==` versus `.equals()`** and **45 · autoboxing** — same family, same
  payoff.
- **21 · pass by reference or value** — the question is *about* what people
  predict wrongly. Printing the object's field after the method returns settles
  an argument that has run for thirty years.
- **29 · try/catch/finally** — the ordering, including what happens when
  `finally` returns.
- **9 · String pool**, **31 · shallow versus deep copy**, **36 ·
  `hashCode`/`equals`**, **8 · overloading versus overriding** — all the same
  shape: a claim about identity or dispatch that a printed line resolves.

**Recommendation for Phase 3: teach `run-snippets.js` to compile Java.** The JDK
is already resolved — `javac` sits beside the `java` the runner uses, in Android
Studio's bundled JBR. It is a small change to a script that already shells out to
a compiler, and it unlocks the highest-value output work in the bank. Until then
every entry above is a candidate, not a commitment.

## Image candidates

None. The obvious one is a JVM heap diagram for question 22 (garbage collector),
and the natural source is Oracle's HotSpot tuning guide — whose terms are not the
permissive licence §3.5 was written against. Question 22 keeps its flowchart.

## Words

**22 · simplify.** The garbage collector answer at 1916 characters, covering
generational heaps, collector types and tuning in one run of bullets.

**24 · simplify** (2052 characters) and **28 · simplify** (1903). ThreadPoolExecutor's
seven constructor parameters and the atomic operations family are both
reference-shaped answers wearing an interview answer's clothes.

**7 · simplify.** Abstract classes versus interfaces, 1916 characters, and it is
must-know — the highest-value rewrite in the topic.

Nothing flagged for verification. This is old, stable, well-documented material
and the answers are careful with it: the `Integer` cache range, the tree-ification
threshold, `finalize`'s deprecation, the diamond resolution rules are all correct.

## Notes

**The concurrency section (23–28) is the strongest run of answers in the topic**
and is now tiered one must-know, five should-know. That reads right for Android:
you need to know what `synchronized` means, and you need the rest available when
someone asks a follow-up.
