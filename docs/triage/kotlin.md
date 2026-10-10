# Triage — Kotlin

**Pass:** 2026-08-17 · 66 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 61 | **20** |
| should-know | 3 | **39** |
| good-to-know | 2 | **7** |

Sixty-one of sixty-six. The worst distortion in the bank, and the diagnosis is
plain once you read the list: **roughly a third of this topic is a second copy of
the coroutines and Flow topics.** Both of those are must-know subjects with
their own files, so every duplicate here inherited must-know as well, and the
filter counted the same subject twice.

## The pass

Grouped by what the question is, because the topic is really four topics.

### Language — the part this file should own

| # | Question | Tier | Output | Words |
|---|---|---|---|---|
| 1 | `kotlin-const-advantage` | must → **should** | `[0]` **stdout** | — |
| 2 | `kotlin-lateinit` | must | `[0]` trace | — |
| 3 | `kotlin-inline-function` | must | `[0]` **stdout** | — |
| 4 | `kotlin-companion-object` | must | `[0]` **stdout** | — |
| 5 | `kotlin-extension-functions` | must | `[0]` **stdout** | — |
| 6 | `kotlin-data-classes` | must | `[0]` **stdout** | — |
| 7 | `kotlin-remove-duplicates` | must → **good** | `[0]` **stdout** | — |
| 8 | `kotlin-jvmstatic` | must → **should** | `[0]` trace | — |
| 9 | `kotlin-jvmfield` | must → **should** | — | — |
| 10 | `kotlin-jvmoverloads` | must → **should** | `[0]` trace | — |
| 11 | `kotlin-noinline` | must → **should** | `[0]` **stdout** | — |
| 12 | `kotlin-crossinline` | must → **should** | `[0]` **stdout** | — |
| 13 | `kotlin-scope-functions` | must | — | — |
| 14 | `kotlin-reified` | must | `[0]` **stdout** | — |
| 15 | `kotlin-lateinit-vs-lazy` | must | — | — |
| 16 | `kotlin-init-block` | must → **should** | `[0]` **stdout** | — |
| 17 | `kotlin-equality-operators` | must | `[0]` **stdout** | — |
| 18 | `kotlin-higher-order-functions` | must | `[0]` **stdout** | — |
| 19 | `kotlin-function-returning-function` | must → **should** | `[0]` **stdout** | — |
| 20 | `kotlin-lambdas` | must | `[0]` **stdout** | — |
| 21 | `kotlin-associateby` | must → **good** | `[0]` **stdout** | — |
| 22 | `kotlin-open-keyword` | must → **should** | `[0]` **stdout** | — |
| 23 | `kotlin-internal-modifier` | must → **should** | — | — |
| 24 | `kotlin-partition` | must → **good** | `[0]` **stdout** | — |
| 25 | `kotlin-infix-notation` | must → **good** | `[0]` **stdout** | — |
| 26 | `kotlin-multiplatform` | good | `[0]` trace | — |
| 30 | `kotlin-string-vs-stringbuffer-vs-stringbuilder` | should | `[0]` **stdout** | — |
| 31 | `kotlin-val-vs-var` | must | `[0]` **stdout** | — |
| 32 | `kotlin-lateinit-check-initialized` | must → **should** | `[0]` **stdout** | — |
| 33 | `kotlin-lazy-initialization` | must → **should** | `[0]` **stdout** | — |
| 34 | `kotlin-visibility-modifiers` | must | — | — |
| 35 | `kotlin-static-equivalent` | must → **should** | `[0]` **stdout** | — |
| 36 | `kotlin-singleton` | must | `[0]` **stdout** | — |
| 37 | `kotlin-open-vs-public` | must → **should** | — | — |
| 38 | `kotlin-apply-scope-function` | must → **should** | `[0]` **stdout** | — |
| 39 | `kotlin-let-scope-function` | must → **should** | `[0]` **stdout** | — |
| 40 | `kotlin-scope-functions-use-cases` | must → **should** | — | — |
| 41 | `kotlin-apply-vs-with` | must → **should** | `[0]` **stdout** | — |
| 42 | `kotlin-list-vs-array` | must → **should** | `[0]` **stdout** | — |
| 43 | `kotlin-labels` | should | `[0]` **stdout** | — |
| 50 | `kotlin-inline-classes` | good | `[0]` **stdout** | — |
| 51 | `kotlin-sealed-classes` | must | `[0]` **stdout** | — |
| 52 | `kotlin-sealed-classes-android-use-cases` | must → **should** | `[0]` trace | — |
| 53 | `kotlin-collections` | must | `[0]` **stdout** | — |
| 54 | `kotlin-elvis-operator` | must | `[0]` **stdout** | — |
| 63 | `kotlin-delegates` | should | `[0]` **stdout** | — |

### Coroutines — duplicated from `kotlin-coroutines`

