/* ==========================================================================
   M21 — Modifiers and layout.

   Modifier order is the most common source of "why does this look wrong",
   and the measure/place contract is what makes custom layout tractable.
   ========================================================================== */

const composeLayoutModule = {
    id: 'compose-layout',
    trackId: 'ui',
    order: 21,
    title: 'Modifiers and Layout',
    tagline: 'Order matters, and layout is a single pass.',
    estimatedMinutes: 30,
    prerequisites: ['compose-mental-model'],
    docHub: {
        title: 'Layouts in Compose',
        path: '/develop/ui/compose/layouts'
    },

    chapters: [
        {
            id: 'modifiers',
            title: 'Modifiers, and why order matters',
            importance: 'must-know',
            summary: 'A modifier chain is an ordered list applied outside-in, so padding before background is not padding after it.',
            interviewAngle: 'Reliably asked, usually as a code-reading question: "what is the difference between these two chains?"',
            buildsOn: [],
            blocks: [
                {
                    type: 'definition',
                    term: 'Modifier',
                    important: true,
                    html: '<p>An ordered, immutable collection of elements that decorate a composable — size, padding, background, click handling, semantics. Each call returns a <strong>new</strong> chain; nothing is mutated.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>The chain is applied from the outside in: the first modifier wraps everything after it. That single rule explains every "why does it look wrong" question about modifiers.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'The same two modifiers, two results',
                    code: `// Padding OUTSIDE the background: the background is inset, and the
// padded area is transparent.
Box(
    Modifier
        .padding(16.dp)
        .background(Color.Red)
        .size(100.dp)
)

// Padding INSIDE the background: the background fills the full area and
// the content is inset within it.
Box(
    Modifier
        .background(Color.Red)
        .padding(16.dp)
        .size(100.dp)
)

// Clickable before padding: only the unpadded area responds to taps —
// a smaller touch target than it looks.
Modifier.clickable { }.padding(16.dp)

// Clickable after padding: the padding is part of the touch target.
Modifier.padding(16.dp).clickable { }`,
                    notes: 'The clickable case is an accessibility issue as much as a visual one — touch targets should be at least 48dp, and modifier order decides whether the padding counts.'
                },
                {
                    type: 'types',
                    title: 'Conventions worth following',
                    items: [
                        { name: 'Accept a Modifier parameter', html: '<p>Every reusable composable should take <code>modifier: Modifier = Modifier</code> as its first optional parameter and apply it to its root. Without it, callers cannot position your component.</p>' },
                        { name: 'Apply it to the root only', html: '<p>Passing the caller’s modifier to an inner element makes the composable behave unpredictably from outside.</p>' },
                        { name: 'Never store one in a variable across composables', html: '<p>Chains are cheap to build; a shared modifier hides where the decoration came from.</p>' }
                    ]
                },
                {
                    type: 'prose',
                    html: '<p>Modifiers are implemented as <code>Modifier.Node</code>, a lower-level API that replaced the older composed-modifier approach. Most code never touches it, but it is the reason a modern modifier can participate in layout and draw without allocating on every recomposition — worth knowing exists if performance comes up.</p>'
                }
            ],
            docs: [
                { title: 'Compose modifiers', path: '/develop/ui/compose/modifiers', kind: 'guide' },
                { title: 'Modifiers list', path: '/develop/ui/compose/modifiers-list', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-modifier' },
                { topicId: 'jetpack-compose', questionId: 'compose-user-input' }
            ]
        },

        {
            id: 'standard-layouts',
            title: 'The standard layouts',
            importance: 'must-know',
            summary: 'Column, Row and Box cover most screens; ConstraintLayout is for the rest, and it is not a performance fix.',
            interviewAngle: '"When would you use ConstraintLayout in Compose?" The Views answer — flattening the hierarchy — does not apply here.',
            buildsOn: ['modifiers'],
            blocks: [
                {
                    type: 'types',
                    title: 'The three primitives',
                    items: [
                        { name: 'Column', html: '<p>Children vertically. <code>verticalArrangement</code> distributes along the main axis, <code>horizontalAlignment</code> across it.</p>' },
                        { name: 'Row', html: '<p>Children horizontally. Same two parameters with the axes swapped.</p>' },
                        { name: 'Box', html: '<p>Children stacked, later ones on top. <code>contentAlignment</code> positions them; <code>Modifier.align</code> overrides per child.</p>' }
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Arrangement, alignment and weight',
                    code: `Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(8.dp),
    verticalAlignment = Alignment.CenterVertically
) {
    Text("Label")
    Spacer(Modifier.weight(1f))       // takes all remaining space
    Icon(Icons.Default.Check, null)
}

// weight divides the space left after unweighted children are measured
Row {
    Box(Modifier.weight(2f))          // two thirds
    Box(Modifier.weight(1f))          // one third
}`,
                    notes: '<code>Arrangement.spacedBy</code> is preferable to padding each child — it puts gaps <em>between</em> items without a trailing gap at the end.'
                },
                {
                    type: 'pitfall',
                    html: '<p>In the View system, <code>ConstraintLayout</code> is recommended partly to flatten deep hierarchies, because nesting costs multiple measure passes. Compose layout is single-pass (M18), so <strong>nesting is not expensive</strong> and that argument does not carry over. Use <code>ConstraintLayout</code> in Compose when the relationships between elements are genuinely complex — not to avoid nesting.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Intrinsic measurements are the escape hatch when a parent needs to know a child’s size before deciding its own — <code>IntrinsicSize.Min</code> on a <code>Row</code> to make two dividers the same height, for instance. They cost an extra measurement pass for that subtree, which is the one place the single-pass guarantee is relaxed, and only where you ask for it.</p>'
                }
            ],
            docs: [
                { title: 'Layout basics', path: '/develop/ui/compose/layouts/basics', kind: 'guide' },
                { title: 'ConstraintLayout in Compose', path: '/develop/ui/compose/layouts/constraintlayout', kind: 'guide' },
                { title: 'Intrinsic measurements', path: '/develop/ui/compose/layouts/intrinsic-measurements', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'android', questionId: 'android-constraintlayout-optimization' },
                { topicId: 'android', questionId: 'android-relative-vs-linear-layout' }
            ]
        },

        {
            id: 'custom-layout',
            title: 'Custom layouts',
            importance: 'should-know',
            summary: 'Measure children under constraints, decide your own size, place them — one pass, and each child measured once.',
            interviewAngle: '"How would you build a flow layout?" is a common practical exercise, and the measure/place contract is the whole answer.',
            buildsOn: ['standard-layouts'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>The <code>Layout</code> composable gives you the measure/place contract directly. The rules are strict and short: measure each child <strong>exactly once</strong>, then report your own size, then place the children.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A custom layout, start to finish',
                    code: `@Composable
fun VerticalStack(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Layout(content = content, modifier = modifier) { measurables, constraints ->
        // 1. Measure each child once, under the incoming constraints.
        val placeables = measurables.map { it.measure(constraints) }

        // 2. Decide our own size from what the children reported.
        val width = placeables.maxOfOrNull { it.width } ?: 0
        val height = placeables.sumOf { it.height }

        // 3. Report the size, then place the children within it.
        layout(width, height) {
            var y = 0
            placeables.forEach { placeable ->
                placeable.placeRelative(x = 0, y = y)
                y += placeable.height
            }
        }
    }
}`,
                    notes: '<code>placeRelative</code> respects layout direction, mirroring automatically for right-to-left locales. <code>place</code> does not — use it only when the position is genuinely direction-independent.'
                },
                {
                    type: 'definition',
                    term: 'Constraints',
                    html: '<p>The min and max width and height a parent permits. A child measures itself within them and reports its chosen size; the parent cannot force a size, only bound one.</p>'
                },
                {
                    type: 'types',
                    title: 'Related escape hatches',
                    items: [
                        { name: 'Modifier.layout', html: '<p>Adjusts the measurement of a single child without writing a whole layout.</p>' },
                        { name: 'SubcomposeLayout', html: '<p>Composes children <em>during</em> layout, so their content can depend on measurements. Powerful and expensive — <code>BoxWithConstraints</code> is built on it.</p>', whenToUse: 'rarely; it defers composition into the layout phase and costs the phase separation' },
                        { name: 'Alignment lines', html: '<p>Let a parent align children by something other than their bounds — text baselines being the usual case.</p>' }
                    ]
                },
                {
                    type: 'pitfall',
                    html: '<p>Measuring a child twice throws at runtime. If a layout genuinely needs a child’s size before deciding constraints, that is what intrinsics or <code>SubcomposeLayout</code> are for — the single-measure rule is enforced, not advisory.</p>'
                }
            ],
            docs: [
                { title: 'Custom layouts', path: '/develop/ui/compose/layouts/custom', kind: 'guide' },
                { title: 'Alignment lines', path: '/develop/ui/compose/layouts/alignment-lines', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-custom-layouts' },
                { topicId: 'android', questionId: 'android-custom-view' }
            ]
        }
    ]
};
