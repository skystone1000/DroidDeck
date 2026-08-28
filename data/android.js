/* ==========================================================================
   Android — the largest topic in the deck, spanning 20 subsections from
   application components through to system internals.
   ========================================================================== */

const androidData = {
    "id": "android",
    "title": "Android",
    "subsections": [
        {
            "id": "base",
            "title": "Base",
            "keyTopics": [
                "App Lag",
                "Context",
                "Zygote",
                "Application Components",
                "Project Structure",
                "AndroidManifest.xml",
                "Application Class"
            ]
        },
        {
            "id": "activity-and-fragment",
            "title": "Activity and Fragment",
            "keyTopics": [
                "Activity Lifecycle",
                "Fragment Lifecycle",
                "Configuration Changes",
                "State Restoration",
                "Back Stack",
                "Intent Flags"
            ]
        },
        {
            "id": "views-and-viewgroups",
            "title": "Views and ViewGroups",
            "keyTopics": [
                "View Lifecycle",
                "Custom Views",
                "ConstraintLayout",
                "Measure/Layout/Draw",
                "ViewBinding"
            ]
        },
        {
            "id": "displaying-lists-of-content",
            "title": "Displaying Lists of Content",
            "keyTopics": [
                "RecyclerView",
                "DiffUtil",
                "ViewHolder Pattern",
                "ListAdapter",
                "ItemDecoration"
            ]
        },
        {
            "id": "dialogs-and-toasts",
            "title": "Dialogs and Toasts",
            "keyTopics": [
                "AlertDialog",
                "DialogFragment",
                "BottomSheetDialog",
                "Snackbar",
                "Toast"
            ]
        },
        {
            "id": "intents-and-broadcasting",
            "title": "Intents and Broadcasting",
            "keyTopics": [
                "Explicit vs Implicit Intents",
                "BroadcastReceiver",
                "LocalBroadcastManager",
                "PendingIntent",
                "Intent Filters"
            ]
        },
        {
            "id": "services",
            "title": "Services",
            "keyTopics": [
                "Foreground Service",
                "Background Service",
                "Bound Service",
                "IntentService",
                "JobIntentService"
            ]
        },
        {
            "id": "inter-process-communication",
            "title": "Inter-process Communication",
            "keyTopics": [
                "AIDL",
                "Messenger",
                "ContentProvider",
                "Binder"
            ]
        },
        {
            "id": "long-running-operations",
            "title": "Long-running Operations",
            "keyTopics": [
                "WorkManager",
                "AlarmManager",
                "JobScheduler",
                "Foreground Service"
            ]
        },
        {
            "id": "working-with-multimedia-content",
            "title": "Working With Multimedia Content",
            "keyTopics": [
                "CameraX",
                "MediaPlayer",
                "ExoPlayer",
                "Image Loading"
            ]
        },
        {
            "id": "data-saving",
            "title": "Data Saving",
            "keyTopics": [
                "SharedPreferences",
                "DataStore",
                "Room Database",
                "SQLite",
                "File Storage"
            ]
        },
        {
            "id": "look-and-feel",
            "title": "Look and Feel",
            "keyTopics": [
                "Material Design",
                "Themes and Styles",
                "Animations",
                "Dark Mode",
                "Custom Drawables"
            ]
        },
        {
            "id": "memory-optimizations",
            "title": "Memory Optimizations",
            "keyTopics": [
                "Memory Leaks",
                "WeakReference",
                "Bitmap Handling",
                "LeakCanary",
                "Profiling"
            ]
        },
        {
            "id": "battery-life-optimizations",
            "title": "Battery Life Optimizations",
            "keyTopics": [
                "Doze Mode",
                "App Standby",
                "Battery Historian",
                "WorkManager Constraints"
            ]
        },
        {
            "id": "supporting-different-screen-sizes",
            "title": "Supporting Different Screen Sizes",
            "keyTopics": [
                "Density Qualifiers",
                "Responsive Layouts",
                "Foldables",
                "Multi-Window"
            ]
        },
        {
            "id": "permissions",
            "title": "Permissions",
            "keyTopics": [
                "Runtime Permissions",
                "Permission Groups",
                "Special Permissions",
                "Best Practices"
            ]
        },
        {
            "id": "native-programming",
            "title": "Native Programming",
            "keyTopics": [
                "JNI",
                "NDK",
                "CMake",
                "Native Libraries"
            ]
        },
        {
            "id": "android-system-internal",
            "title": "Android System Internal",
            "keyTopics": [
                "Zygote",
                "ART/Dalvik",
                "System Server",
                "Binder IPC",
                "Linux Kernel"
            ]
        },
        {
            "id": "android-jetpack",
            "title": "Android Jetpack",
            "keyTopics": [
                "ViewModel",
                "LiveData",
                "Navigation",
                "Compose",
                "Hilt",
                "Paging"
            ]
        },
        {
            "id": "others",
            "title": "Others",
            "keyTopics": []
        }
    ],
    "keyTopics": [
        "Context types and usage",
        "Activity and Fragment lifecycle",
        "Launch modes and back stack",
        "Services (Foreground, Background, Bound)",
        "BroadcastReceiver and Intents",
        "ContentProvider and data sharing",
        "ViewModel and LiveData",
        "RecyclerView and DiffUtil",
        "WorkManager for background tasks",
        "Memory optimization and LeakCanary",
        "ANR prevention",
        "Handler/Looper/MessageQueue",
        "Parcelable vs Serializable"
    ],
    "questions": [
        {
            "id": "android-app-lag",
            "question": "Why does an Android App lag?",
            "answer": "<p><strong>🔑 Lag = missed frames</strong></p><ul><li>Android targets <strong>60fps</strong> (16.6ms/frame) or 90/120fps on modern devices; if the main (UI) thread can't finish measure/layout/draw within that budget, a frame is <strong>dropped/janky</strong>.</li><li><strong>Heavy work on the main thread</strong> — network calls, disk I/O, DB queries, large bitmap decoding, JSON parsing, or complex business logic blocks rendering.</li><li><strong>Overdraw and deep view hierarchies</strong> — nested layouts (especially nested <code>LinearLayout</code> with weights) force extra measure/layout passes.</li><li><strong>Excessive object allocation</strong> in <code>onDraw()</code> or hot loops triggers frequent <strong>garbage collection</strong> pauses (stop-the-world in older GCs, shorter pauses with ART's concurrent GC).</li><li><strong>Inefficient RecyclerView usage</strong> — not recycling views, expensive <code>onBindViewHolder()</code> work, or nested scrolling containers.</li><li><strong>Cold app/Zygote fork overhead</strong> and unnecessary work in <code>Application.onCreate()</code> delay startup, perceived as lag.</li></ul><p><strong>🎯 Interview tip:</strong> Tie the answer back to tools — Systrace/Perfetto, Layout Inspector, and StrictMode are how you'd actually diagnose this in practice.</p>",
            "referenceLinks": [
                {
                    "title": "Android Vitals - Render performance",
                    "url": "https://developer.android.com/topic/performance/vitals/render"
                }
            ],
            "tags": [
                "performance",
                "jank",
                "main-thread",
                "rendering",
                "gc"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "base"
        },
        {
            "id": "android-context",
            "question": "What is Context? How is it used?",
            "answer": "<p><strong>🔑 Context</strong> is the handle to the Android environment — it gives access to resources, app-level operations, and system services.</p><ul><li>It's an abstract class implemented by <code>Activity</code>, <code>Service</code>, and <code>Application</code>, letting components access <strong>resources</strong> (<code>getResources()</code>), <strong>assets</strong>, <strong>SharedPreferences</strong>, and <strong>system services</strong> (<code>getSystemService()</code>).</li><li><strong>Application Context</strong> — lives as long as the app process; use it for objects that must outlive an Activity (singletons, DB helpers, image loaders).</li><li><strong>Activity Context</strong> — tied to the Activity's lifecycle; required for UI operations like inflating themed views, showing dialogs, or starting activities with transition animations.</li><li>Used to <strong>start components</strong> — <code>startActivity()</code>, <code>startService()</code>, <code>sendBroadcast()</code>, <code>registerReceiver()</code>.</li><li><strong>⚠️ Pitfall:</strong> holding an Activity Context in a long-lived object (static field, singleton, background thread) causes a <strong>memory leak</strong> since it retains the whole view hierarchy.</li></ul><p><strong>🎯 Interview tip:</strong> \"Use Application Context for anything that outlives the UI; Activity Context only when UI/theme context is required.\"</p>",
            "referenceLinks": [
                {
                    "title": "Context overview",
                    "url": "https://developer.android.com/reference/android/content/Context"
                }
            ],
            "tags": [
                "context",
                "application",
                "activity",
                "memory-leak",
                "system-services"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Application vs Activity context",
                    "code": "class MyApp : Application() {\n    companion object {\n        // Safe: Application context outlives every Activity\n        lateinit var appContext: Context\n            private set\n    }\n\n    override fun onCreate() {\n        super.onCreate()\n        appContext = applicationContext\n    }\n}\n\nclass MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        // Fine: dialog needs the themed Activity context\n        AlertDialog.Builder(this).setTitle(\"Hi\").show()\n    }\n}"
                }
            ],
            "subsection": "base"
        },
        {
            "id": "android-zygote",
            "question": "How does Zygote make Android apps start faster?",
            "answer": "<p><strong>🔑 Zygote</strong> is a pre-warmed system process that every app process is <strong>forked</strong> from, avoiding a cold VM boot per app.</p><ul><li>At boot, <code>init</code> starts <strong>Zygote</strong>, which loads the <strong>core Java/Kotlin framework classes</strong>, common resources, and initializes the ART runtime once.</li><li>When a new app launches, <strong>ActivityManagerService</strong> asks Zygote to <code>fork()</code> itself — the child process inherits an already-warmed heap and preloaded classes via <strong>copy-on-write</strong> memory pages.</li><li>This avoids re-parsing/re-loading the same framework classes and resources for every app, cutting startup time dramatically compared to spawning a fresh process from scratch.</li><li><strong>Zygote64/Zygote32</strong> exist for 64-bit and 32-bit ABI support; <strong>Zygote's app forks memory-share</strong> unmodified pages with the parent, only diverging (copy-on-write) when they write to memory.</li><li>Related: <strong>App Startup</strong> tracing distinguishes cold, warm, and hot starts — Zygote fork only affects cold start of the process itself, not warm/hot resumes of an already-running process.</li></ul>",
            "referenceLinks": [
                {
                    "title": "App startup time",
                    "url": "https://developer.android.com/topic/performance/vitals/launch-time"
                }
            ],
            "tags": [
                "zygote",
                "process",
                "startup",
                "art",
                "fork"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "base"
        },
        {
            "id": "android-application-components",
            "question": "What are all the Android application components?",
            "answer": "<p><strong>🔑 Four core components</strong> declared in <code>AndroidManifest.xml</code>, each a distinct entry point the system can instantiate.</p><ul><li><strong>Activity</strong> — a single, focused screen with a UI that the user interacts with.</li><li><strong>Service</strong> — a component that runs in the background (no UI) to perform long-running operations or work for other processes.</li><li><strong>BroadcastReceiver</strong> — responds to system-wide or app broadcast announcements (e.g. <code>ACTION_BOOT_COMPLETED</code>, battery low, custom app events).</li><li><strong>ContentProvider</strong> — manages a shared set of app data, exposing it to other apps through a standard content URI/CRUD interface.</li><li>Each component is activated differently: Activities/Services via <strong>Intent</strong>, BroadcastReceivers via <strong>Intent broadcasts</strong>, ContentProviders via a <strong>ContentResolver</strong> query.</li></ul><p><strong>🎯 Interview tip:</strong> Mention that all four must be declared in the manifest (or annotated for the newer manifest-merging tools) so the OS knows they exist before the app process is even running.</p>",
            "referenceLinks": [
                {
                    "title": "Application Fundamentals",
                    "url": "https://developer.android.com/guide/components/fundamentals"
                }
            ],
            "tags": [
                "components",
                "activity",
                "service",
                "broadcastreceiver",
                "contentprovider"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "base"
        },
        {
            "id": "android-project-structure",
            "question": "What is the project structure of an Android Application?",
            "answer": "<p><strong>🔑 A Gradle multi-module project</strong> with a conventional source-set layout under each module.</p><ul><li><strong>manifests/</strong> — <code>AndroidManifest.xml</code>, declaring components, permissions, and app metadata.</li><li><strong>java/kotlin/</strong> — source code, organized in package folders; separate <code>androidTest</code> (instrumented, runs on device) and <code>test</code> (local JVM unit tests) source sets.</li><li><strong>res/</strong> — resources: <code>layout/</code>, <code>drawable/</code>, <code>values/</code> (strings, colors, styles, dimens), <code>mipmap/</code> (launcher icons), qualifiers like <code>values-night/</code> or <code>layout-sw600dp/</code> for configuration-specific resources.</li><li><strong>assets/</strong> — raw files bundled as-is (fonts, ML models, JSON) accessed via <code>AssetManager</code>, not resource-IDed.</li><li><strong>build.gradle(.kts)</strong> (module + project level) — dependencies, build variants, signing configs; <strong>gradle.properties</strong> and <strong>settings.gradle</strong> at the project root wire modules together.</li></ul>",
            "referenceLinks": [
                {
                    "title": "App resources overview",
                    "url": "https://developer.android.com/guide/topics/resources/providing-resources"
                }
            ],
            "tags": [
                "project-structure",
                "gradle",
                "resources",
                "manifest",
                "modules"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "base"
        },
        {
            "id": "android-manifest",
            "question": "What is AndroidManifest.xml?",
            "answer": "<p><strong>🔑 The manifest</strong> is the app's declarative contract with the Android system — it must exist at the root of every module.</p><ul><li>Declares all <strong>application components</strong> (<code>&lt;activity&gt;</code>, <code>&lt;service&gt;</code>, <code>&lt;receiver&gt;</code>, <code>&lt;provider&gt;</code>) so the OS can find and launch them.</li><li>Declares <strong>permissions</strong> the app requires (<code>&lt;uses-permission&gt;</code>) and permissions it defines for other apps to request.</li><li>Specifies <strong>hardware/software feature requirements</strong> (<code>&lt;uses-feature&gt;</code>, e.g. camera) that affect Play Store filtering.</li><li>Sets the <strong>minSdkVersion/targetSdkVersion</strong> (usually via Gradle, merged in), app <code>theme</code>, <code>icon</code>, and the <strong>launcher activity</strong> via an intent-filter with <code>MAIN</code>/<code>LAUNCHER</code>.</li><li>Multiple manifests (per module/build variant) are combined by the <strong>Manifest Merger</strong> tool at build time into one final manifest.</li></ul>",
            "referenceLinks": [
                {
                    "title": "App manifest overview",
                    "url": "https://developer.android.com/guide/topics/manifest/manifest-intro"
                }
            ],
            "tags": [
                "manifest",
                "permissions",
                "components",
                "intent-filter"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "xml",
                    "title": "Minimal manifest with a launcher Activity",
                    "code": "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">\n\n    <uses-permission android:name=\"android.permission.INTERNET\" />\n\n    <application\n        android:name=\".MyApp\"\n        android:icon=\"@mipmap/ic_launcher\"\n        android:theme=\"@style/Theme.App\">\n\n        <activity\n            android:name=\".MainActivity\"\n            android:exported=\"true\">\n            <intent-filter>\n                <action android:name=\"android.intent.action.MAIN\" />\n                <category android:name=\"android.intent.category.LAUNCHER\" />\n            </intent-filter>\n        </activity>\n    </application>\n</manifest>"
                }
            ],
            "subsection": "base"
        },
        {
            "id": "android-application-class",
            "question": "What is the Application class in Android?",
            "answer": "<p><strong>🔑 Application</strong> is the base class for maintaining <strong>global application state</strong> — instantiated once, before any other component, and lives for the whole process lifetime.</p><ul><li>Subclass it and register it via <code>android:name</code> in the manifest to run app-wide init logic in <code>onCreate()</code> — e.g. initializing DI graphs (Hilt/Dagger), crash reporting, logging, WorkManager configuration.</li><li>Provides <code>onCreate()</code>, <code>onTerminate()</code> (rarely called on real devices, mainly emulator), <code>onLowMemory()</code>, and <code>onTrimMemory(level)</code> callbacks for global memory pressure handling.</li><li>It <strong>is</strong> a <code>Context</code> (Application Context) — safe to store long-lived references to it since it doesn't leak a UI hierarchy.</li><li><strong>⚠️ Pitfall:</strong> avoid heavy synchronous work in <code>Application.onCreate()</code> — it runs before your first Activity and directly delays app startup/cold-start time.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Application class reference",
                    "url": "https://developer.android.com/reference/android/app/Application"
                }
            ],
            "tags": [
                "application",
                "oncreate",
                "global-state",
                "startup"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Custom Application class",
                    "code": "class MyApp : Application() {\n    override fun onCreate() {\n        super.onCreate()\n        // Keep this fast — it runs before anything else\n        Timber.plant(Timber.DebugTree())\n        WorkManager.initialize(this, workManagerConfiguration)\n    }\n\n    override fun onTrimMemory(level: Int) {\n        super.onTrimMemory(level)\n        if (level >= TRIM_MEMORY_RUNNING_LOW) {\n            imageCache.evictAll()\n        }\n    }\n}"
                }
            ],
            "subsection": "base"
        },
        {
            "id": "android-fragment-default-constructor",
            "question": "Why is it recommended to use only the default constructor to create a Fragment?",
            "answer": "<p><strong>🔑 The system re-creates Fragments</strong> for you (config changes, process death) by calling the <strong>no-arg constructor</strong> via reflection, then restoring saved state.</p><ul><li>If you add a custom constructor with parameters and the Fragment is later destroyed/recreated by the system, it calls the <strong>default constructor</strong> again — any data passed through your custom constructor is <strong>lost</strong>.</li><li>Correct pattern: keep a no-arg constructor and pass data through <strong>arguments</strong> via <code>Fragment.setArguments(Bundle)</code>/<code>arguments</code> property — the <code>Bundle</code> survives recreation because the system persists it automatically.</li><li>Convention: expose a <strong>companion factory function</strong> (<code>newInstance()</code>) that builds the Fragment and sets its arguments, keeping call sites clean while still respecting the no-arg constructor requirement.</li><li>Violating this can throw <code>InstantiationException</code> or silently drop data during rotation.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Fragment overview",
                    "url": "https://developer.android.com/guide/fragments/create"
                }
            ],
            "tags": [
                "fragment",
                "constructor",
                "arguments",
                "bundle",
                "recreation"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Factory pattern with arguments, not a custom constructor",
                    "code": "class UserFragment : Fragment(R.layout.fragment_user) {\n\n    private val userId: Int get() = requireArguments().getInt(ARG_USER_ID)\n\n    companion object {\n        private const val ARG_USER_ID = \"arg_user_id\"\n\n        fun newInstance(userId: Int) = UserFragment().apply {\n            arguments = bundleOf(ARG_USER_ID to userId)\n        }\n    }\n}"
                }
            ],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-activity-lifecycle",
            "question": "What is Activity and its lifecycle?",
            "answer": "<p><strong>🔑 Activity</strong> represents a single screen; the system moves it through a well-defined set of states as the user navigates and the OS reclaims resources.</p><ul><li><code>onCreate()</code> — one-time setup: inflate layout, restore saved state (<code>Bundle</code>), initialize ViewModels.</li><li><code>onStart()</code> — Activity becomes <strong>visible</strong> but not yet interactive.</li><li><code>onResume()</code> — Activity is in the <strong>foreground</strong> and interactive; this is where camera/sensor listeners typically register.</li><li><code>onPause()</code> — partially obscured (e.g. dialog on top, split-screen); commit unsaved data quickly here, this must be fast.</li><li><code>onStop()</code> — fully hidden; release heavier resources, unregister broadcast receivers.</li><li><code>onDestroy()</code> — final cleanup before the Activity object is discarded (user finishes it, or the system reclaims memory).</li><li><code>onRestart()</code> — called instead of <code>onCreate()</code> when returning to a stopped-but-not-destroyed Activity, right before <code>onStart()</code>.</li></ul><p><strong>🎯 Interview tip:</strong> Emphasize that <code>onPause()</code>→<code>onResume()</code> is the guaranteed pair for any interruption, while <code>onStop()</code>/<code>onDestroy()</code> may be skipped entirely if the system kills the process abruptly under memory pressure.</p>",
            "referenceLinks": [
                {
                    "title": "Activity lifecycle",
                    "url": "https://developer.android.com/guide/components/activities/activity-lifecycle"
                }
            ],
            "tags": [
                "activity",
                "lifecycle",
                "oncreate",
                "onresume",
                "onpause",
                "ondestroy"
            ],
            "hasDiagram": true,
            "diagramType": "animation",
            "diagramConfig": {
                "title": "Activity lifecycle",
                "steps": [
                    "onCreate()",
                    "onStart()",
                    "onResume()",
                    "Running (foreground)",
                    "onPause()",
                    "onStop()",
                    "onRestart() → onStart()",
                    "onDestroy()"
                ]
            },
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-oncreate-vs-onstart",
            "question": "What is the difference between onCreate() and onStart()?",
            "answer": "<table><thead><tr><th>onCreate()</th><th>onStart()</th></tr></thead><tbody><tr><td>Called <strong>once</strong> when the Activity is first created</td><td>Called <strong>every time</strong> the Activity becomes visible, including after <code>onRestart()</code></td></tr><tr><td>Where you inflate the layout, restore saved instance state, set up ViewModels/observers</td><td>Where you'd start work that's only needed while the Activity is visible (e.g. registering a UI-facing listener)</td></tr><tr><td>Activity is <strong>not visible</strong> yet</td><td>Activity becomes <strong>visible</strong> but not yet interactive (that's <code>onResume()</code>)</td></tr><tr><td>Followed by <code>onStart()</code></td><td>Followed by <code>onResume()</code></td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> A rotation destroys and fully recreates the Activity (new <code>onCreate()</code>), while pressing Home then reopening the app from Recents only re-triggers <code>onRestart()</code> → <code>onStart()</code> on the existing instance.</p>",
            "referenceLinks": [
                {
                    "title": "Activity lifecycle",
                    "url": "https://developer.android.com/guide/components/activities/activity-lifecycle"
                }
            ],
            "tags": [
                "activity",
                "lifecycle",
                "oncreate",
                "onstart"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-ondestroy-without-onpause-onstop",
            "question": "When is only onDestroy() called for an activity without onPause() and onStop()?",
            "answer": "<p><strong>🔑 Direct-to-onDestroy()</strong> happens when you call <code>finish()</code> from inside <code>onCreate()</code> before the Activity ever becomes visible.</p><ul><li>If <code>finish()</code> is invoked during <code>onCreate()</code> (e.g. a guard clause redirecting to a login screen), the Activity never reaches <code>onStart()</code>/<code>onResume()</code>, so the system skips straight to <code>onDestroy()</code> without calling <code>onPause()</code> or <code>onStop()</code> since it was never paused or stopped.</li><li>This is documented behavior, not a bug — the lifecycle callbacks that represent \"was visible\"/\"was in foreground\" states simply don't apply to an Activity that was destroyed before reaching those states.</li><li>Contrast with the normal teardown path: <code>onPause()</code> → <code>onStop()</code> → <code>onDestroy()</code>, which happens once the Activity has actually been visible/foregrounded at some point.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Activity lifecycle",
                    "url": "https://developer.android.com/guide/components/activities/activity-lifecycle"
                }
            ],
            "tags": [
                "activity",
                "lifecycle",
                "ondestroy",
                "finish"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "finish() during onCreate skips onPause/onStop",
                    "code": "class GateActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        if (!authRepository.isLoggedIn()) {\n            startActivity(Intent(this, LoginActivity::class.java))\n            finish() // never started/resumed -> only onDestroy() fires\n            return\n        }\n        setContentView(R.layout.activity_gate)\n    }\n}"
                }
            ],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-setcontentview-in-oncreate",
            "question": "Why do we need to call setContentView() in onCreate() of Activity class?",
            "answer": "<p><strong>🔑 setContentView() attaches and inflates the layout</strong> into the Activity's window, and <code>onCreate()</code> is the earliest lifecycle point where the window is available and one-time setup happens.</p><ul><li><code>onCreate()</code> runs exactly once per Activity instance, making it the right place for <strong>one-time initialization</strong> like layout inflation, view binding setup, and restoring instance state — doing it in <code>onStart()</code>/<code>onResume()</code> would re-run it unnecessarily on every visibility change.</li><li>Until <code>setContentView()</code> (or <code>ComponentActivity</code>'s Compose <code>setContent</code>) is called, <code>findViewById()</code> calls will fail because there's no view hierarchy attached yet.</li><li>It must happen <strong>before</strong> the Activity becomes visible (<code>onStart()</code>) so the framework has a view tree to measure/layout/draw when the window is first shown.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Activity#setContentView",
                    "url": "https://developer.android.com/reference/android/app/Activity#setContentView(int)"
                }
            ],
            "tags": [
                "activity",
                "setcontentview",
                "oncreate",
                "layout"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-save-restore-instance-state",
            "question": "What is onSaveInstanceState() and onRestoreInstanceState() in activity?",
            "answer": "<p><strong>🔑 Transient UI state survival</strong> — these callbacks persist small amounts of UI state across configuration changes or system-initiated process death, not a general data store.</p><ul><li><code>onSaveInstanceState(Bundle)</code> is called <strong>before</strong> <code>onStop()</code> (and after <code>onPause()</code>) when the Activity might be destroyed and recreated — e.g. rotation, or the system killing a backgrounded process to reclaim memory.</li><li>You write primitives/<code>Parcelable</code>s into the <code>Bundle</code>; the framework restores it via <code>onCreate(Bundle?)</code>'s parameter or the dedicated <code>onRestoreInstanceState(Bundle)</code>, called after <code>onStart()</code>.</li><li><strong>Not called</strong> when the user explicitly finishes the Activity (back press, <code>finish()</code>) — it's only for scenarios where recreation is possible, not deliberate destruction.</li><li>Modern practice: use <code>SavedStateHandle</code> in a <code>ViewModel</code> for this, since it integrates automatically with the same Bundle mechanism but keeps state colocated with your UI logic; <code>ViewModel</code> itself survives rotation but not process death, so <code>SavedStateHandle</code> covers that gap.</li></ul><p><strong>🎯 Interview tip:</strong> Bundle size is limited (binder transaction ~1MB) — only store small UI state (scroll position, selected tab, form input), never large objects or lists.</p>",
            "referenceLinks": [
                {
                    "title": "Save UI states",
                    "url": "https://developer.android.com/topic/libraries/architecture/saving-states"
                }
            ],
            "tags": [
                "onsaveinstancestate",
                "bundle",
                "state-restoration",
                "configuration-change",
                "savedstatehandle"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Saving and restoring simple UI state",
                    "code": "class SearchActivity : AppCompatActivity() {\n    private var queryText: String = \"\"\n\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_search)\n        queryText = savedInstanceState?.getString(\"query\") ?: \"\"\n    }\n\n    override fun onSaveInstanceState(outState: Bundle) {\n        super.onSaveInstanceState(outState)\n        outState.putString(\"query\", searchEditText.text.toString())\n    }\n}"
                }
            ],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-fragment-lifecycle",
            "question": "What is Fragment and its lifecycle?",
            "answer": "<p><strong>🔑 Fragment</strong> is a reusable, modular UI portion hosted inside an Activity (or another Fragment), with its own lifecycle layered on top of its host's.</p><ul><li><code>onAttach()</code> — Fragment is associated with its host Context.</li><li><code>onCreate()</code> — Fragment-level init (not view-related), retained instance state restored here.</li><li><code>onCreateView()</code> — inflate and <strong>return</strong> the Fragment's view hierarchy (or <code>null</code> for a view-less Fragment).</li><li><code>onViewCreated()</code> — view hierarchy exists; safe to bind views, set up RecyclerView adapters, observe LiveData/Flow tied to the view lifecycle.</li><li><code>onStart()</code> / <code>onResume()</code> — mirror the Activity's, Fragment becomes visible/interactive.</li><li><code>onPause()</code> / <code>onStop()</code> — mirror the Activity's teardown.</li><li><code>onDestroyView()</code> — the view hierarchy is destroyed (Fragment object itself may still be retained in the back stack) — <strong>must null out view bindings here</strong> to avoid leaking views.</li><li><code>onDestroy()</code> / <code>onDetach()</code> — Fragment instance itself is being discarded and detached from its host.</li></ul><p><strong>🎯 Interview tip:</strong> The classic gotcha is that a Fragment's view can be destroyed and recreated (<code>onDestroyView</code>/<code>onCreateView</code>) while the Fragment instance itself survives (e.g. on back-stack), so use <code>viewLifecycleOwner</code>, not the Fragment's own lifecycle, for LiveData observers tied to views.</p>",
            "referenceLinks": [
                {
                    "title": "Fragment lifecycle",
                    "url": "https://developer.android.com/guide/fragments/lifecycle"
                }
            ],
            "tags": [
                "fragment",
                "lifecycle",
                "oncreateview",
                "ondestroyview",
                "viewlifecycleowner"
            ],
            "hasDiagram": true,
            "diagramType": "animation",
            "diagramConfig": {
                "title": "Fragment lifecycle",
                "steps": [
                    "onAttach()",
                    "onCreate()",
                    "onCreateView()",
                    "onViewCreated()",
                    "onStart()",
                    "onResume()",
                    "onPause()",
                    "onStop()",
                    "onDestroyView()",
                    "onDestroy()",
                    "onDetach()"
                ]
            },
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-bundle",
            "question": "What is Bundle in Android?",
            "answer": "<p><strong>🔑 Bundle</strong> is a key-value container used to pass data between components and to persist small amounts of state.</p><ul><li>Implements <code>Parcelable</code> for efficient <strong>inter-process/IPC</strong>-safe serialization — it's how data crosses process boundaries via Binder (e.g. Activity-to-Activity via Intent extras).</li><li>Stores primitives, <code>String</code>, arrays, and objects implementing <code>Parcelable</code> or <code>Serializable</code>; keys are Strings.</li><li>Used in multiple places: <code>Intent.putExtras()</code>, <code>Fragment.setArguments()</code>, <code>onSaveInstanceState(Bundle)</code>/<code>onCreate(Bundle?)</code> for state restoration.</li><li>Backed by a <code>Parcel</code> under the hood, which is optimized for <strong>same-process</strong> and cross-process marshaling — not intended for large data (there's a binder transaction size limit, ~1MB shared across the whole process).</li><li><strong>PersistableBundle</strong> is a restricted variant used with <code>JobScheduler</code>/<code>JobService</code> that only supports primitive types, since it may be persisted to disk.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Bundle reference",
                    "url": "https://developer.android.com/reference/android/os/Bundle"
                }
            ],
            "tags": [
                "bundle",
                "parcelable",
                "intent",
                "state"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-launch-modes",
            "question": "What are the launch modes in Android?",
            "answer": "<p><strong>🔑 Launch modes</strong> (<code>android:launchMode</code> in the manifest, or Intent flags at runtime) control how a new Activity instance relates to the existing back stack.</p><ul><li><strong>standard</strong> (default) — a new instance is always created and pushed on top of the stack, even if one already exists.</li><li><strong>singleTop</strong> — if an instance is already at the <strong>top</strong> of the stack, its existing instance receives the Intent via <code>onNewIntent()</code> instead of creating a new one; otherwise behaves like <code>standard</code>.</li><li><strong>singleTask</strong> — a new task is created if none exists; if an instance already exists <strong>anywhere</strong> in that task, everything above it is popped and the Intent is delivered via <code>onNewIntent()</code> to that existing instance (used for entry-point screens like a home/dashboard).</li><li><strong>singleInstance</strong> — like <code>singleTask</code> but the Activity is the <strong>only</strong> one in its task; any other Activity launched from it starts in a different task.</li><li>Runtime equivalents via Intent flags: <code>FLAG_ACTIVITY_SINGLE_TOP</code>, <code>FLAG_ACTIVITY_CLEAR_TOP</code>, <code>FLAG_ACTIVITY_NEW_TASK</code> — useful when you don't control the manifest declaration (e.g. deep links).</li></ul><p><strong>🎯 Interview tip:</strong> Also mention <strong>task affinity</strong> and <code>documentLaunchMode</code>/<code>singleInstancePerTask</code> (API 30+) if the interviewer digs deeper into multi-window/multi-instance scenarios.</p>",
            "referenceLinks": [
                {
                    "title": "Tasks and the back stack",
                    "url": "https://developer.android.com/guide/components/activities/tasks-and-back-stack"
                }
            ],
            "tags": [
                "launch-mode",
                "task-affinity",
                "back-stack",
                "intent-flags",
                "singletask"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "xml",
                    "title": "Declaring launch mode in the manifest",
                    "code": "<activity\n    android:name=\".HomeActivity\"\n    android:launchMode=\"singleTask\"\n    android:exported=\"true\" />"
                }
            ],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-activity-vs-fragment",
            "question": "What is the difference between a Fragment and an Activity?",
            "answer": "<table><thead><tr><th>Activity</th><th>Fragment</th></tr></thead><tbody><tr><td>An independent application component, declared in the manifest</td><td>Must be hosted inside an Activity (or a parent Fragment) via a <code>FragmentManager</code></td></tr><tr><td>Has its own task/back-stack entry (window)</td><td>Managed on the <strong>Fragment back stack</strong>, which is a layer within a single Activity</td></tr><tr><td>Entry point reachable via Intent from other apps/components</td><td>Not independently launchable by other apps</td></tr><tr><td>Heavier lifecycle tied directly to the OS/task</td><td>Lifecycle layered on top of, and driven by, its host Activity's lifecycle</td></tr><tr><td>Good for a whole distinct screen/entry point</td><td>Good for modular, reusable UI pieces (e.g. master-detail, ViewPager pages, adaptive layouts)</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> Modern single-Activity architectures use one Activity hosting many Fragments (or Compose destinations) navigated by the Navigation component, reserving separate Activities mainly for distinct entry points or process/feature isolation.</p>",
            "referenceLinks": [
                {
                    "title": "Fragments",
                    "url": "https://developer.android.com/guide/fragments"
                }
            ],
            "tags": [
                "activity",
                "fragment",
                "comparison",
                "back-stack"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-when-fragment-over-activity",
            "question": "When should you use a Fragment rather than an Activity?",
            "answer": "<p><strong>🔑 Choose Fragments</strong> whenever you need modular, reusable, or adaptive UI within a single screen flow.</p><ul><li><strong>Single-Activity architecture</strong> — Fragments as destinations under the Jetpack Navigation component gives you shared transitions, a single place for app-wide UI (bottom nav, toolbar), and simpler deep-link handling.</li><li><strong>Master-detail / adaptive layouts</strong> — showing a list and detail pane side-by-side on tablets but as separate screens on phones, using the same Fragment classes.</li><li><strong>Reusable UI components</strong> across multiple screens — e.g. a Fragment embedded in several Activities.</li><li><strong>ViewPager pages / tabs</strong> — each page is naturally a Fragment.</li><li>Prefer a <strong>new Activity</strong> instead when you need a truly independent entry point (deep-linkable from other apps), a separate process, or a fundamentally different task/back-stack behavior.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Fragments",
                    "url": "https://developer.android.com/guide/fragments"
                }
            ],
            "tags": [
                "fragment",
                "activity",
                "single-activity",
                "navigation"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-fragmentpageradapter-vs-fragmentstatepageradapter",
            "question": "What is the difference between FragmentPagerAdapter vs FragmentStatePagerAdapter?",
            "answer": "<table><thead><tr><th>FragmentPagerAdapter</th><th>FragmentStatePagerAdapter</th></tr></thead><tbody><tr><td>Keeps <strong>every</strong> created Fragment's view hierarchy in memory, only <code>detach()</code>ing (not destroying) off-screen pages</td><td>Fully <strong>destroys</strong> a Fragment's view and instance state when it goes off-screen, saving only its <code>saveState()</code> Bundle</td></tr><tr><td>Good for a <strong>small, fixed</strong> number of pages (e.g. a few tabs)</td><td>Good for a <strong>larger or dynamic</strong> number of pages since memory usage stays bounded</td></tr><tr><td>Higher memory footprint as page count grows</td><td>Lower memory footprint; slightly more re-creation overhead when returning to a page</td></tr></tbody></table><ul><li>Both are effectively <strong>deprecated</strong> in favor of <code>FragmentStateAdapter</code> used with <code>ViewPager2</code>, which always behaves like the state-saving variant and integrates with <code>RecyclerView</code>'s recycling.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ViewPager2",
                    "url": "https://developer.android.com/develop/ui/views/animations/screen-slide-2"
                }
            ],
            "tags": [
                "viewpager",
                "fragmentpageradapter",
                "fragmentstatepageradapter",
                "viewpager2"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-add-vs-replace-fragment",
            "question": "What is the difference between adding/replacing fragment in backstack?",
            "answer": "<table><thead><tr><th>add()</th><th>replace()</th></tr></thead><tbody><tr><td>Adds the new Fragment <strong>on top</strong> of existing Fragments in the container; previous ones stay in their lifecycle (visible/overlapping unless manually hidden)</td><td><strong>Removes</strong> all existing Fragments in that container, then adds the new one — effectively <code>remove()</code> + <code>add()</code></td></tr><tr><td>Previous Fragments' views remain, so state/scroll position is naturally preserved</td><td>Previous Fragments' views are destroyed (<code>onDestroyView</code>); only survives via the fragment back-stack save mechanism when <code>addToBackStack()</code> is used</td></tr><tr><td>Useful for stacking overlays (e.g. a panel on top of content)</td><td>Useful for a straightforward one-screen-replaces-another navigation flow</td></tr></tbody></table><ul><li>Both can be combined with <code>addToBackStack(name)</code> so the back button reverses the transaction; without it, the transaction isn't reversible via back press.</li></ul>",
            "referenceLinks": [
                {
                    "title": "FragmentTransaction",
                    "url": "https://developer.android.com/reference/androidx/fragment/app/FragmentTransaction"
                }
            ],
            "tags": [
                "fragment",
                "fragmenttransaction",
                "backstack",
                "add",
                "replace"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "replace() with a back-stack entry",
                    "code": "supportFragmentManager.commit {\n    setReorderingAllowed(true)\n    replace(R.id.fragment_container, DetailFragment.newInstance(itemId))\n    addToBackStack(\"detail\")\n}"
                }
            ],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-fragment-communication",
            "question": "How would you communicate between two Fragments?",
            "answer": "<p><strong>🔑 Never let Fragments talk to each other directly</strong> — route through a shared owner to avoid tight coupling and lifecycle mismatches.</p><ul><li><strong>Shared ViewModel</strong> (scoped to the hosting Activity via <code>by activityViewModels()</code>) — the recommended modern approach; both Fragments observe the same <code>StateFlow</code>/<code>LiveData</code>, decoupled from each other entirely.</li><li><strong>Fragment Result API</strong> (<code>setFragmentResultListener</code> / <code>setFragmentResult</code>) — a lightweight, lifecycle-aware pub/sub for one-off results (e.g. a picker Fragment returning a selection), replacing the old <code>targetFragment</code> pattern.</li><li><strong>Interface callback implemented by the host Activity</strong> — classic pattern: Fragment defines a listener interface, casts <code>context</code> to it in <code>onAttach()</code>, Activity implements it and forwards to the other Fragment.</li><li>Avoid direct references between sibling Fragments — they can be destroyed/recreated independently, causing crashes or stale references.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Communicate with fragments",
                    "url": "https://developer.android.com/guide/fragments/communicate"
                }
            ],
            "tags": [
                "fragment",
                "communication",
                "viewmodel",
                "fragment-result-api"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Sharing state via an Activity-scoped ViewModel",
                    "code": "class SharedViewModel : ViewModel() {\n    private val _selectedItem = MutableStateFlow<Item?>(null)\n    val selectedItem: StateFlow<Item?> = _selectedItem\n\n    fun select(item: Item) { _selectedItem.value = item }\n}\n\nclass ListFragment : Fragment() {\n    private val sharedVm: SharedViewModel by activityViewModels()\n    fun onItemClicked(item: Item) = sharedVm.select(item)\n}\n\nclass DetailFragment : Fragment() {\n    private val sharedVm: SharedViewModel by activityViewModels()\n    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n        viewLifecycleOwner.lifecycleScope.launch {\n            sharedVm.selectedItem.collect { render(it) }\n        }\n    }\n}"
                }
            ],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-retained-fragment",
            "question": "What is a retained Fragment?",
            "answer": "<p><strong>🔑 A retained Fragment</strong> survives Activity re-creation (e.g. rotation) with <code>setRetainInstance(true)</code>, keeping its Fragment instance (and any in-memory fields) alive while its host Activity is destroyed and recreated.</p><ul><li>Was historically used to hold onto expensive in-memory objects (loaders, running async tasks) across configuration changes without re-fetching them.</li><li>Only the Fragment <strong>instance</strong> is retained — its <strong>view</strong> is still destroyed/recreated with each configuration change, since views hold Activity-specific resources like the theme.</li><li><strong>Deprecated</strong> (API 28+) in favor of <code>ViewModel</code>, which does the same job (survives configuration changes, discarded on real destruction) in a purpose-built, lifecycle-aware component with proper scoping — no need for a headless Fragment hack anymore.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ViewModel overview",
                    "url": "https://developer.android.com/topic/libraries/architecture/viewmodel"
                }
            ],
            "tags": [
                "fragment",
                "retained-fragment",
                "viewmodel",
                "configuration-change"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-addtobackstack",
            "question": "What is the purpose of addToBackStack() while committing fragment transaction?",
            "answer": "<p><strong>🔑 addToBackStack(name)</strong> makes a Fragment transaction reversible by the system back button (or <code>onBackPressedDispatcher</code>).</p><ul><li>Without it, a transaction (e.g. <code>replace()</code>) is <strong>final</strong> — pressing back exits the host Activity instead of undoing the Fragment swap.</li><li>With it, the <code>FragmentManager</code> pushes the transaction onto its own back stack; pressing back <strong>pops</strong> the transaction, restoring the previous Fragment's view state.</li><li>The optional <code>name</code> parameter lets you later pop back to a specific point with <code>popBackStack(name, flags)</code>, e.g. <code>POP_BACK_STACK_INCLUSIVE</code> to also remove that entry.</li><li>Fragment back-stack entries are independent of the Activity task back stack — they only affect navigation within that <code>FragmentManager</code>'s container.</li></ul>",
            "referenceLinks": [
                {
                    "title": "FragmentTransaction#addToBackStack",
                    "url": "https://developer.android.com/reference/androidx/fragment/app/FragmentTransaction#addToBackStack(java.lang.String)"
                }
            ],
            "tags": [
                "fragment",
                "backstack",
                "fragmenttransaction",
                "navigation"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "activity-and-fragment"
        },
        {
            "id": "android-optimizing-layouts",
            "question": "How to optimize layouts in Android?",
            "answer": "<p><strong>🔑 Flatten the hierarchy and avoid redundant measure/layout passes</strong> — the view tree's depth and complexity directly drive layout cost.</p><ul><li>Prefer <strong>ConstraintLayout</strong> over nested <code>LinearLayout</code>s with weights — it resolves complex positioning in a single flat layer instead of multiple nested measure passes.</li><li>Use <code>&lt;merge&gt;</code> tags to eliminate redundant root ViewGroups when including layouts, and <code>&lt;ViewStub&gt;</code> to lazily inflate rarely-shown views (e.g. error states).</li><li>Run the <strong>Layout Inspector</strong> and enable <strong>GPU overdraw debugging</strong> (Developer Options) to find and remove unnecessary overlapping backgrounds.</li><li>Avoid deeply nested <code>RelativeLayout</code>s and weighted <code>LinearLayout</code>s, both of which require multiple passes to resolve.</li><li>Use <code>include</code> for reusable chunks, and prefer <code>ViewBinding</code>/lazily-inflated views over always inflating everything up front.</li><li>For lists, ensure fixed item sizes where possible (<code>setHasFixedSize(true)</code>) so RecyclerView can skip a full re-layout pass on data changes.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Optimize your layout hierarchy",
                    "url": "https://developer.android.com/develop/ui/views/layout/optimize-layout"
                }
            ],
            "tags": [
                "layout",
                "performance",
                "constraintlayout",
                "overdraw",
                "viewstub"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-view",
            "question": "What is View in Android?",
            "answer": "<p><strong>🔑 View</strong> is the base class for all UI widgets — the fundamental building block for anything drawn on screen and capable of handling user interaction.</p><ul><li>Occupies a rectangular area, is responsible for <strong>drawing itself</strong> (<code>onDraw(Canvas)</code>) and <strong>handling events</strong> (<code>onTouchEvent()</code>, click listeners).</li><li>Goes through the <strong>measure → layout → draw</strong> pipeline every time it needs to update its size, position, or appearance.</li><li>Concrete widgets (<code>TextView</code>, <code>Button</code>, <code>ImageView</code>) extend <code>View</code> directly; container widgets extend <code>ViewGroup</code>, itself a subclass of <code>View</code>, to hold and arrange children.</li><li>Has state (<code>id</code>, visibility, padding, background, layout params) and participates in the accessibility, focus, and input systems.</li></ul>",
            "referenceLinks": [
                {
                    "title": "View reference",
                    "url": "https://developer.android.com/reference/android/view/View"
                }
            ],
            "tags": [
                "view",
                "ui",
                "widget",
                "measure-layout-draw"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-gone-vs-invisible",
            "question": "What is the difference between View.GONE and View.INVISIBLE?",
            "answer": "<table><thead><tr><th>View.INVISIBLE</th><th>View.GONE</th></tr></thead><tbody><tr><td>View is hidden but still <strong>occupies its layout space</strong></td><td>View is hidden and <strong>removed from the layout</strong> entirely — takes up no space</td></tr><tr><td>Still participates in <strong>measure</strong> and <strong>layout</strong> passes</td><td>Skipped during measure/layout, saving a small amount of work</td></tr><tr><td>Good when hiding/showing shouldn't shift surrounding views</td><td>Good when the view should collapse and let siblings reflow</td></tr></tbody></table><ul><li>Both differ from <code>View.VISIBLE</code> (default state, drawn and occupies space) — visibility is set via <code>view.visibility = View.GONE</code> or the XML attribute <code>android:visibility</code>.</li></ul>",
            "referenceLinks": [
                {
                    "title": "View#setVisibility",
                    "url": "https://developer.android.com/reference/android/view/View#setVisibility(int)"
                }
            ],
            "tags": [
                "view",
                "visibility",
                "gone",
                "invisible"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-custom-view",
            "question": "Can you create a custom view? How?",
            "answer": "<p><strong>🔑 Yes</strong> — subclass <code>View</code> (or an existing widget) and override the measurement/drawing hooks to control exactly how it sizes and renders itself.</p><ul><li>Override <code>onMeasure(widthMeasureSpec, heightMeasureSpec)</code> to determine the view's size, respecting the <code>MeasureSpec</code> mode (<code>EXACTLY</code>, <code>AT_MOST</code>, <code>UNSPECIFIED</code>) passed down by the parent, then call <code>setMeasuredDimension()</code>.</li><li>Override <code>onDraw(Canvas)</code> to render content using <code>Paint</code>/<code>Canvas</code> APIs; keep object allocation <strong>out</strong> of <code>onDraw()</code> since it can run on every frame.</li><li>Override <code>onSizeChanged()</code> for size-dependent setup, and <code>onTouchEvent()</code> for custom gesture handling.</li><li>Expose custom XML attributes via a <code>&lt;declare-styleable&gt;</code> in <code>attrs.xml</code>, read them in a constructor via <code>context.obtainStyledAttributes()</code>.</li><li>Implement <code>onSaveInstanceState()</code>/<code>onRestoreInstanceState()</code> (returning a custom <code>Parcelable</code>) if the view holds UI state that should survive rotation.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Create a custom view",
                    "url": "https://developer.android.com/develop/ui/views/layout/custom-views/create-view"
                }
            ],
            "tags": [
                "custom-view",
                "onmeasure",
                "ondraw",
                "canvas",
                "attrs"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Minimal custom View",
                    "code": "class BadgeView @JvmOverloads constructor(\n    context: Context,\n    attrs: AttributeSet? = null\n) : View(context, attrs) {\n\n    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.RED }\n    var count: Int = 0\n        set(value) { field = value; invalidate() }\n\n    override fun onMeasure(widthSpec: Int, heightSpec: Int) {\n        val size = (24 * resources.displayMetrics.density).toInt()\n        setMeasuredDimension(size, size)\n    }\n\n    override fun onDraw(canvas: Canvas) {\n        super.onDraw(canvas)\n        canvas.drawCircle(width / 2f, height / 2f, width / 2f, paint)\n    }\n}"
                }
            ],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-viewgroups-vs-views",
            "question": "What are ViewGroups and how are they different from Views?",
            "answer": "<table><thead><tr><th>View</th><th>ViewGroup</th></tr></thead><tbody><tr><td>A single drawable/interactive UI element (leaf node)</td><td>A <strong>container</strong> that holds and arranges child Views (and other ViewGroups) — an invisible/structural node</td></tr><tr><td>Draws its own content via <code>onDraw()</code></td><td>Additionally implements <code>onLayout()</code> to position its children, and often overrides <code>onMeasure()</code> to size itself based on children</td></tr><tr><td>Examples: <code>TextView</code>, <code>ImageView</code>, <code>Button</code></td><td>Examples: <code>LinearLayout</code>, <code>ConstraintLayout</code>, <code>FrameLayout</code>, <code>RecyclerView</code></td></tr></tbody></table><ul><li><code>ViewGroup</code> <strong>extends</strong> <code>View</code>, so every ViewGroup is itself a View that can be nested inside another ViewGroup — this is what forms the tree-shaped view hierarchy rendered per frame.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ViewGroup reference",
                    "url": "https://developer.android.com/reference/android/view/ViewGroup"
                }
            ],
            "tags": [
                "viewgroup",
                "view",
                "layout",
                "hierarchy"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-canvas",
            "question": "What is a Canvas in Android?",
            "answer": "<p><strong>🔑 Canvas</strong> is the drawing surface abstraction — it exposes drawing primitives that write into a <code>Bitmap</code> (or directly to a hardware layer/Surface).</p><ul><li>Provides methods like <code>drawRect()</code>, <code>drawCircle()</code>, <code>drawText()</code>, <code>drawBitmap()</code>, <code>drawPath()</code>, each paired with a <code>Paint</code> object controlling color, stroke, anti-aliasing, and shaders.</li><li>Every <code>View.onDraw(Canvas canvas)</code> receives a Canvas already bound to that view's drawing destination — you don't create it yourself in normal view drawing.</li><li>Supports transformation state via <code>save()</code>/<code>restore()</code> (a matrix stack) to apply temporary <code>translate()</code>, <code>rotate()</code>, <code>scale()</code>, or <code>clipRect()</code> without affecting subsequent draw calls.</li><li>Used directly for custom drawing (custom Views, <code>SurfaceView</code>) and indirectly under the hood by every standard widget.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Canvas and Drawables",
                    "url": "https://developer.android.com/develop/ui/views/graphics/drawables"
                }
            ],
            "tags": [
                "canvas",
                "paint",
                "drawing",
                "custom-view"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-surfaceview",
            "question": "What is a SurfaceView in Android?",
            "answer": "<p><strong>🔑 SurfaceView</strong> provides a dedicated drawing surface backed by its own <strong>separate thread/window</strong>, so drawing doesn't compete with the main UI thread's rendering.</p><ul><li>Unlike a regular View, its content can be updated from a <strong>background thread</strong> via the <code>SurfaceHolder</code>'s <code>lockCanvas()</code>/<code>unlockCanvasAndPost()</code>, ideal for high frame-rate or continuous rendering (camera preview, video playback, games).</li><li>Composited by the system as a <strong>separate layer</strong> in the window (a hole punched through the view hierarchy), avoiding the overhead of invalidating and redrawing the whole view tree per frame.</li><li>Lifecycle managed by <code>SurfaceHolder.Callback</code> — <code>surfaceCreated()</code>, <code>surfaceChanged()</code>, <code>surfaceDestroyed()</code>.</li><li><strong>Trade-off:</strong> since it's a separate window/layer, it can't be transformed/animated as flexibly as a normal View (e.g. no easy alpha blending or view animations) and z-ordering with other views is constrained. <code>TextureView</code> is the alternative when you need View-like compositing (rotation, alpha, animation) at the cost of running on the main thread's rendering pipeline.</li></ul>",
            "referenceLinks": [
                {
                    "title": "SurfaceView reference",
                    "url": "https://developer.android.com/reference/android/view/SurfaceView"
                }
            ],
            "tags": [
                "surfaceview",
                "rendering",
                "camera",
                "textureview"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-relative-vs-linear-layout",
            "question": "What is the difference between RelativeLayout and LinearLayout?",
            "answer": "<table><thead><tr><th>LinearLayout</th><th>RelativeLayout</th></tr></thead><tbody><tr><td>Arranges children in a single <strong>row or column</strong>, in order</td><td>Positions children <strong>relative to each other</strong> or to the parent (e.g. <code>layout_toRightOf</code>, <code>layout_centerInParent</code>)</td></tr><tr><td>Simple, predictable, single measure pass in most cases</td><td>Can require <strong>two measure passes</strong> internally to resolve interdependent constraints between siblings</td></tr><tr><td>Weighted children (<code>layout_weight</code>) let it act like a proportional grid, but nested weighted LinearLayouts get expensive</td><td>Can express complex layouts flatly without nesting, but is harder to reason about and edit than ConstraintLayout</td></tr></tbody></table><ul><li>In modern development, <strong>ConstraintLayout</strong> generally replaces both for anything beyond a trivial single-axis stack, since it flattens complex relative positioning into one layout pass without nesting.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Common layout objects",
                    "url": "https://developer.android.com/develop/ui/views/layout/declaring-layout"
                }
            ],
            "tags": [
                "linearlayout",
                "relativelayout",
                "layout",
                "comparison"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-constraintlayout-optimization",
            "question": "How does ConstraintLayout optimize performance?",
            "answer": "<p><strong>🔑 ConstraintLayout flattens the view hierarchy</strong> — complex, previously-nested layouts collapse into a single flat ViewGroup, resolved by a constraint solver.</p><ul><li>Avoids the <strong>nested measure passes</strong> that deeply nested <code>LinearLayout</code>/<code>RelativeLayout</code> trees require — fewer view groups means fewer <code>onMeasure()</code>/<code>onLayout()</code> invocations overall.</li><li>Uses the <strong>Cassowary constraint-solving algorithm</strong> to resolve all sibling relationships (positions, sizes, chains) in one coordinated pass rather than iteratively.</li><li><strong>Barriers, guidelines, and chains</strong> let you express layouts (that would otherwise need nested weighted LinearLayouts) flatly.</li><li><code>ConstraintSet</code> lets you animate/swap entire constraint configurations efficiently (via <code>TransitionManager</code>) without inflating a new layout.</li><li><strong>⚠️ Caveat:</strong> for very simple, shallow layouts, a plain <code>FrameLayout</code>/<code>LinearLayout</code> can actually measure faster since there's no solver overhead — ConstraintLayout's win shows up as complexity/nesting grows.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Build a Responsive UI with ConstraintLayout",
                    "url": "https://developer.android.com/develop/ui/views/layout/constraint-layout"
                }
            ],
            "tags": [
                "constraintlayout",
                "performance",
                "layout",
                "flattening"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-view-tree-optimization",
            "question": "What is the view tree? How can you optimize its depth?",
            "answer": "<p><strong>🔑 The view tree</strong> is the hierarchy of nested Views/ViewGroups rooted at the window's <code>DecorView</code> — its depth and breadth directly determine measure/layout/draw cost per frame.</p><ul><li>Every level of nesting adds a recursive <code>measure()</code>/<code>layout()</code> call; deep trees mean more traversal work, and weighted <code>LinearLayout</code>s at multiple levels can force <strong>double-measure passes</strong> at each level.</li><li><strong>Flatten with ConstraintLayout</strong> to express what used to require several nested containers in a single layer.</li><li>Use <code>&lt;merge&gt;</code> at the root of reusable/included layouts to avoid an extra redundant ViewGroup wrapper.</li><li>Use <code>&lt;ViewStub&gt;</code> for conditionally-shown UI so it isn't inflated (and doesn't add to the tree) until actually needed.</li><li>Inspect with <strong>Layout Inspector</strong> (Android Studio) to visualize the live hierarchy and depth, and use <strong>Hierarchy Viewer</strong>/Perfetto traces to spot expensive subtrees.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Optimize your layout hierarchy",
                    "url": "https://developer.android.com/develop/ui/views/layout/optimize-layout"
                }
            ],
            "tags": [
                "view-tree",
                "layout",
                "performance",
                "merge",
                "viewstub"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "xml",
                    "title": "Using merge to avoid an extra wrapper ViewGroup",
                    "code": "<!-- reusable_toolbar.xml, included into a layout that is already a FrameLayout -->\n<merge xmlns:android=\"http://schemas.android.com/apk/res/android\">\n    <ImageView android:id=\"@+id/icon\" android:layout_width=\"24dp\" android:layout_height=\"24dp\" />\n    <TextView android:id=\"@+id/title\" android:layout_width=\"wrap_content\" android:layout_height=\"wrap_content\" />\n</merge>"
                }
            ],
            "subsection": "views-and-viewgroups"
        },
        {
            "id": "android-listview-vs-recyclerview",
            "question": "What is the difference between ListView and RecyclerView?",
            "answer": "<table><thead><tr><th>ListView</th><th>RecyclerView</th></tr></thead><tbody><tr><td>View recycling is <strong>optional</strong> — the convert-view pattern in <code>getView()</code> is manual and easy to get wrong</td><td>View recycling is <strong>enforced</strong> by the framework via the <code>ViewHolder</code> pattern — you cannot bypass it</td></tr><tr><td>Only supports <strong>vertical list</strong> layout out of the box</td><td>Pluggable <strong>LayoutManager</strong> — linear, grid, staggered grid, or a custom layout</td></tr><tr><td>No built-in item animation support</td><td>Built-in <code>ItemAnimator</code> for add/remove/move animations</td></tr><tr><td>No native decoupled diffing tool</td><td><strong>DiffUtil</strong>/<code>ListAdapter</code> computes minimal update operations for efficient, animated updates</td></tr><tr><td>Decoration (dividers) via manual drawable tricks</td><td><code>ItemDecoration</code> for dividers, spacing, offsets</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> RecyclerView is essentially ListView's recycling pattern made mandatory and generalized with pluggable layout, animation, and decoration strategies.</p>",
            "referenceLinks": [
                {
                    "title": "Create dynamic lists with RecyclerView",
                    "url": "https://developer.android.com/develop/ui/views/layout/recyclerview"
                }
            ],
            "tags": [
                "recyclerview",
                "listview",
                "comparison",
                "viewholder"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-recyclerview-how-it-works",
            "question": "How does the RecyclerView work internally?",
            "answer": "<p><strong>🔑 RecyclerView</strong> separates <strong>layout</strong> (LayoutManager), <strong>recycling/pooling</strong> (Recycler), and <strong>data binding</strong> (Adapter) into distinct, pluggable pieces.</p><ul><li>As items scroll off-screen, their <code>ViewHolder</code>s aren't destroyed — they're pushed into the <strong>Recycler</strong>'s internal caches: a small <strong>scrap</strong> cache (attached, reusable without rebinding), a <strong>cached views</strong> pool, and the shared <strong>RecycledViewPool</strong> (keyed by view type).</li><li>When a new item needs a view, the LayoutManager asks the Recycler for one — it tries scrap first, then cache, then the pool (which requires a fresh <code>onBindViewHolder()</code> call), and only <strong>inflates a new view</strong> if none are available.</li><li>The <strong>Adapter</strong> exposes <code>getItemCount()</code>, <code>onCreateViewHolder()</code> (inflate + wrap in a ViewHolder, called relatively rarely), and <code>onBindViewHolder()</code> (bind data, called frequently as views recycle).</li><li>The <strong>LayoutManager</strong> decides positions/measurement (<code>LinearLayoutManager</code>, <code>GridLayoutManager</code>, <code>StaggeredGridLayoutManager</code>) and drives which items are attached/detached as the viewport moves.</li><li><strong>ItemAnimator</strong> intercepts add/remove/move operations to animate transitions instead of an abrupt redraw.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RecyclerView reference",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView"
                }
            ],
            "tags": [
                "recyclerview",
                "viewholder",
                "recycledviewpool",
                "layoutmanager"
            ],
            "hasDiagram": true,
            "diagramType": "flowchart",
            "diagramConfig": {
                "title": "RecyclerView view recycling",
                "columns": 3,
                "nodes": [
                    {
                        "label": "Item scrolls off-screen",
                        "type": "terminal"
                    },
                    {
                        "label": "ViewHolder → Recycler cache",
                        "type": "decision"
                    },
                    {
                        "label": "Need new item view?",
                        "type": "decision"
                    },
                    {
                        "label": "Reuse from scrap/cache",
                        "type": "terminal"
                    },
                    {
                        "label": "Reuse from RecycledViewPool",
                        "type": "terminal"
                    },
                    {
                        "label": "onBindViewHolder() rebinds data"
                    },
                    {
                        "label": "Inflate new view (pool empty)"
                    }
                ],
                "connections": [
                    {
                        "from": 0,
                        "to": 1
                    },
                    {
                        "from": 1,
                        "to": 2
                    },
                    {
                        "from": 2,
                        "to": 3,
                        "label": "cache hit"
                    },
                    {
                        "from": 2,
                        "to": 4,
                        "label": "pool hit"
                    },
                    {
                        "from": 2,
                        "to": 6,
                        "label": "miss"
                    },
                    {
                        "from": 4,
                        "to": 5
                    },
                    {
                        "from": 3,
                        "to": 5
                    },
                    {
                        "from": 6,
                        "to": 5
                    }
                ]
            },
            "codeSnippets": [],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-recyclerview-optimization",
            "question": "How to optimize RecyclerView scrolling performance?",
            "answer": "<p><strong>🔑 Keep onBindViewHolder() cheap and stable</strong> — scrolling jank almost always traces back to expensive work done per-frame during binding or layout.</p><ul><li>Call <code>setHasFixedSize(true)</code> when the RecyclerView's own size doesn't change with adapter content, skipping a full re-layout on every data change.</li><li>Use <strong>DiffUtil</strong>/<code>ListAdapter</code> instead of <code>notifyDataSetChanged()</code> so only changed items are rebound/animated, not the entire list.</li><li>Avoid heavy work in <code>onBindViewHolder()</code> — no image decoding, DB queries, or object allocation there; offload to a background thread/coroutine and bind the result.</li><li>Share a <strong>RecycledViewPool</strong> across nested/sibling RecyclerViews with the same view types to reduce inflation churn.</li><li>Use image-loading libraries (Coil/Glide) with proper caching and avoid resizing bitmaps on the main thread.</li><li>Reduce <strong>overdraw</strong> — remove unnecessary background drawables on item views, flatten item layouts with ConstraintLayout.</li><li>Enable stable IDs (<code>setHasStableIds(true)</code> + <code>getItemId()</code>) so animations and diffing can track items correctly across moves.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Create dynamic lists with RecyclerView",
                    "url": "https://developer.android.com/develop/ui/views/layout/recyclerview"
                }
            ],
            "tags": [
                "recyclerview",
                "performance",
                "diffutil",
                "recycledviewpool"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Sharing a RecycledViewPool between nested RecyclerViews",
                    "code": "val sharedPool = RecyclerView.RecycledViewPool()\n\nouterAdapter.onBindInnerRecyclerView = { innerRv ->\n    innerRv.setRecycledViewPool(sharedPool)\n    innerRv.setHasFixedSize(true)\n}"
                }
            ],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-nested-recyclerview-optimization",
            "question": "How to optimize nested RecyclerView?",
            "answer": "<p><strong>🔑 Share resources across the nested RecyclerViews</strong> — the main cost of nesting is that each inner list would otherwise maintain its own separate view pool.</p><ul><li>Share a single <strong>RecycledViewPool</strong> across all inner RecyclerViews (e.g. horizontal carousels inside a vertical outer list) so scrolled-off inner item views are reused across different rows instead of re-inflated each time.</li><li>Call <code>setHasFixedSize(true)</code> on inner RecyclerViews when their size is stable.</li><li>Set <code>setItemViewCacheSize()</code> higher on the outer RecyclerView to reduce how often inner RecyclerViews are recreated as the outer list scrolls.</li><li>Use <code>RecyclerView.Adapter.setHasStableIds(true)</code> so inner state (e.g. scroll position) can be correctly retained per row.</li><li>Nest sparingly — consider whether a flat single RecyclerView (with multiple view types, or a <code>ConcatAdapter</code>) can replace deep nesting.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RecycledViewPool reference",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView.RecycledViewPool"
                }
            ],
            "tags": [
                "recyclerview",
                "nested",
                "recycledviewpool",
                "performance"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-recyclerview-performance-over-listview",
            "question": "How does RecyclerView improve performance over ListView?",
            "answer": "<p><strong>🔑 Mandatory recycling + pluggable, purpose-built pieces</strong> remove entire classes of common ListView performance bugs.</p><ul><li><strong>Enforced ViewHolder pattern</strong> — ListView's convert-view recycling was opt-in and easy to implement incorrectly (e.g. forgetting to reuse <code>convertView</code>), causing constant re-inflation; RecyclerView makes this structurally impossible to skip.</li><li><strong>Finer-grained invalidation</strong> — <code>DiffUtil</code>/<code>notifyItemChanged/Inserted/Removed</code> update only affected items instead of ListView's typical full <code>notifyDataSetChanged()</code> redraw.</li><li><strong>Item prefetching</strong> — <code>LinearLayoutManager</code> can prefetch views likely to be needed on the next frame during idle time (e.g. via <code>GapWorker</code>), smoothing out fling scrolling.</li><li><strong>Decoupled LayoutManager</strong> avoids duplicate layout logic ListView had to reimplement for grid-like behavior.</li><li><strong>Stable IDs + ItemAnimator</strong> enable efficient, correct move/add/remove animations without manual bookkeeping.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RecyclerView reference",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView"
                }
            ],
            "tags": [
                "recyclerview",
                "performance",
                "listview",
                "prefetch"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-recyclerview-components",
            "question": "What are the components of a RecyclerView?",
            "answer": "<p><strong>🔑 Five collaborating pieces</strong>, each with a single responsibility.</p><ul><li><strong>Adapter</strong> — supplies data-to-view binding logic (<code>onCreateViewHolder</code>, <code>onBindViewHolder</code>, <code>getItemCount</code>).</li><li><strong>ViewHolder</strong> — caches references to a single item's child views, avoiding repeated <code>findViewById()</code> calls.</li><li><strong>LayoutManager</strong> — positions items and decides scroll behavior (<code>LinearLayoutManager</code>, <code>GridLayoutManager</code>, <code>StaggeredGridLayoutManager</code>).</li><li><strong>ItemDecoration</strong> — draws dividers, spacing, or offsets around items without modifying the item layouts themselves.</li><li><strong>ItemAnimator</strong> — animates item add/remove/move/change events (<code>DefaultItemAnimator</code> out of the box).</li><li>Plus the internal <strong>Recycler</strong> — manages the scrap/cache/RecycledViewPool recycling machinery described earlier, mostly invisible to app code.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RecyclerView reference",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView"
                }
            ],
            "tags": [
                "recyclerview",
                "adapter",
                "viewholder",
                "layoutmanager",
                "itemdecoration"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-adapter-viewholder-role",
            "question": "Explain the role of RecyclerView.Adapter and RecyclerView.ViewHolder.",
            "answer": "<p><strong>🔑 Adapter = data source translator, ViewHolder = per-item view cache.</strong></p><ul><li><strong>RecyclerView.Adapter&lt;VH&gt;</strong> bridges your data set and the RecyclerView: <code>onCreateViewHolder()</code> inflates the item layout and wraps it in a ViewHolder (called only when a fresh view is genuinely needed), <code>onBindViewHolder()</code> populates that ViewHolder's views with data for a given position (called every time a view is (re)bound, including on recycle), and <code>getItemCount()</code> reports the data set size.</li><li><strong>RecyclerView.ViewHolder</strong> holds direct references to an item view's child Views, computed once at creation — this is what eliminates repeated <code>findViewById()</code> traversal on every bind, a major win over the old ListView pattern.</li><li>The Adapter also supports <code>getItemViewType(position)</code> for heterogeneous lists, and optional <code>onBindViewHolder(holder, position, payloads)</code> for partial/payload-based updates from DiffUtil.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RecyclerView.Adapter reference",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView.Adapter"
                }
            ],
            "tags": [
                "recyclerview",
                "adapter",
                "viewholder",
                "onbindviewholder"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Adapter + ViewHolder",
                    "code": "class UserAdapter(private val users: List<User>) :\n    RecyclerView.Adapter<UserAdapter.UserViewHolder>() {\n\n    class UserViewHolder(val binding: ItemUserBinding) :\n        RecyclerView.ViewHolder(binding.root)\n\n    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserViewHolder {\n        val binding = ItemUserBinding.inflate(\n            LayoutInflater.from(parent.context), parent, false\n        )\n        return UserViewHolder(binding)\n    }\n\n    override fun onBindViewHolder(holder: UserViewHolder, position: Int) {\n        val user = users[position]\n        holder.binding.name.text = user.name\n        holder.binding.avatar.load(user.avatarUrl)\n    }\n\n    override fun getItemCount() = users.size\n}"
                }
            ],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-layoutmanager",
            "question": "What is a LayoutManager in RecyclerView?",
            "answer": "<p><strong>🔑 LayoutManager</strong> is the strategy object that positions child views and controls scrolling behavior, fully decoupled from the Adapter's data logic.</p><ul><li><strong>LinearLayoutManager</strong> — arranges items in a single vertical or horizontal line; supports reverse layout.</li><li><strong>GridLayoutManager</strong> — arranges items in a fixed-span grid, supports variable span sizes per item via <code>SpanSizeLookup</code>.</li><li><strong>StaggeredGridLayoutManager</strong> — a Pinterest-style grid where item heights vary and items flow to fill gaps.</li><li>Responsible for measuring/positioning children, deciding which items are attached/detached as the viewport scrolls, and driving <strong>prefetching</strong> during fling for smoother scroll.</li><li>You can write a <strong>custom LayoutManager</strong> by extending <code>RecyclerView.LayoutManager</code> for specialized layouts (e.g. carousels, circular layouts) — this pluggability is one of RecyclerView's core advantages over ListView.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RecyclerView.LayoutManager reference",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView.LayoutManager"
                }
            ],
            "tags": [
                "recyclerview",
                "layoutmanager",
                "gridlayoutmanager",
                "staggeredgrid"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-multiple-view-types",
            "question": "How do you handle multiple view types in a single RecyclerView?",
            "answer": "<p><strong>🔑 Override getItemViewType()</strong> so the Adapter can inflate and bind different layouts for different items in the same list.</p><ul><li>Override <code>getItemViewType(position)</code> to return a distinct <code>Int</code> constant per type (e.g. header vs item vs footer, or based on a sealed class discriminant in your data model).</li><li>In <code>onCreateViewHolder(parent, viewType)</code>, branch on <code>viewType</code> to inflate the correct layout and return the matching <code>ViewHolder</code> subclass.</li><li>In <code>onBindViewHolder()</code>, cast the holder/data appropriately per type (often modeled with a <strong>sealed class</strong> of UI models for exhaustive <code>when</code> handling).</li><li>For grids, pair with <code>GridLayoutManager.SpanSizeLookup</code> so e.g. a header can span the full width while items take one column each.</li><li>Alternative: compose multiple single-type Adapters together with <strong>ConcatAdapter</strong>, which avoids type-branching entirely by giving each section its own Adapter.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ConcatAdapter",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/ConcatAdapter"
                }
            ],
            "tags": [
                "recyclerview",
                "multiple-view-types",
                "getitemviewtype",
                "concatadapter"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Multiple view types with a sealed model",
                    "code": "sealed class FeedItem {\n    data class Header(val title: String) : FeedItem()\n    data class Post(val body: String) : FeedItem()\n}\n\nclass FeedAdapter(private val items: List<FeedItem>) :\n    RecyclerView.Adapter<RecyclerView.ViewHolder>() {\n\n    override fun getItemViewType(position: Int) = when (items[position]) {\n        is FeedItem.Header -> TYPE_HEADER\n        is FeedItem.Post -> TYPE_POST\n    }\n\n    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =\n        when (viewType) {\n            TYPE_HEADER -> HeaderViewHolder.create(parent)\n            else -> PostViewHolder.create(parent)\n        }\n\n    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {\n        when (val item = items[position]) {\n            is FeedItem.Header -> (holder as HeaderViewHolder).bind(item)\n            is FeedItem.Post -> (holder as PostViewHolder).bind(item)\n        }\n    }\n\n    override fun getItemCount() = items.size\n\n    companion object { const val TYPE_HEADER = 0; const val TYPE_POST = 1 }\n}"
                }
            ],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-diffutil",
            "question": "What is DiffUtil and how does it improve RecyclerView performance?",
            "answer": "<p><strong>🔑 DiffUtil</strong> computes the minimal set of add/remove/move operations between an old and new list, replacing a blanket <code>notifyDataSetChanged()</code>.</p><ul><li>Uses an algorithm based on <strong>Eugene Myers' diff algorithm</strong> (O(N+D²) — N is list size, D is number of edits) to find the shortest edit script between two lists.</li><li>You implement <code>DiffUtil.Callback</code> (or the simpler <code>ItemCallback</code> with <code>ListAdapter</code>) with <code>areItemsTheSame()</code> (identity, e.g. same ID) and <code>areContentsTheSame()</code> (equality, e.g. same data snapshot).</li><li>Optional <code>getChangePayload()</code> lets you return a partial diff (e.g. \"only the like-count changed\") so <code>onBindViewHolder(holder, position, payloads)</code> can update just that field instead of a full rebind — avoiding flicker from a full item re-render.</li><li>Because it targets exact changed items, <strong>ItemAnimator</strong> can play precise, correct add/remove/move animations instead of a jarring full refresh.</li><li><strong>ListAdapter</strong> wraps this with an <code>AsyncListDiffer</code>, computing the diff on a background thread by default so large list updates don't jank the main thread.</li></ul>",
            "referenceLinks": [
                {
                    "title": "DiffUtil reference",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/DiffUtil"
                }
            ],
            "tags": [
                "diffutil",
                "recyclerview",
                "listadapter",
                "performance"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "ListAdapter with a DiffUtil.ItemCallback",
                    "code": "class UserDiffCallback : DiffUtil.ItemCallback<User>() {\n    override fun areItemsTheSame(old: User, new: User) = old.id == new.id\n    override fun areContentsTheSame(old: User, new: User) = old == new\n}\n\nclass UserAdapter : ListAdapter<User, UserAdapter.VH>(UserDiffCallback()) {\n    class VH(val binding: ItemUserBinding) : RecyclerView.ViewHolder(binding.root)\n\n    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =\n        VH(ItemUserBinding.inflate(LayoutInflater.from(parent.context), parent, false))\n\n    override fun onBindViewHolder(holder: VH, position: Int) {\n        holder.binding.name.text = getItem(position).name\n    }\n}\n\n// Elsewhere: adapter.submitList(newUsers) triggers the background diff + animated update"
                }
            ],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-sethasfixedsize",
            "question": "What is the purpose of RecyclerView.setHasFixedSize(true)?",
            "answer": "<p><strong>🔑 A layout-pass optimization hint</strong> — tells RecyclerView that its own size (width/height) won't change as a result of adapter content changes.</p><ul><li>When set, RecyclerView can <strong>skip re-measuring/re-laying-out itself</strong> in response to <code>notifyDataSetChanged()</code> or item insert/remove calls, since it already knows its bounds won't shift.</li><li>Only affects RecyclerView's <strong>own</strong> size — it does not stop individual item views from being measured/laid out as content changes.</li><li>Set it to <code>true</code> whenever the RecyclerView has fixed dimensions (e.g. <code>match_parent</code>/fixed dp, not <code>wrap_content</code> sized off its content) — a very common and safe case.</li><li><strong>⚠️ Pitfall:</strong> setting it <code>true</code> when the RecyclerView's size actually does depend on content (e.g. <code>wrap_content</code> inside a scrolling parent) can cause incorrect layout/clipping.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RecyclerView#setHasFixedSize",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView#setHasFixedSize(boolean)"
                }
            ],
            "tags": [
                "recyclerview",
                "sethasfixedsize",
                "performance",
                "layout"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-update-specific-item",
            "question": "How do you update a specific item in RecyclerView?",
            "answer": "<p><strong>🔑 Target the exact position/id</strong> rather than refreshing the whole list, so only that item rebinds and animates.</p><ul><li><code>adapter.notifyItemChanged(position)</code> — rebinds a single item at a known position; pass a <strong>payload</strong> object as a third argument for partial updates avoiding a full rebind.</li><li>With <strong>DiffUtil/ListAdapter</strong>: mutate your backing list (create a new list with the one item changed) and call <code>submitList(newList)</code> — DiffUtil detects exactly which item changed and updates/animates only that one.</li><li><code>notifyItemInserted(position)</code> / <code>notifyItemRemoved(position)</code> / <code>notifyItemMoved(from, to)</code> for structural single-item changes, each triggering the appropriate ItemAnimator animation.</li><li>Avoid <code>notifyDataSetChanged()</code> for single-item updates — it discards all animation info and rebinds every visible item, which is both wasteful and visually abrupt.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RecyclerView.Adapter#notifyItemChanged",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/RecyclerView.Adapter#notifyItemChanged(int)"
                }
            ],
            "tags": [
                "recyclerview",
                "notifyitemchanged",
                "diffutil",
                "listadapter"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Targeted single-item update with a payload",
                    "code": "fun toggleLike(position: Int) {\n    val updated = items[position].copy(liked = !items[position].liked)\n    items[position] = updated\n    adapter.notifyItemChanged(position, \"LIKE_PAYLOAD\")\n}\n\n// In the adapter:\noverride fun onBindViewHolder(holder: VH, position: Int, payloads: MutableList<Any>) {\n    if (payloads.isNotEmpty()) {\n        holder.updateLikeIconOnly(items[position].liked)\n    } else {\n        super.onBindViewHolder(holder, position, payloads)\n    }\n}"
                }
            ],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-snaphelper",
            "question": "What is SnapHelper in RecyclerView?",
            "answer": "<p><strong>🔑 SnapHelper</strong> makes a RecyclerView snap its items to a specific alignment after a scroll/fling gesture ends — the behavior behind carousel/gallery-style lists.</p><ul><li><strong>LinearSnapHelper</strong> — snaps the closest item to the <strong>center</strong> of the RecyclerView.</li><li><strong>PagerSnapHelper</strong> — snaps one full item per fling, like a <code>ViewPager</code>, showing exactly one page-like item at a time.</li><li>Attached via <code>snapHelper.attachToRecyclerView(recyclerView)</code>; it hooks into fling/scroll listeners to compute the target snap position and smoothly scroll to it.</li><li>You can subclass <code>SnapHelper</code> (overriding <code>calculateDistanceToFinalSnap()</code> and <code>findSnapView()</code>) for custom snap alignments, e.g. snap-to-start for a horizontal carousel.</li></ul>",
            "referenceLinks": [
                {
                    "title": "SnapHelper reference",
                    "url": "https://developer.android.com/reference/androidx/recyclerview/widget/SnapHelper"
                }
            ],
            "tags": [
                "recyclerview",
                "snaphelper",
                "carousel",
                "linearsnaphelper"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Carousel-style snapping list",
                    "code": "val snapHelper = LinearSnapHelper()\nsnapHelper.attachToRecyclerView(recyclerView)\nrecyclerView.layoutManager = LinearLayoutManager(context, RecyclerView.HORIZONTAL, false)"
                }
            ],
            "subsection": "displaying-lists-of-content"
        },
        {
            "id": "android-dialog",
            "question": "What is Dialog in Android?",
            "answer": "<p><strong>🔑 Dialog</strong> is a small floating window that overlays the current screen, typically requesting a decision or extra information before the user continues.</p><ul><li><strong>AlertDialog</strong> (the most common subclass) — built via <code>AlertDialog.Builder</code>, supports title, message, positive/negative/neutral buttons, custom views, list items.</li><li><strong>DatePickerDialog</strong>/<strong>TimePickerDialog</strong> — specialized system-provided dialogs.</li><li>A raw <code>Dialog</code> is <strong>not lifecycle-aware</strong> by itself — if shown from an Activity and the Activity is destroyed (e.g. rotation) while the dialog is up, you get a <code>WindowLeaked</code> exception unless dismissed first, which is exactly why <strong>DialogFragment</strong> is recommended over a bare Dialog.</li><li>Modal by default (blocks interaction with the underlying screen), though <code>setCanceledOnTouchOutside()</code>/<code>setCancelable()</code> can adjust dismiss behavior.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Dialogs overview",
                    "url": "https://developer.android.com/develop/ui/views/components/dialogs"
                }
            ],
            "tags": [
                "dialog",
                "alertdialog",
                "dialogfragment"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Basic AlertDialog",
                    "code": "AlertDialog.Builder(context)\n    .setTitle(\"Delete item\")\n    .setMessage(\"This action cannot be undone.\")\n    .setPositiveButton(\"Delete\") { _, _ -> viewModel.delete(itemId) }\n    .setNegativeButton(\"Cancel\", null)\n    .show()"
                }
            ],
            "subsection": "dialogs-and-toasts"
        },
        {
            "id": "android-toast",
            "question": "What is Toast in Android?",
            "answer": "<p><strong>🔑 Toast</strong> is a brief, non-modal, auto-dismissing message shown to the user, requiring no interaction and not stealing focus.</p><ul><li>Created via <code>Toast.makeText(context, text, duration)</code>, where <code>duration</code> is <code>LENGTH_SHORT</code> (~2s) or <code>LENGTH_LONG</code> (~3.5s) — you cannot set an arbitrary duration.</li><li>Rendered in a separate system window managed by <code>NotificationManagerService</code>'s toast queue (not tied to the Activity's view hierarchy) — it survives even if the Activity that created it finishes.</li><li>Cannot capture touch/click input — for anything interactive, use a <strong>Snackbar</strong> instead, which supports an action button and is anchored to a <code>CoordinatorLayout</code>/view.</li><li>Since Android 11, apps in the background face restrictions on showing custom Toast views for abuse-prevention reasons; text Toasts from background apps are still shown but rate-limited.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Toast reference",
                    "url": "https://developer.android.com/reference/android/widget/Toast"
                }
            ],
            "tags": [
                "toast",
                "snackbar",
                "notification"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Showing a Toast",
                    "code": "Toast.makeText(context, \"Saved successfully\", Toast.LENGTH_SHORT).show()"
                }
            ],
            "subsection": "dialogs-and-toasts"
        },
        {
            "id": "android-dialog-vs-dialogfragment",
            "question": "What is the difference between Dialog and DialogFragment?",
            "answer": "<table><thead><tr><th>Dialog</th><th>DialogFragment</th></tr></thead><tbody><tr><td>A plain window object with <strong>no lifecycle awareness</strong> of its host</td><td>A <code>Fragment</code> that manages a Dialog internally — fully <strong>lifecycle-aware</strong>, tied to the FragmentManager</td></tr><tr><td>Not automatically dismissed/recreated across configuration changes — can leak the window (<code>WindowLeaked</code>) if the host Activity is destroyed while it's showing</td><td>Automatically handles <strong>recreation on configuration change</strong> and dismissal on host destruction</td></tr><tr><td>Not part of the fragment back stack</td><td>Can be added to the <strong>back stack</strong> and survives rotation correctly</td></tr><tr><td>Simple, direct API for quick one-off dialogs</td><td>Preferred for anything non-trivial: retains dialog state, supports <code>show(FragmentManager, tag)</code> for safe re-display</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> Google's own guidance is to <strong>always use DialogFragment</strong> instead of showing a raw Dialog directly, precisely because of the lifecycle/leak issues.</p>",
            "referenceLinks": [
                {
                    "title": "DialogFragment reference",
                    "url": "https://developer.android.com/reference/androidx/fragment/app/DialogFragment"
                }
            ],
            "tags": [
                "dialog",
                "dialogfragment",
                "comparison",
                "lifecycle"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "DialogFragment wrapping an AlertDialog",
                    "code": "class ConfirmDeleteDialog : DialogFragment() {\n    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {\n        return AlertDialog.Builder(requireContext())\n            .setTitle(\"Delete item\")\n            .setPositiveButton(\"Delete\") { _, _ ->\n                setFragmentResult(\"delete_confirmed\", bundleOf())\n            }\n            .setNegativeButton(\"Cancel\", null)\n            .create()\n    }\n}\n\n// Usage: ConfirmDeleteDialog().show(supportFragmentManager, \"confirm_delete\")"
                }
            ],
            "subsection": "dialogs-and-toasts"
        },
        {
            "id": "android-intent",
            "question": "What is an Intent in Android?",
            "answer": "<p><strong>🔑 Intent</strong> is a messaging object used to request an action from another app component — the glue that lets loosely-coupled components communicate.</p><ul><li>Carries an <strong>action</strong> (e.g. <code>ACTION_VIEW</code>), <strong>data</strong> (a URI + MIME type), <strong>category</strong>, and optional <strong>extras</strong> (a Bundle of key-value data) plus <strong>flags</strong> controlling task/back-stack behavior.</li><li>Used to <strong>start Activities</strong> (<code>startActivity()</code>), <strong>start/bind Services</strong> (<code>startService()</code>, <code>bindService()</code>), and <strong>send broadcasts</strong> (<code>sendBroadcast()</code>).</li><li>Two flavors: <strong>explicit</strong> (names a target component class directly) and <strong>implicit</strong> (declares an action/data for the system to resolve against components advertising a matching intent-filter).</li><li>Can carry a <strong>result</strong> back to the caller via <code>ActivityResultContracts</code> (modern replacement for the deprecated <code>startActivityForResult()</code>/<code>onActivityResult()</code>).</li></ul>",
            "referenceLinks": [
                {
                    "title": "Intents and Intent Filters",
                    "url": "https://developer.android.com/guide/components/intents-filters"
                }
            ],
            "tags": [
                "intent",
                "explicit-intent",
                "implicit-intent",
                "extras"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "intents-and-broadcasting"
        },
        {
            "id": "android-implicit-intent",
            "question": "What is an Implicit Intent?",
            "answer": "<p><strong>🔑 Implicit Intent</strong> declares an action to perform without naming a specific target component, letting the system find a matching handler.</p><ul><li>You specify an <strong>action</strong> (e.g. <code>ACTION_SEND</code>, <code>ACTION_VIEW</code>), optionally a <strong>data URI/MIME type</strong> and <strong>category</strong>; the system matches this against every app's declared <code>&lt;intent-filter&gt;</code>.</li><li>If multiple apps can handle it, the user sees a <strong>chooser</strong> (or app disambiguation dialog); if exactly one matches and it's marked default, it launches directly.</li><li>Common uses: opening a URL in a browser, sharing content (<code>ACTION_SEND</code>), dialing a number, picking a photo from the gallery — reaching functionality your app doesn't implement itself.</li><li><strong>⚠️ Since Android 11 (API 30)</strong>, <strong>package visibility</strong> restrictions mean you must declare <code>&lt;queries&gt;</code> in the manifest to check/resolve intents for other apps, or <code>resolveActivity()</code>/<code>queryIntentActivities()</code> may return nothing even if a handler exists.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Common Intents",
                    "url": "https://developer.android.com/guide/components/intents-common"
                }
            ],
            "tags": [
                "intent",
                "implicit-intent",
                "intent-filter",
                "package-visibility"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Implicit intent to share text",
                    "code": "val shareIntent = Intent(Intent.ACTION_SEND).apply {\n    type = \"text/plain\"\n    putExtra(Intent.EXTRA_TEXT, \"Check this out!\")\n}\nstartActivity(Intent.createChooser(shareIntent, \"Share via\"))"
                }
            ],
            "subsection": "intents-and-broadcasting"
        },
        {
            "id": "android-explicit-intent",
            "question": "What is an Explicit Intent?",
            "answer": "<p><strong>🔑 Explicit Intent</strong> names the exact target component (by class or package/component name) — used for navigation within your own app.</p><ul><li>Constructed with a <code>Context</code> and the target <code>Class</code>, e.g. <code>Intent(this, DetailActivity::class.java)</code>, or via <code>ComponentName</code> for cross-package but still explicit targeting.</li><li>No resolution/chooser step — the system launches exactly that component; fails with <code>ActivityNotFoundException</code> if it doesn't exist or isn't exported when called from another app.</li><li>The standard way to start Activities/Services <strong>within the same app</strong>, since you know the concrete class you want.</li><li>Since Android 12 (API 31), a <strong>non-exported</strong> component can only be targeted by explicit intents from within the same app/UID, adding a security boundary for cross-app access.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Intents and Intent Filters",
                    "url": "https://developer.android.com/guide/components/intents-filters"
                }
            ],
            "tags": [
                "intent",
                "explicit-intent",
                "navigation",
                "componentname"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Explicit intent between Activities",
                    "code": "val intent = Intent(this, DetailActivity::class.java).apply {\n    putExtra(\"item_id\", itemId)\n}\nstartActivity(intent)"
                }
            ],
            "subsection": "intents-and-broadcasting"
        },
        {
            "id": "android-broadcast-receiver",
            "question": "What is a BroadcastReceiver?",
            "answer": "<p><strong>🔑 BroadcastReceiver</strong> is a component that listens for and responds to system-wide or app-specific broadcast announcements.</p><ul><li>Implement by extending <code>BroadcastReceiver</code> and overriding <code>onReceive(context, intent)</code>, which runs on the <strong>main thread</strong> and must return quickly (no blocking work — the system may kill the app if it takes too long, similar to an ANR).</li><li><strong>Static registration</strong> — declared in the manifest with <code>&lt;receiver&gt;</code> + <code>&lt;intent-filter&gt;</code>; heavily restricted since Android 8 (API 26) for implicit broadcasts to save battery — most implicit broadcasts no longer wake apps this way.</li><li><strong>Dynamic registration</strong> — via <code>Context.registerReceiver()</code>/<code>unregisterReceiver()</code> at runtime, tied to a component's lifecycle; required for many broadcasts post-API 26.</li><li>Common uses: reacting to <code>ACTION_BOOT_COMPLETED</code>, connectivity/battery changes, or custom app-internal events.</li><li>For work that takes longer than the receiver's short execution window, delegate to <code>WorkManager</code> or a foreground service rather than doing it inline.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Broadcasts overview",
                    "url": "https://developer.android.com/guide/components/broadcasts"
                }
            ],
            "tags": [
                "broadcastreceiver",
                "onreceive",
                "static-registration",
                "dynamic-registration"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Dynamically registered receiver",
                    "code": "val batteryReceiver = object : BroadcastReceiver() {\n    override fun onReceive(context: Context, intent: Intent) {\n        val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)\n        viewModel.onBatteryLevel(level)\n    }\n}\n\noverride fun onStart() {\n    super.onStart()\n    registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))\n}\n\noverride fun onStop() {\n    super.onStop()\n    unregisterReceiver(batteryReceiver)\n}"
                }
            ],
            "subsection": "intents-and-broadcasting"
        },
        {
            "id": "android-broadcasts-intents-messaging",
            "question": "How do broadcasts and intents work to pass messages around your app?",
            "answer": "<p><strong>🔑 Broadcasts are a publish/subscribe layer built on Intents</strong> — a sender fires an Intent, and any registered receiver whose filter matches gets it, without a direct reference between sender and receiver.</p><ul><li><code>sendBroadcast(intent)</code> dispatches the Intent to <strong>all</strong> matching registered receivers asynchronously; <code>sendOrderedBroadcast()</code> delivers it to receivers <strong>sequentially</strong> by priority, each able to abort or modify it for the next.</li><li>The system's <strong>global broadcast</strong> mechanism is process/app-boundary crossing, which is powerful but comes with security exposure (any app could send/intercept unless permissions/exported flags restrict it) and battery cost.</li><li>For <strong>intra-app</strong> messaging, prefer <code>LocalBroadcastManager</code> (now deprecated) or better, in-process solutions: a shared <code>ViewModel</code>, <code>SharedFlow</code>/<code>Channel</code>, or an event bus — these avoid the IPC overhead and security surface of a system-wide broadcast.</li><li>For app-to-app messaging where you specifically want cross-process delivery, broadcasts remain appropriate, ideally scoped with a custom permission or <code>setPackage()</code> to limit who can receive/send.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Broadcasts overview",
                    "url": "https://developer.android.com/guide/components/broadcasts"
                }
            ],
            "tags": [
                "broadcast",
                "intent",
                "localbroadcastmanager",
                "sharedflow"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "intents-and-broadcasting"
        },
        {
            "id": "android-pending-intent",
            "question": "What is a PendingIntent?",
            "answer": "<p><strong>🔑 PendingIntent</strong> wraps an Intent + the permission/identity to execute it later, on the app's behalf, from a different process (e.g. the system).</p><ul><li>Used wherever the <strong>system itself</strong> needs to fire an Intent later — notification taps, <code>AlarmManager</code> scheduled alarms, app widgets, <code>PendingIntent</code>s for actions inside a notification.</li><li>Created via <code>PendingIntent.getActivity()</code>, <code>getService()</code>, <code>getForegroundService()</code>, or <code>getBroadcast()</code>, each wrapping the respective start call.</li><li>Flags control identity/reuse: <code>FLAG_UPDATE_CURRENT</code> (reuse existing, update its extras), <code>FLAG_CANCEL_CURRENT</code>, <code>FLAG_ONE_SHOT</code>, <code>FLAG_IMMUTABLE</code>/<code>FLAG_MUTABLE</code>.</li><li><strong>Since Android 12 (API 31), specifying mutability is mandatory</strong> — you must pass either <code>FLAG_IMMUTABLE</code> or <code>FLAG_MUTABLE</code>; omitting it throws an <code>IllegalArgumentException</code>. Use <code>FLAG_IMMUTABLE</code> unless the receiving system component needs to fill in extras (e.g. some voice/notification reply use cases require mutable).</li></ul>",
            "referenceLinks": [
                {
                    "title": "PendingIntent reference",
                    "url": "https://developer.android.com/reference/android/app/PendingIntent"
                }
            ],
            "tags": [
                "pendingintent",
                "notification",
                "alarmmanager",
                "flag-immutable"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "PendingIntent for a notification tap (API 31+ safe)",
                    "code": "val contentIntent = Intent(context, MainActivity::class.java)\nval pendingIntent = PendingIntent.getActivity(\n    context,\n    requestCode,\n    contentIntent,\n    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE\n)\n\nNotificationCompat.Builder(context, CHANNEL_ID)\n    .setContentIntent(pendingIntent)\n    .setAutoCancel(true)\n    .build()"
                }
            ],
            "subsection": "intents-and-broadcasting"
        },
        {
            "id": "android-broadcast-types",
            "question": "What are the different types of Broadcasts?",
            "answer": "<p><strong>🔑 Broadcasts vary along two axes:</strong> normal vs ordered delivery, and system vs custom origin.</p><ul><li><strong>Normal broadcasts</strong> (<code>sendBroadcast()</code>) — delivered to all matching receivers <strong>asynchronously and in undefined order</strong>; receivers can't abort or affect each other.</li><li><strong>Ordered broadcasts</strong> (<code>sendOrderedBroadcast()</code>) — delivered to receivers <strong>one at a time, by priority</strong>; each can modify the result data or <code>abortBroadcast()</code> to stop propagation.</li><li><strong>Sticky broadcasts</strong> (<code>sendStickyBroadcast()</code>) — the Intent stays around so future <code>registerReceiver()</code> calls get it immediately; deprecated since API 21 due to security/lack of protection concerns.</li><li><strong>System broadcasts</strong> — sent by the OS itself, e.g. <code>ACTION_BOOT_COMPLETED</code>, <code>ACTION_BATTERY_LOW</code>, <code>CONNECTIVITY_ACTION</code>; many implicit ones are restricted for background apps since API 26.</li><li><strong>Local broadcasts</strong> — confined to the sending app's own process, historically via the now-deprecated <code>LocalBroadcastManager</code>, superseded by in-process alternatives like <code>SharedFlow</code>.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Broadcasts overview",
                    "url": "https://developer.android.com/guide/components/broadcasts"
                }
            ],
            "tags": [
                "broadcast",
                "ordered-broadcast",
                "sticky-broadcast",
                "system-broadcast"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "intents-and-broadcasting"
        },
        {
            "id": "android-service-lifecycle",
            "question": "Explain the Android Service Lifecycle.",
            "answer": "<p><strong>🔑 A Service's lifecycle branches</strong> depending on whether it's started, bound, or both — there is no single linear path.</p><ul><li><strong>Started service</strong> (<code>startService()</code>/<code>startForegroundService()</code>): <code>onCreate()</code> → <code>onStartCommand()</code> (called each time <code>startService()</code> is invoked, even for an already-running service) → runs until it calls <code>stopSelf()</code> or another component calls <code>stopService()</code> → <code>onDestroy()</code>.</li><li><strong>Bound service</strong> (<code>bindService()</code>): <code>onCreate()</code> → <code>onBind()</code> (returns an <code>IBinder</code> to the client) → service runs as long as <strong>any client remains bound</strong>; when the last client calls <code>unbindService()</code>, <code>onUnbind()</code> → <code>onDestroy()</code>.</li><li>A service can be <strong>both</strong> started and bound simultaneously — in that case it keeps running until <em>both</em> explicitly stopped <em>and</em> unbound from all clients.</li><li><code>onRebind()</code> is called if a new client binds after <code>onUnbind()</code> returned <code>true</code> (requesting to be notified of future binds).</li><li><code>onStartCommand()</code>'s return value (<code>START_STICKY</code>, <code>START_NOT_STICKY</code>, <code>START_REDELIVER_INTENT</code>) controls what happens if the system kills the process to reclaim memory.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Services overview",
                    "url": "https://developer.android.com/guide/components/services"
                }
            ],
            "tags": [
                "service",
                "lifecycle",
                "onstartcommand",
                "onbind",
                "bound-service"
            ],
            "hasDiagram": true,
            "diagramType": "flowchart",
            "diagramConfig": {
                "title": "Service lifecycle paths",
                "columns": 2,
                "nodes": [
                    {
                        "label": "onCreate()",
                        "type": "terminal"
                    },
                    {
                        "label": "startService()?",
                        "type": "decision"
                    },
                    {
                        "label": "onStartCommand()"
                    },
                    {
                        "label": "bindService()?",
                        "type": "decision"
                    },
                    {
                        "label": "onBind()"
                    },
                    {
                        "label": "onUnbind() / stopSelf()"
                    },
                    {
                        "label": "onDestroy()",
                        "type": "terminal"
                    }
                ],
                "connections": [
                    {
                        "from": 0,
                        "to": 1
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "started"
                    },
                    {
                        "from": 1,
                        "to": 3,
                        "label": "bound"
                    },
                    {
                        "from": 3,
                        "to": 4
                    },
                    {
                        "from": 2,
                        "to": 5
                    },
                    {
                        "from": 4,
                        "to": 5
                    },
                    {
                        "from": 5,
                        "to": 6
                    }
                ]
            },
            "codeSnippets": [],
            "subsection": "services"
        },
        {
            "id": "android-service",
            "question": "What is a Service in Android?",
            "answer": "<p><strong>🔑 Service</strong> is an application component that performs long-running operations <strong>without a UI</strong>, even while the user is in a different app.</p><ul><li>Three flavors: <strong>started</strong> (fire-and-forget background work), <strong>bound</strong> (a client-server relationship via <code>IBinder</code>, lives while clients are bound), and <strong>foreground</strong> (must show a persistent notification, used for user-visible ongoing work).</li><li>Runs on the <strong>main thread by default</strong> — it is not automatically a background thread; you must create your own worker thread/coroutine for actual blocking work inside it.</li><li>Declared in the manifest with <code>&lt;service&gt;</code>; since Android 9 (API 28), starting background services from the background is restricted — <code>startForegroundService()</code> plus a timely <code>startForeground()</code> call is required in many cases.</li><li>Modern guidance increasingly favors <strong>WorkManager</strong> for deferrable background work and reserves raw Services for cases needing immediate execution or genuine binding (e.g. media playback, IPC).</li></ul>",
            "referenceLinks": [
                {
                    "title": "Services overview",
                    "url": "https://developer.android.com/guide/components/services"
                }
            ],
            "tags": [
                "service",
                "background",
                "foreground-service",
                "bound-service"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "services"
        },
        {
            "id": "android-service-thread",
            "question": "On which thread does a Service run in Android?",
            "answer": "<p><strong>🔑 The main (UI) thread</strong> — a Service does not get a background thread automatically, a very common misconception.</p><ul><li>Just like an Activity, a Service's callbacks (<code>onCreate()</code>, <code>onStartCommand()</code>, <code>onBind()</code>) run on the <strong>application's main thread</strong> unless you explicitly move work elsewhere.</li><li>Doing blocking work directly in <code>onStartCommand()</code> will freeze the UI (if the app has visible UI) and can trigger an <strong>ANR</strong>.</li><li>To do real background work, launch a coroutine on <code>Dispatchers.IO</code>/<code>Default</code>, use a dedicated worker <code>Thread</code>/<code>HandlerThread</code>, or use <code>IntentService</code>'s legacy pattern (which internally ran on a single background worker thread, processing one Intent at a time — now superseded by <code>JobIntentService</code>/WorkManager).</li><li>A <strong>Foreground Service</strong> also runs on the main thread by default; its distinguishing property is only the persistent notification requirement and elevated process priority, not thread placement.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Services overview",
                    "url": "https://developer.android.com/guide/components/services"
                }
            ],
            "tags": [
                "service",
                "thread",
                "main-thread",
                "anr"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Offloading work from a Service's main-thread callback",
                    "code": "class SyncService : Service() {\n    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)\n\n    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {\n        scope.launch {\n            repository.sync() // runs off the main thread\n            stopSelf(startId)\n        }\n        return START_NOT_STICKY\n    }\n\n    override fun onDestroy() {\n        scope.cancel()\n        super.onDestroy()\n    }\n\n    override fun onBind(intent: Intent?) = null\n}"
                }
            ],
            "subsection": "services"
        },
        {
            "id": "android-service-vs-intentservice",
            "question": "What is the difference between Service and IntentService?",
            "answer": "<table><thead><tr><th>Service</th><th>IntentService</th></tr></thead><tbody><tr><td>Runs on the <strong>main thread</strong> by default; you manage threading yourself</td><td>Automatically runs work on a <strong>single background worker thread</strong></td></tr><tr><td>Handles concurrent requests as you implement them — can process multiple things at once</td><td>Processes queued Intents <strong>one at a time, sequentially</strong> via a work queue</td></tr><tr><td>Must call <code>stopSelf()</code> yourself when done</td><td>Automatically <strong>stops itself</strong> after the work queue is empty</td></tr><tr><td>General-purpose base class</td><td>Purpose-built for simple, sequential background tasks triggered by Intents</td></tr></tbody></table><ul><li><strong>IntentService is deprecated</strong> (API 30) in favor of <code>JobIntentService</code> (bridges to <code>JobScheduler</code> on newer APIs) and, in modern practice, <strong>WorkManager</strong>, which additionally handles constraints, retries, and chaining that IntentService never supported.</li></ul>",
            "referenceLinks": [
                {
                    "title": "IntentService reference",
                    "url": "https://developer.android.com/reference/android/app/IntentService"
                }
            ],
            "tags": [
                "service",
                "intentservice",
                "comparison",
                "workmanager"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "services"
        },
        {
            "id": "android-foreground-service",
            "question": "What is a Foreground Service?",
            "answer": "<p><strong>🔑 Foreground Service</strong> is a Service performing work the user is actively aware of — it must show a <strong>persistent, non-dismissible notification</strong> and gets elevated process priority so the system won't casually kill it.</p><ul><li>Started via <code>ContextCompat.startForegroundService()</code>, and the service must call <code>startForeground(notificationId, notification)</code> within a short window (a few seconds) or the system throws an <code>ANR</code>/exception.</li><li>Used for user-visible ongoing operations: music playback, navigation/location tracking, active file uploads/downloads, fitness tracking.</li><li><strong>Since Android 10 (API 29)</strong>, starting a foreground service from the background is restricted for most apps; since <strong>Android 14 (API 34)</strong>, you must declare a specific <code>android:foregroundServiceType</code> (e.g. <code>location</code>, <code>mediaPlayback</code>, <code>camera</code>, <code>dataSync</code>) in the manifest matching the work performed, and some types require a runtime permission.</li><li>Distinct from a regular background Service mainly in <strong>visibility</strong> and <strong>OS kill priority</strong> — it still runs on the main thread by default unless you offload work.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Foreground services",
                    "url": "https://developer.android.com/develop/background-work/services/foreground-services"
                }
            ],
            "tags": [
                "foreground-service",
                "notification",
                "foregroundservicetype",
                "startforeground"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Starting a foreground service with a type",
                    "code": "class LocationTrackingService : Service() {\n    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {\n        val notification = NotificationCompat.Builder(this, CHANNEL_ID)\n            .setContentTitle(\"Tracking your run\")\n            .setSmallIcon(R.drawable.ic_run)\n            .build()\n        startForeground(\n            NOTIFICATION_ID,\n            notification,\n            ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION\n        )\n        return START_STICKY\n    }\n\n    override fun onBind(intent: Intent?) = null\n}"
                }
            ],
            "subsection": "services"
        },
        {
            "id": "android-jobscheduler",
            "question": "What is a JobScheduler?",
            "answer": "<p><strong>🔑 JobScheduler</strong> (API 21+) lets you schedule conditional, deferrable background work that the system batches and runs at an opportune time to save battery.</p><ul><li>You define a <code>JobInfo</code> with <strong>constraints</strong> — network type, charging state, device idle, minimum latency — and the system decides exactly when to run the matching <code>JobService</code>.</li><li>Jobs execute in <code>JobService.onStartJob()</code>, which itself runs on the <strong>main thread</strong>; you must offload real work and call <code>jobFinished()</code> when done (or return <code>true</code> to signal async work continuing on another thread).</li><li>The system may <strong>batch multiple apps' jobs together</strong> and defer them to reduce radio/wake-up overhead, especially interacting with Doze mode and App Standby buckets.</li><li>In modern development, <strong>WorkManager</strong> is preferred — it wraps JobScheduler (API 23+), <code>AlarmManager</code>+BroadcastReceiver (older APIs), or a <code>GreedyExecutor</code> depending on the platform version, giving one consistent API plus chaining/retry policies JobScheduler alone doesn't provide.</li></ul>",
            "referenceLinks": [
                {
                    "title": "JobScheduler reference",
                    "url": "https://developer.android.com/reference/android/app/job/JobScheduler"
                }
            ],
            "tags": [
                "jobscheduler",
                "jobservice",
                "background-work",
                "workmanager"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "services"
        },
        {
            "id": "android-workmanager-guarantee",
            "question": "How does WorkManager guarantee task execution?",
            "answer": "<p><strong>🔑 Persistence + platform-appropriate scheduling backend</strong> — WorkManager survives app/process restart and even device reboot by design.</p><ul><li>Every enqueued <code>WorkRequest</code> is written to an internal <strong>Room database (SQLite)</strong> immediately — it survives process death; when the app/process restarts, WorkManager re-reads pending work and reschedules it.</li><li>Internally it delegates to the <strong>best available executor</strong> for the API level: <code>JobScheduler</code> on API 23+, a combination of <code>AlarmManager</code> + <code>BroadcastReceiver</code> on older APIs — always giving you one consistent API regardless of platform version.</li><li>Supports <strong>constraints</strong> (network connectivity, charging, storage-not-low, battery-not-low, idle) — work only runs when constraints are satisfied, re-evaluated automatically.</li><li>Built-in <strong>retry/backoff policy</strong> (<code>BackoffPolicy.LINEAR</code>/<code>EXPONENTIAL</code>) and chaining via <code>WorkContinuation</code> for sequential/parallel work graphs with output passed between steps.</li><li>For guaranteed execution even if the app is force-stopped by the user, an <code>OnBootReceiver</code> mechanism inside WorkManager itself reschedules pending work after reboot (registering a boot broadcast receiver internally).</li></ul>",
            "referenceLinks": [
                {
                    "title": "WorkManager overview",
                    "url": "https://developer.android.com/develop/background-work/background-tasks/persistent"
                }
            ],
            "tags": [
                "workmanager",
                "background-work",
                "constraints",
                "persistence"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Constrained, retryable WorkRequest",
                    "code": "val uploadRequest = OneTimeWorkRequestBuilder<UploadWorker>()\n    .setConstraints(\n        Constraints.Builder()\n            .setRequiredNetworkType(NetworkType.CONNECTED)\n            .setRequiresCharging(false)\n            .build()\n    )\n    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 10, TimeUnit.SECONDS)\n    .build()\n\nWorkManager.getInstance(context).enqueueUniqueWork(\n    \"upload_photo\",\n    ExistingWorkPolicy.KEEP,\n    uploadRequest\n)"
                }
            ],
            "subsection": "services"
        },
        {
            "id": "android-two-apps-interact",
            "question": "How can two distinct Android apps interact?",
            "answer": "<p><strong>🔑 Every cross-app interaction goes through the OS</strong> — apps run in separate processes/sandboxes and cannot directly call into each other's memory.</p><ul><li><strong>Implicit Intents</strong> — one app declares an action it can handle via an intent-filter, another app fires an implicit Intent that the system routes to it (sharing, opening links).</li><li><strong>ContentProvider</strong> — exposes a structured, permission-guarded slice of one app's data (via a <code>content://</code> URI) that another app queries/modifies through <code>ContentResolver</code>.</li><li><strong>Bound Service with AIDL/Messenger</strong> — for a genuine cross-process RPC-style API, one app exposes a bound Service that another binds to, using AIDL-generated Binder stubs (or the simpler <code>Messenger</code> for basic message passing).</li><li><strong>Broadcasts</strong> — one app sends a (permission-scoped) broadcast that another registers to receive.</li><li><strong>Custom permissions</strong> — apps can define and require permissions to gate any of the above, ensuring only authorized apps can interact with exposed components.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Interprocess communication",
                    "url": "https://developer.android.com/guide/components/processes-and-threads#IPC"
                }
            ],
            "tags": [
                "ipc",
                "intent",
                "contentprovider",
                "aidl",
                "cross-app"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "inter-process-communication"
        },
        {
            "id": "android-multiple-processes",
            "question": "Is it possible to run an Android app in multiple processes? How?",
            "answer": "<p><strong>🔑 Yes</strong> — declare <code>android:process</code> on a component in the manifest to run it in a separate process from the app's default one.</p><ul><li>Any component (Activity, Service, ContentProvider, BroadcastReceiver) can specify <code>android:process=\":remote\"</code> (leading colon = private process local to this app) or a fully-qualified name (shared globally with other apps signed with the same key, sharing a UID).</li><li>Common use cases: isolating a crash-prone or memory-heavy component (e.g. a WebView-heavy feature, a large SDK) so it doesn't take down the main process; running a persistent Service in its own process to survive the main UI process being killed; security isolation.</li><li>Each process gets its <strong>own Application instance, its own memory heap, and its own instance of static state</strong> — singletons are NOT automatically shared across processes, a very common source of subtle bugs.</li><li>Communication between the processes then requires actual IPC (Binder/AIDL, ContentProvider, or broadcasts) — you can't just call a method or reference an object across the process boundary.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Processes and application lifecycle",
                    "url": "https://developer.android.com/guide/components/activities/process-lifecycle"
                }
            ],
            "tags": [
                "multi-process",
                "android-process",
                "ipc",
                "manifest"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "xml",
                    "title": "Running a Service in a separate process",
                    "code": "<service\n    android:name=\".sync.SyncService\"\n    android:process=\":sync\"\n    android:exported=\"false\" />"
                }
            ],
            "subsection": "inter-process-communication"
        },
        {
            "id": "android-aidl",
            "question": "What is AIDL? Enumerate the steps in creating a bounded service through AIDL.",
            "answer": "<p><strong>🔑 AIDL (Android Interface Definition Language)</strong> defines a cross-process interface contract, from which the toolchain generates the Binder marshalling/unmarshalling code for you.</p><ul><li><strong>1. Define the .aidl file</strong> — declare the interface's methods (only certain types are supported directly: primitives, String, CharSequence, Parcelable, and List/Map of those).</li><li><strong>2. Build the project</strong> — the Android build tools generate a Java/Kotlin <code>Stub</code> class implementing <code>IBinder</code> with the marshalling logic baked in.</li><li><strong>3. Implement the Stub</strong> in your Service — extend <code>YourInterface.Stub()</code> and implement each method's actual logic.</li><li><strong>4. Return the Stub from onBind()</strong> in your Service so binding clients receive an <code>IBinder</code> they can cast to the interface.</li><li><strong>5. Client binds via bindService()</strong>, receives the binder in <code>ServiceConnection.onServiceConnected()</code>, and calls <code>YourInterface.Stub.asInterface(binder)</code> to get a usable proxy.</li><li>⚙️ Method calls made through the proxy are synchronous by default and execute on a <strong>Binder thread pool thread</strong> in the service process, not the caller's thread — so implementations must be thread-safe, and one-way (<code>oneway</code>) methods can be used for fire-and-forget async calls.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Android Interface Definition Language (AIDL)",
                    "url": "https://developer.android.com/develop/background-work/services/aidl"
                }
            ],
            "tags": [
                "aidl",
                "binder",
                "bound-service",
                "ipc"
            ],
            "hasDiagram": true,
            "diagramType": "sequence",
            "diagramConfig": {
                "title": "AIDL bound service call",
                "actors": [
                    "Client",
                    "Binder Proxy",
                    "Service (Stub)"
                ],
                "messages": [
                    {
                        "from": 0,
                        "to": 1,
                        "label": "bindService()"
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "onBind() -> Stub"
                    },
                    {
                        "from": 0,
                        "to": 1,
                        "label": "callMethod()"
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "transact()"
                    },
                    {
                        "from": 2,
                        "to": 1,
                        "label": "result",
                        "dashed": true
                    },
                    {
                        "from": 1,
                        "to": 0,
                        "label": "return value",
                        "dashed": true
                    }
                ]
            },
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Implementing the AIDL Stub in a Service",
                    "code": "// IMathService.aidl declares: int add(int a, int b);\n\nclass MathService : Service() {\n    private val binder = object : IMathService.Stub() {\n        override fun add(a: Int, b: Int): Int = a + b\n    }\n\n    override fun onBind(intent: Intent?): IBinder = binder\n}"
                }
            ],
            "subsection": "inter-process-communication"
        },
        {
            "id": "android-background-processing",
            "question": "What can you use for background processing in Android?",
            "answer": "<p><strong>🔑 Choose based on urgency, duration, and whether the work must survive process death.</strong></p><ul><li><strong>Kotlin Coroutines</strong> (<code>viewModelScope</code>, <code>lifecycleScope</code>) — in-process async work tied to a component's lifecycle; best for short-to-medium tasks that don't need to survive the app being killed.</li><li><strong>WorkManager</strong> — deferrable, guaranteed, constraint-based background work that survives process death and reboot; the recommended default for most persistent background jobs.</li><li><strong>Foreground Service</strong> — immediate, user-visible, long-running work (media playback, navigation, active uploads) requiring a persistent notification.</li><li><strong>AlarmManager</strong> — precise, time-based triggers (exact alarms), typically paired with a receiver/WorkManager for the actual work; API 31+ restricts <code>SCHEDULE_EXACT_ALARM</code>.</li><li><strong>JobScheduler</strong> — lower-level constraint-based scheduling that WorkManager itself builds on for API 23+; rarely used directly anymore.</li><li><strong>Thread/HandlerThread/ExecutorService</strong> — raw threading primitives for fine-grained control, generally wrapped by higher-level tools today.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Guide to background processing",
                    "url": "https://developer.android.com/develop/background-work"
                }
            ],
            "tags": [
                "background-work",
                "workmanager",
                "coroutines",
                "foreground-service",
                "alarmmanager"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "inter-process-communication"
        },
        {
            "id": "android-content-provider",
            "question": "What is a ContentProvider and what is it typically used for?",
            "answer": "<p><strong>🔑 ContentProvider</strong> is the standard mechanism for exposing structured app data behind a uniform, permission-controlled, cross-process API.</p><ul><li>Exposes data through a <code>content://</code> URI scheme; clients interact via <code>ContentResolver.query()/insert()/update()/delete()</code> instead of touching the underlying storage directly.</li><li>Abstracts the underlying storage — could be SQLite/Room, a remote API, files, or memory — from the consumer, which only sees the uniform CRUD interface.</li><li>Typical uses: sharing data across your own app's components in a structured way, exposing data to <strong>other apps</strong> (e.g. the system Contacts, MediaStore, Calendar providers), and backing <strong>widgets</strong>/search suggestions/sync adapters that require a ContentProvider-shaped API.</li><li>Access is governed by <code>android:exported</code>, <code>android:readPermission</code>/<code>writePermission</code>, or URI permission grants (<code>grantUriPermission()</code>, or <code>FLAG_GRANT_READ_URI_PERMISSION</code> on an Intent) for one-off access like sharing a file via <code>FileProvider</code>.</li><li>If you only need to share data <strong>within your own app</strong>, a ContentProvider is usually overkill — Room/DataStore accessed directly is simpler; reach for ContentProvider specifically for cross-app or system-integration needs.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Content providers",
                    "url": "https://developer.android.com/guide/topics/providers/content-providers"
                }
            ],
            "tags": [
                "contentprovider",
                "contentresolver",
                "fileprovider",
                "uri-permission"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "inter-process-communication"
        },
        {
            "id": "android-parallel-tasks-callback",
            "question": "How to run parallel tasks and get a callback when all are complete?",
            "answer": "<p><strong>🔑 Structured concurrency with async/await</strong> is the modern idiom — launch tasks concurrently, then suspend until all complete.</p><ul><li><strong>Coroutines:</strong> use <code>coroutineScope { }</code> with multiple <code>async { }</code> blocks, then call <code>.await()</code> on each — the scope suspends until all children finish, and if one throws, the others are cancelled automatically (structured concurrency).</li><li><strong>Java/legacy alternative:</strong> submit tasks to an <code>ExecutorService</code>, collect the returned <code>Future</code>s, and either poll them or use <code>CountDownLatch</code> to block until all complete.</li><li><strong>CompletableFuture.allOf(...)</strong> — combines multiple futures and completes when all of them do, offering a callback-style <code>.thenRun()</code>.</li><li>For truly independent parallel work with no dependency between results, prefer coroutines' <code>async</code>/<code>awaitAll()</code> — it's cancellation-aware, structured, and avoids manual thread/latch bookkeeping.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Composing suspending functions",
                    "url": "https://kotlinlang.org/docs/composing-suspending-functions.html"
                }
            ],
            "tags": [
                "coroutines",
                "async",
                "await",
                "parallel",
                "structured-concurrency"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Running tasks in parallel and awaiting all results",
                    "code": "suspend fun loadDashboard(): Dashboard = coroutineScope {\n    val userDeferred = async { userRepository.getUser() }\n    val postsDeferred = async { postRepository.getPosts() }\n    val statsDeferred = async { statsRepository.getStats() }\n\n    // Suspends here until all three complete; any failure cancels the rest\n    Dashboard(\n        user = userDeferred.await(),\n        posts = postsDeferred.await(),\n        stats = statsDeferred.await()\n    )\n}"
                }
            ],
            "subsection": "long-running-operations"
        },
        {
            "id": "android-anr",
            "question": "What is ANR? How can the ANR be prevented?",
            "answer": "<p><strong>🔑 ANR (Application Not Responding)</strong> — the system shows a dialog offering to close the app when the main thread is blocked too long to respond to input or lifecycle events.</p><ul><li>Triggered when the main thread doesn't respond to an input event within <strong>5 seconds</strong>, a BroadcastReceiver's <code>onReceive()</code> doesn't finish within <strong>10 seconds</strong> (foreground) / longer for background, or a Service callback doesn't complete quickly enough.</li><li><strong>Common causes:</strong> network/disk I/O on the main thread, heavy computation (JSON parsing, image processing) inline, a slow/deadlocked lock, or a long-blocking <code>synchronized</code> section shared with a background thread.</li><li><strong>Prevention:</strong> move all I/O and CPU-heavy work off the main thread — coroutines with <code>Dispatchers.IO</code>/<code>Default</code>, WorkManager for deferrable work; keep BroadcastReceivers and Service callbacks fast, delegating longer work elsewhere.</li><li>Use <strong>StrictMode</strong> in debug builds to catch accidental main-thread disk/network access early.</li><li>Diagnose with <strong>Perfetto/Systrace</strong> traces and ANR reports (<code>/data/anr/traces.txt</code> historically, now surfaced via Play Console's ANR reporting and <code>ApplicationExitInfo</code> on API 30+).</li></ul>",
            "referenceLinks": [
                {
                    "title": "Keep your app responsive (ANRs)",
                    "url": "https://developer.android.com/topic/performance/vitals/anr"
                }
            ],
            "tags": [
                "anr",
                "main-thread",
                "strictmode",
                "performance"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "long-running-operations"
        },
        {
            "id": "android-threadpool-advantages",
            "question": "What are the advantages of using a ThreadPool?",
            "answer": "<p><strong>🔑 Reuse over recreation</strong> — a thread pool amortizes the cost of thread creation/teardown across many tasks instead of paying it per task.</p><ul><li><strong>Reduced overhead</strong> — creating a new <code>Thread</code> per task is expensive (stack allocation, OS scheduling registration); a pool reuses a fixed/bounded set of worker threads across many submitted tasks.</li><li><strong>Bounded concurrency</strong> — caps the number of concurrently running threads (<code>corePoolSize</code>/<code>maximumPoolSize</code>), preventing resource exhaustion from unbounded thread creation under load.</li><li><strong>Queueing and backpressure</strong> — excess tasks wait in a work queue instead of spawning unbounded threads, and rejection policies handle overload gracefully.</li><li><strong>Task lifecycle management</strong> — supports scheduling, cancellation, and returns <code>Future</code>s for tracking task completion/results.</li><li>In Android specifically, <code>Executors.newFixedThreadPool()</code>/<code>ThreadPoolExecutor</code> underpins many framework and library internals (including AsyncTask historically, and Glide/OkHttp's dispatchers today); Kotlin coroutines' <code>Dispatchers.IO</code> is itself backed by a shared, elastic thread pool.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ThreadPoolExecutor reference",
                    "url": "https://developer.android.com/reference/java/util/concurrent/ThreadPoolExecutor"
                }
            ],
            "tags": [
                "threadpool",
                "executorservice",
                "concurrency",
                "performance"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "A bounded ThreadPoolExecutor",
                    "code": "val pool = ThreadPoolExecutor(\n    4,              // corePoolSize\n    8,              // maximumPoolSize\n    30, TimeUnit.SECONDS,\n    LinkedBlockingQueue()\n)\n\npool.execute { downloadFile(url) }"
                }
            ],
            "subsection": "long-running-operations"
        },
        {
            "id": "android-daemon-vs-user-threads",
            "question": "What is the difference between Daemon Threads and User Threads?",
            "answer": "<table><thead><tr><th>User Thread</th><th>Daemon Thread</th></tr></thead><tbody><tr><td>Keeps the <strong>JVM/process alive</strong> as long as it's running</td><td>Does <strong>not</strong> prevent the JVM/process from exiting — the runtime terminates daemon threads automatically once all user threads finish</td></tr><tr><td>Default thread type unless explicitly marked otherwise</td><td>Marked via <code>thread.isDaemon = true</code> <strong>before</strong> <code>start()</code></td></tr><tr><td>Used for the actual application work whose completion matters</td><td>Used for background housekeeping — GC threads, finalizers, cache eviction — where abrupt termination is acceptable</td></tr></tbody></table><ul><li>On Android, this distinction matters less directly for app code (the process lifecycle is managed by the OS/ActivityManager, not solely by user vs daemon threads), but it's still relevant conceptually for JVM internals and general Java/Kotlin concurrency knowledge.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Thread#setDaemon",
                    "url": "https://docs.oracle.com/javase/8/docs/api/java/lang/Thread.html#setDaemon-boolean-"
                }
            ],
            "tags": [
                "thread",
                "daemon-thread",
                "jvm",
                "concurrency"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "long-running-operations"
        },
        {
            "id": "android-handler-looper-handlerthread",
            "question": "Explain Looper, Handler, and HandlerThread.",
            "answer": "<p><strong>🔑 The message-loop machinery underlying every thread that processes queued work</strong> — this is what makes the main thread itself function.</p><ul><li><strong>Looper</strong> — runs an infinite loop pulling messages/runnables off a <strong>MessageQueue</strong> and dispatching them one at a time; a thread must call <code>Looper.prepare()</code> then <code>Looper.loop()</code> to have one (the main thread gets this automatically via <code>Looper.getMainLooper()</code>).</li><li><strong>MessageQueue</strong> — an ordered queue of <code>Message</code>/<code>Runnable</code> objects, each with a target execution time, that the Looper processes in order.</li><li><strong>Handler</strong> — the entry point for enqueueing work onto a specific Looper's queue (<code>post()</code>, <code>postDelayed()</code>, <code>sendMessage()</code>) from any thread, and for defining how that work is executed (<code>handleMessage()</code>) on the Looper's thread.</li><li><strong>HandlerThread</strong> — a convenience <code>Thread</code> subclass that sets up its own Looper for you, giving you a dedicated background thread with a message queue you can post work to via a <code>Handler(handlerThread.looper)</code>.</li><li>This is exactly how the <strong>main thread</strong> works internally: <code>ActivityThread</code> sets up a Looper on the main thread at process start, and UI events/lifecycle callbacks are all dispatched as Messages through it.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Handler reference",
                    "url": "https://developer.android.com/reference/android/os/Handler"
                }
            ],
            "tags": [
                "looper",
                "handler",
                "handlerthread",
                "messagequeue",
                "main-thread"
            ],
            "hasDiagram": true,
            "diagramType": "flowchart",
            "diagramConfig": {
                "title": "Handler / Looper / MessageQueue",
                "columns": 3,
                "nodes": [
                    {
                        "label": "Handler.post()",
                        "type": "terminal"
                    },
                    {
                        "label": "MessageQueue"
                    },
                    {
                        "label": "Looper.loop()",
                        "type": "decision"
                    },
                    {
                        "label": "handleMessage() runs on target thread",
                        "type": "terminal"
                    }
                ],
                "connections": [
                    {
                        "from": 0,
                        "to": 1,
                        "label": "enqueue"
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "next msg"
                    },
                    {
                        "from": 2,
                        "to": 3,
                        "label": "dispatch"
                    }
                ]
            },
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "HandlerThread with a Handler",
                    "code": "val handlerThread = HandlerThread(\"worker\").apply { start() }\nval backgroundHandler = Handler(handlerThread.looper)\nval mainHandler = Handler(Looper.getMainLooper())\n\nbackgroundHandler.post {\n    val result = decodeLargeBitmap()\n    mainHandler.post { imageView.setImageBitmap(result) }\n}"
                }
            ],
            "subsection": "long-running-operations"
        },
        {
            "id": "android-garbage-collection",
            "question": "How does Garbage Collection work in Android?",
            "answer": "<p><strong>🔑 ART's generational, mostly-concurrent GC</strong> reclaims unreachable objects automatically, minimizing (but not eliminating) main-thread pauses.</p><ul><li>ART (Android RunTime, replacing Dalvik since Lollipop) tracks object reachability from <strong>GC roots</strong> (static fields, active thread stacks, JNI references); anything unreachable is eligible for collection.</li><li>Uses a <strong>generational</strong> approach conceptually — young/short-lived objects are collected more frequently and cheaply than long-lived ones, reducing overall GC work.</li><li>Modern ART GCs (e.g. <strong>Concurrent Copying GC</strong>) run <strong>concurrently</strong> with the app on most operations, meaning brief, low-impact pauses instead of long stop-the-world collections — though some phases still briefly pause all threads.</li><li>ART also does <strong>AOT (ahead-of-time) and JIT compilation</strong> alongside interpretation, but this is separate from GC — worth distinguishing in an interview if asked about ART broadly.</li><li>App code can influence GC pressure by minimizing allocations in hot paths (e.g. <code>onDraw()</code>, <code>onBindViewHolder()</code>), reusing objects/object pools, and avoiding unnecessary boxing.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ART and Dalvik",
                    "url": "https://source.android.com/docs/core/runtime"
                }
            ],
            "tags": [
                "garbage-collection",
                "art",
                "dalvik",
                "memory"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "long-running-operations"
        },
        {
            "id": "android-memory-leak-vs-oom",
            "question": "What is the difference between Memory Leak and Out of Memory (OOM) Error?",
            "answer": "<table><thead><tr><th>Memory Leak</th><th>Out of Memory (OOM)</th></tr></thead><tbody><tr><td>An object that's no longer needed is still <strong>reachable</strong> from a GC root, so the collector can't reclaim it, even though the app logically doesn't use it anymore</td><td>The app tries to allocate memory but the <strong>heap has no room left</strong> (and can't grow further within its per-app limit) — throws <code>OutOfMemoryError</code></td></tr><tr><td>A <strong>cause</strong> — gradually reduces available memory over time (e.g. an Activity Context held by a long-lived singleton, an unregistered listener, a static field referencing a View)</td><td>An <strong>effect</strong> — often the eventual symptom of accumulated leaks, or simply a single oversized allocation (e.g. a huge unscaled Bitmap)</td></tr><tr><td>Detected with <strong>LeakCanary</strong>, heap dumps, or Android Studio's Memory Profiler</td><td>Prevented by avoiding leaks, downsampling large bitmaps, using memory-efficient data structures, and respecting <code>onTrimMemory()</code> signals</td></tr></tbody></table>",
            "referenceLinks": [
                {
                    "title": "Investigate your RAM usage",
                    "url": "https://developer.android.com/topic/performance/memory-overview"
                }
            ],
            "tags": [
                "memory-leak",
                "out-of-memory",
                "leakcanary",
                "heap"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "long-running-operations"
        },
        {
            "id": "android-runnable-vs-thread",
            "question": "What is the difference between a Runnable and a Thread in Android?",
            "answer": "<table><thead><tr><th>Runnable</th><th>Thread</th></tr></thead><tbody><tr><td>An <strong>interface</strong> describing a unit of work (<code>run()</code>) with no thread of execution of its own</td><td>An actual <strong>execution context</strong> — a class that can run a <code>Runnable</code> on its own OS-level thread</td></tr><tr><td>Can be handed to any executor — a <code>Handler</code>, an <code>ExecutorService</code>, a new <code>Thread</code> — decoupling <em>what</em> runs from <em>where/how</em> it runs</td><td>Directly tied to one specific OS thread; creating one always costs a real thread's worth of resources</td></tr><tr><td>Encourages reuse — the same <code>Runnable</code> can be posted to different queues/threads</td><td>Not reusable once <code>start()</code>ed — a <code>Thread</code> object can only run once</td></tr></tbody></table><ul><li><code>Thread</code> can implement <code>Runnable</code> directly (<code>class MyThread : Thread(), Runnable</code>-like usage) or be constructed with one: <code>Thread(myRunnable).start()</code> — but in modern Android code you rarely construct raw Threads, preferring coroutines or an <code>ExecutorService</code> that consumes Runnables/Callables.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Runnable reference",
                    "url": "https://developer.android.com/reference/java/lang/Runnable"
                }
            ],
            "tags": [
                "runnable",
                "thread",
                "comparison",
                "concurrency"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "long-running-operations"
        },
        {
            "id": "android-bitmap-handling",
            "question": "How do you handle bitmaps in Android as they take too much memory?",
            "answer": "<p><strong>🔑 Decode at the size you'll display, cache smartly, and recycle proactively</strong> — raw bitmaps are one of the biggest memory hogs in Android apps.</p><ul><li><strong>Sample down on decode</strong> — use <code>BitmapFactory.Options.inSampleSize</code> (a power of 2) after first reading dimensions with <code>inJustDecodeBounds = true</code>, so you never decode a 4000×3000 image just to show it in a 100dp thumbnail.</li><li><strong>Use the right config</strong> — <code>Bitmap.Config.RGB_565</code> halves memory vs <code>ARGB_8888</code> when alpha isn't needed.</li><li><strong>Caching</strong> — an in-memory <code>LruCache</code> (sized to a fraction of <code>Runtime.getRuntime().maxMemory()</code>) plus a disk cache for larger working sets; libraries like <strong>Coil</strong> or <strong>Glide</strong> already implement this correctly, including lifecycle-aware loading/cancellation.</li><li><strong>Bitmap pooling</strong> — reuse existing bitmap memory for new decodes of the same size via <code>inBitmap</code>/a <code>BitmapPool</code>, avoiding new allocations (and GC churn) for every image.</li><li>Explicitly manage lifecycle in manual (non-library) cases — since API 26 (<code>HARDWARE</code> bitmaps aside), unused large bitmaps should be dereferenced promptly so ART can reclaim them; older APIs benefited from explicit <code>recycle()</code>.</li><li>Respond to <code>onTrimMemory()</code> by evicting caches under memory pressure.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Manage bitmap memory",
                    "url": "https://developer.android.com/topic/performance/graphics/manage-memory"
                }
            ],
            "tags": [
                "bitmap",
                "memory",
                "lrucache",
                "image-loading",
                "insamplesize"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Decoding a downsampled bitmap",
                    "code": "fun decodeSampledBitmap(res: Resources, resId: Int, reqWidth: Int, reqHeight: Int): Bitmap {\n    val options = BitmapFactory.Options().apply { inJustDecodeBounds = true }\n    BitmapFactory.decodeResource(res, resId, options)\n\n    var sampleSize = 1\n    var (halfH, halfW) = options.outHeight / 2 to options.outWidth / 2\n    while (halfH / sampleSize >= reqHeight && halfW / sampleSize >= reqWidth) {\n        sampleSize *= 2\n    }\n\n    return BitmapFactory.decodeResource(res, resId, options.apply {\n        inSampleSize = sampleSize\n        inJustDecodeBounds = false\n        inPreferredConfig = Bitmap.Config.RGB_565\n    })\n}"
                }
            ],
            "subsection": "working-with-multimedia-content"
        },
        {
            "id": "android-bitmap-pool",
            "question": "What is a Bitmap pool?",
            "answer": "<p><strong>🔑 Bitmap pool</strong> is a reuse cache of already-allocated Bitmap memory buffers, letting new image decodes reuse existing pixel storage instead of allocating fresh memory every time.</p><ul><li>When a Bitmap is no longer displayed, instead of discarding it for GC, its underlying pixel buffer is kept in the pool, keyed roughly by size/config.</li><li>A new decode of a matching size can pass the pooled bitmap as <code>BitmapFactory.Options.inBitmap</code>, letting <code>BitmapFactory</code> write directly into the <strong>existing memory</strong> rather than allocating new native memory — this significantly cuts allocation churn and GC pressure, especially in fast-scrolling image-heavy lists.</li><li><strong>Glide</strong> and other image-loading libraries implement bitmap pools internally (<code>BitmapPool</code> in Glide) and manage reuse automatically as views scroll on/off screen.</li><li>Requires matching or compatible configs/dimensions (rules loosened over API levels) — the pool checks reuse eligibility (<code>canUseForInBitmap()</code>-style logic) before handing out a buffer.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Manage bitmap memory",
                    "url": "https://developer.android.com/topic/performance/graphics/manage-memory"
                }
            ],
            "tags": [
                "bitmap-pool",
                "memory",
                "inbitmap",
                "glide"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "working-with-multimedia-content"
        },
        {
            "id": "android-datastore-preferences",
            "question": "What is Jetpack DataStore Preferences?",
            "answer": "<p><strong>🔑 Modern replacement for SharedPreferences</strong></p><ul><li><strong>DataStore Preferences</strong> stores key-value pairs asynchronously using Kotlin <code>Flow</code>, backed by protocol buffers under the hood for the Proto variant, and by a plain file for the Preferences variant.</li><li>All reads and writes happen off the main thread via coroutines — there is no synchronous <code>getString()</code> that can block UI like <code>SharedPreferences.getX()</code> can on first access.</li><li>Transactional <code>updateData()</code> guarantees atomic read-modify-write; concurrent edits are serialized instead of silently racing.</li><li>Errors (e.g. corrupted file, IOException) are surfaced through the <code>Flow</code> as exceptions instead of being swallowed.</li></ul><p><strong>⚖️ vs SharedPreferences</strong></p><ul><li>No <code>SharedPreferences.Editor</code> footguns, no synchronous main-thread I/O, built-in migration support from existing SharedPreferences files via <code>SharedPreferencesMigration</code>.</li><li>Preferences DataStore is still stringly-typed (no schema); Proto DataStore adds full type safety at the cost of writing a <code>.proto</code> schema.</li></ul><p><strong>🎯 Interview tip:</strong> Mention that Google now recommends DataStore over SharedPreferences for all new code — SharedPreferences is effectively in maintenance mode.</p>",
            "referenceLinks": [
                {
                    "title": "DataStore guide",
                    "url": "https://developer.android.com/topic/libraries/architecture/datastore"
                }
            ],
            "tags": [
                "datastore",
                "preferences",
                "sharedpreferences",
                "storage",
                "coroutines"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Reading and writing with Preferences DataStore",
                    "code": "val Context.dataStore by preferencesDataStore(name = \"settings\")\n\nval USERNAME_KEY = stringPreferencesKey(\"username\")\n\nclass UserPrefsRepository(private val context: Context) {\n\n    val username: Flow<String> = context.dataStore.data\n        .map { prefs -> prefs[USERNAME_KEY] ?: \"guest\" }\n\n    suspend fun setUsername(name: String) {\n        context.dataStore.edit { prefs ->\n            prefs[USERNAME_KEY] = name\n        }\n    }\n}"
                }
            ],
            "subsection": "data-saving"
        },
        {
            "id": "android-persisting-data",
            "question": "What are the ways of persisting data in an Android app?",
            "answer": "<p><strong>🔑 Pick storage by shape and lifetime of the data</strong></p><table><thead><tr><th>Mechanism</th><th>Best for</th></tr></thead><tbody><tr><td><strong>SharedPreferences</strong></td><td>Small primitive key-value settings, legacy code</td></tr><tr><td><strong>DataStore</strong></td><td>Modern key-value or typed proto settings, Flow-based</td></tr><tr><td><strong>Room / SQLite</strong></td><td>Structured, queryable, relational data</td></tr><tr><td><strong>Internal storage</strong> (<code>filesDir</code>)</td><td>Private app files, cache, downloaded assets</td></tr><tr><td><strong>External storage / MediaStore</strong></td><td>User-facing media (photos, downloads) under scoped storage</td></tr><tr><td><strong>ContentProvider</strong></td><td>Sharing structured data across processes/apps</td></tr><tr><td><strong>Network + cache</strong></td><td>Remote source of truth with an offline cache (e.g. OkHttp cache, Room as cache)</td></tr></tbody></table><ul><li>Most production apps combine several: Room as the single source of truth, DataStore for settings, internal storage for large blobs.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Data and file storage overview",
                    "url": "https://developer.android.com/training/data-storage"
                }
            ],
            "tags": [
                "storage",
                "persistence",
                "room",
                "sharedpreferences",
                "datastore"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "data-saving"
        },
        {
            "id": "android-orm",
            "question": "What is ORM? How does it work?",
            "answer": "<p><strong>🔑 Object-Relational Mapping</strong></p><ul><li>An <strong>ORM</strong> maps table rows to objects (and back), letting you query and persist data using classes/annotations instead of hand-written SQL and manual <code>Cursor</code> traversal.</li><li>On Android, <strong>Room</strong> is the standard ORM: <code>@Entity</code> classes map to tables, <code>@Dao</code> interfaces declare typed queries, and <code>@Database</code> ties them together with a generated <code>SQLiteOpenHelper</code>-based implementation.</li></ul><p><strong>⚙️ How it works</strong></p><ul><li>At compile time, an annotation processor (KAPT/KSP) generates the boilerplate: statement binding, cursor-to-object mapping, and compile-time verification of <code>@Query</code> SQL against your schema.</li><li>Room also generates a schema export you can diff for migrations, and supports observable return types (<code>Flow</code>, <code>LiveData</code>) that auto-emit when the underlying tables change.</li></ul><p><strong>⚖️ Trade-offs</strong></p><ul><li>Convenience and compile-time safety vs. a thin abstraction leak — complex joins or bulk operations sometimes still need raw <code>@RawQuery</code> SQL.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Save data in a local database using Room",
                    "url": "https://developer.android.com/training/data-storage/room"
                }
            ],
            "tags": [
                "orm",
                "room",
                "sqlite",
                "database",
                "annotations"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Minimal Room entity, DAO and database",
                    "code": "@Entity(tableName = \"users\")\ndata class UserEntity(\n    @PrimaryKey val id: Long,\n    val name: String,\n    val email: String\n)\n\n@Dao\ninterface UserDao {\n    @Query(\"SELECT * FROM users WHERE id = :id\")\n    fun observeUser(id: Long): Flow<UserEntity?>\n\n    @Insert(onConflict = OnConflictStrategy.REPLACE)\n    suspend fun upsert(user: UserEntity)\n}\n\n@Database(entities = [UserEntity::class], version = 1)\nabstract class AppDatabase : RoomDatabase() {\n    abstract fun userDao(): UserDao\n}"
                }
            ],
            "subsection": "data-saving"
        },
        {
            "id": "android-preserve-activity-rotation",
            "question": "How would you preserve Activity state during a screen rotation?",
            "answer": "<p><strong>🔑 Three complementary mechanisms</strong></p><ul><li><strong>ViewModel</strong> — survives configuration changes because the framework retains the <code>ViewModelStore</code> across the Activity's recreation (via <code>onRetainNonConfigurationInstance</code> internally); keep in-memory UI state here.</li><li><strong>onSaveInstanceState(Bundle)</strong> — for small, transient UI state (scroll position, form text) that must survive process death too, not just rotation. Restored in <code>onCreate(savedInstanceState)</code> or <code>onRestoreInstanceState</code>.</li><li><strong>SavedStateHandle</strong> — the modern bridge: a <code>ViewModel</code> constructed with <code>SavedStateHandle</code> automatically persists selected values into the saved-instance Bundle, so it survives both rotation <em>and</em> process death, not just rotation.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>ViewModel alone does not survive process death (e.g. the system killing a backgrounded app to reclaim memory) — only rotation/config changes. Use <code>SavedStateHandle</code> for anything that must survive both.</li></ul><p><strong>🎯 Interview tip:</strong> Emphasize the distinction between &quot;config change&quot; (ViewModel is enough) and &quot;process death&quot; (need Bundle/SavedStateHandle) — interviewers often probe exactly this gap.</p>",
            "referenceLinks": [
                {
                    "title": "Save UI states",
                    "url": "https://developer.android.com/topic/libraries/architecture/saving-states"
                }
            ],
            "tags": [
                "viewmodel",
                "configuration-changes",
                "savedstatehandle",
                "rotation",
                "lifecycle"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "ViewModel with SavedStateHandle surviving process death",
                    "code": "class SearchViewModel(private val savedStateHandle: SavedStateHandle) : ViewModel() {\n\n    val query: StateFlow<String> =\n        savedStateHandle.getStateFlow(\"query\", \"\")\n\n    fun onQueryChanged(newQuery: String) {\n        savedStateHandle[\"query\"] = newQuery\n    }\n}"
                }
            ],
            "subsection": "data-saving"
        },
        {
            "id": "android-data-storage-options",
            "question": "What are different ways to store data in your Android app?",
            "answer": "<p><strong>🔑 Same decision, framed by scope and access pattern</strong></p><ul><li><strong>App-private, structured</strong> — Room/SQLite for relational/queryable data.</li><li><strong>App-private, key-value</strong> — DataStore (preferred) or SharedPreferences (legacy) for settings/flags.</li><li><strong>App-private, files</strong> — <code>context.filesDir</code> / <code>cacheDir</code> for arbitrary blobs; cleared automatically for cache when space is needed.</li><li><strong>Shared with user / other apps</strong> — <code>MediaStore</code> under scoped storage for media, or a <code>ContentProvider</code> to expose your own structured data.</li><li><strong>Remote</strong> — network APIs, typically fronted by a local cache (Room) so the app works offline.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>Since Android 10 (API 29), raw file-path access to shared/external storage is restricted by Scoped Storage — you generally can't just write anywhere on external storage anymore.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Data and file storage overview",
                    "url": "https://developer.android.com/training/data-storage"
                }
            ],
            "tags": [
                "storage",
                "room",
                "datastore",
                "mediastore",
                "contentprovider"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "data-saving"
        },
        {
            "id": "android-scoped-storage",
            "question": "What is Scoped Storage in Android?",
            "answer": "<p><strong>🔑 Sandboxed, privacy-first external storage</strong></p><ul><li><strong>Scoped Storage</strong> (enforced from Android 10/API 29+, mandatory from API 30+) confines an app's direct file-path access to its own app-specific directory (<code>getExternalFilesDir()</code>) and to a private, auto-deleted cache.</li><li>Access to files created by <em>other</em> apps (photos, downloads, documents) now goes through <strong>MediaStore</strong> (for media) or the <strong>Storage Access Framework</strong> (<code>ACTION_OPEN_DOCUMENT</code>) instead of raw paths.</li><li>Apps can still create their own media entries via <code>MediaStore.Images/Video/Audio</code> without any storage permission at all — the system grants access to what the app itself created.</li><li>The broad <code>MANAGE_EXTERNAL_STORAGE</code> &quot;all files access&quot; permission exists only for narrow use cases (file managers, backup apps) and requires special Play Store review.</li></ul><p><strong>🎯 Interview tip:</strong> Note that <code>READ_EXTERNAL_STORAGE</code>/<code>WRITE_EXTERNAL_STORAGE</code> are largely irrelevant now for an app's own scoped directory — a common trap for candidates who learned pre-Android-10 patterns.</p>",
            "referenceLinks": [
                {
                    "title": "Scoped storage overview",
                    "url": "https://developer.android.com/training/data-storage#scoped-storage"
                }
            ],
            "tags": [
                "scoped-storage",
                "mediastore",
                "storage",
                "permissions",
                "files"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Querying MediaStore for images under Scoped Storage",
                    "code": "val projection = arrayOf(MediaStore.Images.Media._ID, MediaStore.Images.Media.DISPLAY_NAME)\nval sortOrder = MediaStore.Images.Media.DATE_ADDED + \" DESC\"\ncontext.contentResolver.query(\n    MediaStore.Images.Media.EXTERNAL_CONTENT_URI,\n    projection,\n    null,\n    null,\n    sortOrder\n)?.use { cursor ->\n    val idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)\n    while (cursor.moveToNext()) {\n        val id = cursor.getLong(idCol)\n        val uri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id)\n    }\n}"
                }
            ],
            "subsection": "data-saving"
        },
        {
            "id": "android-encrypt-data",
            "question": "How to encrypt data in Android?",
            "answer": "<p><strong>🔑 Layered approach depending on what you're protecting</strong></p><ul><li><strong>EncryptedSharedPreferences / EncryptedFile</strong> (Jetpack Security library) — transparently encrypt key-value pairs or files using keys managed by the <strong>Android Keystore</strong>, AES-256-GCM/SIV under the hood.</li><li><strong>Android Keystore system</strong> — generates and stores cryptographic keys in hardware-backed secure storage (StrongBox/TEE where available); the raw key material never leaves secure hardware, only encrypt/decrypt operations are exposed.</li><li><strong>Room + SQLCipher</strong> — encrypts an entire SQLite database file at rest when structured data needs encryption.</li><li><strong>Network layer</strong> — TLS (HTTPS) for data in transit is a separate but equally required concern; Network Security Config can pin certificates and disable cleartext traffic.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>Never hardcode encryption keys in source or shared prefs — that defeats the purpose; always derive/store keys via Keystore.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Work with data more securely",
                    "url": "https://developer.android.com/topic/security/data"
                },
                {
                    "title": "Android Keystore system",
                    "url": "https://developer.android.com/training/articles/keystore"
                }
            ],
            "tags": [
                "encryption",
                "keystore",
                "security",
                "sharedpreferences",
                "sqlcipher"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "EncryptedSharedPreferences backed by Android Keystore",
                    "code": "val masterKey = MasterKey.Builder(context)\n    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)\n    .build()\n\nval encryptedPrefs = EncryptedSharedPreferences.create(\n    context,\n    \"secure_prefs\",\n    masterKey,\n    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,\n    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM\n)\n\nencryptedPrefs.edit().putString(\"auth_token\", token).apply()"
                }
            ],
            "subsection": "data-saving"
        },
        {
            "id": "android-commit-vs-apply",
            "question": "What is the difference between commit() and apply() in SharedPreferences?",
            "answer": "<p><strong>🔑 Synchronous vs asynchronous write-back</strong></p><table><thead><tr><th></th><th><code>commit()</code></th><th><code>apply()</code></th></tr></thead><tbody><tr><td>Return value</td><td><code>boolean</code> success</td><td><code>void</code></td></tr><tr><td>Disk write</td><td>Synchronous, blocks caller</td><td>Asynchronous on a background thread</td></tr><tr><td>In-memory update</td><td>Immediate</td><td>Immediate (visible to other reads right away)</td></tr><tr><td>Use case</td><td>Need confirmation write succeeded before proceeding</td><td>Fire-and-forget writes (the common case)</td></tr></tbody></table><ul><li><strong>Both</strong> update the in-memory <code>Map</code> synchronously — the difference is only about when the write hits disk.</li></ul><p><strong>⚠️ Pitfall: apply() can still stall the main thread</strong></p><ul><li>Android inserts a <strong>sync barrier</strong> at key lifecycle points — notably <code>Activity.onPause()</code>/process shutdown — where it waits for all pending <code>apply()</code> writes across the app to finish (via <code>QueuedWork</code>). If you fire many <code>apply()</code> calls right before backgrounding, the barrier can block the main thread waiting for that queue to drain, effectively negating the &quot;async&quot; benefit.</li><li>This is one reason DataStore (pure coroutine/Flow based, no such global barrier) is now recommended over SharedPreferences.</li></ul>",
            "referenceLinks": [
                {
                    "title": "SharedPreferences.Editor",
                    "url": "https://developer.android.com/reference/android/content/SharedPreferences.Editor"
                }
            ],
            "tags": [
                "sharedpreferences",
                "commit",
                "apply",
                "main-thread",
                "storage"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "commit() vs apply()",
                    "code": "val prefs = context.getSharedPreferences(\"app\", Context.MODE_PRIVATE)\n\n// Blocks until write completes; returns success\nval ok: Boolean = prefs.edit().putBoolean(\"onboarded\", true).commit()\n\n// Returns immediately; write happens on a background thread\nprefs.edit().putBoolean(\"onboarded\", true).apply()"
                }
            ],
            "subsection": "data-saving"
        },
        {
            "id": "android-spannable",
            "question": "What is a Spannable in Android?",
            "answer": "<p><strong>🔑 Mutable, markup-annotated text</strong></p><ul><li>A <strong>Spannable</strong> is a <code>CharSequence</code> that lets you attach markup objects (&quot;spans&quot;) to ranges of text — color, size, clickability, style — without splitting the string into multiple <code>TextView</code>s.</li><li>Common span types: <code>ForegroundColorSpan</code>, <code>StyleSpan</code> (bold/italic), <code>ClickableSpan</code>, <code>ImageSpan</code>, <code>UnderlineSpan</code>.</li><li><code>Spannable</code> is the mutable interface; <code>SpannableStringBuilder</code> is the standard mutable implementation used when you need to add/remove spans dynamically after creation.</li><li>Applied via <code>TextView.setText(spannable)</code> — the <code>TextView</code> renders each span's effect over its character range at draw time.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Spannable",
                    "url": "https://developer.android.com/reference/android/text/Spannable"
                }
            ],
            "tags": [
                "spannable",
                "text",
                "spans",
                "textview"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Building styled text with SpannableStringBuilder",
                    "code": "val builder = SpannableStringBuilder(\"Terms and Conditions\")\nbuilder.setSpan(\n    ForegroundColorSpan(Color.BLUE),\n    0, 5,\n    Spannable.SPAN_EXCLUSIVE_EXCLUSIVE\n)\nbuilder.setSpan(\n    StyleSpan(Typeface.BOLD),\n    10, 21,\n    Spannable.SPAN_EXCLUSIVE_EXCLUSIVE\n)\ntextView.text = builder"
                }
            ],
            "subsection": "look-and-feel"
        },
        {
            "id": "android-spannablestring",
            "question": "What is a SpannableString?",
            "answer": "<p><strong>🔑 The immutable-length counterpart to SpannableStringBuilder</strong></p><ul><li><strong>SpannableString</strong> implements <code>Spannable</code> over a fixed underlying string — you can add/remove/modify <em>spans</em> after construction, but you cannot change the <em>text</em> itself (no insert/delete of characters).</li><li>Use it when the text content is already final and you only need to decorate it with styling — e.g. highlighting a search match in a fixed label.</li></ul><table><thead><tr><th>Type</th><th>Text mutable?</th><th>Spans mutable?</th></tr></thead><tbody><tr><td><code>SpannableString</code></td><td>No</td><td>Yes</td></tr><tr><td><code>SpannableStringBuilder</code></td><td>Yes</td><td>Yes</td></tr><tr><td><code>String</code>/<code>CharSequence</code></td><td>No</td><td>No spans</td></tr></tbody></table>",
            "referenceLinks": [
                {
                    "title": "SpannableString",
                    "url": "https://developer.android.com/reference/android/text/SpannableString"
                }
            ],
            "tags": [
                "spannablestring",
                "spans",
                "text",
                "textview"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "look-and-feel"
        },
        {
            "id": "android-text-best-practices",
            "question": "What are the best practices for using text in Android?",
            "answer": "<p><strong>🔑 Readable, scalable, localizable text</strong></p><ul><li><strong>Use <code>sp</code> for text size</strong>, never <code>dp</code>/<code>px</code> — <code>sp</code> respects the user's system font-size accessibility setting.</li><li><strong>Extract all copy into <code>strings.xml</code></strong> — never hardcode strings in layouts or code; enables localization and lint's hardcoded-string checks.</li><li>Use <strong>string resource plurals</strong> (<code>&lt;plurals&gt;</code>) and format arguments instead of manual concatenation, which breaks in RTL/other-grammar locales.</li><li>Prefer <strong>Material typography scale</strong> (<code>MaterialTheme.typography</code> / theme text appearances) over ad-hoc sizes for visual consistency.</li><li>Test with <strong>large font scale</strong> and <strong>RTL pseudolocales</strong> to catch truncation and layout breakage.</li><li>Use <code>autoSizeTextType=&quot;uniform&quot;</code> for text that must fit dynamic containers without hardcoding size steps.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Localize your app",
                    "url": "https://developer.android.com/guide/topics/resources/localization"
                }
            ],
            "tags": [
                "text",
                "accessibility",
                "localization",
                "typography",
                "strings"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "look-and-feel"
        },
        {
            "id": "android-dark-mode",
            "question": "How to implement Dark mode in an application?",
            "answer": "<p><strong>🔑 DayNight theme + resource qualifiers</strong></p><ul><li>Base your theme on <code>Theme.MaterialComponents.DayNight</code> (or Material3's default, which is DayNight-aware out of the box) instead of a fixed light/dark parent.</li><li>Define colors twice: default <code>values/colors.xml</code> for light, and <code>values-night/colors.xml</code> for dark — the system picks the right set automatically based on <code>Configuration.uiMode</code>.</li><li>Use theme attributes (<code>?attr/colorSurface</code>, <code>?attr/colorOnSurface</code>) in layouts rather than literal colors, so both variants apply without per-view branching.</li><li>Programmatically force a mode with <code>AppCompatDelegate.setDefaultNightMode(MODE_NIGHT_YES/NO/FOLLOW_SYSTEM)</code>, typically wired to a user-facing settings toggle.</li><li>With <strong>Material 3 dynamic color</strong> (Android 12+), <code>dynamicDarkColorScheme(context)</code>/<code>dynamicLightColorScheme(context)</code> derive both palettes from the user's wallpaper automatically.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Dark theme",
                    "url": "https://developer.android.com/develop/ui/views/theming/darktheme"
                }
            ],
            "tags": [
                "dark-mode",
                "theming",
                "material-design",
                "daynight",
                "resources"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Toggling night mode at runtime",
                    "code": "fun applyTheme(mode: NightModePref) {\n    val nightMode = when (mode) {\n        NightModePref.LIGHT -> AppCompatDelegate.MODE_NIGHT_NO\n        NightModePref.DARK -> AppCompatDelegate.MODE_NIGHT_YES\n        NightModePref.SYSTEM -> AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM\n    }\n    AppCompatDelegate.setDefaultNightMode(nightMode)\n}"
                }
            ],
            "subsection": "look-and-feel"
        },
        {
            "id": "android-improve-performance",
            "question": "How to improve Android app performance?",
            "answer": "<p><strong>🔑 Attack rendering, memory and background work separately</strong></p><ul><li><strong>Rendering</strong> — flatten view hierarchies (<code>ConstraintLayout</code> over nested <code>LinearLayout</code>s), avoid overdraw, use <code>RecyclerView</code>/<code>DiffUtil</code> instead of re-inflating lists, keep work off the 16ms frame budget (<code>Choreographer</code>).</li><li><strong>Startup</strong> — adopt <strong>Baseline Profiles</strong> so hot paths are AOT-compiled instead of interpreted/JIT-warmed on first runs; defer non-critical <code>Application.onCreate()</code> work via <code>App Startup</code> library or lazy init.</li><li><strong>Memory</strong> — downsample bitmaps (<code>inSampleSize</code>), use <code>WeakReference</code> for caches, watch for leaks with <strong>LeakCanary</strong>, avoid large object churn causing frequent GC pauses.</li><li><strong>Background work</strong> — move I/O and computation off the main thread with coroutines/<code>Dispatchers.IO</code>, batch network calls, use <strong>WorkManager</strong> for deferrable work respecting Doze.</li><li>Measure first: <strong>Android Studio Profiler</strong>, <code>StrictMode</code>, <strong>Macrobenchmark</strong>, and systrace/Perfetto traces before optimizing blind.</li></ul><p><strong>🎯 Interview tip:</strong> Lead with &quot;measure, don&#39;t guess&quot; — naming Profiler/Perfetto signals real-world experience over rote advice.</p>",
            "referenceLinks": [
                {
                    "title": "App performance overview",
                    "url": "https://developer.android.com/topic/performance"
                }
            ],
            "tags": [
                "performance",
                "optimization",
                "profiling",
                "memory",
                "startup"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "memory-optimizations"
        },
        {
            "id": "android-ontrimmemory",
            "question": "What is the onTrimMemory() method?",
            "answer": "<p><strong>🔑 System memory-pressure callback</strong></p><ul><li><code>ComponentCallbacks2.onTrimMemory(int level)</code> is called on your <code>Application</code>/<code>Activity</code>/<code>Service</code> when the system wants apps to proactively free memory, before resorting to killing processes.</li><li>Levels while your process is in the <strong>foreground/visible</strong>: <code>TRIM_MEMORY_RUNNING_MODERATE</code>, <code>TRIM_MEMORY_RUNNING_LOW</code>, <code>TRIM_MEMORY_RUNNING_CRITICAL</code>.</li><li>Levels while <strong>backgrounded</strong>: <code>TRIM_MEMORY_UI_HIDDEN</code> (UI no longer visible — release UI-only resources), <code>TRIM_MEMORY_BACKGROUND</code>, <code>TRIM_MEMORY_MODERATE</code>, <code>TRIM_MEMORY_COMPLETE</code> (process is a prime kill candidate).</li><li>Typical response: clear image caches, release non-essential singletons, cancel non-critical prefetch work.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li><code>onLowMemory()</code> is the older, coarser signal — <code>onTrimMemory()</code> supersedes it with finer granularity and should be preferred.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ComponentCallbacks2",
                    "url": "https://developer.android.com/reference/android/content/ComponentCallbacks2"
                }
            ],
            "tags": [
                "ontrimmemory",
                "memory",
                "lifecycle",
                "componentcallbacks"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Responding to memory pressure",
                    "code": "class ImageCacheHolder : Application(), ComponentCallbacks2 {\n    override fun onTrimMemory(level: Int) {\n        super.onTrimMemory(level)\n        when {\n            level >= ComponentCallbacks2.TRIM_MEMORY_COMPLETE ->\n                imageCache.evictAll()\n            level >= ComponentCallbacks2.TRIM_MEMORY_MODERATE ->\n                imageCache.trimToSize(imageCache.maxSize() / 2)\n        }\n    }\n}"
                }
            ],
            "subsection": "memory-optimizations"
        },
        {
            "id": "android-fix-oom",
            "question": "How to identify and fix OutOfMemory issues?",
            "answer": "<p><strong>🔑 Find the leak or the bloat, then fix the root cause</strong></p><ul><li><strong>Identify</strong> — capture a heap dump (Android Studio Profiler &gt; Memory, or <code>Debug.dumpHprof()</code>) at high memory usage; look for large retained object counts, duplicate bitmaps, or an activity/fragment count that never returns to zero.</li><li><strong>LeakCanary</strong> automates this — it dumps the heap when an object that should be garbage should've been collected isn't, and prints the retention path (the leak trace) straight to Logcat/notification.</li><li><strong>Common OOM causes</strong>: full-resolution bitmaps loaded without downsampling, unbounded caches/lists, static references to <code>Activity</code>/<code>Context</code>/<code>View</code>, listeners registered but never unregistered.</li><li><strong>Fixes</strong>: use <code>BitmapFactory.Options.inSampleSize</code> or an image loader (Coil/Glide) that handles sizing/pooling automatically, cap cache size with <code>LruCache</code>, unregister listeners in the matching lifecycle callback (<code>onDestroy</code>/<code>onStop</code>), and use <code>WeakReference</code> where a long-lived object must reference a short-lived one.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Investigate your RAM usage",
                    "url": "https://developer.android.com/topic/performance/memory"
                }
            ],
            "tags": [
                "outofmemory",
                "oom",
                "memory-leak",
                "bitmap",
                "leakcanary"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "memory-optimizations"
        },
        {
            "id": "android-find-memory-leaks",
            "question": "How do you find memory leaks in Android applications?",
            "answer": "<p><strong>🔑 Tooling + knowing the usual suspects</strong></p><ul><li><strong>LeakCanary</strong> — drop-in library that automatically detects retained <code>Activity</code>/<code>Fragment</code>/<code>ViewModel</code> instances after they should be destroyed and prints the full reference chain causing the leak.</li><li><strong>Android Studio Memory Profiler</strong> — force a GC, take a heap dump, filter by class, and inspect instance count trends across navigation (e.g. rotate 10x, see if Activity count climbs).</li><li><strong>StrictMode</strong> can flag some leaked resources (unclosed <code>Closeable</code>s) during development.</li></ul><p><strong>⚠️ Common leak sources</strong></p><ul><li><strong>Static <code>Context</code>/<code>View</code> references</strong> — a static field holding an Activity outlives its lifecycle.</li><li><strong>Non-static inner/anonymous <code>Handler</code></strong> — implicitly holds an outer-class reference (e.g. Activity); delayed messages on the queue keep it alive. Fix: static nested class + <code>WeakReference&lt;Activity&gt;</code>.</li><li><strong>Listener/callback retention</strong> — registering a listener with a long-lived object (EventBus, LiveData observer without lifecycle owner, singleton) and never unregistering.</li><li><strong>Anonymous inner classes</strong> (coroutine callbacks, animation listeners) capturing an outer Activity/Fragment reference beyond its lifetime.</li></ul>",
            "referenceLinks": [
                {
                    "title": "LeakCanary",
                    "url": "https://square.github.io/leakcanary/"
                },
                {
                    "title": "Investigate your RAM usage",
                    "url": "https://developer.android.com/topic/performance/memory"
                }
            ],
            "tags": [
                "memory-leak",
                "leakcanary",
                "handler",
                "context",
                "profiler"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "LeakCanary setup (debug build only)",
                    "code": "// build.gradle.kts (debugImplementation only — no-op in release)\n// debugImplementation(\"com.squareup.leakcanary:leakcanary-android:2.14\")\n\n// Fixing a classic Handler leak:\nclass SafeHandler(activity: MainActivity) : Handler(Looper.getMainLooper()) {\n    private val activityRef = WeakReference(activity)\n\n    override fun handleMessage(msg: Message) {\n        activityRef.get()?.let { activity ->\n            activity.updateUi(msg)\n        }\n    }\n}"
                }
            ],
            "subsection": "memory-optimizations"
        },
        {
            "id": "android-adaptive-battery-ml",
            "question": "How does Android implement Adaptive Battery using ML?",
            "answer": "<p><strong>🔑 On-device ML predicts what you'll actually use</strong></p><ul><li><strong>Adaptive Battery</strong> (Android 9+) uses an on-device machine-learning model to predict which apps you're likely to use in the next few hours and which you probably won't touch today.</li><li>Apps predicted as unlikely to be used soon are placed into more restrictive <strong>App Standby buckets</strong> (<code>rare</code>/<code>restricted</code>), which throttles their background CPU/network/job/alarm access — deferring their <strong>WorkManager</strong>/<code>JobScheduler</code> jobs and delaying <code>AlarmManager</code> alarms.</li><li>Predictions adapt continuously to usage patterns (time of day, day of week, sequence of app launches) rather than using a static allowlist.</li><li>This is layered on top of <strong>Doze</strong> and standard App Standby — Adaptive Battery decides bucket placement more intelligently; Doze/Standby enforce the actual restrictions.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Manage device power-saving modes",
                    "url": "https://developer.android.com/training/monitoring-device-state/doze-standby"
                }
            ],
            "tags": [
                "battery",
                "adaptive-battery",
                "app-standby",
                "machine-learning",
                "doze"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "battery-life-optimizations"
        },
        {
            "id": "android-reduce-battery",
            "question": "How to reduce battery usage in an Android application?",
            "answer": "<p><strong>🔑 Minimize wakeups, batch work, respect system power states</strong></p><ul><li><strong>Prefer WorkManager over raw wakelocks/AlarmManager</strong> for deferrable background work — it batches jobs and automatically respects Doze/App Standby constraints (<code>setRequiresCharging</code>, <code>setRequiresDeviceIdle</code>, network type constraints).</li><li><strong>Batch network requests</strong> instead of frequent small polls; use FCM push instead of polling where possible so the radio doesn't wake for nothing.</li><li><strong>Release wakelocks/sensors/GPS promptly</strong> — request the lowest-power location accuracy that satisfies the use case, and stop listeners in <code>onPause()</code>/<code>onStop()</code>.</li><li><strong>Avoid exact alarms</strong> (<code>setExactAndAllowWhileIdle</code>) unless truly necessary — they can bypass Doze batching and drain battery; prefer inexact/windowed scheduling.</li><li>Use <strong>Battery Historian</strong>/Battery Profiler to identify what's actually causing wakeups (a specific alarm, a wakelock held too long, excessive GPS polling) rather than guessing.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Optimize for battery life",
                    "url": "https://developer.android.com/topic/performance/power"
                }
            ],
            "tags": [
                "battery",
                "workmanager",
                "doze",
                "power-optimization",
                "wakelock"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Battery-friendly deferrable work with constraints",
                    "code": "val constraints = Constraints.Builder()\n    .setRequiredNetworkType(NetworkType.UNMETERED)\n    .setRequiresCharging(true)\n    .setRequiresBatteryNotLow(true)\n    .build()\n\nval syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(6, TimeUnit.HOURS)\n    .setConstraints(constraints)\n    .build()\n\nWorkManager.getInstance(context)\n    .enqueueUniquePeriodicWork(\"sync\", ExistingPeriodicWorkPolicy.KEEP, syncRequest)"
                }
            ],
            "subsection": "battery-life-optimizations"
        },
        {
            "id": "android-doze-app-standby",
            "question": "What is Doze? What about App Standby?",
            "answer": "<p><strong>🔑 Two complementary power-saving states</strong></p><ul><li><strong>Doze</strong> (Android 6+) activates when the device is stationary, unplugged, and screen-off for a while. It periodically suspends network access, defers jobs/syncs/alarms, and ignores wakelocks for the whole device, cycling through short <strong>maintenance windows</strong> where deferred work is allowed to run before going back to sleep.</li><li><strong>App Standby</strong> is per-app: apps the user hasn't interacted with recently are placed into <strong>standby buckets</strong> — <code>active</code>, <code>working_set</code>, <code>frequent</code>, <code>rare</code>, <code>restricted</code> — each capping how often that app's jobs/alarms/FCM high-priority messages may run, independent of whether the whole device is Dozing.</li><li>Both are bypassed by <strong>high-priority FCM messages</strong> and can be worked around by declaring proper <strong>WorkManager constraints</strong> instead of raw alarms/services.</li><li><strong>Whitelisting</strong> via <code>REQUEST_IGNORE_BATTERY_OPTIMIZATIONS</code> exists but is reserved for apps with a genuine always-on need (e.g. VoIP) and requires explicit user opt-in.</li></ul><p><strong>🎯 Interview tip:</strong> Doze = device-wide, triggered by inactivity + stillness; App Standby = per-app, triggered by lack of user engagement with that app. Keep the distinction crisp.</p>",
            "referenceLinks": [
                {
                    "title": "Doze and App Standby",
                    "url": "https://developer.android.com/training/monitoring-device-state/doze-standby"
                }
            ],
            "tags": [
                "doze",
                "app-standby",
                "battery",
                "background-restrictions",
                "power"
            ],
            "hasDiagram": true,
            "diagramType": "animation",
            "diagramConfig": {
                "title": "Doze mode cycle",
                "steps": [
                    "Screen off, unplugged, stationary",
                    "Device enters Doze after idle timeout",
                    "Network access and jobs suspended",
                    "Brief maintenance window opens",
                    "Deferred jobs/syncs/alarms run",
                    "Device returns to deep Doze"
                ]
            },
            "codeSnippets": [],
            "subsection": "battery-life-optimizations"
        },
        {
            "id": "android-overdraw",
            "question": "What is overdraw in Android?",
            "answer": "<p><strong>🔑 Painting the same pixel more than once per frame</strong></p><ul><li><strong>Overdraw</strong> happens when the GPU draws the same screen pixel multiple times within one frame — e.g. a solid-colored window background, under an opaque Activity background, under a card background, under a solid list-item background all stacked on top of each other.</li><li>It wastes GPU fill-rate and can cause jank, especially on lower-end devices with limited pixel throughput.</li><li><strong>Debug GPU overdraw</strong> (Developer Options) color-codes the screen: true color = no overdraw, blue/green/pink/red = increasing levels of redundant drawing.</li></ul><p><strong>✅ Fixes</strong></p><ul><li>Remove unnecessary/duplicate backgrounds (e.g. don't set a window background <em>and</em> a root layout background if only one is ever visible).</li><li>Flatten view hierarchies with <code>ConstraintLayout</code> instead of nested opaque containers.</li><li>Use <code>clipRect</code>/<code>quickReject</code> in custom <code>onDraw()</code> to skip drawing off-screen content.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Debug GPU overdraw",
                    "url": "https://developer.android.com/topic/performance/rendering/overdraw"
                }
            ],
            "tags": [
                "overdraw",
                "rendering",
                "performance",
                "gpu",
                "profiling"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "battery-life-optimizations"
        },
        {
            "id": "android-screen-resolutions",
            "question": "How do you support different types of resolutions?",
            "answer": "<p><strong>🔑 Density-independent units + qualified resources</strong></p><ul><li>Design in <strong>dp</strong> (density-independent pixels) for layout dimensions and <strong>sp</strong> for text — the system scales them per-device density automatically, so 1dp always renders as roughly the same physical size.</li><li>Provide bitmap assets in <strong>density buckets</strong>: <code>mdpi</code> (1x baseline), <code>hdpi</code> (1.5x), <code>xhdpi</code> (2x), <code>xxhdpi</code> (3x), <code>xxxhdpi</code> (4x) — the system auto-selects the closest match, or use a single <strong>vector drawable</strong> (<code>VectorDrawable</code>) to sidestep density buckets entirely for icons/simple art.</li><li>Use <strong>ConstraintLayout</strong> with relative constraints/percentage guidelines instead of fixed dp positions so layouts adapt across screen sizes.</li><li>Add configuration-qualified layout resources (<code>layout-sw600dp</code>, <code>layout-land</code>) for tablets/foldables/landscape, or better, use <strong>Window Size Classes</strong> (compact/medium/expanded) to branch layout logic responsively rather than per-device hacks.</li><li>Test with the Android Studio device previews across phone, tablet and foldable reference devices.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Support different screen sizes",
                    "url": "https://developer.android.com/training/multiscreen/screensizes"
                },
                {
                    "title": "Window size classes",
                    "url": "https://developer.android.com/develop/ui/compose/layouts/adaptive/window-size-classes"
                }
            ],
            "tags": [
                "screen-sizes",
                "density",
                "dp",
                "responsive-layout",
                "window-size-class"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "supporting-different-screen-sizes"
        },
        {
            "id": "android-permission-levels",
            "question": "What are the different protection levels in permissions?",
            "answer": "<p><strong>🔑 Four protection levels gate how a permission is granted</strong></p><table><thead><tr><th>Level</th><th>Meaning</th></tr></thead><tbody><tr><td><strong>normal</strong></td><td>Low risk (e.g. <code>INTERNET</code>); granted automatically at install, not shown to the user for approval</td></tr><tr><td><strong>dangerous</strong></td><td>Access to sensitive data/actions (camera, location, contacts); must be requested at runtime and explicitly approved by the user</td></tr><tr><td><strong>signature</strong></td><td>Granted automatically only if the requesting app is signed with the same certificate as the app that declared the permission</td></tr><tr><td><strong>signature|privileged</strong></td><td>Signature match <em>or</em> the app is installed as a privileged app in a fixed system partition — used for pre-installed/system apps</td></tr></tbody></table><ul><li><strong>Dangerous</strong> permissions are further grouped into <strong>permission groups</strong> (e.g. <code>LOCATION</code>) — granting one in a group used to auto-grant the rest, though modern Android increasingly prompts per-permission.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Permissions overview",
                    "url": "https://developer.android.com/guide/topics/permissions/overview"
                }
            ],
            "tags": [
                "permissions",
                "protection-level",
                "manifest",
                "security"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "xml",
                    "title": "Declaring a custom signature-level permission",
                    "code": "<permission\n    android:name=\"com.example.app.permission.SYNC_DATA\"\n    android:protectionLevel=\"signature\" />\n\n<uses-permission android:name=\"com.example.app.permission.SYNC_DATA\" />"
                }
            ],
            "subsection": "permissions"
        },
        {
            "id": "android-ndk",
            "question": "What is the NDK and why is it useful?",
            "answer": "<p><strong>🔑 Native Development Kit for C/C++ code on Android</strong></p><ul><li>The <strong>NDK</strong> is a toolset that lets you implement parts of an app in <strong>C/C++</strong>, compiled to native <code>.so</code> libraries, and invoke them from Kotlin/Java via <strong>JNI</strong> (Java Native Interface).</li><li><strong>Use cases</strong>: CPU-intensive work (codecs, physics, image/signal processing, game engines), reusing existing cross-platform C/C++ libraries, or squeezing out performance that the JVM/ART layer can't match.</li><li>Build integration is typically via <strong>CMake</strong> or <code>ndk-build</code>, configured in <code>build.gradle</code> (<code>externalNativeBuild</code>) and a <code>CMakeLists.txt</code> describing native sources/targets.</li></ul><p><strong>⚠️ Trade-offs</strong></p><ul><li>Native code adds build complexity, per-ABI binary size (<code>armeabi-v7a</code>, <code>arm64-v8a</code>, <code>x86_64</code>...), harder debugging, and loses ART's memory-safety guarantees (manual memory management, potential native crashes that bypass the JVM's exception model).</li><li>Should be a targeted choice for specific hot paths, not a default — most apps never need it.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Android NDK",
                    "url": "https://developer.android.com/ndk"
                }
            ],
            "tags": [
                "ndk",
                "jni",
                "native",
                "cmake",
                "c++"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Declaring and loading a JNI native method",
                    "code": "class NativeLib {\n    companion object {\n        init {\n            System.loadLibrary(\"nativelib\")\n        }\n    }\n\n    external fun stringFromJNI(): String\n}\n\n// Usage:\nval message = NativeLib().stringFromJNI()"
                }
            ],
            "subsection": "native-programming"
        },
        {
            "id": "android-renderscript",
            "question": "What is RenderScript?",
            "answer": "<p><strong>🔑 A deprecated high-performance compute framework</strong></p><ul><li><strong>RenderScript</strong> was Android's framework (introduced API 11) for running data-parallel computations — image filters, math-heavy transforms — across CPU, GPU or DSP without writing platform-specific native code, using a C99-based kernel language.</li><li>It auto-selected the best available compute device at runtime, aiming for performance portability across the fragmented Android hardware landscape.</li><li><strong>Deprecated</strong> since Android 12 (API 31) — Google now recommends <code>Vulkan</code> for GPU compute/graphics, or the <strong>NDK</strong> with libraries like <strong>RenderEffect</strong> (for view/Compose blur and visual effects) or <strong>oboe</strong>/other targeted native APIs, since RenderScript's toolchain fell behind and hardware vendor support was inconsistent.</li></ul>",
            "referenceLinks": [
                {
                    "title": "RenderScript (deprecated)",
                    "url": "https://developer.android.com/guide/topics/renderscript/compute"
                }
            ],
            "tags": [
                "renderscript",
                "gpu",
                "deprecated",
                "compute",
                "native"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "native-programming"
        },
        {
            "id": "android-runtime",
            "question": "What is Android Runtime?",
            "answer": "<p><strong>🔑 The execution environment that runs your app's compiled code</strong></p><ul><li><strong>ART (Android Runtime)</strong> is the managed runtime that executes app bytecode (<code>.dex</code>) on-device, replacing the older <strong>Dalvik</strong> runtime since Android 5.0 (Lollipop).</li><li>ART combines <strong>Ahead-Of-Time (AOT)</strong> compilation (at install/idle time, guided by Baseline Profiles), <strong>Just-In-Time (JIT)</strong> compilation (compiling hot methods at runtime), and an interpreter — a hybrid strategy that balances install time, storage, and runtime speed.</li><li>It also owns <strong>garbage collection</strong> (concurrent, generational GC tuned for low pause times) and provides improved debugging/profiling hooks (better stack traces, heap analysis) compared to Dalvik.</li><li>ART sits directly on top of the Linux kernel via the Hardware Abstraction Layer, below the Java API framework in the Android system stack.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ART and Dalvik",
                    "url": "https://source.android.com/docs/core/runtime"
                }
            ],
            "tags": [
                "art",
                "runtime",
                "dalvik",
                "jit",
                "aot"
            ],
            "hasDiagram": true,
            "diagramType": "flowchart",
            "diagramConfig": {
                "title": "Android system layer stack",
                "columns": 1,
                "nodes": [
                    {
                        "label": "Apps",
                        "type": "terminal"
                    },
                    {
                        "label": "Java API Framework"
                    },
                    {
                        "label": "ART + Native Libraries"
                    },
                    {
                        "label": "HAL (Hardware Abstraction)"
                    },
                    {
                        "label": "Linux Kernel",
                        "type": "terminal"
                    }
                ],
                "connections": [
                    {
                        "from": 0,
                        "to": 1
                    },
                    {
                        "from": 1,
                        "to": 2
                    },
                    {
                        "from": 2,
                        "to": 3
                    },
                    {
                        "from": 3,
                        "to": 4
                    }
                ]
            },
            "codeSnippets": [],
            "subsection": "android-system-internal"
        },
        {
            "id": "android-dalvik-art-jit-aot",
            "question": "What are Dalvik, ART, JIT, and AOT in Android?",
            "answer": "<p><strong>🔑 Four related pieces of the compilation/execution story</strong></p><ul><li><strong>Dalvik</strong> — Android's original runtime (pre-5.0), used a register-based VM and primarily JIT-compiled <code>.dex</code> bytecode at runtime.</li><li><strong>ART</strong> — Dalvik's successor, the current runtime, combining AOT, JIT and interpretation.</li><li><strong>JIT (Just-In-Time)</strong> — compiles bytecode to native machine code <em>while the app runs</em>, targeting methods that get called often (&quot;hot&quot; methods); fast to start, but pays a warm-up cost every run.</li><li><strong>AOT (Ahead-Of-Time)</strong> — compiles bytecode to native machine code <em>before</em> the app runs (at install time or during device idle maintenance), guided by <strong>Baseline Profiles</strong>/cloud profiles so only likely-hot code paths are pre-compiled — trading install time/storage for faster, more consistent runtime execution.</li><li>Modern ART blends both: AOT-compile profile-guided hot paths ahead of time, JIT-compile the rest as usage patterns emerge, and interpret cold code that rarely runs.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ART and Dalvik",
                    "url": "https://source.android.com/docs/core/runtime"
                }
            ],
            "tags": [
                "dalvik",
                "art",
                "jit",
                "aot",
                "compilation"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-system-internal"
        },
        {
            "id": "android-dalvik-vs-art",
            "question": "What are the differences between Dalvik and ART?",
            "answer": "<p><strong>🔑 Same bytecode, very different execution strategy</strong></p><table><thead><tr><th></th><th>Dalvik</th><th>ART</th></tr></thead><tbody><tr><td>Compilation</td><td>JIT only (compiles on every run)</td><td>AOT + JIT + interpreter hybrid</td></tr><tr><td>App install</td><td>Fast (no upfront compilation)</td><td>Slower historically (AOT at install); modern ART uses profile-guided partial AOT to reduce this</td></tr><tr><td>Runtime performance</td><td>Slower startup, ongoing JIT overhead</td><td>Faster steady-state execution, smoother after warm-up</td></tr><tr><td>Garbage collection</td><td>Single GC pass, more pauses</td><td>Improved concurrent, generational GC with shorter pauses</td></tr><tr><td>Debugging</td><td>Limited introspection</td><td>Better heap/allocation tracking, improved stack traces</td></tr><tr><td>Introduced</td><td>Original Android runtime</td><td>Android 5.0 (Lollipop), default since</td></tr></tbody></table>",
            "referenceLinks": [
                {
                    "title": "ART and Dalvik",
                    "url": "https://source.android.com/docs/core/runtime"
                }
            ],
            "tags": [
                "dalvik",
                "art",
                "runtime",
                "comparison",
                "garbage-collection"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-system-internal"
        },
        {
            "id": "android-baseline-profiles",
            "question": "What are Baseline Profiles in Android?",
            "answer": "<p><strong>🔑 A hint file telling ART what to AOT-compile up front</strong></p><ul><li>A <strong>Baseline Profile</strong> is a human-readable list of classes/methods identified as critical to your app's startup and key user-journey performance.</li><li>ART uses it to <strong>AOT-compile just those methods at install time</strong>, instead of interpreting/JIT-warming them on first use — directly reducing startup jank and improving frame timing on first runs.</li><li>Generated using the <strong>Macrobenchmark</strong> library's <code>BaselineProfileRule</code>, which runs your critical user journeys and records which code executes, then ships as a <code>baseline-prof.txt</code> bundled into the APK/AAB.</li><li>Google Play also aggregates anonymized <strong>cloud profiles</strong> from real user devices to further improve on-device compilation for apps that don't ship their own.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Baseline profiles",
                    "url": "https://developer.android.com/topic/performance/baselineprofiles/overview"
                }
            ],
            "tags": [
                "baseline-profiles",
                "art",
                "aot",
                "startup",
                "macrobenchmark"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Generating a Baseline Profile with Macrobenchmark",
                    "code": "@RunWith(AndroidJUnit4::class)\nclass BaselineProfileGenerator {\n    @get:Rule\n    val rule = BaselineProfileRule()\n\n    @Test\n    fun generate() = rule.collect(\n        packageName = \"com.example.app\"\n    ) {\n        pressHome()\n        startActivityAndWait()\n        // Simulate the critical user journey\n        device.findObject(By.text(\"Feed\")).click()\n    }\n}"
                }
            ],
            "subsection": "android-system-internal"
        },
        {
            "id": "android-dex",
            "question": "What is DEX in Android?",
            "answer": "<p><strong>🔑 The bytecode format Android runs</strong></p><ul><li><strong>DEX (Dalvik Executable)</strong> is a compact, register-based bytecode format that all compiled app code (Kotlin/Java, via <code>.class</code> files) is converted into for execution on Android.</li><li>The <strong>D8 compiler</strong> converts JVM <code>.class</code> bytecode into one or more <code>.dex</code> files during the build; <strong>R8</strong> additionally shrinks, obfuscates and optimizes on top of D8's conversion for release builds.</li><li>DEX is register-based (unlike the JVM's stack-based bytecode), which reduces instruction count and duplicate constant-pool data across classes — designed to be compact and efficient for constrained mobile hardware.</li><li>A single classic DEX file is capped at <strong>65,536 methods</strong> that can be referenced (the &quot;64K method limit&quot;), which is what makes <strong>Multidex</strong> necessary for larger apps.</li></ul>",
            "referenceLinks": [
                {
                    "title": "About the build process (D8/R8)",
                    "url": "https://developer.android.com/build"
                }
            ],
            "tags": [
                "dex",
                "bytecode",
                "d8",
                "r8",
                "compilation"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-system-internal"
        },
        {
            "id": "android-multidex",
            "question": "What is Multidex in Android?",
            "answer": "<p><strong>🔑 Splitting code across multiple DEX files past the 64K method limit</strong></p><ul><li>A single <code>.dex</code> file can reference at most <strong>65,536 methods</strong> (including framework/library methods). Apps that exceed this — common once you add several large libraries — need <strong>Multidex</strong> to split compiled code across multiple <code>classes.dex</code>, <code>classes2.dex</code>, etc.</li><li>Since <strong>minSdkVersion 21+</strong> (ART), the platform natively supports loading multiple DEX files from the APK at install time, so it's largely automatic once enabled in Gradle.</li><li>For <code>minSdkVersion &lt; 21</code> (legacy Dalvik), the app must extend <code>MultiDexApplication</code> (or call <code>MultiDex.install()</code>) so the extra DEX files are loaded manually at app startup via a custom classloader.</li><li><strong>D8</strong>'s <em>minimal main dex</em> logic automatically determines which classes must stay in the primary DEX (e.g. the <code>Application</code> class and its dependency graph) so the app can bootstrap before the rest load.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Enable multidex for apps with over 64K methods",
                    "url": "https://developer.android.com/build/multidex"
                }
            ],
            "tags": [
                "multidex",
                "dex",
                "64k-limit",
                "build"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Legacy Multidex application (minSdk < 21)",
                    "code": "class MyApplication : MultiDexApplication() {\n    override fun onCreate() {\n        super.onCreate()\n    }\n}\n\n// build.gradle.kts\n// android { defaultConfig { multiDexEnabled = true } }\n// dependencies { implementation(\"androidx.multidex:multidex:2.0.1\") }"
                }
            ],
            "subsection": "android-system-internal"
        },
        {
            "id": "android-force-gc",
            "question": "Can you manually call the Garbage Collector?",
            "answer": "<p><strong>🔑 You can suggest it, but it's not guaranteed</strong></p><ul><li><code>System.gc()</code> (or <code>Runtime.getRuntime().gc()</code>) requests that the JVM/ART run garbage collection soon — it's only a <strong>hint</strong>; the runtime is free to ignore or delay it.</li><li>ART's GC is already <strong>concurrent and generational</strong>, tuned to run automatically when needed with minimal pause times — manual calls rarely help and can actively hurt by triggering a full GC pause at an arbitrary, possibly performance-sensitive moment (e.g. mid-animation).</li><li>Calling it repeatedly can also mask a real leak instead of fixing it — the object still gets collected eventually if truly unreferenced, whether or not you called <code>System.gc()</code>.</li></ul><p><strong>✅ Better approach</strong></p><ul><li>Fix the root cause (release references promptly, use appropriately-scoped caches) and use the <strong>Memory Profiler</strong>'s manual GC trigger only as a diagnostic aid to distinguish &quot;leaked&quot; from &quot;not yet collected&quot; — never ship <code>System.gc()</code> calls in production logic.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Investigate your RAM usage",
                    "url": "https://developer.android.com/topic/performance/memory"
                }
            ],
            "tags": [
                "garbage-collection",
                "system-gc",
                "memory",
                "art"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-system-internal"
        },
        {
            "id": "android-app-starts",
            "question": "What are Cold, Warm, and Hot app starts in Android?",
            "answer": "<p><strong>🔑 Three levels of how much work startup requires</strong></p><table><thead><tr><th>Start type</th><th>Process state</th><th>Work required</th></tr></thead><tbody><tr><td><strong>Cold start</strong></td><td>App process not running</td><td>System creates the process, initializes <code>Application</code>, creates &amp; inflates the starting <code>Activity</code> — the slowest path</td></tr><tr><td><strong>Warm start</strong></td><td>Process alive, Activity destroyed (e.g. trimmed from memory) or fresh Activity launch reusing an existing process</td><td>Skips process creation but still recreates the Activity and its view hierarchy</td></tr><tr><td><strong>Hot start</strong></td><td>Process and Activity both still in memory, just backgrounded</td><td>System just brings the existing Activity to the foreground — fastest path, roughly an <code>onRestart()</code>/<code>onResume()</code> round trip</td></tr></tbody></table><ul><li><strong>Cold start</strong> is what Baseline Profiles, deferred <code>Application.onCreate()</code> work, and App Startup library initialization ordering are meant to optimize.</li></ul>",
            "referenceLinks": [
                {
                    "title": "App startup time",
                    "url": "https://developer.android.com/topic/performance/vitals/launch-time"
                }
            ],
            "tags": [
                "app-startup",
                "cold-start",
                "warm-start",
                "hot-start",
                "performance"
            ],
            "hasDiagram": true,
            "diagramType": "sequence",
            "diagramConfig": {
                "title": "Cold start sequence",
                "actors": [
                    "System",
                    "Zygote",
                    "App Process",
                    "Activity"
                ],
                "messages": [
                    {
                        "from": 0,
                        "to": 1,
                        "label": "fork request"
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "fork process"
                    },
                    {
                        "from": 2,
                        "to": 2,
                        "label": "Application.onCreate()"
                    },
                    {
                        "from": 0,
                        "to": 3,
                        "label": "create & inflate"
                    },
                    {
                        "from": 3,
                        "to": 0,
                        "label": "first frame drawn",
                        "dashed": true
                    }
                ]
            },
            "codeSnippets": [],
            "subsection": "android-system-internal"
        },
        {
            "id": "android-jetpack-overview",
            "question": "What is Android Jetpack and why use it?",
            "answer": "<p><strong>🔑 A curated set of libraries for building robust apps faster</strong></p><ul><li><strong>Jetpack</strong> is Google's collection of libraries, tools and guidance that provide backward-compatible, best-practice building blocks — decoupled from the OS release cycle, so they update independently via Gradle rather than waiting for a platform version.</li><li>Organized into four categories: <strong>Foundation</strong> (AppCompat, KTX, Multidex, Test), <strong>Architecture</strong> (ViewModel, LiveData, Room, WorkManager, Navigation, Paging, Hilt), <strong>Behavior</strong> (Notifications, Permissions, Sharing, Slices), and <strong>UI</strong> (Compose, Fragment, Animation, Emoji).</li><li>Most Architecture-category libraries are built to work together and are <strong>lifecycle-aware</strong> — they automatically respect Activity/Fragment lifecycle state to avoid leaks and crashes from updating destroyed UI.</li><li>Jetpack replaced the old <strong>Support Library</strong>, unifying everything under the <code>androidx.*</code> namespace with semantic versioning independent of the platform API level.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Android Jetpack",
                    "url": "https://developer.android.com/jetpack"
                }
            ],
            "tags": [
                "jetpack",
                "androidx",
                "architecture-components",
                "libraries"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-viewmodel",
            "question": "What is a ViewModel and how is it useful?",
            "answer": "<p><strong>🔑 A lifecycle-aware holder for UI state</strong></p><ul><li><strong>ViewModel</strong> stores and manages UI-related data so it <strong>survives configuration changes</strong> (rotation, language, multi-window resize) — the Activity/Fragment is destroyed and recreated, but the ViewModel instance is not.</li><li>It's scoped to a <code>ViewModelStoreOwner</code> (Activity, Fragment, Navigation graph destination) via <code>ViewModelProvider</code>; the framework retains the underlying <code>ViewModelStore</code> across recreation and hands back the same instance.</li><li>Encourages separation of concerns: the ViewModel exposes state (often as <code>StateFlow</code>/<code>LiveData</code>) and handles business logic/use-case calls; the View layer just observes and renders, and forwards user events back.</li><li><code>onCleared()</code> is called when the ViewModel is permanently going away (Activity finishing, Fragment's view destroyed with no further reuse) — the place to cancel <code>viewModelScope</code> coroutines or release resources.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ViewModel overview",
                    "url": "https://developer.android.com/topic/libraries/architecture/viewmodel"
                }
            ],
            "tags": [
                "viewmodel",
                "architecture",
                "lifecycle",
                "mvvm",
                "state"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "A basic ViewModel with StateFlow",
                    "code": "class ProfileViewModel(private val repo: UserRepository) : ViewModel() {\n\n    private val _uiState = MutableStateFlow(ProfileUiState.Loading)\n    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()\n\n    init {\n        viewModelScope.launch {\n            _uiState.value = ProfileUiState.Success(repo.getUser())\n        }\n    }\n\n    override fun onCleared() {\n        super.onCleared()\n        // viewModelScope is cancelled automatically here\n    }\n}"
                }
            ],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-shared-viewmodel",
            "question": "What is SharedViewModel in Android?",
            "answer": "<p><strong>🔑 A ViewModel scoped above a single Fragment for cross-Fragment communication</strong></p><ul><li>A <strong>SharedViewModel</strong> isn't a distinct API — it's the pattern of scoping a regular <code>ViewModel</code> to the host <strong>Activity</strong> (or a shared <strong>Navigation graph</strong>) instead of an individual Fragment, so multiple Fragments obtain the <em>same instance</em>.</li><li>Common use: a list Fragment and a detail Fragment both need the selected item — they observe the same ViewModel instead of communicating via target fragments, interfaces, or a global event bus.</li><li>Fragments opt in via <code>by activityViewModels()</code> (Activity scope) or <code>by navGraphViewModels(R.id.nav_graph)</code> (scoped to a Navigation subgraph, so it's cleared when that subgraph is popped).</li></ul>",
            "referenceLinks": [
                {
                    "title": "Share data between fragments",
                    "url": "https://developer.android.com/guide/fragments/communicate"
                }
            ],
            "tags": [
                "shared-viewmodel",
                "viewmodel",
                "fragments",
                "navigation"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Sharing a ViewModel between Fragments",
                    "code": "class ListFragment : Fragment() {\n    private val sharedViewModel: SelectionViewModel by activityViewModels()\n\n    fun onItemClicked(item: Item) {\n        sharedViewModel.select(item)\n    }\n}\n\nclass DetailFragment : Fragment() {\n    private val sharedViewModel: SelectionViewModel by activityViewModels()\n\n    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {\n        viewLifecycleOwner.lifecycleScope.launch {\n            sharedViewModel.selected.collect { item -> render(item) }\n        }\n    }\n}"
                }
            ],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-architecture-components",
            "question": "What are Android Architecture Components?",
            "answer": "<p><strong>🔑 The Jetpack subset for building robust, testable app architecture</strong></p><ul><li><strong>ViewModel</strong> — retains UI state across configuration changes.</li><li><strong>LiveData</strong> (and increasingly <code>StateFlow</code>/<code>SharedFlow</code>) — observable, lifecycle-aware data holders.</li><li><strong>Room</strong> — SQLite ORM with compile-time query verification.</li><li><strong>WorkManager</strong> — guaranteed, constraint-aware deferrable background work.</li><li><strong>Navigation</strong> — declarative in-app navigation graph, back stack and argument-safe transitions (Safe Args).</li><li><strong>Paging</strong> — loads and displays large datasets in chunks from local/remote sources.</li><li><strong>Hilt</strong> — dependency injection built on Dagger, tailored to Android component lifecycles.</li><li><strong>DataBinding</strong> — binds UI components in layouts directly to app data sources declaratively.</li></ul><p>Together they encourage a layered, unidirectional-data-flow architecture: UI observes ViewModel state; ViewModel calls into a Repository; Repository coordinates Room/network/WorkManager.</p>",
            "referenceLinks": [
                {
                    "title": "Guide to app architecture",
                    "url": "https://developer.android.com/topic/architecture"
                }
            ],
            "tags": [
                "architecture-components",
                "jetpack",
                "mvvm",
                "room",
                "workmanager"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-stateflow-vs-livedata",
            "question": "What is the difference between StateFlow and LiveData?",
            "answer": "<p><strong>🔑 Kotlin-native hot flow vs Android lifecycle-aware holder</strong></p><table><thead><tr><th></th><th>LiveData</th><th>StateFlow</th></tr></thead><tbody><tr><td>Origin</td><td>Android Jetpack (androidx)</td><td>Kotlin coroutines (kotlinx.coroutines), platform-agnostic</td></tr><tr><td>Lifecycle awareness</td><td>Built-in — auto pauses/resumes delivery with <code>STARTED</code> state</td><td>None built-in — needs <code>repeatOnLifecycle(STARTED)</code> when collecting from UI to avoid work while backgrounded</td></tr><tr><td>Initial value</td><td>Optional</td><td>Required (always has a current value)</td></tr><tr><td>Thread</td><td>Must be updated with <code>postValue()</code>/<code>setValue()</code></td><td>Thread-safe <code>.value</code> assignment; usable from any coroutine</td></tr><tr><td>Operators</td><td>Limited (<code>Transformations.map/switchMap</code>)</td><td>Full Flow operator set (<code>map</code>, <code>combine</code>, <code>debounce</code>, ...)</td></tr><tr><td>Testability</td><td>Requires <code>InstantTaskExecutorRule</code></td><td>Plain Kotlin, easily tested with <code>Turbine</code>/coroutine test APIs</td></tr></tbody></table><ul><li>Google's current guidance: use <strong>StateFlow</strong> (or <code>SharedFlow</code> for one-off events) in new Kotlin-first codebases, exposing <code>LiveData</code> only at Java-interop boundaries via <code>asLiveData()</code>.</li></ul>",
            "referenceLinks": [
                {
                    "title": "StateFlow and SharedFlow",
                    "url": "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow"
                }
            ],
            "tags": [
                "stateflow",
                "livedata",
                "flow",
                "coroutines",
                "comparison"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-livedata",
            "question": "What is LiveData in Android?",
            "answer": "<p><strong>🔑 An observable, lifecycle-aware data holder</strong></p><ul><li><strong>LiveData&lt;T&gt;</strong> wraps a value and notifies registered <code>Observer</code>s when it changes — but only while the observing <code>LifecycleOwner</code> is in the <code>STARTED</code> or <code>RESUMED</code> state, automatically avoiding updates to a destroyed/backgrounded UI.</li><li>Observers are automatically removed when their <code>Lifecycle</code> is destroyed (<code>observe(viewLifecycleOwner, observer)</code>), which prevents the classic memory-leak/crash pattern of updating a dead View.</li><li>It's <strong>lossy for the latest value only</strong> — a backgrounded observer that resumes gets the most recent value, not every intermediate emission (unlike a cold <code>Flow</code> or event bus).</li><li><code>MutableLiveData</code> is the writable subtype; classes typically expose only the read-only <code>LiveData</code> supertype publicly (encapsulation) while mutating a private <code>MutableLiveData</code> internally.</li></ul>",
            "referenceLinks": [
                {
                    "title": "LiveData overview",
                    "url": "https://developer.android.com/topic/libraries/architecture/livedata"
                }
            ],
            "tags": [
                "livedata",
                "observer",
                "lifecycle",
                "architecture"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-livedata-vs-observablefield",
            "question": "How is LiveData different from ObservableField?",
            "answer": "<p><strong>🔑 Lifecycle-aware stream vs plain Data Binding primitive</strong></p><table><thead><tr><th></th><th>LiveData</th><th>ObservableField</th></tr></thead><tbody><tr><td>Source</td><td>Architecture Components (lifecycle library)</td><td>Data Binding library</td></tr><tr><td>Lifecycle awareness</td><td>Yes — respects observer's <code>STARTED</code>/<code>RESUMED</code> state</td><td>No — fires on every set regardless of UI state</td></tr><tr><td>Typical consumer</td><td>ViewModel exposing state to Activity/Fragment code, or XML via data binding</td><td>Primarily XML data-binding expressions (<code>@={}</code>)</td></tr><tr><td>Type support</td><td>Any type <code>T</code></td><td>Generic <code>ObservableField&lt;T&gt;</code> plus primitive variants (<code>ObservableInt</code>, etc.) to avoid boxing</td></tr><tr><td>Testability</td><td>Straightforward with lifecycle test rules</td><td>Less common outside Data Binding contexts</td></tr></tbody></table><ul><li>In modern codebases <code>ObservableField</code> is largely superseded by <code>LiveData</code>/<code>StateFlow</code> combined with Data Binding's <code>LiveData</code> support, since it gives lifecycle safety that <code>ObservableField</code> lacks.</li></ul>",
            "referenceLinks": [
                {
                    "title": "LiveData overview",
                    "url": "https://developer.android.com/topic/libraries/architecture/livedata"
                }
            ],
            "tags": [
                "livedata",
                "observablefield",
                "data-binding",
                "comparison"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-setvalue-vs-postvalue",
            "question": "What is the difference between setValue and postValue in LiveData?",
            "answer": "<p><strong>🔑 Which thread you're calling from decides which to use</strong></p><ul><li><strong><code>setValue(T)</code></strong> — must be called from the <strong>main thread</strong>. Updates the value and dispatches to active observers synchronously/immediately.</li><li><strong><code>postValue(T)</code></strong> — safe to call from a <strong>background thread</strong>. Posts a task to the main thread to set the value; if called multiple times before the main thread processes the post, <strong>only the last value wins</strong> — intermediate values are dropped/coalesced.</li><li>Calling <code>setValue()</code> off the main thread throws <code>IllegalStateException</code>; that's the practical trigger for reaching for <code>postValue()</code>.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>Mixing both on the same LiveData from different threads without care can create subtle race conditions since <code>postValue()</code>'s dispatch isn't instantaneous — a subsequent <code>setValue()</code> on the main thread could be overwritten by a pending posted value, or vice versa.</li></ul>",
            "referenceLinks": [
                {
                    "title": "MutableLiveData",
                    "url": "https://developer.android.com/reference/androidx/lifecycle/MutableLiveData"
                }
            ],
            "tags": [
                "livedata",
                "setvalue",
                "postvalue",
                "threading"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "setValue vs postValue",
                    "code": "class CounterViewModel : ViewModel() {\n    private val _count = MutableLiveData(0)\n    val count: LiveData<Int> = _count\n\n    fun incrementFromUi() {\n        _count.value = (_count.value ?: 0) + 1 // main thread: setValue\n    }\n\n    fun incrementFromBackground() {\n        Thread {\n            _count.postValue((_count.value ?: 0) + 1) // background thread\n        }.start()\n    }\n}"
                }
            ],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-share-viewmodel-fragments",
            "question": "How do you share ViewModel between Fragments?",
            "answer": "<p><strong>🔑 Scope the ViewModel to a common owner</strong></p><ul><li>Use the <strong>hosting Activity</strong> as the <code>ViewModelStoreOwner</code>: each Fragment requests the ViewModel with <code>by activityViewModels()</code> instead of <code>by viewModels()</code> — both Fragments then get the exact same instance, since it's keyed to the Activity's store, not each Fragment's own.</li><li>For Navigation-Component apps, prefer <strong>navGraphViewModels(graphId)</strong> to scope sharing to a specific subgraph — narrower lifetime than the whole Activity, cleared when that subgraph is popped off the back stack, avoiding state leaking into unrelated flows.</li><li>Communication then flows one way: Fragment A calls a method on the shared ViewModel to update state; Fragment B observes that state (<code>StateFlow</code>/<code>LiveData</code>) and reacts — no direct Fragment-to-Fragment references needed.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Share data between fragments",
                    "url": "https://developer.android.com/guide/fragments/communicate"
                }
            ],
            "tags": [
                "viewmodel",
                "fragments",
                "activityviewmodels",
                "navigation"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-workmanager-explain",
            "question": "Explain WorkManager and its use cases.",
            "answer": "<p><strong>🔑 Guaranteed, constraint-aware deferrable background work</strong></p><ul><li><strong>WorkManager</strong> schedules background work that should run even if the app exits or the device restarts — it picks the best available backend (<code>JobScheduler</code> on API 23+, <code>AlarmManager</code> + <code>BroadcastReceiver</code> on older APIs) transparently.</li><li>Work is defined as a <code>Worker</code>/<code>CoroutineWorker</code> and enqueued as a <code>OneTimeWorkRequest</code> or <code>PeriodicWorkRequest</code>, optionally with <strong>constraints</strong> (network type, charging, battery not low, storage not low) and a <strong>backoff policy</strong> for retries.</li><li>Supports <strong>chaining</strong> (<code>beginWith().then()</code>) to build multi-step work graphs with inputs/outputs passed between steps, and <strong>unique work</strong> (<code>enqueueUniqueWork</code>) to prevent duplicate scheduling.</li><li><strong>Use cases</strong>: syncing data periodically, uploading logs/analytics, image compression after capture, periodic cache cleanup — anything that must eventually complete but doesn't need to happen this exact instant.</li><li><strong>Not for</strong> immediate, user-visible work (use a foreground service or just run it directly) or precise-timing needs (use <code>AlarmManager</code>'s exact alarms).</li></ul>",
            "referenceLinks": [
                {
                    "title": "WorkManager overview",
                    "url": "https://developer.android.com/topic/libraries/architecture/workmanager"
                }
            ],
            "tags": [
                "workmanager",
                "background-work",
                "jobscheduler",
                "constraints"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Chained one-time work with constraints",
                    "code": "class CompressWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {\n    override suspend fun doWork(): Result {\n        return try {\n            compressPendingImages()\n            Result.success()\n        } catch (e: IOException) {\n            Result.retry()\n        }\n    }\n}\n\nval compress = OneTimeWorkRequestBuilder<CompressWorker>().build()\nval upload = OneTimeWorkRequestBuilder<UploadWorker>()\n    .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())\n    .build()\n\nWorkManager.getInstance(context).beginWith(compress).then(upload).enqueue()"
                }
            ],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-workmanager-repeat-interval",
            "question": "What is the minimum repeat interval for PeriodicWorkRequest?",
            "answer": "<p><strong>🔑 15 minutes, enforced by the platform</strong></p><ul><li>The minimum interval for a <code>PeriodicWorkRequest</code> is <strong>15 minutes</strong> (<code>PeriodicWorkRequest.MIN_PERIODIC_INTERVAL_MILLIS</code>) — requesting anything shorter is silently clamped up to 15 minutes by WorkManager.</li><li>This mirrors the underlying <code>JobScheduler</code>'s own minimum periodic interval, which exists to protect battery life by preventing apps from waking the device too frequently.</li><li>An optional <strong>flex interval</strong> can be set (must also be ≥ some minimum, and ≤ the repeat interval) to let the system choose the most battery-efficient moment within the trailing window of each period, rather than firing at an exact instant.</li><li>For anything needing sub-15-minute cadence, WorkManager is the wrong tool — that's a case for a foreground service or push-triggered work instead.</li></ul>",
            "referenceLinks": [
                {
                    "title": "PeriodicWorkRequest",
                    "url": "https://developer.android.com/reference/androidx/work/PeriodicWorkRequest"
                }
            ],
            "tags": [
                "workmanager",
                "periodicworkrequest",
                "background-work",
                "scheduling"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Minimum-interval periodic work",
                    "code": "val periodicSync = PeriodicWorkRequestBuilder<SyncWorker>(\n    15, TimeUnit.MINUTES // minimum allowed repeat interval\n).build()\n\nWorkManager.getInstance(context)\n    .enqueueUniquePeriodicWork(\"periodic_sync\", ExistingPeriodicWorkPolicy.UPDATE, periodicSync)"
                }
            ],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-workmanager-guarantee-execution",
            "question": "How does WorkManager guarantee task execution?",
            "answer": "<p><strong>🔑 A persisted work graph plus a resilient scheduling backend</strong></p><ul><li>Every enqueued <code>WorkRequest</code> is written to WorkManager's internal <strong>Room database</strong> immediately, so the work definition survives app process death and even device reboot — nothing lives only in memory.</li><li>WorkManager delegates actual scheduling to the best available OS mechanism: <strong>JobScheduler</strong> on API 23+, a combination of <strong>AlarmManager + BroadcastReceiver + a wake lock</strong> on older APIs — abstracted behind an internal <code>Scheduler</code> interface so callers don't care which backend is active.</li><li>A <strong>boot-completed BroadcastReceiver</strong> (<code>RescheduleReceiver</code>) reschedules any pending work after device reboot, since OS-level schedulers forget everything on restart.</li><li>Failed work is retried according to the configured <strong>backoff policy</strong> (linear or exponential) up to <code>Worker.Result.retry()</code> semantics; work with unmet constraints simply waits until constraints are satisfied rather than failing.</li><li>All of this is coordinated through <code>WorkManager</code>'s own <code>GreedyScheduler</code>/<code>CommandHandler</code> pipeline, which observes the Room-backed work state and reacts to constraint and execution changes.</li></ul>",
            "referenceLinks": [
                {
                    "title": "How WorkManager schedules tasks",
                    "url": "https://developer.android.com/topic/libraries/architecture/workmanager/how-workmanager-schedules-tasks"
                }
            ],
            "tags": [
                "workmanager",
                "reliability",
                "jobscheduler",
                "room",
                "background-work"
            ],
            "hasDiagram": true,
            "diagramType": "flowchart",
            "diagramConfig": {
                "title": "WorkManager execution path",
                "columns": 2,
                "nodes": [
                    {
                        "label": "enqueue(WorkRequest)",
                        "type": "terminal"
                    },
                    {
                        "label": "Persisted to Room DB"
                    },
                    {
                        "label": "Constraints met?",
                        "type": "decision"
                    },
                    {
                        "label": "Scheduler picks backend"
                    },
                    {
                        "label": "JobScheduler / AlarmManager"
                    },
                    {
                        "label": "Worker.doWork() runs",
                        "type": "terminal"
                    }
                ],
                "connections": [
                    {
                        "from": 0,
                        "to": 1
                    },
                    {
                        "from": 1,
                        "to": 2
                    },
                    {
                        "from": 2,
                        "to": 3,
                        "label": "yes"
                    },
                    {
                        "from": 3,
                        "to": 4
                    },
                    {
                        "from": 4,
                        "to": 5
                    }
                ]
            },
            "codeSnippets": [],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-viewmodel-internals",
            "question": "How does ViewModel work internally?",
            "answer": "<p><strong>🔑 Retained via a store that survives Activity recreation</strong></p><ul><li>Each <code>ViewModelStoreOwner</code> (Activity/Fragment) holds a <strong>ViewModelStore</strong> — essentially a <code>HashMap&lt;String, ViewModel&gt;</code> keyed by a generated key (class name + optional key).</li><li>On a <strong>configuration change</strong>, the Activity is destroyed and recreated, but the framework retains the <code>ViewModelStore</code> instance across that recreation via <code>onRetainNonConfigurationInstance()</code>/<code>NonConfigurationInstances</code> internally — so the new Activity instance's <code>ViewModelProvider</code> looks up the same store and finds the already-constructed ViewModel instead of creating a new one.</li><li>A <strong>ViewModelProvider.Factory</strong> is responsible for instantiating a ViewModel the first time it's requested (needed whenever the constructor takes arguments, e.g. a repository or <code>SavedStateHandle</code>); subsequent requests just return the cached instance from the store.</li><li>When the owner is <strong>finally</strong> going away — Activity finishing (not just rotating), or Fragment being permanently removed — <code>ViewModelStore.clear()</code> is called, which invokes <code>onCleared()</code> on every ViewModel it holds, cancelling their <code>viewModelScope</code>.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ViewModel overview",
                    "url": "https://developer.android.com/topic/libraries/architecture/viewmodel"
                }
            ],
            "tags": [
                "viewmodel",
                "internals",
                "viewmodelstore",
                "configuration-changes"
            ],
            "hasDiagram": true,
            "diagramType": "sequence",
            "diagramConfig": {
                "title": "ViewModel survives rotation",
                "actors": [
                    "Activity(old)",
                    "ViewModelStore",
                    "Activity(new)"
                ],
                "messages": [
                    {
                        "from": 0,
                        "to": 1,
                        "label": "get(key)"
                    },
                    {
                        "from": 1,
                        "to": 0,
                        "label": "ViewModel instance"
                    },
                    {
                        "from": 0,
                        "to": 0,
                        "label": "rotation: destroy"
                    },
                    {
                        "from": 2,
                        "to": 1,
                        "label": "get(key)"
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "same instance",
                        "dashed": true
                    }
                ]
            },
            "codeSnippets": [],
            "subsection": "android-jetpack"
        },
        {
            "id": "android-serializable-vs-parcelable",
            "question": "What is the difference between Serializable and Parcelable?",
            "answer": "<p><strong>🔑 Two ways to pass objects across process/Bundle boundaries</strong></p><table><thead><tr><th></th><th>Serializable</th><th>Parcelable</th></tr></thead><tbody><tr><td>Origin</td><td>Standard Java interface</td><td>Android-specific interface</td></tr><tr><td>Mechanism</td><td>Reflection-based; marker interface, JVM figures out fields at runtime</td><td>Explicit <code>writeToParcel()</code>/<code>createFromParcel()</code> — developer (or <code>@Parcelize</code>) defines exactly what's written</td></tr><tr><td>Performance</td><td>Slower — reflection overhead, creates lots of temporary objects, triggers GC</td><td>Much faster — no reflection, designed specifically for Android's IPC</td></tr><tr><td>Boilerplate</td><td>None (just implement the marker interface)</td><td>More manual code, though <strong><code>@Parcelize</code></strong> (Kotlin Android extensions) generates it automatically</td></tr></tbody></table><ul><li><strong>Recommendation</strong>: use <code>Parcelable</code> (with <code>@Parcelize</code>) for anything passed through an Android <code>Bundle</code>/<code>Intent</code> — it's the platform-native, performance-appropriate choice; reserve <code>Serializable</code> for genuine Java interop or disk/network serialization outside Android's IPC path.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Parcelable",
                    "url": "https://developer.android.com/reference/android/os/Parcelable"
                },
                {
                    "title": "Parcelize",
                    "url": "https://developer.android.com/kotlin/parcelize"
                }
            ],
            "tags": [
                "parcelable",
                "serializable",
                "bundle",
                "intent",
                "comparison"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Parcelable via @Parcelize",
                    "code": "@Parcelize\ndata class UserProfile(\n    val id: Long,\n    val name: String,\n    val avatarUrl: String?\n) : Parcelable\n\n// Passing it:\nintent.putExtra(\"profile\", userProfile)\nval profile = intent.getParcelableExtra<UserProfile>(\"profile\")"
                }
            ],
            "subsection": "others"
        },
        {
            "id": "android-bundle-vs-map",
            "question": "Why is Bundle used for data passing instead of a simple Map?",
            "answer": "<p><strong>🔑 Bundle is built for cross-process transport, Map isn't</strong></p><ul><li><strong>Bundle</strong> is backed by a <code>Parcel</code> internally, so it can be efficiently serialized and sent across process boundaries — required when data crosses an <code>Activity</code>/<code>Service</code> that may live in a different process, or when the OS itself persists it (e.g. <code>onSaveInstanceState</code>, written by the system server on your behalf).</li><li>A plain <code>HashMap&lt;String, Any&gt;</code> has no defined serialization contract for arbitrary value types — the OS has no generic way to marshal it across a Binder transaction or write it to disk for state restoration.</li><li><strong>Type-safe, key-based getters</strong> (<code>getString()</code>, <code>getInt()</code>, <code>getParcelable()</code>) avoid unchecked casts and give clearer failure behavior (default values) versus a raw <code>Map</code> that requires manual casting.</li><li>Bundle's lazy unparceling means values are only deserialized when actually read, which is more efficient than eagerly deserializing an entire Map up front.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Bundle",
                    "url": "https://developer.android.com/reference/android/os/Bundle"
                }
            ],
            "tags": [
                "bundle",
                "parcel",
                "intent",
                "ipc"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "others"
        },
        {
            "id": "android-troubleshoot-crash",
            "question": "How do you troubleshoot a crashing application?",
            "answer": "<p><strong>🔑 Reproduce, isolate, and read the evidence the system already gives you</strong></p><ul><li><strong>Logcat stack trace</strong> — the exception type, message, and call stack usually point directly at the failing line; check for a chained &quot;Caused by&quot; for the root exception, not just the outermost wrapper.</li><li><strong>Crash reporting</strong> (Firebase Crashlytics, Play Console's Android vitals) aggregates crashes from real users with device/OS breakdowns, letting you prioritize by frequency and impact rather than guessing.</li><li><strong>ANRs</strong> (App Not Responding) need a different lens — pull the <strong>ANR trace</strong> (<code>/data/anr/traces.txt</code> or via Play Console) to see which thread was blocked and on what; usually main-thread I/O, a deadlock, or a long-running synchronous call.</li><li><strong>StrictMode</strong> during development flags disk/network access on the main thread and leaked <code>Closeable</code>s before they become production crashes.</li><li><strong>Breakpoints/conditional breakpoints</strong> and the Android Studio debugger for reproducible local crashes; for hard-to-reproduce ones, add structured logging around the suspect area and ship a build to catch it in the wild.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Read and write logs with Logcat",
                    "url": "https://developer.android.com/studio/debug/logcat"
                },
                {
                    "title": "Firebase Crashlytics",
                    "url": "https://firebase.google.com/docs/crashlytics"
                }
            ],
            "tags": [
                "crash",
                "debugging",
                "logcat",
                "anr",
                "crashlytics"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "others"
        },
        {
            "id": "android-push-notifications",
            "question": "How does the Android push notification system work?",
            "answer": "<p><strong>🔑 A persistent connection from Google Play services delivers messages to your app</strong></p><ul><li>The app registers with <strong>Firebase Cloud Messaging (FCM)</strong> and receives a unique <strong>registration token</strong> identifying that app install on that device; the app sends this token to its own backend server.</li><li>Your backend sends a message (with the target token, or a topic) to <strong>FCM's servers</strong>; FCM routes it to the correct device over a long-lived, battery-efficient connection maintained by <strong>Google Play services</strong> — the same connection handles messages for every app on the device, so individual apps don't each hold a socket open.</li><li>On the device, the message arrives at your app's <code>FirebaseMessagingService.onMessageReceived()</code> (for data/foreground messages) or is handled automatically by the system tray (for notification-only messages while the app is backgrounded).</li><li>Your code builds and posts the visible notification via <code>NotificationCompat.Builder</code> + <code>NotificationManagerCompat.notify()</code>, targeting a <strong>notification channel</strong> (required since Android 8/API 26) that controls importance/sound/vibration at the OS level.</li><li>High-priority FCM messages can wake the device even from Doze, which is why push is preferred over polling for anything time-sensitive.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Firebase Cloud Messaging",
                    "url": "https://firebase.google.com/docs/cloud-messaging"
                }
            ],
            "tags": [
                "push-notifications",
                "fcm",
                "notifications",
                "background"
            ],
            "hasDiagram": true,
            "diagramType": "sequence",
            "diagramConfig": {
                "title": "FCM push notification flow",
                "actors": [
                    "App Server",
                    "FCM",
                    "Device",
                    "App"
                ],
                "messages": [
                    {
                        "from": 2,
                        "to": 1,
                        "label": "register token"
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "token",
                        "dashed": true
                    },
                    {
                        "from": 2,
                        "to": 0,
                        "label": "send token"
                    },
                    {
                        "from": 0,
                        "to": 1,
                        "label": "send message"
                    },
                    {
                        "from": 1,
                        "to": 3,
                        "label": "deliver message"
                    }
                ]
            },
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Handling an FCM message and posting a notification",
                    "code": "class MyFirebaseService : FirebaseMessagingService() {\n    override fun onMessageReceived(message: RemoteMessage) {\n        val title = message.notification?.title ?: return\n        val body = message.notification?.body.orEmpty()\n\n        val notification = NotificationCompat.Builder(this, \"default_channel\")\n            .setContentTitle(title)\n            .setContentText(body)\n            .setSmallIcon(R.drawable.ic_notification)\n            .build()\n\n        NotificationManagerCompat.from(this).notify(1, notification)\n    }\n}"
                }
            ],
            "subsection": "others"
        },
        {
            "id": "android-aapt",
            "question": "What is AAPT?",
            "answer": "<p><strong>🔑 The Android Asset Packaging Tool</strong></p><ul><li><strong>AAPT</strong> (and its successor <strong>AAPT2</strong>) compiles and packages an app's resources — layouts, drawables, strings, manifest — into the binary format Android runs, and generates the <code>R.java</code> class with integer IDs mapping to each resource.</li><li>It produces <code>resources.arsc</code>, the compiled binary resource table bundled in the APK, and compiles XML resources into a compact binary XML format rather than shipping raw text XML.</li><li><strong>AAPT2</strong> (default since Android Gradle Plugin 3.0) splits compilation into two phases — <em>compile</em> (per-file, incremental) and <em>link</em> (merges everything, resolves references) — enabling much faster incremental builds than the original single-pass AAPT.</li><li>It also performs resource validation at build time, catching malformed XML or missing resource references before runtime.</li></ul>",
            "referenceLinks": [
                {
                    "title": "AAPT2",
                    "url": "https://developer.android.com/tools/aapt2"
                }
            ],
            "tags": [
                "aapt",
                "aapt2",
                "build-tools",
                "resources"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "others"
        },
        {
            "id": "android-flatbuffers-vs-json",
            "question": "What is the difference between FlatBuffers and JSON?",
            "answer": "<p><strong>🔑 Binary, zero-copy schema-based format vs plain text</strong></p><table><thead><tr><th></th><th>JSON</th><th>FlatBuffers</th></tr></thead><tbody><tr><td>Format</td><td>Human-readable text</td><td>Compact binary</td></tr><tr><td>Parsing</td><td>Must fully parse/deserialize into objects before use</td><td><strong>Zero-copy</strong> access — read fields directly from the binary buffer without unpacking into objects first</td></tr><tr><td>Schema</td><td>None (implicit, loosely typed)</td><td>Explicit <code>.fbs</code> schema, strongly typed, compiled to generated accessor code</td></tr><tr><td>Size/speed</td><td>Larger payload, slower parse</td><td>Smaller payload, much faster access — designed for performance-critical paths (game engines, high-frequency IPC)</td></tr><tr><td>Human debugging</td><td>Easy to read/edit directly</td><td>Opaque binary, needs tooling to inspect</td></tr></tbody></table><ul><li><strong>When to use FlatBuffers</strong>: latency-sensitive paths (game state, high-frequency sensor data, large structured payloads parsed repeatedly). <strong>When to use JSON</strong>: typical REST APIs, config, anything prioritizing interoperability and debuggability over raw parse speed.</li></ul>",
            "referenceLinks": [
                {
                    "title": "FlatBuffers",
                    "url": "https://flatbuffers.dev/"
                }
            ],
            "tags": [
                "flatbuffers",
                "json",
                "serialization",
                "comparison",
                "performance"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "others"
        },
        {
            "id": "android-hashmap-arraymap-sparsearray",
            "question": "What are the differences between HashMap, ArrayMap, and SparseArray?",
            "answer": "<p><strong>🔑 Trade lookup speed for memory depending on collection size and key type</strong></p><table><thead><tr><th></th><th>HashMap</th><th>ArrayMap</th><th>SparseArray</th></tr></thead><tbody><tr><td>Structure</td><td>Hash table with buckets</td><td>Two parallel arrays (hashes + key/value pairs), binary search</td><td>Two parallel primitive arrays (int keys), binary search</td></tr><tr><td>Key type</td><td>Any object</td><td>Any object</td><td>Primitive <code>int</code> only — no autoboxing</td></tr><tr><td>Memory</td><td>Higher overhead (bucket array + Entry objects per pair)</td><td>Lower overhead for small/medium maps</td><td>Lowest — no boxed Integer keys, no Entry objects</td></tr><tr><td>Lookup</td><td>O(1) average</td><td>O(log n) binary search</td><td>O(log n) binary search</td></tr><tr><td>Best for</td><td>Large maps, general-purpose use</td><td>Small-to-medium maps (roughly &lt;1000 entries) with object keys</td><td>Small-to-medium maps keyed by <code>int</code> (e.g. view IDs)</td></tr></tbody></table><ul><li><strong>ArrayMap</strong> and <strong>SparseArray</strong> (from <code>androidx.collection</code>) exist specifically because <code>HashMap</code>'s per-entry object overhead is wasteful for the small collections common in Android UI code.</li></ul>",
            "referenceLinks": [
                {
                    "title": "ArrayMap",
                    "url": "https://developer.android.com/reference/androidx/collection/ArrayMap"
                },
                {
                    "title": "SparseArray",
                    "url": "https://developer.android.com/reference/android/util/SparseArray"
                }
            ],
            "tags": [
                "hashmap",
                "arraymap",
                "sparsearray",
                "collections",
                "memory"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "SparseArray avoiding Integer boxing",
                    "code": "val viewCache = SparseArray<View>()\n\nfun bindView(viewType: Int, view: View) {\n    viewCache.put(viewType, view) // int key, no autoboxing to Integer\n}\n\nval cached: View? = viewCache.get(viewType)"
                }
            ],
            "subsection": "others"
        },
        {
            "id": "android-sparsearray-advantages",
            "question": "What are the advantages of SparseArray in Android?",
            "answer": "<p><strong>🔑 Memory-efficient mapping for primitive int keys</strong></p><ul><li><strong>No autoboxing</strong> — keys are stored as a primitive <code>int[]</code> instead of boxed <code>Integer</code> objects, eliminating both the per-key object allocation and its GC pressure.</li><li><strong>No Map.Entry objects</strong> — values live in a plain parallel array rather than wrapper Entry instances that <code>HashMap</code> allocates per pair, reducing memory overhead further.</li><li><strong>Good fit for typical Android use</strong> — most in-app maps (view-type caches, adapter position maps) are small, so <code>SparseArray</code>'s O(log n) binary-search lookup cost is negligible while the memory savings are real.</li><li>Variants exist for other primitive combinations: <code>SparseBooleanArray</code>, <code>SparseIntArray</code>, <code>SparseLongArray</code>, <code>LongSparseArray</code> — each avoiding boxing on both sides where applicable.</li></ul><p><strong>⚠️ Trade-off</strong></p><ul><li>Not a drop-in replacement for very large collections — <code>HashMap</code>'s O(1) average lookup wins once you have thousands of entries, since binary search's log n factor starts to matter.</li></ul>",
            "referenceLinks": [
                {
                    "title": "SparseArray",
                    "url": "https://developer.android.com/reference/android/util/SparseArray"
                }
            ],
            "tags": [
                "sparsearray",
                "memory",
                "performance",
                "collections"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "others"
        },
        {
            "id": "android-annotations",
            "question": "What are Annotations in Android?",
            "answer": "<p><strong>🔑 Metadata attached to code, read by the compiler, tools, or at runtime</strong></p><ul><li><strong>Annotations</strong> attach metadata to classes, methods, fields or parameters without changing their runtime behavior directly — consumers (compiler, lint, annotation processors, or reflection at runtime) act on that metadata.</li><li><strong>Compile-time/lint annotations</strong> — <code>@NonNull</code>/<code>@Nullable</code> (nullability contracts checked by lint/Kotlin interop), <code>@Override</code> (compiler-enforced override check), <code>@IntDef</code>/<code>@StringDef</code> (restrict a parameter to a closed set of constants, like a lightweight enum).</li><li><strong>Jetpack annotations</strong> (<code>androidx.annotation</code>) — <code>@ColorInt</code>, <code>@Px</code>, <code>@RequiresApi</code>, <code>@VisibleForTesting</code> — encode intent that lint statically verifies.</li><li><strong>Processor-driven annotations</strong> — Room's <code>@Entity</code>/<code>@Dao</code>, Hilt's <code>@Inject</code>/<code>@Module</code>, Moshi's <code>@JsonClass</code> — read by an annotation processor (KAPT/KSP) at build time to generate boilerplate code.</li><li><strong>Runtime-retained annotations</strong> are read via reflection at runtime (less common on Android for performance reasons, since reflection is comparatively slow).</li></ul>",
            "referenceLinks": [
                {
                    "title": "Annotations overview",
                    "url": "https://developer.android.com/studio/write/annotations"
                }
            ],
            "tags": [
                "annotations",
                "androidx",
                "kapt",
                "ksp",
                "lint"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "others"
        },
        {
            "id": "android-custom-annotation",
            "question": "How to create a custom Annotation?",
            "answer": "<p><strong>🔑 Define with @interface, control visibility with @Retention</strong></p><ul><li>Declare it with Kotlin's <code>annotation class</code> (or Java's <code>@interface</code>), and specify a <strong><code>@Retention</code></strong> policy that determines how long the annotation metadata is kept: <code>SOURCE</code> (discarded after compilation, e.g. for lint-only checks), <code>BINARY</code> (kept in the <code>.class</code>/<code>.dex</code> but not visible via reflection), or <code>RUNTIME</code> (available via reflection at runtime).</li><li>Use <strong><code>@Target</code></strong> to restrict where it can be applied (class, function, field, parameter, etc.), preventing misuse.</li><li>For restricting a parameter to a fixed set of int/string constants (an enum alternative with zero runtime overhead), use <code>@IntDef</code>/<code>@StringDef</code> instead of a full custom annotation.</li><li>Custom annotations become genuinely useful once paired with an <strong>annotation processor</strong> (KSP) that scans for them at compile time and generates code — that's how Room, Hilt, and Moshi's codegen work under the hood.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Annotations overview",
                    "url": "https://developer.android.com/studio/write/annotations"
                },
                {
                    "title": "Kotlin annotations",
                    "url": "https://kotlinlang.org/docs/annotations.html"
                }
            ],
            "tags": [
                "annotations",
                "custom-annotation",
                "retention",
                "ksp"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Defining and applying a custom annotation",
                    "code": "@Target(AnnotationTarget.FUNCTION)\n@Retention(AnnotationRetention.RUNTIME)\nannotation class Loggable(val tag: String = \"App\")\n\nclass AnalyticsService {\n    @Loggable(tag = \"Analytics\")\n    fun trackEvent(name: String) {\n        // ...\n    }\n}"
                }
            ],
            "subsection": "others"
        },
        {
            "id": "android-support-library",
            "question": "What is the Android Support Library? Why was it introduced?",
            "answer": "<p><strong>🔑 The predecessor to Jetpack/AndroidX</strong></p><ul><li>The <strong>Support Library</strong> (introduced 2011) shipped backward-compatible implementations of newer platform APIs and additional UI/utility components — e.g. <code>RecyclerView</code>, <code>Fragment</code>, <code>AppCompatActivity</code> — as a library apps could bundle, so features could work on older API levels without waiting for OS-level backporting.</li><li>It was introduced because Android's fragmentation problem was severe: a new platform feature was useless to most users until adoption of that OS version caught up (which could take years), so Google needed a way to ship forward-compatible code that ran on older devices too.</li><li>By 2018, its package/versioning scheme (<code>android.support.*</code>, versions tied loosely to platform API levels) had become confusing and hard to evolve independently — Google replaced it with <strong>AndroidX</strong> (<code>androidx.*</code>), which uses clean semantic versioning fully decoupled from the OS release cycle. The migration tool was called <strong>Jetifier</strong>.</li><li>All new Support Library development stopped after the AndroidX migration — any project still on <code>android.support.*</code> today is on an unmaintained dead end.</li></ul>",
            "referenceLinks": [
                {
                    "title": "AndroidX overview",
                    "url": "https://developer.android.com/jetpack/androidx"
                }
            ],
            "tags": [
                "support-library",
                "androidx",
                "jetifier",
                "backward-compatibility"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": "others"
        },
        {
            "id": "android-data-binding",
            "question": "What is Android Data Binding?",
            "answer": "<p><strong>🔑 Declaratively bind UI components in layouts to app data</strong></p><ul><li>The <strong>Data Binding Library</strong> lets layout XML reference data objects/expressions directly (<code>@{viewModel.username}</code>), generating a typed <strong>Binding class</strong> (e.g. <code>ActivityMainBinding</code>) at compile time that replaces manual <code>findViewById()</code> calls with typed field references.</li><li>Supports <strong>one-way binding</strong> (<code>@{}</code> — data flows into the view) and <strong>two-way binding</strong> (<code>@={}</code> — view changes, like text input, flow back to update the bound property, common for form fields).</li><li>Commonly paired with <strong>LiveData</strong>/<code>ObservableField</code>: set the binding's <code>lifecycleOwner</code> and the layout auto-refreshes whenever the observed value changes, with no manual observer wiring in the Activity/Fragment.</li><li>Layouts can also declare <strong>Binding Adapters</strong> (<code>@BindingAdapter</code>) — custom XML attributes that map to arbitrary setter logic (e.g. loading an image URL into an <code>ImageView</code> directly from a layout attribute).</li></ul><p><strong>⚖️ vs Compose</strong></p><ul><li>Data Binding is the XML-era declarative-UI answer; <strong>Jetpack Compose</strong> has since become Google's preferred direction for new declarative UI, with Data Binding remaining relevant mainly for existing View-based codebases.</li></ul>",
            "referenceLinks": [
                {
                    "title": "Data Binding Library",
                    "url": "https://developer.android.com/topic/libraries/data-binding"
                }
            ],
            "tags": [
                "data-binding",
                "xml",
                "livedata",
                "two-way-binding"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "xml",
                    "title": "Two-way data binding in a layout",
                    "code": "<layout xmlns:android=\"http://schemas.android.com/apk/res/android\">\n    <data>\n        <variable name=\"viewModel\" type=\"com.example.LoginViewModel\" />\n    </data>\n    <EditText\n        android:layout_width=\"match_parent\"\n        android:layout_height=\"wrap_content\"\n        android:text=\"@={viewModel.username}\" />\n</layout>"
                }
            ],
            "subsection": "others"
        }
    ]
};
