/* ==========================================================================
   The Glossary.

   Sixty-eight terms, harvested at render time from every `definition` block in
   the corpus rather than authored. A hand-maintained list would drift from the
   chapters within a month; a derived one cannot, and every term arrives with
   the chapter that owns it already attached — which is what makes the backlink
   a property of the data rather than a link somebody has to remember to write.

   It used to live inside theory.js, at `#theory/glossary`, because it was a
   reference at the foot of the reading path. It is a mode now, with a letter
   grid, a track filter and a unit of progress, and none of those belong in a
   file about chapters.

   What did not move is `linkGlossaryTerms` and its popover. Underlining a
   defined term where it appears in prose is a reading aid inside a chapter,
   not a way to get to the glossary, and it stays in theory.js where the prose
   is.
   ========================================================================== */

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
                    // Carried so the sidebar can filter by track without every
                    // consumer re-resolving the module it came from.
                    trackId: mod.trackId,
                    chapterId: chapter.id,
                    chapterTitle: chapter.title
                });
            });
        });
    });

    return entries.sort((a, b) => sortKey(a.term).localeCompare(sortKey(b.term)));
}

/* --------------------------------------------------------------------------
   Which terms an interviewer actually says

   The ASKED chip used to be the definition block's `important` flag, which
   fires on fifty-two of the sixty-eight terms. A chip on three quarters of the
   cards is not a distinction, it is decoration — and `important` never meant
   "asked verbatim" anyway. It means the author thought the term mattered,
   which is true of most terms in a curriculum.

   So the chip is derived from the question bank instead, and now means exactly
   what it says: this word appears by name in a question somebody is asked.
   Thirty-one of the sixty-eight qualify, and the chip earns its place.

   Matching is on a word boundary rather than on `includes`, because "Job"
   inside "JobScheduler" is a different word and "State" inside "StateFlow" is
   a different concept. Built once and cached: it walks 465 questions against
   68 terms, which is cheap once and wasteful on every render.
   -------------------------------------------------------------------------- */

let askedTermIndex = null;

function askedTerms() {
    if (askedTermIndex) return askedTermIndex;

    askedTermIndex = new Map();
    const questions = [];
    (typeof topics === 'undefined' ? [] : topics).forEach((topic) => {
        (topic.questions || []).forEach((question) => {
            questions.push({
                topicId: topic.id,
                id: question.id,
                subsection: question.subsection || null,
                text: question.question,
                haystack: String(question.question).toLowerCase()
            });
        });
    });

    collectGlossaryEntries().forEach((entry) => {
        const names = [entry.term].concat(entry.aka ? [entry.aka] : []);
        const patterns = names.map((name) =>
            new RegExp(`(^|[^a-z0-9])${escapeRegExp(String(name).toLowerCase())}([^a-z0-9]|$)`));

        const matches = questions.filter((question) =>
            patterns.some((pattern) => pattern.test(question.haystack)));

        if (matches.length) askedTermIndex.set(entry.term, matches);
    });

    return askedTermIndex;
}

