/* ==========================================================================
   M40 — Testing coroutines, flows and ViewModels.

   The module that makes M39 usable on a real Android codebase, because
   almost everything worth testing there is suspending, streaming, or both.
   Virtual time is the idea the whole module rests on.
   ========================================================================== */

const testingCoroutinesModule = {
    id: 'testing-coroutines',
    trackId: 'quality',
    order: 40,
    title: 'Testing Coroutines, Flows and ViewModels',
    tagline: 'Virtual time, an injected dispatcher, and no sleeping in tests.',
    estimatedMinutes: 30,
    prerequisites: ['testing-fundamentals'],
    docHub: {
        title: 'Test Kotlin coroutines on Android',
        path: '/kotlin/coroutines/test'
    },

    chapters: [
        {
            id: 'runtest-and-dispatchers',
            title: 'runTest and virtual time',
            importance: 'must-know',
            summary: 'The test scheduler fast-forwards delays, so a five-second timeout costs no real time.',
            interviewAngle: 'Anyone who has written Thread.sleep in a test will recognise the problem this solves.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A suspending function cannot be called from an ordinary test, and the naive fix — <code>runBlocking</code> plus a sleep long enough for things to settle — produces a suite that is slow and flaky at once. <code>runTest</code> replaces both problems with one mechanism.</p>'
                },
                {
                    type: 'definition',
                    term: 'Virtual time',
                    important: true,
                    html: '<p>The test scheduler keeps its own clock. A <code>delay(5_000)</code> inside <code>runTest</code> advances that clock instantly rather than waiting, so timeouts, retries and debounces are testable at full speed and with no timing race.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The basic shape',
                    code: `@Test
fun \`retries three times before giving up\`() = runTest {
    val api = FailingApi(failures = 2)
    val repo = UserRepository(api)

    val result = repo.fetchWithBackoff("42")   // internally delays 1s, 2s, 4s

    assertThat(result.isSuccess).isTrue()
    assertThat(api.attempts).isEqualTo(3)
    // Seven seconds of backoff. The test took under a millisecond.
}`,
                    notes: '<code>runTest</code> also fails the test if a child coroutine is still running when the body finishes, which catches leaked work that <code>runBlocking</code> would silently ignore.'
                },
                {
                    type: 'comparison',
                    title: 'The two test dispatchers',
                    left: 'StandardTestDispatcher',
                    right: 'UnconfinedTestDispatcher',
                    rows: [
                        { aspect: 'A new coroutine', left: 'Queued, not started', right: 'Runs eagerly until it suspends' },
                        { aspect: 'You advance it with', left: '<code>runCurrent()</code>, <code>advanceUntilIdle()</code>', right: 'Usually nothing' },
                        { aspect: 'Ordering', left: 'Explicit and realistic', right: 'Eager — unlike production' },
                        { aspect: 'Good for', left: 'Asserting intermediate states', right: 'Simple cases; collecting flows' },
                        { aspect: 'Default in <code>runTest</code>', left: 'Yes', right: 'No' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The distinction matters when you want to observe a <em>loading</em> state. Under the standard dispatcher the launched work has not begun, so you can assert that <code>isLoading</code> is true, then call <code>advanceUntilIdle()</code> and assert the result. Under the unconfined dispatcher the work has already run past that point, and the intermediate state is gone before you can look at it.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Mixing real dispatchers into a <code>runTest</code> body reintroduces everything it removed. If any code under test hard-codes <code>Dispatchers.IO</code>, that work escapes the test scheduler — virtual time does not apply, <code>advanceUntilIdle()</code> does not wait for it, and the test becomes timing-dependent. Which is the whole argument for the next chapter.</p>'
                }
            ],
            docs: [
                { title: 'Test Kotlin coroutines on Android', path: '/kotlin/coroutines/test', kind: 'guide' },
                { title: 'Testing coroutines', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-unit-testing', questionId: 'unit-testing-viewmodel-coroutines-livedata' }
            ]
        },

        {
            id: 'injecting-dispatchers',
            title: 'Injecting dispatchers, and replacing Main',
            importance: 'must-know',
            summary: 'A hard-coded dispatcher is an untestable dependency; Dispatchers.Main needs replacing outright.',
            interviewAngle: 'The "Module with the Main dispatcher had failed to initialize" error is one every Android developer meets.',
            buildsOn: ['runtest-and-dispatchers'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p><code>Dispatchers.Main</code> is backed by the Android main looper (M7), which does not exist on the JVM. So a plain unit test of any <code>ViewModel</code> using <code>viewModelScope</code> fails immediately with <em>"Module with the Main dispatcher had failed to initialize"</em> — not a bug, just the absence of Android.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The rule everyone ends up writing',
                    code: `class MainDispatcherRule(
    private val dispatcher: TestDispatcher = UnconfinedTestDispatcher()
) : TestWatcher() {
    override fun starting(description: Description) = Dispatchers.setMain(dispatcher)
    override fun finished(description: Description) = Dispatchers.resetMain()
}

class ProfileViewModelTest {
    @get:Rule val mainDispatcher = MainDispatcherRule()
    …
}`,
                    notes: '<code>resetMain()</code> in <code>finished</code> is not optional — leaving a test dispatcher installed leaks into every later test in the run, and the failure appears in an unrelated class.'
                },
                {
                    type: 'prose',
                    html: '<p>Every other dispatcher is a constructor parameter, which is the M36 point applied to concurrency. A class that names <code>Dispatchers.IO</code> internally has an undeclared dependency the test cannot replace; a class that takes one has a seam.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A dispatcher as an injected dependency',
                    code: `class UserRepository(
    private val api: UserApi,
    private val io: CoroutineDispatcher = Dispatchers.IO      // M26
) {
    suspend fun fetch(id: String) = withContext(io) { api.getUser(id) }
}

@Test
fun \`maps the response\`() = runTest {
    // The test's own scheduler, so withContext stays under virtual time.
    val repo = UserRepository(FakeApi(), StandardTestDispatcher(testScheduler))
    assertThat(repo.fetch("42").name).isEqualTo("Ada")
}`,
                    notes: 'Passing <code>testScheduler</code> is what keeps the injected dispatcher on the same virtual clock as <code>runTest</code>. A fresh <code>StandardTestDispatcher()</code> would have its own, and <code>advanceUntilIdle()</code> would not reach it.'
                },
                {
                    type: 'tip',
                    html: '<p>In a Hilt app the clean version is a qualifier — <code>@IoDispatcher</code> — provided by a module and replaced in tests with <code>@TestInstallIn</code>. That removes the default-argument version entirely, which is worth doing once a project has more than a handful of these.</p>'
                }
            ],
            docs: [
                { title: 'Test Kotlin coroutines on Android', path: '/kotlin/coroutines/test', kind: 'guide' },
                { title: 'Coroutines best practices', path: '/kotlin/coroutines/coroutines-best-practices', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-unit-testing', questionId: 'unit-testing-viewmodel-coroutines-livedata' },
                { topicId: 'android-unit-testing', questionId: 'unit-testing-viewmodel-flow-stateflow' }
            ]
        },

        {
            id: 'flows-and-viewmodels',
            title: 'Testing flows, and a ViewModel end to end',
            importance: 'must-know',
            summary: 'A hot flow never completes, so collecting it needs a helper — and Turbine is that helper.',
            interviewAngle: 'Testing a StateFlow-based ViewModel is a common live exercise. The subscriber trap is the thing to know.',
            buildsOn: ['injecting-dispatchers'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A cold flow can be collected with <code>toList()</code> because it ends. A <code>StateFlow</code> does not end, so <code>toList()</code> hangs forever — and the usual workaround, launching a collector into a list and hoping, is exactly the kind of timing assumption <code>runTest</code> exists to remove.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Turbine, which makes emissions assertable one at a time',
                    code: `@Test
fun \`shows the cached user, then the refreshed one\`() = runTest {
    val repo = FakeUserRepository(initial = User("42", "Ada"))
    val viewModel = ProfileViewModel(repo, SavedStateHandle(mapOf("userId" to "42")))

    viewModel.uiState.test {                       // Turbine
        assertThat(awaitItem().user).isNull()      // initial value
        assertThat(awaitItem().user?.name).isEqualTo("Ada")

        repo.emit(User("42", "Ada Lovelace"))
        assertThat(awaitItem().user?.name).isEqualTo("Ada Lovelace")

        cancelAndIgnoreRemainingEvents()
    }
}`,
                    notes: '<code>awaitItem()</code> suspends until the next emission and fails the test on a timeout, so there is nothing to sleep for and no arbitrary duration to tune.'
                },
                {
                    type: 'pitfall',
                    html: '<p>A <code>StateFlow</code> built with <code>stateIn(..., WhileSubscribed(5_000))</code> (M34) produces <strong>only its initial value</strong> until something collects it — the upstream never starts. A test asserting on <code>uiState.value</code> without collecting therefore sees the initial state forever and fails in a way that looks like broken production code. Collect it, with Turbine or a launched collector, and the pipeline runs.</p>'
                },
                {
                    type: 'types',
                    title: 'What is worth asserting on a ViewModel',
                    items: [
                        { name: 'The state that comes out', html: '<p>Given this fake repository and this event, the UI state becomes that. This is the behaviour; everything else is detail.</p>' },
                        { name: 'The intermediate states', html: '<p>That <code>isRefreshing</code> turned on and off. Needs <code>StandardTestDispatcher</code>, per the first chapter.</p>' },
                        { name: 'The failure path', html: '<p>A fake configured to fail is the cheapest way to test error handling, and it is the path least likely to be exercised by hand.</p>' },
                        { name: 'Not the repository calls', html: '<p><code>verify(repo).refresh()</code> is the implementation coupling from M39. Assert that the state updated instead.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>For Room, use <code>Room.inMemoryDatabaseBuilder</code> in an instrumented test — real SQL, no file, gone at the end. For Retrofit, use <code>MockWebServer</code> to serve canned responses over a real socket, which exercises your converters and interceptors (M28) rather than mocking them away.</p>'
                }
            ],
            docs: [
                { title: 'Test Kotlin coroutines on Android', path: '/kotlin/coroutines/test', kind: 'guide' },
                { title: 'Testing strategies', path: '/training/testing/fundamentals/strategies', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-unit-testing', questionId: 'unit-testing-viewmodel-flow-stateflow' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-unit-testing' }
            ]
        }
    ]
};
