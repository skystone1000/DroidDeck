const androidToolsTechnologiesData = {
    id: "android-tools-technologies",
    title: "Android Tools And Technologies",
    subsections: null,
    keyTopics: ["CI/CD Pipeline", "ADB", "16 KB page size", "StrictMode", "Lint", "App Release Checklist", "Git", "Firebase", "Profiling", "SQLite Debugging", "ProGuard/R8", "Android Studio Memory Profiler", "Kotlin DSL Gradle", "Gradle Build System", "Annotation Processors (kapt, ksp)", "Build Variants", "Desugaring", "APK Size Reduction", "Build Speed Optimization"],
    questions: [
        {
            id: "ci-cd-pipeline",
            importance: "should-know",
            question: "What is CI/CD Pipeline?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>CI/CD</strong> automates building, testing, and delivering an app on every code change instead of doing it manually — <strong>Continuous Integration</strong> catches problems early, <strong>Continuous Delivery/Deployment</strong> ships them out reliably.</li></ul><p><strong>⚙️ Typical Android pipeline stages</strong></p><ul><li><strong>Lint &amp; static analysis</strong> — run <code>./gradlew lint detekt</code> to catch code-quality issues before anything else.</li><li><strong>Build</strong> — compile debug/release variants, run <code>./gradlew assembleRelease</code> or <code>bundleRelease</code> for an AAB.</li><li><strong>Test</strong> — run unit tests (<code>testDebugUnitTest</code>) and, on a device farm or emulator, instrumented tests.</li><li><strong>Sign &amp; package</strong> — sign the release artifact with the upload key, ideally via a secrets manager rather than a checked-in keystore.</li><li><strong>Distribute</strong> — push to Firebase App Distribution for QA builds, or the Play Console (internal/closed/open tracks) for staged production rollout.</li></ul><p><strong>⚙️ Common tools</strong></p><ul><li>GitHub Actions, GitLab CI, Bitrise, Jenkins, CircleCI — trigger the pipeline on push/PR; <strong>Fastlane</strong> is commonly used to script the build/sign/upload steps consistently.</li></ul><p><strong>🎯 Interview tip:</strong> Mention staged rollout via Play Console tracks as part of CD — it shows you think about deployment risk, not just automation for its own sake.</p>",
            referenceLinks: [{ title: "Fastlane for Android", url: "https://docs.fastlane.tools/getting-started/android/setup/" }, { title: "Firebase App Distribution", url: "https://firebase.google.com/docs/app-distribution" }],
            tags: ["ci-cd", "pipeline", "fastlane", "automation", "gradle"],
            hasDiagram: true,
            diagramType: "animation",
            diagramConfig: { title: "CI/CD pipeline stages", steps: ["Lint & static analysis", "Build variant", "Unit + instrumented tests", "Sign artifact", "Distribute (Firebase/Play Console)"] },
            codeSnippets: [{ language: "xml", title: "What a CI run does on every push", code: "&lt;!-- .github/workflows/android.yml (YAML shown as illustrative snippet) --&gt;\nname: Android CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-java@v4\n        with:\n          java-version: '17'\n          distribution: 'temurin'\n      - run: ./gradlew lint testDebugUnitTest assembleRelease",
                output: {
                    kind: "trace",
                    lines: [
                        "A push or pull request triggers the workflow; GitHub allocates a fresh ubuntu-latest runner with nothing cached.",
                        "actions/checkout clones the repository at the triggering commit.",
                        "actions/setup-java installs a JDK — Android Gradle Plugin 8 needs 17, and a mismatch here is the most common first failure.",
                        "The Gradle cache is restored, if configured. Without it every run downloads the full dependency set again.",
                        "The build task compiles, runs lint, and produces an APK or bundle.",
                        "Unit tests run on the JVM. Instrumented tests would need an emulator, which is a separate and much slower job.",
                        "Artefacts and test reports are uploaded, and the job's exit status becomes the check on the pull request."
                    ],
                    explain: "<p>Step 1 is the fact everything else follows from: the runner is <strong>clean every time</strong>. That is what makes CI trustworthy — it cannot pass because of something only present on one machine — and it is why caching matters so much for build time.</p><p>Step 6 is the split worth knowing for interviews. Unit tests are cheap and run on every push; instrumented tests need an emulator image and boot time, so they usually run on a schedule or before release rather than per commit.</p>"
                } }],
            subsection: null
        },
        {
            id: "adb",
            importance: "should-know",
            question: "What is ADB?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>ADB (Android Debug Bridge)</strong> is a command-line tool that bridges a development machine to a connected device or emulator, letting you install apps, inspect logs, run shell commands, and debug.</li></ul><p><strong>⚙️ Architecture</strong></p><ul><li><strong>Client</strong> — the <code>adb</code> CLI you run on your machine.</li><li><strong>Server</strong> — a background process on your machine that manages communication with devices over USB or TCP.</li><li><strong>Daemon (adbd)</strong> — runs on the device itself, executing commands the server forwards to it.</li></ul><p><strong>⚙️ Common commands</strong></p><ul><li><code>adb devices</code> — list connected devices/emulators.</li><li><code>adb install app.apk</code> / <code>adb uninstall pkg</code> — install/remove apps.</li><li><code>adb logcat</code> — stream device logs.</li><li><code>adb shell</code> — open an interactive shell on the device (e.g. <code>pm list packages</code>, <code>dumpsys</code>).</li><li><code>adb push</code>/<code>adb pull</code> — copy files to/from the device.</li><li><code>adb shell am start -n pkg/.Activity</code> — launch a specific activity, handy for deep-link/scripted testing.</li></ul><p><strong>🎯 Interview tip:</strong> Being fluent with <code>adb shell dumpsys</code> and <code>logcat</code> filtering signals real day-to-day debugging experience, not just textbook knowledge.</p>",
            referenceLinks: [{ title: "Android Debug Bridge (adb)", url: "https://developer.android.com/tools/adb" }],
            tags: ["adb", "tools", "debugging", "cli"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "16-kb-page-size",
            importance: "should-know",
            question: "What is 16 KB page size for Android Apps?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Android traditionally used a 4&nbsp;KB memory page size; newer devices/kernels support <strong>16&nbsp;KB pages</strong>, which improves system performance (fewer page-table entries, faster app launch, better memory management) but requires apps to be built compatibly.</li></ul><p><strong>⚙️ Why it affects apps</strong></p><ul><li>Native libraries (<code>.so</code> files) built with assumptions tied to 4&nbsp;KB page alignment can fail to load or crash on a 16&nbsp;KB-page device if they aren't built/aligned correctly.</li><li>Apps using only Kotlin/Java code with no native dependencies are generally unaffected; the risk is concentrated in apps bundling native libraries (NDK, third-party SDKs with <code>.so</code> files).</li></ul><p><strong>⚙️ How to prepare</strong></p><ul><li>Rebuild native libraries with a toolchain/NDK version that supports 16&nbsp;KB alignment.</li><li>Use Android Studio's/Play Console's compatibility checks and the <code>16 KB support</code> guidance to verify an APK/AAB's native libraries are properly aligned before release.</li></ul><p><strong>🎯 Interview tip:</strong> This is a newer, fast-moving compatibility topic — the key point to convey is that pure-Kotlin apps are largely unaffected, while native-library-heavy apps need to explicitly verify and rebuild.</p>",
            referenceLinks: [{ title: "Support 16 KB page sizes", url: "https://developer.android.com/guide/practices/page-sizes" }],
            tags: ["16kb-page-size", "ndk", "native-libraries", "compatibility"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "strictmode",
            importance: "should-know",
            question: "What is StrictMode in Android?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>StrictMode</strong> is a developer tool that detects and reports accidental disk/network access on the main thread and certain resource leaks, surfacing them during development so they don't ship to production.</li></ul><p><strong>⚙️ Two policy types</strong></p><ul><li><strong>ThreadPolicy</strong> — flags disk reads/writes, network calls, and custom slow calls performed on the main thread (the classic ANR/jank cause).</li><li><strong>VmPolicy</strong> — flags process-wide issues: leaked <code>Closable</code> objects (unclosed <code>Cursor</code>/<code>SQLiteDatabase</code>), leaked <code>Activity</code>/registered receivers, and non-SDK API usage.</li></ul><p><strong>⚙️ Setup</strong></p><ul><li>Enabled in <code>Application.onCreate()</code>, typically gated to debug builds only; configurable to <code>.detectAll()</code> and either <code>.penaltyLog()</code> (log to Logcat) or <code>.penaltyDeath()</code> (crash immediately, useful in CI to enforce the rule).</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Leaving <code>penaltyDeath()</code> enabled in a release build would crash real users on any violation — always scope StrictMode to debug builds.</li></ul><p><strong>🎯 Interview tip:</strong> Knowing both policy types (Thread vs Vm) and being able to name a concrete violation each catches shows more than a one-line definition would.</p>",
            referenceLinks: [{ title: "StrictMode", url: "https://developer.android.com/reference/android/os/StrictMode" }],
            tags: ["strictmode", "debugging", "performance", "main-thread"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "StrictMode reporting a main-thread violation", code: "class MyApp : Application() {\n    override fun onCreate() {\n        super.onCreate()\n        if (BuildConfig.DEBUG) {\n            StrictMode.setThreadPolicy(\n                StrictMode.ThreadPolicy.Builder()\n                    .detectDiskReads()\n                    .detectDiskWrites()\n                    .detectNetwork()\n                    .penaltyLog()\n                    .build()\n            )\n            StrictMode.setVmPolicy(\n                StrictMode.VmPolicy.Builder()\n                    .detectLeakedSqlLiteObjects()\n                    .detectLeakedClosableObjects()\n                    .penaltyLog()\n                    .build()\n            )\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "Application.onCreate installs the thread policy before any screen exists, so it covers the whole app.",
                        "It is guarded by BuildConfig.DEBUG — a release build installs nothing and pays nothing.",
                        "The policy is a set of detectors: disk reads, disk writes and network on the main thread.",
                        "Some screen calls SharedPreferences.getString on the main thread. That is a disk read.",
                        "StrictMode notices the violation on the thread it happened on and applies the penalty.",
                        "penaltyLog writes a stack trace to Logcat pointing at the exact line.",
                        "The app carries on. Nothing crashes and no user sees anything — the violation is a report, not an error."
                    ],
                    explain: "<p>Step 7 is why <code>penaltyLog</code> is the safe default and also why it gets ignored: a warning nobody reads changes nothing. <code>penaltyDeath</code> crashes on violation, which is harsh and effective for a debug build, since a violation that stops the app in development is a violation that gets fixed.</p><p>The value is in step 4. Disk and network on the main thread are invisible on a fast device with a warm cache, and they are dropped frames on a cheap phone with a cold one. StrictMode surfaces them before a user does.</p><p><code>VmPolicy</code> is the other half — leaked Activities, unclosed cursors, unclosed <code>Closeable</code>s — and is at least as useful.</p>"
                } }],
            subsection: null
        },
        {
            id: "lint",
            importance: "should-know",
            question: "What is Lint? What is it used for?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Lint</strong> is Android's static analysis tool that scans project source for structural, correctness, performance, security, and accessibility issues without running the app.</li></ul><p><strong>⚙️ What it catches</strong></p><ul><li><strong>Correctness</strong> — unused resources, missing translations, hardcoded strings that should be resources.</li><li><strong>Performance</strong> — inefficient layouts, missing <code>RecyclerView</code> view-holder patterns.</li><li><strong>Security</strong> — <code>MODE_WORLD_WRITEABLE</code> usage, exported components without permissions, cleartext traffic.</li><li><strong>Accessibility</strong> — missing <code>contentDescription</code>, poor touch-target sizes.</li><li><strong>API compatibility</strong> — calling APIs newer than <code>minSdk</code> without a version guard.</li></ul><p><strong>⚙️ Usage</strong></p><ul><li>Runs automatically as part of a release build, or on demand via <code>./gradlew lint</code>; results are grouped by severity (<code>Error</code>, <code>Warning</code>, <code>Information</code>) in an HTML/XML report.</li><li><strong>Custom lint rules</strong> can be authored for team-specific conventions (e.g. banning a deprecated internal API) and shipped as a lint check library.</li><li>False positives or accepted risks can be suppressed with <code>@SuppressLint(\"IssueId\")</code> or a <code>lint.xml</code> baseline.</li></ul><p><strong>🎯 Interview tip:</strong> Mentioning custom lint rules for enforcing team conventions is a good signal of scaling engineering practice beyond just \"I run the default checks.\"</p>",
            referenceLinks: [{ title: "Improve your code with lint checks", url: "https://developer.android.com/studio/write/lint" }],
            tags: ["lint", "static-analysis", "code-quality", "gradle"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "app-release-checklist",
            importance: "should-know",
            question: "What is the Android App Release Checklist for Production Launch?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A production release requires more than just a green build — a checklist reduces the risk of shipping something broken, unoptimized, or non-compliant.</li></ul><p><strong>⚙️ Checklist</strong></p><ul><li><strong>Versioning</strong> — bump <code>versionCode</code>/<code>versionName</code> correctly for the new release.</li><li><strong>Minification/shrinking</strong> — enable R8 (<code>isMinifyEnabled = true</code>, <code>isShrinkResources = true</code>) and verify the app still works fully against the ProGuard/R8 rules (no runtime crashes from over-aggressive stripping).</li><li><strong>Signing</strong> — release build signed with the correct upload/release key, ideally via Play App Signing.</li><li><strong>Testing</strong> — full regression pass on the release build variant specifically (not just debug), across a representative device/OS matrix.</li><li><strong>Crash &amp; ANR monitoring</strong> — Crashlytics (or similar) wired up and verified to receive events from the release build.</li><li><strong>Privacy &amp; compliance</strong> — Play Console Data Safety form accurate, required permissions justified, privacy policy URL set.</li><li><strong>Performance sanity checks</strong> — app size within budget, cold-start time acceptable, no StrictMode/Lint criticals outstanding.</li><li><strong>Staged rollout</strong> — release to a small percentage first via a Play Console staged rollout, monitor crash rate/ANR rate before ramping to 100%.</li><li><strong>Rollback plan</strong> — know how to halt a rollout or push a hotfix quickly if metrics regress.</li></ul><p><strong>🎯 Interview tip:</strong> Leading with staged rollout + monitoring (not just \"press publish\") is what distinguishes a candidate who has actually shipped production apps.</p>",
            referenceLinks: [{ title: "Prepare your app for release", url: "https://developer.android.com/studio/publish/preparing" }],
            tags: ["release", "checklist", "play-console", "r8", "production"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "git-android-development",
            importance: "good-to-know",
            question: "What is Git and how is it used in Android development?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Git</strong> is a distributed version control system tracking source code history; in Android projects it manages everything from app modules to Gradle config, with a workflow tuned around feature branches and code review.</li></ul><p><strong>⚙️ Typical Android team workflow</strong></p><ul><li><strong>Branching model</strong> — a stable <code>main</code>/<code>develop</code> branch, short-lived <code>feature/*</code> branches merged via pull request after code review and passing CI.</li><li><strong>.gitignore essentials</strong> — exclude <code>build/</code>, <code>.gradle/</code>, <code>local.properties</code> (contains machine-specific SDK paths and secrets), and <code>*.keystore</code>/signing credentials.</li><li><strong>Git hooks</strong> — a pre-commit or pre-push hook running <code>ktlint</code>/lint checks locally before code even reaches CI.</li><li><strong>Conflict-prone files</strong> — generated/binary files (e.g. Gradle lock files, XML resource files touched by multiple people) are common merge-conflict hotspots; keeping modules focused reduces collisions.</li><li><strong>Tagging releases</strong> — tag commits (<code>v1.4.0</code>) at each release for traceability back to exactly what shipped.</li></ul><p><strong>🎯 Interview tip:</strong> Knowing to gitignore <code>local.properties</code> and keystores specifically (not just \"build folders\") is a small but telling detail interviewers notice.</p>",
            referenceLinks: [{ title: "Git documentation", url: "https://git-scm.com/doc" }],
            tags: ["git", "version-control", "workflow", "ci-cd"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "firebase",
            importance: "should-know",
            question: "What is Firebase?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Firebase</strong> is Google's Backend-as-a-Service platform — a bundle of hosted services (database, auth, storage, messaging, analytics, crash reporting) that an app talks to directly over SDKs, removing the need to build and operate that backend yourself.</li></ul><p><strong>⚙️ The services that matter on Android</strong></p><ul><li><strong>Cloud Firestore / Realtime Database</strong> — hosted NoSQL stores with offline caching and realtime listeners that push changes to connected clients.</li><li><strong>Firebase Authentication</strong> — email, phone and federated sign-in (Google, Apple, Facebook) with token management handled for you.</li><li><strong>Cloud Messaging (FCM)</strong> — the push notification transport; on Android it is the only supported path for delivering pushes to a backgrounded app.</li><li><strong>Crashlytics</strong> — crash and ANR reporting with deobfuscated stack traces when you upload your mapping file.</li><li><strong>Remote Config</strong> — server-driven values for feature flags and staged rollouts without shipping a release.</li><li><strong>Analytics</strong> — event funnels, and the audience targeting that Remote Config and messaging campaigns key off.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li><strong>For</strong> — very fast to integrate, generous free tier, offline persistence and realtime sync are genuinely hard problems you get for free.</li><li><strong>Against</strong> — vendor lock-in, query models far weaker than SQL (no joins, limited aggregation), costs that scale with document reads rather than compute, and security rules as the only authorization layer between a client and the data.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Security rules default to being the <em>entire</em> access-control story — a permissive rule exposes the database directly to any client that has your (publicly visible) config.</li><li>Firestore bills per document read, so an unbounded listener on a large collection is a cost bug, not just a performance one.</li><li>Adding the SDK pulls in Google Play Services, which matters for APK size and for markets where Play Services is unavailable.</li></ul><p><strong>🎯 Interview tip:</strong> The strongest answer names a service and the specific problem it removes — &quot;FCM because on Android you cannot hold a socket open in the background, so push has to go through the OS-level channel&quot; lands better than listing the product catalogue.</p>",
            referenceLinks: [{ title: "Firebase for Android", url: "https://firebase.google.com/docs/android/setup" }, { title: "Firebase Cloud Messaging", url: "https://firebase.google.com/docs/cloud-messaging" }],
            tags: ["firebase", "backend", "fcm", "crashlytics", "firestore", "analytics"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{
                language: "kotlin",
                title: "FCM delivery and a handled Crashlytics report",
                code: "class AppMessagingService : FirebaseMessagingService() {\n\n    override fun onNewToken(token: String) {\n        // Tokens rotate; the backend needs the current one to target this device\n        Firebase.crashlytics.setCustomKey(\"fcm_token_refreshed\", true)\n        registerTokenWithBackend(token)\n    }\n\n    override fun onMessageReceived(message: RemoteMessage) {\n        val deepLink = message.data[\"deep_link\"] ?: return\n\n        try {\n            showNotification(\n                title = message.notification?.title.orEmpty(),\n                body = message.notification?.body.orEmpty(),\n                deepLink = deepLink\n            )\n        } catch (e: IllegalArgumentException) {\n            // Non-fatal: the push arrived but we could not render it\n            Firebase.crashlytics.recordException(e)\n        }\n    }\n}",
                    output: {
                        kind: "trace",
                        lines: [
                            "The token rotates — after a reinstall, a restore, or cleared app data — and onNewToken fires.",
                            "The new token is sent to the backend. Without this the device silently stops receiving messages.",
                            "A message arrives. If the app is backgrounded and the payload has a notification block, the system displays it and onMessageReceived is never called.",
                            "For a data-only payload, onMessageReceived runs in both foreground and background.",
                            "The deep link is read from message.data, and a missing one returns early rather than crashing.",
                            "The navigation attempt fails — a malformed link, or a screen that no longer exists.",
                            "recordException reports it to Crashlytics as a NON-fatal, so it appears in the dashboard while the app carries on."
                        ],
                        explain: "<p>Step 3 is the behaviour behind \"notifications look different when the app is closed\". A <code>notification</code> payload hands display to the system, skipping any custom handling. Sending <strong>data-only</strong> messages keeps the app in charge in both states.</p><p>Step 7 is the Crashlytics distinction worth stating: <code>recordException</code> logs a handled error and the app continues, unlike an uncaught crash. It is how you get visibility into failures users never report — the ones where a screen simply did not open.</p><p>Since Android 13 the runtime <code>POST_NOTIFICATIONS</code> permission is also required, and without it posting silently does nothing.</p>"
                    }
            }],
            subsection: null
        },
        {
            id: "measure-method-execution-time",
            importance: "should-know",
            question: "How to measure method execution time in Android?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Multiple tools exist depending on whether you want a quick manual check or a full system-wide trace.</li></ul><p><strong>⚙️ Options</strong></p><ul><li><strong>Manual timing</strong> — wrap the call with <code>System.nanoTime()</code> before/after; simplest, but only measures wall-clock time for that one call, no context on what else was happening.</li><li><strong>Trace API</strong> — <code>android.os.Trace.beginSection(\"myMethod\")</code>/<code>endSection()</code> annotates a method for the system profiler, visible alongside OS-level activity in Perfetto/systrace captures.</li><li><strong>Android Studio CPU Profiler</strong> — record a method trace (sampled or instrumented) directly from the IDE, get a flame chart/call tree with per-method timing, no code changes required.</li><li><strong>Perfetto / systrace</strong> — captures a system-wide timeline (CPU scheduling, other processes, frame rendering) alongside your custom <code>Trace</code> sections — the right tool when a slow method might be caused by contention elsewhere in the system.</li><li><strong>Macrobenchmark library</strong> — for statistically rigorous, repeatable measurements (e.g. cold start time, scroll jank) as part of CI, rather than one-off manual checks.</li></ul><p><strong>🎯 Interview tip:</strong> If asked \"how would you find why a screen is slow,\" lead with the CPU Profiler/Perfetto, not manual <code>System.nanoTime()</code> — it shows you'd profile before guessing.</p>",
            referenceLinks: [{ title: "Inspect CPU activity with CPU Profiler", url: "https://developer.android.com/studio/profile/cpu-profiler" }, { title: "Macrobenchmark", url: "https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview" }],
            tags: ["profiling", "performance", "cpu-profiler", "perfetto", "systrace"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "Measuring a method two ways at once", code: "fun processLargeList(items: List<Item>) {\n    Trace.beginSection(\"processLargeList\")\n    try {\n        val start = System.nanoTime()\n        items.forEach { transform(it) }\n        val durationMs = (System.nanoTime() - start) / 1_000_000\n        Log.d(\"Perf\", \"processLargeList took ${durationMs}ms\")\n    } finally {\n        Trace.endSection()\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "Trace.beginSection opens a named section in the systrace / Perfetto buffer.",
                        "The work runs, and System.nanoTime brackets it for a number in the log.",
                        "nanoTime is used rather than currentTimeMillis because it is monotonic — immune to clock adjustments — and has far finer resolution.",
                        "The duration is logged in milliseconds.",
                        "Trace.endSection closes the section, in a finally so an exception cannot leave it unbalanced.",
                        "Recording a trace and opening it in Perfetto shows this section as a named block on the timeline.",
                        "Its width can then be compared against frame boundaries and against everything else on the main thread."
                    ],
                    explain: "<p>Step 5 is the detail that causes real confusion when missed: <code>beginSection</code> and <code>endSection</code> are a stack, and an unbalanced pair corrupts the trace from that point on. The <code>finally</code> is not defensive style, it is required.</p><p>Steps 6 and 7 are why both techniques appear together. The log line tells you <em>how long</em>; the trace tells you <em>when, relative to everything else</em> — which is what identifies a jank source. A method taking 8ms is fine on its own and fatal if it lands inside a frame that had 16ms for everything.</p><p>For real measurement, Macrobenchmark and Baseline Profiles have largely replaced hand timing, because a single run on a warm JIT tells you very little.</p>"
                } }],
            subsection: null
        },
        {
            id: "sqlite-database-debugging",
            importance: "good-to-know",
            question: "Can you access your SQLite Database for debugging?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Yes — several tools let you inspect an app's on-device SQLite database (including Room-backed ones) during development.</li></ul><p><strong>⚙️ Options</strong></p><ul><li><strong>Android Studio App Inspection (Database Inspector)</strong> — while the app runs on a device/emulator, browse tables, run live SQL queries, and even edit values directly from the IDE; the most convenient option for day-to-day debugging.</li><li><strong>adb + sqlite3</strong> — <code>adb shell run-as com.your.package</code> (on a debuggable build) to access the app's private data dir, then pull the <code>.db</code> file with <code>adb pull</code> and open it locally with the <code>sqlite3</code> CLI or a GUI tool like DB Browser for SQLite.</li><li><strong>In-app debug screen</strong> — some teams add a debug-only screen listing table contents via Room DAOs, useful for QA builds without needing a connected IDE.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li><code>run-as</code> only works on a debuggable app (or a rooted device for release builds) — release builds on a non-rooted device won't expose the private data directory this way.</li></ul><p><strong>🎯 Interview tip:</strong> Naming the Database Inspector by name (not just \"pull the file with adb\") shows you know the modern IDE-integrated workflow.</p>",
            referenceLinks: [{ title: "Inspect database data with Database Inspector", url: "https://developer.android.com/studio/inspect/database" }],
            tags: ["sqlite", "debugging", "database-inspector", "adb", "room"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "proguard-things-to-care",
            importance: "should-know",
            question: "What are things to take care of while using ProGuard?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>ProGuard/R8 shrinks, obfuscates, and optimizes bytecode — powerful, but aggressive enough to break reflection-based code if rules aren't precise.</li></ul><p><strong>⚠️ Things to watch for</strong></p><ul><li><strong>Reflection-based libraries</strong> — Gson/Moshi/Retrofit model classes, or anything accessed via reflection, need explicit <code>-keep</code> rules, or field names get renamed and (de)serialization silently breaks at runtime.</li><li><strong>Test thoroughly on the release build</strong> — a debug build (unminified) can pass all manual QA while the release build crashes from an over-stripped class; always smoke-test the actual release/minified APK before shipping.</li><li><strong>Third-party library rules</strong> — many libraries ship their own <code>consumer-rules.pro</code>, but some require manually adding rules from their documentation — check the library's docs for a ProGuard/R8 section.</li><li><strong>Native/JNI bridges</strong> — classes/methods called from native code via JNI must be kept, since R8 can't see that reflection-like usage.</li><li><strong>Reflection in your own code</strong> — anything using <code>Class.forName()</code>, custom serialization, or annotation-driven frameworks needs matching <code>-keep</code> rules.</li><li><strong>Mapping file retention</strong> — keep the <code>mapping.txt</code> generated per release so obfuscated stack traces from crash reports can be de-obfuscated later; losing it makes production crash reports unreadable.</li></ul><p><strong>🎯 Interview tip:</strong> The mapping-file-retention point is the one candidates most often forget — bring it up unprompted to stand out.</p>",
            referenceLinks: [{ title: "Shrink, obfuscate, and optimize your app", url: "https://developer.android.com/topic/performance/app-optimization/enable-app-optimization" }],
            tags: ["proguard", "r8", "obfuscation", "shrinking", "keep-rules"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "xml", title: "What R8 does, and what these rules stop it doing", code: "&lt;!-- proguard-rules.pro (shown as illustrative snippet) --&gt;\n-keep class com.example.app.model.** { *; }\n-keepattributes Signature\n-keepattributes *Annotation*\n\n# Retrofit / OkHttp\n-dontwarn okhttp3.**\n-keep class retrofit2.** { *; }\n\n# Keep classes referenced from JNI\n-keepclasseswithmembers class * {\n    native <methods>;\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "R8 builds a graph of everything reachable from the entry points — the manifest components, and anything a -keep rule names.",
                        "Unreachable classes and methods are removed. This is shrinking, and it is where most of the size saving comes from.",
                        "What remains is renamed to short names: a.a.a. This is obfuscation.",
                        "Anything found by reflection is invisible to that graph, because nothing calls it in the bytecode.",
                        "-keep on the model package therefore prevents Gson's reflective field lookup from failing on renamed fields.",
                        "-keepattributes Signature preserves generic type information, without which Gson cannot tell List<User> from List.",
                        "Native methods are kept because JNI resolves them by name at runtime, and a renamed method cannot be found."
                    ],
                    explain: "<p>Step 4 is the single idea behind every rule in the file: <strong>R8 can only see what the bytecode references</strong>. Reflection, JNI, and anything named in a string are outside its view, so they have to be declared by hand.</p><p>The consequence is the classic release-only crash. Debug builds have R8 disabled, so the app works perfectly until a shrunk build reaches a field that no longer has that name — and it usually surfaces first on the Play console, in production.</p><p>Which is why the practical advice is to build a release variant and actually run it before shipping, and to keep <code>mapping.txt</code> for every release so a stack trace can be de-obfuscated.</p>"
                } }],
            subsection: null
        },
        {
            id: "android-studio-memory-profiler",
            importance: "should-know",
            question: "How to use Android Studio Memory Profiler?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>The <strong>Memory Profiler</strong> in Android Studio's Profiler window visualizes live memory allocation and helps find leaks and excessive garbage collection.</li></ul><p><strong>⚙️ Workflow</strong></p><ul><li><strong>Live timeline</strong> — shows Java/Kotlin heap, native heap, graphics, and stack memory over time; a sawtooth pattern with rising baselines across GC cycles is the classic visual signature of a leak.</li><li><strong>Capture a heap dump</strong> — snapshot all live objects at a point in time; browse by class, instance count, and shallow/retained size to find what's consuming memory.</li><li><strong>Record allocations</strong> — track every allocation over a time window (e.g. during a suspected leaky flow like open→close a screen repeatedly) to see what's being created and by which call stack.</li><li><strong>Compare heap dumps</strong> — take a dump before and after a repeated action (e.g. navigate to a screen and back 5 times); objects whose instance count keeps growing without dropping back down are leak candidates.</li><li><strong>Force GC</strong> — trigger garbage collection manually from the profiler to rule out \"still referenced\" objects that just haven't been collected yet vs. genuinely leaked ones.</li></ul><p><strong>🎯 Interview tip:</strong> Describe the \"repeat an action N times, then diff two heap dumps\" technique specifically — it's the concrete workflow interviewers want to hear, not just \"I'd open the profiler.\"</p>",
            referenceLinks: [{ title: "Inspect your app's memory usage with Memory Profiler", url: "https://developer.android.com/studio/profile/capture-heap-dump" }],
            tags: ["memory-profiler", "profiling", "leaks", "android-studio", "heap-dump"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "kotlin-dsl-gradle",
            importance: "should-know",
            question: "What is Kotlin DSL for Gradle?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Kotlin DSL (<code>.kts</code> files)</strong> lets you write Gradle build scripts in Kotlin instead of Groovy, gaining static typing, IDE autocompletion, and refactoring support for build logic.</li></ul><p><strong>⚙️ Key differences from Groovy DSL</strong></p><ul><li><strong>File extension</strong> — <code>build.gradle.kts</code> / <code>settings.gradle.kts</code> instead of <code>build.gradle</code>.</li><li><strong>Type safety</strong> — the compiler catches typos and wrong-type arguments at build-script compile time instead of failing deep into a build at runtime.</li><li><strong>IDE support</strong> — full autocompletion and \"go to definition\" for Gradle APIs, since it's real Kotlin code checked against the Gradle API surface.</li><li><strong>Syntax differences</strong> — assignment uses <code>=</code> consistently, string interpolation with <code>\"${'$'}{variable}\"</code>, and plugin application via the type-safe <code>plugins {}</code> block with <code>id(\"com.android.application\")</code>.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li>Kotlin DSL scripts have historically been slower to configure than Groovy on first sync (better with configuration caching in modern Gradle), but the type-safety and tooling gains are why Google now scaffolds new projects with <code>.kts</code> by default.</li></ul><p><strong>🎯 Interview tip:</strong> Mention that Android Studio's New Project wizard defaults to Kotlin DSL today — a small fact that signals you're current with the ecosystem.</p>",
            referenceLinks: [{ title: "Migrating build logic from Groovy to Kotlin", url: "https://docs.gradle.org/current/userguide/migrating_from_groovy_to_kotlin_dsl.html" }],
            tags: ["gradle", "kotlin-dsl", "build-script", "groovy"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "How Gradle reads build.gradle.kts", code: "plugins {\n    id(\"com.android.application\")\n    id(\"org.jetbrains.kotlin.android\")\n}\n\nandroid {\n    namespace = \"com.example.app\"\n    compileSdk = 34\n\n    defaultConfig {\n        applicationId = \"com.example.app\"\n        minSdk = 24\n        targetSdk = 34\n        versionCode = 1\n        versionName = \"1.0\"\n    }\n\n    buildTypes {\n        release {\n            isMinifyEnabled = true\n            proguardFiles(getDefaultProguardFile(\"proguard-android-optimize.txt\"), \"proguard-rules.pro\")\n        }\n    }\n}\n\ndependencies {\n    implementation(\"androidx.core:core-ktx:1.13.1\")\n    implementation(\"androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.0\")\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "The plugins block is evaluated first and separately, because Gradle needs the plugins before anything else can be typed.",
                        "Applying com.android.application adds the android { } extension to the project. Without it, that block does not exist and does not compile.",
                        "Because this is Kotlin, the whole file is compiled — a typo in a property name is a compile error, and the IDE can autocomplete it.",
                        "The android block configures the extension: namespace, compileSdk, defaultConfig.",
                        "None of this runs any build work. It is the CONFIGURATION phase, which builds the task graph.",
                        "Only afterwards does the execution phase run the tasks that were actually requested.",
                        "The first build after an edit is slower than Groovy would be, because the script itself has to be compiled — and later builds are faster, because it is cached."
                    ],
                    explain: "<p>Step 3 is the whole argument for the Kotlin DSL over Groovy. Groovy build files are dynamically typed, so a misspelled property fails at configuration time with an unhelpful message, if it fails at all. Kotlin turns those into compile errors with autocompletion.</p><p>Step 5 is the distinction that explains a lot of confusing Gradle behaviour: configuration runs for <em>every</em> build, whatever task you asked for. Expensive work in a configuration block slows down every command, including <code>./gradlew tasks</code>.</p>"
                } }],
            subsection: null
        },
        {
            id: "implementation-vs-api-gradle",
            importance: "must-know",
            question: "What is the difference between implementation and api in Gradle?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Both add a dependency to a module, but they differ in whether that dependency is exposed to modules that depend on <em>this</em> module — the difference matters most in multi-module projects.</li></ul><table><thead><tr><th></th><th><code>implementation</code></th><th><code>api</code></th></tr></thead><tbody><tr><td>Visibility to downstream modules</td><td>Hidden — not on their compile classpath</td><td>Exposed — transitively available on their compile classpath</td></tr><tr><td>Build speed on change</td><td>Faster — changing this dependency only recompiles this module and its direct consumers at the API level</td><td>Slower — a change can force recompilation of every downstream module that transitively sees it</td></tr><tr><td>Use when</td><td>The dependency is an internal implementation detail (default choice)</td><td>Downstream modules genuinely need the dependency's types in their own public API</td></tr></tbody></table><p><strong>⚙️ Rule of thumb</strong></p><ul><li>Default to <code>implementation</code> everywhere; only reach for <code>api</code> when a module's own public function signatures return or accept a type from that dependency, so downstream code genuinely can't compile without seeing it.</li></ul><p><strong>🎯 Interview tip:</strong> Tie it back to build performance, not just visibility — over-using <code>api</code> is a classic cause of slow incremental builds in large multi-module apps.</p>",
            referenceLinks: [{ title: "Gradle Java Library plugin — api vs implementation", url: "https://docs.gradle.org/current/userguide/java_library_plugin.html#sec:java_library_separation" }],
            tags: ["gradle", "implementation", "api", "multi-module", "build-speed"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "gradle",
            importance: "should-know",
            question: "What is Gradle?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Gradle</strong> is the build automation tool Android uses to compile source, manage dependencies, run tests, and package the final APK/AAB, driven by a task-based dependency graph.</li></ul><p><strong>⚙️ Key ideas</strong></p><ul><li><strong>Task graph</strong> — a build is a directed graph of tasks (<code>compileDebugKotlin</code>, <code>mergeDebugResources</code>, <code>assembleDebug</code>...); Gradle runs only the tasks needed for the requested output and skips/reuses tasks whose inputs haven't changed (<strong>incremental build</strong>, <strong>build cache</strong>).</li><li><strong>Plugins</strong> — the Android Gradle Plugin (AGP) adds Android-specific tasks/DSL on top of core Gradle; the Kotlin plugin adds Kotlin compilation.</li><li><strong>Dependency management</strong> — resolves and downloads dependencies from repositories (Maven Central, Google's Maven repo), handling transitive dependency resolution and conflict resolution.</li><li><strong>Multi-module support</strong> — a <code>settings.gradle.kts</code> ties together multiple modules (<code>:app</code>, <code>:core</code>, <code>:feature-x</code>), each configurable and buildable somewhat independently.</li></ul><p><strong>🎯 Interview tip:</strong> Mentioning incremental builds + the build cache (not just \"it compiles my code\") shows you understand why Gradle configuration choices affect build speed.</p>",
            referenceLinks: [{ title: "Gradle overview", url: "https://developer.android.com/build" }],
            tags: ["gradle", "build-system", "agp", "tasks"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "gradle-related-files",
            importance: "should-know",
            question: "What are the Gradle related files in an Android Project?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>An Android project's Gradle setup is spread across several files, each with a distinct role.</li></ul><p><strong>⚙️ Files</strong></p><ul><li><strong><code>settings.gradle.kts</code></strong> — declares which modules are part of the build (<code>include(\":app\", \":core\")</code>) and repository settings.</li><li><strong>Top-level <code>build.gradle.kts</code></strong> — declares plugin versions shared across modules (via <code>plugins {}</code> with <code>apply false</code>), rarely contains actual build logic itself.</li><li><strong>Module-level <code>build.gradle.kts</code></strong> (e.g. <code>app/build.gradle.kts</code>) — the actual per-module config: <code>android {}</code> block, <code>dependencies {}</code>, build types, flavors.</li><li><strong><code>gradle.properties</code></strong> — JVM args for the Gradle daemon, feature flags (e.g. <code>android.useAndroidX=true</code>), and project-wide properties.</li><li><strong><code>local.properties</code></strong> — machine-local config (SDK path); never committed to version control.</li><li><strong><code>gradle/libs.versions.toml</code></strong> — the <strong>Version Catalog</strong>, centralizing dependency versions/aliases so every module references the same coordinates consistently.</li><li><strong><code>gradle/wrapper/gradle-wrapper.properties</code></strong> — pins the exact Gradle version the project builds with, so every developer/CI machine uses the same version regardless of what's globally installed.</li></ul><p><strong>🎯 Interview tip:</strong> Mentioning the version catalog (<code>libs.versions.toml</code>) shows familiarity with current best practice for dependency management across multi-module projects.</p>",
            referenceLinks: [{ title: "Gradle files", url: "https://developer.android.com/build#module-level" }, { title: "Migrate to version catalogs", url: "https://developer.android.com/build/migrate-to-catalogs" }],
            tags: ["gradle", "project-structure", "version-catalog", "build-files"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "custom-gradle-task",
            importance: "should-know",
            question: "How do you create a custom task in Gradle?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Gradle lets you define custom tasks for project-specific automation (e.g. generating a changelog, cleaning a custom directory, running a code-gen step) beyond what built-in plugins provide.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Register a task</strong> — use <code>tasks.register(\"taskName\") { ... }</code> in a <code>build.gradle.kts</code>, which lazily configures the task only if it's actually needed for the requested build (faster than the older, eager <code>task(\"name\")</code> syntax).</li><li><strong>Custom task class</strong> — for reusable logic, extend <code>DefaultTask</code> with <code>@TaskAction</code>-annotated functions, and declare typed <code>@Input</code>/<code>@OutputFile</code> properties so Gradle can correctly determine when the task's inputs changed (enabling incremental/up-to-date checks).</li><li><strong>Wiring into the build</strong> — set <code>dependsOn</code> to control task ordering relative to existing tasks (e.g. running before <code>preBuild</code>).</li></ul><p><strong>🎯 Interview tip:</strong> Mention declaring <code>@Input</code>/<code>@OutputFile</code> properly — that's what lets Gradle skip the task when nothing relevant changed, which is the whole point of a build system doing incremental work.</p>",
            referenceLinks: [{ title: "Writing custom tasks", url: "https://docs.gradle.org/current/userguide/custom_tasks.html" }],
            tags: ["gradle", "custom-task", "build-script", "automation"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "Registering a task, and when its body runs", code: "tasks.register(\"printVersionInfo\") {\n    group = \"reporting\"\n    description = \"Prints the app's version name and code\"\n\n    doLast {\n        val versionName = android.defaultConfig.versionName\n        val versionCode = android.defaultConfig.versionCode\n        println(\"Version: $versionName ($versionCode)\")\n    }\n}\n\n// Run with: ./gradlew printVersionInfo",
                output: {
                    kind: "trace",
                    lines: [
                        "tasks.register creates the task lazily — the configuration block is not evaluated unless the task is actually needed.",
                        "group and description are set at configuration time, which is what makes it appear under ./gradlew tasks.",
                        "The doLast block is NOT run here. It is added as an action for the execution phase.",
                        "During configuration, Gradle builds the task graph for the requested tasks.",
                        "./gradlew printVersionInfo is invoked, so this task is in the graph.",
                        "The execution phase runs its actions, and doLast reads the version and prints it.",
                        "Any other Gradle command never runs doLast, and with register never even evaluates the configuration block."
                    ],
                    explain: "<p>Steps 1 and 7 are the reason <code>tasks.register</code> is preferred to <code>tasks.create</code>. <code>create</code> is eager: it configures the task on every build, whether or not it will run. In a large multi-module project the sum of that eager configuration is a measurable share of build time, which is what task configuration avoidance is about.</p><p>Step 3 is the classic mistake in one line: code placed directly in the configuration block runs during <em>every</em> build. Work belongs in <code>doLast</code> or <code>doFirst</code>, never beside them.</p>"
                } }],
            subsection: null
        },
        {
            id: "annotation-processor-kapt-ksp",
            importance: "should-know",
            question: "What is the difference between annotationProcessor, kapt, and ksp?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>All three plug annotation-driven code generation (Room, Dagger, Moshi codegen, etc.) into the build, but differ in which language they target and how fast they run.</li></ul><table><thead><tr><th></th><th><code>annotationProcessor</code></th><th><code>kapt</code></th><th><code>ksp</code></th></tr></thead><tbody><tr><td>Target language</td><td>Java (uses <code>javax.annotation.processing</code>)</td><td>Kotlin — wraps Java's annotation processing by first generating a Java-compatible stub of Kotlin code</td><td>Kotlin — a purpose-built Kotlin Symbol Processing API</td></tr><tr><td>Speed</td><td>Fast for Java-only projects</td><td>Slower — the Kotlin-stub-generation step adds real overhead</td><td>Significantly faster than kapt — works directly against Kotlin symbols, no stub generation</td></tr><tr><td>Library support</td><td>Universal for Java processors</td><td>Works with any existing Java annotation processor</td><td>Requires the library to ship a KSP-specific processor; not all libraries have migrated</td></tr></tbody></table><p><strong>⚙️ Guidance</strong></p><ul><li>Prefer <strong>KSP</strong> wherever the library supports it (Room, Moshi, and most modern libraries do) for meaningfully faster builds; fall back to <strong>kapt</strong> only for libraries (e.g. older Dagger setups) without a KSP processor yet.</li></ul><p><strong>🎯 Interview tip:</strong> Concretely say \"KSP avoids kapt's stub-generation step\" — that's the actual mechanical reason for the speed difference, not just \"KSP is newer.\"</p>",
            referenceLinks: [{ title: "KSP overview", url: "https://kotlinlang.org/docs/ksp-overview.html" }, { title: "kapt", url: "https://kotlinlang.org/docs/kapt.html" }],
            tags: ["kapt", "ksp", "annotation-processor", "build-speed", "room", "dagger"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "Why swapping kapt for ksp is faster", code: "plugins {\n    id(\"com.google.devtools.ksp\") version \"2.0.0-1.0.22\"\n}\n\ndependencies {\n    implementation(\"androidx.room:room-runtime:2.6.1\")\n    ksp(\"androidx.room:room-compiler:2.6.1\") // was: kapt(\"androidx.room:room-compiler:2.6.1\")\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "kapt exists because Java annotation processors cannot read Kotlin source.",
                        "So kapt runs the Kotlin compiler in a special mode to generate Java stubs for every Kotlin class in the module.",
                        "The Java annotation processor then runs against those stubs and generates code.",
                        "The Kotlin compiler runs again, properly this time, over the original sources plus the generated ones.",
                        "The stub generation is pure overhead, and it scales with the size of the module rather than with how much is annotated.",
                        "KSP replaces all of it: processors read the Kotlin syntax tree directly, with no stubs and no extra compilation.",
                        "Swapping kapt(\"room-compiler\") for ksp(\"room-compiler\") is usually the whole migration, and the generated code is identical."
                    ],
                    explain: "<p>Steps 2 and 5 are the answer to \"why is kapt slow\": the cost is generating Java stubs for the entire module, whether or not anything in it is annotated. That is why the speed-up from KSP is large in big modules and negligible in tiny ones.</p><p>Step 7 is the practical note: Room, Moshi and Hilt all ship KSP processors, so the migration is a one-line change per dependency. A module with one remaining kapt-only processor keeps the stub generation and most of the cost, which is why partial migrations disappoint.</p><p>kapt is now in maintenance mode, and KSP2 is where the work is going.</p>"
                } }],
            subsection: null
        },
        {
            id: "build-variants",
            importance: "should-know",
            question: "What are Build Variants in Android?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>A <strong>build variant</strong> is the combination of a <strong>build type</strong> (debug/release) and a <strong>product flavor</strong> (e.g. free/paid, staging/production), letting one codebase produce multiple distinct app builds.</li></ul><p><strong>⚙️ Pieces</strong></p><ul><li><strong>Build types</strong> — configure how the app is packaged (<code>debug</code>: debuggable, unminified; <code>release</code>: minified, signed for distribution); defined in the <code>buildTypes {}</code> block.</li><li><strong>Product flavors</strong> — configure <em>what</em> the app is (different <code>applicationId</code>, API base URL, feature set, branding); defined in <code>productFlavors {}</code>, optionally grouped into <strong>flavor dimensions</strong> (e.g. a \"tier\" dimension: free/paid, crossed with an \"environment\" dimension: staging/prod).</li><li><strong>Resulting variants</strong> — Gradle generates the cross-product automatically: e.g. <code>freeStagingDebug</code>, <code>paidProdRelease</code>.</li><li><strong>Source sets</strong> — each flavor/build type can have its own <code>src/&lt;name&gt;/</code> folder with variant-specific code/resources that merge with <code>src/main/</code> at build time.</li></ul><p><strong>🎯 Interview tip:</strong> If asked to design a staging-vs-production setup, describe it as flavor dimensions (environment × tier) rather than hardcoding a single flavor per combination — it scales cleanly as more axes get added.</p>",
            referenceLinks: [{ title: "Configure build variants", url: "https://developer.android.com/build/build-variants" }],
            tags: ["build-variants", "product-flavors", "build-types", "gradle"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "How a flavour becomes a build variant", code: "android {\n    flavorDimensions += \"environment\"\n\n    productFlavors {\n        create(\"staging\") {\n            dimension = \"environment\"\n            applicationIdSuffix = \".staging\"\n            buildConfigField(\"String\", \"BASE_URL\", \"\\\"https://staging.api.example.com/\\\"\")\n        }\n        create(\"production\") {\n            dimension = \"environment\"\n            buildConfigField(\"String\", \"BASE_URL\", \"\\\"https://api.example.com/\\\"\")\n        }\n    }\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "flavorDimensions declares one axis of variation, named environment.",
                        "Two flavours are declared on that dimension: staging and production.",
                        "Android Gradle Plugin combines every flavour with every build type, giving stagingDebug, stagingRelease, productionDebug and productionRelease.",
                        "applicationIdSuffix on staging changes its package to com.example.app.staging, so both builds can be installed side by side.",
                        "buildConfigField writes a different BASE_URL constant into each variant's generated BuildConfig.",
                        "Source sets are merged per variant: src/main, then src/staging, then src/stagingDebug, with the more specific winning.",
                        "Application code reads BuildConfig.BASE_URL and never knows which variant it is."
                    ],
                    explain: "<p>Step 3 is the multiplication that surprises people: flavours and build types are separate axes, and a second dimension multiplies again. Three environments times two build types times two ABIs is twelve variants, each needing its own build.</p><p>Step 4 is the one that saves real time day to day — a different <code>applicationId</code> means the tester can have staging and production on one device at once.</p><p>Step 6 is the mechanism behind flavour-specific resources and code: a file in <code>src/staging</code> replaces the one in <code>src/main</code> for that variant, which is how a different icon or a stub implementation gets swapped in without any conditional code.</p>"
                } }],
            subsection: null
        },
        {
            id: "desugaring",
            importance: "should-know",
            question: "What is Desugaring in Android?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Desugaring</strong> lets you use newer Java language APIs and syntax in your app even when targeting older Android API levels that don't natively support them, by rewriting the bytecode to backward-compatible equivalents at build time.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li><strong>Core library desugaring</strong> — enabled via <code>isCoreLibraryDesugaringEnabled = true</code> plus the <code>coreLibraryDesugaring</code> dependency; lets you call APIs like <code>java.time.*</code> (<code>LocalDate</code>, <code>Instant</code>), <code>java.util.stream</code>, and newer <code>java.util.function</code> interfaces even on <code>minSdk</code> below the level where they were originally added to the platform.</li><li><strong>Language-level desugaring</strong> — separately, D8/R8 already rewrite newer Java <em>language</em> constructs (like lambdas and try-with-resources) into bytecode runnable on older API levels — this happens automatically, no explicit flag needed.</li></ul><p><strong>⚖️ Distinction</strong></p><ul><li>Language desugaring is about syntax; <strong>core library desugaring</strong> is about actual <em>API availability</em> (real class implementations backported), which is the type most often meant in interview answers.</li></ul><p><strong>🎯 Interview tip:</strong> Give a concrete example — using <code>java.time.LocalDate</code> with a <code>minSdk</code> below 26 — it's the textbook use case interviewers expect.</p>",
            referenceLinks: [{ title: "Use Java 8+ APIs with core library desugaring", url: "https://developer.android.com/studio/write/java8-support" }],
            tags: ["desugaring", "d8", "r8", "java-8", "minsdk"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "kotlin", title: "What core library desugaring actually does", code: "android {\n    compileOptions {\n        isCoreLibraryDesugaringEnabled = true\n        sourceCompatibility = JavaVersion.VERSION_11\n        targetCompatibility = JavaVersion.VERSION_11\n    }\n}\n\ndependencies {\n    coreLibraryDesugaring(\"com.android.tools:desugar_jdk_libs:2.0.4\")\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "The code uses java.time.LocalDate, which the Android platform only provides from API 26.",
                        "minSdk is lower than that, so on an older device the class does not exist and the app would crash with NoClassDefFoundError.",
                        "isCoreLibraryDesugaringEnabled = true turns on the D8 rewriting step.",
                        "The coreLibraryDesugaring dependency supplies backported implementations of those APIs.",
                        "At build time D8 rewrites every reference to java.time.LocalDate into a reference to the bundled backport.",
                        "The APK ships that backport, so the code runs identically on API 21 and API 34.",
                        "This is separate from language desugaring, which is always on and handles lambdas and default interface methods."
                    ],
                    explain: "<p>Step 5 is the part worth being precise about, because it is what distinguishes this from a support library: nothing in the source changes, and no alternative API is used. The rewriting happens in the build, so the code reads as ordinary <code>java.time</code>.</p><p>Step 7 is the distinction that gets asked. <strong>Language</strong> desugaring rewrites newer Java <em>syntax</em> into bytecode older devices understand and needs no configuration. <strong>Core library</strong> desugaring backports the <em>APIs</em> — <code>java.time</code>, <code>java.util.stream</code>, <code>Optional</code> — and is opt-in because it adds to the APK.</p>"
                } }],
            subsection: null
        },
        {
            id: "reduce-apk-size",
            importance: "must-know",
            question: "How to reduce APK size?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Smaller downloads improve install conversion and reduce storage pressure — several independent levers combine for the biggest reduction.</li></ul><p><strong>⚙️ Techniques</strong></p><ul><li><strong>Use Android App Bundle (AAB)</strong> instead of a universal APK — Play delivers only the resources/native libs/languages a specific device needs, via dynamic delivery.</li><li><strong>Enable R8 shrinking</strong> — <code>isMinifyEnabled = true</code> removes unused code, <code>isShrinkResources = true</code> removes unused resources.</li><li><strong>Configure resource shrinking further</strong> — restrict bundled languages (<code>resourceConfigurations</code>) if you don't need every locale bundled.</li><li><strong>Optimize images</strong> — use WebP instead of PNG, vector drawables (<code>VectorDrawable</code>) instead of multiple density-specific rasters, and avoid shipping oversized source images.</li><li><strong>Avoid duplicate/heavy libraries</strong> — audit dependencies for overlap (e.g. two JSON libraries pulled in transitively) and prefer lighter-weight alternatives where functionality overlaps.</li><li><strong>Split native libraries by ABI</strong> — via <code>ndk { abiFilters }</code> or bundle-driven per-ABI splits, avoid shipping every architecture's <code>.so</code> in one artifact.</li><li><strong>Dynamic feature modules</strong> — move rarely-used features behind on-demand delivery instead of bundling them into the base install.</li></ul><p><strong>🎯 Interview tip:</strong> \"Switch to AAB\" is the single highest-leverage answer — lead with it, then layer in shrinking and asset optimization.</p>",
            referenceLinks: [{ title: "Reduce your app size", url: "https://developer.android.com/topic/performance/reduce-apk-size" }, { title: "About Android App Bundles", url: "https://developer.android.com/guide/app-bundle" }],
            tags: ["apk-size", "app-bundle", "r8", "resource-shrinking", "optimization"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "speed-up-gradle-build",
            importance: "should-know",
            question: "How can you speed up the Gradle build?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Build speed compounds developer productivity — several Gradle-level and project-structure-level levers address it.</li></ul><p><strong>⚙️ Techniques</strong></p><ul><li><strong>Enable the Gradle daemon, parallel builds, and configuration cache</strong> — <code>org.gradle.parallel=true</code>, <code>org.gradle.caching=true</code>, <code>org.gradle.configuration-cache=true</code> in <code>gradle.properties</code> let independent modules build concurrently and skip re-running configuration when nothing changed.</li><li><strong>Modularize the app</strong> — splitting a monolithic <code>:app</code> into feature/core modules lets Gradle rebuild and re-test only what actually changed, and enables parallel module compilation.</li><li><strong>Prefer KSP over kapt</strong> — avoids kapt's Kotlin-stub-generation overhead for annotation processing.</li><li><strong>Avoid unnecessary <code>api</code> dependencies</strong> — using <code>implementation</code> by default limits the blast radius of recompilation when a dependency changes.</li><li><strong>Use a remote build cache</strong> — share cached task outputs across CI machines/developers so identical inputs never rebuild from scratch anywhere.</li><li><strong>Avoid dynamic dependency versions</strong> (e.g. <code>1.+</code>) which force Gradle to re-check for new versions on every build instead of resolving once and caching.</li><li><strong>Profile the build</strong> — <code>./gradlew build --profile</code> or the Gradle Build Scan to identify the actual slowest tasks instead of guessing.</li></ul><p><strong>🎯 Interview tip:</strong> Modularization plus the build cache is the combination that scales best on large teams — mention both together, not just individual Gradle flags.</p>",
            referenceLinks: [{ title: "Improve build speed", url: "https://developer.android.com/build/optimize-your-build" }, { title: "Gradle build cache", url: "https://docs.gradle.org/current/userguide/build_cache.html" }],
            tags: ["gradle", "build-speed", "modularization", "build-cache", "ksp"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "xml", title: "What each of these flags changes", code: "&lt;!-- gradle.properties (shown as illustrative snippet) --&gt;\norg.gradle.jvmargs=-Xmx4096m\norg.gradle.parallel=true\norg.gradle.caching=true\norg.gradle.configuration-cache=true\nkotlin.incremental=true",
                output: {
                    kind: "trace",
                    lines: [
                        "org.gradle.jvmargs raises the daemon's heap. Too low and the build spends its time in GC; too high and it competes with the IDE for memory.",
                        "org.gradle.parallel lets independent modules build at the same time, which does nothing for a single-module app and a great deal for twenty.",
                        "org.gradle.caching turns on the build cache: a task whose inputs have not changed reuses its previous output instead of re-running.",
                        "That cache works across branches and, when configured remotely, across machines and CI.",
                        "org.gradle.configuration-cache saves the configured task graph itself, so the configuration phase is skipped entirely on the next build.",
                        "kotlin.incremental recompiles only the Kotlin files affected by a change, rather than the whole module.",
                        "The combined effect is largest on the second and later builds; a clean build still has to do everything once."
                    ],
                    explain: "<p>Step 5 is the biggest single win in a modern build and the fussiest to enable, because it requires build scripts that do not read mutable state at execution time. Gradle reports exactly which script broke the rule, and fixing those is usually the real work of enabling it.</p><p>Step 3 is worth distinguishing from incremental builds: <strong>incremental</strong> means doing less work; <strong>cached</strong> means doing none, because an identical result already exists. Checking out an old branch and rebuilding is where the difference is obvious.</p><p>Measure with <code>--scan</code> before and after. Most of these flags are free, and the heap setting is the one that can make things worse.</p>"
                } }],
            subsection: null
        },
        {
            id: "gradle-build-system-explained",
            importance: "should-know",
            question: "Explain the Gradle build system.",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Gradle turns a project's declarative configuration into a concrete, minimal <strong>task execution graph</strong>, running only what's necessary to produce the requested output.</li></ul><p><strong>⚙️ Build phases</strong></p><ul><li><strong>Initialization</strong> — Gradle reads <code>settings.gradle.kts</code> to determine which modules participate in the build.</li><li><strong>Configuration</strong> — every module's <code>build.gradle.kts</code> is evaluated, building up the task graph (which tasks exist and their dependencies), without yet executing any task's actual work.</li><li><strong>Execution</strong> — Gradle topologically orders the requested tasks and their dependencies, then executes them (in parallel where the dependency graph allows), skipping any task whose inputs/outputs are unchanged since the last run (<strong>up-to-date checks</strong>) or restoring cached outputs from the build cache.</li></ul><p><strong>⚙️ Android-specific layer</strong></p><ul><li>The <strong>Android Gradle Plugin (AGP)</strong> adds the tasks specific to Android: resource merging, manifest merging, D8/R8 dexing, APK/AAB packaging, and wires them into the standard <code>assemble</code>/<code>build</code> lifecycle tasks.</li></ul><p><strong>🎯 Interview tip:</strong> Naming all three phases (initialization/configuration/execution) explicitly, and where the configuration cache slots in (skipping configuration entirely on a cache hit), is what separates a surface-level vs deep answer.</p>",
            referenceLinks: [{ title: "Build lifecycle — Gradle docs", url: "https://docs.gradle.org/current/userguide/build_lifecycle.html" }],
            tags: ["gradle", "build-system", "agp", "build-lifecycle"],
            hasDiagram: true,
            diagramType: "flowchart",
            diagramConfig: {
                title: "Gradle build phases",
                columns: 3,
                nodes: [
                    { label: "Initialization", type: "terminal" },
                    { label: "Configuration" },
                    { label: "Execution", type: "terminal" }
                ],
                connections: [
                    { from: 0, to: 1, label: "read settings" },
                    { from: 1, to: 2, label: "build task graph" }
                ]
            },
            codeSnippets: [],
            subsection: null
        },
        {
            id: "multiple-apks",
            importance: "good-to-know",
            question: "What about multiple APKs for Android apps?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Before App Bundles, <strong>Multiple APK support</strong> let you publish several APKs under one Play listing, each targeting a specific device configuration (ABI, screen density, API level), so users download only what fits their device.</li></ul><p><strong>⚙️ How it worked</strong></p><ul><li>Each APK shared the same <code>applicationId</code> but had a distinct <code>versionCode</code>; Play Store served the matching APK automatically at install time based on device characteristics.</li><li>Configured via <code>splits {}</code> in Gradle (by <code>density</code>, by <code>abi</code>), generating one APK per split dimension value.</li></ul><p><strong>⚖️ Why it's mostly superseded</strong></p><ul><li><strong>Android App Bundles (AAB)</strong> replaced this pattern for most apps — Play's dynamic delivery generates and serves optimized, per-device APKs automatically from a single uploaded bundle, without the developer manually managing split configurations or juggling multiple <code>versionCode</code>s.</li><li>Multiple APKs still occasionally shows up for distribution outside Play (sideloading, alternative stores) where AAB's dynamic delivery isn't available.</li></ul><p><strong>🎯 Interview tip:</strong> If asked this today, the strongest answer explains the historical mechanism briefly, then pivots to \"this is largely replaced by App Bundles now\" — showing current best practice, not just legacy knowledge.</p>",
            referenceLinks: [{ title: "Multiple APK support (legacy)", url: "https://developer.android.com/google/play/publishing/multiple-apks" }, { title: "About Android App Bundles", url: "https://developer.android.com/guide/app-bundle" }],
            tags: ["multiple-apks", "app-bundle", "splits", "play-store"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "proguard-usage",
            importance: "must-know",
            question: "What is ProGuard used for?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>ProGuard</strong> is a code shrinking, optimization, and obfuscation tool for Java/Kotlin bytecode, traditionally used to prepare Android release builds.</li></ul><p><strong>⚙️ What it does</strong></p><ul><li><strong>Shrinking</strong> — removes classes, fields, methods, and attributes that static analysis determines are unreachable from the app's entry points, reducing APK size.</li><li><strong>Optimization</strong> — inlines/simplifies bytecode where safe (e.g. removing unused branches, merging classes) for a smaller, sometimes faster result.</li><li><strong>Obfuscation</strong> — renames classes/methods/fields to short, meaningless names (<code>a</code>, <code>b</code>, <code>c</code>), making reverse-engineering harder and further shrinking size (short names take less space in the dex).</li></ul><p><strong>⚖️ Current status</strong></p><ul><li>On Android specifically, <strong>R8</strong> has replaced ProGuard as the actual engine invoked by the Android Gradle Plugin — it consumes the same <code>proguard-rules.pro</code> rule syntax for compatibility but performs shrinking/obfuscation/optimization in a single pass integrated with dexing, rather than as a separate post-compile step.</li></ul><p><strong>🎯 Interview tip:</strong> Clarify that \"ProGuard\" in modern Android projects usually means \"the ProGuard rule file syntax, executed by R8\" — this distinction is exactly what the next question probes.</p>",
            referenceLinks: [{ title: "Shrink, obfuscate, and optimize your app", url: "https://developer.android.com/topic/performance/app-optimization/enable-app-optimization" }],
            tags: ["proguard", "shrinking", "obfuscation", "r8"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "proguard-rules-pro-file",
            importance: "should-know",
            question: "What is proguard-rules.pro file used for?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><code>proguard-rules.pro</code> is where you declare project-specific rules telling R8/ProGuard what to <strong>keep</strong>, how to handle warnings, and other shrinking/obfuscation behavior it can't safely infer automatically.</li></ul><p><strong>⚙️ Common rule types</strong></p><ul><li><strong><code>-keep class ... { *; }</code></strong> — prevents a class (and optionally its members) from being removed or renamed; essential for classes accessed via reflection (Gson models, Parcelable creators in some setups, JNI-called methods).</li><li><strong><code>-keepattributes</code></strong> — preserves metadata like <code>Signature</code> (needed for generics via reflection) or <code>*Annotation*</code> (needed for annotation-driven frameworks).</li><li><strong><code>-dontwarn</code></strong> — suppresses warnings about missing classes referenced by a library (common with libraries supporting multiple platforms where not every referenced class is on the Android classpath).</li><li><strong><code>-keepclassmembers</code></strong> — keeps specific members of a class without necessarily keeping the whole class from being renamed.</li></ul><p><strong>⚙️ Where it's wired in</strong></p><ul><li>Referenced from the module's <code>build.gradle.kts</code> via <code>proguardFiles(getDefaultProguardFile(\"proguard-android-optimize.txt\"), \"proguard-rules.pro\")</code>, combining Android's default rules with your project-specific additions.</li></ul><p><strong>🎯 Interview tip:</strong> Be ready to explain <em>why</em> a specific rule is needed (e.g. \"Gson needs the model's field names preserved because it maps JSON keys to fields by name via reflection\") rather than reciting rule syntax alone.</p>",
            referenceLinks: [{ title: "Shrink, obfuscate, and optimize your app", url: "https://developer.android.com/topic/performance/app-optimization/enable-app-optimization" }],
            tags: ["proguard", "r8", "keep-rules", "obfuscation"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [{ language: "xml", title: "Reading a rules file line by line", code: "&lt;!-- proguard-rules.pro (shown as illustrative snippet) --&gt;\n# Keep data classes used with Gson\n-keep class com.example.app.network.model.** { *; }\n-keepattributes Signature\n\n# Suppress warnings from a library referencing classes not on our classpath\n-dontwarn org.some.library.**\n\n# Keep members annotated for a DI framework\n-keepclassmembers class * {\n    @javax.inject.Inject <init>(...);\n}",
                output: {
                    kind: "trace",
                    lines: [
                        "-keep class ...model.** { *; } preserves the names of those classes and all their members.",
                        "That is needed because Gson maps JSON keys onto field names by reflection, and a renamed field no longer matches its key.",
                        "-keepattributes Signature preserves generic type metadata, without which Gson sees List rather than List<User> and cannot construct the right type.",
                        "-dontwarn silences warnings about classes a library references but the app never uses; it suppresses the warning without keeping anything.",
                        "-keepclassmembers with an @Inject constructor keeps only those constructors, in classes that may otherwise be renamed and shrunk.",
                        "Everything not matched by a rule stays eligible for removal and renaming.",
                        "The final configuration is the union of these rules and the consumer rules shipped inside each library AAR."
                    ],
                    explain: "<p>Step 6 is why <code>-keep</code> is worth being stingy with. Every rule is surface area R8 may not touch, so a broad <code>-keep class com.example.** { *; }</code> disables shrinking and obfuscation across the whole app and gives back most of the size saving.</p><p>Step 5 shows the more precise tool: <code>-keepclassmembers</code> keeps members of classes that survive, rather than forcing the classes to survive.</p><p>Step 7 is the practical relief — Retrofit, Room and Glide all ship their own consumer rules inside the AAR, so most libraries need nothing written by hand. The rules you write should be for <em>your</em> reflected code.</p>"
                } }],
            subsection: null
        },
        {
            id: "proguard-vs-r8",
            importance: "should-know",
            question: "What is the difference between ProGuard and R8?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Both shrink/obfuscate/optimize bytecode, but <strong>R8</strong> is Google's newer replacement, now the default (and only) code shrinker invoked by the Android Gradle Plugin.</li></ul><table><thead><tr><th></th><th>ProGuard</th><th>R8</th></tr></thead><tbody><tr><td>Maintainer</td><td>Guardsquare (third-party)</td><td>Google, built into AGP</td></tr><tr><td>Pipeline</td><td>Separate shrink/obfuscate step, then a separate dexing (<code>dx</code>) step</td><td>Combines shrinking, optimization, obfuscation, and dexing into a single pass</td></tr><tr><td>Speed</td><td>Slower — extra I/O and a second full pass for dexing</td><td>Faster — fewer passes over the bytecode overall</td></tr><tr><td>Rule syntax</td><td>Original <code>proguard-rules.pro</code> syntax</td><td>Compatible with the same rule syntax, so existing rule files carry over</td></tr><tr><td>Kotlin-specific optimizations</td><td>Limited, added later/less natively</td><td>Better native understanding of Kotlin-generated bytecode patterns</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> The crisp answer: \"R8 is a drop-in, faster replacement that folds shrinking and dexing into one pass — same rule file syntax, different (and now sole) engine.\"</p>",
            referenceLinks: [{ title: "Shrink, obfuscate, and optimize your app", url: "https://developer.android.com/topic/performance/app-optimization/enable-app-optimization" }],
            tags: ["proguard", "r8", "dexing", "comparison"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "obfuscation-minification",
            importance: "must-know",
            question: "What is obfuscation? What about minification?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Two related but distinct outcomes of running R8/ProGuard on a release build.</li></ul><table><thead><tr><th></th><th>Minification (shrinking)</th><th>Obfuscation</th></tr></thead><tbody><tr><td>What it does</td><td>Removes unused classes/methods/fields, and shortens/renames identifiers to reduce size</td><td>Renames classes/methods/fields to short, meaningless names to hinder reverse-engineering</td></tr><tr><td>Primary goal</td><td>Smaller APK/AAB</td><td>Harder to read decompiled code, protect implementation details</td></tr><tr><td>Gradle flag</td><td><code>isMinifyEnabled = true</code></td><td>Enabled as part of the same R8 pass when minify is on; can be tuned separately with rule flags</td></tr></tbody></table><p><strong>⚙️ Relationship</strong></p><ul><li>They typically run together as part of the same R8 invocation — enabling <code>isMinifyEnabled</code> triggers both dead-code removal <em>and</em> identifier renaming — but they solve different problems: one is about size, the other about protecting code from casual inspection.</li></ul><p><strong>⚠️ Pitfalls</strong></p><ul><li>Obfuscation is not real security — it slows down casual inspection but doesn't stop a determined reverse engineer; never rely on it to protect secrets (API keys, crypto keys) that should not ship in the client at all.</li></ul><p><strong>🎯 Interview tip:</strong> Explicitly stating \"obfuscation is not security\" is a mature point that shows you understand its actual purpose and limits.</p>",
            referenceLinks: [{ title: "Shrink, obfuscate, and optimize your app", url: "https://developer.android.com/topic/performance/app-optimization/enable-app-optimization" }],
            tags: ["obfuscation", "minification", "r8", "security"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "change-app-params-without-update",
            importance: "should-know",
            question: "How to change app parameters without an app update?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li>Several mechanisms let you change app behavior/config server-side without publishing a new APK/AAB to the Play Store.</li></ul><p><strong>⚙️ Options</strong></p><ul><li><strong>Firebase Remote Config</strong> — fetch key-value parameters (feature flags, thresholds, copy text, rollout percentages) at runtime; the most common tool for this exact purpose.</li><li><strong>A backend-driven config endpoint</strong> — a custom API your app polls/fetches on launch for server-controlled values, giving full control without depending on a third-party SDK.</li><li><strong>Server-Driven UI</strong> — for more than just values, the server can describe entire screen layouts/content that the client renders generically, letting UI changes ship without a client release at all.</li><li><strong>Feature flag services</strong> — dedicated platforms (LaunchDarkly, or Remote Config's own conditions) targeting specific user segments/percentages for gradual rollout and kill-switch capability.</li></ul><p><strong>⚠️ Constraints</strong></p><ul><li>This only covers <em>configuration/content</em> changes — actual code changes (new screens, new logic) still require a real app update and Play Store review, unless the app ships enough generic/interpreted capability (e.g. server-driven UI, a scripting layer) to express the change purely through config.</li></ul><p><strong>🎯 Interview tip:</strong> Distinguish clearly between \"changing values/flags\" (Remote Config, easy) and \"changing behavior/code\" (still needs a release) — conflating them is a common mistake in weaker answers.</p>",
            referenceLinks: [{ title: "Firebase Remote Config", url: "https://firebase.google.com/docs/remote-config" }],
            tags: ["remote-config", "feature-flags", "firebase", "server-driven-ui"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        },
        {
            id: "write-ahead-logging",
            importance: "good-to-know",
            question: "What is Write-Ahead Logging (WAL) and why is it used in databases?",
            answer: "<p><strong>🔑 Concept</strong></p><ul><li><strong>Write-Ahead Logging</strong> is a journaling mode where changes are first written to a separate WAL file before being applied to the main database file, improving concurrency and crash recovery versus the default rollback-journal mode.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>Writers append changes to the WAL file instead of modifying the main database file directly; readers can continue reading the (mostly) unmodified main database file concurrently with an in-progress write, instead of being blocked.</li><li>Periodically, a <strong>checkpoint</strong> operation replays the WAL file's contents into the main database file and truncates/resets the WAL.</li><li>On crash recovery, an incomplete WAL simply isn't checkpointed — the main database file remains in its last consistent state, and the WAL can be safely replayed or discarded.</li></ul><p><strong>⚖️ WAL vs default rollback journal</strong></p><ul><li><strong>Default mode</strong> — writes lock the whole database, blocking concurrent readers.</li><li><strong>WAL mode</strong> — readers and a single writer can operate concurrently, generally better throughput for read-heavy or read/write-mixed workloads.</li></ul><p><strong>⚙️ On Android</strong></p><ul><li>Room enables WAL mode by default on modern versions (configurable via <code>RoomDatabase.Builder.setJournalMode()</code>), so app code benefits from this concurrency without extra setup.</li></ul><p><strong>🎯 Interview tip:</strong> The concrete payoff to state: WAL lets reads proceed without blocking on a write in progress — that's the practical reason it matters for a responsive UI reading from Room while a background sync writes.</p>",
            referenceLinks: [{ title: "SQLite Write-Ahead Logging", url: "https://www.sqlite.org/wal.html" }, { title: "Room database configuration", url: "https://developer.android.com/reference/androidx/room/RoomDatabase.JournalMode" }],
            tags: ["wal", "sqlite", "room", "database", "concurrency"],
            hasDiagram: false,
            diagramType: null,
            diagramConfig: null,
            codeSnippets: [],
            subsection: null
        }
    ]
};
