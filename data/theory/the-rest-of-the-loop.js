/* ==========================================================================
   M46 — The rest of the loop.

   The last module, and deliberately the least tidy. It holds the things a
   real interview loop asks that no earlier module owns: the parts of the
   platform you may never have touched, multiplatform, security posture, and
   the behavioural round.

   Release tracks, staged rollout and signing are NOT here — M43 owns them,
   and repeating them would be worse than pointing.
   ========================================================================== */

const theRestOfTheLoopModule = {
    id: 'the-rest-of-the-loop',
    trackId: 'synthesis',
    order: 46,
    title: 'The Rest of the Loop',
    tagline: 'The surfaces, the strategy questions, and the round that is not about code.',
    estimatedMinutes: 30,
    prerequisites: ['build-and-tooling'],
    docHub: {
        title: 'Distribute your app',
        path: '/distribute'
    },

    chapters: [
        {
            id: 'surfaces',
            title: 'Surfaces you may not have touched',
            importance: 'good-to-know',
            summary: 'Media, camera and the non-phone form factors — enough to answer without pretending.',
            interviewAngle: 'Nobody has shipped all of these. Knowing the current API name and the shape is the realistic bar.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Android is larger than any one developer’s experience, and an interviewer asking about media or Wear usually wants to know whether you can orient yourself — not whether you have shipped it. The useful preparation is the current API name, what replaced what, and one sentence about the shape.</p>'
                },
                {
                    type: 'types',
                    title: 'Media and camera',
                    items: [
                        {
                            name: 'MediaPlayer',
                            html: '<p>The original platform playback API. Simple, adequate for a short sound or a single clip, and weak on streaming, adaptive bitrate and format coverage. Fine for a notification sound; wrong for a video product.</p>'
                        },
                        {
                            name: 'ExoPlayer, now Media3',
                            html: '<p>Google’s application-level player, folded into the <strong>Media3</strong> libraries and the current recommendation. Handles DASH and HLS, adaptive streaming, DRM and custom track selection, and is updated with the app rather than the OS — which is the real argument, since <code>MediaPlayer</code> behaviour varies by device.</p>'
                        },
                        {
                            name: 'MediaSession',
                            html: '<p>What connects playback to the rest of the system — lock screen controls, notification transport, Bluetooth buttons, Assistant. A media app that does not implement it looks broken to the platform, and playback in the background needs a foreground service of type <code>mediaPlayback</code> (M31).</p>'
                        },
                        {
                            name: 'CameraX',
                            html: '<p>A lifecycle-aware wrapper over Camera2 built around three use cases — preview, image capture, image analysis — that binds to a <code>LifecycleOwner</code> and handles the device-specific behaviour Camera2 exposes raw. Use Camera2 directly only when you need control CameraX does not surface.</p>'
                        }
                    ]
                },
                {
                    type: 'types',
                    title: 'Form factors, in a sentence each',
                    items: [
                        { name: 'Wear OS', html: '<p>Compose for Wear OS, with its own components. The constraints are the point: a tiny battery, a glanceable screen, and an app that is often used for seconds. Tiles and complications matter more than screens.</p>' },
                        { name: 'Android TV', html: '<p>Ten-foot UI driven by a D-pad, so focus handling and focus visibility are the whole design problem rather than an accessibility afterthought.</p>' },
                        { name: 'Android Auto and Automotive', html: '<p>Two things: Auto projects from the phone, Automotive runs in the car. Both are heavily template-driven, because a free-form UI in a moving vehicle is a safety issue.</p>' },
                        { name: 'Foldables and large screens', html: '<p>Not a separate platform — the adaptive-layout work from M23. Window size classes, and the reminder that the same device is a phone and a tablet at different moments.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>If you have not shipped one of these, say so and then say what you would look at. <em>"I have not built for Wear; I would start from the battery and glanceability constraints, and expect tiles to matter more than an app screen."</em> That answers honestly and still demonstrates the judgement being probed.</p>'
                }
            ],
            docs: [
                { title: 'Media', path: '/media', kind: 'guide' },
                { title: 'CameraX', path: '/media/camera/camerax', kind: 'guide' },
                { title: 'Wear OS', path: '/wear', kind: 'guide' },
                { title: 'Build adaptive apps', path: '/develop/adaptive-apps', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-orientation-changes' },
                { topicId: 'android', questionId: 'android-screen-resolutions' }
            ]
        },

        {
            id: 'multiplatform',
            title: 'Kotlin Multiplatform, scoped honestly',
            importance: 'should-know',
            summary: 'Share logic where sharing pays, and be precise about what it does not solve.',
            interviewAngle: 'The tell is whether you can state the cost. Enthusiasm without limits reads as inexperience.',
            buildsOn: ['surfaces'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Kotlin Multiplatform compiles the same Kotlin to JVM bytecode for Android and to a native framework for iOS. The pitch is not "write once" — it is sharing the layers where two platforms genuinely agree, which in practice means the data layer (M26), the domain layer and validation, and leaving the UI native.</p>'
                },
                {
                    type: 'table',
                    title: 'What is usually shared, and what is not',
                    headers: ['Layer', 'Shared?', 'Why'],
                    rows: [
                        ['Networking, serialisation', 'Yes', 'Ktor and kotlinx.serialization are multiplatform'],
                        ['Data models, validation, business rules', 'Yes', 'No platform in them at all'],
                        ['Persistence', 'Usually', 'Room and SQLDelight both support KMP'],
                        ['ViewModels / presentation', 'Sometimes', 'Works; couples two UI teams to one abstraction'],
                        ['UI', 'Optional', 'Compose Multiplatform can, and native usually still wins']
                    ]
                },
                {
                    type: 'types',
                    title: 'The mechanics worth naming',
                    items: [
                        { name: 'expect / actual', html: '<p>Declare an API in common code and supply a platform implementation per target. The escape hatch for anything genuinely platform-specific.</p>' },
                        { name: 'Compose Multiplatform', html: '<p>JetBrains’ extension of Compose to iOS, desktop and web. Real and used in production; stable on iOS, and it renders its own widgets, so it looks like Compose everywhere rather than like each platform.</p>' },
                        { name: 'The iOS-side cost', html: '<p>Your iOS colleagues consume a Kotlin-generated framework. Debugging crosses a language boundary, coroutines and flows need adapting at the interface, and build times grow. This is the honest cost, and it is paid by a team that did not choose Kotlin.</p>' },
                        { name: 'Not a UI framework', html: '<p>KMP is a code-sharing mechanism. Comparing it to Flutter or React Native is a category error worth correcting gently — those replace the UI layer, KMP deliberately does not have to.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The comparison does get asked, so it is worth a clean answer. <strong>Flutter</strong> renders its own widgets with its own engine — consistent everywhere, large binary, and a second ecosystem. <strong>React Native</strong> drives native components from JavaScript — familiar to web teams, with a bridge that is the historic source of both bugs and performance work. <strong>KMP</strong> shares logic and keeps the UI native, which is the lowest-risk option and the one that shares the least.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Recommend it the way you would recommend any architectural change: for a team already writing the same business logic twice and watching the two copies drift. Not for a solo Android app, where it adds a build system and a target nobody is shipping.</p>'
                }
            ],
            docs: [
                { title: 'Kotlin Multiplatform on Android', path: '/kotlin/multiplatform', kind: 'guide' },
                { title: 'Kotlin Multiplatform', url: 'https://kotlinlang.org/docs/multiplatform.html', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'other-topics', questionId: 'kotlin-multiplatform' },
                { topicId: 'other-topics', questionId: 'react-native-vs-flutter' }
            ]
        },

        {
            id: 'security-posture',
            title: 'Security posture, and what it can and cannot do',
            importance: 'should-know',
            summary: 'The device is not yours, so every client-side control is a delay rather than a guarantee.',
            interviewAngle: 'The mature answer is that client-side security raises cost, and the real boundary is the server.',
            buildsOn: ['multiplatform'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>M17 covered permissions, scoped storage and secrets. What is left is posture — the measures teams add on top, and an accurate account of what each buys. The governing fact is that the user controls the device, so anything running on it can be inspected, patched or lied to.</p>'
                },
                {
                    type: 'table',
                    title: 'What each control actually buys',
                    headers: ['Control', 'Protects against', 'Does not protect against'],
                    rows: [
                        ['Android Keystore', 'Key extraction from a stolen device', 'Use of the key by the running app'],
                        ['Encrypted storage', 'Reading data off the filesystem', 'A rooted device with the app open'],
                        ['R8 obfuscation', 'Casual reverse engineering', 'Anyone determined; it is not encryption'],
                        ['Certificate pinning', 'A hostile CA proxying traffic', 'A patched APK with the pin removed'],
                        ['Root and tamper detection', 'Trivial tampering', 'Anyone who can also patch the detection'],
                        ['Play Integrity', 'Modified apps and unofficial installs, server-checked', 'Nothing, if you verify it on the client']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Read the right-hand column as one statement: <strong>every client-side control raises cost rather than closing a hole</strong>. That is not an argument against them — raising cost is genuinely worth doing — but it is the reason a security answer that stops at the client is incomplete. Authorisation belongs on the server, because the server is the only participant you control.</p>'
                },
                {
                    type: 'types',
                    title: 'The rest of the posture',
                    items: [
                        { name: 'Play Integrity', html: '<p>Returns a signed verdict about the app, the device and the install source. The load-bearing detail is that the verdict must be verified <em>server-side</em> — checked on the client, it is a boolean an attacker can flip.</p>' },
                        { name: 'Biometric authentication', html: '<p><code>BiometricPrompt</code>, and the strong version ties a Keystore key to successful authentication, so the key is unusable without it. That is a real guarantee rather than a UI gate.</p>' },
                        { name: 'Dependency hygiene', html: '<p>Most real vulnerabilities arrive through a library. Dependency scanning in CI (M43) and actually applying the updates matters more than any of the measures above.</p>' },
                        { name: 'In-app updates and review', html: '<p>Not security, but the same corner of the API: prompt a user on an old build to update — flexible or immediate — and ask for a review in-flow rather than sending them to Play.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'App security best practices', path: '/privacy-and-security/security-best-practices', kind: 'guide' },
                { title: 'Android keystore system', path: '/privacy-and-security/keystore', kind: 'guide' },
                { title: 'Support in-app updates', path: '/guide/playcore/in-app-updates', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'other-topics', questionId: 'secure-api-keys-android' },
                { topicId: 'other-topics', questionId: 'cleartext-traffic' },
                { topicId: 'android', questionId: 'android-encrypt-data' },
                { topicId: 'android-system-design', questionId: 'hash-vs-encrypt-vs-encode' },
                { topicId: 'android-system-design', questionId: 'symmetric-vs-asymmetric-encryption' }
            ]
        },

        {
            id: 'behavioural',
            title: 'The round that is not about code',
            importance: 'should-know',
            summary: 'Structured stories, honest failures, and the questions you ask back.',
            interviewAngle: 'This round is scored, and it is the one candidates prepare least. That asymmetry is the opportunity.',
            buildsOn: ['security-posture'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Every loop has one, it carries real weight at senior level, and it is the round people walk into unprepared. The failure mode is not saying the wrong thing — it is rambling, because the story had no shape.</p>'
                },
                {
                    type: 'types',
                    title: 'STAR, which exists to give it one',
                    items: [
                        { name: 'Situation', html: '<p>Two sentences of context. Enough to make the problem legible, no more.</p>' },
                        { name: 'Task', html: '<p>What you specifically were responsible for. "We" hides your contribution, which is the thing being assessed.</p>' },
                        { name: 'Action', html: '<p>What you did, and why you chose it over the alternative. This is most of the answer and is usually the shortest part.</p>' },
                        { name: 'Result', html: '<p>What changed, with a number if one exists — crash rate, start-up time, build time. A result with a measurement is a different class of answer.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Prepare four or five stories rather than answers to twenty questions, because the questions rotate over the same ground: a hard technical problem, a disagreement with a colleague, something you shipped that went wrong, a time you influenced a decision, and something you had to learn quickly. Most prompts map to one of those.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>The failure story is the one that separates people, and the mistake is choosing a failure that was not yours or was not a failure. "We shipped a crash affecting 3% of users because I skipped the release-build smoke test; we halted the rollout, and I added it to CI" is a strong answer. "I work too hard" is not — and neither is a failure blamed entirely on someone else.</p>'
                },
                {
                    type: 'types',
                    title: 'Questions worth asking back',
                    items: [
                        { name: 'What does the codebase actually look like?', html: '<p>Modularised or one module, Compose or Views, test coverage, build time. Concrete, and the answer tells you what the job is day to day.</p>' },
                        { name: 'How does a change reach a user?', html: '<p>Review, CI, release cadence, rollout. A team that cannot answer this crisply has told you something.</p>' },
                        { name: 'What is the largest piece of technical debt?', html: '<p>Everyone has one. Whether they can name it, and whether there is a plan, is the signal.</p>' },
                        { name: 'What would success look like in six months?', html: '<p>Turns the interview into a conversation about the role, and gives you something to evaluate the offer against.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The technical rounds in this curriculum reward the same instinct as this one: state the trade-off, name what you would revisit, and be specific about what you have actually done. That is the thread running through all 46 modules — not knowing more answers, but being able to say why you chose one.</p>'
                }
            ],
            docs: [
                { title: 'Distribute your app', path: '/distribute', kind: 'guide' },
                { title: 'Android Developers', path: '/', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' },
                { topicId: 'other-topics', questionId: 'android-development-best-practices' }
            ]
        }
    ]
};
