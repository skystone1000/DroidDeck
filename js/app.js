/* ==========================================================================
   Main controller — bootstraps the app and renders topics into the DOM.

   Loaded last: every other module exposes globals this file depends on.
   ========================================================================== */

const TOPIC_TRANSITION_MS = 150;
const SCROLL_HASH_DEBOUNCE_MS = 300;

let scrollDebounceId = null;

/* --------------------------------------------------------------------------
   Bootstrap
   -------------------------------------------------------------------------- */

function initApp() {
    initTheme();
    renderSidebar(topics);
    setupSearch(topics, typeof theoryModules === 'undefined' ? [] : theoryModules);
    setupEventListeners();
    setupLazyLoading();
    handleRouteChange();
}

/* --------------------------------------------------------------------------
   Topic rendering
   -------------------------------------------------------------------------- */

function renderTopic(topicId, scrollToSubsection) {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    const topic = topics.find((t) => t.id === topicId) || topics[0];
    if (!topic) return;

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        container.innerHTML = '';
        container.appendChild(renderTopicHeader(topic));

        if (topic.keyTopics && topic.keyTopics.length) {
            container.appendChild(renderKeyTopics(topic.keyTopics));
        }

        if (topic.subsections && topic.subsections.length) {
            renderGroupedQuestions(container, topic);
        } else {
            (topic.questions || []).forEach((question, i) => {
                container.appendChild(renderQuestionCard(question, i + 1));
            });
        }

        container.classList.remove('topic-transitioning');

        setActiveTopic(topic.id, scrollToSubsection);
        const hash = generateHash(topic.id, scrollToSubsection);
        history.replaceState(null, '', hash);

        if (scrollToSubsection) {
            const heading = document.getElementById(`section-${scrollToSubsection}`);
            if (heading) {
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function renderTopicHeader(topic) {
    const header = document.createElement('header');
    header.className = 'topic-header';

    const title = document.createElement('h2');
    title.className = 'topic-title';
    title.textContent = topic.title;

    const stats = document.createElement('div');
    stats.className = 'topic-stats';

    const questionCount = (topic.questions || []).length;
    stats.appendChild(makeStat('❓', `${questionCount} question${questionCount === 1 ? '' : 's'}`));

    if (topic.subsections && topic.subsections.length) {
        stats.appendChild(makeStat('📂', `${topic.subsections.length} sections`));
    }

    const withCode = (topic.questions || []).filter((q) => (q.codeSnippets || []).length).length;
    if (withCode) stats.appendChild(makeStat('💻', `${withCode} with code`));

    header.appendChild(title);
    header.appendChild(stats);
    return header;
}

function makeStat(icon, label) {
    const stat = document.createElement('span');
    stat.className = 'topic-stat';
    stat.textContent = `${icon} ${label}`;
    return stat;
}

function renderKeyTopics(keyTopics) {
    const section = document.createElement('section');
    section.className = 'key-topics-section';

    const title = document.createElement('div');
    title.className = 'key-topics-title';
    title.textContent = 'Key topics';

    const grid = document.createElement('div');
    grid.className = 'key-topics-grid';
    keyTopics.forEach((topic) => {
        const pill = document.createElement('span');
        pill.className = 'key-topic-pill';
        pill.textContent = topic;
        grid.appendChild(pill);
    });

    section.appendChild(title);
    section.appendChild(grid);
    return section;
}

/** Questions carry a `subsection` id; group them under their section heading. */
function renderGroupedQuestions(container, topic) {
    const questions = topic.questions || [];
    let number = 0;

    topic.subsections.forEach((sub) => {
        const inSection = questions.filter((q) => q.subsection === sub.id);
        if (!inSection.length) return;

        container.appendChild(makeSubsectionHeader(sub));
        inSection.forEach((question) => {
            container.appendChild(renderQuestionCard(question, ++number));
        });
    });

    // Anything whose subsection id does not match a declared section still
    // needs to be reachable, so it lands in a trailing bucket.
    const known = new Set(topic.subsections.map((s) => s.id));
    const orphans = questions.filter((q) => !known.has(q.subsection));
    if (orphans.length) {
        container.appendChild(makeSubsectionHeader({ id: 'more', title: 'More' }));
        orphans.forEach((question) => {
            container.appendChild(renderQuestionCard(question, ++number));
        });
    }
}

function makeSubsectionHeader(sub) {
    const header = document.createElement('div');
    header.className = 'subsection-header';
    header.id = `section-${sub.id}`;
    header.dataset.subsectionId = sub.id;

    const title = document.createElement('h3');
    title.className = 'subsection-title';
    title.textContent = sub.title;

    const rule = document.createElement('span');
    rule.className = 'subsection-rule';

    header.appendChild(title);
    header.appendChild(rule);
    return header;
}

/* --------------------------------------------------------------------------
   Question card
   -------------------------------------------------------------------------- */

function renderQuestionCard(question, number) {
    const card = document.createElement('article');
    card.className = 'question-card';
    card.dataset.id = question.id;

    /* Header */
    const header = document.createElement('div');
    header.className = 'question-header';
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');
    header.tabIndex = 0;

    const badge = document.createElement('span');
    badge.className = 'question-number';
    badge.textContent = number;

    const text = document.createElement('h4');
    text.className = 'question-text';
    text.textContent = question.question;

    const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chevron.setAttribute('class', 'question-chevron');
    chevron.setAttribute('width', '16');
    chevron.setAttribute('height', '16');
    chevron.setAttribute('viewBox', '0 0 24 24');
    chevron.setAttribute('fill', 'none');
    chevron.setAttribute('stroke', 'currentColor');
    chevron.setAttribute('stroke-width', '2.5');
    const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    chevronPath.setAttribute('d', 'M6 9l6 6 6-6');
    chevron.appendChild(chevronPath);

    header.appendChild(badge);
    header.appendChild(text);
    header.appendChild(chevron);

    /* Body */
    const body = document.createElement('div');
    body.className = 'answer-body';
    body.setAttribute('aria-hidden', 'true');

    if (question.referenceLinks && question.referenceLinks.length) {
        body.appendChild(renderReferenceLinks(question.referenceLinks));
    }

    const answer = document.createElement('div');
    answer.className = 'answer-content';
    answer.innerHTML = question.answer || '';
    body.appendChild(answer);

    (question.codeSnippets || []).forEach((snippet) => {
        body.appendChild(renderCodeBlock(snippet));
    });

    if (question.hasDiagram && question.diagramConfig) {
        const diagram = document.createElement('div');
        diagram.className = 'diagram-container';
        body.appendChild(diagram);
        // Deferred so the container is laid out before the SVG is measured.
        setTimeout(() => {
            renderDiagram(diagram, question.diagramConfig, question.diagramType);
        }, 100);
    }

    card.appendChild(header);
    card.appendChild(body);

    header.addEventListener('click', () => toggleAnswer(card));
    header.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleAnswer(card);
        }
    });

    return card;
}

