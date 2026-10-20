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
    // Before anything reads theory progress: the store moved from modules to
    // chapters, and this expands what the old one held so nobody arrives to
    // find their read history gone.
    migrateModuleProgress(typeof theoryModules === 'undefined' ? [] : theoryModules);
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

        container.appendChild(renderTierFilter(topic));

        // Theory's filter class belongs to the other mode; clearing it here is
        // the counterpart of the theory renderers clearing these.
        container.classList.remove('cram-mode');

        // Filtering is CSS, not a re-render, so cards that were expanded stay
        // expanded as the reader narrows the set. `tier-filtered` hides
        // everything and each `show-*` puts one tier back.
        container.classList.toggle('tier-filtered', questionTiers.length > 0);
        TIER_ORDER.forEach((key) => {
            container.classList.toggle(`show-${key}`, questionTiers.includes(key));
        });

        if (topic.subsections && topic.subsections.length) {
            renderGroupedQuestions(container, topic);
        } else {
            (topic.questions || []).forEach((question, i) => {
                container.appendChild(renderQuestionCard(question, i + 1, topic.id));
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
    stats.appendChild(makeStat(`${questionCount} question${questionCount === 1 ? '' : 's'}`));

    if (topic.subsections && topic.subsections.length) {
        stats.appendChild(makeStat(`${topic.subsections.length} sections`));
    }

    const withCode = (topic.questions || []).filter((q) => (q.codeSnippets || []).length).length;
    if (withCode) stats.appendChild(makeStat(`${withCode} with code`));

    const progress = topicProgress(topic);
    stats.appendChild(makeStat(`${progress.done} done`, 'is-progress'));

    header.appendChild(title);
    header.appendChild(stats);
    header.appendChild(renderTopicProgressBar(topic));
    return header;
}

function makeStat(label, modifier) {
    const stat = document.createElement('span');
    stat.className = modifier ? `topic-stat ${modifier}` : 'topic-stat';
    stat.textContent = label;
    return stat;
}

/* Replaces the decorative rule under the header. A prep tool without a sense of
   position is a PDF, and the bar is the one place that answers "how far in am
   I" without being read. Tinted with the topic's own hue, so the answer is
   attached to a place rather than floating free. */
function renderTopicProgressBar(topic) {
    const bar = document.createElement('div');
    bar.className = 'topic-progress';
    bar.dataset.topicId = topic.id;

    const fill = document.createElement('span');
    fill.className = 'topic-progress-fill';

    bar.appendChild(fill);
    paintTopicProgress(bar, topic);
    return bar;
}

function paintTopicProgress(bar, topic) {
    const { done, total } = topicProgress(topic);
    const fill = bar.querySelector('.topic-progress-fill');
    if (fill) fill.style.width = `${progressPercent(done, total)}%`;
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(total));
    bar.setAttribute('aria-valuenow', String(done));
    bar.setAttribute('aria-label', `${done} of ${total} questions marked done`);
}

const KEY_TOPICS_SHOWN = 6;

/**
 * Six chips, then a count of the rest. Kotlin carries thirty-seven of these and
 * Coroutines twenty; at that size the panel stops being a summary of the topic
 * and becomes a wall that pushes the first question below the fold. The
 * expansion is deliberately not remembered — a summary should be a summary on
 * every arrival, not on the first one only.
 */
function renderKeyTopics(keyTopics) {
    const section = document.createElement('section');
    section.className = 'key-topics-section';

    const title = document.createElement('div');
    title.className = 'key-topics-title';
    title.textContent = 'Key topics';

    const grid = document.createElement('div');
    grid.className = 'key-topics-grid';

    keyTopics.forEach((topic, index) => {
        const pill = document.createElement('span');
        pill.className = 'key-topic-pill';
        if (index >= KEY_TOPICS_SHOWN) pill.classList.add('is-overflow');
        pill.textContent = topic;
        grid.appendChild(pill);
    });

    section.appendChild(title);
    section.appendChild(grid);

    const hidden = keyTopics.length - KEY_TOPICS_SHOWN;
    if (hidden > 0) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'key-topics-more';
        more.setAttribute('aria-expanded', 'false');
        more.textContent = `+${hidden} more`;

        more.addEventListener('click', () => {
            const expanded = section.classList.toggle('is-expanded');
            more.setAttribute('aria-expanded', String(expanded));
            more.textContent = expanded ? 'Show fewer' : `+${hidden} more`;
        });

        grid.appendChild(more);
    }

    return section;
}

