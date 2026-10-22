/* ==========================================================================
   Navigation — hash routing, the category marks, and the mobile drawer.

   The URL hash is the single source of truth for what is on screen. Five
   reserved first segments, one per mode, declared in data/modes.js:

       #questions/<topicId>[/<subsectionId>][?tier=...]
       #theory/<moduleId>[/<chapterId>][?cram]
       #synthesis/<moduleId>[/<drillId>]
       #predict/<moduleId>[/<snippetId>]
       #glossary[?letter=K][?track=async]

   Sidebar rendering moved to js/sidebar.js when the sidebar stopped belonging
   to the app and started belonging to whichever mode is active. What is left
   here decides *what* is on screen; that file decides how to get to the rest
   of it.
   ========================================================================== */

/* Category marks.

   Emoji rendered differently on every operating system, carried no meaning
   relationship to each other, and could not be tinted, printed or shrunk. They
   are replaced by monogram tiles: two letters, one shape, one hue.

   Hue is the load-bearing part. There are nine of them and no tenth may be
   introduced, so the fourteen question topics share by kinship rather than by
   exhaustion — a topic takes the hue of the theory track its subject belongs
   to. Java sits with Kotlin because both are Language Foundations; Design
   Pattern sits with Architecture because that is where its theory module lives.
   The monogram, not the hue, is what tells a shared pair apart.

   That kinship used to be written down twice: once here as a colour, and once
   in nobody's file as the reason for the colour. It now lives in `topicTracks`
   (data/index.js) as a track id, and the hue is derived from it — so these
   marks carry only the thing that is genuinely per-topic, the monogram. */
const topicMarks = {
    'kotlin-coroutines':          { monogram: 'Co' },
    'kotlin-flow-api':            { monogram: 'Fl' },
    'kotlin':                     { monogram: 'Kt' },
    'android':                    { monogram: 'An' },
    'android-libraries':          { monogram: 'Lb' },
    'android-architecture':       { monogram: 'Ar' },
    'design-pattern':             { monogram: 'Dp' },
    'android-system-design':      { monogram: 'Sd' },
    'android-unit-testing':       { monogram: 'Ut' },
    'android-tools-technologies': { monogram: 'Tt' },
    'jetpack-compose':            { monogram: 'Jc' },
    'java':                       { monogram: 'Jv' },
    'other-topics':               { monogram: 'Ot' },
    'data-structures-algorithms': { monogram: 'Ds' }
};

/* The theory tracks are the set the design system names directly. */
const trackMarks = {
    language:     { monogram: 'Kt', hue: 'violet' },
    async:        { monogram: 'Co', hue: 'sky' },
    platform:     { monogram: 'An', hue: 'lime' },
    ui:           { monogram: 'UI', hue: 'pink' },
    data:         { monogram: 'Da', hue: 'amber' },
    architecture: { monogram: 'Ar', hue: 'indigo' },
    quality:      { monogram: 'Te', hue: 'rose' },
    synthesis:    { monogram: 'Sy', hue: 'fuchsia' },
    output:       { monogram: 'Po', hue: 'teal' }
};

const GLOSSARY_MARK = { monogram: 'Gl', hue: 'slate' };

/** 28px, radius 8, monogram in mono 11/500, fill at ~14% alpha of the hue.
    Hidden from assistive tech: the label beside it already names the thing.

    Hue arrives as an argument rather than riding on the mark, because a topic's
    hue is a property of its track and only the caller knows which track is in
    hand. */
function markTile(mark, hue) {
    const monogram = (mark && mark.monogram) || GLOSSARY_MARK.monogram;
    return `<span class="cat-tile" data-hue="${hue || GLOSSARY_MARK.hue}" aria-hidden="true">${monogram}</span>`;
}

/** The hue a track paints with — its tile, its heading, its progress bar. */
function trackHue(trackId) {
    return (trackMarks[trackId] || GLOSSARY_MARK).hue;
}

/** The hue a topic paints with, for anything outside the tile itself — the
    track heading, the progress bar, the count that follows it. Derived from
    the topic's track, so the colour and the kinship cannot disagree. */
function topicHue(topicId) {
    const trackId = (typeof topicTracks === 'undefined') ? null : topicTracks[topicId];
    return trackId ? trackHue(trackId) : GLOSSARY_MARK.hue;
}

const CHEVRON_SVG =
    '<svg class="nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>';

/* --------------------------------------------------------------------------
   Routing
   -------------------------------------------------------------------------- */

/* The question bank's importance filter lives in the hash, like theory's cram
   mode and for the same reason: a filter that resets on navigation is useless
   for revision, and a filtered session should be shareable.

   The tiers are independent, not a floor. Any one can be selected, and any
   combination — must-know alone to drill the short list, should-know alone to
   find the gaps you have been skipping, must and good together if that is what
   an evening calls for. `?tier=must,should` is the whole state.

   Selecting every tier means the same thing as selecting none, so it normalises
   back to no filter and the URL stays clean. */
