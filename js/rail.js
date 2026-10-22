/* ==========================================================================
   The rail, and the mode header beside it.

   Both are built entirely from data/modes.js. Neither knows the name of a
   single mode, which is the point: a sixth mode is a sixth record, not a sixth
   branch in here.

   The rail never sets the active mode directly. It navigates, and the router
   sets the mode — the hash stays the source of truth, so the rail and the back
   button cannot disagree. That is the same discipline the two-tab switch it
   replaces was careful to keep.
   ========================================================================== */

let activeMode = 'questions';

const MODE_STORAGE_KEY = 'droiddeck:mode';
const LAST_SELECTION_KEY = 'droiddeck:mode:last';

function currentMode() {
    return modeById[activeMode] || appModes[0];
}

/** True when the mode actually changed, so callers can avoid a double render. */
function setActiveMode(modeId) {
    const next = modeById[modeId] ? modeId : 'questions';
    if (next === activeMode) {
        paintRail();
        return false;
    }
    activeMode = next;
    document.documentElement.dataset.mode = next;
    renderSidebar();
    paintRail();
    return true;
}

/* --------------------------------------------------------------------------
   The rail
   -------------------------------------------------------------------------- */

function renderRail() {
    const host = document.getElementById('railItems');
    if (!host) return;
    host.innerHTML = '';

    let lastGroup = null;
    appModes.forEach((mode) => {
        if (lastGroup && mode.group !== lastGroup) {
            const divider = document.createElement('div');
            divider.className = 'rail-divider';
            host.appendChild(divider);
        }
        lastGroup = mode.group;
        host.appendChild(buildRailItem(mode));
    });

    paintRail();
}

function buildRailItem(mode) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'rail-item';
    item.dataset.modeId = mode.id;
    item.setAttribute('role', 'tab');
    // The full name, and the digit that reaches it. The 11px label below is the
    // only place in the app the short form is allowed to appear.
    item.title = `${mode.title} — ${mode.key}`;
    item.setAttribute('aria-label', mode.title);
    item.style.setProperty('--rail-accent', `var(${mode.accentVar})`);

    const icon = document.createElement('span');
    icon.className = 'rail-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = mode.icon;

    const label = document.createElement('span');
    label.className = 'rail-label';
    label.textContent = mode.shortLabel;

    item.appendChild(icon);
    item.appendChild(label);
    item.addEventListener('click', () => goToMode(mode.id));
    return item;
}

function goToMode(modeId) {
    const mode = modeById[modeId];
    if (!mode) return;
    // The place you left, not the top of the mode. Falling back to the bare
    // route only on a first visit.
    window.location.hash = lastSelectionFor(modeId) || `#${mode.route}`;
    closeMobileMenu();
}

function paintRail() {
    const mode = currentMode();
    const { done, total } = modeProgress(mode.id);
    const pct = progressPercent(done, total);

    document.querySelectorAll('.rail-item').forEach((item) => {
        const on = item.dataset.modeId === mode.id;
        item.classList.toggle('active', on);
        item.setAttribute('aria-selected', String(on));
    });

    const meter = document.getElementById('railMeter');
    const fill = document.getElementById('railMeterFill');
    const label = document.getElementById('railMeterLabel');
    if (meter) meter.style.setProperty('--rail-accent', `var(${mode.accentVar})`);
    if (fill) fill.style.width = `${pct}%`;
    if (label) label.textContent = `${pct}%`;

    paintModeHeader(mode, pct);
}

/* --------------------------------------------------------------------------
   The mode header
   -------------------------------------------------------------------------- */

function paintModeHeader(mode, pct) {
    const title = document.getElementById('modeTitle');
    const meta = document.getElementById('modeMeta');
    const progressLabel = document.getElementById('modeProgressLabel');
    const progressFill = document.getElementById('modeProgressFill');

    // Never the short form here. "Synthesis" is a rail label; the header says
    // what the mode is called.
    if (title) title.textContent = mode.title;
    if (meta) meta.textContent = modeMeta(mode.id);
    // One place builds the number, so the rail meter and the header cannot
    // disagree about it.
    if (progressLabel) progressLabel.textContent = modeProgressLabel(mode.id);
    if (progressFill) {
        progressFill.style.width = `${pct}%`;
        progressFill.style.setProperty('--rail-accent', `var(${mode.accentVar})`);
    }
}

/** "7 sets · 80 snippets" — computed from the corpus, never written down. */
function modeMeta(modeId) {
    switch (modeId) {
        case 'questions': {
            const questions = (typeof topics === 'undefined' ? [] : topics)
                .reduce((n, topic) => n + (topic.questions || []).length, 0);
            return `${subjectTracks().length} tracks · ${questions} questions`;
        }
        case 'theory': {
            const mods = subjectTrackModules();
            const chapters = mods.reduce((n, mod) => n + (mod.chapters || []).length, 0);
            return `${subjectTracks().length} tracks · ${mods.length} modules · ${chapters} chapters`;
        }
        case 'synthesis':
            return `${modulesInTrack('synthesis').length} rounds · ${allDrills().length} prompts`;
        case 'predict':
            return `${modulesInTrack('output').length} sets · ${allPredicts().length} snippets`;
        case 'glossary': {
            const entries = collectGlossaryEntries();
            const letters = new Set(entries.map((entry) => glossaryLetter(entry.term)));
            return `${letters.size} letters · ${entries.length} terms`;
        }
        default:
            return '';
    }
}

/* --------------------------------------------------------------------------
   Where you were

   Per mode, not one global "last page". Returning to Questions should land on
   the track you left, not on track one — and a reader three snippets into
   Predict has a different "where was I" from one halfway down the glossary.
   One slot each is what makes both true.
   -------------------------------------------------------------------------- */

function rememberMode(route) {
    try {
        window.localStorage.setItem(MODE_STORAGE_KEY, route.mode);
        const last = JSON.parse(window.localStorage.getItem(LAST_SELECTION_KEY) || '{}');
        last[route.mode] = window.location.hash;
        window.localStorage.setItem(LAST_SELECTION_KEY, JSON.stringify(last));
    } catch (error) {
        /* Progress is a convenience; losing it is not worth an error. */
    }
}

function lastSelectionFor(modeId) {
    try {
        return JSON.parse(window.localStorage.getItem(LAST_SELECTION_KEY) || '{}')[modeId] || null;
    } catch (error) {
        return null;
    }
}
