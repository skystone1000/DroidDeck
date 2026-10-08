/* ==========================================================================
   Theory rendering — the curriculum overview and the module pages.

   Theory is a second reading mode, not a second view of the question bank: its
   structure is tracks → modules → chapters, ordered so each idea arrives after
   the ideas it depends on. See docs/plans/2026-08-15-theory-section.md.

   Chapters render expanded. That is deliberately the opposite default from
   question cards — a question is something to test yourself against, so it
   hides its answer; theory is something to read.
   ========================================================================== */

/* Doc links are stored as paths against this base rather than absolute URLs,
   so a documentation restructure is a one-line change plus a link-checker
   sweep instead of an edit to every module file. */
const DOC_BASE = 'https://developer.android.com';

const IMPORTANCE = {
    'must-know':    { label: 'Must know',    modifier: 'must' },
    'should-know':  { label: 'Should know',  modifier: 'should' },
    'good-to-know': { label: 'Good to know', modifier: 'good' }
};

const DOC_KIND_ICONS = {
    guide:   '📘',
    api:     '⚙️',
    codelab: '🧑‍💻',
    sample:  '📦',
    course:  '🎓'
};

function resolveDocUrl(doc) {
    if (!doc) return null;
    return doc.path ? DOC_BASE + doc.path : (doc.url || null);
}

function lookupModule(moduleId) {
    if (typeof theoryModules === 'undefined') return null;
    return theoryModules.find((mod) => mod.id === moduleId) || null;
}

/* --------------------------------------------------------------------------
   Read progress

   Marked explicitly, not inferred from a visit — opening a module to check one
   table is not reading it, and a progress bar that lies is worse than none.
   localStorage is wrapped because it throws on file:// in some browsers and in
   private mode, and progress is not worth breaking the page over.
   -------------------------------------------------------------------------- */

const READ_STORAGE_KEY = 'droiddeck:theory:read';

function readModules() {
    try {
        const raw = window.localStorage.getItem(READ_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
        return new Set();
    }
}

function setModuleRead(moduleId, read) {
    const current = readModules();
    if (read) current.add(moduleId); else current.delete(moduleId);
    try {
        window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...current]));
    } catch (error) {
        /* Progress is a convenience; losing it is not worth an error. */
    }
    return current;
}

function trackProgress(trackId, modules, read) {
    const inTrack = modules.filter((mod) => mod.trackId === trackId);
    const done = inTrack.filter((mod) => read.has(mod.id)).length;
    return { done, total: inTrack.length };
}

function renderProgressBar(done, total) {
    const wrapper = document.createElement('div');
    wrapper.className = 'theory-progress';

    const track = document.createElement('div');
    track.className = 'theory-progress-track';
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', String(total));
    track.setAttribute('aria-valuenow', String(done));

    const fill = document.createElement('div');
    fill.className = 'theory-progress-fill';
    fill.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
    track.appendChild(fill);

    const label = document.createElement('span');
    label.className = 'theory-progress-label';
    label.textContent = `${done} / ${total} read`;

    wrapper.appendChild(track);
    wrapper.appendChild(label);
    return wrapper;
}

/* --------------------------------------------------------------------------
   Curriculum overview — #theory
   -------------------------------------------------------------------------- */

