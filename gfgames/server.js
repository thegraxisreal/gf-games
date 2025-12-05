const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const rootDir = __dirname;
const port = process.env.PORT || 3000;

const mimeTypes = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'text/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=UTF-8'
};

const server = http.createServer((req, res) => {
    let pathname;

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        pathname = decodeURIComponent(url.pathname);
    } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Bad Request');
        return;
    }

    if (pathname === '/') {
        pathname = '/index.html';
    }

    const requestedPath = path.normalize(path.join(rootDir, pathname));

    // Prevent path traversal outside of the project directory.
    if (!requestedPath.startsWith(rootDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Forbidden');
        return;
    }

    fs.stat(requestedPath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end('Not Found');
            return;
        }

        const ext = path.extname(requestedPath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });

        const stream = fs.createReadStream(requestedPath);
        stream.on('error', () => {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end('Internal Server Error');
        });
        stream.pipe(res);
    });
});

server.listen(port, () => {
    console.log(`GF Games server running at http://localhost:${port}`);
});
