# Plan — Theory Section

**Status:** revision 2 — Phases 0–7 built; Phase 8 outstanding
**Date:** 2026-08-15
**Scope:** a learning-ordered theory curriculum, structured independently of the
question bank, with every unit anchored to official Android/Kotlin documentation.

**Revision 2 changes:** theory no longer mirrors the question topics or their
order. The section is now organised as tracks → modules → chapters, sequenced for
comprehension. Documentation links are promoted from a footnote to a structural
element of the schema, with a link checker to keep them honest.

---

## 1. Why

DroidDeck answers questions. It does not teach. A reader who does not already
know what a `CoroutineContext` is can find fourteen questions that mention one,
and no page that defines it, lists its four elements, shows the syntax and says
where it sits relative to `Job` and `Dispatcher`.

The questions are a testing surface. What is missing is the surface you learn
*from*.

Crucially, the shape that makes a good question bank is the wrong shape for
learning. The question bank is organised for **lookup** — fourteen buckets, each
a place to file a question. Learning needs organisation for **comprehension** —
a single path where each idea arrives only after the ideas it depends on, and
where a subject splits or merges according to how it is understood rather than
how it is filed.

So the theory section gets its own structure. It is a curriculum that happens to
live in the same app as the question bank, cross-linked to it, not a second view
of it.

## 2. What exists today

Verified against the tree at `f2a2ead`:

| Fact | Value |
|---|---|
| Topics | 14, declared in `data/index.js` |
| Questions | 465 total; `android` alone holds 135 across 20 subsections |
| Question id uniqueness | 464 unique ids — **one collision**: `kotlin-multiplatform` appears in both `kotlin` and `other-topics` |
| Largest data file | `data/android.js`, 4081 lines |
| Build step | none — `index.html` loads ~22 scripts in a fixed order |
| Module system | none — every file declares a global |
| Routing | `window.location.hash`, parsed by `parseHash()` into `{topicId, subsectionId}` |
| Rendering entry point | `renderTopic()` in `js/app.js` |
| Reusable renderers | `highlightCode()`, `renderDiagram()`, `renderCodeBlock()`, `renderReferenceLinks()` |
| Search | `buildSearchIndex()` flattens all questions once at startup |
| Sidebar nesting | exactly two levels (`nav-item-group` → `nav-subsection`) |
| Tests | none |

Four of these shape the design: **no build step**, so theory is plain `.js`
globals listed in `index.html`; **no test framework**, so a large hand-authored
corpus needs a validator we write ourselves; **the sidebar is two levels deep**,
which the track/module hierarchy is sized to fit without new nav machinery; and
**question ids are not quite globally unique**, which forces cross-links to be
`{topicId, questionId}` pairs rather than bare ids.

## 3. Design decisions

### 3.1 Theory has its own structure: tracks → modules → chapters

The unit of authoring and navigation is a **module** — one focused subject,
20–40 minutes, e.g. "Structured concurrency" or "State and recomposition".
Modules group into eight **tracks**, and each module holds ordered **chapters**.

Modules are deliberately *not* the fourteen question topics:

- **Some split.** The question bank's `android` topic is 135 questions across 20
  subsections. As a single theory unit it would be unreadable. It becomes ~6
  modules spread across three different tracks — platform, UI and background work
  are separate subjects that happen to share a filing cabinet.
- **Some merge.** "Design patterns", "Android architecture" and the DI questions
  filed under "Android libraries" are one continuous subject. Taught separately
  they repeat themselves; taught together, DI arrives as the answer to a problem
  the architecture module just posed.
- **Some are new.** No question topic covers "the Android threading model" —
  `Looper`, `Handler`, the main thread, why blocking produces an ANR. It is
  assumed by coroutine questions, ANR questions and `RecyclerView` questions
  alike. As a prerequisite module it earns its place; as a question topic it
  never would.
- **Some move.** The View system (`measure`/`layout`/`draw`, `RecyclerView`)
  sits *after* Compose in the path, not before. On a 2026 learning path Compose
  is the default and Views are the interop story you meet when maintaining
  existing code — which is also how `developer.android.com` now presents them.

`data/theory/<module-id>.js` declares `const <name>Module = { ... }`.
`data/theory/index.js` assembles them into `theoryModules` and `theoryTracks`.

*Rejected:* one theory file per question topic, keyed by `topicId` (revision 1's
design). It made the curriculum a hostage to a filing scheme built for a
different purpose, and forced a 28-chapter `android` page.

### 3.2 Documentation links are structural, not decorative

The single most valuable thing theory can do is put the reader one click from the
page Google wrote. So doc links are first-class schema (§5.4), not a `references`
afterthought:

- Every **module** declares a `docHub` — the canonical developer.android.com
  landing page for that subject, rendered prominently in the module header.
- Every **chapter** declares `docs[]`, each typed `guide | api | codelab | sample | course`
  and rendered with a distinguishing icon, so a reader can tell a conceptual
  guide from an API reference before clicking.
- Doc links are stored as **paths against a base**, not absolute URLs:
  `{ path: "/develop/ui/compose/state" }` renders against
  `https://developer.android.com`.

That last point is not fussiness. Researching this revision surfaced that Google
restructured the docs: Compose moved from `/jetpack/compose/*` to
`/develop/ui/compose/*`, and background work from `/guide/background` to
`/develop/background-work/*`. Roughly 300 stored links across the finished corpus
will be affected the next time that happens. Storing paths behind one base turns
a future migration into a scripted sweep instead of a manual audit, and makes
`tools/check-doc-links.js` (§7.2) trivial to write.

Appendix A is the verified hub map the authoring work starts from.

### 3.3 Routing is module-based

```
#theory                             → the curriculum overview: tracks, modules, progress
#theory/<module-id>                 → a module, from the top
#theory/<module-id>/<chapter-id>    → deep link to a chapter
#theory/glossary                    → cross-module glossary (Phase 6)
```

`parseHash()` gains a `mode` field. First segment `theory` ⇒ `mode: 'theory'`
and the remaining segments shift right; otherwise mode is `'questions'` and
parsing is exactly what it is today.

*Rejected:* `#topicId/theory`, which collides with the subsection namespace.
`theory` is safe as a reserved word — no module id or topic id may use it, and
the validator enforces that.

Every URL that works today keeps working. That is a hard requirement:
`docs/FEATURES.md` promises deep links are shareable.

Module ids are globally unique and carry no track prefix, so a module can be
re-homed to a different track without breaking a shared link.

### 3.4 Tracks map onto the sidebar's existing two levels

In theory mode the sidebar renders **track groups → module links**, reusing
`buildTopicGroup()`/`nav-subsection` exactly as topics-with-subsections do today.
Chapters — the third level — are handled by an in-page chapter rail, not the
sidebar.

This is why modules are sized at 20–40 minutes rather than being finer: the
hierarchy is chosen to fit navigation that already exists and already works.

A `Questions | Theory` segmented control above the list switches modes.

*Rejected:* a three-level sidebar. It would mean new nav components, new
keyboard handling and new active-state logic, to display a level the chapter rail
already shows in context.

