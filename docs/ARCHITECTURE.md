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
js/code-highlight.js               (no dependencies)
js/diagrams.js                     (no dependencies)
js/theme.js                        (no dependencies)
js/three-bg.js                     (optional: THREE)
js/navigation.js                   (calls renderTopic from app.js at runtime)
js/search.js                       (calls generateHash, toggleAnswer at runtime)
js/app.js                          (uses everything; must be last)
```

The forward references from `navigation.js` and `search.js` into `app.js` are
safe because they are only ever called from event handlers, long after every
script has been parsed.

Every CDN dependency is optional. Three.js missing means no background canvas;
GSAP missing means cards reveal via a CSS class instead of a stagger. Neither
failure costs the reader a single question.

## State

There are exactly two pieces of persistent state:

| State | Home | Notes |
|---|---|---|
| Current view | `window.location.hash` | `#topic-id` or `#topic-id/subsection-id` |
| Theme | `localStorage.theme` | falls back to `prefers-color-scheme` |

Everything else is derived. There is no store, no observable, no cache of
rendered output. `renderTopic()` clears its container and rebuilds from the data
array, which is fast enough that memoising it would be premature.

Treating the hash as the source of truth means the back button, deep links, and
shared URLs all work for free — including links straight to a subsection.

## The scroll/hash feedback loop

Two things want to write the hash: navigation (the user clicked something) and
scrolling (the user has read their way into a new section). Naively letting both
write it produces a loop — scrolling updates the hash, `hashchange` fires,
`renderTopic` runs, the page jumps, which changes the scroll position.

The loop is broken by writing scroll-driven updates with `history.replaceState`,
which changes the URL without firing `hashchange`. Only genuine navigation goes
through `window.location.hash` and triggers a re-render.

## Rendering

`renderTopic()` is the single entry point for putting content on screen:

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

Answers are authored content injected with `innerHTML`, which is safe because
the data files are part of the repository — but anything derived from user input
is treated as hostile:

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
