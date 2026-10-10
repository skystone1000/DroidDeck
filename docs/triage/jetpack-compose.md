# Triage — Jetpack Compose

**Pass:** 2026-08-17 · 33 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 29 | **17** |
| should-know | 3 | **15** |
| good-to-know | 1 | 1 |

Seventeen of thirty-three is the highest must-know share left in the bank after
review, and it is deliberate. Compose is the UI toolkit now, so the same
argument that applies to coroutines applies here: nearly all of it really does
get asked. The twelve demotions are overlaps and second-order APIs, not
judgements that the subject matters less.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `compose-theory-references` | good | — | — | — |
| 2 | `compose-vs-view-system` | must | — | `[0][1]` trace | — |
| 3 | `compose-declarative-ui` | must | — | `[0]` trace | — |
| 4 | `compose-declarative-vs-imperative` | must → **should** | — | — | — |
| 5 | `compose-composable-functions` | must | — | `[0]` trace | — |
| 6 | `compose-recomposition` | must | **candidate** | `[0]` trace | — |
| 7 | `compose-state` | must | — | — | — |
| 8 | `compose-mutable-state` | must → **should** | — | `[0]` trace | — |
| 9 | `compose-state-management` | must | — | `[0]` trace | — |
| 10 | `compose-stateful-vs-stateless` | must → **should** | — | `[0]` trace | — |
| 11 | `compose-side-effects` | must | — | — | — |
| 12 | `compose-launched-vs-disposable` | must | — | `[0][1]` trace | — |
| 13 | `compose-remember-coroutine-scope` | must → **should** | — | `[0]` trace | — |
| 14 | `compose-observe-flows-livedata` | must | — | `[0]` trace | — |
| 15 | `compose-async-operations` | must → **should** | — | `[0]` trace | — |
| 16 | `compose-non-compose-state` | must → **should** | — | `[0]` trace | — |
| 17 | `compose-derived-state-of` | must | — | `[0]` trace | — |
| 18 | `compose-remember-updated-state` | must → **should** | — | `[0]` trace | — |
| 19 | `compose-remember-vs-saveable` | must | — | `[0]` trace | — |
| 20 | `compose-lifecycle` | must | **candidate** | — | — |
| 21 | `compose-lifecycle-events` | must → **should** | — | `[0]` trace | — |
| 22 | `compose-performance-optimization` | must | — | `[0]` trace | — |
| 23 | `compose-with-views` | should | — | `[0]` trace | — |
| 24 | `compose-state-hoisting` | must | — | `[0]` trace | — |
| 25 | `compose-composition-local` | should | — | `[0]` trace | — |
| 26 | `compose-phases` | must | **candidate** | — | — |
| 27 | `compose-modifier` | must | — | `[0]` trace | — |
| 28 | `compose-semantics` | must → **should** | — | `[0]` trace | — |
| 29 | `compose-user-input` | must → **should** | — | `[0]` trace | — |
| 30 | `compose-navigation` | must | — | `[0]` trace | — |
| 31 | `compose-orientation-changes` | must → **should** | — | — | — |
| 32 | `compose-unidirectional-data-flow` | must → **should** | **candidate** | `[0]` trace | — |
| 33 | `compose-custom-layouts` | should | — | `[0]` trace | — |

## Why the tiers moved

**Overlaps, mostly.** Question 4 (declarative versus imperative) is question 3
asked again. Question 8 (`MutableState`) is question 7 (`State`) with a setter.
Question 10 (stateful versus stateless) is question 24 (state hoisting) from the
other end, and hoisting is the term interviewers use. Question 32 (UDF) is the
named concept inside question 9 (state management) — both were must-know, which
is the filter counting one subject three times.

**Second-order effect APIs go to should-know:** `rememberCoroutineScope` (13),
`produceState` (16), `rememberUpdatedState` (18) and lifecycle bridging (21).
`LaunchedEffect` versus `DisposableEffect` (12) and side effects generally (11)
stay must-know, because those are the two that get asked. The rest are what you
reach for once you already know those.

**15 · async operations → should-know.** Its own answer says Compose has no
async primitives beyond the effect handlers, which questions 11, 12 and 14
already cover.

**28 · semantics** and **29 · user input → should-know.** Accessibility and
click handling are daily work and rare interview questions.

## Image candidates

The strongest set in the bank after the lifecycle diagrams. All confirmed 200:

| For | Figure | Path under `developer.android.com` |
|---|---|---|
| 26 | The three Compose phases | `/static/develop/ui/compose/images/compose-phases.png` |
| 6, 20 | Composition lifecycle and recomposition | `/static/develop/ui/compose/images/lifecycle-composition.png` |
| 32 | Unidirectional data flow | `/static/develop/ui/compose/images/state-unidirectional-flow.png` |

Question 26 already has a three-node flowchart, 20 has an `animation`, and 32 has
a two-node flowchart — the three weakest drawings competing with three of
Google's clearest figures. The `lifecycle` guide carries several more
(`lifecycle-hierarchy`, `lifecycle-newelement-*`) that illustrate *why*
recomposition skips, which the prose in question 6 asserts and cannot show.

## Output candidates

**None.** Every snippet is `@Composable`, which needs the Compose compiler
plugin and runtime — neither of which ships with kotlinc. Same constraint that
ruled out the RxJava snippets, for the same reason.

All 26 snippets are `trace`, and this topic is where the trace pane matters
most: recomposition, effect keys and composition lifetime are all *ordering*
questions. "`LaunchedEffect` cancels and restarts when its key changes" is a
sentence; a numbered list of enter → effect starts → key changes → effect
cancels → effect restarts → leave → effect cancels is the answer.

## Words

Nothing flagged, which is a surprise for the largest must-know block in the
bank. The Compose answers are the most consistently well-written here: each
opens with a definition, the comparisons are tables, and the tricky ones
(`derivedStateOf`, `rememberUpdatedState`) explain *why* the API exists rather
than only what it does.

## Notes

**Questions 3, 4 and 2 are one subject in three parts** — declarative UI, its
contrast with imperative, and Compose against Views. The tiering now keeps two
and drops one; merging 3 and 4 would be the honest fix.

**Seventeen must-know is the number to revisit** if the bank-wide total lands
above 180. Compose and coroutines are the two topics carrying a deliberately high
share, and if something has to give, questions 3, 20 and 22 are the next
candidates.