| # | Question | Tier | Owned by |
|---|---|---|---|
| 27 | `kotlin-suspending-vs-blocking` | must | *(no duplicate — stays)* |
| 28 | `kotlin-runblocking` | must → **should** | `coroutines-runblocking` |
| 29 | `kotlin-structured-concurrency` | must → **should** | `coroutines-structured-concurrency` |
| 44 | `kotlin-coroutines-basics` | must → **should** | `coroutines-what-are-they` |
| 45 | `kotlin-coroutine-scope` | must → **should** | `coroutines-scope` |
| 46 | `kotlin-coroutine-scopes-android` | must → **should** | `coroutines-lifecycle-scopes` |
| 47 | `kotlin-coroutine-context` | must → **should** | `coroutines-context` |
| 48 | `kotlin-launch-vs-async` | must → **should** | `coroutines-launch-vs-async` |
| 49 | `kotlin-thread-sleep-vs-delay` | must | *(no duplicate — stays)* |
| 55 | `kotlin-coroutine-timeouts` | must → **should** | partly `coroutines-cancellation` |
| 56 | `kotlin-combine-coroutine-results` | must → **should** | `coroutines-parallel-network-calls` |
| 57 | `kotlin-coroutine-job` | must → **should** | `coroutines-job-vs-supervisorjob` |
| 58 | `kotlin-job-cancel-vs-scope-cancel` | must → **should** | partly `coroutines-cancellation` |
| 59 | `kotlin-async-exception-no-await` | must → **should** | partly `coroutines-exception-handling` |
| 60 | `kotlin-debounce-coroutines` | must → **should** | `flow-instant-search` |
| 61 | `kotlin-coroutines-series-parallel` | must → **should** | `coroutines-parallel-network-calls` |
| 62 | `kotlin-yield` | must → **good** | partly `coroutines-cancellation` |

### Flow — duplicated from `kotlin-flow-api`

| # | Question | Tier | Owned by |
|---|---|---|---|
| 64 | `kotlin-statein-vs-sharein` | must | *(no duplicate — stays)* |
| 65 | `kotlin-flatmap-operators` | must → **should** | `flow-common-operators` |
| 66 | `kotlin-collect-vs-collectlatest` | must → **should** | `flow-common-operators` |

## Why the tiers moved

**Duplication, mostly.** Seventeen coroutine questions and three Flow questions
live here as well as in the topics that own them. Three survive at must-know
because they have no counterpart: suspending versus blocking (27), `Thread.sleep`
versus `delay` (49) and `stateIn` versus `shareIn` (64). The rest are demoted
rather than deleted, because a reader browsing the Kotlin topic should still find
them — they just should not compete for the short list.

**The interop annotations (8, 9, 10) go to should-know.** `@JvmStatic`,
`@JvmField` and `@JvmOverloads` are three questions about one subject that only
comes up if the codebase has Java in it.

**`noinline` and `crossinline` (11, 12) go to should-know.** They are the
follow-up to `inline` (3, which stays must-know), not openers.

**The scope function block goes from five must-know to one.** Question 13 has the
table that answers all of them; 38, 39, 40 and 41 are that table asked four more
times.

**Six become good-to-know**: `remove-duplicates`, `associateBy`, `partition`,
`infix`, `yield` and inline classes. Standard-library how-tos and syntax corners.

## Output candidates — the largest in the bank

**Thirty-six snippets should print, and every one of them can.** This topic is
pure Kotlin with no framework, and the runner now has coroutines on the classpath
as well as the stdlib, so even the coroutine questions are runnable.

The ones where output does real work:

- **17 · `==` versus `===`** — identity against equality, settled in two lines.
- **6 · data classes** — printing a `copy()`, an auto-generated `toString()` and
  an `equals()` comparison shows what the compiler generated, which is the whole
  answer.
- **3, 11, 12 · inline, noinline, crossinline** — non-local return either
  compiles or does not; printing what runs and in what order is the only way to
  see the difference without reading bytecode.
- **31 · val versus var** and **54 · Elvis** — basic, and the first things a
  beginner wants to run.
- **36 · Singleton** — print `===` on two references to show one instance.
- **1 · const** — the compile-time inlining is invisible at runtime, so this one
  is a *bad* stdout candidate despite being runnable. Recorded so Phase 3 does
  not add output just because it can.

Phase 3 should take algorithms first (nothing to stub, biggest payoff per
snippet) and this topic second (largest volume, all of it verifiable).

## Image candidates

Two, both from the coroutines triage and both confirmed live:
`kotlinlang.org/docs/images/coroutines-and-threads.svg` for question 44, and
`parallelism-and-concurrency.svg` for question 27 (suspending versus blocking),
where the distinction is genuinely spatial.

Both carry the unresolved licensing question — kotlinlang.org is JetBrains, and
§3.5's attribution rule was written against Android's terms.

## Words

Nothing flagged, which is remarkable for the largest topic in the bank. The
Kotlin answers are short — the median here is well under the bank's 1223
characters — and the tables are used where tables belong.

The `synchronized`-is-inline claim in question 3, which prompted this entire
plan, was checked against the stdlib API reference during planning and is
correct. Recorded here so the Phase 4 pass does not re-open it.

## Notes

**The duplication is the real finding, and demotion is a workaround.** Twenty
questions in this file are second copies of questions that live in
`kotlin-coroutines` and `kotlin-flow-api`. Tiering them down stops them
crowding the short list, but the bank still holds two answers to "what is
structured concurrency" that can drift apart. Deciding which copy survives is a
content decision and outside this plan.

**Twenty must-know out of sixty-six** puts Kotlin in line with the rest of the
bank for the first time — down from ninety-two per cent.
