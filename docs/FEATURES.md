# DroidDeck — Features

DroidDeck has two reading modes, switched from the top of the sidebar.
**Questions** is a bank to test yourself against. **Theory** is a curriculum to
learn from. They are cross-linked but separately organised, because the shape
that makes a good question bank is the wrong shape for learning.

## Reading

**Topic navigation.** Every topic is a sidebar entry with its emoji and question
count. Topics that declare subsections render as a collapsible group; expanding
one collapses the others, so the sidebar stays the same height no matter how far
the reader has roamed.

**Question cards.** Cards render collapsed, showing only the number and the
question. Clicking — or pressing Enter/Space when focused — expands the answer.
`aria-expanded` and `aria-hidden` are kept in step, so a screen reader announces
the state correctly rather than reading collapsed answers aloud.

**Deep links.** The URL hash is the current view: `#kotlin-coroutines`,
`#android/activity-and-fragment`, `#theory/compose-state` or
`#theory/compose-state/state-hoisting`. Every form is shareable and restores
exactly what the sender was looking at. Scrolling through a topic or a module
rewrites the hash to the section in view, so copying the URL at any moment links
to the right place.

## Theory

**A reading path, not a filing scheme.** 50 modules in 8 tracks, 179 chapters,
ordered so each idea arrives after the ideas it depends on. Modules are
deliberately not the question topics: some split, some merge, some exist only
here — nothing in the question bank teaches the Android threading model, though
three of its topics assume it.

**Importance tiers.** Every chapter is marked must-know, should-know or
good-to-know, shown as a badge and as a coloured edge on the card. A module
inherits its most important chapter's tier.

**Documentation, structurally.** Every module links a documentation hub and
every must-know chapter links the pages it is built on, typed as guide, API
reference, codelab, sample or course so you can tell which is which before
clicking. Links are stored as paths against one base and machine-checked, and a
redirect is treated as a failure — so they are current, not merely present.

**Test yourself.** Chapters close with links straight into the question bank,
which expand the relevant card on arrival. Theory and questions are two halves
of the same session.

**Prerequisites.** Each module names what to read first. On the overview, a card
shows only the prerequisites that come from *another* track — the ones the
track-ordered page cannot otherwise reveal.

**Drills.** The last four modules cover the machine coding round — the one
where an interviewer shares a link and asks for a working feature in fifty
minutes. They carry 24 drills: a task, a timebox, the things that lose marks,
and a solution sketch that stays collapsed until you have attempted it. Tier 1
is the five tasks that carry the round, so cram mode reduces the whole section
to those.

**Glossary.** `#theory/glossary` lists every term the curriculum defines, in one
alphabetised page, each linking back to the chapter that introduces it. It is
harvested from the chapters rather than written separately, so it cannot go
stale.

**Cram mode.** Filters everything down to must-know — module cards, chapters and
glossary terms. It lives in the URL as `?cram`, so a filtered revision view
survives a reload, persists as you move between modules, and can be sent to
someone else.

**Progress.** Mark a module read and the overview shows overall and per-track
bars. Marking is explicit: opening a module to check one table is not reading
it, and a bar that counted visits would flatter you into skipping things.
Progress is stored locally and never leaves the browser.

## Search

Press `/` anywhere to focus the search field. Results appear after a 200ms
pause in typing.

Search covers **both** corpora — 465 questions and 179 chapters — in one list.
Theory results carry a badge, because the destination is a different mode and
you should know that before the click rather than after it.

Every term must match, so adding a word narrows rather than widens. Matches in
the title and in tags rank far above matches buried in a body, and a term that
starts the title ranks highest of all. Matched terms are highlighted in the
dropdown. Chapter bodies are indexed including their code, so an API name finds
the chapter that shows it.

Choosing a question navigates to its topic, scrolls the card into the centre of
the viewport and expands it — so a search lands on the answer, not near it.
Choosing a chapter opens its module scrolled to that chapter.

## Themes

Dark by default, light on request, and the choice persists. On a first visit the
app follows the operating system's `prefers-color-scheme` instead of guessing.

The theme is a single attribute on `<html>`; every colour in the app is a custom
property keyed off it. The particle background observes the attribute and
recolours its mesh in place rather than rebuilding.

## Code

Kotlin, Java and XML snippets are highlighted in-browser with no external
highlighter. Keywords, strings, comments, numbers, annotations, XML tags and
attributes each get their own themed colour.

Each snippet has a header showing its title and language, and collapses
independently — long examples can be folded away while the prose stays visible.

## Diagrams

Three renderers, all SVG, all themed through CSS variables:

- **Flowchart** — nodes on a grid joined by arrows. Rounded rectangles for
  steps, diamonds for decisions, pills for terminals. Used for execution flow,
  layered architecture and cache lookup order.
- **Animation** — a vertical list of numbered steps connected by animated
  dashed arrows. Used for lifecycles and pipelines.
- **Sequence** — actors with dashed lifelines and labelled messages between
  them, including self-calls. Used for request round trips and IPC.

Lines draw themselves via `stroke-dashoffset` and nodes stagger in.

## Accessibility

- A skip link to main content, revealed on focus.
- Full keyboard operation: `/` for search, Escape to dismiss it, Enter/Space to
  expand cards and code blocks, visible `:focus-visible` outlines throughout.
- Landmark roles (`banner`, `navigation`, `main`, `search`) and an `aria-live`
  main region.
- `prefers-reduced-motion` disables the particle background entirely and
  collapses every animation and transition to a no-op — including the diagram
  draw-on, which resolves to its finished state rather than never appearing.

## Responsive behaviour

| Width | Behaviour |
|---|---|
| > 1024px | Full 280px sidebar, 320px expanded search |
| ≤ 1024px | Sidebar narrows to 260px, search narrows |
| ≤ 768px | Hamburger appears; sidebar becomes a drawer over a dimmed overlay |
| ≤ 480px | Header title hides, padding tightens, search compresses |

## Graceful degradation

Every third-party dependency is optional and every one of them is decorative:

| Missing | Consequence |
|---|---|
| Three.js | No background canvas |
| GSAP | Cards reveal with a CSS transition instead of a stagger |
| Google Fonts | System font stack via the `--font-sans` fallback chain |
| `localStorage` blocked | Theme still toggles and modules still open; neither choice persists |

No failure among them prevents reading a single question or chapter.
