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

function collectLinks({ theoryModules }) {
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

    return links;
}

/* --------------------------------------------------------------------------
   Fetch
   -------------------------------------------------------------------------- */

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

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
        return { ok: false, status: 0, note: `request failed: ${error.message}` };
    }

    const { status } = response;

    if (status >= 300 && status < 400) {
        const location = response.headers.get('location') || '(no Location header)';
        return {
            ok: false,
            status,
            note: `redirects to ${location} — store the destination instead`
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
    let index = 0;

    async function worker() {
        while (index < targets.length) {
            const url = targets[index++];
            const result = await probe(url);

            if (result.ok) {
                cache[url] = { status: result.status, checked: new Date().toISOString() };
                if (!asJson) process.stdout.write('.');
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
        console.log(JSON.stringify({ checked: targets.length, failures }, null, 2));
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
        } else {
            console.log('✓ every documentation link resolves without redirecting');
        }
    }

    process.exit(failures.length ? 1 : 0);
}

main();
