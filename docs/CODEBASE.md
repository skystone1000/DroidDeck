# DroidDeck — Codebase guide

A map of every file, what it owns, and what to touch when you want to change
something.

## Stylesheets

The four stylesheets are layered deliberately and load in this order.

### `css/themes.css`
Design tokens only — no selectors beyond `:root`, `[data-theme="dark"]`,
`[data-theme="light"]` and the scrollbar rules. Every colour, shadow, radius and
transition duration in the app resolves to a custom property declared here.

**Change this to:** retheme the app, add an accent colour, adjust radii.
**Never:** put layout or component rules here.

### `css/styles.css`
The reset, the page skeleton (header, sidebar, main column, back-to-top), the
search field chrome, and all three responsive breakpoints.

**Change this to:** adjust the layout grid, header height, sidebar width, or
responsive behaviour. The header height (64px) is repeated as the sidebar's
`top` and in `scroll-padding-top`/`scroll-margin-top` — change all of them
together.

### `css/components.css`
Everything that renders *inside* the shell: nav items, topic headers, key topic
pills, question cards, answer typography, reference links, code blocks, syntax
token colours, diagram containers, search result rows.

**Change this to:** restyle a component.

### `css/theory.css`
Everything the theory mode adds: the sidebar mode switch, the curriculum
overview grid, module cards, the module header strip, the chapter rail, all
ten content block types, the glossary, progress bars, and the cram filter.

The three `--importance-*` tokens it consumes are declared in `themes.css`; this
file introduces no colours of its own.

**Change this to:** restyle a block type or the overview.
**Note:** drill tiers reuse the `--importance-*` tokens rather than introducing
their own — a tier-1 drill and a must-know chapter carry the same weight, and
two colour languages would say otherwise.
**Watch for:** the cram rule filters on `.importance-must` at three levels
(module cards, chapters, glossary entries) — the glossary's A–Z bar reuses the
chapter rail's markup and is excluded explicitly, or cram mode empties it.

### `css/animations.css`
Keyframes, reveal states, the theme crossfade, and the `prefers-reduced-motion`
overrides. Question cards are `opacity: 0` **here**, and are only made visible by
the `.revealed` class or by GSAP — if cards ever render invisible, this file is
where to look.

## Scripts

### `js/theme.js`
Three functions, no state beyond the DOM attribute and `localStorage`.
`initTheme()` runs first in `initApp()` because everything else reads the
resolved theme.

### `js/code-highlight.js`
`highlightCode(code, language)` → HTML string. Kotlin, Java and XML.

Two keyword lists and two passes. The important detail is that comments and
string literals are matched in **one** regex alternation (`JVM_ATOMS`,
`XML_ATOMS`) rather than sequentially — see ARCHITECTURE.md for why. Matches
become `\x00PH{n}\x00` placeholders, restored at the end by `restore()`, which
loops until no marker survives because placeholders can nest.

**To add a language:** add a keyword array, add a case to the `switch` in
`highlightCode`, and reuse `highlightJvm` if the comment/string syntax is
C-like.

### `js/diagrams.js`
`renderDiagram(container, config, type)` dispatches to `renderFlowchart`,
`renderAnimatedDiagram` or `renderSequenceDiagram`. All SVG is built with
`el(name, attrs)`, which skips null attribute values so callers can pass
optional attributes inline.

Shared helpers: `wrapLabel` (word-wrapping, since SVG text does not wrap),
`addText` (multi-line `<tspan>` blocks, vertically centred), `addArrowMarker`
(per-SVG namespaced marker id — reusing one id across diagrams breaks the
second one), and `trimToEdges` (pulls connector endpoints back to the node
boundary).

**To add a diagram type:** write a `renderX(container, config)` and add a case
to `renderDiagram`. Colour it with `var(--diagram-*)` so it follows the theme.

### `js/three-bg.js`
Self-contained IIFE. Returns early and silently if the canvas is absent, if
`THREE` is undefined, or if the user prefers reduced motion.