### 3.5 Learning order is Kotlin-first, and the JVM arrives when it leaks

Revision 1 opened with Java, on the reasoning that Kotlin's semantics are defined
against the JVM. That is true and it is still the wrong teaching order. Nobody
learns Android through Java in 2026; Google's own path
(`/kotlin/first`, Android Basics with Compose) is Kotlin from the first hour.

So Kotlin comes first, and the JVM appears as **Module 6 — What Kotlin sits on**:
bytecode, memory model, GC, `equals`/`hashCode`, collection internals, and the
interop rules. It arrives at the point where the abstraction leaks and the reader
has questions, which is when it is learnable rather than arbitrary.

Java-specific interview material (SOLID, OOP pillars, checked exceptions, the
`HashMap` internals) is not dropped — it is distributed to where it belongs:
OOP into the Kotlin classes module, SOLID into the architecture track, `HashMap`
internals into the JVM module and DSA track.

### 3.6 Prerequisites are declared and enforced

Each module declares `prerequisites: [moduleId]`. The validator rejects a
prerequisite that appears later in the path, so "builds up sequentially" is a
checked property, not a claim. Chapters do the same within a module via
`buildsOn`.

A reader arriving from a search result sees a prerequisite strip telling them
what they are missing and linking to it.

### 3.7 Importance is a three-tier chapter property

`importance: "must-know" | "should-know" | "good-to-know"`, rendered as a badge
and drivable as a **cram filter**. Tier definitions are fixed so marking stays
consistent across 46 modules and many authoring sessions:

- **must-know** — you will be asked this, or asked something that assumes it, in
  essentially any Android interview at any level.
- **should-know** — routinely asked at mid/senior level, or whenever the subject
  comes up at all.
- **good-to-know** — depth that distinguishes a strong candidate; skippable the
  night before.

Modules also carry an importance derived from their chapters (the highest tier
present), shown in the sidebar and on the overview page.

### 3.8 Content is structured blocks

Question answers are one `answer` HTML string. Right for an answer, wrong for
theory: we want to harvest every definition into a glossary, style every "types
of X" consistently, and filter by importance. None of that works against an
opaque blob. A chapter is therefore an ordered array of typed blocks (§5.5).
Prose remains HTML inside a `prose` block.

## 4. What a reader gets

- A **curriculum overview** at `#theory`: eight tracks, 46 modules, total reading
  time, and where the recommended path starts.
- A **module page**: header with reading time, prerequisites, importance and a
  prominent link to the official doc hub; then chapters in order, each with an
  importance badge, an "interview angle" line, definitions, type tables, syntax,
  comparisons, pitfalls, diagrams, doc links and related questions.
- Chapters **expanded by default** — theory is read, not quizzed — with a
  collapse-all control. Deliberately the opposite default from question cards.
- A **cram filter**: must-know chapters only.
- **Related questions** per chapter, deep-linking into the existing Q&A cards.
- **Official docs** surfaced at both module and chapter level, typed by kind.
- Theory chapters in **search results**, badged to distinguish them.
- A **glossary** assembled from every `definition` block (Phase 6).

## 5. Data model

### 5.1 Files and globals

| Module id | File | Global |
|---|---|---|
| `coroutines-fundamentals` | `data/theory/coroutines-fundamentals.js` | `coroutinesFundamentalsModule` |
| `compose-state` | `data/theory/compose-state.js` | `composeStateModule` |

Mirrors the existing `<name>Data` convention. 46 files plus a registry.

### 5.2 Track shape

Tracks are declaration-only; they hold no content, just order and identity.
Declared together in `data/theory/index.js`:

```js
const theoryTracks = [
    { id: "language",     title: "Language Foundations",  icon: "🟣", order: 1 },
    { id: "async",        title: "Asynchrony & State",    icon: "⚡", order: 2 },
    { id: "platform",     title: "The Android Platform",  icon: "🤖", order: 3 },
    { id: "ui",           title: "Building UI",           icon: "🎨", order: 4 },
    { id: "data",         title: "Data & Background Work",icon: "💾", order: 5 },
    { id: "architecture", title: "Architecture & Design", icon: "🏗️", order: 6 },
    { id: "quality",      title: "Testing, Performance & Tooling", icon: "🧪", order: 7 },
    { id: "synthesis",    title: "Interview Synthesis",   icon: "🎯", order: 8 }
];
```

### 5.3 Module shape

```js
const structuredConcurrencyModule = {
    id: "structured-concurrency",
    trackId: "async",
    order: 9,                                  // 1..44, unique, the global path position
    title: "Structured Concurrency",
    tagline: "A parent does not finish before its children.",
    estimatedMinutes: 25,
    prerequisites: ["coroutines-fundamentals"],   // module ids, must have a lower `order`
    docHub: { title: "Coroutines on Android", path: "/kotlin/coroutines" },
    chapters: [ /* Chapter */ ]
};
```

### 5.4 Chapter shape

```js
{
    id: "cancellation",
    title: "Cancellation is cooperative",
    importance: "must-know",
    summary: "Cancelling a coroutine sets a flag; code that never suspends never notices.",
    interviewAngle: "Arrives as 'you cancelled the job, why is the work still running?'",
    buildsOn: ["job-lifecycle"],                  // chapter ids in this module, earlier
    blocks: [ /* Block */ ],

    docs: [
        { title: "Cancellation and timeouts", path: "/kotlin/coroutines/coroutines-adv", kind: "guide" },
        { title: "kotlinx.coroutines.Job", url: "https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines/-job/", kind: "api" }
    ],

    relatedQuestions: [
        { topicId: "kotlin-coroutines", questionId: "coroutines-cancellation" }
    ]
}
```

**On `path` vs `url`.** `path` is relative to `https://developer.android.com`;
`url` is an absolute link for everything else (kotlinlang.org, Oracle, GitHub
samples). Exactly one must be present. The renderer resolves `path` against a
single `DOC_BASE` constant in `js/theory.js`.

**On `relatedQuestions`.** Pairs, not bare ids, because question ids are not
globally unique — `kotlin-multiplatform` exists in both `kotlin` and
`other-topics`. Bare ids would silently link to whichever file loaded last.

### 5.5 Block types

Nine types. A new type means one function in `js/theory.js` and one CSS rule.

| Type | Fields | Renders as | Use for |
|---|---|---|---|
| `prose` | `html` | paragraph flow | narrative, connective tissue |
| `definition` | `term`, `aka?`, `html`, `important?` | bordered card, `term` in mono | "X is …" — the glossary is harvested from these |
| `types` | `title`, `items: [{name, html, whenToUse?}]` | numbered list, rule per item | "the four launch modes", "the three dispatchers" |
| `syntax` | `language`, `title`, `code`, `notes?` | `renderCodeBlock()` + notes | the form you must write from memory |
| `table` | `title?`, `headers[]`, `rows[][]` | scrollable table | tabular, non-comparative |
| `comparison` | `title`, `left`, `right`, `rows: [{aspect, left, right}]` | two-column table | "X vs Y" — the commonest interview shape |
| `pitfall` | `html` | warning callout (`--warning-color`) | the trap in the question |
| `tip` | `html` | accent callout | how to answer it out loud |
| `diagram` | `diagramType`, `diagramConfig` | `renderDiagram()` | reuses all three existing renderers unchanged |

