# Triage — Android Tools and Technologies

**Pass:** 2026-08-17 · 30 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 8 | **4** |
| should-know | 19 | **22** |
| good-to-know | 3 | **4** |

Tooling is the clearest case in the bank of a topic that is worth reading and
mostly not worth cramming. Four questions survive at must-know, and one of them
is a promotion.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `ci-cd-pipeline` | should | — | `[0]` trace | — |
| 2 | `adb` | should | — | — | — |
| 3 | `16-kb-page-size` | should | — | — | **verify** |
| 4 | `strictmode` | must → **should** | — | `[0]` trace | — |
| 5 | `lint` | should | — | — | — |
| 6 | `app-release-checklist` | should | — | — | — |
| 7 | `git-android-development` | good | — | — | — |
| 8 | `firebase` | should | — | `[0]` trace | simplify |
| 9 | `measure-method-execution-time` | should | — | `[0]` trace | — |
| 10 | `sqlite-database-debugging` | good | — | — | — |
| 11 | `proguard-things-to-care` | must → **should** | — | `[0]` trace | — |
| 12 | `android-studio-memory-profiler` | should | — | — | — |
| 13 | `kotlin-dsl-gradle` | should | — | `[0]` trace | — |
| 14 | `implementation-vs-api-gradle` | should → **must** | — | — | — |
| 15 | `gradle` | should | — | — | — |
| 16 | `gradle-related-files` | should | — | — | — |
| 17 | `custom-gradle-task` | should | — | `[0]` trace | — |
| 18 | `annotation-processor-kapt-ksp` | should | — | `[0]` trace | — |
| 19 | `build-variants` | should | — | `[0]` trace | — |
| 20 | `desugaring` | must → **should** | — | `[0]` trace | — |
| 21 | `reduce-apk-size` | must | — | — | — |
| 22 | `speed-up-gradle-build` | should | — | `[0]` trace | — |
| 23 | `gradle-build-system-explained` | should | **candidate** | — | — |
| 24 | `multiple-apks` | should → **good** | — | — | — |
| 25 | `proguard-usage` | must | — | — | — |
| 26 | `proguard-rules-pro-file` | must → **should** | — | `[0]` trace | — |
| 27 | `proguard-vs-r8` | must → **should** | — | — | — |
| 28 | `obfuscation-minification` | must | — | — | — |
| 29 | `change-app-params-without-update` | should | — | — | — |
| 30 | `write-ahead-logging` | good | — | — | — |

## Why the tiers moved

**14 · `implementation` vs `api` → must-know.** The promotion, and an easy one.
This is the Gradle question that gets asked, it has a crisp correct answer, and
getting it wrong in a multi-module project leaks your whole dependency graph
onto every downstream module's compile classpath.

**The ProGuard block (11, 25, 26, 27, 28) goes from five must-know to two.**
"What is ProGuard for" (25) and "obfuscation versus minification" (28) are the
asked pair. The rules file (26) is a reference, R8 versus ProGuard (27) is a
footnote to 25 now that R8 is the only shrinker AGP invokes, and 11 is a list of
gotchas you look up when you hit one.

**4 · StrictMode → should-know** and **20 · desugaring → should-know.** Both are
things a good Android developer uses and few interviewers ask about. Desugaring
in particular is build configuration you set once and forget.

**24 · `multiple-apks` → good-to-know.** Superseded by App Bundles, and the
answer says so in the past tense.

## Image candidates

One, and it needs a licence check before anything else: **Gradle's build
lifecycle diagram** at `docs.gradle.org`, for question 23. Gradle's
documentation is not Google's, so §3.5's attribution rule — written against
Android's Creative Commons terms — does not obviously cover it. Same open
question as the Kotlin figures flagged in the coroutines triage.

Question 23 already has a three-node flowchart of initialisation → configuration
→ execution, which is the whole content of the official diagram, so this may not
be worth the licensing work.

Nothing else. Gradle, ADB, Lint and R8 are documented in prose and command
output.

## Output candidates

**None.** Every snippet is Gradle Kotlin DSL, XML, a ProGuard rules file, or
Android API usage. None is a Kotlin program, and three of them are not Kotlin at
all — `run-snippets.js` is Kotlin-only, so `stdout` is not merely unwise here but
impossible.

This topic is where the `trace` pane will do its most useful work. "What happens,
in order" is exactly the right shape for a build: Gradle reads settings, then
configures the task graph, then executes only what is out of date. There is no
console output that teaches that; the ordering is the lesson.

## Words

**3 · verify.** The 16 KB page size answer states a platform requirement whose
deadline and scope have moved more than once. Anything with a compliance date
attached needs sourcing against the current developer.android.com page rather
than a remembered figure.

**8 · simplify.** The `firebase` answer is the second-longest in the bank at
roughly 2500 characters, and it is a product catalogue — a list of a dozen
services with a sentence each. It should either become a short answer about what
Firebase *is* plus the three services Android interviews actually mention
(Crashlytics, Remote Config, FCM), or be accepted as a reference entry and left
alone. Phase 4 should decide which, because trimming it by a third would leave
it neither.

## Notes

**A reader filtering to must-know now sees four questions here**: `implementation`
versus `api`, reducing APK size, what ProGuard does, and obfuscation versus
minification. That is a defensible answer to "what tooling do I need before an
interview", and it is a dramatic reduction from thirty — which is the point of
the tier existing.