function renderTheoryOverview() {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        container.innerHTML = '';
        container.classList.toggle('cram-mode', theoryCramMode);
        // The question bank's filter classes belong to the other mode. Each
        // renderer owns the container completely, so clearing them here is what
        // stops one mode's state from surviving into the next.
        container.classList.remove('tier-must', 'tier-should');

        const modules = (typeof theoryModules === 'undefined') ? [] : theoryModules;
        const tracks = (typeof theoryTracks === 'undefined') ? [] : theoryTracks;

        const totalMinutes = modules.reduce((n, m) => n + (m.estimatedMinutes || 0), 0);
        const totalChapters = modules.reduce((n, m) => n + (m.chapters || []).length, 0);

        const header = document.createElement('header');
        header.className = 'topic-header';

        const title = document.createElement('h2');
        title.className = 'topic-title';
        title.textContent = 'Theory';

        const blurb = document.createElement('p');
        blurb.className = 'theory-overview-blurb';
        blurb.textContent =
            'A reading path, not a filing scheme. Each module assumes only what came ' +
            'before it, and links out to the official documentation it is built on.';

        const stats = document.createElement('div');
        stats.className = 'topic-stats';
        stats.appendChild(makeStat('🧭', `${tracks.length} tracks`));
        stats.appendChild(makeStat('📚', `${modules.length} modules`));
        if (totalChapters) stats.appendChild(makeStat('📄', `${totalChapters} chapters`));
        if (totalMinutes) stats.appendChild(makeStat('⏱️', `${totalMinutes} min`));

        header.appendChild(title);
        header.appendChild(blurb);
        header.appendChild(stats);

        const glossaryLink = document.createElement('a');
        glossaryLink.className = 'theory-dochub-link theory-glossary-link';
        glossaryLink.href = generateTheoryHash(GLOSSARY_ROUTE);
        glossaryLink.textContent =
            `📖 Glossary — ${collectGlossaryEntries().length} terms defined across the path`;
        header.appendChild(glossaryLink);
        header.appendChild(renderCramToggle({ collapseAll: false }));

        container.appendChild(header);

        const read = readModules();
        if (read.size) {
            header.appendChild(renderProgressBar(
                modules.filter((mod) => read.has(mod.id)).length, modules.length
            ));
        }

        tracks
            .slice()
            .sort((a, b) => a.order - b.order)
            .forEach((track) => container.appendChild(renderTrackSection(track, modules, read)));

        container.classList.remove('topic-transitioning');
        if (typeof setActiveTheory === 'function') setActiveTheory(null);
        history.replaceState(null, '', generateTheoryHash(null));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function renderTrackSection(track, modules, read) {
    const section = document.createElement('section');
    section.className = 'theory-track';

    const heading = document.createElement('div');
    heading.className = 'subsection-header';
    heading.id = `track-${track.id}`;

    const title = document.createElement('h3');
    title.className = 'subsection-title';
    title.textContent = `${track.icon} ${track.title}`;

    const rule = document.createElement('span');
    rule.className = 'subsection-rule';

    heading.appendChild(title);
    heading.appendChild(rule);

    const progress = trackProgress(track.id, modules, read || new Set());
    if (progress.done) heading.appendChild(renderProgressBar(progress.done, progress.total));

    section.appendChild(heading);

    const inTrack = modules
        .filter((mod) => mod.trackId === track.id)
        .sort((a, b) => a.order - b.order);

    if (!inTrack.length) {
        const empty = document.createElement('p');
        empty.className = 'theory-empty';
        empty.textContent = 'Not written yet.';
        section.appendChild(empty);
        return section;
    }

    const grid = document.createElement('div');
    grid.className = 'theory-module-grid';
    inTrack.forEach((mod) => grid.appendChild(renderModuleCard(mod, read)));
    section.appendChild(grid);

    return section;
}

function renderModuleCard(mod, read) {
    const tier = IMPORTANCE[moduleImportance(mod)] || IMPORTANCE['good-to-know'];
    const isRead = Boolean(read && read.has(mod.id));

    const card = document.createElement('a');
    // The tier class is what cram mode filters on, exactly as it does for
    // chapters — one rule, both levels.
    card.className = `theory-module-card importance-${tier.modifier}`;
    if (isRead) card.classList.add('is-read');
    card.href = generateTheoryHash(mod.id);

    const top = document.createElement('div');
    top.className = 'theory-module-card-top';

    const number = document.createElement('span');
    number.className = 'theory-module-number';
    number.textContent = mod.order;

    const title = document.createElement('h4');
    title.className = 'theory-module-title';
    title.textContent = mod.title;

    top.appendChild(number);
    top.appendChild(title);

    if (isRead) {
        const tick = document.createElement('span');
        tick.className = 'theory-module-read';
        tick.textContent = '✓';
        tick.title = 'Marked as read';
        top.appendChild(tick);
    }

    const tagline = document.createElement('p');
    tagline.className = 'theory-module-tagline';
    tagline.textContent = mod.tagline || '';

    const meta = document.createElement('div');
    meta.className = 'theory-module-meta';
    meta.appendChild(makeStat('📄', `${(mod.chapters || []).length} chapters`));
    meta.appendChild(makeStat('⏱️', `${mod.estimatedMinutes} min`));
    meta.appendChild(renderImportanceBadge(moduleImportance(mod)));

    card.appendChild(top);
    card.appendChild(tagline);
    card.appendChild(meta);

    const external = crossTrackPrerequisites(mod);
    if (external.length) card.appendChild(renderCardPrerequisites(external));
    return card;
}

/* The dependency a reader cannot infer from the page.

   Within a track the reading order already states the dependencies — module 20
   follows 19 — so drawing them adds nothing. Fourteen edges reach into another
   track, and those are invisible in a page laid out by track. Surfacing just
   those is the prerequisite graph's information without its 46 boxes. */
function crossTrackPrerequisites(mod) {
    return (mod.prerequisites || [])
        .map(lookupModule)
        .filter((prereq) => prereq && prereq.trackId !== mod.trackId);
}

function renderCardPrerequisites(prerequisites) {
    const strip = document.createElement('div');
    strip.className = 'theory-card-prereqs';
    strip.textContent = 'Needs ' + prerequisites
        .map((prereq) => `${prereq.order}. ${prereq.title}`)
        .join(' · ');
    return strip;
}

/** A module is as important as its most important chapter. */
function moduleImportance(mod) {
    const tiers = (mod.chapters || []).map((c) => c.importance);
    if (tiers.includes('must-know')) return 'must-know';
    if (tiers.includes('should-know')) return 'should-know';
    return 'good-to-know';
}

/* --------------------------------------------------------------------------
   Glossary — #theory/glossary

   Harvested rather than authored. Every `definition` block already names a
   term and explains it in the one chapter that earns the right to; a second
   hand-written list would drift from those within a month. `glossary` is a
   reserved id (the validator enforces it), so no module can shadow this route.
   -------------------------------------------------------------------------- */

const GLOSSARY_ROUTE = 'glossary';

/** Every definition block in the corpus, with the chapter that owns it. */
function collectGlossaryEntries() {
    const modules = (typeof theoryModules === 'undefined') ? [] : theoryModules;
    const entries = [];

    modules.forEach((mod) => {
        (mod.chapters || []).forEach((chapter) => {
            (chapter.blocks || []).forEach((block) => {
                if (block.type !== 'definition' || !block.term) return;
                entries.push({
                    term: block.term,
                    aka: block.aka || null,
                    html: block.html || '',
                    important: Boolean(block.important),
                    moduleId: mod.id,
                    moduleOrder: mod.order,
                    moduleTitle: mod.title,
                    chapterId: chapter.id,
                    chapterTitle: chapter.title
                });
            });
        });
    });

    return entries.sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
}

/* Sorts on the first alphanumeric character, so `@Composable` files under C
   rather than ahead of everything. */
function sortKey(term) {
    return String(term).replace(/^[^a-z0-9]+/i, '').toLowerCase();
}

function glossaryLetter(term) {
    const key = sortKey(term);
    return key ? key[0].toUpperCase() : '#';
}

function renderTheoryGlossary() {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        container.innerHTML = '';
        container.classList.toggle('cram-mode', theoryCramMode);
        // The question bank's filter classes belong to the other mode. Each
        // renderer owns the container completely, so clearing them here is what
        // stops one mode's state from surviving into the next.
        container.classList.remove('tier-must', 'tier-should');

        const entries = collectGlossaryEntries();

        const header = document.createElement('header');
        header.className = 'topic-header';

        const eyebrow = document.createElement('a');
        eyebrow.className = 'theory-breadcrumb';
        eyebrow.href = generateTheoryHash(null);
        eyebrow.textContent = '← Theory';

        const title = document.createElement('h2');
        title.className = 'topic-title';
        title.textContent = 'Glossary';

        const blurb = document.createElement('p');
        blurb.className = 'theory-overview-blurb';
        blurb.textContent =
            'Every term the curriculum defines, in one list. Each links back to ' +
            'the chapter that introduces it, where it arrives with its context.';

        const important = entries.filter((e) => e.important).length;

        const stats = document.createElement('div');
        stats.className = 'topic-stats';
        stats.appendChild(makeStat('📖', `${entries.length} terms`));
        stats.appendChild(makeStat('🔥', `${important} must know`));

        header.appendChild(eyebrow);
        header.appendChild(title);
        header.appendChild(blurb);
        header.appendChild(stats);
        header.appendChild(renderCramToggle({ collapseAll: false }));
        container.appendChild(header);

        if (!entries.length) {
            const empty = document.createElement('p');
            empty.className = 'theory-empty';
            empty.textContent = 'No terms defined yet.';
            container.appendChild(empty);
        } else {
            const letters = [...new Set(entries.map((e) => glossaryLetter(e.term)))];
            container.appendChild(renderGlossaryIndex(letters));

            letters.forEach((letter) => {
                container.appendChild(renderGlossarySection(
                    letter,
                    entries.filter((e) => glossaryLetter(e.term) === letter)
                ));
            });
        }

        container.classList.remove('topic-transitioning');
        if (typeof setActiveTheory === 'function') setActiveTheory(GLOSSARY_ROUTE);
        history.replaceState(null, '', generateTheoryHash(GLOSSARY_ROUTE));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function renderGlossaryIndex(letters) {
    const nav = document.createElement('nav');
    nav.className = 'theory-rail theory-glossary-index';
    nav.setAttribute('aria-label', 'Jump to a letter');

    letters.forEach((letter) => {
        const link = document.createElement('a');
        link.className = 'theory-rail-item';
        link.href = `#${THEORY_ROUTE}/${GLOSSARY_ROUTE}`;
        link.textContent = letter;
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = document.getElementById(`glossary-${letter}`);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        nav.appendChild(link);
    });

    return nav;
}

function renderGlossarySection(letter, entries) {
    const section = document.createElement('section');
    section.className = 'theory-track';

    const heading = document.createElement('div');
    heading.className = 'subsection-header';
    heading.id = `glossary-${letter}`;

    const title = document.createElement('h3');
    title.className = 'subsection-title';
    title.textContent = letter;

    const rule = document.createElement('span');
    rule.className = 'subsection-rule';

    heading.appendChild(title);
    heading.appendChild(rule);
    section.appendChild(heading);

    entries.forEach((entry) => section.appendChild(renderGlossaryEntry(entry)));
    return section;
}

function renderGlossaryEntry(entry) {
    const node = document.createElement('div');
    // `importance-must` rather than a glossary-specific class, so cram mode
    // filters definitions with the same rule it uses for chapters and cards.
    const tierClass = entry.important ? ' is-important importance-must' : '';
    node.className = `theory-definition theory-glossary-entry${tierClass}`;

    const term = document.createElement('div');
    term.className = 'theory-definition-term';
    term.textContent = entry.term;

    if (entry.aka) {
        const aka = document.createElement('span');
        aka.className = 'theory-definition-aka';
        aka.textContent = `also: ${entry.aka}`;
        term.appendChild(aka);
    }

    const body = document.createElement('div');
    body.className = 'theory-definition-body';
    body.innerHTML = entry.html;

    const source = document.createElement('a');
    source.className = 'theory-glossary-source';
    source.href = generateTheoryHash(entry.moduleId, entry.chapterId);
    source.textContent = `${entry.moduleOrder}. ${entry.moduleTitle} › ${entry.chapterTitle}`;

    node.appendChild(term);
    node.appendChild(body);
    node.appendChild(source);
    return node;
}

/* --------------------------------------------------------------------------
   Module page — #theory/<module-id>
   -------------------------------------------------------------------------- */

function renderTheoryModule(moduleId, scrollToChapter) {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    const mod = lookupModule(moduleId);
    if (!mod) {
        renderTheoryOverview();
        return;
    }

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        container.innerHTML = '';
        container.classList.toggle('cram-mode', theoryCramMode);
        // The question bank's filter classes belong to the other mode. Each
        // renderer owns the container completely, so clearing them here is what
        // stops one mode's state from surviving into the next.
        container.classList.remove('tier-must', 'tier-should');
        container.appendChild(renderModuleHeader(mod));

        const chapters = mod.chapters || [];
        if (chapters.length > 1) container.appendChild(renderChapterRail(mod));

        chapters.forEach((chapter, i) => {
            container.appendChild(renderChapter(chapter, i + 1, mod));
        });

        container.classList.remove('topic-transitioning');

        if (typeof setActiveTheory === 'function') setActiveTheory(mod.id);
        history.replaceState(null, '', generateTheoryHash(mod.id, scrollToChapter));

        if (scrollToChapter) {
            const target = document.getElementById(`chapter-${scrollToChapter}`);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function renderModuleHeader(mod) {
    const header = document.createElement('header');
    header.className = 'topic-header theory-module-header';

    const eyebrow = document.createElement('a');
    eyebrow.className = 'theory-breadcrumb';
    eyebrow.href = generateTheoryHash(null);
    eyebrow.textContent = '← Theory';

    const title = document.createElement('h2');
    title.className = 'topic-title';
    title.textContent = `${mod.order}. ${mod.title}`;

    const tagline = document.createElement('p');
    tagline.className = 'theory-module-tagline theory-module-tagline-large';
    tagline.textContent = mod.tagline || '';

    const stats = document.createElement('div');
    stats.className = 'topic-stats';
    stats.appendChild(makeStat('📄', `${(mod.chapters || []).length} chapters`));
    stats.appendChild(makeStat('⏱️', `${mod.estimatedMinutes} min`));

    header.appendChild(eyebrow);
    header.appendChild(title);
    header.appendChild(tagline);
    header.appendChild(stats);

    const prerequisites = (mod.prerequisites || [])
        .map(lookupModule)
        .filter(Boolean);
    if (prerequisites.length) header.appendChild(renderPrerequisites(prerequisites));

    if (mod.docHub) header.appendChild(renderDocHub(mod.docHub));

    const controls = renderCramToggle();
    controls.appendChild(renderReadToggle(mod));
    header.appendChild(controls);

    return header;
}

/* Marking is explicit and local. Nothing is sent anywhere, and the button says
   what it will do rather than reporting a state, so it reads the same whether
   or not localStorage is available. */
function renderReadToggle(mod) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theory-control';

    const paint = (isRead) => {
        button.textContent = isRead ? '✓ Read' : '○ Mark as read';
        button.classList.toggle('active', isRead);
        button.setAttribute('aria-pressed', String(isRead));
    };

    paint(readModules().has(mod.id));

    button.addEventListener('click', () => {
        const wasRead = readModules().has(mod.id);
        paint(setModuleRead(mod.id, !wasRead).has(mod.id));
    });

    return button;
}

/** Tells a reader arriving from a deep link what they are assumed to know. */
function renderPrerequisites(modules) {
    const strip = document.createElement('div');
    strip.className = 'theory-prerequisites';

    const label = document.createElement('span');
    label.className = 'theory-prerequisites-label';
    label.textContent = 'Read first';
    strip.appendChild(label);

    modules.forEach((mod) => {
        const link = document.createElement('a');
        link.className = 'theory-prerequisite';
        link.href = generateTheoryHash(mod.id);
        link.textContent = `${mod.order}. ${mod.title}`;
        strip.appendChild(link);
    });

    return strip;
}

function renderDocHub(docHub) {
    const wrapper = document.createElement('div');
    wrapper.className = 'theory-dochub';

    const link = document.createElement('a');
    link.className = 'theory-dochub-link';
    link.href = resolveDocUrl(docHub);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `📖 Official docs — ${docHub.title}`;

    wrapper.appendChild(link);
    return wrapper;
}

/* Filters the page down to must-know chapters. The state lives in the URL, so
   a revision session survives a reload and can be handed to someone else. */
function renderCramToggle({ collapseAll = true } = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = 'theory-controls';

    const on = theoryCramMode;

    const cram = document.createElement('button');
    cram.type = 'button';
    cram.className = 'theory-control';
    cram.setAttribute('aria-pressed', String(on));
    cram.classList.toggle('active', on);
    cram.textContent = '🔥 Must-know only';
    cram.addEventListener('click', () => {
        // Writing the hash is the whole state change — handleRouteChange
        // re-renders with the flag applied, so there is one path in and the
        // button can never disagree with the URL.
        const route = parseHash(window.location.hash);
        window.location.hash = generateTheoryHash(
            route.moduleId, route.chapterId, !theoryCramMode
        );
    });

    wrapper.appendChild(cram);

    // The overview and the glossary have no chapters to collapse.
    if (collapseAll) {
        const collapse = document.createElement('button');
        collapse.type = 'button';
        collapse.className = 'theory-control';
        collapse.textContent = '🗂️ Collapse all';
        collapse.addEventListener('click', () => {
            const chapters = document.querySelectorAll('.theory-chapter');
            const anyOpen = [...chapters].some((c) => !c.classList.contains('collapsed'));
            chapters.forEach((c) => c.classList.toggle('collapsed', anyOpen));
            collapse.textContent = anyOpen ? '🗂️ Expand all' : '🗂️ Collapse all';
        });
        wrapper.appendChild(collapse);
    }

    return wrapper;
}

function renderChapterRail(mod) {
    const rail = document.createElement('nav');
    rail.className = 'theory-rail';
    rail.setAttribute('aria-label', 'Chapters in this module');

    (mod.chapters || []).forEach((chapter, i) => {
        const link = document.createElement('a');
        link.className = `theory-rail-item importance-${IMPORTANCE[chapter.importance].modifier}`;
        link.href = generateTheoryHash(mod.id, chapter.id);
        link.textContent = `${i + 1}. ${chapter.title}`;
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const target = document.getElementById(`chapter-${chapter.id}`);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', generateTheoryHash(mod.id, chapter.id));
        });
        rail.appendChild(link);
    });

    return rail;
}

/* --------------------------------------------------------------------------
   Chapter
   -------------------------------------------------------------------------- */

function renderChapter(chapter, number, mod) {
    const tier = IMPORTANCE[chapter.importance] || IMPORTANCE['good-to-know'];

    const article = document.createElement('article');
    article.className = `theory-chapter importance-${tier.modifier}`;
    article.id = `chapter-${chapter.id}`;
    article.dataset.chapterId = chapter.id;

    /* Header — click toggles, like a question card, but starts open. */
    const header = document.createElement('div');
    header.className = 'theory-chapter-header';
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'true');
    header.tabIndex = 0;

    const badge = document.createElement('span');
    badge.className = 'theory-chapter-number';
    badge.textContent = number;

    const heading = document.createElement('div');
    heading.className = 'theory-chapter-heading';

    const title = document.createElement('h3');
    title.className = 'theory-chapter-title';
    title.textContent = chapter.title;

    const summary = document.createElement('p');
    summary.className = 'theory-chapter-summary';
    summary.textContent = chapter.summary || '';

    heading.appendChild(title);
    heading.appendChild(summary);

    header.appendChild(badge);
    header.appendChild(heading);
    header.appendChild(renderImportanceBadge(chapter.importance));

    const toggle = () => {
        const collapsed = article.classList.toggle('collapsed');
        header.setAttribute('aria-expanded', String(!collapsed));
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
        }
    });

    /* Body */
    const body = document.createElement('div');
    body.className = 'theory-chapter-body';

    if (chapter.interviewAngle) {
        const angle = document.createElement('div');
        angle.className = 'theory-angle';
        const label = document.createElement('span');
        label.className = 'theory-angle-label';
        label.textContent = 'Interview angle';
        const text = document.createElement('span');
        text.textContent = chapter.interviewAngle;
        angle.appendChild(label);
        angle.appendChild(text);
        body.appendChild(angle);
    }

    (chapter.blocks || []).forEach((block) => {
        const node = renderBlock(block);
        if (node) body.appendChild(node);
    });

    if ((chapter.docs || []).length) body.appendChild(renderDocLinks(chapter.docs));
    if ((chapter.relatedQuestions || []).length) {
        body.appendChild(renderRelatedQuestions(chapter.relatedQuestions));
    }

    article.appendChild(header);
    article.appendChild(body);
    return article;
}

