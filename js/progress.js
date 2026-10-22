/* ==========================================================================
   Progress — what has been answered, what is coming back, what has been read.

   Theory has tracked read state since it was written; the question bank never
   has. That is the gap this file closes, and it deliberately reuses theory's
   posture rather than inventing a second one: localStorage is wrapped because
   it throws on file:// in some browsers and in private mode, and progress is a
   convenience that is not worth breaking the page over.

   Question keys are `topicId:questionId`, never the id alone. Question ids are
   unique *within* a topic only — tools/validate-questions.js asserts exactly
   one known cross-topic collision and fails on a second — so a store keyed on
   the bare id would silently mark two questions done at once.
   ========================================================================== */

const DONE_STORAGE_KEY = 'droiddeck:questions:done';
const LATER_STORAGE_KEY = 'droiddeck:questions:later';
const CHAPTER_STORAGE_KEY = 'droiddeck:theory:chapters';

/* Every mutation announces itself here. The checkbox, the sidebar counts and
   the header bar all read the same store, and all three have to move together
   when one row is ticked — re-rendering the topic to achieve that would throw
   away every expanded row on the page. */
const PROGRESS_EVENT = 'droiddeck:progress';

function questionKey(topicId, questionId) {
    return `${topicId}:${questionId}`;
}

/* --------------------------------------------------------------------------
   Storage
   -------------------------------------------------------------------------- */

function readSet(key) {
    try {
        const raw = window.localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(parsed) ? parsed : []);
    } catch (error) {
        return new Set();
    }
}

function writeSet(key, set) {
    try {
        window.localStorage.setItem(key, JSON.stringify([...set]));
    } catch (error) {
        /* Progress is a convenience; losing it is not worth an error. */
    }
}

/* `Review later` keeps a date, not a flag, because the row reports it as
   "reviewed 2d ago" — a bare set could only say "yes". */
function readMap(key) {
    try {
        const raw = window.localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : {};
        return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
    } catch (error) {
        return {};
    }
}

function writeMap(key, map) {
    try {
        window.localStorage.setItem(key, JSON.stringify(map));
    } catch (error) {
        /* As above. */
    }
}

function announceProgress(detail) {
    document.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail }));
}

/* --------------------------------------------------------------------------
   Questions — done
   -------------------------------------------------------------------------- */

function doneQuestions() {
    return readSet(DONE_STORAGE_KEY);
}

function isQuestionDone(topicId, questionId) {
    return doneQuestions().has(questionKey(topicId, questionId));
}

function setQuestionDone(topicId, questionId, done) {
    const current = doneQuestions();
    const key = questionKey(topicId, questionId);
    if (done) current.add(key); else current.delete(key);
    writeSet(DONE_STORAGE_KEY, current);
    announceProgress({ kind: 'done', topicId, questionId, done });
    return current;
}

/* --------------------------------------------------------------------------
   Questions — review later
   -------------------------------------------------------------------------- */

function laterQuestions() {
    return readMap(LATER_STORAGE_KEY);
}

function questionReviewedAt(topicId, questionId) {
    const stamp = laterQuestions()[questionKey(topicId, questionId)];
    return stamp ? new Date(stamp) : null;
}

function setQuestionReviewLater(topicId, questionId, flagged) {
    const current = laterQuestions();
    const key = questionKey(topicId, questionId);
    if (flagged) current[key] = new Date().toISOString();
    else delete current[key];
    writeMap(LATER_STORAGE_KEY, current);
    announceProgress({ kind: 'later', topicId, questionId, flagged });
    return current;
}

/** "2d ago", "just now" — the row has one line for this, so it stays coarse. */
function relativeDay(date) {
    if (!date) return '';
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return '1d ago';
    return `${days}d ago`;
}

/* --------------------------------------------------------------------------
   Theory — chapters

   Written now, read in the theory phase. The unit is the chapter rather than
   the module because a card that says "3 of 5 chapters" cannot be derived from
   a set of module ids, and a card reading "0 of 5" after four chapters were
   read is worse than the bare count it replaced.
   -------------------------------------------------------------------------- */

const MODULE_STORAGE_KEY = 'droiddeck:theory:read';
const MIGRATION_FLAG_KEY = 'droiddeck:theory:chapters:migrated';

