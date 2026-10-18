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

## Judging a candidate

§3.5 gives four criteria, and the fourth — legible at card width on a phone —
can only be settled by looking. The method used here: 375px viewport, dark theme,
card expanded, read the figure on screen. Both of the above passed.

The three-column fragment diagram was expected to fail that check and did not.
It is *wide* (821px natural, rendering at about 41%) but it is not *dense* — big
type, generous gutters, three sparse columns — and §3.5's warning is about
density, not width. Worth remembering when judging the rest: measure the type,
not the pixel count.