function renderImportanceBadge(importance) {
    const tier = IMPORTANCE[importance] || IMPORTANCE['good-to-know'];
    const badge = document.createElement('span');
    badge.className = `theory-importance importance-${tier.modifier}`;
    badge.textContent = tier.label;
    return badge;
}

function renderDocLinks(docs) {
    const wrapper = document.createElement('div');
    wrapper.className = 'theory-docs';

    const label = document.createElement('span');
    label.className = 'theory-docs-label';
    label.textContent = 'Documentation';
    wrapper.appendChild(label);

    docs.forEach((doc) => {
        const url = resolveDocUrl(doc);
        if (!url) return;
        const link = document.createElement('a');
        link.className = `theory-doc-link doc-kind-${doc.kind || 'guide'}`;
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = `${DOC_KIND_ICONS[doc.kind] || '📘'} ${doc.title}`;
        wrapper.appendChild(link);
    });

    return wrapper;
}

/** Read the theory, then test yourself — links straight into the question bank. */
function renderRelatedQuestions(refs) {
    const wrapper = document.createElement('div');
    wrapper.className = 'theory-related';

    const label = document.createElement('span');
    label.className = 'theory-related-label';
    label.textContent = 'Test yourself';
    wrapper.appendChild(label);

    refs.forEach((ref) => {
        const topic = (typeof topics === 'undefined') ? null
            : topics.find((t) => t.id === ref.topicId);
        const question = topic && (topic.questions || []).find((q) => q.id === ref.questionId);
        if (!question) return;

        const link = document.createElement('a');
        link.className = 'theory-related-link';
        link.href = generateHash(ref.topicId, question.subsection);
        link.textContent = `❓ ${question.question}`;
        link.addEventListener('click', () => {
            // The card only exists once renderTopic has run.
            setTimeout(() => {
                const card = document.querySelector(`.question-card[data-id="${ref.questionId}"]`);
                if (!card) return;
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (!card.classList.contains('expanded')) toggleAnswer(card);
            }, 320);
        });
        wrapper.appendChild(link);
    });

    return wrapper;
}

