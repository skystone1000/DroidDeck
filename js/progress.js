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
