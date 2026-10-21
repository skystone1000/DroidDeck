# Predict the Output — Answer Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** [`2026-10-22-rail-nav-refactor.md`](2026-10-22-rail-nav-refactor.md) must be complete. Predict must already be a rail mode rendering one snippet per screen, with `setPredictVerdict()` writing `droiddeck:predict:verdicts`, and its answer control isolated in `renderAnswerControl(block)`.
>
> **Commit discipline:** `CLAUDE.md` governs. Hand-set dates, 10–12 per day, times drawn at random from 09:00–22:00 and strictly increasing within a day, timezone `+0530`. Imperative subject, blank line, prose body explaining *why*.

**Goal:** Replace Predict's reveal-then-self-grade control with four real multiple-choice options per snippet, authored one set at a time, so a verdict is earned rather than reported.

**Architecture:** Two moves, and the order matters. First a **mechanism** commit adds the `options` / `answer` fields, validates them, and teaches `renderAnswerControl()` to prefer them when present — at which point the app supports MCQ and not one snippet has it. Then **seven content commits**, one per set, each authoring the options for that set and flipping it over. A set that has not been authored keeps working exactly as it does today. There is no flag day, no migration, and no point at which the mode is half-broken.

**Tech Stack:** Same as the app — no build step, plain globals, `tools/validate-nav.js` and `tools/run-snippets.js` as the safety net.

---

## 0. What this is really about

The work is **240 wrong answers**, not 80 right ones. The right answer already exists in every block, as `output.lines`. What has to be written is three plausible wrong ones per snippet, and a wrong answer that is obviously wrong makes the exercise worthless — the reader picks by elimination and learns nothing.

That is why this is a separate plan and why it is paced one set at a time. It is authoring, not refactoring.

### The corpus

80 snippets across seven sets, all in the `output` track:

| Order | Set | Snippets | Output kind |
|---|---|---|---|
| 51 | Builders and Ordering | 11 | 11 stdout |
| 52 | Cancellation and Exceptions | 12 | 12 stdout |
| 53 | Flow, Hot and Cold | 13 | 13 stdout |
| 54 | Kotlin Language Semantics | 15 | 15 stdout |
| 55 | Java Semantics | 12 | 12 stdout |
| 56 | Compose Recomposition | 9 | 9 **trace** |
| 57 | Lifecycle and Launch Modes | 8 | 8 **trace** |

**The two trace sets are different work.** 63 snippets record `output.kind: 'stdout'` — real console text that `tools/run-snippets.js` compiles and diffs against the corpus, so the correct option is machine-checkable. The other 17 record `kind: 'trace'`: a described sequence of behaviour that no runner can execute, which is why they say so in the data rather than pretending. For those, the correct option is an authored sentence, and the validator cannot check it against anything. Author them **last**, when the pattern from the five verifiable sets is established.

### The one field already doing half this job

Every block carries `distractor` — a paragraph naming the wrong answer a reader is most likely to reach for:

> *"Expecting `let` to give back the `User` because that is what the lambda operated on. It gives back the last expression, and the last expression is a string literal."*

That is one of the three wrong options, already written, for all 80 snippets. **Mine it first.** Where `distractor` names a concrete wrong output, that output becomes an option and the paragraph stays as the post-answer explanation of why it was tempting. Two more per snippet is the actual writing.

---

## 1. Decisions

### 1.1 Exactly four options, never three or five

The screen lays out four 44px rows (handoff §7). Three leaves a hole, five overflows the fold on a laptop. The validator enforces four, so a set cannot half-comply.

### 1.2 Option ids are `a`–`d`, and order is authored, not shuffled

Shuffling on render would mean the correct row moves between visits, which breaks the reader's memory of "I picked B last time and B was wrong" — and that memory is the whole value of coming back to a set. The author places the correct answer, and is responsible for not putting it at `b` every time.

The validator checks the distribution across a set and warns when the correct answer lands on one letter more than half the time. A reader who notices that B is usually right has stopped reading the code.

### 1.3 The correct option must reproduce `output.lines` verbatim for a `stdout` snippet

This is the check that makes the whole thing trustworthy. `tools/run-snippets.js` already compiles those 63 snippets and diffs real output against `output.lines`. If the correct option is required to equal `output.lines` joined by newlines, then the runner is transitively checking the multiple choice too — the right answer cannot drift from what the code actually prints.

