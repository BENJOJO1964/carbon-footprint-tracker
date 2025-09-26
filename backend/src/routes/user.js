const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// 所有路由都需要認證
router.use(authMiddleware);

// 獲取用戶個人資料
router.get('/profile', userController.getProfile);

// 更新用戶個人資料
router.put('/profile', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('姓名長度必須在2-50個字符之間'),
  body('preferences.units')
    .optional()
    .isIn(['metric', 'imperial'])
    .withMessage('單位系統必須是 metric 或 imperial'),
  body('preferences.language')
    .optional()
    .isIn(['zh-TW', 'en-US'])
    .withMessage('語言必須是 zh-TW 或 en-US'),
  validateRequest
], userController.updateProfile);

// 上傳頭像
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

// 修改密碼
router.put('/change-password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('請提供當前密碼'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密碼至少需要6個字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('新密碼必須包含至少一個小寫字母、一個大寫字母和一個數字'),
  validateRequest
], userController.changePassword);

// 刪除帳號
router.delete('/account', userController.deleteAccount);

// 獲取用戶統計
router.get('/stats', userController.getUserStats);

// 導出用戶數據
router.get('/export', userController.exportUserData);

module.exports = router;
