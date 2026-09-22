/* ==========================================================================
   M35 — Architecture patterns.

   Deliberately after M34. The patterns are much easier to compare once the
   reader has seen a real UDF screen, because most of the differences between
   them are answers to one question: who owns the state?
   ========================================================================== */

const architecturePatternsModule = {
    id: 'architecture-patterns',
    trackId: 'architecture',
    order: 35,
    title: 'Architecture Patterns',
    tagline: 'Four answers to one question: who owns the state?',
    estimatedMinutes: 25,
    prerequisites: ['ui-state'],
    docHub: {
        title: 'Architecture recommendations',
        path: '/topic/architecture/recommendations'
    },

    chapters: [
        {
            id: 'mvc-mvp-mvvm',
            title: 'MVC, MVP and MVVM',
            importance: 'must-know',
            summary: 'Three ways of separating the view from the logic, each fixing the previous one’s coupling.',
            interviewAngle: 'Asked constantly. The story of what each fixed is more convincing than three definitions.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>These are best understood in sequence, because each was a response to the previous one’s specific problem rather than an independent idea.</p>'
                },
                {
                    type: 'table',
                    title: 'The three, compared',
                    headers: ['', 'MVC', 'MVP', 'MVVM'],
                    rows: [
                        ['View↔logic link', 'Controller holds the view', 'Presenter and view hold each other', 'View observes; ViewModel does not know it'],
                        ['Coupling direction', 'Two-way, often tangled', 'Two-way, via an interface', 'One-way'],
                        ['View interface needed', 'No', 'Yes — one per screen', 'No'],
                        ['Updates the view by', 'Direct calls', 'Calling view methods', 'Emitting state'],
                        ['Testable without a device', 'Poorly', 'Yes, with a mocked view', 'Yes, with no view at all'],
                        ['Survives rotation', 'No help', 'You wire it yourself', 'Yes — retained (M33)']
                    ]
                },
                {
                    type: 'types',
                    title: 'What each actually fixed',
                    items: [
                        {
                            name: 'MVC, and its Android problem',
                            html: '<p>The classic split, and it never mapped cleanly here: an <code>Activity</code> is view <em>and</em> controller at once, which is exactly why the God Activity is the platform’s signature smell rather than an accident.</p>'
                        },
                        {
                            name: 'MVP, and its cost',
                            html: '<p>Introduced a <code>View</code> interface so the presenter could be tested against a mock. It worked, and it produced an interface per screen with a method per UI change — <code>showLoading</code>, <code>hideLoading</code>, <code>showError</code> — plus a presenter that had to be detached in <code>onDestroy</code> or leak the view.</p>'
                        },
                        {
                            name: 'MVVM, and why it won',
                            html: '<p>The ViewModel emits state and never learns who is rendering it, so there is no view interface, no attach/detach, and nothing to leak. The observable stream is what makes the one-way link possible, which is why MVVM arrived on Android with <code>LiveData</code> and not before.</p>'
                        }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>"MVVM" is used loosely enough to be nearly meaningless in an interview. A <code>ViewModel</code> exposing seven <code>MutableLiveData</code> fields the fragment writes to is MVVM by naming and MVP by structure. The distinguishing question is not what the class is called — it is whether the view can write state.</p>'
                }
            ],
            docs: [
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'Guide to app architecture', path: '/topic/architecture', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-mvvm' },
                { topicId: 'android-architecture', questionId: 'arch-mvc-mvp-mvvm' }
            ]
        },

        {
            id: 'mvi',
            title: 'MVI',
            importance: 'should-know',
            summary: 'MVVM with the state made single and the transitions made explicit.',
            interviewAngle: 'The useful framing is that MVI is a stricter MVVM, not a different family.',
            buildsOn: ['mvc-mvp-mvvm'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Model–View–Intent takes the loop from M34 and tightens two screws. State is <strong>one</strong> immutable object rather than several observables, and every change goes through a single reducer — <code>(state, intent) -> state</code> — so transitions are named, ordered and replayable.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The reducer, which is the whole idea',
                    code: `sealed interface Intent {
    data object Refresh : Intent
    data class Select(val id: String) : Intent
}

private fun reduce(state: UiState, intent: Intent): UiState = when (intent) {
    is Intent.Refresh -> state.copy(isRefreshing = true)
    is Intent.Select  -> state.copy(selectedId = intent.id)
}

fun onIntent(intent: Intent) {
    _state.update { reduce(it, intent) }
    // side effects dispatched separately — the reducer stays pure
}`,
                    notes: 'The reducer being pure is what buys the benefits: it is trivially unit-testable, and a sequence of intents replays a bug exactly.'
                },
                {
                    type: 'comparison',
                    title: 'MVI against plain MVVM',
                    left: 'MVI',
                    right: 'MVVM as in M34',
                    rows: [
                        { aspect: 'State', left: 'One object, always', right: 'One object by convention' },
                        { aspect: 'Events', left: 'Intent objects through one entry point', right: 'Named function calls' },
                        { aspect: 'Transitions', left: 'A pure reducer', right: 'Wherever the function updates it' },
                        { aspect: 'Debugging', left: 'Log every intent and replay', right: 'Read the functions' },
                        { aspect: 'Boilerplate', left: 'More — a class per intent', right: 'Less' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The trade is real in both directions. On a complex screen with many interacting inputs, one entry point and a pure reducer is genuinely easier to reason about and to test. On a screen with three buttons it is a sealed hierarchy and a <code>when</code> standing in for three method calls.</p>'
                }
            ],
            docs: [
                { title: 'UI events', path: '/topic/architecture/ui-layer/events', kind: 'guide' },
                { title: 'State production', path: '/topic/architecture/ui-layer/state-production', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-mvi' }
            ]
        },

        {
            id: 'choosing',
            title: 'Why Google names none of them',
            importance: 'should-know',
            summary: 'The official guidance describes layers and data flow, and leaves the label alone.',
            interviewAngle: 'Noticing the omission — and why it is deliberate — is a strong senior signal.',
            buildsOn: ['mvi'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Read the architecture guide carefully and the acronyms are absent. It specifies layers, a dependency rule, a single source of truth and unidirectional data flow — and stops. That is not an oversight.</p>'
                },
                {
                    type: 'types',
                    title: 'Why the omission is deliberate',
                    items: [
                        { name: 'The names have drifted', html: '<p>Ask five developers what MVVM requires and you get five answers. Principles do not drift in the same way.</p>' },
                        { name: 'The principles are what matter', html: '<p>An app with clean layers, one source of truth and one-way flow is well built whatever it is labelled — and a badly layered app is not rescued by the label.</p>' },
                        { name: 'Screens differ', html: '<p>A settings screen and a live map do not need the same machinery. Prescribing one pattern app-wide forces ceremony where none is needed.</p>' },
                        { name: 'The boundaries blur in practice', html: '<p>Most real "MVVM" apps hold one immutable state object, which is MVI’s central idea. The line is a continuum, not a fence.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Asked "which architecture do you use?", the answer that lands is: <em>"the layered architecture Google describes — UI, optional domain, data, with dependencies pointing inward and one-way data flow. In pattern terms that is MVVM, and screens with complex interaction get a single state object and a reducer, which is MVI. I care more about who owns state than about the label."</em> That answers the question asked and the one behind it.</p>'
                }
            ],
            docs: [
                { title: 'Architecture recommendations', path: '/topic/architecture/recommendations', kind: 'guide' },
                { title: 'Architecture learning pathway', path: '/courses/pathways/android-architecture', kind: 'course' }
            ],
            relatedQuestions: [
                { topicId: 'android-architecture', questionId: 'arch-describe-last-app' },
                { topicId: 'android-architecture', questionId: 'arch-mvc-mvp-mvvm' }
            ]
        }
    ]
};
