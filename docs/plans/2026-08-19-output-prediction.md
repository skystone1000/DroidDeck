# Plan — Predict the Output

**Status:** planned
**Date:** 2026-08-19
**Scope:** a ninth theory track of code snippets that ask the reader what the
program prints, categorised by topic, with the answer hidden until they commit —
and the answer machine-verified wherever the language can be run.

There is one idea here that does most of the work, so it is worth stating before
the argument for it. DroidDeck already has a verifier that compiles a snippet,
runs it, and fails the build if the recorded output is not what the program
actually printed. It runs over 106 snippets today. **It cannot see the theory
corpus at all.** Extending it is the difference between a section that teaches
what code does and a section that asserts what code does, and it is the first
thing this plan does rather than the last.

---

## 1. Why

The question bank tests whether you can *say* a thing. Nothing in DroidDeck
tests whether you can *read* a thing.

That gap matters because it is the gap interviewers use. Asking "what is the
difference between `launch` and `async`?" gets a rehearsed paragraph from
anybody who has revised, and separates nobody. Putting eight lines on a screen
and asking what they print separates almost everybody, because the answer cannot
be recalled — it has to be derived, live, from a model of how coroutines
actually dispatch. A candidate who has read the paragraph and a candidate who
has the model give the same answer to the first question and different answers
to the second.

The corpus is already shaped for the first kind and not the second. 272 code
snippets exist across 465 questions, and every one of them sits **inside an
answer that has already been given**. The snippet illustrates a conclusion the
reader has just been handed. There is nowhere in the app where a snippet arrives
before its explanation, which is the only arrangement under which a reader finds
out whether they were right.

Three smaller facts push the same way:

**The verifier is half-employed.** `run-snippets.js` compiles and runs every
snippet whose output is recorded as `stdout` and diffs it against the corpus —
106 of them. It walks `topics` only. The 128 `syntax` blocks in the theory
corpus carry no output field and are checked by nothing. So the half of the app
built for *learning* is the half where a wrong claim survives, and the half built
for *lookup* is the half that is proven. That is backwards.

**Output prediction is the one exercise where "expected output" is a fact.**
Every other content type in this repo is a judgement — is this must-know, is
this answer well-worded, is this the right diagram. "What does this print" has
one right answer and a compiler that knows it. It is the only content DroidDeck
could ever hold that cannot rot silently, provided the plumbing exists.

**The research says these are asked, and says it about specific mechanisms.**
Section 3 records what the survey actually found, including where it found less
than hoped.

## 2. What exists today

Verified against the tree at `2a493dd`:

| Fact | Value |
|---|---|
| Question topics | 14, holding 465 questions |
| Theory | 8 tracks, 50 modules, 179 chapters |
| Theory block types | 10 (`prose`, `definition`, `types`, `syntax`, `table`, `comparison`, `pitfall`, `tip`, `diagram`, `drill`) |
| Code snippets in the question bank | 272 — **106 `stdout`**, 166 `trace` |
| `syntax` blocks in theory | 128 |
| Theory blocks carrying any output | **0** — `syntax` has no `output` field |
| Snippets `run-snippets.js` can see | **the question bank only** |
| Snippets whose output is hidden until revealed | **0** |
| Runnable languages | `kotlin`, `java` — Kotlin has kotlinx-coroutines on the classpath |
| Hues taken by a theory track | 8 of 9; **`teal` is unclaimed** |

Five of these decide the design.

**`run-snippets.js` walks `topics`, not `theoryModules`.** Its `stdoutSnippets()`
iterates `topic.questions[].codeSnippets[]` and stops there. Any output authored
in theory is unverified by construction, not by oversight.

**The `output` shape already exists and is already validated.** `{ kind, lines,
explain }` with `kind` in `['stdout', 'trace']` is defined in `tools/schema.js`,
rendered by `renderCodeOutput()` in `js/app.js`, and enforced by
`validate-questions.js`. This plan should reuse it exactly rather than invent a
parallel one — every line of validation and rendering it borrows is a line it
does not have to get right twice.

