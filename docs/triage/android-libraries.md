# Triage — Android Libraries

**Pass:** 2026-08-17 · 28 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 16 | **5** |
| should-know | 8 | **18** |
| good-to-know | 4 | **5** |

The largest cut in the bank so far, and it comes from two clusters that the seed
counted question by question when they are really one subject each: seven Dagger
questions and thirteen RxJava ones.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `okhttp-interceptor` | must | — | `[0]` trace | — |
| 2 | `okhttp-caching` | must → **should** | — | — | — |
| 3 | `okhttp-logging` | must → **should** | — | `[0]` trace | — |
| 4 | `android-dagger-why` | must | — | — | — |
| 5 | `android-dagger-annotations` | must | — | `[0]` trace | — |
| 6 | `android-dagger-how-works` | must → **should** | — | — | — |
| 7 | `android-dagger-vs-hilt` | must | — | — | — |
| 8 | `android-dagger-component` | must → **should** | — | — | — |
| 9 | `android-dagger-module` | must → **should** | — | — | — |
| 10 | `android-dagger-custom-scope` | must → **should** | — | `[0]` trace | — |
| 11 | `android-rxjava-composite-disposable` | should | — | `[0]` trace | — |
| 12 | `android-multipart-request` | must → **should** | — | — | — |
| 13 | `android-kotlin-flow` | must → **should** | — | `[0]` trace | — |
| 14 | `android-app-startup-library` | must → **should** | — | `[0]` trace | — |
| 15 | `android-rxjava-overview` | should | — | — | — |
| 16 | `android-rxjava-error-handling` | should | — | `[0]` trace | — |
| 17 | `android-rxjava-flatmap-vs-map` | should | — | — | — |
| 18 | `android-rxjava-create-vs-fromcallable` | good | — | `[0]` trace | — |
| 19 | `android-rxjava-defer` | good | — | `[0]` trace | — |
| 20 | `android-rxjava-timer-delay-interval` | should → **good** | — | — | — |
| 21 | `android-rxjava-parallel-calls` | good | — | `[0]` trace | — |
| 22 | `android-rxjava-concat-vs-merge` | good | — | — | — |
| 23 | `android-rxjava-subject` | should | — | `[0]` trace | — |
| 24 | `android-rxjava-observable-types` | should | — | — | — |
| 25 | `android-rxjava-search` | must → **should** | — | `[0]` trace | — |
| 26 | `android-rxjava-pagination` | must → **should** | — | `[0]` trace | — |
| 27 | `android-glide-fresco` | must | — | `[0]` trace | — |
| 28 | `android-rxjava-schedulers-io-vs-computation` | should | — | — | — |

## Why the tiers moved

**The Dagger block (4–10) goes from seven must-know to three.** "Why use a DI
framework", "explain @Inject/@Module/@Provides/@Component" and "Dagger or Hilt"
are the three that get asked. Questions 8 and 9 are the annotation question
split into its parts and asked again; 6 and 10 are internals and a how-to. Seven
must-know slots for one library was the seed counting citations, not interviews.

**The RxJava block goes to one must-know and then none.** Both survivors were
demoted: search (25) and pagination (26) are real interview tasks, but the
version that gets asked now is the Flow one, which lives in the Flow topic and is
already must-know there. RxJava is maintenance knowledge in 2026 — worth a
should-know for the core ideas (15, 16, 17, 23, 24, 28) and good-to-know for the
operator trivia.

**13 · `android-kotlin-flow` → should-know.** It is a **duplicate** of
`kotlin-flow-api › flow-what-is-flow`, which is must-know. Two must-know
questions answering "what is Flow" is a filter defeating itself.

**2, 3 · OkHttp caching and logging → should-know.** The interceptor question (1)
is the one that gets asked; these two are how-tos that follow from it.

**12, 14 → should-know.** Multipart is a recipe; App Startup is a niche Jetpack
library most apps never touch.

## Output candidates

**None.** Every snippet here needs a library the runner cannot supply.

This is worth stating plainly because it is a real constraint on Phase 3, found
by testing rather than assumed: `run-snippets.js` compiles against
`kotlin-stdlib` plus `kotlinx-coroutines-core`, which ship with the Kotlin
compiler. **RxJava, OkHttp, Retrofit, Dagger and Glide do not.** A snippet
needing any of them cannot be run, so it cannot honestly carry an `Output` pane,
so it is a `trace` — regardless of how runnable it looks.

The thirteen RxJava snippets are the frustrating case: they are pure JVM code
with no Android in them, and several would print beautifully. Making them
runnable would mean resolving `io.reactivex.rxjava3:rxjava` from Maven at verify
time, which is a build system, and this project does not have one for a reason.

## Image candidates

None. Square, Google's Dagger team and Bumptech do not publish figures the way
the Android guides do, and the one diagram that would help — the OkHttp
interceptor chain in question 1 — is already drawn as a flowchart here, since
the page that used to hold the official version is one of the ones that
[went away](../plans/2026-08-17-answer-quality.md).

## Words

Nothing flagged. The tables in this topic are used well — flatMap against map,
concat against merge, io against computation, ProGuard-style comparisons are
exactly what tables are for, and they are already short.

## Notes

**Question 13 should be deleted, not demoted.** It duplicates the Flow topic's
opening question, and having the same subject in two topics with two different
tiers is how a bank rots. Demotion is the workaround available to triage;
removal is a content decision.

**Nine of the thirteen RxJava questions are now should-know or good-to-know**,
which means a reader filtering to must-know no longer sees RxJava at all. That
is the correct result for 2026 and worth saying out loud, because it is a large
visible change to a topic that is a third of this file.