/**
 * Questions carry a `subsection` id; group them under their section heading.
 *
 * Each group is wrapped in a `<section>` rather than left as flat siblings, so
 * the tier filter can hide a heading whose every question was filtered out —
 * `:has()` needs something to contain them. The heading keeps its id and its
 * data attribute, so scroll-to-hash and `topmostPassed()` are unaffected.
 */
function renderGroupedQuestions(container, topic) {
    const questions = topic.questions || [];
    let number = 0;

    const addSection = (sub, inSection) => {
        const section = document.createElement('section');
        section.className = 'question-section';
        section.appendChild(makeSubsectionHeader(sub));
        inSection.forEach((question) => {
            section.appendChild(renderQuestionCard(question, ++number, topic.id));
        });
        container.appendChild(section);
    };

    topic.subsections.forEach((sub) => {
        const inSection = questions.filter((q) => q.subsection === sub.id);
        if (inSection.length) addSection(sub, inSection);
    });

    // Anything whose subsection id does not match a declared section still
    // needs to be reachable, so it lands in a trailing bucket.
    const known = new Set(topic.subsections.map((s) => s.id));
    const orphans = questions.filter((q) => !known.has(q.subsection));
    if (orphans.length) addSection({ id: 'more', title: 'More' }, orphans);
}

/* --------------------------------------------------------------------------
   Importance filter
   -------------------------------------------------------------------------- */

/**
 * "All", then one independent toggle per tier. The tiers combine freely — any
 * one, any pair, or all three (which is the same view as All, so it normalises
 * back to it). The selection is written into the hash, so a filtered view is
 * shareable and survives navigation between topics.
 */
function renderTierFilter(topic) {
    const questions = topic.questions || [];

    const wrapper = document.createElement('div');
    wrapper.className = 'tier-filter';
    wrapper.setAttribute('role', 'group');
    wrapper.setAttribute('aria-label', 'Filter by importance');

    const goTo = (tiers) => {
        // Writing the hash is the whole state change; handleRouteChange
        // re-renders with the filter applied, so the buttons can never disagree
        // with the URL.
        const route = parseHash(window.location.hash);
        window.location.hash = generateHash(route.topicId, route.subsectionId, tiers);
    };

    const makeButton = ({ label, count, active, pressed, onClick, disabled, tier }) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tier-filter-option';
        // The dot is the same mark the row chip carries, so the filter and the
        // badge share one visual language instead of two. "All" has no tier and
        // therefore no dot — it is the absence of a filter, not a fourth one.
        if (tier) button.classList.add(`tier-${tier}`);
        button.classList.toggle('active', active);
        if (pressed !== undefined) button.setAttribute('aria-pressed', String(pressed));

        const text = document.createElement('span');
        text.className = 'tier-filter-label';
        text.textContent = label;

        const badge = document.createElement('span');
        badge.className = 'tier-filter-count';
        badge.textContent = count;

        button.appendChild(text);
        button.appendChild(badge);

        // A tier with nothing in it is still shown, so the reader learns the
        // topic has none rather than wondering where the control went.
        if (disabled) button.disabled = true;
        else button.addEventListener('click', onClick);

        wrapper.appendChild(button);
    };

    const showingAll = questionTiers.length === 0;

    makeButton({
        label: 'All',
        count: questions.length,
        active: showingAll,
        onClick: () => { if (!showingAll) goTo([]); },
        disabled: !questions.length
    });

    TIER_ORDER.forEach((key) => {
        const count = questionsInTiers(questions, [key]).length;
        const selected = questionTiers.includes(key);

        makeButton({
            label: IMPORTANCE[TIER_KEYS[key]].label,
            count,
            tier: key,
            active: selected,
            pressed: selected,
            disabled: !count,
            onClick: () => {
                // Read the current selection back out of the hash rather than
                // from `questionTiers`. The hash is the source of truth, and it
                // is written synchronously while the re-render that updates the
                // module state is not — two quick clicks would otherwise both
                // compute from the same stale selection.
                const current = parseHash(window.location.hash).tiers;
                const next = current.includes(key)
                    ? current.filter((k) => k !== key)
                    : [...current, key];
                goTo(next);
            }
        });
    });

    return wrapper;
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