**The `stdout` / `trace` split is the honesty mechanism this section needs.**
Coroutines, Flow, plain Kotlin and Java all compile and run, so their answers can
be *proved*. Compose and the Activity lifecycle cannot be run by any toolchain
this repo has, so their answers are *reasoned*. The existing vocabulary already
draws exactly that line and the UI already labels it — "Output" against "What
happens, in order". No new concept is required to be truthful about the
difference.

**`drill` is the precedent for a block type that is an exercise.** It carries a
tier, an id checked against a catalogue held in the validator, a prompt, and a
collapsed solution. `predict` is the same shape with a different payload, and it
should copy `drill`'s mechanics — including the catalogue, whose whole purpose is
that a dropped item is an error rather than a smaller number nobody notices.

**Every theory track owns a hue, and `teal` is the one no track has taken.** The
new track needs no new colour.

## 3. What the research found

Searched 2026-08-19. Sources in Appendix B.

Two caveats first, because they change how much weight this section can carry.
The available material is **secondary** — practitioner blog posts and question
lists, not interview transcripts — and **no source publishes frequency data**,
so "most asked" is a consensus of overlapping lists rather than a measurement.
Several of the strongest-looking articles are on Medium and returned 403 to
automated fetching, so they were read through search summaries only. The
catalogue in Appendix A is therefore weighted by *how many independent sources
name a mechanism*, not by a number anyone counted.

With that said, the survey is consistent enough to act on.

**Coroutines are the topic where output prediction is the standard format.**
`launch` versus `async` is named by every coroutines source found, and named
specifically as a question where the interviewer follows up by asking about
execution order and about how exceptions differ between the two builders. One
source describes the shape directly: a scenario asking the reader to work out
"how `launch`, `delay` and `coroutineScope` interact". This is the only topic
where the sources describe prediction rather than recall as the default mode.

**The 2026 core set is stable across sources**: Activity and Fragment
lifecycles, coroutines (scopes, dispatchers, Flow), Compose recomposition and
state hoisting, Hilt, Room, and MVVM/MVI. Compose is repeatedly flagged as the
default for new projects and therefore a primary focus, with `StateFlow` +
`repeatOnLifecycle` named as the 2026-recommended way to expose UI state.

**Flow questions cluster on four mechanisms**: the cold/hot distinction, why
`collectLatest` exists, how to collect safely from a Fragment, and when
`StateFlow` is the wrong tool. `StateFlow` versus `SharedFlow` — initial value,
replay, what a late collector receives — is named by every Flow source found.

**Compose prediction is about *when things run*, not what they render.** The
sources converge on execution order: `LaunchedEffect` and `DisposableEffect`
register during composition but run after it commits; a constant key means once
per enter; a changed key cancels and restarts. That is a trace, not a stdout —
which is exactly why the `trace` kind earns its place here.

**Java's tricky-output canon is old, small and completely settled**: integer
caching at 127 against 128, string interning, `finally` overriding a `return`,
static initialisation order, `char` arithmetic under `+`, and ternary
autoboxing. These are also the questions `run-snippets.js` was explicitly built
to settle — its own header names four of them by name. The Java module is
therefore the cheapest to author and the most certain to be correct.

**Kotlin's equivalent canon is younger and the sources are thinner on it.**
Scope functions (`let` / `run` / `apply` / `also` / `with`) are named
universally, but almost always as "what is the difference" rather than as a
snippet. The sources gave receiver-and-return-value tables and one worked
`apply` example. The prediction-shaped Kotlin questions in Appendix A —
declaration-order initialisation, `List` being read-only rather than immutable,
extension functions dispatching statically, `equals` ignoring properties declared
in a data class body, sequence versus list evaluation interleaving — are drawn
from the mechanisms the sources describe, and are the ones this repo should
verify hardest precisely because the research is thinnest there.

The weighting in Appendix A follows: Kotlin and coroutines heaviest, Java close
behind because it is cheap and certain, Compose and lifecycle lightest because
they cannot be verified and their answers are the most likely to age.

## 4. Design decisions

### 4.1 A ninth track, after synthesis

The section is a new track — `output`, "Predict the Output" — appended after
Interview Synthesis, taking the unclaimed `teal` hue and the monogram `Po`.

