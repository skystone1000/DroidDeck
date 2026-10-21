/* ==========================================================================
   Snippet output verifier.

   A code block that prints its own output is only worth having if the output is
   true. A beginner cannot tell a real console dump from a plausible-looking
   wrong one — they are the reader this feature exists for — so an `output` of
   kind `stdout` is a claim this script is able to falsify: compile the snippet,
   run it, diff what it actually printed against what the corpus says it prints.

   Snippets that cannot be run as a program — Activities, ViewModels,
   Composables, Gradle config — are not this script's business. They carry
   `kind: 'trace'`, which is prose describing behaviour and is labelled as such
   in the UI. Only `stdout` is a machine-checkable claim.

   Kotlin and Java are both runnable. Java earns its place here rather than being
   an afterthought: the questions whose answers people get wrong until they watch
   them run — `Integer` caching at 127 against 128, `==` against `.equals()`,
   pass-by-value, the order `finally` runs in — are all Java, and all of them are
   claims a printed line settles.

       node tools/run-snippets.js              # verify every stdout snippet
       node tools/run-snippets.js --selftest   # prove the harness itself works
       node tools/run-snippets.js --verbose    # show actual vs expected on pass

   Exits 1 if any snippet's real output differs from what is recorded.

   Both corpora are covered. For a long time only the question bank could be --
   the theory layer's `syntax` block has no `output` field and never had one, so
   there was nothing there to falsify. The `predict` block introduced by
   docs/plans/2026-08-19-output-prediction.md does have one, and a section whose
   entire premise is "here is what this prints" is worth nothing if what it
   prints is an author's belief. So this walks theory too.

   Nothing here runs in the browser. The site serves the recorded text as static
   content; this script is the reason that text can be trusted.
   ========================================================================== */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const { loadCorpus } = require('./load-corpus');

/* A snippet is a documentation example, not a program under test. If it has not
   printed and exited by now it is a ticker or an infinite flow, which means it
   was never a `stdout` snippet to begin with. */
const RUN_TIMEOUT_MS = 20000;
const COMPILE_TIMEOUT_MS = 120000;

const argv = process.argv.slice(2);
const selftest = argv.includes('--selftest');
const verbose = argv.includes('--verbose');

/* --------------------------------------------------------------------------
   Toolchain

   Android Studio ships a Kotlin compiler and a JDK, so a machine set up for
   Android development already has everything this needs and nothing has to be
   installed. $KOTLINC and $JAVA_HOME win when set, so a standalone toolchain
   works too.

   `javac` sits beside the `java` we already resolve — the same bundled JBR — so
   Java support costs a path join rather than a second toolchain.
   -------------------------------------------------------------------------- */

const STUDIO = '/Applications/Android Studio.app/Contents';

function firstExisting(candidates) {
    return candidates.find((c) => c && fs.existsSync(c)) || null;
}

function onPath(binary) {
    const found = spawnSync('command', ['-v', binary], { shell: true, encoding: 'utf8' });
    const out = (found.stdout || '').trim();
    return out || null;
}

function resolveToolchain() {
    const kotlinc = firstExisting([
        process.env.KOTLINC,
        `${STUDIO}/plugins/Kotlin/kotlinc/bin/kotlinc`
    ]) || onPath('kotlinc');

    const javaHome = firstExisting([
        process.env.JAVA_HOME,
        `${STUDIO}/jbr/Contents/Home`
    ]);
    const java = firstExisting([javaHome && `${javaHome}/bin/java`]) || onPath('java');
    const javac = firstExisting([javaHome && `${javaHome}/bin/javac`]) || onPath('javac');

    // The stdlib sits beside whichever kotlinc we found; without it a compiled
    // class cannot start. kotlinx-coroutines ships in the same directory but is
    // *not* on the default classpath, and without it every snippet with a
    // `runBlocking` or a `delay` fails to compile — which is most of the ones
    // worth running.
    const lib = kotlinc ? path.join(path.dirname(kotlinc), '..', 'lib') : null;
    const stdlib = lib ? firstExisting([path.join(lib, 'kotlin-stdlib.jar')]) : null;
    const extras = lib
        ? ['kotlinx-coroutines-core-jvm.jar'].map((j) => path.join(lib, j)).filter(fs.existsSync)
        : [];

    const classpath = [stdlib, ...extras].filter(Boolean).join(path.delimiter);

    return { kotlinc, java, javac, stdlib, extras, classpath, javaHome };
}

/* --------------------------------------------------------------------------
   Running one snippet
   -------------------------------------------------------------------------- */

