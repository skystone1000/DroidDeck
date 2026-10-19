# Vendored documentation figures

Every image in this directory was **downloaded and committed**, not hotlinked.
Plan [§3.5](../../docs/plans/2026-08-17-answer-quality.md). Hotlinking would
break `file://` use, which `ARCHITECTURE.md` names as a supported deployment,
and would make the page depend on a URL Google has already moved once.

Vendoring a figure means redistributing someone else's work, so this file is the
record that makes that legitimate: for each file, where it came from, when it was
fetched, and under what licence. **A figure with no row here should not be in the
app.** The validator enforces the app-side half of the same rule — an entry in a
question's `images[]` without `sourceUrl` and `sourceTitle` fails.

## Licences, checked 2026-10-18

The rule in §3.5 was written against Android's terms. Three other sources came up
during triage, and they are not the same, so each was checked before anything was
fetched.

| Source | Licence | Vendorable |
|---|---|---|
| `developer.android.com` | Site content **CC BY 2.5**; documentation and samples **Apache 2.0** | **Yes**, with attribution |
| `firebase.google.com` | **CC BY 4.0**, stated in the footer of each page | **Yes**, with attribution |
| `kotlinlang.org` | **Apache 2.0** — one root `LICENSE` in `JetBrains/kotlin-web-site`, and `docs/images/` sits under it | **Yes**, with attribution |
| `docs.gradle.org` | **CC BY-NC-SA 4.0** | **No** |

Google's wording, from [developer.android.com/license](https://developer.android.com/license):

> All other content on this site, except the license documents themselves and as
> otherwise noted, is licensed under the Creative Commons Attribution 2.5
> license.

Gradle's, from [docs.gradle.org/current/userguide/licenses.html](https://docs.gradle.org/current/userguide/licenses.html):

> Gradle's User Manual and DSL Reference Manual are licensed under Creative
> Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

**Gradle is excluded on both clauses.** *NonCommercial* is a restriction this
repository cannot warrant it will keep — nobody controls how a static site gets
redeployed — and *ShareAlike* would reach the page the figure is embedded in.
Neither is a licence question that gets easier by being deferred, so the one
Gradle candidate (the build lifecycle diagram, for `gradle-build-lifecycle`) is
dropped. Its question already carries a three-node flowchart of initialisation,
configuration and execution, which is the whole content of the official figure,
so nothing is lost.

## Attribution, as rendered

Every figure renders with a visible caption and a link back to the page it came
from. That is a condition of CC BY, not a courtesy. The figures are shown
**unmodified** — not recoloured for the dark theme, not cropped — because editing
a diagram while keeping the attribution misrepresents the source. Dark theme puts
a white plate behind them instead.

## The files

