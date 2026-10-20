# Plan — Answer Quality and Triage

**Status:** built — Phases 0–6 complete. 465 questions tiered, 272 snippet
output panes, 15 vendored figures, 15 claims corrected against primary sources
**Date:** 2026-08-17
**Scope:** five changes to the question bank — importance tiers with a filter,
verified answers, plainer wording, real code output, and official documentation
images where a drawn diagram cannot compete.

The five asks are not five independent features. Tiering comes first because it
is what makes the other four affordable: 465 questions is too many to verify,
rewrite and annotate in one motion, and tiering is what turns that into "do the
150 that matter, then widen".

And they are not five passes over the corpus. Deciding a question's tier, noticing
that it wants a diagram from the official docs, spotting that its snippet has no
output, and hearing that its wording is unspeakable are four judgements made from
the *same read* of the same question. Reading 465 questions four times to make
them separately would be four times the work for a worse result, because each
pass would lack the context the others had. So §3.9 makes it one read producing
four annotations, and the later phases execute against that record rather than
re-deriving it.

---

## 1. Why

DroidDeck is a bank of 465 answers written in one pass. That is enough content
that three separate problems have become structural rather than incidental:

**Nothing distinguishes what gets asked from what merely exists.** The theory
section has had must-know / should-know / good-to-know since it was written, and
a cram mode built on top of it. The question bank — the thing you actually
revise from the night before — has no such signal. Every question looks equally
important, so a reader with two hours has no way to spend them well.

**The answers were written to be complete, not to be spoken.** Several read like
reference documentation: correct, dense, and impossible to say out loud in an
interview. `kotlin-flow-api` q7 on StateFlow and SharedFlow is the clearest case
— it is accurate, and nobody could deliver it from memory.

**Nothing has been checked against the source since it was written.** Every
question carries `referenceLinks`, but those links are neither machine-checked
nor, in most cases, actually reconciled against the claim they sit next to.
`check-doc-links.js` probes the *theory* corpus only; the question bank's
reference links have never been probed at all.

Two smaller gaps sit alongside these. Code snippets stop at the code, so a
reader cannot confirm they predicted the behaviour correctly — the very thing an
interviewer tests. And the bank draws its own diagrams for subjects Google
already illustrates better: the activity and fragment lifecycles are the obvious
cases, but a survey found the service lifecycle, the platform stack, the Compose
phases, the recommended architecture and the ViewModel's lifetime in the same
position — and found that some of the strongest candidates are questions with no
diagram at all, only prose.

## 2. What exists today

Verified against the tree at `84ed4fe`:

| Fact | Value |
|---|---|
| Questions | 465 across 14 topics; `android` alone holds 135 in 20 subsections |
| Code snippets | 272, across 465 questions |
| Questions with a diagram | 41 |
| Questions with an importance tier | **0** |
| Questions cross-linked from a theory chapter | **418 of 465** |
| Answer length | median 1223 chars; 91 over 1500; longest 2780 (`design-image-loading-library`) |
| Question-bank filter UI | none |
| Theory filter UI | one `?cram` toggle, "🔥 Must-know only" |
| Link checking | theory `docHub` + chapter `docs` only — **question `referenceLinks` are unchecked** |
| Binary assets in repo | none |
| Authored-HTML tag allowlist | 14 tags, no `<img>` |
| Local Kotlin toolchain | none — `kotlinc` absent, `java` present but no runtime |

Four of these shape the design. **418 of 465 questions already inherit a tier**
from the theory chapter that links them, so tiering is mostly a derivation, not
465 judgement calls. **The theory layer already has the tier vocabulary, the CSS
tokens and a working filter**, so the question bank should borrow all three
rather than invent a parallel set. **The tag allowlist deliberately excludes
`<img>`**, so images must arrive as structured data, not as raw HTML in an
answer string. And **there is no Kotlin toolchain**, so "add the output" is an
honesty problem before it is a rendering problem.

## 3. Design decisions

### 3.1 The question bank borrows theory's tier vocabulary exactly

Questions get one new field, `importance`, whose value is one of the same three
strings theory already uses: `must-know`, `should-know`, `good-to-know`.

Not a new scale — the same one. `css/themes.css` already defines
`--importance-must`, `--importance-should` and `--importance-good`, and
`css/theory.css` already renders them as a badge and a coloured left edge. A
must-know question and a must-know chapter should look identical, because they
mean the same thing. `TIERS` moves out of `validate-theory.js` into a place both
validators can read.

The tier is **stored on the question, not computed from the theory links**.
Computed tiers cannot be overridden, and 47 questions have no theory link at all
and would silently get none.

### 3.2 The tiers are seeded, then reviewed by hand

A one-shot codemod, `tools/seed-importance.js`, walks the theory corpus, and for
every `relatedQuestions` reference writes the referencing chapter's tier onto the
target question — inserting `importance: '<tier>',` directly after that
question's `id:` line in its data file. Where several chapters reference one
question, the **strongest** tier wins: a question worth testing a must-know
chapter against is a must-know question.

On the current corpus that resolves 418 questions as 291 must-know, 122
should-know and 5 good-to-know. The remaining 47 are written by hand.

The codemod is idempotent, refuses to run twice on a question that already has
the field, and is a starting point rather than an answer: the seeded tiers are
then reviewed topic by topic, in separate commits, against the actual question —
"how often is this asked", not "which chapter cites it".