The alternative was to distribute prediction blocks into the modules that teach
the material, so that the coroutine puzzles sit at the end of Coroutine
Fundamentals. That is better pedagogy and worse ergonomics, and ergonomics wins
here for one reason: **the reader who wants this wants all of it at once.** It is
a drilling surface, used the night before, in the mode where you want sixty
puzzles in a row and not six puzzles buried across ten modules. Track 8 already
established that a track can be an activity rather than a subject.

Two mechanical consequences fall out for free. Prerequisites in
`validate-theory.js` must resolve to *earlier* modules, and a track appended at
the end can therefore declare a prerequisite on anything — every prediction
module can point at the module that taught the material. And modules carry a
global `order`; the existing maximum is 50, so the new ones take 51–57 and
nothing renumbers.

### 4.2 One new block type: `predict`

```js
{
    type: 'predict',
    id: 'launch-does-not-wait',       // catalogued, unique corpus-wide
    tier: 'must-know',
    language: 'kotlin',
    prompt: 'What does this print, and in what order?',
    code: '...',
    output: {                          // the question bank's shape, unchanged
        kind: 'stdout',
        lines: ['start', 'end', 'inside launch'],
        explain: '<p>…</p>'
    },
    distractor: 'Most people say "inside launch" comes second.'
}
```

`output` is **the same field the question bank already uses**, deliberately and
to the letter. That single decision buys the block: `renderCodeOutput()` renders
it, `OUTPUT_KINDS` and `RUNNABLE_LANGUAGES` in `tools/schema.js` already
constrain it, and — once §4.4 lands — `run-snippets.js` verifies it. A
prediction-specific output shape would have re-earned all three.

`distractor` is the one genuinely new field, and it is what makes the block worth
building rather than just hiding an existing one. Naming the *wrong* answer a
reader most likely gave is the part that teaches; "you got it wrong" is not
feedback, and "you probably thought the coroutine body ran where it was written"
is.

### 4.3 The answer is hidden until the reader commits

The block renders as prompt, code, and a **Reveal** button. Nothing else. The
output pane and the explanation are in the DOM but hidden, so reveal is a class
toggle and not a render — the same trick the question card already uses for
answers, and the reason a revealed block survives a filter change.

This is the only new interaction in the plan, and it is the whole point of it.
An output pane that is visible next to its code is a worked example; the same
pane behind a button is an exercise. Nothing else about the two differs.

Reveal is deliberately **not** a text input to be graded. §4.6 explains why.

### 4.4 `run-snippets.js` learns to read the theory corpus

Today:

```js
function stdoutSnippets(topics) { /* topic.questions[].codeSnippets[] */ }
```

It gains a second collector walking `theoryModules[].chapters[].blocks[]` for
`type === 'predict'` with `output.kind === 'stdout'`, labelled
`module › chapter › predict:<id>` so a failure names the block. The runners, the
toolchain resolution, the diff and the reporting are untouched — this is a source
of snippets, not a new kind of verification.

**This is the load-bearing change in the plan.** A section whose entire premise
is "here is what this prints" is worthless if what it prints is an author's
belief. Every Kotlin and Java block in Appendix A is `stdout` and therefore a
falsifiable claim; the Compose and lifecycle blocks are `trace` and therefore
prose that says so. The plan is honest only if the first group is actually run,
and it is not currently possible to run them.

The corollary is a rule worth writing into the validator: **a `predict` block in
a runnable language may not carry `trace`.** In the question bank a `trace` is a
legitimate choice for an Activity or a Composable. Here, choosing `trace` for a
snippet the harness could have compiled is choosing to dodge verification, and
the validator should refuse it.

### 4.5 Attempts are progress, and reuse the store built for it

`js/progress.js` already holds per-question and per-chapter completion behind a
throw-tolerant `localStorage` wrapper and a `droiddeck:progress` `CustomEvent`
that lets one listener repaint without re-rendering. A revealed block is the same
kind of fact:

```js
const PREDICT_STORAGE_KEY = 'droiddeck:predict:revealed';
```

keyed by the block id, which §4.7 makes unique corpus-wide. Module cards and the
track header then show `23/77` from the same `renderModuleProgressBar` the UI
revamp built, and the event listener that repaints question rows gains one
`kind`. No new state mechanism, no new painting path.

