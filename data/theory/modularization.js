/* ==========================================================================
   M38 — Modularization.

   Closes Track 6. It comes last because a module boundary is only meaningful
   once the layers (M32) and the dependency graph (M36) are in place — a
   split made before either is decided just moves the tangle into Gradle.
   ========================================================================== */

const modularizationModule = {
    id: 'modularization',
    trackId: 'architecture',
    order: 38,
    title: 'Modularization',
    tagline: 'Boundaries the compiler enforces, and build times that shrink.',
    estimatedMinutes: 25,
    prerequisites: ['dependency-injection'],
    docHub: {
        title: 'Guide to Android app modularization',
        path: '/topic/modularization'
    },

    chapters: [
        {
            id: 'why',
            title: 'What splitting buys, and what it costs',
            importance: 'should-know',
            summary: 'Enforced boundaries, parallel and incremental builds, and clear ownership — paid for in configuration.',
            interviewAngle: '"When would you modularize?" — the answer that lands names a symptom, not a size.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A package boundary is a convention. A module boundary is a compile error. That is the whole difference, and it is why modularisation is the only structural rule from M32 that cannot be quietly broken by someone in a hurry.</p>'
                },
                {
                    type: 'types',
                    title: 'What you get',
                    items: [
                        { name: 'Enforced dependencies', html: '<p>If <code>:feature:profile</code> does not depend on <code>:feature:checkout</code>, importing from it does not compile. The dependency rule stops being a code-review responsibility.</p>' },
                        { name: 'Faster incremental builds', html: '<p>Gradle rebuilds only modules whose inputs changed, and builds independent ones in parallel. On a large app this is usually the change people actually feel.</p>' },
                        { name: 'Ownership', html: '<p>A module maps to a team. Code review, release risk and on-call all get a boundary that matches the code.</p>' },
                        { name: 'Reuse and delivery', html: '<p>A module can be shared across apps, and it is the unit Play Feature Delivery ships on demand.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The cost is real and usually understated. Every module needs its own build file, its own dependencies and its own Hilt wiring; moving a class between modules becomes a change to several files; and any code two features share must be extracted somewhere both can see, which is a design decision each time rather than a move.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Splitting too finely makes builds <em>slower</em>. Gradle pays a fixed configuration cost per module, so a hundred tiny modules can spend more time configuring than the monolith spent compiling. The granularity to aim for is a module that one team owns and that is worth building independently — not one per feature-shaped noun.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Answer "when should you modularize?" with symptoms: a build slow enough to break flow, several teams colliding in the same files, a layering rule that keeps being violated, or a need to ship a feature on demand. Answering with a line count invites the follow-up you cannot defend.</p>'
                }
            ],
            docs: [
                { title: 'Guide to Android app modularization', path: '/topic/modularization', kind: 'guide' },
                { title: 'Common modularization patterns', path: '/topic/modularization/patterns', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-multi-module-benefits' },
                { topicId: 'android-architecture', questionId: 'arch-multi-module-when' }
            ]
        },

        {
            id: 'structuring',
            title: 'By layer, or by feature',
            importance: 'should-know',
            summary: 'Layer modules scale badly and feature modules scale well — so the usual answer is both.',
            interviewAngle: 'Knowing why pure layer modularisation fails is more useful than knowing the folder names.',
            buildsOn: ['why'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'The two axes',
                    left: 'By layer',
                    right: 'By feature',
                    rows: [
                        { aspect: 'Modules', left: '<code>:ui</code>, <code>:domain</code>, <code>:data</code>', right: '<code>:feature:profile</code>, <code>:feature:checkout</code>' },
                        { aspect: 'A feature change touches', left: 'Every module', right: 'One module' },
                        { aspect: 'Build benefit', left: 'Little — everything rebuilds', right: 'Large — one module rebuilds' },
                        { aspect: 'Ownership', left: 'Unclear — teams share modules', right: 'Clear — one team per module' },
                        { aspect: 'Scales to', left: 'A handful of features', right: 'Many' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Layer modules fail for one concrete reason: features are vertical and layers are horizontal, so adding a field to a profile touches <code>:data</code>, <code>:domain</code> and <code>:ui</code> at once. Every module rebuilds, every team meets in the same files, and the build-time argument for splitting evaporates.</p>'
                },
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'The structure most large apps converge on',
                    code: `:app                     wires everything; the Hilt root component (M36)
   ↓ depends on
:feature:profile         one screen or flow — UI + ViewModel + its use cases
:feature:checkout        does NOT depend on any other :feature
   ↓ depends on
:core:data               repositories and data sources (M26)
:core:domain             shared business rules, where they exist
:core:ui                 design system, shared composables (M23)
:core:common             utilities, dispatchers, Result types
:core:testing            fakes and test rules, used by every module

Rules that make it work:
  · Only :app knows every module.
  · A :feature never depends on another :feature.
  · :core never depends on a :feature.
  · Anything two features need moves down into :core.`,
                    notes: 'The "no feature depends on a feature" rule is the one that keeps the graph a tree. Break it once and you have a monolith with extra build files.'
                },
                {
                    type: 'prose',
                    html: '<p>Two features that genuinely need each other are usually a sign the boundary is wrong — either they are one feature, or the shared part belongs in <code>:core</code>. Where a real dependency exists, the M32 move applies: the consumer depends on an <em>interface</em> in a core module, and the provider binds the implementation, so neither feature names the other.</p>'
                }
            ],
            docs: [
                { title: 'Common modularization patterns', path: '/topic/modularization/patterns', kind: 'guide' },
                { title: 'Now in Android', url: 'https://github.com/android/nowinandroid', kind: 'sample' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-multi-module-benefits' },
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' }
            ]
        },

        {
            id: 'practicalities',
            title: 'Making it work in Gradle',
            importance: 'should-know',
            summary: 'Version catalogs, convention plugins, api versus implementation, and navigating across modules.',
            interviewAngle: 'api-versus-implementation is a small question with a build-time answer, and it comes up.',
            buildsOn: ['structuring'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'api versus implementation',
                    left: 'implementation',
                    right: 'api',
                    rows: [
                        { aspect: 'Dependency is visible to consumers', left: 'No', right: 'Yes — transitively' },
                        { aspect: 'When it changes', left: 'Only this module recompiles', right: 'Every consumer recompiles' },
                        { aspect: 'Use for', left: 'Almost everything', right: 'Types that appear in your public signatures' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The rule follows from the second row. Use <code>implementation</code> by default so a change stops at the module boundary; use <code>api</code> only when a type from that dependency appears in your own public API, because a consumer cannot call the function otherwise. Defaulting to <code>api</code> quietly restores the rebuild-everything behaviour you split the project to avoid.</p>'
                },
                {
                    type: 'types',
                    title: 'The build-side pieces',
                    items: [
                        { name: 'Version catalogs', html: '<p><code>libs.versions.toml</code> declares every dependency and version once, referenced as <code>libs.androidx.room</code>. Without it, thirty modules drift into thirty opinions about which Room version to use.</p>' },
                        { name: 'Convention plugins', html: '<p>A <code>build-logic</code> module holding shared Gradle configuration, applied as a plugin. The alternative — the same forty lines of <code>android { }</code> copied into every module — is the thing that makes people hate modularisation.</p>' },
                        { name: 'Configuration cache and parallel builds', html: '<p>Both pay off far more in a multi-module project, and both are the first thing to check when a split has not made builds faster.</p>' },
                        { name: 'A :core:testing module', html: '<p>Fakes and rules shared by every module’s tests. Otherwise each module writes its own <code>FakeUserRepository</code>, and they drift apart (Track 7).</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Navigation across modules is the other practical knot, because <code>:app</code> is the only module that knows every destination. The standard answers are a route defined in a core module that features can reference without seeing each other, or an interface a feature exposes and <code>:app</code> binds. Either way the point is the same as everywhere else in this track: features name an abstraction, never each other.</p>'
                }
            ],
            docs: [
                { title: 'Configure your build', path: '/build/gradle-build-overview', kind: 'guide' },
                { title: 'Common modularization patterns', path: '/topic/modularization/patterns', kind: 'guide' },
                { title: 'Now in Android', url: 'https://github.com/android/nowinandroid', kind: 'sample' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-multi-module-when' },
                { topicId: 'android-tools-technologies', questionId: 'implementation-vs-api-gradle' },
                { topicId: 'android-tools-technologies', questionId: 'speed-up-gradle-build' },
                { topicId: 'android-tools-technologies', questionId: 'gradle-build-system-explained' }
            ]
        }
    ]
};
