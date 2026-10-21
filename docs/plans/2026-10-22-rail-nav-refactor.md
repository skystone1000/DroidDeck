# Rail Navigation Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Commit discipline:** `CLAUDE.md` governs. Commit dates are hand-set — read `git log -6 --format='%h %ad %s' --date=format:'%Y-%m-%d %H:%M'`, count commits on the newest date, stay on it until it holds 10–12, then move to the next day. Times are drawn at random from 09:00–22:00 and must strictly increase within a day. Timezone `+0530`. The newest commit as of writing is **2026-10-21 20:47**, which is the ninth on that date — so this plan's first two commits land on 2026-10-21 and the rest roll forward from 2026-10-22.
>
> **Every commit needs a prose body.** Task A1 shows the full form. Where a later task's `git commit` line carries only a subject, that is an elision for length, not permission to skip the body — write the paragraph explaining *why*, in full sentences, as `CLAUDE.md` requires. The diff already shows the what.

**Goal:** Promote Interview Synthesis, Predict the Output and Glossary out of Theory's track list into five sibling modes behind a persistent left icon rail, and put a real data structure under the promotion so a sixth mode is one registry entry rather than a fifth refactor.

**Architecture:** A new declarative **mode registry** (`data/modes.js`) becomes the single source of truth for what a mode is — its route, rail position, keyboard digit, accent, sidebar kind, and its own unit of progress. Routing, the rail, the contextual sidebar, the mode header, search grouping and persistence all read from it rather than from five separate `if (mode === 'theory')` branches. Two supporting data changes make the registry honest: `theoryTracks` gains a `scope` field separating the seven *subject* tracks from the two tracks that have become modes, and each question topic gains a `trackId` so Questions and Theory finally share one organising axis. Content shape for the promoted modes is extended with **optional, validated** fields (`spine`, `pullsFrom`, `followUps` on drills; `options`/`answer` on predicts) so the richer screens in the mock can be authored later without a second migration.

**Tech Stack:** No build step, no bundler, no package manager. Plain ES5+/DOM globals loaded in a fixed order by `index.html`. CSS custom properties in `css/themes.css`. Node scripts in `tools/` stand in for a test suite. Read `docs/ARCHITECTURE.md` before touching load order.

---

## 0. What is actually there, versus what the mock assumes

The reference build (`docs/design/Rail-Nav/DroidDeck-Rail-Nav.html`) was drawn against partly real and partly placeholder numbers. Every count below was measured from the corpus with `tools/load-corpus.js`, and **the implementation must compute these, never hard-code them**.

| Mode | Mock says | Corpus actually holds | Unit |
|---|---|---|---|
| Questions | 9 tracks · 135 questions | **14 topics, 465 questions, 28 subsections** across 7 subject tracks | questions known |
| Theory | 9 tracks · 57 chapters | **7 subject tracks, 43 modules, 154 chapters** (57 modules / 203 chapters *including* the two promoted tracks) | chapters read |
| Synthesis | 7 rounds · 24 prompts | **7 modules, 25 chapters, 24 drill blocks** ✅ exact match | prompts rehearsed |
| Predict | 7 sets · 84 snippets | **7 modules, 24 chapters, 80 predict blocks** | snippets solved |
| Glossary | 26 letters · 68 terms | **68 definition blocks** ✅ exact match | terms seen |

Two consequences that shape the whole plan:

1. **"24 prompts" are the 24 `drill` blocks** and **"68 terms" are the 68 `definition` blocks.** The designer counted the real corpus. So Synthesis is not a new content type to be written — it is the drill block promoted to one-per-screen, and Glossary is the existing harvested list given its own mode.
2. **The mock's nine-track Questions sidebar is fiction.** It lists tracks the app does not have (`Build & Dependency Injection`, `Security & Release`) and omits ones it does. The real shape after this refactor is **seven** subject tracks, because `synthesis` and `output` stop being sidebar tracks and become modes. Ship seven and say so.

### Where the current code is

| Concern | Lives in | Line refs |
|---|---|---|
| Hash parse / route dispatch | `js/navigation.js` | `parseHash()` 455, `handleRouteChange()` 493 |
| Two-tab mode switch | `js/navigation.js` | `buildModeSwitch()` 102 |
| Sidebar (questions + theory) | `js/navigation.js` | `renderSidebar()` 79, `buildQuestionNav()` 143, `buildTheoryNav()` 160 |
| Category marks + hues | `js/navigation.js` | `topicMarks` 20, `trackMarks` 38 |
| Theory renderers | `js/theory.js` | `renderTheoryOverview()` 261, `renderTheoryModule()` 721, `renderTheoryGlossary()` 568 |
| Glossary harvest | `js/theory.js` | `collectGlossaryEntries()` 531 |
| Drill / predict renderers | `js/theory.js` | `renderDrillBlock()` 1329, `renderPredictBlock()` 1402 |
| Progress store | `js/progress.js` | whole file |
| Question renderer | `js/app.js` | `renderTopic()` 33 |
| Search index + results | `js/search.js` | `buildSearchIndex()` 24, `renderSearchResults()` 202 |
| Layout | `css/styles.css` | `.header` 80, `.sidebar` 343, `.main-content` 378 |
| Tokens | `css/themes.css` | hues 129–139 |

---

## 1. Decisions

These are settled before any task starts. Where a call was genuinely arguable it is marked **⚖** with the reasoning and the fallback.

### 1.1 Route shape

Five reserved first segments: `questions`, `theory`, `synthesis`, `predict`, `glossary`. None collides with any of the 14 topic ids or 57 module ids (verified).

```
#questions/<topicId>[/<subsectionId>][?tier=must,should]
#theory/<moduleId>[/<chapterId>][?cram]
#synthesis/<moduleId>[/<drillId>]
#predict/<moduleId>[/<snippetId>]
#glossary[?letter=K][?track=language]
```

**Legacy routes that must keep working** (real shared links exist for all of them):

| Old | New |
|---|---|
| `#<topicId>[/<subsectionId>]` — bare, no prefix | `#questions/<topicId>[/<subsectionId>]` |
| `#theory/glossary` | `#glossary` |
| `#theory/<7 synthesis module ids>[/<chapterId>]` | `#synthesis/<moduleId>[/<chapterId>]` |
| `#theory/<7 predict module ids>[/<chapterId>]` | `#predict/<moduleId>[/<chapterId>]` |

The handoff writes these as `/theory/synthesis → /synthesis`. In this codebase those paths do not exist as written — the real old paths are the fourteen module ids listed above. The redirect table is derived from `trackId`, not hand-listed, so it cannot fall out of step.

Redirects use `location.replace()` on the hash so the back button does not trap the reader on the old URL.

### 1.2 The mode registry — the data structure change worth making

Today "which sidebar, which counter, which accent, which route" is answered in four files. `buildModeSwitch()` hard-codes two modes; `handleRouteChange()` hard-codes the theory/questions fork; `progress.js` has five differently-shaped counters; `theory.js` owns `GLOSSARY_ROUTE` privately. Adding a sixth mode later means editing all four.

`data/modes.js` collapses that to one array of five records. Every consumer — router, rail, sidebar, mode header, search grouping, keyboard map, persistence — reads it. This is the change the request asked for, and it is the reason the rest of the plan is short.

### 1.3 Track scope — `theoryTracks` gains `scope`

`synthesis` and `output` remain track ids on their 14 modules (no module is re-tracked, no content moves). They gain `scope: 'mode'`; the other seven gain `scope: 'subject'`. The Questions and Theory sidebars list subject tracks only. Synthesis and Predict consume their own track's modules. Nothing else in the corpus changes.

This is strictly better than deleting the two tracks: the theory data keeps one uniform shape, `modulesInTrack()` keeps working, and the validator's prerequisite ordering is untouched.

**Theory shrinks to seven tracks, 43 modules, 154 chapters**, and stops rendering the promoted modules anywhere — no track section, no card, no glossary link in its header (Task C4). Prerequisites make this clean: every dependency runs *from* a promoted module *into* a subject module and never the other way, so nothing left in Theory refers forward to anything that left. The one thing that stays is the in-chapter term underline and its hover popover — that is prose behaviour, not navigation.

### 1.4 Question topics gain `trackId`

`js/navigation.js:20` already encodes this mapping — implicitly, as a hue, with the comment *"a topic takes the hue of the theory track its subject belongs to."* Making it explicit is what lets the Questions sidebar group by track, lets the Glossary filter by track, and lets a Synthesis "Pulls from" chip resolve in both directions. Hue then **derives** from `trackId` instead of being duplicated, removing a place where the two can drift.

| Topic | `trackId` | Note |
|---|---|---|
| `kotlin` | `language` | |
| `java` | `language` | |
| `data-structures-algorithms` | `language` | **⚖** its theory module sits in the `synthesis` track, which is no longer a sidebar track. `language` is the closest subject home (collections, complexity). Fallback: leave it untracked and let it fall into "Everything else". |
| `kotlin-coroutines` | `async` | |
| `kotlin-flow-api` | `async` | **⚖** hue moves teal → sky, matching coroutines. The file's own comment says the *monogram*, not the hue, distinguishes a shared pair — so this is the documented intent, not a regression. Fallback: keep `hue` as an explicit optional override on the topic. |
| `android` | `platform` | |
| `jetpack-compose` | `ui` | |
| `android-libraries` | `data` | |
| `android-architecture` | `architecture` | |
| `design-pattern` | `architecture` | |
| `android-system-design` | `architecture` | **⚖** its theory module sits in `synthesis`. `architecture` is the closest subject home. Fallback: "Everything else". |
| `android-unit-testing` | `quality` | |
| `android-tools-technologies` | `quality` | |
| `other-topics` | *(none)* | Renders in an **"Everything else"** group at the bottom of the sidebar — one rule, no invented track id. |

### 1.5 Colour — four substitutions, declared not hidden

`css/themes.css` is the only file allowed to hold a literal, and the handoff forbids new colours. Four of the five mode accents already exist as tokens. The exceptions:

| Spec value | Resolution |
|---|---|
| Questions / Theory `#8B5CF6` | `--accent-500` ✅ exact |
| Synthesis `#F0ABFC` | `--hue-fuchsia-ink` ✅ exact (dark) |
| Glossary `#C6C1D4` | `--hue-slate-ink` ✅ exact (dark) |
| Predict `#6EE7B7` | **substitute `--hue-teal-ink` (`#5EEAD4`)** — `#6EE7B7` is emerald-300 and is not in the ramp. Adding it would be a tenth hue, which `css/themes.css:129` forbids in writing. |
| Rail active row `#1F1B2E` | **substitute `--ds-raised` (`#1A1726`)**, exposed as a semantic alias `--rail-item-active: var(--ds-raised)`. `#1F1B2E` sits between `--ds-raised` and `--accent-wash` and is in neither. |
| Rail inactive icon border `#4A4162` | **substitute `--ds-border` (`#272235`)**, aliased as `--rail-icon-border`. `#4A4162` does appear in `css/themes.css` — but at lines 210 and 223, inside the **light** block, as `--tier-good-ink` and `--hue-slate-ink`. It is not a dark-theme value, and borrowing a light token for a dark border would be worse than using the border colour the system already declares. |

**The rail must be tokenised, not painted `#0A0910`.** The app ships full light-theme parity and the handoff only specifies the dark values. Rail background is `--ds-canvas`, border is `--ds-border`, and both themes must be verified.

### 1.6 Content: what this pass does *not* author

Handoff §8: *"Do not change question, chapter, or term content in this pass. Navigation only."* That rules out writing 24 answer spines and 320 multiple-choice options. So this pass **carves and validates the slots** and renders them when present:

| Mode | Ships now, from existing data | Optional new field, validated when present |
|---|---|---|
| Synthesis | round label + duration (`minutes`), question verbatim (`prompt`), "Where candidates lose it" (`watchFor`), solution sketch (`sketch`) | `spine: [{ do, nuance }]`, `pullsFrom: [{ trackId, moduleId, chapterId }]`, `followUps: [{ question, moduleId, chapterId }]` |
| Predict | prompt, code, `output.explain` as the **Why** callout, `distractor`, reveal → **self-graded** `Got it right` / `Got it wrong` | multiple-choice options are a separate project with its own plan — [`2026-10-23-predict-answer-options.md`](2026-10-23-predict-answer-options.md) — and are deliberately not scoped here |
| Glossary | term, definition, `important` → **ASKED** chip, `THEORY ›` backlink (already carried by `collectGlossaryEntries()`), track filter (derived from `trackId`) | — nothing needed |

The self-graded verdict is what makes the right/wrong strip and the `n / 80 SOLVED` counter real with zero authoring. The options plan replaces one function — `renderAnswerControl(block)` — set by set, and writes the same storage key, so there is no migration and no second refactor.

---

