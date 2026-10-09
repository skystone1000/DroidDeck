# Triage — Design Patterns

**Pass:** 2026-08-17 · 15 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 2 | **5** |
| should-know | 13 | **7** |
| good-to-know | 0 | **3** |

The first topic where the seed was too *low*. Theory covers design patterns in
one should-know chapter, so almost everything inherited should-know — but
Singleton, Observer and "which patterns does Android use" are asked in
first-round interviews constantly.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `design-pattern-builder` | should | — | `[0]` **stdout** | — |
| 2 | `design-pattern-singleton` | should → **must** | — | `[0]` **stdout** | — |
| 3 | `design-pattern-factory` | should | — | `[0]` **stdout** | — |
| 4 | `design-pattern-observer` | should → **must** | — | `[0]` **stdout** | — |
| 5 | `design-pattern-repository` | must | **candidate** | `[0]` trace | — |
| 6 | `design-pattern-adapter` | should | — | `[0]` trace | — |
| 7 | `design-pattern-facade` | should | — | — | — |
| 8 | `design-pattern-dependency-injection` | must | — | `[0]` trace | — |
| 9 | `design-pattern-strategy` | should | — | `[0]` **stdout** | — |
| 10 | `design-pattern-android-common` | should → **must** | — | — | — |
| 11 | `design-pattern-kotlin-optional-vs-builder` | should | — | `[0]` **stdout** | — |
| 12 | `design-pattern-observer-android-examples` | should → **good** | — | — | — |
| 13 | `design-pattern-retrofit` | should | — | — | — |
| 14 | `design-pattern-glide` | should → **good** | — | — | — |
| 15 | `design-pattern-aosp` | should → **good** | — | — | — |

## Why each tier moved

**2 · Singleton → must-know.** Asked in almost every round, and the Kotlin
answer is distinctive enough to be a real discriminator: `object` gives you a
thread-safe lazy singleton with no double-checked locking, and the follow-up is
always "so why is it bad for testing".

**4 · Observer → must-know.** LiveData and Flow *are* this pattern, so the
question doubles as a check on whether you understand what you use every day.

**10 · "What patterns are used in Android" → must-know.** A standard opener for
the whole subject, and the answer is a table pairing each pattern with a real
framework class — which is exactly what interviewers are listening for.

**12 · `design-pattern-observer-android-examples` → good-to-know.** It is
question 4's "where you see it in Android" section as a separate question. Near
duplicate.

**14 · Glide** and **15 · AOSP → good-to-know.** Library and platform
archaeology. Interesting, occasionally impressive, never the thing that decides
an interview. Retrofit (13) stays should-know because Retrofit comes up on its
own merits far more often than Glide does.

## Output candidates

Six snippets should print, and this is the second topic after algorithms where
that is broadly true — GoF patterns in Kotlin are plain objects and interfaces
with no Android in sight.

The strongest are the two behavioural ones:

- **4 · Observer** — register two observers, change the subject once, and watch
  both fire. "Notifies them of state changes" is a sentence; two lines of output
  in order is a demonstration.
- **9 · Strategy** — the same input through two strategies, printing two
  different results, is the entire pattern.

**1 · Builder**, **2 · Singleton**, **3 · Factory** and **11 · optional
parameters against Builder** are all equally runnable. Singleton is worth
printing identity (`===`) to show one instance is genuinely being reused.

Repository (5), DI (8) and Adapter (6) are structural — the point is the shape
of the dependency, not what happens at runtime — so they stay `trace`.

## Image candidates

One: **`…/mad-arch-overview-data.png`** for question 5, the data-layer half of
Google's architecture diagram, which is a picture of the repository pattern in
its Android form. Already confirmed live in Appendix C.

Nothing else. GoF patterns are not documented by Google or JetBrains, and the
usual sources are not licensed the way §3.5 requires. Questions 1–4 and 6–15
keep their prose.

## Words

Nothing flagged. The answers are short, each pattern is paired with a concrete
Android class rather than a toy `Shape`/`Circle` example, and the two comparison
questions are already tables.

Question 13's claim that `retrofit.create` uses Java's dynamic proxy is correct
and is the kind of specific, checkable detail the rest of the bank should aim
for.

## Notes

**Question 12 should probably be folded into question 4**, and 14 into 13 —
"which patterns does Glide use" and "which patterns does Retrofit use" are one
question asked twice. Merging is outside this plan's scope; recorded because
demoting them to good-to-know is a workaround for a duplication problem rather
than a fix.