const TIER_KEYS = {
    must: 'must-know',
    should: 'should-know',
    good: 'good-to-know'
};

const TIER_ORDER = ['must', 'should', 'good'];

/** Selected tier keys. Empty means unfiltered — every tier shows. */
let questionTiers = [];

function normaliseTiers(keys) {
    const unique = TIER_ORDER.filter((key) => (keys || []).includes(key));
    // All three selected is indistinguishable from no filter at all.
    return unique.length === TIER_ORDER.length ? [] : unique;
}

/** Returns true when the selection actually changed, so callers can re-render. */
function setQuestionTiers(keys) {
    const next = normaliseTiers(keys);
    if (next.join(',') === questionTiers.join(',')) return false;
    questionTiers = next;
    return true;
}

function generateHash(topicId, subsectionId, tiers) {
    const selected = (tiers === undefined) ? questionTiers : normaliseTiers(tiers);
    const query = selected.length ? `?tier=${selected.join(',')}` : '';
    const tail = subsectionId ? `/${subsectionId}` : '';

    return `#questions/${topicId}${tail}${query}`;
}

/* Cram mode is a property of the route, not of the page, so it survives a
   reload, a shared link and navigation between modules. Every theory link is
   built through generateTheoryHash, so carrying the flag by default here is
   what makes it stick without threading a parameter through every call site. */
let theoryCramMode = false;

function setTheoryCramMode(on) {
    theoryCramMode = Boolean(on);
}

/* The mode a theory module is addressed through. Fourteen of the fifty-seven
   belong to tracks that became modes, so `#theory/predict-kotlin` is no longer
   that module's address — `#predict/predict-kotlin` is. Deriving it from the
   trackId rather than listing the fourteen means a module added to either track
   is addressed correctly without anybody remembering a table. */
function modeForModule(moduleId) {
    const mod = (typeof theoryByModuleId === 'undefined') ? null : theoryByModuleId[moduleId];
    if (!mod) return modeById.theory;
    return appModes.find((mode) => mode.trackId === mod.trackId) || modeById.theory;
}

/**
 * The canonical hash for a theory module, wherever it now lives.
 *
 * Every theory link in the app is built here, which is what lets the three
 * promoted tracks change address without a single call site learning about it.
 * Cram mode rides along for the same reason it always has.
 */
function generateTheoryHash(moduleId, chapterId, cram) {
    const flag = (cram === undefined) ? theoryCramMode : Boolean(cram);
    const query = flag ? '?cram' : '';

    if (!moduleId) return `#${modeById.theory.route}${query}`;

    const route = modeForModule(moduleId).route;
    return chapterId
        ? `#${route}/${moduleId}/${chapterId}${query}`
        : `#${route}/${moduleId}${query}`;
}

/** Synthesis and Predict, addressed directly: `#<route>/<moduleId>/<itemId>`. */
function generateModeHash(modeId, moduleId, itemId) {
    const mode = modeById[modeId];
    if (!mode) return '#';
    if (!moduleId) return `#${mode.route}`;
    return itemId ? `#${mode.route}/${moduleId}/${itemId}` : `#${mode.route}/${moduleId}`;
}

/** The Glossary, with its two optional filters. */
function generateGlossaryHash(letter, trackId) {
    const parts = [];
    if (letter) parts.push(`letter=${letter}`);
    if (trackId) parts.push(`track=${trackId}`);
    return parts.length ? `#glossary?${parts.join('&')}` : '#glossary';
}

/* Five reserved first segments, declared in data/modes.js. A first segment
   that is not one of them is a question topic, which is what keeps every
   `#android` link ever shared working — it is normalised to
   `#questions/android` on arrival rather than being broken.

   None of the five collides with a topic id or a module id; validate-nav.js
   refuses a registry where one would. */

/**
 * Returns `{ mode, topicId, subsectionId, moduleId, chapterId, itemId, tiers,
 *            cram, letter, trackFilter, legacy }`.
 *
 * `legacy` is the canonical hash a caller should redirect to, or null when the
 * hash already is canonical. Putting it in the parse result rather than in the
 * router keeps the one place that knows what a hash means as the one place that
 * knows what it should have been.
 */