The seed is a worse starting point than its precision suggests, and the numbers
say so plainly. 291 of 465 is 63% of the bank marked must-know; `android` alone
seeds 101 of its 135 questions that way. Theory cites a question wherever it is
*relevant*, and a must-know chapter cites broadly, so the seed measures coverage
rather than frequency. A tier holding two thirds of everything is not a short
list, and the review should push must-know toward **150–180 across the bank**,
demoting what is must-know *to understand* but rarely *asked*. The review is the
substance of this phase, not a tidying pass over it.

The script is deleted once the field exists everywhere. It is scaffolding, not
infrastructure — keeping it would invite someone to re-run it over hand-reviewed
tiers and lose the review.

### 3.3 The filter is cumulative, and lives in the hash

Three states, rendered as a segmented control directly under the topic header:

```
All 135  ·  Must + should 122  ·  Must-know only 101
```

(Those are `android`'s counts from the raw seed, and they are exactly the
symptom §3.2 describes — after the review pass the middle and right numbers
should be a long way apart.)

Cumulative, not exclusive — "show me must-know only" and "show me everything
that is not filler" are the two real revision modes, and an exclusive
should-know-only view answers no question anybody has.

State lives in the hash: `?tier=must` shows must-know only, `?tier=should` shows
must-know **and** should-know, and an absent parameter shows everything. The
parameter names the floor, not the band. Same mechanism as theory's `?cram`, for
the same reason: a filter that
resets on navigation is useless for revision, and a filtered session should be
shareable. `parseHash` learns one field; `generateHash` carries it the way
`generateTheoryHash` carries `cram`.

`?cram` on a theory route is left exactly as it is. It ships, it is in shared
links, and it means precisely `tier=must` in the other mode — the two are
synonyms across two namespaces, which is cheaper than a migration.

Filtering is CSS, matching theory — a class on the container and two rules:

```css
.tier-must   .question-card:not(.importance-must) { display: none; }
.tier-should .question-card.importance-good       { display: none; }
```

Nothing re-renders, so expanded cards stay expanded through a filter change.

**Question numbers stay stable under filtering.** Card 3 is card 3 whether or not
cards 1 and 2 are hidden. Gappy numbering is the correct trade: the number is an
identifier people cite ("kotlin q3"), and renumbering per-filter would make every
such reference ambiguous.

### 3.4 Subsections need a wrapper element

Today `renderGroupedQuestions` appends a subsection header and its cards as flat
siblings. Under a filter, a section whose every card is hidden would leave a
stranded heading.

Theory solves this with `:has()`, which needs a containing element. So
`renderGroupedQuestions` wraps each subsection's header and cards in a
`<section class="question-section">`, and CSS hides any section with no visible
card. The scroll-to-hash logic reads `.subsection-header`, which still exists and
still carries `data-subsection-id`, so `topmostPassed()` and
`updateHashFromScroll()` are unaffected — this is the one place to check when
implementing, not to assume.

### 3.5 Images are vendored, attributed, and structured

The activity and fragment lifecycles are the two you named, but they are not the
only ones — a survey of the corpus found at least a dozen more, and it also found
that the best candidates are frequently questions with **no diagram at all**.
`android-launch-modes` is pure prose about the back stack, and Google publishes
four back-stack diagrams that explain it better than any paragraph will. So the
audit covers all 465 questions, not the 41 that already have a drawing.

Which candidates end up in the app is decided by the triage pass in §3.9, not
here. What is fixed here is the bar and the mechanism.

**A documentation image earns its place when all four hold:**

1. The subject is a **state machine, a layered stack, or a timeline** — shapes
   where spatial layout carries real information. A four-node pipeline is a
   flowchart and should stay one; the fragment view-lifecycle is neither.
2. The official image is **materially better than what we can draw**, not merely
   different. Google's activity lifecycle chart shows every transition path at
   once; our `animation` diagram shows one step at a time.
3. It comes from a **canonical page** — the guide that owns the concept, so the
   attribution link is somewhere a reader benefits from going.
4. It is **legible at card width** on a phone. A dense multi-column figure that
   needs pinch-zoom is worse than the text it replaced.

Where a question fails the bar, it keeps what it has. "Add an image" is not an
improvement on its own.

Candidates are vendored — **downloaded into `assets/img/` and committed**, not
hotlinked.
Hotlinking breaks `file://` use, which the architecture doc names as a supported
deployment, and makes the page dependent on a URL Google has already moved once
this year. Vendoring costs the repo a few hundred kilobytes and is the choice
consistent with "content that outlives its toolchain".

Android developer content is Apache 2.0 with a Creative Commons Attribution 2.5
requirement for reproduced material, so **every vendored image renders with a
visible attribution line and a link back to its source page**, and
`assets/img/README.md` records the source URL, retrieval date and licence for
each file. This is a condition of use, not a nicety, and the validator enforces
it: an image without `sourceUrl` and `sourceTitle` fails.

Images arrive as a new question field, never as `<img>` in an answer string:

```js
images: [{
    src: 'assets/img/activity-lifecycle.png',
    alt: 'The activity lifecycle: onCreate through onDestroy, with the paths between states',
    caption: 'A simplified illustration of the activity lifecycle.',
    sourceTitle: 'The activity lifecycle',
    sourceUrl: 'https://developer.android.com/guide/components/activities/activity-lifecycle'
}]
```

