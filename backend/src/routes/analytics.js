const express = require('express');
const { query } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// 所有路由都需要認證
router.use(authMiddleware);

// 獲取綜合分析數據
router.get('/dashboard', [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('時間段必須是 day、week、month 或 year'),
  validateRequest
], analyticsController.getDashboardData);

// 獲取詳細分析報告
router.get('/report', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  query('type')
    .optional()
    .isIn(['transportation', 'shopping', 'food', 'energy', 'overall'])
    .withMessage('分析類型無效'),
  validateRequest
], analyticsController.getAnalyticsReport);

// 獲取行為模式分析
router.get('/behavior-patterns', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], analyticsController.getBehaviorPatterns);

// 獲取環保成就
router.get('/achievements', analyticsController.getAchievements);

// 獲取個人化建議
router.get('/recommendations', [
  query('category')
    .optional()
    .isIn(['transportation', 'shopping', 'food', 'energy', 'lifestyle'])
    .withMessage('建議類別無效'),
  validateRequest
], analyticsController.getPersonalizedRecommendations);

// 獲取比較分析
router.get('/comparison', [
  query('period')
    .isIn(['week', 'month', 'year'])
    .withMessage('比較期間必須是 week、month 或 year'),
  query('compareWith')
    .optional()
    .isIn(['previous', 'average', 'goal'])
    .withMessage('比較對象必須是 previous、average 或 goal'),
  validateRequest
], analyticsController.getComparisonAnalysis);

// 獲取預測分析
router.get('/forecast', [
  query('period')
    .isIn(['week', 'month', 'quarter'])
    .withMessage('預測期間必須是 week、month 或 quarter'),
  validateRequest
], analyticsController.getForecastAnalysis);

// 獲取地理分布分析
router.get('/geographic', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], analyticsController.getGeographicAnalysis);

// 獲取時間分布分析
router.get('/temporal', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  query('granularity')
    .optional()
    .isIn(['hour', 'day', 'week', 'month'])
    .withMessage('時間粒度必須是 hour、day、week 或 month'),
  validateRequest
], analyticsController.getTemporalAnalysis);

module.exports = router;