## 2. File structure

**Created**

| File | Responsibility |
|---|---|
| `data/modes.js` | The five mode records. Declaration only — no DOM, no storage. Loads after `data/theory/index.js`, before `js/*`. |
| `js/rail.js` | Renders the rail, the mode header row, and the keyboard map. Reads `appModes`. |
| `js/sidebar.js` | The four contextual sidebar kinds (`tracks`, `rounds`, `sets`, `alphabet`). Lifted out of `navigation.js`, which keeps routing only. |
| `js/synthesis.js` | `renderSynthesisOverview()`, `renderSynthesisPrompt()`. |
| `js/predict.js` | `renderPredictOverview()`, `renderPredictSnippet()`. |
| `js/glossary.js` | `renderGlossary()`, moved out of `theory.js`. |
| `css/rail.css` | Rail, mode header, bottom bar. |
| `tools/validate-nav.js` | Validates the mode registry, track scopes, topic `trackId`s, route reservation, and the new optional block fields. |

**Modified**

| File | Change |
|---|---|
| `index.html` | Rail + mode-header markup; inline head script for pre-paint restore; five new `<script>` tags in load order. |
| `data/index.js` | `topicTracks` map (topic id → track id). |
| `data/theory/index.js` | `scope` on each of the nine tracks. |
| `js/navigation.js` | Routing only. `parseHash`/`generateHash` rewritten around the registry; `buildModeSwitch`, `buildQuestionNav`, `buildTheoryNav`, `buildTrackGroup` move to `sidebar.js`; `topicMarks` loses its `hue` field. |
| `js/progress.js` | `modeProgress(modeId)` returning `{done,total,noun}`; new verdict / rehearsed / seen stores. |
| `js/theory.js` | Glossary code deleted (moved); `renderDrillBlock` and `renderPredictBlock` gain the optional-field branches. |
| `js/search.js` | Results grouped by mode, in rail order. |
| `js/app.js` | `initApp()` restores mode; `/`-key handler joins the full keyboard map. |
| `css/styles.css` | `.header`/`.sidebar`/`.main-content` offsets shift right by the rail width. |
| `css/themes.css` | Three semantic aliases (§1.5). |
| `CLAUDE.md`, `docs/ARCHITECTURE.md` | New validator in the pre-commit list; the routing and state sections rewritten. |

**Load order** (append to `index.html`, after `data/theory/index.js`, and the `js/` block re-ordered):

```
data/modes.js            ← after data/theory/index.js, before any js/
js/code-highlight.js
js/diagrams.js
js/theme.js
js/progress.js           ← now reads appModes
js/three-bg.js
js/navigation.js         ← routing only
js/sidebar.js            ← new; uses navigation's generateHash at runtime
js/rail.js               ← new
js/theory.js
js/synthesis.js          ← new
js/predict.js            ← new
js/glossary.js           ← new
js/search.js
js/app.js                ← last, as always
```

---

# Phase A — Structure

No visible change. The app looks identical at the end of Phase A; the machinery underneath is new. Five commits.

## Task A1: Declare track scope

**Files:**
- Modify: `data/theory/index.js:15-25`
- Test: `tools/validate-nav.js` (created here)

- [ ] **Step 1: Write the failing check**

Create `tools/validate-nav.js`:

```js
/* ==========================================================================
   Navigation registry validation.

   The two corpus validators check content. This one checks the structure the
   navigation is built on: that every track declares whether it is a subject or
   a mode, that every question topic names a subject track, that the five mode
   routes are reserved against both id spaces, and that the optional fields the
   promoted modes render are well formed wherever an author has written one.

   Runs before every commit, alongside validate-theory.js.
   ========================================================================== */

const { loadCorpus } = require('./load-corpus.js');

const SUBJECT = 'subject';
const MODE = 'mode';
const MODE_TRACKS = ['synthesis', 'output'];

const errors = [];
function fail(where, message) { errors.push(`${where}: ${message}`); }

function checkTrackScope(theoryTracks) {
    theoryTracks.forEach((track) => {
        if (track.scope !== SUBJECT && track.scope !== MODE) {
            fail(`track ${track.id}`, `scope must be '${SUBJECT}' or '${MODE}', got ${JSON.stringify(track.scope)}`);
        }
        const expected = MODE_TRACKS.includes(track.id) ? MODE : SUBJECT;
        if (track.scope !== expected) {
            fail(`track ${track.id}`, `scope should be '${expected}'`);
        }
    });

    const subjects = theoryTracks.filter((t) => t.scope === SUBJECT);
    if (subjects.length !== 7) {
        fail('tracks', `expected 7 subject tracks, found ${subjects.length}`);
    }
}

function main() {
    const { theoryTracks } = loadCorpus();
    checkTrackScope(theoryTracks);

    if (errors.length) {
        console.error(`\n${errors.length} problem(s):\n`);
        errors.forEach((e) => console.error(`  ✗ ${e}`));
        process.exit(1);
    }
    console.log('✓ navigation registry OK');
}

main();
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node tools/validate-nav.js
```

Expected: 9 errors, one per track — `scope must be 'subject' or 'mode', got undefined` — plus `expected 7 subject tracks, found 0`.

- [ ] **Step 3: Add the field**

In `data/theory/index.js`, replace the `theoryTracks` array:

```js
/* `scope` is what separates a track the sidebar lists from a track that has
   become a mode of its own. The seven subjects are the organising axis inside
   Questions and Theory and a filter inside Glossary; `synthesis` and `output`
   still own their modules, but the rail addresses them directly and they never
   appear in a track list again. No module is re-tracked by this field — it
   describes where a track is *shown*, not what it contains. */
const theoryTracks = [
    { id: 'language',     title: 'Language Foundations',           order: 1, scope: 'subject' },
    { id: 'async',        title: 'Asynchrony & State',             order: 2, scope: 'subject' },
    { id: 'platform',     title: 'The Android Platform',           order: 3, scope: 'subject' },
    { id: 'ui',           title: 'Building UI',                    order: 4, scope: 'subject' },
    { id: 'data',         title: 'Data & Background Work',         order: 5, scope: 'subject' },
    { id: 'architecture', title: 'Architecture & Design',          order: 6, scope: 'subject' },
    { id: 'quality',      title: 'Testing, Performance & Tooling', order: 7, scope: 'subject' },
    { id: 'synthesis',    title: 'Interview Synthesis',            order: 8, scope: 'mode' },
    { id: 'output',       title: 'Predict the Output',             order: 9, scope: 'mode' }
];

/** The seven the sidebar lists, in reading order. */
function subjectTracks() {
    return theoryTracks.filter((t) => t.scope === 'subject').sort((a, b) => a.order - b.order);
}
```

- [ ] **Step 4: Run both validators**

```bash
node tools/validate-nav.js && node tools/validate-theory.js
```

Expected: `✓ navigation registry OK` then the theory validator's usual pass.

- [ ] **Step 5: Commit**

```bash
git add data/theory/index.js tools/validate-nav.js
GIT_AUTHOR_DATE="..." GIT_COMMITTER_DATE="..." git commit -m "Separate the tracks the sidebar lists from the tracks that became modes

Nine tracks organised the theory corpus, and two of them — Interview
Synthesis and Predict the Output — are about to stop being entries in a
list and start being destinations of their own. Deleting them from the
registry would have meant re-tracking fourteen modules and rewriting the
prerequisite ordering that depends on their position.

A scope field says the same thing without moving any content: seven
tracks are subjects the sidebar lists, two are modes the rail addresses.
Every module keeps the trackId it was written with."
```

---

## Task A2: Give question topics a track

**Files:**
- Modify: `data/index.js`
- Modify: `tools/validate-nav.js`
- Modify: `js/navigation.js:20-34` (drop `hue` from `topicMarks`), `js/navigation.js:54-63` (`markTile`, `topicHue`)

- [ ] **Step 1: Write the failing check**

Append to `tools/validate-nav.js`, above `main()`:

```js
const EXPECTED_TOPIC_COUNT = 14;

function checkTopicTracks(topics, theoryTracks, topicTracks) {
    const subjectIds = theoryTracks.filter((t) => t.scope === SUBJECT).map((t) => t.id);

    if (topics.length !== EXPECTED_TOPIC_COUNT) {
        fail('topics', `expected ${EXPECTED_TOPIC_COUNT} topics, found ${topics.length}`);
    }

    topics.forEach((topic) => {
        // `null` is a deliberate, spelled-out answer: the topic renders in the
        // "Everything else" group. `undefined` is a topic nobody has decided
        // about, and that is what this check exists to catch.
        if (!(topic.id in topicTracks)) {
            fail(`topic ${topic.id}`, 'has no entry in topicTracks — add one, or map it to null');
            return;
        }
        const trackId = topicTracks[topic.id];
        if (trackId === null) return;
        if (!subjectIds.includes(trackId)) {
            fail(`topic ${topic.id}`, `trackId '${trackId}' is not a subject track (${subjectIds.join(', ')})`);
        }
    });

    Object.keys(topicTracks).forEach((id) => {
        if (!topics.some((t) => t.id === id)) {
            fail('topicTracks', `names '${id}', which is not a topic`);
        }
    });
}
```

Wire it into `main()`:

```js
function main() {
    const { topics, theoryTracks, topicTracks } = loadCorpus();
    checkTrackScope(theoryTracks);
    checkTopicTracks(topics, theoryTracks, topicTracks || {});
    ...
}
```

And export `topicTracks` from `tools/load-corpus.js` by adding it to the object literal at the end of the concatenated source, alongside `topics` and `theoryTracks`:

```js
topicTracks:   typeof topicTracks   === 'undefined' ? {} : topicTracks,
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node tools/validate-nav.js
```

Expected: 14 errors — `topic kotlin-coroutines: has no entry in topicTracks — add one, or map it to null`, and so on for all fourteen.

- [ ] **Step 3: Add the map**

Append to `data/index.js`:

```js
/* Which subject track a question topic belongs to.

   This mapping is not new — js/navigation.js has carried it since the emoji
   were removed, encoded as a hue, with the note that "a topic takes the hue of
   the theory track its subject belongs to". Writing it down as an id rather
   than as a colour is what lets the sidebar group by it, the glossary filter by
   it, and a synthesis prompt link back through it. Hue now derives from the
   track instead of being repeated beside it, so the two cannot drift.

   Two topics have no subject track of their own because their theory lives in
   a track that is now a mode: android-system-design and
   data-structures-algorithms. They file under the nearest subject rather than
   vanishing from the sidebar. `other-topics` is a deliberate null — it is
   precisely the material that belongs to no subject, and it renders in the
   "Everything else" group at the foot of the list. */
const topicTracks = {
    'kotlin':                     'language',
    'java':                       'language',
    'data-structures-algorithms': 'language',
    'kotlin-coroutines':          'async',
    'kotlin-flow-api':            'async',
    'android':                    'platform',
    'jetpack-compose':            'ui',
    'android-libraries':          'data',
    'android-architecture':       'architecture',
    'design-pattern':             'architecture',
    'android-system-design':      'architecture',
    'android-unit-testing':       'quality',
    'android-tools-technologies': 'quality',
    'other-topics':               null
};

/** Topics in a subject track, in registry order. `null` gives the strays. */
function topicsInTrack(trackId) {
    return topics.filter((topic) => (topicTracks[topic.id] || null) === trackId);
}
```

- [ ] **Step 4: Derive hue from the track**

In `js/navigation.js`, `topicMarks` keeps only the monogram — the hue now comes from the track:

```js
/* Monograms only. Hue used to be repeated here beside each topic; it now comes
   from the topic's track (data/index.js), so the tile, the track heading and
   the progress bar are tinted by one fact rather than by two that agree. */
const topicMarks = {
    'kotlin-coroutines':          { monogram: 'Co' },
    'kotlin-flow-api':            { monogram: 'Fl' },
    'kotlin':                     { monogram: 'Kt' },
    'android':                    { monogram: 'An' },
    'android-libraries':          { monogram: 'Lb' },
    'android-architecture':       { monogram: 'Ar' },
    'design-pattern':             { monogram: 'Dp' },
    'android-system-design':      { monogram: 'Sd' },
    'android-unit-testing':       { monogram: 'Ut' },
    'android-tools-technologies': { monogram: 'Tt' },
    'jetpack-compose':            { monogram: 'Jc' },
    'java':                       { monogram: 'Jv' },
    'other-topics':               { monogram: 'Ot' },
    'data-structures-algorithms': { monogram: 'Ds' }
};

/** The hue a track paints with — tile, heading, progress bar, count. */
function trackHue(trackId) {
    return (trackMarks[trackId] || GLOSSARY_MARK).hue;
}

function topicHue(topicId) {
    const trackId = (typeof topicTracks === 'undefined') ? null : topicTracks[topicId];
    return trackId ? trackHue(trackId) : GLOSSARY_MARK.hue;
}
```

