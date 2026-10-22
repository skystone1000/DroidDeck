/* A static file server that refuses to let the browser cache anything.

   Verification during a refactor kept reading a stale copy of a file that had
   already been edited — python's http.server answers a conditional request with
   304 and the browser holds the old script. No-store on every response makes a
   reload mean a reload, which is the only thing this needs to be true.

   Development only. Deployment is still "copy the directory somewhere". */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.json': 'application/json'
};

http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(ROOT, url === '/' ? 'index.html' : url);

    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); res.end('not found'); return;
    }

    const type = TYPES[path.extname(file)] || 'application/octet-stream';
    const headers = { 'Content-Type': type, 'Cache-Control': 'no-store, no-cache, must-revalidate' };

    /* no-store is not enough on its own — at least one browser here answers a
       sub-resource from disk regardless, which during a refactor means
       verifying a file that was edited ten minutes ago. Stamping every local
       script and stylesheet with its own mtime changes the URL when the file
       changes, and a changed URL is the one thing no cache can ignore. */
    if (path.extname(file) === '.html') {
        const html = fs.readFileSync(file, 'utf8').replace(
            /(src|href)="((?:js|css|data)\/[^"?]+)"/g,
            (match, attr, rel) => {
                const target = path.join(ROOT, rel);
                if (!fs.existsSync(target)) return match;
                return `${attr}="${rel}?v=${fs.statSync(target).mtimeMs.toString(36)}"`;
            }
        );
        res.writeHead(200, headers);
        res.end(html);
        return;
    }

    res.writeHead(200, headers);
    fs.createReadStream(file).pipe(res);
}).listen(8123, () => console.log('http://localhost:8123'));
