/* ==========================================================================
   M7 — The Android threading model.

   No question topic covers this: it is assumed by the coroutine questions,
   the ANR questions and the RecyclerView questions alike, and taught by none
   of them. It opens the async track because every module after it is an
   answer to a problem posed here.
   ========================================================================== */

const androidThreadingModelModule = {
    id: 'android-threading-model',
    trackId: 'async',
    order: 7,
    title: 'The Android Threading Model',
    tagline: 'One thread draws everything, and it is never allowed to wait.',
    estimatedMinutes: 25,
    prerequisites: [],
    docHub: {
        title: 'Processes and threads overview',
        path: '/guide/components/processes-and-threads'
    },

    chapters: [
        {
            id: 'process-and-main-thread',
            title: 'The app process and its main thread',
            importance: 'must-know',
            summary: 'Every app starts as one Linux process with exactly one thread, and that thread runs everything you did not explicitly move.',
            interviewAngle: 'Usually the setup for something else — "what thread does onCreate run on?" — and the follow-up is always about what happens when you block it.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>When the system launches an app it asks <strong>Zygote</strong> to fork a new Linux process. That process starts with a single thread of execution, and Android calls it the <strong>main thread</strong>. Every lifecycle callback, every click listener, every <code>View</code> draw and every <code>BroadcastReceiver.onReceive</code> runs on it unless you moved the work yourself.</p><p>The name matters less than the property: it is the thread the UI toolkit belongs to, so it is also called the <strong>UI thread</strong>. They are the same thread in an ordinary app.</p>'
                },
                {
                    type: 'definition',
                    term: 'Main thread',
                    aka: 'UI thread',
                    important: true,
                    html: '<p>The single thread created with the app process, on which the system delivers all lifecycle callbacks, input events and drawing. Android’s UI toolkit is <strong>not thread-safe</strong>, so only this thread may touch a <code>View</code>.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Two rules follow from that, and between them they explain most of what the rest of this track exists to solve:</p><ol><li><strong>Do not block the main thread.</strong> While it is busy, nothing draws and no input is handled.</li><li><strong>Do not touch the UI from any other thread.</strong> The toolkit is unsynchronised; concurrent access corrupts it.</li></ol><p>Those two rules pull in opposite directions. Work must leave the main thread to keep the app responsive, and its results must come back to the main thread to be displayed. Every threading tool on Android, from <code>Handler</code> to coroutines, is a way of managing that round trip.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Touching a <code>View</code> off the main thread does not reliably throw. You get <code>CalledFromWrongThreadException</code> only when the view hierarchy notices, which is why this class of bug often reaches production as an intermittent crash rather than a failing test.</p>'
                },
                {
                    type: 'diagram',
                    diagramType: 'flowchart',
                    diagramConfig: {
                        title: 'Where work has to go',
                        columns: 3,
                        nodes: [
                            { label: 'Main thread', type: 'terminal' },
                            { label: 'Blocking work?', type: 'decision' },
                            { label: 'Background thread' },
                            { label: 'Draw / handle input' },
                            { label: 'Post result back' },
                            { label: 'Update UI', type: 'terminal' }
                        ],
                        connections: [
                            { from: 0, to: 1 },
                            { from: 1, to: 2, label: 'yes' },
                            { from: 1, to: 3, label: 'no' },
                            { from: 2, to: 4 },
                            { from: 4, to: 5 }
                        ]
                    }
                }
            ],
            docs: [
                { title: 'Processes and threads overview', path: '/guide/components/processes-and-threads', kind: 'guide' },
                { title: 'Processes and app lifecycle', path: '/guide/components/activities/process-lifecycle', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-multiple-processes' },
                { topicId: 'android', questionId: 'android-service-thread' }
            ]
        },

        {
            id: 'looper-handler-messagequeue',
            title: 'Looper, Handler and MessageQueue',
            importance: 'must-know',
            summary: 'The main thread is an infinite loop pulling messages off a queue; a Handler is how you put work on it.',
            interviewAngle: 'Asked directly as "explain Looper, Handler and HandlerThread", and indirectly whenever you claim something "runs on the main thread" — the follow-up is how.',
            buildsOn: ['process-and-main-thread'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A plain Java thread runs its <code>run()</code> method and dies. The main thread cannot do that — it has to stay alive for the life of the app, waiting for the next thing to do. Android achieves this by running a loop over a queue, and the three classes that make it work are the most commonly asked internals in an Android interview.</p>'
                },
                {
                    type: 'types',
                    title: 'The three pieces',
                    items: [
                        {
                            name: 'MessageQueue',
                            html: '<p>A time-ordered linked list of <code>Message</code> objects waiting to be processed. Not a FIFO queue — messages carry a target timestamp, which is what makes <code>postDelayed</code> possible.</p>'
                        },
                        {
                            name: 'Looper',
                            html: '<p>Holds the queue and runs the infinite loop that takes the next message and dispatches it. One <code>Looper</code> per thread at most, stored in a <code>ThreadLocal</code>. The main thread’s is prepared for you by <code>ActivityThread.main()</code>; on your own thread you call <code>Looper.prepare()</code> and <code>Looper.loop()</code>.</p>',
                            whenToUse: 'you need a long-lived worker thread that accepts work over time rather than doing one job and exiting'
                        },
                        {
                            name: 'Handler',
                            html: '<p>The public entry point. Constructed against a <code>Looper</code>, it both <em>enqueues</em> messages onto that looper’s queue (<code>post</code>, <code>sendMessage</code>, <code>postDelayed</code>) and <em>handles</em> them when they come back out. This is what "post to the main thread" actually means.</p>',
                            whenToUse: 'you have a result on a background thread and need it delivered on another specific thread'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Posting work to the main thread',
                    code: `// A Handler bound to the main thread's Looper.
val mainHandler = Handler(Looper.getMainLooper())

thread {
    val result = loadFromDisk()          // background thread
    mainHandler.post {
        textView.text = result           // back on the main thread
    }
}

// Delayed work — the message carries a timestamp, so the queue is
// ordered by "when", not by insertion.
mainHandler.postDelayed({ hideSpinner() }, 300L)`,
                    notes: 'Always remove pending callbacks in <code>onDestroy</code> — a <code>Handler</code> holding a lambda that captures a <code>View</code> keeps the whole Activity alive until the message fires.'
                },
                {
                    type: 'definition',
                    term: 'HandlerThread',
                    html: '<p>A <code>Thread</code> that calls <code>Looper.prepare()</code> and <code>Looper.loop()</code> for you, giving a background thread its own message queue. It is the answer to "I need a background thread that stays alive and accepts work repeatedly" — a single worker for serialised background jobs, rather than a new thread per task.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>The line that lands this: <em>"The main thread isn’t special because of what it is, it’s special because of what it runs — a Looper draining a MessageQueue. A Handler is just the API for putting something on that queue."</em></p>'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>Handler()</code> with no arguments is deprecated. It silently bound to the <em>current</em> thread’s looper, which meant the same line of code did different things depending on where it ran. Always pass the <code>Looper</code> explicitly.</p>'
                }
            ],
            docs: [
                { title: 'Looper', url: 'https://developer.android.com/reference/android/os/Looper', kind: 'api' },
                { title: 'Handler', url: 'https://developer.android.com/reference/android/os/Handler', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-handler-looper-handlerthread' },
                { topicId: 'android', questionId: 'android-runnable-vs-thread' }
            ]
        },

        {
            id: 'frame-budget',
            title: 'The frame budget',
            importance: 'must-know',
            summary: 'At 60Hz the main thread has about 16ms to produce a frame; overrun it and the user sees jank.',
            interviewAngle: 'Comes up as "why is this list stuttering?" — the answer is always that something is doing too much on the main thread between frames.',
            buildsOn: ['process-and-main-thread'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The display refreshes on a fixed cadence. On a 60Hz screen that is every <strong>16.67ms</strong>; on a 120Hz screen every <strong>8.33ms</strong>. Each time, the system asks your app for a frame, and the main thread must measure, lay out and draw the changed parts of the view hierarchy within that window.</p><p>Miss the deadline and there is no new frame to show, so the previous one is displayed again. One missed frame is a stutter. Several in a row is what users call lag.</p>'
                },
                {
                    type: 'definition',
                    term: 'Jank',
                    html: '<p>A frame that the app failed to produce within the refresh interval. Measured by Android vitals as the proportion of frames that ran long, and visible to the user as stutter during scrolling or animation.</p>'
                },
                {
                    type: 'table',
                    title: 'What the budget actually buys',
                    headers: ['Refresh rate', 'Budget per frame', 'Realistic room for your code'],
                    rows: [
                        ['60 Hz', '16.67 ms', '~10 ms once the system takes its share'],
                        ['90 Hz', '11.11 ms', '~7 ms'],
                        ['120 Hz', '8.33 ms', '~5 ms']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>That is a small budget, and it is the reason so much Android advice sounds paranoid about the main thread. Parsing a modest JSON payload, decoding a bitmap or running a database query will each blow through it comfortably. None of them feel slow in isolation — they feel slow because they happen <em>between two frames</em>.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>When asked to optimise a janky list, work in this order: stop allocating in <code>onBindViewHolder</code> or the composable body, move any I/O off the main thread, then flatten the layout. Reaching for the last one first is a common tell that a candidate has not profiled.</p>'
                }
            ],
            docs: [
                { title: 'Slow rendering', path: '/topic/performance/vitals/render', kind: 'guide' },
                { title: 'Performance of rendering', path: '/topic/performance/rendering', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-app-starts' }
            ]
        },

        {
            id: 'anrs',
            title: 'ANRs — when blocking becomes fatal',
            importance: 'must-know',
            summary: 'Block the main thread long enough and the system offers to kill your app.',
            interviewAngle: 'Asked as "what is an ANR and how do you prevent it?" — a complete answer names the thresholds and says how you would diagnose one, not just "don\'t block the main thread".',
            buildsOn: ['frame-budget'],
            blocks: [
                {
                    type: 'definition',
                    term: 'ANR',
                    aka: 'Application Not Responding',
                    important: true,
                    html: '<p>A system dialog offering to close the app, triggered when the main thread fails to respond to an event or complete a lifecycle transition within a fixed timeout. Missing a frame is jank; missing the timeout is an ANR.</p>'
                },
                {
                    type: 'types',
                    title: 'What triggers one',
                    items: [
                        { name: 'Input dispatch timeout', html: '<p>A touch or key event is not handled within <strong>5 seconds</strong>. The most common ANR by far.</p>' },
                        { name: 'BroadcastReceiver timeout', html: '<p><code>onReceive</code> does not return within <strong>10 seconds</strong> in the foreground (20 in the background). Receivers run on the main thread.</p>' },
                        { name: 'Service timeout', html: '<p>A service lifecycle callback does not complete within <strong>20 seconds</strong>.</p>' },
                        { name: 'ContentProvider timeout', html: '<p>A <code>publish</code> call exceeds its window.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The causes are unglamorous and repetitive: network or disk I/O on the main thread, a database query on the main thread, a lock held by a background thread that the main thread then waits on, or a deadlock between the two. The last is the one candidates forget — an ANR does not require slow work, only a main thread that cannot make progress.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>BroadcastReceiver.onReceive</code> and <code>Service</code> callbacks run on the <strong>main thread</strong>, despite living in components people think of as "background". A receiver that does I/O directly is a textbook ANR.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Diagnosis is worth being able to describe. When an ANR fires the system writes <code>/data/anr/traces.txt</code>, a dump of every thread’s stack at that moment. The main thread’s stack tells you what it was stuck on; if it is <code>Object.wait</code> or a lock, the thread holding that lock is the real culprit. In production the same traces surface through Play Console’s Android vitals.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Answer in three beats: what an ANR is, the 5-second input threshold, and "I’d read the main thread’s stack in the ANR trace to find what it was blocked on." The third beat is what separates a memorised answer from experience.</p>'
                }
            ],
            docs: [
                { title: 'Keep your app responsive', path: '/topic/performance/anrs/keep-your-app-responsive', kind: 'guide' },
                { title: 'Diagnose and fix ANRs', path: '/topic/performance/anrs/diagnose-and-fix-anrs', kind: 'guide' },
                { title: 'Find the unresponsive thread', path: '/topic/performance/anrs/find-unresponsive-thread', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-anr' }
            ]
        },

        {
            id: 'before-coroutines',
            title: 'What we used before coroutines',
            importance: 'should-know',
            summary: 'Threads, AsyncTask and executors each solved part of the problem and left the rest to you.',
            interviewAngle: 'Rarely asked head-on, but "why coroutines?" is a much stronger answer when you can name what they replaced and why it was painful.',
            buildsOn: ['looper-handler-messagequeue'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Coroutines did not arrive into a vacuum. Knowing what they displaced is what turns "coroutines are lightweight" into an argument.</p>'
                },
                {
                    type: 'types',
                    title: 'The lineage',
                    items: [
                        {
                            name: 'Thread + Handler',
                            html: '<p>Start a thread, post the result back through a <code>Handler</code>. Correct, and entirely manual: no cancellation, no lifecycle awareness, and a new ~1MB stack per thread.</p>'
                        },
                        {
                            name: 'AsyncTask',
                            html: '<p>Bundled the round trip into one class with <code>doInBackground</code> and <code>onPostExecute</code>. <strong>Deprecated in API 30.</strong> It leaked Activities through its implicit outer reference, silently swallowed exceptions, and changed between serial and parallel execution across platform versions — the same code behaved differently on different devices.</p>'
                        },
                        {
                            name: 'ExecutorService / ThreadPoolExecutor',
                            html: '<p>A pool that reuses threads instead of creating one per task, which is the fix for thread cost. Still leaves you to marshal results back to the main thread and to cancel work when the screen goes away.</p>',
                            whenToUse: 'still reasonable in Java-only code, or where you genuinely want explicit pool control'
                        },
                        {
                            name: 'RxJava',
                            html: '<p>Solved composition and threading properly and taught the ecosystem to think in streams. The cost was a large operator surface and stack traces that were hard to read.</p>'
                        }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Thread versus coroutine',
                    left: 'Thread',
                    right: 'Coroutine',
                    rows: [
                        { aspect: 'Cost', left: '~1MB stack, OS-scheduled', right: 'An object on the heap; thousands are fine' },
                        { aspect: 'Waiting', left: 'Blocks — the thread is idle but occupied', right: 'Suspends — the thread is released to do other work' },
                        { aspect: 'Cancellation', left: 'Cooperative and manual, <code>Thread.stop</code> unsafe', right: 'Built in, and propagates to children' },
                        { aspect: 'Lifecycle', left: 'Unaware; outlives the screen unless you intervene', right: 'Scoped, so <code>viewModelScope</code> cancels for you' },
                        { aspect: 'Returning a result', left: 'Post through a <code>Handler</code>', right: '<code>withContext</code> returns to the caller’s context' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The right framing for an interview is that coroutines did not make concurrency easier by hiding threads — every coroutine still runs on one. What they changed is that <strong>waiting no longer costs a thread</strong>, and that a unit of work has a defined parent that can cancel it. The next two modules are those two ideas.</p>'
                }
            ],
            docs: [
                { title: 'Coroutines on Android', path: '/kotlin/coroutines', kind: 'guide' },
                { title: 'AsyncTask (deprecated)', url: 'https://developer.android.com/reference/android/os/AsyncTask', kind: 'api' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-background-processing' },
                { topicId: 'android', questionId: 'android-threadpool-advantages' },
                { topicId: 'android', questionId: 'android-daemon-vs-user-threads' },
                { topicId: 'kotlin', questionId: 'kotlin-suspending-vs-blocking' }
            ]
        }
    ]
};
