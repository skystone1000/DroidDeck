# DroidDeck — Navigation Refactor Handoff

**Goal:** promote **Interview Synthesis**, **Predict the Output** and **Glossary** to the same level as **Questions** and **Theory**, behind a persistent left icon rail.

**Reference build:** `DroidDeck-Rail-Nav.html` (standalone, opens offline). Source: `DroidDeck Rail Nav.dc.html`.
**Token/component spec:** `DroidDeck-Design-System.html` + `HANDOFF-PROMPT.md` — unchanged, still authoritative for colors, type, and component states. This document only overrides navigation.

---

## 1. The change in one sentence

Today there are two tabs (Questions | Theory) and Synthesis, Predict and Glossary live *inside* Theory's track list. After this change there are **five sibling modes** in a left rail, and **the sidebar's contents belong to the active mode** rather than to the app.

---

## 2. Information architecture

| # | Mode | Route | Unit of progress | Second-level nav (sidebar) |
|---|------|-------|------------------|---------------------------|
| 1 | Questions | `/questions` | questions known | 9 tracks → 20 sections, with `known/total` |
| 2 | Theory | `/theory` | chapters read | same 9 tracks, ordered as a reading path |
| 3 | Interview Synthesis | `/synthesis` | prompts rehearsed | 7 interview rounds, in loop order |
| 4 | Predict the Output | `/predict` | snippets solved | 7 snippet sets + right/wrong strip for the active set |
| 5 | Glossary | `/glossary` | terms seen | A–Z jump grid, then track as a filter |

Keep the old paths as permanent redirects: `/theory/synthesis → /synthesis`, `/theory/predict → /predict`, `/theory/glossary → /glossary`.

The 9 subject tracks are **no longer global navigation**. They remain the organising axis inside Questions and Theory, and a filter inside Glossary. Synthesis and Predict never show them as navigation — only as provenance chips ("Pulls from…").

---

## 3. The rail

- Fixed width **84px**, full height, `border-right: 1px solid #272235`, background `#0A0910`.
- Order top to bottom: brand mark, Questions, Theory, **1px divider**, Synthesis, Predict, Glossary, spacer, mode progress meter, theme toggle. The divider separates *study* modes from *drill* modes; do not remove it.
- Each item: 68px wide, icon box 22px above an 11px label, `border-radius: 11px`, `min-height: 40px` total hit area.
- Labels are abbreviated at this width: "Interview Synthesis" → **Synthesis**, "Predict the Output" → **Predict**. Full names go in the `title` attribute and in the mode header. Never abbreviate in the header, in search results, or in URLs.
- **Active** item: `background: #1F1B2E`, label `#F4F2F8` / 600, icon box tinted with the mode's accent at 16% fill and 30% border. **Inactive**: transparent, label `#A19BB4`, icon box `1.5px solid #4A4162`. **Hover** inactive: `background: #12101A`.
- Accents per mode: Questions `#8B5CF6`, Theory `#8B5CF6`, Synthesis `#F0ABFC`, Predict `#6EE7B7`, Glossary `#C6C1D4`. Accent appears only in the active icon box and the progress meter — not in body content.
- A `labelled` variant at **188px** (icon + full label on one line) exists for a settings-level preference. Ship compact by default.

---

## 4. The mode header (right of the rail, 64px, one row)

`Mode title` · divider · `mode meta` — spacer — `progress label + 88px meter` · divider · `search field (340px)`.

- Progress is **per mode, never a global total**: `38 / 135 KNOWN`, `11 / 57 READ`, `3 / 24 REHEARSED`, `6 / 84 SOLVED`, `41 / 68 SEEN`. A combined number across five different units is meaningless — do not add one.
- The meter fills with the active mode's accent.
- The search field is **flexible, not fixed**: `flex: 1; max-width: 340px; min-width: 170px`. Keep `flex-shrink: 0` on its icon and `/` chip so only the placeholder area compresses. A fixed `width: 340px` clips the field below ~990px.
- Search stays a single global field and now returns **results grouped by mode**, in rail order, with the mode name as the group header. A glossary term and a snippet are different actions and cannot share one flat list.

---

## 5. Keyboard

| Key | Action |
|-----|--------|
| `1`–`5` | switch mode, in rail order |
| `/` | focus search |
| `g` then letter | jump to letter (Glossary only) |
| `j` / `k` | next / previous item in the active list |
| `Enter` | expand focused question / reveal answer |
| `Esc` | collapse, or clear search |

Ignore all of these while focus is in an `input` or `textarea`. Show the digit in each rail item's tooltip.

---

## 6. State that must persist (localStorage or account)

- Active mode, and the last sub-selection **per mode** — returning to Questions restores the track you left, not track 1.
- Per-mode progress: questions known, chapters read, prompts rehearsed, snippet verdicts (right/wrong per snippet), terms seen.
- Theme choice.
- Restore on load before first paint to avoid a flash of the default mode.

---

## 7. Content requirements for the three promoted modes

**Interview Synthesis** — one prompt per screen, not a list. Required blocks: round label + duration, the question verbatim, **Answer spine** (numbered steps, each one line of instruction plus one of nuance), **Pulls from** (linked track chips), **Where candidates lose it** (3 short failure modes), **Follow-ups to expect** (cards linking to the owning track).

**Predict the Output** — one snippet per screen. Required blocks: set + position (`6 OF 12`), the code block with filename and a difficulty chip, 4 answer options as 44px rows, post-answer state (correct option outlined in `#6EE7B7`, "YOUR ANSWER · CORRECT" caption), **Why** callout with a left accent rule, then `Next snippet` / `Add to review` / link to the owning Theory chapter. Sidebar shows the per-snippet verdict strip.

**Glossary** — alphabetical sections with a letter heading, rule, and term count. Term card: term, optional `ASKED` chip, 2–3 sentence definition, and a `THEORY ›` backlink to the chapter that defines it. Every term must have that backlink; a term with no owning chapter is a content bug. Cards in `repeat(auto-fill, minmax(330px, 1fr))`.

---

## 8. Constraints

- No new colors, fonts, radii, or shadows — everything comes from the existing token set.
- Minimum 13px text, minimum 40px hit targets (44px for answer rows).
- Fixed-width elements keep `flex-shrink: 0`; labels and counts keep `white-space: nowrap` — the earlier layout bugs at narrow widths all came from omitting these.
- Sidebar is 272px and scrolls independently of the content column; the rail never scrolls.
- Do not change question, chapter, or term content in this pass. Navigation only.
- Below 1100px the sidebar collapses to a drawer; the rail stays. Below 720px the rail becomes a bottom bar with the same five items and the same order.

---

## 9. Definition of done

1. All five modes reachable from the rail and by `1`–`5`, with the correct accent and progress unit.
2. Sidebar contents change with the mode; no track list visible in Synthesis or Predict.
3. Old `/theory/*` URLs redirect.
4. Search results group by mode.
5. Mode + sub-selection + progress survive a reload.
6. No horizontal scroll at 1280px, and no clipped labels in the rail.
