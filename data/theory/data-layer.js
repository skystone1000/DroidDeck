/* ==========================================================================
   M26 — The data layer and repositories.

   Opens the data track, and deliberately before Room or Retrofit. The shape
   of the data layer is an architecture decision; the libraries are an
   implementation detail that follows from it, and teaching them first is how
   people end up with Retrofit interfaces called from a composable.
   ========================================================================== */

const dataLayerModule = {
    id: 'data-layer',
    trackId: 'data',
    order: 26,
    title: 'The Data Layer and Repositories',
    tagline: 'One place that owns the truth, exposing streams the UI can trust.',
    estimatedMinutes: 30,
    prerequisites: ['reactive-state'],
    docHub: {
        title: 'Data layer',
        path: '/topic/architecture/data-layer'
    },

    chapters: [
        {
            id: 'repositories',
            title: 'Repositories and data sources',
            importance: 'must-know',
            summary: 'A repository owns a slice of application data; a data source owns exactly one origin for it.',
            interviewAngle: '"What goes in a repository?" — the answer that lands is a boundary, not a folder name.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The data layer exists so that the rest of the app can ask for data without knowing where it comes from. Everything else — testability, offline support, swapping a backend — follows from that one separation, and a repository that leaks its origin has already given it up.</p>'
                },
                {
                    type: 'table',
                    title: 'The two roles, and the line between them',
                    headers: ['', 'Data source', 'Repository'],
                    rows: [
                        ['Owns', 'One origin — a DAO, an API, a DataStore', 'One slice of app data'],
                        ['Knows about', 'Its own technology only', 'Several data sources'],
                        ['Decides', 'Nothing — it fetches and stores', 'Where data comes from, and when'],
                        ['Exposes', 'Whatever its technology returns', 'App models, as streams'],
                        ['Count', 'One per origin', 'One per type of data']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The naming convention matters more than it looks. A repository is named for the <em>data</em> — <code>UserRepository</code>, <code>DraftRepository</code> — and a data source for the data <em>and its origin</em>: <code>UserLocalDataSource</code>, <code>UserRemoteDataSource</code>. If you cannot name a class that way, it is usually doing two jobs.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The shape, and what each layer is allowed to know',
                    code: `// The data source knows Retrofit exists. Nothing above it does.
class UserRemoteDataSource(private val api: UserApi) {
    suspend fun fetch(id: String): UserDto = api.getUser(id)
}

// The repository knows both sources exist. The UI knows neither.
class UserRepository(
    private val local: UserLocalDataSource,
    private val remote: UserRemoteDataSource,
    private val io: CoroutineDispatcher = Dispatchers.IO
) {
    // A stream, not a snapshot — the UI reacts rather than re-asks.
    fun observe(id: String): Flow<User> = local.observe(id).map { it.toUser() }

    suspend fun refresh(id: String) = withContext(io) {
        local.upsert(remote.fetch(id).toEntity())   // write local, and stop
    }
}`,
                    notes: 'Note that <code>refresh</code> returns nothing useful. It writes to the local store, and the stream from <code>observe</code> emits — which is the single-source-of-truth rule expressed in code.'
                },
                {
                    type: 'types',
                    title: 'What belongs in a repository, and what does not',
                    items: [
                        { name: 'Belongs: choosing a source', html: '<p>Cache first, network on refresh, fall back on failure. This is the decision the repository exists to make.</p>' },
                        { name: 'Belongs: mapping to app models', html: '<p>A <code>UserDto</code> shaped by someone else’s API should not reach the UI. Mapping at this boundary is what stops a backend rename becoming a UI change.</p>' },
                        { name: 'Does not belong: UI state', html: '<p>Loading flags, selected items, snackbar messages. Those are the UI layer’s (Track 6), and a repository that knows about them is coupled to one screen.</p>' },
                        { name: 'Does not belong: Android framework types', html: '<p>A repository taking a <code>Context</code> to read a resource, or returning a <code>Cursor</code>, cannot be unit tested on the JVM — which is most of the reason to have one.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>A repository that is one method per API endpoint is not a repository — it is the API interface with a different name. The test is whether it makes a decision: if every method forwards to exactly one data source and maps nothing, the layer is costing you a file and buying nothing.</p>'
                }
            ],
            docs: [
                { title: 'Data layer', path: '/topic/architecture/data-layer', kind: 'guide' },
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' },
                { topicId: 'android-architecture', questionId: 'arch-clean' }
            ]
        },

        {
            id: 'single-source-of-truth',
            title: 'Single source of truth and caching',
            importance: 'must-know',
            summary: 'One store is authoritative, everything else feeds it, and the UI observes it.',
            interviewAngle: 'Interviewers probe this by asking what happens on a failed refresh. The good answer is "nothing visible breaks".',
            buildsOn: ['repositories'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Single source of truth',
                    important: true,
                    html: '<p>Exactly one place holds the authoritative copy of a piece of data. Every other component either writes <em>into</em> it or reads <em>from</em> it, and nothing reads from two places and reconciles them itself.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The alternative is the arrangement everyone writes first: the ViewModel calls the network, and also reads the cache, and holds a third copy in its own state. Now three things can disagree, and the bug reports are all "sometimes it shows the old value".</p>'
                },
                {
                    type: 'comparison',
                    title: 'Where the truth lives',
                    left: 'Local store is the truth',
                    right: 'Network is the truth',
                    rows: [
                        { aspect: 'Reads', left: 'Always from the database', right: 'From the network, cached opportunistically' },
                        { aspect: 'Offline', left: 'Works — it is just the local data', right: 'Broken or degraded' },
                        { aspect: 'Refresh failure', left: 'Invisible; stale data stays', right: 'The screen has nothing to show' },
                        { aspect: 'Complexity', left: 'Higher — writes need syncing (M29)', right: 'Lower' },
                        { aspect: 'Right for', left: 'Anything the user re-reads', right: 'Genuinely live, non-durable data' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The failed-refresh row is the one interviewers push on. When the database is authoritative, a network failure is a non-event for the UI — the stream keeps emitting what it had, and the only visible consequence is whatever you choose to say about staleness. That is the argument for the pattern, and it is worth stating in exactly those terms.</p>'
                },
                {
                    type: 'types',
                    title: 'Kinds of cache, and what each is for',
                    items: [
                        { name: 'In-memory', html: '<p>A field, or a <code>StateFlow</code> in a singleton repository. Fastest, dies with the process (M12), and the right choice for data that is cheap to refetch but expensive to refetch <em>repeatedly</em>.</p>' },
                        { name: 'Persistent', html: '<p>Room or DataStore. Survives process death and offline, and is what makes the database-as-truth pattern possible.</p>' },
                        { name: 'HTTP cache', html: '<p>OkHttp honouring cache headers (M28). Free, and entirely outside your control — useful for images and static content, not for data you must reason about.</p>' },
                        { name: 'Deliberately none', html: '<p>A one-shot payment confirmation should not be cached. Naming a case where caching is wrong is a good way to show the decision was made rather than defaulted to.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'An in-memory cache shared across collectors',
                    code: `class ConfigRepository(private val api: ConfigApi, scope: CoroutineScope) {

    // One network call regardless of how many collectors there are, replayed
    // to late arrivals, and dropped 5s after the last one leaves.
    val config: Flow<Config> = flow { emit(api.config()) }
        .shareIn(scope, SharingStarted.WhileSubscribed(5_000), replay = 1)
}`,
                    notes: 'This is the M11 sharing material doing data-layer work. The 5-second stop timeout is what makes it survive a configuration change without refetching.'
                },
                {
                    type: 'pitfall',
                    html: '<p>A repository that caches must be a singleton, or every consumer gets its own cache and the pattern silently does nothing. This is the most common reason a "cache" produces no fewer network calls than before.</p>'
                }
            ],
            docs: [
                { title: 'Data layer', path: '/topic/architecture/data-layer', kind: 'guide' },
                { title: 'Offline-first apps', path: '/topic/architecture/data-layer/offline-first', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-system-design', questionId: 'design-caching-library' },
                { topicId: 'android-system-design', questionId: 'design-lru-cache' },
                { topicId: 'android', questionId: 'android-persisting-data' }
            ]
        },

        {
            id: 'errors-and-threading',
            title: 'Modelling failure, and where the work runs',
            importance: 'should-know',
            summary: 'Expected failures are values; unexpected ones are exceptions — and the data layer owns its own threading.',
            interviewAngle: '"How do you handle errors in a repository?" separates people who have thought about it from people who wrap everything in try/catch.',
            buildsOn: ['single-source-of-truth'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The useful distinction is not between errors and successes; it is between failures the caller must handle and failures that mean the app is broken. A 404 for a deleted item is ordinary and the UI has something to say about it. An <code>OutOfMemoryError</code> is not, and catching it accomplishes nothing.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A sealed result, with the cases the UI actually renders',
                    code: `sealed interface Outcome<out T> {
    data class Success<T>(val data: T) : Outcome<T>
    data class Failure(val reason: Reason) : Outcome<Nothing>
}

// Named for what the user sees, not for the HTTP status.
enum class Reason { Offline, NotFound, Unauthorised, Server, Unknown }

suspend fun load(id: String): Outcome<User> = try {
    Outcome.Success(remote.fetch(id).toUser())
} catch (e: IOException) {
    Outcome.Failure(Reason.Offline)          // expected — the phone is in a lift
} catch (e: HttpException) {
    Outcome.Failure(e.toReason())
}
// CancellationException is deliberately not caught: it is not a failure,
// it is structured concurrency working (M9).`,
                    notes: 'The exhaustive <code>when</code> the sealed type forces is the point — a new failure case becomes a compile error in every screen that renders it, rather than a silent fall-through to "something went wrong".'
                },
                {
                    type: 'pitfall',
                    html: '<p>A blanket <code>catch (e: Exception)</code> in a coroutine swallows <code>CancellationException</code> and breaks cancellation — the work carries on after the scope is gone. Catch specific types, or use <code>runCatching</code> only where you immediately rethrow cancellation.</p>'
                },
                {
                    type: 'types',
                    title: 'Threading, and whose job it is',
                    items: [
                        { name: 'The data layer owns it', html: '<p>A <code>suspend</code> function must be safe to call from the main thread. That means the repository or data source applies <code>withContext(Dispatchers.IO)</code> internally, not that every caller remembers to.</p>' },
                        { name: 'Inject the dispatcher', html: '<p>Take a <code>CoroutineDispatcher</code> as a constructor parameter defaulting to <code>Dispatchers.IO</code>, so tests can pass a test dispatcher. Hard-coding it is the single most common reason a repository cannot be tested deterministically.</p>' },
                        { name: 'Room and Retrofit already do it', html: '<p>Both move suspend calls off the caller’s thread themselves, so wrapping a DAO call in <code>withContext(IO)</code> is redundant. Knowing that is a small, credible detail.</p>' },
                        { name: 'Do not expose a scope', html: '<p>A repository should take <code>suspend</code> functions and return <code>Flow</code>s. If it launches its own coroutines, the caller has lost the ability to cancel the work it asked for.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Coroutines best practices', path: '/kotlin/coroutines/coroutines-best-practices', kind: 'guide' },
                { title: 'Data layer', path: '/topic/architecture/data-layer', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-libraries', questionId: 'android-rxjava-error-handling' },
                { topicId: 'android-architecture', questionId: 'arch-clean' }
            ]
        }
    ]
};
