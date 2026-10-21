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
   The monogram, not the hue, is what tells a shared pair apart. */
const topicMarks = {
    'kotlin-coroutines':          { monogram: 'Co', hue: 'sky' },
    'kotlin-flow-api':            { monogram: 'Fl', hue: 'teal' },
    'kotlin':                     { monogram: 'Kt', hue: 'violet' },
    'android':                    { monogram: 'An', hue: 'lime' },
    'android-libraries':          { monogram: 'Lb', hue: 'amber' },
    'android-architecture':       { monogram: 'Ar', hue: 'indigo' },
    'design-pattern':             { monogram: 'Dp', hue: 'indigo' },
    'android-system-design':      { monogram: 'Sd', hue: 'fuchsia' },
    'android-unit-testing':       { monogram: 'Ut', hue: 'rose' },
    'android-tools-technologies': { monogram: 'Tt', hue: 'rose' },
    'jetpack-compose':            { monogram: 'Jc', hue: 'pink' },
    'java':                       { monogram: 'Jv', hue: 'violet' },
    'other-topics':               { monogram: 'Ot', hue: 'slate' },
    'data-structures-algorithms': { monogram: 'Ds', hue: 'fuchsia' }
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
    Hidden from assistive tech: the label beside it already names the thing. */
function markTile(mark) {
    const { monogram, hue } = mark || GLOSSARY_MARK;
    return `<span class="cat-tile" data-hue="${hue}" aria-hidden="true">${monogram}</span>`;
}

/** The hue a topic paints with, for anything outside the tile itself — the
    track heading, the progress bar, the count that follows it. */
function topicHue(topicId) {
    return (topicMarks[topicId] || GLOSSARY_MARK).hue;
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

    nav.appendChild(buildModeSwitch());

    if (sidebarMode === 'theory') {
        buildTheoryNav(nav);
    } else {
        buildQuestionNav(nav);
    }
}

function setSidebarMode(mode) {
    if (mode === sidebarMode) return false;
    sidebarMode = mode;
    renderSidebar();
    return true;
}

function buildModeSwitch() {
    const wrapper = document.createElement('div');
    wrapper.className = 'mode-switch';
    wrapper.setAttribute('role', 'tablist');

    const modes = [
        { id: 'questions', label: 'Questions' },
        { id: 'theory', label: 'Theory' }
    ];

    modes.forEach((mode) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mode-switch-option';
        button.textContent = mode.label;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(sidebarMode === mode.id));
        if (sidebarMode === mode.id) button.classList.add('active');

        button.addEventListener('click', () => {
            if (sidebarMode === mode.id) return;
            // Navigating is what flips the mode — the hash stays the source of
            // truth, so the switch and the back button never disagree.
            window.location.hash = mode.id === 'theory'
                ? generateTheoryHash(null)
                : generateHash(sidebarTopics.length ? sidebarTopics[0].id : '');
        });

        wrapper.appendChild(button);
    });

    return wrapper;
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
    glossary.href = generateTheoryHash(GLOSSARY_ROUTE);
    glossary.dataset.moduleId = GLOSSARY_ROUTE;
    glossary.dataset.hue = GLOSSARY_MARK.hue;
    glossary.innerHTML =
        markTile(GLOSSARY_MARK) +
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
    parent.dataset.hue = (trackMarks[track.id] || GLOSSARY_MARK).hue;
    parent.innerHTML =
        markTile(trackMarks[track.id]) +
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
        markTile(mark) +
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
        markTile(mark) +
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

/* `theory` is reserved as the first segment so the two modes cannot collide:
   `#android/services` is a subsection, `#theory/services` would have been
   ambiguous if theory were addressed as `#topicId/theory` instead. */
const THEORY_ROUTE = 'theory';

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

    return subsectionId ? `#${topicId}/${subsectionId}${query}` : `#${topicId}${query}`;
}

/* Cram mode is a property of the route, not of the page, so it survives a
   reload, a shared link and navigation between modules. Every theory link is
   built through generateTheoryHash, so carrying the flag by default here is
   what makes it stick without threading a parameter through every call site. */
let theoryCramMode = false;

function setTheoryCramMode(on) {
    theoryCramMode = Boolean(on);
}

function generateTheoryHash(moduleId, chapterId, cram) {
    const flag = (cram === undefined) ? theoryCramMode : Boolean(cram);
    const query = flag ? '?cram' : '';

    if (!moduleId) return `#${THEORY_ROUTE}${query}`;
    return chapterId
        ? `#${THEORY_ROUTE}/${moduleId}/${chapterId}${query}`
        : `#${THEORY_ROUTE}/${moduleId}${query}`;
}

/**
 * Returns `{ mode, topicId, subsectionId, moduleId, chapterId }`.
 * Question routes parse exactly as they always have; only a leading `theory`
 * segment changes the shape.
 */
function parseHash(hash) {
    const raw = (hash || '').replace(/^#/, '');
    // `?cram` rides on the hash rather than the real query string, so it
    // changes with a hashchange like everything else in this router.
    const [path, query] = raw.split('?');
    const segments = path.split('/').filter(Boolean);
    const cram = /(^|&)cram(=1)?($|&)/.test(query || '');

    if (segments[0] === THEORY_ROUTE) {
        return {
            mode: 'theory',
            topicId: null,
            subsectionId: null,
            moduleId: segments[1] || null,
            chapterId: segments[2] || null,
            cram
        };
    }

    const fallback = (typeof topics !== 'undefined' && topics.length) ? topics[0].id : null;
    const tier = /(^|&)tier=([^&]*)/.exec(query || '');
    // Unknown keys are dropped rather than treated as an error — a hand-edited
    // or truncated URL should show more than the reader asked for, never less.
    const tiers = tier
        ? tier[2].split(',').map((k) => k.trim()).filter((k) => k in TIER_KEYS)
        : [];

    return {
        mode: 'questions',
        topicId: segments[0] || fallback,
        subsectionId: segments[1] || null,
        moduleId: null,
        chapterId: null,
        cram: false,
        tiers: normaliseTiers(tiers)
    };
}

function handleRouteChange() {
    const route = parseHash(window.location.hash);
    // Set before rendering: the renderers build links through
    // generateTheoryHash and generateHash, which read these.
    setTheoryCramMode(route.mode === 'theory' && route.cram);
    const tierChanged = setQuestionTiers(route.mode === 'questions' ? route.tiers : []);
    const modeChanged = setSidebarMode(route.mode);

    // Sidebar counts are per-tier, so a filter change has to redraw them. Mode
    // changes already redraw, and doing both would render the sidebar twice.
    if (tierChanged && !modeChanged) renderSidebar();

    if (route.mode === 'theory') {
        if (route.moduleId === GLOSSARY_ROUTE) {
            renderTheoryGlossary();
        } else if (route.moduleId) {
            renderTheoryModule(route.moduleId, route.chapterId);
        } else {
            renderTheoryOverview();
        }
        return;
    }

    renderTopic(route.topicId, route.subsectionId);
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
