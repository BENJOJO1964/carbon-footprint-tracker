// 網路配置檔案
const os = require('os');

// 獲取本機IP地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳過內部地址和非IPv4地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return '127.0.0.1';
}

const config = {
  // 本機IP地址
  LOCAL_IP: getLocalIP(),
  
  // 服務端口
  PORTS: {
    BACKEND: process.env.PORT || 3001,
    AI_SERVICE: process.env.AI_SERVICE_PORT || 5001,
    MONGODB: 27018,
    REDIS: 6380
  },
  
  // 服務URL
  URLS: {
    BACKEND: `http://${getLocalIP()}:${process.env.PORT || 3001}`,
    AI_SERVICE: `http://${getLocalIP()}:${process.env.AI_SERVICE_PORT || 5001}`,
    FRONTEND: process.env.FRONTEND_URL || `http://${getLocalIP()}:8081`
  },
  
  // CORS設定
  CORS_ORIGINS: [
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    `http://${getLocalIP()}:8081`,
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    `http://${getLocalIP()}:3001`
  ],
  
  // 網路設定
  NETWORK: {
    HOST: '0.0.0.0',  // 綁定到所有網路介面
    TIMEOUT: 30000,   // 30秒超時
    KEEP_ALIVE: true
  }
};

// 輸出配置信息
console.log('🌐 網路配置:');
console.log(`   本機IP: ${config.LOCAL_IP}`);
console.log(`   後端服務: ${config.URLS.BACKEND}`);
console.log(`   AI服務: ${config.URLS.AI_SERVICE}`);
console.log(`   前端應用: ${config.URLS.FRONTEND}`);

module.exports = config;