function renderQuestionCard(question, number, topicId) {
    // IMPORTANCE comes from js/theory.js, which loads first. Deliberately the
    // same map rather than a parallel one: a must-know question and a must-know
    // chapter mean the same thing, so they carry the same label and colour.
    const tier = IMPORTANCE[question.importance] || IMPORTANCE['good-to-know'];

    const card = document.createElement('article');
    card.className = `question-card importance-${tier.modifier}`;
    card.dataset.id = question.id;
    card.dataset.topicId = topicId;
    if (isQuestionDone(topicId, question.id)) card.classList.add('is-done');

    /* Header */
    const header = document.createElement('div');
    header.className = 'question-header';
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'false');
    header.tabIndex = 0;

    const check = renderQuestionCheck(card, question, topicId);

    const badge = document.createElement('span');
    badge.className = 'question-number';
    // Padded so the column is a column: 01, not 1 sitting under 10.
    badge.textContent = String(number).padStart(2, '0');

    const text = document.createElement('h4');
    text.className = 'question-text';
    text.textContent = question.question;

    const meta = renderQuestionMeta(question, topicId);

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

    const importance = document.createElement('span');
    importance.className = `question-importance importance-${tier.modifier}`;
    importance.textContent = tier.label;

    header.appendChild(check);
    header.appendChild(badge);
    header.appendChild(text);
    if (meta) header.appendChild(meta);
    header.appendChild(importance);
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

    // Figures sit above the snippets and above the drawn diagram. Where a
    // question has both, §3.5 wants the official state chart first and the
    // animated walkthrough after it — they answer different questions, and the
    // one you want before you understand the shape is the shape.
    (question.images || []).forEach((image) => {
        body.appendChild(renderQuestionImage(image));
    });

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

    body.appendChild(renderAnswerActions(card, question, topicId));

    card.appendChild(header);
    card.appendChild(body);

    // After both halves are attached: the painter reads the row out of the DOM,
    // so it has to run once the row exists rather than while it is being built.
    syncQuestionRow(card, topicId, question.id);

    header.addEventListener('click', () => toggleAnswer(card));
    header.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleAnswer(card);
        }
    });

    return card;
}

/**
 * A real checkbox, styled rather than replaced, so it keeps its own keyboard
 * handling and announces itself correctly. The row header around it is a
 * role="button" that expands on Enter and Space, so both click and keydown are
 * stopped here — otherwise ticking a question would also open it.
 */
function renderQuestionCheck(card, question, topicId) {
    // A span, not a label. A <label> wrapping its own control re-forwards the
    // click to it, so a direct click toggles twice and lands back where it
    // started. The input carries aria-label, so it is named without one.
    const wrapper = document.createElement('span');
    wrapper.className = 'question-check';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = isQuestionDone(topicId, question.id);
    input.setAttribute('aria-label', `Mark "${question.question}" as known`);

    const tick = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tick.setAttribute('viewBox', '0 0 24 24');
    tick.setAttribute('fill', 'none');
    tick.setAttribute('stroke', 'currentColor');
    tick.setAttribute('stroke-width', '3.5');
    tick.setAttribute('stroke-linecap', 'round');
    tick.setAttribute('stroke-linejoin', 'round');
    const tickPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tickPath.setAttribute('d', 'M20 6L9 17l-5-5');
    tick.appendChild(tickPath);

    // Writes only. Everything that has to change on screen — this row, the
    // action button inside it, the header bar, the sidebar count — is painted
    // by the one listener that hears the store, so no two of them can disagree.
    input.addEventListener('change', () => {
        setQuestionDone(topicId, question.id, input.checked);
    });

    const swallow = (event) => event.stopPropagation();
    wrapper.addEventListener('click', swallow);
    wrapper.addEventListener('keydown', swallow);

    wrapper.appendChild(input);
    wrapper.appendChild(tick);
    return wrapper;
}

