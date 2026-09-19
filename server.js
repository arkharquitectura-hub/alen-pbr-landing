const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
    const cleanUrl = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found\n');
        return;
    }

    const stat = fs.statSync(filePath);
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Support Range header for MP4 video streaming
    if (extname === '.mp4' && req.headers.range) {
        const range = req.headers.range;
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType
        });
        file.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': stat.size,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes'
        });
        fs.createReadStream(filePath).pipe(res);
    }
});

const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
    console.log(`Servidor local activo en: http://localhost:${PORT}/`);
});
