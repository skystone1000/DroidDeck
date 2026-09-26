/* ==========================================================================
   M41 — UI testing.

   Compose first, Espresso second — the reverse of the historical order, and
   the same choice M25 made for the View system. Both frameworks solve the
   same two problems: finding a thing on screen, and knowing when the app has
   finished moving.
   ========================================================================== */

const uiTestingModule = {
    id: 'ui-testing',
    trackId: 'quality',
    order: 41,
    title: 'UI Testing',
    tagline: 'Find the node, wait for quiet, assert — and never sleep.',
    estimatedMinutes: 25,
    prerequisites: ['testing-fundamentals'],
    docHub: {
        title: 'Automate UI tests',
        path: '/training/testing/ui-tests'
    },

    chapters: [
        {
            id: 'compose-testing',
            title: 'Testing Compose',
            importance: 'must-know',
            summary: 'Tests query the semantics tree, which is the same tree accessibility services read.',
            interviewAngle: 'The payoff line from M23 lands here: making a screen accessible makes it testable.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>There is no view hierarchy to walk, so Compose tests query the <strong>semantics tree</strong> from M23 — the parallel tree describing what each element means. That is the detail worth carrying: content descriptions and merged nodes are not an accessibility chore you also happen to need for tests; they are the same work, paid once.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The three-part shape: find, act, assert',
                    code: `class ProfileScreenTest {

    @get:Rule val compose = createComposeRule()      // no Activity needed

    @Test
    fun \`shows the name and reacts to refresh\`() {
        var refreshed = false
        compose.setContent {
            Profile(                                  // the stateless one (M34)
                state = ProfileUiState(user = User("42", "Ada")),
                onRefresh = { refreshed = true },
                onMessageShown = {}
            )
        }

        compose.onNodeWithText("Ada").assertIsDisplayed()
        compose.onNodeWithContentDescription("Refresh").performClick()

        assertThat(refreshed).isTrue()
    }
}`,
                    notes: '<code>createComposeRule</code> hosts the composable directly, so a screen written as a stateless composable taking lambdas is testable with no ViewModel, no Hilt and no navigation graph — the M34 hoisting paying off again.'
                },
                {
                    type: 'types',
                    title: 'The parts you will use',
                    items: [
                        { name: 'Finders', html: '<p><code>onNodeWithText</code>, <code>onNodeWithTag</code>, <code>onNodeWithContentDescription</code>, and <code>onAllNodes…</code> for collections. <code>testTag</code> via <code>Modifier.testTag</code> is for when no user-visible property identifies the node uniquely.</p>' },
                        { name: 'Actions', html: '<p><code>performClick</code>, <code>performTextInput</code>, <code>performScrollTo</code>, <code>performTouchInput { swipeLeft() }</code>.</p>' },
                        { name: 'Assertions', html: '<p><code>assertIsDisplayed</code>, <code>assertIsEnabled</code>, <code>assertTextEquals</code>, <code>assertCountEquals</code> — and <code>assertDoesNotExist</code>, which is different from not being displayed.</p>' },
                        { name: 'createAndroidComposeRule', html: '<p>When you do need a real activity — navigation, or a screen that reads its intent.</p>' },
                        { name: 'printToLog', html: '<p><code>onRoot().printToLog("TAG")</code> dumps the semantics tree. The fastest way to find out why a finder matched nothing.</p>' }
                    ]
                },
                {
                    type: 'definition',
                    term: 'Synchronisation',
                    important: true,
                    html: '<p>The test framework waits automatically until the app is idle — no pending recompositions, no running animations, no queued work on the test clock. Assertions therefore run against a settled UI without any sleeping.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Auto-sync only covers work Compose knows about. An infinite animation never goes idle, so the test hangs; and a coroutine on a real dispatcher (M40) is invisible to it. For those, take manual control with <code>mainClock.autoAdvance = false</code> and <code>advanceTimeBy</code>, or use <code>waitUntil</code> with a condition — never <code>Thread.sleep</code>, which turns a hang into a flake.</p>'
                }
            ],
            docs: [
                { title: 'Testing your Compose layout', path: '/develop/ui/compose/testing', kind: 'guide' },
                { title: 'Compose testing cheat sheet', path: '/develop/ui/compose/testing/testing-cheatsheet', kind: 'guide' },
                { title: 'Semantics in Compose', path: '/develop/ui/compose/accessibility/semantics', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-semantics' },
                { topicId: 'android-unit-testing', questionId: 'what-is-instrumented-test' }
            ]
        },

        {
            id: 'espresso',
            title: 'Espresso, and the idling problem',
            importance: 'should-know',
            summary: 'Match a view, perform an action, check an assertion — and tell it when you are busy.',
            interviewAngle: 'Idling resources are the whole point of the Espresso question. Sleeping is the wrong answer.',
            buildsOn: ['compose-testing'],
            blocks: [
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The sentence Espresso is built around',
                    code: `// onView(Matcher) .perform(ViewAction) .check(ViewAssertion)

onView(withId(R.id.searchField))
    .perform(typeText("lovelace"), closeSoftKeyboard())

onView(withId(R.id.results))
    .perform(RecyclerViewActions.scrollToPosition<ViewHolder>(4))

onView(withText("Ada Lovelace"))
    .check(matches(isDisplayed()))`,
                    notes: 'Matchers compose — <code>allOf(withId(R.id.title), isDescendantOfA(withId(R.id.card)))</code> — which is how you disambiguate a view that appears many times.'
                },
                {
                    type: 'prose',
                    html: '<p>Espresso synchronises automatically too, but only against the main thread’s message queue (M7). It waits for the queue to drain and for the view hierarchy to settle, and it knows nothing about a network call, a coroutine on <code>Dispatchers.IO</code> or a <code>WorkManager</code> job. That gap is where flakiness comes from.</p>'
                },
                {
                    type: 'definition',
                    term: 'Idling resource',
                    important: true,
                    html: '<p>An object that tells Espresso "the app is still busy" so it waits rather than asserting too early. Registered with the framework, flipped to idle when the background work completes.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The honest position is that idling resources leak test concerns into production code — you end up incrementing a counter in a repository so a test can see it. The better answer, where the architecture allows, is not to need them: inject a test dispatcher (M40) and a fake repository so the work is synchronous under test, and keep the idling resource for the cases where you genuinely cannot.</p>'
                },
                {
                    type: 'types',
                    title: 'Other pieces worth naming',
                    items: [
                        { name: 'Intents', html: '<p><code>Espresso-Intents</code> stubs and verifies outgoing intents (M15), so a test can assert that tapping share launched a chooser without a second app existing.</p>' },
                        { name: 'Interop with Compose', html: '<p>A hybrid screen (M25) can be driven by both in one test — Espresso for the views, the Compose rule for the composables, sharing one activity.</p>' },
                        { name: 'Animations off', html: '<p>Instrumented UI tests need the device’s three animation scales set to zero, or assertions race the transitions. This is the single commonest cause of "passes locally, fails in CI".</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Espresso basics', path: '/training/testing/espresso/basics', kind: 'guide' },
                { title: 'Espresso idling resources', path: '/training/testing/espresso/idling-resource', kind: 'guide' },
                { title: 'Espresso cheat sheet', path: '/training/testing/espresso/cheat-sheet', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-unit-testing', questionId: 'what-is-espresso' }
            ]
        },

        {
            id: 'beyond-the-app',
            title: 'Across apps, and against pixels',
            importance: 'should-know',
            summary: 'UI Automator leaves your process; screenshot tests assert on appearance rather than structure.',
            interviewAngle: 'The Espresso-versus-UI-Automator boundary is a small, precise distinction worth having.',
            buildsOn: ['espresso'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'Espresso versus UI Automator',
                    left: 'Espresso',
                    right: 'UI Automator',
                    rows: [
                        { aspect: 'Scope', left: 'Your app only', right: 'The whole device' },
                        { aspect: 'Access', left: 'Your view hierarchy directly', right: 'The accessibility service' },
                        { aspect: 'Speed', left: 'Faster', right: 'Slower' },
                        { aspect: 'Can test', left: 'Screens inside the app', right: 'Settings, notifications, the launcher, other apps' },
                        { aspect: 'Reach for it when', left: 'Almost always', right: 'A journey genuinely leaves the app' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>UI Automator earns its place for flows that cross the app boundary — granting a permission through the system dialog (M17), tapping a notification, returning from a share sheet. Because it drives the device through accessibility, it also cannot see anything that is not exposed there, which is another reason the semantics work pays twice.</p>'
                },
                {
                    type: 'types',
                    title: 'Screenshot testing',
                    items: [
                        { name: 'What it catches', html: '<p>Visual regressions structural assertions miss entirely — a colour that broke in dark mode, text clipped at a large font scale (M16), a layout that collapses at a different width.</p>' },
                        { name: 'How it works', html: '<p>Render, capture, compare against a committed reference image, fail on a difference above a threshold. Compose Preview Screenshot Testing generates them from the previews you already write.</p>' },
                        { name: 'The cost', html: '<p>Reference images are binaries in the repository, and every intentional design change regenerates a pile of them. Rendering also varies subtly across devices and API levels, so the images have to be produced in a fixed environment or the suite is permanently red.</p>' },
                        { name: 'Where it fits', html: '<p>Best on a design system’s components (M23), where the surface is small, stable and shared. Weakest on busy screens full of real data.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The strategy answer for a UI-testing question is a shape, not a tool list: <em>"most behaviour tested below the UI with fakes; Compose tests per screen against the semantics tree; a handful of end-to-end journeys, with UI Automator only where the flow leaves the app; and screenshot tests on the design system."</em> That is the M39 pyramid with the top layer spelled out.</p>'
                }
            ],
            docs: [
                { title: 'Automate UI tests', path: '/training/testing/ui-tests', kind: 'guide' },
                { title: 'Write automated tests with UI Automator', path: '/training/testing/other-components/ui-automator', kind: 'guide' },
                { title: 'Screenshot testing', path: '/training/testing/ui-tests/screenshot', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-unit-testing', questionId: 'what-is-ui-automator' },
                { topicId: 'android-unit-testing', questionId: 'what-is-espresso' }
            ]
        }
    ]
};