function toggleAnswer(card) {
    const expanded = card.classList.toggle('expanded');
    const header = card.querySelector('.question-header');
    const body = card.querySelector('.answer-body');
    if (header) header.setAttribute('aria-expanded', String(expanded));
    if (body) body.setAttribute('aria-hidden', String(!expanded));
}

function renderReferenceLinks(links) {
    const wrapper = document.createElement('div');
    wrapper.className = 'reference-links';

    links.forEach((link) => {
        const anchor = document.createElement('a');
        anchor.className = 'reference-link';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = `📎 ${link.title}`;
        wrapper.appendChild(anchor);
    });

    return wrapper;
}

function renderCodeBlock(snippet) {
    const block = document.createElement('div');
    block.className = 'code-block';

    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.setAttribute('role', 'button');
    header.tabIndex = 0;

    const title = document.createElement('span');
    title.className = 'code-block-title';
    title.textContent = snippet.title || 'Example';

    const lang = document.createElement('span');
    lang.className = 'code-block-lang';
    lang.textContent = snippet.language || 'text';

    const toggle = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    toggle.setAttribute('class', 'code-block-toggle');
    toggle.setAttribute('width', '14');
    toggle.setAttribute('height', '14');
    toggle.setAttribute('viewBox', '0 0 24 24');
    toggle.setAttribute('fill', 'none');
    toggle.setAttribute('stroke', 'currentColor');
    toggle.setAttribute('stroke-width', '2.5');
    const togglePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    togglePath.setAttribute('d', 'M6 9l6 6 6-6');
    toggle.appendChild(togglePath);

    header.appendChild(title);
    header.appendChild(lang);
    header.appendChild(toggle);

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'code-block-body';
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.innerHTML = highlightCode(snippet.code || '', snippet.language);
    pre.appendChild(code);
    bodyWrap.appendChild(pre);

    block.appendChild(header);
    block.appendChild(bodyWrap);

    const collapse = () => block.classList.toggle('collapsed');
    header.addEventListener('click', collapse);
    header.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            collapse();
        }
    });

    return block;
}

