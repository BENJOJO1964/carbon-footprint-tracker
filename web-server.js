const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3003;

// MIME類型映射
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 設置CORS標頭
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 處理OPTIONS請求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);
    
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>404 Not Found</title></head>
                        <body>
                            <h1>404 - 頁面不存在</h1>
                            <p>請訪問 <a href="/">首頁</a></p>
                        </body>
                    </html>
                `);
            } else {
                res.writeHead(500);
                res.end('服務器錯誤: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('🌐 碳足跡追蹤器網頁服務器啟動成功！');
    console.log(`📱 本機訪問: http://localhost:${PORT}`);
    console.log(`📱 手機訪問: http://172.20.10.6:${PORT}`);
    console.log('');
    console.log('🎯 現在您可以在手機瀏覽器中打開：');
    console.log(`   http://172.20.10.6:${PORT}`);
    console.log('');
    console.log('📱 這是一個完整的碳足跡追蹤應用界面！');
    console.log('按 Ctrl+C 停止服務器');
});

// 優雅關閉
process.on('SIGINT', () => {
    console.log('\n🛑 正在關閉網頁服務器...');
    server.close(() => {
        console.log('✅ 網頁服務器已關閉');
        process.exit(0);
    });
});
