const androidSystemDesignData = {
    id: "android-system-design",
    title: "Android System Design",
    subsections: null,
    keyTopics: ["Image Loading Library Design", "File Downloader Design", "Chat App Design", "Networking Library Design", "Caching Library Design", "Location-based App Design", "Offline-First Architecture", "LRU Cache Design", "Analytics/Logging Library", "HTTP vs Long-Polling vs WebSocket vs SSE", "Voice/Video Calls Architecture", "Data Syncing on Unstable Networks"],
    questions: [
        {
            id: "design-image-loading-library",
            importance: "must-know",
            question: "Design an Image Loading Library",
            answer: "<p><strong>🔑 Three decisions carry the whole design: a two-level cache, downsampling before you allocate, and cancelling the request when the view is recycled.</strong> Everything else is detail hanging off those.</p><p><strong>🔀 The pipeline</strong> — memory cache, then disk cache, then network, each falling through to the next and writing its result back up the chain. A memory hit is synchronous on the main thread; anything further is background work with a main-thread callback.</p><p><strong>⚙️ The three decisions</strong></p><ul><li><strong>Two-level cache.</strong> An <code>LruCache&lt;Key, Bitmap&gt;</code> at roughly an eighth of the app heap, keyed by URL <em>plus</em> target size <em>plus</em> transformations — two sizes of one URL are two entries. Behind it a <code>DiskLruCache</code> in <code>cacheDir</code>, keyed by a hash of the URL, holding the already-downsampled bytes so a cold start does not decode from scratch.</li><li><strong>Downsample first.</strong> <code>BitmapFactory.Options.inSampleSize</code>, computed against the view's measured size, before a full bitmap is ever allocated. This is the <code>OutOfMemoryError</code> defence — a camera photo decoded at full resolution does not fit.</li><li><strong>Cancel on recycle.</strong> Tag the <code>ImageView</code> with its current request, through <code>view.setTag</code> or a <code>WeakHashMap&lt;ImageView, Request&gt;</code>. When RecyclerView reuses the view, the in-flight request is cancelled so it cannot paint the old image into the new row.</li></ul><p><strong>⚙️ The rest</strong></p><ul><li><strong>API</strong> — a fluent builder producing an immutable <code>Request</code>: <code>ImageLoader.load(url).placeholder(R.drawable.ph).into(imageView)</code>. Error drawables, transformations (crop, blur, rounded corners) and animated GIF/WebP hang off the same builder.</li><li><strong>Fetch and threading</strong> — <code>OkHttp</code> for the network, a bounded pool (<code>Executors.newFixedThreadPool</code>) or a coroutine dispatcher for network and decode, results posted on <code>Dispatchers.Main</code>.</li><li><strong>LRU over LFU</strong> — scroll locality <em>is</em> recency, so LFU's extra bookkeeping buys nothing here.</li><li><strong>Bitmap pooling</strong> — a <code>BitmapPool</code> keyed by size and config cuts GC churn. It mattered most before Android 8 moved bitmap memory to the native heap.</li></ul><p><strong>🎯 Interview tip:</strong> Say the cancellation part out loud without being asked. Caching theory is table stakes; RecyclerView reuse is what the question is really testing.</p>",
            referenceLinks: [{ title: "Glide - Getting Started", url: "https://bumptech.github.io/glide/doc/getting-started.html" }, { title: "Coil documentation", url: "https://coil-kt.github.io/coil/" }],
            tags: ["system-design", "image-loading", "caching", "lru", "glide", "coil"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Image load pipeline",
                columns: 3,
                nodes: [
                    { label: "load(url)", type: "terminal" },
                    { label: "Memory cache hit?", type: "decision" },
                    { label: "Render bitmap", type: "terminal" },
                    { label: "Disk cache hit?", type: "decision" },
                    { label: "Decode + downsample", type: "decision" },
                    { label: "Network fetch" }
                ],
                connections: [
                    { from: 0, to: 1 },
                    { from: 1, to: 2, label: "yes" },
                    { from: 1, to: 3, label: "no" },
                    { from: 3, to: 4, label: "yes" },
                    { from: 3, to: 5, label: "no" },
                    { from: 4, to: 2 },
                    { from: 5, to: 2 }
                ]
            },
            codeSnippets: [{ language: "kotlin", title: "The request path through an image loader", code: "class ImageLoader(\n    private val memoryCache: LruCache<String, Bitmap>,\n    private val diskCache: DiskCache,\n    private val client: OkHttpClient,\n    private val scope: CoroutineScope\n) {\n    fun load(url: String): RequestBuilder = RequestBuilder(url, this)\n\n    fun enqueue(target: ImageView, url: String) {\n        val key = url.hashKey()\n        memoryCache.get(key)?.let { target.setImageBitmap(it); return }\n\n        target.tag = url\n        scope.launch {\n            val bitmap = withContext(Dispatchers.IO) { fetchAndDecode(url, key) }\n            if (target.tag == url) {\n                memoryCache.put(key, bitmap)\n                target.setImageBitmap(bitmap)\n            }\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "enqueue is called from onBindViewHolder with a target ImageView and a URL.",
                        "The URL is hashed into a cache key, and the memory cache is checked first — on a hit the bitmap is set synchronously and nothing else happens.",
                        "On a miss, the ImageView's tag is set to the URL. This is the recycling guard.",
                        "A coroutine is launched, and the fetch and decode happen on Dispatchers.IO.",
                        "While that is in flight the user scrolls, the row is recycled, and the same ImageView is bound to a different URL — which overwrites the tag.",
                        "The original request finishes and compares target.tag against its own URL. They no longer match, so it does NOT set the bitmap.",
                        "On a normal completion the tag still matches, the bitmap is put in the memory cache, and the ImageView is updated."
                    ],
                    explain: "<p>Steps 3, 5 and 6 are the whole reason this question is asked. <code>RecyclerView</code> reuses views, so a slow request for row 2 can finish after that view has been rebound to row 20 — and without the tag check it would paint the wrong image into it. Every image library solves this, and the tag comparison is the cheapest version of the solution.</p><p>The two-tier cache is the other half: memory for the instant hit, disk so a restart does not refetch. Real libraries add a third stage — an in-flight request map, so two views asking for the same URL share one download rather than starting two.</p>"
                } }],
            subsection: null
        },
        {
            id: "design-file-downloader-library",
            importance: "should-know",
            question: "Design a File Downloader Library",
            answer: "<p><strong>🔑 Requirements</strong></p><ul><li><strong>Resumable</strong> downloads across process death and connectivity loss, <strong>parallel</strong> chunked downloads for large files, progress reporting, retry with backoff, and pause/cancel.</li></ul><p><strong>⚙️ High-level components</strong></p><ul><li><strong>Download manager</strong> — accepts a <code>DownloadRequest(url, destPath, headers)</code>, assigns an ID, persists state to a Room table so downloads survive process death.</li><li><strong>Range-request chunker</strong> — issues an initial <code>HEAD</code> to read <code>Content-Length</code> and check <code>Accept-Ranges: bytes</code>; splits the file into N byte-range chunks and downloads each with an HTTP <code>Range: bytes=start-end</code> header.</li><li><strong>WorkManager</strong> — backs the actual download in a <code>CoroutineWorker</code> so it survives app-kill and respects OS constraints (network type, charging); <code>WorkManager</code> handles retry/backoff via <code>Result.retry()</code>.</li><li><strong>Persistence</strong> — a <code>.part</code> file per chunk plus a metadata row (bytes-written, ETag) so a resume can validate the file hasn't changed server-side before continuing.</li><li><strong>Progress bus</strong> — a <code>Flow&lt;DownloadState&gt;</code> or <code>LiveData</code> per download ID that the UI collects.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Resuming without checking <code>ETag</code>/<code>Last-Modified</code> can silently corrupt a file that changed on the server between attempts.</li><li>Foreground service (or an expedited <code>WorkManager</code> job) is required for long downloads on Android 8+ due to background execution limits.</li></ul><p><strong>🎯 Interview tip:</strong> Mention <code>WorkManager</code>'s built-in constraint + retry system before hand-rolling your own — most interviewers want to see you know when not to reinvent infrastructure.</p>",
            referenceLinks: [{ title: "WorkManager guide", url: "https://developer.android.com/develop/background-work/background-tasks/persistent" }, { title: "HTTP Range requests — MDN", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests" }],
            tags: ["system-design", "downloader", "workmanager", "resumable", "chunking"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "A chunked, resumable download worker", code: "class ChunkDownloadWorker(\n    context: Context,\n    params: WorkerParameters\n) : CoroutineWorker(context, params) {\n\n    override suspend fun doWork(): Result {\n        val url = inputData.getString(\"url\") ?: return Result.failure()\n        val start = inputData.getLong(\"start\", 0)\n        val end = inputData.getLong(\"end\", 0)\n        val partFile = File(inputData.getString(\"partPath\")!!)\n\n        return try {\n            val alreadyWritten = partFile.length()\n            val request = Request.Builder()\n                .url(url)\n                .header(\"Range\", \"bytes=${start + alreadyWritten}-$end\")\n                .build()\n\n            client.newCall(request).execute().use { response ->\n                if (!response.isSuccessful) return Result.retry()\n                FileOutputStream(partFile, true).use { out ->\n                    response.body?.byteStream()?.copyTo(out)\n                }\n            }\n            Result.success()\n        } catch (e: IOException) {\n            Result.retry()\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "The file is split into ranges, and one WorkManager job is enqueued per chunk with its start and end offsets.",
                        "doWork reads how many bytes the part file already holds — non-zero if this is a retry.",
                        "The Range header is built from the original start PLUS what is already on disk, so a resumed chunk asks only for the remainder.",
                        "The server replies 206 Partial Content and streams from that offset.",
                        "Bytes are appended to the part file as they arrive, so progress survives the process being killed.",
                        "If the connection drops, the worker returns Result.retry() and WorkManager reschedules it with backoff.",
                        "When every chunk succeeds, the part files are concatenated in order into the final file."
                    ],
                    explain: "<p>Steps 2 and 3 are what makes this resumable rather than merely retryable. The state lives in the file system — the length of the part file <em>is</em> the progress — so nothing has to be persisted separately and a killed process loses nothing.</p><p>WorkManager is doing the unglamorous work here: surviving process death, waiting for connectivity, and applying backoff. Rolling that by hand is where most homegrown downloaders go wrong.</p><p>The chunking assumes the server honours <code>Range</code>. It usually does, and the fallback when it does not is a single-stream download that restarts from zero.</p>"
                } }],
            subsection: null
        },
        {
            id: "design-whatsapp",
            importance: "should-know",
            question: "Design WhatsApp",
            answer: "<p><strong>🔑 Write locally first. The message is in Room and on screen before the network is involved, and an outbox delivers it afterwards.</strong> That one idea answers both &quot;how does it work offline&quot; and &quot;why does it feel instant&quot;.</p><p><strong>⚙️ How that plays out</strong></p><ul><li><strong>Local-first store.</strong> Every outgoing message lands in Room as <code>PENDING</code> and renders immediately, then moves to <code>SENT</code>, <code>DELIVERED</code> and <code>READ</code> as acknowledgements come back.</li><li><strong>Outbox.</strong> A <code>WorkManager</code> queue retries the <code>PENDING</code> rows with exponential backoff under a network constraint, so reconnecting is what triggers delivery rather than a poll.</li><li><strong>Transport.</strong> A persistent <strong>WebSocket</strong> to a messaging gateway while the app is foregrounded, and <strong>FCM</strong> push-to-wake once the socket is gone. The socket buys latency and costs battery, which is exactly why it is not kept open all the time.</li><li><strong>IDs and ordering.</strong> A client-generated UUID plus a monotonic per-device sequence number, so the server can dedupe a retried send and clients can merge a conversation across devices.</li><li><strong>Encryption.</strong> Signal Protocol — a per-conversation Double Ratchet session key, generated and kept on the device. The server relays ciphertext it cannot read.</li><li><strong>Media.</strong> Upload to blob storage first; the message carries a URL and a thumbnail, and the full file downloads on demand.</li></ul><p><strong>🎯 Interview tip:</strong> Open with local-first plus outbox and let everything else follow from it. Starting with the WebSocket instead makes the offline story sound like an afterthought, which is the wrong order.</p>",
            referenceLinks: [{ title: "Signal Protocol overview", url: "https://signal.org/docs/" }, { title: "WorkManager guide", url: "https://developer.android.com/develop/background-work/background-tasks/persistent" }],
            tags: ["system-design", "chat", "websocket", "offline-first", "encryption", "fcm"],
            hasDiagram: true,
            diagramType: "sequence",
            diagramConfig: {
                title: "Sending a message",
                actors: ["UI", "Local DB", "Outbox Worker", "Server"],
                messages: [
                    { from: 0, to: 1, label: "insert PENDING" },
                    { from: 1, to: 0, label: "render optimistic" },
                    { from: 2, to: 3, label: "send over socket" },
                    { from: 3, to: 2, label: "ACK", dashed: true },
                    { from: 2, to: 1, label: "update SENT" }
                ]
            },
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-instagram-stories",
            importance: "should-know",
            question: "Design Instagram Stories",
            answer: "<p><strong>🔑 Requirements</strong></p><ul><li>Full-screen, auto-advancing image/video slides per user, 24-hour expiry, seen/unseen tracking, preloading for smooth transitions, and low-bandwidth playback.</li></ul><p><strong>⚙️ High-level components</strong></p><ul><li><strong>Story tray</strong> — a horizontally-scrolling list of users with unseen-story ring indicators; backed by a paginated feed API sorted by recency/affinity.</li><li><strong>Story viewer</strong> — a <code>ViewPager2</code>/Compose <code>HorizontalPager</code> of full-screen slides; each slide is a state machine (<code>Loading → Playing → Paused → Next</code>) driven by a per-slide countdown timer for images or the video's own duration.</li><li><strong>Prefetch pipeline</strong> — while slide N plays, slide N+1's media is prefetched and decoded in the background so the transition has zero perceived latency; images use the same disk/memory cache as the rest of the app, videos use a small ring buffer of pre-buffered <code>ExoPlayer</code> instances.</li><li><strong>Expiry</strong> — stories carry a server timestamp + TTL; client filters expired stories locally and the tray refetches periodically.</li><li><strong>Seen tracking</strong> — client fires a lightweight \"seen\" event (batched, not per-frame) once a slide crosses a dwell-time threshold; local cache marks the ring as seen immediately (optimistic) ahead of server confirmation.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>Preload depth</strong> — prefetching more slides ahead smooths playback but wastes bandwidth/battery if the user exits early; typically limited to 1–2 slides ahead.</li></ul><p><strong>🎯 Interview tip:</strong> The interesting system-design meat here is the prefetch/playback state machine, not the CRUD — spend your time there.</p>",
            referenceLinks: [{ title: "ExoPlayer (Media3) guide", url: "https://developer.android.com/media/media3/exoplayer" }, { title: "ViewPager2 guide", url: "https://developer.android.com/develop/ui/views/animations/screen-slide-2" }],
            tags: ["system-design", "stories", "media", "prefetch", "exoplayer", "viewpager"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-networking-library",
            importance: "must-know",
            question: "Design a Networking Library",
            answer: "<p><strong>🔑 Requirements</strong></p><ul><li>Type-safe request/response mapping, connection pooling, interceptors for auth/logging/retry, cancellation tied to lifecycle, and testability.</li></ul><p><strong>⚙️ High-level components</strong></p><ul><li><strong>Transport layer</strong> — a connection-pooled HTTP client (OkHttp-style) handling TCP/TLS reuse, timeouts, and HTTP/2 multiplexing.</li><li><strong>Interceptor chain</strong> — an ordered pipeline (<code>Interceptor.Chain</code>) where each interceptor can inspect/modify the request or response: <code>AuthInterceptor</code> (attach token, refresh on 401), <code>LoggingInterceptor</code>, <code>RetryInterceptor</code> (exponential backoff on 5xx/timeout), <code>CacheInterceptor</code> (respect <code>Cache-Control</code>).</li><li><strong>Serialization</strong> — a converter factory (Moshi/kotlinx.serialization) mapping JSON ↔ Kotlin data classes at the edge, so business logic never touches raw JSON.</li><li><strong>Declarative API layer</strong> — Retrofit-style annotated interfaces (<code>@GET</code>, <code>@Body</code>) generating implementation via dynamic proxy/codegen, returning <code>suspend fun</code> or <code>Flow</code>.</li><li><strong>Cancellation</strong> — requests scoped to a <code>CoroutineScope</code> (e.g. <code>viewModelScope</code>) so cancelling the scope cancels in-flight calls automatically.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>Interceptors vs a single monolithic client</strong> — interceptors add indirection but keep cross-cutting concerns (auth, logging, retry) composable and independently testable.</li></ul><p><strong>🎯 Interview tip:</strong> Draw the interceptor chain as a pipeline — it is the piece most candidates gloss over, and it is exactly what production networking libraries are built around.</p>",
            referenceLinks: [{ title: "OkHttp Interceptor (API reference)", url: "https://javadoc.io/doc/com.squareup.okhttp3/okhttp/latest/okhttp3/Interceptor.html" }, { title: "Retrofit API reference", url: "https://javadoc.io/doc/com.squareup.retrofit2/retrofit/latest/index.html" }],
            tags: ["system-design", "networking", "okhttp", "retrofit", "interceptors"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Interceptor chain",
                columns: 3,
                nodes: [
                    { label: "Request built", type: "terminal" },
                    { label: "Auth interceptor" },
                    { label: "Retry interceptor" },
                    { label: "Logging interceptor" },
                    { label: "Connection pool" },
                    { label: "Response parsed", type: "terminal" }
                ],
                connections: [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                    { from: 3, to: 4 },
                    { from: 4, to: 5 }
                ]
            },
            codeSnippets: [{ language: "kotlin", title: "An auth interceptor that refreshes a token", code: "class AuthInterceptor(\n    private val tokenStore: TokenStore\n) : Interceptor {\n    override fun intercept(chain: Interceptor.Chain): Response {\n        val request = chain.request().newBuilder()\n            .header(\"Authorization\", \"Bearer ${tokenStore.accessToken}\")\n            .build()\n\n        val response = chain.proceed(request)\n        if (response.code == 401) {\n            response.close()\n            val refreshed = tokenStore.refreshBlocking()\n            if (refreshed) {\n                val retried = request.newBuilder()\n                    .header(\"Authorization\", \"Bearer ${tokenStore.accessToken}\")\n                    .build()\n                return chain.proceed(retried)\n            }\n        }\n        return response\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "Every request passes through the interceptor chain before reaching the network.",
                        "The interceptor copies the request and adds the current access token as an Authorization header.",
                        "chain.proceed sends it and blocks this call's thread until the response arrives.",
                        "A 401 means the token expired. The response body is closed — leaking it would exhaust the connection pool.",
                        "refreshBlocking exchanges the refresh token for a new access token, synchronously, because an interceptor cannot suspend.",
                        "The original request is rebuilt with the new token and proceeded a second time.",
                        "The caller receives the successful response and never learns that any of this happened."
                    ],
                    explain: "<p>Step 7 is the design goal: refreshing is invisible to every call site, so no screen has to know what a 401 means.</p><p>Step 4 is the bug most implementations ship with. An OkHttp <code>Response</code> holds a connection until its body is closed or consumed, and a discarded 401 body leaks one every time.</p><p>The real hazard is not shown: if twenty requests get a 401 at once, twenty threads call <code>refreshBlocking</code> and the refresh token is spent twenty times — which many backends treat as a replay attack. Production versions guard the refresh with a mutex, or use OkHttp's <code>Authenticator</code>, which exists for exactly this and is retried only once by design.</p>"
                } }],
            subsection: null
        },
        {
            id: "design-facebook-nearby-friends",
            importance: "should-know",
            question: "Design Facebook Near-By Friends App",
            answer: "<p><strong>🔑 Requirements</strong></p><ul><li>Show friends within a radius, update in near-real-time as people move, opt-in privacy, and battery-conscious location tracking.</li></ul><p><strong>⚙️ High-level components</strong></p><ul><li><strong>Location provider</strong> — <code>FusedLocationProviderClient</code> with an adaptive update interval (denser updates when the app is foregrounded/actively viewing the map, sparser via a low-priority background request otherwise) to bound battery drain.</li><li><strong>Geohashing</strong> — encode lat/lng into a <strong>geohash</strong> string; nearby users share a common prefix, letting the server query \"friends near me\" as a prefix range query instead of a full geo-distance scan.</li><li><strong>Upload path</strong> — client posts location deltas (only when moved &gt; threshold or on a timer) to the server; server fans out proximity updates to friends currently viewing the map via WebSocket/FCM data message.</li><li><strong>Client rendering</strong> — a map (Maps SDK) with clustered markers; friend positions interpolated/animated between updates rather than jump-cut, to feel smooth despite sparse pings.</li><li><strong>Privacy controls</strong> — explicit opt-in, precision reduction (round to ~100m), and automatic timeout that turns sharing off after N hours.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>Update frequency vs battery</strong> — higher frequency location gives a more \"live\" feel but is the single biggest battery cost in the whole feature; almost every design decision here is a tuning knob on that trade-off.</li></ul><p><strong>🎯 Interview tip:</strong> Geohashing is the concept interviewers are fishing for — know how prefix-matching turns a 2D nearest-neighbor problem into a simple indexed string query.</p>",
            referenceLinks: [{ title: "FusedLocationProviderClient", url: "https://developer.android.com/develop/sensors-and-location/location/retrieve-current" }, { title: "Geohash — Wikipedia-adjacent spec reference", url: "https://developer.android.com/develop/sensors-and-location/location" }],
            tags: ["system-design", "location", "geohashing", "fusedlocation", "privacy"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-caching-library",
            importance: "should-know",
            question: "Design a Caching Library",
            answer: "<p><strong>🔑 Requirements</strong></p><ul><li>Generic key-value cache with pluggable eviction, a fast in-memory tier, an optional persistent tier, TTL expiry, and thread safety.</li></ul><p><strong>⚙️ High-level components</strong></p><ul><li><strong>Layered cache</strong> — an in-memory <code>LruCache</code>/<code>LinkedHashMap</code>-based tier (fast, volatile) in front of a disk tier (survives process death) in front of the real data source (network/DB).</li><li><strong>Eviction policy</strong> — pluggable strategy interface (<code>LRU</code>, <code>LFU</code>, <code>FIFO</code>) so callers can pick based on access pattern; default LRU via a doubly-linked list + hash map for O(1) get/put/evict.</li><li><strong>TTL</strong> — each entry stores an expiry timestamp; checked lazily on read (expired ⇒ treat as miss) and swept periodically to reclaim memory.</li><li><strong>Concurrency</strong> — reads/writes guarded by a striped lock or a single-writer coroutine <code>Mutex</code> per key to avoid a thundering herd of duplicate fetches for the same key.</li><li><strong>Write policies</strong> — <strong>write-through</strong> (write to cache and source together, consistent but slower) vs <strong>write-back</strong> (write to cache immediately, flush to source async, faster but riskier on crash).</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>Memory-only vs layered</strong> — a disk tier survives process death but adds I/O latency and serialization cost; layering gets both speed and durability.</li></ul><p><strong>🎯 Interview tip:</strong> Bring up the thundering-herd problem (many callers missing the cache for the same key simultaneously) — it's the detail that separates a toy answer from a production one.</p>",
            referenceLinks: [{ title: "LruCache", url: "https://developer.android.com/reference/android/util/LruCache" }, { title: "Jetpack DataStore (as a persistent layer example)", url: "https://developer.android.com/topic/libraries/architecture/datastore" }],
            tags: ["system-design", "caching", "lru", "ttl", "eviction", "concurrency"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "A per-key mutex against the thundering herd", code: "class SingleFlightCache<K, V>(\n    private val loader: suspend (K) -> V\n) {\n    private val cache = LruCache<K, V>(100)\n    private val locks = ConcurrentHashMap<K, Mutex>()\n\n    suspend fun get(key: K): V {\n        cache.get(key)?.let { return it }\n\n        val mutex = locks.getOrPut(key) { Mutex() }\n        return mutex.withLock {\n            cache.get(key)?.let { return@withLock it }\n            val value = loader(key)\n            cache.put(key, value)\n            value\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "Ten coroutines ask for the same missing key at the same moment.",
                        "All ten miss the cache, because none of them has loaded anything yet.",
                        "They all reach for the same Mutex, since getOrPut is keyed on the cache key.",
                        "One wins and enters the critical section; the other nine suspend — without blocking any thread.",
                        "The winner re-checks the cache inside the lock. Still empty, so it calls the loader once.",
                        "It stores the result and releases the mutex.",
                        "The other nine enter one at a time, hit the second cache check, and return the stored value immediately. The loader ran once, not ten times."
                    ],
                    explain: "<p>Step 5 is the part that looks redundant and is not. The <strong>double-checked</strong> pattern — miss, take the lock, check again — is what stops the nine waiters each running the loader after the winner has already finished. Without the inner check, the mutex serialises the stampede instead of preventing it.</p><p>The mutex is per key, so unrelated keys never contend. That is also the leak in this version: <code>locks</code> grows forever, one entry per key ever requested, and a production implementation removes the mutex once the load completes.</p>"
                } }],
            subsection: null
        },
        {
            id: "design-location-based-app",
            importance: "should-know",
            question: "Design problems based on location-based app",
            answer: "<p><strong>🔑 Common question shapes</strong></p><ul><li>\"Design a food delivery tracker\", \"design a fitness tracker route recorder\", \"design geofenced reminders\" — all share the same underlying primitives.</li></ul><p><strong>⚙️ Shared building blocks</strong></p><ul><li><strong>Location acquisition</strong> — <code>FusedLocationProviderClient.requestLocationUpdates()</code> with a <code>LocationRequest</code> tuned per use case: high accuracy + short interval for live tracking, balanced power for background reminders.</li><li><strong>Geofencing</strong> — <code>GeofencingClient</code> registers circular regions; the OS wakes the app via a <code>PendingIntent</code> on enter/exit/dwell without the app polling location continuously — far more battery-efficient than manual distance checks.</li><li><strong>Background execution</strong> — a foreground service with a location notification for continuous tracking (required on Android 10+ for background location access, plus the <code>ACCESS_BACKGROUND_LOCATION</code> permission).</li><li><strong>Server-side geo queries</strong> — geohashing or a geospatial index (PostGIS, Elasticsearch geo_point) for \"nearby X\" queries at scale.</li><li><strong>Route/track storage</strong> — a local Room table of timestamped lat/lng points, simplified with an algorithm like Douglas-Peucker before upload to cut payload size without visibly distorting the path.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Polling location in a tight loop instead of using geofences or adaptive intervals is the most common battery-drain mistake candidates propose.</li></ul><p><strong>🎯 Interview tip:</strong> Whichever variant you're asked, always mention geofencing as the battery-efficient alternative to continuous polling — it signals real platform knowledge.</p>",
            referenceLinks: [{ title: "Create and monitor geofences", url: "https://developer.android.com/develop/sensors-and-location/location/geofencing" }, { title: "Location updates in the background", url: "https://developer.android.com/develop/sensors-and-location/location/background" }],
            tags: ["system-design", "location", "geofencing", "fusedlocation", "background"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-offline-first-app",
            importance: "must-know",
            question: "How to build an offline-first app?",
            answer: "<p><strong>🔑 The local database is the single source of truth. The UI reads Room and never the network; the repository's only job is keeping Room fresh.</strong> Offline stops being a special case, because there is no code path that needed the network.</p><p><strong>⚙️ What follows from that</strong></p><ul><li><strong>Read path.</strong> The UI observes a Room <code>Flow</code> or <code>LiveData</code> query. The repository kicks off a background refresh into Room, but the screen has already rendered whatever was there — never blank, never a spinner over nothing.</li><li><strong>Write path.</strong> Write to Room first, marked <code>dirty</code> or <code>pending</code>, then let a <code>WorkManager</code> job push those rows up under <code>NetworkType.CONNECTED</code> with exponential backoff.</li><li><strong>Conflicts.</strong> Keep a version or <code>updatedAt</code> per row. <strong>Last-write-wins</strong> is fine for data nobody grieves over; anything where silently discarding a local edit is unacceptable needs a field-level merge or a server-authoritative rule.</li><li><strong>Connectivity.</strong> <code>ConnectivityManager.NetworkCallback</code>, or WorkManager's own network constraint, so a sync fires when the connection returns rather than on a timer.</li><li><strong>The cost of optimism.</strong> An optimistic write feels instant and needs a visible way back — a &quot;failed to send, tap to retry&quot; state — for when the server rejects it later.</li></ul><p><strong>🎯 Interview tip:</strong> Say &quot;single source of truth&quot; in those words, then say why the UI never calls the network. That second half is the part being graded; the phrase on its own is a slogan.</p>",
            referenceLinks: [{ title: "Guide to app architecture", url: "https://developer.android.com/topic/architecture" }, { title: "WorkManager guide", url: "https://developer.android.com/develop/background-work/background-tasks/persistent" }],
            images: [
                {
                    src: "assets/img/offline-data-layer.png",
                    alt: "Inside the Data Layer, an AuthorRepository sits above two data sources it owns, a LocalDataSource and a NetworkDataSource, with arrows fanning out to both",
                    caption: "Why the UI never needs to know it is offline: the repository owns <em>both</em> sources, so swapping which one answered is its problem and nobody else's.",
                    sourceTitle: "Build an offline-first app",
                    sourceUrl: "https://developer.android.com/topic/architecture/data-layer/offline-first"
                }
            ],
            tags: ["system-design", "offline-first", "room", "repository", "sync", "conflict-resolution"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Offline-first read/write path",
                columns: 3,
                nodes: [
                    { label: "UI observes Room", type: "terminal" },
                    { label: "Room DB (source of truth)" },
                    { label: "Repository" },
                    { label: "Network reachable?", type: "decision" },
                    { label: "Sync worker" },
                    { label: "Remote API" }
                ],
                connections: [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                    { from: 3, to: 4, label: "yes" },
                    { from: 4, to: 5 },
                    { from: 5, to: 1 }
                ]
            },
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-lru-cache",
            importance: "must-know",
            question: "Design LRU Cache",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>An <strong>LRU (Least Recently Used) cache</strong> evicts the entry that hasn't been accessed the longest when it reaches capacity — approximates \"keep what's likely to be reused\" cheaply.</li></ul><p><strong>⚙️ Implementation</strong></p><ul><li><strong>Data structure</strong> — a <code>HashMap&lt;K, Node&gt;</code> for O(1) lookup combined with a <strong>doubly linked list</strong> for O(1) reordering: on every <code>get</code>/<code>put</code>, move the touched node to the head (most-recently-used end); evict from the tail when over capacity.</li><li><strong>Android's built-in version</strong> — <code>androidx.collection.LruCache</code> is exactly this, implemented internally with a <code>LinkedHashMap(initialCapacity, 0.75f, accessOrder = true)</code>, which natively reorders entries on access.</li><li><strong>Sizing</strong> — override <code>sizeOf()</code> to measure entries in the right unit (bytes for bitmaps via <code>getByteCount()</code>, not just \"1 per entry\"), and size the cache as a fraction of <code>Runtime.getRuntime().maxMemory()</code> (commonly 1/8th).</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>LRU vs LFU</strong> — LRU is O(1) and works well for temporal locality (recent = likely to reuse); LFU tracks frequency counts, better for skewed access patterns but costlier to maintain.</li></ul><p><strong>🎯 Interview tip:</strong> Be ready to hand-code the linked-list + hashmap version on a whiteboard even though <code>LruCache</code> exists — interviewers use this question to test raw data-structure fluency.</p>",
            referenceLinks: [{ title: "LruCache reference", url: "https://developer.android.com/reference/android/util/LruCache" }],
            tags: ["system-design", "lru", "cache", "data-structures", "linkedhashmap"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "LRU eviction from LinkedHashMap access order", code: "// accessOrder = true is the whole trick: LinkedHashMap moves an entry to the\n// end of its iteration order every time it is READ, not just when written.\nclass SimpleLruCache<K, V>(private val capacity: Int) :\n    LinkedHashMap<K, V>(capacity, 0.75f, true) {\n\n    override fun removeEldestEntry(eldest: MutableMap.MutableEntry<K, V>): Boolean {\n        return size > capacity\n    }\n}\n\nfun main() {\n    val cache = SimpleLruCache<String, Int>(capacity = 3)\n\n    cache[\"a\"] = 1\n    cache[\"b\"] = 2\n    cache[\"c\"] = 3\n    println(\"filled to capacity : \" + cache.keys)\n\n    // Reading \"a\" promotes it, so it is no longer the eldest entry.\n    cache[\"a\"]\n    println(\"after reading 'a'  : \" + cache.keys)\n\n    // Inserting a fourth entry evicts the least recently USED, which is now \"b\".\n    cache[\"d\"] = 4\n    println(\"after inserting 'd': \" + cache.keys)\n    println(\"is 'b' still there?  \" + cache.containsKey(\"b\"))\n\n    // Writing to an existing key promotes it too.\n    cache[\"c\"] = 30\n    println(\"after writing 'c'  : \" + cache.keys)\n\n    cache[\"e\"] = 5\n    println(\"after inserting 'e': \" + cache.keys)\n\n    // Without accessOrder the map would be insertion-ordered and this would\n    // be an FIFO cache instead — a very different eviction policy.\n    val fifo = object : LinkedHashMap<String, Int>(3, 0.75f, false) {\n        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, Int>) = size > 3\n    }\n    fifo[\"a\"] = 1; fifo[\"b\"] = 2; fifo[\"c\"] = 3\n    fifo[\"a\"]\n    fifo[\"d\"] = 4\n    println(\"same steps, FIFO   : \" + fifo.keys)\n}",
                output: {
                    kind: "stdout",
                    lines: [
                        "filled to capacity : [a, b, c]",
                        "after reading 'a'  : [b, c, a]",
                        "after inserting 'd': [c, a, d]",
                        "is 'b' still there?  false",
                        "after writing 'c'  : [a, d, c]",
                        "after inserting 'e': [d, c, e]",
                        "same steps, FIFO   : [b, c, d]"
                    ],
                    explain: "<p>Follow the keys. Reading <code>\"a\"</code> moved it to the back, so the next insert evicted <code>\"b\"</code> rather than <code>\"a\"</code> — that promotion on <em>read</em> is the entire difference between LRU and a queue, and it is one constructor argument.</p><p>The last line is the control: identical operations with <code>accessOrder = false</code> evict <code>\"a\"</code>, because insertion order never changed. Same data structure, same capacity, different policy.</p><p><code>LinkedHashMap</code> gives O(1) get and put and O(1) eviction because it maintains a doubly linked list alongside the hash table — which is exactly the answer expected when this is asked as a whiteboard question, and it is worth being able to describe the two structures rather than only naming the class.</p><p>Android's own <code>LruCache</code> adds thread safety and a <code>sizeOf</code> hook so capacity can be measured in bytes rather than entries, which is what an image cache needs.</p>"
                } }],
            subsection: null
        },
        {
            id: "design-analytics-library",
            importance: "should-know",
            question: "Design an Analytics Library",
            answer: "<p><strong>🔑 Requirements</strong></p><ul><li>Track events with properties, batch and send efficiently, never block the caller, survive process death, and respect user opt-out/consent.</li></ul><p><strong>⚙️ High-level components</strong></p><ul><li><strong>Public API</strong> — a lightweight, fire-and-forget call: <code>Analytics.track(\"purchase\", mapOf(\"item\" to id, \"price\" to price))</code>; must never throw or block the calling thread.</li><li><strong>Local event queue</strong> — events written immediately to a local store (Room table or an append-only file) so nothing is lost if the process dies before the network flush.</li><li><strong>Batching &amp; flush</strong> — events batched by count (e.g. 20) or time window (e.g. 30s) and flushed together to cut network calls; a background flush is also scheduled via <code>WorkManager</code> to guarantee delivery even if the app is killed with events still queued.</li><li><strong>Session/context enrichment</strong> — a middleware step attaches common fields (device model, OS version, session ID, anonymous user ID) to every event before it's queued.</li><li><strong>Retry &amp; backpressure</strong> — failed batches retried with exponential backoff; the queue is capped so a network outage can't grow it unboundedly.</li><li><strong>Privacy</strong> — a global enable/disable flag checked before any event is even queued, to honor opt-out/consent requirements.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>Batch size/interval</strong> — smaller/faster batches mean fresher data server-side but more network overhead and battery cost; most SDKs default to a modest count+time hybrid trigger.</li></ul><p><strong>🎯 Interview tip:</strong> Emphasize that <code>track()</code> must be non-blocking and durable across process death — those two constraints alone justify most of the architecture.</p>",
            referenceLinks: [{ title: "WorkManager guide", url: "https://developer.android.com/develop/background-work/background-tasks/persistent" }, { title: "Firebase Analytics overview", url: "https://firebase.google.com/docs/analytics" }],
            tags: ["system-design", "analytics", "batching", "queue", "workmanager"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-logging-library",
            importance: "should-know",
            question: "Design a Logging Library",
            answer: "<p><strong>🔑 Requirements</strong></p><ul><li>Multiple log levels, multiple output targets (Logcat, file, remote crash reporter), near-zero overhead in production for disabled levels, and structured/tagged output.</li></ul><p><strong>⚙️ High-level components</strong></p><ul><li><strong>Facade API</strong> — a small surface like <code>Log.d(tag, msg)</code>/<code>Log.e(tag, msg, throwable)</code> that callers use without knowing where output actually goes.</li><li><strong>Tree/plant pattern</strong> — pluggable output targets (as in Timber): a <code>DebugTree</code> that forwards to <code>android.util.Log</code> only in debug builds, a <code>FileTree</code> that appends to a rotating log file, a <code>CrashlyticsTree</code> that forwards <code>ERROR</code>-level logs with breadcrumbs to a remote crash reporter.</li><li><strong>Level filtering</strong> — a global minimum level (e.g. <code>WARN</code> in release) checked before any formatting work happens, so disabled log calls cost effectively nothing.</li><li><strong>Async I/O</strong> — file/remote writes happen on a background executor/coroutine, never the calling thread, to avoid janking the UI on a hot log line.</li><li><strong>Log rotation</strong> — cap file size/age and rotate to avoid unbounded disk growth on-device.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>Auto-tagging</strong> (deriving the tag from the calling class via stack inspection, as Timber does) is convenient but adds a small per-call cost from walking the stack trace.</li></ul><p><strong>🎯 Interview tip:</strong> Mention debug-vs-release tree planting explicitly — it shows you understand why you don't want verbose logs (or PII) shipping in a release build.</p>",
            referenceLinks: [{ title: "Timber", url: "https://github.com/JakeWharton/timber" }, { title: "Firebase Crashlytics", url: "https://firebase.google.com/docs/crashlytics" }],
            tags: ["system-design", "logging", "timber", "architecture"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "The pluggable tree pattern, as Timber uses it", code: "abstract class LogTree {\n    abstract fun log(level: Int, tag: String, message: String, t: Throwable?)\n}\n\nclass DebugTree : LogTree() {\n    override fun log(level: Int, tag: String, message: String, t: Throwable?) {\n        if (BuildConfig.DEBUG) android.util.Log.println(level, tag, message)\n    }\n}\n\nobject AppLog {\n    private val trees = mutableListOf<LogTree>()\n    fun plant(tree: LogTree) { trees.add(tree) }\n\n    fun d(tag: String, message: String) {\n        trees.forEach { it.log(android.util.Log.DEBUG, tag, message, null) }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "At startup the app plants trees: a DebugTree in debug builds, a CrashReportingTree in release.",
                        "Application code calls AppLog.d(tag, message) and knows nothing about which trees exist.",
                        "AppLog forwards the call to every planted tree in turn.",
                        "DebugTree checks BuildConfig.DEBUG and writes to Logcat.",
                        "CrashReportingTree ignores debug messages entirely and forwards warnings and errors to Crashlytics.",
                        "In a release build no DebugTree was ever planted, so no Logcat call happens at all.",
                        "Adding a new destination — a file, a network sink, an in-app log viewer — means planting one more tree and changing no call site."
                    ],
                    explain: "<p>Step 6 is the practical benefit over calling <code>android.util.Log</code> directly. Stripping logs from a release build normally means a ProGuard rule or an <code>if (BuildConfig.DEBUG)</code> at every call site; here the destination simply is not present.</p><p>This is the Strategy pattern with a list instead of a single strategy, and Observer in the sense that one event fans out to many sinks. Being able to name that in an interview is usually the point of the question.</p>"
                } }],
            subsection: null
        },
        {
            id: "http-request-long-polling-websocket-sse",
            importance: "should-know",
            question: "HTTP Request vs HTTP Long-Polling vs WebSocket vs Server-Sent Events",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Four ways a client can get server data, trading off latency, direction, and connection overhead.</li></ul><table><thead><tr><th>Mechanism</th><th>Direction</th><th>Latency</th><th>Best for</th></tr></thead><tbody><tr><td>Plain HTTP request</td><td>Client → server, one response</td><td>High (client must poll)</td><td>Infrequent reads, simple REST</td></tr><tr><td>Long-polling</td><td>Client → server, server holds request open until data ready</td><td>Medium</td><td>Retrofitting near-real-time onto plain HTTP infra</td></tr><tr><td>WebSocket</td><td>Full-duplex, bidirectional</td><td>Low</td><td>Chat, live collaboration, gaming</td></tr><tr><td>Server-Sent Events (SSE)</td><td>Server → client stream only</td><td>Low</td><td>Live feeds, notifications, one-way updates</td></tr></tbody></table><p><strong>⚙️ How they work</strong></p><ul><li><strong>Long-polling</strong> — client sends a request, server delays the response until new data exists (or a timeout), client immediately re-requests; simulates push over stateless HTTP at the cost of many open connections.</li><li><strong>WebSocket</strong> — starts as an HTTP <code>Upgrade</code> handshake, then becomes a persistent full-duplex TCP-like channel — either side can send anytime.</li><li><strong>SSE</strong> — a single long-lived HTTP response with <code>Content-Type: text/event-stream</code>; the server keeps writing chunks, the client auto-reconnects on drop with the <code>EventSource</code> API (browser-native, needs a library on Android).</li></ul><p><strong>🎯 Interview tip:</strong> If the feature only needs server→client updates (price ticker, notifications), pushing for SSE over WebSocket is a strong answer — it's simpler, works over plain HTTP/2, and needs no custom reconnection logic.</p>",
            referenceLinks: [{ title: "WebSocket — MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" }, { title: "Server-sent events — MDN", url: "https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events" }],
            tags: ["system-design", "websocket", "sse", "long-polling", "http", "real-time"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "voice-video-calls-architecture",
            importance: "should-know",
            question: "How do Voice and Video Calls work?",
            answer: "<p><strong>🔑 WebRTC splits the call in two: a signalling channel you provide to set it up, and media that then flows peer-to-peer over UDP.</strong> WebRTC deliberately defines no signalling transport, so apps reuse whatever channel they already have.</p><p><strong>⚙️ Setting the call up</strong></p><ul><li><strong>Signalling</strong> — a WebSocket, or your existing chat infrastructure, carries <strong>SDP offers and answers</strong> (codecs, resolution) and <strong>ICE candidates</strong> (the network paths worth trying) between the two peers before any media moves.</li><li><strong>NAT traversal</strong> — a <strong>STUN</strong> server tells a device its public IP and port so the peers can try to connect directly. When that fails — symmetric NAT, a strict firewall — a <strong>TURN</strong> server relays the media instead, which always works and costs you bandwidth.</li></ul><p><strong>⚙️ Moving the media</strong></p><ul><li>Capture → encode (<strong>Opus</strong> for audio, <strong>VP8</strong>, <strong>VP9</strong> or <strong>H.264</strong> for video) → encrypt with <strong>SRTP</strong> → send over <strong>UDP</strong> → decode → render.</li><li>UDP, because a late packet is worse than a lost one: retransmitting a frame that should already be on screen helps nobody.</li></ul><p><strong>⚖️ Group calls</strong></p><ul><li>A full mesh does not scale — everyone uploads to everyone, so streams grow with the square of the participant count.</li><li>An <strong>SFU</strong> takes one stream per participant and forwards it to the rest: server bandwidth in exchange for scale, no transcoding.</li><li>An <strong>MCU</strong> mixes everything into one stream, cutting client bandwidth and CPU at the cost of server compute.</li></ul><p><strong>🎯 Interview tip:</strong> Name STUN, TURN and ICE, and be ready to say why UDP beats TCP here. Those two details separate a strong answer from a description of a video call.</p>",
            referenceLinks: [{ title: "WebRTC overview", url: "https://webrtc.org/getting-started/overview" }, { title: "RFC 8445 — ICE", url: "https://datatracker.ietf.org/doc/html/rfc8445" }],
            tags: ["system-design", "webrtc", "voip", "video-call", "stun", "turn", "sfu"],
            hasDiagram: true,
            diagramType: "sequence",
            diagramConfig: {
                title: "WebRTC call setup",
                actors: ["Caller", "Signaling Server", "Callee"],
                messages: [
                    { from: 0, to: 1, label: "SDP offer" },
                    { from: 1, to: 2, label: "forward offer" },
                    { from: 2, to: 1, label: "SDP answer" },
                    { from: 1, to: 0, label: "forward answer" },
                    { from: 0, to: 2, label: "ICE candidates", dashed: true },
                    { from: 2, to: 0, label: "media (P2P/SRTP)", dashed: true }
                ]
            },
            codeSnippets: [],
            subsection: null
        },
        {
            id: "data-syncing-unstable-networks",
            importance: "should-know",
            question: "How do you handle data syncing on unstable networks?",
            answer: "<p><strong>🔑 Core idea</strong></p><ul><li>Assume the network will drop mid-request; design so partial progress isn't lost and retries are safe.</li></ul><p><strong>⚙️ Techniques</strong></p><ul><li><strong>Queue + persist before send</strong> — write pending changes to local storage (Room) before attempting network, so an app kill or dropped connection mid-request never loses the change.</li><li><strong>Idempotency keys</strong> — attach a client-generated UUID to each mutation; a retried request with the same key is a no-op server-side, so it's safe to retry blindly after a timeout without risking duplicate writes.</li><li><strong>Exponential backoff with jitter</strong> — retry delays double each attempt (with randomized jitter) to avoid a retry storm when connectivity returns for many clients at once; <code>WorkManager</code>'s <code>BackoffPolicy.EXPONENTIAL</code> implements this directly.</li><li><strong>Chunking large payloads</strong> — break big uploads/downloads into resumable chunks (byte ranges) so a drop only costs the current chunk, not the whole transfer.</li><li><strong>Connectivity-aware scheduling</strong> — react to <code>ConnectivityManager.NetworkCallback</code> or WorkManager's <code>NetworkType.CONNECTED</code> constraint to trigger sync exactly when a connection becomes available, rather than polling.</li><li><strong>Conflict resolution on reconnect</strong> — version/timestamp each record; on sync, apply last-write-wins or a merge strategy, and surface unresolved conflicts to the user when data loss would otherwise be silent.</li></ul><p><strong>🎯 Interview tip:</strong> Idempotency keys are the detail most candidates miss — without them, \"just retry on failure\" silently risks duplicate server-side writes.</p>",
            referenceLinks: [{ title: "WorkManager guide", url: "https://developer.android.com/develop/background-work/background-tasks/persistent" }, { title: "Monitor connectivity", url: "https://developer.android.com/training/monitoring-device-state/connectivity-status-type" }],
            tags: ["system-design", "sync", "offline", "retry", "idempotency", "backoff"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "design-uber-app",
            importance: "should-know",
            question: "Design Uber App",
            answer: "<p><strong>🔑 Requirements</strong></p><ul><li>Real-time driver location tracking, rider-driver matching, live ETA, trip state machine, and reliable payment/receipt flow.</li></ul><p><strong>⚙️ High-level components</strong></p><ul><li><strong>Live location stream</strong> — driver app pushes location every few seconds over a WebSocket/gRPC-stream to the backend; backend fans it out to the matched rider's app for the live map.</li><li><strong>Matching</strong> — server-side geospatial index (geohash grid or quad-tree) finds nearby available drivers for a ride request; this is server logic, but the client contract is: request a ride → receive a driver assignment + ETA via push.</li><li><strong>Trip state machine</strong> — client renders a strict sequence of states (<code>Requested → DriverAssigned → EnRoute → Arrived → InProgress → Completed</code>), each driven by server push events, with local persistence so the state survives app restarts mid-trip.</li><li><strong>Offline resilience</strong> — trip state cached locally; on reconnect, client reconciles against the server's authoritative state rather than trusting stale local state blindly.</li><li><strong>Maps &amp; routing</strong> — Maps SDK for rendering + a routing/ETA API; polyline decoding for the route path, marker interpolation for smooth driver movement between location pings.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>Push frequency vs battery/bandwidth</strong> — tracking every 2-4 seconds feels live but costs battery on the driver's device running for hours; most designs throttle based on speed and distance-since-last-update.</li></ul><p><strong>🎯 Interview tip:</strong> Treat this as a state-machine-plus-live-location problem, not a maps problem — interviewers care most about how you keep client and server state consistent through drops and app restarts.</p>",
            referenceLinks: [{ title: "Maps SDK for Android", url: "https://developers.google.com/maps/documentation/android-sdk/overview" }, { title: "FusedLocationProviderClient", url: "https://developer.android.com/develop/sensors-and-location/location/retrieve-current" }],
            tags: ["system-design", "uber", "location", "state-machine", "real-time", "maps"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "where-is-my-train-without-internet",
            importance: "good-to-know",
            question: "How does Where Is My Train work without Internet?",
            answer: "<p><strong>🔑 Core idea</strong></p><ul><li>The app estimates train position from a <strong>bundled/cached static schedule</strong> plus other passengers' SMS-reported positions, without needing the requesting device to have its own internet connection at query time.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Bundled static data</strong> — station lists, route topology, and timetables are shipped/cached on-device (downloaded once when internet is available), so route lookup and schedule-based ETA work fully offline.</li><li><strong>SMS-based crowd positioning</strong> — the app (or a companion server) sends an SMS to a railway PNR/NTES-style service number when the phone has cellular signal but no data; the reply SMS contains the last known station/signal the train passed, parsed and shown as position — no data connection required, just carrier signal.</li><li><strong>Crowdsourcing</strong> — other users of the app with a live connection near the train report GPS-based location; that data is aggregated server-side and served to users querying the same train, improving accuracy over the static timetable alone.</li><li><strong>Local caching layer</strong> — once any position data (SMS-derived or crowd-sourced) is fetched, it's cached locally with a timestamp so the last-known position is still shown (with a \"last updated\" label) if connectivity drops entirely.</li></ul><p><strong>🎯 Interview tip:</strong> The key insight interviewers want is recognizing SMS as a data channel independent of a data connection — it's the trick that makes \"real-time train tracking\" work in low-connectivity areas.</p>",
            referenceLinks: [{ title: "Android Telephony SmsManager", url: "https://developer.android.com/reference/android/telephony/SmsManager" }],
            tags: ["system-design", "offline", "sms", "crowdsourcing", "caching"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "database-normalization-vs-denormalization",
            importance: "should-know",
            question: "Database Normalization vs Denormalization",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Two opposite strategies for structuring relational data: minimizing redundancy vs optimizing for read speed.</li></ul><table><thead><tr><th></th><th>Normalization</th><th>Denormalization</th></tr></thead><tbody><tr><td>Goal</td><td>Eliminate redundant data, avoid update anomalies</td><td>Reduce joins, speed up reads</td></tr><tr><td>Structure</td><td>Data split across related tables (3NF etc.)</td><td>Data duplicated/flattened into fewer tables</td></tr><tr><td>Writes</td><td>Simple, single source of truth</td><td>Must update every duplicate copy</td></tr><tr><td>Reads</td><td>Slower — needs joins</td><td>Faster — data already co-located</td></tr><tr><td>Best for</td><td>Transactional apps (OLTP), data integrity critical</td><td>Read-heavy caches, reporting, mobile local DB for UI-ready reads</td></tr></tbody></table><p><strong>⚙️ On Android specifically</strong></p><ul><li>A Room schema is often <strong>normalized</strong> to mirror the backend's relational shape (e.g. <code>User</code>, <code>Post</code>, <code>Comment</code> tables with foreign keys) for correctness and easy incremental updates.</li><li>A <strong>denormalized read model</strong> (e.g. a <code>PostWithAuthorName</code> view or a Room <code>@Relation</code>-backed POJO) is often layered on top purely for what the UI needs to render, avoiding a join on every recomposition/bind.</li></ul><p><strong>🎯 Interview tip:</strong> A strong answer notes you don't have to pick one — Room lets you keep normalized source tables and denormalize only in query-time views for the UI.</p>",
            referenceLinks: [{ title: "Database Normalization — background", url: "https://en.wikipedia.org/wiki/Database_normalization" }, { title: "Room relations", url: "https://developer.android.com/training/data-storage/room/relationships" }],
            tags: ["system-design", "database", "normalization", "room", "sql"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "hash-vs-encrypt-vs-encode",
            importance: "should-know",
            question: "Hash vs Encrypt vs Encode",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Three unrelated data transformations that get confused because they all \"scramble\" data — they solve different problems and are not interchangeable.</li></ul><table><thead><tr><th></th><th>Encoding</th><th>Encryption</th><th>Hashing</th></tr></thead><tbody><tr><td>Purpose</td><td>Represent data in another format for safe transport/storage</td><td>Keep data confidential</td><td>Verify integrity / one-way fingerprint</td></tr><tr><td>Reversible?</td><td>Yes, no key needed (Base64, URL-encoding)</td><td>Yes, with the correct key</td><td>No — one-way by design</td></tr><tr><td>Key required?</td><td>No</td><td>Yes (symmetric or asymmetric)</td><td>No (though HMAC adds a key for authentication)</td></tr><tr><td>Android example</td><td><code>Base64.encode()</code> for binary in JSON</td><td><code>EncryptedSharedPreferences</code>, <code>Cipher</code> with AES</td><td><code>MessageDigest.getInstance(\"SHA-256\")</code> for password/checksum</td></tr></tbody></table><p><strong>⚠️ Pitfalls</strong></p><ul><li>Treating Base64 as \"encryption\" is a common and dangerous mistake — it provides zero confidentiality, it's trivially reversible by anyone.</li><li>Storing passwords hashed without a per-user <strong>salt</strong> makes them vulnerable to precomputed rainbow-table attacks.</li></ul><p><strong>🎯 Interview tip:</strong> If asked \"how would you store a password,\" the correct answer is a salted, slow hash (bcrypt/Argon2 server-side) — never plain encryption, and never Base64.</p>",
            referenceLinks: [{ title: "MessageDigest — Java docs", url: "https://docs.oracle.com/javase/8/docs/api/java/security/MessageDigest.html" }, { title: "Security with EncryptedSharedPreferences", url: "https://developer.android.com/privacy-and-security/security-tips" }],
            tags: ["system-design", "security", "hashing", "encryption", "encoding"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "webhook-vs-polling",
            importance: "should-know",
            question: "Webhook vs Polling",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Two ways to learn that server-side state changed: the client repeatedly asks (<strong>polling</strong>), or the server proactively tells you (<strong>webhook</strong>/push).</li></ul><table><thead><tr><th></th><th>Polling</th><th>Webhook / Push</th></tr></thead><tbody><tr><td>Who initiates</td><td>Client, on a timer</td><td>Server, when the event happens</td></tr><tr><td>Latency</td><td>Bounded by poll interval</td><td>Near-instant</td></tr><tr><td>Efficiency</td><td>Wastes requests when nothing changed</td><td>Only fires on real events</td></tr><tr><td>Complexity</td><td>Simple — just an HTTP call on a timer</td><td>Needs a receiving endpoint/push channel and delivery guarantees</td></tr><tr><td>Android equivalent</td><td>WorkManager periodic job hitting an API</td><td>FCM data/notification message</td></tr></tbody></table><p><strong>⚙️ On Android</strong></p><ul><li>True server-initiated webhooks target a server endpoint, not a mobile device directly (mobile IPs aren't stable/reachable) — so mobile apps get the webhook's effect via <strong>FCM</strong>: your backend receives the webhook, then pushes an FCM message to notify the app.</li></ul><p><strong>🎯 Interview tip:</strong> If asked to pick, default to push (FCM) for anything latency-sensitive and reserve polling for cases where push infra isn't available or the data changes so rarely that push is overkill.</p>",
            referenceLinks: [{ title: "Firebase Cloud Messaging", url: "https://firebase.google.com/docs/cloud-messaging" }, { title: "WorkManager periodic work", url: "https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work#periodic" }],
            tags: ["system-design", "webhook", "polling", "fcm", "push"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "real-time-updates-android",
            importance: "should-know",
            question: "Options for real-time updates in Android App",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Several mechanisms exist for pushing fresh data to an Android client; the right choice depends on latency needs, direction, and whether the app is foregrounded.</li></ul><p><strong>⚙️ Options</strong></p><ul><li><strong>Firebase Cloud Messaging (FCM)</strong> — works even when the app is backgrounded/killed (via a system broadcast that can wake the app); best default for most \"notify the user of a change\" use cases.</li><li><strong>WebSocket</strong> — persistent bidirectional connection, lowest latency, but only reliable while the app/process is alive; best for chat, live collaboration while the screen is open.</li><li><strong>Server-Sent Events (SSE)</strong> — one-way server→client stream over plain HTTP; simpler than WebSocket when the client never needs to push back.</li><li><strong>Long-polling</strong> — fallback when WebSocket/SSE aren't available through some network/proxy; higher latency, more connection overhead.</li><li><strong>Periodic sync (WorkManager)</strong> — for data that doesn't need true real-time freshness; simplest and most battery-friendly.</li><li><strong>Firebase Realtime Database / Firestore listeners</strong> — managed real-time sync with built-in offline caching, good when you don't want to run your own push infra.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li>Combine tiers in practice: a live WebSocket while foregrounded, FCM to wake/notify when backgrounded, and periodic sync as a safety net.</li></ul><p><strong>🎯 Interview tip:</strong> A layered answer (foreground: socket, background: FCM, fallback: periodic sync) reads stronger than picking just one mechanism.</p>",
            referenceLinks: [{ title: "Firebase Cloud Messaging", url: "https://firebase.google.com/docs/cloud-messaging" }, { title: "Cloud Firestore realtime updates", url: "https://firebase.google.com/docs/firestore/query-data/listen" }],
            tags: ["system-design", "real-time", "fcm", "websocket", "firestore"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "network-optimization-mobile",
            importance: "should-know",
            question: "Network Optimization in Mobile App",
            answer: "<p><strong>🔑 Goal</strong></p><ul><li>Minimize data usage, battery drain, and latency across unreliable, metered mobile networks.</li></ul><p><strong>⚙️ Techniques</strong></p><ul><li><strong>Payload efficiency</strong> — compact serialization (protobuf over JSON where feasible), gzip/Brotli compression, request only needed fields (GraphQL-style field selection or sparse-fieldset REST params).</li><li><strong>Caching</strong> — respect/emit HTTP <code>Cache-Control</code>/<code>ETag</code> headers so unchanged data returns a cheap <code>304 Not Modified</code>; layer an app-level cache (Room/disk) on top for offline reads.</li><li><strong>Batching &amp; coalescing</strong> — combine multiple small requests into one where the API allows, and debounce rapid-fire requests (e.g. search-as-you-type) rather than firing one per keystroke.</li><li><strong>Connection reuse</strong> — a single shared OkHttp client instance (connection pooling, HTTP/2 multiplexing) instead of creating a new client per request.</li><li><strong>Image/video optimization</strong> — request appropriately-sized images (server-side resizing by target dimensions), modern codecs (WebP/AVIF), and adaptive bitrate for video.</li><li><strong>Prefetching with care</strong> — prefetch likely-next data only on unmetered/Wi-Fi networks (<code>ConnectivityManager.isActiveNetworkMetered()</code>), never blindly on cellular.</li><li><strong>Scheduling</strong> — defer non-urgent sync work via <code>WorkManager</code> constraints (<code>NetworkType.UNMETERED</code>, <code>requiresCharging</code>) to batch it into times that cost the user less.</li></ul><p><strong>🎯 Interview tip:</strong> Mentioning metered-network awareness (<code>isActiveNetworkMetered</code>) is a detail that signals real-world production experience, not just textbook knowledge.</p>",
            referenceLinks: [{ title: "Optimize for battery and data usage", url: "https://developer.android.com/develop/connectivity" }, { title: "ConnectivityManager", url: "https://developer.android.com/reference/android/net/ConnectivityManager" }],
            tags: ["system-design", "network", "optimization", "battery", "caching", "compression"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "firebase-remote-config",
            importance: "should-know",
            question: "Firebase Remote Config",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A cloud service that lets you change app behavior/appearance <strong>without shipping a new release</strong> — parameters are fetched at runtime and can be targeted/rolled out to specific user segments.</li></ul><p><strong>⚙️ How it's used</strong></p><ul><li><strong>Defaults</strong> — bundle in-app default values (XML resource or in-code map) so the app behaves correctly even before the first successful fetch.</li><li><strong>Fetch &amp; activate</strong> — <code>fetchAndActivate()</code> pulls the latest parameter values from the backend and swaps them into the active config; typical use is on app start, gated by a minimum fetch interval to avoid hammering the backend.</li><li><strong>Common use cases</strong> — feature flags/kill switches, A/B test variants, gradual rollout percentages, tunable thresholds (e.g. cache TTL, retry counts) — all changeable server-side instantly.</li><li><strong>Conditions/targeting</strong> — values can be scoped by app version, country, user property, or a random percentile bucket for staged rollouts, configured in the Firebase console.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Fetch is not instantaneous or guaranteed on every launch — code must handle the \"still on old config\" case gracefully, not assume the newest value is always active.</li></ul><p><strong>🎯 Interview tip:</strong> Tie it to feature flags: Remote Config is how you ship a feature dark, dial in the rollout %, and kill it instantly if something breaks — without an app store release.</p>",
            referenceLinks: [{ title: "Firebase Remote Config", url: "https://firebase.google.com/docs/remote-config" }],
            tags: ["system-design", "firebase", "remote-config", "feature-flags", "a-b-testing"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "Fetching and activating Remote Config", code: "val remoteConfig = Firebase.remoteConfig\nval configSettings = remoteConfigSettings {\n    minimumFetchIntervalInSeconds = 3600\n}\nremoteConfig.setConfigSettingsAsync(configSettings)\nremoteConfig.setDefaultsAsync(R.xml.remote_config_defaults)\n\nremoteConfig.fetchAndActivate().addOnCompleteListener { task ->\n    if (task.isSuccessful) {\n        val newFeatureEnabled = remoteConfig.getBoolean(\"new_checkout_flow\")\n        if (newFeatureEnabled) {\n            enableNewCheckoutFlow()\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "setDefaultsAsync loads values from an XML file bundled in the APK, so every key has an answer on first launch, offline, before any network call.",
                        "minimumFetchIntervalInSeconds = 3600 tells the SDK to serve cached values rather than refetch within the hour.",
                        "fetchAndActivate downloads the current values from the server, if the interval allows it.",
                        "Activate then swaps the fetched values in as the active set — fetch and activate are separate steps, and only activation changes what getBoolean returns.",
                        "The callback reads new_checkout_flow and enables the feature.",
                        "On the next launch the activated values are already present, so the flag is correct before the fetch even starts.",
                        "If the fetch fails the previous activated values remain, and the app behaves exactly as it did before."
                    ],
                    explain: "<p>Steps 1 and 7 are why this is safe to depend on: there is always a value, and a failed fetch degrades to the last known good configuration rather than to nothing.</p><p>Step 4 is the distinction people get wrong. Fetching does not change behaviour; activating does. Calling <code>activate()</code> mid-session can flip a flag while a screen is open, which is why many apps fetch during the session and activate only at the next cold start.</p><p>The one-hour minimum is a production throttle. During development a lower interval is normal, and shipping that setting means the app hammers the service.</p>"
                } }],
            subsection: null
        },
        {
            id: "accurate-time-android",
            importance: "should-know",
            question: "How to get accurate time in Android?",
            answer: "<p><strong>🔑 Problem</strong></p><ul><li>The device's system clock (<code>System.currentTimeMillis()</code>) can be manually changed by the user or wrong due to no network time sync — dangerous for anything security- or ordering-sensitive (auction end time, message ordering, promo expiry).</li></ul><p><strong>⚙️ Options</strong></p><ul><li><strong>SystemClock.elapsedRealtime()</strong> — time since boot, immune to user clock changes but resets on reboot and isn't wall-clock time; good for measuring durations/intervals, not for \"what time is it\".</li><li><strong>Network Time Protocol (NTP)</strong> — query an NTP server (e.g. <code>time.android.com</code>) directly for trusted wall-clock time, compute an offset from the local clock, and apply that offset going forward rather than trusting the device clock outright.</li><li><strong>Server timestamp</strong> — for anything correctness-critical, have the backend stamp events server-side and treat client-reported times as advisory only — the simplest and most robust approach when you control the API.</li><li><strong>TrueTime library</strong> — wraps NTP queries with caching and averaging across multiple servers to reduce jitter, giving a reasonably trustworthy time source without a backend round trip.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Never trust <code>System.currentTimeMillis()</code> alone for anything where a user could benefit from lying about the time (in-app purchase expiry, timed challenges).</li></ul><p><strong>🎯 Interview tip:</strong> The strongest answer is \"don't trust the client at all for anything that matters — validate server-side,\" with NTP/TrueTime as the client-side mitigation when you can't round-trip to a server.</p>",
            referenceLinks: [{ title: "SystemClock", url: "https://developer.android.com/reference/android/os/SystemClock" }, { title: "TrueTime (open source library)", url: "https://github.com/instacart/truetime-android" }],
            tags: ["system-design", "time", "ntp", "security", "systemclock"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "query-optimization-sqlite",
            importance: "should-know",
            question: "Query Optimization in SQLite",
            answer: "<p><strong>🔑 Goal</strong></p><ul><li>Keep on-device queries fast as local data grows, since SQLite runs on constrained mobile hardware with no query-plan tuning happening remotely.</li></ul><p><strong>⚙️ Techniques</strong></p><ul><li><strong>Indexes</strong> — create indexes (<code>CREATE INDEX</code>, or <code>@Index</code> in a Room <code>@Entity</code>) on columns used in <code>WHERE</code>, <code>ORDER BY</code>, and <code>JOIN</code> conditions; without one, SQLite falls back to a full table scan.</li><li><strong>EXPLAIN QUERY PLAN</strong> — prefix a query to see whether SQLite is using an index (<code>SEARCH</code>) or scanning the whole table (<code>SCAN</code>); the single most useful diagnostic tool for slow queries.</li><li><strong>Select only needed columns</strong> — avoid <code>SELECT *</code> when only a few fields are needed, especially before joins, to cut row size moved through memory.</li><li><strong>Batch writes in a transaction</strong> — wrapping many inserts/updates in a single transaction (<code>db.beginTransaction()</code>/Room's <code>@Transaction</code>) avoids the fsync-per-statement cost, often a 10-100x speedup for bulk writes.</li><li><strong>Paging large result sets</strong> — use <code>LIMIT</code>/<code>OFFSET</code> or Jetpack <strong>Paging 3</strong> with a keyed/positional <code>PagingSource</code> instead of loading an entire table into memory.</li><li><strong>WAL mode</strong> — enabling Write-Ahead Logging lets reads and writes proceed concurrently instead of blocking each other, improving throughput under concurrent access.</li></ul><p><strong>🎯 Interview tip:</strong> Bring up <code>EXPLAIN QUERY PLAN</code> unprompted — it shows you'd actually diagnose before guessing at an index to add.</p>",
            referenceLinks: [{ title: "SQLite Query Optimizer Overview", url: "https://www.sqlite.org/optoverview.html" }, { title: "Room — define indices", url: "https://developer.android.com/training/data-storage/room/defining-data#indices" }],
            tags: ["system-design", "sqlite", "room", "performance", "indexing", "query-optimization"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "A composite index for a filtered, sorted query", code: "@Entity(\n    tableName = \"orders\",\n    indices = [Index(value = [\"userId\", \"createdAt\"])]\n)\ndata class OrderEntity(\n    @PrimaryKey val id: String,\n    val userId: String,\n    val createdAt: Long,\n    val status: String\n)\n\n@Dao\ninterface OrderDao {\n    @Query(\"SELECT * FROM orders WHERE userId = :userId ORDER BY createdAt DESC LIMIT :limit\")\n    suspend fun recentOrders(userId: String, limit: Int): List<OrderEntity>\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "Without an index, \"WHERE userId = ? ORDER BY createdAt DESC\" makes SQLite scan every row in orders.",
                        "It then sorts the matches — a second pass over the results, with a temporary B-tree if there are many.",
                        "The composite index on (userId, createdAt) stores rows grouped by userId and already ordered by createdAt within each group.",
                        "The query planner now seeks straight to that userId's section of the index.",
                        "Because the rows are already in createdAt order there, the ORDER BY needs no sorting step at all.",
                        "LIMIT then stops the read after the requested number of rows rather than after the whole group.",
                        "EXPLAIN QUERY PLAN reports SEARCH USING INDEX rather than SCAN TABLE, which is how you confirm any of this."
                    ],
                    explain: "<p>Step 5 is the part a single-column index would not give you. An index on <code>userId</code> alone finds the right rows and still leaves the sort to be done; the composite index makes the ordering free, which is why the column order in the index has to match the query.</p><p>Step 7 is the practical advice: never assume. <code>EXPLAIN QUERY PLAN</code> is one line in the Database Inspector and it is the difference between believing an index is used and knowing it.</p><p>Indexes are not free — they cost disk space and slow every insert, since the index has to be updated too. They are worth it for queries that run often, on tables that are read far more than written.</p>"
                } }],
            subsection: null
        },
        {
            id: "websocket-vs-socket-io",
            importance: "should-know",
            question: "WebSocket vs Socket.IO",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>WebSocket</strong> is the raw browser/platform protocol (RFC 6455); <strong>Socket.IO</strong> is a higher-level library built on top of it (with fallbacks) that adds convenience features.</li></ul><table><thead><tr><th></th><th>WebSocket (raw)</th><th>Socket.IO</th></tr></thead><tbody><tr><td>Layer</td><td>Protocol-level standard</td><td>Library/framework on top of WebSocket (+ HTTP long-polling fallback)</td></tr><tr><td>Reconnection</td><td>Manual — you implement retry logic</td><td>Built-in automatic reconnection</td></tr><tr><td>Message format</td><td>Raw text/binary frames, you define the protocol</td><td>Built-in event-based API (<code>socket.on(\"event\", ...)</code>), rooms/namespaces</td></tr><tr><td>Interop</td><td>Any WebSocket-compliant server (works with plain OkHttp <code>WebSocket</code>)</td><td>Requires a Socket.IO-compatible server; needs a Socket.IO client library on Android since it's not just raw WebSocket framing</td></tr><tr><td>Overhead</td><td>Minimal, closer to the wire</td><td>Slightly heavier due to its own framing/handshake protocol</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> Pick raw WebSocket when you control both client and server and want minimal overhead; pick Socket.IO when the backend already uses it or when you want reconnection/rooms handled for you out of the box.</p>",
            referenceLinks: [{ title: "OkHttp WebSocket (API reference)", url: "https://javadoc.io/doc/com.squareup.okhttp3/okhttp/latest/okhttp3/WebSocket.html" }, { title: "Socket.IO docs", url: "https://socket.io/docs/v4/" }],
            tags: ["system-design", "websocket", "socket-io", "real-time", "okhttp"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "A raw WebSocket with OkHttp", code: "val request = Request.Builder().url(\"wss://example.com/socket\").build()\n\nval listener = object : WebSocketListener() {\n    override fun onOpen(webSocket: WebSocket, response: Response) {\n        webSocket.send(\"{\\\"type\\\":\\\"join\\\"}\")\n    }\n\n    override fun onMessage(webSocket: WebSocket, text: String) {\n        handleIncoming(text)\n    }\n\n    override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {\n        scheduleReconnectWithBackoff()\n    }\n}\n\nval webSocket = client.newWebSocket(request, listener)",
                output: {
                    kind: "trace",
                    lines: [
                        "newWebSocket starts an HTTP request carrying an Upgrade header and returns immediately.",
                        "The server agrees, replies 101 Switching Protocols, and the same TCP connection becomes a full-duplex WebSocket.",
                        "onOpen fires, and the client sends its join message.",
                        "From here either side may send at any time — the server does not have to wait to be asked, which is the whole point.",
                        "Each inbound frame arrives as onMessage, on OkHttp's reader thread rather than the main thread.",
                        "The connection drops — a tunnel, a lost signal, a server restart. onFailure fires.",
                        "Nothing reconnects on its own: scheduleReconnectWithBackoff is application code, and so is resending the join message afterwards."
                    ],
                    explain: "<p>Step 7 is the answer to the question this snippet sits under. A raw WebSocket gives you a duplex pipe and nothing else — reconnection, backoff, heartbeats, message acknowledgement, rooms and fallback transports are all yours to write. Socket.IO is a protocol layered on top that supplies those, at the cost of needing a Socket.IO server on the other end.</p><p>Step 5 matters in practice: <code>onMessage</code> is not on the main thread, so touching the UI directly from it crashes.</p><p>The other omission is a heartbeat. A connection can be dead for minutes without <code>onFailure</code> firing, because nobody tried to send anything — which is why production clients ping.</p>"
                } }],
            subsection: null
        },
        {
            id: "symmetric-vs-asymmetric-encryption",
            importance: "should-know",
            question: "Symmetric vs Asymmetric Encryption",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Two families of encryption differing in whether the same key encrypts and decrypts.</li></ul><table><thead><tr><th></th><th>Symmetric</th><th>Asymmetric</th></tr></thead><tbody><tr><td>Keys</td><td>One shared secret key, used for both encrypt and decrypt</td><td>Key pair — public key encrypts, private key decrypts</td></tr><tr><td>Speed</td><td>Fast, low CPU cost</td><td>Much slower, higher CPU cost</td></tr><tr><td>Key distribution problem</td><td>Both parties need the same secret — how do you share it safely?</td><td>Public key can be shared openly, no secret exchange needed</td></tr><tr><td>Examples</td><td>AES</td><td>RSA, ECC</td></tr><tr><td>Android API</td><td><code>Cipher.getInstance(\"AES/GCM/NoPadding\")</code></td><td><code>Cipher.getInstance(\"RSA/ECB/OAEPWithSHA-256AndMGF1Padding\")</code></td></tr></tbody></table><p><strong>⚙️ How they're combined in practice (TLS)</strong></p><ul><li>TLS uses asymmetric crypto only for the initial <strong>handshake</strong> (to safely agree on a shared secret without ever transmitting it), then switches to fast symmetric encryption (AES) for the actual bulk data — getting asymmetric's key-exchange safety with symmetric's speed.</li></ul><p><strong>🎯 Interview tip:</strong> Explaining this hybrid handshake pattern (asymmetric for key exchange, symmetric for bulk transfer) is what shows real understanding rather than a memorized definitions table.</p>",
            referenceLinks: [{ title: "Cryptography — Android security", url: "https://developer.android.com/privacy-and-security/cryptography" }, { title: "TLS handshake overview", url: "https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security" }],
            tags: ["system-design", "security", "encryption", "tls", "aes", "rsa"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "sms-retriever-api-android",
            importance: "good-to-know",
            question: "SMS Retriever API in Android",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Lets an app auto-read a verification SMS (e.g. OTP) <strong>without requesting the <code>READ_SMS</code>/<code>RECEIVE_SMS</code> permissions</strong>, by relying on a phone-number-independent, permission-less broadcast contract.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>App signature hash requirement</strong> — the incoming SMS message must end with an 11-character app-specific hash string, computed from the app's package name + signing certificate; only the matching app receives it, so no blanket SMS-reading permission is needed.</li><li><strong>Registration</strong> — the app calls <code>SmsRetrieverClient.startSmsRetriever()</code>, which starts a 5-minute listening window.</li><li><strong>Delivery</strong> — when a matching SMS arrives, the system broadcasts <code>SmsRetriever.SMS_RETRIEVED_ACTION</code> containing the full message text to a registered <code>BroadcastReceiver</code>, which the app parses (typically with a regex) to extract the OTP.</li><li><strong>Backend requirement</strong> — the SMS text sent by your backend must literally include the app hash string at the end, generated via Google's <code>AppSignatureHelper</code> utility during development.</li></ul><p><strong>⚖️ Alternative</strong></p><ul><li>The <strong>SMS User Consent API</strong> is a related but distinct flow — it does need a matching sender but prompts the user to explicitly consent before the app reads the message, useful when the app can't control the exact SMS format.</li></ul><p><strong>🎯 Interview tip:</strong> Emphasize \"no runtime SMS permission required\" — that's the entire point of this API versus manually parsing incoming SMS via <code>RECEIVE_SMS</code>.</p>",
            referenceLinks: [{ title: "SMS Retriever API", url: "https://developers.google.com/identity/sms-retriever/overview" }],
            tags: ["system-design", "sms", "otp", "authentication", "permissions"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "Reading an OTP without the SMS permission", code: "val client = SmsRetriever.getClient(context)\nval task = client.startSmsRetriever()\n\ntask.addOnSuccessListener {\n    // Listening for a matching SMS for the next 5 minutes\n}\n\nclass MySmsBroadcastReceiver : BroadcastReceiver() {\n    override fun onReceive(context: Context, intent: Intent) {\n        if (intent.action == SmsRetriever.SMS_RETRIEVED_ACTION) {\n            val extras = intent.extras\n            val status = extras?.get(SmsRetriever.EXTRA_STATUS) as? Status\n            if (status?.statusCode == CommonStatusCodes.SUCCESS) {\n                val message = extras.getString(SmsRetriever.EXTRA_SMS_MESSAGE)\n                val otp = Regex(\"\\\\d{6}\").find(message ?: \"\")?.value\n            }\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "The app computes an 11-character app hash and sends it to the backend with the OTP request.",
                        "startSmsRetriever begins a five-minute listening window. No permission is requested, and the user sees no dialog.",
                        "The backend sends an SMS whose body ends with that exact app hash.",
                        "Google Play services matches the hash and broadcasts SMS_RETRIEVED_ACTION to this app alone.",
                        "The receiver checks the status code and reads the message body from the intent extras.",
                        "A regex pulls the six digits out and the field is filled in.",
                        "A message without the right hash, or arriving after five minutes, is never delivered to the app at all."
                    ],
                    explain: "<p>Step 2 is why this API exists. The alternative is <code>READ_SMS</code>, which grants access to every message the user has ever received — a permission Google restricts on Play and which users reasonably refuse. The SMS Retriever trades that for a much narrower capability: this app can see one message, addressed to it, for five minutes.</p><p>Step 1 is where implementations go wrong. The hash is derived from the package name and signing certificate, so it differs between a debug build and a release build — and again if Play App Signing re-signs the app. An OTP flow that works in development and silently fails in production is nearly always this.</p>"
                } }],
            subsection: null
        }
    ]
};
