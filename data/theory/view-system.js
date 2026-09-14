/* ==========================================================================
   M25 — The View system and interop.

   Placed after Compose deliberately. On a 2026 learning path Compose is the
   default and Views are what you meet maintaining existing code — but they
   are still interviewed heavily, because most production apps still contain
   them.
   ========================================================================== */

const viewSystemModule = {
    id: 'view-system',
    trackId: 'ui',
    order: 25,
    title: 'The View System',
    tagline: 'Still in every large codebase, and still on every interview list.',
    estimatedMinutes: 30,
    prerequisites: ['compose-layout'],
    docHub: {
        title: 'Views',
        path: '/develop/ui/views/layout/declaring-layout'
    },

    chapters: [
        {
            id: 'measure-layout-draw',
            title: 'Measure, layout, draw',
            importance: 'must-know',
            summary: 'Three traversals of the view tree, and measure can run more than once per pass.',
            interviewAngle: '"How does a custom view work?" and "why are deep hierarchies slow?" are the same question underneath.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Rendering a screen walks the view tree three times. Each traversal has one job, and a custom view participates by overriding one method per traversal.</p>'
                },
                {
                    type: 'types',
                    title: 'The three passes',
                    items: [
                        { name: 'onMeasure', html: '<p>The parent passes <code>MeasureSpec</code>s down; each view decides its size and calls <code>setMeasuredDimension</code>. May be invoked <strong>multiple times</strong> in a single layout pass.</p>' },
                        { name: 'onLayout', html: '<p>The parent assigns each child its position. A <code>ViewGroup</code> must implement this; a leaf view does not.</p>' },
                        { name: 'onDraw', html: '<p>The view renders itself onto the supplied <code>Canvas</code>. Allocating here is the classic performance mistake — it runs on every frame.</p>' }
                    ]
                },
                {
                    type: 'table',
                    title: 'The three MeasureSpec modes',
                    headers: ['Mode', 'Meaning', 'Comes from'],
                    rows: [
                        ['<code>EXACTLY</code>', 'Be precisely this size', '<code>match_parent</code>, or a fixed dp value'],
                        ['<code>AT_MOST</code>', 'Be at most this size', '<code>wrap_content</code>'],
                        ['<code>UNSPECIFIED</code>', 'Any size you like', 'A scrolling parent measuring its children']
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The multiple-measure point is the structural difference from Compose, and it is what makes deep View hierarchies expensive. A <code>LinearLayout</code> with weights measures its children <strong>twice</strong> — once to find their natural sizes, once to distribute the remaining space. Nest two of those and the inner children are measured four times; three levels, eight. Compose’s single-pass layout (M18) is precisely the fix for this.</p>'
                },
                {
                    type: 'pitfall',
                    html: '<p>Allocating in <code>onDraw</code> — a new <code>Paint</code>, a new <code>Rect</code>, a string built per frame — is the most common custom-view performance bug. It runs on every frame, so the allocations feed straight into the GC pauses from M6 and the frame budget from M7. Allocate in the constructor and reuse.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The optimisation advice follows from the passes. <code>ConstraintLayout</code> is recommended because it expresses complex relationships in a <em>flat</em> hierarchy, avoiding nesting rather than being intrinsically faster. <code>merge</code> removes a redundant wrapper. <code>ViewStub</code> defers inflation of a view that may never be shown. And <code>View.GONE</code> takes no space where <code>INVISIBLE</code> is still measured and laid out.</p>'
                }
            ],
            docs: [
                { title: 'Custom view components', path: '/develop/ui/views/layout/custom-views/custom-components', kind: 'guide' },
                { title: 'Improve layout performance', path: '/develop/ui/views/layout/improving-layouts', kind: 'guide' },
                { title: 'Performance and view hierarchies', path: '/topic/performance/rendering/optimizing-view-hierarchies', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-view' },
                { topicId: 'android', questionId: 'android-viewgroups-vs-views' },
                { topicId: 'android', questionId: 'android-custom-view' },
                { topicId: 'android', questionId: 'android-gone-vs-invisible' },
                { topicId: 'android', questionId: 'android-view-tree-optimization' },
                { topicId: 'android', questionId: 'android-optimizing-layouts' }
            ]
        },

        {
            id: 'recyclerview',
            title: 'RecyclerView',
            importance: 'must-know',
            summary: 'Four collaborating pieces — Adapter, ViewHolder, LayoutManager, and a pool of recycled views.',
            interviewAngle: 'Among the most-asked Android questions there is. "How does it work internally" wants the pool and the bind/create split.',
            buildsOn: ['measure-layout-draw'],
            blocks: [
                {
                    type: 'types',
                    title: 'The parts',
                    items: [
                        { name: 'Adapter', html: '<p>Creates view holders (<code>onCreateViewHolder</code>) and binds data into them (<code>onBindViewHolder</code>). The split is the whole point: creating inflates, binding does not.</p>' },
                        { name: 'ViewHolder', html: '<p>Caches the view references for one row, so scrolling never calls <code>findViewById</code>.</p>' },
                        { name: 'LayoutManager', html: '<p>Positions items and decides which are visible — linear, grid or staggered.</p>' },
                        { name: 'RecycledViewPool', html: '<p>Holds detached holders for reuse, keyed by view type. Shareable between several RecyclerViews, which is the fix for nested lists.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>The mechanism: as a row scrolls off, its holder is detached and put in the pool rather than destroyed. When a new row scrolls on, the pool supplies a holder of the right view type and only <code>onBindViewHolder</code> runs. Inflation — the expensive part — happens a bounded number of times regardless of list length.</p>'
                },
                {
                    type: 'comparison',
                    title: 'RecyclerView versus ListView',
                    left: 'RecyclerView',
                    right: 'ListView',
                    rows: [
                        { aspect: 'ViewHolder', left: 'Enforced by the API', right: 'A convention you had to remember' },
                        { aspect: 'Layout', left: 'Pluggable <code>LayoutManager</code>', right: 'Vertical list only' },
                        { aspect: 'Item changes', left: '<code>DiffUtil</code>, with animations', right: '<code>notifyDataSetChanged</code>, redraw everything' },
                        { aspect: 'Decoration', left: '<code>ItemDecoration</code>', right: 'A divider property' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'ListAdapter — DiffUtil without the boilerplate',
                    code: `class ItemAdapter : ListAdapter<Item, ItemViewHolder>(DIFF) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        ItemViewHolder(ItemRowBinding.inflate(inflater, parent, false))

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) =
        holder.bind(getItem(position))

    companion object {
        private val DIFF = object : DiffUtil.ItemCallback<Item>() {
            // Same entity?
            override fun areItemsTheSame(a: Item, b: Item) = a.id == b.id
            // Same contents, so no rebind needed?
            override fun areContentsTheSame(a: Item, b: Item) = a == b
        }
    }
}`,
                    notes: '<code>areItemsTheSame</code> is identity, <code>areContentsTheSame</code> is equality — the same distinction as <code>key</code> versus recomposition in a <code>LazyColumn</code> (M22). Mixing them up gives you either no animations or the wrong ones.'
                },
                {
                    type: 'types',
                    title: 'The optimisation answers',
                    items: [
                        { name: 'setHasFixedSize(true)', html: '<p>Tells RecyclerView its own size will not change with content, so item changes skip a full re-layout.</p>' },
                        { name: 'DiffUtil / ListAdapter', html: '<p>Update only what changed instead of <code>notifyDataSetChanged</code>.</p>' },
                        { name: 'Shared RecycledViewPool', html: '<p>For nested lists, so inner lists share holders instead of each keeping its own.</p>' },
                        { name: 'setItemViewCacheSize', html: '<p>Keeps recently detached holders bound, avoiding a rebind on small scroll reversals.</p>' },
                        { name: 'Flat item layouts', html: '<p>Each row is measured and laid out per bind, so depth costs multiply by list length.</p>' }
                    ]
                }
            ],
            docs: [
                { title: 'Create dynamic lists with RecyclerView', path: '/develop/ui/views/layout/recyclerview', kind: 'guide' },
                { title: 'Improve layout performance', path: '/develop/ui/views/layout/improving-layouts', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-recyclerview-how-it-works' },
                { topicId: 'android', questionId: 'android-recyclerview-components' },
                { topicId: 'android', questionId: 'android-adapter-viewholder-role' },
                { topicId: 'android', questionId: 'android-layoutmanager' },
                { topicId: 'android', questionId: 'android-listview-vs-recyclerview' },
                { topicId: 'android', questionId: 'android-diffutil' },
                { topicId: 'android', questionId: 'android-sethasfixedsize' },
                { topicId: 'android', questionId: 'android-nested-recyclerview-optimization' },
                { topicId: 'android', questionId: 'android-recyclerview-optimization' }
            ]
        },

        {
            id: 'interop-and-migration',
            title: 'Interop and migration',
            importance: 'should-know',
            summary: 'Compose and Views can be nested in either direction, which is what makes incremental migration possible.',
            interviewAngle: '"How would you introduce Compose into an existing app?" — a strategy question, not an API question.',
            buildsOn: ['recyclerview'],
            blocks: [
                {
                    type: 'types',
                    title: 'The two directions',
                    items: [
                        { name: 'ComposeView', html: '<p>A <code>View</code> hosting composables. Drop it into an XML layout, or set it as an Activity’s content with <code>setContent</code>.</p>', whenToUse: 'adding Compose to an existing screen' },
                        { name: 'AndroidView', html: '<p>A composable hosting a <code>View</code>. Takes a <code>factory</code> to create it and an <code>update</code> lambda invoked on recomposition.</p>', whenToUse: 'a View with no Compose equivalent — MapView, a charting library, AdView' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Both directions',
                    code: `// A View inside Compose
@Composable
fun Chart(points: List<Point>, modifier: Modifier = Modifier) {
    AndroidView(
        modifier = modifier,
        factory = { context -> ChartView(context) },   // called once
        update = { view -> view.setPoints(points) }    // on every recomposition
    )
}

// Compose inside a Fragment's view hierarchy
override fun onCreateView(...) = ComposeView(requireContext()).apply {
    setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnViewTreeLifecycleDestroyed)
    setContent { AppTheme { ProfileScreen() } }
}`,
                    notes: 'The composition strategy matters in a Fragment: the default disposes when the <em>window</em> detaches, which outlives the fragment’s view. The lifecycle-based strategy is what prevents a leak.'
                },
                {
                    type: 'types',
                    title: 'A migration strategy worth describing',
                    items: [
                        { name: 'Start with leaves', html: '<p>New screens in Compose, and self-contained components — an empty state, a list row — before anything structural.</p>' },
                        { name: 'Migrate a screen at a time', html: '<p>Not half a screen. A mixed screen pays interop costs on both sides and is harder to reason about than either.</p>' },
                        { name: 'Share the design system first', html: '<p>Make the Compose theme match the existing XML theme early, so a half-migrated app does not look half-migrated.</p>' },
                        { name: 'Leave working code alone', html: '<p>A stable, complex screen nobody touches is the last thing to migrate, not the first.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>The answer that reads as experience rather than enthusiasm: <em>"new screens in Compose, migrate old ones when I am already changing them, and unify the theme early so the app does not look half-done."</em> Proposing a big-bang rewrite reads as the opposite.</p>'
                }
            ],
            docs: [
                { title: 'Migrate to Compose', path: '/develop/ui/compose/migrate/migrate-xml-views-to-jetpack-compose', kind: 'guide' },
                { title: 'Migration strategy', path: '/develop/ui/compose/migrate/strategy', kind: 'guide' },
                { title: 'Interoperability APIs', path: '/develop/ui/compose/migrate/interoperability-apis', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-with-views' },
                { topicId: 'jetpack-compose', questionId: 'compose-vs-view-system' },
                { topicId: 'android', questionId: 'android-data-binding' }
            ]
        }
    ]
};
