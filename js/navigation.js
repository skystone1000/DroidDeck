/* ==========================================================================
   Navigation — sidebar rendering, hash routing and the mobile drawer.

   The URL hash is the single source of truth for what is on screen:
   `#topic-id` or `#topic-id/subsection-id`.
   ========================================================================== */

const topicIcons = {
    'kotlin-coroutines': '⚡', 'kotlin-flow-api': '🌊', 'kotlin': '🟣',
    'android': '🤖', 'android-libraries': '📚', 'android-architecture': '🏗️',
    'design-pattern': '🎨', 'android-system-design': '📐',
    'android-unit-testing': '🧪', 'android-tools-technologies': '🔧',
    'jetpack-compose': '🧩', 'java': '☕', 'other-topics': '📋',
    'data-structures-algorithms': '🔢'
};

const CHEVRON_SVG =
    '<svg class="nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>';

/* --------------------------------------------------------------------------
   Sidebar
   -------------------------------------------------------------------------- */

function renderSidebar(topicsList) {
    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    nav.innerHTML = '';

    topicsList.forEach((topic) => {
        const icon = topicIcons[topic.id] || '📄';
        const count = (topic.questions || []).length;

        if (topic.subsections && topic.subsections.length) {
            nav.appendChild(buildTopicGroup(topic, icon, count));
        } else {
            nav.appendChild(buildTopicLink(topic, icon, count));
        }
    });
}

function buildTopicLink(topic, icon, count) {
    const link = document.createElement('a');
    link.className = 'nav-item';
    link.href = generateHash(topic.id);
    link.dataset.topicId = topic.id;
    link.innerHTML =
        `<span class="nav-icon">${icon}</span>` +
        `<span class="nav-label">${escapeAttr(topic.title)}</span>` +
        `<span class="nav-count">${count}</span>`;
    link.addEventListener('click', closeMobileMenu);
    return link;
}

function buildTopicGroup(topic, icon, count) {
    const group = document.createElement('div');
    group.className = 'nav-item-group';
    group.dataset.topicId = topic.id;

    const parent = document.createElement('button');
    parent.type = 'button';
    parent.className = 'nav-item nav-item-parent';
    parent.dataset.topicId = topic.id;
    parent.setAttribute('aria-expanded', 'false');
    parent.innerHTML =
        `<span class="nav-icon">${icon}</span>` +
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
        const link = document.createElement('a');
        link.className = 'nav-subsection';
        link.href = generateHash(topic.id, sub.id);
        link.dataset.topicId = topic.id;
        link.dataset.subsectionId = sub.id;
        link.textContent = sub.title;
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

function generateHash(topicId, subsectionId) {
    return subsectionId ? `#${topicId}/${subsectionId}` : `#${topicId}`;
}

function generateTheoryHash(moduleId, chapterId) {
    if (!moduleId) return `#${THEORY_ROUTE}`;
    return chapterId
        ? `#${THEORY_ROUTE}/${moduleId}/${chapterId}`
        : `#${THEORY_ROUTE}/${moduleId}`;
}

/**
 * Returns `{ mode, topicId, subsectionId, moduleId, chapterId }`.
 * Question routes parse exactly as they always have; only a leading `theory`
 * segment changes the shape.
 */
function parseHash(hash) {
    const raw = (hash || '').replace(/^#/, '');
    const segments = raw.split('/').filter(Boolean);

    if (segments[0] === THEORY_ROUTE) {
        return {
            mode: 'theory',
            topicId: null,
            subsectionId: null,
            moduleId: segments[1] || null,
            chapterId: segments[2] || null
        };
    }

    const fallback = (typeof topics !== 'undefined' && topics.length) ? topics[0].id : null;
    return {
        mode: 'questions',
        topicId: segments[0] || fallback,
        subsectionId: segments[1] || null,
        moduleId: null,
        chapterId: null
    };
}

function handleRouteChange() {
    const route = parseHash(window.location.hash);

    if (route.mode === 'theory') {
        if (route.moduleId) {
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
