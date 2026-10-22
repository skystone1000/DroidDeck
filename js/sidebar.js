/* ==========================================================================
   The contextual sidebar.

   The sidebar used to belong to the app: two shapes, chosen by which of two
   tabs was lit. It now belongs to whichever mode is active, and there are four
   shapes rather than two — declared per mode as `sidebar` in data/modes.js,
   dispatched once here, and never asked about again.

       tracks    Questions and Theory — the seven subject tracks, each opening
                 to its topics or its modules
       rounds    Interview Synthesis — seven rounds in loop order
       sets      Predict the Output — seven snippet sets, and a verdict strip
                 for the active one
       alphabet  Glossary — an A–Z jump grid, then track as a filter

   The two promoted modes deliberately show no track list. Tracks are the
   organising axis of the material they draw on, not of the material itself;
   where a prompt's provenance matters it appears as a chip that says so.
   ========================================================================== */

let sidebarTopics = [];

/* One entry point, one dispatch. The mode says which shape it wants and this
   builds it; nothing here asks which mode is active except to read that field.
*/
function renderSidebar(topicsList) {
    if (topicsList) sidebarTopics = topicsList;

    const nav = document.getElementById('sidebarNav');
    if (!nav) return;
    nav.innerHTML = '';

    switch (currentMode().sidebar) {
        case 'rounds':   buildRoundNav(nav); return;
        case 'sets':     buildSetNav(nav); return;
        case 'alphabet': buildAlphabetNav(nav); return;
        default:         buildTrackNav(nav);
    }
}

/** The eyebrow above a group: a mono caps label, and the count beside it. */
function sidebarHeading(label, count) {
    const heading = document.createElement('div');
    heading.className = 'nav-heading';

    const text = document.createElement('span');
    text.className = 'nav-heading-label';
    text.textContent = label;

    const n = document.createElement('span');
    n.className = 'nav-heading-count';
    n.textContent = String(count);

    heading.appendChild(text);
    heading.appendChild(n);
    return heading;
}

/** Questions the selected tiers let through. An empty selection means all. */
function questionsInTiers(questions, keys) {
    if (!keys || !keys.length) return questions;
    const wanted = keys.map((key) => TIER_KEYS[key]);
    return questions.filter((q) => wanted.includes(q.importance));
}

/* --------------------------------------------------------------------------
   tracks — Questions and Theory

   One builder for both, because after the promotion they organise the same
   seven subject tracks and differ only in what hangs off each one: topics in
   Questions, modules in Theory. Two near-identical builders drifted apart once
   already, which is how the theory sidebar ended up with counts the question
   sidebar did not have.
   -------------------------------------------------------------------------- */

function buildTrackNav(nav) {
    const questions = activeMode === 'questions';
    const tracks = subjectTracks();

    nav.appendChild(sidebarHeading(questions ? 'Tracks' : 'Reading path', tracks.length));

    tracks.forEach((track) => {
        const children = questions ? topicsInTrack(track.id) : modulesInTrack(track.id);
        if (!children.length) return;
        nav.appendChild(buildTrackGroup(track, children, questions));
    });

    // Topics belonging to no subject track. One rule rather than an invented
    // eighth track, and `other-topics` is exactly what it is for.
    const strays = questions ? topicsInTrack(null) : [];
    if (strays.length) {
        nav.appendChild(sidebarHeading('Everything else', strays.length));
        strays.forEach((topic) => {
            nav.appendChild(topic.subsections && topic.subsections.length
                ? buildTopicGroup(topic, topicMarks[topic.id], topicCount(topic))
                : buildTopicLink(topic, topicMarks[topic.id], topicCount(topic)));
        });
    }
}

/* The count follows the tier filter, so the sidebar answers "how much is left
   to revise" rather than "how much exists". */
function topicCount(topic) {
    return questionsInTiers(topic.questions || [], questionTiers).length;
}

