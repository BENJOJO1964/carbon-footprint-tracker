const http = require('http');
const url = require('url');

const PORT = 3002;

// 創建HTTP服務器
const server = http.createServer((req, res) => {
  // 設置CORS標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // 處理OPTIONS請求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // 健康檢查
  if (path === '/health' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'OK',
      service: 'carbon-tracker-api',
      timestamp: new Date().toISOString(),
      message: '碳足跡追蹤器API服務正常運行'
    }));
    return;
  }

  // 測試API
  if (path === '/api/test' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: 'API連接成功！',
      data: {
        service: '碳足跡追蹤器',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    }));
    return;
  }

  // 註冊API
  if (path === '/api/auth/register' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: '註冊成功',
          data: {
            user: {
              id: 'test_user_123',
              name: data.name || '測試用戶',
              email: data.email || 'test@example.com',
              emailVerified: false
            },
            token: 'test_jwt_token_123'
          }
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: '請求格式錯誤'
        }));
      }
    });
    return;
  }

  // 登入API
  if (path === '/api/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.email === 'test@example.com' && data.password === 'password123') {
          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            message: '登入成功',
            data: {
              user: {
                id: 'test_user_123',
                name: '測試用戶',
                email: data.email,
                emailVerified: true
              },
              token: 'test_jwt_token_123'
            }
          }));
        } else {
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            error: '電子郵件或密碼錯誤'
          }));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: '請求格式錯誤'
        }));
      }
    });
    return;
  }

  // 移動記錄API
  if (path === '/api/movement' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: '移動記錄創建成功',
          data: {
            id: 'movement_' + Date.now(),
            type: data.type || 'driving',
            distance: data.distance || 5.2,
            duration: data.duration || 30,
            carbonFootprint: (data.distance || 5.2) * 0.192,
            timestamp: new Date().toISOString()
          }
        }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: '請求格式錯誤'
        }));
      }
    });
    return;
  }

  // 碳足跡統計API
  if (path === '/api/carbon/stats' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      data: {
        total: 12.5,
        breakdown: {
          transportation: 6.2,
          shopping: 3.8,
          food: 1.5,
          energy: 0.8,
          other: 0.2
        },
        dailyGoal: 20.0,
        goalProgress: 62.5,
        isGoalAchieved: true
      }
    }));
    return;
  }

  // 根路徑處理
  if (path === '/' && method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      message: '歡迎使用碳足跡追蹤器API',
      service: 'carbon-tracker-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: [
        'GET /health - 健康檢查',
        'GET /api/test - 測試連接',
        'POST /api/auth/register - 註冊用戶',
        'POST /api/auth/login - 用戶登入',
        'POST /api/movement - 創建移動記錄',
        'GET /api/carbon/stats - 獲取碳足跡統計'
      ]
    }));
    return;
  }

  // 404處理
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    error: '端點不存在',
    path: path,
    method: method
  }));
});

// 啟動服務器
server.listen(PORT, '0.0.0.0', () => {
  console.log('🌱 碳足跡追蹤器測試服務器啟動成功！');
  console.log(`📱 本機訪問: http://localhost:${PORT}`);
  console.log(`📱 手機訪問: http://172.20.10.6:${PORT}`);
  console.log(`🔍 健康檢查: http://172.20.10.6:${PORT}/health`);
  console.log(`🧪 測試API: http://172.20.10.6:${PORT}/api/test`);
  console.log('');
  console.log('📋 可用的API端點:');
  console.log('   GET  /health - 健康檢查');
  console.log('   GET  /api/test - 測試連接');
  console.log('   POST /api/auth/register - 註冊用戶');
  console.log('   POST /api/auth/login - 用戶登入');
  console.log('   POST /api/movement - 創建移動記錄');
  console.log('   GET  /api/carbon/stats - 獲取碳足跡統計');
  console.log('');
  console.log('🔧 開始測試您的碳足跡追蹤器吧！');
  console.log('按 Ctrl+C 停止服務器');
});

// 優雅關閉
process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉服務器...');
  server.close(() => {
    console.log('✅ 服務器已關閉');
    process.exit(0);
  });
});