`html` fields carry the same restricted subset used in answers today:
`<p> <ul> <ol> <li> <strong> <em> <code> <a> <table>`. Authored content injected
with `innerHTML`, safe on the same grounds as answers
(`docs/ARCHITECTURE.md` §Security posture) — and for the same reason, no
user-derived string may ever reach these fields.

### 5.6 Registry

`data/theory/index.js`, loaded after the module files:

```js
const theoryTracks  = [ /* §5.2 */ ];
const theoryModules = [ /* all 44, in `order` */ ];
const theoryByModuleId = Object.fromEntries(theoryModules.map((m) => [m.id, m]));
```

The renderer consults `theoryByModuleId`, so partially-populated phases degrade
to "this module isn't written yet" rather than to a broken page.

## 6. Code changes

New files:

| File | Responsibility | Est. lines |
|---|---|---|
| `js/theory.js` | `renderTheoryOverview()`, `renderTheoryModule()`, nine block renderers, doc-link resolution, chapter rail, cram filter | ~450 |
| `css/theory.css` | module/chapter cards, badges, definition & callout styling, doc-link chips, mode switch, overview grid | ~300 |
| `data/theory/*.js` | 46 module files | content |
| `data/theory/index.js` | tracks + registry | ~70 |
| `tools/validate-theory.js` | schema and integrity checks (§7.1) | ~230 |
| `tools/check-doc-links.js` | doc URL liveness and redirect sweep (§7.2) | ~90 |

Edits, each small and localised:

- **`js/navigation.js`** — `parseHash()` gains `mode`; `generateHash()` gains a
  mode argument; `renderSidebar()` renders the mode switch and, in theory mode,
  builds track groups from `theoryTracks`; `setActiveTopic()` becomes mode-aware.
- **`js/app.js`** — `handleRouteChange()` dispatches across three renderers
  (overview, module, topic). `updateHashFromScroll()` learns `.theory-chapter`
  headings, using the same `replaceState` trick that breaks the feedback loop
  today.
- **`js/search.js`** — `buildSearchIndex()` also walks `theoryModules`, emitting
  `kind: 'theory'` entries; `navigateToResult()` routes on `kind`; results show a
  `Theory` badge.
- **`index.html`** — `<link>` for `css/theory.css`; script tags for 47 new data
  files before `js/theory.js`, which loads before `js/app.js`.
- **`docs/ARCHITECTURE.md`, `docs/CODEBASE.md`, `docs/FEATURES.md`** — updated in
  the same commit as the code that invalidates them.

No existing behaviour changes. No existing data file is touched.

### 6.1 New CSS tokens

Three per theme in `css/themes.css`, declared as their own tokens rather than
reusing `--error-color`/`--warning-color`: a must-know badge is not an error, and
the meanings must be free to diverge.

```css
[data-theme="dark"] {
    --importance-must: #f87171;
    --importance-should: #fbbf24;
    --importance-good: var(--text-muted);
}
```

Light-theme values follow the same relationship against that theme's background,
matching how every other pair in `css/themes.css` is derived.

## 7. Validation

### 7.1 `tools/validate-theory.js`

No test framework and no build step, so ~250 chapters and ~2500 blocks will rot
silently unless something checks them. Runs under plain `node`, no dependencies.

```bash
node tools/validate-theory.js
```

1. Module ids unique, kebab-case, and never the reserved word `theory` or
   `glossary`.
2. `order` values are 1..N, unique, no gaps.
3. Every `trackId` exists in `theoryTracks`.
4. Every `prerequisites` entry is a real module id with a **lower** `order`.
5. Chapter ids unique within a module; every `buildsOn` id exists in the same
   module and appears **earlier**.
6. `importance` is one of the three tiers.
7. Every `relatedQuestions` pair resolves: `topicId` in `topics`, `questionId`
   in that topic's questions. This is the check that keeps the two corpora in
   step.
8. Every doc entry has exactly one of `path`/`url`, a non-empty title, and a
   `kind` from the five allowed. `path` starts with `/`; `url` is `https:`.
9. Every module has a `docHub`; every must-know chapter has at least one `docs`
   entry.
10. Every block has a known `type` and every field that type requires.
11. `syntax` blocks use a language `highlightCode()` handles (`kotlin`, `java`,
    `xml`, `groovy`, `text`).
12. `diagram` blocks declare a `diagramType` `renderDiagram()` implements.
13. `html` fields contain no tag outside the allowed subset, and no `<script>`,
    `on*=` attribute or `javascript:` URL.
14. **Coverage (warning, not error):** every `keyTopics` entry across all 14
    question topics is mentioned somewhere in the theory corpus, reported as an
    unmatched list. Because theory no longer maps 1:1 to topics, this is the only
    remaining signal that a subject was dropped in the reorganisation — it
    matters more in revision 2 than it did in revision 1.

**Write this first, in Phase 0, before any content.** It fails on an empty
corpus; making it pass is the definition of done for every later phase.

### 7.2 `tools/check-doc-links.js`

Issues a `HEAD` to every resolved doc URL and reports 404s and redirects,
throttled, with a cached pass list so reruns are cheap.

This exists because the problem is demonstrated, not hypothetical: writing this
revision found that Compose docs moved from `/jetpack/compose/*` to
`/develop/ui/compose/*` and background work from `/guide/background` to
`/develop/background-work/*`. A redirect that still resolves today is a 404 next
year, so the checker treats **redirects as failures to be fixed at the source**,
not as passes.

Run at the end of every phase, and quarterly thereafter. Not part of the
per-commit loop — it hits the network.

## 8. The curriculum

46 modules across 8 tracks, ~250 chapters. Target 400–900 words of prose per
chapter plus blocks. Ordering is the reading path; `order` values are global.

`[M]` must-know · `[S]` should-know · `[G]` good-to-know (module-level tier).

### Track 1 — Language Foundations

| # | Module | Tier | Doc hub |
|---|---|---|---|
| 1 | Kotlin essentials — values, types, null safety | `[M]` | `/kotlin/first` |
| 2 | Functions, lambdas and higher-order functions | `[M]` | kotlinlang.org/docs/functions.html |
| 3 | Classes, objects and class modifiers | `[M]` | kotlinlang.org/docs/classes.html |
| 4 | Collections and sequences | `[M]` | kotlinlang.org/docs/collections-overview.html |
| 5 | Generics, delegation and idiomatic Kotlin | `[S]` | kotlinlang.org/docs/generics.html |
| 6 | What Kotlin sits on — the JVM, memory and interop | `[S]` | `/kotlin/add-kotlin` |

