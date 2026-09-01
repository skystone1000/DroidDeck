# DroidDeck — Features

## Reading

**Topic navigation.** Every topic is a sidebar entry with its emoji and question
count. Topics that declare subsections render as a collapsible group; expanding
one collapses the others, so the sidebar stays the same height no matter how far
the reader has roamed.

**Question cards.** Cards render collapsed, showing only the number and the
question. Clicking — or pressing Enter/Space when focused — expands the answer.
`aria-expanded` and `aria-hidden` are kept in step, so a screen reader announces
the state correctly rather than reading collapsed answers aloud.

**Deep links.** The URL hash is the current view: `#kotlin-coroutines` or
`#android/activity-and-fragment`. Both forms are shareable and both restore
exactly what the sender was looking at. Scrolling through a topic with
subsections rewrites the hash to the section in view, so copying the URL at any
moment links to the right place.

## Search

Press `/` anywhere to focus the search field. Results appear after a 200ms
pause in typing.

Every term must match, so adding a word narrows rather than widens. Matches in
the question text and in tags rank far above matches buried in an answer body,
and a term that starts the question ranks highest of all. Matched terms are
highlighted in the dropdown.

Choosing a result navigates to its topic, scrolls the card into the centre of
the viewport and expands it — so a search lands on the answer, not near it.

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
| `localStorage` blocked | Theme still toggles, just does not persist |

No failure among them prevents reading a single question.
