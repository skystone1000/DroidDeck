# Triage — Android

**Pass:** 2026-08-17 · 135 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 101 | **42** |
| should-know | 25 | **78** |
| good-to-know | 9 | **15** |

The largest topic and the largest cut: 62 questions changed tier. 101 of 135 was
the seed at its least useful — theory's platform track cites nearly every Android
question because nearly every Android question is *relevant* to it.

The 42 that stayed are the ones an interview opens with. They cluster: the two
lifecycles, the four component types, RecyclerView, the threading model,
ViewModel and LiveData, and the classic comparisons — `commit` against `apply`,
Serializable against Parcelable, `GONE` against `INVISIBLE`.

## The pass

`←` marks a tier this pass changed. Every snippet in this topic is Android
framework code, so the `output` column is `trace` throughout — see below.

**Base**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 1 | `android-app-lag` | must | — |
| 2 | `android-context` | must | trace |
| 3 | `android-zygote` | **should** ← | — |
| 4 | `android-application-components` | must | — |
| 5 | `android-project-structure` | **should** ← | — |
| 6 | `android-manifest` | **should** ← | trace |
| 7 | `android-application-class` | **should** ← | trace |

**Activity and Fragment**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 8 | `android-fragment-default-constructor` | should | trace |
| 9 | `android-activity-lifecycle` | must | — |
| 10 | `android-oncreate-vs-onstart` | must | — |
| 11 | `android-ondestroy-without-onpause-onstop` | **should** ← | trace |
| 12 | `android-setcontentview-in-oncreate` | **should** ← | — |
| 13 | `android-save-restore-instance-state` | must | trace |
| 14 | `android-fragment-lifecycle` | must | — |
| 15 | `android-bundle` | **should** ← | — |
| 16 | `android-launch-modes` | must | trace |
| 17 | `android-activity-vs-fragment` | should | — |
| 18 | `android-when-fragment-over-activity` | should | — |
| 19 | `android-fragmentpageradapter-vs-fragmentstatepageradapter` | should | — |
| 20 | `android-add-vs-replace-fragment` | should | trace |
| 21 | `android-fragment-communication` | should | trace |
| 22 | `android-retained-fragment` | should | — |
| 23 | `android-addtobackstack` | should | — |

**Views and ViewGroups**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 24 | `android-optimizing-layouts` | must | — |
| 25 | `android-view` | **should** ← | — |
| 26 | `android-gone-vs-invisible` | must | — |
| 27 | `android-custom-view` | **should** ← | trace |
| 28 | `android-viewgroups-vs-views` | **should** ← | — |
| 29 | `android-canvas` | good | — |
| 30 | `android-surfaceview` | good | — |
| 31 | `android-relative-vs-linear-layout` | **should** ← | — |
| 32 | `android-constraintlayout-optimization` | **should** ← | — |
| 33 | `android-view-tree-optimization` | **should** ← | trace |

**Displaying Lists of Content**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 34 | `android-listview-vs-recyclerview` | must | — |
| 35 | `android-recyclerview-how-it-works` | must | — |
| 36 | `android-recyclerview-optimization` | must | trace |
| 37 | `android-nested-recyclerview-optimization` | **should** ← | — |
| 38 | `android-recyclerview-performance-over-listview` | should | — |
| 39 | `android-recyclerview-components` | **should** ← | — |
| 40 | `android-adapter-viewholder-role` | **should** ← | trace |
| 41 | `android-layoutmanager` | **should** ← | — |
| 42 | `android-multiple-view-types` | **should** ← | trace |
| 43 | `android-diffutil` | must | trace |
| 44 | `android-sethasfixedsize` | **should** ← | — |
| 45 | `android-update-specific-item` | should | trace |
| 46 | `android-snaphelper` | good | trace |

**Dialogs and Toasts**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 47 | `android-dialog` | good | trace |
| 48 | `android-toast` | good | trace |
| 49 | `android-dialog-vs-dialogfragment` | good | trace |

**Intents and Broadcasting**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 50 | `android-intent` | must | — |
| 51 | `android-implicit-intent` | **should** ← | trace |
| 52 | `android-explicit-intent` | **should** ← | trace |
| 53 | `android-broadcast-receiver` | must | trace |
| 54 | `android-broadcasts-intents-messaging` | **should** ← | — |
| 55 | `android-pending-intent` | must | trace |
| 56 | `android-broadcast-types` | **should** ← | — |

**Services**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 57 | `android-service-lifecycle` | must | — |
| 58 | `android-service` | **should** ← | — |
| 59 | `android-service-thread` | must | trace |
| 60 | `android-service-vs-intentservice` | **should** ← | — |
| 61 | `android-foreground-service` | must | trace |
| 62 | `android-jobscheduler` | **should** ← | — |
| 63 | `android-workmanager-guarantee` | **should** ← | trace |