**M1** `val`/`var`, inference, basic types, `Any`/`Unit`/`Nothing`; null safety
(`?`, `?.`, `?:`, `!!`, `lateinit`, `by lazy`, platform types); string templates;
control flow and `when` as an expression.
**M2** default/named arguments, `vararg`, single-expression, infix, extension
functions and their static dispatch; lambdas, closures, `it`, function types;
`inline`/`noinline`/`crossinline`/`reified`; the five scope functions with the
receiver-vs-argument decision table.
**M3** constructors and `init`, properties and backing fields; `data`, `sealed`,
`enum`, `object`, `companion object`, `inner` vs nested, `open`/`final`; what
`data class` generates and the `equals` trap with non-constructor properties;
`sealed` vs `enum` and the exhaustive-`when` payoff; the four OOP pillars stated
in Kotlin terms.
**M4** list/set/map, mutable vs read-only (not immutable); the operator catalogue
(`map`/`filter`/`fold`/`groupBy`/`associate`); sequences vs collections and when
laziness pays; complexity table.
**M5** variance, `in`/`out`, star projection, comparison to Java wildcards;
`by` delegation, delegated properties, `lazy`, `observable`; operator
overloading, destructuring, ranges; `typealias`, value classes, context
parameters (stable in Kotlin 2.4).
**M6** bytecode, JIT/AOT, heap/stack/metaspace, GC generations and roots; the
`equals`/`hashCode` contract; `HashMap` internals — buckets, hash spreading,
treeification at 8, resize; `==` vs `equals`, autoboxing, the Integer cache;
string pool and `StringBuilder`; checked vs unchecked exceptions and why Kotlin
dropped them; interop — `@JvmStatic`, `@JvmOverloads`, `@JvmField`, SAM
conversion, nullability annotations.

### Track 2 — Asynchrony & State

| # | Module | Tier | Doc hub |
|---|---|---|---|
| 7 | The Android threading model | `[M]` | `/guide/components/processes-and-threads` |
| 8 | Coroutines fundamentals | `[M]` | `/kotlin/coroutines` |
| 9 | Structured concurrency, cancellation and exceptions | `[M]` | `/kotlin/coroutines` |
| 10 | Flow fundamentals | `[M]` | `/kotlin/flow` |
| 11 | StateFlow, SharedFlow and reactive UI state | `[M]` | `/kotlin/flow/stateflow-and-sharedflow` |

**M7** — the module that exists only because learning needs it. Process and
thread model, the main/UI thread, `Looper`/`Handler`/`MessageQueue`, why blocking
the main thread produces an ANR, the 16ms frame budget, and the historical
answers (`AsyncTask`, `HandlerThread`, `ExecutorService`) that motivate
coroutines. Every later module in this track is an answer to a problem posed
here.
**M8** concurrency vs parallelism; why threads are expensive; `suspend`,
`Continuation`, CPS and the compiler's state machine; builders (`launch`,
`async`, `runBlocking`); `withContext` vs `async`+`await`; `CoroutineContext` and
its four elements; dispatchers including `Main.immediate` and
`limitedParallelism`; scopes — `viewModelScope`, `lifecycleScope`, and why
`GlobalScope` is a smell.
**M9** `Job` lifecycle states, `SupervisorJob`; parent/child relationships;
`coroutineScope` vs `supervisorScope`; cooperative cancellation, `isActive`,
`ensureActive()`, `yield()`, `NonCancellable`, `CancellationException` as a
special case; how `launch` and `async` differ in exception propagation and where
a handler must sit to fire; bridging callbacks with `suspendCancellableCoroutine`.
**M10** cold vs hot; builders (`flow{}`, `flowOf`, `asFlow`, `callbackFlow`,
`channelFlow`); terminal and intermediate operators; context preservation and
`flowOn`; combining (`zip`, `combine`, `merge`, the `flatMap*` family);
buffering and back-pressure (`buffer`, `conflate`, `collectLatest`); errors
(`catch`, `retry`, `onCompletion`).
**M11** `StateFlow` vs `SharedFlow` vs `LiveData` — the comparison table
interviewers actually want; `stateIn`/`shareIn` and why
`SharingStarted.WhileSubscribed(5_000)`; lifecycle-safe collection with
`repeatOnLifecycle` and `collectAsStateWithLifecycle`.

### Track 3 — The Android Platform

| # | Module | Tier | Doc hub |
|---|---|---|---|
| 12 | Platform architecture and app anatomy | `[M]` | `/guide/components/fundamentals` |
| 13 | Activities, tasks and the back stack | `[M]` | `/guide/components/activities/intro-activities` |
| 14 | Fragments and the view lifecycle | `[S]` | `/guide/fragments` |
| 15 | Intents, deep links and talking to other apps | `[M]` | `/guide/components/intents-filters` |
| 16 | Context, resources and configuration changes | `[M]` | `/guide/topics/resources/providing-resources` |
| 17 | Permissions and privacy | `[M]` | `/guide/topics/permissions/overview` |

**M12** Linux kernel → HAL → ART → framework → apps; Zygote and app process
creation; ART vs Dalvik, JIT/AOT hybrid; the build pipeline (`.kt` → `.class` →
`.dex` → APK/AAB); the four app components; project structure, Gradle files and
`AndroidManifest.xml`; the `Application` class.
**M13** the full lifecycle with callback pairings; what runs on rotation vs
backgrounding vs process death; `onSaveInstanceState` and `SavedStateHandle`;
launch modes (`standard`, `singleTop`, `singleTask`, `singleInstance`), tasks,
affinity and intent flags; the recents screen; `ComponentActivity` and the
Activity Result APIs.
**M14** why fragments exist; lifecycle *and* the separate view lifecycle;
`FragmentManager` and transactions; `viewLifecycleOwner` and why the binding must
be nulled; communication via the fragment result API; `DialogFragment`.
**M15** explicit vs implicit intents, intent filters and resolution; common
intents; `PendingIntent` and its mutability flags; deep links vs App Links and
the verification flow; package visibility.
**M16** the `Context` types and which one leaks; resource qualifiers and
resolution; themes vs styles; density buckets, `dp`/`sp`; dark theme;
localisation and RTL; configuration changes end to end.
**M17** normal, dangerous and special permissions; the runtime request flow and
rationale; one-time and background location; scoped storage's permission model;
the privacy-facing parts of the Play data safety form.

### Track 4 — Building UI

| # | Module | Tier | Doc hub |
|---|---|---|---|
| 18 | Thinking in Compose | `[M]` | `/develop/ui/compose/mental-model` |
| 19 | State and recomposition | `[M]` | `/develop/ui/compose/state` |
| 20 | Side effects and effect handlers | `[M]` | `/develop/ui/compose/side-effects` |
| 21 | Modifiers and layout | `[M]` | `/develop/ui/compose/layouts` |
| 22 | Lists and Compose performance | `[M]` | `/develop/ui/compose/lists` |
| 23 | Theming, Material 3 and adaptive UI | `[S]` | `/develop/ui/compose/designsystems` |
| 24 | Navigation | `[M]` | `/guide/navigation` |
| 25 | The View system and interop | `[S]` | `/develop/ui/views/layout/declaring-layout` |

