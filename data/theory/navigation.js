/* ==========================================================================
   M24 — Navigation.

   Covers Navigation 2 because that is what existing codebases use, and
   Navigation 3 because it is what interviewers now ask about.
   ========================================================================== */

const navigationModule = {
    id: 'navigation',
    trackId: 'ui',
    order: 24,
    title: 'Navigation',
    tagline: 'One back stack, owned by one component.',
    estimatedMinutes: 25,
    prerequisites: ['compose-state'],
    docHub: {
        title: 'Navigation',
        path: '/guide/navigation'
    },

    chapters: [
        {
            id: 'principles',
            title: 'Principles and the back stack',
            importance: 'must-know',
            summary: 'A fixed start destination, a stack that records the path, and Up that is not always Back.',
            interviewAngle: 'The Up-versus-Back distinction is the classic question, and it is genuinely subtle.',
            buildsOn: [],
            blocks: [
                {
                    type: 'types',
                    title: 'The principles Google states',
                    items: [
                        { name: 'A fixed start destination', html: '<p>Every app has one screen users reach first and last. Backing out from anywhere eventually lands there, then exits.</p>' },
                        { name: 'The stack represents the path', html: '<p>Destinations are pushed as the user moves. The stack is the history of how they got here, not a hierarchy of where things live.</p>' },
                        { name: 'Up never leaves the app', html: '<p>Up is bounded by the app; Back is not.</p>' }
                    ]
                },
                {
                    type: 'comparison',
                    title: 'Up versus Back',
                    left: 'Up (app bar)',
                    right: 'Back (system)',
                    rows: [
                        { aspect: 'Scope', left: 'Within the app', right: 'Across the whole system' },
                        { aspect: 'Leaves the app', left: 'Never', right: 'Yes, at the start destination' },
                        { aspect: 'Follows', left: 'The screen hierarchy', right: 'The actual history' },
                        { aspect: 'Deep link entry', left: 'Synthesises the parent chain', right: 'Returns to the referring app' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The deep-link row is where they visibly diverge. Arrive at a product screen from a link in an email: pressing <strong>Back</strong> returns you to the email app, because that is what actually happened. Pressing <strong>Up</strong> takes you to the product list, a screen you never visited, because that is where the product sits in the app’s hierarchy.</p>'
                },
                {
                    type: 'definition',
                    term: 'Predictive back',
                    html: '<p>The gesture that previews the destination behind the current screen as the user drags. Requires opting in and handling back through the <code>OnBackPressedDispatcher</code> rather than by overriding <code>onBackPressed</code>, which is deprecated.</p>'
                }
            ],
            docs: [
                { title: 'Principles of navigation', path: '/guide/navigation/principles', kind: 'guide' },
                { title: 'Predictive back gesture', path: '/guide/navigation/custom-back/predictive-back-gesture', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-launch-modes' }
            ]
        },

        {
            id: 'navigation-compose',
            title: 'Navigation in Compose',
            importance: 'must-know',
            summary: 'A NavHost maps routes to composables, and type-safe routes replaced string building.',
            interviewAngle: '"How do you pass data between screens?" — the expected answer is an id, not an object.',
            buildsOn: ['principles'],
            blocks: [
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Type-safe routes',
                    code: `// Routes are serializable types, not strings — the compiler checks them.
@Serializable data object FeedRoute
@Serializable data class DetailRoute(val itemId: String)

@Composable
fun AppNav(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = FeedRoute) {

        composable<FeedRoute> {
            Feed(onOpen = { id -> navController.navigate(DetailRoute(id)) })
        }

        composable<DetailRoute> { entry ->
            val route: DetailRoute = entry.toRoute()
            Detail(itemId = route.itemId)
        }
    }
}`,
                    notes: 'Type-safe navigation replaced hand-built route strings like <code>"detail/\$id"</code>, which failed at runtime when an argument was missing or misspelled.'
                },
                {
                    type: 'pitfall',
                    html: '<p>Pass an <strong>id</strong>, not an object. Arguments are serialised into the back stack entry and survive process death, so a large object is both a serialisation cost and a stale copy of data the destination should be reading from the repository.</p>'
                },
                {
                    type: 'types',
                    title: 'Things worth knowing',
                    items: [
                        { name: 'Hoist the NavController', html: '<p>Screens should take lambdas — <code>onOpen: (String) -> Unit</code> — not a <code>NavController</code>. That keeps them previewable and testable, and is state hoisting from M19 applied to navigation.</p>' },
                        { name: 'Scoping a ViewModel to a graph', html: '<p>A nested navigation graph can own a <code>ViewModel</code> shared by its destinations and cleared when the graph is popped — the modern answer to sharing state between screens.</p>' },
                        { name: 'popUpTo and launchSingleTop', html: '<p>Control what the navigation does to the stack: clear up to a destination, or avoid stacking duplicates of the same screen.</p>' },
                        { name: 'Multiple back stacks', html: '<p>Bottom navigation where each tab remembers its own history — supported, and a common follow-up question.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Navigation', path: '/guide/navigation', kind: 'guide' },
                { title: 'Type safety in navigation', path: '/guide/navigation/design/type-safety', kind: 'guide' },
                { title: 'Multiple back stacks', path: '/guide/navigation/backstack/multi-back-stacks', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-navigation' }
            ]
        },

        {
            id: 'navigation-3',
            title: 'Navigation 3',
            importance: 'should-know',
            summary: 'The back stack becomes a list you own, instead of state hidden inside a NavController.',
            interviewAngle: 'A current-events question. Knowing what problem it solves matters more than knowing the API.',
            buildsOn: ['navigation-compose'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Navigation 2 was designed for Fragments and adapted to Compose. That left a mismatch: Compose is built on state you own and render from, while the <code>NavController</code> keeps the back stack <em>inside itself</em> and hands you callbacks. Anything requiring two destinations visible at once — a list-detail layout on a tablet — fought the model.</p>'
                },
                {
                    type: 'comparison',
                    title: 'The change',
                    left: 'Navigation 2',
                    right: 'Navigation 3',
                    rows: [
                        { aspect: 'Back stack', left: 'Owned by <code>NavController</code>', right: 'A list you own and mutate' },
                        { aspect: 'Model', left: 'Imperative — <code>navigate()</code>', right: 'Declarative — render the stack' },
                        { aspect: 'Two panes at once', left: 'Awkward', right: 'Native, via scenes' },
                        { aspect: 'State ownership', left: 'Framework', right: 'Yours' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Making the stack an ordinary observable list means navigation state is just state: hoistable, testable, and adaptable at will. A window size class change can render the top two entries side by side instead of one — which is the adaptive-layout problem from M23 and the navigation problem turning out to be the same problem.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>If asked whether to migrate: Navigation 2 is not going away, and rewriting working navigation for its own sake is rarely justified. The honest answer is that Navigation 3 earns its keep on adaptive, multi-pane UIs, and that new projects targeting large screens are where it makes sense first.</p>'
                }
            ],
            docs: [
                { title: 'Navigation 3 overview', path: '/guide/navigation/navigation-3', kind: 'guide' },
                { title: 'Understand the basics', path: '/guide/navigation/navigation-3/basics', kind: 'guide' },
                { title: 'Migrate from Navigation 2', path: '/guide/navigation/navigation-3/migration-guide', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-navigation' }
            ]
        }
    ]
};
