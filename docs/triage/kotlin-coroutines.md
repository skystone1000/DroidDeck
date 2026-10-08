# Triage — Kotlin Coroutines

**Pass:** 2026-08-17 · 20 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Nothing in this file has been done yet — the `image`, `output`
and `words` columns are work queues, and the `tier` column is the only one
already applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 15 | **11** |
| should-know | 5 | **9** |
| good-to-know | 0 | 0 |

Four demotions, no promotions. 11 of 20 is a higher must-know share than the
bank should average, and that is deliberate: coroutines is the topic where
almost everything genuinely does get asked. The global target of 150–180 is met
by topics like RxJava and tooling carrying almost no must-know, not by rationing
this one.

## The pass

`→` marks a tier this pass changed. `[n]` is the index of the code snippet.

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `coroutines-what-are-they` | must | **candidate** | — | simplify |
| 2 | `coroutines-suspend-function` | must | — | `[0]` stdout | — |
| 3 | `coroutines-launch-vs-async` | must | — | — | simplify, **verify** |
| 4 | `coroutines-withcontext` | must | — | `[0]` trace | — |
| 5 | `coroutines-dispatchers` | must | — | — | — |
| 6 | `coroutines-scope` | must → **should** | — | — | — |
| 7 | `coroutines-coroutinescope-vs-supervisorscope` | must → **should** | — | — | — |
| 8 | `coroutines-lifecycle-scopes` | must | — | — | — |
| 9 | `coroutines-context` | must → **should** | — | — | simplify |
| 10 | `coroutines-job-vs-supervisorjob` | must | — | — | — |
| 11 | `coroutines-suspend-coroutine` | should | — | `[0]` trace | — |
| 12 | `coroutines-runblocking` | must | — | — | — |
| 13 | `coroutines-callback-to-coroutines` | should | — | `[0]` trace | — |
| 14 | `coroutines-retrofit` | must → **should** | — | `[0]` trace | **verify** |
| 15 | `coroutines-parallel-network-calls` | should | **candidate** | `[0]` stdout | — |
| 16 | `coroutines-room-database` | should | — | `[0]` trace | — |
| 17 | `coroutines-unit-testing-viewmodel` | should | — | `[0]` trace | — |
| 18 | `coroutines-exception-handling` | must | — | `[0]` stdout | simplify |
| 19 | `coroutines-structured-concurrency` | must | — | — | — |
| 20 | `coroutines-cancellation` | must | — | `[0]` stdout | — |

## Why each tier moved

**6 · `coroutines-scope` → should-know.** "What is CoroutineScope?" is rarely
asked standalone. It surfaces inside launch/async, inside the lifecycle scopes
and inside structured concurrency — all three must-know, and all three explain
it in passing. Keeping it must-know spends a slot on a definition the reader
gets three times over.

**7 · `coroutines-coroutinescope-vs-supervisorscope` → should-know.** The
supervision idea is what gets asked, and question 10 (Job vs SupervisorJob)
carries it. This one is the same distinction one level down, and it is a
mid-to-senior follow-up rather than an opener.

**9 · `coroutines-context` → should-know.** Asked, but almost always folded into
dispatchers or scope rather than on its own.

**14 · `coroutines-retrofit` → should-know.** Frequently asked, but the answer is
"mark it `suspend`" — an application of questions 2 and 4 rather than a subject.
The thinnest answer in the topic at 697 characters, which is the tell.

## Image candidates

Kotlin's documentation is text and code almost throughout, so this topic yields
far less than the Android guides do. Two real figures, both confirmed 200:

| For | Figure | Source |
|---|---|---|
| 1 | Coroutines against threads | `kotlinlang.org/docs/images/coroutines-and-threads.svg` |
| 1 or 15 | Concurrency against parallelism | `kotlinlang.org/docs/images/parallelism-and-concurrency.svg` |

Both from [Coroutine basics](https://kotlinlang.org/docs/coroutines-basics.html).
Question 1 already carries a flowchart of its own, so Phase 2 has to decide
whether the official figure adds to it or competes with it — the §3.5 bar, judged
at card width.

**Licensing needs settling before either is vendored.** §3.5's attribution rule
was written against Android's Creative Commons terms; kotlinlang.org is
JetBrains, under different terms, and nothing here has checked them yet.

`developer.android.com/kotlin/coroutines` carries no figures at all.

## Output candidates

Nine of the twenty questions carry a snippet. **None is currently a runnable
program** — no `fun main`, no `println` anywhere in the topic. Every snippet is
a fragment: a suspend function, a DAO, a ViewModel, a test.

So the five marked `stdout` are marked as *candidates for becoming* runnable
demonstrations, not as snippets that already are. Each is a case where the real
output teaches the thing the prose is trying to say:

- **2** — that a suspend function does not start anything concurrent.
- **15** — that parallel calls take the max, not the sum. A printed elapsed time
  makes the whole question land.
- **18** — which handler actually fires, and in what order.
- **20** — that a cancelled coroutine keeps running until it cooperates. This is
  the one people disbelieve until they see it print.

The four remaining snippets need Retrofit, Room, a real listener or a test
runtime, and become `trace`.

## Words

**3 · verify.** "A root-level `async` that's never awaited still crashes the app
on failure, same as `launch`." The behaviour depends on whether the parent job
is a supervisor, and the sentence does not say so. Phase 4 settles it against
the exceptions guide.

**14 · verify.** "You don't need to wrap the call in `withContext(Dispatchers.IO)`
yourself." True as far as I know for Retrofit 2.6+, and one of the most commonly
argued-about claims in Android — exactly the kind of thing that should be
sourced rather than asserted.

**1, 9, 18 · simplify.** All three are accurate and all three are hard to say out
loud. Question 1 opens with lightweight, cooperative, continuation-passing style
and a state machine inside two sentences; 9 defines `CoroutineContext` as "an
indexed set of elements … an immutable, persistent structure"; 18 packs the
`async`/`Deferred`/handler interaction into one bullet. The §3.8 rules apply:
keep every technical noun, lose the connective jargon.

## Notes

**Three must-know questions have no snippet and would carry one well** — 3
(launch vs async), 12 (runBlocking) and 19 (structured concurrency). Adding
snippets is not in the plan's scope, so this is recorded rather than queued.

**No answer in this topic failed on accuracy.** Two claims want sourcing; the
rest checked out against what the linked documentation says. That is worth
recording, because the value of an audit is partly in the questions it clears.
