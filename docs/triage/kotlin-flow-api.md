# Triage — Kotlin Flow API

**Pass:** 2026-08-17 · 17 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 11 | **7** |
| should-know | 6 | **10** |
| good-to-know | 0 | 0 |

Five demotions and one promotion. The seven that remain are the ones an
interview actually opens with: what a Flow is, cold against hot, StateFlow
against SharedFlow, the operators, `flowOn`, instant search, and how errors are
caught.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `flow-what-is-flow` | must | **candidate** | `[0]` stdout † | — |
| 2 | `flow-flowon` | must | — | `[0]` trace | simplify |
| 3 | `flow-builders` | must → **should** | — | — | — |
| 4 | `flow-common-operators` | must | — | — | — |
| 5 | `flow-terminal-operators` | must → **should** | — | — | — |
| 6 | `flow-cold-vs-hot` | must | — | — | — |
| 7 | `flow-stateflow-sharedflow` | must | — | `[0]` trace | simplify |
| 8 | `flow-callbackflow` | must → **should** | — | `[0]` trace | — |
| 9 | `flow-channelflow` | must → **should** | — | — | — |
| 10 | `flow-parallel-tasks` | should | — | — | — |
| 11 | `flow-retry-operator` | should | — | `[0]` stdout | — |
| 12 | `flow-retrofit` | should | — | `[0]` trace | — |
| 13 | `flow-room-database` | should | — | `[0]` trace | — |
| 14 | `flow-zip-parallel-calls` | should | — | `[0]` stdout | — |
| 15 | `flow-instant-search` | must | — | `[0]` trace | — |
| 16 | `flow-exception-handling` | should → **must** | — | `[0]` stdout | **verify** |
| 17 | `flow-unit-testing` | must → **should** | — | `[0]` trace | — |

† The snippet prints, but its ticker is `while (true)` — it never terminates.
Phase 3 has to bound it with `take(n)` before it can be a `stdout` snippet, or
the twenty-second leash in the runner will kill it.

## Why each tier moved

**3 · `flow-builders` → should-know.** "How do you create a Flow" is asked, but
question 1 already names `flow {}`, `flowOf` and `asFlow` while defining the
builder. This question is the same list with two more entries.

**5 · `flow-terminal-operators` → should-know.** Same overlap: question 1 defines
the collector as the thing that starts the stream, which is the whole point.
`toList`, `first` and `reduce` are lookup, not interview.

**8 · `flow-callbackflow` → should-know** and **9 · `flow-channelflow` →
should-know.** Both are "have you used this" questions rather than openers.
callbackFlow is the more commonly asked of the two, and neither belongs in a
two-hour revision.

**16 · `flow-exception-handling` → must-know.** The promotion. `catch {}` against
`try/catch` around `collect` is a standard question, and the distinction —
`catch` sees upstream only — is exactly the kind of thing an interviewer probes.
It was seeded should-know because the chapter that cites it is should-know, which
is the seed measuring coverage again.

**17 · `flow-unit-testing` → should-know.** Turbine and `runTest` come up at mid
level and above, not in a first screen.

## Image candidates

One figure, confirmed live: **`developer.android.com/static/images/kotlin/flow/flow-entities.png`**
— producer, intermediary and consumer as three stages — from
[Kotlin flows on Android](https://developer.android.com/kotlin/flow). It maps
onto question 1's builder → operator → collector exactly.

Question 1 already has a flowchart of its own saying the same thing, so this is
a straight replace-or-keep decision for Phase 2 rather than an addition. The
drawn one is theme-aware; the official one is not.

`kotlinlang.org/docs/flow.html` carries no figures at all, and neither does the
StateFlow/SharedFlow guide — which is a shame, because question 7 is the one
that would benefit most from a picture of replay and conflation.

## Output candidates

Eleven of the seventeen questions carry a snippet. Four are worth making
runnable, and all four demonstrate something the prose can only assert:

- **11 · retry** — the attempt numbers printing in order is the answer.
- **14 · zip** — that the pairs come out matched, not interleaved.
- **16 · exception handling** — which handler catches what. This is the strongest
  candidate in the topic: the difference between `catch {}` and a `try/catch`
  around `collect` is invisible until you watch the two run.
- **1 · what is Flow** — once bounded, see the note above.

The remaining seven need Retrofit, Room, a real listener, Android's Main
dispatcher or a test runtime, and become `trace`.

## Words

**16 · verify.** "`CancellationException` is never swallowed by `catch` — Flow's
`catch` operator rethrows it instead of treating it as a normal error." Correct
as far as I know, but it is a subtle claim about `catchImpl` that gets stated
wrongly all over the internet, and it sits in a question just promoted to
must-know. Source it.

**2 · simplify.** "Only one `flowOn` is needed per region of the chain — calling
it again further upstream just moves the switch point." Two ideas fighting in one
sentence, and "region" is doing undefined work.

**7 · simplify.** The one that prompted this whole plan. It is accurate and it
is unsayable: `SharedFlow(replay = 1)` with conflation and distinct-until-changed
"built in", "specialized for representing UI state", "dispatcher-aware",
"composes with the rest of the Flow operator set". §3.8's worked example in the
plan is this question — the rewrite is already drafted there.

## Notes

**Two questions overlap enough to consider merging** — 8 (`callbackFlow`) and 9
(`channelFlow`) are each half of one comparison, and question 9 already contains
the table that compares them. Merging is outside this plan's scope; recorded
because it is the kind of thing a reader notices immediately.

**Nothing in this topic failed on accuracy.** One claim wants sourcing. The
`flowOn`, cold-versus-hot, Room and retry answers all check out against the
documentation they link.