Then update the two call sites that read `mark.hue` — `markTile()` at `js/navigation.js:54` takes an explicit hue argument instead:

```js
function markTile(mark, hue) {
    const monogram = (mark && mark.monogram) || GLOSSARY_MARK.monogram;
    return `<span class="cat-tile" data-hue="${hue || GLOSSARY_MARK.hue}" aria-hidden="true">${monogram}</span>`;
}
```

Every existing `markTile(topicMarks[topic.id])` becomes `markTile(topicMarks[topic.id], topicHue(topic.id))`; every `markTile(trackMarks[track.id])` becomes `markTile(trackMarks[track.id], trackHue(track.id))`. There are five call sites: `js/navigation.js` 181, 200, 267, 286 and `js/theory.js` 350.

- [ ] **Step 5: Run the validators and load the page**

```bash
node tools/validate-nav.js && node tools/validate-theory.js && node tools/validate-questions.js
```

Expected: all three pass.

Then open the app and confirm the sidebar is unchanged apart from Kotlin Flow API's tile moving from teal to sky:

```bash
python3 -m http.server 8000
```

- [ ] **Step 6: Commit**

```bash
git add data/index.js js/navigation.js tools/validate-nav.js tools/load-corpus.js
git commit -m "Say which track a question topic belongs to, instead of implying it"
```

Body: the mapping already existed as a hue; naming it as an id is what lets the sidebar group by it and stops the colour and the kinship from drifting apart.

---

## Task A3: The mode registry

**Files:**
- Create: `data/modes.js`
- Modify: `index.html` (one `<script>` tag)
- Modify: `tools/validate-nav.js`, `tools/load-corpus.js`

- [ ] **Step 1: Write the failing check**

Append to `tools/validate-nav.js`:

```js
const RESERVED = ['questions', 'theory', 'synthesis', 'predict', 'glossary'];
const SIDEBAR_KINDS = ['tracks', 'rounds', 'sets', 'alphabet'];
const GROUPS = ['study', 'drill'];

function checkModes(appModes, topics, theoryModules) {
    if (appModes.length !== 5) {
        fail('modes', `expected 5 modes, found ${appModes.length}`);
        return;
    }

    const seenId = new Set();
    const seenKey = new Set();

    appModes.forEach((mode, i) => {
        const where = `mode ${mode.id || i}`;

        if (seenId.has(mode.id)) fail(where, 'duplicate id');
        seenId.add(mode.id);

        if (!RESERVED.includes(mode.route)) {
            fail(where, `route '${mode.route}' is not one of the reserved segments (${RESERVED.join(', ')})`);
        }
        if (topics.some((t) => t.id === mode.route)) {
            fail(where, `route '${mode.route}' collides with a topic id`);
        }
        if (theoryModules.some((m) => m.id === mode.route)) {
            fail(where, `route '${mode.route}' collides with a module id`);
        }

        if (mode.railOrder !== i + 1) fail(where, `railOrder must be ${i + 1}, got ${mode.railOrder}`);
        if (String(mode.key) !== String(i + 1)) fail(where, `key must be '${i + 1}', got '${mode.key}'`);
        if (seenKey.has(mode.key)) fail(where, 'duplicate keyboard digit');
        seenKey.add(mode.key);

        if (!SIDEBAR_KINDS.includes(mode.sidebar)) {
            fail(where, `sidebar must be one of ${SIDEBAR_KINDS.join(', ')}, got '${mode.sidebar}'`);
        }
        if (!GROUPS.includes(mode.group)) {
            fail(where, `group must be 'study' or 'drill', got '${mode.group}'`);
        }
        if (!/^--[a-z0-9-]+$/.test(mode.accentVar || '')) {
            fail(where, `accentVar must be a CSS custom property name, got '${mode.accentVar}'`);
        }
        if (!mode.title || !mode.shortLabel) fail(where, 'needs both title and shortLabel');
        if (!mode.progressNoun) fail(where, 'needs a progressNoun');
    });

    // The divider in the rail separates study from drill, and the handoff says
    // not to remove it. It only means anything if the groups are contiguous.
    const groups = appModes.map((m) => m.group);
    if (groups.join(',') !== 'study,study,drill,drill,drill') {
        fail('modes', `rail order must be study,study,drill,drill,drill — got ${groups.join(',')}`);
    }
}
```

Wire into `main()` with `appModes` from the corpus, and add to `load-corpus.js`:

```js
appModes:      typeof appModes      === 'undefined' ? [] : appModes,
```

- [ ] **Step 2: Run it and watch it fail**

```bash
node tools/validate-nav.js
```

Expected: `modes: expected 5 modes, found 0`.

- [ ] **Step 3: Write the registry**

Create `data/modes.js`:

```js
/* ==========================================================================
   Mode registry.

   Five modes sit side by side in the rail, and until now four of the five
   answers about each of them lived in a different file: the router knew the
   routes, the sidebar knew the labels, progress.js knew the counters, and
   theory.js privately owned the glossary. A sixth mode meant editing all four.

   This array is the whole answer. Everything downstream — the rail, the
   contextual sidebar, the mode header, the keyboard map, search grouping and
   the persistence keys — reads it and nothing else.

   Three fields deserve a note.

   `progressNoun` exists because the five modes do not share a unit. Questions
   are known, chapters are read, prompts are rehearsed, snippets are solved,
   terms are seen. A combined number across those five is meaningless, which is
   why there is no global total anywhere in this file and must never be one.

   `accentVar` is a token name, not a colour. The rail is the only place accent
   appears outside body content, and painting it from a literal would break the
   rule that css/themes.css holds every colour the app uses.

   `group` drives the one divider in the rail: two study modes above it, three
   drill modes below. It is load-bearing, not decoration — the divider is what
   tells a reader that Questions and Theory are places to learn and the other
   three are places to be tested.
   ========================================================================== */

const appModes = [
    {
        id: 'questions',
        route: 'questions',
        railOrder: 1,
        key: '1',
        group: 'study',
        title: 'Questions',
        shortLabel: 'Questions',
        icon: '?',
        accentVar: '--accent-500',
        sidebar: 'tracks',
        progressNoun: 'KNOWN',
        storageKey: 'droiddeck:questions:done'
    },
    {
        id: 'theory',
        route: 'theory',
        railOrder: 2,
        key: '2',
        group: 'study',
        title: 'Theory',
        shortLabel: 'Theory',
        icon: '¶',
        accentVar: '--accent-500',
        sidebar: 'tracks',
        progressNoun: 'READ',
        storageKey: 'droiddeck:theory:chapters'
    },
    {
        id: 'synthesis',
        route: 'synthesis',
        railOrder: 3,
        key: '3',
        group: 'drill',
        // Never abbreviated in the header, in search results, or in a URL.
        // The rail is 84px wide and is the only place the short form appears.
        title: 'Interview Synthesis',
        shortLabel: 'Synthesis',
        icon: '◎',
        accentVar: '--hue-fuchsia-ink',
        sidebar: 'rounds',
        trackId: 'synthesis',
        progressNoun: 'REHEARSED',
        storageKey: 'droiddeck:synthesis:rehearsed'
    },
    {
        id: 'predict',
        route: 'predict',
        railOrder: 4,
        key: '4',
        group: 'drill',
        title: 'Predict the Output',
        shortLabel: 'Predict',
        icon: '>_',
        // The specification asks for #6EE7B7, which is emerald-300 and is not
        // in the nine-hue ramp. css/themes.css says in writing that no tenth
        // hue may be introduced, so this takes the nearest member of the set.
        accentVar: '--hue-teal-ink',
        sidebar: 'sets',
        trackId: 'output',
        progressNoun: 'SOLVED',
        storageKey: 'droiddeck:predict:verdicts'
    },
    {
        id: 'glossary',
        route: 'glossary',
        railOrder: 5,
        key: '5',
        group: 'drill',
        title: 'Glossary',
        shortLabel: 'Glossary',
        icon: 'Aa',
        accentVar: '--hue-slate-ink',
        sidebar: 'alphabet',
        progressNoun: 'SEEN',
        storageKey: 'droiddeck:glossary:seen'
    }
];

const modeById = appModes.reduce((map, mode) => {
    map[mode.id] = mode;
    return map;
}, {});

function modeForRoute(segment) {
    return appModes.find((mode) => mode.route === segment) || null;
}

function modeForKey(key) {
    return appModes.find((mode) => mode.key === String(key)) || null;
}
```

- [ ] **Step 4: Load it**

In `index.html`, immediately after `<script src="data/theory/index.js"></script>`:

```html
    <!-- Navigation registry (after both corpora: its counts read from them) -->
    <script src="data/modes.js"></script>
```

- [ ] **Step 5: Verify**

```bash
node tools/validate-nav.js
```

Expected: `✓ navigation registry OK`.

- [ ] **Step 6: Commit**

```bash
git add data/modes.js index.html tools/validate-nav.js tools/load-corpus.js
git commit -m "Declare the five modes in one place"
```

---

## Task A4: Route on the registry, and redirect the old paths

**Files:**
- Modify: `js/navigation.js:455-560` (`parseHash`, `handleRouteChange`, `generateHash`, `generateTheoryHash`)

- [ ] **Step 1: Replace `parseHash`**