function buildTrackGroup(track, children, questions) {
    const group = document.createElement('div');
    group.className = 'nav-item-group';
    group.dataset.trackId = track.id;

    const parent = document.createElement('button');
    parent.type = 'button';
    parent.className = 'nav-item nav-item-parent';
    parent.dataset.trackId = track.id;
    parent.setAttribute('aria-expanded', 'false');
    parent.dataset.hue = trackHue(track.id);

    // What the number on a track means depends on the mode, and saying so is
    // the whole reason the two modes can share this row. Questions counts
    // questions left to revise; Theory counts chapters read against written.
    const count = questions
        ? children.reduce((n, topic) => n + topicCount(topic), 0)
        : trackChapterReadout(children);

    parent.innerHTML =
        markTile(trackMarks[track.id], trackHue(track.id)) +
        `<span class="nav-label">${escapeAttr(track.title)}</span>` +
        `<span class="nav-count">${count}</span>` +
        CHEVRON_SVG;

    parent.addEventListener('click', () => {
        const expanded = group.classList.toggle('expanded');
        parent.setAttribute('aria-expanded', String(expanded));
    });

    const list = document.createElement('div');
    list.className = 'nav-subsections';

    if (!children.length) {
        const empty = document.createElement('span');
        empty.className = 'nav-subsection nav-subsection-empty';
        empty.textContent = 'Not written yet';
        list.appendChild(empty);
    }

    children.forEach((child) => {
        list.appendChild(questions ? buildTopicRow(child) : buildModuleRow(child));
    });

    group.appendChild(parent);
    group.appendChild(list);
    return group;
}

/** `11/27` — chapters read across a track, which is Theory's unit. */
function trackChapterReadout(modules) {
    const read = readChapters();
    let done = 0;
    let total = 0;
    modules.forEach((mod) => {
        (mod.chapters || []).forEach((chapter) => {
            total += 1;
            if (read.has(chapterKey(mod.id, chapter.id))) done += 1;
        });
    });
    return `${done}/${total}`;
}

function buildModuleRow(mod) {
    const link = document.createElement('a');
    link.className = 'nav-subsection';
    link.href = generateTheoryHash(mod.id);
    link.dataset.moduleId = mod.id;

    const label = document.createElement('span');
    label.className = 'nav-subsection-label';
    label.textContent = `${mod.order}. ${mod.title}`;

    const progress = moduleProgress(mod);
    const count = document.createElement('span');
    count.className = 'nav-subsection-count';
    count.textContent = `${progress.done}/${progress.total}`;
    if (progress.total && progress.done === progress.total) count.classList.add('is-complete');

    link.appendChild(label);
    link.appendChild(count);
    link.addEventListener('click', closeMobileMenu);
    return link;
}

/* A topic inside a track. Topics with subsections keep their third level —
   Android has twenty and Java eight, and flattening them would have made this
   refactor cost the reader something. */