function chapterKey(moduleId, chapterId) {
    return `${moduleId}:${chapterId}`;
}

function readChapters() {
    return readSet(CHAPTER_STORAGE_KEY);
}

function setChapterRead(moduleId, chapterId, read) {
    const current = readChapters();
    const key = chapterKey(moduleId, chapterId);
    if (read) current.add(key); else current.delete(key);
    writeSet(CHAPTER_STORAGE_KEY, current);
    announceProgress({ kind: 'chapter', moduleId, chapterId, read });
    return current;
}

/**
 * A module is read when all of its chapters are. That is the definition the
 * card's "3 of 5 chapters" needs, and it keeps the old module-level control
 * meaningful: pressing it sets or clears the whole set at once.
 */
function moduleProgress(mod) {
    const chapters = (mod && mod.chapters) || [];
    const done = readChapters();
    return {
        done: chapters.filter((c) => done.has(chapterKey(mod.id, c.id))).length,
        total: chapters.length
    };
}

function isModuleRead(mod) {
    const { done, total } = moduleProgress(mod);
    return total > 0 && done === total;
}

function setModuleChaptersRead(mod, read) {
    const current = readChapters();
    (mod.chapters || []).forEach((chapter) => {
        const key = chapterKey(mod.id, chapter.id);
        if (read) current.add(key); else current.delete(key);
    });
    writeSet(CHAPTER_STORAGE_KEY, current);
    announceProgress({ kind: 'module', moduleId: mod.id, read });
    return current;
}

/**
 * Read state used to live at module granularity, which cannot express a module
 * three chapters into five. Everything already marked read expands into all of
 * its chapter ids, once, so nobody loses progress in the move.
 *
 * The old key is read but deliberately not deleted. If this ships broken, the
 * data it held is still there to migrate again — and a one-line flag is a
 * cheaper insurance policy than a support message about lost progress.
 */
function migrateModuleProgress(modules) {
    let alreadyRun = false;
    try {
        alreadyRun = window.localStorage.getItem(MIGRATION_FLAG_KEY) === '1';
    } catch (error) {
        return;
    }
    if (alreadyRun) return;

    const legacy = readSet(MODULE_STORAGE_KEY);
    if (legacy.size) {
        const current = readChapters();
        (modules || []).forEach((mod) => {
            if (!legacy.has(mod.id)) return;
            (mod.chapters || []).forEach((chapter) => {
                current.add(chapterKey(mod.id, chapter.id));
            });
        });
        writeSet(CHAPTER_STORAGE_KEY, current);
    }

    try {
        window.localStorage.setItem(MIGRATION_FLAG_KEY, '1');
    } catch (error) {
        /* Worst case it runs again, and adding the same keys twice is a no-op. */
    }
}

/* --------------------------------------------------------------------------
   Theory — predicted outputs

   A predict block hides its answer until the reader commits to one. Which
   blocks have been revealed is progress in the same sense a read chapter is,
   and it is stored the same way.

   Keyed on the block id alone, with no module or chapter prefix, because
   tools/validate-theory.js holds a catalogue of every predict id and rejects a
   duplicate anywhere in the corpus. That is the opposite of the question bank,
   whose ids collide across topics by design and therefore need a composite
   key. Both keys are as short as their uniqueness guarantee allows.
   -------------------------------------------------------------------------- */

const PREDICT_STORAGE_KEY = 'droiddeck:predict:revealed';

function revealedPredictions() {
    return readSet(PREDICT_STORAGE_KEY);
}

function isPredictionRevealed(blockId) {
    return revealedPredictions().has(blockId);
}

function setPredictionRevealed(blockId, revealed) {
    const current = revealedPredictions();
    if (revealed) current.add(blockId); else current.delete(blockId);
    writeSet(PREDICT_STORAGE_KEY, current);
    announceProgress({ kind: 'predict', blockId, revealed });
    return current;
}

/** Every predict block in a module, in reading order. */
function predictBlocks(mod) {
    const found = [];
    ((mod && mod.chapters) || []).forEach((chapter) => {
        (chapter.blocks || []).forEach((block) => {
            if (block.type === 'predict') found.push(block);
        });
    });
    return found;
}

