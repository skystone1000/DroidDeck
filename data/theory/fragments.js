/* ==========================================================================
   M14 — Fragments and the view lifecycle.

   Placed after activities and before intents because a fragment is only
   comprehensible as something hosted: it has no window, no task, and no
   entry point of its own. Still interviewed heavily, because the codebase
   you are about to join almost certainly has some.
   ========================================================================== */

const fragmentsModule = {
    id: 'fragments',
    trackId: 'platform',
    order: 14,
    title: 'Fragments and the View Lifecycle',
    tagline: 'One component with two lifecycles, and that is the whole story.',
    estimatedMinutes: 25,
    prerequisites: ['activities-lifecycle'],
    docHub: {
        title: 'Fragments',
        path: '/guide/fragments'
    },

    chapters: [
        {
            id: 'why-fragments',
            title: 'What a fragment is, and when it earns its place',
            importance: 'should-know',
            summary: 'A reusable portion of UI hosted by an activity — with a lifecycle, but without a window.',
            interviewAngle: '"Fragment or activity?" The answer that lands is one screen, one activity, and fragments for reuse within it.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Fragments arrived in Android 3.0 for tablets: the same list that filled a phone screen needed to sit beside a detail pane on a larger one, and an activity was too coarse a unit to move around. Everything else fragments are used for — pager pages, reusable sections, navigation destinations — followed from that one capability.</p>'
                },
                {
                    type: 'comparison',
                    title: 'Fragment versus activity',
                    left: 'Fragment',
                    right: 'Activity',
                    rows: [
                        { aspect: 'Declared in the manifest', left: 'No', right: 'Yes' },
                        { aspect: 'Has a window', left: 'No — it draws into its host’s', right: 'Yes' },
                        { aspect: 'Startable by another app', left: 'No', right: 'Yes, via an intent' },
                        { aspect: 'Back stack', left: 'The <code>FragmentManager</code>’s', right: 'The system task stack' },
                        { aspect: 'Lifecycles', left: 'Two — the fragment’s and its view’s', right: 'One' },
                        { aspect: 'Cost of swapping', left: 'A transaction', right: 'A process-level component start' }
                    ]
                },
                {
                    type: 'types',
                    title: 'When a fragment is the right answer',
                    items: [
                        { name: 'The same UI in two arrangements', html: '<p>List-and-detail side by side on a tablet, stacked on a phone. The original reason, and still the strongest one.</p>' },
                        { name: 'Pages inside one screen', html: '<p>A <code>ViewPager2</code> of tabs is one screen conceptually and should be one activity.</p>' },
                        { name: 'Navigation destinations', html: '<p>The single-activity architecture: one activity hosting a <code>NavHostFragment</code>, and every screen a fragment. Common in View-based codebases.</p>' },
                        { name: 'Not for', html: '<p>Anything another app must be able to launch — that has to be an activity, because only an activity can answer an intent.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>In a Compose codebase most of this dissolves. A composable is a cheaper, more honest unit of reusable UI, and the single-activity app hosts a Compose <code>NavHost</code> instead of a <code>NavHostFragment</code>. Fragments survive as the interop boundary and in existing code — which is precisely why they are still asked about.</p>'
                }
            ],
            docs: [
                { title: 'Fragments', path: '/guide/fragments', kind: 'guide' },
                { title: 'Create a fragment', path: '/guide/fragments/create', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-activity-vs-fragment' },
                { topicId: 'android', questionId: 'android-when-fragment-over-activity' }
            ]
        },

        {
            id: 'fragment-lifecycles',
            title: 'Two lifecycles, and the leak that follows',
            importance: 'must-know',
            summary: 'The fragment outlives its view, so an observer scoped to the fragment holds a destroyed view.',
            interviewAngle: 'viewLifecycleOwner is the single highest-signal detail in this module. Most candidates have never noticed why it exists.',
            buildsOn: ['why-fragments'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A fragment can lose its view and keep existing. Push a second fragment onto the back stack and the first is not destroyed — its view hierarchy is torn down to free memory, and rebuilt if the user comes back. That single fact produces every fragment bug worth knowing about.</p>'
                },
                {
                    type: 'table',
                    title: 'The callbacks, and which lifecycle each belongs to',
                    headers: ['Callback', 'Belongs to', 'What it means'],
                    rows: [
                        ['onAttach', 'Fragment', 'A host activity is available'],
                        ['onCreate', 'Fragment', 'Non-view state; the saved bundle is here'],
                        ['onCreateView', 'View', 'Inflate — do not touch view state yet'],
                        ['onViewCreated', 'View', 'The view exists; wire it up here'],
                        ['onStart / onResume', 'Both', 'Follows the host'],
                        ['onPause / onStop', 'Both', 'Follows the host'],
                        ['onDestroyView', 'View', 'The view is gone; the fragment is not'],
                        ['onDestroy / onDetach', 'Fragment', 'The fragment itself is finished']
                    ]
                },
                {
                    type: 'definition',
                    term: 'viewLifecycleOwner',
                    important: true,
                    html: '<p>A second <code>LifecycleOwner</code> whose lifetime runs from <code>onCreateView</code> to <code>onDestroyView</code>. Anything that touches views must be scoped to it, not to the fragment — because the fragment’s own lifecycle is longer.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The bug and the fix, side by side',
                    code: `class FeedFragment : Fragment(R.layout.fragment_feed) {

    // View binding is nullable for exactly one reason: the view can go away
    // while the fragment stays alive.
    private var _binding: FragmentFeedBinding? = null
    private val binding get() = checkNotNull(_binding)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        _binding = FragmentFeedBinding.bind(view)

        // WRONG — scoped to the fragment. Back-stack the fragment and this
        // observer survives onDestroyView, then writes to a dead view.
        viewModel.items.observe(this) { binding.list.submit(it) }

        // RIGHT — torn down with the view, recreated with the next one.
        viewModel.items.observe(viewLifecycleOwner) { binding.list.submit(it) }

        // Same rule for coroutines.
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.state.collect(::render)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null          // or the fragment leaks the whole view tree
    }
}`,
                    notes: 'Passing the layout id to the <code>Fragment</code> constructor removes <code>onCreateView</code> entirely, which is why <code>onViewCreated</code> is the modern place for setup.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Observing with <code>this</code> instead of <code>viewLifecycleOwner</code> produces a duplicate observer on every return to the fragment, so the callback fires two, three, four times — and the older ones write into views that no longer exist. It is a leak and a correctness bug at once, and it does not crash, which is why it survives review.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Nulling <code>_binding</code> in <code>onDestroyView</code> is the same rule from the other side. The binding object holds a reference to the root view and every view under it; a fragment kept on the back stack while holding one keeps the entire destroyed hierarchy alive. This pairing — non-null getter, nulled in <code>onDestroyView</code> — is boilerplate precisely because it is unavoidable.</p>'
                },
                {
                    type: 'tip',
                    html: '<p><code>ViewBinding</code> itself is worth a sentence if it comes up: generated per layout, null-safe and type-safe, and unlike <code>DataBinding</code> it does no expression evaluation in XML and adds no annotation processor. It replaced <code>findViewById</code>; it did not replace <code>DataBinding</code>’s binding expressions, and most teams decided they did not want those anyway.</p>'
                }
            ],
            docs: [
                { title: 'Fragment lifecycle', path: '/guide/fragments/lifecycle', kind: 'guide' },
                { title: 'View binding', path: '/topic/libraries/view-binding', kind: 'guide' },
                { title: 'Handling lifecycles', path: '/topic/libraries/architecture/lifecycle', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-fragment-lifecycle' },
                { topicId: 'android', questionId: 'android-find-memory-leaks' }
            ]
        },

        {
            id: 'fragmentmanager',
            title: 'FragmentManager, transactions and communication',
            importance: 'should-know',
            summary: 'Transactions mutate the fragment back stack; communication goes through the host, never directly.',
            interviewAngle: 'add-versus-replace and the default-constructor rule are both asked, and both have precise answers.',
            buildsOn: ['fragment-lifecycles'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Fragments are added and removed through the <code>FragmentManager</code> in a transaction — a batch of operations applied atomically. An activity has one <code>supportFragmentManager</code>; a fragment has its own <code>childFragmentManager</code> for anything nested inside it, and mixing the two up is a reliable source of confusion.</p>'
                },
                {
                    type: 'comparison',
                    title: 'add versus replace',
                    left: 'add',
                    right: 'replace',
                    rows: [
                        { aspect: 'Existing fragment', left: 'Stays, underneath', right: 'Removed' },
                        { aspect: 'Its view', left: 'Still in the hierarchy', right: 'Destroyed — <code>onDestroyView</code> runs' },
                        { aspect: 'Its state', left: 'Fully alive', right: 'Fragment survives if back-stacked' },
                        { aspect: 'Visual result', left: 'Overlapping, unless hidden', right: 'Clean swap' },
                        { aspect: 'Memory', left: 'Higher — everything retained', right: 'Lower' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p><code>replace</code> is the default choice. <code>add</code> is right when you genuinely want the previous fragment’s view kept — an expensive map or a video surface you do not want to rebuild — and then you must hide it explicitly, or two fragments draw on top of each other.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A transaction, and the result API',
                    code: `supportFragmentManager.commit {
    setReorderingAllowed(true)              // correct lifecycle ordering; always set it
    replace<DetailFragment>(R.id.container, args = bundleOf("id" to itemId))
    addToBackStack("detail")                // Back now returns to the previous fragment
}

// Communication: through the host, not between fragments directly.
setFragmentResultListener("filter") { _, bundle ->
    applyFilter(bundle.getString("value"))
}

// From the other fragment — no interface, no cast, no coupling.
setFragmentResult("filter", bundleOf("value" to "unread"))`,
                    notes: '<code>addToBackStack</code> is what makes Back undo the transaction rather than leave the activity. Without it the transaction is one-way.'
                },
                {
                    type: 'types',
                    title: 'Ways fragments talk, worst to best',
                    items: [
                        { name: 'A callback interface on the activity', html: '<p>The original pattern: the fragment casts its host to an interface in <code>onAttach</code>. Works, couples the fragment to its host, and crashes with a <code>ClassCastException</code> if the host forgets.</p>' },
                        { name: 'The Fragment Result API', html: '<p>A keyed <code>Bundle</code> passed through the <code>FragmentManager</code>. No interface, no cast, and results are delivered only when the receiver is at least STARTED — so they survive process death correctly.</p>' },
                        { name: 'A shared ViewModel', html: '<p>Both fragments obtain a <code>ViewModel</code> scoped to the activity or to a navigation graph, and communicate through observed state. The right answer for ongoing shared state rather than a one-off result.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Only the <strong>no-argument constructor</strong> may be used. On recreation the system reinstantiates the fragment by reflection, and it can only call that one — any constructor argument is silently gone, and the fragment crashes on the first configuration change. Arguments belong in <code>setArguments</code>/<code>arguments</code>, which the system saves and restores.</p>'
                },
                {
                    type: 'types',
                    title: 'Things you will meet in older code',
                    items: [
                        { name: 'setRetainInstance(true)', html: '<p>A retained fragment survived configuration changes with no view — the pre-<code>ViewModel</code> way of keeping state across rotation. Deprecated; <code>ViewModel</code> does the same thing without the invisible fragment.</p>' },
                        { name: 'FragmentPagerAdapter vs FragmentStatePagerAdapter', html: '<p>The first keeps every page’s fragment in memory, the second destroys off-screen fragments and restores their saved state. Few pages that are cheap: pager. Many pages, or heavy ones: state pager. Both are superseded by <code>ViewPager2</code>’s <code>FragmentStateAdapter</code>.</p>' },
                        { name: 'commit vs commitNow vs commitAllowingStateLoss', html: '<p><code>commit</code> is asynchronous. <code>commitAllowingStateLoss</code> suppresses the crash you get when committing after <code>onSaveInstanceState</code> — it does not fix the bug, it hides it, and the state really is lost.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Fragment manager', path: '/guide/fragments/fragmentmanager', kind: 'guide' },
                { title: 'Fragment transactions', path: '/guide/fragments/transactions', kind: 'guide' },
                { title: 'Communicate between fragments', path: '/guide/fragments/communicate', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-add-vs-replace-fragment' },
                { topicId: 'android', questionId: 'android-addtobackstack' },
                { topicId: 'android', questionId: 'android-fragment-communication' },
                { topicId: 'android', questionId: 'android-fragment-default-constructor' },
                { topicId: 'android', questionId: 'android-retained-fragment' },
                { topicId: 'android', questionId: 'android-fragmentpageradapter-vs-fragmentstatepageradapter' },
                { topicId: 'android', questionId: 'android-shared-viewmodel' }
            ]
        },

        {
            id: 'dialogs',
            title: 'Dialogs and transient messages',
            importance: 'good-to-know',
            summary: 'A DialogFragment is a dialog that survives rotation; a bare Dialog is not.',
            interviewAngle: 'Small, but "why DialogFragment over Dialog?" is a quick way to check whether lifecycle thinking is habitual.',
            buildsOn: ['fragmentmanager'],
            blocks: [
                {
                    type: 'comparison',
                    title: 'Dialog versus DialogFragment',
                    left: 'DialogFragment',
                    right: 'Dialog',
                    rows: [
                        { aspect: 'Configuration change', left: 'Recreated automatically', right: 'Leaks the activity, or vanishes' },
                        { aspect: 'Lifecycle', left: 'A fragment’s — observable', right: 'None of its own' },
                        { aspect: 'State restoration', left: 'Handled by the <code>FragmentManager</code>', right: 'Yours to do by hand' },
                        { aspect: 'Recommended', left: 'Yes', right: 'Only inside a <code>DialogFragment</code>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>A raw <code>Dialog</code> holds the activity as its context. Rotate with one showing and the activity is destroyed while the dialog still references it — the textbook leak — and if you dismiss it in <code>onPause</code> to avoid that, the user loses the dialog on every rotation. <code>DialogFragment</code> solves both by making the dialog a fragment the manager can destroy and recreate.</p>'
                },
                {
                    type: 'types',
                    title: 'What you actually use',
                    items: [
                        { name: 'AlertDialog', html: '<p>Title, message, up to three buttons. Built with <code>MaterialAlertDialogBuilder</code> so it picks up the app’s theme, and returned from <code>DialogFragment.onCreateDialog</code>.</p>' },
                        { name: 'BottomSheetDialogFragment', html: '<p>A sheet from the bottom edge, draggable and dismissible. The Material default for a menu of actions on a phone, where a centred dialog reads as an interruption.</p>' },
                        { name: 'Toast', html: '<p>A short system-drawn message with no interaction and no lifecycle. Since Android 11 the text is capped by the system and custom views are ignored, so it is genuinely only for brief confirmations.</p>' },
                        { name: 'Snackbar', html: '<p>The one to prefer. Drawn inside your window, so it is themed, dismissible, can carry an Undo action, and is visible to accessibility services and tests — none of which is true of a Toast.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>In Compose all of this is a composable behind a state flag — <code>if (showDialog) AlertDialog(onDismissRequest = { showDialog = false }) { … }</code> — and the rotation problem disappears because the flag is ordinary state (M19). Worth naming, because it shows the older answer was understood rather than memorised.</p>'
                }
            ],
            docs: [
                { title: 'Displaying dialogs with DialogFragment', path: '/guide/fragments/dialogs', kind: 'guide' },
                { title: 'Dialogs', path: '/develop/ui/views/components/dialogs', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-dialog' },
                { topicId: 'android', questionId: 'android-dialog-vs-dialogfragment' },
                { topicId: 'android', questionId: 'android-toast' }
            ]
        }
    ]
};
