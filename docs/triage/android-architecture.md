# Triage — Android Architecture

**Pass:** 2026-08-17 · 8 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 5 | **4** |
| should-know | 3 | **4** |
| good-to-know | 0 | 0 |

The smallest topic in the bank and the one the seed got closest to right. Four
of eight is the shape you want: describe your app, MVVM, the MVC/MVP/MVVM
evolution, and Clean.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `arch-describe-last-app` | must | — | — | — |
| 2 | `arch-mvvm` | must | **candidate** | `[0]` trace | — |
| 3 | `arch-mvc-mvp-mvvm` | must | — | — | — |
| 4 | `arch-clean` | must | **candidate** | `[0]` trace | — |
| 5 | `arch-mvi` | should | — | `[0]` trace | — |
| 6 | `arch-vs-design` | must → **should** | — | — | — |
| 7 | `arch-multi-module-benefits` | should | — | — | — |
| 8 | `arch-multi-module-when` | should | — | — | — |

## Why the tier moved

**6 · `arch-vs-design` → should-know.** A definitions question, and a
comparatively rare one. It is worth having — the architecture/design boundary is
a real thing candidates fumble — but nobody's two hours should go on it ahead of
MVVM.

## Image candidates

This is the topic Appendix C already found figures for, and they are the
strongest in the bank because Google's own architecture diagram is the canonical
picture of the thing:

| For | Figure | Source |
|---|---|---|
| 2 | Recommended app architecture | `/static/topic/libraries/architecture/images/mad-arch-overview.png` |
| 4 | UI layer and data layer detail | `…/mad-arch-overview-ui.png`, `…/mad-arch-overview-data.png` |

Both from [Guide to app architecture](https://developer.android.com/topic/architecture),
both confirmed 200.

Questions 2 and 4 each carry a drawn flowchart already — 3 nodes and 3 nodes.
Those are the weakest drawings in the bank relative to what they are competing
with, so this is where §3.5 is most likely to say replace rather than augment.

## Output candidates

Three snippets, all of them structural: a ViewModel, a use case, an MVI reducer.
None is a program, and none becomes one usefully — the point of each is shape,
not behaviour. All `trace`.

The MVI reducer (5) is the closest call. A pure `(State, Intent) -> State`
function is trivially runnable, and printing the state transitions would show
what "never partially updated, always replaced wholesale" actually means. Phase 3
should look at it again.

## Words

Nothing flagged. This topic reads better than the bank average, and the two
comparison questions (3, 6) are already tables, which is the right shape for
them. The Clean Architecture answer explains dependency inversion in three
sentences without hedging, which is the standard the rest of the bank should be
held to.

## Notes

**Question 1 is not a factual question**, and the audit does not really apply to
it — it is advice on how to answer a behavioural prompt. Recorded so a later
pass does not try to "verify" it against documentation.
