/* ==========================================================================
   M13 — Activities, state and tasks.

   The densest interview module on the platform. Almost every question here is
   really one question in disguise: what survives, and what does not?
   ========================================================================== */

const activitiesLifecycleModule = {
    id: 'activities-lifecycle',
    trackId: 'platform',
    order: 13,
    title: 'Activities, State and Tasks',
    tagline: 'Three kinds of death, and a different answer for each.',
    estimatedMinutes: 35,
    prerequisites: ['platform-architecture'],
    docHub: {
        title: 'Introduction to activities',
        path: '/guide/components/activities/intro-activities'
    },

    chapters: [
        {
            id: 'lifecycle',
            title: 'The activity lifecycle',
            importance: 'must-know',
            summary: 'Seven callbacks in symmetric pairs, describing how visible and how interactive the screen is.',
            interviewAngle: 'Reciting the callbacks is table stakes. Being asked "when is onDestroy called without onPause?" is the real test.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The lifecycle is not seven unrelated hooks. It is three nested states — created, started, resumed — and the callbacks are the transitions between them, which is why they pair up so cleanly.</p>'
                },
                {
                    type: 'table',
                    title: 'The callbacks, and what each one means',
                    headers: ['Callback', 'Paired with', 'True at this point', 'Do here'],
                    rows: [
                        ['onCreate', 'onDestroy', 'The instance exists; state bundle available', 'Inflate UI, wire ViewModels — once'],
                        ['onStart', 'onStop', 'Visible, not necessarily focused', 'Register observers that need visibility'],
                        ['onResume', 'onPause', 'Focused and taking input', 'Start camera, sensors, animations'],
                        ['onPause', 'onResume', 'Losing focus; may still be visible', 'Stop anything that must not run unfocused'],
                        ['onStop', 'onStart', 'No longer visible', 'Release heavy resources; persist if needed'],
                        ['onDestroy', 'onCreate', 'Finishing, or being recreated', 'Final cleanup — not guaranteed to run'],
                        ['onRestart', '—', 'Stopped, now returning', 'Rare; refresh what went stale']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The pairing is the mnemonic worth carrying: whatever you acquire in one, release in its partner. Acquire in <code>onStart</code>, release in <code>onStop</code>. Mismatching the pairs — acquiring in <code>onResume</code> and releasing in <code>onStop</code> — is how leaks and duplicate registrations start.</p>'
                },
                {
                    type: 'types',
                    title: 'The distinctions they ask about',
                    items: [
                        {
                            name: 'onCreate versus onStart',
                            html: '<p><code>onCreate</code> runs once per instance and receives the saved state; <code>onStart</code> runs every time the activity becomes visible, including on every return from the background. One-time setup in <code>onStart</code> runs repeatedly.</p>'
                        },
                        {
                            name: 'onPause versus onStop',
                            html: '<p><code>onPause</code> is "lost focus", <code>onStop</code> is "not visible". A transparent activity or a dialog-themed one over yours calls <code>onPause</code> and never <code>onStop</code> — the screen underneath is still on display.</p>'
                        },
                        {
                            name: 'onDestroy without onPause or onStop',
                            html: '<p>Call <code>finish()</code> inside <code>onCreate</code> and the activity goes straight to <code>onDestroy</code>: it never became visible, so there was nothing to pause or stop. A common pattern in routing activities that decide where to send the user and exit.</p>'
                        },
                        {
                            name: 'Why setContentView belongs in onCreate',
                            html: '<p>It inflates the view hierarchy and attaches it to the window, and that must exist before the activity is drawn or any <code>findViewById</code> resolves. Doing it later means measuring and drawing a window with no content — and doing it in <code>onStart</code> would rebuild the whole tree on every return, discarding view state each time.</p>'
                        }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p><code>onPause</code> is <strong>not</strong> a reliable place to save. It must return quickly — the next activity cannot resume until it does — and on a hard kill it may be the last callback you get. Persist in <code>onStop</code>, and keep <code>onPause</code> for stopping things that must not keep running unfocused.</p>'
                },
                {
                    type: 'prose',
                    html: '<p><code>onDestroy</code> carries no guarantee at all. If the process is killed while cached, none of the callbacks run — the process simply ceases. Anything whose loss would matter must already be on disk before the app is backgrounded.</p>'
                }
            ],
            docs: [
                { title: 'The activity lifecycle', path: '/guide/components/activities/activity-lifecycle', kind: 'guide' },
                { title: 'Introduction to activities', path: '/guide/components/activities/intro-activities', kind: 'guide' },
                { title: 'Handle activity state changes', path: '/guide/components/activities/state-changes', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-activity-lifecycle' },
                { topicId: 'android', questionId: 'android-oncreate-vs-onstart' },
                { topicId: 'android', questionId: 'android-ondestroy-without-onpause-onstop' },
                { topicId: 'android', questionId: 'android-setcontentview-in-oncreate' }
            ]
        },

        {
            id: 'state-preservation',
            title: 'What survives what',
            importance: 'must-know',
            summary: 'Configuration change, process death and user dismissal are three different events with three different answers.',
            interviewAngle: 'The strongest answer is a table, not a mechanism — knowing that ViewModel and SavedStateHandle solve different problems.',
            buildsOn: ['lifecycle'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>"How do you preserve state across rotation?" is usually asked as one question, but there are three separate events, and an answer that handles only the first is the one that ships bugs.</p>'
                },
                {
                    type: 'table',
                    title: 'The three deaths',
                    headers: ['Event', 'What happens', 'Survives it', 'Does not'],
                    rows: [
                        ['Configuration change', 'Activity recreated, process alive', 'ViewModel, saved state, disk', 'Plain instance fields'],
                        ['Process death', 'Process killed while backgrounded', 'Saved state bundle, disk', 'ViewModel, everything in memory'],
                        ['User finishes', 'Back out, or swipe from recents', 'Disk only', 'ViewModel and saved state — deliberately']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>That last row is the one people miss. When the user backs out, they meant to leave; restoring their half-typed state on the next launch would be a bug, not a feature. <code>SavedStateHandle</code> is deliberately cleared on a genuine finish and kept on a system-initiated kill, which is exactly the distinction you want and cannot easily draw yourself.</p>'
                },
                {
                    type: 'types',
                    title: 'The three tools, in the order you should reach for them',
                    items: [
                        {
                            name: 'ViewModel',
                            html: '<p>Survives configuration change because it is retained across the activity instances, not stored in one. Holds anything: large objects, in-flight coroutines, streams. Dies with the process.</p>'
                        },
                        {
                            name: 'SavedStateHandle / onSaveInstanceState',
                            html: '<p>Survives process death because the system serialises it into a <code>Bundle</code> and hands it back. Small, primitive-ish values only — a selected id, a scroll position, a query string.</p>'
                        },
                        {
                            name: 'Persistent storage',
                            html: '<p>Room, DataStore, files. The only thing that survives the user leaving. Anything the user would be upset to lose belongs here, not in either of the above.</p>'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The two together, which is the usual right answer',
                    code: `class EditorViewModel(
    private val handle: SavedStateHandle,
    private val repo: DraftRepository
) : ViewModel() {

    // Small, restorable identity → saved state, so it survives process death.
    private val draftId: String = checkNotNull(handle["draftId"])

    // Large and reconstructible → the ViewModel, rebuilt from the repository.
    val draft: StateFlow<Draft?> = repo.observe(draftId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    // Transient UI state worth keeping across a kill.
    var cursor: Int
        get() = handle["cursor"] ?: 0
        set(value) { handle["cursor"] = value }
}`,
                    notes: 'The rule of thumb: save the <em>key</em>, not the <em>data</em>. Ids restore cheaply and cannot go stale; a serialised copy of the object does both badly.'
                },
                {
                    type: 'definition',
                    term: 'Bundle',
                    important: true,
                    html: '<p>A typed key–value map the system can serialise across process boundaries. It is not a general <code>Map</code> because it must survive a Binder transaction — hence the restricted value types, and hence <code>Parcelable</code>.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Parcelable versus Serializable',
                    left: 'Parcelable',
                    right: 'Serializable',
                    rows: [
                        { aspect: 'Origin', left: 'Android, for Binder', right: 'Java, general purpose' },
                        { aspect: 'How', left: 'You (or <code>@Parcelize</code>) write the marshalling', right: 'Reflection over the fields' },
                        { aspect: 'Speed', left: 'Substantially faster', right: 'Slow; allocates heavily' },
                        { aspect: 'Boilerplate', left: 'None, with <code>@Parcelize</code>', right: 'A marker interface' },
                        { aspect: 'Use for', left: 'Anything crossing a Binder boundary', right: 'Plain JVM serialisation, off Android' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>The saved state <code>Bundle</code> crosses Binder, so it shares the transaction buffer’s roughly 1&nbsp;MB limit — and the budget is shared across the process. Putting a bitmap or a full list in it throws <code>TransactionTooLargeException</code>, usually on a slow device in production and never on your desk.</p>'
                }
            ],
            docs: [
                { title: 'Save UI states', path: '/topic/libraries/architecture/saving-states', kind: 'guide' },
                { title: 'Saved state module for ViewModel', path: '/topic/libraries/architecture/viewmodel/viewmodel-savedstate', kind: 'guide' },
                { title: 'Parcelables and bundles', path: '/guide/components/activities/parcelables-and-bundles', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-save-restore-instance-state' },
                { topicId: 'android', questionId: 'android-bundle' },
                { topicId: 'android', questionId: 'android-preserve-activity-rotation' },
                { topicId: 'android', questionId: 'android-serializable-vs-parcelable' },
                { topicId: 'android', questionId: 'android-bundle-vs-map' }
            ]
        },

        {
            id: 'tasks-and-launch-modes',
            title: 'Tasks, the back stack and launch modes',
            importance: 'must-know',
            summary: 'A task is a stack of activities; launch modes change what happens when one is started again.',
            interviewAngle: 'Launch modes are asked far more often than they are used. Know what each does and when singleTask is actually right.',
            buildsOn: ['lifecycle'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Task',
                    important: true,
                    html: '<p>A stack of activities the user experiences as one unit of work, and one card in the recents screen. It can span apps: picking a photo from your app pushes the gallery’s activity onto <em>your</em> task, which is why Back returns to you.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>By default the stack is a plain stack. Starting an activity pushes a new instance even if an identical one is already below — open a profile from a profile, and there are two. Launch modes exist to change that, and each of them trades some of that predictability for a specific behaviour.</p>'
                },
                {
                    type: 'table',
                    title: 'The four launch modes',
                    headers: ['Mode', 'On a repeat start', 'Task', 'Reach for it when'],
                    rows: [
                        ['standard', 'New instance, every time', 'Caller’s task', 'Almost always — the default is right'],
                        ['singleTop', 'Reuses it if already on top; else new', 'Caller’s task', 'A notification could re-open the visible screen'],
                        ['singleTask', 'Reuses the one instance, clearing above it', 'Its own task root', 'A true entry point, like a home screen'],
                        ['singleInstance', 'Reuses it; alone in its task', 'A task of its own', 'Almost never — a launcher or a call screen']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>When an instance is reused rather than created, <code>onCreate</code> does not run again — <code>onNewIntent</code> does. Forgetting to handle it is the classic launch-mode bug: the screen reappears showing the previous item, because the new intent’s extras were never read.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Handling the reuse case',
                    code: `// Declared as singleTop, so a second notification tap reuses this instance.
override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)              // otherwise getIntent() keeps returning the old one
    render(intent.getStringExtra("itemId"))
}

// The same effect without touching the manifest, decided per navigation:
startActivity(
    Intent(this, DetailActivity::class.java).apply {
        putExtra("itemId", id)
        addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
)`,
                    notes: '<code>setIntent</code> matters and is easy to miss — without it <code>getIntent()</code> returns the intent that originally created the activity, forever.'
                },
                {
                    type: 'types',
                    title: 'The flags worth knowing by name',
                    items: [
                        { name: 'FLAG_ACTIVITY_NEW_TASK', html: '<p>Start in a new task. Required when starting an activity from a non-activity <code>Context</code> — a service or a receiver — which is a common crash for anyone using <code>applicationContext</code> by habit (M16).</p>' },
                        { name: 'FLAG_ACTIVITY_CLEAR_TOP', html: '<p>If the target is already in the stack, drop everything above it. With <code>NEW_TASK</code>, the standard way to send the user home after logout.</p>' },
                        { name: 'FLAG_ACTIVITY_CLEAR_TASK', html: '<p>Empty the task first, making the target the new root. The "no way back into the signed-in app" pattern.</p>' },
                        { name: 'taskAffinity', html: '<p>Which task an activity prefers to belong to. Defaults to the package name, which is why one app is normally one task, and how a deliberately separate recents entry is arranged.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Launch modes are a manifest-wide, permanent decision; intent flags are a per-navigation one. Prefer flags. And in a single-activity Compose app most of this collapses into the navigation back stack of M24 — worth saying out loud, because it shows you know when the question is historical.</p>'
                }
            ],
            docs: [
                { title: 'Tasks and the back stack', path: '/guide/components/activities/tasks-and-back-stack', kind: 'guide' },
                { title: 'Intents and intent filters', path: '/guide/components/intents-filters', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-launch-modes' }
            ]
        },

        {
            id: 'activity-results',
            title: 'ComponentActivity and the result APIs',
            importance: 'should-know',
            summary: 'startActivityForResult is gone; contracts replaced it, and the same machinery handles permissions.',
            interviewAngle: 'Naming the deprecation and the reason for it — results arriving after process death — reads as current knowledge.',
            buildsOn: ['state-preservation'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p><code>startActivityForResult</code> and <code>onActivityResult</code> were deprecated for a concrete reason. The result arrives at an activity that may have been destroyed and recreated — the camera can easily push your process out of memory — so the callback had to be registered before <code>onCreate</code> returned, and the request code had to be tracked by hand. Every project reinvented the same fragile integer constants.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Registering a contract',
                    code: `class ProfileActivity : ComponentActivity() {

    // Registered unconditionally at construction — safe across recreation.
    private val pickImage = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? -> uri?.let(::showAvatar) }

    private val requestCamera = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted -> if (granted) openCamera() else explainWhy() }

    fun onPickTapped() = pickImage.launch("image/*")
}`,
                    notes: 'Registration must not be conditional or inside a callback — the framework re-registers on recreation and needs the same call to happen every time.'
                },
                {
                    type: 'types',
                    title: 'Why contracts are better than an integer',
                    items: [
                        { name: 'Typed', html: '<p>The contract declares its input and output, so the result is a <code>Uri?</code>, not an <code>Intent</code> you must dig through.</p>' },
                        { name: 'No request codes', html: '<p>The framework keys the callback itself and persists that key across process death.</p>' },
                        { name: 'Composable', html: '<p>A library can expose its own <code>ActivityResultContract</code> and be used without the caller knowing the intent it builds.</p>' },
                        { name: 'One mechanism', html: '<p>Permissions use the same API (M17), which collapses two subsystems into one.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p><code>ComponentActivity</code> is the base class all of this hangs from. It is where lifecycle ownership, saved-state ownership, the <code>ViewModelStore</code>, the result registry and the <code>OnBackPressedDispatcher</code> live — which is why <code>AppCompatActivity</code> and <code>FragmentActivity</code> both extend it, and why <code>setContent</code> is available on it.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>In Compose the equivalent is <code>rememberLauncherForActivityResult</code>, which does the same registration inside the composition. Same contracts, same reasoning.</p>'
                }
            ],
            docs: [
                { title: 'Get a result from an activity', path: '/training/basics/intents/result', kind: 'guide' },
                { title: 'Activity lifecycle', path: '/guide/components/activities/activity-lifecycle', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-activity-lifecycle' }
            ]
        }
    ]
};