Keeping images out of authored HTML preserves the tag allowlist as the app's
security boundary — the validator can enforce that `src` is repo-relative and
that `alt` is present and non-trivial, neither of which it could do inside an
HTML blob.

**The drawn diagrams stay.** On the two lifecycle questions the existing
`animation` diagram is a step-through of the callbacks, which is a different
thing from Google's state chart, and it is theme-aware where a PNG is not. Image
first, then the animated walkthrough. Removing something that works is not part
of this, and the ask was "use images **where** a diagram is too complex" — a
replacement is only correct where the drawing was failing.

The one case for outright removal is a drawn diagram that is *wrong* or
misleading rather than merely weaker. If triage finds one, that is a §3.7
correction, logged as such.

Doc images are light-background. Under the dark theme they get a white plate and
a subtle border rather than being inverted — inversion mangles the coloured state
boxes in the fragment diagram. SVG sources (the permissions workflow, for
instance) are vendored as SVG and get the same treatment; they are not restyled
to match the theme, because editing a diagram and keeping the attribution is a
misrepresentation.

### 3.6 Snippet output is two panes, and each one is labelled honestly

`codeSnippets[]` gains an optional `output`:

```js
output: {
    kind: 'stdout',            // or 'trace'
    lines: ['Loading', 'Loaded: User(id=42)'],
    explain: '<p>Why the order is what it is.</p>'   // optional
}
```

- `kind: 'stdout'` renders a pane headed **Output** in terminal styling. It is
  literal console text. It is only used where the snippet is a program that could
  actually be run.
- `kind: 'trace'` renders a pane headed **What happens, in order** as a numbered
  list. Used for Activities, ViewModels, Composables and Gradle config — code
  with observable behaviour but no stdout. It is a description, and it is
  labelled as one.

The distinction is the whole point of the field. Printing a fabricated "Output:"
block over an Activity subclass teaches a beginner something false about how
Android works, which is worse than showing nothing.

`explain` carries the beginner-facing "why" — the thing the current inline `//`
comments gesture at without room to finish. It renders below the pane, in the
allowed tag subset.

Output is authored where the code makes it meaningful, not everywhere. A
one-line syntax illustration with no behaviour does not get a pane.

**Verification.** Kotlin stdout output should be *run*, not reasoned about, so
Phase 0 installs a Kotlin compiler (`brew install kotlin`) and adds
`tools/run-snippets.js`, which extracts every `kind: 'stdout'` snippet that is
self-contained, compiles and runs it, and diffs the real output against
`output.lines`. Snippets that cannot be made self-contained are marked
`kind: 'trace'` instead. If the toolchain is unavailable, `stdout` panes are not
authored at all and everything becomes a trace — an unrun "Output" block is a
guess wearing a costume.

### 3.7 Verification is a pass with a written record, not a field

Each question in scope is read against its `referenceLinks`, claim by claim,
with the primary source open: kotlinlang.org for Kotlin, developer.android.com
for Android, docs.oracle.com for Java. Where a claim cannot be traced to a
primary source it is either corrected, sourced, or cut.

No `verified: true` field. A boolean in the data would be stale the moment
anything around it changed, and would assert to the reader a guarantee the repo
cannot keep. Instead:

- **`docs/verification-log.md`** records, per topic, the date of the pass and
  every correction made, with the source that settled it. That is the durable,
  reviewable artefact.
- **`check-doc-links.js` is extended to cover question `referenceLinks`**, so a
  link that rots fails the check the same way a theory link does. This is the
  part that keeps working after the pass is over, and it closes a gap that has
  been open since the question bank was written.
- **The validator requires every must-know question to carry at least one
  `referenceLink`**, mirroring the rule theory already applies to must-know
  chapters.

A note on the example that prompted this. `kotlin` q3 states that `synchronized`
is an inline function; it is. The stdlib declares
`inline fun <R> synchronized(lock: Any, block: () -> R): R` on the JVM, and has
since 1.0 ([API reference](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/synchronized.html)).
The Kotlin/JS overload was deprecated to hidden in 2.1, but the answer does not
discuss JS. The pass is still worth doing — the point of a systematic audit is
that it finds the errors nobody happened to notice, and it also settles the ones
that only look like errors. Both outcomes go in the log.

### 3.8 Simplification has rules, so it is reviewable

"Make it simpler" is not a reviewable instruction. These are:

1. **Open with the spoken answer.** Every must-know answer begins with one
   sentence, under 30 words, that would work as the first thing said out loud.
   The detail follows it.
2. **Keep every technical noun. Drop the connective jargon.** `conflated`,
   `replay cache`, `backpressure`, `structured concurrency` stay — they are what
   the interviewer is listening for. "is essentially a specialization of",
   "composes with the rest of the operator set", "dispatcher-aware" go, or get
   replaced by what they actually mean.
3. **One idea per bullet**, and no bullet longer than two sentences.
4. **Concrete over abstract.** "new collectors immediately receive the latest
   value" beats "exhibits replay-of-latest semantics".
5. **Nothing technical is removed.** If a rewrite drops a fact, the rewrite is
   wrong. The target is fewer words carrying the same content, not less content.

Worked example — the top of `flow-stateflow-sharedflow` today:

> `StateFlow` is essentially `SharedFlow(replay = 1)` with conflation and
> distinct-until-changed built in, specialized for representing UI state.

and after:

> **StateFlow is a value you can observe. SharedFlow is an event stream you can
> replay.** StateFlow always holds a current value, hands it to every new
> collector, and skips repeats of the same value. SharedFlow holds no current
> value and replays however many past values you configure — usually zero.

Same facts, same vocabulary, sayable from memory.

### 3.9 One read per question: the triage pass

The tier review of §3.2 requires reading all 465 questions and thinking about
each. That read is expensive and it is the same read that answers three other
questions. So it makes all four judgements at once and writes them down.

For each question, in one sitting, record:

| Column | Values | Feeds |
|---|---|---|
| `tier` | must / should / good | §3.2 — written straight into the data file |
| `image` | `—`, or the doc page the figure comes from | §3.5 |
| `output` | per snippet: `stdout`, `trace`, `—` | §3.6 |
| `words` | `—`, `simplify`, `verify`, or both | §3.7, §3.8 |

The record lives in **`docs/triage/<topic-id>.md`**, one file per topic, one row
per question, committed as it is written. Fourteen files, reviewable in a pull
request, and the thing Phases 2–4 work from.

Why a document and not fields on the question: three of these four columns
describe *work to be done*, not properties of the content. `image: 'needs one'`
in a data file is a TODO pretending to be data, and it would still be sitting
there in a year. Only `tier` is a real property, and only `tier` goes in the
corpus.

Two rules make this honest. **Triage records candidates, not decisions** — the
`image` column names a source page, and whether that figure actually clears the
§3.5 bar is settled in Phase 2 when someone looks at it at card width. And
**triage does not verify** — the `words` column flags a claim that smells wrong;
confirming it against the primary source is Phase 4's job, with the source open.
Flagging is cheap and can happen at reading speed; verifying is not, and pretending
otherwise is how a triage pass silently becomes the whole project.

The pass runs **topic by topic, one commit per topic**, in descending order of
size and importance: `android` (135), `kotlin` (66), `java` (48), then the rest.
Each topic's commit contains its triage file and its tier assignments together.

## 4. Data model

Question schema deltas. All three are additive; nothing existing changes shape.

```js
{
    id: '...',
    question: '...',
    importance: 'must-know',        // NEW — required, one of three tiers
    answer: '...',
    referenceLinks: [...],
    tags: [...],
    hasDiagram: true,
    diagramType: 'animation',
    diagramConfig: {...},
    images: [{                       // NEW — optional, vendored assets only
        src, alt, caption, sourceTitle, sourceUrl
    }],
    codeSnippets: [{
        language, title, code,
        output: {                    // NEW — optional
            kind: 'stdout' | 'trace',
            lines: ['...'],
            explain: '<p>...</p>'    // optional
        }
    }],
    subsection: null
}
```

## 5. Code changes

| File | Change |
|---|---|
| `data/*.js` (14) | `importance` on all 465 questions; `images` where triage calls for them; `output` on snippets in scope |
| `docs/triage/*.md` | **new** — 14 files, the §3.9 record: tier, image, output and words per question |
| `assets/img/` | **new** — vendored figures plus `README.md` recording source, retrieval date and licence per file |
| `js/app.js` | Tier badge and `importance-*` class on the card; segmented tier filter under the topic header; `renderGroupedQuestions` wraps sections; `renderQuestionImages`; `renderCodeBlock` grows an output pane |
| `js/navigation.js` | `parseHash` reads `?tier`; `generateHash` carries it; sidebar counts respect the active tier |
| `js/search.js` | Tier badge on question results, matching the existing theory badge |
| `css/components.css` | Question tier badge and edge, filter control, image figure + attribution, output pane |
| `tools/validate-questions.js` | **new** — question-corpus schema validation (see §6) |
| `tools/check-doc-links.js` | `collectLinks` also walks question `referenceLinks` |
| `tools/seed-importance.js` | **new, temporary** — tier codemod, deleted after §3.2 |
| `tools/run-snippets.js` | **new** — compiles and runs `kind: 'stdout'` snippets, diffs against `output.lines` |
| `docs/verification-log.md` | **new** — the record from §3.7 |
| `docs/ARCHITECTURE.md`, `docs/FEATURES.md`, `docs/CODEBASE.md` | updated at the end, once the shape has stopped moving |

The tier constants and the shared `ALLOWED_TAGS` list move from
`validate-theory.js` into `tools/schema.js`, required by both validators. This is
the only refactor in the plan and it exists because two validators cannot own one
vocabulary.

## 6. Validation

`tools/validate-questions.js` is the new safety net, run alongside the theory
validator before every commit that touches the corpus:

1. Every question has an `importance`, and it is one of the three tiers.
2. Question ids are unique **within a topic**, and the known cross-topic
   collision (`kotlin-multiplatform`, in both `kotlin` and `other-topics`) is
   asserted as the only one, so a second collision is an error.
3. Every must-know question has at least one `referenceLink`.
4. `images[]`: `src` is repo-relative and the file exists on disk; `alt` is
   present and over 20 characters; `sourceUrl` and `sourceTitle` are present.
5. `codeSnippets[].output`: `kind` is `stdout` or `trace`; `lines` is a non-empty
   array of strings; `explain`, if present, uses only allowed tags.
6. `language` is one of the known set, matching the theory rule.
7. Answer HTML uses only the allowed tag subset, with no inline handlers and no
   `javascript:` URLs — the rule theory has had since it was written, applied to
   the question bank for the first time.