function parseHash(hash) {
    const raw = (hash || '').replace(/^#/, '');
    // `?cram` rides on the hash rather than the real query string, so it
    // changes with a hashchange like everything else in this router.
    const [path, query] = raw.split('?');
    const segments = path.split('/').filter(Boolean);
    const cram = /(^|&)cram(=1)?($|&)/.test(query || '');
    const suffix = query ? `?${query}` : '';

    const mode = modeForRoute(segments[0] || '');

    if (!mode) {
        // No reserved segment: a legacy question link, or an empty hash on a
        // first visit.
        const topicId = segments[0] || firstTopicId();
        const tail = segments[1] ? `/${segments[1]}` : '';
        return Object.assign(emptyRoute(), {
            mode: 'questions',
            topicId,
            subsectionId: segments[1] || null,
            tiers: parseTiers(query),
            legacy: `#questions/${topicId}${tail}${suffix}`
        });
    }

    if (mode.id === 'questions') {
        return Object.assign(emptyRoute(), {
            mode: 'questions',
            topicId: segments[1] || firstTopicId(),
            subsectionId: segments[2] || null,
            tiers: parseTiers(query)
        });
    }

    if (mode.id === 'theory') {
        const moduleId = segments[1] || null;

        // The three that moved out of Theory. Derived from the module's track
        // rather than listed, so the redirect cannot fall out of step with the
        // registry.
        if (moduleId === 'glossary') {
            return Object.assign(emptyRoute(), { mode: 'glossary', legacy: '#glossary' });
        }
        const promoted = moduleId ? modeForModule(moduleId) : modeById.theory;
        if (promoted.id !== 'theory') {
            const tail = segments[2] ? `/${segments[2]}` : '';
            return Object.assign(emptyRoute(), {
                mode: promoted.id,
                moduleId,
                chapterId: segments[2] || null,
                itemId: segments[2] || null,
                legacy: `#${promoted.route}/${moduleId}${tail}${suffix}`
            });
        }

        return Object.assign(emptyRoute(), {
            mode: 'theory',
            moduleId,
            chapterId: segments[2] || null,
            cram
        });
    }

    if (mode.id === 'glossary') {
        const letter = /(^|&)letter=([A-Za-z#])/.exec(query || '');
        const track = /(^|&)track=([a-z-]+)/.exec(query || '');
        return Object.assign(emptyRoute(), {
            mode: 'glossary',
            letter: letter ? letter[2].toUpperCase() : null,
            trackFilter: track ? track[2] : null
        });
    }

    // synthesis | predict — the module, then the drill or snippet inside it.
    return Object.assign(emptyRoute(), {
        mode: mode.id,
        moduleId: segments[1] || null,
        chapterId: segments[2] || null,
        itemId: segments[2] || null
    });
}

function emptyRoute() {
    return {
        mode: null, topicId: null, subsectionId: null,
        moduleId: null, chapterId: null, itemId: null,
        tiers: [], cram: false, letter: null, trackFilter: null, legacy: null
    };
}

function firstTopicId() {
    return (typeof topics !== 'undefined' && topics.length) ? topics[0].id : null;
}

/* Unknown keys are dropped rather than treated as an error — a hand-edited or
   truncated URL should show more than the reader asked for, never less. */
function parseTiers(query) {
    const tier = /(^|&)tier=([^&]*)/.exec(query || '');
    if (!tier) return [];
    return normaliseTiers(
        tier[2].split(',').map((k) => k.trim()).filter((k) => k in TIER_KEYS)
    );
}

function handleRouteChange() {
    const route = parseHash(window.location.hash);

    // A legacy URL is rewritten before anything renders, and with replace()
    // rather than assignment: a reader who arrived on #theory/predict-kotlin
    // and presses Back should leave the app, not bounce between the old address
    // and the new one.
    if (route.legacy && route.legacy !== window.location.hash) {
        window.location.replace(route.legacy);
        return;
    }

    // Set before rendering: the renderers build links through
    // generateTheoryHash and generateHash, which read these.
    setTheoryCramMode(route.mode === 'theory' && route.cram);
    const tierChanged = setQuestionTiers(route.mode === 'questions' ? route.tiers : []);
    const modeChanged = setActiveMode(route.mode);
    rememberMode(route);

    // Sidebar counts are per-tier, so a filter change has to redraw them. A
    // mode change already redraws, and doing both would render it twice.
    if (tierChanged && !modeChanged) renderSidebar();

    switch (route.mode) {
        case 'glossary':
            renderTheoryGlossary();
            return;
        case 'synthesis':
            if (route.moduleId) renderSynthesisPrompt(route.moduleId, route.itemId);
            else renderSynthesisOverview();
            return;
        case 'predict':
            if (route.moduleId) renderPredictSnippet(route.moduleId, route.itemId);
            else renderPredictOverview();
            return;
        case 'theory':
            if (route.moduleId) renderTheoryModule(route.moduleId, route.chapterId);
            else renderTheoryOverview();
            return;
        default:
            renderTopic(route.topicId, route.subsectionId);
    }
}

/* --------------------------------------------------------------------------
   Mobile drawer
   -------------------------------------------------------------------------- */

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburgerBtn');
    if (!sidebar) return;

    const open = sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active', open);
    if (hamburger) {
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const hamburger = document.getElementById('hamburgerBtn');

    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    if (hamburger) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
}

/* --------------------------------------------------------------------------
   Wiring
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('sidebarOverlay');

    if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);
    if (overlay) overlay.addEventListener('click', closeMobileMenu);

    window.addEventListener('hashchange', handleRouteChange);
});