**Inter-process Communication**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 64 | `android-two-apps-interact` | should | — |
| 65 | `android-multiple-processes` | **should** ← | trace |
| 66 | `android-aidl` | should | trace |
| 67 | `android-background-processing` | must | — |
| 68 | `android-content-provider` | must | — |

**Long-running Operations**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 69 | `android-parallel-tasks-callback` | **should** ← | trace |
| 70 | `android-anr` | must | — |
| 71 | `android-threadpool-advantages` | should | trace |
| 72 | `android-daemon-vs-user-threads` | should | — |
| 73 | `android-handler-looper-handlerthread` | must | trace |
| 74 | `android-garbage-collection` | **should** ← | — |
| 75 | `android-memory-leak-vs-oom` | must | — |
| 76 | `android-runnable-vs-thread` | **should** ← | — |

**Working With Multimedia Content**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 77 | `android-bitmap-handling` | must | trace |
| 78 | `android-bitmap-pool` | **should** ← | — |

**Data Saving**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 79 | `android-datastore-preferences` | **should** ← | trace |
| 80 | `android-persisting-data` | must | — |
| 81 | `android-orm` | **should** ← | trace |
| 82 | `android-preserve-activity-rotation` | must | trace |
| 83 | `android-data-storage-options` | **good** ← | — |
| 84 | `android-scoped-storage` | should | trace |
| 85 | `android-encrypt-data` | should | trace |
| 86 | `android-commit-vs-apply` | must | trace |

**Look and Feel**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 87 | `android-spannable` | **should** ← | trace |
| 88 | `android-spannablestring` | **good** ← | — |
| 89 | `android-text-best-practices` | **should** ← | — |
| 90 | `android-dark-mode` | **should** ← | trace |

**Memory Optimizations**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 91 | `android-improve-performance` | should | — |
| 92 | `android-ontrimmemory` | **should** ← | trace |
| 93 | `android-fix-oom` | **should** ← | — |
| 94 | `android-find-memory-leaks` | must | trace |

**Battery Life Optimizations**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 95 | `android-adaptive-battery-ml` | **good** ← | — |
| 96 | `android-reduce-battery` | should | trace |
| 97 | `android-doze-app-standby` | **must** ← | — |
| 98 | `android-overdraw` | **should** ← | — |

**Supporting Different Screen Sizes**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 99 | `android-screen-resolutions` | **should** ← | — |

**Permissions**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 100 | `android-permission-levels` | must | trace |

**Native Programming**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 101 | `android-ndk` | **should** ← | trace |
| 102 | `android-renderscript` | **good** ← | — |

**Android System Internal**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 103 | `android-runtime` | **should** ← | — |
| 104 | `android-dalvik-art-jit-aot` | must | — |
| 105 | `android-dalvik-vs-art` | **should** ← | — |
| 106 | `android-baseline-profiles` | **should** ← | trace |
| 107 | `android-dex` | **should** ← | — |
| 108 | `android-multidex` | **should** ← | trace |
| 109 | `android-force-gc` | **should** ← | — |
| 110 | `android-app-starts` | must | — |

**Android Jetpack**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 111 | `android-jetpack-overview` | should | — |
| 112 | `android-viewmodel` | must | trace |
| 113 | `android-shared-viewmodel` | **should** ← | trace |
| 114 | `android-architecture-components` | **should** ← | — |
| 115 | `android-stateflow-vs-livedata` | must | — |
| 116 | `android-livedata` | must | — |
| 117 | `android-livedata-vs-observablefield` | should | — |
| 118 | `android-setvalue-vs-postvalue` | must | trace |
| 119 | `android-share-viewmodel-fragments` | **should** ← | — |
| 120 | `android-workmanager-explain` | must | trace |
| 121 | `android-workmanager-repeat-interval` | **good** ← | trace |
| 122 | `android-workmanager-guarantee-execution` | **should** ← | — |
| 123 | `android-viewmodel-internals` | must | — |

**Others**

| # | Question | Tier | Snippet |
|---|---|---|---|
| 124 | `android-serializable-vs-parcelable` | must | trace |
| 125 | `android-bundle-vs-map` | **should** ← | — |
| 126 | `android-troubleshoot-crash` | should | — |
| 127 | `android-push-notifications` | **should** ← | trace |
| 128 | `android-aapt` | **good** ← | — |
| 129 | `android-flatbuffers-vs-json` | should | — |
| 130 | `android-hashmap-arraymap-sparsearray` | must | trace |
| 131 | `android-sparsearray-advantages` | **should** ← | — |
| 132 | `android-annotations` | good | — |
| 133 | `android-custom-annotation` | good | trace |
| 134 | `android-support-library` | good | — |
| 135 | `android-data-binding` | should | trace |
## What drove the demotions