/* --------------------------------------------------------------------------
   Blocks

   One renderer per type. A new block type is a case here plus a CSS rule —
   nothing else in the app needs to know about it.
   -------------------------------------------------------------------------- */

function renderBlock(block) {
    if (!block) return null;
    switch (block.type) {
        case 'prose':      return renderProseBlock(block);
        case 'definition': return renderDefinitionBlock(block);
        case 'types':      return renderTypesBlock(block);
        case 'syntax':     return renderSyntaxBlock(block);
        case 'table':      return renderTableBlock(block);
        case 'comparison': return renderComparisonBlock(block);
        case 'pitfall':    return renderCalloutBlock(block, 'pitfall', '⚠️ Pitfall');
        case 'tip':        return renderCalloutBlock(block, 'tip', '🎯 Saying it well');
        case 'diagram':    return renderDiagramBlock(block);
        case 'drill':      return renderDrillBlock(block);
        default:           return null;
    }
}

/* Authored content, injected exactly as question answers are. Safe on the same
   grounds: it lives in the repository. No user-derived string reaches here. */
function renderProseBlock(block) {
    const node = document.createElement('div');
    node.className = 'theory-prose';
    node.innerHTML = block.html || '';
    return node;
}

function renderDefinitionBlock(block) {
    const node = document.createElement('div');
    node.className = 'theory-definition';
    if (block.important) node.classList.add('is-important');

    const term = document.createElement('div');
    term.className = 'theory-definition-term';
    term.textContent = block.term;

    if (block.aka) {
        const aka = document.createElement('span');
        aka.className = 'theory-definition-aka';
        aka.textContent = `also: ${block.aka}`;
        term.appendChild(aka);
    }

    const body = document.createElement('div');
    body.className = 'theory-definition-body';
    body.innerHTML = block.html || '';

    node.appendChild(term);
    node.appendChild(body);
    return node;
}

