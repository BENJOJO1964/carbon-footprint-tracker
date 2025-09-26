const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// 註冊
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名長度必須在2-50個字符之間'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('請提供有效的電子郵件地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密碼至少需要6個字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密碼必須包含至少一個小寫字母、一個大寫字母和一個數字'),
  validateRequest
], authController.register);

// 登入
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('請提供有效的電子郵件地址'),
  body('password')
    .notEmpty()
    .withMessage('密碼不能為空'),
  validateRequest
], authController.login);

// 登出
router.post('/logout', authMiddleware, authController.logout);

// 驗證 Token
router.get('/validate', authMiddleware, authController.validateToken);

// 重設密碼請求
router.post('/reset-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('請提供有效的電子郵件地址'),
  validateRequest
], authController.requestPasswordReset);

// 重設密碼
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('密碼至少需要6個字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密碼必須包含至少一個小寫字母、一個大寫字母和一個數字'),
  validateRequest
], authController.resetPassword);

// 驗證電子郵件
router.get('/verify-email/:token', authController.verifyEmail);

// 重新發送驗證郵件
router.post('/resend-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('請提供有效的電子郵件地址'),
  validateRequest
], authController.resendVerificationEmail);

// 刷新 Token
router.post('/refresh', authController.refreshToken);

module.exports = router;