**Duplicate pairs.** Twelve of them, and each had both halves at must-know:
`android-service-lifecycle` with `android-service`; `android-persisting-data`
with `android-data-storage-options`; `android-spannable` with
`android-spannablestring`; `android-dalvik-art-jit-aot` with
`android-dalvik-vs-art`; `android-shared-viewmodel` with
`android-share-viewmodel-fragments`; `android-listview-vs-recyclerview` with
`android-recyclerview-performance-over-listview`;
`android-hashmap-arraymap-sparsearray` with `android-sparsearray-advantages`;
and `android-workmanager-guarantee` with `android-workmanager-guarantee-execution`
— which are the same question with the same title in two different subsections.

**Sub-questions of a question that stayed.** RecyclerView keeps four must-know
(what it is against ListView, how it works internally, how to optimise it,
DiffUtil) and loses six that are its parts: components, adapter and view holder,
layout manager, multiple view types, `setHasFixedSize`, nested optimisation.
Intents keep three and lose the implicit/explicit pair, which question 50 defines.
The system-internals run keeps two — the runtime comparison and cold/warm/hot
starts — and loses DEX, Multidex, Baseline Profiles, AAPT and forcing GC.

**Things nobody asks.** RenderScript is deprecated. Adaptive Battery's ML is
trivia. The minimum `PeriodicWorkRequest` interval is a number to look up. All
good-to-know now.

**One promotion:** `android-doze-app-standby`. Doze is the answer to "why didn't
my background work run", which is asked far more often than its should-know seed
suggested.

## Image candidates

The richest topic for figures, and the reason the plan exists. Confirmed live:

| For | Figure | Path under `developer.android.com` |
|---|---|---|
| 9 | Activity lifecycle state chart | `/guide/components/images/activity_lifecycle.png` |
| 13 | `onStop`/`onSaveInstanceState` ordering by API | `/static/images/guide/fragments/stop-save-order.png` |
| 14 | Fragment against view lifecycle | `/static/images/guide/fragments/fragment-view-lifecycle.png` |
| 16 | Back stack; `singleTask` bringing a stack forward | `/static/images/fundamentals/diagram_backstack.png`, `…_singletask_multiactivity.png` |
| 23 | Back stack over time | `/static/images/fundamentals/diagram_backstack.png` |
| 57 | Started against bound service paths | `/static/images/service_lifecycle.png` |
| 65 | Two tasks, foreground and background | `/static/images/fundamentals/diagram_multitasking.png` |
| 97 | Doze maintenance windows | `/static/images/training/doze.png` |
| 100 | Permission workflow; install-time against runtime | `/static/images/training/permissions/workflow-overview.svg`, `…/install-time.svg`, `…/runtime.svg` |
| 103 | Android software stack | `/static/guide/platform/images/android-stack_2x.png` |
| 123 | ViewModel lifetime across rotation | `/static/images/topic/libraries/architecture/viewmodel-lifecycle.png` |

Eleven questions, and **five of them carry no diagram at all today** — 13, 16,
23, 65 and 100 are prose about state and ordering, which is exactly where §3.5
says a figure earns its place. `android-launch-modes` is the clearest case in the
bank: four official back-stack diagrams against a paragraph.

The four that already have drawings (9, 14, 57, 103) are the replace-or-augment
decisions Phase 2 has to make at card width.

## Output candidates

**None.** Every one of the 58 snippets is Android framework code — Activities,
Fragments, adapters, services, manifests. None compiles without the Android SDK,
which the runner does not have and should not try to acquire.

All `trace`, and this topic is where the trace pane will be read most, because
the Android questions that get asked are overwhelmingly *ordering* questions:
which callback fires when, what survives rotation, what happens on process death.
A numbered "what happens, in order" is the native shape for almost everything
here.

## Words

Not flagged per-question, because at 135 questions the useful unit is the
pattern rather than the row:

- **The lifecycle answers (9, 10, 11, 13, 14) are the most-read in the bank and
  should be rewritten first** under §3.8, whatever else Phase 4 does.
- **Nothing failed on accuracy.** Spot-checking the claims that date fastest —
  Doze's maintenance windows, scoped storage's enforcement, `commit` against
  `apply`'s threading, WorkManager's guarantees — all hold.
- **Two answers state platform behaviour that has version-specific nuance** and
  should be verified in Phase 4 alongside the `SCHEDULE_EXACT_ALARM` claim
  already flagged in `other-topics`: `android-scoped-storage` (84) and
  `android-permission-levels` (100).

## Notes

**62 changed tiers is a lot of judgement to land in one pass**, and this file is
the record of it. If any single call looks wrong, the fix is one line in
`data/android.js` plus a line here — that is why the tier lives in the corpus and
the reasoning lives in triage.

**The bank now sits at 143 must-know across 465**, slightly under the plan's
150–180 target. Under is the right side to miss on: the target existed to stop
the tier meaning nothing, and 31% of the bank is a short list that a filter can
usefully produce.