For the 17 `trace` snippets there is nothing to diff against, and the validator says so explicitly rather than passing them silently.

### 1.4 The three wrong options must be wrong in a *named* way

Free-form wrong answers decay into noise. Each carries a `why` — one line saying which misconception produces it — and that line renders after the reader commits. This is what turns a wrong pick into a lesson instead of a red row.

The three failure modes worth writing, in rough priority:

1. **The `distractor`** — what the block already says people reach for.
2. **An off-by-one-concept result** — right mechanism, wrong ordering or wrong count. For coroutines that is usually interleaving; for Kotlin it is usually eager-versus-lazy; for Compose it is a recomposition count that is one too many or too few.
3. **A plausible exception or a plausible "nothing"** — `Throws ConcurrentModificationException`, `Prints nothing`, `Hangs`. Cheap to write and genuinely tempting, but at most one per snippet: a set where every fourth option is an exception teaches the reader to skip it.

### 1.5 Storage does not change

`setPredictVerdict(blockId, 'right' | 'wrong')` and `droiddeck:predict:verdicts` are untouched. An MCQ pick calls the same function the self-grade button called; the only difference is that the app now decides the verdict instead of asking. A reader with 30 self-graded verdicts keeps all 30.

---

## 2. File structure

**Modified**

| File | Change |
|---|---|
| `js/predict.js` | `renderAnswerControl(block)` gains the MCQ branch; `renderOptionRow()` is new. |
| `css/rail.css` *(or a new `css/predict.css` if the rules exceed ~80 lines)* | Option row states: resting, hover, chosen-correct, chosen-wrong, revealed-correct. |
| `tools/validate-nav.js` | `checkPredictOptions()` — shape, uniqueness, the `output.lines` identity for stdout, and the answer-position distribution. |
| `data/theory/predict-*.js` | Seven files, one per commit, each gaining `options` and `answer` on every block. |

**No new files** unless the CSS grows past ~80 lines. This is deliberately a small-surface change; the seven content commits are the bulk.

---

## Task 1: The mechanism

One commit. At the end of it the app supports options and no snippet has them, so nothing visible changes.

**Files:**
- Modify: `tools/validate-nav.js`
- Modify: `js/predict.js`
- Modify: `css/rail.css`

- [ ] **Step 1: Write the failing validator check**

Append to `tools/validate-nav.js` and call it from `main()`:

