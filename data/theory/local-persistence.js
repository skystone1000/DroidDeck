/* ==========================================================================
   M27 — Local persistence.

   Room, DataStore and the file system, in that order because Room is the one
   they ask about. The SQLite chapter comes last on purpose: it is the layer
   underneath Room, and it is easier to read once the abstraction above it is
   familiar.
   ========================================================================== */

const localPersistenceModule = {
    id: 'local-persistence',
    trackId: 'data',
    order: 27,
    title: 'Local Persistence',
    tagline: 'Room for structure, DataStore for settings, files for everything else.',
    estimatedMinutes: 35,
    prerequisites: ['data-layer'],
    docHub: {
        title: 'Storage and files',
        path: '/training/data-storage'
    },

    chapters: [
        {
            id: 'room',
            title: 'Room',
            importance: 'must-know',
            summary: 'A compile-time-checked layer over SQLite that returns Flows, so the database can be the source of truth.',
            interviewAngle: '"Why Room over raw SQLite?" — verified queries at compile time, and observable reads.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Room is an ORM in the loose sense, but its two real contributions are narrower than that. It <strong>validates your SQL at compile time</strong> against the schema, so a typo in a column name is a build error rather than a crash on a user’s phone. And it returns <code>Flow</code>, so a read is a subscription that re-emits whenever the underlying table changes — which is what makes the M26 pattern possible at all.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The three pieces',
                    code: `@Entity(tableName = "drafts", indices = [Index("authorId")])
data class DraftEntity(
    @PrimaryKey val id: String,
    val authorId: String,
    val body: String,
    val updatedAt: Long
)

@Dao
interface DraftDao {
    // Returns a Flow: re-emits on every write to the table.
    @Query("SELECT * FROM drafts WHERE authorId = :authorId ORDER BY updatedAt DESC")
    fun observeFor(authorId: String): Flow<List<DraftEntity>>

    // suspend: one-shot, and Room moves it off the caller's thread itself.
    @Query("SELECT * FROM drafts WHERE id = :id")
    suspend fun byId(id: String): DraftEntity?

    @Upsert suspend fun upsert(draft: DraftEntity)
    @Delete suspend fun delete(draft: DraftEntity)

    // Several statements that must succeed or fail together.
    @Transaction
    suspend fun replaceAll(authorId: String, drafts: List<DraftEntity>) {
        deleteFor(authorId)
        drafts.forEach { upsert(it) }
    }
}

@Database(entities = [DraftEntity::class], version = 2)
abstract class AppDatabase : RoomDatabase() {
    abstract fun draftDao(): DraftDao
}`,
                    notes: 'Returning <code>Flow</code> from a query makes it observable; returning the type directly requires <code>suspend</code>. A non-suspend, non-Flow query is a compile error unless you opt out — which is Room refusing to let you block the main thread.'
                },
                {
                    type: 'types',
                    title: 'The parts they ask about',
                    items: [
                        { name: 'Relations', html: '<p><code>@Relation</code> fetches a parent and its children into one object. It runs more than one query under the hood, which is why the method holding it must be annotated <code>@Transaction</code> — otherwise a write between the two queries gives you an inconsistent result.</p>' },
                        { name: '@Transaction', html: '<p>Wraps several statements so they commit together. Needed for multi-step writes and for multi-query reads, and it is the answer to "how do you keep two tables consistent".</p>' },
                        { name: 'Type converters', html: '<p>SQLite stores a handful of primitive types. A <code>@TypeConverter</code> maps anything else — an <code>Instant</code>, an enum, a list — to one of them. Storing a JSON blob this way is convenient and makes the field unqueryable, which is the trade to be aware of.</p>' },
                        { name: 'Paging support', html: '<p>A DAO can return a <code>PagingSource</code> directly, which is what M29 builds on.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p><strong>Migrations</strong> are where Room bites. The schema version is in your code, but the database is on the user’s device, and Room refuses to guess. Bump the version without supplying a path and every existing install crashes on open.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Three ways to migrate, in descending order of preference',
                    code: `// 1 — automatic, when the change is mechanical (added column, new table).
@Database(
    entities = [DraftEntity::class], version = 2,
    autoMigrations = [AutoMigration(from = 1, to = 2)]
)
abstract class AppDatabase : RoomDatabase()

// 2 — hand-written, when data has to be moved or transformed.
val MIGRATION_2_3 = object : Migration(2, 3) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE drafts ADD COLUMN wordCount INTEGER NOT NULL DEFAULT 0")
    }
}

// 3 — destructive. Correct only for a pure cache the app can rebuild.
Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .fallbackToDestructiveMigration()
    .build()`,
                    notes: 'Export the schema JSON (<code>room.schemaLocation</code>) and commit it. It is what lets Room generate automatic migrations and what lets you test a migration against the real previous schema.'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>fallbackToDestructiveMigration</code> deletes the user’s data on every version bump. It is the right answer for a cache that can be refetched and a serious bug for anything the user created — and it is very easy to add during development and forget before release.</p>'
                }
            ],
            docs: [
                { title: 'Save data in a local database using Room', path: '/training/data-storage/room', kind: 'guide' },
                { title: 'Migrate your Room database', path: '/training/data-storage/room/migrating-db-versions', kind: 'guide' },
                { title: 'Define relationships between objects', path: '/training/data-storage/room/relationships', kind: 'guide' },
                { title: 'Accessing data using Room DAOs', path: '/training/data-storage/room/accessing-data', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'other-topics', questionId: 'have-you-used-room' },
                { topicId: 'android', questionId: 'android-orm' },
                { topicId: 'android', questionId: 'android-persisting-data' }
            ]
        },

        {
            id: 'datastore',
            title: 'DataStore, and why SharedPreferences had to go',
            importance: 'must-know',
            summary: 'An async, transactional, Flow-based replacement for an API that could block the main thread.',
            interviewAngle: 'commit() versus apply() is the classic question; DataStore is the answer to why neither is good enough.',
            buildsOn: [],
            blocks: [
                {
                    type: 'comparison',
                    title: 'commit() versus apply()',
                    left: 'commit()',
                    right: 'apply()',
                    rows: [
                        { aspect: 'Writes to memory', left: 'Synchronously', right: 'Synchronously' },
                        { aspect: 'Writes to disk', left: 'Synchronously — on the calling thread', right: 'Asynchronously, on a background thread' },
                        { aspect: 'Returns', left: '<code>Boolean</code> success', right: '<code>void</code> — you never learn if it failed' },
                        { aspect: 'On the main thread', left: 'Blocks; can cause an ANR', right: 'Does not block' },
                        { aspect: 'Use', left: 'Only when you must know it landed', right: 'The default of the two' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Both have the same underlying problem, and it is not the write. Reading is synchronous by design, and the very first <code>getSharedPreferences</code> loads and parses the whole XML file on whatever thread asked — which for most apps is the main thread during startup. <code>apply()</code> also blocks the main thread anyway at <code>onPause</code>, because pending writes must be flushed before the activity can be considered stopped. There is no way to use the API correctly from the main thread, which is why it was replaced rather than improved.</p>'
                },
                {
                    type: 'definition',
                    term: 'DataStore',
                    important: true,
                    html: '<p>A replacement for <code>SharedPreferences</code> that reads through a <code>Flow</code> and writes through a <code>suspend</code> function. Both are asynchronous, updates are transactional, and errors surface as exceptions on the flow rather than vanishing.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Preferences DataStore',
                    code: `private val Context.settings by preferencesDataStore(name = "settings")
private val THEME = stringPreferencesKey("theme")

// A stream — the UI recomposes when the value changes, from anywhere.
val theme: Flow<String> = context.settings.data
    .catch { if (it is IOException) emit(emptyPreferences()) else throw it }
    .map { it[THEME] ?: "system" }

// A transaction — read-modify-write, with no lost update.
suspend fun setTheme(value: String) {
    context.settings.edit { it[THEME] = value }
}`,
                    notes: 'The <code>catch</code> is not optional boilerplate. A corrupt file surfaces as an <code>IOException</code> on the flow, and without handling it the collector crashes.'
                },
                {
                    type: 'comparison',
                    title: 'Preferences DataStore versus Proto DataStore',
                    left: 'Preferences',
                    right: 'Proto',
                    rows: [
                        { aspect: 'Schema', left: 'None — string keys', right: 'Defined in a <code>.proto</code> file' },
                        { aspect: 'Type safety', left: 'At the key, not the store', right: 'Full — the compiler checks it' },
                        { aspect: 'Typos', left: 'Return null at runtime', right: 'Do not compile' },
                        { aspect: 'Setup', left: 'None', right: 'Protobuf plugin and a serializer' },
                        { aspect: 'Right for', left: 'A handful of flat settings', right: 'A structured object with real invariants' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Migrating is a one-liner — <code>SharedPreferencesMigration</code> passed to the builder copies existing values across on first read, so users keep their settings. Being able to say that is what makes "we should move to DataStore" a proposal rather than a wish.</p>'
                }
            ],
            docs: [
                { title: 'DataStore', path: '/topic/libraries/architecture/datastore', kind: 'guide' },
                { title: 'Save key-value data', path: '/training/data-storage/shared-preferences', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-datastore-preferences' },
                { topicId: 'android', questionId: 'android-commit-vs-apply' },
                { topicId: 'android', questionId: 'android-data-storage-options' }
            ]
        },

        {
            id: 'sqlite-and-files',
            title: 'SQLite underneath, and files beside it',
            importance: 'should-know',
            summary: 'Room is SQL you did not write — and knowing the SQL is what makes a slow query fixable.',
            interviewAngle: 'Query optimisation and indexing come up in system-design rounds more than in Android rounds, and are worth having ready.',
            buildsOn: ['room'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Room generates SQLite queries; it does not make them fast. A screen that stutters while scrolling a Room-backed list is almost always a missing index or a query doing work per row, and neither is visible from the DAO interface.</p>'
                },
                {
                    type: 'types',
                    title: 'The levers, in the order they pay off',
                    items: [
                        { name: 'Index what you filter and sort on', html: '<p>An unindexed <code>WHERE</code> is a full table scan. Add <code>@Entity(indices = [Index("authorId")])</code> for the columns queries actually use — and not for every column, because each index costs space and slows writes.</p>' },
                        { name: 'Select only the columns you need', html: '<p><code>SELECT *</code> on a table with a large text or blob column loads that column for every row. Room can project into a smaller data class, which is often the single biggest win.</p>' },
                        { name: 'Read EXPLAIN QUERY PLAN', html: '<p>SQLite will tell you whether it used an index or scanned. <code>SCAN TABLE</code> on a large table is the thing you are looking for.</p>' },
                        { name: 'Batch writes in one transaction', html: '<p>Each implicit transaction is a disk sync. Inserting a thousand rows individually is orders of magnitude slower than one <code>@Transaction</code>.</p>' },
                        { name: 'Do not query in a loop', html: '<p>N+1 in a list adapter is the classic. <code>@Relation</code> or a join fetches it in one pass.</p>' }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Normalisation versus denormalisation',
                    left: 'Normalised',
                    right: 'Denormalised',
                    rows: [
                        { aspect: 'Data is stored', left: 'Once, referenced by key', right: 'Duplicated where it is read' },
                        { aspect: 'Writes', left: 'Cheap and consistent', right: 'Must update every copy' },
                        { aspect: 'Reads', left: 'Need joins', right: 'One row, no join' },
                        { aspect: 'Risk', left: 'Slow read-heavy screens', right: 'Copies drifting out of step' },
                        { aspect: 'On a phone', left: 'The default', right: 'A considered fix for a measured problem' }
                    ]
                },
                {
                    type: 'types',
                    title: 'When the answer is not a database',
                    items: [
                        { name: 'App-private files', html: '<p><code>filesDir</code> for things you must keep, <code>cacheDir</code> for things the system may delete under pressure. Neither needs a permission, and both go on uninstall (M17).</p>' },
                        { name: 'MediaStore', html: '<p>Photos, video and audio the user should see in their gallery. Under scoped storage this is the route to shared media, and your own entries need no permission.</p>' },
                        { name: 'A structured binary format', html: '<p>FlatBuffers and Protobuf are read without a parse step, so a large payload becomes accessible with no allocation per field. Worth naming against JSON when the question is about a large local dataset rather than an API.</p>' },
                        { name: 'Nothing', html: '<p>Derived data — a formatted string, a computed total — should be recomputed, not stored. Persisting it creates a second copy to keep in step.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'SQLite performance best practices', path: '/topic/performance/sqlite-performance-best-practices', kind: 'guide' },
                { title: 'Storage and files', path: '/training/data-storage', kind: 'guide' },
                { title: 'Media store', path: '/training/data-storage/shared/media', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'other-topics', questionId: 'describe-sqlite' },
                { topicId: 'android-system-design', questionId: 'query-optimization-sqlite' },
                { topicId: 'android-system-design', questionId: 'database-normalization-vs-denormalization' },
                { topicId: 'android', questionId: 'android-flatbuffers-vs-json' }
            ]
        }
    ]
};
