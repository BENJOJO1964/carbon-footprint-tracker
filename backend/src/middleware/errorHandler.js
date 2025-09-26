const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 記錄錯誤
  logger.error('錯誤處理器:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose 錯誤處理
  if (err.name === 'CastError') {
    const message = '資源不存在';
    error = { message, statusCode: 404 };
  }

  // Mongoose 重複鍵錯誤
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} 已存在`;
    error = { message, statusCode: 400 };
  }

  // Mongoose 驗證錯誤
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT 錯誤
  if (err.name === 'JsonWebTokenError') {
    const message = '無效的 Token';
    error = { message, statusCode: 401 };
  }

  // JWT 過期錯誤
  if (err.name === 'TokenExpiredError') {
    const message = 'Token 已過期';
    error = { message, statusCode: 401 };
  }

  // 檔案上傳錯誤
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = '檔案大小超過限制';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = '不支援的檔案類型';
    error = { message, statusCode: 400 };
  }

  // 預設錯誤
  const statusCode = error.statusCode || 500;
  const message = error.message || '伺服器內部錯誤';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