### 4.6 Self-marked, not graded

The reader reveals and marks themselves right or wrong. There is no text box and
no comparison against the expected lines.

Grading free text here is not hard, it is wrong. `[1, 2, 3]` against
`[1, 2, 3]` with different spacing, `Person(name=Alice, age=30)` typed from
memory, an interleaving that is legitimately non-deterministic across
dispatchers — a comparator strict enough to be meaningful marks correct answers
wrong, and one loose enough not to marks wrong answers correct. Both failures
cost more than they buy, and the honest reader loses nothing: they know whether
they predicted `128 == 128 -> false`.

This also keeps the section aligned with the machine-coding drills, which are
gradeable by a human against `watchFor` and not gradable by the app. DroidDeck
does not pretend to be an examiner anywhere, and should not start here.

### 4.7 A catalogue in the validator, ids unique corpus-wide

`validate-theory.js` gains `PREDICT_IDS` alongside `DRILL_IDS`, holding
Appendix A. An id not in the catalogue is an error; an id in the catalogue that
nobody wrote is a warning listing what is missing; an id written twice is an
error that names the first home.

Ids are unique across the whole corpus rather than per module, because
`localStorage` keys them and a collision would silently share a reveal between
two unrelated blocks. That is the same reasoning that made question progress use
a composite `topicId:questionId` key, arrived at from the other direction.

### 4.8 Cross-linking goes to questions, not the other way

Each prediction chapter carries `relatedQuestions` pointing at the question-bank
entries covering the same mechanism. `validate-theory.js` already resolves every
such reference against the question corpus and fails on a miss, so the links
cannot rot.

The reverse link is not built. Adding a `relatedPredictions` field to 465
questions would be a second cross-reference to maintain for a path almost nobody
walks — a reader who has just read an answer does not then want a puzzle whose
answer they were handed thirty seconds ago.

## 5. The section

Seven modules, ordered by how much the research says the topic is asked, and
within a module by dependency.

| # | Module | Track slot | Kind | Blocks |
|---|---|---|---|---|
| M51 | Builders and ordering | `predict-coroutine-builders` | `stdout` | 11 |
| M52 | Cancellation and exceptions | `predict-coroutine-failure` | `stdout` | 12 |
| M53 | Flow, hot and cold | `predict-flow` | `stdout` | 13 |
| M54 | Kotlin language semantics | `predict-kotlin` | `stdout` | 15 |
| M55 | Java semantics | `predict-java` | `stdout` | 12 |
| M56 | Compose recomposition | `predict-compose` | `trace` | 9 |
| M57 | Lifecycle and launch modes | `predict-lifecycle` | `trace` | 8 |

**80 blocks; 63 of them machine-verified.**

The 17 that are not are the Compose and lifecycle modules, which no toolchain
here can run. They are `trace`, labelled "What happens, in order" by the existing
renderer, and they are last in the reading order because a reasoned answer is
worth less than a proved one and should not be what the reader meets first.

Chapters group blocks by mechanism — M51 is `launch-ordering`,
`async-and-await`, `dispatch-and-blocking` — so cram mode and the chapter rail
work exactly as they do everywhere else. Full catalogue in Appendix A.

## 6. Code changes

| File | Change |
|---|---|
| `data/theory/predict-*.js` | 7 new module files, one global each |
| `data/theory/index.js` | `output` track; 7 modules appended, `order` 51–57 |
| `index.html` | 7 `<script>` tags, before `data/theory/index.js` |
| `tools/validate-theory.js` | `predict` in `BLOCK_FIELDS`; `PREDICT_IDS`; shape and no-dodging checks |
| `tools/run-snippets.js` | walk theory `predict` blocks — §4.4 |
| `js/theory.js` | `case 'predict'` + `renderPredictBlock()` |
| `js/progress.js` | `PREDICT_STORAGE_KEY`, reveal state, `predictProgress()` |
| `js/navigation.js` | `trackMarks.output = { monogram: 'Po', hue: 'teal' }` |
| `css/theory.css` | `.theory-predict` and its revealed state |
| `docs/ARCHITECTURE.md` | the new block type, the new load-order entries, and that `run-snippets.js` now covers both corpora |