function renderTypesBlock(block) {
    const node = document.createElement('div');
    node.className = 'theory-types';

    if (block.title) {
        const title = document.createElement('div');
        title.className = 'theory-block-title';
        title.textContent = block.title;
        node.appendChild(title);
    }

    const list = document.createElement('ol');
    list.className = 'theory-types-list';

    (block.items || []).forEach((item) => {
        const entry = document.createElement('li');
        entry.className = 'theory-types-item';

        const name = document.createElement('div');
        name.className = 'theory-types-name';
        name.textContent = item.name;

        const body = document.createElement('div');
        body.className = 'theory-types-body';
        body.innerHTML = item.html || '';

        entry.appendChild(name);
        entry.appendChild(body);

        if (item.whenToUse) {
            const when = document.createElement('div');
            when.className = 'theory-types-when';
            when.textContent = `Use when: ${item.whenToUse}`;
            entry.appendChild(when);
        }

        list.appendChild(entry);
    });

    node.appendChild(list);
    return node;
}

function renderSyntaxBlock(block) {
    const node = document.createElement('div');
    node.className = 'theory-syntax';

    // Reuses the question bank's code block wholesale: same highlighter, same
    // collapse behaviour, same styling.
    node.appendChild(renderCodeBlock({
        language: block.language,
        title: block.title,
        code: block.code
    }));

    if (block.notes) {
        const notes = document.createElement('div');
        notes.className = 'theory-syntax-notes';
        notes.innerHTML = block.notes;
        node.appendChild(notes);
    }

    return node;
}

