/* ==========================================================================
   Client-side search.

   The whole corpus is flattened into a single array once at startup, then
   scored per keystroke. A few hundred entries is small enough that a linear
   scan behind a 200ms debounce stays comfortably interactive.
   ========================================================================== */

const SEARCH_DEBOUNCE_MS = 200;
const MAX_RESULTS = 20;

let searchIndex = [];
let searchDebounceId = null;

/* --------------------------------------------------------------------------
   Index
   -------------------------------------------------------------------------- */

function buildSearchIndex(topicsList) {
    const index = [];

    (topicsList || []).forEach((topic) => {
        const subsectionTitles = {};
        (topic.subsections || []).forEach((sub) => { subsectionTitles[sub.id] = sub.title; });

        (topic.questions || []).forEach((question) => {
            const tags = question.tags || [];
            // Answers are HTML; strip tags so markup can never match a query.
            const answerText = String(question.answer || '').replace(/<[^>]*>/g, ' ');

            index.push({
                topicId: topic.id,
                topicTitle: topic.title,
                subsectionId: question.subsection || null,
                subsectionTitle: subsectionTitles[question.subsection] || null,
                questionId: question.id,
                question: question.question,
                tags: tags,
                searchText: [question.question, answerText, tags.join(' '), topic.title]
                    .join(' ')
                    .toLowerCase()
            });
        });
    });

    return index;
}

/* --------------------------------------------------------------------------
   Scoring
   -------------------------------------------------------------------------- */

function search(query) {
    const terms = String(query || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    const results = [];

    for (const entry of searchIndex) {
        const questionText = entry.question.toLowerCase();
        let score = 0;
        let matchedAll = true;

        for (const term of terms) {
            const inQuestion = questionText.indexOf(term);
            const inBody = entry.searchText.indexOf(term);

            if (inQuestion === -1 && inBody === -1) {
                matchedAll = false;
                break;
            }

            // A hit in the question itself is worth far more than one buried
            // in the answer body.
            if (inQuestion !== -1) {
                score += 10;
                if (inQuestion === 0) score += 5;                       // prefix match
                if (new RegExp(`\\b${escapeRegex(term)}`).test(questionText)) score += 3;
            }
            if (inBody !== -1) score += 1;
            if (entry.tags.some((tag) => tag.toLowerCase().includes(term))) score += 4;
        }

        if (matchedAll) results.push({ entry, score });
    }

    return results
        .sort((a, b) => b.score - a.score || a.entry.question.length - b.entry.question.length)
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
        empty.textContent = `No questions match “${query}”`;
        container.appendChild(empty);
        showSearchResults();
        return;
    }

    results.forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.setAttribute('role', 'option');
        item.tabIndex = 0;

        const label = document.createElement('div');
        label.className = 'search-result-topic';
        label.textContent = entry.subsectionTitle
            ? `${entry.topicTitle} › ${entry.subsectionTitle}`
            : entry.topicTitle;

        const text = document.createElement('div');
        text.className = 'search-result-question';
        text.innerHTML = highlightTerms(entry.question, query);

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

function setupSearch(topicsList) {
    searchIndex = buildSearchIndex(topicsList);

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
