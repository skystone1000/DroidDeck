# Triage — Android Unit Testing

**Pass:** 2026-08-17 · 10 questions · plan [§3.9](../plans/2026-08-17-answer-quality.md)

One read of each question, four judgements recorded at once. **Triage flags;
Phases 2–4 act.** Only the `tier` column has been applied to the corpus.

## Tiers after review

| Tier | Seeded | Reviewed |
|---|---|---|
| must-know | 6 | **4** |
| should-know | 4 | **4** |
| good-to-know | 0 | **2** |

The first topic to get a good-to-know at all. Testing questions split cleanly
into "can you define a unit test and test a ViewModel" — asked constantly — and
tool trivia, which is asked only if the tool is on the job description.

## The pass

| # | Question | Tier | Image | Output | Words |
|---|---|---|---|---|---|
| 1 | `unit-testing-viewmodel-coroutines-livedata` | must | — | `[0]` trace | simplify |
| 2 | `unit-testing-viewmodel-flow-stateflow` | must | — | `[0]` trace | simplify |
| 3 | `what-is-espresso` | should | — | `[0]` trace | — |
| 4 | `what-is-robolectric` | should | — | — | — |
| 5 | `disadvantages-of-robolectric` | should → **good** | — | — | — |
| 6 | `what-is-ui-automator` | should → **good** | — | — | — |
| 7 | `what-is-unit-test` | must | — | — | — |
| 8 | `what-is-instrumented-test` | must | — | — | — |
| 9 | `why-mockito-used` | must → **should** | — | `[0]` trace | — |
| 10 | `what-is-code-coverage` | must → **should** | — | — | — |

## Why each tier moved

**5 · `disadvantages-of-robolectric` → good-to-know** and
**6 · `what-is-ui-automator` → good-to-know.** Both are one level below a
question that is itself should-know. Robolectric's fidelity gaps come up only if
you said you use Robolectric; UI Automator comes up only if the job involves
cross-app flows. Neither belongs in a short revision.

**9 · `why-mockito-used` → should-know.** Mocking is asked; *Mockito* is asked
less each year, because Kotlin codebases reach for MockK and the answer itself
says why. The concept is worth knowing, the brand is not must-know.

**10 · `what-is-code-coverage` → should-know.** Asked as a follow-up, usually to
see whether you will say "high coverage does not mean good tests". Worth
knowing; not worth a slot ahead of what an instrumented test is.

## Image candidates

None found. `developer.android.com/training/testing/fundamentals` carries no
figures at all — checked, not assumed — which is a genuine surprise given how
often the testing pyramid is drawn.

Question 7 has its own three-node flowchart of the pyramid, and since Google
publishes nothing to replace it with, it stays. Worth revisiting if the testing
guide is ever re-illustrated.

## Output candidates

Four snippets: two ViewModel tests, an Espresso test, a Mockito stub. Every one
needs a test runtime, an Android framework, or both. All `trace`.

This is the cleanest example in the bank so far of why the two kinds exist. A
test's output is a green tick, which teaches nothing; what a reader needs is the
order things happen in — `setMain`, then the coroutine runs on the test
scheduler, then the assertion sees the value. That is exactly what a trace says
and an `Output` pane could not.

## Words

**1 and 2 · simplify.** The two longest answers in the topic, at roughly 2000 and
1900 characters, and both are dense with machinery — `InstantTaskExecutorRule`,
`ArchTaskExecutor`, `StandardTestDispatcher`, `UnconfinedTestDispatcher`,
`SharingStarted.WhileSubscribed`, Turbine. Every one of those nouns has to
survive §3.8 rule 2, so the saving has to come entirely from the connective
prose. These will be the hardest rewrites in the topic and are worth doing first
because they are both must-know.

Nothing flagged for verification. The claims about what `InstantTaskExecutorRule`
does, why `Dispatchers.setMain` is needed on the JVM, and where Robolectric
diverges from a device all check out.

## Notes

**Questions 3–6 are a tool survey**, and after this pass they are tiered as one:
Espresso and Robolectric should-know, their follow-ups good-to-know. A reader
filtering to must-know now sees only the four conceptual questions, which is the
right result — "what is a unit test", "what is an instrumented test", and how to
test a ViewModel two ways.
