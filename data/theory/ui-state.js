/* ==========================================================================
   M34 — UI state and unidirectional data flow.

   The module that makes the UI layer concrete. Worked through one screen end
   to end, because the ideas only argue for themselves when you can see what
   each one prevents.
   ========================================================================== */

const uiStateModule = {
    id: 'ui-state',
    trackId: 'architecture',
    order: 34,
    title: 'UI State and Unidirectional Data Flow',
    tagline: 'State down, events up, and one immutable object describing the screen.',
    estimatedMinutes: 30,
    prerequisites: ['viewmodel'],
    docHub: {
        title: 'UI layer',
        path: '/topic/architecture/ui-layer'
    },

    chapters: [
        {
            id: 'modelling-ui-state',
            title: 'Modelling the screen as one value',
            importance: 'must-know',
            summary: 'An immutable data class holding everything the screen needs, and nothing it does not.',
            interviewAngle: 'The follow-up is always about impossible states. Have an opinion on flags versus a sealed hierarchy.',
            buildsOn: [],
            blocks: [
                {
                    type: 'definition',
                    term: 'UI state',
                    important: true,
                    html: '<p>An immutable description of what the screen should show right now. The UI is a function of it: given the same state, the same pixels — which is what makes rendering predictable and the screen testable without a device.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The alternative — several independent observables the view combines itself — puts the combination logic in the hardest place to test and lets the pieces disagree. One value cannot disagree with itself.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'One screen, three ways to model it',
                    code: `// 1 — separate flags. Compiles, and permits nonsense: loading AND error
//     AND data, all true at once.
data class ProfileUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null
)

// 2 — a sealed hierarchy. No impossible combinations, but Error carries no
//     data, so a failed refresh has nothing to show (M29).
sealed interface ProfileUiState {
    data object Loading : ProfileUiState
    data class Success(val user: User) : ProfileUiState
    data class Error(val message: String) : ProfileUiState
}

// 3 — content and status as separate axes. Usually the right shape.
data class ProfileUiState(
    val user: User? = null,           // null only before the first load
    val isRefreshing: Boolean = false,
    val message: UserMessage? = null  // transient, and part of the state
)`,
                    notes: 'Which is right depends on whether the screen can show stale content. A one-shot form is well served by the sealed version; anything backed by a cache is not.'
                },
                {
                    type: 'types',
                    title: 'Rules that hold regardless of shape',
                    items: [
                        { name: 'Immutable', html: '<p>A <code>data class</code> with <code>val</code>s, updated by <code>copy</code>. Mutable state handed to Compose also breaks skipping (M19), so this is a correctness and a performance rule at once.</p>' },
                        { name: 'Ready to render', html: '<p>Formatting, sorting and filtering happen before the state is emitted, not in the composable. That keeps work out of recomposition (M22) and makes the formatting testable.</p>' },
                        { name: 'No domain leakage', html: '<p>The screen needs a display name and an avatar URL, not the full <code>User</code> aggregate with fields nothing renders.</p>' },
                        { name: 'One per screen', html: '<p>Named for the screen — <code>ProfileUiState</code> — not one shared blob for the app.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Putting a <code>Throwable</code> in the state pushes the decision about what the user reads into the composable, which cannot know. Model the <em>message</em>, or a sealed reason (M26) — the UI’s job is to render a decision, not to make one.</p>'
                }
            ],
            docs: [
                { title: 'UI layer', path: '/topic/architecture/ui-layer', kind: 'guide' },
                { title: 'State holders and UI state', path: '/topic/architecture/ui-layer/stateholders', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-state-management' },
                { topicId: 'jetpack-compose', questionId: 'compose-stateful-vs-stateless' }
            ]
        },

        {
            id: 'udf',
            title: 'Unidirectional data flow',
            importance: 'must-know',
            summary: 'State flows down from one owner; events flow up as calls; nothing writes state sideways.',
            interviewAngle: 'Explaining why the loop matters — one place to look when the screen is wrong — beats reciting the diagram.',
            buildsOn: ['modelling-ui-state'],
            blocks: [
                {
                    type: 'syntax',
                    language: 'text',
                    title: 'The loop',
                    code: `        ┌──────────────── state ────────────────┐
        │                                       ▼
   ViewModel                                  Screen
        ▲                                       │
        └──────────────── events ───────────────┘

   Screen    renders state; emits events; owns nothing
   ViewModel owns state; is the only writer; calls the data layer
   Data      emits changes; knows nothing above it (M32)

The value is the constraint, not the diagram: exactly one component may
change the state, so when the screen is wrong there is one place to look.`,
                    notes: 'Compose enforces the down half structurally — a composable cannot reach into its parent — which is why UDF and Compose fit so naturally together (M19).'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The whole screen, end to end',
                    code: `class ProfileViewModel(
    private val users: UserRepository,
    handle: SavedStateHandle
) : ViewModel() {

    private val id: String = checkNotNull(handle["userId"])
    private val refreshing = MutableStateFlow(false)
    private val message = MutableStateFlow<UserMessage?>(null)

    // State production: several sources combined into ONE value.
    val uiState: StateFlow<ProfileUiState> =
        combine(users.observe(id), refreshing, message) { user, busy, msg ->
            ProfileUiState(user = user, isRefreshing = busy, message = msg)
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),   // M11
            initialValue = ProfileUiState()
        )

    // Events arrive as ordinary function calls, not as objects to dispatch.
    fun onRefresh() = viewModelScope.launch {
        refreshing.value = true
        users.refresh(id).onFailure { message.value = it.toUserMessage() }
        refreshing.value = false
    }

    fun onMessageShown() { message.value = null }
}

@Composable
fun ProfileScreen(viewModel: ProfileViewModel = viewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    Profile(                                   // stateless, previewable
        state = state,
        onRefresh = viewModel::onRefresh,
        onMessageShown = viewModel::onMessageShown
    )
}`,
                    notes: '<code>WhileSubscribed(5_000)</code> is what makes this survive a configuration change without restarting the upstream — the pipeline pauses when the last collector leaves, and resumes if one returns within five seconds.'
                },
                {
                    type: 'prose',
                    html: '<p>Note that events are plain method calls. There is no need for an event class hierarchy unless something else requires it — the ViewModel exposes named functions, and the composable receives them as lambdas, which keeps it previewable and testable without knowing a ViewModel exists (M19’s state hoisting, one level up).</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Exposing <code>MutableStateFlow</code> directly breaks the whole arrangement — any collector can now write, and the single-writer guarantee is gone. Expose <code>StateFlow</code> via <code>asStateFlow()</code>, or derive it as above.</p>'
                }
            ],
            docs: [
                { title: 'UI layer', path: '/topic/architecture/ui-layer', kind: 'guide' },
                { title: 'State production', path: '/topic/architecture/ui-layer/state-production', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-unidirectional-data-flow' },
                { topicId: 'jetpack-compose', questionId: 'compose-state-hoisting' },
                { topicId: 'jetpack-compose', questionId: 'compose-user-input' },
                { topicId: 'jetpack-compose', questionId: 'compose-observe-flows-livedata' }
            ]
        },

        {
            id: 'one-off-events',
            title: 'One-off events, and why they are contested',
            importance: 'should-know',
            summary: 'Navigating once, showing one snackbar — the case UDF handles least gracefully.',
            interviewAngle: 'A genuinely open question in the community. Knowing both positions is worth more than picking one loudly.',
            buildsOn: ['udf'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>State is idempotent by design: re-emitting it renders the same screen. Some things are not — navigate once, show this snackbar once — and if such a thing is modelled as state, a configuration change replays it and the user navigates twice or reads the same message again.</p>'
                },
                {
                    type: 'table',
                    title: 'The three approaches',
                    headers: ['Approach', 'How', 'Cost'],
                    rows: [
                        ['SharedFlow of events', 'Emit; collect in a lifecycle-aware block', 'An event emitted with no collector is lost'],
                        ['Event wrapper / consumed flag', 'State carries a value read once', 'Boilerplate; easy to forget to consume'],
                        ['Model it as state', 'A nullable field the UI clears when handled', 'Feels indirect; is the official recommendation']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Google’s guidance is the third row, and the argument is precise: a <code>SharedFlow</code> without replay drops events emitted while the UI is stopped, which is exactly the moment a rotation happens. Modelling the event as state — <code>message: UserMessage?</code>, cleared by an <code>onMessageShown</code> event — makes delivery survive whatever the lifecycle does, at the cost of an extra call.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The counter-argument, which is honest, is that navigation genuinely is not state: <code>navigateToDetail: String?</code> in a UI state class describes something that has already happened rather than something the screen is. Plenty of production apps use a <code>Channel</code> with unlimited buffer collected in <code>repeatOnLifecycle</code>, which does not drop, and are correct.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>The strong interview answer names the failure mode rather than the preference: <em>"the risk is losing the event while the UI is stopped, or delivering it twice after recreation. Modelling it as state with an explicit consumed callback avoids both, which is why the guidance recommends it — a Channel with repeatOnLifecycle also works, and a plain SharedFlow does not."</em></p>'
                }
            ],
            docs: [
                { title: 'UI events', path: '/topic/architecture/ui-layer/events', kind: 'guide' },
                { title: 'UI layer', path: '/topic/architecture/ui-layer', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-navigation' },
                { topicId: 'jetpack-compose', questionId: 'compose-side-effects' }
            ]
        }
    ]
};