function renderTableBlock(block) {
    const node = document.createElement('div');
    node.className = 'theory-table-wrap';

    if (block.title) {
        const title = document.createElement('div');
        title.className = 'theory-block-title';
        title.textContent = block.title;
        node.appendChild(title);
    }

    const table = document.createElement('table');
    table.className = 'theory-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    (block.headers || []).forEach((heading) => {
        const th = document.createElement('th');
        th.textContent = heading;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    const tbody = document.createElement('tbody');
    (block.rows || []).forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((cell) => {
            const td = document.createElement('td');
            // Cells may carry <code>; they are authored, like every other field.
            td.innerHTML = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    node.appendChild(table);
    return node;
}

function renderComparisonBlock(block) {
    const node = document.createElement('div');
    node.className = 'theory-table-wrap theory-comparison';

    const title = document.createElement('div');
    title.className = 'theory-block-title';
    title.textContent = block.title;
    node.appendChild(title);

    const table = document.createElement('table');
    table.className = 'theory-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['', block.left, block.right].forEach((heading) => {
        const th = document.createElement('th');
        th.textContent = heading;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    const tbody = document.createElement('tbody');
    (block.rows || []).forEach((row) => {
        const tr = document.createElement('tr');

        const aspect = document.createElement('th');
        aspect.className = 'theory-comparison-aspect';
        aspect.setAttribute('scope', 'row');
        aspect.textContent = row.aspect;
        tr.appendChild(aspect);

        [row.left, row.right].forEach((value) => {
            const td = document.createElement('td');
            td.innerHTML = value;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    node.appendChild(table);
    return node;
}

function renderCalloutBlock(block, modifier, label) {
    const node = document.createElement('div');
    node.className = `theory-callout theory-callout-${modifier}`;

    const heading = document.createElement('div');
    heading.className = 'theory-callout-label';
    heading.textContent = label;

    const body = document.createElement('div');
    body.className = 'theory-callout-body';
    body.innerHTML = block.html || '';

    node.appendChild(heading);
    node.appendChild(body);
    return node;
}

/* A drill is a task to build under a clock, not a passage to read. The sketch
   ships collapsed on purpose: reading the answer before attempting it is the
   one way to get nothing out of a drill. */
function renderDrillBlock(block) {
    const node = document.createElement('div');
    node.className = `theory-drill tier-${block.tier}`;
    node.id = `drill-${block.id}`;

    const head = document.createElement('div');
    head.className = 'theory-drill-head';

    const tier = document.createElement('span');
    tier.className = 'theory-drill-tier';
    tier.textContent = `Tier ${block.tier}`;

    const title = document.createElement('span');
    title.className = 'theory-drill-title';
    title.textContent = block.title;

    const clock = document.createElement('span');
    clock.className = 'theory-drill-clock';
    clock.textContent = `⏱ ${block.minutes} min`;

    head.appendChild(tier);
    head.appendChild(title);
    head.appendChild(clock);

    const prompt = document.createElement('div');
    prompt.className = 'theory-drill-prompt';
    prompt.innerHTML = block.prompt || '';

    node.appendChild(head);
    node.appendChild(prompt);

    if ((block.watchFor || []).length) {
        const watch = document.createElement('div');
        watch.className = 'theory-drill-watch';

        const label = document.createElement('div');
        label.className = 'theory-drill-watch-label';
        label.textContent = 'Loses marks';
        watch.appendChild(label);

        const list = document.createElement('ul');
        block.watchFor.forEach((item) => {
            const li = document.createElement('li');
            li.innerHTML = item;
            list.appendChild(li);
        });
        watch.appendChild(list);
        node.appendChild(watch);
    }

    if (block.sketch) {
        const sketch = renderCodeBlock({
            language: block.sketch.language,
            title: block.sketch.title || 'Solution sketch — try it first',
            code: block.sketch.code
        });
        sketch.classList.add('collapsed');
        node.appendChild(sketch);
    }

    return node;
}

function renderDiagramBlock(block) {
    const node = document.createElement('div');
    node.className = 'diagram-container';
    // Deferred so the container is laid out before the SVG is measured — the
    // same reason question cards defer theirs.
    setTimeout(() => {
        renderDiagram(node, block.diagramConfig, block.diagramType);
    }, 100);
    return node;
}
