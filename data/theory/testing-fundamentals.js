/* ==========================================================================
   M39 — Testing fundamentals.

   Placed after dependency injection because the two are the same subject seen
   twice: everything that makes code testable is a seam, and M36 is how seams
   get filled. A class you cannot inject into is a class you cannot test.
   ========================================================================== */

const testingFundamentalsModule = {
    id: 'testing-fundamentals',
    trackId: 'quality',
    order: 39,
    title: 'Testing Fundamentals',
    tagline: 'Fast tests you trust, and a precise vocabulary for the fakes.',
    estimatedMinutes: 30,
    prerequisites: ['dependency-injection'],
    docHub: {
        title: 'Test apps on Android',
        path: '/training/testing/fundamentals'
    },

    chapters: [
        {
            id: 'pyramid-and-what-to-test',
            title: 'The pyramid, and what is worth testing',
            importance: 'must-know',
            summary: 'Many fast tests, some integration tests, few end-to-end ones — and behaviour rather than implementation.',
            interviewAngle: '"What do you test?" is answered badly by "everything" and well by a policy.',
            buildsOn: [],
            blocks: [
                {
                    type: 'table',
                    title: 'The pyramid',
                    headers: ['Level', 'Share', 'Runs on', 'Speed', 'Tests'],
                    rows: [
                        ['Unit', '~70%', 'The JVM', 'Milliseconds', 'One class, dependencies faked'],
                        ['Integration', '~20%', 'JVM or device', 'Seconds', 'Several units together — a ViewModel and its repository'],
                        ['End-to-end', '~10%', 'A device', 'Minutes', 'A whole user journey through the UI']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The shape is a consequence of cost, not a rule handed down. A unit test tells you precisely what broke in milliseconds; an end-to-end test tells you something broke, after two minutes, and sometimes lies. Invert the pyramid and the suite becomes slow enough that people stop running it — which is the real failure, because an unrun test is worth less than no test at all.</p>'
                },
                {
                    type: 'types',
                    title: 'What earns a test',
                    items: [
                        { name: 'Logic with branches', html: '<p>Validation, state reduction (M34), pricing, date handling. Anything with an <code>if</code> is somewhere a bug can hide.</p>' },
                        { name: 'Anything you have already broken', html: '<p>A regression test at the moment of the fix is the cheapest test you will ever write, and it is the one that pays.</p>' },
                        { name: 'The boundaries', html: '<p>Empty lists, one item, a very long string, no network, a rejected permission (M17). Bugs cluster at the edges of the range, not in the middle.</p>' },
                        { name: 'Not: framework behaviour', html: '<p>Testing that Room stores a row tests Room. Test <em>your</em> query, and trust the library.</p>' },
                        { name: 'Not: getters and generated code', html: '<p>A test asserting that <code>copy</code> copies inflates coverage and proves nothing.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Testing implementation rather than behaviour is how a suite becomes a liability. A test asserting that the repository’s <code>fetch</code> was called once fails on every refactor that keeps the behaviour identical — so it costs maintenance and catches nothing. Assert on what the caller can observe: the state that came out, not the calls that happened inside.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Code coverage is a useful floor and a terrible target. It measures which lines ran, not whether anything was asserted — a test with no assertions covers plenty. Read a sudden <em>drop</em> as a signal; read a mandated 90% as an invitation to write tests for getters.</p>'
                }
            ],
            docs: [
                { title: 'Test apps on Android', path: '/training/testing/fundamentals', kind: 'guide' },
                { title: 'What to test', path: '/training/testing/fundamentals/what-to-test', kind: 'guide' },
                { title: 'Testing strategies', path: '/training/testing/fundamentals/strategies', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-unit-testing', questionId: 'what-is-unit-test' },
                { topicId: 'android-unit-testing', questionId: 'what-is-code-coverage' }
            ]
        },

        {
            id: 'test-doubles',
            title: 'Test doubles, named precisely',
            importance: 'must-know',
            summary: 'Dummy, fake, stub, spy and mock are five different things, and interviewers do ask.',
            interviewAngle: 'Most candidates call all five "mocks". Distinguishing them is a cheap way to sound careful.',
            buildsOn: ['pyramid-and-what-to-test'],
            blocks: [
                {
                    type: 'table',
                    title: 'The five',
                    headers: ['Double', 'Does', 'Asserted on?', 'Example'],
                    rows: [
                        ['Dummy', 'Nothing — it only fills a parameter', 'No', 'A logger the test never exercises'],
                        ['Stub', 'Returns canned answers', 'No', 'A repository that always returns one user'],
                        ['Fake', 'A real, simplified implementation', 'No', 'An in-memory repository backed by a map'],
                        ['Spy', 'Real behaviour, plus a record of calls', 'Sometimes', 'A real analytics client that also counts events'],
                        ['Mock', 'Programmed with expectations', 'Yes — the test verifies calls', '<code>verify(repo).refresh()</code>']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The line that matters runs between the first four and the last. A mock is the only one where the <em>interaction</em> is the thing under test — which is exactly the implementation coupling from the previous chapter. Everything else is scaffolding that lets you assert on the result.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A fake, and the mock it replaces',
                    code: `// Fake — a real implementation, simplified. Behaves like the thing it
// replaces, including emitting again after a write.
class FakeUserRepository : UserRepository {
    private val users = MutableStateFlow(emptyMap<String, User>())
    override fun observe(id: String) = users.map { it[id] }.filterNotNull()
    override suspend fun refresh(id: String) { users.update { it + (id to User(id)) } }

    // A test-only hook, which is the fake's real advantage.
    fun setFailure(e: Throwable) { … }
}

// Mock — the test now knows the ViewModel calls refresh(), which is a fact
// about the implementation, not about the behaviour.
val repo = mockk<UserRepository>()
coEvery { repo.refresh("42") } returns Unit
viewModel.onRefresh()
coVerify { repo.refresh("42") }`,
                    notes: 'A fake is written once and reused by every test of that dependency — which is why a <code>:core:testing</code> module (M38) pays for itself quickly.'
                },
                {
                    type: 'types',
                    title: 'When each is the right call',
                    items: [
                        { name: 'Prefer a fake', html: '<p>For anything with state or several methods — a repository, a data source, a clock. The test reads as a scenario rather than a script, and it does not break on refactors.</p>' },
                        { name: 'A mock is right', html: '<p>When the call <em>is</em> the behaviour: an analytics event was logged, a notification was posted, a payment was submitted exactly once. There is no result to assert on, so the interaction is the contract.</p>' },
                        { name: 'Mockito versus MockK', html: '<p>Mockito is the Java standard and needs <code>mockito-kotlin</code> plus the inline mock maker for final classes — Kotlin classes are final by default (M3). MockK is Kotlin-native and mocks coroutines, final classes and objects without ceremony. On a Kotlin codebase MockK is the lower-friction choice.</p>' },
                        { name: 'Never mock what you do not own', html: '<p>Mocking Retrofit or Room encodes your belief about how they behave. Use their own test support — a <code>MockWebServer</code>, an in-memory Room database — which encodes theirs.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Use test doubles in Android', path: '/training/testing/fundamentals/test-doubles', kind: 'guide' },
                { title: 'Testing strategies', path: '/training/testing/fundamentals/strategies', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-unit-testing', questionId: 'why-mockito-used' }
            ]
        },

        {
            id: 'environments',
            title: 'Where a test runs',
            importance: 'should-know',
            summary: 'The JVM, a device, or Robolectric’s simulation — with a real trade at each step.',
            interviewAngle: 'The Robolectric question is really "do you know what its results are worth?"',
            buildsOn: ['test-doubles'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'Local versus instrumented',
                    left: 'Local (src/test)',
                    right: 'Instrumented (src/androidTest)',
                    rows: [
                        { aspect: 'Runs on', left: 'Your machine’s JVM', right: 'A device or emulator' },
                        { aspect: 'Speed', left: 'Milliseconds', right: 'Seconds, plus install time' },
                        { aspect: 'Android framework', left: 'Stubbed — returns null or throws', right: 'The real thing' },
                        { aspect: 'Runs in CI', left: 'Free', right: 'Needs an emulator' },
                        { aspect: 'For', left: 'Logic, ViewModels, repositories', right: 'UI, Room migrations, permissions' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The default <code>android.jar</code> on the local classpath is stubbed — every method throws — which is why calling <code>Uri.parse</code> in a unit test fails with a mystifying "not mocked" error. That is the platform pushing you toward keeping Android types out of testable code, which is the M32 dependency rule arriving as an error message.</p>'
                },
                {
                    type: 'types',
                    title: 'Robolectric, and what it is worth',
                    items: [
                        { name: 'What it does', html: '<p>Provides a working implementation of the Android framework on the JVM, so an <code>Activity</code>, a <code>Context</code> and resources all behave without a device.</p>' },
                        { name: 'What it buys', html: '<p>Framework-dependent tests at close to unit-test speed, and in CI with no emulator. For code that must touch a <code>Context</code>, this is the pragmatic middle.</p>' },
                        { name: 'What it costs', html: '<p>It is a reimplementation, so it can disagree with a real device — and a passing Robolectric test is evidence, not proof. It is slower than a plain JVM test, and it can lag new API levels.</p>' },
                        { name: 'The honest position', html: '<p>Design so that most code needs no framework at all; reach for Robolectric where that is genuinely impossible; keep real-device tests for the things that must be true on hardware.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'JUnit structure, and the rule mechanism',
                    code: `class PriceCalculatorTest {

    @get:Rule val instantTask = InstantTaskExecutorRule()   // LiveData, synchronously

    private lateinit var calculator: PriceCalculator

    @Before fun setUp() { calculator = PriceCalculator(FakeRates()) }

    @Test fun \`applies the discount above the threshold\`() {
        val result = calculator.total(items, coupon = "SAVE10")
        assertThat(result).isEqualTo(Money(90))
    }

    @Test(expected = IllegalArgumentException::class)
    fun \`rejects a negative quantity\`() { calculator.total(negativeItems) }
}`,
                    notes: 'A JUnit4 <code>Rule</code> wraps every test in the class — set-up and tear-down as a reusable object. <code>MainDispatcherRule</code> in M40 is the one you will write yourself.'
                },
                {
                    type: 'tip',
                    html: '<p>Kotlin lets test names be backtick-quoted sentences. Use it — <code>`emits an error when the network fails`</code> reads as a specification, and a failure report becomes a list of things that are not true rather than a list of camel-case identifiers.</p>'
                }
            ],
            docs: [
                { title: 'Build local unit tests', path: '/training/testing/local-tests', kind: 'guide' },
                { title: 'Robolectric', path: '/training/testing/local-tests/robolectric', kind: 'guide' },
                { title: 'Build instrumented tests', path: '/training/testing/instrumented-tests', kind: 'guide' },
                { title: 'JUnit4 rules with AndroidX Test', path: '/training/testing/instrumented-tests/androidx-test-libraries/rules', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-unit-testing', questionId: 'what-is-robolectric' },
                { topicId: 'android-unit-testing', questionId: 'disadvantages-of-robolectric' },
                { topicId: 'android-unit-testing', questionId: 'what-is-instrumented-test' }
            ]
        }
    ]
};
