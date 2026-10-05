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
project has to tests — run both before any commit touching `data/`.

```bash
node tools/validate-theory.js            # schema and cross-corpus integrity
node tools/validate-theory.js --coverage # plus every unmatched keyTopic
node tools/check-doc-links.js            # every documentation URL
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

### `tools/check-doc-links.js`
HEAD-probes every `docHub` and `docs[]` entry, caching results in
`tools/.doc-link-cache.json` (gitignored). A **redirect counts as a failure**,
because a redirect today is a 404 next year — but `sameDocument()` ignores a
differing `hl=` locale parameter, which is a redirect that means nothing.

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

## Adding a topic

1. `data/<topic-id>.js` declaring `const <name>Data = { ... }`.
2. A `<script>` tag in `index.html` **before** `data/index.js`.
3. The variable appended to the `topics` array in `data/index.js`.
4. An emoji in `topicIcons` in `js/navigation.js` (missing entries fall back
   to 📄).

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
