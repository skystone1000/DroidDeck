/* ==========================================================================
   M28 — Networking.

   Retrofit and OkHttp are two libraries and one stack, and most of the
   interesting behaviour — pooling, caching, retries, pinning — lives in the
   lower of the two. So the module is organised by where the behaviour is,
   not by which import you typed.
   ========================================================================== */

const networkingModule = {
    id: 'networking',
    trackId: 'data',
    order: 28,
    title: 'Networking',
    tagline: 'A typed interface on top, and everything that matters underneath.',
    estimatedMinutes: 35,
    prerequisites: ['data-layer'],
    docHub: {
        title: 'Connectivity',
        path: '/develop/connectivity'
    },

    chapters: [
        {
            id: 'retrofit-okhttp',
            title: 'Retrofit over OkHttp',
            importance: 'must-know',
            summary: 'Retrofit turns an annotated interface into HTTP calls; OkHttp makes them.',
            interviewAngle: 'The interceptor question is the one that comes up, and the application-versus-network distinction is the answer.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Retrofit is a code generator with a very small job: you declare an interface, and it produces an implementation that builds requests and parses responses. Everything about how the request actually travels — connections, retries, caching, TLS — belongs to OkHttp underneath. Knowing which layer owns a behaviour is most of what the interview is checking.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The interface, and the client under it',
                    code: `interface UserApi {
    @GET("users/{id}")
    suspend fun getUser(@Path("id") id: String): UserDto

    @GET("users")
    suspend fun search(@Query("q") query: String, @Query("page") page: Int): PageDto

    @POST("users")
    suspend fun create(@Body body: CreateUserDto): UserDto

    @Multipart
    @POST("users/{id}/avatar")
    suspend fun uploadAvatar(
        @Path("id") id: String,
        @Part file: MultipartBody.Part          // the file itself
    ): UserDto
}

private val client = OkHttpClient.Builder()
    .addInterceptor(AuthInterceptor(tokens))    // application interceptor
    .addNetworkInterceptor(StethoInterceptor()) // network interceptor
    .cache(Cache(File(context.cacheDir, "http"), 10L * 1024 * 1024))
    .build()

private val retrofit = Retrofit.Builder()
    .baseUrl("https://api.example.com/")
    .client(client)
    .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
    .build()`,
                    notes: 'A <code>suspend</code> function on the interface is all that is needed for coroutine support; Retrofit calls it on OkHttp’s own thread pool, so wrapping it in <code>withContext(IO)</code> adds nothing (M26).'
                },
                {
                    type: 'comparison',
                    title: 'Application versus network interceptors',
                    left: 'addInterceptor',
                    right: 'addNetworkInterceptor',
                    rows: [
                        { aspect: 'Sees', left: 'The call as your code made it', right: 'The bytes actually on the wire' },
                        { aspect: 'On a cache hit', left: 'Still runs', right: 'Does not run at all' },
                        { aspect: 'On a redirect or retry', left: 'Once', right: 'Once per attempt' },
                        { aspect: 'Sees headers OkHttp adds', left: 'No', right: 'Yes — <code>Host</code>, encoding, cookies' },
                        { aspect: 'Use for', left: 'Auth headers, logging your intent', right: 'Debugging the real traffic, per-hop work' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>That "does not run at all on a cache hit" row is the practical difference. An auth header added by a network interceptor is missing whenever the response came from cache, and a logger installed there will quietly under-report. Auth goes in an application interceptor; anything that must reflect what really crossed the network goes in a network one.</p>'
                },
                {
                    type: 'types',
                    title: 'Things worth knowing about the client',
                    items: [
                        { name: 'Share one OkHttpClient', html: '<p>It owns the connection pool, the thread pool and the cache. Creating one per request throws away connection reuse, which is usually the single largest avoidable cost in an app’s networking.</p>' },
                        { name: 'Connection pooling and keep-alive', html: '<p>Reusing an established connection skips the TCP and TLS handshakes — on a mobile network that is often more time than the request itself.</p>' },
                        { name: 'Authenticator versus interceptor', html: '<p>An interceptor adds the token to every request. An <code>Authenticator</code> is called <em>after</em> a 401, which is where token refresh belongs — it retries the original request once a fresh token exists, and OkHttp stops it looping.</p>' },
                        { name: 'Logging', html: '<p><code>HttpLoggingInterceptor</code> at <code>BODY</code> level in debug builds only. Left on in release it prints tokens and user data into logcat, which is a real incident and not a hypothetical one.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Connectivity', path: '/develop/connectivity', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-libraries', questionId: 'okhttp-interceptor' },
                { topicId: 'android-libraries', questionId: 'okhttp-logging' },
                { topicId: 'android-libraries', questionId: 'android-multipart-request' },
                { topicId: 'android-system-design', questionId: 'design-networking-library' }
            ]
        },

        {
            id: 'serialization',
            title: 'Turning JSON into objects',
            importance: 'should-know',
            summary: 'Three libraries, and the axis that separates them is reflection versus code generation.',
            interviewAngle: 'Naming kotlinx.serialization and why it understands Kotlin nullability is a small, current-sounding detail.',
            buildsOn: ['retrofit-okhttp'],
            blocks: [
                {
                    type: 'table',
                    title: 'The three you will meet',
                    headers: ['', 'How', 'Kotlin defaults & nullability', 'Cost'],
                    rows: [
                        ['kotlinx.serialization', 'Compiler plugin', 'Understood natively', 'Build plugin; the current default'],
                        ['Moshi', 'Codegen (or reflection)', 'Understood, with codegen', 'An annotation processor'],
                        ['Gson', 'Reflection', 'Ignored — silently', 'None, and that is the problem']
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Gson constructs objects without calling their constructors, so a non-null Kotlin field whose JSON key is missing ends up <strong>null anyway</strong>, and default values are not applied. The crash then happens somewhere else entirely, in code the compiler promised was null-safe. This is the strongest single argument for the other two.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A DTO, and the mapping boundary from M26',
                    code: `@Serializable
data class UserDto(
    val id: String,
    @SerialName("display_name") val displayName: String,
    val avatarUrl: String? = null,          // genuinely optional, with a default
    @SerialName("created_at") val createdAt: String
)

// Mapped at the data-source boundary, so the API's shape stops here.
fun UserDto.toUser() = User(
    id = id,
    name = displayName,
    avatar = avatarUrl?.toUri(),
    createdAt = Instant.parse(createdAt)
)`,
                    notes: 'Configure the parser to ignore unknown keys. A backend adding a field should never break an installed app, and by default several of these parsers throw.'
                },
                {
                    type: 'prose',
                    html: '<p>The DTO-to-model mapping looks like boilerplate and buys two specific things: a backend rename becomes a one-line change in one file, and the app’s own model can use types the wire format cannot carry — <code>Instant</code> instead of a string, an enum instead of an integer, a non-null field where the API is merely sloppy.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>When the payload is large and read repeatedly rather than parsed once, a binary format changes the shape of the problem: FlatBuffers is read in place with no parse step and no allocation per field. Worth naming as the answer for a big local dataset, and not as a general replacement for JSON on an API.</p>'
                }
            ],
            docs: [
                { title: 'kotlinx.serialization', url: 'https://github.com/Kotlin/kotlinx.serialization', kind: 'guide' },
                { title: 'Connectivity', path: '/develop/connectivity', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-flatbuffers-vs-json' },
                { topicId: 'android', questionId: 'android-serializable-vs-parcelable' }
            ]
        },

        {
            id: 'caching-and-resilience',
            title: 'Caching, retries and TLS',
            importance: 'must-know',
            summary: 'A mobile network fails constantly, so the interesting design is what happens when a call does not work.',
            interviewAngle: '"How do you handle a flaky network?" wants backoff, idempotency and a cache — in that order of sophistication.',
            buildsOn: ['retrofit-okhttp'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>OkHttp implements the HTTP cache properly, which means it obeys the server. Give it a <code>Cache</code> and responses with <code>Cache-Control: max-age</code> are served from disk without a request at all; responses with an <code>ETag</code> produce a conditional request that usually comes back <code>304 Not Modified</code> with no body. Both are free, and both depend on headers you may not control.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Overriding the server, in both directions',
                    code: `// Accept stale data when there is no connection at all.
val offlineFallback = Interceptor { chain ->
    val request = if (!network.isOnline()) {
        chain.request().newBuilder()
            .cacheControl(CacheControl.Builder().maxStale(7, TimeUnit.DAYS).build())
            .build()
    } else chain.request()
    chain.proceed(request)
}

// Force a genuinely fresh read, ignoring anything cached.
@GET("users/{id}")
@Headers("Cache-Control: no-cache")
suspend fun getUserFresh(@Path("id") id: String): UserDto`,
                    notes: 'This is a cache of HTTP responses, not of your domain objects. It cannot answer a query, cannot be observed, and disappears when the URL changes — which is why M26 wants a database rather than this.'
                },
                {
                    type: 'types',
                    title: 'Failing well',
                    items: [
                        {
                            name: 'Exponential backoff with jitter',
                            html: '<p>Retry after 1s, 2s, 4s, 8s — and add a random offset. Without jitter every client that failed during an outage retries in lockstep and knocks the server over again the moment it recovers.</p>'
                        },
                        {
                            name: 'Only retry what is safe',
                            html: '<p>GET is idempotent, so retrying is free. POST is not — a retried payment may charge twice. Either make the endpoint idempotent with a client-generated key, or do not retry it.</p>'
                        },
                        {
                            name: 'Idempotency keys',
                            html: '<p>The client generates a UUID per logical operation and sends it with every attempt; the server returns the original result for a repeat. This is what makes a write safe to retry, and it is the detail that makes an offline-sync answer (M29) credible.</p>'
                        },
                        {
                            name: 'Time out deliberately',
                            html: '<p>Separate connect, read and write timeouts. OkHttp defaults to ten seconds each, which is a long time to stare at a spinner on a train.</p>'
                        },
                        {
                            name: 'Do not retry a 4xx',
                            html: '<p>A 400 or 401 will fail identically next time. Retry 5xx, timeouts and connection failures — a blanket retry on every error burns battery to reach the same conclusion.</p>'
                        }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>On the transport itself: <strong>certificate pinning</strong> restricts which certificates you accept, so a device with a hostile CA installed cannot transparently proxy your traffic. It is genuinely useful and genuinely dangerous — a pin that expires before the app updates bricks every installed copy. Pin to an intermediate rather than a leaf, always pin a backup, and set an expiry. The declarative version is the network security config from M17, which is preferable because it cannot be bypassed by a stray client somewhere in a library.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Two things reduce data more than any protocol choice: request fewer bytes, and request them less often. Ask for the fields you need, let the image loader fetch a size appropriate to the view, batch analytics rather than sending per event, and use <code>WorkManager</code> constraints (M30) so non-urgent work waits for unmetered network. Image libraries like Glide and Coil are worth naming here — their whole design is a memory cache over a disk cache over the network, sized to the target view.</p>'
                }
            ],
            docs: [
                { title: 'Connectivity', path: '/develop/connectivity', kind: 'guide' },
                { title: 'Network security configuration', path: '/privacy-and-security/security-config', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-libraries', questionId: 'okhttp-caching' },
                { topicId: 'android-libraries', questionId: 'android-glide-fresco' },
                { topicId: 'android-system-design', questionId: 'network-optimization-mobile' },
                { topicId: 'android-system-design', questionId: 'design-image-loading-library' },
                { topicId: 'android', questionId: 'android-bitmap-handling' }
            ]
        },

        {
            id: 'protocols',
            title: 'Choosing how to talk to the server',
            importance: 'should-know',
            summary: 'Request/response, or a connection held open — and the choice is about who initiates.',
            interviewAngle: 'A system-design staple. The framing that works is latency requirement versus battery cost.',
            buildsOn: ['caching-and-resilience'],
            blocks: [
                {
                    type: 'table',
                    title: 'Getting data that changes',
                    headers: ['Approach', 'Initiated by', 'Latency', 'Cost on a phone'],
                    rows: [
                        ['Polling', 'Client, on a timer', 'Up to the interval', 'Wasteful — mostly empty responses'],
                        ['Long polling', 'Client, held open by server', 'Near real-time', 'Moderate — a connection per client'],
                        ['Server-sent events', 'Server, over one HTTP stream', 'Near real-time', 'Low; one-way only'],
                        ['WebSocket', 'Either, full duplex', 'Real-time', 'Highest — a live socket to keep alive'],
                        ['Push (FCM)', 'Server, via Google', 'Seconds', 'Lowest — one shared system connection']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The last row is the one that wins most Android arguments. A WebSocket held open by your app dies when the process is cached (M12) and keeps the radio awake while it lives; FCM shares a single connection maintained by the system for every app on the device. So the usual mobile answer is <strong>push to wake, then fetch</strong> — the notification carries an id, not the payload, and the app pulls the real data over ordinary HTTP.</p>'
                },
                {
                    type: 'types',
                    title: 'Shapes of API',
                    items: [
                        { name: 'REST', html: '<p>Resources and verbs over HTTP. Caches well because it uses HTTP the way HTTP expects, which the others largely give up.</p>' },
                        { name: 'GraphQL', html: '<p>One endpoint, and the client states the fields it wants. Solves over-fetching and the "we need a new endpoint for this screen" problem; costs you HTTP caching and makes server-side cost harder to reason about.</p>' },
                        { name: 'gRPC', html: '<p>Binary over HTTP/2 with a generated typed client and streaming in both directions. Fast and strict; awkward through proxies and not readable in a network log.</p>' },
                        { name: 'Webhook versus polling', html: '<p>The same question one layer out: the server calls you when something changes, rather than you asking repeatedly. On mobile the "you" is your backend, not the app — which is exactly why the push-to-wake pattern exists.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Answer the "real-time updates on Android" question by starting from the requirement rather than the technology: <em>"how stale is acceptable?" </em> Minutes means a scheduled sync. Seconds means push-to-wake. Sub-second and bidirectional — a call, a live cursor, a game — is the case that actually justifies a WebSocket, and only while the screen is in front of the user.</p>'
                }
            ],
            docs: [
                { title: 'Connectivity', path: '/develop/connectivity', kind: 'guide' },
                { title: 'Firebase Cloud Messaging', url: 'https://firebase.google.com/docs/cloud-messaging', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-system-design', questionId: 'http-request-long-polling-websocket-sse' },
                { topicId: 'android-system-design', questionId: 'real-time-updates-android' },
                { topicId: 'android-system-design', questionId: 'webhook-vs-polling' },
                { topicId: 'android-system-design', questionId: 'websocket-vs-socket-io' },
                { topicId: 'other-topics', questionId: 'fcm-push-notification-flow' }
            ]
        }
    ]
};