/**
 * Attempted against total, for a module of puzzles.
 *
 * A module whose chapters hold no predict blocks reports a total of 0, which
 * `progressPercent` already answers with 0 rather than NaN — so this is safe to
 * call on any module, not only the ones in the output track.
 */
function predictProgress(mod) {
    const revealed = revealedPredictions();
    const blocks = predictBlocks(mod);
    return {
        done: blocks.filter((block) => revealed.has(block.id)).length,
        total: blocks.length
    };
}

/* --------------------------------------------------------------------------
   Counts

   Every counter in the UI — sidebar sub-item, sidebar group, page header bar —
   comes from one of these, so they cannot drift apart.
   -------------------------------------------------------------------------- */

function countDone(topicId, questions) {
    const done = doneQuestions();
    return (questions || []).filter((q) => done.has(questionKey(topicId, q.id))).length;
}

function topicProgress(topic) {
    const questions = (topic && topic.questions) || [];
    return { done: countDone(topic.id, questions), total: questions.length };
}

function subsectionProgress(topic, subsectionId) {
    const questions = ((topic && topic.questions) || [])
        .filter((q) => q.subsection === subsectionId);
    return { done: countDone(topic.id, questions), total: questions.length };
}

/** 0–100, and 0 rather than NaN for an empty set. */
function progressPercent(done, total) {
    if (!total) return 0;
    return Math.round((done / total) * 100);
}

/* --------------------------------------------------------------------------
   Per-mode progress

   Five modes, five units, and deliberately no total across them. "38 known,
   11 read, 3 rehearsed, 6 solved, 41 seen" is five facts; a single number
   averaging them would be a sixth that is not true of anything.

   Each store below is the smallest thing that can answer its mode's question.
   -------------------------------------------------------------------------- */

const REHEARSED_STORAGE_KEY = 'droiddeck:synthesis:rehearsed';
const VERDICT_STORAGE_KEY = 'droiddeck:predict:verdicts';
const SEEN_STORAGE_KEY = 'droiddeck:glossary:seen';

/* A drill is rehearsed when the reader says so. There is nothing to grade —
   the value of a drill is in having attempted it against the clock, and no
   store can check that — so this is a set of ids behind a single toggle. */
function rehearsedDrills() {
    return readSet(REHEARSED_STORAGE_KEY);
}

function isDrillRehearsed(drillId) {
    return rehearsedDrills().has(drillId);
}

function setDrillRehearsed(drillId, rehearsed) {
    const current = rehearsedDrills();
    if (rehearsed) current.add(drillId); else current.delete(drillId);
    writeSet(REHEARSED_STORAGE_KEY, current);
    announceProgress({ kind: 'rehearsed', drillId, rehearsed });
    return current;
}

/* A snippet has a verdict, not a flag: 'right' or 'wrong'. The sidebar draws a
   strip of one cell per snippet and it has to distinguish three states, so a
   set could not carry it.

   Keyed on the bare block id, as the reveal store already is —
   tools/validate-theory.js holds a catalogue of every predict id and rejects a
   duplicate anywhere in the corpus, which is what makes the short key safe. */
function predictVerdicts() {
    return readMap(VERDICT_STORAGE_KEY);
}

function predictVerdict(blockId) {
    return predictVerdicts()[blockId] || null;
}

function setPredictVerdict(blockId, verdict) {
    const current = predictVerdicts();
    if (verdict === 'right' || verdict === 'wrong') current[blockId] = verdict;
    else delete current[blockId];
    writeMap(VERDICT_STORAGE_KEY, current);
    announceProgress({ kind: 'verdict', blockId, verdict });
    return current;
}

/* A term is seen once its card has been on screen. That is a weaker claim than
   "read", and the counter says so — SEEN, not KNOWN — but it is the only claim
   a glossary can honestly make without asking the reader to tick sixty-eight
   boxes nobody would tick. */
function seenTerms() {
    return readSet(SEEN_STORAGE_KEY);
}

function markTermSeen(term) {
    const current = seenTerms();
    if (current.has(term)) return current;
    current.add(term);
    writeSet(SEEN_STORAGE_KEY, current);
    announceProgress({ kind: 'seen', term });
    return current;
}

