/* ==========================================================================
   M48 — Utility drills.

   Drills 13–20: "implement this class". Asked when the interviewer wants the
   mechanism rather than the screen, often on a shared editor with no Android
   in sight, and often as the whole round for a senior candidate.

   The caching chapter is must-know because "design an LRU cache" is the
   most-asked implementation question in an Android loop (M44). The rest are
   should-know: real, but not what you drill the night before.

   Deliberate overlap: M44 already implements the LRU cache as an algorithms
   question. This module does not restate it — drill 13 starts where M44 stops.
   ========================================================================== */

const utilityDrillsModule = {
    id: 'utility-drills',
    trackId: 'synthesis',
    order: 48,
    title: 'Utility Drills',
    tagline: 'Eight classes to implement when the screen is not the point.',
    estimatedMinutes: 40,
    prerequisites: ['feature-drills'],
    docHub: {
        title: 'Kotlin coroutines on Android',
        path: '/kotlin/coroutines'
    },

    chapters: [
        {
            id: 'caching',
            title: 'Caches, and the loader built on one',
            importance: 'must-know',
            summary: 'The LRU cache past the textbook answer, and the image loader that is really a cache with a network behind it.',
            interviewAngle: '"Design an LRU cache" is the most-asked implementation question in an Android loop.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The data structure itself is in M44: a hash map for O(1) lookup, a doubly linked list for O(1) reordering, the map holding <em>nodes</em> in the list. If you cannot write that from memory, go back and write it before doing this drill — everything here assumes it.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>What M44 does not cover is what happens after the interviewer says "good — now make it usable". That is where this drill lives, and the follow-ups are predictable: how is it sized, is it thread-safe, and what happens to an evicted value that owns a resource.</p>'
                },
                {
                    type: 'drill',
                    id: 'lru-cache',
                    tier: 3,
                    title: 'LRU cache, past the textbook answer',
                    minutes: 25,
                    prompt: '<p>Implement an LRU cache with O(1) get and put. Then answer the three follow-ups: make it safe to use from several threads, size it by <em>bytes</em> rather than by entry count, and give the caller a hook to close an evicted value.</p><p>Finally: name the platform class that already does all of this, and say when you would still write your own.</p>',
                    watchFor: [
                        'Guarding <code>get</code> but not the reorder inside it — a read mutates the list',
                        'Sizing by entry count when the entries are bitmaps of wildly different sizes',
                        'No eviction callback, so evicted <code>Closeable</code> values leak their handles',
                        'Not naming <code>android.util.LruCache</code> and <code>LinkedHashMap(accessOrder = true)</code>'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// The structure is M44. The three follow-ups:

class SizedLruCache<K, V>(
    private val maxSize: Long,                       // in bytes, not entries
    private val sizeOf: (K, V) -> Long = { _, _ -> 1 },
    private val onEvicted: (K, V) -> Unit = { _, _ -> }
) {
    private val lock = Any()
    private var size = 0L

    // accessOrder = true is the entire LRU behaviour, for free.
    private val map = LinkedHashMap<K, V>(0, 0.75f, true)

    // 1. Thread safety. Note that GET mutates: it reorders. A read/write lock
    //    would be wrong here for the same reason.
    fun get(key: K): V? = synchronized(lock) { map[key] }

    fun put(key: K, value: V): V? = synchronized(lock) {
        val previous = map.put(key, value)
        size += sizeOf(key, value) - (previous?.let { sizeOf(key, it) } ?: 0)
        trimToSize()
        previous
    }

    private fun trimToSize() {
        while (size > maxSize && map.isNotEmpty()) {
            val eldest = map.entries.first()          // accessOrder: least recent
            map.remove(eldest.key)
            size -= sizeOf(eldest.key, eldest.value)
            // 3. Outside the map mutation, so a callback that re-enters
            //    cannot corrupt the iteration.
            onEvicted(eldest.key, eldest.value)
        }
    }
}

// Usage that shows you have done this on a real app:
val memoryCache = SizedLruCache<String, Bitmap>(
    maxSize = Runtime.getRuntime().maxMemory() / 8,   // the conventional eighth
    sizeOf = { _, bitmap -> bitmap.allocationByteCount.toLong() },
    onEvicted = { _, bitmap -> /* recycle only if nothing can still draw it */ }
)

// The platform class: android.util.LruCache does sizing (override sizeOf),
// eviction (override entryRemoved) and synchronisation already. Write your
// own when you need non-LRU eviction, a coroutine-aware API, or when the
// interviewer has just asked you to.`
                    }
                },
                {
                    type: 'prose',
                    html: '<p>The image loader is the same cache with three more concerns bolted on, which is why it is asked as a design question in some loops and a coding one in others. The shape is worth holding in your head: two caches, one decode, one cancellation rule.</p>'
                },
                {
                    type: 'drill',
                    id: 'image-loader',
                    tier: 3,
                    title: 'An image loader with two caches',
                    minutes: 40,
                    prompt: '<p>Implement <code>load(url, into: ImageView)</code>. Serve from memory if present, then from disk, then from the network. Downsample to the target size. When a row is recycled, the in-flight request for the old URL must not paint into the new row.</p><p>Say how you would size each cache and what you would evict first under memory pressure.</p>',
                    watchFor: [
                        'Decoding at full resolution — a 12MP JPEG is ~48MB decoded into a 48dp slot',
                        'No request cancellation, so a fast scroll paints the wrong image',
                        'Disk cache written on the main thread',
                        'One cache, not two — memory and disk have different costs and different lifetimes'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `class ImageLoader(
    private val memory: SizedLruCache<String, Bitmap>,
    private val disk: DiskCache,
    private val scope: CoroutineScope
) {
    // The tag is the cancellation mechanism: one in-flight job per target
    // view, replaced (and cancelled) when that view is reused.
    private val jobs = mutableMapOf<ImageView, Job>()

    fun load(url: String, into: ImageView, targetPx: Int) {
        jobs.remove(into)?.cancel()                 // recycled row: drop the old

        memory.get(url)?.let { into.setImageBitmap(it); return }   // sync hit

        into.setImageDrawable(placeholder)
        jobs[into] = scope.launch {
            val bitmap = runCatching {
                withContext(Dispatchers.IO) {
                    disk.read(url)?.let { decode(it, targetPx) }
                        ?: download(url).also { disk.write(url, it) }
                            .let { decode(it, targetPx) }
                }
            }.getOrNull()

            ensureActive()                          // the view may be gone
            if (bitmap != null) {
                memory.put(url, bitmap)
                into.setImageBitmap(bitmap)
            } else {
                into.setImageDrawable(errorDrawable)
            }
        }
    }

    // Downsampling: measure first with inJustDecodeBounds, then decode with
    // an inSampleSize power of two. This is the single biggest win and the
    // detail most candidates skip.
    private fun decode(bytes: ByteArray, targetPx: Int): Bitmap {
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, bounds)

        var sample = 1
        while (bounds.outWidth / sample > targetPx * 2) sample *= 2

        val options = BitmapFactory.Options().apply {
            inSampleSize = sample
            inPreferredConfig = Bitmap.Config.RGB_565   // half the bytes, no alpha
        }
        return BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
    }
}

// Sizing: memory = maxMemory / 8, keyed by url PLUS target size (the same
// image at two sizes is two entries). Disk = a fixed budget, tens of MB,
// evicted LRU. Under memory pressure the memory cache goes first — it is
// rebuildable from disk in milliseconds, while the disk cache costs a
// network round trip to rebuild.`
                    }
                },
                {
                    type: 'pitfall',
                    html: '<p>Keying the memory cache on the URL alone is a real bug and an easy one to be caught by: the same image requested at 48dp and at full screen collides, and one of the two renders at the wrong resolution. The key is the URL <em>and</em> the decode parameters.</p>'
                }
            ],
            docs: [
                { title: 'Manage your app\'s memory', path: '/topic/performance/memory', kind: 'guide' },
                { title: 'Load large bitmaps efficiently', path: '/topic/performance/graphics/load-bitmap', kind: 'guide' },
                { title: 'LruCache', path: '/reference/android/util/LruCache', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'android-system-design', questionId: 'design-lru-cache' },
                { topicId: 'android-system-design', questionId: 'design-image-loading-library' },
                { topicId: 'android-system-design', questionId: 'design-caching-library' },
                { topicId: 'android', questionId: 'android-hashmap-arraymap-sparsearray' }
            ]
        },

        {
            id: 'coroutine-utilities',
            title: 'The four coroutine utilities',
            importance: 'should-know',
            summary: 'Debounce by hand, retry with backoff, a custom Flow operator, and a rate limiter.',
            interviewAngle: 'These are the senior-candidate round: no UI, no framework, just whether you understand cancellation.',
            buildsOn: ['caching'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>All four of these have a one-line library answer, which is exactly why they are asked without the library. The interviewer wants to see whether you know what the operator does, and every one of them comes down to the same question: what happens to the work already in flight.</p>'
                },
                {
                    type: 'drill',
                    id: 'hand-rolled-debounce',
                    tier: 3,
                    title: 'Debounce, without the operator',
                    minutes: 20,
                    prompt: '<p>Write a <code>Debouncer</code> that takes an action and runs it only after the caller has been quiet for N milliseconds. Rapid calls must cancel the pending action, not queue it.</p><p>Then write the <em>throttle</em> variant and say when each is the right choice.</p>',
                    watchFor: [
                        'Sleeping instead of cancelling, so every keystroke eventually fires',
                        'No scope, so the pending job outlives the screen',
                        'Confusing debounce with throttle',
                        'A shared mutable job without synchronisation when calls can come from several threads'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `class Debouncer(
    private val scope: CoroutineScope,
    private val waitMs: Long
) {
    private var pending: Job? = null

    fun submit(action: suspend () -> Unit) {
        pending?.cancel()                       // the whole trick: cancel, requeue
        pending = scope.launch {
            delay(waitMs)
            action()
        }
    }
}

// Throttle-first is the mirror image: run immediately, then ignore until the
// window closes. Debounce drops the leading calls; throttle drops the
// trailing ones.
class Throttler(private val windowMs: Long) {
    private var lastRun = 0L

    fun submit(action: () -> Unit) {
        val now = SystemClock.elapsedRealtime()
        if (now - lastRun >= windowMs) {
            lastRun = now
            action()
        }
    }
}

// Which one, and why:
//   Debounce  -> search-as-you-type, autosave, resize. The user is still
//                acting; only the final state matters.
//   Throttle  -> a button that must not double-fire, scroll analytics, a
//                progress update. The FIRST action matters and the rest are
//                noise.
//
// Debouncing a submit button is a bug: the user taps once, nothing happens
// for 300ms, and they tap again.`
                    }
                },
                {
                    type: 'drill',
                    id: 'retry-with-backoff',
                    tier: 3,
                    title: 'Retry with exponential backoff',
                    minutes: 20,
                    prompt: '<p>Write a generic <code>retry</code> that re-runs a suspending block on failure, with delays that grow exponentially up to a ceiling. Only retry failures that are worth retrying.</p><p>Explain why the delay needs randomness in it.</p>',
                    watchFor: [
                        'Retrying <code>CancellationException</code> — the coroutine is cancelled and you are fighting it',
                        'Retrying a 400 or a 401, which will fail identically forever',
                        'No ceiling, so the fourth retry waits eight minutes',
                        'No jitter'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `suspend fun <T> retry(
    times: Int = 3,
    initialDelayMs: Long = 500,
    maxDelayMs: Long = 8_000,
    factor: Double = 2.0,
    retryOn: (Throwable) -> Boolean = { it is IOException },   // transient only
    block: suspend () -> T
): T {
    var delayMs = initialDelayMs
    repeat(times - 1) {
        try {
            return block()
        } catch (e: CancellationException) {
            throw e                          // never retry cancellation
        } catch (e: Throwable) {
            if (!retryOn(e)) throw e         // never retry a 4xx
        }
        // Jitter: without it, every client that failed during one outage
        // retries at the same instant and knocks the server over again as
        // it comes back. Spreading the herd is the whole point.
        delay(delayMs + Random.nextLong(0, delayMs / 2))
        delayMs = (delayMs * factor).toLong().coerceAtMost(maxDelayMs)
    }
    return block()                           // the last attempt throws for real
}

// The Flow equivalent, which is what you would actually ship:
flow { emit(api.items()) }
    .retryWhen { cause, attempt ->
        if (cause !is IOException || attempt >= 2) return@retryWhen false
        delay((500 * 2.0.pow(attempt.toInt())).toLong())
        true
    }

// Worth saying: retries only help for TRANSIENT failures. A retry loop
// around a bug is a slower bug, and a retry loop around a 401 is a lockout.`
                    }
                },
                {
                    type: 'drill',
                    id: 'custom-flow-operator',
                    tier: 3,
                    title: 'Write a Flow operator',
                    minutes: 20,
                    prompt: '<p>Write <code>Flow&lt;T&gt;.throttleFirst(windowMs)</code> as an extension function: emit a value, then drop everything for the window, then emit again.</p><p>Say why the operator must not call <code>withContext</code> inside the flow builder.</p>',
                    watchFor: [
                        'A class instead of an extension function returning <code>Flow</code>',
                        'Changing the context inside <code>flow {}</code> instead of using <code>flowOn</code>',
                        'Losing upstream cancellation by collecting in a new scope',
                        'Using wall-clock time where elapsed time is meant'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `fun <T> Flow<T>.throttleFirst(windowMs: Long): Flow<T> = flow {
    var lastEmission = 0L
    collect { value ->                        // collecting HERE preserves
        val now = SystemClock.elapsedRealtime()   // structured concurrency:
        if (now - lastEmission >= windowMs) {     // cancel me, cancel upstream
            lastEmission = now
            emit(value)
        }
    }
}

// The context-preservation rule: a flow must emit from the coroutine that
// collects it. Calling withContext inside flow {} and emitting there throws
// IllegalStateException at runtime ("Flow invariant is violated"). The
// supported way to move work is flowOn, which wraps the UPSTREAM:
//
//     upstream.map { expensive(it) }.flowOn(Dispatchers.Default)
//
// If an operator genuinely needs to emit from another coroutine — a
// timeout, a merge, a callback bridge — the builder is channelFlow, whose
// send() is safe across coroutines. That is the answer to "what if I need
// concurrency in here", and naming it is the senior signal in this drill.

// A window-based debounce, for contrast, DOES need channelFlow: it has to
// emit from a timer coroutine while still collecting upstream.`
                    }
                },
                {
                    type: 'drill',
                    id: 'rate-limiter',
                    tier: 3,
                    title: 'Rate limiter',
                    minutes: 25,
                    prompt: '<p>Two limits to implement: at most N calls in flight at once, and at most N calls per second. Callers suspend rather than fail when the limit is reached.</p><p>Say which one an API client actually needs, and which one protects the device.</p>',
                    watchFor: [
                        'Blocking a thread instead of suspending',
                        'A <code>synchronized</code> block around a suspending call — it does not do what you want',
                        'Conflating concurrency limiting with rate limiting',
                        'A permit leaked on an exception — no <code>try/finally</code>'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `// 1. Concurrency limit: how many at ONCE. Protects the device — sockets,
//    memory, thread pool. Semaphore is suspending and already correct.
class ConcurrencyLimiter(permits: Int) {
    private val semaphore = Semaphore(permits)

    suspend fun <T> run(block: suspend () -> T): T =
        semaphore.withPermit { block() }     // releases on exception too
}

// Or, for a whole dispatcher:
val limitedIo = Dispatchers.IO.limitedParallelism(4)

// 2. Rate limit: how many PER SECOND, regardless of duration. Protects the
//    server, and it is what an API quota means. Sliding window:
class RateLimiter(
    private val permits: Int,
    private val perMillis: Long
) {
    private val mutex = Mutex()              // suspending lock, not synchronized
    private val recent = ArrayDeque<Long>()

    suspend fun <T> run(block: suspend () -> T): T {
        acquire()
        return block()
    }

    private suspend fun acquire() {
        while (true) {
            val wait = mutex.withLock {
                val now = SystemClock.elapsedRealtime()
                while (recent.isNotEmpty() && now - recent.first() >= perMillis) {
                    recent.removeFirst()
                }
                if (recent.size < permits) {
                    recent.addLast(now)
                    return                    // got a permit
                }
                perMillis - (now - recent.first())   // sleep, then re-check
            }
            delay(wait.coerceAtLeast(1))
        }
    }
}

// Mutex, not synchronized: a synchronized block cannot contain a suspension
// point, and holding a monitor across a suspension is how you deadlock a
// dispatcher. Saying that sentence is most of the mark.`
                    }
                },
                {
                    type: 'tip',
                    html: '<p>Every one of these four has the same tell. Ask yourself out loud: <em>what happens to the work already running?</em> Debounce cancels it, throttle never started it, retry replaces it, the limiter delays it. Answering that question is the drill; the code is bookkeeping around the answer.</p>'
                }
            ],
            docs: [
                { title: 'Kotlin coroutines on Android', path: '/kotlin/coroutines', kind: 'guide' },
                { title: 'Kotlin flows on Android', path: '/kotlin/flow', kind: 'guide' },
                { title: 'Asynchronous Flow', url: 'https://kotlinlang.org/docs/flow.html', kind: 'guide' },
                { title: 'Shared mutable state and concurrency', url: 'https://kotlinlang.org/docs/shared-mutable-state-and-concurrency.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin', questionId: 'kotlin-debounce-coroutines' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-retry-operator' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-builders' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-flowon' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-channelflow' },
                { topicId: 'kotlin-coroutines', questionId: 'coroutines-cancellation' }
            ]
        },

        {
            id: 'api-shape',
            title: 'Two utilities that are really API design questions',
            importance: 'should-know',
            summary: 'A Result type, and an event bus you should probably argue against.',
            interviewAngle: 'Both are asked to see whether you have an opinion, not whether you can type a sealed class.',
            buildsOn: ['coroutine-utilities'],
            blocks: [
                {
                    type: 'drill',
                    id: 'result-wrapper',
                    tier: 3,
                    title: 'A Result type for the data layer',
                    minutes: 15,
                    prompt: '<p>Design the type a repository returns so the UI layer can render failures without catching exceptions. Include <code>map</code> and <code>fold</code>.</p><p>Then answer the follow-up: why not just use Kotlin’s built-in <code>Result</code>?</p>',
                    watchFor: [
                        'A failure type of <code>Throwable</code> — the UI cannot render a stack trace',
                        'Missing <code>out</code> variance, so <code>Result&lt;Dog&gt;</code> is not a <code>Result&lt;Animal&gt;</code>',
                        'A <code>Loading</code> case inside it — that belongs to UI state, not to a data result',
                        'No answer for the built-in <code>Result</code> question'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `sealed interface Outcome<out T> {
    data class Success<out T>(val value: T) : Outcome<T>
    data class Failure(val error: AppError) : Outcome<Nothing>
}

// The failure is a DOMAIN type, not a Throwable. This is the decision the
// drill is about: the UI renders an AppError, it never sees an IOException.
sealed interface AppError {
    data object Offline : AppError
    data object Unauthorised : AppError
    data class Server(val code: Int) : AppError
    data class Unknown(val cause: Throwable) : AppError
}

inline fun <T, R> Outcome<T>.map(transform: (T) -> R): Outcome<R> = when (this) {
    is Outcome.Success -> Outcome.Success(transform(value))
    is Outcome.Failure -> this
}

inline fun <T, R> Outcome<T>.fold(
    onSuccess: (T) -> R,
    onFailure: (AppError) -> R
): R = when (this) {
    is Outcome.Success -> onSuccess(value)
    is Outcome.Failure -> onFailure(error)
}

// Why not kotlin.Result:
//   1. Its failure is Throwable, so every consumer must pattern-match on
//      exception types — the mapping you wanted to do once, done everywhere.
//   2. runCatching swallows CancellationException, quietly breaking
//      structured concurrency. That one is a real bug, not a preference.
//   3. It cannot be a supertype, so you cannot add domain cases.
//
// 'out T' and Failure : Outcome<Nothing> together are what let a Failure be
// returned where any Outcome<T> is expected. Getting that right without
// prompting is the small signal in this drill.`
                    }
                },
                {
                    type: 'drill',
                    id: 'event-bus',
                    tier: 3,
                    title: 'An event bus, and the argument against it',
                    minutes: 25,
                    prompt: '<p>Implement a small app-wide event bus with coroutines: publishers post events, subscribers receive them, no subscriber blocks a publisher. A subscriber that joins late must not receive an event fired an hour ago.</p><p>Then make the case for not using it, and say what you would build instead.</p>',
                    watchFor: [
                        'A <code>StateFlow</code>, which replays the last value — a late subscriber replays the old event',
                        'No buffer, so a slow subscriber suspends the publisher',
                        'Subscriptions never cancelled, so every screen that ever listened stays alive',
                        'No argument against it — the drill explicitly asks for one'
                    ],
                    sketch: {
                        language: 'kotlin',
                        title: 'Solution sketch — try it first',
                        code: `object EventBus {
    // replay = 0: a late subscriber gets nothing, which is what "event"
    // means. extraBufferCapacity + DROP_OLDEST: tryEmit never suspends and
    // a slow subscriber cannot stall a publisher.
    private val _events = MutableSharedFlow<AppEvent>(
        replay = 0,
        extraBufferCapacity = 16,
        onBufferOverflow = BufferOverflow.DROP_OLDEST
    )
    val events: SharedFlow<AppEvent> = _events.asSharedFlow()

    fun post(event: AppEvent) { _events.tryEmit(event) }
}

// Subscribing, scoped so it cannot outlive the screen:
lifecycleScope.launch {
    repeatOnLifecycle(Lifecycle.State.STARTED) {
        EventBus.events.collect { handle(it) }
    }
}

// The argument against, which is the second half of the drill:
//
//   A global bus makes every dependency invisible. You cannot tell who
//   listens by reading the publisher, or who fires by reading the listener,
//   so a change ripples in a direction the compiler cannot see. It also
//   makes ordering undefined between subscribers and makes tests
//   order-dependent.
//
//   Instead: pass state down and events up (M34). Two screens that need the
//   same data should share a repository whose Flow they both collect — the
//   dependency is then explicit, typed, and greppable.
//
//   Where a bus IS reasonable: genuinely global, genuinely fire-and-forget
//   signals with no ordering requirement — session expired, connectivity
//   changed. Even then, one typed SharedFlow on the relevant repository
//   beats a singleton that carries everything.`
                    }
                },
                {
                    type: 'comparison',
                    title: 'SharedFlow vs StateFlow, which this drill is really testing',
                    left: 'SharedFlow (events)',
                    right: 'StateFlow (state)',
                    rows: [
                        { aspect: 'Replays to new subscribers', left: 'Only if you ask for replay', right: 'Always — the current value' },
                        { aspect: 'Conflates', left: 'No', right: 'Yes — fast emissions are dropped' },
                        { aspect: 'Needs an initial value', left: 'No', right: 'Yes' },
                        { aspect: 'Duplicate values', left: 'Delivered', right: 'Dropped — it is distinctUntilChanged' },
                        { aspect: 'Right for', left: '"Show a snackbar", "navigate"', right: '"The list currently holds these items"' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Modelling a one-off event as <code>StateFlow</code> is the most common version of this mistake in real apps, and it has a visible symptom: rotate the device after an error and the snackbar appears again, because the new collector is replayed the last value. If an interviewer asks "what happens on rotation" after you write a bus, this is what they are asking about.</p>'
                }
            ],
            docs: [
                { title: 'StateFlow and SharedFlow', path: '/kotlin/flow/stateflow-and-sharedflow', kind: 'guide' },
                { title: 'UI events', path: '/topic/architecture/ui-layer/events', kind: 'guide' },
                { title: 'Result', url: 'https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-result/', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'kotlin-flow-api', questionId: 'flow-stateflow-sharedflow' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-cold-vs-hot' },
                { topicId: 'kotlin-flow-api', questionId: 'flow-exception-handling' },
                { topicId: 'android', questionId: 'android-stateflow-vs-livedata' },
                { topicId: 'kotlin', questionId: 'kotlin-singleton' }
            ]
        }
    ]
};
