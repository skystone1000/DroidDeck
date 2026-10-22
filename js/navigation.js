/* ==========================================================================
   Navigation — sidebar rendering, hash routing and the mobile drawer.

   The URL hash is the single source of truth for what is on screen:
   `#topic-id` or `#topic-id/subsection-id`.
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
   Sidebar
   -------------------------------------------------------------------------- */

/* The sidebar shows one mode at a time. Which one is derived from the hash, so
   arriving on a theory deep link puts the sidebar in theory mode without the
   reader having to flip anything. */
let sidebarMode = 'questions';
let sidebarTopics = [];

function renderSidebar(topicsList) {
    if (topicsList) sidebarTopics = topicsList;

    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    nav.innerHTML = '';

    if (sidebarMode === 'theory') {
        buildTheoryNav(nav);
    } else {
        buildQuestionNav(nav);
    }
}

/* The sidebar still has two shapes, and the three promoted modes are theory
   content until their own sidebars land. Mapping here rather than at each call
   site means the router already speaks in five modes while the sidebar still
   speaks in two. */
function setSidebarMode(mode) {
    const shape = (mode === 'questions') ? 'questions' : 'theory';
    if (shape === sidebarMode) return false;
    sidebarMode = shape;
    renderSidebar();
    return true;
}

/** Questions the selected tiers let through. An empty selection means all. */
function questionsInTiers(questions, keys) {
    if (!keys || !keys.length) return questions;
    const wanted = keys.map((key) => TIER_KEYS[key]);
    return questions.filter((q) => wanted.includes(q.importance));
}

function buildQuestionNav(nav) {
    sidebarTopics.forEach((topic) => {
        const mark = topicMarks[topic.id];
        // The count follows the filter, so the sidebar answers "how much is
        // left to revise" rather than "how much exists".
        const count = questionsInTiers(topic.questions || [], questionTiers).length;

        if (topic.subsections && topic.subsections.length) {
            nav.appendChild(buildTopicGroup(topic, mark, count));
        } else {
            nav.appendChild(buildTopicLink(topic, mark, count));
        }
    });
}

/* Tracks map onto the group/subsection markup the question sidebar already
   uses, which is why modules are sized the way they are — no third level. */
function buildTheoryNav(nav) {
    const tracks = (typeof theoryTracks === 'undefined') ? [] : theoryTracks;
    const modules = (typeof theoryModules === 'undefined') ? [] : theoryModules;

    tracks
        .slice()
        .sort((a, b) => a.order - b.order)
        .forEach((track) => {
            const inTrack = modules
                .filter((mod) => mod.trackId === track.id)
                .sort((a, b) => a.order - b.order);
            nav.appendChild(buildTrackGroup(track, inTrack));
        });

    // Sits below the tracks because it is a reference, not a step on the path.
    const glossary = document.createElement('a');
    glossary.className = 'nav-item';
    glossary.href = generateGlossaryHash(null, null);
    glossary.dataset.moduleId = GLOSSARY_ROUTE;
    glossary.dataset.hue = GLOSSARY_MARK.hue;
    glossary.innerHTML =
        markTile(GLOSSARY_MARK, GLOSSARY_MARK.hue) +
        '<span class="nav-label">Glossary</span>' +
        `<span class="nav-count">${collectGlossaryEntries().length}</span>`;
    glossary.addEventListener('click', closeMobileMenu);
    nav.appendChild(glossary);
}

function buildTrackGroup(track, modules) {
    const group = document.createElement('div');
    group.className = 'nav-item-group';
    group.dataset.trackId = track.id;

    const parent = document.createElement('button');
    parent.type = 'button';
    parent.className = 'nav-item nav-item-parent';
    parent.dataset.trackId = track.id;
    parent.setAttribute('aria-expanded', 'false');
    parent.dataset.hue = trackHue(track.id);
    parent.innerHTML =
        markTile(trackMarks[track.id], trackHue(track.id)) +
        `<span class="nav-label">${escapeAttr(track.title)}</span>` +
        `<span class="nav-count">${modules.length}</span>` +
        CHEVRON_SVG;

    parent.addEventListener('click', () => {
        const expanded = group.classList.toggle('expanded');
        parent.setAttribute('aria-expanded', String(expanded));
    });

    const list = document.createElement('div');
    list.className = 'nav-subsections';

    if (!modules.length) {
        const empty = document.createElement('span');
        empty.className = 'nav-subsection nav-subsection-empty';
        empty.textContent = 'Not written yet';
        list.appendChild(empty);
    }

    modules.forEach((mod) => {
        const link = document.createElement('a');
        link.className = 'nav-subsection';
        link.href = generateTheoryHash(mod.id);
        link.dataset.moduleId = mod.id;
        link.textContent = `${mod.order}. ${mod.title}`;
        link.addEventListener('click', closeMobileMenu);
        list.appendChild(link);
    });

    group.appendChild(parent);
    group.appendChild(list);
    return group;
}

/** Highlights the open module and keeps only its track expanded. */
function setActiveTheory(moduleId) {
    document.querySelectorAll('.nav-item, .nav-subsection').forEach((node) => {
        node.classList.remove('active');
    });

    // Matches both a module inside a track group and the flat glossary entry,
    // which is why this queries by data attribute rather than by class.
    if (moduleId) {
        const link = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (link) link.classList.add('active');
    }

    const mod = moduleId && typeof theoryModules !== 'undefined'
        ? theoryModules.find((m) => m.id === moduleId)
        : null;

    document.querySelectorAll('.nav-item-group[data-track-id]').forEach((group) => {
        const isActive = Boolean(mod) && group.dataset.trackId === mod.trackId;
        group.classList.toggle('expanded', isActive);
        const parent = group.querySelector('.nav-item-parent');
        if (parent) parent.setAttribute('aria-expanded', String(isActive));
    });
}