No new colour: `teal` is already defined in `css/themes.css` as one of the nine
category hues, and the block reuses the tier tokens for its badge.

## 7. Validation

Four checks are added to `validate-theory.js`:

1. **Shape** — a `predict` block has `id`, `tier`, `language`, `prompt`, `code`
   and `output`; `language` is in `LANGUAGES`; `output.kind` is in
   `OUTPUT_KINDS`; `output.lines` is a non-empty array of strings.
2. **Catalogue** — `id` is in `PREDICT_IDS`, appears exactly once corpus-wide,
   and every catalogued id is eventually written (warning until then).
3. **No dodging** — §4.4's rule: `output.kind === 'trace'` is an **error** when
   `language` is in `RUNNABLE_LANGUAGES`.
4. **HTML** — `explain` and `distractor` go through `htmlIssues()` like every
   other authored fragment.

And the existing gates apply unchanged: unique ids, prerequisites resolving to
earlier modules, `relatedQuestions` resolving against the question bank.

Per commit:

```bash
node tools/validate-theory.js && node tools/validate-questions.js
```

Per phase, and mandatory for any phase that authors a `stdout` block:

```bash
node tools/run-snippets.js
```

`run-snippets.js --selftest` first on any machine that has not run it, because a
verifier that passes because it found no toolchain is worse than no verifier —
it already says so itself.

## 8. Phases

Nine commits. Phase 1 is a deliberate pilot: one module authored end to end
before six more are written against a block type that has never rendered.

| Phase | Does | Gate |
|---|---|---|
| 0 | `predict` block type: validator shape checks, empty `PREDICT_IDS`, renderer, CSS, progress key, track registered with no modules | both validators; the track renders empty without throwing |
| 1 | **Extend `run-snippets.js` to the theory corpus** | `--selftest` passes; the walk finds 0 blocks and says so |
| 2 | **Pilot** — M51, 11 coroutine blocks | `run-snippets.js` compiles and runs all 11 |
| 3 | M52 — cancellation and exceptions, 12 | all 12 verified |
| 4 | M53 — Flow, 13 | all 13 verified |
| 5 | M54 — Kotlin semantics, 15 | all 15 verified |
| 6 | M55 — Java semantics, 12 | all 12 verified |
| 7 | M56 + M57 — Compose and lifecycle, 17 `trace` | validators; the no-dodging check proves these are the only `trace` blocks and that none of them is in a runnable language |
| 8 | Close out: progress readouts, `ARCHITECTURE.md`, `check-doc-links.js`, mark the plan built | all four tools; both themes at 375 / 768 / 1024 / 1440 |

Phase 1 before Phase 2 is not negotiable. Authoring a module first and wiring
the verifier afterwards means writing eleven expected outputs by hand and finding
out later how many were wrong — and the ones an author gets wrong are exactly the
ones worth having, because they are the ones that surprise.

## 9. Risks

**The Kotlin toolchain is not guaranteed.** `run-snippets.js` resolves `kotlinc`
from an Android Studio install or `$KOTLINC`, and exits 1 with instructions when
it cannot. On a machine without one, Phases 2–6 cannot be gated at all. *Handled
by:* the tool already refuses to pass silently, and its own error text already
states the rule — without a toolchain, no snippet may claim `stdout`. Nothing
new is needed except obeying it.

**Concurrent output is not always deterministic.** A snippet with two coroutines
on `Dispatchers.Default` may interleave differently between runs, and a verifier
that fails intermittently gets switched off — which would cost far more than the
snippet is worth. *Handled by:* every `stdout` block must be deterministic by
construction — single-threaded `runBlocking`, or explicit `delay` ordering. A
puzzle whose answer is genuinely "it depends on the dispatcher" is a good puzzle
and belongs in a `trace` block, in a non-runnable module, where it is not
claiming to be reproducible. Appendix A marks these.

**The Compose and lifecycle answers can age.** They are reasoned, unverifiable,
and describe behaviour that has changed before. *Handled by:* they are 17 blocks
of 80, they are last, they carry doc links that `check-doc-links.js` probes, and
the `trace` label already tells the reader which kind of claim they are reading.

