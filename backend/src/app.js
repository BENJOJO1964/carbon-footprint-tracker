const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./database/connection');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const networkConfig = require('./config/network');

// 導入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const movementRoutes = require('./routes/movement');
const invoiceRoutes = require('./routes/invoice');
const carbonRoutes = require('./routes/carbon');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

// 連接資料庫
connectDB();

// 安全中介軟體
app.use(helmet());

// CORS 設定
app.use(cors({
  origin: networkConfig.CORS_ORIGINS,
  credentials: true,
}));

// 壓縮回應
app.use(compression());

// 請求日誌
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 每 15 分鐘最多 100 個請求
  message: {
    error: '請求過於頻繁，請稍後再試'
  }
});
app.use('/api/', limiter);

// 解析 JSON 和 URL 編碼的請求體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康檢查端點
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/movement', movementRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '找不到請求的資源'
  });
});

// 錯誤處理中介軟體
app.use(errorHandler);

// 優雅關閉
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信號，開始優雅關閉...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信號，開始優雅關閉...');
  process.exit(0);
});

// 未處理的 Promise 拒絕
process.on('unhandledRejection', (err) => {
  logger.error('未處理的 Promise 拒絕:', err);
  process.exit(1);
});

// 未捕獲的異常
process.on('uncaughtException', (err) => {
  logger.error('未捕獲的異常:', err);
  process.exit(1);
});

app.listen(PORT, networkConfig.NETWORK.HOST, () => {
  logger.info(`🚀 伺服器運行在端口 ${PORT}`);
  logger.info(`🌐 本機訪問: http://localhost:${PORT}`);
  logger.info(`📱 手機訪問: http://${networkConfig.LOCAL_IP}:${PORT}`);
  logger.info(`🔧 環境: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 健康檢查: http://${networkConfig.LOCAL_IP}:${PORT}/health`);
});

module.exports = app;
