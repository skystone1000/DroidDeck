/* ==========================================================================
   M47 — Feature drills.

   The twelve screen-shaped tasks, drills 1–12. Each one is the M46 spine plus
   a delta, so the chapters teach the delta and the drill asks for it under a
   clock.

   Chapters 1–2 are must-know because they hold the tier-1 drills: cram mode
   should reduce this module to the five tasks that actually carry the round.

   docHub: the UI layer guide — the layer every drill here lands in.
   ========================================================================== */

const featureDrillsModule = {
    id: 'feature-drills',
    trackId: 'synthesis',
    order: 47,
    title: 'Feature Drills',
    tagline: 'Twelve screens, each one the spine plus a delta.',
    estimatedMinutes: 45,
    prerequisites: ['machine-coding-spine'],
    docHub: {
        title: 'UI layer',
        path: '/topic/architecture/ui-layer'
    },

    chapters: [
        {
            id: 'the-core-loop',
            title: 'The core loop — list, search, pagination',
            importance: 'must-know',
            summary: 'The three that arrive most often, frequently as one prompt.',
            interviewAngle: 'A round that is not one of these three is unusual, and they compose.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>These three are the round. Individually they are forty minutes each; together — <em>"search this API, paginate the results, handle errors"</em> — they are a single common prompt, and the reason the spine is worth memorising is that the three share five of their six files.</p>'
                },
                {
                    type: 'drill',
                    id: 'list-from-api',
                    tier: 1,
                    title: 'Fetch an endpoint and render a list',
                    minutes: 45,
                    prompt: '<p>Given a public JSON endpoint returning a list of objects, show them in a scrollable list. Handle loading, error with a retry, and an empty result. Survive rotation.</p><p>Build against a fake first, then swap in the real call. Narrate the swap.</p>',
                    watchFor: [
                        'No empty state — a successful response with zero results is not an error',
                        'State as three independent booleans instead of one sealed type',
                        'The network call started from the composable rather than the <code>ViewModel</code>',
                        'No <code>key</code> on the list items'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// This drill IS the spine (M46). The only thing added is the real call,
// and it goes behind the interface the fake already satisfies:

interface ItemApi {
    @GET("items")
    suspend fun items(): List<ItemDto>          // Retrofit
}

class RemoteItemApi(private val service: ItemService) : ItemApi {
    override suspend fun items(): List<Item> =
        service.items().map { it.toItem() }     // DTO -> domain at the edge
}

// The DTO mapping is the detail people skip and interviewers notice: the
// network shape must not reach the UI, or a renamed JSON field becomes a
// change in the composable.

// Wiring, spoken aloud: "constructor injection, so Hilt later is annotations
// rather than restructuring."
val repository = DefaultItemRepository(RemoteItemApi(service))

// Order of work, if the clock is tight:
//   1. Spine against FakeItemApi          -> runs at minute 12
//   2. Real call behind the same interface -> runs at minute 20
//   3. Empty + error + retry               -> the marks
//   4. Rotation check                      -> say it, then rotate to prove it`
                    }
                },
                {
                    type: 'drill',
                    id: 'debounced-search',
                    tier: 1,
                    title: 'Instant search, debounced',
                    minutes: 40,
                    prompt: '<p>Add a search field over that endpoint. Query as the user types, without firing a request per keystroke, and without a slow response to an old query ever overwriting a newer one.</p><p>Show a distinct "no results for <em>x</em>" state, and do not fire a request for an empty query.</p>',
                    watchFor: [
                        '<code>debounce</code> without <code>flatMapLatest</code> — the stale-result bug survives',
                        'Firing a request on an empty or whitespace query',
                        'Re-querying when the text is unchanged (missing <code>distinctUntilChanged</code>)',
                        'Losing the query text on rotation'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// The operator chain is in M46. What that chapter does not show is the
// empty-query branch, which is where this drill is usually lost:

@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
val state: StateFlow<UiState> = query
    .debounce { if (it.isBlank()) 0 else 300 }   // clearing the box is instant
    .distinctUntilChanged()
    .flatMapLatest { q ->
        if (q.isBlank()) {
            flowOf(UiState.Idle)                 // not Loading, not Empty
        } else {
            flow {
                emit(UiState.Loading)
                val items = repository.items(q)
                emit(
                    if (items.isEmpty()) UiState.NoResults(q)
                    else UiState.Content(items)
                )
            }.catch { emit(UiState.Error(it.message ?: "Search failed")) }
        }
    }
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UiState.Idle)

// Three states the naive version collapses into one: Idle (nothing typed),
// NoResults (typed, searched, nothing found), Empty (the unfiltered list is
// itself empty). Distinguishing them is most of the mark here.

// The query text itself belongs in SavedStateHandle if it must survive
// process death — say that even if you leave it in the ViewModel.`
                    }
                },
                {
                    type: 'prose',
                    html: '<p>Pagination is where a candidate’s instinct for cheap recomposition shows. The naive end-of-list check reads scroll position in the composable body, which recomposes on every scrolled pixel; the correct one wraps it in <code>derivedStateOf</code> so recomposition happens when the <em>answer</em> changes, not when the input does (M19, M22).</p>'
                },
                {
                    type: 'drill',
                    id: 'pagination',
                    tier: 1,
                    title: 'Infinite scroll',
                    minutes: 40,
                    prompt: '<p>The endpoint takes <code>?page=</code> and returns a fixed page size. Load the next page as the user nears the bottom, showing a spinner at the end of the list while it loads.</p><p>Stop cleanly at the last page, never issue two requests for the same page, and keep what is already on screen when a page fails.</p>',
                    watchFor: [
                        'Reading scroll state in the composable body without <code>derivedStateOf</code>',
                        'No in-flight guard — a fast scroll fires the same page three times',
                        'A page failure clearing the list instead of appending an inline retry',
                        'No end-reached flag, so it requests page 40 of 12 forever'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// State grows two fields. Both are about REQUESTS, not about data, which is
// why they live beside the items rather than inside Content.
data class ListState(
    val items: List<Item> = emptyList(),
    val page: Int = 0,
    val loadingMore: Boolean = false,
    val endReached: Boolean = false,
    val pageError: String? = null
)

fun loadNextPage() {
    if (state.value.loadingMore || state.value.endReached) return   // the guard
    viewModelScope.launch {
        _state.update { it.copy(loadingMore = true, pageError = null) }
        try {
            val next = repository.items(page = state.value.page + 1)
            _state.update {
                it.copy(
                    items = it.items + next,
                    page = it.page + 1,
                    endReached = next.size < PAGE_SIZE,   // short page = last page
                    loadingMore = false
                )
            }
        } catch (e: Exception) {
            // Keep what is on screen. A failed page 3 must not lose pages 1–2.
            _state.update { it.copy(loadingMore = false, pageError = e.message) }
        }
    }
}

// In the screen — derivedStateOf is the whole point:
val listState = rememberLazyListState()
val loadMore by remember {
    derivedStateOf {
        val last = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
        last >= state.items.lastIndex - PREFETCH_DISTANCE
    }
}
LaunchedEffect(loadMore) { if (loadMore) viewModel.loadNextPage() }

// Say out loud: "Paging 3 does all of this, plus placeholders and a
// RemoteMediator for the offline case. Hand-rolling it here because wiring
// Paging costs more of the fifty minutes than it demonstrates."`
                    }
                },
                {
                    type: 'pitfall',
                    html: '<p>Do not attempt Paging 3 live unless you have wired it more than once. It is the right answer in production and a poor bet in a fifty-minute round: <code>PagingSource</code>, <code>Pager</code>, <code>collectAsLazyPagingItems</code> and the load-state plumbing is a lot of surface to get wrong, and a broken Paging setup demonstrates less than a working hand-rolled one. Name it, justify not using it, move on.</p>'
                }
            ],
            docs: [
                { title: 'UI layer', path: '/topic/architecture/ui-layer', kind: 'guide' },
                { title: 'Lists and grids', path: '/develop/ui/compose/lists', kind: 'guide' },
                { title: 'Paging 3 overview', path: '/topic/libraries/architecture/paging/v3-overview', kind: 'guide' },
                { title: 'Side-effects in Compose', path: '/develop/ui/compose/side-effects', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-instant-search' },
                { topicId: 'android-libraries', questionId: 'android-rxjava-pagination' },
                { topicId: 'jetpack-compose', questionId: 'compose-derived-state-of' },
                { topicId: 'jetpack-compose', questionId: 'compose-performance-optimization' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-retrofit' }
            ]
        },

        {
            id: 'navigation-and-offline',
            title: 'A second screen, and surviving the network',
            importance: 'must-know',
            summary: 'List to detail with arguments, and Room as the single source of truth.',
            interviewAngle: 'The offline drill is the one that separates senior candidates, because it is a modelling question wearing a caching costume.',
            buildsOn: ['the-core-loop'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A second screen adds one genuinely new decision: what travels between them. Passing the whole object is the reflex and it is wrong — routes are strings, objects are not, and the detail screen usually needs fresher data than the list had anyway. Pass the id and re-read (M24).</p>'
                },
                {
                    type: 'drill',
                    id: 'detail-navigation',
                    tier: 1,
                    title: 'List to detail, surviving rotation',
                    minutes: 30,
                    prompt: '<p>Tapping a row opens a detail screen for that item. Back returns to the list with its scroll position intact. Rotating the detail screen keeps showing the same item without re-fetching it.</p><p>Say what you would do differently if the detail screen had to survive process death.</p>',
                    watchFor: [
                        'Passing the whole object through the route instead of its id',
                        'Reading the argument in the composable rather than through <code>SavedStateHandle</code>',
                        'Re-fetching on every recomposition because the load is not in an effect or an <code>init</code>',
                        'A shared <code>ViewModel</code> between list and detail "to save a fetch"'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `NavHost(navController, startDestination = "list") {

    composable("list") {
        ItemScreen(onItemClick = { id -> navController.navigate("detail/\${id}") })
    }

    composable(
        route = "detail/{itemId}",
        arguments = listOf(navArgument("itemId") { type = NavType.StringType })
    ) {
        DetailScreen()          // no arguments passed by hand — see below
    }
}

class DetailViewModel(
    savedStateHandle: SavedStateHandle,
    private val repository: ItemRepository
) : ViewModel() {

    // The argument arrives through SavedStateHandle, which means it also
    // survives process death for free. This is the line worth pointing at.
    private val itemId: String = checkNotNull(savedStateHandle["itemId"])

    val state: StateFlow<UiState> = flow {
        emit(UiState.Loading)
        emit(UiState.Content(repository.item(itemId)))
    }
        .catch { emit(UiState.Error(it.message ?: "Could not load")) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UiState.Loading)
}

// Scroll position: rememberLazyListState() inside the list composable is
// already saved across configuration change, and NavHost keeps the list
// entry alive on the back stack. Nothing to do — but say that you checked,
// because "nothing to do" and "did not think about it" look identical.`
                    }
                },
                {
                    type: 'prose',
                    html: '<p>Offline-first is the drill that reveals whether a candidate has an opinion about where truth lives. There is exactly one correct shape and it is worth being able to draw: the UI reads the database, never the network; the network writes into the database; refresh is a write, not a read (M29).</p>'
                },
                {
                    type: 'comparison',
                    title: 'Two ways to "add caching", one of which is right',
                    left: 'Cache-aside (common, wrong here)',
                    right: 'Database as source of truth',
                    rows: [
                        { aspect: 'The UI reads', left: 'The network, falling back to cache', right: 'The database, always' },
                        { aspect: 'Fresh data arrives by', left: 'The next screen open', right: 'A write, which the Flow re-emits' },
                        { aspect: 'Offline behaviour', left: 'A special case in the ViewModel', right: 'Identical to online' },
                        { aspect: 'Two screens open', left: 'Can disagree', right: 'Cannot disagree' },
                        { aspect: 'Code in the ViewModel', left: 'Branching on connectivity', right: 'None — it never learns' }
                    ]
                },
                {
                    type: 'drill',
                    id: 'offline-first-cache',
                    tier: 1,
                    title: 'Offline-first list',
                    minutes: 50,
                    prompt: '<p>The list must render instantly from local storage on a cold start with no network, then update itself when a refresh succeeds. A failed refresh shows a message without clearing what is on screen.</p><p>State what happens on a first-ever launch with no network and no cached rows.</p>',
                    watchFor: [
                        'The ViewModel branching on connectivity — it should never know',
                        'A refresh failure clearing the list',
                        'Replacing all rows on every refresh, which flickers the list and loses scroll position',
                        'No answer for the empty-cache-plus-no-network case'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `@Dao
interface ItemDao {
    @Query("SELECT * FROM items")
    fun observeAll(): Flow<List<ItemEntity>>            // the source of truth

    @Upsert
    suspend fun upsertAll(items: List<ItemEntity>)
}

class OfflineFirstItemRepository(
    private val dao: ItemDao,
    private val api: ItemApi
) : ItemRepository {

    // Reads NEVER touch the network. This is the whole design in one line.
    override fun items(): Flow<List<Item>> =
        dao.observeAll().map { rows -> rows.map(ItemEntity::toItem) }

    // Refresh is a WRITE. Its success reaches the UI through the Flow above,
    // so there is no second path for data and no way for them to disagree.
    override suspend fun refresh() {
        val remote = api.items()
        dao.upsertAll(remote.map(Item::toEntity))       // upsert, not replace:
    }                                                    // stable ids, no flicker
}

// The ViewModel then has a state that carries BOTH:
data class UiState(
    val items: List<Item> = emptyList(),
    val refreshing: Boolean = false,
    val message: String? = null      // "Showing saved results" on a failure
)

// First launch, no network, empty cache: items is empty and refresh threw.
// That is the Empty state WITH an error message attached — not a blank
// screen, and not an error screen that hides a cache you do not have.
// Being asked this and having an answer is most of the drill.`
                    }
                },
                {
                    type: 'tip',
                    html: '<p>Draw the arrows before you type: <em>UI ← database ← network</em>, one direction, with refresh as an arrow into the database rather than into the UI. Interviewers ask this drill precisely because the diagram is short and most candidates cannot draw it.</p>'
                }
            ],
            docs: [
                { title: 'Navigation', path: '/guide/navigation', kind: 'guide' },
                { title: 'Build an offline-first app', path: '/topic/architecture/data-layer/offline-first', kind: 'guide' },
                { title: 'Save UI states', path: '/topic/libraries/architecture/saving-states', kind: 'guide' },
                { title: 'Room', path: '/training/data-storage/room', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-navigation' },
                { topicId: 'jetpack-compose', questionId: 'compose-remember-vs-saveable' },
                { topicId: 'android', questionId: 'android-save-restore-instance-state' },
                { topicId: 'android-system-design', questionId: 'design-offline-first-app' },
                { topicId: 'android-system-design', questionId: 'data-syncing-unstable-networks' },
                { topicId: 'other-topics', questionId: 'have-you-used-room' }
            ]
        },

        {
            id: 'state-shaped-screens',
            title: 'Screens that are really state machines',
            importance: 'should-know',
            summary: 'The cart, the form and the quiz — no network, all modelling.',
            interviewAngle: 'These arrive when the interviewer wants to see state discipline without the network in the way.',
            buildsOn: ['navigation-and-offline'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Three prompts with no networking in them at all. That is deliberate on the interviewer’s part: with the API removed, the only thing left to judge is how you model changing state — which is what they wanted to see in the first place.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>All three share one rule: <strong>derive everything you can</strong>. A cart total, a form’s validity and a quiz score are all functions of state, not state. Storing them creates two sources of truth and a bug that appears the first time one is updated without the other.</p>'
                },
                {
                    type: 'drill',
                    id: 'shopping-cart',
                    tier: 2,
                    title: 'Shopping cart',
                    minutes: 35,
                    prompt: '<p>A product list with an "Add" button per row, and a cart screen showing lines with quantity steppers and a running total. Decrementing to zero removes the line. Show the item count on the cart icon.</p><p>Prices are integers in the smallest currency unit — say why that matters.</p>',
                    watchFor: [
                        'Storing the total as state instead of deriving it',
                        'A <code>MutableList</code> mutated in place, so Compose never recomposes',
                        'Quantity going negative',
                        'Money as <code>Double</code>'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// One immutable state. Totals are computed properties: impossible to
// desynchronise, and free to recompute for a cart this size.
data class CartState(
    val lines: Map<String, CartLine> = emptyMap()
) {
    val itemCount: Int get() = lines.values.sumOf { it.quantity }
    val subtotalCents: Int get() = lines.values.sumOf { it.item.priceCents * it.quantity }
}

data class CartLine(val item: Item, val quantity: Int)

class CartViewModel : ViewModel() {

    private val _state = MutableStateFlow(CartState())
    val state: StateFlow<CartState> = _state.asStateFlow()

    fun add(item: Item) = changeQuantity(item, +1)
    fun remove(item: Item) = changeQuantity(item, -1)

    private fun changeQuantity(item: Item, delta: Int) {
        _state.update { current ->
            val quantity = (current.lines[item.id]?.quantity ?: 0) + delta
            val lines =
                if (quantity <= 0) current.lines - item.id            // zero removes
                else current.lines + (item.id to CartLine(item, quantity))
            current.copy(lines = lines)                                // new map, always
        }
    }
}

// Money as Int in cents, not Double: 0.1 + 0.2 != 0.3 in binary floating
// point, and a cart that is one cent off is a bug report. Say this — it is a
// one-sentence answer that reads as production experience.

// 'update' rather than 'value =': it is a compare-and-set loop, so two
// rapid taps cannot lose one another.`
                    }
                },
                {
                    type: 'drill',
                    id: 'form-validation',
                    tier: 2,
                    title: 'Sign-up form with validation',
                    minutes: 30,
                    prompt: '<p>Email, password and confirm-password. Validate email format, a minimum password length, and that the two passwords match. The submit button is disabled until the form is valid.</p><p>Errors must not appear while a field is still being typed for the first time.</p>',
                    watchFor: [
                        'Showing "invalid email" on the first keystroke',
                        'Validity stored as a field rather than derived',
                        'Validation logic in the composable',
                        'No trimming, so a trailing space fails a valid email'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `data class FormState(
    val email: String = "",
    val password: String = "",
    val confirm: String = "",
    val touched: Set<Field> = emptySet(),      // which fields have been left
    val submitting: Boolean = false
) {
    // Derived. The rules live in one place and the UI just reads them.
    val emailError: String?
        get() = when {
            email.isBlank() -> "Email is required"
            !Patterns.EMAIL_ADDRESS.matcher(email.trim()).matches() -> "Not a valid email"
            else -> null
        }

    val passwordError: String?
        get() = if (password.length < 8) "At least 8 characters" else null

    val confirmError: String?
        get() = if (confirm != password) "Passwords do not match" else null

    val isValid: Boolean
        get() = emailError == null && passwordError == null && confirmError == null

    // The timing rule: an error is SHOWN only after the field was touched.
    fun visibleError(field: Field): String? =
        if (field in touched) errorFor(field) else null
}

// In the screen:
OutlinedTextField(
    value = state.email,
    onValueChange = viewModel::onEmailChange,
    isError = state.visibleError(Field.Email) != null,
    supportingText = { state.visibleError(Field.Email)?.let { Text(it) } }
)
Button(onClick = viewModel::submit, enabled = state.isValid && !state.submitting) {
    Text("Create account")
}

// Separating "is invalid" from "should show the error" is the whole drill.
// One is about the data, the other is about the user's attention.`
                    }
                },
                {
                    type: 'drill',
                    id: 'quiz-flow',
                    tier: 2,
                    title: 'Multi-step quiz',
                    minutes: 35,
                    prompt: '<p>Ten questions, one per screen, four options each. Next is disabled until an option is chosen; back returns to the previous question with the earlier answer still selected. The last screen shows the score.</p><p>Rotation at question seven must not restart the quiz.</p>',
                    watchFor: [
                        'The current index kept in the composable',
                        'The score accumulated as questions are answered rather than derived at the end',
                        'Back re-enabling an already-answered question but losing the answer',
                        'Off-by-one on the last question — "Next" instead of "Finish"'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `data class QuizState(
    val questions: List<Question>,
    val answers: Map<Int, Int> = emptyMap(),   // question index -> chosen option
    val current: Int = 0,
    val finished: Boolean = false
) {
    val question: Question get() = questions[current]
    val selected: Int? get() = answers[current]
    val canAdvance: Boolean get() = selected != null
    val isLast: Boolean get() = current == questions.lastIndex

    // Derived at the end from the answers. Never accumulated on the way
    // through — that is how a back-then-change silently keeps the old point.
    val score: Int
        get() = answers.count { (index, chosen) -> questions[index].correct == chosen }
}

fun select(option: Int) = _state.update { it.copy(answers = it.answers + (it.current to option)) }
fun next() = _state.update {
    if (it.isLast) it.copy(finished = true) else it.copy(current = it.current + 1)
}
fun back() = _state.update { it.copy(current = (it.current - 1).coerceAtLeast(0)) }

// All of this lives in the ViewModel, so rotation is free. If it must
// survive process death, the answers map and the index go into
// SavedStateHandle — say it even if you do not wire it.`
                    }
                },
                {
                    type: 'pitfall',
                    html: '<p>The commonest failure in all three is a mutable collection held in state. <code>val items = mutableListOf&lt;Item&gt;()</code> mutated with <code>add()</code> keeps the same reference, so <code>StateFlow</code> sees no change and Compose never recomposes. The screen simply does not update, and the debugging burns ten minutes you do not have. Copy, always.</p>'
                }
            ],
            docs: [
                { title: 'State and Jetpack Compose', path: '/develop/ui/compose/state', kind: 'guide' },
                { title: 'State holders and UI state', path: '/topic/architecture/ui-layer/stateholders', kind: 'guide' },
                { title: 'Text field state', path: '/develop/ui/compose/text/user-input', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-state-management' },
                { topicId: 'jetpack-compose', questionId: 'compose-stateful-vs-stateless' },
                { topicId: 'jetpack-compose', questionId: 'compose-user-input' },
                { topicId: 'jetpack-compose', questionId: 'compose-orientation-changes' },
                { topicId: 'android-architecture', questionId: 'arch-mvi' }
            ]
        },

        {
            id: 'the-remaining-four',
            title: 'Timer, notes, images, filters',
            importance: 'should-know',
            summary: 'Four smaller drills, each with one specific trap in it.',
            interviewAngle: 'Each of these exists to test one thing, and the trap is the thing.',
            buildsOn: ['state-shaped-screens'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>These four are shorter and each has a single sharp edge. Drill them for the edge, not for the feature.</p>'
                },
                {
                    type: 'drill',
                    id: 'countdown-timer',
                    tier: 2,
                    title: 'Countdown timer',
                    minutes: 30,
                    prompt: '<p>A five-minute countdown with start, pause and reset, displayed as <code>mm:ss</code>. It keeps running across rotation, and pausing then resuming continues from where it stopped.</p><p>Explain what happens if the app is backgrounded for two minutes, and what the user should see on return.</p>',
                    watchFor: [
                        'A <code>while</code> loop decrementing a counter — it drifts, and the drift is visible in a minute',
                        'The loop launched from <code>LaunchedEffect</code> in the composable, so rotation restarts it',
                        'No cancellation of the old job when start is pressed twice',
                        'No answer for the backgrounded case'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `class TimerViewModel : ViewModel() {

    private val _remaining = MutableStateFlow(5 * 60 * 1000L)
    val remaining: StateFlow<Long> = _remaining.asStateFlow()

    private var job: Job? = null

    fun start() {
        if (job?.isActive == true) return
        // Count against a DEADLINE, not by subtracting 1000 each tick.
        // delay() is "at least", so a decrementing loop loses a second a
        // minute — visible, and exactly what this drill is checking.
        val deadline = SystemClock.elapsedRealtime() + _remaining.value
        job = viewModelScope.launch {
            while (isActive) {
                val left = deadline - SystemClock.elapsedRealtime()
                _remaining.value = left.coerceAtLeast(0)
                if (left <= 0) break
                delay(200)                    // tick faster than the display
            }
        }
    }

    fun pause() { job?.cancel(); job = null }

    fun reset() { pause(); _remaining.value = 5 * 60 * 1000L }

    override fun onCleared() { job?.cancel() }
}

// elapsedRealtime, not currentTimeMillis: the latter jumps when the clock
// is corrected or the timezone changes, and the timer jumps with it.

// Backgrounded for two minutes: the ViewModel survives, the coroutine keeps
// running, and the deadline is absolute — so it returns showing the correct
// remaining time rather than two minutes of catch-up. If it needs to fire
// while the app is dead, that is AlarmManager, not a coroutine (M30).`
                    }
                },
                {
                    type: 'drill',
                    id: 'notes-crud',
                    tier: 2,
                    title: 'Notes, persisted locally',
                    minutes: 40,
                    prompt: '<p>Create, edit, delete and list notes, surviving app restart. The list updates itself when a note changes — no manual refresh.</p><p>Deleting shows an undo for a few seconds.</p>',
                    watchFor: [
                        'A <code>suspend fun getAll()</code> instead of a <code>Flow</code>, then refreshing by hand',
                        'Room queries on the main thread',
                        'Undo implemented by re-inserting with a new id',
                        'No <code>@Upsert</code>, so editing creates duplicates'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `@Entity(tableName = "notes")
data class NoteEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val title: String,
    val body: String,
    val updatedAt: Long = System.currentTimeMillis()
)

@Dao
interface NoteDao {
    @Query("SELECT * FROM notes ORDER BY updatedAt DESC")
    fun observeAll(): Flow<List<NoteEntity>>     // Flow: the list updates itself

    @Upsert  suspend fun upsert(note: NoteEntity)   // insert OR update, one call
    @Delete  suspend fun delete(note: NoteEntity)
}

// Undo, without a re-insert: keep the deleted row in memory and put the
// SAME entity back, id and all. Re-inserting with a new id breaks any
// reference to it and reorders the list.
private var lastDeleted: NoteEntity? = null

fun delete(note: NoteEntity) = viewModelScope.launch {
    lastDeleted = note
    dao.delete(note)
}

fun undo() = viewModelScope.launch {
    lastDeleted?.let { dao.upsert(it) }
    lastDeleted = null
}

// Room's suspend DAO methods already move off the main thread — the
// generated code uses its own executor. Saying that is better than
// wrapping every call in withContext(Dispatchers.IO) "to be safe".`
                    }
                },
                {
                    type: 'drill',
                    id: 'image-list',
                    tier: 2,
                    title: 'Images in a list',
                    minutes: 25,
                    prompt: '<p>Each row shows a remote thumbnail with a placeholder while it loads and a fallback if it fails. Scrolling fast must stay smooth and must not show the wrong image in a recycled row.</p>',
                    watchFor: [
                        'No fixed size on the image, so rows resize as images arrive and the list jumps',
                        'No placeholder, so the list flashes',
                        'Loading full-resolution images for a 48dp thumbnail',
                        'Hand-rolling a loader when a library is allowed'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `AsyncImage(
    model = ImageRequest.Builder(LocalContext.current)
        .data(item.thumbnailUrl)
        .size(96)                       // decode to the size actually shown
        .crossfade(true)
        .build(),
    contentDescription = item.title,
    placeholder = painterResource(R.drawable.placeholder),
    error = painterResource(R.drawable.broken),
    contentScale = ContentScale.Crop,
    modifier = Modifier
        .size(48.dp)                    // FIXED: reserves layout before load
        .clip(RoundedCornerShape(4.dp))
)

// The wrong-image-in-a-recycled-row bug is a View-system problem that Coil
// and Compose both solve for you: the composable is keyed to its item, so
// there is no reuse to get wrong. Say that — knowing WHY the classic bug
// does not apply here is better than not knowing it existed.
//
// In a RecyclerView you would cancel the pending request in onViewRecycled,
// which is exactly what Glide's and Coil's view extensions do.

// The size() call is the one that matters for smoothness: decoding a 4000px
// JPEG into a 48dp slot allocates ~64MB per image and drops frames (M42).`
                    }
                },
                {
                    type: 'drill',
                    id: 'filter-and-sort',
                    tier: 2,
                    title: 'Filter and sort a loaded list',
                    minutes: 25,
                    prompt: '<p>Filter chips for a category and a sort toggle for name or date. Both apply together, both are visible in the UI, and clearing a filter restores the full list.</p><p>Nothing here may hit the network.</p>',
                    watchFor: [
                        'Re-fetching from the API when a filter changes',
                        'Filtering the source list in place, so it cannot be restored',
                        'The filter logic in the composable, re-running on every recomposition',
                        'Sort dropped when the filter changes'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// Source and view are different things. Keep the source untouched and
// derive the view — restoring a cleared filter is then free.
private val source = MutableStateFlow<List<Item>>(emptyList())
private val filter = MutableStateFlow<Category?>(null)
private val sort = MutableStateFlow(Sort.Name)

val state: StateFlow<ListUiState> =
    combine(source, filter, sort) { items, category, order ->
        val visible = items
            .filter { category == null || it.category == category }
            .sortedWith(
                when (order) {
                    Sort.Name -> compareBy { it.title }
                    Sort.Date -> compareByDescending { it.createdAt }
                }
            )
        ListUiState(items = visible, filter = category, sort = order)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ListUiState())

// combine is the answer to "both apply together": any of the three changing
// recomputes the one visible list, and there is no order-of-operations bug
// between filtering and sorting because they happen in one place.

// For a big list, LazyColumn keys keep item identity stable across a
// re-sort, so rows animate rather than being rebuilt.`
                    }
                },
                {
                    type: 'tip',
                    html: '<p>When a drill has an obvious library answer — Paging, Coil, Room — name the library, say what it would give you, then say whether you are using it and why. "Coil, because images are the ask and hand-rolling a loader would eat the round" and "not Paging, because wiring it costs more than it shows here" are both good answers. Silence about the library is the only bad one.</p>'
                }
            ],
            docs: [
                { title: 'Load images with Coil', path: '/develop/ui/compose/graphics/images/loading', kind: 'guide' },
                { title: 'Save data in a local database using Room', path: '/training/data-storage/room', kind: 'guide' },
                { title: 'Manage your app\'s memory', path: '/topic/performance/memory', kind: 'guide' },
                { title: 'kotlinx.coroutines.flow', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'android-libraries', questionId: 'android-rxjava-timer-delay-interval' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-room-database' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-room-database' },
                { topicId: 'android-system-design', questionId: 'design-image-loading-library' },
                { topicId: 'jetpack-compose', questionId: 'compose-performance-optimization' },
                { topicId: 'android', questionId: 'android-diffutil' }
            ]
        }
    ]
};