```js
/* Four answer options and the id of the right one. Optional: a set that has
   not been authored still renders the reveal-and-self-grade control, and this
   check is silent about it. What it is not silent about is a half-authored
   block — three options, a duplicated id, an answer naming an option that is
   not there — because a broken multiple choice is worse than none.

   The identity check on `stdout` snippets is the load-bearing one. Those 63
   blocks are compiled and diffed by tools/run-snippets.js, so requiring the
   correct option to equal `output.lines` verbatim puts the multiple choice
   under the same verification the output pane already has. The 17 `trace`
   blocks have nothing to diff against and are reported, not assumed. */
function checkPredictOptions(theoryModules) {
    let unverifiable = 0;

    theoryModules.forEach((mod) => {
        (mod.chapters || []).forEach((chapter) => {
            (chapter.blocks || []).forEach((block) => {
                if (block.type !== 'predict') return;

                const where = `predict ${block.id}`;
                const has = block.options !== undefined || block.answer !== undefined;
                if (!has) return;

                if (!Array.isArray(block.options) || block.options.length !== 4) {
                    fail(where, `options must be exactly 4, found ${(block.options || []).length}`);
                    return;
                }

                const ids = block.options.map((o) => (o && o.id) || null);
                if (new Set(ids).size !== 4) fail(where, `option ids must be unique, got ${ids.join(', ')}`);
                if (ids.join('') !== 'abcd') fail(where, `option ids must be a, b, c, d in order, got ${ids.join(', ')}`);

                block.options.forEach((o, i) => {
                    if (!o || typeof o.text !== 'string' || !o.text.trim()) {
                        fail(where, `options[${i}] needs a text`);
                    }
                    // Only the wrong ones carry a `why`; the right one's
                    // explanation is the block's own output.explain.
                    if (o && o.id !== block.answer && (typeof o.why !== 'string' || !o.why.trim())) {
                        fail(where, `options[${i}] ('${o.id}') is a wrong answer and needs a 'why' naming the misconception it comes from`);
                    }
                });

                if (!ids.includes(block.answer)) {
                    fail(where, `answer '${block.answer}' is not one of the option ids`);
                    return;
                }

                const correct = block.options.find((o) => o.id === block.answer);
                const kind = (block.output || {}).kind;

                if (kind === 'stdout') {
                    const expected = (block.output.lines || []).join('\n');
                    if (correct.text !== expected) {
                        fail(where, 'the correct option does not match output.lines verbatim — ' +
                            'run-snippets.js verifies those lines against real output, and the ' +
                            'option has to be the same string or the check does not cover it');
                    }
                } else {
                    // Not an error. A trace snippet's answer is an authored
                    // sentence and no runner can confirm it — the corpus says
                    // so in the data, and so does this.
                    unverifiable += 1;
                }
            });
        });
    });

    if (unverifiable) {
        console.log(`  · ${unverifiable} authored option set(s) on trace snippets — correct answer not machine-checkable, by design`);
    }
}

/* A reader who works out that the answer is usually B has stopped reading the
   code. Per set, because the author writes a set at a time and that is where
   the habit forms. */
function checkAnswerDistribution(theoryModules) {
    theoryModules.filter((m) => m.trackId === 'output').forEach((mod) => {
        const answers = [];
        (mod.chapters || []).forEach((c) => (c.blocks || []).forEach((b) => {
            if (b.type === 'predict' && b.answer) answers.push(b.answer);
        }));
        if (answers.length < 4) return;

        ['a', 'b', 'c', 'd'].forEach((id) => {
            const n = answers.filter((a) => a === id).length;
            if (n > answers.length / 2) {
                fail(`set ${mod.id}`, `'${id}' is the correct answer ${n} times out of ${answers.length} — spread them`);
            }
        });
    });
}
```

- [ ] **Step 2: Run it and confirm it is silent**

```bash
node tools/validate-nav.js
```

Expected: `✓ navigation registry OK`, with no mention of options. Nothing is authored yet, so the check has nothing to say — that is the correct behaviour for an optional field.

- [ ] **Step 3: Prove the check works before trusting it**

Temporarily add a deliberately broken block to `data/theory/predict-kotlin.js` — three options, an answer naming a fourth:

```js
                    options: [
                        { id: 'a', text: 'one', why: 'x' },
                        { id: 'b', text: 'two', why: 'x' },
                        { id: 'c', text: 'three', why: 'x' }
                    ],
                    answer: 'd',
```

```bash
node tools/validate-nav.js
```

Expected: `✗ predict <id>: options must be exactly 4, found 3`. **Revert the edit** before continuing — a check nobody has seen fail is a check nobody knows works.

- [ ] **Step 4: Teach the renderer to prefer options**

In `js/predict.js`, `renderAnswerControl(block)` becomes the fork. Nothing else in the file changes:

```js
/* The one seam between the two answer styles. Everything around it reads only
   predictVerdict(block.id), so a set that has options and a set that does not
   produce the same progress, the same sidebar strip and the same counter. */
function renderAnswerControl(block) {
    return (block.options && block.answer)
        ? renderOptions(block)
        : renderRevealAndSelfGrade(block);
}

function renderOptions(block) {
    const wrap = document.createElement('div');
    wrap.className = 'predict-options';
    wrap.setAttribute('role', 'radiogroup');
    wrap.setAttribute('aria-label', 'What does this print?');

    const already = predictVerdict(block.id);
    const chosen = chosenOption(block.id);

    block.options.forEach((option) => {
        wrap.appendChild(renderOptionRow(block, option, chosen));
    });

    if (already) wrap.classList.add('committed');
    return wrap;
}

function renderOptionRow(block, option, chosen) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'predict-option';
    row.dataset.optionId = option.id;
    row.setAttribute('role', 'radio');
    row.setAttribute('aria-checked', String(chosen === option.id));

    const letter = document.createElement('span');
    letter.className = 'predict-option-letter';
    letter.textContent = option.id.toUpperCase();

    const text = document.createElement('span');
    text.className = 'predict-option-text';
    // Option text is authored output, not markup. textContent, so a snippet
    // that prints `<b>` renders as a snippet that prints `<b>`.
    text.textContent = option.text;

    row.appendChild(letter);
    row.appendChild(text);

    if (chosen) {
        markCommittedRow(row, block, option, chosen);
        row.disabled = true;
    } else {
        row.addEventListener('click', () => commitOption(block, option.id));
    }

    return row;
}

/* One click commits, and it commits to two stores at once: which option was
   picked, so the row can be re-marked on return, and the verdict, which is
   what the counter and the sidebar strip read. The reveal control wrote only
   the second — this writes both, and the second one identically. */
function commitOption(block, optionId) {
    setChosenOption(block.id, optionId);
    setPredictVerdict(block.id, optionId === block.answer ? 'right' : 'wrong');
    setPredictionRevealed(block.id, true);
    renderPredictSnippet(currentPredictModuleId, block.id);
}

function markCommittedRow(row, block, option, chosen) {
    const isAnswer = option.id === block.answer;
    const isChosen = option.id === chosen;

    if (isAnswer) row.classList.add('is-correct');
    if (isChosen) {
        row.classList.add('is-chosen');
        const caption = document.createElement('span');
        caption.className = 'predict-option-caption';
        caption.textContent = isAnswer ? 'YOUR ANSWER · CORRECT' : 'YOUR ANSWER · WRONG';
        row.appendChild(caption);
    }
    // The line that turns a red row into a lesson. Shown on the row the reader
    // picked when it was wrong, and on nothing else — four explanations at once
    // is a wall, not a correction.
    if (isChosen && !isAnswer && option.why) {
        const why = document.createElement('span');
        why.className = 'predict-option-why';
        why.textContent = option.why;
        row.appendChild(why);
    }
}
```

Add the chosen-option store to `js/progress.js`, beside the verdicts:

```js
/* Which option was picked, as opposed to whether it was right. The verdict
   drives every counter; this drives only the row marking on return, and it is
   kept separate so that a set authored with options later cannot disturb a
   verdict a reader earned by self-grading before the options existed. */
const CHOSEN_STORAGE_KEY = 'droiddeck:predict:chosen';

function chosenOption(blockId) { return readMap(CHOSEN_STORAGE_KEY)[blockId] || null; }

function setChosenOption(blockId, optionId) {
    const current = readMap(CHOSEN_STORAGE_KEY);
    if (optionId) current[blockId] = optionId; else delete current[blockId];
    writeMap(CHOSEN_STORAGE_KEY, current);
    return current;
}
```

- [ ] **Step 5: The five row states**

In `css/rail.css` (or a new `css/predict.css` if this grows past ~80 lines):

```css
.predict-options { display: flex; flex-direction: column; gap: 8px; margin: var(--space-5) 0; }

.predict-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    min-height: 44px;          /* handoff §8: answer rows are 44, not 40 */
    padding: 11px 14px;
    text-align: left;
    background: var(--ds-surface);
    border: 1px solid var(--ds-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color var(--transition-hover), background var(--transition-hover);
}
.predict-option:not(:disabled):hover { background: var(--ds-raised); border-color: var(--ds-faint); }
.predict-option:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--accent-glow); }
.predict-option:disabled { cursor: default; }

.predict-option-letter {
    flex-shrink: 0;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ds-faint);
    line-height: 22px;
}
.predict-option-text {
    font-family: var(--font-mono);
    font-size: 13px;
    line-height: 1.5;
    color: var(--ds-text);
    white-space: pre-wrap;      /* multi-line stdout keeps its lines */
    word-break: break-word;
}

/* The right answer is outlined whether or not it was chosen — a reader who got
   it wrong has to be able to see what was right without hunting. */
.predict-option.is-correct { border-color: var(--hue-teal-ink); }
.predict-option.is-chosen:not(.is-correct) { border-color: var(--tier-must-dot); }

.predict-option-caption {
    display: block;
    width: 100%;
    margin-top: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: .06em;
    color: var(--ds-muted);
}
.predict-option-why {
    display: block;
    width: 100%;
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.55;
    color: var(--ds-muted);
}
```

- [ ] **Step 6: Verify nothing changed**

