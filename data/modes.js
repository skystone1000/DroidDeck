/* ==========================================================================
   Mode registry.

   Five modes sit side by side in the rail, and until now four of the five
   answers about each of them lived in a different file: the router knew the
   routes, the sidebar knew the labels, progress.js knew the counters, and
   theory.js privately owned the glossary. A sixth mode meant editing all four.

   This array is the whole answer. Everything downstream — the rail, the
   contextual sidebar, the mode header, the keyboard map, search grouping and
   the persistence keys — reads it and nothing else.

   Three fields deserve a note.

   `progressNoun` exists because the five modes do not share a unit. Questions
   are known, chapters are read, prompts are rehearsed, snippets are solved,
   terms are seen. A combined number across those five would be meaningless,
   which is why there is no global total anywhere in this file and must never
   be one.

   `accentVar` is a token name, not a colour. The rail is the only place accent
   appears outside body content, and painting it from a literal would break the
   rule that css/themes.css holds every colour the app uses.

   `group` drives the one divider in the rail: two study modes above it, three
   drill modes below. It is load-bearing rather than decoration — the divider
   is what tells a reader that Questions and Theory are places to learn and the
   other three are places to be tested.
   ========================================================================== */

const appModes = [
    {
        id: 'questions',
        route: 'questions',
        railOrder: 1,
        key: '1',
        group: 'study',
        title: 'Questions',
        shortLabel: 'Questions',
        icon: '?',
        accentVar: '--accent-500',
        sidebar: 'tracks',
        progressNoun: 'KNOWN',
        storageKey: 'droiddeck:questions:done'
    },
    {
        id: 'theory',
        route: 'theory',
        railOrder: 2,
        key: '2',
        group: 'study',
        title: 'Theory',
        shortLabel: 'Theory',
        icon: '¶',
        accentVar: '--accent-500',
        sidebar: 'tracks',
        progressNoun: 'READ',
        storageKey: 'droiddeck:theory:chapters'
    },
    {
        id: 'synthesis',
        route: 'synthesis',
        railOrder: 3,
        key: '3',
        group: 'drill',
        /* Never abbreviated in the header, in search results, or in a URL. The
           rail is 84px wide and its 11px label is the only place the short form
           is allowed to appear. */
        title: 'Interview Synthesis',
        shortLabel: 'Synthesis',
        icon: '◎',
        accentVar: '--hue-fuchsia-ink',
        sidebar: 'rounds',
        trackId: 'synthesis',
        progressNoun: 'REHEARSED',
        storageKey: 'droiddeck:synthesis:rehearsed'
    },
    {
        id: 'predict',
        route: 'predict',
        railOrder: 4,
        key: '4',
        group: 'drill',
        title: 'Predict the Output',
        shortLabel: 'Predict',
        icon: '>_',
        /* The specification asks for #6EE7B7, which is emerald-300 and is not
           in the nine-hue ramp. css/themes.css says in writing that no tenth
           hue may be introduced, so this takes the nearest member of the set. */
        accentVar: '--hue-teal-ink',
        sidebar: 'sets',
        trackId: 'output',
        progressNoun: 'SOLVED',
        storageKey: 'droiddeck:predict:verdicts'
    },
    {
        id: 'glossary',
        route: 'glossary',
        railOrder: 5,
        key: '5',
        group: 'drill',
        title: 'Glossary',
        shortLabel: 'Glossary',
        icon: 'Aa',
        accentVar: '--hue-slate-ink',
        sidebar: 'alphabet',
        progressNoun: 'SEEN',
        storageKey: 'droiddeck:glossary:seen'
    }
];

const modeById = appModes.reduce((map, mode) => {
    map[mode.id] = mode;
    return map;
}, {});

function modeForRoute(segment) {
    return appModes.find((mode) => mode.route === segment) || null;
}

function modeForKey(key) {
    return appModes.find((mode) => mode.key === String(key)) || null;
}
