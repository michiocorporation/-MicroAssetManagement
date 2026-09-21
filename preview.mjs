import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8', '.woff2':'font/woff2' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep) || !['GET','HEAD'].includes(request.method)) { response.writeHead(403); response.end('Forbidden'); return; }
    const info = await stat(file);
    if (!info.isFile() || !mime[path.extname(file)]) { response.writeHead(404); response.end('Not found'); return; }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type':mime[path.extname(file)], 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Open http://127.0.0.1:${port}/ or select another PORT.` : error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`MAM preview: http://127.0.0.1:${port}/`));
