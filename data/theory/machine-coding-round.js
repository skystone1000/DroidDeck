/* ==========================================================================
   M45 — The machine coding round.

   Opens the practical half of the synthesis track. M44 was algorithms without
   Android; M47 is system design without building. This is the round where you
   build, watched, on a clock.

   Holds the tier-4 drills itself rather than deferring them to M48: they are
   about the extend/review formats, and a format is best drilled where it is
   explained.

   docHub note: there is no first-party page for interview rounds, so it takes
   the architecture recommendations page — the nearest first-party statement of
   what "well structured" means here, per §9.
   ========================================================================== */

const machineCodingRoundModule = {
    id: 'machine-coding-round',
    trackId: 'synthesis',
    order: 45,
    title: 'The Machine Coding Round',
    tagline: 'Fifty minutes, a shared screen, and a feature that has to run.',
    estimatedMinutes: 30,
    prerequisites: ['ui-state'],
    docHub: {
        title: 'Architecture recommendations',
        path: '/topic/architecture/recommendations'
    },

    chapters: [
        {
            id: 'the-format',
            title: 'What the round actually is',
            importance: 'must-know',
            summary: 'One or two screens, built from scratch or extended, in 45–60 minutes with someone watching.',
            interviewAngle: 'The round most candidates prepare for last, and the one that eliminates most of them.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Everything in the previous seven tracks is answered in words. This round is not. An interviewer shares a link and says: <em>fetch this endpoint, show it in a list, handle the errors — you have fifty minutes.</em> What is being tested is not whether you know what a <code>StateFlow</code> is. It is whether the knowledge has been compiled down far enough that a state holder, a loading branch and an error branch leave your fingers without a lookup, under observation, on a clock.</p>'
                },
                {
                    type: 'table',
                    title: 'The three formats',
                    headers: ['Format', 'What you are given', 'What is scored'],
                    rows: [
                        ['Build from scratch', 'An empty project and an API URL', 'Structure, state modelling, edge cases'],
                        ['Extend a codebase', 'Working code, plus a feature request', 'Whether you fit in or fight the existing design'],
                        ['Review and debug', 'Code with something wrong in it', 'Whether you can name a fault precisely']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Build-from-scratch is the common one and the rest of this module assumes it. The live version runs 45–60 minutes over a screen share; the take-home version gives you between one and seven days and is scored differently — there, tests and a README are expected, and their absence is the finding.</p>'
                },
                {
                    type: 'types',
                    title: 'Three things that are not obvious until you have sat one',
                    items: [
                        {
                            name: 'The clock is spent before you notice',
                            html: '<p>A Gradle sync on an unfamiliar machine, a dependency-injection setup and a theme fiddle is thirty minutes, and thirty minutes is most of the round. Preparation should be reducing fixed setup cost, not adding capability.</p>',
                            whenToUse: 'Which is why M46 exists, and why it is one memorised skeleton rather than twenty examples.'
                        },
                        {
                            name: 'Some rounds forbid dependencies',
                            html: '<p>A shared sandbox with no network means no Retrofit, no Coil, no Moshi — no Gradle sync at all. <code>HttpURLConnection</code>, <code>org.json</code> and a manual dispatcher hop have to be drilled separately, because a candidate fluent only in Retrofit is mute without it.</p>',
                            whenToUse: 'Ask which it is in the first minute. It changes what you type.'
                        },
                        {
                            name: 'Unfinished but explained beats finished and silent',
                            html: '<p>The published criteria are structure, edge cases and <strong>communication of decisions</strong>. Saying "I am faking the API for now so the state machine is visible — swapping in Retrofit is one file" scores better than twenty silent minutes spent on real networking.</p>',
                            whenToUse: 'Every time you take a shortcut. A narrated shortcut is a decision; a silent one is a gap.'
                        }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>The commonest way to fail is not writing bad code. It is running out of time with nothing that runs, because the first twenty-five minutes went on Hilt modules, a navigation graph and a colour scheme for a screen that never rendered. Ship a vertical slice, then deepen it.</p>'
                }
            ],
            docs: [
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' },
                { topicId: 'android-architecture', questionId: 'arch-mvvm' }
            ]
        },

        {
            id: 'the-rubric',
            title: 'What is actually being marked',
            importance: 'must-know',
            summary: 'Ten lines. Every drill in M46–M48 is scored against exactly these.',
            interviewAngle: 'Knowing the rubric changes what you build first, which is most of the advantage.',
            buildsOn: ['the-format'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Interviewers rarely publish a scoring sheet, but the reported criteria converge, and they converge on structure rather than completeness. These ten lines are the rubric this section uses. Score yourself against them after every drill, and write down which line you missed — the pattern in the misses is worth more than the drills themselves.</p>'
                },
                {
                    type: 'types',
                    title: 'The ten lines',
                    items: [
                        { name: '1. It runs', html: '<p>A screen that compiles and shows something beats a richer design that does not. Nothing else on this list scores if this one does not.</p>' },
                        { name: '2. One state type', html: '<p>There is a single <code>UiState</code>, and the UI is a <code>when</code> over it. Three independent booleans for loading, error and content can express states that cannot exist, and eventually will.</p>' },
                        { name: '3. Loading, error and empty are all handled', html: '<p>The single commonest omission, and the easiest mark on the page. Empty is the one people forget: a successful response with zero results is not an error.</p>' },
                        { name: '4. The wrong thread is never touched', html: '<p>Suspend functions do the work, the dispatcher hop lives in the data layer (M28), and cancellation is not leaked when the screen goes away.</p>' },
                        { name: '5. Rotation does not lose the screen', html: '<p>State lives in the <code>ViewModel</code> (M33), not in the composable. If it must survive process death, say <code>SavedStateHandle</code> out loud even if you do not wire it.</p>' },
                        { name: '6. Data sits behind an interface', html: '<p>Even when the implementation is a hardcoded list. The repository boundary (M26) is what makes the fake swappable, and it costs four lines.</p>' },
                        { name: '7. The ViewModel has no Android imports', html: '<p>No <code>Context</code>, no <code>Toast</code>, no <code>Log</code> if you can help it. This is the fastest legible signal that you know where the boundary is.</p>' },
                        { name: '8. Names are boring and correct', html: '<p><code>ItemRepository</code>, <code>loadItems()</code>, <code>UiState.Error</code>. Cleverness in naming reads as inexperience under time pressure.</p>' },
                        { name: '9. Something is left seam-shaped for a test', html: '<p>You will not write tests live and you are not expected to. Being able to point at the seam — "inject the dispatcher and this ViewModel is testable" — earns the mark that writing them would have.</p>' },
                        { name: '10. All of the above was said out loud', html: '<p>At the moment you decided it, not in a summary at the end.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Line 10 is the one candidates skip and interviewers weight. A silent forty-five minutes produces a code sample, and a code sample can be judged in two minutes without you. The round is expensive because they want to hear the reasoning; withholding it wastes the format.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Narrate in decisions, not in actions. "Now I am making a data class" is noise. "I am modelling state as a sealed interface so the UI can be a single <code>when</code> and impossible combinations do not compile" is the thing being scored, and it takes the same four seconds.</p>'
                }
            ],
            docs: [
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'UI layer', path: '/topic/architecture/ui-layer', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-mvvm' },
                { topicId: 'jetpack-compose', questionId: 'compose-unidirectional-data-flow' },
                { topicId: 'jetpack-compose', questionId: 'compose-state-hoisting' }
            ]
        },

        {
            id: 'spending-the-clock',
            title: 'Spending the clock',
            importance: 'must-know',
            summary: 'A fifty-minute budget, what to fake, and what to say while you fake it.',
            interviewAngle: 'Having a budget at all is visible from the outside, and reads as having done this before.',
            buildsOn: ['the-rubric'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The first five minutes decide the round. Spent on questions they buy you a scoped problem; spent typing they buy you a feature nobody asked for. Ask what the API returns, whether third-party libraries are allowed, whether they want Compose or Views, and what they would like to see working if time runs short.</p>'
                },
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'Fifty minutes, roughly',
                    code: `0–4    Scope it.       What does the endpoint return? Libraries
                       allowed? Compose or Views? What matters most
                       if I run out of time? Repeat the scope back.

4–12   The spine.      Model, fake source, repository interface,
                       UiState, ViewModel, screen. Runs against the
                       FAKE. Say: "real network next, this proves
                       the state machine." (M46)

12–20  Make it real.   Swap the fake for the actual call. Errors
                       mapped at the repository boundary, not
                       thrown at the UI.

20–35  The ask.        Whatever the drill actually was — search,
                       pagination, the cart, the detail screen.
                       This is the part being marked as "the task".

35–45  Edges.          Empty result. Failure and retry. Rotation.
                       Rapid input. Say each one as you cover it.

45–50  Talk.           What you cut, what you would do next, where
                       the test seam is. Do not start anything new.

If you are behind at minute 20, cut the ask down, do not cut the edges.
A narrow feature with handled failures outscores a wide one without.`,
                    notes: 'The timings are a shape, not a script. Their value is that you can say which phase you are in, which lets the interviewer steer you without interrupting.'
                },
                {
                    type: 'types',
                    title: 'What to fake, and what never to fake',
                    items: [
                        { name: 'Fake the network first', html: '<p>A <code>FakeItemApi</code> that returns a list after a <code>delay(600)</code> gives you loading, content and — by flipping a flag — error, in six lines. Build the whole screen against it, then swap.</p>', whenToUse: 'Always. It is also the test seam from rubric line 9.' },
                        { name: 'Fake the dependency graph', html: '<p>Construct the ViewModel by hand or with a tiny factory. Hilt in a fifty-minute round is a bet that setup goes perfectly, against a payoff of zero marks.</p>', whenToUse: 'Unless the starter project already has DI wired, in which case use it.' },
                        { name: 'Fake the design', html: '<p>Default Material theme, one <code>Text</code> per row. Nobody has ever lost this round for ugly spacing.</p>', whenToUse: 'Always, unless the prompt is explicitly about UI.' },
                        { name: 'Never fake the state model', html: '<p>The state type, the error path and the threading are the round. Shortcut those and there is nothing left to mark.</p>', whenToUse: 'No exceptions.' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Do not start by wiring the real API. It is the part most likely to break in a way you cannot debug quickly — a wrong base URL, a serialiser mismatch, a missing internet permission in the manifest — and it fails <em>before</em> anything renders, so the interviewer watches you debug an empty screen for fifteen minutes. Against a fake, the same failure arrives with the whole UI already working around it.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Say "I am going to leave this as a TODO and come back if there is time" out loud, and then actually leave a <code>// TODO</code>. It converts an omission into a scoped decision, and it is the cheapest mark in the round.</p>'
                }
            ],
            docs: [
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' },
                { title: 'Data layer', path: '/topic/architecture/data-layer', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'design-pattern', questionId: 'design-pattern-repository' },
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' }
            ]
        },

        {
            id: 'extend-and-review',
            title: 'The other two formats',
            importance: 'should-know',
            summary: 'Extending someone else’s code, and being handed something broken on purpose.',
            interviewAngle: 'Both are cheaper for the interviewer to run, so both are increasingly common.',
            buildsOn: ['spending-the-clock'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>When the round starts from existing code, the first instinct — rewrite it the way you would have written it — is the wrong one. What is being tested is whether you can work inside a design you did not choose. Read first, ask what the constraints were, and make the smallest change that fits the codebase’s existing shape. If the shape is genuinely wrong, say so as an observation with a cost attached, then work within it anyway unless invited not to.</p>'
                },
                {
                    type: 'comparison',
                    title: 'From scratch vs. from a codebase',
                    left: 'From scratch',
                    right: 'From a codebase',
                    rows: [
                        { aspect: 'First five minutes', left: 'Ask about scope', right: 'Read, then ask about constraints' },
                        { aspect: 'Good structure means', left: 'The structure you chose', right: 'The structure already there' },
                        { aspect: 'The trap', left: 'Over-engineering the setup', right: 'Rewriting instead of extending' },
                        { aspect: 'Bonus marks', left: 'Naming a test seam', right: 'Noticing a fault you were not asked about' },
                        { aspect: 'Cutting scope', left: 'Narrow the feature', right: 'Narrow the refactor, never the feature' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The review format is the same skill inverted: given a file with something wrong in it, name the fault precisely. "This leaks" is worth little; "the listener holds the Activity and is never removed in <code>onDestroy</code>, so the Activity survives rotation and the leak compounds" is the answer. Precision about <em>mechanism</em> is what separates the two.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The code you are handed — drill 21',
                    code: `class FeedActivity : AppCompatActivity() {

    companion object {
        // Handed to you exactly like this.
        var cached: FeedActivity? = null
    }

    private val listener = object : LocationManager.Listener {
        override fun onLocation(lat: Double, lng: Double) {
            findViewById<TextView>(R.id.here).text = "$lat, $lng"
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_feed)
        cached = this
        LocationManager.register(listener)

        Thread {
            val feed = FeedApi.loadBlocking()          // 2s on a bad network
            findViewById<RecyclerView>(R.id.list).adapter = FeedAdapter(feed)
        }.start()
    }
}`,
                    notes: 'There are four faults here, and they are not equally serious. Rank them before you fix them — the ranking is half of what is being marked.'
                },
                {
                    type: 'drill',
                    id: 'fix-the-leak',
                    tier: 4,
                    title: 'Find and fix the leak',
                    minutes: 20,
                    prompt: '<p>Using the <code>FeedActivity</code> above: list every fault you can find, rank them by severity, then fix them. State which single fix you would make if you only had time for one, and why.</p><p>Say what each fault costs in production — a leaked Activity is a few megabytes and a growing one; a view touched off the main thread is a crash that may not reproduce on your device.</p>',
                    watchFor: [
                        'Fixing the <code>static</code> reference and stopping — the unregistered listener leaks too',
                        'Missing that the background thread touches views off the main thread',
                        'Missing that the thread outlives the Activity and holds it through <code>findViewById</code>',
                        'Saying "use a ViewModel" without naming which fault that fixes'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// Ranked, worst first:
//
// 1. Thread touches views. Not a leak — a crash (CalledFromWrongThreadException),
//    and a silent one if the Activity is gone by then. Fix first: it is a
//    correctness bug, the rest are resource bugs.
// 2. The Thread's lambda captures 'this' via findViewById, so a 2s network call
//    pins the Activity across rotation. Cancellable scope, not a raw Thread.
// 3. companion object holds an Activity forever. One rotation leaks the whole
//    view tree; it never gets collected because the companion outlives it.
// 4. Listener registered and never unregistered. Leaks per-Activity-instance.

class FeedActivity : AppCompatActivity() {

    private val viewModel: FeedViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_feed)

        // 1 + 2: work suspends, results arrive on the main thread, and the
        // scope dies with the ViewModel — so nothing outlives the screen.
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect { render(it) }
            }
        }

        // 4: paired registration, scoped to the observed lifecycle.
        lifecycle.addObserver(LocationObserver(::onLocation))
    }
}

// 3: deleted. If another screen needs this data, it belongs in a repository,
// not in a static handle on a UI object.

// If I could only fix one: number 1. A crash beats a leak — users see it,
// and leaks at least degrade gracefully until they do not.`
                    }
                },
                {
                    type: 'drill',
                    id: 'refactor-god-activity',
                    tier: 4,
                    title: 'Refactor the God Activity',
                    minutes: 40,
                    prompt: '<p>You are handed a 400-line Activity that inflates views, calls Retrofit directly, parses JSON, caches in a <code>HashMap</code>, and holds a <code>Boolean</code> for every UI state. The ask: <em>add a pull-to-refresh, and leave the code better than you found it.</em></p><p>Do the feature. Refactor only the parts the feature touches, and say out loud which parts you are deliberately leaving alone.</p>',
                    watchFor: [
                        'Starting a full rewrite and shipping nothing',
                        'Refactoring code the feature never touches',
                        'Moving the Retrofit call into a ViewModel and calling it clean — the boundary is a repository interface',
                        'Not collapsing the loose booleans into one state type while you are in there'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// The order matters more than the destination. Each step leaves the app
// running, so you can stop anywhere and still have shipped the feature.
//
// 1. Add the feature the crude way first (5 min). It works. Now you have
//    something to demo if the clock beats you.
//
// 2. Extract the state. The booleans become one type — this is the single
//    highest-value move and it is mechanical:

sealed interface FeedUiState {
    data object Loading : FeedUiState
    data object Empty : FeedUiState
    data class Content(val items: List<Item>, val refreshing: Boolean) : FeedUiState
    data class Error(val message: String) : FeedUiState
}

// Note 'refreshing' rides inside Content: a pull-to-refresh keeps showing the
// old list. That is the modelling decision worth narrating.
//
// 3. Extract the data access to an interface. Implementation can stay ugly.

interface FeedRepository {
    suspend fun feed(forceRefresh: Boolean = false): List<Item>
}

// 4. Move the calls into a ViewModel, exposing StateFlow<FeedUiState>.
//    The Activity is now: observe, render, forward events.
//
// 5. Stop. Say: "the JSON parsing and the HashMap cache are next — I would
//    move the cache behind the repository so the ViewModel never learns it
//    exists — but they are not on the path of this feature."`
                    }
                },
                {
                    type: 'drill',
                    id: 'add-the-missing-test',
                    tier: 4,
                    title: 'Add the missing test',
                    minutes: 25,
                    prompt: '<p>Given a ViewModel that loads a list and exposes <code>StateFlow&lt;UiState&gt;</code>, write the tests for it: the success path, the error path, and the empty path. The repository is an interface; there is no mocking framework configured.</p><p>If the ViewModel is not testable as written, say what makes it untestable before you change anything.</p>',
                    watchFor: [
                        'Reaching for a mocking library when a hand-written fake is shorter',
                        'Not injecting the dispatcher, then fighting the main dispatcher in the test',
                        'Asserting on one emission when the assertion is about a sequence',
                        'Forgetting <code>runTest</code> and using <code>Thread.sleep</code>'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// Untestable-as-written, if it is: the ViewModel names Dispatchers.IO
// directly, so the test cannot control time. Inject it. That one change is
// the "test seam" from rubric line 9.

class FakeFeedRepository(
    private var result: Result<List<Item>> = Result.success(listOf(Item("1")))
) : FeedRepository {
    override suspend fun feed(forceRefresh: Boolean) = result.getOrThrow()
    fun failWith(e: Throwable) { result = Result.failure(e) }
    fun returns(items: List<Item>) { result = Result.success(items) }
}

@OptIn(ExperimentalCoroutinesApi::class)
class FeedViewModelTest {

    private val dispatcher = StandardTestDispatcher()

    @Before fun setUp() = Dispatchers.setMain(dispatcher)
    @After  fun tearDown() = Dispatchers.resetMain()

    @Test
    fun \`emits loading then content\`() = runTest {
        val repo = FakeFeedRepository()
        val vm = FeedViewModel(repo, dispatcher)

        val seen = mutableListOf<UiState>()
        val job = launch { vm.state.toList(seen) }

        vm.load()
        advanceUntilIdle()

        assertEquals(UiState.Loading, seen.first())
        assertTrue(seen.last() is UiState.Content)
        job.cancel()
    }

    @Test
    fun \`maps failure to error state\`() = runTest {
        val repo = FakeFeedRepository().apply { failWith(IOException("offline")) }
        val vm = FeedViewModel(repo, dispatcher)

        vm.load()
        advanceUntilIdle()

        assertTrue(vm.state.value is UiState.Error)
    }

    @Test
    fun \`empty response is Empty, not Content\`() = runTest {
        val repo = FakeFeedRepository().apply { returns(emptyList()) }
        val vm = FeedViewModel(repo, dispatcher)

        vm.load()
        advanceUntilIdle()

        assertEquals(UiState.Empty, vm.state.value)
    }
}`
                    }
                },
                {
                    type: 'drill',
                    id: 'review-this-diff',
                    tier: 4,
                    title: 'Review this diff',
                    minutes: 20,
                    prompt: '<p>A colleague submits a pull request: a new screen that loads a profile, using <code>GlobalScope.launch</code> for the call, <code>LiveData&lt;String&gt;</code> for an error message, <code>!!</code> on the response body, and a <code>lateinit var</code> for the repository set from the Activity.</p><p>Write the review. Separate what blocks the merge from what is a suggestion, and phrase each so the author knows what to change without being told they are wrong.</p>',
                    watchFor: [
                        'Listing style nits at the same weight as the correctness bugs',
                        'Missing that <code>GlobalScope</code> means the call outlives the screen and cannot be cancelled',
                        'Missing that an error as <code>LiveData&lt;String&gt;</code> replays on rotation and shows the toast twice',
                        'Reviewing the person rather than the change'
                    ],
                    sketch: {
                        language: 'text',
                        title: 'Solution sketch — try it first',
                        code: `BLOCKING

1. GlobalScope.launch — the request outlives the screen and nothing can
   cancel it. On a fast back-press it completes into a dead view. Use
   viewModelScope; it is cancelled for you.

2. body!! — a 204, an empty body or a parse failure is now a crash in
   production rather than an error state. Handle the null.

3. Error as LiveData<String> — LiveData replays its last value to a new
   observer, so rotating after a failure shows the error again. An error is
   an event, not state: SharedFlow, or state with an explicit "consumed".

SUGGESTIONS

4. lateinit var repository, assigned by the Activity, inverts the
   dependency: the ViewModel now depends on someone remembering. A
   constructor parameter makes it impossible to forget and makes the
   ViewModel testable in the same move.

5. Naming: loadData() -> loadProfile(). Small, but the file has three
   loadData()s in it now.

Phrasing note: 1–3 are "this will break in production, here is how";
4–5 are "consider". Saying which is which is the review skill. Everything
above is about the change, not about the author.`
                    }
                },
                {
                    type: 'tip',
                    html: '<p>In a review round, open with what the change does well before the faults. It is not politeness for its own sake — it demonstrates you read the whole change rather than pattern-matching on the first smell, and interviewers notice which of the two happened.</p>'
                }
            ],
            docs: [
                { title: 'Avoid memory leaks', path: '/topic/performance/memory', kind: 'guide' },
                { title: 'Test your app', path: '/training/testing', kind: 'guide' },
                { title: 'Testing coroutines', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-test/', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-find-memory-leaks' },
                { topicId: 'android', questionId: 'android-memory-leak-vs-oom' },
                { topicId: 'android-unit-testing', questionId: 'unit-testing-viewmodel-flow-stateflow' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-unit-testing-viewmodel' },
                { topicId: 'kotlin', questionId: 'kotlin-coroutine-scopes-android' }
            ]
        }
    ]
};
