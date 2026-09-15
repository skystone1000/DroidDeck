/* ==========================================================================
   M12 — Platform architecture and app anatomy.

   The first module of the platform track, and the one that makes the rest of
   it cohere. Almost every Android rule that looks arbitrary — why state dies,
   why a Context leaks, why a Service is not a thread — follows from one fact:
   an app is a Linux process the system is free to kill.
   ========================================================================== */

const platformArchitectureModule = {
    id: 'platform-architecture',
    trackId: 'platform',
    order: 12,
    title: 'Platform Architecture and App Anatomy',
    tagline: 'An app is a Linux process the system may kill at any moment.',
    estimatedMinutes: 30,
    prerequisites: ['jvm-foundations'],
    docHub: {
        title: 'Application fundamentals',
        path: '/guide/components/fundamentals'
    },

    chapters: [
        {
            id: 'platform-stack',
            title: 'The stack and the process model',
            importance: 'must-know',
            summary: 'A Linux kernel under a userspace stack, and one forked, sandboxed process per app.',
            interviewAngle: 'Zygote is a favourite question, but the answer worth giving connects it to why app state is never safe.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Android is a Linux kernel with a large userspace stack on top of it. Knowing the layers matters less than knowing what the bottom one implies: your app is an ordinary Linux process, subject to an ordinary Linux out-of-memory kill, and the system decides when that happens.</p>'
                },
                {
                    type: 'table',
                    title: 'The layers, top to bottom',
                    headers: ['Layer', 'What lives there', 'Why you care'],
                    rows: [
                        ['Apps', 'Your APK, plus system apps', 'No special status — system apps use the same APIs'],
                        ['Java API framework', 'Activity, View, Context, package manager', 'The SDK you compile against'],
                        ['Native libraries + ART', 'libc, Skia, media codecs; the runtime', 'Where your DEX actually executes'],
                        ['HAL', 'Vendor interfaces for camera, sensors, audio', 'Why the same API behaves differently across OEMs'],
                        ['Linux kernel', 'Processes, memory, drivers, Binder', 'Your process, your sandbox, your death']
                    ]
                },
                {
                    type: 'definition',
                    term: 'Zygote',
                    important: true,
                    html: '<p>A process started at boot that has already loaded and initialised the framework classes and shared resources. Every app process is <code>fork()</code>ed from it, so it inherits that warm heap through copy-on-write instead of paying to build it.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The saving is real. Loading the framework takes hundreds of milliseconds and tens of megabytes; forking costs neither, because copy-on-write means the pages are shared until something writes to them. Launching an app is therefore a fork, a specialisation step that sets the process’s UID and name, and then loading your DEX on top.</p>'
                },
                {
                    type: 'definition',
                    term: 'The application sandbox',
                    html: '<p>Each installed app gets its own Linux user id. The kernel’s ordinary file permissions are the sandbox: one app cannot read another’s data directory because it is a different user, not because a framework check says no.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>That is also why crossing an app boundary needs <strong>Binder</strong> — a kernel driver for inter-process calls — rather than a shared object or a static field. Every framework call that touches the system, from <code>startActivity</code> to reading a setting, is a Binder transaction into <code>system_server</code>. Binder is the reason <code>Parcelable</code> exists, and the reason a transaction over roughly 1&nbsp;MB throws (M13).</p>'
                },
                {
                    type: 'types',
                    title: 'The importance hierarchy — how the system chooses what to kill',
                    items: [
                        { name: 'Foreground', html: '<p>An activity the user is interacting with, or a foreground service. Killed only if the device is already in trouble.</p>' },
                        { name: 'Visible', html: '<p>Visible but not focused — behind a dialog, or in multi-window.</p>' },
                        { name: 'Service', html: '<p>Running a started service. Work the user cannot see but asked for.</p>' },
                        { name: 'Cached', html: '<p>No live components; kept around only to make a return trip fast. Killed first, without warning and without a callback.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>A cached process is killed <em>silently</em>. There is no <code>onDestroy</code>, no last chance to flush. Anything held only in memory when the user backgrounds the app is gone, which is exactly the process-death case that <code>onSaveInstanceState</code> and <code>SavedStateHandle</code> exist for — and the reason "it worked on my desk" is not evidence.</p>'
                }
            ],
            docs: [
                { title: 'Application fundamentals', path: '/guide/components/fundamentals', kind: 'guide' },
                { title: 'Processes and threads overview', path: '/guide/components/processes-and-threads', kind: 'guide' },
                { title: 'Processes and app lifecycle', path: '/guide/components/activities/process-lifecycle', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-zygote' },
                { topicId: 'android', questionId: 'android-multiple-processes' }
            ]
        },

        {
            id: 'runtime-and-build',
            title: 'ART, DEX and the build pipeline',
            importance: 'must-know',
            summary: 'Kotlin becomes JVM bytecode, then DEX, then an APK — and ART compiles it with a JIT/AOT hybrid.',
            interviewAngle: '"Dalvik versus ART" is asked constantly. The modern answer is that the split is not AOT versus JIT any more.',
            buildsOn: ['platform-stack'],
            blocks: [
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'What actually happens to your source',
                    code: `Foo.kt  ──kotlinc──►  Foo.class      JVM bytecode, stack-based
                              │
                              ├──D8──►  classes.dex   Dalvik bytecode, register-based
                              │                        (R8 in release: shrink, optimise, obfuscate)
   res/, AndroidManifest.xml ─AAPT2─►  resources.arsc + compiled XML
                              │
                              └────►  .apk / .aab  ──►  signed, then installed

   On device:  install ──► ART, guided by the baseline profile
               run     ──► interpret ▸ JIT hot paths ▸ AOT-compile them later`,
                    notes: 'The <code>.class</code> step is why every JVM language works on Android, and why the Java interop and erasure rules from M6 apply unchanged.'
                },
                {
                    type: 'definition',
                    term: 'DEX',
                    important: true,
                    html: '<p>Dalvik Executable — Android’s own bytecode format. Where JVM bytecode is stack-based with one class per file, DEX is register-based and packs every class into one file, which is both smaller and better suited to interpretation on a phone.</p>'
                },
                {
                    type: 'definition',
                    term: 'The 64K method limit and multidex',
                    html: '<p>A single DEX file addresses methods with a 16-bit index, so it holds at most 65,536 method references. Exceeding that splits the app across <code>classes.dex</code>, <code>classes2.dex</code> and so on. Native from API 21 onward; the painful support-library workaround only matters for older <code>minSdk</code>s.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Dalvik versus ART',
                    left: 'Dalvik (to Android 4.4)',
                    right: 'ART (Android 5.0 onward)',
                    rows: [
                        { aspect: 'Compilation', left: 'JIT only, every launch', right: 'JIT and AOT together' },
                        { aspect: 'Install', left: 'Fast', right: 'Slower originally; now profile-driven and idle-time' },
                        { aspect: 'Startup', left: 'Slower — recompiles hot code each run', right: 'Faster — hot code is already native' },
                        { aspect: 'Garbage collection', left: 'Stop-the-world, long pauses', right: 'Concurrent, compacting, far shorter pauses' },
                        { aspect: 'Updatability', left: 'Part of the OS image', right: 'A Mainline module, updated through Play' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The framing to avoid is "Dalvik is JIT, ART is AOT". That was true of ART in 2014 — it compiled everything at install, which made installs slow and wasted effort on code nobody ran. Since Android 7 it is a <strong>hybrid</strong>: code starts interpreted, the JIT compiles what turns out to be hot, and ART records that in a profile and AOT-compiles it while the device is idle and charging. The app gets faster over the first few days of use.</p>'
                },
                {
                    type: 'definition',
                    term: 'Baseline profile',
                    html: '<p>A list of hot methods and classes shipped <em>inside</em> the APK, so ART can AOT-compile them at install time instead of waiting for the JIT to discover them. It removes the slow-first-days effect, and it is the single largest startup win available to a Compose app (M22).</p>'
                },
                {
                    type: 'types',
                    title: 'App startup, in the three flavours interviewers name',
                    items: [
                        { name: 'Cold', html: '<p>No process exists. Fork from Zygote, create the <code>Application</code>, then the first activity. The slowest case and the one measured by Play vitals.</p>' },
                        { name: 'Warm', html: '<p>The process is alive but the activity was destroyed — the activity is recreated, the process is not.</p>' },
                        { name: 'Hot', html: '<p>Process and activity both alive; the activity is just brought forward. Effectively free.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The lever on cold start is what you do in <code>Application.onCreate</code>. Every library initialised eagerly there is on the critical path of every cold start. App Startup, or plain lazy initialisation, moves that cost to first use.</p>'
                },
                {
                    type: 'types',
                    title: 'Going native, when you have to',
                    items: [
                        { name: 'NDK and JNI', html: '<p>The toolchain for compiling C/C++ into the app, and the calling convention between Kotlin and that code. Worth it for existing native libraries, heavy signal or image processing, and games — not for ordinary app code, where the JNI boundary costs more than it saves.</p>' },
                        { name: 'CMake', html: '<p>The build system Gradle drives for native sources, via <code>externalNativeBuild</code>. Produces a <code>.so</code> per ABI, which is why native apps ship per-ABI splits rather than one fat APK.</p>' },
                        { name: 'RenderScript', html: '<p>Deprecated since Android 12. The replacement for its main use cases is Vulkan, or <code>RenderEffect</code> for image effects — a reasonable thing to say if it comes up.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Android runtime and Dalvik', path: '/guide/practices/verifying-apps-art', kind: 'guide' },
                { title: 'Configure apps with over 64K methods', path: '/build/multidex', kind: 'guide' },
                { title: 'Baseline profiles overview', path: '/topic/performance/baselineprofiles/overview', kind: 'guide' },
                { title: 'App startup time', path: '/topic/performance/vitals/launch-time', kind: 'guide' },
                { title: 'Getting started with the NDK', path: '/ndk/guides', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-runtime' },
                { topicId: 'android', questionId: 'android-dalvik-art-jit-aot' },
                { topicId: 'android', questionId: 'android-dalvik-vs-art' },
                { topicId: 'android', questionId: 'android-dex' },
                { topicId: 'android', questionId: 'android-multidex' },
                { topicId: 'android', questionId: 'android-baseline-profiles' },
                { topicId: 'android', questionId: 'android-app-starts' },
                { topicId: 'android', questionId: 'android-aapt' },
                { topicId: 'android', questionId: 'android-ndk' },
                { topicId: 'android', questionId: 'android-renderscript' }
            ]
        },

        {
            id: 'app-anatomy',
            title: 'Components, the manifest and the Application class',
            importance: 'must-know',
            summary: 'Four component types are the entry points the system knows about; the manifest is how it learns them.',
            interviewAngle: '"What are the application components?" is a warm-up. The follow-up — why they are entry points at all — is the real question.',
            buildsOn: ['platform-stack'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>An Android app has no <code>main</code>. It has several entry points that the system may invoke in any order, and it must be prepared to start at any one of them — a share intent, a notification tap, a scheduled alarm. That is the structural difference from a desktop program, and it is where the four component types come from.</p>'
                },
                {
                    type: 'types',
                    title: 'The four components',
                    items: [
                        { name: 'Activity', html: '<p>One screen with a UI. Started with an <code>Intent</code>, and the only component the user directly sees. Covered in M13.</p>' },
                        { name: 'Service', html: '<p>Work without a UI that should outlive the screen that started it. <strong>Not a thread</strong> — a service runs on the main thread unless you move work off it. Covered in Track 5.</p>' },
                        { name: 'BroadcastReceiver', html: '<p>A handler for system-wide or app-wide events. Runs briefly and must not block; long work belongs in <code>WorkManager</code>. Covered in M15.</p>' },
                        { name: 'ContentProvider', html: '<p>A structured interface for sharing data <em>across</em> app boundaries, over Binder. Rarely worth building for data that stays inside your own app.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>"A Service runs in the background" is the most common wrong answer in Android interviews. Background is about <em>lifecycle</em>, not threading: a service is background because it has no UI, and it still runs on the main thread. Blocking in one triggers an ANR exactly as it would in an activity.</p>'
                },
                {
                    type: 'prose',
                    html: '<p><code>AndroidManifest.xml</code> is how the system learns any of this before your code runs. The package manager reads it at install time, so everything the platform must know without executing the app lives there: which components exist, which intents they answer, what permissions are needed, the minimum API level, and the hardware the app requires.</p>'
                },
                {
                    type: 'syntax',
                    language: 'xml',
                    title: 'The manifest, and what each part declares',
                    code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />

    <application
        android:name=".DeckApplication"
        android:theme="@style/Theme.DroidDeck">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <!-- This filter is what makes it the launcher entry point. -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service android:name=".SyncService" android:exported="false" />
    </application>
</manifest>`,
                    notes: '<code>android:exported</code> has been mandatory since API 31 for any component with an intent filter. Getting it wrong is a build failure at best and an exported attack surface at worst.'
                },
                {
                    type: 'types',
                    title: 'Where things live in a project',
                    items: [
                        { name: 'src/main/java', html: '<p>Kotlin and Java sources, regardless of the directory’s name.</p>' },
                        { name: 'src/main/res', html: '<p>Resources, split by type and qualifier — <code>layout/</code>, <code>values/</code>, <code>drawable-hdpi/</code>. Compiled and given generated ids in <code>R</code> (M16).</p>' },
                        { name: 'build.gradle.kts (module)', html: '<p><code>minSdk</code>, <code>targetSdk</code>, build types, flavours, dependencies. The project-level file and the version catalog hold plugin and version declarations.</p>' },
                        { name: 'src/test vs src/androidTest', html: '<p>JVM tests versus tests needing a device or Robolectric. The split is a build concept, and it shapes what you can test (Track 7).</p>' }
                    ]
                },
                {
                    type: 'definition',
                    term: 'Application',
                    html: '<p>The base class instantiated before any component, and the last thing destroyed. One instance per process — so an app declaring multiple processes gets <code>onCreate</code> called once <em>per process</em>, a genuinely surprising detail.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>The <code>Application</code> class attracts global mutable state, and it is the wrong home for it. It is not a service locator, and a static reference to it as "a Context I can reach anywhere" hides real dependencies. It also does not survive process death, so anything cached there must be reconstructible — a cache, never a source of truth.</p>'
                }
            ],
            docs: [
                { title: 'Application fundamentals', path: '/guide/components/fundamentals', kind: 'guide' },
                { title: 'App manifest overview', path: '/guide/topics/manifest/manifest-intro', kind: 'guide' },
                { title: 'App Startup', path: '/topic/libraries/app-startup', kind: 'guide' },
                { title: 'Configure your build', path: '/build/gradle-build-overview', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-application-components' },
                { topicId: 'android', questionId: 'android-manifest' },
                { topicId: 'android', questionId: 'android-project-structure' },
                { topicId: 'android', questionId: 'android-application-class' },
                { topicId: 'android', questionId: 'android-service' },
                { topicId: 'android', questionId: 'android-content-provider' }
            ]
        }
    ]
};