**80 more blocks is a lot of authoring.** The theory corpus took eight phases to
write and this adds most of a track. *Handled by:* the phase split is per module,
each phase is independently shippable, and the catalogue is fixed up front so
scope cannot creep mid-phase. If it stalls after Phase 4, three modules and 36
verified puzzles have still shipped and the validator will say exactly what is
missing.

**Reveal state could grow without bound.** *Handled by:* one key holding an array
of 80 catalogued ids, bounded by the catalogue itself.

## 10. Verification

Beyond the tools, per phase, in both themes:

- A block renders prompt and code with **no output visible**, and reveals on
  click — the actual claim of §4.3, and the one a validator cannot make.
- A revealed block **stays revealed** across a cram-mode toggle and a
  navigation away and back.
- Reveal state survives a reload, and a `localStorage` write that throws
  (private mode, `file://`) leaves the block usable.
- Cram mode hides `should-know` and `good-to-know` blocks, exactly as it does
  for drills.
- The count on the module card matches the number of blocks actually revealed.
- Keyboard: the reveal control is reachable by tab, operable by enter and
  space, and carries `aria-expanded`.
- A `stdout` pane and a `trace` pane are visibly different things, because one
  is a console dump and the other is an ordered argument.

---

## Appendix A — the catalogue

80 blocks. `[s]` is `stdout` and machine-verified; `[t]` is `trace`. Tier is
`must` / `should` / `good`.

### M51 — Builders and ordering (11, all `[s]`)

| id | Tier | Tests |
|---|---|---|
| `launch-does-not-wait` | must | The body runs after the enclosing block continues |
| `async-starts-eagerly` | must | `async` runs without `await`; the result is discarded |
| `await-immediately-is-sequential` | must | `await` at each call site serialises two 1s waits into 2s |
| `await-after-both-is-concurrent` | must | The same work, both started first, takes 1s |
| `job-join-returns-unit` | should | `join()` waits but yields nothing; `await()` yields the value |
| `lazy-does-not-start-itself` | should | `CoroutineStart.LAZY` sits in the *new* state; `isActive` is false |
| `nested-launch-completes-last` | must | A parent is not complete until its children are |
| `launches-print-in-delay-order` | must | Three `launch`es with descending delays |
| `withcontext-returns-last-expression` | should | `withContext` is a value, not a side effect |
| `runblocking-blocks-its-thread` | must | Why it belongs in `main()` and tests, not in an app |
| `delay-zero-does-not-yield` | good | `delay(0)` returns without suspending; `yield()` against it |

### M52 — Cancellation and exceptions (12, all `[s]`)

| id | Tier | Tests |
|---|---|---|
| `cancel-does-not-stop-a-cpu-loop` | must | Cancellation is cooperative; a non-suspending loop ignores it |
| `ensure-active-makes-it-cooperative` | must | The same loop with `ensureActive()` |
| `catching-exception-swallows-cancellation` | must | `catch (e: Exception)` eats `CancellationException` |
| `finally-needs-noncancellable` | should | A suspending cleanup in `finally` after cancel |
| `job-lets-a-sibling-kill-a-sibling` | must | One child fails, the others die |
| `supervisorjob-isolates-siblings` | must | The same code, one word changed |
| `async-exception-surfaces-at-await` | must | Not at the `async` call — the classic |
| `async-in-supervisorscope-still-throws` | should | The gotcha `SupervisorJob` does not fix |
| `handler-ignored-by-async` | should | `CoroutineExceptionHandler` applies to `launch` only |
| `child-failure-cancels-the-parent` | must | Structured concurrency propagating upward |
| `withtimeout-throws-ortimeoutornull-does-not` | must | Two spellings, two outputs |
| `launch-in-a-cancelled-scope` | good | Silently does nothing |

### M53 — Flow, hot and cold (13, all `[s]`)