/** What the row can say about itself before it is opened. */
function renderQuestionMeta(question, topicId) {
    const parts = [];

    if ((question.codeSnippets || []).length) {
        const flag = document.createElement('span');
        flag.className = 'question-flag-code';
        flag.textContent = 'code';
        parts.push(flag);
    }

    const reviewed = questionReviewedAt(topicId, question.id);
    if (reviewed) {
        const flag = document.createElement('span');
        flag.className = 'question-flag-review';
        flag.textContent = `reviewed ${relativeDay(reviewed)}`;
        parts.push(flag);
    }

    if (!parts.length) return null;

    const meta = document.createElement('span');
    meta.className = 'question-meta';
    parts.forEach((part) => meta.appendChild(part));
    return meta;
}

/**
 * Three actions, and the third is conditional. Roughly a third of the bank is
 * referenced by no chapter, and a button that can never be enabled teaches
 * nothing — so it is omitted rather than rendered disabled.
 */
function renderAnswerActions(card, question, topicId) {
    const actions = document.createElement('div');
    actions.className = 'answer-actions';

    const known = document.createElement('button');
    known.type = 'button';
    known.className = 'answer-action answer-action-known';

    known.addEventListener('click', () => {
        setQuestionDone(topicId, question.id, !isQuestionDone(topicId, question.id));
    });

    const later = document.createElement('button');
    later.type = 'button';
    later.className = 'answer-action';

    const paintLater = () => {
        const at = questionReviewedAt(topicId, question.id);
        later.textContent = at ? `Reviewed ${relativeDay(at)}` : 'Review later';
        later.classList.toggle('is-active', Boolean(at));
        later.setAttribute('aria-pressed', String(Boolean(at)));
    };
    paintLater();

    later.addEventListener('click', () => {
        setQuestionReviewLater(topicId, question.id, !questionReviewedAt(topicId, question.id));
        paintLater();
    });

    actions.appendChild(known);
    actions.appendChild(later);

    const chapter = theoryChapterForQuestion(topicId, question.id);
    if (chapter) {
        const open = document.createElement('a');
        open.className = 'answer-action';
        open.href = generateTheoryHash(chapter.moduleId);
        open.textContent = 'Open in Theory';
        actions.appendChild(open);
    }

    return actions;
}

/** Every readout inside one row, brought back into agreement with the store. */
function syncQuestionRow(card, topicId, questionId) {
    const done = isQuestionDone(topicId, questionId);
    card.classList.toggle('is-done', done);

    const box = card.querySelector('.question-check input');
    if (box) box.checked = done;

    const known = card.querySelector('.answer-action-known');
    if (known) {
        known.textContent = done ? 'Marked as known' : 'Mark as known';
        known.classList.toggle('is-active', done);
        known.setAttribute('aria-pressed', String(done));
    }
}

/**
 * Built once, from the relatedQuestions every theory module already carries, so
 * the link exists without a single edit to either corpus. Lazily, because the
 * theory registry is only guaranteed to be assembled by the time a card is
 * rendered — not while this file is being parsed.
 */
let theoryQuestionIndex = null;

