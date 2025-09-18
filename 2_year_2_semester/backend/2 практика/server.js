const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    if (filePath === './styles.css') filePath = './styles.css';

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css'
    };
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, 'utf-8', (err, content) => { // Указываем кодировку utf-8
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Страница не найдена</h1>', 'utf-8'); // Указываем правильную кодировку
        } else {
            res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' }); // Добавляем charset=utf-8
            res.end(content, 'utf-8');
        }
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});
