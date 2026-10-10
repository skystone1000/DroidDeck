# Triage — Android System Design

**Pass:** 2026-08-17 · 28 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 10 | **4** |
| should-know | 17 | **22** |
| good-to-know | 1 | **2** |

System design is a round, not a question — and it is a round most candidates
only face at senior level or at companies that run one. Four questions survive
at must-know, chosen because they are the ones that turn up *outside* a
dedicated system design round.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `design-image-loading-library` | must | — | `[0]` trace | simplify |
| 2 | `design-file-downloader-library` | should | — | `[0]` trace | — |
| 3 | `design-whatsapp` | must → **should** | — | — | simplify |
| 4 | `design-instagram-stories` | should | — | — | — |
| 5 | `design-networking-library` | must | — | `[0]` trace | — |
| 6 | `design-facebook-nearby-friends` | should | — | — | — |
| 7 | `design-caching-library` | must → **should** | — | `[0]` trace | — |
| 8 | `design-location-based-app` | should | — | — | — |
| 9 | `design-offline-first-app` | must | **candidate** | — | simplify |
| 10 | `design-lru-cache` | must | — | `[0]` **stdout** | — |
| 11 | `design-analytics-library` | should | — | — | — |
| 12 | `design-logging-library` | should | — | `[0]` trace | — |
| 13 | `http-request-long-polling-websocket-sse` | should | — | — | — |
| 14 | `voice-video-calls-architecture` | should | — | — | simplify |
| 15 | `data-syncing-unstable-networks` | must → **should** | — | — | — |
| 16 | `design-uber-app` | must → **should** | — | — | — |
| 17 | `where-is-my-train-without-internet` | must → **good** | — | — | — |
| 18 | `database-normalization-vs-denormalization` | should | — | — | — |
| 19 | `hash-vs-encrypt-vs-encode` | should | — | — | — |
| 20 | `webhook-vs-polling` | should | — | — | — |
| 21 | `real-time-updates-android` | should | — | — | — |
| 22 | `network-optimization-mobile` | must → **should** | — | — | — |
| 23 | `firebase-remote-config` | should | — | `[0]` trace | — |
| 24 | `accurate-time-android` | should | — | — | — |
| 25 | `query-optimization-sqlite` | should | — | `[0]` trace | — |
| 26 | `websocket-vs-socket-io` | should | — | `[0]` trace | — |
| 27 | `symmetric-vs-asymmetric-encryption` | should | — | — | — |
| 28 | `sms-retriever-api-android` | good | — | `[0]` trace | — |

## Why the tiers moved

**The four that stayed did so for a specific reason.** Image loading (1),
networking (5) and LRU cache (10) are the three that appear as *machine coding*
drills as well as design prompts — they are in the drill catalogue for exactly
that reason — so a candidate meets them whether or not there is a design round.
Offline-first (9) stayed because "how would you make this work offline" is asked
in ordinary Android interviews constantly, not just design ones.

**The product designs go to should-know:** WhatsApp (3) and Uber (16) are
big-tech design-round questions. Excellent preparation, and not what a
two-hour revision should open with.

**17 · Where Is My Train → good-to-know.** A puzzle about one specific app. It
is a genuinely interesting answer and it is the least generalisable question in
the topic.

**7, 15, 22 → should-know.** Caching (7) overlaps LRU cache (10), which stays.
Sync on unstable networks (15) and network optimisation (22) are senior-level
depth.

## Image candidates

One, and it is unusually good: the **offline-first data layer figures** for
question 9, from
[Build an offline-first app](https://developer.android.com/topic/architecture/data-layer/offline-first).
All confirmed 200:

- `/static/images/topic/architecture/data-layer/read-queue.png`
- `/static/images/topic/architecture/data-layer/write-backoff.png`
- `/static/images/topic/architecture/data-layer/data-layer.png`

These illustrate the read and write paths under failure — queued writes, backoff
retries — which is the part of offline-first that is hard to hold in your head
from prose. Question 9 has a six-node flowchart today showing the happy path
only.

Nothing for the product designs. Those answers are architecture-by-bullet-list,
and no official source illustrates someone else's app.

## Output candidates

**One**, and it is the best single candidate in the topic: **10 · LRU cache**.
Pure Kotlin, no dependencies, and printing the eviction order as keys are
touched is precisely the thing the prose can only assert. It is also a Tier 1
machine coding drill, so the same snippet earns its keep twice.

Everything else is either architecture with no runnable code, or needs Android,
Firebase or OkHttp. All `trace`.

## Words

**Four flagged for simplification, and they are the four longest answers in the
bank.** Question 1 is 2780 characters — the longest of all 465 — and questions
3, 9 and 14 are all over 1900. Every one has the same shape: requirements, then
components, then trade-offs, all as bullets, all at the same level of detail.

These need a different treatment from the rest of the plan's simplification
work. §3.8's rules assume an answer that is too dense; these are answers that
are too *long*, and the fix is structural — lead with the two or three decisions
that actually get discussed, and let the rest be the detail behind them. Phase 4
should treat this topic as its own problem rather than applying the standard
rules and hoping.

Nothing flagged for verification. The protocol comparisons (13, 19, 20, 27) are
accurate and the encryption one in particular is careful about the distinction
that usually gets fumbled.

## Notes

**This topic is why the tier filter exists.** Twenty-eight questions, most of
them long, almost none of them needed the night before a mid-level interview.
After this pass a must-know filter shows four, and all four are things that also
appear as machine coding drills — which is a coherent, defensible answer to
"what system design do I actually need".