/* --------------------------------------------------------------------------
   The flat lists the two promoted modes need

   A track never had to produce one: the theory renderer walks modules and
   chapters, and a block was only ever reached from inside its chapter. A mode
   that shows one drill or one snippet per screen needs the whole track as an
   ordered sequence, so that "next" can cross a module boundary.
   -------------------------------------------------------------------------- */

function blocksOfTypeInTrack(trackId, type) {
    const mods = (typeof theoryModules === 'undefined' ? [] : theoryModules)
        .filter((mod) => mod.trackId === trackId)
        .sort((a, b) => a.order - b.order);

    const found = [];
    mods.forEach((mod) => {
        (mod.chapters || []).forEach((chapter) => {
            (chapter.blocks || []).forEach((block) => {
                if (block.type !== type) return;
                // The block, plus where it came from. Copied rather than
                // mutated: the corpus is shared, and a renderer that wrote a
                // moduleId onto a block would be editing the data layer.
                found.push(Object.assign({}, block, {
                    moduleId: mod.id,
                    moduleTitle: mod.title,
                    moduleOrder: mod.order,
                    chapterId: chapter.id,
                    chapterTitle: chapter.title
                }));
            });
        });
    });
    return found;
}

function allDrills() {
    return blocksOfTypeInTrack('synthesis', 'drill');
}

function allPredicts() {
    return blocksOfTypeInTrack('output', 'predict');
}

/** Modules in the seven tracks the sidebar still lists, in reading order. */
function subjectTrackModules() {
    const subjects = (typeof theoryTracks === 'undefined' ? [] : theoryTracks)
        .filter((track) => track.scope === 'subject')
        .map((track) => track.id);

    return (typeof theoryModules === 'undefined' ? [] : theoryModules)
        .filter((mod) => subjects.includes(mod.trackId))
        .sort((a, b) => a.order - b.order);
}

/* --------------------------------------------------------------------------
   The one function every counter reads
   -------------------------------------------------------------------------- */

/**
 * `{ done, total, noun }` for a mode — the only shape the rail meter, the mode
 * header and the rail tooltip know about.
 *
 * There is no `allModesProgress()` and there must not be. The five units do not
 * add up, and a header claiming they did would be lying somewhere the reader
 * has no way to check.
 */
function modeProgress(modeId) {
    const mode = (typeof modeById === 'undefined') ? null : modeById[modeId];
    const noun = mode ? mode.progressNoun : '';

    switch (modeId) {
        case 'questions': {
            const all = (typeof topics === 'undefined') ? [] : topics;
            const done = doneQuestions();
            let d = 0;
            let t = 0;
            all.forEach((topic) => {
                (topic.questions || []).forEach((question) => {
                    t += 1;
                    if (done.has(questionKey(topic.id, question.id))) d += 1;
                });
            });
            return { done: d, total: t, noun };
        }

        case 'theory': {
            // Subject tracks only. The chapters in the two promoted tracks
            // belong to Synthesis and Predict and are counted there — counting
            // them twice would make the two meters disagree about one corpus.
            const read = readChapters();
            let d = 0;
            let t = 0;
            subjectTrackModules().forEach((mod) => {
                (mod.chapters || []).forEach((chapter) => {
                    t += 1;
                    if (read.has(chapterKey(mod.id, chapter.id))) d += 1;
                });
            });
            return { done: d, total: t, noun };
        }

        case 'synthesis': {
            const drills = allDrills();
            const done = rehearsedDrills();
            return { done: drills.filter((b) => done.has(b.id)).length, total: drills.length, noun };
        }

        case 'predict': {
            const blocks = allPredicts();
            const verdicts = predictVerdicts();
            return { done: blocks.filter((b) => verdicts[b.id]).length, total: blocks.length, noun };
        }

        case 'glossary': {
            const entries = (typeof collectGlossaryEntries === 'function')
                ? collectGlossaryEntries() : [];
            const seen = seenTerms();
            return { done: entries.filter((e) => seen.has(e.term)).length, total: entries.length, noun };
        }

        default:
            return { done: 0, total: 0, noun: '' };
    }
}

/** `38 / 465 KNOWN` — the mode header's long form, built in exactly one place. */
function modeProgressLabel(modeId) {
    const { done, total, noun } = modeProgress(modeId);
    return `${done} / ${total} ${noun}`;
}