Serve the app, open `#predict/predict-kotlin`. Every snippet must still show `Reveal the output` — no set is authored yet, so the fork always takes the second branch.

```bash
node tools/validate-nav.js && node tools/validate-theory.js && node tools/run-snippets.js
```

Expected: all three pass, `run-snippets.js` still verifying 63 snippets.

- [ ] **Step 7: Commit**

```bash
git add js/predict.js js/progress.js css/rail.css tools/validate-nav.js
git commit -m "Let a snippet offer four answers, before any snippet does"
```

Body: the mechanism lands before the content so the two can be judged apart. A set that has not been authored keeps the reveal control, which means the seven authoring commits that follow can each be reverted on its own without leaving the mode in a state nobody designed.

---

## Tasks 2–6: The five verifiable sets

**One commit per set, in this order.** Each is the same five steps; the ordering is by how mechanical the wrong answers are, easiest first, so the pattern is established before it gets hard.

| Task | Set | File | Snippets |
|---|---|---|---|
| 2 | Kotlin Language Semantics | `data/theory/predict-kotlin.js` | 15 |
| 3 | Java Semantics | `data/theory/predict-java.js` | 12 |
| 4 | Builders and Ordering | `data/theory/predict-coroutine-builders.js` | 11 |
| 5 | Cancellation and Exceptions | `data/theory/predict-coroutine-failure.js` | 12 |
| 6 | Flow, Hot and Cold | `data/theory/predict-flow.js` | 13 |

Kotlin first because its wrong answers are the most mechanical — an eager result where the code is lazy, a receiver where the code returns a value. Flow last of the five because its wrong answers require holding replay, buffering and collection timing at once.

### The five steps, for each set

- [ ] **Step 1: Confirm the recorded output is real before building a choice on it**

```bash
node tools/run-snippets.js
```

Expected: every snippet in the set compiles and its real output matches `output.lines`. If one does not, **fix that first** — authoring three wrong answers around a right answer that is itself wrong is the worst possible outcome of this work.

- [ ] **Step 2: Author the options, one block at a time**

For each `predict` block in the file, add `options` and `answer` beneath `distractor`. The correct option's `text` is `output.lines.join('\n')`, character for character. Worked example, from the existing `let-returns-the-lambda-apply-returns-the-receiver` block in `data/theory/predict-kotlin.js:39`:

```js
                    distractor: '<p>Expecting <code>let</code> to give back the <code>User</code> because that is what the lambda operated on. It gives back the last expression, and the last expression is a string literal.</p>',
                    options: [
                        {
                            id: 'a',
                            text: 'let gave:   User(name=Bea, age=30)\napply gave: User(name=Bea, age=30)',
                            // This is the block's own distractor, as an option.
                            why: 'let returns the last expression in its lambda, not the receiver. The User it modified is discarded.'
                        },
                        {
                            id: 'b',
                            text: 'let gave:   just a string\napply gave: User(name=Bea, age=30)'
                        },
                        {
                            id: 'c',
                            text: 'let gave:   just a string\napply gave: just a string',
                            why: 'apply ignores what its lambda evaluates to and always returns the receiver — that is what makes it a configuration block.'
                        },
                        {
                            id: 'd',
                            text: 'let gave:   User(name=Ana, age=30)\napply gave: User(name=Ana, age=30)',
                            why: 'Both lambdas mutate a var on the receiver, so the name is Bea by the time either line prints.'
                        }
                    ],
                    answer: 'b'
```

Three rules while writing:

1. **Every wrong option must be a thing this code could plausibly have printed.** `[1, 2, 3, 4]` is a good wrong answer for a sequence question; `null` is not.
2. **Only the wrong options carry `why`.** The right one's explanation is the block's existing `output.explain`, which the Why callout already renders.
3. **Move the answer around.** Do not let `b` be right more than seven times in fifteen — the validator fails at more than half, but half is already too many.

- [ ] **Step 3: Validate**

```bash
node tools/validate-nav.js && node tools/validate-theory.js
```

Expected: pass. The identity check on `output.lines` is the one most likely to fail here, and it fails on a trailing space or a missing newline — which is exactly the class of error worth catching.

- [ ] **Step 4: Read all of them on screen**