| File | Question | Source page | Fetched | Licence |
|---|---|---|---|---|
| `activity-lifecycle.png` | `android/android-activity-lifecycle` | [The activity lifecycle](https://developer.android.com/guide/components/activities/activity-lifecycle) | 2026-10-18 | CC BY 2.5 |
| `fragment-view-lifecycle.png` | `android/android-fragment-lifecycle` | [Fragment lifecycle](https://developer.android.com/guide/fragments/lifecycle) | 2026-10-18 | CC BY 2.5 |
| `stop-save-order.png` | `android/android-save-restore-instance-state` | [Fragment lifecycle](https://developer.android.com/guide/fragments/lifecycle) | 2026-10-18 | CC BY 2.5 |
| `back-stack.png` | `android/android-addtobackstack` | [Tasks and the back stack](https://developer.android.com/guide/components/activities/tasks-and-back-stack) | 2026-10-18 | CC BY 2.5 |
| `back-stack-singletask.png` | `android/android-launch-modes` | [Tasks and the back stack](https://developer.android.com/guide/components/activities/tasks-and-back-stack) | 2026-10-18 | CC BY 2.5 |
| `multitasking.png` | `android/android-multiple-processes` | [Tasks and the back stack](https://developer.android.com/guide/components/activities/tasks-and-back-stack) | 2026-10-18 | CC BY 2.5 |
| `service-lifecycle.png` | `android/android-service-lifecycle` | [Services overview](https://developer.android.com/develop/background-work/services) | 2026-10-18 | CC BY 2.5 |
| `android-stack.png` | `android/android-runtime` | [Platform architecture](https://developer.android.com/guide/platform) | 2026-10-18 | CC BY 2.5 |
| `viewmodel-lifecycle.png` | `android/android-viewmodel-internals` | [ViewModel overview](https://developer.android.com/topic/libraries/architecture/viewmodel) | 2026-10-18 | CC BY 2.5 |
| `mad-arch-overview-ui.png` | `android-architecture/arch-clean` | [UI layer](https://developer.android.com/topic/architecture/ui-layer) | 2026-10-19 | CC BY 2.5 |
| `mad-arch-overview-data.png` | `android-architecture/arch-clean`, `design-pattern/design-pattern-repository` | [Data layer](https://developer.android.com/topic/architecture/data-layer) | 2026-10-19 | CC BY 2.5 |
| `offline-data-layer.png` | `android-system-design/design-offline-first-app` | [Build an offline-first app](https://developer.android.com/topic/architecture/data-layer/offline-first) | 2026-10-19 | CC BY 2.5 |
| `compose-lifecycle-composition.png` | `jetpack-compose/compose-lifecycle` | [Lifecycle of composables](https://developer.android.com/develop/ui/compose/lifecycle) | 2026-10-19 | CC BY 2.5 |
| `coroutines-and-threads.svg` | `kotlin-coroutines/coroutines-what-are-they`, `kotlin/kotlin-coroutines-basics` | [Coroutine basics](https://kotlinlang.org/docs/coroutines-basics.html) | 2026-10-19 | Apache 2.0 |
| `parallelism-and-concurrency.svg` | `kotlin-coroutines/coroutines-parallel-network-calls`, `kotlin/kotlin-suspending-vs-blocking` | [Coroutine basics](https://kotlinlang.org/docs/coroutines-basics.html) | 2026-10-19 | Apache 2.0 |

**15 files, 18 placements.** Two figures serve two questions each — the same
picture answers "what is the repository pattern" and "what does clean
architecture look like", and there is no reason to vendor it twice.

## Judging a candidate

§3.5 gives four criteria, and the fourth — legible at card width on a phone —
can only be settled by looking. The method: 375px viewport, card expanded, read
the figure on screen. Rendered scale is the useful number, and it is *content*
width over natural width — the box is 20px wider than the image because of the
plate's padding.

**Density, not pixel count.** Two results make the point, and both went against
the guess:

- The **fragment view-lifecycle** diagram is three columns and 821px wide, which
  is exactly what §3.5 warns about. It renders at 36% and passes easily, because
  it is wide and *sparse* — big type, generous gutters.
- The **platform stack** is 1384×2038 and renders at 21%. Every layer title
  reads, and so do most leaf boxes, for the same reason.
- The two **architecture layer** figures render at **16%**, the smallest of
  anything kept, and are the most legible figures in the set. Their type is
  enormous relative to the canvas.

Meanwhile `doze.png` at 14% is unreadable. Two percentage points apart, opposite
verdicts — which is the whole argument for looking rather than measuring.

**Two rejections.** Both were fetched, rendered, judged and deleted — a
candidate that does not clear the bar is not vendored, so neither file is in
this directory.

- **`doze.png`** (1839×740, rendering at **14%**). Its labels — "screen off
  stationary on battery", "maintenance window" — are not readable at that size,
  and it fails §3.5's second criterion as well: `android-doze-app-standby`
  already carries a drawn six-step flowchart that is legible, theme-aware and
  says the same thing. The only thing the official figure adds is the *rhythm*
  of widening maintenance windows, which is not worth an unreadable figure.
- **`permissions-workflow.svg`** (2066×894). Being vector, it stays sharp at any
  size, and it is still too small to read at card width — sharp and 5px is
  unreadable in the same way blurry and 5px is. It also fails the *first*
  criterion, which is the more interesting reason: it is a six-node flowchart
  with yes/no branches, and §3.5 says in as many words that "a four-node
  pipeline is a flowchart and should stay one". State machines, layered stacks
  and timelines earn a figure; decision trees do not.

**Seven more rejections, and the reason is the same one twice over.** Of the
thirteen candidates triage listed for architecture, Compose, Flow and Firebase,
six went out on criterion 1 or 2 and one on all three:

| Rejected | Why |
|---|---|
| `mad-arch-overview.png` | Three boxes — UI, Domain, Data. The question's own three-node flowchart says exactly that, so it is not *materially* better (criterion 2). Its two expanded halves were kept instead, because those show nesting the flowchart cannot. |
| `compose-phases.png` | A five-node linear pipeline: Data → Composition → Layout → Drawing → UI. Criterion 1 excludes it by name. |
| `compose-unidirectional-flow.png` | Two boxes and two arrows, against a two-node drawn flowchart. Criterion 2. |
| `flow-entities.png` | Producer → Intermediary → Consumer, which is what the drawn flowchart already shows, and the drawn one is theme-aware. Criterion 2. |
| `offline-read-queue.png` | A five-step linear flowchart. Criterion 1. |
| `offline-write-backoff.png` | A flowchart with a "Should retry?" decision node. Criterion 1. Its sibling `offline-data-layer.png` was kept: that one shows *structure*, a repository owning two sources, which is not a flowchart at all. |
| `fcm-architecture.png` | 1920×1080 rendering at 15%, so unreadable; a four-stage pipeline, so criterion 1; and the question already has a theme-aware `sequence` diagram, so criterion 2. Triage predicted this one would lose, and it did. |

The pattern is worth naming for whoever works the next batch. **Triage recorded
candidates by subject, not by shape**, exactly as §3.9 said it would — it flags,
Phase 2 decides. A large share of what a documentation site publishes is
flowcharts, and §3.5 rules those out on purpose, so expect roughly half a
candidate list to fail on criterion 1 alone before legibility is even
considered.
