/* ==========================================================================
   Client-side search.

   Two corpora, one index. Questions and theory chapters are both flattened
   into a single array once at startup, then scored per keystroke. A thousand
   entries is small enough that a linear scan behind a 200ms debounce stays
   comfortably interactive.

   Every entry carries `kind`, `title` and `context`; everything the renderer
   and the navigator need is on the entry, so neither has to know which corpus
   an entry came from beyond choosing a badge and a destination.
   ========================================================================== */

const SEARCH_DEBOUNCE_MS = 200;
const MAX_RESULTS = 20;

let searchIndex = [];
let searchDebounceId = null;

/* --------------------------------------------------------------------------
   Index
   -------------------------------------------------------------------------- */

/* Five modes, five kinds of result. A glossary term and a snippet are
   different actions and cannot share one flat list, which is why every entry
   now carries the mode it belongs to and the panel groups on it.

   Two of the five were never indexed at all. A search for a term found the
   chapter that defines it but not the term, and a search for a snippet found
   the chapter it sits in but not the snippet — both of which are now places
   the reader can actually go. */
function buildSearchIndex(topicsList, modulesList) {
    return [
        ...indexQuestions(topicsList),
        ...indexChapters(modulesList),
        ...indexDrills(),
        ...indexSnippets(),
        ...indexTerms()
    ];
}

function indexQuestions(topicsList) {
    const index = [];

    (topicsList || []).forEach((topic) => {
        const subsectionTitles = {};
        (topic.subsections || []).forEach((sub) => { subsectionTitles[sub.id] = sub.title; });

        (topic.questions || []).forEach((question) => {
            const tags = question.tags || [];
            // Answers are HTML; strip tags so markup can never match a query.
            const answerText = stripHtml(question.answer);
            const subsectionTitle = subsectionTitles[question.subsection] || null;

            index.push({
                kind: 'question',
                mode: 'questions',
                title: question.question,
                context: subsectionTitle ? `${topic.title} › ${subsectionTitle}` : topic.title,
                topicId: topic.id,
                subsectionId: question.subsection || null,
                questionId: question.id,
                importance: question.importance,
                tags: tags,
                searchText: [question.question, answerText, tags.join(' '), topic.title]
                    .join(' ')
                    .toLowerCase()
            });
        });
    });

    return index;
}

function indexChapters(modulesList) {
    const modules = modulesList || (typeof theoryModules === 'undefined' ? [] : theoryModules);
    const tracks = (typeof theoryTracks === 'undefined') ? [] : theoryTracks;
    const trackTitles = {};
    tracks.forEach((track) => { trackTitles[track.id] = track.title; });

    const index = [];

    modules.forEach((mod) => {
        // A chapter belongs to whichever mode now owns its track. Leaving all
        // fifty-seven modules under Theory would have put a Predict chapter in
        // the Theory group and then navigated somewhere else entirely.
        const owner = modeForModule(mod.id);

        (mod.chapters || []).forEach((chapter) => {
            index.push({
                kind: 'chapter',
                mode: owner.id,
                title: chapter.title,
                context: `${trackTitles[mod.trackId] || owner.title} › ${mod.order}. ${mod.title}`,
                moduleId: mod.id,
                chapterId: chapter.id,
                importance: chapter.importance,
                // Chapters have no tags; the module title is the nearest thing
                // to one, so a search for "coroutines" surfaces its chapters.
                tags: [mod.title],
                searchText: [
                    chapter.title,
                    chapter.summary,
                    chapter.interviewAngle,
                    mod.title,
                    mod.tagline,
                    blockText(chapter.blocks)
                ].join(' ').toLowerCase()
            });
        });
    });

    return index;
}

/* The twenty-four prompts, addressable directly now that each one is a page.
   Their text is the prompt and the mistakes that lose marks — the two things a
   reader searching for "pagination" or "flicker" is actually looking for. */
function indexDrills() {
    return allDrills().map((drill) => ({
        kind: 'prompt',
        mode: 'synthesis',
        title: drill.title,
        context: `Interview Synthesis › ${drill.moduleTitle}`,
        moduleId: drill.moduleId,
        itemId: drill.id,
        // A prompt has no tags of its own; its round is the nearest thing to
        // one, so searching for "machine coding" surfaces its drills.
        tags: [drill.moduleTitle],
        searchText: [
            drill.title,
            stripHtml(drill.prompt),
            (drill.watchFor || []).join(' ')
        ].join(' ').toLowerCase()
    }));
}

/* The eighty snippets. Deliberately indexed on the prompt and the code and
   NOT on the output or the explanation: a search panel that prints what a
   snippet prints has given away the answer before the reader opened it. */