Tunables live at the top: `PARTICLE_COUNT`, `BOUNDS`, `LINK_DISTANCE`,
`LINK_UPDATE_INTERVAL`. The line buffer is allocated once at maximum size and
drawn partially via `setDrawRange`.

### `js/navigation.js`
Owns `topicIcons` (add an entry when you add a topic), both sidebars, the
active-state logic, hash parsing/generation, and the mobile drawer.

`sidebarMode` is derived from the hash in `handleRouteChange`, never set
directly — the mode switch navigates rather than toggling, so the switch and the
back button cannot disagree.

`parseHash()` splits `?cram` off the hash before segmenting, and returns
`{ mode, topicId, subsectionId, moduleId, chapterId, cram }`.
`generateTheoryHash(moduleId, chapterId, cram)` defaults `cram` to the current
route's flag, which is how the filter survives navigation.

`setActiveTopic()` collapses every group except the active one — this is
intentional, not a bug. `setActiveTheory()` matches on `[data-module-id]` rather
than a class so the flat glossary entry highlights like a module does.

### `js/theory.js`
The theory mode end to end: the overview, module pages, the glossary, the nine
block renderers, read progress and the cram toggle.

`renderBlock()` is the dispatch point — add a block type by adding a case and a
CSS rule. `renderSyntaxBlock`, `renderDiagramBlock` and `renderDrillBlock`
delegate to the question bank's own renderers rather than reimplementing them.

`renderDrillBlock()` collapses its solution sketch on creation. That is not a
style choice: reading the answer before attempting the drill is the one way to
get nothing out of it.

`collectGlossaryEntries()` harvests every `definition` block at render time.
Sorting keys on the first *alphanumeric* character, so `@Composable` files under
C rather than ahead of the alphabet.

Read progress is `localStorage['droiddeck:theory:read']`, an array of module
ids, wrapped in try/catch because it throws on `file://` in some browsers and in
private mode. Marks are explicit — nothing infers "read" from a visit.

### `js/search.js`
`buildSearchIndex()` flattens **both** corpora once at startup: 465 questions
and 179 chapters. Every entry carries `kind`, `title` and `context`, so the
scorer and renderer branch only on the badge and the destination.

Chapter text comes from `blockText()`, which flattens all ten block types
including code — an API name is often the query.

`search(query)` requires **every** term to match. Scoring: title hit `+10`,
prefix `+5`, word-boundary `+3`, tag hit `+4`, body hit `+1`. There is
deliberately **no per-kind weighting**; chapters place well on score alone, and
a constant boost only promoted weak body-only chapter matches.

`navigateToResult()` sets the hash; for a question it then waits 320ms before
scrolling, because the card does not exist until `renderTopic`'s 150ms
transition has completed. A chapter needs no such wait — its route scrolls
itself.

### `js/app.js`
The controller. `initApp()` is the boot sequence; `renderTopic()` is the single
path by which content reaches the screen.

Notable: `renderGroupedQuestions()` keeps a trailing "More" bucket for questions
whose `subsection` does not match any declared subsection, so a data typo
degrades to a misfiled question rather than a silently missing one.

`setupLazyLoading()` installs the `MutationObserver` that drives card reveals.
`revealCards()` clears GSAP's inline styles on completion and hands control back
to the stylesheet, otherwise GSAP's leftover `transform` fights the card's hover
transition.

## Tools

Node scripts, no dependencies, run by hand. These are the closest thing this
project has to tests — run **both validators** before any commit touching
`data/`.

```bash
node tools/validate-theory.js            # theory schema and cross-corpus integrity
node tools/validate-theory.js --coverage # plus every unmatched keyTopic
node tools/validate-questions.js         # question schema, all seven checks
```

Two more are slower and belong to a phase rather than a commit:

