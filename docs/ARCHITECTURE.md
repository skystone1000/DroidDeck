# DroidDeck — Architecture

## The shape of it

DroidDeck is a static single-page application with no build step. There is no
bundler, no transpiler, no package manager and no server. `index.html` loads a
fixed list of scripts in a fixed order, and every module attaches its functions
to the global scope. Opening the file from disk works; a static file server
works; that is the whole deployment story.

This is a deliberate constraint rather than an oversight. The content is the
product, and content that outlives its toolchain is worth more than content
locked behind a dependency tree that needs re-resolving every year.

## Load order is the dependency graph

Because there are no imports, script order in `index.html` *is* the dependency
declaration:

```
three.js, gsap, ScrollTrigger      (CDN, all optional)
data/*.js                          (14 topic files, each declaring one global)
data/index.js                      (assembles them into `topics`)
data/theory/*.js                   (46 module files, each declaring one global)
data/theory/index.js               (assembles them into `theoryModules`/`theoryTracks`)
js/code-highlight.js               (no dependencies)
js/diagrams.js                     (no dependencies)
js/theme.js                        (no dependencies)
js/progress.js                     (no dependencies)
js/three-bg.js                     (optional: THREE)
js/navigation.js                   (calls renderTopic from app.js at runtime)
js/theory.js                       (uses renderCodeBlock, renderDiagram)
js/search.js                       (calls generateHash, generateTheoryHash, toggleAnswer)
js/app.js                          (uses everything; must be last)
```

The forward references from `navigation.js` and `search.js` into `app.js` are
safe because they are only ever called from event handlers, long after every
script has been parsed.

## Colour lives in exactly one file

`css/themes.css` holds every colour, radius, duration and type step the app
uses. Nothing else may write a literal — a grep for `#rrggbb` or `rgba(` across
the other four stylesheets returns nothing, and that is a property worth keeping
rather than an accident.

The file has two layers, and the distinction matters when adding to it. The
**design system primitives** are read verbatim off
`docs/design/DroidDeck-Design-System.html`: surfaces, the violet ramp, the three
priority tiers, the nine category hues, the 4pt scale, four semantic radii and
two durations. The **semantic layer** below them names the meanings this
codebase needs that a palette does not — shadows, the syntax colours, the
diagram parts, success and warning — and every one of those resolves to a
primitive rather than to a new colour. So the rule that no colour enters outside
the system survives the fact that a code editor needs seven of them.

Two exceptions are declared in the file rather than hidden in a rule.
`--figure-plate` is white in both themes, because several vendored figures are
transparent PNGs drawn for a white page and would otherwise become an outline of
nothing on dark. And the accent has two working steps: 500 on dark, 600 on
light, because 500 fails contrast against white at small sizes.

Category hue is carried on a `data-hue` attribute rather than passed down as a
colour, so one attribute on a sidebar row, a track section or a page header
tints the tile, the heading, the progress bar and the count beneath it together.

## Two corpora, two modes

The app holds two bodies of content with different shapes and different
purposes. **Questions** are organised for lookup: fourteen topics, each a place
to file a question. **Theory** is organised for comprehension: eight tracks of
50 modules of 179 chapters, in one reading order where each idea arrives after
the ideas it depends on.

Neither is a view of the other. They are cross-linked — a chapter lists
questions to test yourself against, and search covers both — but they are
separately structured on purpose, and the module ids are independent of the
topic ids.

The reading mode is derived from the hash, not stored, so arriving on a theory
deep link puts the sidebar in theory mode with nothing to synchronise.

## Hand-written validation stands in for tests

There is no test framework, and a hand-authored corpus of 179 chapters and 465
questions with 553 outbound documentation links would rot silently. Four Node
scripts in `tools/` are the whole safety net. Two of them run before every
commit that touches either corpus:

- `validate-theory.js` enforces the theory schema — importance tiers, block
  shapes, unique ids, prerequisites that resolve to *earlier* modules, and the
  HTML subset authored content is allowed to use. Its most valuable check
  resolves every `relatedQuestions` reference against the question corpus, so
  renaming a question breaks the build rather than a link.
- `validate-questions.js` does the same for the question bank, which went
  unchecked for far longer and shows it. Seven checks: every question carries
  one of the three importance tiers; ids are unique within a topic and the one
  known cross-topic collision is asserted as the only one; every must-know
  question carries at least one `referenceLink`; vendored figures are
  repo-relative, present on disk, and carry their attribution; snippet output
  is `stdout` or `trace` and never claims `stdout` for a language the runner
  cannot execute; snippet languages are ones the highlighter knows; and
  authored HTML stays inside the allowed tag subset.

Two more are slower and run per phase rather than per commit:

- `check-doc-links.js` HEAD-probes every documentation URL across both corpora
  and treats a **redirect as a failure**, because a redirect today is a 404 next
  year. It cannot see an HTML meta-refresh, which is how sixteen dead anchors
  once survived it — recorded in `docs/verification-log.md` rather than papered
  over.
- `run-snippets.js` compiles and runs every snippet whose output is recorded as
  `stdout` and diffs the real output against what the corpus claims, so an
  "Output" pane is a re-checkable assertion rather than a guess.

All four read the data layer through `load-corpus.js`, which concatenates the
data files in `index.html` order and evaluates them as one script in a `vm`
context — the same way the browser sees them. That is what lets Node validate a
corpus that has no module system.

## The one directory of binary assets

`assets/img/` holds documentation figures **downloaded and committed**, never
hotlinked. Hotlinking would break the `file://` deployment this document
promises, and would make a page depend on a URL its owner has already moved
once.

Vendoring redistributes someone else's work, so the directory carries a
`README.md` that is part of the mechanism rather than a courtesy: per file, the
source page, the retrieval date and the licence, plus the licence check for
every source the corpus draws on. Google's documentation is CC BY 2.5,
Firebase's CC BY 4.0, kotlinlang.org's Apache 2.0 — all vendorable with
attribution. Gradle's is CC BY-NC-SA, which is not, so no Gradle figure exists
here.

The app-side half of that bargain is enforced: `validate-questions.js` fails a
figure with no `sourceUrl` or `sourceTitle`, and the renderer always emits the
attribution link. Figures render **unmodified**, on a white plate under the dark
theme rather than being inverted, because editing a diagram while keeping its
attribution misrepresents its author.

Every CDN dependency is optional. Three.js missing means no background canvas;
GSAP missing means cards reveal via a CSS class instead of a stagger. Neither
failure costs the reader a single question.

## State

| State | Home | Notes |
|---|---|---|
| Current view | `window.location.hash` | `#topic-id[/subsection-id]`, or `#theory[/module-id[/chapter-id]]` |
| Cram filter | the same hash, as `?cram` | so a filtered revision session is shareable |
| Theme | `localStorage.theme` | falls back to `prefers-color-scheme` |
| Read modules | `localStorage['droiddeck:theory:read']` | explicit marks only; wrapped in try/catch |

Everything else is derived. There is no store, no observable, no cache of
rendered output. `renderTopic()` clears its container and rebuilds from the data
array, which is fast enough that memoising it would be premature.

Treating the hash as the source of truth means the back button, deep links, and
shared URLs all work for free — including links straight to a subsection or a
chapter.

`theory` is a **reserved first segment**, which is why the route is
`#theory/<module>` rather than `#<topic>/theory` — the latter would collide with
the subsection namespace. `glossary` is reserved too, and the validator refuses
either as a module id.

Cram mode lives in the hash rather than in a variable because its whole purpose
spans modules: a filter that resets on navigation is useless for revision. Every
theory link is built through `generateTheoryHash`, which carries the flag by
default, so the state propagates without being threaded through call sites.

## The scroll/hash feedback loop