function indexSnippets() {
    return allPredicts().map((snippet) => ({
        kind: 'snippet',
        mode: 'predict',
        // The prompt, not the chapter title. Most predict blocks carry no
        // title of their own, and eleven results all reading "launch, and when
        // its body actually runs" is a list the reader cannot choose from.
        // The prompt is the question the snippet asks, which is the one line
        // that tells them apart.
        title: firstSentence(stripHtml(snippet.prompt)) || snippet.chapterTitle,
        context: `Predict the Output › ${snippet.moduleTitle}`,
        moduleId: snippet.moduleId,
        itemId: snippet.id,
        tags: [snippet.moduleTitle, snippet.language],
        searchText: [
            snippet.title,
            stripHtml(snippet.prompt),
            snippet.code
        ].join(' ').toLowerCase()
    }));
}

function indexTerms() {
    return collectGlossaryEntries().map((entry) => ({
        kind: 'term',
        mode: 'glossary',
        title: entry.term,
        context: `Glossary › ${entry.chapterTitle}`,
        term: entry.term,
        letter: glossaryLetter(entry.term),
        moduleId: entry.moduleId,
        chapterId: entry.chapterId,
        tags: entry.aka ? [entry.aka] : [],
        searchText: [entry.term, entry.aka, stripHtml(entry.html)].join(' ').toLowerCase()
    }));
}

/** One sentence, for a result row that has to fit on one line. */
function firstSentence(text) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return '';
    const stop = trimmed.search(/[.?!](\s|$)/);
    const sentence = stop === -1 ? trimmed : trimmed.slice(0, stop + 1);
    return sentence.length > 110 ? `${sentence.slice(0, 107)}…` : sentence;
}

/** Everything readable in a chapter's blocks, flattened for matching. */
function blockText(blocks) {
    return (blocks || []).map((block) => {
        switch (block.type) {
            case 'prose':
            case 'pitfall':
            case 'tip':
                return stripHtml(block.html);
            case 'definition':
                return `${block.term} ${block.aka || ''} ${stripHtml(block.html)}`;
            case 'types':
                return [
                    block.title,
                    ...(block.items || []).map((item) =>
                        `${item.name} ${stripHtml(item.html)} ${item.whenToUse || ''}`)
                ].join(' ');
            case 'syntax':
                // Code is indexed deliberately: an API name is often the query.
                return `${block.title || ''} ${block.code || ''} ${stripHtml(block.notes)}`;
            case 'table':
                return [
                    block.title,
                    ...(block.headers || []),
                    ...(block.rows || []).map((row) => row.map(stripHtml).join(' '))
                ].join(' ');
            case 'comparison':
                return [
                    block.title, block.left, block.right,
                    ...(block.rows || []).map((row) =>
                        `${row.aspect} ${stripHtml(row.left)} ${stripHtml(row.right)}`)
                ].join(' ');
            case 'drill':
                // A drill nobody can find by name is a drill nobody does.
                return [
                    block.title, stripHtml(block.prompt),
                    ...(block.watchFor || []).map(stripHtml),
                    (block.sketch || {}).code || ''
                ].join(' ');
            default:
                return '';
        }
    }).join(' ');
}

function stripHtml(value) {
    return String(value == null ? '' : value).replace(/<[^>]*>/g, ' ');
}

/* --------------------------------------------------------------------------
   Scoring
   -------------------------------------------------------------------------- */