Check 7 is likely to fail on first run against content written before the rule
existed. Whatever it turns up is fixed in Phase 0, before anything else lands on
top of it.

Beyond the validators: `node tools/check-doc-links.js --all` once per phase, and
`node tools/run-snippets.js` whenever a `stdout` output is added or edited.

## 7. Phases

Each phase is independently shippable and leaves the app working.

**Phase 0 — foundations.** `tools/schema.js`; `tools/validate-questions.js` with
checks 2, 6 and 7 (the ones that need no new fields); fix what check 7 turns up;
extend `check-doc-links.js` to question `referenceLinks` and fix what rots;
install the Kotlin toolchain and land `tools/run-snippets.js` against a single
hand-written fixture. *No content changes.*

**Phase 1a — the tier mechanism (ask 5).** `seed-importance.js`, run and deleted;
the 47 unlinked questions tiered by hand; validator check 1 turned on; badge,
edge, segmented filter, `?tier` routing, section wrappers, sidebar and search
integration. The filter works end to end on seeded tiers — imperfect ones, but
the machinery is done and demonstrable before any content work starts.

**Phase 1b — the triage pass (§3.9).** All 465 questions read once, topic by
topic, one commit per topic, producing `docs/triage/*.md` and the corrected
tiers. **This is the pivot of the whole plan.** It finishes ask 5 properly and it
is the input to Phases 2, 3 and 4 — none of which should start before it, because
all three would otherwise be re-reading the same questions to work out what needs
doing.

Expect this to be the single longest phase, and treat its output as the point:
at the end of it you can answer "how much work is left, and where" for the first
time.

**Phase 2 — images (ask 2).** Mechanism first: `assets/img/` with its README, the
`images` field, `renderQuestionImages`, the figure/attribution CSS including the
dark-theme plate, validator check 4, and the two lifecycle questions from
Appendix C as the proving case. Then work the `image` column of the triage files
— fetch each candidate, judge it against the §3.5 bar at card width, vendor the
ones that pass. Appendix C is the confirmed head of that list; triage supplies
the tail.

**Phase 3 — code output (ask 4).** The `output` schema, the two panes, validator
check 5. Then work the `output` column, must-know first: run every `stdout`
snippet through `run-snippets.js`, write traces for the rest. 272 snippets exist;
triage says which of them get a pane and which kind, so this phase is execution
rather than judgement.

> **Correction, written while starting the phase.** "Execution rather than
> judgement" was wrong, and wrong in a way that changes the size of the work.
> **Almost nothing in the bank is a program.** Of 221 Kotlin snippets exactly one
> declares `fun main`; of 39 Java snippets, none declares a `main` at all — every
> one is a fragment of declarations and bare statements that no compiler would
> accept. So a snippet cannot be *given* an output pane; it has to be **rewritten
> into a runnable program first**, and only then run.
>
> The alternative — having `run-snippets.js` wrap fragments in a synthetic `main`
> before compiling — was considered and rejected. The snippet has to grow
> `println` calls to print anything at all, so it is being edited either way, and
> once it is, hiding the entry point means the reader is shown one thing while
> the verifier checks another. What the reader sees is what ran. That is the
> property this whole feature exists to have.
>
> This makes Phase 3 a content phase, not an annotation phase, and it is why the
> phase proceeds a topic at a time.

> **Phase 3 closed.** All 272 snippets carry output: **106 `stdout`, 166
> `trace`**, and every `stdout` snippet is re-run and diffed by
> `run-snippets.js` on demand. The split fell out of what the code is rather
> than what was convenient — 106 is very close to the number of snippets in the
> bank that are pure Kotlin or Java with no framework in them.
>
> Two things the phase changed about the plan's assumptions:
>
> - **The runner had to learn Java.** Triage found the highest-value output work
>   in the bank was Java, and the runner compiled Kotlin only. `javac` was
>   already in the same bundled JBR, so the cost was finding the entry class
>   rather than a second toolchain.
> - **Determinism is a content constraint, not just a verification one.**
>   Several snippets had to be redesigned so their output is the same on every
>   run: Fibonacci prints call counts rather than timings, the cancellation
>   snippet waits on a signal rather than a clock, the unsynchronised counter
>   asserts only that its total is *at most* the expected value, and the `Job`
>   snippet records handler failures into a list instead of printing from the
>   handler and racing its own `join`. A flaky verifier would have been worse
>   than none.
>
> The trace pane earned its place more than expected. It was designed as the
> honest fallback for code that cannot run; it turned out to be the *better*
> format for Compose, for the build tooling and for the platform topic, because
> those questions are about ordering and a numbered list is what ordering wants.

**Phase 4 — verify and simplify (asks 1 and 3).** Work the `words` column,
must-know tier first, topic by topic, one commit each. Both passes at once —
reading a question against its primary source and rewriting it for the tongue are
the same read, and triage has already said which questions need it. Every
correction lands in `docs/verification-log.md`. Validator check 3 turned on at the
end of the phase, once every must-know question has a reference link.