```bash
node tools/check-doc-links.js --all      # every documentation URL, both corpora
node tools/run-snippets.js               # compile and diff every stdout snippet
node tools/run-snippets.js --selftest    # prove the runner itself still works
```

### `tools/load-corpus.js`
Reads the data layer the way the browser does: concatenates the files in
`index.html` order and evaluates them as one script in a `vm` context, so the
globals see each other. Everything else here builds on it.

### `tools/validate-theory.js`
Fourteen checks. Exits 1 on any error; warnings never fail a run but are meant
to be read. The ones that catch real mistakes:

- **Check 7** resolves every `relatedQuestions` `{topicId, questionId}` against
  the question corpus. This has caught four invented ids during authoring.
- **Check 4** requires a prerequisite to have a *lower* order, so the reading
  path can never ask for knowledge it has not taught.
- **Check 13** restricts authored HTML to a tag allowlist and rejects inline
  handlers and `javascript:` URLs.
- **Check 14** matches every topic's `keyTopics` against the theory prose and
  warns on misses — the only signal that the reorganisation dropped a subject.
- **Check 15** validates drill blocks and holds the drill catalogue itself:
  `DRILL_IDS` is the list from the machine coding plan's Appendix A, an id
  outside it is an error, a duplicate is an error, and anything unwritten is a
  warning. Adding a drill means adding its id there first.

### `tools/schema.js`
The vocabulary both validators share — `TIERS`, `LANGUAGES`, `DIAGRAM_TYPES`,
`OUTPUT_KINDS`, `RUNNABLE_LANGUAGES`, the tag allowlist and `htmlIssues()`. It
exists so the two cannot drift: a must-know question and a must-know chapter
have to mean the same thing.

### `tools/validate-questions.js`
Seven checks over the question bank, which went unvalidated for far longer than
theory did and showed it. Exits 1 on any error.

- **Check 1** requires an `importance` from `TIERS`.
- **Check 2** requires ids unique within a topic, and asserts the single known
  cross-topic collision (`kotlin-multiplatform`) is the only one — a bare
  uniqueness check would have to be switched off to tolerate it and would then
  catch nothing.
- **Check 3** requires every must-know question to carry a `referenceLink`,
  mirroring the rule theory applies to must-know chapters. A question worth
  revising the night before is worth being able to check.
- **Check 4** validates `images[]`: `src` repo-relative and present on disk,
  `alt` over 20 characters, and `sourceTitle`/`sourceUrl` present. The
  attribution fields are a licence condition, so their absence is an error
  rather than a warning.
- **Check 5** validates `codeSnippets[].output` and refuses `kind: 'stdout'` on
  any language `run-snippets.js` cannot execute — an unrun Output pane is a
  guess wearing a costume.
- **Check 6** restricts snippet `language` to the set the highlighter knows.
- **Check 7** restricts authored HTML to the shared tag allowlist.

### `tools/check-doc-links.js`
HEAD-probes every `docHub` and `docs[]` entry, and with `--all` every question
`referenceLinks` entry too, caching results in `tools/.doc-link-cache.json`
(gitignored). A **redirect counts as a failure**, because a redirect today is a
404 next year — but `sameDocument()` ignores a differing `hl=` locale parameter,
which is a redirect that means nothing.

**Known blind spot:** it follows HTTP redirects and cannot see an HTML
meta-refresh. A stub page that answers 200 and refreshes elsewhere passes, which
is how sixteen references to `kotlinlang.org/docs/flow.html` kept dead anchors
through every run until Phase 4 read them by hand. See
`docs/verification-log.md`.

### `tools/run-snippets.js`
Compiles and runs every snippet recorded as `kind: 'stdout'` and diffs the real
output against `output.lines`. Kotlin and Java, both resolved from Android
Studio's bundled toolchain — `kotlinc` from the Kotlin plugin, `javac` and
`java` from the JBR. `--selftest` runs four fixtures, including a deliberate
negative, to prove the runner still detects a mismatch.