```js
/* Five reserved first segments, declared in data/modes.js. A bare first
   segment that is not one of them is a question topic, which is what keeps
   every #android link ever shared working — it is normalised to
   #questions/android on arrival rather than being broken. */

/**
 * Returns `{ mode, topicId, subsectionId, moduleId, chapterId, itemId,
 *            tiers, cram, letter, trackFilter, legacy }`.
 *
 * `legacy` is the canonical hash a caller should redirect to, or null when the
 * hash already is canonical.
 */
function parseHash(hash) {
    const raw = (hash || '').replace(/^#/, '');
    const [path, query] = raw.split('?');
    const segments = path.split('/').filter(Boolean);
    const cram = /(^|&)cram(=1)?($|&)/.test(query || '');

    const head = segments[0] || '';
    const mode = modeForRoute(head);

    if (!mode) {
        // No reserved segment: this is a legacy question link, or an empty
        // hash on first load.
        const fallback = (typeof topics !== 'undefined' && topics.length) ? topics[0].id : null;
        const topicId = head || fallback;
        return {
            mode: 'questions',
            topicId,
            subsectionId: segments[1] || null,
            moduleId: null, chapterId: null, itemId: null,
            tiers: parseTiers(query),
            cram: false, letter: null, trackFilter: null,
            legacy: `#questions/${topicId}${segments[1] ? '/' + segments[1] : ''}${query ? '?' + query : ''}`
        };
    }

    if (mode.id === 'questions') {
        return {
            mode: 'questions',
            topicId: segments[1] || ((typeof topics !== 'undefined' && topics.length) ? topics[0].id : null),
            subsectionId: segments[2] || null,
            moduleId: null, chapterId: null, itemId: null,
            tiers: parseTiers(query),
            cram: false, letter: null, trackFilter: null,
            legacy: null
        };
    }

    if (mode.id === 'theory') {
        const moduleId = segments[1] || null;

        // The three routes that moved out of Theory. Derived from trackId
        // rather than listed, so a module added to either track redirects
        // without anybody remembering to update a table.
        if (moduleId === 'glossary') {
            return { ...emptyRoute(), mode: 'glossary', legacy: '#glossary' };
        }
        const owner = moduleId && typeof theoryByModuleId !== 'undefined'
            ? theoryByModuleId[moduleId] : null;
        const promoted = owner && appModes.find((m) => m.trackId === owner.trackId);
        if (promoted) {
            const tail = segments[2] ? '/' + segments[2] : '';
            return {
                ...emptyRoute(),
                mode: promoted.id,
                moduleId,
                chapterId: segments[2] || null,
                legacy: `#${promoted.route}/${moduleId}${tail}`
            };
        }

        return {
            ...emptyRoute(),
            mode: 'theory',
            moduleId,
            chapterId: segments[2] || null,
            cram,
            legacy: null
        };
    }

    if (mode.id === 'glossary') {
        const letter = /(^|&)letter=([A-Za-z#])/.exec(query || '');
        const track = /(^|&)track=([a-z-]+)/.exec(query || '');
        return {
            ...emptyRoute(),
            mode: 'glossary',
            letter: letter ? letter[2].toUpperCase() : null,
            trackFilter: track ? track[2] : null,
            legacy: null
        };
    }

    // synthesis | predict — module, then the drill or snippet inside it.
    return {
        ...emptyRoute(),
        mode: mode.id,
        moduleId: segments[1] || null,
        itemId: segments[2] || null,
        legacy: null
    };
}

function emptyRoute() {
    return {
        mode: null, topicId: null, subsectionId: null,
        moduleId: null, chapterId: null, itemId: null,
        tiers: [], cram: false, letter: null, trackFilter: null, legacy: null
    };
}

function parseTiers(query) {
    const tier = /(^|&)tier=([^&]*)/.exec(query || '');
    if (!tier) return [];
    return normaliseTiers(
        tier[2].split(',').map((k) => k.trim()).filter((k) => k in TIER_KEYS)
    );
}
```

- [ ] **Step 2: Replace `handleRouteChange`**

```js
function handleRouteChange() {
    const route = parseHash(window.location.hash);

    // A legacy URL is rewritten before anything renders, and with replace()
    // rather than assignment: a reader who arrived on #theory/predict-kotlin
    // and presses Back should leave the app, not bounce between the old
    // address and the new one.
    if (route.legacy && route.legacy !== window.location.hash) {
        window.location.replace(route.legacy);
        return;
    }

    setTheoryCramMode(route.mode === 'theory' && route.cram);
    const tierChanged = setQuestionTiers(route.mode === 'questions' ? route.tiers : []);
    const modeChanged = setActiveMode(route.mode);

    rememberMode(route);

    if (tierChanged && !modeChanged) renderSidebar();

    switch (route.mode) {
        case 'theory':
            if (route.moduleId) renderTheoryModule(route.moduleId, route.chapterId);
            else renderTheoryOverview();
            return;
        case 'synthesis':
            if (route.moduleId) renderSynthesisPrompt(route.moduleId, route.itemId);
            else renderSynthesisOverview();
            return;
        case 'predict':
            if (route.moduleId) renderPredictSnippet(route.moduleId, route.itemId);
            else renderPredictOverview();
            return;
        case 'glossary':
            renderGlossary(route.letter, route.trackFilter);
            return;
        default:
            renderTopic(route.topicId, route.subsectionId);
    }
}
```

- [ ] **Step 3: Generalise hash generation**

`generateHash` and `generateTheoryHash` stay as the two callers everywhere already use, but both now emit the prefixed form, and one new builder covers the three new modes:

```js
function generateHash(topicId, subsectionId, tiers) {
    const selected = (tiers === undefined) ? questionTiers : normaliseTiers(tiers);
    const query = selected.length ? `?tier=${selected.join(',')}` : '';
    const tail = subsectionId ? `/${subsectionId}` : '';
    return `#questions/${topicId}${tail}${query}`;
}

function generateTheoryHash(moduleId, chapterId, cram) {
    const flag = (cram === undefined) ? theoryCramMode : Boolean(cram);
    const query = flag ? '?cram' : '';
    if (!moduleId) return `#theory${query}`;
    return chapterId ? `#theory/${moduleId}/${chapterId}${query}` : `#theory/${moduleId}${query}`;
}

/** Synthesis and Predict: `#<route>/<moduleId>/<itemId>`. */
function generateModeHash(modeId, moduleId, itemId) {
    const mode = modeById[modeId];
    if (!mode) return '#';
    if (!moduleId) return `#${mode.route}`;
    return itemId ? `#${mode.route}/${moduleId}/${itemId}` : `#${mode.route}/${moduleId}`;
}

/** Glossary, with its two optional filters. */
function generateGlossaryHash(letter, trackId) {
    const parts = [];
    if (letter) parts.push(`letter=${letter}`);
    if (trackId) parts.push(`track=${trackId}`);
    return parts.length ? `#glossary?${parts.join('&')}` : '#glossary';
}
```

Delete `THEORY_ROUTE` (`js/navigation.js:385`) and `GLOSSARY_ROUTE` (`js/theory.js:528`) — both are now `modeById.theory.route` and `modeById.glossary.route`. Update the four references to `GLOSSARY_ROUTE` in `js/navigation.js:170-181` and `js/theory.js:306`.

- [ ] **Step 4: Verify every redirect by hand**

Serve the app and walk this table, confirming the address bar rewrites and the right thing renders:

```bash
python3 -m http.server 8000
```

| Enter | Address becomes | Renders |
|---|---|---|
| `#android` | `#questions/android` | Android questions |
| `#android/services` | `#questions/android/services` | that subsection |
| `#java?tier=must` | `#questions/java?tier=must` | filtered |
| `#theory` | *(unchanged)* | curriculum overview |
| `#theory/compose-state` | *(unchanged)* | that module |
| `#theory/glossary` | `#glossary` | glossary |
| `#theory/predict-kotlin` | `#predict/predict-kotlin` | predict mode |
| `#theory/feature-drills` | `#synthesis/feature-drills` | synthesis mode |
| `#theory/feature-drills/the-core-loop` | `#synthesis/feature-drills/the-core-loop` | that chapter |
| *(empty)* | `#questions/kotlin-coroutines` | first topic |

Then press Back from each redirected page and confirm you leave the app rather than bouncing.

- [ ] **Step 5: Commit**

```bash
git add js/navigation.js js/theory.js
git commit -m "Route on the registry, and send the old theory paths to their new homes"
```

---

## Task A5: One progress function, five units

**Files:**
- Modify: `js/progress.js`
- Modify: `tools/validate-nav.js`

- [ ] **Step 1: Add the new stores**

Append to `js/progress.js`:

```js
/* --------------------------------------------------------------------------
   Per-mode progress

   Five modes, five units, and deliberately no total across them. "38 known,
   11 read, 3 rehearsed, 6 solved, 41 seen" is five facts; a single number that
   averaged them would be a sixth that is not true of anything.

   Each store below is the smallest thing that can answer its mode's question.
   -------------------------------------------------------------------------- */

const REHEARSED_STORAGE_KEY = 'droiddeck:synthesis:rehearsed';
const VERDICT_STORAGE_KEY = 'droiddeck:predict:verdicts';
const SEEN_STORAGE_KEY = 'droiddeck:glossary:seen';

/* A drill is rehearsed when the reader says so. There is nothing to grade —
   the drill's own value is in having attempted it against the clock — so the
   store is a set of ids and the control is a single toggle. */
function rehearsedDrills() { return readSet(REHEARSED_STORAGE_KEY); }

function setDrillRehearsed(drillId, rehearsed) {
    const current = rehearsedDrills();
    if (rehearsed) current.add(drillId); else current.delete(drillId);
    writeSet(REHEARSED_STORAGE_KEY, current);
    announceProgress({ kind: 'rehearsed', drillId, rehearsed });
    return current;
}

/* A snippet has a verdict, not a flag: 'right' or 'wrong'. The sidebar draws a
   strip of one cell per snippet and it has to distinguish three states, so a
   set could not carry it. Keyed on the bare block id, as the reveal store
   already is — validate-theory.js holds a catalogue of predict ids and rejects
   a duplicate corpus-wide, which is what makes the short key safe. */
function predictVerdicts() { return readMap(VERDICT_STORAGE_KEY); }

function predictVerdict(blockId) { return predictVerdicts()[blockId] || null; }

function setPredictVerdict(blockId, verdict) {
    const current = predictVerdicts();
    if (verdict === 'right' || verdict === 'wrong') current[blockId] = verdict;
    else delete current[blockId];
    writeMap(VERDICT_STORAGE_KEY, current);
    announceProgress({ kind: 'verdict', blockId, verdict });
    return current;
}

/* A term is seen once its card has been on screen. That is a weaker claim than
   "read" and the counter says so — SEEN, not KNOWN — but it is the only one a
   glossary can honestly make without asking the reader to tick 68 boxes. */
function seenTerms() { return readSet(SEEN_STORAGE_KEY); }

function markTermSeen(term) {
    const current = seenTerms();
    if (current.has(term)) return current;
    current.add(term);
    writeSet(SEEN_STORAGE_KEY, current);
    announceProgress({ kind: 'seen', term });
    return current;
}
```

- [ ] **Step 2: Add the one function every counter reads**

```js
/**
 * `{ done, total, noun }` for a mode — the only shape the rail meter, the mode
 * header and the rail tooltip know about.
 *
 * There is no `allModesProgress()` and there must not be. The five units do
 * not add up, and a header that claimed they did would be lying in a place the
 * reader has no way to check.
 */
function modeProgress(modeId) {
    const mode = modeById[modeId];
    const noun = mode ? mode.progressNoun : '';

    switch (modeId) {
        case 'questions': {
            const all = (typeof topics === 'undefined' ? [] : topics);
            const done = doneQuestions();
            let d = 0, t = 0;
            all.forEach((topic) => {
                (topic.questions || []).forEach((q) => {
                    t += 1;
                    if (done.has(questionKey(topic.id, q.id))) d += 1;
                });
            });
            return { done: d, total: t, noun };
        }
        case 'theory': {
            // Subject tracks only — the chapters in the two promoted tracks
            // belong to Synthesis and Predict and are counted there.
            const mods = subjectTrackModules();
            const read = readChapters();
            let d = 0, t = 0;
            mods.forEach((mod) => {
                (mod.chapters || []).forEach((c) => {
                    t += 1;
                    if (read.has(chapterKey(mod.id, c.id))) d += 1;
                });
            });
            return { done: d, total: t, noun };
        }
        case 'synthesis': {
            const drills = allDrills();
            const done = rehearsedDrills();
            return { done: drills.filter((b) => done.has(b.id)).length, total: drills.length, noun };
        }
        case 'predict': {
            const blocks = allPredicts();
            const verdicts = predictVerdicts();
            return { done: blocks.filter((b) => verdicts[b.id]).length, total: blocks.length, noun };
        }
        case 'glossary': {
            const entries = collectGlossaryEntries();
            const seen = seenTerms();
            return { done: entries.filter((e) => seen.has(e.term)).length, total: entries.length, noun };
        }
        default:
            return { done: 0, total: 0, noun: '' };
    }
}

/** `38 / 465 KNOWN` — the mode header's long form. */
function modeProgressLabel(modeId) {
    const { done, total, noun } = modeProgress(modeId);
    return `${done} / ${total} ${noun}`;
}

/* Every block of a type across a mode's track, in reading order. The two
   promoted modes address these directly, so they need the flat list the track
   never had to produce. */
function blocksOfTypeInTrack(trackId, type) {
    const mods = (typeof theoryModules === 'undefined' ? [] : theoryModules)
        .filter((m) => m.trackId === trackId)
        .sort((a, b) => a.order - b.order);
    const found = [];
    mods.forEach((mod) => {
        (mod.chapters || []).forEach((chapter) => {
            (chapter.blocks || []).forEach((block) => {
                if (block.type === type) found.push({ ...block, moduleId: mod.id, chapterId: chapter.id });
            });
        });
    });
    return found;
}

function allDrills() { return blocksOfTypeInTrack('synthesis', 'drill'); }
function allPredicts() { return blocksOfTypeInTrack('output', 'predict'); }

function subjectTrackModules() {
    const subjects = (typeof theoryTracks === 'undefined' ? [] : theoryTracks)
        .filter((t) => t.scope === 'subject').map((t) => t.id);
    return (typeof theoryModules === 'undefined' ? [] : theoryModules)
        .filter((m) => subjects.includes(m.trackId));
}
```

- [ ] **Step 3: Assert the counts the mode header will print**

Append to `tools/validate-nav.js` — this is the check that catches a mode whose unit silently counts the wrong thing:

```js
/* The five totals the mode header prints. Hard numbers, because a nav refactor
   that quietly halves the Predict total is exactly the failure this file
   exists to catch, and "some number appeared" is not a check. Update these
   deliberately when the corpus grows. */
const EXPECTED_TOTALS = {
    questions: 465,
    theory: 154,      // chapters in the seven subject tracks
    synthesis: 24,    // drill blocks
    predict: 80,      // predict blocks
    glossary: 68      // definition blocks
};

function checkTotals(topics, theoryModules, theoryTracks) {
    const subjects = theoryTracks.filter((t) => t.scope === SUBJECT).map((t) => t.id);
    const count = (trackId, type) => theoryModules
        .filter((m) => m.trackId === trackId)
        .reduce((n, m) => n + (m.chapters || []).reduce(
            (k, c) => k + (c.blocks || []).filter((b) => b.type === type).length, 0), 0);

    const actual = {
        questions: topics.reduce((n, t) => n + (t.questions || []).length, 0),
        theory: theoryModules.filter((m) => subjects.includes(m.trackId))
            .reduce((n, m) => n + (m.chapters || []).length, 0),
        synthesis: count('synthesis', 'drill'),
        predict: count('output', 'predict'),
        glossary: theoryModules.reduce((n, m) => n + (m.chapters || []).reduce(
            (k, c) => k + (c.blocks || []).filter((b) => b.type === 'definition').length, 0), 0)
    };

    Object.keys(EXPECTED_TOTALS).forEach((id) => {
        if (actual[id] !== EXPECTED_TOTALS[id]) {
            fail(`mode ${id}`, `total is ${actual[id]}, expected ${EXPECTED_TOTALS[id]} — ` +
                'if the corpus grew on purpose, update EXPECTED_TOTALS in tools/validate-nav.js');
        }
    });
}
```

- [ ] **Step 4: Wire it in and run it**

`main()` in `tools/validate-nav.js` must call every check that has been added. After this task it reads in full:

```js
function main() {
    const { topics, theoryTracks, theoryModules, topicTracks, appModes } = loadCorpus();

    checkTrackScope(theoryTracks);
    checkTopicTracks(topics, theoryTracks, topicTracks || {});
    checkModes(appModes || [], topics, theoryModules);
    checkTotals(topics, theoryModules, theoryTracks);

    if (errors.length) {
        console.error(`\n${errors.length} problem(s):\n`);
        errors.forEach((e) => console.error(`  ✗ ${e}`));
        process.exit(1);
    }
    console.log('✓ navigation registry OK');
}
```

Tasks C1, C3 and C4 each add one more call to this list — `checkDrillExtras(theoryModules)`, `checkGlossaryBacklinks(theoryModules)` and `checkTheoryShape(theoryModules, theoryTracks)`. A check that is written but not called is worse than no check, because it reads like coverage.

```bash
node tools/validate-nav.js
```

Expected: `✓ navigation registry OK` with all five totals matching.

- [ ] **Step 5: Commit**

```bash
git add js/progress.js tools/validate-nav.js
git commit -m "Give every mode its own unit of progress, and no total across them"
```

---

# Phase B — The rail

The app changes shape. Four commits.

## Task B1: Tokens and layout offsets

**Files:**
- Modify: `css/themes.css`
- Create: `css/rail.css`
- Modify: `css/styles.css:80-96, 343-390, 462-490`
- Modify: `index.html`

- [ ] **Step 1: Add the three semantic aliases**

In `css/themes.css`, inside the app's semantic layer (after line 146, dark) and again in the `[data-theme="light"]` block:

```css
    /* --- Rail ---
       The rail is chrome, not content, so it takes surfaces rather than hues.
       Declared here because css/themes.css is the only file allowed a literal,
       and because the light theme needs its own answer — the specification only
       gave the dark one. */
    --rail-bg: var(--ds-canvas);
    --rail-item-active: var(--ds-raised);
    --rail-icon-border: var(--ds-border);
```

- [ ] **Step 2: Write the rail stylesheet**

Create `css/rail.css`. Exact values from the handoff §3–§4:

```css
/* ==========================================================================
   The mode rail, and the mode header beside it.

   Fixed 84px, full height, and it never scrolls — the sidebar to its right
   does. Every fixed-width element here carries flex-shrink: 0 and every label
   carries white-space: nowrap; the layout bugs the earlier build hit at narrow
   widths all came from omitting one of the two.
   ========================================================================== */

.rail {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 84px;
    flex-shrink: 0;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 17px 0;
    background: var(--rail-bg);
    border-right: 1px solid var(--ds-border);
    overflow: visible;
}

.rail-items { display: flex; flex-direction: column; align-items: center; gap: 2px; }

/* Two study modes, then this, then three drill modes. It says the three below
   are places to be tested rather than places to read, and removing it makes
   five equal siblings out of two groups that are not alike. */
.rail-divider { width: 46px; height: 1px; background: var(--ds-border); margin: 6px 0; }

.rail-item {
    width: 68px;
    min-height: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 9px 0 7px;
    border: 0;
    background: transparent;
    border-radius: 11px;
    cursor: pointer;
    transition: background var(--transition-hover);
}
.rail-item:hover { background: var(--ds-surface); }
.rail-item.active { background: var(--rail-item-active); }

.rail-icon {
    width: 22px; height: 22px;
    flex-shrink: 0;
    border-radius: 6px;
    border: 1.5px solid var(--rail-icon-border);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ds-muted);
}
/* Accent lives on the item and is read by both the icon box and the meter, so
   one attribute paints the mode. */
.rail-item.active .rail-icon {
    color: var(--rail-accent);
    background: color-mix(in srgb, var(--rail-accent) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--rail-accent) 30%, transparent);
}

.rail-label {
    font-size: 11px;
    line-height: 1.2;
    text-align: center;
    white-space: nowrap;
    color: var(--ds-muted);
}
.rail-item.active .rail-label { color: var(--ds-text); font-weight: 600; }

.rail-spacer { flex: 1; }

.rail-meter { width: 46px; height: 4px; border-radius: 3px; background: var(--ds-raised); overflow: hidden; }
.rail-meter-fill { height: 100%; background: var(--rail-accent); }
.rail-meter-label { font-family: var(--font-mono); font-size: 10px; color: var(--ds-faint); }

/* --------------------------------------------------------------------------
   Mode header — one row, 64px, right of the rail.
   -------------------------------------------------------------------------- */

.mode-header {
    position: fixed;
    top: 0; left: 84px; right: 0;
    height: 64px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: 0 var(--space-5);
    background: var(--ds-veil);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid var(--ds-border);
}
.mode-header-title { font-family: var(--font-display); font-size: 20px; white-space: nowrap; flex-shrink: 0; }
.mode-header-meta { font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--ds-faint); white-space: nowrap; flex-shrink: 0; }
.mode-header-rule { width: 1px; height: 20px; background: var(--ds-border); flex-shrink: 0; }
.mode-header-spacer { flex: 1; }

.mode-header-progress { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.mode-header-progress-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: .06em; color: var(--ds-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.mode-header-meter { width: 88px; height: 4px; border-radius: 3px; background: var(--ds-raised); overflow: hidden; flex-shrink: 0; }
.mode-header-meter-fill { height: 100%; background: var(--rail-accent); }

/* Flexible, never fixed. A hard 340px clips the field below about 990px. */
.mode-header .search-container { flex: 1; max-width: 340px; min-width: 170px; }
.mode-header .search-icon,
.mode-header .search-shortcut { flex-shrink: 0; }
```

- [ ] **Step 3: Shift the existing layout right**

In `css/styles.css`:

```css
.sidebar {
    position: fixed;
    top: 64px;
    left: 84px;        /* was 0 */
    bottom: 0;
    width: 272px;      /* was 280px — the handoff specifies 272 */
    ...
}

.main-content {
    margin-left: 356px;  /* 84 rail + 272 sidebar; was 280 */
    margin-top: 64px;
    ...
}
```

Delete the `.header` rule's `left: 0` positioning and the old `.header` block entirely — `.mode-header` in `css/rail.css` replaces it. Keep `.search-container` and its children, which `.mode-header` reuses.

Responsive, replacing the `@media` blocks at `css/styles.css:462-490`:

```css
/* Below 1100 the sidebar becomes a drawer. The rail stays: it is the thing
   that tells you which of five places you are in, and losing it first is
   losing the most. */
@media (max-width: 1100px) {
    .sidebar { transform: translateX(-100%); width: 300px; z-index: 1001; }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.active { display: block; }
    .main-content { margin-left: 84px; padding: 24px 20px 80px; }
}

/* Below 720 the rail becomes a bottom bar — same five items, same order, same
   divider position. */
@media (max-width: 720px) {
    .rail {
        top: auto; left: 0; right: 0; bottom: 0;
        width: auto; height: 62px;
        flex-direction: row;
        justify-content: space-around;
        padding: 6px 8px;
        gap: 0;
        border-right: 0;
        border-top: 1px solid var(--ds-border);
    }
    .rail-brand, .rail-spacer, .rail-meter, .rail-meter-label { display: none; }
    .rail-items { flex-direction: row; gap: 2px; flex: 1; justify-content: space-around; }
    .rail-divider { width: 1px; height: 28px; margin: 0 4px; align-self: center; }
    .rail-item { width: auto; min-width: 56px; padding: 6px 4px; }

    .mode-header { left: 0; }
    .sidebar { top: 64px; bottom: 62px; }
    .main-content { margin-left: 0; padding: 20px 14px 92px; }
}
```

- [ ] **Step 4: Link it**

In `index.html`, after `css/components.css`:

```html
    <link rel="stylesheet" href="css/rail.css">
```

- [ ] **Step 5: Verify no horizontal scroll**

Serve, then at 1280px, 1100px, 990px, 720px and 375px confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth` in the console, and that no rail label is clipped.

- [ ] **Step 6: Commit**

```bash
git add css/rail.css css/styles.css css/themes.css index.html
git commit -m "Make room for a rail, and give it tokens rather than literals"
```

---

## Task B2: The rail itself

**Files:**
- Create: `js/rail.js`
- Modify: `index.html` (rail markup + script tag)
- Modify: `js/navigation.js` (delete `buildModeSwitch` at 102–137 and its call at 88)

- [ ] **Step 1: Markup**

In `index.html`, replace the whole `<header class="header">` block with:

```html
    <nav class="rail" id="rail" role="tablist" aria-label="Mode" aria-orientation="vertical">
        <a class="rail-brand" href="#questions" aria-label="DroidDeck home">
            <!-- the existing 30×28 brand-mark SVG, unchanged -->
        </a>
        <div class="rail-items" id="railItems"></div>
        <div class="rail-spacer"></div>
        <div class="rail-meter" id="railMeter" aria-hidden="true"><div class="rail-meter-fill" id="railMeterFill"></div></div>
        <div class="rail-meter-label" id="railMeterLabel"></div>
        <div class="theme-switch" id="themeSwitch" role="radiogroup" aria-label="Colour theme">
            <!-- the existing two theme-switch-option buttons, unchanged -->
        </div>
    </nav>

    <header class="mode-header" role="banner">
        <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle section list" aria-expanded="false">
            <span class="hamburger-line"></span><span class="hamburger-line"></span><span class="hamburger-line"></span>
        </button>
        <div class="mode-header-title" id="modeTitle"></div>
        <div class="mode-header-rule"></div>
        <div class="mode-header-meta" id="modeMeta"></div>
        <div class="mode-header-spacer"></div>
        <div class="mode-header-progress">
            <span class="mode-header-progress-label" id="modeProgressLabel"></span>
            <div class="mode-header-meter"><div class="mode-header-meter-fill" id="modeProgressFill"></div></div>
        </div>
        <div class="mode-header-rule"></div>
        <div class="search-container" role="search">
            <!-- the existing search icon, input, kbd and results div, unchanged -->
        </div>
    </header>
```

- [ ] **Step 2: Render it from the registry**

Create `js/rail.js`:

```js
/* ==========================================================================
   The rail, and the mode header beside it.

   Both are built entirely from data/modes.js. Neither knows the name of a
   single mode, which is the point: a sixth mode is a sixth record, not a sixth
   branch in here.
   ========================================================================== */

let activeMode = 'questions';

/** True when the mode actually changed, so callers can avoid a double render. */
function setActiveMode(modeId) {
    const next = modeById[modeId] ? modeId : 'questions';
    if (next === activeMode) { paintRail(); return false; }
    activeMode = next;
    document.documentElement.dataset.mode = next;
    renderSidebar();
    paintRail();
    return true;
}

function currentMode() { return modeById[activeMode] || appModes[0]; }

function renderRail() {
    const host = document.getElementById('railItems');
    if (!host) return;
    host.innerHTML = '';

    let lastGroup = null;
    appModes.forEach((mode) => {
        if (lastGroup && mode.group !== lastGroup) {
            const divider = document.createElement('div');
            divider.className = 'rail-divider';
            host.appendChild(divider);
        }
        lastGroup = mode.group;
        host.appendChild(buildRailItem(mode));
    });

    paintRail();
}

function buildRailItem(mode) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'rail-item';
    item.dataset.modeId = mode.id;
    item.setAttribute('role', 'tab');
    // Full name in the tooltip and the digit that reaches it. The 11px label
    // below is the only place the short form is allowed to appear.
    item.title = `${mode.title} — ${mode.key}`;
    item.style.setProperty('--rail-accent', `var(${mode.accentVar})`);

    const icon = document.createElement('span');
    icon.className = 'rail-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = mode.icon;

    const label = document.createElement('span');
    label.className = 'rail-label';
    label.textContent = mode.shortLabel;

    item.appendChild(icon);
    item.appendChild(label);
    item.addEventListener('click', () => goToMode(mode.id));
    return item;
}

