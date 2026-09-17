/* ==========================================================================
   M16 — Context, resources and configuration.

   Three subjects that look unrelated and are the same one: a Context is a
   handle onto a configured environment, resources are what that configuration
   selects, and a configuration change is what happens when the selection
   changes underneath a running app.
   ========================================================================== */

const contextResourcesModule = {
    id: 'context-resources',
    trackId: 'platform',
    order: 16,
    title: 'Context, Resources and Configuration',
    tagline: 'One handle onto a configured environment — and it can change beneath you.',
    estimatedMinutes: 30,
    prerequisites: ['activities-lifecycle'],
    docHub: {
        title: 'App resources overview',
        path: '/guide/topics/resources/providing-resources'
    },

    chapters: [
        {
            id: 'context',
            title: 'Context, and the leaks it causes',
            importance: 'must-know',
            summary: 'Your handle on the app environment — and the most-leaked object on the platform.',
            interviewAngle: '"Which Context should I use?" is really "how long will the thing holding it live?"',
            buildsOn: [],
            blocks: [
                {
                    type: 'definition',
                    term: 'Context',
                    important: true,
                    html: '<p>The interface to everything outside your own objects: resources, assets, system services, the file system, permissions, and the ability to start components. Activity, Service and Application all <em>are</em> Contexts, which is why the same method call means slightly different things depending on where you make it.</p>'
                },
                {
                    type: 'table',
                    title: 'The kinds, and what each is for',
                    headers: ['Context', 'Lives as long as', 'Themed', 'Use for'],
                    rows: [
                        ['Activity', 'The activity instance', 'Yes', 'UI — inflating, dialogs, starting activities'],
                        ['Application', 'The process', 'No', 'Anything outliving a screen — singletons, repositories'],
                        ['Service', 'The service', 'No', 'Work inside a service'],
                        ['ContextWrapper / base', 'Whatever it wraps', 'Depends', 'Library code taking whatever it is handed'],
                        ['createConfigurationContext', 'You decide', 'Yes', 'Resources for a locale or size other than the current one']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The rule is a single question: <strong>how long will the object holding this reference live?</strong> If it will outlive the screen, it must not hold an <code>Activity</code>. If it draws anything, it must — because only an activity context carries the theme, so a dialog built with <code>applicationContext</code> is either unstyled or throws outright.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Holding an <code>Activity</code> in anything long-lived leaks the entire view hierarchy behind it — every view, every bitmap, every listener. A singleton initialised with the activity that happened to be on screen first is the canonical version, and it survives every rotation forever.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The leaks worth recognising on sight',
                    code: `// 1 — a singleton holding an Activity.
object Analytics {
    lateinit var context: Context                       // set to \`this\` in onCreate
}
Analytics.context = applicationContext                  // the fix

// 2 — a non-static inner class outliving its outer instance.
//     An inner class holds an implicit reference to the Activity, and this
//     handler keeps posting long after the screen is gone.
inner class Ticker : Runnable { override fun run() { … } }

// 3 — a listener registered and never removed.
override fun onStart()  { locationManager.requestUpdates(this) }
override fun onStop()   { locationManager.removeUpdates(this) }   // the pair matters

// 4 — a coroutine on the wrong scope.
GlobalScope.launch { render(load()) }                   // outlives the Activity
lifecycleScope.launch { render(load()) }                // cancelled with it`,
                    notes: 'Every one of these is the same shape: something with a long life holding something with a short one. That is the pattern to look for, not the individual cases.'
                },
                {
                    type: 'types',
                    title: 'Finding them, rather than guessing',
                    items: [
                        { name: 'LeakCanary', html: '<p>Dropped into the debug build, it watches destroyed activities and fragments, forces a GC, and if the object is still reachable it dumps the heap and prints the reference chain that holds it. It names the offending field, which is the part that makes it useful.</p>' },
                        { name: 'Memory Profiler', html: '<p>Rotate a screen ten times and watch the activity instance count. If it climbs and never falls, you have found one without any tooling at all.</p>' },
                        { name: 'A heap dump', html: '<p>Capture, filter to your <code>Activity</code> class, and inspect the shortest path to a GC root — the same reasoning LeakCanary automates.</p>' },
                        { name: 'StrictMode', html: '<p>Catches a different family: disk and network on the main thread, and unclosed resources. Not a leak detector, but the same class of "found in development, not in production" tool.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Context', path: '/reference/android/content/Context', kind: 'api' },
                { title: 'Overview of memory management', path: '/topic/performance/memory-overview', kind: 'guide' },
                { title: 'Manage your app\'s memory', path: '/topic/performance/memory', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-context' },
                { topicId: 'android', questionId: 'android-find-memory-leaks' },
                { topicId: 'android', questionId: 'android-memory-leak-vs-oom' },
                { topicId: 'other-topics', questionId: 'memory-heap-dumps' }
            ]
        },

        {
            id: 'resources',
            title: 'Resources, qualifiers and styling',
            importance: 'must-know',
            summary: 'Externalise everything variable, then let the system pick the right variant for the device.',
            interviewAngle: 'Density buckets and dp-versus-sp are asked constantly, and sp has an accessibility answer attached.',
            buildsOn: ['context'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Resources exist so that the same code produces the right result on a Hindi tablet in dark mode and an English phone in bright sun. You put every variable thing — strings, dimensions, colours, drawables, layouts — in <code>res/</code>, tag the directory with qualifiers, and the system picks at runtime.</p>'
                },
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'Qualifiers, and how one is chosen',
                    code: `res/values/strings.xml            default — must always exist
res/values-hi/strings.xml         language: Hindi
res/values-b+sr+Latn/             locale with script
res/values-night/colors.xml       dark theme
res/values-sw600dp/dimens.xml     smallest width ≥ 600dp  (tablet-ish)
res/values-land/dimens.xml        landscape
res/drawable-xxhdpi/icon.png      density bucket
res/layout-sw600dp-land/main.xml  several at once, in the required order

Selection: eliminate every directory that contradicts the device, then take
the survivor whose highest-priority qualifier wins. Locale outranks size,
size outranks orientation, orientation outranks density. If nothing matches,
the unqualified default is used — which is why it must exist.`,
                    notes: 'Qualifiers must appear in the documented precedence order in the directory name, or the build rejects them.'
                },
                {
                    type: 'table',
                    title: 'Density buckets',
                    headers: ['Bucket', 'dpi', 'Scale', '48dp becomes'],
                    rows: [
                        ['mdpi', '160', '1×', '48 px — the baseline'],
                        ['hdpi', '240', '1.5×', '72 px'],
                        ['xhdpi', '320', '2×', '96 px'],
                        ['xxhdpi', '480', '3×', '144 px'],
                        ['xxxhdpi', '640', '4×', '192 px']
                    ]
                },
                {
                    type: 'definition',
                    term: 'dp and sp',
                    important: true,
                    html: '<p><code>dp</code> is a density-independent pixel: 1&nbsp;dp is 1&nbsp;px at 160&nbsp;dpi, so a 48&nbsp;dp button is physically the same size on every screen. <code>sp</code> is the same thing <em>multiplied by the user’s font scale</em>.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>That difference is the whole answer to "when do I use sp?". Text uses <code>sp</code> so that a user who has set larger text gets larger text; everything else uses <code>dp</code> so the layout does not distort. Using <code>dp</code> for text silently ignores an accessibility setting, and it is the kind of thing that shows up in an audit rather than in testing.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Using <code>sp</code> correctly but then fixing the height of the container in <code>dp</code> undoes it — the text grows and is clipped. Let text-bearing views wrap their content, and check the screen at the largest font scale, where most layouts break.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Style versus theme',
                    left: 'Style',
                    right: 'Theme',
                    rows: [
                        { aspect: 'Applied to', left: 'One view', right: 'An activity, or a whole app' },
                        { aspect: 'Inherited by children', left: 'No', right: 'Yes' },
                        { aspect: 'Holds', left: 'View attributes — size, colour, text', right: 'Attributes that views resolve against' },
                        { aspect: 'Example', left: 'A button’s appearance', right: '<code>colorPrimary</code>, the default font, the window background' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The mechanism connecting them is the <strong>theme attribute</strong>. A style says <code>?attr/colorPrimary</code> rather than a literal colour, so the value is resolved from whatever theme is in force. That indirection is what makes one style work in light and dark, and it is exactly what <code>MaterialTheme</code>’s <code>CompositionLocal</code>s replaced in Compose (M23).</p>'
                },
                {
                    type: 'types',
                    title: 'Localisation, and text that is not just a string',
                    items: [
                        { name: 'Never concatenate', html: '<p>Use positional format arguments — <code>%1$s bought %2$d</code> — because word order differs between languages and a translator needs to be able to move them.</p>' },
                        { name: 'Plurals', html: '<p><code>&lt;plurals&gt;</code> with quantity rules, not <code>if (n == 1)</code>. Several languages have more than two forms; Arabic has six.</p>' },
                        { name: 'RTL', html: '<p>Use <code>start</code>/<code>end</code> instead of <code>left</code>/<code>right</code> everywhere, set <code>supportsRtl</code>, and test with the force-RTL developer option.</p>' },
                        { name: 'Spannable', html: '<p>Text with markup attached to ranges — bold, colour, click targets. <code>SpannableString</code> is the immutable-text version; use it for one styled substring rather than splitting a sentence into three views, which breaks translation and screen readers alike.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'App resources overview', path: '/guide/topics/resources/providing-resources', kind: 'guide' },
                { title: 'Support different pixel densities', path: '/training/multiscreen/screendensities', kind: 'guide' },
                { title: 'Styles and themes', path: '/develop/ui/views/theming/themes', kind: 'guide' },
                { title: 'Localize your app', path: '/guide/topics/resources/localization', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-screen-resolutions' },
                { topicId: 'android', questionId: 'android-spannable' },
                { topicId: 'android', questionId: 'android-spannablestring' },
                { topicId: 'android', questionId: 'android-text-best-practices' }
            ]
        },

        {
            id: 'configuration-changes',
            title: 'Configuration changes',
            importance: 'must-know',
            summary: 'The configuration changed, so the resource selection is stale — and the fix is to rebuild, not to prevent.',
            interviewAngle: 'Suggesting android:configChanges as the solution is a red flag. Know why it exists and why it is not the answer.',
            buildsOn: ['resources'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Rotation is the famous case, but it is one of many: locale, dark mode, font scale, keyboard availability, multi-window resize, folding and unfolding. Each of them invalidates the resource selection from the previous chapter, so the platform’s answer is uniform — destroy the activity and create a new one, which re-resolves everything from scratch.</p>'
                },
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'What actually happens, in order',
                    code: `configuration changes
   ↓
onSaveInstanceState   → small state into a Bundle (M13)
onPause → onStop → onDestroy    (isChangingConfigurations() == true)
   ↓
ViewModelStore is RETAINED — the ViewModel is not cleared
   ↓
new Activity instance
   ↓
onCreate(savedInstanceState)  → resources re-resolved for the new config
onStart → onResume            → the same ViewModel is handed back`,
                    notes: '<code>isChangingConfigurations()</code> is how you tell a rotation from a real finish inside <code>onDestroy</code> — and is exactly what <code>SavedStateHandle</code> uses to decide whether to keep its contents.'
                },
                {
                    type: 'types',
                    title: 'The three responses, in order of preference',
                    items: [
                        { name: 'Let it recreate', html: '<p>Keep state in a <code>ViewModel</code> and <code>SavedStateHandle</code>, keep views stateless, and recreation costs nothing worth avoiding. This is the answer.</p>' },
                        { name: 'Handle it yourself', html: '<p><code>android:configChanges="orientation|screenSize|keyboardHidden"</code> suppresses the recreation and calls <code>onConfigurationChanged</code> instead. Now <em>you</em> must re-resolve every resource that could have changed.</p>' },
                        { name: 'Lock the orientation', html: '<p><code>android:screenOrientation="portrait"</code>. Legitimate for a camera or a game; on a normal screen it is a bug for tablets, foldables and anyone using multi-window.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p><code>configChanges</code> is not a fix for state loss — it hides the state loss until a configuration you did not list arrives, or until the process is killed and the state was never being saved anyway. Reaching for it in an interview reads as not knowing about <code>ViewModel</code>. The honest use case is a screen where rebuilding is genuinely expensive, such as one holding a live camera surface.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Dark mode is a configuration change like any other. <code>AppCompatDelegate.setDefaultNightMode</code> or <code>MODE_NIGHT_FOLLOW_SYSTEM</code> flips it, <code>values-night/</code> supplies the alternative colours, and the activity recreates — which is why an app that survives rotation correctly usually gets dark mode for free, and one that does not, breaks in both places at once.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Two developer options make this testable rather than theoretical: <strong>Don’t keep activities</strong>, which forces the process-death path from M13 every time you background the app, and the largest font scale, which breaks more layouts than rotation ever does.</p>'
                }
            ],
            docs: [
                { title: 'Handle configuration changes', path: '/guide/topics/resources/runtime-changes', kind: 'guide' },
                { title: 'ViewModel overview', path: '/topic/libraries/architecture/viewmodel', kind: 'guide' },
                { title: 'Dark theme', path: '/develop/ui/views/theming/darktheme', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-preserve-activity-rotation' },
                { topicId: 'android', questionId: 'android-dark-mode' },
                { topicId: 'other-topics', questionId: 'implement-dark-theme' },
                { topicId: 'android', questionId: 'android-viewmodel' }
            ]
        }
    ]
};