/** The first few compiler errors, on one line, or null if it compiled. */
function compileNote(compile, tool) {
    if (compile.status === 0) return null;
    const detail = (compile.stderr || compile.stdout || '').trim().split('\n')
        .filter((l) => /error:/i.test(l)).slice(0, 4).join('; ');
    return `did not compile — ${detail || `see ${tool} output`}`;
}

/** Run a compiled class and collect stdout as lines, or explain why it did not. */
function runClass(tools, classpath, mainClass) {
    const run = spawnSync(tools.java, ['-cp', classpath, mainClass], {
        encoding: 'utf8',
        timeout: RUN_TIMEOUT_MS
    });

    if (run.error && run.error.code === 'ETIMEDOUT') {
        return { ok: false, note: `did not finish within ${RUN_TIMEOUT_MS / 1000}s — it is not a stdout snippet` };
    }
    if (run.status !== 0) {
        const detail = (run.stderr || '').trim().split('\n')[0] || `exit ${run.status}`;
        return { ok: false, note: `threw at runtime — ${detail}` };
    }

    const lines = (run.stdout || '').split('\n');
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    return { ok: true, lines };
}

/**
 * Compile and run `code`, returning `{ ok, lines, note }`.
 * `lines` is stdout split on newlines with trailing blanks dropped.
 */
function runKotlin(code, tools) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'droiddeck-snippet-'));
    const source = path.join(dir, 'Snippet.kt');
    const classes = path.join(dir, 'out');

    try {
        fs.writeFileSync(source, code);

        const compile = spawnSync(tools.kotlinc, [source, '-cp', tools.classpath, '-d', classes], {
            encoding: 'utf8',
            timeout: COMPILE_TIMEOUT_MS,
            env: { ...process.env, JAVA_HOME: tools.javaHome || process.env.JAVA_HOME || '' }
        });

        const failed = compileNote(compile, 'kotlinc');
        if (failed) return { ok: false, note: failed };

        return runClass(tools, `${classes}${path.delimiter}${tools.classpath}`, 'SnippetKt');
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

/* --------------------------------------------------------------------------
   Java

   Kotlin puts top-level code in a predictable `SnippetKt`; Java does not. The
   file must be named after its public class, and the class to run is whichever
   one declares `main` — not necessarily the same one, and not necessarily the
   first. Both have to be read out of the source before anything can be compiled.
   -------------------------------------------------------------------------- */

/** Blank out comments and literals, which can contain braces and the word `class`. */
function stripLiterals(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/\/\/[^\n]*/g, ' ')
        .replace(/"""[\s\S]*?"""/g, '""')
        .replace(/"(\\.|[^"\\\n])*"/g, '""')
        .replace(/'(\\.|[^'\\\n])*'/g, "''");
}

/** Brace nesting depth at every index, so top-level declarations can be told apart. */
function depthMap(source) {
    const depth = new Array(source.length);
    let level = 0;
    for (let i = 0; i < source.length; i++) {
        if (source[i] === '}') level--;
        depth[i] = level;
        if (source[i] === '{') level++;
    }
    return depth;
}

/**
 * Work out what to call the file and what class to run.
 * Returns `{ file, main }`, where `main` is fully qualified and null if the
 * snippet has no entry point at all.
 */
