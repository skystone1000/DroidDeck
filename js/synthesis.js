/* ==========================================================================
   Interview Synthesis — one prompt per screen.

   The twenty-four prompts are the twenty-four `drill` blocks. They have been
   in the corpus since the synthesis track was written; what they never had was
   a screen of their own. Inside a chapter a drill is one card among prose, and
   a reader working through them had to find the next one by scrolling past
   material they had already read.

   Here a drill is the page. Prev and next walk the flat list across module
   boundaries, so finishing the last prompt of one round opens the first of the
   next rather than dead-ending.

   Three of the blocks the specification asks for — the answer spine, the
   provenance chips, the follow-ups — are optional fields that no drill carries
   yet. Where one is absent this falls back to what the drill does have, which
   is why the mode ships without waiting on twenty-four pieces of authoring.
   tools/validate-nav.js checks each of them the moment somebody writes one.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Overview — #synthesis
   -------------------------------------------------------------------------- */

function renderSynthesisOverview() {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        resetContainer(container);

        const rounds = modulesInTrack('synthesis');
        const drills = allDrills();
        const rehearsed = rehearsedDrills();

        const header = document.createElement('header');
        header.className = 'topic-header';

        const title = document.createElement('h2');
        title.className = 'topic-title';
        title.textContent = 'Interview Synthesis';

        const blurb = document.createElement('p');
        blurb.className = 'theory-overview-blurb';
        blurb.textContent =
            'Where the tracks stop being separate. Each prompt is one question ' +
            'that pulls several of them at once, timed the way the round is timed.';

        const stats = document.createElement('div');
        stats.className = 'topic-stats';
        stats.appendChild(makeStat(`${rounds.length} rounds`));
        stats.appendChild(makeStat(`${drills.length} prompts`));
        stats.appendChild(makeStat(`${drills.reduce((n, d) => n + (d.minutes || 0), 0)} min`));

        header.appendChild(title);
        header.appendChild(blurb);
        header.appendChild(stats);
        header.appendChild(renderProgressBar(
            drills.filter((d) => rehearsed.has(d.id)).length, drills.length, 'rehearsed'
        ));
        container.appendChild(header);

        rounds.forEach((mod, index) => {
            container.appendChild(renderRoundCard(mod, index, drills, rehearsed));
        });

        container.classList.remove('topic-transitioning');
        history.replaceState(null, '', generateModeHash('synthesis'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function renderRoundCard(mod, index, drills, rehearsed) {
    const mine = drills.filter((drill) => drill.moduleId === mod.id);
    const done = mine.filter((drill) => rehearsed.has(drill.id)).length;

    const card = document.createElement('a');
    card.className = 'theory-card synthesis-round-card';
    card.href = generateModeHash('synthesis', mod.id);
    card.dataset.hue = trackHue('synthesis');

    const eyebrow = document.createElement('span');
    eyebrow.className = 'theory-card-eyebrow';
    eyebrow.textContent = `Round ${String(index + 1).padStart(2, '0')}`;

    const title = document.createElement('h3');
    title.className = 'theory-card-title';
    title.textContent = mod.title;

    const tagline = document.createElement('p');
    tagline.className = 'theory-card-tagline';
    tagline.textContent = mod.tagline || '';

    card.appendChild(eyebrow);
    card.appendChild(title);
    if (mod.tagline) card.appendChild(tagline);
    card.appendChild(renderProgressBar(done, mine.length, 'rehearsed'));

    return card;
}

/* --------------------------------------------------------------------------
   One prompt — #synthesis/<moduleId>[/<drillId>]
   -------------------------------------------------------------------------- */

function renderSynthesisPrompt(moduleId, drillId) {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    const all = allDrills();
    // Landing on a round with no prompt named opens the first one not yet
    // rehearsed — the reader's actual position, not the top of the list.
    const inModule = all.filter((drill) => drill.moduleId === moduleId);
    if (!inModule.length) {
        renderSynthesisOverview();
        return;
    }

    const rehearsed = rehearsedDrills();
    const drill = (drillId && inModule.find((d) => d.id === drillId))
        || inModule.find((d) => !rehearsed.has(d.id))
        || inModule[0];

    const index = all.findIndex((d) => d.id === drill.id);

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        resetContainer(container);
        container.appendChild(buildPromptScreen(drill, index, all));

        container.classList.remove('topic-transitioning');
        renderSidebar();
        history.replaceState(null, '', generateModeHash('synthesis', drill.moduleId, drill.id));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function buildPromptScreen(drill, index, all) {
    const article = document.createElement('article');
    article.className = 'synthesis-prompt';
    article.dataset.drillId = drill.id;

    const rounds = modulesInTrack('synthesis');
    const roundNumber = rounds.findIndex((mod) => mod.id === drill.moduleId) + 1;

    const eyebrow = document.createElement('div');
    eyebrow.className = 'synthesis-eyebrow';
    eyebrow.textContent = [
        `Round ${String(roundNumber).padStart(2, '0')}`,
        drill.moduleTitle,
        `${drill.minutes} min`
    ].join(' · ');
    article.appendChild(eyebrow);

    const title = document.createElement('h2');
    title.className = 'topic-title';
    title.textContent = drill.title;
    article.appendChild(title);

    // The question verbatim. Authored HTML from a validated corpus, as
    // everywhere else in this app.
    const prompt = document.createElement('div');
    prompt.className = 'synthesis-question';
    prompt.innerHTML = drill.prompt || '';
    article.appendChild(prompt);

    const grid = document.createElement('div');
    grid.className = 'synthesis-grid';
    grid.appendChild(renderAnswerSpine(drill));
    grid.appendChild(renderPromptAside(drill));
    article.appendChild(grid);

    if ((drill.followUps || []).length) article.appendChild(renderFollowUps(drill));
    article.appendChild(renderPromptActions(drill, index, all));

    return article;
}

/**
 * The answer spine, when one is written, and the solution sketch when it is not.
 *
 * These are not the same thing and the panel does not pretend otherwise: a
 * spine is what to say and in what order, a sketch is code you could have
 * written. Until the spines are authored the sketch is the better of the two
 * things that exist, and it stays collapsed so the reader still has to try
 * first.
 */
function renderAnswerSpine(drill) {
    const panel = document.createElement('section');
    panel.className = 'synthesis-panel synthesis-spine';

    if ((drill.spine || []).length) {
        panel.appendChild(panelHeading('Answer spine'));

        const list = document.createElement('ol');
        list.className = 'synthesis-spine-list';
        drill.spine.forEach((step) => {
            const item = document.createElement('li');

            const instruction = document.createElement('span');
            instruction.className = 'synthesis-spine-do';
            instruction.textContent = step.do;

            const nuance = document.createElement('span');
            nuance.className = 'synthesis-spine-nuance';
            nuance.innerHTML = step.nuance;

            item.appendChild(instruction);
            item.appendChild(nuance);
            list.appendChild(item);
        });
        panel.appendChild(list);
        return panel;
    }

    if (drill.sketch) {
        panel.appendChild(panelHeading('Solution sketch'));
        const sketch = renderCodeBlock({
            language: drill.sketch.language,
            title: drill.sketch.title || 'Solution sketch — try it first',
            code: drill.sketch.code
        });
        sketch.classList.add('collapsed');
        panel.appendChild(sketch);
    }

    return panel;
}

function renderPromptAside(drill) {
    const aside = document.createElement('div');
    aside.className = 'synthesis-aside';

    aside.appendChild(renderPullsFrom(drill));

    const loses = document.createElement('section');
    loses.className = 'synthesis-panel synthesis-loses';
    loses.appendChild(panelHeading('Where candidates lose it'));

    const list = document.createElement('ul');
    (drill.watchFor || []).forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = item;
        list.appendChild(li);
    });
    loses.appendChild(list);
    aside.appendChild(loses);

    return aside;
}

/**
 * Provenance chips.
 *
 * Authored `pullsFrom` when it exists; otherwise the same prerequisite walk the
 * sidebar uses, which reaches back through the promoted track until it finds
 * subject tracks. Either way these link into Theory — they are the one place a
 * prompt says what it is testing.
 */
function renderPullsFrom(drill) {
    const panel = document.createElement('section');
    panel.className = 'synthesis-panel synthesis-pulls';
    panel.appendChild(panelHeading('Pulls from'));

    const chips = document.createElement('div');
    chips.className = 'synthesis-chips';

    const refs = (drill.pullsFrom || []).length
        ? drill.pullsFrom.map((ref) => {
            const mod = theoryByModuleId[ref.moduleId];
            const chapter = ref.chapterId
                ? (mod.chapters || []).find((c) => c.id === ref.chapterId) : null;
            return {
                trackId: mod.trackId,
                moduleId: ref.moduleId,
                chapterId: ref.chapterId || null,
                label: chapter ? chapter.title : mod.title
            };
        })
        : subjectTracksBehind(theoryByModuleId[drill.moduleId]).map((entry) => ({
            trackId: entry.track.id,
            moduleId: entry.moduleId,
            chapterId: null,
            label: theoryByModuleId[entry.moduleId].title
        }));

    refs.forEach((ref) => {
        const chip = document.createElement('a');
        chip.className = 'synthesis-chip';
        chip.href = generateTheoryHash(ref.moduleId, ref.chapterId);
        chip.dataset.hue = trackHue(ref.trackId);
        chip.innerHTML = markTile(trackMarks[ref.trackId], trackHue(ref.trackId));

        const label = document.createElement('span');
        label.textContent = ref.label;
        chip.appendChild(label);
        chips.appendChild(chip);
    });

    panel.appendChild(chips);
    return panel;
}

function renderFollowUps(drill) {
    const section = document.createElement('section');
    section.className = 'synthesis-followups';

    const heading = document.createElement('h3');
    heading.className = 'subsection-title';
    heading.textContent = 'Follow-ups to expect';
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'synthesis-followup-grid';

    drill.followUps.forEach((ref) => {
        const mod = theoryByModuleId[ref.moduleId];
        const chapter = ref.chapterId
            ? (mod.chapters || []).find((c) => c.id === ref.chapterId) : null;
        const track = theoryTracks.find((t) => t.id === mod.trackId);

        const card = document.createElement('a');
        card.className = 'synthesis-followup';
        card.href = generateTheoryHash(ref.moduleId, ref.chapterId);
        card.dataset.hue = trackHue(mod.trackId);

        const question = document.createElement('p');
        question.className = 'synthesis-followup-question';
        question.textContent = ref.question;

        const where = document.createElement('span');
        where.className = 'synthesis-followup-where';
        where.textContent = `${track ? track.title : 'Theory'} · ${chapter ? chapter.title : mod.title}`;

        card.appendChild(question);
        card.appendChild(where);
        grid.appendChild(card);
    });

    section.appendChild(grid);
    return section;
}

function renderPromptActions(drill, index, all) {
    const bar = document.createElement('div');
    bar.className = 'synthesis-actions';

    const rehearsed = isDrillRehearsed(drill.id);

    const mark = document.createElement('button');
    mark.type = 'button';
    mark.className = `btn ${rehearsed ? 'btn-secondary' : 'btn-primary'}`;
    mark.textContent = rehearsed ? 'Rehearsed' : 'Mark rehearsed';
    mark.addEventListener('click', () => {
        setDrillRehearsed(drill.id, !isDrillRehearsed(drill.id));
        renderSynthesisPrompt(drill.moduleId, drill.id);
    });
    bar.appendChild(mark);

    // Prev and next walk the flat list, so the last prompt of a round leads
    // into the first of the next one rather than stopping.
    if (index > 0) bar.appendChild(promptLink(all[index - 1], '← Previous prompt'));
    if (index < all.length - 1) bar.appendChild(promptLink(all[index + 1], 'Next prompt →'));

    const owning = document.createElement('a');
    owning.className = 'btn btn-ghost';
    owning.href = generateTheoryHash(drill.moduleId, drill.chapterId);
    owning.textContent = `In context › ${drill.chapterTitle}`;
    bar.appendChild(owning);

    return bar;
}

function promptLink(drill, label) {
    const link = document.createElement('a');
    link.className = 'btn btn-secondary';
    link.href = generateModeHash('synthesis', drill.moduleId, drill.id);
    link.textContent = label;
    return link;
}

/* --------------------------------------------------------------------------
   Shared with the other two promoted modes
   -------------------------------------------------------------------------- */

/** A mono caps label above a panel. */
function panelHeading(text) {
    const heading = document.createElement('div');
    heading.className = 'panel-heading';
    heading.textContent = text;
    return heading;
}

/**
 * Clear the container and every class another renderer may have left on it.
 *
 * Each renderer owns the container completely — that is the rule the theory
 * renderers already follow, and three more of them is three more chances to
 * inherit somebody else's filter state.
 */
function resetContainer(container) {
    container.innerHTML = '';
    container.classList.remove(
        'cram-mode', 'tier-filtered', 'show-must', 'show-should', 'show-good'
    );
}
