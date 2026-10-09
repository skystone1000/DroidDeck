# Triage — Other Topics

**Pass:** 2026-08-17 · 17 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 7 | **3** |
| should-know | 8 | **11** |
| good-to-know | 2 | **3** |

The biggest proportional cut so far, and the least surprising. This is the
bank's overflow drawer — the questions that did not belong to another topic —
so almost nothing in it is what an interview opens with.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `describe-sqlite` | should | — | — | — |
| 2 | `have-you-used-room` | must | — | `[0]` trace | — |
| 3 | `identify-users-uninstalled-app` | good | — | — | — |
| 4 | `android-development-best-practices` | should | — | — | — |
| 5 | `react-native-vs-flutter` | should → **good** | — | — | — |
| 6 | `app-performance-metrics` | must → **should** | — | — | — |
| 7 | `avoid-api-keys-in-vcs` | should | — | `[0]` trace | — |
| 8 | `kotlin-multiplatform` | should | — | — | — |
| 9 | `memory-heap-dumps` | must → **should** | — | — | — |
| 10 | `implement-dark-theme` | must → **should** | — | `[0]` trace | — |
| 11 | `secure-api-keys-android` | should | — | — | — |
| 12 | `cleartext-traffic` | should | — | `[0]` trace | — |
| 13 | `memory-usage-android` | must | — | — | — |
| 14 | `annotation-processing` | good | — | — | **verify** |
| 15 | `android-push-notification-system` | should → **must** | **candidate** | — | — |
| 16 | `fcm-push-notification-flow` | must → **should** | — | `[0]` trace | — |
| 17 | `local-notification-exact-time` | must → **should** | — | `[0]` trace | **verify** |

## Why each tier moved

**5 · React Native vs Flutter → good-to-know.** A good answer, and almost never
asked in an Android-specific interview. It belongs where it is, at the bottom.

**6 · `app-performance-metrics` → should-know** and **9 · `memory-heap-dumps` →
should-know.** Both are senior-level and tool-shaped. Question 13 carries the
part that actually gets asked — what leaks, and why.

**10 · `implement-dark-theme` → should-know.** Practical and worth knowing, but
"how would you implement dark mode" is a task, not a screening question.

**15 · push notification system → must-know** and **16 · FCM flow →
should-know.** These two are the same question at different zoom levels, and 15
is the better one: it is the conceptual flow, it carries the sequence diagram,
and it is the version an interviewer asks. Swapping their tiers rather than
demoting both keeps the subject represented without counting it twice.

**17 · `local-notification-exact-time` → should-know.** A specific how-to, and
one whose answer is mostly a list of platform restrictions.

## Image candidates

One: **`firebase.google.com/docs/cloud-messaging/fcm-architecture`** for question
15 — the FCM architectural overview, already confirmed live while repairing that
question's reference link. It is a genuine four-actor flow diagram and question
15 is exactly about that flow.

Question 15 already has a `sequence` diagram of its own, so Phase 2 decides
between them. The drawn one is theme-aware and shows the same four actors, so
this may be one where the official figure loses.

## Output candidates

Six snippets, all Android: a Room DAO, a Gradle secrets read, a Compose theme, a
network security config in XML, an FCM service, an AlarmManager call. None is a
program. All `trace`.

Question 12's snippet is XML, which `run-snippets.js` cannot execute at all —
worth remembering that the runner is Kotlin-only, so `stdout` is not merely
unwise there but impossible.

## Words

**14 · verify.** "KSP … significantly faster (commonly 2x)" than kapt. A
specific number attached to a benchmark that is not cited. Either source it or
drop the figure and keep the direction.

**17 · verify.** "Since Android 12 (API 31), scheduling exact alarms requires the
`SCHEDULE_EXACT_ALARM` permission." True but incomplete as stated — the rules
changed again for apps targeting Android 13, where `SCHEDULE_EXACT_ALARM` is no
longer pre-granted and `USE_EXACT_ALARM` exists for alarm-clock-style apps. A
reader following this today could ship something that silently does not fire.
The most consequential thing found in this topic.

Nothing flagged for simplification. The answers here are shorter than the bank
average, which is what an overflow drawer produces.

## Notes

**15 and 16 are one question split in two**, and 11 and 7 are close as well
("how to secure API keys" against "how to avoid checking API keys into VCS").
The tiering now reflects which half is the real question, but merging would be
the honest fix. Outside this plan's scope.

**Question 8 (`kotlin-multiplatform`) is the id that also exists in the `kotlin`
topic** — the one known cross-topic collision, which the validator asserts is the
only one. Both copies survive this pass; whether the bank wants two is a content
question, not a triage one.
