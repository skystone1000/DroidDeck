const androidUnitTestingData = {
    id: "android-unit-testing",
    title: "Android Unit Testing",
    subsections: null,
    keyTopics: ["Unit Testing ViewModel with Coroutines and LiveData", "Unit Testing ViewModel with Flow and StateFlow", "Espresso", "Robolectric", "UI Automator", "Mockito", "Code Coverage", "Instrumented Tests"],
    questions: [
        {
            id: "unit-testing-viewmodel-coroutines-livedata",
            importance: "must-know",
            question: "Unit Testing ViewModel with Kotlin Coroutines and LiveData",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Testing a <code>ViewModel</code> that launches coroutines and exposes <code>LiveData</code> requires controlling coroutine execution deterministically and observing <code>LiveData</code> synchronously in a JVM test.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>InstantTaskExecutorRule</strong> — a JUnit <code>@Rule</code> from <code>androidx.arch.core:core-testing</code> that forces <code>LiveData</code>'s background <code>ArchTaskExecutor</code> to run tasks synchronously on the calling thread, so <code>postValue</code> takes effect immediately in the test.</li><li><strong>TestDispatcher</strong> — replace <code>Dispatchers.Main</code> with <code>StandardTestDispatcher</code> or <code>UnconfinedTestDispatcher</code> via <code>Dispatchers.setMain()</code> in <code>@Before</code>, and reset with <code>Dispatchers.resetMain()</code> in <code>@After</code>, so coroutines launched in <code>viewModelScope</code> run on a controllable test scheduler instead of the real main looper (which doesn't exist on the JVM).</li><li><strong>runTest</strong> — wraps the test body in a <code>TestScope</code> that auto-advances virtual time, so <code>delay()</code> calls don't actually slow the test down.</li><li><strong>Assertion</strong> — after triggering the ViewModel action, read <code>liveData.value</code> directly (or add a temporary observer) and assert against the expected state.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Forgetting <code>InstantTaskExecutorRule</code> causes <code>LiveData</code> updates to silently never reach <code>.value</code> in the test, since the real executor requires a Looper that doesn't exist in a plain JVM test.</li></ul><p><strong>🎯 Interview tip:</strong> Know that <code>InstantTaskExecutorRule</code> and <code>Dispatchers.setMain()</code> solve two separate problems (LiveData's executor vs coroutines' Main dispatcher) — interviewers often probe whether you understand why both are needed together.</p>",
            referenceLinks: [{ title: "Testing coroutines on Android", url: "https://developer.android.com/kotlin/coroutines/test" }, { title: "InstantTaskExecutorRule", url: "https://developer.android.com/reference/androidx/arch/core/executor/testing/InstantTaskExecutorRule" }],
            tags: ["testing", "viewmodel", "coroutines", "livedata", "runtest", "testdispatcher"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "ViewModel test with LiveData + coroutines", code: "@get:Rule\nval instantTaskExecutorRule = InstantTaskExecutorRule()\n\nprivate val testDispatcher = StandardTestDispatcher()\n\n@Before\nfun setUp() {\n    Dispatchers.setMain(testDispatcher)\n}\n\n@After\nfun tearDown() {\n    Dispatchers.resetMain()\n}\n\n@Test\nfun `loadUser updates LiveData with success state`() = runTest {\n    val fakeRepo = FakeUserRepository(User(\"1\", \"Ada\"))\n    val viewModel = UserViewModel(fakeRepo)\n\n    viewModel.loadUser(\"1\")\n    advanceUntilIdle()\n\n    assertEquals(UiState.Success(User(\"1\", \"Ada\")), viewModel.uiState.value)\n}" }],
            subsection: null
        },
        {
            id: "unit-testing-viewmodel-flow-stateflow",
            importance: "must-know",
            question: "Unit Testing ViewModel with Kotlin Flow and StateFlow",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><code>StateFlow</code> always has a current value like <code>LiveData</code>, but plain <code>Flow</code> emissions need to be actively collected during the test window to be observed, which is where a collection helper library becomes useful.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>StateFlow — direct read</strong> — for a simple current-value assertion, <code>viewModel.uiState.value</code> can be read directly after the triggering call, same as <code>LiveData</code>, as long as the underlying coroutine ran on a controlled <code>TestDispatcher</code> inside <code>runTest</code>.</li><li><strong>Turbine</strong> — the standard library for asserting a <em>sequence</em> of emissions: <code>flow.test { assertEquals(Loading, awaitItem()); assertEquals(Success(x), awaitItem()); cancelAndIgnoreRemainingEvents() }</code> collects in a coroutine and gives ordered, suspending assertions instead of manually managing a collector job.</li><li><strong>SharingStarted eagerness</strong> — a <code>StateFlow</code> built with <code>.stateIn(scope, SharingStarted.WhileSubscribed(), initial)</code> only starts collecting the upstream flow once there's a subscriber, so tests must actually collect (directly or via Turbine) to trigger the upstream work, not just read <code>.value</code> immediately.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Reading <code>.value</code> immediately after calling a suspend function without letting the test dispatcher advance can catch the flow mid-emission (e.g. still <code>Loading</code>) — use <code>advanceUntilIdle()</code> or collect with Turbine to be sure you're seeing the final state.</li></ul><p><strong>🎯 Interview tip:</strong> Mentioning Turbine by name and describing <code>awaitItem()</code> signals hands-on Flow-testing experience beyond \"I just read <code>.value</code>.\"</p>",
            referenceLinks: [{ title: "Turbine", url: "https://github.com/cashapp/turbine" }, { title: "Testing coroutines on Android", url: "https://developer.android.com/kotlin/coroutines/test" }],
            tags: ["testing", "viewmodel", "flow", "stateflow", "turbine", "coroutines"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "Testing a Flow-emitting ViewModel with Turbine", code: "@Test\nfun `search emits loading then results`() = runTest {\n    val fakeRepo = FakeSearchRepository(listOf(\"Kotlin\", \"Compose\"))\n    val viewModel = SearchViewModel(fakeRepo, dispatcher = StandardTestDispatcher(testScheduler))\n\n    viewModel.results.test {\n        viewModel.search(\"K\")\n\n        assertEquals(SearchState.Loading, awaitItem())\n        assertEquals(SearchState.Success(listOf(\"Kotlin\")), awaitItem())\n\n        cancelAndIgnoreRemainingEvents()\n    }\n}" }],
            subsection: null
        },
        {
            id: "what-is-espresso",
            importance: "should-know",
            question: "What is Espresso?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Espresso</strong> is Android's official UI testing framework for writing reliable, on-device instrumented tests that interact with actual rendered views.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Three core pieces</strong> — <code>ViewMatchers</code> (find a view, e.g. <code>onView(withId(R.id.button))</code>), <code>ViewActions</code> (interact with it, e.g. <code>.perform(click())</code>), and <code>ViewAssertions</code> (verify state, e.g. <code>.check(matches(isDisplayed()))</code>).</li><li><strong>Automatic synchronization</strong> — Espresso waits for the UI thread to go idle (no pending animations, layout passes, or messages in the main <code>Looper</code>'s queue) before performing the next action, eliminating most flaky <code>Thread.sleep()</code>-style waits that plagued earlier UI test frameworks.</li><li><strong>IdlingResource</strong> — for async work Espresso can't see natively (a background network call updating the UI later), you register a custom <code>IdlingResource</code> so Espresso also waits for that work to finish before proceeding.</li><li><strong>Runs on-device</strong> — as an instrumented test, it executes on a real device/emulator against the actual compiled APK, unlike Robolectric's JVM simulation.</li></ul><p><strong>🎯 Interview tip:</strong> The synchronization mechanism is the headline feature — be ready to explain why it removes the need for manual waits, and when you still need an <code>IdlingResource</code>.</p>",
            referenceLinks: [{ title: "Espresso basics", url: "https://developer.android.com/training/testing/espresso" }],
            tags: ["testing", "espresso", "ui-testing", "instrumented-test"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "Basic Espresso test", code: "@RunWith(AndroidJUnit4::class)\nclass LoginActivityTest {\n\n    @get:Rule\n    val activityRule = ActivityScenarioRule(LoginActivity::class.java)\n\n    @Test\n    fun loginButton_showsErrorOnEmptyFields() {\n        onView(withId(R.id.loginButton)).perform(click())\n\n        onView(withId(R.id.errorText))\n            .check(matches(isDisplayed()))\n            .check(matches(withText(\"Please fill all fields\")))\n    }\n}" }],
            subsection: null
        },
        {
            id: "what-is-robolectric",
            importance: "should-know",
            question: "What is Robolectric?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Robolectric</strong> is a framework that provides simulated Android framework classes (<code>Activity</code>, <code>View</code>, <code>Context</code>, resources) so Android-dependent code can run as a <strong>fast local JVM unit test</strong> instead of needing a real device/emulator.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Shadow classes</strong> — Robolectric intercepts calls into the real Android SDK stubs (normally throwing <code>\"Stub!\"</code> in a plain JVM test) and redirects them to \"shadow\" implementations that mimic real framework behavior.</li><li><strong>Test runner</strong> — annotate the test class with <code>@RunWith(RobolectricTestRunner::class)</code> (or use the <code>androidx.test</code> integration) to activate the simulated environment.</li><li><strong>Use case</strong> — testing code that touches <code>Context</code>, resources, <code>SharedPreferences</code>, or simple <code>Activity</code>/<code>Fragment</code> lifecycle behavior, without paying for an emulator boot and app install per test run.</li></ul><p><strong>⚖️ vs Espresso</strong></p><ul><li>Robolectric runs on the local JVM (fast, no device); Espresso runs on a real device/emulator against real rendering (slower, but 100% behaviorally accurate).</li></ul><p><strong>🎯 Interview tip:</strong> Position Robolectric as filling the middle ground between pure unit tests (no Android APIs) and full instrumented tests (need a device) — fast feedback with real-ish framework behavior.</p>",
            referenceLinks: [{ title: "Robolectric", url: "https://robolectric.org/" }],
            tags: ["testing", "robolectric", "unit-test", "jvm"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "disadvantages-of-robolectric",
            importance: "should-know",
            question: "What are the disadvantages of Robolectric?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Because Robolectric <em>simulates</em> the Android framework rather than running it, that simulation can diverge from real device behavior in ways that bite in practice.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li><strong>Behavioral fidelity gaps</strong> — shadow implementations don't perfectly replicate every OS version's real behavior (rendering, native code paths, some hardware-backed APIs), so a passing Robolectric test isn't a full guarantee of on-device correctness.</li><li><strong>No real rendering/graphics</strong> — layout measurement and drawing are approximated, not pixel-accurate, so it's unsuitable for visual/screenshot verification without extra tooling.</li><li><strong>SDK/version lag</strong> — shadows for the newest Android APIs can lag behind actual platform releases, delaying coverage of brand-new APIs.</li><li><strong>Slower than pure JVM unit tests</strong> — while much faster than an emulator, the framework simulation overhead still makes Robolectric tests slower than tests with zero Android dependencies (plain Kotlin/JUnit + Mockito).</li><li><strong>Native code / JNI limitations</strong> — code paths relying on native libraries may not be faithfully simulated.</li></ul><p><strong>🎯 Interview tip:</strong> A senior answer treats Robolectric as one layer in a test pyramid, not a full substitute for instrumented tests on critical UI flows — mention you'd still run Espresso for high-risk user journeys.</p>",
            referenceLinks: [{ title: "Robolectric", url: "https://robolectric.org/" }],
            tags: ["testing", "robolectric", "limitations", "test-pyramid"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "what-is-ui-automator",
            importance: "should-know",
            question: "What is UI-Automator?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>UI Automator</strong> is a testing framework for <strong>black-box, cross-app UI testing</strong> — it can interact with any visible UI element on the device, including system UI and other apps, not just your own app's views.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>UiDevice</strong> — the entry point representing the whole device; lets a test press hardware/system buttons, open notifications, switch apps, or check screen state.</li><li><strong>Selectors</strong> — <code>UiSelector</code>/<code>By</code> find elements by text, resource ID, class, or content description across process boundaries, unlike Espresso which is scoped to the app under test's own view hierarchy.</li><li><strong>Use cases</strong> — testing flows that cross app boundaries: sharing to another app, responding to a system permission dialog, verifying a notification, or interacting with the home screen/launcher.</li></ul><p><strong>⚖️ vs Espresso</strong></p><ul><li>Espresso is fast and synchronized but confined to your own app's process; UI Automator can reach across apps and system UI but has no automatic idling/synchronization, so tests are more prone to needing explicit waits.</li></ul><p><strong>🎯 Interview tip:</strong> The one-line differentiator to remember: Espresso tests your app in isolation, UI Automator tests interactions that leave your app's process.</p>",
            referenceLinks: [{ title: "UI Automator", url: "https://developer.android.com/training/testing/other-components/ui-automator" }],
            tags: ["testing", "ui-automator", "instrumented-test", "cross-app"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "what-is-unit-test",
            importance: "must-know",
            question: "What is a unit test?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A <strong>unit test</strong> verifies a single, small unit of logic (a function, class, or a tightly-scoped piece of behavior) in isolation from its real dependencies, running fast and deterministically.</li></ul><p><strong>⚙️ Characteristics</strong></p><ul><li><strong>Isolated</strong> — real collaborators (network, database, other classes) are replaced with test doubles (fakes/mocks/stubs) so the test exercises only the unit under test.</li><li><strong>Fast</strong> — typically runs on the local JVM in milliseconds, with no device, emulator, or I/O, so hundreds/thousands can run on every build.</li><li><strong>Deterministic &amp; repeatable</strong> — same input always produces the same result; no flakiness from timing, network, or shared state.</li><li><strong>On Android</strong> — lives in <code>src/test/</code>, run with JUnit (+ MockK/Mockito for doubles), and normally avoids real Android framework classes unless Robolectric is layered in.</li></ul><p><strong>🎯 Interview tip:</strong> A crisp definition — \"fast, isolated, deterministic verification of one unit of behavior\" — is what interviewers listen for before diving into follow-ups about mocks or the test pyramid.</p>",
            referenceLinks: [{ title: "Test your app", url: "https://developer.android.com/training/testing/fundamentals" }],
            tags: ["testing", "unit-test", "junit", "fundamentals"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "The testing pyramid",
                columns: 1,
                nodes: [
                    { label: "UI / E2E tests (Espresso)", type: "terminal" },
                    { label: "Integration tests (Robolectric)" },
                    { label: "Unit tests (JUnit + MockK)", type: "terminal" }
                ],
                connections: [
                    { from: 2, to: 1, label: "more" },
                    { from: 1, to: 0, label: "fewer" }
                ]
            },
            codeSnippets: [],
            subsection: null
        },
        {
            id: "what-is-instrumented-test",
            importance: "must-know",
            question: "What is an instrumented test?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>An <strong>instrumented test</strong> runs on a real device or emulator, with access to real Android framework APIs, application context, and instrumentation hooks — the opposite end of the spectrum from an isolated JVM unit test.</li></ul><p><strong>⚙️ Characteristics</strong></p><ul><li><strong>Location</strong> — lives in <code>src/androidTest/</code>, compiled into a separate test APK that's installed alongside the app under test.</li><li><strong>Runner</strong> — driven by <code>AndroidJUnitRunner</code>, which uses the <code>Instrumentation</code> API to control the app process, inject events, and monitor lifecycle callbacks.</li><li><strong>Typical use</strong> — UI tests (Espresso), tests needing a real <code>Context</code>/<code>ContentResolver</code>/database, or verifying behavior tied to actual device APIs (camera, sensors, real SQLite).</li><li><strong>Cost</strong> — slower than JVM unit tests since it requires app install and device/emulator boot, but gives the highest fidelity to real user-facing behavior.</li></ul><p><strong>⚖️ vs local unit test</strong></p><ul><li>Local unit tests (<code>src/test/</code>) run on the JVM with no device, in seconds; instrumented tests (<code>src/androidTest/</code>) run on-device, in minutes, but validate real integration.</li></ul><p><strong>🎯 Interview tip:</strong> Naming both source sets (<code>src/test</code> vs <code>src/androidTest</code>) explicitly is a quick, concrete way to show you know the project structure, not just the theory.</p>",
            referenceLinks: [{ title: "Instrumented tests", url: "https://developer.android.com/training/testing/instrumented-tests" }],
            tags: ["testing", "instrumented-test", "androidtest", "androidjunitrunner"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "why-mockito-used",
            importance: "must-know",
            question: "Why is Mockito used?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Mockito</strong> is a mocking framework for Java/Kotlin that creates <strong>test doubles</strong> at runtime so a unit test can isolate the class under test from its real dependencies.</li></ul><p><strong>⚙️ What it's used for</strong></p><ul><li><strong>Stubbing behavior</strong> — <code>whenever(repository.getUser(\"1\")).thenReturn(fakeUser)</code> makes a dependency return a known value without hitting a real network/DB.</li><li><strong>Verifying interactions</strong> — <code>verify(analytics).track(\"purchase\")</code> asserts a method was actually called, useful when the outcome is a side effect rather than a return value.</li><li><strong>Argument capturing</strong> — <code>ArgumentCaptor</code> inspects exactly what was passed to a dependency, useful for asserting on constructed request objects.</li><li><strong>Avoiding slow/flaky dependencies</strong> — mocking a network client or database means tests run in milliseconds and never fail due to real I/O issues.</li></ul><p><strong>⚖️ Mockito vs MockK</strong></p><ul><li>Mockito was built for Java and struggles with Kotlin's <code>final</code>-by-default classes and coroutines without extra setup (<code>mockito-inline</code>, <code>mockito-kotlin</code>); <strong>MockK</strong> is Kotlin-first, with native support for <code>suspend</code> functions, extension functions, and <code>object</code>s, and is the more common choice in modern Kotlin codebases.</li></ul><p><strong>🎯 Interview tip:</strong> If asked to choose, many current interviewers expect MockK for a Kotlin project — mentioning it shows you're current, not just repeating older Java-era advice.</p>",
            referenceLinks: [{ title: "Mockito", url: "https://site.mockito.org/" }, { title: "MockK", url: "https://mockk.io/" }],
            tags: ["testing", "mockito", "mockk", "mocking", "test-doubles"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "Mocking a repository dependency", code: "class UserViewModelTest {\n\n    private val repository: UserRepository = mockk()\n\n    @Test\n    fun `loadUser exposes success state`() = runTest {\n        coEvery { repository.getUser(\"1\") } returns User(\"1\", \"Ada\")\n\n        val viewModel = UserViewModel(repository)\n        viewModel.loadUser(\"1\")\n\n        assertEquals(UiState.Success(User(\"1\", \"Ada\")), viewModel.uiState.value)\n        coVerify(exactly = 1) { repository.getUser(\"1\") }\n    }\n}" }],
            subsection: null
        },
        {
            id: "what-is-code-coverage",
            importance: "must-know",
            question: "What is code coverage?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Code coverage</strong> is a metric measuring what percentage of production code is executed by the test suite, used as one (imperfect) signal of test thoroughness.</li></ul><p><strong>⚙️ Common coverage types</strong></p><ul><li><strong>Line coverage</strong> — percentage of source lines executed at least once.</li><li><strong>Branch coverage</strong> — percentage of decision branches (both sides of an <code>if</code>, each <code>when</code> case) actually taken — stricter than line coverage since a line can run without every branch through it being exercised.</li><li><strong>Method/class coverage</strong> — coarser-grained rollups of the same idea.</li></ul><p><strong>⚙️ Android tooling</strong></p><ul><li><strong>JaCoCo</strong> — the standard JVM coverage tool, integrated via the Gradle JaCoCo plugin to generate HTML/XML reports and enforce minimum thresholds in CI.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li><strong>High coverage ≠ good tests</strong> — a test can execute a line without meaningfully asserting on its behavior (e.g. calling a method with no assertion afterward), so coverage percentage alone doesn't prove correctness.</li><li>Chasing a coverage number as a target can incentivize shallow, low-value tests written just to touch lines.</li></ul><p><strong>🎯 Interview tip:</strong> A strong answer explicitly caveats that coverage is a necessary-but-not-sufficient signal — pair it with the point that mutation testing (do tests fail when code is deliberately broken?) is a stronger quality signal.</p>",
            referenceLinks: [{ title: "JaCoCo", url: "https://www.jacoco.org/jacoco/" }],
            tags: ["testing", "code-coverage", "jacoco", "quality"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        }
    ]
};