**M18** declarative vs imperative; `@Composable` and what the compiler plugin
does; positional memoisation; why composables must be side-effect free and can
run in any order or in parallel; the three phases — composition, layout, drawing;
architectural layering.
**M19** `remember`, `rememberSaveable`, `mutableStateOf`, snapshot state; state
hoisting and UDF; stability, `@Stable`/`@Immutable`, and why an unstable
parameter defeats skipping; `derivedStateOf`, `produceState`,
`collectAsStateWithLifecycle`; the composable lifecycle.
**M20** `LaunchedEffect`, `DisposableEffect`, `SideEffect`,
`rememberCoroutineScope`, `rememberUpdatedState`, `snapshotFlow` — with the
key-behaviour table, which is the thing that gets asked.
**M21** modifier order and the chain model; `Modifier.Node`; `Column`/`Row`/
`Box`; `ConstraintLayout`; custom `Layout` and the measure/place contract;
intrinsics; alignment lines.
**M22** `LazyColumn`/`LazyRow`/`LazyGrid`; `key` and `contentType`; why it is not
a `RecyclerView`; deferred reads and lambda modifiers; `remember` misuse;
recomposition counts in Layout Inspector; Compose compiler metrics.
**M23** `MaterialTheme` anatomy, colour schemes, dynamic colour, typography;
Material 2 → 3; custom design systems; window size classes, canonical layouts,
foldables; accessibility and semantics.
**M24** navigation principles, graphs, type safety, nested graphs, multiple back
stacks, conditional navigation; predictive back; **Navigation 3** — what changed
and why it exists; testing navigation.
**M25** deliberately *after* Compose. View lifecycle; measure/layout/draw and the
three `MeasureSpec` modes; why deep hierarchies cost; `RecyclerView` —
`ViewHolder`, `LayoutManager`, `DiffUtil`, `ListAdapter`, recycling and the
pools; view binding; interop via `AndroidView`/`ComposeView` and migration
strategy.

### Track 5 — Data & Background Work

| # | Module | Tier | Doc hub |
|---|---|---|---|
| 26 | The data layer and repositories | `[M]` | `/topic/architecture/data-layer` |
| 27 | Local persistence — Room, DataStore, files | `[M]` | `/training/data-storage` |
| 28 | Networking | `[M]` | `/develop/connectivity` |
| 29 | Offline-first and sync | `[S]` | `/topic/architecture/data-layer/offline-first` |
| 30 | Background work | `[M]` | `/develop/background-work/background-tasks` |
| 31 | Services and foreground services | `[S]` | `/develop/background-work/services/fgs` |

**M26** repositories and data sources; single source of truth; exposing streams;
in-memory vs persistent caching; threading in the data layer; error modelling
(`Result`, sealed hierarchies).
**M27** Room — entities, DAOs, relations, migrations, `@Transaction`, Flow
support; DataStore Preferences vs Proto and the `SharedPreferences` migration;
files and scoped storage; `MediaStore`; SQLite performance.
**M28** Retrofit interfaces and converters; OkHttp — connection pooling, caching,
interceptors vs network interceptors; serialization (kotlinx.serialization, Moshi,
Gson); REST vs GraphQL vs gRPC; retries, backoff, idempotency; certificate
pinning.
**M29** local as source of truth; read and write strategies; conflict resolution;
the outbox pattern; `RemoteMediator` and Paging 3; sync scheduling.
**M30** `WorkManager` — constraints, chaining, unique work, `ListenableWorker`,
expedited work; `AlarmManager` and exact alarms; broadcasts (manifest vs
context-registered) and the background execution limits; Doze, app standby
buckets, battery optimisation.
**M31** started vs bound services; foreground service types and the modern
restrictions; the service lifecycle; binding, and a pointer to M15 for
cross-process work.

> **As built (Phase 5):** cross-app IPC — Binder, AIDL, `Messenger`,
> `ContentProvider`, the 1MB transaction limit — landed in **M15** instead,
> next to the Binder and sandbox material it depends on. M31 covers binding
> as a service concern and links there rather than repeating it.

### Track 6 — Architecture & Design

| # | Module | Tier | Doc hub |
|---|---|---|---|
| 32 | Architecture principles and layers | `[M]` | `/topic/architecture` |
| 33 | ViewModel and state holders | `[M]` | `/topic/libraries/architecture/viewmodel` |
| 34 | UI state and unidirectional data flow | `[M]` | `/topic/architecture/ui-layer` |
| 35 | Architecture patterns — MVC, MVP, MVVM, MVI | `[M]` | `/topic/architecture/recommendations` |
| 36 | Dependency injection | `[M]` | `/training/dependency-injection` |
| 37 | Design patterns in Android | `[S]` | `/topic/architecture/recommendations` † |
| 38 | Modularization | `[S]` | `/topic/modularization` |

† No first-party page covers GoF patterns, and §9 requires a first-party
`docHub`, so M37 points at the nearest one. The patterns themselves are taught
through the framework and library classes that implement them.

**M32** separation of concerns, drive UI from data models, single source of
truth, UDF; the three layers and the dependency rule; SOLID taught *here*, where
each principle attaches to a layer decision rather than floating free; the domain
layer and when use cases earn their keep; Clean Architecture's circles and the
pragmatic Android reading of them.
**M33** what a `ViewModel` survives and what it does not; `SavedStateHandle`;
scoping APIs and factories; why it must never hold a `View` or an Activity
`Context`; plain state holders vs `ViewModel`.
**M34** UI state as an immutable data class; state production pipelines; events
up, state down; one-off events and why a `SharedFlow` of events is contentious;
worked end to end through a single screen.
**M35** the four patterns compared honestly, with what each actually solves and
where the boundaries blur in practice; why Google's guidance names none of them.
**M36** DI as a pattern before it is a library; manual DI and where it stops
scaling; Hilt — components, scopes, `@Binds` vs `@Provides`, the generated graph;
Hilt in multi-module apps; Hilt vs Koin, compile-time vs runtime, stated fairly.
**M37** the three GoF families with the Android class that implements each;
Singleton and Kotlin's `object`; Factory, Builder, Adapter, Decorator, Facade,
Observer, Strategy, Command, State; the Repository pattern and where it is cargo
cult; anti-patterns — God Activity, singleton soup, leaking observers.
**M38** by layer vs by feature; `:app`/`:core`/`:feature`; build-time and
ownership payoffs; common patterns and the granularity trade-off; version
catalogs; navigation across modules.

### Track 7 — Testing, Performance & Tooling

| # | Module | Tier | Doc hub |
|---|---|---|---|
| 39 | Testing fundamentals | `[M]` | `/training/testing/fundamentals` |
| 40 | Testing coroutines, flows and ViewModels | `[M]` | `/kotlin/coroutines/test` |
| 41 | UI testing | `[S]` | `/training/testing/ui-tests` |
| 42 | Performance | `[M]` | `/topic/performance/overview` |
| 43 | Build, tooling and release engineering | `[S]` | `/build/gradle-build-overview` |

