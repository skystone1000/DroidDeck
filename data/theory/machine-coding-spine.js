/* ==========================================================================
   M46 — The spine.

   The one asset in this app whose code gets typed verbatim by a reader under
   pressure, so it is deliberately small, deliberately boring, and checked to
   compile before it ships.

   The bet of the whole section is here: every screen-shaped machine coding
   task is this same vertical slice plus one delta, so M47 can be a catalogue
   of diffs rather than twelve unrelated apps.

   docHub: the architecture guide, which is what the spine is an instance of.
   ========================================================================== */

const machineCodingSpineModule = {
    id: 'machine-coding-spine',
    trackId: 'synthesis',
    order: 46,
    title: 'The Spine',
    tagline: 'Six files you can type from blank in ten minutes.',
    estimatedMinutes: 35,
    prerequisites: ['machine-coding-round'],
    docHub: {
        title: 'Guide to app architecture',
        path: '/topic/architecture'
    },

    chapters: [
        {
            id: 'the-six-files',
            title: 'Six files, about 120 lines',
            importance: 'must-know',
            summary: 'Model, API, repository, state, ViewModel, screen — the slice every task starts from.',
            interviewAngle: 'Typing this without thinking is worth more than knowing any single Android API.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>There is one structure underneath almost every machine coding prompt: data arrives from somewhere, it is turned into a state, and a screen renders that state. Learn it once, as six files, and the round stops being a design problem and becomes a typing problem — which is a much better problem to have with someone watching.</p>'
                },
                {
                    type: 'types',
                    title: 'The six files, and why each one exists',
                    items: [
                        { name: 'Item.kt', html: '<p>The model. A <code>data class</code> and nothing clever. It is separate from the network shape on purpose, so the API changing does not reach the UI.</p>', whenToUse: '30 seconds' },
                        { name: 'ItemApi.kt', html: '<p>The interface with one <code>suspend fun</code>, plus a <code>Fake</code> that returns a list after a delay. The fake is what you build the whole screen against.</p>', whenToUse: '1 minute' },
                        { name: 'ItemRepository.kt', html: '<p>Interface plus implementation. Its job is to map transport failures into something the UI layer can render (M26).</p>', whenToUse: '1 minute' },
                        { name: 'UiState.kt', html: '<p>A sealed interface with four cases. This is rubric lines 2 and 3, and it is the single highest-value file in the round (M34).</p>', whenToUse: '1 minute' },
                        { name: 'ItemViewModel.kt', html: '<p><code>StateFlow&lt;UiState&gt;</code>, a <code>load()</code>, cancellation of the in-flight job (M33).</p>', whenToUse: '3 minutes' },
                        { name: 'ItemScreen.kt', html: '<p><code>collectAsStateWithLifecycle</code> and a <code>when</code> over the state. One branch per case, no exceptions.</p>', whenToUse: '3 minutes' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: '1–3. Model, API, repository',
                    code: `// ---- Item.kt --------------------------------------------------------
data class Item(
    val id: String,
    val title: String,
    val subtitle: String
)

// ---- ItemApi.kt -----------------------------------------------------
interface ItemApi {
    suspend fun items(): List<Item>
}

/* Build the entire screen against this. It gives you loading (the delay),
   content, and — by flipping one flag — the error path, in eight lines. */
class FakeItemApi(private val failing: Boolean = false) : ItemApi {
    override suspend fun items(): List<Item> {
        delay(600)
        if (failing) throw IOException("no connection")
        return List(20) { Item(id = "$it", title = "Item $it", subtitle = "Row $it") }
    }
}

// ---- ItemRepository.kt ----------------------------------------------
class DataError(message: String, cause: Throwable? = null) : Exception(message, cause)

interface ItemRepository {
    suspend fun items(): List<Item>
}

/* The boundary. Transport exceptions stop here and become one type the UI
   layer knows how to render — the ViewModel should never see an IOException. */
class DefaultItemRepository(private val api: ItemApi) : ItemRepository {
    override suspend fun items(): List<Item> =
        try {
            api.items()
        } catch (e: IOException) {
            throw DataError("No connection. Check your network and retry.", e)
        }
}`,
                    notes: 'Say the repository’s job out loud when you write it: "transport errors stop here, so the ViewModel only ever deals in domain failures". That sentence is rubric line 6 and rubric line 10 in one move.'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: '4–5. State and ViewModel',
                    code: `// ---- UiState.kt -----------------------------------------------------
sealed interface UiState {
    data object Loading : UiState
    data object Empty : UiState
    data class Content(val items: List<Item>) : UiState
    data class Error(val message: String) : UiState
}

// ---- ItemViewModel.kt -----------------------------------------------
class ItemViewModel(
    private val repository: ItemRepository,
    private val io: CoroutineDispatcher = Dispatchers.IO   // injected: the test seam
) : ViewModel() {

    private val _state = MutableStateFlow<UiState>(UiState.Loading)
    val state: StateFlow<UiState> = _state.asStateFlow()

    private var loadJob: Job? = null

    init { load() }

    fun load() {
        loadJob?.cancel()                       // a second tap must not race the first
        loadJob = viewModelScope.launch {
            _state.value = UiState.Loading
            _state.value = try {
                val items = withContext(io) { repository.items() }
                if (items.isEmpty()) UiState.Empty else UiState.Content(items)
            } catch (e: CancellationException) {
                throw e                          // never swallow cancellation
            } catch (e: Exception) {
                UiState.Error(e.message ?: "Something went wrong")
            }
        }
    }
}`,
                    notes: 'Three details carry marks well beyond their size: the empty list becomes Empty rather than an empty Content, the previous job is cancelled before a new one starts, and CancellationException is rethrown rather than caught by the generic handler.'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: '6. The screen',
                    code: `// ---- ItemScreen.kt --------------------------------------------------
@Composable
fun ItemScreen(
    viewModel: ItemViewModel,
    modifier: Modifier = Modifier
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    // One 'when' over one state type. Adding a case to UiState makes this
    // fail to compile until it is handled — which is the point of sealing it.
    when (val current = state) {
        UiState.Loading -> Centered(modifier) { CircularProgressIndicator() }

        UiState.Empty -> Centered(modifier) { Text("Nothing here yet") }

        is UiState.Error -> Centered(modifier) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(current.message)
                Spacer(Modifier.height(8.dp))
                Button(onClick = viewModel::load) { Text("Retry") }
            }
        }

        is UiState.Content -> LazyColumn(modifier.fillMaxSize()) {
            items(current.items, key = { it.id }) { item ->     // key: stable identity
                ListItem(
                    headlineContent = { Text(item.title) },
                    supportingContent = { Text(item.subtitle) }
                )
            }
        }
    }
}

@Composable
private fun Centered(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) { content() }
}`,
                    notes: 'collectAsStateWithLifecycle rather than collectAsState: the former stops collecting when the screen is not started, which is the difference between a paused app that is idle and one that is still doing work (M20, M34).'
                },
                {
                    type: 'prose',
                    html: '<p>Wiring it up is three lines, and it is deliberately not Hilt: <code>val vm = viewModel { ItemViewModel(DefaultItemRepository(FakeItemApi())) }</code>. When the interviewer asks about dependency injection — and they usually do — the answer is that the constructor already takes its dependencies, so adding Hilt is annotations, not restructuring. That answer is worth more than the wiring would have been.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Do not put <code>Loading</code>, <code>error</code> and <code>items</code> in one data class as three independent fields. It compiles, it is faster to write, and it lets you represent "loading, with an error, and content" — a state that cannot exist and which you will eventually render. The sealed interface is four extra lines and it is what rubric line 2 is actually asking for.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Practise this against the clock in the literal order above: model, fake, repository, state, ViewModel, screen. It runs against the fake before you have written a single line of networking, which means you have something to demo at minute twelve — and everything after that is upside.</p>'
                }
            ],
            docs: [
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' },
                { title: 'UI layer', path: '/topic/architecture/ui-layer', kind: 'guide' },
                { title: 'Data layer', path: '/topic/architecture/data-layer', kind: 'guide' },
                { title: 'State and Jetpack Compose', path: '/develop/ui/compose/state', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-mvvm' },
                { topicId: 'jetpack-compose', questionId: 'compose-unidirectional-data-flow' },
                { topicId: 'jetpack-compose', questionId: 'compose-state-hoisting' },
                { topicId: 'jetpack-compose', questionId: 'compose-observe-flows-livedata' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-stateflow-sharedflow' },
                { topicId: 'design-pattern', questionId: 'design-pattern-repository' }
            ]
        },

        {
            id: 'the-deltas',
            title: 'Every task is the spine plus one delta',
            importance: 'must-know',
            summary: 'What each of the twelve screen-shaped drills actually changes.',
            interviewAngle: 'Recognising the delta in the first minute is what makes fifty minutes enough.',
            buildsOn: ['the-six-files'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Once the spine is automatic, the prompts stop looking like different problems. Search adds a query stream. Pagination adds a page counter and an append. The cart replaces the remote source with a local reducer. In every case five of the six files are unchanged, and knowing <em>which</em> file changes is what lets you start typing in minute four instead of minute fifteen.</p>'
                },
                {
                    type: 'table',
                    title: 'The twelve, and what each one moves',
                    headers: ['Drill', 'The delta', 'Where it lands'],
                    rows: [
                        ['List from API', 'none — this is the spine', 'all six'],
                        ['Debounced search', '<code>MutableStateFlow(query)</code> → <code>debounce</code> → <code>flatMapLatest</code>', 'ViewModel + one repository signature'],
                        ['Pagination', 'page counter, append to <code>Content</code>, end-reached detection', 'ViewModel + screen'],
                        ['Detail navigation', 'a second screen and a route; <code>SavedStateHandle</code> for the id', 'new screen + ViewModel'],
                        ['Offline-first cache', 'Room becomes the source; the network writes into it', 'repository'],
                        ['Shopping cart', 'a local <code>Map</code> reducer, totals derived not stored', 'ViewModel + state'],
                        ['Form validation', 'per-field state, errors as a map, submit gated', 'state + screen'],
                        ['Countdown timer', 'a ticking flow in <code>viewModelScope</code>', 'ViewModel'],
                        ['Quiz flow', 'an index into questions; state machine over steps', 'state + ViewModel'],
                        ['Notes CRUD', 'Room DAO returning <code>Flow</code>, four write methods', 'repository'],
                        ['Image list', 'an <code>AsyncImage</code> per row plus placeholders', 'screen'],
                        ['Filter and sort', 'source list kept separate from the view list', 'ViewModel']
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The search delta, in full — the most-asked of the twelve',
                    code: `// One line moves outside the ViewModel — the repository takes a query:
//
//     interface ItemRepository { suspend fun items(query: String = ""): List<Item> }
//
// Everything else in the spine is untouched, which is worth saying out loud.

class SearchViewModel(
    private val repository: ItemRepository
) : ViewModel() {

    private val query = MutableStateFlow("")

    fun onQueryChange(value: String) { query.value = value }

    @OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
    val state: StateFlow<UiState> = query
        .debounce(300)                    // wait for a pause in typing
        .distinctUntilChanged()           // "abc" -> "abc" is not a new search
        .flatMapLatest { q ->             // a new query CANCELS the old request
            flow {
                emit(UiState.Loading)
                val items = repository.items(q)
                emit(if (items.isEmpty()) UiState.Empty else UiState.Content(items))
            }.catch { e -> emit(UiState.Error(e.message ?: "Search failed")) }
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = UiState.Empty
        )
}`,
                    notes: 'flatMapLatest is the answer to the question the interviewer is actually asking: what happens to the in-flight request when the user types another character. It cancels it. Saying that sentence is most of the mark; the operator is how you show it.'
                },
                {
                    type: 'comparison',
                    title: 'The two operators candidates confuse here',
                    left: 'flatMapLatest',
                    right: 'flatMapMerge',
                    rows: [
                        { aspect: 'On a new value', left: 'Cancels the previous inner flow', right: 'Runs both concurrently' },
                        { aspect: 'Result order', left: 'Only the newest survives', right: 'Whichever finishes first, wins last' },
                        { aspect: 'Right for search', left: 'Yes — stale results are wrong results', right: 'No — an old query can overwrite a new one' },
                        { aspect: 'Right for', left: 'Search, filters, anything keyed to the latest input', right: 'Independent parallel fetches' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p><code>debounce</code> without <code>flatMapLatest</code> only delays the problem. The requests still overlap once they are in flight, and a slow response to "and" can land after a fast response to "android" and overwrite it. The visible symptom is a list that flickers back to the wrong results, and it is the exact bug the round is checking for.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>When you recognise the delta, name it: <em>"this is the list screen with a query stream in front of it — same state type, same screen, the ViewModel gets a flatMapLatest."</em> It tells the interviewer you have a model of the problem rather than a memorised app, which is the difference they are trying to detect.</p>'
                }
            ],
            docs: [
                { title: 'Kotlin flows on Android', path: '/kotlin/flow', kind: 'guide' },
                { title: 'StateFlow and SharedFlow', path: '/kotlin/flow/stateflow-and-sharedflow', kind: 'guide' },
                { title: 'kotlinx.coroutines.flow', url: 'https://kotlinlang.org/api/kotlinx.coroutines/kotlinx-coroutines-core/kotlinx.coroutines.flow/', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-instant-search' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-common-operators' },
                { topicId: 'kotlin', questionId: 'kotlin-debounce-coroutines' },
                { topicId: 'kotlin', questionId: 'kotlin-statein-vs-sharein' },
                { topicId: 'android-libraries', questionId: 'android-rxjava-search' }
            ]
        },

        {
            id: 'bare-mode',
            title: 'Bare mode — when no libraries are allowed',
            importance: 'should-know',
            summary: 'The same spine with HttpURLConnection and org.json, for sandboxes with no network.',
            interviewAngle: 'Being fluent only in Retrofit is a real gap, and this round is where it shows.',
            buildsOn: ['the-deltas'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Some rounds run in a shared sandbox that cannot reach Maven, or the interviewer simply says "no third-party libraries". This is not an exotic case, and it eliminates candidates who have only ever written <code>@GET</code>. The good news is that only one file changes: the API implementation. Everything the marks are actually for — the state type, the repository boundary, the ViewModel — is identical.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The whole delta: one implementation of ItemApi',
                    code: `class BareItemApi(private val endpoint: String) : ItemApi {

    override suspend fun items(): List<Item> = withContext(Dispatchers.IO) {
        val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 10_000
            readTimeout = 10_000
        }

        try {
            val code = connection.responseCode
            if (code !in 200..299) throw IOException("HTTP \${code}")

            val body = connection.inputStream.bufferedReader().use { it.readText() }

            // HttpURLConnection is not cancellable, so check before parsing:
            // if the screen has gone, do not spend the CPU.
            ensureActive()

            val array = JSONArray(body)
            (0 until array.length()).map { i ->
                val o = array.getJSONObject(i)
                Item(
                    id = o.getString("id"),
                    title = o.getString("title"),
                    subtitle = o.optString("subtitle", "")
                )
            }
        } finally {
            connection.disconnect()
        }
    }
}

// And in AndroidManifest.xml, the line everyone forgets under pressure:
// <uses-permission android:name="android.permission.INTERNET" />`,
                    notes: 'Two things here are worth narrating. optString rather than getString for the field that may be absent, because getString throws on a missing key and a real API will eventually omit one. And ensureActive(), because a blocking socket read cannot be cancelled — the coroutine is only cancellable at the points you give it.'
                },
                {
                    type: 'types',
                    title: 'The rest of the no-library substitutions',
                    items: [
                        { name: 'Retrofit → HttpURLConnection', html: '<p>As above. Roughly twenty lines, and it belongs behind the same <code>ItemApi</code> interface.</p>', whenToUse: 'Always the first thing they take away.' },
                        { name: 'Moshi/Gson → org.json', html: '<p><code>JSONObject</code> and <code>JSONArray</code> ship with the platform. Verbose, but no dependency and no reflection.</p>', whenToUse: 'Small payloads, which is every interview payload.' },
                        { name: 'Coil → a tiny LruCache loader', html: '<p><code>BitmapFactory.decodeStream</code> behind an <code>LruCache</code> sized to <code>maxMemory / 8</code>. This is drill 18, and it is a fair round on its own.</p>', whenToUse: 'Only if images are actually the ask.' },
                        { name: 'Room → a Map, and say so', html: '<p>An in-memory cache in the repository, with the sentence "Room here in real code — the DAO would return a Flow and this becomes the source of truth" (M27).</p>', whenToUse: 'Persistence is rarely the point of the round.' },
                        { name: 'Hilt → constructor parameters', html: '<p>Which the spine already does. There is nothing to substitute, which is the argument for building it that way.</p>', whenToUse: 'Always.' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Do not announce that you cannot work without Retrofit. It is the single clearest negative signal available in this round, and it is avoidable with twenty lines of practice. Drill bare mode twice and it becomes a variation rather than a surprise.</p>'
                }
            ],
            docs: [
                { title: 'Connect to the network', path: '/develop/connectivity/network-ops/connecting', kind: 'guide' },
                { title: 'HttpURLConnection', path: '/reference/java/net/HttpURLConnection', kind: 'api' },
                { title: 'JSONObject', path: '/reference/org/json/JSONObject', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'android-libraries', questionId: 'okhttp-interceptor' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-retrofit' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-cancellation' },
                { topicId: 'android-system-design', questionId: 'design-networking-library' }
            ]
        }
    ]
};