Two things want to write the hash: navigation (the user clicked something) and
scrolling (the user has read their way into a new section). Naively letting both
write it produces a loop — scrolling updates the hash, `hashchange` fires,
`renderTopic` runs, the page jumps, which changes the scroll position.

The loop is broken by writing scroll-driven updates with `history.replaceState`,
which changes the URL without firing `hashchange`. Only genuine navigation goes
through `window.location.hash` and triggers a re-render.

## Rendering

`handleRouteChange()` dispatches on the parsed mode to one of four renderers:
`renderTopic`, `renderTheoryOverview`, `renderTheoryModule` and
`renderTheoryGlossary`. Each owns the container completely — clear, rebuild,
sync the sidebar, `replaceState` — so no two of them can leave state behind for
the next.

The theory renderers reuse the question bank's `renderCodeBlock()` and
`renderDiagram()` wholesale, so a snippet looks and behaves identically in both
modes. The ten block types are one `switch` in `renderBlock()`; a new block
type is a case there plus a CSS rule, and nothing else in the app learns about
it.

The tenth type, `drill`, is the only one that is not prose in a costume: it
carries a task, a timebox and a solution sketch, and the validator holds the
catalogue of which drills must exist. Drills are countable and filterable
because the section needs both — cram mode reduces 24 of them to the 5 that
carry the round.

The glossary is **harvested at render time** from every `definition` block
rather than authored. A hand-maintained list would drift from the chapters
within a month; a derived one cannot.

`renderTopic()` is the single entry point for the question bank:

1. Fade the container out (`.topic-transitioning`, 150ms).
2. Clear it and rebuild: header, key topic pills, then either a flat numbered
   list of cards or cards grouped under subsection headings.
3. Fade back in, sync the sidebar's active state, `replaceState` the hash.
4. Scroll to the target subsection, or to the top.

Cards render collapsed. Answer HTML, code blocks and diagram containers are all
built up front — only the diagram *SVG* is deferred, by 100ms, so the container
has been laid out before it is measured.

Reveal animation is driven by a `MutationObserver` on the topic container rather
than by the render function calling into GSAP directly. That keeps the animation
concern out of the rendering path: anything that appends a `.question-card`,
from any code path, animates correctly.

## Security posture

Answers and theory blocks are authored content injected with `innerHTML`, which
is safe because the data files are part of the repository — and both validators
restrict authored HTML to a fixed tag subset and reject inline event handlers
and `javascript:` URLs, so the assumption is enforced rather than trusted.

`<img>` is deliberately **outside** that tag subset. Figures arrive as a
structured `images[]` field and are built by `renderQuestionImage()`, which sets
`src` and `alt` as properties rather than interpolating them into markup. That
is what makes the checks in the previous section possible at all: a validator
can assert that a path is repo-relative and exists on disk, and it cannot assert
anything about an `<img>` buried in an HTML blob.

Anything derived from user input is treated as hostile:

- Search result text is HTML-escaped before `<mark>` wrapping.
- Query terms are regex-escaped before being compiled into a pattern.
- Question text, titles and code all go through `textContent` or the escaping
  path in `highlightCode()`.

## Where the bodies are buried

**Syntax highlighting** matches comments and string literals in a single regex
alternation rather than in sequential passes. They mutually exclude each other,
so the earliest opener must win — sequential passes get either `"a // b"` or
`// says "hi"` wrong depending on the order chosen. Matches are then swapped for
`\x00PH{n}\x00` placeholders so a later pass cannot reach inside markup an
earlier one produced.

**Diagram connectors** trim their endpoints back to the node boundary before
drawing, so arrowheads land on the edge of a shape rather than being painted
underneath it.

**The particle background** allocates its line buffer once at maximum size and
varies `setDrawRange` as links come and go, instead of reallocating geometry
every frame. Links are recomputed every third frame, and the loop idles entirely
while the tab is hidden.
