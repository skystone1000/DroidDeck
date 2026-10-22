/* ==========================================================================
   Predict the Output — one snippet per screen.

   Eighty snippets across seven sets, each already carrying a prompt, code, the
   output it produces and a paragraph naming the wrong answer people reach for.
   What the block could not do inside a chapter was count: revealing an answer
   said "this was looked at", not "this was got right", and a mode whose unit is
   snippets solved needs the second.

   So a reveal is followed by two rows — got it right, got it wrong — and the
   answer becomes a verdict the reader records rather than a page they scrolled
   past. Sixty-three of the eighty are compiled and diffed by
   tools/run-snippets.js, so what the reader is grading themselves against is
   checked output rather than an author's memory.

   Multiple choice is a separate project with its own plan, and the seam it
   replaces is one function: renderAnswerControl. Everything around it reads
   only predictVerdict(block.id), so a set that gets options later and a set
   that never does produce the same counter, the same strip and the same
   storage.
   ========================================================================== */

/* --------------------------------------------------------------------------
   Overview — #predict
   -------------------------------------------------------------------------- */

function renderPredictOverview() {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        resetContainer(container);

        const sets = modulesInTrack('output');
        const snippets = allPredicts();
        const verdicts = predictVerdicts();

        const header = document.createElement('header');
        header.className = 'topic-header';

        const title = document.createElement('h2');
        title.className = 'topic-title';
        title.textContent = 'Predict the Output';

        const blurb = document.createElement('p');
        blurb.className = 'theory-overview-blurb';
        blurb.textContent =
            'Eighty snippets that ask what the code prints, and withhold the answer ' +
            'until you commit to one. Most of them are compiled and checked on every build.';

        const stats = document.createElement('div');
        stats.className = 'topic-stats';
        stats.appendChild(makeStat(`${sets.length} sets`));
        stats.appendChild(makeStat(`${snippets.length} snippets`));
        stats.appendChild(makeStat(
            `${snippets.filter((s) => s.output && s.output.kind === 'stdout').length} verified`
        ));

        header.appendChild(title);
        header.appendChild(blurb);
        header.appendChild(stats);
        header.appendChild(renderProgressBar(
            snippets.filter((s) => verdicts[s.id]).length, snippets.length, 'solved'
        ));
        container.appendChild(header);

        sets.forEach((mod) => container.appendChild(renderSetCard(mod, snippets, verdicts)));

        container.classList.remove('topic-transitioning');
        history.replaceState(null, '', generateModeHash('predict'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function renderSetCard(mod, snippets, verdicts) {
    const mine = snippets.filter((snippet) => snippet.moduleId === mod.id);
    const done = mine.filter((snippet) => verdicts[snippet.id]).length;

    const card = document.createElement('a');
    card.className = 'theory-card predict-set-card';
    card.href = generateModeHash('predict', mod.id);
    card.dataset.hue = trackHue('output');

    const title = document.createElement('h3');
    title.className = 'theory-card-title';
    title.textContent = mod.title;

    const tagline = document.createElement('p');
    tagline.className = 'theory-card-tagline';
    tagline.textContent = mod.tagline || '';

    card.appendChild(title);
    if (mod.tagline) card.appendChild(tagline);
    card.appendChild(renderMiniStrip(mine, verdicts));
    card.appendChild(renderProgressBar(done, mine.length, 'solved'));

    return card;
}

function renderMiniStrip(snippets, verdicts) {
    const strip = document.createElement('div');
    strip.className = 'nav-strip predict-mini-strip';
    snippets.forEach((snippet) => {
        const cell = document.createElement('span');
        cell.className = 'nav-strip-cell';
        const verdict = verdicts[snippet.id];
        if (verdict) cell.classList.add(`is-${verdict}`);
        strip.appendChild(cell);
    });
    return strip;
}

/* --------------------------------------------------------------------------
   One snippet — #predict/<moduleId>[/<snippetId>]
   -------------------------------------------------------------------------- */

function renderPredictSnippet(moduleId, snippetId) {
    const container = document.getElementById('topicContainer');
    if (!container) return;

    const all = allPredicts();
    const inModule = all.filter((snippet) => snippet.moduleId === moduleId);
    if (!inModule.length) {
        renderPredictOverview();
        return;
    }

    // Landing on a set with no snippet named opens the first unanswered one —
    // where the reader actually is, not the top of the list.
    const verdicts = predictVerdicts();
    const snippet = (snippetId && inModule.find((s) => s.id === snippetId))
        || inModule.find((s) => !verdicts[s.id])
        || inModule[0];

    container.classList.add('topic-transitioning');

    setTimeout(() => {
        resetContainer(container);
        container.appendChild(buildSnippetScreen(snippet, inModule, all));

        container.classList.remove('topic-transitioning');
        renderSidebar();
        history.replaceState(null, '', generateModeHash('predict', snippet.moduleId, snippet.id));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, TOPIC_TRANSITION_MS);
}

function buildSnippetScreen(snippet, inModule, all) {
    const article = document.createElement('article');
    article.className = 'predict-screen';
    article.dataset.snippetId = snippet.id;

    const position = inModule.findIndex((s) => s.id === snippet.id) + 1;
    const stdout = snippet.output && snippet.output.kind === 'stdout';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'predict-eyebrow';
    eyebrow.textContent = `${snippet.moduleTitle} · ${position} of ${inModule.length}`;
    article.appendChild(eyebrow);

    const title = document.createElement('h2');
    title.className = 'topic-title';
    // A verified snippet asks what it prints; a reasoned one asks what happens,
    // because it has no console to be right about. The same distinction the
    // in-chapter block has always drawn.
    title.textContent = stdout ? 'What does this print?' : 'What happens here?';
    article.appendChild(title);

    const prompt = document.createElement('div');
    prompt.className = 'predict-prompt';
    prompt.innerHTML = snippet.prompt || '';
    article.appendChild(prompt);

    // Deliberately without `output`. renderCodeBlock paints an output pane
    // directly under the code, which is the one thing this screen exists to
    // prevent — the same contract the in-chapter block has kept since it was
    // written.
    article.appendChild(renderCodeBlock({
        language: snippet.language,
        title: snippet.title || 'The code',
        code: snippet.code
    }));

    article.appendChild(renderAnswerControl(snippet));
    article.appendChild(renderSnippetActions(snippet, all));

    return article;
}

/**
 * The one seam between answer styles.
 *
 * Today: reveal, then say whether you got it. Later, per set: four options with
 * the verdict decided for you. Everything around this function reads only
 * `predictVerdict(block.id)`, so both write the same key and neither knows
 * about the other.
 */
function renderAnswerControl(snippet) {
    const wrap = document.createElement('div');
    wrap.className = 'predict-answer';

    const verdict = predictVerdict(snippet.id);
    const revealed = Boolean(verdict) || isPredictionRevealed(snippet.id);

    if (!revealed) {
        const reveal = document.createElement('button');
        reveal.type = 'button';
        reveal.className = 'btn btn-primary predict-reveal';
        reveal.textContent = 'Reveal the output';
        reveal.addEventListener('click', () => {
            setPredictionRevealed(snippet.id, true);
            renderPredictSnippet(snippet.moduleId, snippet.id);
        });
        wrap.appendChild(reveal);
        return wrap;
    }

    /* The output pane and the Why callout are one thing, not two.
       renderCodeOutput already paints output.explain beneath the console dump,
       and building a second panel from the same field printed every
       explanation twice. The pane is given the mode's accent rule instead, so
       it reads as the Why the specification asks for without the corpus having
       to carry a second copy of the prose. */
    const pane = renderCodeOutput(snippet.output);
    pane.classList.add('predict-why');
    wrap.appendChild(pane);

    // Naming the wrong answer is the part that teaches. "You got it wrong" is
    // not feedback; "you probably thought the body ran where it was written"
    // is, and it is the only thing here a worked example could not have said.
    if (snippet.distractor) {
        const miss = document.createElement('div');
        miss.className = 'predict-distractor';
        miss.innerHTML = snippet.distractor;
        wrap.appendChild(miss);
    }

    wrap.appendChild(renderVerdictRows(snippet, verdict));
    return wrap;
}

function renderVerdictRows(snippet, verdict) {
    const group = document.createElement('div');
    group.className = 'predict-verdicts';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', 'Did you get it right?');

    [
        { id: 'right', label: 'I got it right' },
        { id: 'wrong', label: 'I got it wrong' }
    ].forEach((option) => {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'predict-verdict';
        row.dataset.verdict = option.id;
        row.setAttribute('role', 'radio');
        row.setAttribute('aria-checked', String(verdict === option.id));
        if (verdict === option.id) row.classList.add('is-chosen');

        const label = document.createElement('span');
        label.className = 'predict-verdict-label';
        label.textContent = option.label;
        row.appendChild(label);

        if (verdict === option.id) {
            const caption = document.createElement('span');
            caption.className = 'predict-verdict-caption';
            caption.textContent = option.id === 'right'
                ? 'YOUR ANSWER · CORRECT' : 'YOUR ANSWER · WRONG';
            row.appendChild(caption);
        }

        // Pressing the recorded verdict again clears it, which is the only way
        // back for a reader who pressed the wrong row.
        row.addEventListener('click', () => {
            setPredictVerdict(snippet.id, verdict === option.id ? null : option.id);
            renderPredictSnippet(snippet.moduleId, snippet.id);
        });

        group.appendChild(row);
    });

    return group;
}

function renderSnippetActions(snippet, all) {
    const bar = document.createElement('div');
    bar.className = 'predict-actions';

    const index = all.findIndex((s) => s.id === snippet.id);

    if (index > 0) bar.appendChild(snippetLink(all[index - 1], '← Previous snippet'));
    if (index < all.length - 1) bar.appendChild(snippetLink(all[index + 1], 'Next snippet →'));

    const owning = document.createElement('a');
    owning.className = 'btn btn-ghost';
    owning.href = generateTheoryHash(snippet.moduleId, snippet.chapterId);
    owning.textContent = `Theory › ${snippet.chapterTitle}`;
    bar.appendChild(owning);

    return bar;
}

function snippetLink(snippet, label) {
    const link = document.createElement('a');
    link.className = 'btn btn-secondary';
    link.href = generateModeHash('predict', snippet.moduleId, snippet.id);
    link.textContent = label;
    return link;
}
