/* ==========================================================================
   M22 — Lists and Compose performance.

   Lazy layouts and performance are one module because the list is where
   Compose performance problems actually show up, and where the M19
   stability material stops being theoretical.
   ========================================================================== */

const composeListsPerformanceModule = {
    id: 'compose-lists-performance',
    trackId: 'ui',
    order: 22,
    title: 'Lists and Performance',
    tagline: 'A LazyColumn is not a RecyclerView, and the difference matters.',
    estimatedMinutes: 30,
    prerequisites: ['compose-layout', 'compose-state'],
    docHub: {
        title: 'Lists and grids',
        path: '/develop/ui/compose/lists'
    },

    chapters: [
        {
            id: 'lazy-layouts',
            title: 'Lazy layouts',
            importance: 'must-know',
            summary: 'Only visible items are composed, and item content is declared in a DSL rather than bound to a recycled holder.',
            interviewAngle: '"How is LazyColumn different from RecyclerView?" — no ViewHolder, no adapter, no binding step.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>A <code>Column</code> composes every child, so it is fine for ten items and disastrous for a thousand. A <code>LazyColumn</code> composes only what is visible plus a small buffer, and discards items as they scroll away.</p>'
                },
                {
                    type: 'comparison',
                    title: 'LazyColumn versus RecyclerView',
                    left: 'LazyColumn',
                    right: 'RecyclerView',
                    rows: [
                        { aspect: 'Item definition', left: 'A DSL block — <code>items(list) { }</code>', right: 'An <code>Adapter</code> plus a <code>ViewHolder</code>' },
                        { aspect: 'Reuse model', left: 'Composition is discarded and rebuilt', right: 'View instances are recycled and rebound' },
                        { aspect: 'Diffing', left: 'Recomposition, keyed by <code>key</code>', right: '<code>DiffUtil</code> / <code>ListAdapter</code>' },
                        { aspect: 'View types', left: '<code>contentType</code>, a reuse hint', right: '<code>getItemViewType</code>, required' },
                        { aspect: 'Boilerplate', left: 'Almost none', right: 'Adapter, holder, layout file, binding' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The important conceptual difference is that Compose does not recycle <em>views</em>. There is no holder to rebind, so the whole class of "the wrong data appeared in a recycled row" bug does not exist. What Compose reuses is the <strong>slot table structure</strong>, which is what <code>contentType</code> hints at.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The DSL, with keys and content types',
                    code: `LazyColumn(
    contentPadding = PaddingValues(16.dp),
    verticalArrangement = Arrangement.spacedBy(8.dp)
) {
    item { Header() }                       // a single item

    items(
        items = feed,
        key = { it.id },                    // stable identity — see below
        contentType = { it::class }         // reuse hint for mixed content
    ) { entry ->
        FeedRow(entry)
    }

    itemsIndexed(footers) { index, footer -> FooterRow(index, footer) }
}`
                },
                {
                    type: 'definition',
                    term: 'key',
                    important: true,
                    html: '<p>A stable identity for an item. Without it, Compose identifies items by <strong>position</strong>, so inserting at the top makes every subsequent item look changed — state moves to the wrong row and animations are wrong.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Omitting <code>key</code> is the single most common <code>LazyColumn</code> mistake. Symptoms: a checkbox stays ticked on the wrong row after an insert, scroll position jumps, and item animations look scrambled. Keys must be unique and stable — an index is neither.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Never nest a <code>LazyColumn</code> inside a scrolling <code>Column</code> — it throws, because the lazy layout is given infinite height constraints and cannot decide what is visible. Use a single <code>LazyColumn</code> with multiple <code>item</code> blocks instead.</p>'
                }
            ],
            docs: [
                { title: 'Lists and grids', path: '/develop/ui/compose/lists', kind: 'guide' },
                { title: 'Compose performance', path: '/develop/ui/compose/performance', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-recyclerview-how-it-works' },
                { topicId: 'android', questionId: 'android-diffutil' },
                { topicId: 'android', questionId: 'android-multiple-view-types' },
                { topicId: 'jetpack-compose', questionId: 'compose-vs-view-system' }
            ]
        },

        {
            id: 'performance-practices',
            title: 'Making Compose fast',
            importance: 'must-know',
            summary: 'Defer reads, keep parameters stable, and avoid work in the composition — in that order.',
            interviewAngle: '"How would you fix a janky Compose screen?" A good answer starts with measuring, not with a list of tricks.',
            buildsOn: ['lazy-layouts'],
            blocks: [
                {
                    type: 'types',
                    title: 'The techniques, most effective first',
                    items: [
                        {
                            name: 'Defer the read',
                            html: '<p>Move a frequently-changing state read into a lambda so it happens at layout or draw instead of composition — the M18 point. This is where the big wins are.</p>'
                        },
                        {
                            name: 'Fix stability',
                            html: '<p>An unstable parameter means the composable never skips. Usually a <code>List</code>: wrap it in an <code>@Immutable</code> state class or use <code>ImmutableList</code>.</p>'
                        },
                        {
                            name: 'Keys on lazy items',
                            html: '<p>Correctness first, performance second — but it is also what lets Compose reuse rather than rebuild.</p>'
                        },
                        {
                            name: 'Move work out of composition',
                            html: '<p>Sorting, filtering and formatting belong in the ViewModel or behind <code>remember</code>, not in the composable body where they run on every recomposition.</p>'
                        },
                        {
                            name: 'derivedStateOf',
                            html: '<p>Where a noisy input drives a quiet output — the scroll-position case from M19.</p>'
                        },
                        {
                            name: 'Baseline profiles',
                            html: '<p>Compose is a library, so its code is JIT-compiled on first run. A baseline profile pre-compiles the hot paths and is one of the largest first-launch wins available.</p>'
                        }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Work in the wrong place',
                    code: `// Sorts on every recomposition — including every scroll frame.
@Composable
fun Feed(items: List<Item>, query: String) {
    val visible = items.filter { it.matches(query) }.sortedBy { it.date }
    LazyColumn { items(visible, key = { it.id }) { Row(it) } }
}

// Recomputed only when an input actually changes.
@Composable
fun Feed(items: ImmutableList<Item>, query: String) {
    val visible = remember(items, query) {
        items.filter { it.matches(query) }.sortedBy { it.date }
    }
    LazyColumn { items(visible, key = { it.id }) { Row(it) } }
}

// Better still: the ViewModel already has a coroutine and a Flow. Do it
// there, and let the composable render what it is given.`
                },
                {
                    type: 'types',
                    title: 'How to measure, rather than guess',
                    items: [
                        { name: 'Layout Inspector', html: '<p>Shows recomposition and skip counts per composable, live. The fastest way to find something recomposing when it should not.</p>' },
                        { name: 'Compose compiler metrics', html: '<p>A build-time report of which composables are skippable and which classes are stable, with the reason.</p>' },
                        { name: 'Macrobenchmark and JankStats', html: '<p>Frame timing on a real device. The only measurement that reflects what a user experiences.</p>' },
                        { name: 'A release build', html: '<p>Debug builds are dramatically slower for Compose — the compiler skips optimisations and there is no baseline profile. Never judge performance from a debug build.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>That last point causes real confusion. A screen that stutters in debug is frequently fine in release. Profiling the wrong build has sent plenty of people optimising code that was never slow.</p>'
                },
                {
                    type: 'tip',
                    html: '<p>Answer the janky-screen question in order: <em>"measure on a release build first — Layout Inspector for recomposition counts, then compiler metrics for stability. Then defer reads, fix unstable parameters, and move work out of composition."</em> Leading with measurement is what distinguishes the answer.</p>'
                }
            ],
            docs: [
                { title: 'Compose performance', path: '/develop/ui/compose/performance', kind: 'guide' },
                { title: 'Baseline profiles overview', path: '/topic/performance/baselineprofiles/overview', kind: 'guide' },
                { title: 'Tooling for Compose', path: '/develop/ui/compose/tooling', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-performance-optimization' },
                { topicId: 'android', questionId: 'android-recyclerview-optimization' },
                { topicId: 'other-topics', questionId: 'app-performance-metrics' }
            ]
        }
    ]
};