**M39** the testing pyramid; what to test; test doubles — dummy, fake, stub, spy,
mock, distinguished precisely because interviewers do; JUnit annotations, rules
and lifecycle; Mockito vs MockK and when a fake beats a mock; local vs
instrumented; Robolectric.
**M40** `runTest`, `TestDispatcher`, `StandardTestDispatcher` vs
`UnconfinedTestDispatcher`; injecting dispatchers; `MainDispatcherRule`; Turbine
for flows; a ViewModel tested end to end.
**M41** Espresso — view matchers, actions, assertions, idling resources;
Compose testing — `createComposeRule`, semantics, finders, synchronisation;
screenshot tests; UI Automator.
**M42** memory management, leak shapes, `WeakReference`, LeakCanary and the heap
dump workflow, bitmap cost; ANRs — anatomy, diagnosis, finding the unresponsive
thread; rendering, overdraw, jank and the frame budget; app startup — cold/warm/
hot, baseline and startup profiles; APK size; Android vitals; profiling with
Studio and Perfetto.
**M43** Gradle build lifecycle, AGP, `build.gradle.kts`, variants and flavours,
version catalogs; R8 — shrinking, obfuscation, keep rules, mapping files, full
mode; KSP vs KAPT; lint, Detekt, ktlint; `adb` essentials; CI/CD, signing,
App Bundles and Play delivery.

### Track 8 — Interview Synthesis

| # | Module | Tier | Doc hub |
|---|---|---|---|
| 44 | Data structures and algorithms for Android | `[M]` | `kotlinlang.org/docs/collections-overview` ‡ |
| 45 | Mobile system design | `[M]` | `/topic/architecture` ‡ |
| 46 | The rest of the loop | `[S]` | `/distribute` |

‡ §9 requires a first-party `docHub` and the validator requires one on every
module, so the two modules planned without a hub take the nearest first-party
page. M44 uses Kotlin's collections documentation, which covers the
Android-relevant half of the material; M45 uses the architecture hub. Compare the M37 footnote in Track 6.

These three are synthesis rather than new material: they compose what the earlier
seven tracks established, which is why they close the path and why M45 leans on
M28–M29 and M42 rather than restating them.

**M44** Big-O and amortised analysis; arrays and strings, two pointers, sliding
window; linked lists; stacks, queues, monotonic stack; hashing; trees and
traversals; heaps and top-K; graphs — BFS, DFS, topological sort, Dijkstra;
sorting and why `Collections.sort` is TimSort; binary search boundary variants;
recursion, backtracking, DP; and the Android-flavoured ones — LRU cache, the
problem `RecyclerView` recycling actually solves.
**M45** how a mobile design round differs from a backend one and what is being
scored; a framework to run it — requirements → API → data model → architecture →
offline → scale → trade-offs; then worked designs: chat, feed, file upload,
offline notes. Leans on M28–M29 and M42 rather than repeating them.
**M46** release tracks, staged rollout, in-app updates and review; app signing;
security posture — Keystore, `EncryptedSharedPreferences`, obfuscation, root
detection; KMP and Compose Multiplatform, honestly scoped; Wear/TV/Auto in a
paragraph each; the behavioural round — STAR, and the questions to ask back.

### 8.1 Where the question topics went

The reorganisation must not silently drop material. This is the audit, and
validator check 14 enforces it:

| Question topic | Qs | Lands in |
|---|---|---|
| `kotlin` | 66 | M1–M5 (+ interop in M6) |
| `kotlin-coroutines` | 20 | M7–M9 |
| `kotlin-flow-api` | 17 | M10–M11 |
| `java` | 48 | M6 (JVM), M3 (OOP), M32 (SOLID), M44 (collections/complexity) |
| `android` | 135 | M12–M17, M25, M27, M30–M31, M42 |
| `jetpack-compose` | 33 | M18–M24 |
| `android-architecture` | 8 | M32–M35, M38 |
| `design-pattern` | 15 | M37 (+ DI to M36) |
| `android-libraries` | 28 | M27 (Room), M28 (Retrofit/OkHttp), M36 (Hilt), M29 (Paging), M22 (image loading) |
| `android-unit-testing` | 10 | M39–M41 |
| `android-tools-technologies` | 30 | M43 (+ profiling to M42) |
| `android-system-design` | 28 | M45 (+ M28–M29) |
| `data-structures-algorithms` | 10 | M44 |
| `other-topics` | 17 | M15 (deep links), M17 (privacy), M46 (the rest) |

Four topics fan out across three or more tracks. That fan-out is the whole point
of revision 2 — and the reason the coverage check exists.

## 9. Documentation policy

Interview prep dies on stale sources.

- Every **module** has a `docHub`. Every **must-know chapter** has at least one
  `docs` entry; others are strongly encouraged.
- **First-party only** for `docHub`: `developer.android.com`, `kotlinlang.org`,
  `docs.oracle.com`, `github.com/android`. A blog post may appear in a chapter's
  `docs` only where no first-party page covers the ground, and is marked as such
  in its title.
- Prefer a **conceptual guide** over an API reference as the primary link; add
  the API reference as a second, `kind: "api"` entry when the signature matters.
- Link to **codelabs and samples** (`kind: "codelab"` / `"sample"`) where one
  exists — `github.com/android/compose-samples`, Now in Android, the Android
  Basics with Compose units. These are what turn theory into practice, and
  interviewers ask what you have built.
- **Never a naked URL.** Every entry has a title written as the page's own title,
  so a dead link is still identifiable.
