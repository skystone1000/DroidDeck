# Handoff prompt — DroidDeck design system → website

Paste the text below to your coding LLM, attached alongside `DroidDeck-Design-System.html`.

---

You are updating the UI of **DroidDeck**, an Android/Kotlin interview-prep web app (sidebar of tracks, a Questions tab of expandable Q&A rows, a Theory tab of module cards, dark + light themes).

Attached is `DroidDeck-Design-System.html` — the approved design system. It is a **specification, not code to copy**: it is a single static reference page. Read the values off it and re-implement them in this codebase's own framework and conventions.

## How to read the reference
It has 7 sections: 01 Brand · 02 Color · 03 Typography · 04 Space/shape/motion · 05 Category marks · 06 Components · 07 What changed and why. Every component specimen is shown in its real states, and most carry a "Changed:" note explaining the intent behind the change. Section 07 is the summary of required behavioural changes.

## Step 1 — tokens first
Before touching any component, create a single source of truth for tokens (CSS custom properties on `:root` / `[data-theme="light"]`, or the equivalent in the existing setup) and extract from Sections 02–04:

- Dark surfaces: canvas `#0A0910`, surface `#12101A`, raised `#1A1726`, border `#272235`; text `#F4F2F8`, muted `#A19BB4`, faint `#6E6885`.
- Light surfaces: canvas `#FAFAFC`, surface `#FFFFFF`, sunken `#F4F3F8`, border `#E6E3EF`; text `#171522`, muted `#5C566E`, faint `#8B8398`.
- Accent violet ramp 100/300/500/600 + wash — `#8B5CF6` on dark, `#7C3AED` on light (500 fails contrast on white at small sizes).
- Priority tiers, per theme: must-know rose, should-know amber, good-to-know neutral slate. Dark uses 12–14% alpha fills with a light text tone; light uses the solid tints shown in the light specimens.
- Type: Space Grotesk (display/wordmark), IBM Plex Sans (all body/UI), JetBrains Mono (code, counts, eyebrow labels). Scale display 44 / h1 28 / h2 20 / body 15 / small 13 / micro 11-caps-tracked. Body line-height 1.65, reading column max 72ch. All numerals `font-variant-numeric: tabular-nums`.
- Spacing 4pt scale, radii 6/10/14/full, motion 120ms hover · 200ms accordion `cubic-bezier(.2,.7,.3,1)` · no transition on theme switch.

Then replace hard-coded colours/sizes in the app with these tokens. Do not introduce any colour outside the system.

## Step 2 — required UI changes (Section 07)
1. **Remove all emoji** from sidebar, headings and metadata. Replace with the 28px monogram category tiles (radius 8, mono 11/500, hue at ~14% alpha background). One hue per track, used consistently for the tile, track heading and progress bar.
2. **Make progress first-class**: a checkbox on every question row (unchecked / checked / done-and-recessed states), `done/total` counts on sidebar sub-items, and a progress bar in the page header. Persist state locally.
3. **One priority signal**: delete the coloured left edge bar on question rows. Keep only the soft tier chip with its rank dot; the same dot appears in the filter pills.
4. **App bar**: move search next to the wordmark (max ~520px), keep the `/` shortcut chip, and replace the moon/sun icon button with an explicit two-state theme switch.
5. **Light theme is not an inversion**: use the light tier palette and 600-weight accent; drop the constellation backdrop below 3% opacity.
6. **Key topics**: show at most 6 chips plus a `+N more` expander.
7. **Question row expanded state**: answer copy at 15/1.7 capped to 72ch, code block with filename bar + copy action + line numbers, then actions `Mark as known` / `Review later` / `Open in Theory`.
8. **Module cards (Theory)**: lead with `X of Y chapters` and a progress bar instead of a bare chapter count; keep duration secondary.
9. Add the missing states shown in Section 06: empty state, skeleton loading, glossary term underline + definition popover, and the full button set including focus ring and disabled.

## Constraints
- Do not restructure information architecture, routing, or content. This is a visual/interaction pass.
- Keep both themes at parity — every component you touch must be verified in dark and light.
- Preserve keyboard access: visible focus ring (`0 0 0 3px` accent at 20% alpha), `/` to focus search, Enter/Space to expand a row.
- Hit targets ≥ 40px on touch; body text never below 13px.
- Ship in small reviewable commits, one component group at a time, in this order: tokens → app bar → sidebar → question row → filter bar → theory cards → states.

Start by listing the files you'll change and the token map you extracted, then wait for my go-ahead before editing.
