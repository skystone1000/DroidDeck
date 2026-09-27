/* ==========================================================================
   M43 — Build, tooling and release engineering.

   Closes Track 7 and the last of the practitioner tracks. Everything here is
   asked in the "what happens after you write the code?" part of an interview,
   which is the part candidates most often have nothing to say about.
   ========================================================================== */

const buildAndToolingModule = {
    id: 'build-and-tooling',
    trackId: 'quality',
    order: 43,
    title: 'Build, Tooling and Release',
    tagline: 'What happens between your keyboard and the user’s phone.',
    estimatedMinutes: 30,
    prerequisites: ['modularization'],
    docHub: {
        title: 'Configure your build',
        path: '/build/gradle-build-overview'
    },

    chapters: [
        {
            id: 'gradle',
            title: 'Gradle and the Android plugin',
            importance: 'should-know',
            summary: 'Three phases, a plugin that adds the Android world, and variants multiplying out of them.',
            interviewAngle: '"Why is my build slow?" is answered by knowing which phase the time is in.',
            buildsOn: [],
            blocks: [
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'The three phases, which explain most build behaviour',
                    code: `1. Initialisation   Which projects are in the build?  (settings.gradle.kts)
2. Configuration    Every build script in every module is EXECUTED, and the
                    task graph is built. Nothing is compiled yet.
3. Execution        The tasks the graph says are out of date actually run.

Consequences worth knowing:
  · Configuration runs for every module on every build — which is why a
    hundred tiny modules can cost more than they save (M38).
  · Code at the top level of a build file runs during configuration, so a
    println or a version lookup there runs even for an unrelated task.
  · The configuration cache stores the task graph and skips phase 2 entirely
    on later builds. It is the single biggest win available on a large project.`,
                    notes: 'The Android Gradle Plugin is what adds the Android model on top — variants, manifest merging, resource compilation, DEX-ing (M12) and packaging.'
                },
                {
                    type: 'definition',
                    term: 'Build variant',
                    important: true,
                    html: '<p>The product of a <strong>build type</strong> (debug, release — how it is built) and a <strong>product flavour</strong> (free, paid; staging, production — what is built). Two types and two flavours give four variants, each with its own source set and dependencies.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A module build file, with the pieces that come up',
                    code: `plugins {
    alias(libs.plugins.android.application)      // from the version catalog
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "dev.droiddeck"
    compileSdk = 36

    defaultConfig {
        minSdk = 24                              // oldest device supported
        targetSdk = 36                           // behaviour you opt into (M17)
        versionCode = 42                         // what Play orders releases by
    }

    buildTypes {
        release {
            isMinifyEnabled = true               // R8 — verify this is on
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"),
                          "proguard-rules.pro")
        }
    }

    flavorDimensions += "environment"
    productFlavors {
        create("staging")    { applicationIdSuffix = ".staging" }
        create("production") { }
    }

    compileOptions { isCoreLibraryDesugaringEnabled = true }
}

dependencies {
    implementation(libs.androidx.room.runtime)   // M38
    ksp(libs.androidx.room.compiler)
    coreLibraryDesugaring(libs.desugar.jdk.libs)
}`,
                    notes: '<code>minSdk</code> is the oldest device that can install; <code>targetSdk</code> is the behaviour set you accept; <code>compileSdk</code> is the API you compile against. They are three different decisions and are regularly conflated.'
                },
                {
                    type: 'comparison',
                    title: 'KAPT versus KSP',
                    left: 'KAPT',
                    right: 'KSP',
                    rows: [
                        { aspect: 'Works by', left: 'Generating Java stubs, then running javac processors', right: 'Reading Kotlin directly' },
                        { aspect: 'Speed', left: 'Slow — the stub step dominates', right: 'Roughly twice as fast' },
                        { aspect: 'Understands Kotlin', left: 'Approximately, via stubs', right: 'Natively — nullability, defaults' },
                        { aspect: 'Status', left: 'Legacy; in maintenance', right: 'The default for new processors' }
                    ]
                },
                {
                    type: 'types',
                    title: 'Making a build faster, in order',
                    items: [
                        { name: 'Configuration cache and build cache', html: '<p>Skip phase 2 entirely, and reuse task outputs across builds and machines. Both are configuration flags rather than work.</p>' },
                        { name: 'Move KAPT to KSP', html: '<p>Room, Hilt and Moshi all support it. Usually the largest single win on a Kotlin project.</p>' },
                        { name: 'Convention plugins over copied config', html: '<p>M38 again — and it keeps the configuration phase cheap and consistent.</p>' },
                        { name: 'Do not disable R8 to go faster', html: '<p>It only runs on release builds. If your debug builds are slow, R8 is not why.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Configure your build', path: '/build/gradle-build-overview', kind: 'guide' },
                { title: 'Configure build variants', path: '/build/build-variants', kind: 'guide' },
                { title: 'Kotlin Symbol Processing', path: '/build/migrate-to-ksp', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-tools-technologies', questionId: 'gradle' },
                { topicId: 'android-tools-technologies', questionId: 'gradle-build-system-explained' },
                { topicId: 'android-tools-technologies', questionId: 'gradle-related-files' },
                { topicId: 'android-tools-technologies', questionId: 'kotlin-dsl-gradle' },
                { topicId: 'android-tools-technologies', questionId: 'custom-gradle-task' },
                { topicId: 'android-tools-technologies', questionId: 'build-variants' },
                { topicId: 'android-tools-technologies', questionId: 'annotation-processor-kapt-ksp' },
                { topicId: 'android-tools-technologies', questionId: 'speed-up-gradle-build' }
            ]
        },

        {
            id: 'r8',
            title: 'R8, keep rules and desugaring',
            importance: 'must-know',
            summary: 'One tool that shrinks, optimises and obfuscates — and breaks anything it cannot see being used.',
            interviewAngle: 'The crash-only-in-release story is the one interviewers want, because everyone has lived it.',
            buildsOn: ['gradle'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>R8 replaced ProGuard and does its jobs in one pass, integrated into D8 (M12). It walks the code from a set of entry points, discards everything unreachable, inlines and optimises what remains, and renames what is left to short names.</p>'
                },
                {
                    type: 'types',
                    title: 'The three jobs, which are separately valuable',
                    items: [
                        { name: 'Shrinking', html: '<p>Removes unused classes, methods and — with <code>shrinkResources</code> — unused resources. This is where most of the size reduction comes from (M42).</p>' },
                        { name: 'Optimisation', html: '<p>Inlining, dead-branch removal, class merging. Makes the app smaller and measurably faster to start.</p>' },
                        { name: 'Obfuscation', html: '<p>Renames to <code>a</code>, <code>b</code>, <code>c</code>. Saves space and raises the bar for casual reverse engineering — but it is <strong>not</strong> encryption, and it does not protect a secret string (M17).</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>R8’s reachability analysis is static, so anything reached by <strong>reflection</strong> is invisible to it — and gets removed or renamed. That is the classic "works in debug, crashes in release": a Gson model whose fields were renamed and no longer match the JSON, a class named in a manifest or a layout, or something loaded by name. The fix is a keep rule telling R8 the entry point exists.</p>'
                },
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'proguard-rules.pro, and the rules worth understanding',
                    code: `# Keep a class and its members entirely — the blunt instrument.
-keep class dev.droiddeck.model.** { *; }

# Keep only what is needed for serialization: names, not the whole class.
-keepclassmembers class dev.droiddeck.model.** {
    <fields>;
    <init>();
}

# Keep the ANNOTATED things, not a hard-coded package list. Survives moves.
-keep @kotlinx.serialization.Serializable class * { *; }

# Keep line numbers so crash reports are readable after deobfuscation.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

Libraries ship their own rules (consumer-rules.pro), so Room, Retrofit and
Hilt need nothing from you. The rules you write are for YOUR reflection.`,
                    notes: 'Over-keeping is the common overcorrection: <code>-keep class ** { *; }</code> makes the crash go away and disables shrinking entirely. Keep the narrowest thing that works.'
                },
                {
                    type: 'prose',
                    html: '<p>Obfuscation makes stack traces unreadable, so every release build produces a <strong>mapping file</strong> that reverses the renaming. Upload it to Play or your crash reporter and archive it with the build — lose it and the crash reports for that version are permanently undecipherable, which is a genuinely unrecoverable mistake.</p>'
                },
                {
                    type: 'types',
                    title: 'Two related build-time transformations',
                    items: [
                        { name: 'Full mode', html: '<p>R8’s more aggressive default in recent AGP versions. It assumes less about reflection, so it shrinks harder and occasionally needs a keep rule that ProGuard-compatible mode did not.</p>' },
                        { name: 'Desugaring', html: '<p>Rewrites newer Java language features and APIs so they run on older devices — lambdas, and with core library desugaring, <code>java.time</code> and <code>java.util.stream</code>. It is why a modern <code>minSdk</code> 24 app can use APIs introduced much later.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Enable app optimization', path: '/topic/performance/app-optimization/enable-app-optimization', kind: 'guide' },
                { title: 'Keep rules overview', path: '/topic/performance/app-optimization/keep-rules-overview', kind: 'guide' },
                { title: 'R8 full mode', path: '/topic/performance/app-optimization/full-mode', kind: 'guide' },
                { title: 'Java 8+ API desugaring support', path: '/studio/write/java8-support', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-tools-technologies', questionId: 'proguard-vs-r8' },
                { topicId: 'android-tools-technologies', questionId: 'proguard-usage' },
                { topicId: 'android-tools-technologies', questionId: 'proguard-rules-pro-file' },
                { topicId: 'android-tools-technologies', questionId: 'proguard-things-to-care' },
                { topicId: 'android-tools-technologies', questionId: 'obfuscation-minification' },
                { topicId: 'android-tools-technologies', questionId: 'desugaring' }
            ]
        },

        {
            id: 'quality-and-release',
            title: 'Static analysis, CI and shipping',
            importance: 'should-know',
            summary: 'Automated checks before review, signed bundles after, and Play deciding what each device downloads.',
            interviewAngle: 'A release process is the thing juniors have never thought about, so having one is a differentiator.',
            buildsOn: ['r8'],
            blocks: [
                {
                    type: 'types',
                    title: 'The checks worth running before a human looks',
                    items: [
                        { name: 'Lint', html: '<p>Android’s own analyser — unused resources, missing content descriptions (M23), API level misuse, likely leaks. Configure it to fail the build on the categories you care about, or it becomes wallpaper.</p>' },
                        { name: 'Detekt and ktlint', html: '<p>Kotlin static analysis and formatting. The value of a formatter is not beauty; it is that formatting stops appearing in code review at all.</p>' },
                        { name: 'StrictMode', html: '<p>Runtime rather than static, debug-only, and it catches the disk and network calls on the main thread that become M42’s ANRs.</p>' },
                        { name: 'The test suite', html: '<p>Unit tests on every push, instrumented tests on a managed device or before merge — the M39 pyramid decides what runs where, because runtime is the constraint.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>A useful CI answer names the stages rather than a product: on every push, compile, run lint and unit tests; on a pull request, add instrumented tests and a size report; on merge to main, build a signed bundle and publish to an internal track. Whether that runs on GitHub Actions or something else is the least interesting part.</p>'
                },
                {
                    type: 'types',
                    title: 'Signing, which is the part with no undo',
                    items: [
                        { name: 'Every APK is signed', html: '<p>The signature is the app’s identity. Android will not install an update signed with a different key, so losing the key historically meant losing the ability to update the app at all.</p>' },
                        { name: 'Play App Signing', html: '<p>Google holds the app signing key and you hold an upload key. If the upload key is lost it can be reset — which is why this is now the default and the recommendation.</p>' },
                        { name: 'Never in version control', html: '<p>The keystore and its passwords go in the CI secret store, injected at build time, exactly as M17 argued for API keys.</p>' },
                        { name: 'It is also a permission boundary', html: '<p>Signature-level permissions (M17) work because two apps share a signing key.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>You upload an <strong>App Bundle</strong> (<code>.aab</code>), not an APK. Play generates a device-specific APK from it, delivering one density, one ABI and the languages that device uses — which is the largest single size reduction available (M42) and makes the old multiple-APK workaround obsolete. Play Feature Delivery goes further, shipping a module (M38) only when it is first used.</p>'
                },
                {
                    type: 'types',
                    title: 'Getting it in front of users carefully',
                    items: [
                        { name: 'Tracks', html: '<p>Internal, closed, open, production. Each is a real audience, and skipping straight to production is how a bad build reaches everyone at once.</p>' },
                        { name: 'Staged rollout', html: '<p>Release to a percentage and watch Android vitals (M42). If the crash rate moves, halt — the release can be stopped, and a rollout is the only mechanism that makes that useful.</p>' },
                        { name: 'Remote config and feature flags', html: '<p>Change behaviour without shipping a build, which decouples "the code is released" from "the feature is on". Also the answer to changing app parameters without an update.</p>' },
                        { name: 'adb, for everything else', html: '<p><code>adb install</code>, <code>adb logcat</code>, <code>adb shell dumpsys</code>, <code>adb shell am start -d</code> to fire a deep link (M15). Worth being fluent in — it is how you inspect a device without Studio.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Asked for a release checklist, answer as a sequence rather than a list: version bumped; R8 on and the mapping file uploaded; release-build smoke test on a real device; permissions and the data safety form (M17) still accurate; vitals thresholds green; staged rollout with someone watching. That is a process, and processes are what the question is really asking about.</p>'
                }
            ],
            docs: [
                { title: 'Improve your code with lint checks', path: '/studio/write/lint', kind: 'guide' },
                { title: 'Test from the command line and CI', path: '/training/testing/continuous-integration', kind: 'guide' },
                { title: 'Sign your app', path: '/studio/publish/app-signing', kind: 'guide' },
                { title: 'About Android App Bundles', path: '/guide/app-bundle', kind: 'guide' },
                { title: 'Command-line tools', path: '/tools', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-tools-technologies', questionId: 'lint' },
                { topicId: 'android-tools-technologies', questionId: 'ci-cd-pipeline' },
                { topicId: 'android-tools-technologies', questionId: 'adb' },
                { topicId: 'android-tools-technologies', questionId: 'app-release-checklist' },
                { topicId: 'android-tools-technologies', questionId: 'multiple-apks' },
                { topicId: 'android-tools-technologies', questionId: 'change-app-params-without-update' },
                { topicId: 'android-system-design', questionId: 'firebase-remote-config' }
            ]
        }
    ]
};
