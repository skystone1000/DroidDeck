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
Owns `topicIcons` (add an entry when you add a topic), sidebar construction,
the active-state logic, hash parsing/generation, and the mobile drawer.

`setActiveTopic()` collapses every group except the active one — this is
intentional, not a bug.

### `js/search.js`
`buildSearchIndex()` flattens all topics into `searchIndex` once at startup,
stripping HTML from answers so markup can never match a query.

`search(query)` requires **every** term to match. Scoring: question-text hit
`+10`, prefix `+5`, word-boundary `+3`, tag hit `+4`, answer-body hit `+1`.
Ties break toward the shorter question. Top 20 are returned.

`navigateToResult()` sets the hash, then waits 320ms before scrolling — the card
does not exist until `renderTopic`'s 150ms transition has completed and the DOM
has been rebuilt.

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

## Data

One file per topic in `data/`, each declaring a single global, plus
`data/index.js` which collects them into `topics`. The array order in
`index.js` is the sidebar order, and `topics[0]` is the default route.

See ARCHITECTURE.md for the schema and FEATURES.md for what the fields drive.

## Adding a topic

1. `data/<topic-id>.js` declaring `const <name>Data = { ... }`.
2. A `<script>` tag in `index.html` **before** `data/index.js`.
3. The variable appended to the `topics` array in `data/index.js`.
4. An emoji in `topicIcons` in `js/navigation.js` (missing entries fall back
   to 📄).
