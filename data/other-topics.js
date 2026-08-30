const otherTopicsData = {
    "id": "other-topics",
    "title": "Other Topics",
    "subsections": null,
    "keyTopics": [
        "SQLite",
        "Room Database",
        "User Identification",
        "Best Practices",
        "React Native vs Flutter",
        "Performance Metrics",
        "API Key Security",
        "Kotlin Multiplatform",
        "Memory Heap Dumps",
        "Dark Theme Implementation",
        "Cleartext Traffic",
        "Annotation Processing",
        "Push Notifications (FCM)",
        "Local Notifications"
    ],
    "questions": [
        {
            "referenceLinks": [
                {
                    "title": "Save data using SQLite",
                    "url": "https://developer.android.com/training/data-storage/sqlite"
                }
            ],
            "tags": [
                "sqlite",
                "database",
                "storage",
                "room"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "describe-sqlite",
            "question": "Describe SQLite.",
            "answer": "<p><strong>🔑 What it is</strong></p><ul><li><strong>SQLite</strong> is a lightweight, serverless, transactional <strong>relational database engine</strong> embedded directly in the app process — the whole database is a single file on disk, with no separate server process.</li><li>Android ships SQLite in the platform and exposes it via <code>SQLiteOpenHelper</code>/<code>SQLiteDatabase</code> at the low level, though most modern apps use <strong>Room</strong> as a type-safe abstraction on top of it.</li></ul><p><strong>⚙️ Key characteristics</strong></p><ul><li>Supports standard SQL — tables, indices, joins, transactions (<code>ACID</code>-compliant), triggers.</li><li><strong>Dynamically typed</strong> columns (type affinity rather than strict typing) — a notable difference from most server RDBMSs.</li><li>Single-writer, multiple-reader concurrency model by default; <code>WAL</code> (write-ahead logging) mode improves concurrent read/write performance.</li></ul><p><strong>✅ When to use</strong></p><ul><li>Structured, relational, queryable local data — offline caching, complex queries with joins/aggregation. For simple key-value data prefer <code>DataStore</code> instead.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Room documentation",
                    "url": "https://developer.android.com/training/data-storage/room"
                }
            ],
            "tags": [
                "room",
                "sqlite",
                "database",
                "dao",
                "orm"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Minimal Room setup",
                    "code": "@Entity\ndata class User(@PrimaryKey val id: String, val name: String)\n\n@Dao\ninterface UserDao {\n    @Query(\"SELECT * FROM User\")\n    fun observeAll(): Flow<List<User>>\n\n    @Insert(onConflict = OnConflictStrategy.REPLACE)\n    suspend fun insert(user: User)\n}\n\n@Database(entities = [User::class], version = 1)\nabstract class AppDatabase : RoomDatabase() {\n    abstract fun userDao(): UserDao\n}"
                }
            ],
            "subsection": null,
            "id": "have-you-used-room",
            "question": "Have you used Room?",
            "answer": "<p><strong>🔑 What Room is</strong></p><ul><li><strong>Room</strong> is Jetpack's persistence library — an abstraction layer over SQLite that gives compile-time verified SQL, less boilerplate, and first-class coroutines/Flow support.</li></ul><p><strong>⚙️ Core pieces</strong></p><ul><li><code>@Entity</code> — a table, mapped from a data class.</li><li><code>@Dao</code> — an interface of query methods (<code>@Query</code>, <code>@Insert</code>, <code>@Update</code>, <code>@Delete</code>), which Room implements at compile time via annotation processing (KSP).</li><li><code>@Database</code> — the <code>RoomDatabase</code> subclass tying entities and DAOs together, with a schema <code>version</code> and <code>Migration</code>s for upgrades.</li><li>DAO methods can return <code>suspend</code> functions for one-shot reads/writes or <code>Flow&lt;T&gt;</code> for observable, auto-updating queries.</li></ul><p><strong>✅ Why prefer it over raw SQLite</strong></p><ul><li>Compile-time SQL validation (typos and column mismatches fail the build, not at runtime), no manual <code>Cursor</code> handling, built-in migration testing support.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "FCM error codes",
                    "url": "https://firebase.google.com/docs/cloud-messaging/manage-tokens"
                }
            ],
            "tags": [
                "fcm",
                "analytics",
                "uninstall-tracking",
                "push-notifications"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "identify-users-uninstalled-app",
            "question": "Can we identify users who have uninstalled our application?",
            "answer": "<p><strong>🔑 Not directly, but indirectly via analytics</strong></p><ul><li>Android provides no system broadcast for \"app was uninstalled\" that the app itself can receive (it's gone by then), so detection is always <strong>inferred</strong>, not observed directly.</li></ul><p><strong>⚙️ Common approaches</strong></p><ul><li><strong>Silent/data push notifications</strong>: periodically send a silent FCM message; if delivery consistently fails (<code>NotRegistered</code> error from FCM) it strongly suggests the app/token is gone (uninstalled or token invalidated).</li><li><strong>Analytics SDKs</strong> (Firebase Analytics, Adjust, AppsFlyer) track \"last seen\" timestamps and infer churn/uninstall when a device stops checking in for a configured window, sometimes combined with FCM token invalidation signals.</li><li>These are all <strong>heuristics</strong> — none give a real-time, guaranteed uninstall event; Google Play doesn't expose per-user uninstall events to developers either, only aggregate install/uninstall counts in the Play Console.</li></ul><p><strong>🎯 Interview tip:</strong> Lead with \"there's no direct API\" — that's the fact interviewers are checking for — then describe the FCM-token-invalidation heuristic as the standard workaround.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "App architecture guide",
                    "url": "https://developer.android.com/topic/architecture"
                }
            ],
            "tags": [
                "best-practices",
                "architecture",
                "mvvm",
                "coroutines",
                "testing"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "android-development-best-practices",
            "question": "What are Android Development Best Practices?",
            "answer": "<p><strong>🔑 Architecture</strong></p><ul><li>Follow a layered <strong>MVVM</strong>/<strong>MVI</strong> architecture with a clear UI–domain–data separation, single-activity + Compose/Navigation, and unidirectional data flow.</li></ul><p><strong>⚙️ Code quality</strong></p><ul><li>Use <strong>coroutines/Flow</strong> for async work instead of callbacks; scope coroutines to <code>viewModelScope</code>/<code>lifecycleScope</code> to avoid leaks.</li><li>Favor <strong>immutability</strong> (<code>val</code>, immutable data classes) for predictable state and Compose stability.</li><li>Use dependency injection (Hilt) to keep classes testable and decoupled.</li></ul><p><strong>⚠️ Robustness</strong></p><ul><li>Handle configuration changes and process death via <code>ViewModel</code> + <code>SavedStateHandle</code>; never store non-serializable state as the only copy.</li><li>Respect background execution limits (<code>WorkManager</code> for deferrable background work instead of raw services).</li><li>Write unit tests for ViewModels/use-cases and UI tests for critical flows; enable strict mode / lint in CI.</li><li>Follow Material Design and accessibility guidelines (content descriptions, touch target sizes, dynamic type).</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "React Native",
                    "url": "https://reactnative.dev/"
                },
                {
                    "title": "Flutter architectural overview",
                    "url": "https://docs.flutter.dev/resources/architectural-overview"
                }
            ],
            "tags": [
                "react-native",
                "flutter",
                "cross-platform",
                "comparison"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "react-native-vs-flutter",
            "question": "React Native vs Flutter",
            "answer": "<p><strong>🔑 Two cross-platform approaches</strong></p><ul><li><strong>React Native</strong> renders using the platform's <strong>native widgets</strong> via a JS bridge/JSI, using JavaScript/TypeScript and React's component model.</li><li><strong>Flutter</strong> ships its own rendering engine (<strong>Skia</strong>/Impeller) and draws every pixel itself using <strong>Dart</strong>, achieving pixel-identical UI across platforms.</li></ul><table><thead><tr><th>Aspect</th><th>React Native</th><th>Flutter</th></tr></thead><tbody><tr><td>Language</td><td>JavaScript/TypeScript</td><td>Dart</td></tr><tr><td>Rendering</td><td>Native platform widgets (via bridge/JSI)</td><td>Own rendering engine (Skia/Impeller)</td></tr><tr><td>UI consistency</td><td>Can differ slightly per platform</td><td>Pixel-identical across platforms</td></tr><tr><td>Performance</td><td>Bridge overhead (mitigated by JSI/Fabric)</td><td>Compiled to native ARM code, generally faster UI</td></tr><tr><td>Ecosystem</td><td>Huge (leans on JS/npm ecosystem)</td><td>Large and growing, Google-backed</td></tr><tr><td>Backed by</td><td>Meta</td><td>Google</td></tr></tbody></table><p><strong>🎯 Interview tip:</strong> If asked which is \"better,\" answer with trade-offs, not a winner — team's existing JS vs Dart skillset is usually the deciding factor in practice.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Android Vitals",
                    "url": "https://developer.android.com/topic/performance/vitals"
                }
            ],
            "tags": [
                "performance",
                "metrics",
                "anr",
                "jank",
                "vitals"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "app-performance-metrics",
            "question": "What are the metrics to measure continuously during Android development?",
            "answer": "<p><strong>🔑 Categories to track</strong></p><ul><li><strong>Startup</strong>: cold/warm/hot start time (Play Console vitals, <code>androidx.metrics</code>), time-to-first-frame.</li><li><strong>Rendering</strong>: frame rate / <strong>jank</strong> (dropped frames &gt;16ms at 60fps), measured with <code>FrameMetrics</code>/systrace/Perfetto and Play Console's slow-rendering vitals.</li><li><strong>Stability</strong>: crash-free sessions/users rate, ANR (Application Not Responding) rate.</li><li><strong>Memory</strong>: heap usage trend, OOM crash rate, memory leaks (LeakCanary in debug builds).</li></ul><p><strong>⚙️ Other important signals</strong></p><ul><li><strong>Network</strong>: request latency, error/timeout rate, payload sizes.</li><li><strong>Battery/data</strong>: excessive wakeups, background data usage (Battery Historian, App Standby Buckets).</li><li><strong>Build/app size</strong>: APK/AAB size, method count, since size affects install conversion.</li><li><strong>Business/product</strong>: retention, crash-adjacent funnel drop-off, though these sit alongside — not instead of — the technical metrics above.</li></ul><p><strong>🎯 Interview tip:</strong> Mention <strong>Android Vitals</strong> in the Play Console by name — it's the concrete tool Google itself uses to grade these metrics against thresholds.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Secrets Gradle Plugin",
                    "url": "https://developers.google.com/maps/documentation/android-sdk/secrets-gradle-plugin"
                }
            ],
            "tags": [
                "security",
                "api-keys",
                "vcs",
                "gradle",
                "secrets"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Reading a key from local.properties (gitignored)",
                    "code": "val localProperties = java.util.Properties().apply {\n    load(rootProject.file(\"local.properties\").inputStream())\n}\n\nandroid {\n    defaultConfig {\n        buildConfigField(\n            \"String\", \"API_KEY\",\n            \"\\\"${localProperties.getProperty(\"API_KEY\")}\\\"\"\n        )\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "avoid-api-keys-in-vcs",
            "question": "How to avoid API keys from check-in into VCS?",
            "answer": "<p><strong>🔑 Keep secrets out of tracked source</strong></p><ul><li>Store keys in a file <strong>excluded via <code>.gitignore</code></strong> (e.g. <code>local.properties</code>, a <code>secrets.properties</code> file) and read them at build time in <code>build.gradle.kts</code> via <code>Properties()</code>, injecting into <code>BuildConfig</code> or <code>manifestPlaceholders</code>.</li><li>Use the <strong>Secrets Gradle Plugin</strong> (<code>com.google.android.libraries.mapsplatform.secrets-gradle-plugin</code>) which formalizes exactly this pattern for API keys like Maps.</li></ul><p><strong>⚙️ Beyond local dev</strong></p><ul><li>In CI, inject secrets as <strong>environment variables / encrypted secrets</strong> (GitHub Actions secrets, GitLab CI variables) rather than committing them anywhere.</li><li>Enable <strong>secret-scanning</strong> pre-commit hooks (e.g. <code>gitleaks</code>, <code>git-secrets</code>) to catch accidental commits before they land.</li><li>If a key is ever committed, treat it as <strong>compromised</strong> — rotate it; removing it from a later commit does not remove it from git history.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Kotlin Multiplatform",
                    "url": "https://kotlinlang.org/docs/multiplatform.html"
                }
            ],
            "tags": [
                "kotlin-multiplatform",
                "kmp",
                "expect-actual",
                "cross-platform"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "kotlin-multiplatform",
            "question": "How does Kotlin Multiplatform work?",
            "answer": "<p><strong>🔑 Share logic, not UI</strong></p><ul><li><strong>Kotlin Multiplatform (KMP)</strong> lets you write shared business logic (networking, data, use cases) once in Kotlin and compile it to multiple targets — JVM/Android, iOS (via Kotlin/Native), JS/Wasm, desktop — while UI typically stays platform-native (Compose Multiplatform is the exception, sharing UI too).</li></ul><p><strong>⚙️ How it's structured</strong></p><ul><li><strong>commonMain</strong> — platform-agnostic code, using only APIs available everywhere or abstracted via <code>expect</code> declarations.</li><li><strong>expect/actual</strong> — <code>commonMain</code> declares an <code>expect</code> function/class; each platform source set (<code>androidMain</code>, <code>iosMain</code>) provides an <code>actual</code> implementation using platform-specific APIs.</li><li>The Kotlin/Native compiler produces an iOS framework consumable from Swift/Objective-C; the JVM/Android target compiles normally to bytecode.</li></ul><p><strong>✅ Typical use</strong></p><ul><li>Share networking (Ktor client), serialization (kotlinx.serialization), and domain/business logic between Android and iOS apps while keeping each platform's native UI.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "View memory usage with Memory Profiler",
                    "url": "https://developer.android.com/studio/profile/memory-profiler"
                },
                {
                    "title": "LeakCanary",
                    "url": "https://square.github.io/leakcanary/"
                }
            ],
            "tags": [
                "memory",
                "heap-dump",
                "leakcanary",
                "profiling",
                "memory-leak"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "memory-heap-dumps",
            "question": "How to use Memory Heap Dumps data?",
            "answer": "<p><strong>🔑 What a heap dump is</strong></p><ul><li>A <strong>heap dump</strong> is a snapshot of every object on the Java/Kotlin heap at a point in time — object types, field values, and, crucially, the <strong>reference chain</strong> (who is holding a reference to whom).</li></ul><p><strong>⚙️ How to capture and read one</strong></p><ul><li>Capture via <strong>Android Studio Profiler</strong> (Memory Profiler → \"Dump Java heap\") or programmatically with <code>Debug.dumpHprofData(path)</code>; convert with <code>hprof-conv</code> if needed for other tools.</li><li>Analyze in <strong>Android Studio's Memory Profiler</strong> view or <strong>Eclipse MAT</strong> — look at the <strong>Dominator Tree</strong> / <strong>retained size</strong> to find which objects hold the most memory, and the <strong>path to GC Root</strong> to find why an object isn't being collected.</li><li><strong>LeakCanary</strong> automates this in debug builds — it dumps the heap when an <code>Activity</code>/<code>Fragment</code> isn't garbage-collected after it should be destroyed, and prints the leak trace (reference chain) directly in a notification.</li></ul><p><strong>✅ What to look for</strong></p><ul><li>Static references to <code>Context</code>/<code>Activity</code>, un-unregistered listeners/callbacks, and long-lived singletons holding UI references are the classic leak patterns a heap dump reveals.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Dark theme",
                    "url": "https://developer.android.com/develop/ui/views/theming/darktheme"
                }
            ],
            "tags": [
                "dark-theme",
                "theming",
                "material-design",
                "compose"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Compose theme switching on system setting",
                    "code": "@Composable\nfun AppTheme(\n    darkTheme: Boolean = isSystemInDarkTheme(),\n    content: @Composable () -> Unit\n) {\n    val colorScheme = if (darkTheme) darkColorScheme() else lightColorScheme()\n    MaterialTheme(colorScheme = colorScheme, content = content)\n}"
                }
            ],
            "subsection": null,
            "id": "implement-dark-theme",
            "question": "How to implement Dark Theme in your app?",
            "answer": "<p><strong>🔑 Prefer the system-driven approach</strong></p><ul><li>Define both a <strong>light</strong> and <strong>dark</strong> color scheme; Android automatically selects the right one at runtime based on the system's <strong>Force Dark</strong> / theme setting when your theme extends a <code>DayNight</code> base (Views) or you branch on <code>isSystemInDarkTheme()</code> (Compose).</li></ul><p><strong>⚙️ Views (XML) approach</strong></p><ul><li>Provide <code>res/values/colors.xml</code> and <code>res/values-night/colors.xml</code> (same names, different values); theme resources resolve automatically per configuration.</li><li>Set <code>AppCompatDelegate.setDefaultNightMode(...)</code> to force light/dark/system if the app offers an in-app toggle.</li></ul><p><strong>⚙️ Compose approach</strong></p><ul><li>Define <code>lightColorScheme()</code> and <code>darkColorScheme()</code> (Material 3), and pick one in your app's <code>Theme</code> composable based on <code>isSystemInDarkTheme()</code> or a user preference stored in <code>DataStore</code>.</li><li>On Android 12+, <code>dynamicLightColorScheme</code>/<code>dynamicDarkColorScheme</code> can derive Material You colors from the user's wallpaper.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Play Integrity API",
                    "url": "https://developer.android.com/google/play/integrity"
                }
            ],
            "tags": [
                "security",
                "api-keys",
                "ndk",
                "obfuscation",
                "backend-proxy"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "secure-api-keys-android",
            "question": "How to secure API keys used in an Android App?",
            "answer": "<p><strong>🔑 There's no perfectly secure client-side storage</strong></p><ul><li>Any key shipped inside an APK/AAB can eventually be extracted by a determined attacker (decompilation, memory dumping) — the goal is to <strong>raise the bar</strong>, not achieve perfect secrecy.</li></ul><p><strong>⚙️ Practical mitigations</strong></p><ul><li>Keep keys out of source control (see <code>local.properties</code>/Secrets Gradle Plugin) and out of plain <code>strings.xml</code>.</li><li>Store sensitive keys in <strong>native code (NDK/JNI)</strong> obfuscated as byte arrays rather than plain Kotlin strings — harder (not impossible) to grep out of a decompiled APK.</li><li>Use <strong>ProGuard/R8</strong> to obfuscate identifiers and strip unused code, and enable resource shrinking.</li><li><strong>Best option where possible</strong>: don't ship the secret at all — proxy sensitive calls through your own backend, which holds the real key server-side, and authenticate the app-to-backend call instead (e.g. with a short-lived token, Play Integrity API, or certificate pinning).</li><li>Restrict keys server-side by <strong>package name + SHA-1 signing certificate</strong> (e.g. Google Cloud API key restrictions) so a leaked key is far less useful outside your app.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Network security configuration",
                    "url": "https://developer.android.com/privacy-and-security/security-config"
                }
            ],
            "tags": [
                "cleartext-traffic",
                "security",
                "https",
                "network-security-config"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "xml",
                    "title": "Allowing cleartext only for a dev domain",
                    "code": "<network-security-config>\n    <domain-config cleartextTrafficPermitted=\"true\">\n        <domain includeSubdomains=\"true\">10.0.2.2</domain>\n    </domain-config>\n    <base-config cleartextTrafficPermitted=\"false\" />\n</network-security-config>"
                }
            ],
            "subsection": null,
            "id": "cleartext-traffic",
            "question": "What is Cleartext traffic?",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><strong>Cleartext traffic</strong> is any network communication sent <strong>unencrypted</strong> — plain HTTP instead of HTTPS/TLS — meaning the data is readable and tamperable by anyone on the network path (Wi-Fi eavesdroppers, ISPs, MITM proxies).</li></ul><p><strong>⚙️ Android's stance</strong></p><ul><li>Since <strong>Android 9 (API 28)</strong>, apps targeting API 28+ have <code>usesCleartextTraffic = false</code> by default — plain HTTP requests are <strong>blocked</strong> unless explicitly allowed.</li><li>Controlled via the <strong>Network Security Config</strong> (<code>res/xml/network_security_config.xml</code>), which can allow cleartext for specific domains (e.g. a local dev server) instead of the whole app.</li></ul><p><strong>⚠️ Best practice</strong></p><ul><li>Always use HTTPS in production; only whitelist cleartext narrowly for local/debug endpoints, and never disable the protection app-wide for a release build.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Overview of memory management",
                    "url": "https://developer.android.com/topic/performance/memory-overview"
                }
            ],
            "tags": [
                "memory",
                "garbage-collection",
                "leaks",
                "performance"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "memory-usage-android",
            "question": "Tell something about memory usage in Android.",
            "answer": "<p><strong>🔑 Managed heap with per-app limits</strong></p><ul><li>Each app runs in its own process with a <strong>Dalvik/ART managed heap</strong> whose maximum size is device- and manifest-dependent (<code>android:largeHeap</code> can request more, but relying on it is a smell).</li><li>ART performs <strong>garbage collection</strong> automatically; excessive allocation churn (e.g. boxing primitives, allocating in <code>onDraw</code>/hot loops) causes frequent GC pauses and jank.</li></ul><p><strong>⚙️ Common sources of pressure/leaks</strong></p><ul><li><strong>Static references</strong> to <code>Activity</code>/<code>View</code>/<code>Context</code>, unregistered listeners, inner (non-static) classes/anonymous classes capturing an outer <code>Activity</code>, long-lived caches without eviction.</li><li><strong>Bitmaps</strong> are typically the largest single consumer — decode at the target size (<code>inSampleSize</code>), use image-loading libraries (Coil/Glide) that pool and recycle appropriately.</li></ul><p><strong>✅ Tools to diagnose</strong></p><ul><li><strong>Memory Profiler</strong> in Android Studio for live tracking, <strong>heap dumps</strong> for leak analysis, <strong>LeakCanary</strong> for automated leak detection in debug builds, <code>onTrimMemory()</code> to release caches under system memory pressure.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Kotlin Symbol Processing (KSP)",
                    "url": "https://kotlinlang.org/docs/ksp-overview.html"
                }
            ],
            "tags": [
                "annotation-processing",
                "ksp",
                "kapt",
                "codegen",
                "room",
                "hilt"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [],
            "subsection": null,
            "id": "annotation-processing",
            "question": "Explain Annotation processing.",
            "answer": "<p><strong>🔑 Definition</strong></p><ul><li><strong>Annotation processing</strong> is a compile-time mechanism where a processor reads annotations (<code>@Entity</code>, <code>@Inject</code>, <code>@AutoValue</code>, etc.) in source code and <strong>generates additional code</strong> (Java/Kotlin source, bytecode) before/during compilation — no runtime reflection needed.</li></ul><p><strong>⚙️ APT vs KSP</strong></p><ul><li><strong>APT</strong> (<code>kapt</code>) processes the Java stub representation of Kotlin code — works, but requires generating an intermediate Java stub, which is slower and Kotlin-feature-lossy.</li><li><strong>KSP (Kotlin Symbol Processing)</strong> reads Kotlin code directly via a Kotlin-native compiler API — significantly faster (commonly 2x) and understands Kotlin-specific constructs (e.g. <code>data class</code>, nullability) natively. Room, Hilt, Moshi all offer KSP processors now.</li></ul><p><strong>✅ Common Android users</strong></p><ul><li><strong>Room</strong> (generates DAO implementations), <strong>Hilt/Dagger</strong> (generates dependency graphs), <strong>Moshi/kotlinx.serialization</strong> codegen adapters.</li></ul><p><strong>🎯 Interview tip:</strong> If asked to modernize a build, \"replace kapt with KSP\" is a concrete, correct answer that shows current knowledge.</p>"
        },
        {
            "referenceLinks": [
                {
                    "title": "About FCM messages",
                    "url": "https://firebase.google.com/docs/cloud-messaging/concept-options"
                }
            ],
            "tags": [
                "push-notifications",
                "fcm",
                "notifications"
            ],
            "hasDiagram": true,
            "diagramType": "sequence",
            "diagramConfig": {
                "title": "Push notification delivery",
                "actors": [
                    "App Server",
                    "FCM",
                    "Device"
                ],
                "messages": [
                    {
                        "from": 0,
                        "to": 1,
                        "label": "Send message"
                    },
                    {
                        "from": 1,
                        "to": 2,
                        "label": "Deliver to device"
                    },
                    {
                        "from": 2,
                        "to": 1,
                        "label": "Ack",
                        "dashed": true
                    }
                ]
            },
            "codeSnippets": [],
            "subsection": null,
            "id": "android-push-notification-system",
            "question": "How does the Android Push Notification system work?",
            "answer": "<p><strong>🔑 High-level flow</strong></p><ul><li>The app registers with a push provider (Firebase Cloud Messaging) and receives a unique <strong>registration token</strong> identifying that app install on that device.</li><li>The app sends this token to the <strong>app server</strong>, which stores it against the user.</li><li>When the server wants to notify the user, it sends a message to <strong>FCM's backend</strong>, addressed by token (or topic), which routes it to the device over a persistent connection.</li><li>On the device, the OS delivers the message to the app's <code>FirebaseMessagingService</code> (if the app process is running or can be woken), which decides whether to show a system notification or handle data silently.</li></ul><p><strong>⚙️ Message types</strong></p><ul><li><strong>Notification messages</strong> — displayed automatically by the system tray when the app is backgrounded.</li><li><strong>Data messages</strong> — always delivered to app code (<code>onMessageReceived</code>), letting the app decide what to do, even build a custom notification.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Set up an Android FCM client app",
                    "url": "https://firebase.google.com/docs/cloud-messaging/android/client"
                }
            ],
            "tags": [
                "fcm",
                "push-notifications",
                "firebase",
                "notifications"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Handling FCM messages",
                    "code": "class MyFirebaseMessagingService : FirebaseMessagingService() {\n\n    override fun onMessageReceived(message: RemoteMessage) {\n        val title = message.notification?.title ?: message.data[\"title\"]\n        val body = message.notification?.body ?: message.data[\"body\"]\n        showNotification(title, body)\n    }\n\n    override fun onNewToken(token: String) {\n        // Send the refreshed token to your backend\n        backend.registerToken(token)\n    }\n}"
                }
            ],
            "subsection": null,
            "id": "fcm-push-notification-flow",
            "question": "Android Push Notification Flow using FCM",
            "answer": "<p><strong>🔑 Step-by-step flow</strong></p><ul><li>Add <code>google-services.json</code> and the FCM SDK; on app start, <code>FirebaseMessaging.getInstance().token</code> generates/retrieves the device's registration token.</li><li>Send that token to your backend (usually alongside a user ID) so it knows where to deliver messages for that user/device.</li><li>Backend calls the <strong>FCM HTTP v1 API</strong> (via a service-account-authenticated request, or the Admin SDK) with the target token/topic and the payload.</li><li>FCM delivers the message to the device; a <code>FirebaseMessagingService</code> subclass overrides <code>onMessageReceived(RemoteMessage)</code> to handle it — build and post a <code>Notification</code> via <code>NotificationManager</code> for data messages, or let the system auto-display notification-type messages while backgrounded.</li><li>Override <code>onNewToken(token)</code> to handle token refresh/rotation and re-sync with the backend.</li></ul><p><strong>⚠️ Pitfall</strong></p><ul><li>On Android 13+, posting notifications requires the runtime <code>POST_NOTIFICATIONS</code> permission — must be requested explicitly or notifications silently won't show.</li></ul>"
        },
        {
            "referenceLinks": [
                {
                    "title": "Schedule exact alarms",
                    "url": "https://developer.android.com/develop/background-work/services/alarms/schedule"
                }
            ],
            "tags": [
                "notifications",
                "alarmmanager",
                "scheduling",
                "local-notification"
            ],
            "hasDiagram": false,
            "diagramType": null,
            "diagramConfig": null,
            "codeSnippets": [
                {
                    "language": "kotlin",
                    "title": "Scheduling an exact alarm for a local notification",
                    "code": "val alarmManager = context.getSystemService(AlarmManager::class.java)\nval intent = Intent(context, ReminderReceiver::class.java)\nval pendingIntent = PendingIntent.getBroadcast(\n    context, requestCode, intent,\n    PendingIntent.FLAG_IMMUTABLE\n)\n\nif (alarmManager.canScheduleExactAlarms()) {\n    alarmManager.setExactAndAllowWhileIdle(\n        AlarmManager.RTC_WAKEUP,\n        triggerAtMillis,\n        pendingIntent\n    )\n}"
                }
            ],
            "subsection": null,
            "id": "local-notification-exact-time",
            "question": "How to show local Notification at an exact time?",
            "answer": "<p><strong>🔑 AlarmManager for exact timing</strong></p><ul><li><strong>Local (non-push) scheduled notifications</strong> use <code>AlarmManager</code>, not FCM/WorkManager (WorkManager is for deferrable background work, not guaranteed exact-time firing).</li><li>Use <code>AlarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)</code> to fire at a precise time even in <strong>Doze mode</strong>.</li><li>The <code>PendingIntent</code> triggers a <code>BroadcastReceiver</code> which builds and posts the actual <code>Notification</code> via <code>NotificationManagerCompat.notify()</code>.</li></ul><p><strong>⚠️ Pitfalls / platform restrictions</strong></p><ul><li>Since <strong>Android 12 (API 31)</strong>, scheduling <em>exact</em> alarms requires the <code>SCHEDULE_EXACT_ALARM</code> permission (Android 13+ it's user-toggleable in Settings); check <code>AlarmManager.canScheduleExactAlarms()</code> first and fall back to inexact scheduling if denied.</li><li>Alarms don't survive a device reboot — re-register them on <code>BOOT_COMPLETED</code> if persistence across reboot is required.</li><li>On Android 13+, also request <code>POST_NOTIFICATIONS</code> at runtime or the notification silently won't display.</li></ul>"
        }
    ]
};