Serve, open the set, and answer every snippet **wrong on purpose**, then right. Confirm for each: four rows at 44px; the picked row captioned; the correct row outlined in teal even when it was not picked; the `why` shown on the wrong pick and on nothing else; the Why callout below still showing `output.explain`; the sidebar strip and the `n / 80 SOLVED` counter both moving.

Then reload and confirm the committed state comes back.

- [ ] **Step 5: Commit**

One commit per set, subject naming the set, body saying what the wrong answers were built out of. For example:

```bash
git commit -m "Give the Kotlin semantics set four answers each

Fifteen snippets that had one output and a paragraph about the output
people expect instead. That paragraph was already one of the three wrong
answers, so it becomes an option and keeps its text as the line that
explains the miss.

The other two per snippet are the eager result where the code is lazy,
and the receiver where the code returns a value — the two mistakes this
set exists to catch. Each carries the misconception it comes from, so a
wrong pick reads as a correction rather than a red row."
```

---

## Tasks 7–8: The two trace sets

| Task | Set | File | Snippets |
|---|---|---|---|
| 7 | Compose Recomposition | `data/theory/predict-compose.js` | 9 |
| 8 | Lifecycle and Launch Modes | `data/theory/predict-lifecycle.js` | 8 |

**These are different, and the difference is not cosmetic.** Their `output.kind` is `trace` — a described sequence of behaviour, not console text — because no runner can execute them. `tools/run-snippets.js` skips them and `tools/validate-nav.js` will report them as unverifiable rather than passing them silently. The correct answer here is an authored claim, and there is nothing in the repo that can confirm it.

Two consequences for how they are written:

- [ ] **Step 1: The correct option restates `output.lines` in the same register as the wrong ones**

For a `stdout` snippet the correct option is a mechanical copy. Here it is a sentence, and if it is phrased more carefully or more precisely than the three wrong ones, the reader picks it on tone rather than on understanding. Write all four in one sitting, in one voice, at one length.

- [ ] **Step 2: Prefer counts and orderings over prose**

`Composes 3 times: initial, on click, on click` is a testable-sounding option. `The composable recomposes when its state changes` is a description of Compose, not an answer to this snippet. For Task 8, prefer the ordered callback list — `onPause → onStop → onCreate → onStart → onResume` — over a paragraph about launch modes.

- [ ] **Step 3: Have the claim checked by a human before committing**

There is no runner for these 17. The check that the correct answer is correct is somebody reading the code and agreeing. Say so in the commit body rather than letting the absence pass unremarked — `docs/verification-log.md` is where this project records what it could not prove, and this belongs there.

- [ ] **Step 4: Validate and commit**

```bash
node tools/validate-nav.js
```

Expected: pass, with the note `· 9 authored option set(s) on trace snippets — correct answer not machine-checkable, by design`.

---

## Definition of done

| # | Requirement | Check |
|---|---|---|
| 1 | All 80 snippets offer four options | `node tools/validate-nav.js` passes and reports 17 unverifiable, meaning 63 were verified against real output |
| 2 | Every correct answer on a `stdout` snippet equals its real output | `node tools/run-snippets.js` passes, and the validator's identity check ties the option to the same string |
| 3 | Every wrong option names its misconception | validator fails any wrong option without a `why` |
| 4 | The answer is not usually B | validator fails any set where one letter is correct more than half the time |
| 5 | Verdicts earned before this plan survive it | with existing `droiddeck:predict:verdicts` in localStorage, the `SOLVED` count is unchanged after the mechanism commit |
| 6 | Rows are 44px, text never below 13px | computed styles on `.predict-option`, `.predict-option-text` |
| 7 | Both themes | every one of the five row states read in dark and light |
| 8 | The 17 unprovable answers are recorded as unprovable | an entry in `docs/verification-log.md` naming them |

---

## Explicitly out of scope

1. **Shuffling option order per visit.** §1.2 — it destroys the reader's memory of what they picked last time, which is the reason to return to a set.
2. **Timing the answer, or scoring a streak.** The mode counts snippets solved. A timer would change what the exercise is for.
3. **Retiring the self-grade path.** It stays as the fallback branch. Any predict block authored in future starts without options and still works, which is what keeps the barrier to adding a snippet low.
4. **Options for the drill blocks in Interview Synthesis.** A drill has no single right answer — that is the difference between the two modes, and it is worth keeping.