- Version-sensitive statements carry their version inline ("stable since Kotlin
  2.4"), because a bare "recently" ages into a lie.
- A third-party link is dropped rather than followed through an **ownership
  change**. Verified 2026-09-19: `square.github.io` returns 404 for both
  Retrofit and OkHttp, and `github.com/square/{retrofit,okhttp}` now redirect to
  a different organisation. M28 therefore cites first-party pages only. The
  chapters do not depend on those links; a reader following a moved repository
  is the risk not worth taking on a public site.

As of this plan: Kotlin **2.4.0** is current stable (context parameters, explicit
backing fields now stable); the Compose compiler ships from the Kotlin
repository; Navigation 3 is documented alongside Navigation 2; the Play API 35
`targetSdk` deadline has passed.

## 10. Phases

Each phase ends with `node tools/validate-theory.js` exiting 0,
`node tools/check-doc-links.js` clean, and a manual read-through in a browser.

### Phase 0 — Skeleton, no content

1. `tools/validate-theory.js`, written first against §5. It fails; correct.
2. `tools/check-doc-links.js`.
3. `parseHash`/`generateHash` mode support and the `handleRouteChange` dispatch.
   Verify by hand that every existing hash form still resolves.
4. `js/theory.js` — overview renderer, module renderer, nine block renderers,
   `DOC_BASE` resolution.
5. `css/theory.css` and the three importance tokens.
6. Sidebar mode switch and track groups.
7. `data/theory/index.js` with all 8 tracks and an empty module array;
   `index.html` wiring.

**Done when:** `#theory` renders the eight tracks with honest "not written yet"
states, every existing route is unchanged, and both scripts pass on an empty
corpus.

### Phase 1 — Pilot: Track 2, Asynchrony & State (M7–M11)

Authored first, ahead of Track 1, deliberately. It is the track where the
structural bets are riskiest — M7 is a module with no corresponding question
topic, M8–M9 split one question topic in two, and M11 merges across two. If the
schema survives this track it will survive the rest.

**Done when:** all five modules read end to end, the cram filter leaves a
coherent subset, every `relatedQuestions` pair resolves, and the prerequisite
chain M7 → M8 → M9 → M10 → M11 validates. Expect §5 to be revised here and
nowhere later.

### Phase 2 — Track 1, Language Foundations (M1–M6)

The prerequisites for everything. Placed second so Phase 1's schema revisions
land before the largest language corpus is written.

### Phase 3 — Track 4, Building UI (M18–M25)

The most-interviewed track after language and async, and the one with the
richest first-party doc coverage.

### Phase 4 — Track 3, The Android Platform (M12–M17)

Absorbs the bulk of `data/android.js`'s 135 questions. Split into commits by
module.

### Phase 5 — Tracks 5 and 6, Data and Architecture (M26–M38)

The largest phase by module count; the point at which the curriculum becomes
usable as a complete senior-level revision path.

### Phase 6 — Track 7, Quality (M39–M43)

### Phase 7 — Track 8, Synthesis (M44–M46)

**Done when:** all 46 modules exist and validator check 14 reports no unmatched
`keyTopics`.

> **Met (2026-09-29).** 46 modules, 165 chapters, and the validator runs with
> zero warnings. Closing the last three took a real addition rather than a
> phrasing tweak: `synchronized` and `volatile` had no home anywhere in the
> curriculum, because §8.1 assigned `java`'s concurrency subsection to M6 and
> M6 was written without a concurrency chapter. M6 gained one — the JVM memory
> model, visibility versus atomicity, and the atomics — which also gives M40's
> dispatcher material and M42's GC pauses something to point back to. The
> coverage check found a genuine gap, which is what it is for.

### Phase 8 — Cross-cutting features

1. Search integration for theory chapters, badged in results.
2. Glossary at `#theory/glossary`, harvested from every `definition` block,
   alphabetised, each term linking to its chapter.
3. Cram mode as a shareable route.
4. Curriculum overview polish: prerequisite graph, per-track progress.
5. `docs/ARCHITECTURE.md`, `docs/CODEBASE.md`, `docs/FEATURES.md` updated to
   describe theory as a first-class mode.

## 11. Risks and open decisions

**Volume.** ~250 chapters at 400–900 words is 100–200k words of technical prose —
larger than revision 1, because a learning path cannot skip the connective
material a question bank can. This is the real cost of the plan and no schema
decision changes it. Phases are ordered so stopping after any one leaves a
coherent, shippable curriculum rather than a half-finished section: after Phase 2
the language and async tracks stand alone as a genuine resource.

**Payload.** Theory could add ~1.5MB of eagerly-loaded JavaScript. Phase 4 is the
point to measure. If total data crosses ~2MB the fix is `fetch()`-ing module
files on demand — which the per-module file split already makes cheap, and which
would be the first thing here to require a server rather than `file://`.
Deferred deliberately; not designed for now.

**Doc link rot.** Demonstrated, not hypothetical — this revision found two whole
sections had moved. §7.2 is the defence, and treating redirects as failures is
what keeps it working.

**Corpus drift.** A renamed or deleted question silently breaks
`relatedQuestions`. Validator check 7 is the whole defence and must run before
every commit touching either corpus.

**Losing material in the reorganisation.** The fan-out in §8.1 is where content
could quietly vanish. Check 14 is a warning rather than an error because
`keyTopics` phrasing will not always match theory prose — so it needs a human
reading its output each phase, not just a green exit code.

**Decisions made unilaterally, cheap to reverse:**

- Kotlin before the JVM, reversing revision 1.
- The View system placed after Compose.
- Threading (M7) as its own module with no question-topic counterpart.
- Chapters expanded by default, unlike question cards.
- Three importance tiers.
- Phase 1 piloting Track 2 rather than Track 1.

**Worth confirming before Phase 3:** whether Track 4 should carry a
`views-first` alternative ordering for readers maintaining legacy codebases. The
plan assumes one canonical path; supporting two orderings means the
`prerequisites` graph stops being a simple chain, and the sidebar has to express
a choice it currently cannot.

---

## Appendix A — Verified documentation hub map

Paths below were read from the live navigation of `developer.android.com` on
2026-08-15 while writing this plan, and are the starting map for authoring.
`tools/check-doc-links.js` re-verifies them in Phase 0 — treat this appendix as
a strong lead, not as ground truth after that date.

**Note the restructure:** Compose is `/develop/ui/compose/*` (not
`/jetpack/compose/*`) and background work is `/develop/background-work/*` (not
`/guide/background`). Older links redirect today; they are to be stored in their
current form.

### Fundamentals & platform
| Subject | Path |
|---|---|
| App fundamentals | `/guide/components/fundamentals` |
| Processes and threads | `/guide/components/processes-and-threads` |
| Intro to activities | `/guide/components/activities/intro-activities` |
| Activity lifecycle | `/guide/components/activities/activity-lifecycle` |
| Activity state changes | `/guide/components/activities/state-changes` |
| Tasks and the back stack | `/guide/components/activities/tasks-and-back-stack` |
| Processes and app lifecycle | `/guide/components/activities/process-lifecycle` |
| Parcelables and bundles | `/guide/components/activities/parcelables-and-bundles` |
| Fragments | `/guide/fragments` · `/guide/fragments/lifecycle` · `/guide/fragments/fragmentmanager` · `/guide/fragments/transactions` · `/guide/fragments/saving-state` |
| Intents and intent filters | `/guide/components/intents-filters` · `/guide/components/intents-common` |
| App links / deep links | `/training/app-links` · `/training/app-links/verify-applinks` |
| Package visibility | `/training/package-visibility` |
| App manifest | `/guide/topics/manifest/manifest-intro` |
| App resources | `/guide/topics/resources/providing-resources` |
| Configuration changes | `/guide/topics/resources/runtime-changes` |
| Localization | `/guide/topics/resources/localization` |

### Architecture
| Subject | Path |
|---|---|
| Guide to app architecture | `/topic/architecture` |
| Architecture recommendations | `/topic/architecture/recommendations` |
| Architecture learning pathway | `/courses/pathways/android-architecture` |
| UI layer | `/topic/architecture/ui-layer` |
| UI events | `/topic/architecture/ui-layer/events` |
| State holders and UI state | `/topic/architecture/ui-layer/stateholders` |
| State production | `/topic/architecture/ui-layer/state-production` |
| Data layer | `/topic/architecture/data-layer` |
| Offline first | `/topic/architecture/data-layer/offline-first` |
| Domain layer | `/topic/architecture/domain-layer` |
| Lifecycle | `/topic/libraries/architecture/lifecycle` |
| ViewModel | `/topic/libraries/architecture/viewmodel` |
| ViewModel factories | `/topic/libraries/architecture/viewmodel/viewmodel-factories` |
| ViewModel scoping APIs | `/topic/libraries/architecture/viewmodel/viewmodel-apis` |
| ViewModel saved state | `/topic/libraries/architecture/viewmodel/viewmodel-savedstate` |
| ViewModel cheat sheet | `/topic/libraries/architecture/viewmodel/viewmodel-cheatsheet` |
| Save UI states | `/topic/libraries/architecture/saving-states` |
| Coroutines with lifecycle-aware components | `/topic/libraries/architecture/coroutines` |
| Modularization | `/topic/modularization` · `/topic/modularization/patterns` |
| App startup | `/topic/libraries/app-startup` |

### Compose & UI
| Subject | Path |
|---|---|
| Compose documentation hub | `/develop/ui/compose/documentation` |
| Thinking in Compose | `/develop/ui/compose/mental-model` |
| Managing state | `/develop/ui/compose/state` |
| Lifecycle of composables | `/develop/ui/compose/lifecycle` |
| Modifiers | `/develop/ui/compose/modifiers` |
| Side effects | `/develop/ui/compose/side-effects` |
| Compose phases | `/develop/ui/compose/phases` |
| Architectural layering | `/develop/ui/compose/layering` |
| Performance | `/develop/ui/compose/performance` |
| Semantics | `/develop/ui/compose/accessibility/semantics` |
| CompositionLocal | `/develop/ui/compose/compositionlocal` |
| Layouts | `/develop/ui/compose/layouts` · `/layouts/basics` · `/layouts/custom` · `/layouts/intrinsic-measurements` · `/layouts/constraintlayout` |
| Lists and grids | `/develop/ui/compose/lists` |
| Design systems | `/develop/ui/compose/designsystems` · `/designsystems/material3` · `/designsystems/anatomy` |
| Migration | `/develop/ui/compose/migrate/migrate-xml-views-to-jetpack-compose` · `/migrate/strategy` · `/migrate/interoperability-apis` |
| Compose testing | `/develop/ui/compose/testing` · `/develop/ui/compose/testing/testing-cheatsheet` |
| Accessibility | `/develop/ui/compose/accessibility` |
| Adaptive apps | `/develop/adaptive-apps` · `/develop/adaptive-apps/guides/canonical-layouts` |
| Compose samples | `https://github.com/android/compose-samples` |

### Navigation
| Subject | Path |
|---|---|
| Navigation overview | `/guide/navigation` |
| Principles of navigation | `/guide/navigation/principles` |
| NavController | `/guide/navigation/navcontroller` |
| Type safety | `/guide/navigation/design/type-safety` |
| Back stack | `/guide/navigation/backstack` · `/backstack/multi-back-stacks` |
| Predictive back | `/guide/navigation/custom-back/predictive-back-gesture` |
| Navigation 3 | `/guide/navigation/navigation-3` · `/navigation-3/basics` · `/navigation-3/migration-guide` |
| Testing navigation | `/guide/navigation/testing/compose` |

### Kotlin & async
| Subject | Path / URL |
|---|---|
| Kotlin on Android | `/kotlin` |
| Kotlin first steps | `/kotlin/first` |
| Kotlin for Java developers | `/kotlin/add-kotlin` |
| Coroutines on Android | `/kotlin/coroutines` |
| Android KTX | `/kotlin/ktx` |
| Kotlin Multiplatform | `/kotlin/multiplatform` |
| Kotlin language docs | `https://kotlinlang.org/docs/home.html` |
| Coroutines guide | `https://kotlinlang.org/docs/coroutines-guide.html` |
| Flow | `https://kotlinlang.org/docs/flow.html` |
| Language features & proposals | `https://kotlinlang.org/docs/kotlin-language-features-and-proposals.html` |

### Data & background work
| Subject | Path |
|---|---|
| Background tasks overview | `/develop/background-work/background-tasks` |
| WorkManager (persistent work) | `/develop/background-work/background-tasks/persistent` |
| Foreground services | `/develop/background-work/services/fgs` |
| Alarms | `/develop/background-work/services/alarms` |
| Broadcasts | `/develop/background-work/background-tasks/broadcasts` |
| Keep the device awake | `/develop/background-work/background-tasks/awake` |
| Doze and app standby | `/training/monitoring-device-state/doze-standby` |
| DataStore | `/topic/libraries/architecture/datastore` |
| Paging 3 | `/topic/libraries/architecture/paging/v3-overview` · `/paging/v3-network-db` |
| Connectivity | `/develop/connectivity` |
| SQLite performance | `/topic/performance/sqlite-performance-best-practices` |

### Dependency injection
| Subject | Path |
|---|---|
| About DI | `/training/dependency-injection` |
| Manual DI | `/training/dependency-injection/manual` |
| Hilt | `/training/dependency-injection/hilt-android` |
| Hilt multi-module | `/training/dependency-injection/hilt-multi-module` |
| Hilt with Jetpack | `/training/dependency-injection/hilt-jetpack` |
| Hilt testing | `/training/dependency-injection/hilt-testing` |
| Hilt/Dagger cheat sheet | `/training/dependency-injection/hilt-cheatsheet` |
| Dagger basics | `/training/dependency-injection/dagger-basics` |

### Testing
| Subject | Path |
|---|---|
| Testing fundamentals | `/training/testing/fundamentals` |
| What to test | `/training/testing/fundamentals/what-to-test` |
| Test doubles | `/training/testing/fundamentals/test-doubles` |
| Testing strategies | `/training/testing/fundamentals/strategies` |
| Local tests | `/training/testing/local-tests` · `/local-tests/robolectric` |
| Instrumented tests | `/training/testing/instrumented-tests` |
| JUnit4 rules | `/training/testing/instrumented-tests/androidx-test-libraries/rules` |
| UI tests | `/training/testing/ui-tests` · `/ui-tests/screenshot` |
| Espresso | `/training/testing/espresso/basics` · `/espresso/idling-resource` · `/espresso/cheat-sheet` |
| UI Automator | `/training/testing/other-components/ui-automator` |
| CI basics | `/training/testing/continuous-integration` |

### Performance & tooling
| Subject | Path |
|---|---|
| Performance overview | `/topic/performance/overview` |
| Memory overview | `/topic/performance/memory-overview` · `/topic/performance/memory` |
| Keep your app responsive (ANRs) | `/topic/performance/anrs/keep-your-app-responsive` |
| Diagnose and fix ANRs | `/topic/performance/anrs/diagnose-and-fix-anrs` |
| Rendering | `/topic/performance/rendering` · `/rendering/overdraw` |
| Baseline profiles | `/topic/performance/baselineprofiles/overview` |
| Startup profiles | `/topic/performance/startupprofiles/overview` |
| App startup time | `/topic/performance/vitals/launch-time` |
| Android vitals | `/topic/performance/vitals` |
| Reduce app size | `/topic/performance/reduce-apk-size` |
| R8 / app optimization | `/topic/performance/app-optimization/enable-app-optimization` · `/app-optimization/keep-rules-overview` · `/app-optimization/full-mode` |
| System tracing | `/topic/performance/tracing` |
| Profilers | `/studio/profile` |
| Gradle build overview | `/build/gradle-build-overview` |
| Command-line tools | `/tools` |

### Courses & samples
| Subject | Path / URL |
|---|---|
| Android Basics with Compose | `/courses/android-basics-compose/course` (8 units) |
| Architecture learning pathway | `/courses/pathways/android-architecture` |
| Training index | `/courses` |
| Now in Android | `https://github.com/android/nowinandroid` |
| Architecture samples | `https://github.com/android/architecture-samples` |
