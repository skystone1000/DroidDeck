/* ==========================================================================
   Documentation link checker.

   Theory anchors every module and most chapters to official documentation, and
   that documentation moves: while planning this section Compose had migrated
   from /jetpack/compose/* to /develop/ui/compose/*, and background work from
   /guide/background to /develop/background-work/*.

   A redirect that resolves today is a 404 next year, so redirects are reported
   as failures to be fixed at the source rather than quietly followed.

       node tools/check-doc-links.js            # check everything not yet cached
       node tools/check-doc-links.js --all      # ignore the cache
       node tools/check-doc-links.js --json     # machine-readable output

   Hits the network, so this is a per-phase check, not a per-commit one.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { loadCorpus, ROOT } = require('./load-corpus');

const DOC_BASE = 'https://developer.android.com';
const CACHE_FILE = path.join(ROOT, 'tools', '.doc-link-cache.json');
const CONCURRENCY = 6;
const DELAY_MS = 120;
const TIMEOUT_MS = 15000;

const argv = process.argv.slice(2);
const ignoreCache = argv.includes('--all');
const asJson = argv.includes('--json');

/* --------------------------------------------------------------------------
   Collect every link in the corpus
   -------------------------------------------------------------------------- */

function collectLinks({ theoryModules, topics }) {
    const links = new Map();   // url -> [where]

    const add = (doc, where) => {
        if (!doc) return;
        const url = doc.path ? DOC_BASE + doc.path : doc.url;
        if (!url) return;
        if (!links.has(url)) links.set(url, []);
        links.get(url).push(where);
    };

    for (const mod of theoryModules) {
        add(mod.docHub, `module "${mod.id}" docHub`);
        for (const chapter of mod.chapters || []) {
            (chapter.docs || []).forEach((doc, i) => {
                add(doc, `${mod.id} › ${chapter.id} docs[${i}]`);
            });
        }
    }

    /* The question bank's reference links go through the same probe. They were
       unchecked for as long as they have existed, which is the longer half of
       the corpus and the half a reader is most likely to click. `referenceLinks`
       carry an absolute `url` rather than theory's `path`, so `add` resolves
       them by its second branch. */
    for (const topic of topics || []) {
        for (const question of topic.questions || []) {
            (question.referenceLinks || []).forEach((link, i) => {
                add(link, `${topic.id} › ${question.id} referenceLinks[${i}]`);
            });
        }
    }

    return links;
}

/* --------------------------------------------------------------------------
   Fetch
   -------------------------------------------------------------------------- */

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

/** True when two URLs address the same page, ignoring the `hl` locale param. */
function sameDocument(from, to) {
    try {
        const a = new URL(from);
        const b = new URL(to, from);
        return a.origin === b.origin && a.pathname.replace(/\/$/, '') === b.pathname.replace(/\/$/, '');
    } catch {
        return false;
    }
}

/**
 * A HEAD that does not follow redirects, so a 301 is visible rather than
 * silently resolved. Some doc hosts reject HEAD; those fall back to a ranged
 * GET, which still avoids pulling the whole page.
 */
async function probe(url) {
    const attempt = async (method) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
            return await fetch(url, {
                method,
                redirect: 'manual',
                signal: controller.signal,
                headers: method === 'GET' ? { Range: 'bytes=0-2047' } : {}
            });
        } finally {
            clearTimeout(timer);
        }
    };

    let response;
    try {
        response = await attempt('HEAD');
        if (response.status === 405 || response.status === 501) {
            response = await attempt('GET');
        }
    } catch (error) {
        // No answer at all. That is not evidence about the link: a dead domain
        // and a blocked network look identical from here, and one of the two is
        // routine — socket.io resolves to an ISP filter on some connections.
        // Reported separately so a captive network cannot turn every run red.
        return { ok: false, unreachable: true, status: 0, note: `no response: ${error.message}` };
    }

    const { status } = response;

    if (status >= 300 && status < 400) {
        const location = response.headers.get('location');
        if (!location) return { ok: false, status, note: 'redirects with no Location header' };

        // developer.android.com bounces every request to a locale-qualified URL
        // (?hl=ko, ?hl=it) based on where the request came from. That is not a
        // relocation, and following it would pin readers to whichever language
        // the checker happened to be geolocated into. Only a change of path is
        // a real move.
        if (sameDocument(url, location)) return { ok: true, status };

        return {
            ok: false,
            status,
            note: `moved to ${location} — store the destination instead`
        };
    }
    if (status >= 400) {
        return { ok: false, status, note: `HTTP ${status}` };
    }
    return { ok: true, status };
}

/* --------------------------------------------------------------------------
   Run
   -------------------------------------------------------------------------- */

function readCache() {
    if (ignoreCache || !fs.existsSync(CACHE_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch {
        return {};
    }
}

async function main() {
    const corpus = loadCorpus();
    const links = collectLinks(corpus);

    if (!links.size) {
        console.log('No documentation links in the corpus yet — nothing to check.');
        return;
    }

    const cache = readCache();
    const targets = [...links.keys()].filter((url) => !cache[url]);

    if (!asJson) {
        console.log(`${links.size} unique link(s); ${targets.length} to check, ${links.size - targets.length} cached.\n`);
    }

    const failures = [];
    const unreachable = [];
    let index = 0;

    async function worker() {
        while (index < targets.length) {
            const url = targets[index++];
            const result = await probe(url);

            if (result.ok) {
                cache[url] = { status: result.status, checked: new Date().toISOString() };
                if (!asJson) process.stdout.write('.');
            } else if (result.unreachable) {
                // Deliberately not cached: nothing was learned, so the next run
                // on a working connection should try again.
                unreachable.push({ url, ...result, where: links.get(url) });
                if (!asJson) process.stdout.write('?');
            } else {
                failures.push({ url, ...result, where: links.get(url) });
                if (!asJson) process.stdout.write('F');
            }
            await sleep(DELAY_MS);
        }
    }

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

    if (asJson) {
        console.log(JSON.stringify({ checked: targets.length, failures, unreachable }, null, 2));
    } else {
        console.log('\n');
        if (failures.length) {
            console.error(`${failures.length} link(s) need attention:\n`);
            for (const failure of failures) {
                console.error(`  ✗ ${failure.url}`);
                console.error(`    ${failure.note}`);
                failure.where.forEach((w) => console.error(`    used by ${w}`));
                console.error('');
            }
        }

        if (unreachable.length) {
            console.log(`${unreachable.length} link(s) could not be checked from this network:\n`);
            for (const entry of unreachable) {
                console.log(`  ? ${entry.url}`);
                console.log(`    ${entry.note}`);
                entry.where.forEach((w) => console.log(`    used by ${w}`));
                console.log('');
            }
            console.log('  These are unproven, not broken. Re-run on another connection before editing them.\n');
        }

        if (!failures.length) {
            console.log('✓ every documentation link that answered resolves without redirecting');
        }
    }

    process.exit(failures.length ? 1 : 0);
}

main();
