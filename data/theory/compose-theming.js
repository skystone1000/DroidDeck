/* ==========================================================================
   M23 — Theming, Material 3, adaptive UI and accessibility.

   Grouped because they are the same concern at different scales: making one
   UI work across themes, screen sizes and abilities.
   ========================================================================== */

const composeThemingModule = {
    id: 'compose-theming',
    trackId: 'ui',
    order: 23,
    title: 'Theming and Adaptive UI',
    tagline: 'One UI that works in any theme, at any size, for any user.',
    estimatedMinutes: 30,
    prerequisites: ['compose-layout'],
    docHub: {
        title: 'Design systems in Compose',
        path: '/develop/ui/compose/designsystems'
    },

    chapters: [
        {
            id: 'theming',
            title: 'MaterialTheme and design systems',
            importance: 'should-know',
            summary: 'A theme is three CompositionLocals — colour, typography, shape — read by every component beneath it.',
            interviewAngle: '"How does theming work in Compose?" leads naturally into CompositionLocal, which is the more interesting half.',
            buildsOn: [],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>There is no theme attribute system in Compose and no XML style inheritance. <code>MaterialTheme</code> is a composable that provides three things down the tree, and components read them.</p>'
                },
                {
                    type: 'definition',
                    term: 'CompositionLocal',
                    important: true,
                    html: '<p>A mechanism for passing a value implicitly down the composition tree, so intermediate composables do not have to thread it through as a parameter. Read with <code>.current</code>, provided with <code>CompositionLocalProvider</code>.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'A theme, and a custom CompositionLocal',
                    code: `@Composable
fun AppTheme(darkTheme: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    val colors = if (darkTheme) darkColorScheme() else lightColorScheme()

    MaterialTheme(
        colorScheme = colors,
        typography = AppTypography,
        shapes = AppShapes,
        content = content
    )
}

// Reading the theme anywhere below it
Text("Hi", color = MaterialTheme.colorScheme.primary)

// Your own implicit value, for something genuinely ambient
val LocalSpacing = compositionLocalOf { Spacing() }

CompositionLocalProvider(LocalSpacing provides Spacing(gutter = 12.dp)) {
    Screen()      // anything inside can read LocalSpacing.current
}`,
                    notes: '<code>staticCompositionLocalOf</code> is cheaper but recomposes the entire subtree when it changes; <code>compositionLocalOf</code> tracks reads and recomposes only actual readers. Use static for values that essentially never change.'
                },
                {
                    type: 'pitfall',
                    html: '<p><code>CompositionLocal</code> makes a dependency invisible at the call site, which is exactly what makes it convenient and exactly what makes it hard to reason about. Reserve it for genuinely ambient, cross-cutting values — theme, spacing, locale. A ViewModel or a repository passed this way is an implicit dependency nobody can see.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>Material 3 brings <strong>dynamic colour</strong>, deriving a scheme from the user’s wallpaper on Android 12 and above. It is one call — <code>dynamicLightColorScheme(context)</code> — and it is optional: a brand with fixed colours should not use it. Either way, always read colours from <code>MaterialTheme.colorScheme</code> rather than hard-coding, or dark theme breaks.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>If your product has its own design language, you do not have to use <code>MaterialTheme</code> at all. A custom design system is your own <code>CompositionLocal</code>s plus your own components on top of Foundation — the M18 layering point applied. That is more work, and it avoids permanently fighting someone else’s opinions.</p>'
                }
            ],
            docs: [
                { title: 'Material Design 3 in Compose', path: '/develop/ui/compose/designsystems/material3', kind: 'guide' },
                { title: 'Anatomy of a theme', path: '/develop/ui/compose/designsystems/anatomy', kind: 'guide' },
                { title: 'Custom design systems', path: '/develop/ui/compose/designsystems/custom', kind: 'guide' },
                { title: 'CompositionLocal', path: '/develop/ui/compose/compositionlocal', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-composition-local' },
                { topicId: 'other-topics', questionId: 'implement-dark-theme' }
            ]
        },

        {
            id: 'adaptive-ui',
            title: 'Adaptive layouts',
            importance: 'should-know',
            summary: 'Window size classes replace "phone versus tablet" with a decision about available space.',
            interviewAngle: 'Increasingly common as foldables and large screens matter. The key point is adapting to size, not to device type.',
            buildsOn: ['theming'],
            blocks: [
                {
                    type: 'prose',
                    html: '<p>Branching on device type has never really worked, and foldables ended the argument: the same device is a phone and a tablet at different moments, and a multi-window app has whatever width the user dragged it to. The unit of decision is the <strong>window</strong>, not the device.</p>'
                },
                {
                    type: 'definition',
                    term: 'Window size class',
                    important: true,
                    html: '<p>A coarse bucket for the current window’s width and height — <code>Compact</code>, <code>Medium</code>, <code>Expanded</code> — chosen as the smallest set of breakpoints that supports meaningfully different layouts. Deliberately coarse: three cases you handle beat a continuum you approximate.</p>'
                },
                {
                    type: 'table',
                    title: 'Width classes',
                    headers: ['Class', 'Width', 'Typical device state', 'Layout'],
                    rows: [
                        ['Compact', '< 600dp', 'Phone portrait', 'Single pane, bottom navigation'],
                        ['Medium', '600–840dp', 'Tablet portrait, unfolded phone', 'Single or dual pane, navigation rail'],
                        ['Expanded', '> 840dp', 'Tablet landscape, desktop', 'Dual pane, navigation drawer']
                    ]
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Adapting on the window, not the device',
                    code: `@Composable
fun App(windowSizeClass: WindowSizeClass) {
    when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact  -> ListOnly(onSelect = ::openDetail)
        WindowWidthSizeClass.Medium,
        WindowWidthSizeClass.Expanded -> ListDetail()   // both panes at once
    }
}

// For a component that adapts to the space it is given rather than the
// whole window:
BoxWithConstraints {
    if (maxWidth < 400.dp) CompactCard() else WideCard()
}`,
                    notes: '<code>BoxWithConstraints</code> uses <code>SubcomposeLayout</code>, so its content is composed during layout. Convenient, and not free — prefer size classes at the screen level.'
                },
                {
                    type: 'prose',
                    html: '<p>Google publishes <strong>canonical layouts</strong> — list-detail, supporting pane, feed — as the patterns that adapt cleanly across these classes. Naming one in an interview is a quick way to show the answer is not improvised.</p>'
                }
            ],
            docs: [
                { title: 'Build adaptive apps', path: '/develop/adaptive-apps', kind: 'guide' },
                { title: 'Apply proven layouts', path: '/develop/adaptive-apps/guides/canonical-layouts', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-orientation-changes' }
            ]
        },

        {
            id: 'accessibility',
            title: 'Semantics and accessibility',
            importance: 'should-know',
            summary: 'Compose builds a parallel semantics tree that describes meaning — for screen readers and for tests alike.',
            interviewAngle: 'Under-asked and worth raising unprompted. The detail that lands is that semantics is also what UI tests query.',
            buildsOn: ['theming'],
            blocks: [
                {
                    type: 'definition',
                    term: 'Semantics tree',
                    important: true,
                    html: '<p>A tree built alongside the UI tree describing what each element <em>means</em> rather than how it looks — its role, its label, its state, the actions it supports. Consumed by accessibility services and by the Compose testing framework.</p>'
                },
                {
                    type: 'prose',
                    html: '<p>That dual purpose is the thing worth knowing. A screen that is accessible is also a screen that is testable, because both read the same tree. <code>onNodeWithContentDescription</code> in a test and TalkBack’s announcement come from the same source.</p>'
                },
                {
                    type: 'syntax',
                    language: 'kotlin',
                    title: 'Describing meaning',
                    code: `// A content description for anything conveying information
Icon(Icons.Default.Delete, contentDescription = "Delete item")

// null explicitly marks decoration — it is not a shortcut for "unknown"
Icon(Icons.Default.Star, contentDescription = null)

// Merge a composite into one focusable node rather than three stops
Row(Modifier.semantics(mergeDescendants = true) {
    contentDescription = "Ada Lovelace, 3 unread messages"
}) {
    Avatar(user); Text(user.name); Badge(user.unread)
}

// Minimum touch target, regardless of visual size
IconButton(onClick = {}, modifier = Modifier.size(48.dp)) { … }`,
                    notes: 'Passing <code>null</code> is a deliberate statement that an element is decorative. Passing a vague string is worse than passing null — it makes the screen reader say something meaningless.'
                },
                {
                    type: 'types',
                    title: 'The checklist worth naming',
                    items: [
                        { name: 'Content descriptions', html: '<p>On every element that conveys information; <code>null</code> on decoration.</p>' },
                        { name: 'Touch targets ≥ 48dp', html: '<p>And remember from M21 that modifier order decides whether padding counts toward it.</p>' },
                        { name: 'Contrast', html: '<p>4.5:1 for body text, 3:1 for large text.</p>' },
                        { name: 'Respect font scale', html: '<p>Use <code>sp</code> for text so it scales with the user’s setting, and do not fix heights that must grow with it.</p>' },
                        { name: 'Merge composites', html: '<p>A row that reads as one thing should be one accessibility node, not four.</p>' }
                    ]
                },
                {
                    type: 'tip',
                    html: '<p>Raising accessibility unprompted in a UI interview reads well, and the strongest form is concrete: <em>"content descriptions, 48dp targets, contrast, and honouring font scale — and semantics is what my UI tests query too, so it pays for itself twice."</em></p>'
                }
            ],
            docs: [
                { title: 'Accessibility in Compose', path: '/develop/ui/compose/accessibility', kind: 'guide' },
                { title: 'Semantics in Compose', path: '/develop/ui/compose/accessibility/semantics', kind: 'guide' }
            ],
            relatedQuestions: [
                { topicId: 'jetpack-compose', questionId: 'compose-semantics' }
            ]
        }
    ]
};
