# Plan — Machine Coding Drills

**Status:** built — Phases 0–4 complete, 4 modules, 14 chapters, 24 drills
**Date:** 2026-08-15
**Scope:** the "build it now, while I watch" round — a ranked catalogue of what
interviewers actually ask candidates to implement, a memorised skeleton to
implement it with, and a drill ladder for getting there. Ships as four modules
at the end of the Interview Synthesis track.

---

## 1. Why

DroidDeck now teaches the subject (46 theory modules) and tests recall (465
questions). Both are answered *in words*. The round that fails candidates who
can answer everything in words is the one where an interviewer shares a link and
says: *fetch this endpoint, show it in a list, you have fifty minutes.*

That round is not testing knowledge. It is testing whether the knowledge has
been compiled down into muscle — whether a `UiState` sealed interface, a
`stateIn`, a `LazyColumn` and an error branch can leave your fingers without a
single lookup, under observation, on a clock.

Nothing in the app prepares for that. `#theory/system-design` teaches designing
without building; `#theory/algorithms` teaches building without Android. The gap
between them is where the machine coding round lives, and it is the round most
Indian and remote-first Android loops now lead with.

## 2. What the round actually is

Researched against practitioner write-ups rather than question-bank listicles;
sources in Appendix B. The consistent picture:

| Property | Finding |
|---|---|
| Duration | 45–60 minutes live with screen share; 1–7 days if it is a take-home |
| Deliverable | one or two screens, running, from an empty project or a starter |
| Format A | **build from scratch** — API → list, with loading and error states |
| Format B | **extend an existing codebase** — add a feature to code handed to you |
| Format C | **review / debug** — find the bug, name the smell, propose the fix |
| Marked on | structure, edge cases, and *communication of decisions* |
| Not marked on | unit tests (live), pixel polish, exhaustive DI wiring |

Three details change how you prepare, and all three are non-obvious:

**The clock is spent before you notice.** A Gradle sync on an unfamiliar machine,
a Hilt setup, and a theme fiddle is thirty minutes, and thirty minutes is the
whole round. Every hour of preparation should reduce fixed setup cost, not add
capability.

**Some rounds forbid dependencies.** A shared sandbox with no network means no
Retrofit, no Coil, no Moshi. The fallback — `HttpURLConnection`, `org.json`, a
hand-rolled dispatcher hop — has to be drilled separately, because a candidate
fluent only in Retrofit is mute without it.

**Unfinished but explained beats finished and silent.** The evaluation criteria
are about structure and articulated decisions. Announcing "I'm faking the API
for now so the state machine is visible; swapping in Retrofit is one file" scores
better than silently spending twenty minutes on real networking.

## 3. The catalogue — what is asked, ranked

Ranked by how often the sources and practitioner reports put each task in a live
round. **Tier 1 is near-certain**: an Android machine coding round that is not
one of these five is unusual.

### Tier 1 — the core loop (expect one of these)

| # | Task | What it really tests | Box |
|---|---|---|---|
| 1 | Fetch an endpoint, render a list, handle loading / error / empty | the whole vertical slice; state modelling | 45m |
| 2 | Instant search over that API, debounced | `debounce`, `distinctUntilChanged`, `flatMapLatest`, cancellation of the stale call | 40m |
| 3 | Infinite scroll / pagination | end-of-list detection, page state, duplicate-request guarding | 40m |
| 4 | List → detail navigation, surviving rotation | `SavedStateHandle`, argument passing, no state in the composable | 30m |
| 5 | Offline-first: cache the list, serve it first, refresh behind it | Room as single source of truth, the network-bound-resource shape | 50m |

Tasks 1–3 compose: a very common single prompt is *"search this API, paginate the
results, handle errors"*, which is 1 + 2 + 3 in one sitting.

### Tier 2 — the feature-flavoured screens