| id | Tier | Tests |
|---|---|---|
| `flow-builder-does-not-run` | must | Cold: nothing happens without `collect` |
| `collecting-twice-runs-it-twice` | must | The defining property of cold |
| `operator-order-changes-output` | should | `map` then `filter` against `filter` then `map` |
| `take-cancels-upstream` | must | The producer stops early |
| `collectlatest-drops-in-flight-work` | must | Why it exists |
| `conflate-skips-intermediates` | should | Against `collect`, same producer |
| `buffer-changes-the-timing` | should | Producer and consumer decoupled |
| `flowon-affects-upstream-only` | should | Where the thread actually changes |
| `stateflow-drops-an-equal-value` | must | Built-in `distinctUntilChanged` |
| `stateflow-replays-the-current-value` | must | A late collector still gets it |
| `sharedflow-loses-what-it-missed` | must | No replay, no initial value |
| `sharedflow-replay-one-changes-the-answer` | should | The same code, `replay = 1` |
| `zip-against-combine` | should | Pairing against latest-wins |

### M54 — Kotlin language semantics (15, all `[s]`)

| id | Tier | Tests |
|---|---|---|
| `let-returns-the-lambda-apply-returns-the-receiver` | must | The one distinction that decides all five |
| `also-and-apply-differ-only-in-it-and-this` | should | Receiver against argument |
| `run-against-with` | good | Extension against parameter |
| `safe-call-let-skips-on-null` | must | The whole block is skipped, not the body |
| `data-class-equals-ignores-the-body` | must | Properties declared in the body are excluded |
| `copy-is-shallow` | should | The nested reference is shared |
| `initialisers-run-in-declaration-order` | must | Property initialisers and `init` blocks interleave |
| `list-is-read-only-not-immutable` | must | The `MutableList` behind the `List` still changes it |
| `sequence-interleaves-list-does-not` | must | Where the prints land |
| `extension-functions-dispatch-statically` | must | Declared type wins, not runtime type |
| `lateinit-before-assignment` | should | The exception, and its message |
| `smart-cast-fails-on-a-mutable-property` | should | Why the compiler refuses |
| `default-arguments-evaluate-per-call` | good | Not once at declaration |
| `equals-against-referential-equality` | should | `==` and `===` on boxed values |
| `elvis-evaluates-lazily` | good | The right side is not evaluated when it is not needed |

### M55 — Java semantics (12, all `[s]`)

| id | Tier | Tests |
|---|---|---|
| `integer-cache-127-against-128` | must | The canonical one; already a `run-snippets.js` fixture |
| `string-literal-against-new-string` | must | The pool, `==`, `equals`, `intern()` |
| `finally-overrides-a-return` | must | The returned value is the one from `finally` |
| `finally-runs-after-a-caught-throw` | should | Order of `catch` and `finally` |
| `static-then-instance-then-constructor` | must | Initialisation order across two instances |
| `pass-by-value-of-a-reference` | must | Mutating works, reassigning does not |
| `ternary-unboxes-and-npes` | must | Mixed types force an unbox |
| `char-plus-int-is-arithmetic` | should | `+` promotes before it concatenates |
| `integer-division-truncates` | should | And where the cast has to go |
| `array-covariance-throws-at-runtime` | should | `ArrayStoreException` |
| `overload-binds-statically-override-dynamically` | must | The same call, two resolution rules |
| `mutating-a-hashmap-key` | good | The entry becomes unreachable |

### M56 — Compose recomposition (9, all `[t]`)

| id | Tier | Tests |
|---|---|---|
| `state-without-remember-resets` | must | Recomposition discards it |
| `remember-against-remembersaveable` | must | What survives rotation, what does not |
| `launchedeffect-unit-runs-once-per-enter` | must | Constant key |
| `changing-the-key-cancels-and-restarts` | must | The previous coroutine is cancelled |
| `sideeffect-runs-every-successful-composition` | should | Against `LaunchedEffect` |
| `disposableeffect-disposes-before-it-restarts` | should | The order of dispose and re-run |
| `where-you-read-state-decides-what-recomposes` | must | Read scope, and deferred reads |
| `derivedstateof-cuts-the-recomposition-count` | should | The same state, two subscriptions |
| `mutablestateof-a-list-misses-mutation` | must | Against `mutableStateListOf` |

### M57 — Lifecycle and launch modes (8, all `[t]`)

