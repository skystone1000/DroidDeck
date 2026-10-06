/* ==========================================================================
   Vocabulary shared by both corpus validators.

   Two validators now read the data layer — validate-theory.js and
   validate-questions.js — and a chapter and a question mean the same thing by
   "must-know", by "kotlin" and by the set of tags an author may write. Holding
   those lists in one file is what stops the two from drifting apart, which is
   the only way this project gets a rule enforced in one corpus and quietly not
   in the other.

   Theory-only vocabulary (doc kinds, block shapes, the drill catalogue) stays
   in validate-theory.js. This file holds what both need.
   ========================================================================== */

/* Kept in step with the renderers these values feed. */
const TIERS = ['must-know', 'should-know', 'good-to-know'];
const LANGUAGES = ['kotlin', 'java', 'xml', 'html', 'groovy', 'text'];
const DIAGRAM_TYPES = ['flowchart', 'animation', 'sequence'];      // js/diagrams.js

/* Tags allowed inside authored `html`. The table children are here because
   `<table>` is useless without them. `<img>` is deliberately absent: images are
   structured data on the question, not markup inside an answer, so that `src`
   and attribution can be checked rather than trusted. */
const ALLOWED_TAGS = [
    'p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'a', 'br',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
];

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Problems with a fragment of authored HTML, as a list of message strings.
 *
 * Returns messages rather than reporting them, so each validator can file them
 * against its own `where` and its own error/warning split.
 *
 * Attribute checks look **inside tags only**. Scanning the whole string for
 * `on…=` flags Kotlin named arguments in prose — `MutableSharedFlow(…,
 * onBufferOverflow = DROP_OLDEST)` inside a <code> element is not an event
 * handler — and a validator that cries wolf gets switched off.
 */
function htmlIssues(html) {
    const issues = [];
    const source = String(html);

    const tags = [...source.matchAll(/<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/g)]
        .map((m) => m[1].toLowerCase());

    for (const tag of new Set(tags)) {
        if (!ALLOWED_TAGS.includes(tag)) {
            issues.push(`uses <${tag}>, which is outside the allowed subset (${ALLOWED_TAGS.join(', ')})`);
        }
    }

    for (const tag of source.match(/<[^>]*>/g) || []) {
        if (/\son[a-z]+\s*=/i.test(tag)) {
            issues.push(`contains an inline event handler attribute, in ${tag.trim()}`);
        }
        if (/javascript:/i.test(tag)) {
            issues.push(`contains a javascript: URL, in ${tag.trim()}`);
        }
    }

    return issues;
}

module.exports = { TIERS, LANGUAGES, DIAGRAM_TYPES, ALLOWED_TAGS, KEBAB, htmlIssues };
