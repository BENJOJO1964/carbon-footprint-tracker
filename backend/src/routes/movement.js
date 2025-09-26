const express = require('express');
const { body, query } = require('express-validator');
const movementController = require('../controllers/movementController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// 所有路由都需要認證
router.use(authMiddleware);

// 獲取移動記錄
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('頁碼必須是大於0的整數'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每頁數量必須是1-100之間的整數'),
  query('type')
    .optional()
    .isIn(['walking', 'cycling', 'driving', 'public_transport', 'flying', 'unknown'])
    .withMessage('移動類型無效'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], movementController.getMovements);

// 創建移動記錄
router.post('/', [
  body('type')
    .isIn(['walking', 'cycling', 'driving', 'public_transport', 'flying', 'unknown'])
    .withMessage('移動類型無效'),
  body('startLocation.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('起始位置緯度無效'),
  body('startLocation.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('起始位置經度無效'),
  body('endLocation.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('結束位置緯度無效'),
  body('endLocation.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('結束位置經度無效'),
  body('distance')
    .isFloat({ min: 0 })
    .withMessage('距離必須大於等於0'),
  body('duration')
    .isFloat({ min: 0 })
    .withMessage('持續時間必須大於等於0'),
  validateRequest
], movementController.createMovement);

// 獲取單個移動記錄
router.get('/:id', movementController.getMovement);

// 更新移動記錄
router.put('/:id', [
  body('type')
    .optional()
    .isIn(['walking', 'cycling', 'driving', 'public_transport', 'flying', 'unknown'])
    .withMessage('移動類型無效'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('備註不能超過500個字符'),
  validateRequest
], movementController.updateMovement);

// 刪除移動記錄
router.delete('/:id', movementController.deleteMovement);

// 獲取移動統計
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
], movementController.getMovementStats);

// 獲取移動類型分布
router.get('/stats/type-distribution', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], movementController.getTypeDistribution);

// 批量創建移動記錄
router.post('/batch', [
  body('movements')
    .isArray({ min: 1, max: 100 })
    .withMessage('移動記錄數量必須在1-100之間'),
  body('movements.*.type')
    .isIn(['walking', 'cycling', 'driving', 'public_transport', 'flying', 'unknown'])
    .withMessage('移動類型無效'),
  validateRequest
], movementController.createBatchMovements);

module.exports = router;
