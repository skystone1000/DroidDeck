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

function buildSearchIndex(topicsList, modulesList) {
    return [
        ...indexQuestions(topicsList),
        ...indexChapters(modulesList)
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
                title: question.question,
                context: subsectionTitle ? `${topic.title} › ${subsectionTitle}` : topic.title,
                topicId: topic.id,
                subsectionId: question.subsection || null,
                questionId: question.id,
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
        (mod.chapters || []).forEach((chapter) => {
            index.push({
                kind: 'chapter',
                title: chapter.title,
                context: `${trackTitles[mod.trackId] || 'Theory'} › ${mod.order}. ${mod.title}`,
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
            if (entry.tags.some((tag) => tag.toLowerCase().includes(term))) score += 4;
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

    results.forEach((entry) => {
        const item = document.createElement('div');
        item.className = `search-result-item search-result-${entry.kind}`;
        item.setAttribute('role', 'option');
        item.tabIndex = 0;

        const label = document.createElement('div');
        label.className = 'search-result-topic';

        if (entry.kind === 'chapter') {
            const badge = document.createElement('span');
            badge.className = 'search-result-badge';
            badge.textContent = 'Theory';
            label.appendChild(badge);
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

        container.appendChild(item);
    });

    showSearchResults();
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

function navigateToResult(entry) {
    const input = document.getElementById('searchInput');
    hideSearchResults();
    if (input) input.value = '';

    if (entry.kind === 'chapter') {
        // The chapter route scrolls to the chapter itself, so there is nothing
        // to do after the hash change.
        window.location.hash = generateTheoryHash(entry.moduleId, entry.chapterId);
        return;
    }

    window.location.hash = generateHash(entry.topicId, entry.subsectionId);

    // The card only exists after renderTopic has run, so scroll on the next
    // frame rather than immediately.
    setTimeout(() => {
        const card = document.querySelector(`.question-card[data-id="${entry.questionId}"]`);
        if (!card) return;
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!card.classList.contains('expanded')) toggleAnswer(card);
    }, 320);
}

function showSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) container.hidden = false;
}

function hideSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) container.hidden = true;
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