| # | Task | What it really tests | Box |
|---|---|---|---|
| 6 | Shopping cart — add, remove, quantity, live total | immutable state updates, derived values, no total stored twice | 35m |
| 7 | Form with cross-field validation and a gated submit button | per-field error state, when to validate, `derivedStateOf` | 30m |
| 8 | Countdown timer / stopwatch with start, pause, reset | a ticking coroutine tied to the right scope; rotation | 30m |
| 9 | Multi-step quiz or survey with a score at the end | an explicit state machine, back handling | 35m |
| 10 | Notes / todo CRUD persisted locally | Room end to end, or DataStore if told "no database" | 40m |
| 11 | Images in a list, with placeholder and error | Coil, or a hand-rolled loader if dependencies are barred (see #18) | 25m |
| 12 | Filter and sort chips over a loaded list | keeping source and view state separate; not refetching to filter | 25m |

### Tier 3 — the utility drills ("implement this class")

Asked when the interviewer wants the mechanism, not the screen. Often the whole
round for a senior candidate, and often on a shared editor with no Android at
all.

| # | Task | What it really tests | Box |
|---|---|---|---|
| 13 | LRU cache with O(1) get and put | hash map + doubly linked list, or `LinkedHashMap(accessOrder = true)` | 25m |
| 14 | `debounce` by hand, without the Flow operator | cancel-the-pending-job pattern; why a delay is not enough | 20m |
| 15 | Retry with exponential backoff and jitter | `retryWhen`, attempt counting, which exceptions are retryable | 20m |
| 16 | A custom Flow operator | `flow {}` + `collect`, operator fusion, upstream cancellation | 20m |
| 17 | Thread-safe rate limiter / semaphore-bounded worker pool | `Mutex`, `Semaphore`, `limitedParallelism` | 25m |
| 18 | An image loader with memory + disk cache | `LruCache` sized to heap/8, keying, cancellation on view recycle | 40m |
| 19 | A `Result`/`Either` wrapper and error mapping | sealed hierarchies, not leaking `Throwable` to the UI layer | 15m |
| 20 | A tiny EventBus / observable / DI container | listener lifecycle, leak avoidance, `SharedFlow` as the modern answer | 25m |

### Tier 4 — the other two formats

| # | Task | What it really tests | Box |
|---|---|---|---|
| 21 | Find and fix the leak in this Activity | context capture, listener removal, static holders | 20m |
| 22 | Refactor this God Activity into MVVM | boundary-drawing under time pressure | 40m |
| 23 | Add the missing test to this ViewModel | `runTest`, `TestDispatcher`, turbine-less Flow assertion | 25m |
| 24 | Review this diff | naming a smell precisely and proposing the smallest fix | 20m |

**On what is *not* here.** No LeetCode. When an Android loop wants algorithms it
asks them in a separate round, already covered by `#theory/algorithms`; mixing
the two into the machine coding module would blur what each round rewards.

## 4. What is actually being marked

The rubric drills are scored against — ten lines, applied identically to every
drill in the section:

1. It runs. A screen that compiles and shows something beats a richer design that
   does not.
2. There is one state type, and the UI is a `when` over it.
3. Loading, error and empty are all handled — the single commonest omission.
4. The wrong thread is never touched, and cancellation is not leaked.
5. Rotation does not lose the screen.
6. Data access sits behind a repository interface, even if the implementation is
   a hardcoded list.
7. The ViewModel has no Android imports.
8. Names are boring and correct.
9. Something is left seam-shaped for a test, even if no test is written.
10. Every decision above was said out loud when it was made.

The tenth is the one candidates skip and interviewers weight.

## 5. The spine

The section's central asset is one memorised vertical slice — six files, roughly
120 lines, typed from blank in under ten minutes:

```
Item.kt            data class, nothing clever
ItemApi.kt         interface with one suspend fun, plus a Fake that returns a list after a delay
ItemRepository.kt  interface + impl; maps transport errors to domain errors
UiState.kt         sealed interface: Loading | Empty | Content(items) | Error(message, retry)
ItemViewModel.kt   StateFlow<UiState>, load(), retry(), viewModelScope
ItemScreen.kt      collectAsStateWithLifecycle, when(state), LazyColumn with a key
```

Every Tier 1 and Tier 2 drill is this spine plus one delta: search adds a query
`MutableStateFlow` and a `flatMapLatest`; pagination adds a page counter and an
append; the cart adds a reducer over a map. Teaching the spine once and the
deltas separately is the entire pedagogical bet of this section — it is why the
drills are a catalogue of *diffs*, not twenty unrelated apps.

The spine ships twice: once with dependencies, once in **bare mode**
(`HttpURLConnection`, `org.json`, `Dispatchers.IO`), so the no-dependency round
is a variation rather than a surprise.

## 6. Design decisions

### 6.1 Four modules at the end of the synthesis track

| Order | Id | Title | Est. |
|---|---|---|---|
| 45 | `machine-coding-round` | The Machine Coding Round | 25m |
| 46 | `machine-coding-spine` | The Spine | 35m |
| 47 | `feature-drills` | Feature Drills | 45m |
| 48 | `utility-drills` | Utility Drills | 40m |

They insert *after* `algorithms` (44) and *before* `system-design`, which moves
to 49 and `the-rest-of-the-loop` to 50. Implementation before design: the
machine coding round is the applied form of tracks 1–7, and system design is the
abstraction above it, so the reading path should meet them in that order.

The renumbering touches exactly two `order:` integers in two existing files. No
id moves, so no `prerequisites`, cross-link or hash changes — `#theory/system-design`
still resolves. `system-design`'s own prerequisite (`offline-first`, order 29)
stays lower, so validator check 4 is unaffected.

*Rejected:* appending at 47–50 to avoid touching existing files. It would put
"how to build it" after "the rest of the loop", which reads as an afterthought
in the one track where reading order carries meaning. Two integers is a cheap
price for a coherent path.

*Rejected:* a ninth track. Four modules is a thin track, and the material is
plainly synthesis — it uses everything and introduces nothing.

### 6.2 One new block type: `drill`

A drill is not prose. It has a spec, a timebox, a rubric it is scored against and
a solution sketch that must be collapsed until the reader has tried it. Composing
that from `prose` + `tip` + `syntax` loses the two properties that make the
section work: drills must be **countable** (24 of them, progress is meaningful)
and **filterable** (cram mode should reduce to the Tier 1 five).

```js
{
    type: "drill",
    tier: 1,                       // 1..4, matches §3
    title: "Search the API, debounced",
    minutes: 40,
    prompt: "<p>…the brief as an interviewer would give it…</p>",
    watchFor: ["…", "…"],          // the two or three things that lose marks
    sketch: { language: "kotlin", code: "…" }   // rendered collapsed
}
```

Cost: one case in `renderBlock()`, one CSS rule, one validator shape check. The
same cost as the nine types already shipped, and it is the only schema change
this plan asks for.

*Rejected:* a separate top-level "Drills" mode alongside Questions and Theory.
A third mode needs its own route, sidebar state and search corpus, and drills
without their surrounding chapter are a list of homework with no teaching.

### 6.3 Drills are gradeable, not gradable

No scoring UI, no timer, no "mark this drill complete" state. Read progress
already tracks modules, and a per-drill checkbox is a store, a schema and a
migration for a signal the reader can hold in their head.

The timebox is printed because it changes how you practise; it is not enforced
because enforcement in a browser tab is theatre. The reader is told, once, to run
the clock on their phone.

## 7. Data model

No change to the module or chapter shape. `drill` joins the nine block types
(§5.5 of the theory plan) as the tenth:

| Type | Fields | Renders as | Use for |
|---|---|---|---|
| `drill` | `tier`, `title`, `minutes`, `prompt`, `watchFor[]`, `sketch?` | bordered card, tier badge, timebox, collapsed sketch | a task to build under a clock |

`prompt` carries the same restricted HTML subset as every other authored field.
`sketch` is handed to `renderCodeBlock()` unchanged, so a solution sketch looks
like every other snippet in the app.

Chapters holding drills are marked `must-know` when they hold a Tier 1 drill, so
cram mode collapses the section to the five tasks that carry the round.

## 8. Code changes

| File | Change |
|---|---|
| `js/theory.js` | `renderDrillBlock()`; one case in `renderBlock()` |
| `css/theory.css` | `.theory-drill`, tier badge, timebox chip, collapsed sketch |
| `tools/validate-theory.js` | check 15: drill shape — `tier` 1–4, `minutes` a positive integer, `prompt` present, `watchFor` non-empty; and a count assertion that the corpus holds every drill in Appendix A exactly once |
| `data/theory/index.js` | four modules inserted; two `order:` values shifted |
| `index.html` | four `<script>` tags before `data/theory/index.js` |
| `docs/FEATURES.md` | a Drills paragraph under Theory |
| `docs/CODEBASE.md` | the tenth block type; check 15 |

`js/search.js` needs no change — `blockText()` flattens by field, and `prompt`
and `title` come through it like any other. Worth confirming rather than
assuming, since a drill that cannot be found by name is a drill nobody does.

## 9. How to prepare — the four-week ladder

The section closes with this, and it is the answer to "how do I get ready", which
is a different question from "what will they ask".

**Week 1 — the spine, until it is boring.** Build it cold five times, from
`File → New Project`, no reference material, once per day. Target: under twelve
minutes to a running list with all four states. Nothing else this week. A
candidate who can do only this passes more rounds than one who has read all
twenty-four drills once.

**Week 2 — Tier 1.** One drill per day, in order 1→5, each as a delta on the
spine. Then repeat drill 1 cold on day 7 and compare with the day-1 attempt.

**Week 3 — Tier 2, plus bare mode.** One feature drill per day. Twice this week,
do the drill with no dependencies at all — `HttpURLConnection` and `org.json`.

**Week 4 — Tier 3 and 4, then mocks.** Utility drills are short; two a day is
fine. Close the week with two full 50-minute mocks against a drill you have not
done, screen-shared to someone if possible, narrating throughout.

**The protocol for a single drill**, which matters more than the schedule:

1. Read the prompt. **Do not read the sketch.**
2. Two minutes, out loud: what are the states, what is the data shape, what will
   you fake. Say the plan before typing — this is the rehearsal for the thing you
   are actually marked on.
3. Start the clock. Build until it rings, then stop mid-line if that is where you
   are.
4. Score against the ten lines in §4. Write down which line you missed.
5. Read the sketch. Diff it against yours.
6. Three days later, redo the same drill cold. The second attempt is where the
   compilation into muscle actually happens; skipping it wastes the first.

**The one thing to prepare before any of it:** a starter project you have built
yourself and can recreate — Compose, coroutines, a networking client, an image
loader, one `Fake` data source — plus the knowledge of exactly which lines to
delete when the interviewer says "no third-party libraries, please".

## 10. Validation

The existing tooling covers all of it. `node tools/validate-theory.js` gains
check 15 (§8); `node tools/check-doc-links.js` covers the new `docs[]` entries,
of which there are few — this section's authority is practice, not documentation,
and inventing hub links to make the modules look like their neighbours would be
dishonest. `machine-coding-round` and the drill modules link the guides they
genuinely build on (architecture, Paging, Room, Coil) and nothing more.

## 11. Phases

| Phase | Content | Gate |
|---|---|---|
| 0 | `drill` block: renderer, CSS, validator check 15 | a hand-written fixture drill renders and validates |
| 1 | M45 The Machine Coding Round, M46 The Spine | spine code compiles when pasted into a scratch project |
| 2 | M47 Feature Drills (drills 1–12) | validator green, all twelve present exactly once |
| 3 | M48 Utility Drills (drills 13–24) | as above |
| 4 | Renumber 45/46 → 49/50; docs; search confirmation | full-corpus render sweep, 50 modules |

Phase 1's gate is unusual and deliberate: the spine is the one asset in the app
whose code will be typed verbatim by a reader under pressure. It gets compiled
before it ships.

## 12. Risks

**The spine dates.** It names specific libraries and a specific Compose idiom.
`collectAsStateWithLifecycle` was a footnote three years ago. Mitigation: the
spine is one module, deliberately, so refreshing it is one file.

**Frequency claims are soft.** "Tier 1 is near-certain" comes from practitioner
write-ups and reported loops, not a survey. The tiers are stated as what to
practise first, not as a measured distribution, and §3 says so.

**Twenty-four drills is a lot of authoring.** Each needs a prompt worth answering
and a sketch worth reading. The tier split is also the cut line: Tiers 1 and 2
alone (twelve drills, M47) are a shippable section, and M48 can follow later
without leaving a gap.

---

## 13. What was built, and where it left the plan

Five deviations, all deliberate, none discovered late enough to be expensive.

**Drills carry an `id`, and the validator holds the catalogue.** §6.2 sketched
the drill block without one. Without an id there is no way to assert that every
drill in Appendix A exists exactly once, which was the stated point of check 15 —
so `id` is a required field, matched against a `DRILL_IDS` list in
`tools/validate-theory.js`. An unknown id or a duplicate is an error; anything
unwritten is a warning, which is how the section could ship in phases.

**§8 was wrong about search.** It claimed `js/search.js` needed no change
because `blockText()` "flattens by field". It does not — it switches on block
type with an empty default, so drills would have been invisible to search. One
case added. The plan's own instruction to confirm rather than assume is what
caught it.

**The tier-4 drills live in M45, not M48.** They are about the extend and
review *formats*, which M45 is the chapter that explains. Putting them in a
module called "Utility Drills" would have filed them by phase rather than by
subject. M48 holds tiers 3 only, eight drills.

**The renumbering happened in Phase 1, not Phase 4.** §6.1 scheduled it last.
That is not possible: duplicate `order` values are an error, not a warning, so
`system-design` and `the-rest-of-the-loop` had to move to 49 and 50 in the same
commit that introduced 45 and 46.

**The Phase 1 gate was not run as written.** "Spine code compiles when pasted
into a scratch project" needs a Kotlin toolchain, and this machine has neither
`kotlinc` nor a JRE. The spine was reviewed by hand instead, which found one
real defect — the search delta called `repository.items(q)` against a spine
interface declaring `items()`, so a reader typing it verbatim would not have
compiled. Fixed, and the signature change is now called out in the snippet. The
gate stands for whoever next has a toolchain; it has not been satisfied.

**Verification that did hold:** validator green with zero warnings (50 modules,
179 chapters, all 24 drills present exactly once), all 280 documentation links
resolving without redirect, all four modules rendering with correct chapter
counts, 24 drill cards in the DOM with tier colours and collapsed sketches, and
cram mode on `#theory/feature-drills` reducing 12 drills to the 5 tier-1 ones.

## Appendix A — the drill list

Tier 1: 1 list-from-api · 2 debounced-search · 3 pagination · 4 detail-navigation
· 5 offline-first-cache

Tier 2: 6 shopping-cart · 7 form-validation · 8 countdown-timer · 9 quiz-flow
· 10 notes-crud · 11 image-list · 12 filter-and-sort

Tier 3: 13 lru-cache · 14 hand-rolled-debounce · 15 retry-with-backoff
· 16 custom-flow-operator · 17 rate-limiter · 18 image-loader · 19 result-wrapper
· 20 event-bus

Tier 4: 21 fix-the-leak · 22 refactor-god-activity · 23 add-the-missing-test
· 24 review-this-diff

## Appendix B — sources

Format, timing and evaluation criteria in §2:

- [Android Machine Coding Round Interview — Outcome School](https://outcomeschool.substack.com/p/android-machine-coding-round-interview)
- [Android Interview Questions to Crack Tech Interviews in 2026 — Interview Kickstart](https://interviewkickstart.com/blogs/interview-questions/android-interview-questions)

Task shapes in §3:

- [amitshekhariitbhu/android-interview-questions](https://github.com/amitshekhariitbhu/android-interview-questions)
- [niharika2810/android-interview-questions](https://github.com/niharika2810/android-interview-questions)
- [Mobile System Design Exercise: Image Library — ProAndroidDev](https://proandroiddev.com/mobile-system-design-exercise-image-library-83999eb0ad3c)
- [Building a Custom Image Loader with Disk Caching for Android — ProAndroidDev](https://proandroiddev.com/building-a-custom-image-loader-with-disk-caching-for-android-5f4b151108f7)
- [Mastering LRU Cache in Kotlin — Android Engineers](https://www.androidengineers.in/blogs/mastering-lru-cache-in-kotlin-vjwvvd)
- [Deep Dive: Debounce in Kotlin Coroutines Flow](https://androidengineers.substack.com/p/deep-dive-debounce-in-kotlin-coroutines)
- [Kotlin Flow Retry Operator with Exponential Backoff Delay — MindOrks](https://blog.mindorks.com/kotlin-flow-retry-operator-with-exponential-backoff-delay)
- [Pagination in Jetpack Compose: A Complete Guide](https://medium.com/@dawinderapps/android-interview-questions-74-pagination-in-jetpack-compose-a-complete-guide-b1600f7a2eaa)
