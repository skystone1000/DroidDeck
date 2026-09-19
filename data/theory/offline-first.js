/* ==========================================================================
   M29 — Offline-first and sync.

   The module where M26's single source of truth stops being a diagram. Reads
   are the easy half and every interesting problem is on the write side, so
   the chapters are split that way rather than by feature.
   ========================================================================== */

const offlineFirstModule = {
    id: 'offline-first',
    trackId: 'data',
    order: 29,
    title: 'Offline-First and Sync',
    tagline: 'The network is an implementation detail of staying up to date.',
    estimatedMinutes: 30,
    prerequisites: ['local-persistence', 'networking'],
    docHub: {
        title: 'Build an offline-first app',
        path: '/topic/architecture/data-layer/offline-first'
    },

    chapters: [
        {
            id: 'reading-offline',
            title: 'Reading when the network is optional',
            importance: 'must-know',
            summary: 'The app reads from the database always, and the network only ever writes into it.',
            interviewAngle: 'The strong version of this answer never mentions a loading spinner for cached data.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>An offline-first app is not an app with an offline mode. It is an app where the local store is the only thing the UI reads, and the network is one of the ways that store gets updated — so "offline" is not a state the UI has to model, it is just an update that has not arrived yet.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The read path, and where refresh sits',
                    code: `class FeedRepository(
    private val dao: FeedDao,
    private val api: FeedApi
) {
    // The only read path. Never touches the network.
    fun observe(): Flow<List<Post>> = dao.observeAll().map { it.map(Entity::toPost) }

    // A separate, explicit operation. Its failure is not the UI's problem.
    suspend fun refresh(): Result<Unit> = runCatching {
        dao.replaceAll(api.feed().map { it.toEntity() })
    }
}

// In the ViewModel: two independent things, deliberately.
val posts = repo.observe().stateIn(viewModelScope, WhileSubscribed(5_000), emptyList())

private val _syncing = MutableStateFlow(false)
val syncing = _syncing.asStateFlow()

fun onPullToRefresh() = viewModelScope.launch {
    _syncing.value = true
    repo.refresh().onFailure { _errors.emit(it.toMessage()) }
    _syncing.value = false
}`,
                    notes: 'Separating <code>posts</code> from <code>syncing</code> is the whole trick. Content and freshness are different questions, so a failed refresh shows a message over data that is still on screen.'
                },
                {
                    type: 'types',
                    title: 'What the UI shows, and when',
                    items: [
                        { name: 'Empty and never synced', html: '<p>The only true loading state. Show a skeleton — there is genuinely nothing to display.</p>' },
                        { name: 'Data, syncing', html: '<p>Show the data, plus a thin progress indicator. Never replace content with a spinner because a refresh is in flight.</p>' },
                        { name: 'Data, sync failed', html: '<p>Show the data and a dismissible message. The user can still work; you are reporting staleness, not an error.</p>' },
                        { name: 'Empty and synced', html: '<p>A genuine empty state — "no posts yet" — which is a different screen from loading and is regularly conflated with it.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Modelling this as <code>sealed class UiState { Loading, Success, Error }</code> forces exactly the wrong behaviour: an error state has no data, so a failed refresh wipes a perfectly good screen. Freshness is a property <em>of</em> the loaded state, not an alternative to it.</p>'
                }
            ],
            docs: [
                { title: 'Build an offline-first app', path: '/topic/architecture/data-layer/offline-first', kind: 'guide' },
                { title: 'Data layer', path: '/topic/architecture/data-layer', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-system-design', questionId: 'design-offline-first-app' },
                { topicId: 'android-system-design', questionId: 'where-is-my-train-without-internet' }
            ]
        },

        {
            id: 'writing-offline',
            title: 'Writing, queueing and resolving conflicts',
            importance: 'should-know',
            summary: 'Apply the change locally at once, queue it for the server, and decide who wins when both changed.',
            interviewAngle: 'Conflict resolution is where this question goes if the interviewer is any good. Have a strategy and its trade-off ready.',
            buildsOn: ['reading-offline'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Optimistic write',
                    important: true,
                    html: '<p>The local store is updated immediately, as if the server had already agreed, and the request is queued. The UI is instant and the failure case — reverting, or retrying — becomes something you have to design rather than something you get for free.</p>'
                },
                {
                    type: 'definition',
                    term: 'The outbox pattern',
                    important: true,
                    html: '<p>Pending changes are rows in a local table, written in the same transaction as the data change itself. A worker drains the table when a network is available and deletes each row once the server acknowledges it.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Writing both in one transaction is the part that makes it reliable. If the change and its outbox entry are separate writes, a process death between them (M12) leaves a local edit the server will never hear about — which is the exact bug the pattern exists to prevent.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'An outbox entry, and draining it',
                    code: `@Entity(tableName = "outbox")
data class OutboxEntry(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),  // idempotency key
    val operation: String,          // "update_post"
    val payload: String,
    val attempts: Int = 0
)

@Transaction
suspend fun editPost(post: Post) {
    dao.upsert(post.toEntity())                      // the user sees it now
    outbox.add(OutboxEntry(operation = "update_post", payload = post.toJson()))
}

// Drained by a WorkManager job with a network constraint (M30).
class SyncWorker(…) : CoroutineWorker(…) {
    override suspend fun doWork(): Result {
        outbox.pending().forEach { entry ->
            when (api.send(entry).status) {
                Sent      -> outbox.remove(entry)
                Retryable -> return Result.retry()   // backoff handled for us
                Rejected  -> { outbox.remove(entry); conflicts.record(entry) }
            }
        }
        return Result.success()
    }
}`,
                    notes: 'The entry id doubles as the idempotency key from M28, so a request the server received but never acknowledged is not applied twice on retry.'
                },
                {
                    type: 'table',
                    title: 'Conflict resolution strategies',
                    headers: ['Strategy', 'Rule', 'Loses', 'Right for'],
                    rows: [
                        ['Last write wins', 'Highest timestamp', 'The other edit, silently', 'Low-stakes, single-user data'],
                        ['Server wins', 'Server always authoritative', 'The user’s offline edit', 'Data the client only mirrors'],
                        ['Client wins', 'Local always authoritative', 'Concurrent edits elsewhere', 'Drafts and personal notes'],
                        ['Field-level merge', 'Merge per field', 'Little, but complex', 'Records edited from several places'],
                        ['Ask the user', 'Surface both versions', 'Nothing but simplicity', 'Documents worth the interruption']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Last-write-wins is the honest default, and the reason to say it out loud is that its cost is invisible: an edit is lost with nothing on screen to indicate it. Clock skew makes it worse — device clocks are wrong, sometimes by hours — so the timestamp should come from the server, not from the phone.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Scheduling is the last piece, and it is a <code>WorkManager</code> question (M30): drain the outbox on a network-available constraint, back off exponentially on failure, and use unique work so a burst of edits does not queue a dozen redundant syncs. Saying that connects this module to the next one, which is usually where the interviewer was heading anyway.</p>'
                }
            ],
            docs: [
                { title: 'Build an offline-first app', path: '/topic/architecture/data-layer/offline-first', kind: 'guide' },
                { title: 'Persistent work', path: '/develop/background-work/background-tasks/persistent', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-system-design', questionId: 'data-syncing-unstable-networks' },
                { topicId: 'android-system-design', questionId: 'design-offline-first-app' },
                { topicId: 'android-system-design', questionId: 'accurate-time-android' }
            ]
        },

        {
            id: 'paging',
            title: 'Paging a list that is larger than memory',
            importance: 'should-know',
            summary: 'Load a page at a time, and let RemoteMediator keep the database as the source of truth.',
            interviewAngle: 'The interesting half is RemoteMediator, because it is where paging and offline-first meet.',
            buildsOn: ['reading-offline'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A feed of ten thousand posts cannot be a <code>List</code> in memory, and pagination written by hand is a small pile of state — the current page, whether a load is running, whether the end was reached, what to do on rotation. Paging 3 exists to own that state.</p>'
                },
                {
                    type: 'types',
                    title: 'The pieces',
                    items: [
                        { name: 'PagingSource', html: '<p>Loads one page from one origin. A Room DAO can return one directly, so the local case needs no code at all.</p>' },
                        { name: 'Pager and PagingData', html: '<p>Configuration plus a stream of pages. <code>PagingData</code> is deliberately not a list — you cannot index it, which is what stops the whole thing being loaded.</p>' },
                        { name: 'RemoteMediator', html: '<p>Called when the local data runs out: fetch the next page from the network, write it into the database, and let the <code>PagingSource</code> re-emit. This is the offline-first pattern with the network as the writer.</p>' },
                        { name: 'LoadState', html: '<p>Refresh, prepend and append each have their own state, so a footer spinner and a full-screen loading state are separate things rather than one flag.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The combination is what matters in an interview. With a <code>RemoteMediator</code> the database is still the single source of truth: the network never reaches the UI, it only fills the table the UI is already observing. Scrolling offline works to the end of what was cached, and the same screen serves both cases without a branch.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Paging is a poor fit for data the user edits locally. Its stream assumes pages arriving from a source of truth, and an optimistic write from the previous chapter has to travel through the database to be seen — which works, but means every write path must go through Room rather than through anything the pager holds.</p>'
                }
            ],
            docs: [
                { title: 'Paging 3 overview', path: '/topic/libraries/architecture/paging/v3-overview', kind: 'guide' },
                { title: 'Page from network and database', path: '/topic/libraries/architecture/paging/v3-network-db', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-libraries', questionId: 'android-rxjava-pagination' },
                { topicId: 'android-system-design', questionId: 'design-instagram-stories' }
            ]
        }
    ]
};
