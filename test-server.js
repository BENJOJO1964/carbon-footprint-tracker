const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 啟用CORS
app.use(cors());
app.use(express.json());

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'carbon-tracker-api',
    timestamp: new Date().toISOString(),
    message: '碳足跡追蹤器API服務正常運行'
  });
});

// 測試API端點
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API連接成功！',
    data: {
      service: '碳足跡追蹤器',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// 模擬註冊API
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: '請提供完整信息'
    });
  }
  
  res.json({
    success: true,
    message: '註冊成功',
    data: {
      user: {
        id: 'test_user_123',
        name: name,
        email: email,
        emailVerified: false
      },
      token: 'test_jwt_token_123'
    }
  });
});

// 模擬登入API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@example.com' && password === 'password123') {
    res.json({
      success: true,
      message: '登入成功',
      data: {
        user: {
          id: 'test_user_123',
          name: '測試用戶',
          email: email,
          emailVerified: true
        },
        token: 'test_jwt_token_123'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: '電子郵件或密碼錯誤'
    });
  }
});

// 模擬移動記錄API
app.post('/api/movement', (req, res) => {
  const { type, distance, duration } = req.body;
  
  res.json({
    success: true,
    message: '移動記錄創建成功',
    data: {
      id: 'movement_' + Date.now(),
      type: type || 'driving',
      distance: distance || 5.2,
      duration: duration || 30,
      carbonFootprint: (distance || 5.2) * 0.192, // 簡單計算
      timestamp: new Date().toISOString()
    }
  });
});

// 模擬發票API
app.post('/api/invoice', (req, res) => {
  const { storeName, totalAmount, items } = req.body;
  
  res.json({
    success: true,
    message: '發票記錄創建成功',
    data: {
      id: 'invoice_' + Date.now(),
      storeName: storeName || '測試商店',
      totalAmount: totalAmount || 100,
      items: items || [],
      carbonFootprint: (totalAmount || 100) * 0.01, // 簡單計算
      timestamp: new Date().toISOString()
    }
  });
});

// 模擬碳足跡統計API
app.get('/api/carbon/stats', (req, res) => {
  res.json({
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
  });
});

// 啟動服務器
app.listen(PORT, '0.0.0.0', () => {
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
  console.log('   POST /api/invoice - 創建發票記錄');
  console.log('   GET  /api/carbon/stats - 獲取碳足跡統計');
  console.log('');
  console.log('🔧 開始測試您的碳足跡追蹤器吧！');
});