function theoryChapterForQuestion(topicId, questionId) {
    if (!theoryQuestionIndex) {
        theoryQuestionIndex = new Map();
        const modules = (typeof theoryModules === 'undefined') ? [] : theoryModules;
        modules.forEach((mod) => {
            (mod.chapters || []).forEach((chapter) => {
                (chapter.relatedQuestions || []).forEach((ref) => {
                    const key = `${ref.topicId}:${ref.questionId}`;
                    // First chapter wins: the reading path is ordered, and the
                    // earliest chapter to reference a question is the one that
                    // teaches it rather than the one that revisits it.
                    if (!theoryQuestionIndex.has(key)) {
                        theoryQuestionIndex.set(key, { moduleId: mod.id, chapterId: chapter.id });
                    }
                });
            });
        });
    }
    return theoryQuestionIndex.get(`${topicId}:${questionId}`) || null;
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
        anchor.textContent = link.title;
        wrapper.appendChild(anchor);
    });

    return wrapper;
}

/* A vendored documentation figure, with the attribution CC BY requires.

   The image never comes from an answer string — `<img>` is deliberately outside
   the authored-HTML allowlist, so this is the only path that can produce one,
   and every field it uses has been through validator check 4. `alt` and `src`
   are set as properties rather than interpolated into markup for the same
   reason the rest of this file avoids innerHTML on untrusted values.

   `loading="lazy"` matters more here than it looks: answer bodies are built for
   every question in a topic at render time, collapsed, so without it opening
   `android` would fetch a dozen PNGs nobody has asked to see. */
function renderQuestionImage(image) {
    const figure = document.createElement('figure');
    figure.className = 'doc-figure';

    const img = document.createElement('img');
    img.className = 'doc-figure-image';
    img.src = image.src;
    img.alt = image.alt || '';
    img.loading = 'lazy';
    figure.appendChild(img);

    const caption = document.createElement('figcaption');
    caption.className = 'doc-figure-caption';

    if (image.caption) {
        const text = document.createElement('span');
        text.className = 'doc-figure-text';
        text.innerHTML = image.caption;
        caption.appendChild(text);
    }

    // Not optional, and not decoration — this link is the licence condition.
    const credit = document.createElement('a');
    credit.className = 'doc-figure-credit';
    credit.href = image.sourceUrl;
    credit.target = '_blank';
    credit.rel = 'noopener noreferrer';
    credit.textContent = image.sourceTitle;
    caption.appendChild(credit);

    figure.appendChild(caption);
    return figure;
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

    const copy = renderCopyButton(snippet.code || '');

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
    header.appendChild(copy);
    header.appendChild(toggle);

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'code-block-body';

    const scroll = document.createElement('div');
    scroll.className = 'code-block-scroll';
    scroll.appendChild(renderLineGutter(snippet.code || ''));

    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.innerHTML = highlightCode(snippet.code || '', snippet.language);
    pre.appendChild(code);
    scroll.appendChild(pre);
    bodyWrap.appendChild(scroll);

    if (snippet.output) bodyWrap.appendChild(renderCodeOutput(snippet.output));

    block.appendChild(header);
    block.appendChild(bodyWrap);

    const collapse = () => block.classList.toggle('collapsed');
    copy.addEventListener('click', (event) => event.stopPropagation());
    header.addEventListener('click', collapse);
    header.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            collapse();
        }
    });

    return block;
}

/* Two panes, and the difference between them is the point.

   `stdout` is literal console text from a program that was compiled and run by
   tools/run-snippets.js, so it is shown as a terminal. `trace` is prose — a
   numbered account of what happens when code with no stdout runs — so it is
   shown as a numbered list under a heading that says so. Dressing a described
   trace up as console output would teach a beginner something false about the
   platform, which is worse than showing them nothing. */
/**
 * Numbers are their own column of elements, counted from the raw source before
 * it is highlighted. They are deliberately NOT produced by splitting the
 * highlighter's output on newlines: code-highlight.js matches block comments
 * and multi-line string literals in a single alternation, so its spans cross
 * line boundaries by design, and cutting that output into lines would leave
 * torn markup on both sides of the cut.
 */