function buildTopicLink(topic, mark, count) {
    const link = document.createElement('a');
    link.className = 'nav-item';
    link.href = generateHash(topic.id);
    link.dataset.topicId = topic.id;
    link.dataset.hue = topicHue(topic.id);
    link.innerHTML =
        markTile(mark, topicHue(topic.id)) +
        `<span class="nav-label">${escapeAttr(topic.title)}</span>` +
        `<span class="nav-count">${count}</span>`;
    link.addEventListener('click', closeMobileMenu);
    return link;
}

function buildTopicGroup(topic, mark, count) {
    const group = document.createElement('div');
    group.className = 'nav-item-group';
    group.dataset.topicId = topic.id;

    const parent = document.createElement('button');
    parent.type = 'button';
    parent.className = 'nav-item nav-item-parent';
    parent.dataset.topicId = topic.id;
    parent.dataset.hue = topicHue(topic.id);
    parent.setAttribute('aria-expanded', 'false');
    parent.innerHTML =
        markTile(mark, topicHue(topic.id)) +
        `<span class="nav-label">${escapeAttr(topic.title)}</span>` +
        `<span class="nav-count">${count}</span>` +
        CHEVRON_SVG;

    // Tapping the row both navigates to the topic and opens its subsections.
    parent.addEventListener('click', () => {
        toggleSubsections(topic.id);
        window.location.hash = generateHash(topic.id);
        closeMobileMenu();
    });

    const list = document.createElement('div');
    list.className = 'nav-subsections';
    topic.subsections.forEach((sub) => {
        // A section the filter has emptied is hidden in the page, so listing it
        // here would be a link to nothing.
        const inSection = (topic.questions || []).filter((q) => q.subsection === sub.id);
        if (!questionsInTiers(inSection, questionTiers).length) return;

        const link = document.createElement('a');
        link.className = 'nav-subsection';
        link.href = generateHash(topic.id, sub.id);
        link.dataset.topicId = topic.id;
        link.dataset.subsectionId = sub.id;

        const label = document.createElement('span');
        label.className = 'nav-subsection-label';
        label.textContent = sub.title;

        // Sub-items carried nothing at all before this. "Where was I?" is the
        // single most common question a reader returns with, and until now the
        // sidebar had no answer to it.
        const progress = subsectionProgress(topic, sub.id);
        const count = document.createElement('span');
        count.className = 'nav-subsection-count';
        count.textContent = `${progress.done}/${progress.total}`;
        if (progress.total && progress.done === progress.total) {
            count.classList.add('is-complete');
        }

        link.appendChild(label);
        link.appendChild(count);
        link.addEventListener('click', closeMobileMenu);
        list.appendChild(link);
    });

    group.appendChild(parent);
    group.appendChild(list);
    return group;
}

function escapeAttr(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function toggleSubsections(topicId) {
    const group = document.querySelector(`.nav-item-group[data-topic-id="${topicId}"]`);
    if (!group) return;
    const expanded = group.classList.toggle('expanded');
    const parent = group.querySelector('.nav-item-parent');
    if (parent) parent.setAttribute('aria-expanded', String(expanded));
}

function setActiveTopic(topicId, subsectionId) {
    document.querySelectorAll('.nav-item, .nav-subsection').forEach((node) => {
        node.classList.remove('active');
    });

    const topicNode = document.querySelector(`.nav-item[data-topic-id="${topicId}"]`);
    if (topicNode) topicNode.classList.add('active');

    if (subsectionId) {
        const subNode = document.querySelector(
            `.nav-subsection[data-topic-id="${topicId}"][data-subsection-id="${subsectionId}"]`
        );
        if (subNode) subNode.classList.add('active');
    }

    // Only the active group stays open, so the sidebar does not accumulate
    // expanded sections as the user moves around.
    document.querySelectorAll('.nav-item-group').forEach((group) => {
        const isActive = group.dataset.topicId === topicId;
        group.classList.toggle('expanded', isActive);
        const parent = group.querySelector('.nav-item-parent');
        if (parent) parent.setAttribute('aria-expanded', String(isActive));
    });
}

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
    setActiveMode(route.mode);
    rememberMode(route);
    const modeChanged = setSidebarMode(route.mode);

    // Sidebar counts are per-tier, so a filter change has to redraw them. Mode
    // changes already redraw, and doing both would render the sidebar twice.
    if (tierChanged && !modeChanged) renderSidebar();

    switch (route.mode) {
        case 'glossary':
            renderTheoryGlossary();
            return;
        // Synthesis and Predict have their addresses but not yet their screens.
        // Until those land, the modules render through the theory renderer they
        // have always used — the route is new, the page is the one that works.
        case 'synthesis':
        case 'predict':
        case 'theory':
            if (route.moduleId) renderTheoryModule(route.moduleId, route.chapterId);
            else if (route.mode === 'theory') renderTheoryOverview();
            else renderModeOverviewPlaceholder(route.mode);
            return;
        default:
            renderTopic(route.topicId, route.subsectionId);
    }
}

/* The bare `#synthesis` and `#predict` routes have no overview yet. Sending
   them to the theory overview would be a lie about where they are, so they go
   to the first module in their track — the same place their overview will
   eventually put a reader who clicks the first card. */
function renderModeOverviewPlaceholder(modeId) {
    const mode = modeById[modeId];
    const first = (typeof modulesInTrack === 'function') ? modulesInTrack(mode.trackId)[0] : null;
    if (first) {
        window.location.replace(generateModeHash(modeId, first.id));
        return;
    }
    renderTheoryOverview();
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
