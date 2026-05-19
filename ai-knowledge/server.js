// 本地数据服务器 - 支持将用户数据持久化到 user-data.json
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'user-data.json');

// 获取Content-Type
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };
    return types[ext] || 'text/plain';
}

// 读取数据文件
function readData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const content = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e) {
        console.error('读取数据失败:', e);
    }
    return {
        userKnowledge: {},
        userNotes: {},
        userTests: {},
        customSections: [],
        chapterStates: {},
        userProgress: {}
    };
}

// 保存数据文件
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error('保存数据失败:', e);
        return false;
    }
}

const server = http.createServer((req, res) => {
    // CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // API: 保存数据（合并模式）
    if (pathname === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { key, data } = JSON.parse(body);
                const allData = readData();
                // 合并数据：新数据和现有数据合并
                if (!allData[key]) {
                    allData[key] = {};
                }
                Object.assign(allData[key], data);
                if (saveData(allData)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: '保存失败' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: e.message }));
            }
        });
        return;
    }

    // API: 读取所有数据
    if (pathname === '/api/load' && req.method === 'GET') {
        const allData = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(allData));
        return;
    }

    // API: 读取指定key
    if (pathname === '/api/load/' && req.method === 'GET') {
        const key = url.searchParams.get('key');
        const allData = readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(allData[key] || null));
        return;
    }

    // 静态文件服务
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    // 安全检查：防止路径穿越
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 服务器已启动`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`📁 数据文件: ${DATA_FILE}`);
    console.log(`\n按 Ctrl+C 停止服务器\n`);
});
