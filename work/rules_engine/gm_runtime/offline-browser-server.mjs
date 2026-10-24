// TEST ONLY: serve the existing ESM tree on loopback, with no proxy/API routes.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
createServer(async (req, res) => {
  try {
    if (req.method !== 'GET') throw Error('GET only');
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      .replace(/^\/901-rules-runtime\//, '/');
    const file = resolve(root, '.' + path);
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw Error('Outside fixture');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': ({ '.mjs': 'text/javascript', '.js': 'text/javascript',
      '.json': 'application/json', '.html': 'text/html; charset=utf-8' })[extname(file)] || 'text/plain',
      'Cache-Control': 'no-store' }); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(9019, '127.0.0.1', () => console.log('TEST ONLY http://127.0.0.1:9019/work/rules_engine/gm_runtime/offline-browser.html'));
