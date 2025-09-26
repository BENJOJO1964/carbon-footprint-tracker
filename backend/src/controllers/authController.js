const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

// 生成 JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// 註冊
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 檢查電子郵件是否已存在
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '此電子郵件地址已被使用'
      });
    }

    // 創建用戶
    const user = new User({
      name,
      email,
      password
    });

    // 生成電子郵件驗證 Token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;

    await user.save();

    // 生成 JWT Token
    const token = generateToken(user._id);

    // 發送驗證郵件
    try {
      await emailService.sendVerificationEmail(user.email, emailVerificationToken);
    } catch (emailError) {
      logger.error('發送驗證郵件失敗:', emailError);
      // 不影響註冊流程，只記錄錯誤
    }

    logger.info(`新用戶註冊: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          preferences: user.preferences
        },
        token
      },
      message: '註冊成功'
    });

  } catch (error) {
    logger.error('註冊錯誤:', error);
    res.status(500).json({
      success: false,
      error: '註冊時發生錯誤'
    });
  }
};

// 登入
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用戶（包含密碼）
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '電子郵件或密碼錯誤'
      });
    }

    // 檢查用戶是否啟用
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: '帳號已被停用'
      });
    }

    // 驗證密碼
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: '電子郵件或密碼錯誤'
      });
    }

    // 更新最後登入時間
    await user.updateLastLogin();

    // 生成 JWT Token
    const token = generateToken(user._id);

    logger.info(`用戶登入: ${email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          preferences: user.preferences,
          lastLogin: user.lastLogin
        },
        token
      },
      message: '登入成功'
    });

  } catch (error) {
    logger.error('登入錯誤:', error);
    res.status(500).json({
      success: false,
      error: '登入時發生錯誤'
    });
  }
};

// 登出
const logout = async (req, res) => {
  try {
    // 在實際應用中，可以將 Token 加入黑名單
    // 這裡只是簡單返回成功訊息
    logger.info(`用戶登出: ${req.user.email}`);
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    logger.error('登出錯誤:', error);
    res.status(500).json({
      success: false,
      error: '登出時發生錯誤'
    });
  }
};

// 驗證 Token
const validateToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用戶不存在'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    logger.error('Token 驗證錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'Token 驗證失敗'
    });
  }
};

// 請求重設密碼
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      // 為了安全，即使用戶不存在也返回成功訊息
      return res.json({
        success: true,
        message: '如果該電子郵件地址存在，重設密碼的連結已發送'
      });
    }

    // 生成重設密碼 Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10分鐘後過期

    await user.save();

    // 發送重設密碼郵件
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      logger.error('發送重設密碼郵件失敗:', emailError);
      return res.status(500).json({
        success: false,
        error: '發送重設密碼郵件失敗'
      });
    }

    logger.info(`密碼重設請求: ${email}`);

    res.json({
      success: true,
      message: '重設密碼的連結已發送到您的電子郵件'
    });

  } catch (error) {
    logger.error('請求重設密碼錯誤:', error);
    res.status(500).json({
      success: false,
      error: '請求重設密碼時發生錯誤'
    });
  }
};

// 重設密碼
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 查找用戶
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '重設密碼的連結無效或已過期'
      });
    }

    // 更新密碼
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    logger.info(`密碼重設成功: ${user.email}`);

    res.json({
      success: true,
      message: '密碼重設成功'
    });

  } catch (error) {
    logger.error('重設密碼錯誤:', error);
    res.status(500).json({
      success: false,
      error: '重設密碼時發生錯誤'
    });
  }
};

// 驗證電子郵件
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '驗證連結無效'
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;

    await user.save();

    logger.info(`電子郵件驗證成功: ${user.email}`);

    res.json({
      success: true,
      message: '電子郵件驗證成功'
    });

  } catch (error) {
    logger.error('電子郵件驗證錯誤:', error);
    res.status(500).json({
      success: false,
      error: '電子郵件驗證時發生錯誤'
    });
  }
};

// 重新發送驗證郵件
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用戶不存在'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: '電子郵件已經驗證'
      });
    }

    // 生成新的驗證 Token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = emailVerificationToken;

    await user.save();

    // 發送驗證郵件
    try {
      await emailService.sendVerificationEmail(user.email, emailVerificationToken);
    } catch (emailError) {
      logger.error('發送驗證郵件失敗:', emailError);
      return res.status(500).json({
        success: false,
        error: '發送驗證郵件失敗'
      });
    }

    res.json({
      success: true,
      message: '驗證郵件已重新發送'
    });

  } catch (error) {
    logger.error('重新發送驗證郵件錯誤:', error);
    res.status(500).json({
      success: false,
      error: '重新發送驗證郵件時發生錯誤'
    });
  }
};

// 刷新 Token
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未提供 Token'
      });
    }

    // 驗證 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用戶不存在'
      });
    }

    // 生成新的 Token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    logger.error('刷新 Token 錯誤:', error);
    res.status(401).json({
      success: false,
      error: 'Token 無效'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  validateToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  refreshToken
};