function search(query) {
    const terms = String(query || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    const results = [];

    for (const entry of searchIndex) {
        const titleText = entry.title.toLowerCase();
        let score = 0;
        let matchedAll = true;

        for (const term of terms) {
            const inTitle = titleText.indexOf(term);
            const inBody = entry.searchText.indexOf(term);

            if (inTitle === -1 && inBody === -1) {
                matchedAll = false;
                break;
            }

            // A hit in the title itself is worth far more than one buried in
            // the body.
            if (inTitle !== -1) {
                score += 10;
                if (inTitle === 0) score += 5;                          // prefix match
                if (new RegExp(`\\b${escapeRegex(term)}`).test(titleText)) score += 3;
            }
            if (inBody !== -1) score += 1;
            if ((entry.tags || []).some((tag) => String(tag).toLowerCase().includes(term))) score += 4;
        }

        // Deliberately no per-kind weighting. Chapters already place well on
        // score alone — they discuss a concept where a question merely names
        // it — and a constant thumb on the scale would only promote weak
        // body-only chapter matches over stronger question matches.
        if (matchedAll) results.push({ entry, score });
    }

    return results
        .sort((a, b) => b.score - a.score || a.entry.title.length - b.entry.title.length)
        .slice(0, MAX_RESULTS)
        .map((result) => result.entry);
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */

/**
 * Results grouped by mode, in rail order.
 *
 * A flat list was fine when everything in it was a question or a chapter. It
 * stopped being fine the moment a term, a prompt and a snippet could all match
 * the same word: those are four different actions, and a reader choosing
 * between them needs to see which is which before they click.
 *
 * Groups come out in rail order rather than by relevance, so the panel has the
 * same shape every time and the eye learns where to look.
 */
function renderSearchResults(results, query) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    container.innerHTML = '';

    if (!results.length) {
        const empty = document.createElement('div');
        empty.className = 'search-empty';
        empty.textContent = `Nothing matches “${query}”`;
        container.appendChild(empty);
        showSearchResults();
        return;
    }

    const byMode = {};
    results.forEach((entry) => {
        const mode = entry.mode || 'questions';
        (byMode[mode] = byMode[mode] || []).push(entry);
    });

    appModes.forEach((mode) => {
        const group = byMode[mode.id];
        if (!group || !group.length) return;

        const heading = document.createElement('div');
        heading.className = 'search-group';
        heading.style.setProperty('--rail-accent', `var(${mode.accentVar})`);

        const name = document.createElement('span');
        name.className = 'search-group-name';
        // The full name. "Synthesis" is a rail label, and a result heading is
        // not the rail.
        name.textContent = mode.title;

        const count = document.createElement('span');
        count.className = 'search-group-count';
        count.textContent = String(group.length);

        heading.appendChild(name);
        heading.appendChild(count);
        container.appendChild(heading);

        group.forEach((entry) => container.appendChild(buildSearchResult(entry, query)));
    });

    showSearchResults();
}

function buildSearchResult(entry, query) {
    const item = document.createElement('div');
    item.className = `search-result-item search-result-${entry.kind}`;
    item.setAttribute('role', 'option');
    item.tabIndex = 0;

    const label = document.createElement('div');
    label.className = 'search-result-topic';

    // Questions carry their tier here, so a result can be judged as worth
    // opening before it is opened. The mode badge that used to sit beside it
    // is gone — the group heading says the same thing once instead of once
    // per row.
    if (entry.kind === 'question' && entry.importance) {
        const tier = IMPORTANCE[entry.importance];
        if (tier) {
            const badge = document.createElement('span');
            badge.className = `search-result-badge importance-${tier.modifier}`;
            badge.textContent = tier.label;
            label.appendChild(badge);
        }
    }

    const context = document.createElement('span');
    context.textContent = entry.context;
    label.appendChild(context);

    const text = document.createElement('div');
    text.className = 'search-result-question';
    text.innerHTML = highlightTerms(entry.title, query);

    item.appendChild(label);
    item.appendChild(text);

    const go = () => navigateToResult(entry);
    item.addEventListener('click', go);
    item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            go();
        }
    });

    return item;
}

/** Wraps matched terms in <mark>. Input is escaped first — it is user text. */
function highlightTerms(text, query) {
    const escaped = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const terms = String(query || '').trim().split(/\s+/).filter(Boolean).map(escapeRegex);
    if (!terms.length) return escaped;

    return escaped.replace(new RegExp(`(${terms.join('|')})`, 'gi'), '<mark>$1</mark>');
}

/* One builder per mode, because the five destinations are five different
   shapes of address. Reading the mode off the entry rather than guessing from
   the kind is what keeps this in step with the grouping above. */
function navigateToResult(entry) {
    const input = document.getElementById('searchInput');
    hideSearchResults();
    if (input) input.value = '';

    switch (entry.mode) {
        case 'theory':
            // The chapter route scrolls to the chapter itself, so there is
            // nothing to do after the hash change.
            window.location.hash = generateTheoryHash(entry.moduleId, entry.chapterId);
            return;

        case 'synthesis':
        case 'predict':
            window.location.hash = entry.itemId
                ? generateModeHash(entry.mode, entry.moduleId, entry.itemId)
                : generateTheoryHash(entry.moduleId, entry.chapterId);
            return;

        case 'glossary':
            // The letter, not the term: the glossary has no per-term route,
            // and landing on the right letter puts the card on screen with its
            // neighbours, which is how a glossary is read.
            window.location.hash = generateGlossaryHash(entry.letter, null);
            return;

        default:
            window.location.hash = generateHash(entry.topicId, entry.subsectionId);

            // The card only exists after renderTopic has run, so scroll on the
            // next frame rather than immediately.
            setTimeout(() => {
                const card = document.querySelector(
                    `.question-card[data-id="${entry.questionId}"]`
                );
                if (!card) return;
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (!card.classList.contains('expanded')) toggleAnswer(card);
            }, 320);
    }
}

function showSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) container.hidden = false;
}

/** Returns whether there was anything to hide, so Escape can fall through. */
function hideSearchResults() {
    const container = document.getElementById('searchResults');
    if (!container || container.hidden) return false;
    container.hidden = true;
    return true;
}

/* --------------------------------------------------------------------------
   Wiring
   -------------------------------------------------------------------------- */

function handleSearchInput(event) {
    const query = event.target.value.trim();

    clearTimeout(searchDebounceId);
    if (!query) {
        hideSearchResults();
        return;
    }

    searchDebounceId = setTimeout(() => {
        renderSearchResults(search(query), query);
    }, SEARCH_DEBOUNCE_MS);
}

function setupSearch(topicsList, modulesList) {
    searchIndex = buildSearchIndex(topicsList, modulesList);

    const input = document.getElementById('searchInput');
    if (!input) return;

    input.addEventListener('input', handleSearchInput);
    input.addEventListener('focus', () => {
        if (input.value.trim()) showSearchResults();
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-container')) hideSearchResults();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideSearchResults();
            input.blur();
        }
    });
}
