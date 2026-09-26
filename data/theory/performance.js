/* ==========================================================================
   M42 — Performance.

   Organised by the four things users actually notice — the app runs out of
   memory, it stutters, it freezes, it takes too long to open — rather than
   by tool. The tools chapter comes last, because reaching for a profiler
   before you know which of the four you have is how afternoons disappear.
   ========================================================================== */

const performanceModule = {
    id: 'performance',
    trackId: 'quality',
    order: 42,
    title: 'Performance',
    tagline: 'Measure first, on a release build, on a real device.',
    estimatedMinutes: 35,
    prerequisites: ['platform-architecture'],
    docHub: {
        title: 'App performance guide',
        path: '/topic/performance/overview'
    },

    chapters: [
        {
            id: 'memory',
            title: 'Memory, leaks and bitmaps',
            importance: 'must-know',
            summary: 'A leak is a reference that outlives its purpose; an OOM is the symptom, usually of images.',
            interviewAngle: 'Leak versus OOM is a direct question, and they are cause and effect rather than alternatives.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Android’s heap is per-process and modest — tens to a few hundred megabytes depending on the device — and exceeding it is fatal rather than slow. So memory work is mostly about two things: not holding references you have finished with, and not decoding images larger than you display.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Memory leak versus OutOfMemoryError',
                    left: 'Memory leak',
                    right: 'OutOfMemoryError',
                    rows: [
                        { aspect: 'Is', left: 'A reference kept past its usefulness', right: 'An allocation the heap cannot satisfy' },
                        { aspect: 'Symptom', left: 'Usage climbs; GC frees nothing', right: 'A crash' },
                        { aspect: 'Relationship', left: 'A common cause', right: 'The eventual effect' },
                        { aspect: 'Also caused by', left: '—', right: 'One huge bitmap, with no leak at all' },
                        { aspect: 'Found with', left: 'LeakCanary, heap dumps', right: 'The crash, then a heap dump' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The garbage collector is <strong>generational</strong>: most objects die young, so the heap is split into a small young generation collected often and cheaply, and an older generation collected rarely. That is why allocating in a loop in <code>onDraw</code> (M25) hurts — not because the objects are large, but because the churn forces frequent young collections, and each one costs frame time.</p>'
                },
                {
                    type: 'types',
                    title: 'The tools, and what each answers',
                    items: [
                        { name: 'LeakCanary', html: '<p>Watches destroyed activities and fragments, forces a GC, dumps the heap if the object is still reachable, and prints the reference chain. It names the field holding the leak, which is the part that matters (M16).</p>' },
                        { name: 'Memory Profiler', html: '<p>Live allocation and heap usage. Rotate a screen ten times and watch the instance count — if it climbs and never falls, you have found a leak without any analysis.</p>' },
                        { name: 'A heap dump', html: '<p>Capture, filter to a class, and follow the shortest path to a GC root. This is what LeakCanary automates, and doing it by hand is worth knowing for the cases it misses.</p>' },
                        { name: 'onTrimMemory', html: '<p>The system asking you to release. Its level tells you how much trouble the process is in, and it is where a bitmap or disk cache should be dropped.</p>' },
                        { name: 'WeakReference', html: '<p>A reference that does not prevent collection — useful for a cache or a listener that must not keep its target alive. Not a fix for a leak: it makes the object <em>collectable</em>, it does not remove the design that held it.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Bitmaps dominate real memory use. A full-screen photo at 1080×1920 in <code>ARGB_8888</code> is four bytes a pixel — roughly 8&nbsp;MB decoded, regardless of how small the JPEG was on disk. Decode at the size you will draw with <code>inSampleSize</code>, use <code>RGB_565</code> where alpha is not needed, and reuse buffers through a bitmap pool. In practice the answer is an image library (M28), which does all three and adds memory and disk caches.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>System.gc()</code> is a request, not a command, and calling it is nearly always wrong. It does not fix a leak — a leaked object is reachable, so no collection will free it — and it forces a pause that costs frames. Reaching for it in an interview signals a misunderstanding of what a leak is.</p>'
                }
            ],
            docs: [
                { title: 'Overview of memory management', path: '/topic/performance/memory-overview', kind: 'guide' },
                { title: 'Manage your app\'s memory', path: '/topic/performance/memory', kind: 'guide' },
                { title: 'Capture a heap dump', path: '/studio/profile/capture-heap-dump', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-memory-leak-vs-oom' },
                { topicId: 'android', questionId: 'android-fix-oom' },
                { topicId: 'android', questionId: 'android-find-memory-leaks' },
                { topicId: 'android', questionId: 'android-ontrimmemory' },
                { topicId: 'android', questionId: 'android-force-gc' },
                { topicId: 'android', questionId: 'android-garbage-collection' },
                { topicId: 'android', questionId: 'android-bitmap-handling' },
                { topicId: 'android', questionId: 'android-bitmap-pool' },
                { topicId: 'java', questionId: 'garbage-collector' },
                { topicId: 'other-topics', questionId: 'memory-usage-android' },
                { topicId: 'other-topics', questionId: 'memory-heap-dumps' }
            ]
        },

        {
            id: 'jank-and-anrs',
            title: 'Jank and ANRs',
            importance: 'must-know',
            summary: 'Sixteen milliseconds a frame, five seconds before the watchdog — both are main-thread budgets.',
            interviewAngle: '"The app lags" and "the app froze" are different questions with a shared cause and different tools.',
            buildsOn: ['memory'],
            blocks: [
                {
                    type: 'table',
                    title: 'Two budgets on the same thread',
                    headers: ['', 'Jank', 'ANR'],
                    rows: [
                        ['Budget', '~16ms per frame at 60Hz', '~5s of unresponsive input'],
                        ['User sees', 'Stutter, dropped frames', 'A "close app?" dialog'],
                        ['Cause', 'Too much work per frame', 'The main thread blocked outright'],
                        ['Diagnosed with', 'Perfetto, JankStats, Layout Inspector', 'The ANR trace in /data/anr'],
                        ['Typical fix', 'Move or defer work; flatten layout', 'Get the work off the main thread']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>A 120Hz display cuts the frame budget to about 8ms, and that budget covers everything — measure, layout, draw, and whatever your code did on the main thread that frame. Missing it once is invisible; missing it repeatedly during a scroll is what users call lag.</p>'
                },
                {
                    type: 'types',
                    title: 'Where frame time goes',
                    items: [
                        { name: 'Deep view hierarchies', html: '<p>Nested <code>LinearLayout</code>s with weights measure children twice, and nesting multiplies (M25). Flattening with <code>ConstraintLayout</code> is the standard fix; Compose’s single-pass layout (M18) avoids the class of problem.</p>' },
                        { name: 'Overdraw', html: '<p>Painting the same pixel several times per frame — a window background under an opaque layout background under an opaque card. Remove redundant backgrounds; the developer option colours the damage.</p>' },
                        { name: 'Work in the wrong place', html: '<p>Allocating or decoding in <code>onDraw</code>, or sorting a list during recomposition (M22). Both run on every frame by definition.</p>' },
                        { name: 'JIT and no baseline profile', html: '<p>The first frames of a Compose screen run interpreted (M12). This is why performance must be judged on a release build with a baseline profile.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>An ANR is the same thread, blocked rather than busy. The watchdog fires at roughly five seconds for input, and the causes reduce to three: a synchronous network or disk call on the main thread; a lock held by a background thread that the main thread is waiting on; or heavy work in a lifecycle callback, a <code>BroadcastReceiver</code>’s <code>onReceive</code> (M15), or a <code>Service</code> (M31).</p>'
                },
                {
                    type: 'types',
                    title: 'Diagnosing one you did not reproduce',
                    items: [
                        { name: 'Read the trace, not the guess', html: '<p>The system writes a stack trace for every thread to <code>/data/anr/traces.txt</code>. Find the main thread and look at the top frame — that is what it was blocked on.</p>' },
                        { name: 'Look for the other thread', html: '<p>If the main thread is waiting on a monitor, the interesting thread is the one holding it. Deadlocks are visible in the same dump.</p>' },
                        { name: 'Android vitals', html: '<p>Play reports ANR and crash rates from real users, with clustered traces. It is the only source that tells you which ANR actually matters.</p>' },
                        { name: 'StrictMode', html: '<p>Catches disk and network on the main thread in debug builds, before a user finds them.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Prevention is the M30 decision, stated as one rule: nothing that can block belongs on the main thread. Everything else here — coroutines with an injected dispatcher, WorkManager for durable work, a foreground service where the user must see it — is that rule with a mechanism attached.</p>'
                }
            ],
            docs: [
                { title: 'Keep your app responsive', path: '/topic/performance/anrs/keep-your-app-responsive', kind: 'guide' },
                { title: 'Diagnose and fix ANRs', path: '/topic/performance/anrs/diagnose-and-fix-anrs', kind: 'guide' },
                { title: 'Slow rendering', path: '/topic/performance/rendering', kind: 'guide' },
                { title: 'Reduce overdraw', path: '/topic/performance/rendering/overdraw', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-anr' },
                { topicId: 'android', questionId: 'android-app-lag' },
                { topicId: 'android', questionId: 'android-overdraw' },
                { topicId: 'android', questionId: 'android-optimizing-layouts' },
                { topicId: 'android', questionId: 'android-view-tree-optimization' },
                { topicId: 'android-tools-technologies', questionId: 'strictmode' }
            ]
        },

        {
            id: 'startup-and-size',
            title: 'Startup time and app size',
            importance: 'must-know',
            summary: 'Cold start is what Play measures, and download size is what users decide on.',
            interviewAngle: 'Both have specific, nameable levers, which makes them good questions to be concrete about.',
            buildsOn: ['jank-and-anrs'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Cold start (M12) is the case that counts: no process exists, so the system forks from Zygote, creates the <code>Application</code>, then the first activity, then draws the first frame. Everything you can control sits in the middle of that.</p>'
                },
                {
                    type: 'types',
                    title: 'The levers, largest first',
                    items: [
                        { name: 'A baseline profile', html: '<p>Ships the hot methods so ART compiles them at install rather than discovering them by JIT. Typically the single biggest win, and it matters most for Compose, which is library code (M22).</p>' },
                        { name: 'Nothing eager in Application.onCreate', html: '<p>Every library initialised there is on the critical path of every cold start. App Startup, or plain lazy initialisation, moves the cost to first use.</p>' },
                        { name: 'A startup profile', html: '<p>A separate profile that also reorders the DEX so startup code sits together, reducing page faults while the app opens.</p>' },
                        { name: 'Draw something early', html: '<p>The measurement ends at the first frame, so a screen that waits for the network before drawing anything reports a terrible number and feels worse.</p>' },
                        { name: 'Not: a splash screen', html: '<p>A splash hides the delay from the graph, not from the user. The platform <code>SplashScreen</code> API is about a consistent handoff, not about buying time.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Size matters because install conversion falls as download size rises, and because a large app is uninstalled first when storage runs short. The dominant costs are almost always resources rather than code — images, and every language and density you ship to every device.</p>'
                },
                {
                    type: 'types',
                    title: 'Reducing it',
                    items: [
                        { name: 'App Bundles', html: '<p>Play generates a device-specific APK, so a phone downloads one density and the languages it uses rather than all of them. This is the biggest single reduction, and it is the required format anyway.</p>' },
                        { name: 'R8', html: '<p>Shrinks unused code and resources and obfuscates names (M43). Verify it is actually enabled in release — a build with <code>minifyEnabled false</code> is a common and expensive oversight.</p>' },
                        { name: 'Better image formats', html: '<p>WebP or AVIF over PNG, and vector drawables for icons — one asset instead of five densities.</p>' },
                        { name: 'Look before cutting', html: '<p>The APK Analyzer shows exactly what the size is, by DEX, resources and assets. Cutting a dependency that turns out to be 40&nbsp;KB is wasted work.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Android vitals is the frame for all of this in an interview: Play tracks ANR rate, crash rate, excessive wakeups, slow start-up and janky frames against thresholds, and poor numbers reduce a listing’s visibility. Naming vitals turns "make it fast" into "hit the metrics that affect distribution".</p>'
                }
            ],
            docs: [
                { title: 'App startup time', path: '/topic/performance/vitals/launch-time', kind: 'guide' },
                { title: 'Baseline profiles overview', path: '/topic/performance/baselineprofiles/overview', kind: 'guide' },
                { title: 'Startup profiles', path: '/topic/performance/startupprofiles/overview', kind: 'guide' },
                { title: 'Reduce your app size', path: '/topic/performance/reduce-apk-size', kind: 'guide' },
                { title: 'Android vitals', path: '/topic/performance/vitals', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-app-starts' },
                { topicId: 'android', questionId: 'android-baseline-profiles' },
                { topicId: 'android-libraries', questionId: 'android-app-startup-library' },
                { topicId: 'android-tools-technologies', questionId: 'reduce-apk-size' },
                { topicId: 'other-topics', questionId: 'app-performance-metrics' }
            ]
        },

        {
            id: 'profiling',
            title: 'Measuring rather than guessing',
            importance: 'should-know',
            summary: 'A release build, a real device, and a tool chosen for the question you actually have.',
            interviewAngle: 'Leading with measurement is what separates a performance answer from a list of tips.',
            buildsOn: ['startup-and-size'],
            blocks: [
                {
                    type: 'pitfall',
                    html: '<p>Profiling a debug build measures the wrong program. There is no R8, no baseline profile, and the Compose compiler skips optimisations, so a screen that stutters in debug is frequently fine in release. People have spent days optimising code that was never slow.</p>'
                },
                {
                    type: 'table',
                    title: 'Which tool for which question',
                    headers: ['Question', 'Tool'],
                    rows: [
                        ['Why is this frame slow?', 'Perfetto / system tracing'],
                        ['Where is the memory going?', 'Memory Profiler, heap dump'],
                        ['Which method is expensive?', 'CPU profiler; method tracing'],
                        ['Did that change help?', 'Macrobenchmark, in CI'],
                        ['What are real users seeing?', 'Android vitals, JankStats'],
                        ['Why does this recompose?', 'Layout Inspector; compiler metrics (M22)']
                    ]
                },
                {
                    type: 'types',
                    title: 'The two worth knowing by name',
                    items: [
                        { name: 'Perfetto', html: '<p>The system-wide trace viewer that replaced systrace. Shows every thread, every frame, binder transactions and CPU scheduling on one timeline — which is how you discover the jank was another process, or a lock, rather than your draw code.</p>' },
                        { name: 'Macrobenchmark', html: '<p>Runs a real user journey on a real device and reports startup time and frame timing with a distribution. Because it produces a number, it is the only one of these you can put in CI and fail a build on.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Answer any performance question in this order: reproduce it, measure on a release build on a real device, find the actual cost, change one thing, measure again. Naming that loop before naming a technique is what makes the answer sound like someone who has fixed a slow app rather than read about one.</p>'
                }
            ],
            docs: [
                { title: 'Profile your app performance', path: '/studio/profile', kind: 'guide' },
                { title: 'Overview of system tracing', path: '/topic/performance/tracing', kind: 'guide' },
                { title: 'App performance guide', path: '/topic/performance/overview', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-improve-performance' },
                { topicId: 'android-tools-technologies', questionId: 'android-studio-memory-profiler' },
                { topicId: 'android-tools-technologies', questionId: 'measure-method-execution-time' },
                { topicId: 'jetpack-compose', questionId: 'compose-performance-optimization' }
            ]
        }
    ]
};
