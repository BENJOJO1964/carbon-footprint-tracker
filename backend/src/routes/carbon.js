const express = require('express');
const { query } = require('express-validator');
const carbonController = require('../controllers/carbonController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// 所有路由都需要認證
router.use(authMiddleware);

// 獲取碳足跡記錄
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('頁碼必須是大於0的整數'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每頁數量必須是1-100之間的整數'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], carbonController.getCarbonFootprints);

// 獲取指定日期的碳足跡
router.get('/date/:date', carbonController.getCarbonFootprintByDate);

// 計算或更新指定日期的碳足跡
router.post('/calculate/:date', carbonController.calculateCarbonFootprint);

// 獲取碳足跡統計
router.get('/stats/overview', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], carbonController.getCarbonStats);

// 獲取碳足跡趨勢
router.get('/stats/trends', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('分組方式必須是 day、week 或 month'),
  validateRequest
], carbonController.getCarbonTrends);

// 獲取排行榜
router.get('/leaderboard', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('排行榜數量必須在1-100之間'),
  validateRequest
], carbonController.getLeaderboard);

// 設定每日目標
router.put('/daily-goal', [
  body('goal')
    .isFloat({ min: 0 })
    .withMessage('每日目標必須大於等於0'),
  validateRequest
], carbonController.setDailyGoal);

// 獲取環保建議
router.get('/recommendations', carbonController.getRecommendations);

module.exports = router;