> **Done.** 26 questions across 8 topics, 8 commits, every correction in
> `docs/verification-log.md`. Check 3 passed on its first run — all 143 must-know
> questions already carried a reference link, so it went in as a ratchet rather
> than a clean-up.
>
> **"Triage flags; Phase 4 acts" was too tidy.** §3.9 drew a clean line: flagging
> is cheap, verifying is not, so triage only marks. The line held for the eight
> claims triage sent here: seven were wrong and only `coroutines-retrofit`
> survived intact. It did not hold in the other direction. **Six of the questions
> corrected in the log were ones triage had sent for rewriting, not
> verification** — `garbage-collector`'s ZGC pause times,
> `atomic-operations`' `weakCompareAndSet`, the two `TestDispatcher`s, and the
> rest. Reading a question closely enough to rewrite it *is* verification,
> whatever the column says. That is an argument for the plan's own §8 mitigation
> — one read, both passes — being more load-bearing than it looked, not for a
> different triage.
>
> **The most expensive error was a link that was not broken.**
> `kotlinlang.org/docs/flow.html` answers 200 and meta-refreshes to
> `coroutines-flow.html`. Sixteen references pointed at it, every anchor among
> them dead, and `check-doc-links.js` had been passing them all along. A checker
> that follows HTTP redirects and calls a redirect a failure cannot see an HTML
> one — recorded rather than patched, because changing the tool mid-corpus is how
> a tooling change lands unreviewed.
>
> **§3.8's rules do not fit `android-system-design`.** They assume an answer that
> is too dense; those four were too *long*, at one flat level of detail
> throughout, with no connective prose to cut. The treatment that worked was
> structural — lead with the two or three decisions that get discussed, demote
> the rest — and it should be written down as a second mode rather than
> rediscovered.
>
> **The claims that rot are dated ones.** Every correction here was a fact with a
> version or a date attached: `onSaveInstanceState` moving across `onStop` at API
> 28, `SCHEDULE_EXACT_ALARM` ceasing to be pre-granted at API 33, scoped storage
> at 29 and 30 and 33, `weakCompareAndSet` deprecated at Java 9, ZGC's pause
> target, kapt entering maintenance mode. Nothing timeless was wrong. If a later
> phase wants a cheaper audit than reading everything, "find the sentences with a
> version number in them" is where it would start.

**Phase 5 — widen.** Phases 2–4 applied to should-know, then good-to-know,
against the same triage records. This is the long tail and can run at whatever
pace suits; the app is fully useful after Phase 4.

> **This phase was mostly already done, and the plan could not have known.**
> "Widen to should-know, then good-to-know" assumed Phases 3 and 4 would stop at
> the must-know tier. Neither did, because neither had a reason to.
>
> Phase 3 gave **all 272 snippets** an output pane, every tier, because the
> `output` column had already decided each one and skipping the should-know rows
> would have meant a second pass over the same files. Phase 4 worked **all 22
> `words` flags**, every tier, for the same reason — the flags were sparse enough
> (22 questions in 465) that tiering them added nothing. So there is no
> should-know tail for either.
>
> What is left of Phase 5 is **Phase 2 in full**: images, which never started,
> because §3.5's attribution rule was written against Android's terms and three
> other sources turned up during triage. That is the whole of the work below.
>
> **The licence question, settled.** `developer.android.com` is CC BY 2.5 for
> site content and Apache 2.0 for documentation and samples. `firebase.google.com`
> states CC BY 4.0 in its own page footer. `kotlinlang.org` is Apache 2.0 — one
> root `LICENSE` in `JetBrains/kotlin-web-site`, with `docs/images/` under it. All
> three are vendorable with attribution, which is what §3.5 already requires.
>
> **`docs.gradle.org` is not, and is dropped.** Gradle's User Manual is CC
> BY-**NC-SA** 4.0. *NonCommercial* is a restriction a static site cannot warrant
> it will keep — nobody controls how it gets redeployed — and *ShareAlike* would
> reach the page the figure is embedded in. The one Gradle candidate loses
> nothing: `gradle-build-lifecycle` already draws initialisation, configuration
> and execution as a three-node flowchart, which is the whole content of the
> official diagram.
>
> **§3.5's fourth criterion needs restating.** "Legible at card width" was
> written as a warning about *dense multi-column* figures. The fragment
> view-lifecycle diagram is three columns and 821px wide, was expected to fail,
> and passed easily — because it is wide and *sparse*, with large type. Density
> is the thing to judge, not column count or pixel width, and the only way to
> judge it is to look at 375px.
>
> **Phase 5 closed.** 24 candidates fetched and judged, **15 vendored across 18
> placements**, 9 rejected. Validator check 4 is on, so all seven checks from §6
> are now live.
>
> **The bar did most of the work, and it should have been applied earlier.**
> §3.9 was explicit that triage records candidates and Phase 2 decides, and that
> split is sound — but nobody predicted the *rate*. Nine of 24 failed, and six of
> those failed on **criterion 1 alone**: they are flowcharts, which §3.5 excludes
> by name, and no amount of looking at 375px was going to change that.
> Documentation sites publish a lot of flowcharts. A triage pass could cheaply
> record the *shape* of a candidate alongside its URL — state machine, layered
> stack, timeline, or flowchart — and Phase 2 would start from a list half the
> size with nothing of value lost.
>
> **There is no legibility threshold.** The two architecture figures render at
> **16%** and are the most readable in the whole set; `doze.png` was rejected at
> **14%**. The number predicts nothing, because what matters is type size
> relative to canvas. Every "measure it instead of looking" shortcut tried here
> gave the wrong answer at least once.
>
> **`images[]` was right to be structured data.** Two figures serve two questions
> each, which is only cheap because the src is a field rather than markup — one
> file, two placements, one row in the licence record. Inside an HTML blob that
> would have been a copy-paste and a second thing to keep in sync.
>
> **A hazard for any future codemod.** The data files agree on schema but not on
> key order: `jetpack-compose.js` puts `id` at the *end* of some question
> objects. An insertion anchored on "find the id, then the next `tags`" silently
> wrote into the following question. It was caught by reading the corpus back
> through `load-corpus.js` rather than by reading the diff, which is the habit to
> keep — the diff looked entirely correct.