/* Navigating is what flips the mode. The rail never sets activeMode directly —
   the hash stays the source of truth, so the rail and the back button cannot
   disagree, exactly as the two-tab switch it replaces was careful to do. */
function goToMode(modeId) {
    const mode = modeById[modeId];
    if (!mode) return;
    window.location.hash = lastSelectionFor(modeId) || `#${mode.route}`;
    closeMobileMenu();
}

function paintRail() {
    const mode = currentMode();
    const { done, total } = modeProgress(mode.id);
    const pct = progressPercent(done, total);

    document.querySelectorAll('.rail-item').forEach((item) => {
        const on = item.dataset.modeId === mode.id;
        item.classList.toggle('active', on);
        item.setAttribute('aria-selected', String(on));
    });

    const meter = document.getElementById('railMeter');
    const fill = document.getElementById('railMeterFill');
    const label = document.getElementById('railMeterLabel');
    if (meter) meter.style.setProperty('--rail-accent', `var(${mode.accentVar})`);
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${pct}%`;

    paintModeHeader(mode, done, total, pct);
}

function paintModeHeader(mode, done, total, pct) {
    const title = document.getElementById('modeTitle');
    const meta = document.getElementById('modeMeta');
    const progressLabel = document.getElementById('modeProgressLabel');
    const progressFill = document.getElementById('modeProgressFill');

    // Never the short form here. "Synthesis" is a rail label; the header says
    // what the mode is called.
    if (title) title.textContent = mode.title;
    if (meta) meta.textContent = modeMeta(mode.id);
    // One place builds this string — progress.js — so the rail meter's tooltip
    // and the header can never disagree about a number.
    if (progressLabel) progressLabel.textContent = modeProgressLabel(mode.id);
    if (progressFill) {
        progressFill.style.width = `${pct}%`;
        progressFill.style.setProperty('--rail-accent', `var(${mode.accentVar})`);
    }
}

/** "7 sets · 80 snippets" — computed, never written down. */
function modeMeta(modeId) {
    switch (modeId) {
        case 'questions': {
            const n = subjectTracks().length;
            const q = (typeof topics === 'undefined' ? [] : topics)
                .reduce((k, t) => k + (t.questions || []).length, 0);
            return `${n} tracks · ${q} questions`;
        }
        case 'theory': {
            const mods = subjectTrackModules();
            const ch = mods.reduce((k, m) => k + (m.chapters || []).length, 0);
            return `${subjectTracks().length} tracks · ${mods.length} modules · ${ch} chapters`;
        }
        case 'synthesis':
            return `${modulesInTrack('synthesis').length} rounds · ${allDrills().length} prompts`;
        case 'predict':
            return `${modulesInTrack('output').length} sets · ${allPredicts().length} snippets`;
        case 'glossary': {
            const entries = collectGlossaryEntries();
            const letters = new Set(entries.map((e) => glossaryLetter(e.term)));
            return `${letters.size} letters · ${entries.length} terms`;
        }
        default: return '';
    }
}
```

- [ ] **Step 3: Load it and delete the old switch**

Add `<script src="js/rail.js"></script>` after `js/navigation.js`. Delete `buildModeSwitch()` (`js/navigation.js:100-137`) and its call in `renderSidebar()` (`js/navigation.js:88`). In `js/app.js:initApp()`, add `renderRail();` between `initTheme()` and `renderSidebar(topics)`.

- [ ] **Step 4: Verify**

Load the app. Confirm: five rail items in order with the divider after Theory; clicking each changes the URL and the header title; the header shows the **full** names "Interview Synthesis" and "Predict the Output" while the rail shows "Synthesis" and "Predict"; the meter fills with each mode's accent; both themes render.

- [ ] **Step 5: Commit**

```bash
git add js/rail.js js/navigation.js js/app.js index.html
git commit -m "Put five modes in a rail, built from the registry rather than from branches"
```

---

## Task B3: The contextual sidebar

**Files:**
- Create: `js/sidebar.js`
- Modify: `js/navigation.js` (delete lines 70–330, the sidebar half)

- [ ] **Step 1: Move and re-enter on `mode.sidebar`**

Create `js/sidebar.js` holding `renderSidebar()` and the four kinds. `buildQuestionNav`, `buildTheoryNav`, `buildTopicGroup`, `buildTopicLink`, `buildTrackGroup`, `setActiveTopic`, `setActiveTheory`, `toggleSubsections`, `questionsInTiers` move here verbatim from `js/navigation.js`, with these changes:

```js
function renderSidebar() {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    nav.innerHTML = '';

    switch (currentMode().sidebar) {
        case 'tracks':   buildTrackNav(nav); return;
        case 'rounds':   buildRoundNav(nav); return;
        case 'sets':     buildSetNav(nav); return;
        case 'alphabet': buildAlphabetNav(nav); return;
    }
}
```

`buildTrackNav` is the one genuinely new function: the seven subject tracks, each expanding to its topics (Questions) or its modules (Theory), with `known/total` or `read/total` on each row. Its heading is `TRACKS` in Questions and `READING PATH` in Theory — the reference build's `trackHeading` value.

```js
/** The eyebrow above a group: a mono caps label and the count beside it. */
function sidebarHeading(label, count) {
    const heading = document.createElement('div');
    heading.className = 'nav-heading';

    const text = document.createElement('span');
    text.className = 'nav-heading-label';
    text.textContent = label;

    const n = document.createElement('span');
    n.className = 'nav-heading-count';
    n.textContent = String(count);

    heading.appendChild(text);
    heading.appendChild(n);
    return heading;
}

/* The count follows the tier filter, exactly as buildQuestionNav's did, so the
   sidebar keeps answering "how much is left to revise" rather than "how much
   exists". */
function topicCount(topic) {
    return questionsInTiers(topic.questions || [], questionTiers).length;
}

function buildTrackNav(nav) {
    const questions = activeMode === 'questions';

    nav.appendChild(sidebarHeading(questions ? 'Tracks' : 'Reading path', subjectTracks().length));

    subjectTracks().forEach((track) => {
        const children = questions ? topicsInTrack(track.id) : modulesInTrack(track.id);
        if (!children.length) return;
        nav.appendChild(buildTrackGroup(track, children, questions));
    });

    // Topics that belong to no subject track. One rule rather than an invented
    // tenth track, and `other-topics` is exactly what it is for.
    const strays = questions ? topicsInTrack(null) : [];
    if (strays.length) {
        nav.appendChild(sidebarHeading('Everything else', strays.length));
        strays.forEach((topic) => nav.appendChild(
            buildTopicLink(topic, topicMarks[topic.id], topicCount(topic))
        ));
    }
}
```

`buildTrackGroup` is the existing function from `js/navigation.js:188`, generalised: it took `(track, modules)` and now takes `(track, children, questions)`. In Theory a child is a module and its row is `${mod.order}. ${mod.title}` with `read/total` chapters; in Questions a child is a topic whose own subsections (Android's twenty, Java's eight) become a third level, each carrying `subsectionProgress()`'s `done/total` as it does today. Both branches call `markTile(trackMarks[track.id], trackHue(track.id))` on the group header.

`buildRoundNav`, `buildSetNav` and `buildAlphabetNav` follow the reference build's markup exactly (`docs/design/Rail-Nav/DroidDeck-Rail-Nav.html`, decoded, lines 489–690):

- **rounds** — eyebrow `INTERVIEW ROUNDS`, then one row per synthesis module: `01`–`07` in mono, the module title, and a `✓` when every drill in it is rehearsed. Below a divider, a `DRAWS ON` block listing the distinct subject tracks the active module's drills pull from.
- **sets** — eyebrow `SNIPPET SETS`, then one row per predict module: monogram tile, title, `n / m SOLVED` beneath. Below a divider, a `THIS SET` verdict strip — one cell per snippet in the *active* module, tinted by `predictVerdict(id)`: right → `--hue-teal-ink`, wrong → `--tier-must-dot`, unanswered → `--ds-raised` — and a caption `4 right, 1 wrong, 7 to go`.
- **alphabet** — eyebrow `JUMP TO LETTER`, a 26-cell grid; a letter with no terms is `--ds-faint` and not clickable. Below a divider, `DEFINED IN TRACK`: the seven subject tracks with a term count each, acting as a filter, plus the current filter's clear affordance.

Every row keeps `white-space: nowrap` on its label and `flex-shrink: 0` on its count.

- [ ] **Step 2: Load it**

`<script src="js/sidebar.js"></script>` after `js/navigation.js`, before `js/rail.js`.

- [ ] **Step 3: Verify**

Switch through all five modes. Confirm: **no track list is visible in Synthesis or Predict** (handoff §9.2); the sidebar scrolls independently while the rail does not; the Questions sidebar shows seven tracks plus "Everything else"; Android's twenty subsections still appear under it.

- [ ] **Step 4: Commit**

```bash
git add js/sidebar.js js/navigation.js index.html
git commit -m "Give the sidebar to the active mode, not to the app"
```

---

## Task B4: Persist mode and sub-selection, restore before first paint

**Files:**
- Modify: `index.html` (inline head script)
- Modify: `js/rail.js`, `js/theme.js`

- [ ] **Step 1: The pre-paint script**

In `index.html` `<head>`, before any stylesheet:

```html
    <script>
    /* Runs before the first byte of body is parsed, which is the whole point:
       everything below reads document.documentElement, and a mode or theme
       applied after first paint is a flash the reader sees.

       Deliberately not in a js/ file — a deferred script is by definition too
       late for this, and the two lines are not worth a blocking request. */
    (function () {
        try {
            var theme = localStorage.getItem('theme');
            if (theme === 'dark' || theme === 'light') {
                document.documentElement.setAttribute('data-theme', theme);
            }
            var mode = localStorage.getItem('droiddeck:mode');
            if (mode) document.documentElement.dataset.mode = mode;
            if (!location.hash && mode) {
                var last = JSON.parse(localStorage.getItem('droiddeck:mode:last') || '{}');
                location.replace(last[mode] || ('#' + mode));
            }
        } catch (e) { /* private mode, file://: the defaults are fine. */ }
    })();
    </script>
```

- [ ] **Step 2: Remember the sub-selection per mode**

In `js/rail.js`:

```js
const MODE_STORAGE_KEY = 'droiddeck:mode';
const LAST_SELECTION_KEY = 'droiddeck:mode:last';

/* Per mode, not one global "last page". Returning to Questions should land on
   the track you left, not on track one — and the reader who was three
   snippets into Predict has a different "where was I" from the reader who was
   halfway down the glossary. One slot each is what makes both true. */
function rememberMode(route) {
    try {
        localStorage.setItem(MODE_STORAGE_KEY, route.mode);
        const last = JSON.parse(localStorage.getItem(LAST_SELECTION_KEY) || '{}');
        last[route.mode] = window.location.hash;
        localStorage.setItem(LAST_SELECTION_KEY, JSON.stringify(last));
    } catch (e) { /* progress is a convenience; losing it is not worth an error */ }
}

function lastSelectionFor(modeId) {
    try {
        return JSON.parse(localStorage.getItem(LAST_SELECTION_KEY) || '{}')[modeId] || null;
    } catch (e) { return null; }
}
```

`rememberMode(route)` is already called from `handleRouteChange()` (Task A4, Step 2).

- [ ] **Step 3: Verify**

Navigate to `#questions/java/collections`, switch to Predict, switch back — Java Collections, not the first topic. Reload on Predict — Predict, no flash of Questions. Switch theme, reload — no flash of dark.

- [ ] **Step 4: Commit**

```bash
git add index.html js/rail.js js/theme.js
git commit -m "Restore the mode you left, and restore it before the first paint"
```

---

# Phase C — The three promoted modes

Four commits: one per mode, then the one that takes them out of Theory.

Theory does not shrink until Task C4, and that ordering is the point — Interview Synthesis, Predict the Output and the Glossary stay reachable through their old home right up until the moment their new home works. At no commit in this phase is a chapter unreachable.

## Task C1: Interview Synthesis

**Files:**
- Create: `js/synthesis.js`
- Modify: `js/theory.js:1329` (`renderDrillBlock` gains the optional branches)
- Modify: `tools/validate-nav.js`

- [ ] **Step 1: Validate the optional fields**

Append to `tools/validate-nav.js`:

```js
/* Three fields the synthesis screen renders when an author has written them.
   None is required: the mode ships against the drill fields that already
   exist. But a half-written spine is worse than none, so anything present is
   checked as strictly as a required field would be. */
function checkDrillExtras(theoryModules) {
    const moduleIds = theoryModules.map((m) => m.id);

    theoryModules.forEach((mod) => {
        (mod.chapters || []).forEach((chapter) => {
            (chapter.blocks || []).forEach((block) => {
                if (block.type !== 'drill') return;
                const where = `drill ${block.id}`;

                if (block.spine !== undefined) {
                    if (!Array.isArray(block.spine) || !block.spine.length) {
                        fail(where, 'spine must be a non-empty array');
                    } else {
                        block.spine.forEach((step, i) => {
                            if (!step || typeof step.do !== 'string' || !step.do.trim()) {
                                fail(where, `spine[${i}] needs a 'do' string — one line of instruction`);
                            }
                            if (!step || typeof step.nuance !== 'string' || !step.nuance.trim()) {
                                fail(where, `spine[${i}] needs a 'nuance' string — one line of why`);
                            }
                        });
                    }
                }

                (block.pullsFrom || []).forEach((ref, i) => {
                    if (!moduleIds.includes(ref.moduleId)) {
                        fail(where, `pullsFrom[${i}] names module '${ref.moduleId}', which does not exist`);
                    }
                });

                (block.followUps || []).forEach((ref, i) => {
                    if (!ref.question || !String(ref.question).trim()) {
                        fail(where, `followUps[${i}] needs a question`);
                    }
                    if (!moduleIds.includes(ref.moduleId)) {
                        fail(where, `followUps[${i}] names module '${ref.moduleId}', which does not exist`);
                    }
                });

                // The screen has room for three failure modes and the mock
                // shows three. More is not an error, but zero means the block
                // renders a heading over nothing.
                if (!(block.watchFor || []).length) {
                    fail(where, 'has no watchFor entries — the "Where candidates lose it" panel would be empty');
                }
            });
        });
    });
}
```

Add `checkDrillExtras(theoryModules);` to `main()`, beneath `checkTotals`.

Run `node tools/validate-nav.js`. Expected: passes — no drill has these fields yet, and all 24 already have `watchFor`.

- [ ] **Step 2: Write the mode**

Create `js/synthesis.js` with two renderers:

`renderSynthesisOverview()` — the seven rounds as cards, each with its module title, its drill count, `n rehearsed`, and total minutes. Mirrors `renderTrackSection()` in `js/theory.js:334`; reuse `renderProgressBar()`.

`renderSynthesisPrompt(moduleId, drillId)` — **one prompt per screen, not a list.** Given a module and optionally a drill id, resolve the drill (default: the first unrehearsed one, else the first). Build, in this order:

| Block | Source | Fallback when absent |
|---|---|---|
| Round label + duration | `ROUND 0n · <module title> · <block.minutes> MIN` | — |
| The question verbatim | `block.prompt` | — |
| Answer spine | `block.spine[]` → numbered rows, `do` on one line in `--ds-text`, `nuance` beneath in `--ds-muted` | `block.sketch` rendered through `renderCodeBlock()`, collapsed, titled "Solution sketch — try it first" |
| Pulls from | `block.pullsFrom[]` → `markTile(trackMarks[trackId], trackHue(trackId))` + chapter title, linking to `generateTheoryHash(moduleId, chapterId)` | the module's `docHub` links |
| Where candidates lose it | `block.watchFor[]` | — (validated non-empty) |
| Follow-ups to expect | `block.followUps[]` → cards linking to the owning chapter | omitted |
| Footer | `Mark rehearsed` toggle → `setDrillRehearsed(block.id, …)`, then `Next prompt` → `generateModeHash('synthesis', …)` walking `allDrills()` | — |

Prev/next walk the flat `allDrills()` list, so `Next prompt` crosses a module boundary into the next round rather than dead-ending.

- [ ] **Step 3: Load and verify**

`<script src="js/synthesis.js"></script>` after `js/theory.js`. Confirm: `#synthesis` lists seven rounds; clicking one shows a single prompt; `Mark rehearsed` moves the header counter from `0 / 24 REHEARSED`; `Next prompt` crosses from the last drill of one round to the first of the next; the sidebar shows rounds and **no tracks**.

- [ ] **Step 4: Commit**

```bash
git add js/synthesis.js js/theory.js tools/validate-nav.js index.html
git commit -m "Give the twenty-four drills a screen each, and a mode of their own"
```

---

## Task C2: Predict the Output

**Files:**
- Create: `js/predict.js`
- Modify: `js/theory.js:1402` (`renderPredictBlock`)

> **Multiple-choice options are not in this plan.** They are a separate content
> project — three plausible wrong answers for each of 80 snippets — and they
> have their own plan at
> [`docs/plans/2026-10-23-predict-answer-options.md`](2026-10-23-predict-answer-options.md).
> This task ships reveal-then-self-grade, which produces the same `SOLVED`
> counter and the same verdict strip with nothing authored. The later plan
> replaces the answer control set by set without touching storage or routing.

- [ ] **Step 1: Write the mode**

Create `js/predict.js`:

`renderPredictOverview()` — the seven sets as cards, each with its title, `n / m SOLVED`, and a miniature verdict strip.

`renderPredictSnippet(moduleId, snippetId)` — **one snippet per screen.** Blocks in order:

| Block | Detail |
|---|---|
| Set + position | `<SET TITLE> · 6 OF 12`, mono 11 caps, `--ds-faint` |
| Question | `block.prompt`, which every one of the 80 blocks already carries |
| Code | `renderCodeBlock({ language, title: filename, code })` **without `output`** — same reason `renderPredictBlock` withholds it today. A `TRICKY` chip from `block.importance === 'must-know'` sits in the filename bar. |
| Answer | A single `Reveal the output` button. On reveal: the `output.lines` pane, then two 44px rows — `I got it right` / `I got it wrong` — both ending at `setPredictVerdict(block.id, verdict)`. |
| Post-answer | The chosen row outlined `1px solid var(--hue-teal-ink)` for right, `var(--tier-must-dot)` for wrong, with a caption `YOUR ANSWER · CORRECT` / `YOUR ANSWER · WRONG` in mono 11 caps |
| Why | `block.output.explain`, in a callout with `border-left: 3px solid var(--rail-accent)` |
| Distractor | `block.distractor`, when present, beneath the Why |
| Actions | `Next snippet` → `generateModeHash('predict', …)` walking `allPredicts()`; `Add to review` → a `setQuestionReviewLater`-shaped toggle on the snippet; `Theory › <chapter title>` → `generateTheoryHash(moduleId, chapterId)` |

The answer control is built by one function, `renderAnswerControl(block)`, and everything around it reads only `predictVerdict(block.id)`. That is the seam the options plan replaces — it swaps that one function and changes nothing else.

`setPredictVerdict` also calls `setPredictionRevealed(block.id, true)` so the two stores stay consistent and a reader who revealed answers under the old UI arrives with those snippets already counted.

- [ ] **Step 2: Verify**

Confirm: the answer is not in the DOM before reveal (inspect the tree, not the screen — that is the contract `renderPredictBlock` has held since it was written); the sidebar strip fills in as verdicts land; `6 / 80 SOLVED` in the header tracks it; `Next snippet` crosses set boundaries.

- [ ] **Step 3: Commit**

```bash
git add js/predict.js js/theory.js index.html
git commit -m "Show one snippet at a time, and record whether it was got right"
```

---

## Task C3: Glossary

**Files:**
- Create: `js/glossary.js`
- Modify: `js/theory.js` (delete `collectGlossaryEntries`, `sortKey`, `glossaryLetter`, `renderTheoryGlossary`, `renderGlossaryIndex`, `renderGlossarySection`, `renderGlossaryEntry` — lines 528–720 — moved verbatim)

- [ ] **Step 1: Move, then add the three things the mode needs**

`collectGlossaryEntries()` gains `trackId` on each entry:

```js
                entries.push({
                    term: block.term,
                    aka: block.aka || null,
                    html: block.html || '',
                    important: Boolean(block.important),
                    moduleId: mod.id,
                    moduleOrder: mod.order,
                    moduleTitle: mod.title,
                    // Carried so the sidebar can filter by track without every
                    // consumer re-resolving the module.
                    trackId: mod.trackId,
                    chapterId: chapter.id,
                    chapterTitle: chapter.title
                });
```

`renderGlossary(letter, trackFilter)` replaces `renderTheoryGlossary()`:

- Alphabetical sections: letter heading, a rule, and the term count for that letter.
- Term card: term, an **ASKED** chip when `important`, the 2–3 sentence definition, and a `THEORY ›` backlink built from `generateTheoryHash(entry.moduleId, entry.chapterId)`.
- Grid: `grid-template-columns: repeat(auto-fill, minmax(330px, 1fr))`.
- `letter` scrolls that section into view; `trackFilter` hides cards from other tracks and marks the sidebar row active.
- An `IntersectionObserver` calls `markTermSeen(entry.term)` when a card has been on screen — this is what makes `41 / 68 SEEN` mean anything.

- [ ] **Step 2: Make the missing backlink an error, not a silent gap**

Handoff §7: *"a term with no owning chapter is a content bug."* `collectGlossaryEntries` cannot produce one — it harvests from inside a chapter — so the check belongs in the validator, where a future refactor could break it:

```js
function checkGlossaryBacklinks(theoryModules) {
    theoryModules.forEach((mod) => {
        (mod.chapters || []).forEach((chapter) => {
            (chapter.blocks || []).forEach((block) => {
                if (block.type !== 'definition') return;
                if (!block.term || !String(block.term).trim()) {
                    fail(`definition in ${mod.id}/${chapter.id}`, 'has no term');
                }
                if (!chapter.id || !mod.id) {
                    fail(`definition ${block.term}`, 'has no owning chapter — every term needs a THEORY › backlink');
                }
            });
        });
    });
}
```

Add `checkGlossaryBacklinks(theoryModules);` to `main()`.

- [ ] **Step 3: Verify**

Confirm: 68 terms across the A–Z; every card has a working `THEORY ›` link; the letter grid greys out letters with no terms; the track filter narrows the list and the URL carries it (`#glossary?track=async`); scrolling raises the SEEN count; both themes.

- [ ] **Step 4: Commit**

```bash
git add js/glossary.js js/theory.js tools/validate-nav.js index.html
git commit -m "Move the glossary out of theory and give it an alphabet"
```

---

## Task C4: Empty Theory of the three

The three modes now exist. This is the task that makes Theory stop carrying them — and it comes last in the phase deliberately, so no chapter is ever unreachable in between.

**Files:**
- Modify: `js/theory.js:261-333` (`renderTheoryOverview`), `js/theory.js:305-310` (the glossary link), `js/theory.js:648`
- Modify: `css/theory.css` (delete `.theory-glossary-link`)
- Modify: `tools/validate-nav.js`

- [ ] **Step 1: Assert Theory's new size before changing it**

Append to `tools/validate-nav.js`, and call it from `main()`:

```js
/* Theory is now seven tracks. The two that became modes still own their
   modules — nothing was re-tracked — but nothing in Theory may render them, and
   this is the check that says so in numbers rather than in a comment. */
const THEORY_SHAPE = { tracks: 7, modules: 43, chapters: 154 };

function checkTheoryShape(theoryModules, theoryTracks) {
    const subjects = theoryTracks.filter((t) => t.scope === SUBJECT).map((t) => t.id);
    const mods = theoryModules.filter((m) => subjects.includes(m.trackId));
    const actual = {
        tracks: subjects.length,
        modules: mods.length,
        chapters: mods.reduce((n, m) => n + (m.chapters || []).length, 0)
    };
    Object.keys(THEORY_SHAPE).forEach((k) => {
        if (actual[k] !== THEORY_SHAPE[k]) {
            fail('theory', `${k} is ${actual[k]}, expected ${THEORY_SHAPE[k]} — ` +
                'if the corpus grew on purpose, update THEORY_SHAPE in tools/validate-nav.js');
        }
    });
}
```

```bash
node tools/validate-nav.js
```

Expected: passes. 43 modules and 154 chapters is 57 and 203 less the 14 promoted modules and their 49 chapters.

- [ ] **Step 2: Narrow the overview to the subject tracks**

In `renderTheoryOverview()` (`js/theory.js:275-279`), replace the two lookups and the two totals:

```js
        // Seven tracks, not nine. The other two are modes now, and their
        // modules are counted by the modes that own them — a Theory header
        // that still said "57 modules" would be counting fourteen pages the
        // reader cannot reach from here.
        const modules = subjectTrackModules();
        const tracks = subjectTracks();

        const totalMinutes = modules.reduce((n, m) => n + (m.estimatedMinutes || 0), 0);
        const totalChapters = modules.reduce((n, m) => n + (m.chapters || []).length, 0);
```

The `tracks.forEach(...)` loop at `js/theory.js:321-324` already iterates `tracks`, so it now emits seven sections and its `.sort((a, b) => a.order - b.order)` is redundant — `subjectTracks()` sorts. Drop the `.slice().sort(...)` there.

- [ ] **Step 3: Delete the glossary link from the Theory header**

Remove `js/theory.js:305-310` entirely:

```js
        const glossaryLink = document.createElement('a');
        glossaryLink.className = 'theory-dochub-link theory-glossary-link';
        glossaryLink.href = generateTheoryHash(GLOSSARY_ROUTE);
        glossaryLink.textContent =
            `Glossary — ${collectGlossaryEntries().length} terms defined across the path`;
        header.appendChild(glossaryLink);
```

The Glossary is reached from the rail now, and from the digit `5`. A second door in the Theory header would say it is still a room inside Theory.

Then delete the `.theory-glossary-link` rule from `css/theory.css` — nothing emits that class any more.

- [ ] **Step 4: Keep the in-chapter term popover, and repoint it**

`linkGlossaryTerms()` and `renderTermPopover()` (`js/theory.js:117-260`) underline a defined term where it appears in a chapter and show its definition on hover. **That stays.** It is a reading aid inside the prose, not navigation, and removing it would make Theory worse in exchange for nothing — the requirement is that the Glossary is no longer a *destination inside Theory*, not that chapters forget which words they defined.

One line changes: the popover's "full entry" link at `js/theory.js:648`:

```js
    link.href = generateGlossaryHash(null, null);   // was `#${THEORY_ROUTE}/${GLOSSARY_ROUTE}`
```

- [ ] **Step 5: Confirm nothing in Theory reaches the three**

With the app served, on `#theory`:

```js
// In the console. All three must be true.
document.querySelectorAll('.theory-track').length === 7
!document.querySelector('.theory-glossary-link')
![...document.querySelectorAll('a[href^="#theory/"]')]
    .some((a) => ['synthesis', 'output'].includes(
        theoryByModuleId[a.getAttribute('href').split('/')[1]]?.trackId))
```

And read the header: it must say **7 tracks · 43 modules · 154 chapters**, not 9 · 57 · 203.

- [ ] **Step 6: Commit**

```bash
git add js/theory.js css/theory.css tools/validate-nav.js
git commit -m "Take the three promoted sections out of Theory"
```

Body: they are siblings of Theory now, not rooms inside it. Theory is seven tracks of forty-three modules, and a header still counting the other fourteen would be counting pages the reader cannot reach from that page. The in-chapter term popover stays — that is prose, not navigation.

---

# Phase D — Search, keyboard, and the seams

Three commits.

## Task D1: Search results grouped by mode

**Files:**
- Modify: `js/search.js:24-98` (index), `js/search.js:202-307` (render + navigate)

- [ ] **Step 1: Tag every entry with its mode**

`indexQuestions` sets `mode: 'questions'`. `indexChapters` splits on the module's track scope: `synthesis` → `mode: 'synthesis'`, `output` → `mode: 'predict'`, everything else → `mode: 'theory'`. Two new indexers join them:

```js
/* A glossary term and a snippet are different actions and cannot share a flat
   list, which is the whole reason the results are grouped. They have to be in
   the index before they can be grouped, and until now neither was. */
function indexTerms() {
    return collectGlossaryEntries().map((entry) => ({
        kind: 'term',
        mode: 'glossary',
        title: entry.term,
        context: `${entry.moduleTitle} › ${entry.chapterTitle}`,
        term: entry.term,
        moduleId: entry.moduleId,
        chapterId: entry.chapterId,
        searchText: [entry.term, entry.aka, stripHtml(entry.html)].join(' ').toLowerCase()
    }));
}

function indexDrills() {
    return allDrills().map((block) => ({
        kind: 'prompt',
        mode: 'synthesis',
        title: block.title,
        context: `Interview Synthesis › ${theoryByModuleId[block.moduleId].title}`,
        moduleId: block.moduleId,
        itemId: block.id,
        searchText: [block.title, stripHtml(block.prompt), (block.watchFor || []).join(' ')]
            .join(' ').toLowerCase()
    }));
}
```

- [ ] **Step 2: Group the render in rail order**

`renderSearchResults` buckets by `entry.mode`, walks `appModes` so the groups come out in rail order, and emits a group header carrying the mode's **full** title:

```js
function renderSearchResults(results, query) {
    const host = document.getElementById('searchResults');
    host.innerHTML = '';

    const byMode = {};
    results.forEach((r) => { (byMode[r.mode] = byMode[r.mode] || []).push(r); });

    appModes.forEach((mode) => {
        const group = byMode[mode.id];
        if (!group || !group.length) return;

        const heading = document.createElement('div');
        heading.className = 'search-group-heading';
        // Full name, never the rail abbreviation.
        heading.textContent = mode.title;
        heading.style.setProperty('--rail-accent', `var(${mode.accentVar})`);
        host.appendChild(heading);

        // buildSearchResult is the per-row markup that renderSearchResults
        // builds inline today (js/search.js:210-265), lifted into a function so
        // it can be called once per group instead of once per flat list.
        group.forEach((entry) => host.appendChild(buildSearchResult(entry, query)));
    });
    ...
}
```

`navigateToResult` switches on `entry.mode` and builds the hash through the matching generator — `generateHash`, `generateTheoryHash`, `generateModeHash`, `generateGlossaryHash`.

- [ ] **Step 3: Verify**

Search `flow`. Confirm results appear under **Questions**, **Theory**, **Predict the Output** headers in rail order, each landing in the right mode.

- [ ] **Step 4: Commit**

```bash
git add js/search.js
git commit -m "Group search results by mode, because they are not the same action"
```

---

## Task D2: The keyboard map

**Files:**
- Modify: `js/app.js:972-985`
- Modify: `js/search.js:313` — `hideSearchResults()` currently returns nothing; make it `return` whether the panel was open, so Escape can fall through to collapsing when search was already closed:

```js
function hideSearchResults() {
    const host = document.getElementById('searchResults');
    if (!host || host.hidden) return false;
    host.hidden = true;
    return true;
}
```

- [ ] **Step 1: Replace the single `/` handler**

```js
    /* One handler, because these keys have to agree about when they are off:
       every one of them is ignored while focus is in a field, and a reader
       typing "just" into search must not be sent to Predict on the j.

       g-then-letter is the only two-key sequence. It arms for one keypress and
       disarms on anything else, so a stray g does not swallow the next key. */
    let pendingJump = false;

    document.addEventListener('keydown', (event) => {
        if (event.metaKey || event.ctrlKey || event.altKey) return;

        const tag = (event.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return;

        if (pendingJump) {
            pendingJump = false;
            if (activeMode === 'glossary' && /^[a-z]$/i.test(event.key)) {
                event.preventDefault();
                window.location.hash = generateGlossaryHash(event.key.toUpperCase(), null);
                return;
            }
        }

        const mode = modeForKey(event.key);
        if (mode) { event.preventDefault(); goToMode(mode.id); return; }

        switch (event.key) {
            case '/':
                event.preventDefault();
                document.getElementById('searchInput').focus();
                return;
            case 'g':
                if (activeMode === 'glossary') { pendingJump = true; event.preventDefault(); }
                return;
            case 'j': event.preventDefault(); moveFocusInList(1); return;
            case 'k': event.preventDefault(); moveFocusInList(-1); return;
            case 'Enter': {
                const focused = document.activeElement;
                if (focused && focused.closest('.question-card, .predict-option, .theory-predict')) {
                    event.preventDefault();
                    activateFocusedItem(focused);
                }
                return;
            }
            case 'Escape':
                if (!hideSearchResults()) collapseFocusedItem();
                return;
        }
    });
```

`moveFocusInList(delta)` walks `.question-card`, `.glossary-term`, `.theory-chapter` or `.synthesis-prompt` depending on the active mode, wrapping at neither end. `activateFocusedItem` calls `toggleAnswer` for a question card and the reveal path for a predict block. `hideSearchResults()` returns whether it had anything to hide, so Escape falls through to collapsing when search was already closed.

- [ ] **Step 2: Verify**

With focus on the page body: `1`–`5` switch modes; `/` focuses search; typing `just` in the field does not navigate; in Glossary `g` then `k` jumps to K; `j`/`k` move down and up the list; Enter expands; Escape collapses, and clears search first when search is open.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "Give the five modes five digits, and one place that decides when a key is off"
```

---

## Task D3: Documentation, and the validator in the loop

**Files:**
- Modify: `CLAUDE.md`, `docs/ARCHITECTURE.md`

- [ ] **Step 1: Add the validator to the pre-commit list**

In `CLAUDE.md`, replace the single-command block with:

```bash
node tools/validate-theory.js && node tools/validate-questions.js && node tools/validate-nav.js
```

- [ ] **Step 2: Rewrite the affected sections of `docs/ARCHITECTURE.md`**

Four sections need real edits, not touch-ups:

- **Load order is the dependency graph** — add `data/modes.js`, `js/sidebar.js`, `js/rail.js`, `js/synthesis.js`, `js/predict.js`, `js/glossary.js` in position, and note that `js/rail.js` forward-references `renderSidebar` from `js/sidebar.js` the same way `navigation.js` forward-references `renderTopic` today.
- **Two corpora, two modes** — now *two corpora, five modes*. Explain that the corpora did not change: `synthesis` and `output` remain theory tracks, and `scope` is what separates the tracks a sidebar lists from the tracks a rail addresses.
- **State** — the table gains `droiddeck:mode`, `droiddeck:mode:last`, `droiddeck:synthesis:rehearsed`, `droiddeck:predict:verdicts`, `droiddeck:glossary:seen`, and a note that the first two are read by an inline `<head>` script because a deferred one is by definition too late to prevent a flash.
- **Rendering** — `handleRouteChange()` now dispatches to **seven** renderers via the mode registry, not four via a hard-coded fork.

Add a new short section, **The mode registry**, explaining why five differently-shaped questions were collapsed into one array and why there is deliberately no total across the five units.

- [ ] **Step 3: Verify the whole thing**

```bash
node tools/validate-theory.js && node tools/validate-questions.js && node tools/validate-nav.js
```

Then walk the §9 definition of done, below.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/ARCHITECTURE.md
git commit -m "Describe the five modes the architecture document still calls two"
```

---

# Definition of done

The handoff's §9, plus the requirement that the three leave Theory, each mapped to the task that satisfies it and the way to check it.

| # | Requirement | Task | Check |
|---|---|---|---|
| 1 | Five modes reachable from the rail and by `1`–`5`, correct accent and progress unit | B2, D2 | Click each, then press each digit. Header reads `KNOWN` / `READ` / `REHEARSED` / `SOLVED` / `SEEN` — five different nouns, no combined total anywhere. |
| 2 | Sidebar contents change with the mode; no track list in Synthesis or Predict | B3 | Switch to Synthesis, then Predict. Confirm `document.querySelectorAll('.nav-item-group[data-track-id]').length === 0`. |
| 3 | Old `/theory/*` URLs redirect | A4 | The ten-row table in Task A4 Step 4, plus a Back press from each. |
| 4 | Search results group by mode | D1 | Search `flow`; headers appear in rail order with full mode names. |
| 5 | Mode + sub-selection + progress survive a reload | B4 | Deep-link into Predict, mark a verdict, reload. Same snippet, verdict intact, no flash of Questions. |
| 6 | No horizontal scroll at 1280px, no clipped rail labels | B1 | At 1280, 1100, 990, 720, 375: `scrollWidth === clientWidth`, and every rail label fully visible. |
| 7 | The three are gone from Theory | C4 | On `#theory`: seven track sections, header reads `7 tracks · 43 modules · 154 chapters`, no glossary link, and no link into a `synthesis` or `output` module. |

Plus the constraints from §8 that are checkable rather than visual:

- **No new colours** — `grep -nE '#[0-9a-fA-F]{6}|rgba?\(' css/*.css | grep -v themes.css` returns nothing.
- **Minimum 13px text, 40px hit targets, 44px answer rows** — spot-check computed styles on `.rail-item`, `.rail-label`, `.predict-option`.
- **`flex-shrink: 0` and `white-space: nowrap`** on every fixed-width element and every label/count in `css/rail.css` — present by construction in Task B1.
- **Content unchanged** — `git diff --stat main -- data/` should show only `data/index.js` (the `topicTracks` map) and `data/theory/index.js` (the `scope` field). **No chapter, question or term text changes in this pass.**

---

# Explicitly out of scope

Named here so nobody has to guess whether they were forgotten.

1. **Writing the 24 answer spines, the 24 "pulls from" sets and the follow-up questions.** The fields are defined, validated and rendered; the prose is a content pass. Task C1 ships the drill's existing solution sketch in the spine's place until then.
2. **Multiple-choice answer options.** Moved out of this plan entirely, into [`docs/plans/2026-10-23-predict-answer-options.md`](2026-10-23-predict-answer-options.md), to be implemented later. Task C2 ships reveal-and-self-grade, which produces the same `SOLVED` counter and the same verdict strip today.
3. **The 188px `labelled` rail variant.** Handoff §3 calls it a settings-level preference and says to ship compact. The CSS hook (`.rail[data-labels="labelled"]`) is worth leaving in place; the settings surface is not in this plan.
4. **Re-homing `android-system-design` and `data-structures-algorithms` questions.** They are filed under the nearest subject track (§1.4) rather than moved. If that reads wrong once it is on screen, the fix is one line in `data/index.js`.
5. **The `#6EE7B7` Predict accent.** Substituted with `--hue-teal-ink` (§1.5). Adding it would mean a tenth hue, which `css/themes.css:129` forbids in writing. If the exact green is wanted, that is a design-system change and belongs in a commit that says so.