/* --------------------------------------------------------------------------
   Global listeners
   -------------------------------------------------------------------------- */

function setupEventListeners() {
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (backToTop) backToTop.hidden = window.scrollY < window.innerHeight;

        clearTimeout(scrollDebounceId);
        scrollDebounceId = setTimeout(updateHashFromScroll, SCROLL_HASH_DEBOUNCE_MS);
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;

        const tag = (event.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || event.target.isContentEditable) return;

        event.preventDefault();
        const input = document.getElementById('searchInput');
        if (input) input.focus();
    });
}

/**
 * Keeps the hash in step with the section the reader is actually looking at,
 * using replaceState so it never fires hashchange and re-renders the page.
 */
function updateHashFromScroll() {
    const route = parseHash(window.location.hash);

    if (route.mode === 'theory') {
        // The overview has nothing to track — its track headings are landmarks,
        // not routes. Only a module page has addressable chapters.
        if (route.moduleId) updateHashFromTheoryScroll(route.moduleId);
        return;
    }

    const current = topmostPassed('.subsection-header');
    if (!current) return;

    const nextHash = generateHash(route.topicId, current.dataset.subsectionId);
    if (nextHash === window.location.hash) return;

    history.replaceState(null, '', nextHash);
    setActiveTopic(route.topicId, current.dataset.subsectionId);
}

function updateHashFromTheoryScroll(moduleId) {
    const current = topmostPassed('.theory-chapter');
    if (!current) return;

    const nextHash = generateTheoryHash(moduleId, current.dataset.chapterId);
    if (nextHash === window.location.hash) return;

    history.replaceState(null, '', nextHash);
}

/** The last element of `selector` whose top has scrolled past the midpoint. */
function topmostPassed(selector) {
    const nodes = document.querySelectorAll(selector);
    if (!nodes.length) return null;

    const midpoint = window.innerHeight / 2;
    let current = null;
    nodes.forEach((node) => {
        if (node.getBoundingClientRect().top <= midpoint) current = node;
    });
    return current;
}

/* --------------------------------------------------------------------------
   Reveal animation
   -------------------------------------------------------------------------- */

function setupLazyLoading() {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
        const cards = [];

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== 1) return;
                if (node.classList.contains('question-card')) cards.push(node);
            });
        });

        if (cards.length) revealCards(cards);
    });

    observer.observe(container, { childList: true });
}

function revealCards(cards) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || typeof gsap === 'undefined') {
        cards.forEach((card) => card.classList.add('revealed'));
        return;
    }

    // Drop GSAP's inline styles when we're done so the stylesheet regains
    // control — leftover transforms otherwise fight the card's hover state.
    const settle = () => cards.forEach((card) => {
        gsap.set(card, { clearProps: 'all' });
        card.classList.add('revealed');
    });

    const tween = gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.98 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
            // Distribute the stagger across a fixed budget rather than paying
            // a flat delay per card: Android renders 135 cards, and 0.04s each
            // would leave the last one waiting five seconds.
            stagger: { amount: Math.min(cards.length * 0.04, 0.6) },
            onComplete: settle
        }
    );

    // Watchdog. The tween's from-state hides every card synchronously, but it
    // is driven by requestAnimationFrame, which does not run in a background or
    // throttled tab. If the animation has not advanced, force the finished
    // state — a stalled decoration must never leave the content unreadable.
    setTimeout(() => {
        if (tween.progress() < 1) {
            tween.kill();
            settle();
        }
    }, 2000);
}

/* --------------------------------------------------------------------------
   Go
   -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', initApp);