function buildTopicRow(topic) {
    if (topic.subsections && topic.subsections.length) {
        return buildTopicGroup(topic, topicMarks[topic.id], topicCount(topic));
    }

    const link = document.createElement('a');
    link.className = 'nav-subsection';
    link.href = generateHash(topic.id);
    link.dataset.topicId = topic.id;

    const label = document.createElement('span');
    label.className = 'nav-subsection-label';
    label.textContent = topic.title;

    const progress = topicProgress(topic);
    const count = document.createElement('span');
    count.className = 'nav-subsection-count';
    count.textContent = `${progress.done}/${progress.total}`;
    if (progress.total && progress.done === progress.total) count.classList.add('is-complete');

    link.appendChild(label);
    link.appendChild(count);
    link.addEventListener('click', closeMobileMenu);
    return link;
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
   rounds — Interview Synthesis

   Seven rounds in loop order, each a module in the synthesis track. The tick
   appears when every prompt in a round has been rehearsed, because a round is
   done when its prompts are and there is nothing else in it to finish.
   -------------------------------------------------------------------------- */

function buildRoundNav(nav) {
    const rounds = modulesInTrack('synthesis');
    nav.appendChild(sidebarHeading('Interview rounds', rounds.length));

    const drills = allDrills();
    const rehearsed = rehearsedDrills();
    const activeModuleId = parseHash(window.location.hash).moduleId;

    rounds.forEach((mod, index) => {
        const mine = drills.filter((drill) => drill.moduleId === mod.id);
        const done = mine.filter((drill) => rehearsed.has(drill.id)).length;

        const link = document.createElement('a');
        link.className = 'nav-subsection nav-round';
        link.href = generateModeHash('synthesis', mod.id);
        link.dataset.moduleId = mod.id;
        if (mod.id === activeModuleId) link.classList.add('active');

        const ordinal = document.createElement('span');
        ordinal.className = 'nav-ordinal';
        ordinal.textContent = String(index + 1).padStart(2, '0');

        const label = document.createElement('span');
        label.className = 'nav-subsection-label';
        label.textContent = mod.title;

        const count = document.createElement('span');
        count.className = 'nav-subsection-count';
        if (mine.length && done === mine.length) {
            count.textContent = '✓';
            count.classList.add('is-complete');
        } else {
            count.textContent = `${done}/${mine.length}`;
        }

        link.appendChild(ordinal);
        link.appendChild(label);
        link.appendChild(count);
        link.addEventListener('click', closeMobileMenu);
        nav.appendChild(link);
    });

    const active = activeModuleId && typeof theoryByModuleId !== 'undefined'
        ? theoryByModuleId[activeModuleId] : null;
    if (active) nav.appendChild(buildDrawsOn(active));
}

/* Provenance, not navigation. The tracks a round draws on are named here so a
   reader knows what a prompt is testing; they are never a list to move around
   in, which is the distinction the promotion was for.

   The walk is transitive because a round's nearest prerequisite is often the
   round before it. Feature Drills requires the Spine, which requires the
   Machine Coding Round — all three in a track that is now a mode, and none of
   them the answer to "what subject does this test". Following the chain until
   it reaches subject tracks is what makes the chips say Architecture and
   Asynchrony rather than Interview Synthesis. */
function buildDrawsOn(mod) {
    const wrap = document.createElement('div');
    wrap.className = 'nav-aside';
    wrap.appendChild(sidebarHeading('Draws on', ''));

    const chips = document.createElement('div');
    chips.className = 'nav-chips';

    subjectTracksBehind(mod).forEach(({ track, moduleId }) => {
        const chip = document.createElement('a');
        chip.className = 'nav-chip';
        chip.href = generateTheoryHash(moduleId);
        chip.dataset.hue = trackHue(track.id);
        chip.textContent = track.title;
        chips.appendChild(chip);
    });

    if (!chips.children.length) return wrap;
    wrap.appendChild(chips);
    return wrap;
}

/** `[{ track, moduleId }]` — the subject tracks reachable through prerequisites. */
function subjectTracksBehind(mod) {
    const byId = (typeof theoryByModuleId === 'undefined') ? {} : theoryByModuleId;
    const tracks = (typeof theoryTracks === 'undefined') ? [] : theoryTracks;
    const subjectIds = tracks.filter((t) => t.scope === 'subject').map((t) => t.id);

    const found = [];
    const seenTrack = new Set();
    const visited = new Set([mod.id]);
    const queue = (mod.prerequisites || []).slice();

    while (queue.length) {
        const id = queue.shift();
        if (visited.has(id)) continue;
        visited.add(id);

        const source = byId[id];
        if (!source) continue;

        if (!subjectIds.includes(source.trackId)) {
            // Still inside a promoted track — keep walking back.
            queue.push(...(source.prerequisites || []));
            continue;
        }
        if (seenTrack.has(source.trackId)) continue;
        seenTrack.add(source.trackId);
        found.push({ track: tracks.find((t) => t.id === source.trackId), moduleId: source.id });
    }

    return found;
}

/* --------------------------------------------------------------------------
   sets — Predict the Output

   Seven sets, then a strip of one cell per snippet in the active set. The
   strip is why verdicts are stored as a map rather than a set: it has to show
   right, wrong and not-yet-answered, and a set can only carry two of those.
   -------------------------------------------------------------------------- */

function buildSetNav(nav) {
    const sets = modulesInTrack('output');
    nav.appendChild(sidebarHeading('Snippet sets', sets.length));

    const snippets = allPredicts();
    const verdicts = predictVerdicts();
    const activeModuleId = parseHash(window.location.hash).moduleId;

    sets.forEach((mod) => {
        const mine = snippets.filter((snippet) => snippet.moduleId === mod.id);
        const done = mine.filter((snippet) => verdicts[snippet.id]).length;

        const link = document.createElement('a');
        link.className = 'nav-item nav-set';
        link.href = generateModeHash('predict', mod.id);
        link.dataset.moduleId = mod.id;
        link.dataset.hue = trackHue('output');
        if (mod.id === activeModuleId) link.classList.add('active');

        const body = document.createElement('span');
        body.className = 'nav-set-body';

        const label = document.createElement('span');
        label.className = 'nav-label';
        label.textContent = mod.title;

        const readout = document.createElement('span');
        readout.className = 'nav-set-readout';
        readout.textContent = `${done} / ${mine.length} SOLVED`;

        body.appendChild(label);
        body.appendChild(readout);

        link.innerHTML = markTile(trackMarks.output, trackHue('output'));
        link.appendChild(body);
        link.addEventListener('click', closeMobileMenu);
        nav.appendChild(link);
    });

    if (activeModuleId) nav.appendChild(buildVerdictStrip(activeModuleId, snippets, verdicts));
}

function buildVerdictStrip(moduleId, snippets, verdicts) {
    const mine = snippets.filter((snippet) => snippet.moduleId === moduleId);

    const wrap = document.createElement('div');
    wrap.className = 'nav-aside';
    wrap.appendChild(sidebarHeading('This set', ''));

    const strip = document.createElement('div');
    strip.className = 'nav-strip';

    let right = 0;
    let wrong = 0;
    mine.forEach((snippet) => {
        const verdict = verdicts[snippet.id] || null;
        if (verdict === 'right') right += 1;
        if (verdict === 'wrong') wrong += 1;

        const cell = document.createElement('a');
        cell.className = 'nav-strip-cell';
        if (verdict) cell.classList.add(`is-${verdict}`);
        cell.href = generateModeHash('predict', moduleId, snippet.id);
        cell.title = snippet.id;
        strip.appendChild(cell);
    });

    const caption = document.createElement('p');
    caption.className = 'nav-strip-caption';
    caption.textContent =
        `${right} right, ${wrong} wrong, ${mine.length - right - wrong} to go`;

    wrap.appendChild(strip);
    wrap.appendChild(caption);
    return wrap;
}

/* --------------------------------------------------------------------------
   alphabet — Glossary

   A jump grid, then track as a filter. A letter with no terms is dimmed rather
   than hidden: a grid that changes shape as the corpus grows is harder to aim
   at than one that keeps twenty-six cells in the same places.
   -------------------------------------------------------------------------- */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function buildAlphabetNav(nav) {
    const entries = collectGlossaryEntries();
    const route = parseHash(window.location.hash);

    const present = new Set(entries.map((entry) => glossaryLetter(entry.term)));

    nav.appendChild(sidebarHeading('Jump to letter', present.size));

    const grid = document.createElement('div');
    grid.className = 'nav-alphabet';
    ALPHABET.forEach((letter) => {
        const has = present.has(letter);
        const cell = document.createElement(has ? 'a' : 'span');
        cell.className = 'nav-letter';
        if (!has) cell.classList.add('is-empty');
        if (route.letter === letter) cell.classList.add('active');
        cell.textContent = letter;
        if (has) {
            cell.href = generateGlossaryHash(letter, route.trackFilter);
            cell.addEventListener('click', closeMobileMenu);
        }
        grid.appendChild(cell);
    });
    nav.appendChild(grid);

    nav.appendChild(buildTrackFilter(entries, route));
}

function buildTrackFilter(entries, route) {
    const wrap = document.createElement('div');
    wrap.className = 'nav-aside';
    wrap.appendChild(sidebarHeading('Defined in track', ''));

    // Every track, including one with no terms yet — a row that vanishes when
    // the count reaches zero makes the list look shorter than the curriculum.
    subjectTracks().forEach((track) => {
        const count = entries.filter((entry) => entry.trackId === track.id).length;
        if (!count) return;

        const link = document.createElement('a');
        link.className = 'nav-item';
        link.dataset.hue = trackHue(track.id);
        link.dataset.trackId = track.id;
        // Clicking the active filter clears it, which is the only affordance a
        // single-select filter needs.
        const next = route.trackFilter === track.id ? null : track.id;
        link.href = generateGlossaryHash(route.letter, next);
        if (route.trackFilter === track.id) link.classList.add('active');

        link.innerHTML =
            markTile(trackMarks[track.id], trackHue(track.id)) +
            `<span class="nav-label">${escapeAttr(track.title)}</span>` +
            `<span class="nav-count">${count}</span>`;
        link.addEventListener('click', closeMobileMenu);
        wrap.appendChild(link);
    });

    return wrap;
}