| id | Tier | Tests |
|---|---|---|
| `rotation-callback-order` | must | Down through `onDestroy` and back up |
| `a-to-b-callbacks-interleave` | must | `A.onPause` → `B.onResume` → `A.onStop` |
| `back-against-home` | must | `onDestroy` against `onStop` only |
| `a-dialog-does-not-stop-the-activity` | should | `onPause` without `onStop` |
| `singletop-delivers-onnewintent` | must | Instead of a second `onCreate` |
| `singletask-clears-what-is-above-it` | should | Which activities are destroyed |
| `fragment-view-outlives-nothing` | must | Fragment against its view lifecycle |
| `viewmodel-survives-rotation-not-finish` | must | Where `onCleared` actually lands |

Three candidates were considered and **rejected as `stdout`** because their real
output is not deterministic — `Dispatchers.Default` interleaving, `Job` completion
ordering across threads, and unbuffered `SharedFlow` emission under concurrent
subscription. Any of them may be written as `trace` in a non-runnable module.
None may claim `stdout`. This is §9's first risk, discharged in the catalogue
rather than at authoring time.

## Appendix B — sources

Surveyed 2026-08-19. Secondary sources; no frequency data published. Several
Medium articles returned 403 to automated fetching and were read via search
summaries only.

**Coroutines**
- [Android Interview Series 2024 — Part 5 (Kotlin Coroutines)](https://proandroiddev.com/android-interview-series-2024-part-5-kotlin-coroutines-3dd1ae81c721) — ProAndroidDev
- [Mastering Advanced Kotlin Coroutines: 10 Tricky Interview Questions](https://medium.com/@sharmapraveen91/mastering-advanced-kotlin-coroutines-10-tricky-interview-questions-and-answers-602a2d2be069) — 403, summary only
- [Android Interview Mastery: Launch vs Async in Kotlin Coroutines](https://medium.com/codetodeploy/android-interview-mastery-launch-vs-async-in-kotlin-coroutines-with-real-questions-answers-51c4e4c94805)
- [Launch vs Async in Kotlin Coroutines](https://www.geeksforgeeks.org/kotlin/launch-vs-async-in-kotlin-coroutines/) — GeeksforGeeks

**Flow**
- [Android Interview Series 2024 — Part 6 (Kotlin Flows)](https://proandroiddev.com/android-interview-series-2024-part-6-kotlin-flows-730f6bf877df) — ProAndroidDev
- [StateFlow and SharedFlow](https://developer.android.com/kotlin/flow/stateflow-and-sharedflow) — Android Developers, primary
- [Kotlin Flow, StateFlow and SharedFlow Android](https://proandroiddev.com/kotlin-flow-stateflow-and-sharedflow-android-6737bd79bbd2)

**Kotlin**
- [50 New Kotlin Interview Questions & Answers for 2026](https://codeforgeek.com/50-new-kotlin-interview-questions-and-answers/)
- [100+ Kotlin Interview Questions and Answers (2026)](https://www.wecreateproblems.com/interview-questions/kotlin-interview-questions)
- [Top Kotlin Interview Questions and Answers](https://www.interviewbit.com/kotlin-interview-questions/) — InterviewBit

**Java**
- [Java Tricky Output Questions](https://www.geeksforgeeks.org/java/java-tricky-output-questions/) — GeeksforGeeks, fetched in full
- [Java Tricky Output Questions](https://www.tutorialspoint.com/java-tricky-output-questions) — TutorialsPoint

**Compose**
- [Understanding Execution Order in Jetpack Compose: DisposableEffect, LaunchedEffect, and Composables](https://proandroiddev.com/understanding-execution-order-in-jetpack-compose-disposableeffect-launchedeffect-and-composables-d2d0b75b7ec8) — ProAndroidDev
- [Side-Effects in Jetpack Compose Made Simple](https://itnext.io/side-effects-in-jetpack-compose-made-simple-5a7e139a53f5) — ITNEXT

**Topic weighting**
- [Android Interview Questions and Answers 2026: Basic to Advanced](https://talent500.com/blog/top-android-interview-questions-answers-2026/)
- [Top 50 Android developer interview questions in 2026](https://www.codinginterview.com/guide/android-developer-interview-questions/)
- [125 Android/Kotlin Interview Questions in 2026](https://www.curotec.com/interview-questions/125-android-kotlin-interview-questions/)