**Phase 6 — docs.** `ARCHITECTURE.md` gains the second validator and the assets
directory; `FEATURES.md` gains tiers, the filter, images and output panes;
`CODEBASE.md` gains the schema deltas. Written last, when the shape has stopped
moving — and, following the house convention, with a closing section in this file
recording where the plan turned out to be wrong.

## 8. Risks

**The must-know tier stays too big.** 291 seeded must-know questions is 63% of
the bank, and a tier that holds two thirds of everything filters nothing. The §3.2
review pass has an explicit target of 150–180 and should be treated as a real
gate, not a formality — if the number does not come down, ask 5 has not been
delivered no matter what the UI does.

**Rewriting introduces errors.** Simplification touches the exact sentences the
verification pass just certified. Doing both in one read (Phase 4) is the
mitigation: the source is open while the words are being changed. Doing them as
two separate passes over the same file would be strictly worse.

**Fabricated output.** The single worst outcome here is a confidently wrong
"Output:" block, which is more damaging than no output at all — it is exactly
what a beginner cannot check. Hence §3.6: `stdout` is machine-run or it is not
written, and everything else is labelled a trace.

**Vendored images go stale.** Google redraws these diagrams. `assets/img/README.md`
records the retrieval date, and the source page URL is checked by
`check-doc-links.js` like any other link, so a moved page surfaces. The image
itself changing under a stable URL is not detectable and is accepted.

**Triage swallows the project.** §3.9 asks one read to produce four judgements,
and the failure mode is that the reader starts *doing* the work instead of
recording it — verifying a claim here, drafting a rewrite there — and 465
questions never get read. The mitigation is the rule in §3.9: triage flags,
Phases 2–4 act. If a triage commit contains an edit to an `answer` string,
that rule has already broken.

**The image bar gets skipped.** With a catalogue of confirmed URLs in Appendix C
it is tempting to vendor all of them. Four of the five §3.5 criteria can only be
judged by looking at the rendered figure at phone width, which is why that
judgement sits in Phase 2 and not in the appendix. A candidate list is not a
shopping list.

**Scope.** Phase 1b reads every question; Phases 3, 4 and 5 are large content
passes over hundreds of items. All are structured as one commit per topic
precisely so the work is inspectable and interruptible — nothing after Phase 1a
is all-or-nothing.

## Appendix A — tier seeding, as the corpus stands

Derived from the 418 `relatedQuestions` references in the theory corpus, with
strongest-wins as §3.2 specifies:

| Seeded tier | Questions | Share of bank |
|---|---|---|
| must-know | 291 | 63% |
| should-know | 122 | 26% |
| good-to-know | 5 | 1% |
| *no theory link — hand-assigned* | 47 | 10% |

Per-topic, `android` seeds 101 must-know, 21 should-know and 10 untiered out of
135.

These are inputs to the review, not results. Recomputing them is a one-liner
over `relatedQuestions`, so they should be re-derived at the start of Phase 1
rather than trusted from here.

## Appendix B — sources

Consulted while writing this plan, all verified 2026-08-17:

- [kotlin.synchronized — Kotlin stdlib API reference](https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/synchronized.html) — settles §3.7
- [The activity lifecycle — Android Developers](https://developer.android.com/guide/components/activities/activity-lifecycle) — image source, §3.5
- [Fragment lifecycle — Android Developers](https://developer.android.com/guide/fragments/lifecycle) — image source, §3.5
- [Content License — Android Developers](https://developer.android.com/license) — Apache 2.0, with CC BY 2.5 attribution required for reproduced content, §3.5
- [StateFlow and SharedFlow — Android Developers](https://developer.android.com/kotlin/flow/stateflow-and-sharedflow) — the §3.8 worked example

## Appendix C — image candidates found by the survey

Every URL below was HEAD-probed on 2026-08-17 and returned 200. This is the
confirmed head of the list, not the list — Phase 1b triage supplies the rest, and
Phase 2 decides which of these actually clear the §3.5 bar.

**Replacing or augmenting an existing drawn diagram:**

| Question | Figure | Path under `developer.android.com` |
|---|---|---|
| `android/android-activity-lifecycle` | Activity lifecycle state chart | `/guide/components/images/activity_lifecycle.png` |
| `android/android-fragment-lifecycle` | Fragment vs view lifecycle | `/static/images/guide/fragments/fragment-view-lifecycle.png` |
| `android/android-service-lifecycle` | Started vs bound service paths | `/static/images/service_lifecycle.png` |
| `android/android-runtime` | Android software stack | `/static/guide/platform/images/android-stack_2x.png` |
| `android/android-viewmodel-internals` | ViewModel lifetime across rotation | `/static/images/topic/libraries/architecture/viewmodel-lifecycle.png` |
| `jetpack-compose/compose-phases` | The three Compose phases | `/static/develop/ui/compose/images/compose-phases.png` |
| `android/android-doze-app-standby` | Doze maintenance windows | `/static/images/training/doze.png` |
| `android-architecture/arch-mvvm` | Recommended app architecture | `/static/topic/libraries/architecture/images/mad-arch-overview.png` |
| `android-architecture/arch-clean` | UI and data layer detail | `…/mad-arch-overview-ui.png`, `…/mad-arch-overview-data.png` |

**Questions with no diagram today, where a figure is the better answer:**

| Question | Figure | Path under `developer.android.com` |
|---|---|---|
| `android/android-launch-modes` | Back stack; `singleTask` bringing a stack forward | `/static/images/fundamentals/diagram_backstack.png`, `/static/images/fundamentals/diagram_backstack_singletask_multiactivity.png` |
| `android/android-addtobackstack` | Back stack over time | `/static/images/fundamentals/diagram_backstack.png` |
| `android/android-multiple-processes` | Two tasks, foreground and background | `/static/images/fundamentals/diagram_multitasking.png` |
| `android/android-permission-levels` | Permission workflow; install-time vs runtime | `/static/images/training/permissions/workflow-overview.svg`, `…/install-time.svg`, `…/runtime.svg` |
| `android/android-save-restore-instance-state` | `onStop` / `onSaveInstanceState` ordering by API level | `/static/images/guide/fragments/stop-save-order.png` |

Pages surveyed but **not** yet resolved to a figure, and worth a look during
triage: background-work API selection, app startup (cold/warm/hot), the testing
pyramid, RecyclerView recycling, and processes and threads. Java and Kotlin
questions were not surveyed — kotlinlang.org and the Oracle JVM guides are
sparsely illustrated, and `java/garbage-collector` is the only strong candidate
there.

---

## Where this plan turned out to be wrong

Written at the close of Phase 6, following the house convention. The
per-phase corrections are inline above; this is what is worth knowing without
reading them.

**The five asks were not five features, and the plan said so — but it still
sized them as five.** §3.9's one-read-four-annotations argument was the best
decision in the document. What it got wrong was believing the four columns would
stay in their lanes. They did not, in both directions.

- **Phase 3 and Phase 4 consumed their whole columns, not the must-know slice.**
  The plan scheduled a Phase 5 to widen them to should-know and good-to-know.
  There was nothing to widen: all 272 snippets got a pane and all 22 `words`
  flags were worked, because the flags were sparse enough (22 in 465) that
  tiering them would have meant a second pass over the same files for no gain.
  Phase 5 turned out to be Phase 2 under another name.
- **Phase 4 kept finding errors in questions triage had sent for rewriting.**
  Seven of the eight `verify` flags were real, which is the system working. But
  six *more* corrections came out of `simplify`-flagged questions, because
  reading a sentence closely enough to rewrite it is verification whether or not
  a column says so. §8's "do both passes in one read" mitigation was carrying
  more weight than it was credited with.

**The bar in §3.5 was the most valuable paragraph in the plan, and it was
applied a phase too late.** Nine of 24 image candidates were rejected, six of
them on criterion 1 alone — they were flowcharts, which the bar excludes by
name. Triage recorded candidates by subject, as §3.9 intended, but a single
extra word per row recording the *shape* would have halved the list at reading
speed. The same argument applies to any future audit: record the property the
bar tests, not just the artefact.

**"Legible at card width" cannot be turned into a number.** The plan phrased
criterion 4 as a warning about dense multi-column figures. Column count and
pixel width both turned out to predict nothing: a three-column 821px figure
passed, a 1384×2038 stack passed at 21%, two architecture figures passed at 16%,
and a 1839px timeline failed at 14%. What matters is type size relative to
canvas, which nobody has a number for. The rule is to look.

**Two claims in §2's table were the wrong things to measure.** "Answer length:
median 1223 chars" framed simplification as a length problem. For most topics it
was a density problem, and the rewrites barely moved the character count while
changing the answers completely. For `android-system-design` it genuinely *was*
length, and §3.8's rules did not fit — those four needed a structural treatment
(lead with the decisions, demote the rest) that the plan never described.

**The implementation improved on §3.3 and the plan should not be read as the
spec.** §3.3 designed a cumulative filter: `?tier=should` meaning must *and*
should, on the reasoning that nobody wants should-know alone. What shipped is
three independent toggles that combine freely, `?tier=must,should`, because
should-know alone turns out to be exactly how you find the gaps you have been
skipping. This was caught while writing `FEATURES.md` — the first draft
documented the plan rather than the code, which is the standing hazard of
writing docs last.

**What the plan got right and should be reused.** Vendoring rather than
hotlinking. Keeping `<img>` out of the tag allowlist so figures had to be
structured data, which is the only reason a validator can check a path and an
attribution. Refusing a `verified: true` field in favour of a dated log. And
above all the `stdout`/`trace` split, which was correct for the reason given —
a fabricated Output block is worse than none — and turned out to be correct for
a reason not given: `trace` is a *better* format than stdout for Compose, Gradle
and the platform topic, because those questions are about ordering and a
numbered list is what ordering wants.

**Two things left open, deliberately.** `check-doc-links.js` cannot see an HTML
meta-refresh, which is how sixteen dead anchors survived every run until a human
read them; it is recorded in `docs/verification-log.md` rather than patched
mid-corpus. And `socket.io/docs/v4/` has been unreachable from this network
throughout, reported as unproven rather than broken, which is the honest state
to leave it in.