function renderLineGutter(code) {
    const gutter = document.createElement('div');
    gutter.className = 'code-gutter';
    gutter.setAttribute('aria-hidden', 'true');

    const lines = code.split('\n').length;
    for (let i = 1; i <= lines; i += 1) {
        const number = document.createElement('span');
        number.textContent = i;
        gutter.appendChild(number);
    }
    return gutter;
}

/**
 * navigator.clipboard is unavailable on file:// in several browsers, and this
 * app is meant to open from disk — so the textarea fallback is the path that
 * actually runs for some readers rather than a formality.
 */
function renderCopyButton(code) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = 'copy';

    button.addEventListener('click', async () => {
        let copied = false;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(code);
                copied = true;
            }
        } catch (error) {
            copied = false;
        }

        if (!copied) copied = copyViaTextarea(code);

        button.textContent = copied ? 'copied' : 'failed';
        button.classList.toggle('is-copied', copied);
        setTimeout(() => {
            button.textContent = 'copy';
            button.classList.remove('is-copied');
        }, 1600);
    });

    return button;
}

function copyViaTextarea(code) {
    const area = document.createElement('textarea');
    area.value = code;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch (error) {
        ok = false;
    }
    document.body.removeChild(area);
    return ok;
}

function renderCodeOutput(output) {
    const stdout = output.kind === 'stdout';

    const pane = document.createElement('div');
    pane.className = `code-output code-output-${stdout ? 'stdout' : 'trace'}`;

    const label = document.createElement('div');
    label.className = 'code-output-label';
    label.textContent = stdout ? 'Output' : 'What happens, in order';
    pane.appendChild(label);

    const lines = output.lines || [];

    if (stdout) {
        // textContent, not innerHTML: this is a console dump, and a program is
        // free to print something that looks like markup.
        const pre = document.createElement('pre');
        pre.className = 'code-output-console';
        pre.textContent = lines.join('\n');
        pane.appendChild(pre);
    } else {
        const list = document.createElement('ol');
        list.className = 'code-output-steps';
        lines.forEach((line) => {
            const item = document.createElement('li');
            item.textContent = line;
            list.appendChild(item);
        });
        pane.appendChild(list);
    }

    if (output.explain) {
        const explain = document.createElement('div');
        explain.className = 'code-output-explain';
        explain.innerHTML = output.explain;
        pane.appendChild(explain);
    }

    return pane;
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

    // One tick moves three counters — the row, the bar in the page header and
    // the count in the sidebar. Re-rendering the topic would achieve that and
    // throw away every expanded row on the page, so the store announces the
    // change instead and the two counters outside the row repaint themselves.
    document.addEventListener('droiddeck:progress', (event) => {
        if (!event.detail || event.detail.kind !== 'done') return;
        const { topicId, questionId } = event.detail;

        const card = document.querySelector(
            `.question-card[data-topic-id="${topicId}"][data-id="${questionId}"]`
        );
        if (card) syncQuestionRow(card, topicId, questionId);

        refreshProgressReadouts(topicId);
    });
}

function refreshProgressReadouts(topicId) {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic) return;

    const bar = document.querySelector(`.topic-progress[data-topic-id="${topicId}"]`);
    if (bar) paintTopicProgress(bar, topic);

    const { done } = topicProgress(topic);
    const stat = document.querySelector('.topic-stat.is-progress');
    if (stat) stat.textContent = `${done} done`;

    document.querySelectorAll(
        `.nav-subsection[data-topic-id="${topicId}"] .nav-subsection-count`
    ).forEach((node) => {
        const sub = node.closest('.nav-subsection').dataset.subsectionId;
        const progress = subsectionProgress(topic, sub);
        node.textContent = `${progress.done}/${progress.total}`;
        node.classList.toggle('is-complete', Boolean(progress.total) && progress.done === progress.total);
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
        // A filtered-out section is display:none, and its rect is all zeros —
        // which reads as "scrolled past" and would rewrite the hash to a
        // section the reader cannot see.
        if (node.offsetParent === null) return;
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