Finding a Java entry point is the fiddly part: it strips literals and comments,
builds a brace-depth map, considers only depth-0 type declarations, and picks
the class enclosing `void main(String`.

## Data

One file per topic in `data/`, each declaring a single global, plus
`data/index.js` which collects them into `topics`. The array order in
`index.js` is the sidebar order, and `topics[0]` is the default route.

Theory mirrors that shape in `data/theory/`: one file per module declaring one
global, and `data/theory/index.js` assembling `theoryTracks`, `theoryModules`
and the `theoryByModuleId` lookup. The `theoryModules` array order is the
reading path.

See ARCHITECTURE.md for the schema, `docs/plans/2026-08-15-theory-section.md`
for the theory schema in full, and FEATURES.md for what the fields drive.

### The question schema

```js
{
    id: 'android-activity-lifecycle',
    importance: 'must-know',          // required — must-know | should-know | good-to-know
    question: '...',
    answer: '<p>...</p>',             // allowed tag subset only, never <img>
    referenceLinks: [{ title, url }], // at least one when importance is must-know
    tags: ['activity', 'lifecycle'],
    images: [{                        // optional — vendored figures
        src: 'assets/img/activity-lifecycle.png',   // repo-relative, must exist
        alt: '...',                                 // over 20 characters
        caption: '<p>...</p>',                      // optional, allowed tags
        sourceTitle: 'The activity lifecycle',      // required — attribution
        sourceUrl: 'https://developer.android.com/...'
    }],
    hasDiagram: true,
    diagramType: 'animation',
    diagramConfig: { ... },
    codeSnippets: [{
        language: 'kotlin',
        title: '...',
        code: '...',
        output: {                     // optional
            kind: 'stdout',           // stdout | trace
            lines: ['...'],           // non-empty
            explain: '<p>...</p>'     // optional, allowed tags
        }
    }],
    subsection: 'activity-and-fragment'
}
```

Three fields carry rules worth restating, because each one exists to stop a
specific bad outcome:

- **`importance`** is stored on the question, not derived from the theory
  chapters that link it. A computed tier could not be overridden, and 47
  questions have no theory link at all and would silently get none.
- **`images[]`** is structured data rather than `<img>` in the answer string.
  That is the only reason a validator can check the path and the attribution,
  and it lets one file serve two questions — as `mad-arch-overview-data.png`
  and both Kotlin figures do.
- **`output.kind`** separates a re-runnable claim from a description. `stdout`
  is re-executed by `run-snippets.js`; `trace` is prose about behaviour and is
  labelled as such in the UI. Conflating them is the one failure this feature
  must not have.

**A hazard for codemods.** These files agree on schema but *not* on key order —
`data/jetpack-compose.js` puts `id` at the end of some question objects. A
script that anchors on "find the id, then the next `tags`" will write into the
following question, and the diff will look correct. Read the corpus back through
`load-corpus.js` afterwards, not the diff.

## Adding a topic

1. `data/<topic-id>.js` declaring `const <name>Data = { ... }`.
2. A `<script>` tag in `index.html` **before** `data/index.js`.
3. The variable appended to the `topics` array in `data/index.js`.
4. An emoji in `topicIcons` in `js/navigation.js` (missing entries fall back
   to 📄).
5. `node tools/validate-questions.js && node tools/validate-theory.js`.

## Adding a theory module

1. `data/theory/<module-id>.js` declaring `const <name>Module = { ... }` with
   `id`, `trackId`, `order`, `title`, `tagline`, `estimatedMinutes`, `docHub`
   and `chapters`.
2. A `<script>` tag in `index.html` **before** `data/theory/index.js`.
3. The variable appended to `theoryModules` in `data/theory/index.js`, in
   reading-path position.
4. `node tools/validate-theory.js && node tools/check-doc-links.js`.

No sidebar change is needed — tracks are declared once and modules attach by
`trackId`.
