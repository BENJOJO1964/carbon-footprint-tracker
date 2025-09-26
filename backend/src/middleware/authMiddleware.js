const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // 從 Authorization 標頭獲取 Token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 如果沒有 Token
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未提供認證 Token'
      });
    }

    try {
      // 驗證 Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // 查找用戶
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Token 無效，用戶不存在'
        });
      }

      // 檢查用戶是否啟用
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: '帳號已被停用'
        });
      }

      // 將用戶信息添加到請求對象
      req.user = user;
      next();

    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token 已過期'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Token 無效'
        });
      } else {
        throw jwtError;
      }
    }

  } catch (error) {
    logger.error('認證中介軟體錯誤:', error);
    res.status(500).json({
      success: false,
      error: '認證時發生錯誤'
    });
  }
};

// 可選認證中介軟體（不強制要求認證）
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (jwtError) {
        // 忽略 Token 錯誤，繼續處理請求
        logger.warn('可選認證 Token 無效:', jwtError.message);
      }
    }

    next();
  } catch (error) {
    logger.error('可選認證中介軟體錯誤:', error);
    next(); // 即使出錯也繼續處理請求
  }
};

// 檢查用戶角色（如果需要）
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '需要認證'
      });
    }

    // 這裡可以根據需要實現角色檢查邏輯
    // 目前所有用戶都是普通用戶
    next();
  };
};

// 檢查用戶是否驗證了電子郵件
const requireEmailVerification = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: '請先驗證您的電子郵件地址'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  requireEmailVerification
};