/** The questions that name a term, or an empty array. */
function questionsAsking(term) {
    return askedTerms().get(term) || [];
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

/**
 * The glossary, optionally narrowed to a letter or a track.
 *
 * Both filters live in the hash — `#glossary?letter=K&track=async` — for the
 * same reason cram mode and the tier filter do: a filtered view that cannot be
 * shared or reloaded is a view somebody has to rebuild every time.
 */
function renderGlossary(letter, trackFilter) {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        resetContainer(container);
        container.classList.toggle('cram-mode', theoryCramMode);

        const all = collectGlossaryEntries();
        const entries = trackFilter
            ? all.filter((entry) => entry.trackId === trackFilter)
            : all;

        container.appendChild(buildGlossaryHeader(all, entries, trackFilter));

        const byLetter = new Map();
        entries.forEach((entry) => {
            const key = glossaryLetter(entry.term);
            if (!byLetter.has(key)) byLetter.set(key, []);
            byLetter.get(key).push(entry);
        });

        if (!byLetter.size) {
            const empty = document.createElement('p');
            empty.className = 'theory-empty';
            empty.textContent = 'No terms are defined in that track yet.';
            container.appendChild(empty);
        }

        [...byLetter.keys()].sort().forEach((key) => {
            container.appendChild(renderGlossarySection(key, byLetter.get(key)));
        });

        container.classList.remove('topic-transitioning');
        renderSidebar();
        observeSeenTerms(container);
        history.replaceState(null, '', generateGlossaryHash(letter, trackFilter));

        // A letter is a position on this page, not a page of its own, so it
        // scrolls rather than filters — the reader keeps the alphabet either
        // side of where they landed.
        const target = letter && document.getElementById(`glossary-${letter}`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function buildGlossaryHeader(all, entries, trackFilter) {
    const header = document.createElement('header');
    header.className = 'topic-header';

    const title = document.createElement('h2');
    title.className = 'topic-title';
    title.textContent = 'Glossary';

    const blurb = document.createElement('p');
    blurb.className = 'theory-overview-blurb';
    blurb.textContent =
        'Every term the tracks assume you already know, defined once and linked ' +
        'back to the chapter that introduces it.';

    const stats = document.createElement('div');
    stats.className = 'topic-stats';
    stats.appendChild(makeStat(`${entries.length} terms`));
    stats.appendChild(makeStat(`${new Set(all.map((e) => e.trackId)).size} tracks`));
    stats.appendChild(makeStat(`${all.filter((e) => questionsAsking(e.term).length).length} asked verbatim`));

    header.appendChild(title);
    header.appendChild(blurb);
    header.appendChild(stats);

    if (trackFilter) {
        const track = (typeof theoryTracks === 'undefined' ? [] : theoryTracks)
            .find((t) => t.id === trackFilter);
        const clear = document.createElement('a');
        clear.className = 'theory-dochub-link';
        clear.href = generateGlossaryHash(null, null);
        clear.textContent = `Showing ${track ? track.title : trackFilter} only — show every track`;
        header.appendChild(clear);
    }

    const seen = seenTerms();
    header.appendChild(renderProgressBar(
        all.filter((entry) => seen.has(entry.term)).length, all.length, 'seen'
    ));

    return header;
}

/**
 * A term is seen once its card has been on screen.
 *
 * That is a weaker claim than "read", and the counter says SEEN rather than
 * KNOWN for exactly that reason. It is still the only claim a glossary can
 * make honestly without asking anyone to tick sixty-eight boxes, and a
 * glossary with no unit of progress could not have been a mode at all.
 */
function observeSeenTerms(container) {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver((records) => {
        records.forEach((record) => {
            if (!record.isIntersecting) return;
            markTermSeen(record.target.dataset.term);
            observer.unobserve(record.target);
        });
    }, { threshold: 0.6 });

    container.querySelectorAll('.theory-glossary-entry').forEach((node) => observer.observe(node));
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

    const count = document.createElement('span');
    count.className = 'nav-heading-count';
    count.textContent = String(entries.length);

    heading.appendChild(title);
    heading.appendChild(rule);
    heading.appendChild(count);
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'glossary-grid';
    entries.forEach((entry) => grid.appendChild(renderGlossaryEntry(entry)));
    section.appendChild(grid);
    return section;
}

function renderGlossaryEntry(entry) {
    const node = document.createElement('div');
    // `importance-must` rather than a glossary-specific class, so cram mode
    // filters definitions with the same rule it uses for chapters and cards.
    const tierClass = entry.important ? ' is-important importance-must' : '';
    node.className = `theory-definition theory-glossary-entry${tierClass}`;
    node.dataset.term = entry.term;

    const term = document.createElement('div');
    term.className = 'theory-definition-term';
    term.textContent = entry.term;

    // Derived from the question bank rather than authored, so the chip means
    // what it says: this word is in a question somebody is asked. It links to
    // the first of them, because a reader who sees it wants the question more
    // than they want the count.
    const asking = questionsAsking(entry.term);
    if (asking.length) {
        const chip = document.createElement('a');
        chip.className = 'glossary-asked';
        chip.textContent = 'ASKED';
        chip.href = generateHash(asking[0].topicId, asking[0].subsection);
        chip.title = asking.length === 1
            ? asking[0].text
            : `${asking.length} questions name this term — ${asking[0].text}`;
        term.appendChild(chip);
    }

    if (entry.aka) {
        const aka = document.createElement('span');
        aka.className = 'theory-definition-aka';
        aka.textContent = `also: ${entry.aka}`;
        term.appendChild(aka);
    }

    const body = document.createElement('div');
    body.className = 'theory-definition-body';
    body.innerHTML = entry.html;

    // Every term has one of these, because every term was harvested from
    // inside a chapter. A term with no owning chapter is a content bug, and
    // tools/validate-nav.js is where it is caught rather than here.
    //
    // The label names the mode the chapter actually lives in. Sixteen of the
    // sixty-eight terms are defined in modules that moved to Synthesis or
    // Predict, and a backlink reading "Theory ›" while pointing at #synthesis
    // would be the one link on the page that lies about where it goes.
    const owner = modeForModule(entry.moduleId);
    const source = document.createElement('a');
    source.className = 'theory-glossary-source';
    source.href = generateTheoryHash(entry.moduleId, entry.chapterId);
    source.dataset.hue = trackHue(entry.trackId);
    source.textContent = `${owner.title} › ${entry.chapterTitle}`;

    node.appendChild(term);
    node.appendChild(body);
    node.appendChild(source);
    return node;
}
