/* ==========================================================================
   Syntax highlighting for Kotlin, Java and XML.

   Keyword-based rather than a real tokenizer. Matches are swapped for a
   \x00PH{n}\x00 placeholder so a later pass can never reach inside markup an
   earlier pass produced — without that, a keyword inside a string literal (or
   an "@" inside a comment) would get wrapped twice and the HTML would nest
   incorrectly. Placeholders are restored last, innermost content intact.

   Comments and literals are matched in ONE alternation rather than in separate
   passes. They mutually exclude each other, so whichever opens first has to
   win: `"a // b"` is entirely a string, `// says "hi"` is entirely a comment.
   Running them as separate passes gets one of those two cases wrong whichever
   order you pick.
   ========================================================================== */

const KOTLIN_KEYWORDS = [
    'abstract', 'actual', 'annotation', 'as', 'break', 'by', 'catch', 'class',
    'companion', 'const', 'constructor', 'continue', 'crossinline', 'data',
    'delegate', 'do', 'else', 'enum', 'expect', 'external', 'field', 'file',
    'final', 'finally', 'for', 'fun', 'get', 'if', 'import', 'in', 'infix',
    'init', 'inline', 'inner', 'interface', 'internal', 'is', 'lateinit',
    'noinline', 'null', 'object', 'open', 'operator', 'out', 'override',
    'package', 'private', 'property', 'protected', 'public', 'reified',
    'return', 'sealed', 'set', 'super', 'suspend', 'tailrec', 'this', 'throw',
    'try', 'typealias', 'val', 'value', 'var', 'vararg', 'when', 'where',
    'while', 'true', 'false', 'it',
    // coroutines / flow vocabulary — highlighted because it reads as language
    'launch', 'async', 'await', 'runBlocking', 'withContext', 'coroutineScope',
    'supervisorScope', 'flow', 'emit', 'collect', 'delay', 'yield', 'flowOn'
];

const JAVA_KEYWORDS = [
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
    'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
    'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
    'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
    'package', 'private', 'protected', 'public', 'return', 'short', 'static',
    'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
    'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null',
    'var', 'record', 'sealed', 'yield'
];

function escapeHtml(code) {
    return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function highlightCode(code, language) {
    const escaped = escapeHtml(code || '');
    switch ((language || '').toLowerCase()) {
        case 'kotlin': return highlightJvm(escaped, KOTLIN_KEYWORDS);
        case 'java':   return highlightJvm(escaped, JAVA_KEYWORDS);
        case 'xml':
        case 'html':   return highlightXml(escaped);
        default:       return escaped;
    }
}

/* Comments and literals, in one alternation so the earliest opener wins.
   Quotes are already `&quot;` entities by the time this runs. */
const JVM_ATOMS = new RegExp([
    '\\/\\*[\\s\\S]*?\\*\\/',                       // block comment
    '\\/\\/[^\\n]*',                                // line comment
    '&quot;&quot;&quot;[\\s\\S]*?&quot;&quot;&quot;', // raw string
    '&quot;(?:\\\\.|(?!&quot;)[\\s\\S])*?&quot;',   // string
    "'(?:\\\\.|[^'])'"                              // char
].join('|'), 'g');

/** Shared Kotlin/Java pass. */
function highlightJvm(code, keywords) {
    const store = [];
    const stash = (html) => `\x00PH${store.push(html) - 1}\x00`;

    code = code.replace(JVM_ATOMS, (m) => {
        const cls = m.startsWith('/') ? 'comment' : 'string';
        return stash(`<span class="${cls}">${m}</span>`);
    });

    // Annotations
    code = code.replace(/@\w+/g, (m) => stash(`<span class="annotation">${m}</span>`));
    // Numbers
    code = code.replace(/\b\d+(?:\.\d+)?[fFlLdD]?\b/g, (m) => stash(`<span class="number">${m}</span>`));
    // Keywords
    const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    code = code.replace(keywordPattern, (m) => stash(`<span class="keyword">${m}</span>`));

    return restore(code, store);
}

/* Same reasoning as JVM_ATOMS: a quote inside <!-- --> is not a string. */
const XML_ATOMS = /&lt;!--[\s\S]*?--&gt;|&quot;(?:(?!&quot;)[\s\S])*?&quot;/g;

function highlightXml(code) {
    const store = [];
    const stash = (html) => `\x00PH${store.push(html) - 1}\x00`;

    code = code.replace(XML_ATOMS, (m) => {
        const cls = m.startsWith('&lt;') ? 'comment' : 'string';
        return stash(`<span class="${cls}">${m}</span>`);
    });

    // Tag names, opening and closing
    code = code.replace(/(&lt;\/?)([\w.:-]+)/g,
        (_, bracket, name) => bracket + stash(`<span class="tag">${name}</span>`));
    // Attribute names
    code = code.replace(/([\w.:-]+)(=)/g,
        (_, name, eq) => stash(`<span class="attribute">${name}</span>`) + eq);

    return restore(code, store);
}

/**
 * Placeholders can nest (a stashed tag name sits inside a stashed line), so
 * keep expanding until no marker survives.
 */
function restore(code, store) {
    let previous;
    do {
        previous = code;
        code = code.replace(/\x00PH(\d+)\x00/g, (_, i) => store[Number(i)]);
    } while (code !== previous);
    return code;
}