function javaEntry(code) {
    const source = stripLiterals(code);
    const depth = depthMap(source);
    const pkg = (source.match(/^[ \t]*package\s+([\w.]+)\s*;/m) || [])[1] || null;

    // Only types declared at depth 0 are candidates. A `static class Node`
    // sitting above `main` inside the outer class is nested, and running it
    // would fail with an error that says nothing useful.
    const declaration = /\b(public\s+)?(?:(?:final|abstract|static|sealed|non-sealed)\s+)*(?:class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/g;
    const types = [];
    let match;
    while ((match = declaration.exec(source))) {
        if (depth[match.index] !== 0) continue;
        const open = source.indexOf('{', match.index);
        if (open === -1) continue;
        let end = open + 1;
        let level = 1;
        while (end < source.length && level > 0) {
            if (source[end] === '{') level++;
            else if (source[end] === '}') level--;
            end++;
        }
        types.push({ name: match[2], isPublic: Boolean(match[1]), start: match.index, end });
    }

    const mainAt = source.search(/\bvoid\s+main\s*\(\s*(?:final\s+)?String/);
    const holder = mainAt === -1 ? null : types.find((t) => mainAt > t.start && mainAt < t.end);
    const named = types.find((t) => t.isPublic) || holder || types[0];

    return {
        file: named ? named.name : 'Snippet',
        main: holder ? (pkg ? `${pkg}.${holder.name}` : holder.name) : null
    };
}

function runJava(code, tools) {
    const entry = javaEntry(code);
    if (!entry.main) {
        return { ok: false, note: 'declares no `public static void main` — it cannot print anything, so it is a trace, not a stdout snippet' };
    }

    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'droiddeck-snippet-'));
    const source = path.join(dir, `${entry.file}.java`);
    const classes = path.join(dir, 'out');

    try {
        fs.mkdirSync(classes);
        fs.writeFileSync(source, code);

        const compile = spawnSync(tools.javac, ['-nowarn', '-d', classes, source], {
            encoding: 'utf8',
            timeout: COMPILE_TIMEOUT_MS
        });

        const failed = compileNote(compile, 'javac');
        if (failed) return { ok: false, note: failed };

        return runClass(tools, classes, entry.main);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

const RUNNERS = { kotlin: runKotlin, java: runJava };

function sameOutput(actual, expected) {
    if (actual.length !== expected.length) return false;
    return actual.every((line, i) => line.trimEnd() === String(expected[i]).trimEnd());
}

function report(label, actual, expected) {
    console.log(`  ✗ ${label}`);
    console.log('    recorded:');
    expected.forEach((l) => console.log(`      | ${l}`));
    console.log('    actually printed:');
    actual.forEach((l) => console.log(`      | ${l}`));
    console.log('');
}

/* --------------------------------------------------------------------------
   The corpus
   -------------------------------------------------------------------------- */

function stdoutSnippets(topics) {
    const out = [];
    for (const topic of topics) {
        for (const question of topic.questions || []) {
            (question.codeSnippets || []).forEach((snippet, i) => {
                const output = snippet.output;
                if (!output || output.kind !== 'stdout') return;
                out.push({
                    label: `${topic.id} › ${question.id} codeSnippets[${i}]`,
                    snippet,
                    expected: output.lines || []
                });
            });
        }
    }
    return out;
}

/**
 * Predict blocks claiming stdout, from the theory corpus.
 *
 * The `snippet` is assembled from the block rather than the block being passed
 * through whole, so everything downstream — the runners, the diff, the report —
 * keeps taking exactly one shape and never learns that a second corpus exists.
 *
 * `trace` blocks are skipped here as they are in the question bank, but they
 * mean something narrower: validate-theory.js already refuses a `trace` on a
 * predict block in a runnable language, so anything skipped at this line is a
 * Composable or a lifecycle callback that no toolchain here could have run.
 */
function predictSnippets(modules) {
    const out = [];
    for (const mod of modules || []) {
        for (const chapter of mod.chapters || []) {
            for (const block of chapter.blocks || []) {
                if (block.type !== 'predict') continue;
                const output = block.output;
                if (!output || output.kind !== 'stdout') continue;
                out.push({
                    label: `${mod.id} › ${chapter.id} › predict:${block.id}`,
                    snippet: { language: block.language, code: block.code },
                    expected: output.lines || []
                });
            }
        }
    }
    return out;
}

/* --------------------------------------------------------------------------
   Self-test

   Until the first `stdout` output is authored there is nothing in the corpus to
   run, and a verifier that passes because it did nothing is worse than no
   verifier. The fixture proves the toolchain resolves, compiles, runs, and that
   a wrong expectation is actually caught.
   -------------------------------------------------------------------------- */

const FIXTURES = [
    {
        name: 'plain Kotlin',
        language: 'kotlin',
        code: [
            'fun main() {',
            '    val nums = listOf(1, 2, 3, 4)',
            '    println("sum=" + nums.sum())',
            '    nums.filter { it % 2 == 0 }.forEach { println("even $it") }',
            '}'
        ].join('\n'),
        expected: ['sum=10', 'even 2', 'even 4']
    },
    {
        // Most snippets worth running are coroutine snippets, and coroutines are
        // not on kotlinc's default classpath. Without this fixture the harness
        // would look healthy right up until the first real snippet failed to
        // compile.
        name: 'coroutines',
        language: 'kotlin',
        code: [
            'import kotlinx.coroutines.*',
            '',
            'fun main() = runBlocking {',
            '    val job = launch { repeat(3) { println("tick $it"); delay(10) } }',
            '    job.join()',
            '    println("done")',
            '}'
        ].join('\n'),
        expected: ['tick 0', 'tick 1', 'tick 2', 'done']
    },
    {
        // Java's entry point has to be found rather than assumed, so the fixture
        // uses the awkward shape on purpose: a helper type declared first, a
        // public class that is not the first declaration, and `main` inside it
        // after a nested class. Anything that guesses gets this wrong.
        name: 'Java',
        language: 'java',
        code: [
            'class Counter {',
            '    int value;',
            '    void bump() { value++; }',
            '}',
            '',
            'public class Demo {',
            '    static class Pair { int a, b; }',
            '',
            '    public static void main(String[] args) {',
            '        Counter c = new Counter();',
            '        c.bump();',
            '        c.bump();',
            '        System.out.println("value=" + c.value);',
            '',
            '        Integer small = 127, alsoSmall = 127;',
            '        Integer big = 128, alsoBig = 128;',
            '        System.out.println("127 == 127 -> " + (small == alsoSmall));',
            '        System.out.println("128 == 128 -> " + (big == alsoBig));',
            '    }',
            '}'
        ].join('\n'),
        expected: ['value=2', '127 == 127 -> true', '128 == 128 -> false']
    }
];

function runSelftest(tools) {
    console.log('Self-test — compiling and running known fixtures.\n');

    for (const fixture of FIXTURES) {
        const result = RUNNERS[fixture.language](fixture.code, tools);
        if (!result.ok) {
            console.log(`  ✗ ${fixture.name}: ${result.note}`);
            return 1;
        }
        if (!sameOutput(result.lines, fixture.expected)) {
            report(`${fixture.name} output did not match`, result.lines, fixture.expected);
            return 1;
        }
        console.log(`  ✓ ${fixture.name} — compiled, ran, printed exactly what was expected`);
    }

    // The negative case matters as much: a comparison that never fails would
    // pass every snippet in the corpus regardless of what it printed.
    if (sameOutput(FIXTURES[0].expected, ['sum=10', 'even 2', 'even 5'])) {
        console.log('  ✗ a wrong expectation compared equal — the diff is broken');
        return 1;
    }
    console.log('  ✓ a wrong expectation is rejected');
    return 0;
}

/* --------------------------------------------------------------------------
   Run
   -------------------------------------------------------------------------- */

function main() {
    const tools = resolveToolchain();

    if (!tools.kotlinc || !tools.java || !tools.javac || !tools.stdlib) {
        console.log('No complete toolchain found. Looked for:');
        console.log(`  kotlinc  ${tools.kotlinc || 'not found'}`);
        console.log(`  javac    ${tools.javac || 'not found'}`);
        console.log(`  java     ${tools.java || 'not found'}`);
        console.log(`  stdlib   ${tools.stdlib || 'not found'}`);
        console.log('\nInstall Android Studio, or set $KOTLINC and $JAVA_HOME.');
        console.log('Without one, no snippet may carry output of kind "stdout" — an');
        console.log('unrun Output block is a guess. Use kind "trace" instead.');
        process.exit(1);
    }

    if (verbose || selftest) {
        console.log(`kotlinc: ${tools.kotlinc}`);
        console.log(`javac:   ${tools.javac}`);
        console.log(`java:    ${tools.java}\n`);
    }

    if (selftest) process.exit(runSelftest(tools));

    const corpus = loadCorpus();
    const fromBank = stdoutSnippets(corpus.topics);
    const fromTheory = predictSnippets(corpus.theoryModules);
    const targets = [...fromBank, ...fromTheory];

    if (!targets.length) {
        console.log('No snippets carry output of kind "stdout" yet — nothing to verify.');
        console.log('Run with --selftest to confirm the harness works.');
        return;
    }

    // Broken out because the two numbers move independently and a single total
    // would hide a theory walk that silently found nothing.
    console.log(
        `Verifying ${targets.length} snippet(s) against their recorded output ` +
        `— ${fromBank.length} from the question bank, ${fromTheory.length} from theory.\n`
    );

    const failures = [];
    for (const target of targets) {
        const runner = RUNNERS[target.snippet.language];
        if (!runner) {
            failures.push(target.label);
            console.log(`  ✗ ${target.label}`);
            console.log(`    language "${target.snippet.language}" cannot be run — only ${Object.keys(RUNNERS).join(' and ')} are supported\n`);
            continue;
        }

        const result = runner(target.snippet.code || '', tools);
        if (!result.ok) {
            failures.push(target.label);
            console.log(`  ✗ ${target.label}\n    ${result.note}\n`);
            continue;
        }
        if (!sameOutput(result.lines, target.expected)) {
            failures.push(target.label);
            report(target.label, result.lines, target.expected);
            continue;
        }
        if (verbose) console.log(`  ✓ ${target.label}`);
        else process.stdout.write('.');
    }

    if (!verbose) console.log('\n');

    if (failures.length) {
        console.log(`${failures.length} of ${targets.length} snippet(s) do not print what the corpus says.`);
        process.exit(1);
    }
    console.log(`✓ all ${targets.length} snippet(s) print exactly what is recorded`);
}

if (require.main === module) main();

module.exports = { javaEntry, resolveToolchain, runKotlin, runJava, predictSnippets };
