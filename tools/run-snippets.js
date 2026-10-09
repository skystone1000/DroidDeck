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

       node tools/run-snippets.js              # verify every stdout snippet
       node tools/run-snippets.js --selftest   # prove the harness itself works
       node tools/run-snippets.js --verbose    # show actual vs expected on pass

   Exits 1 if any snippet's real output differs from what is recorded.

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

    return { kotlinc, java, stdlib, extras, classpath, javaHome };
}

/* --------------------------------------------------------------------------
   Running one snippet
   -------------------------------------------------------------------------- */

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

        if (compile.status !== 0) {
            const detail = (compile.stderr || compile.stdout || '').trim().split('\n')
                .filter((l) => /error:/i.test(l)).slice(0, 4).join('; ');
            return { ok: false, note: `did not compile — ${detail || 'see kotlinc output'}` };
        }

        const run = spawnSync(tools.java, ['-cp', `${classes}${path.delimiter}${tools.classpath}`, 'SnippetKt'], {
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
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

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
    }
];

function runSelftest(tools) {
    console.log('Self-test — compiling and running known fixtures.\n');

    for (const fixture of FIXTURES) {
        const result = runKotlin(fixture.code, tools);
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

    if (!tools.kotlinc || !tools.java || !tools.stdlib) {
        console.log('No Kotlin toolchain found. Looked for:');
        console.log(`  kotlinc  ${tools.kotlinc || 'not found'}`);
        console.log(`  java     ${tools.java || 'not found'}`);
        console.log(`  stdlib   ${tools.stdlib || 'not found'}`);
        console.log('\nInstall Android Studio, or set $KOTLINC and $JAVA_HOME.');
        console.log('Without one, no snippet may carry output of kind "stdout" — an');
        console.log('unrun Output block is a guess. Use kind "trace" instead.');
        process.exit(1);
    }

    if (verbose || selftest) {
        console.log(`kotlinc: ${tools.kotlinc}`);
        console.log(`java:    ${tools.java}\n`);
    }

    if (selftest) process.exit(runSelftest(tools));

    const targets = stdoutSnippets(loadCorpus().topics);

    if (!targets.length) {
        console.log('No snippets carry output of kind "stdout" yet — nothing to verify.');
        console.log('Run with --selftest to confirm the harness works.');
        return;
    }

    console.log(`Verifying ${targets.length} snippet(s) against their recorded output.\n`);

    const failures = [];
    for (const target of targets) {
        if (target.snippet.language !== 'kotlin') {
            failures.push(target.label);
            console.log(`  ✗ ${target.label}`);
            console.log(`    language "${target.snippet.language}" cannot be run — only kotlin is supported\n`);
            continue;
        }

        const result = runKotlin(target.snippet.code || '', tools);
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

main();
