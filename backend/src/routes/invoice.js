const express = require('express');
const { body, query } = require('express-validator');
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// 所有路由都需要認證
router.use(authMiddleware);

// 獲取發票記錄
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
    .isIn(['electronic', 'paper', 'scanned'])
    .withMessage('發票類型無效'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], invoiceController.getInvoices);

// 創建發票記錄
router.post('/', [
  body('type')
    .isIn(['electronic', 'paper', 'scanned'])
    .withMessage('發票類型無效'),
  body('storeName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('商店名稱長度必須在1-100個字符之間'),
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('總金額必須大於等於0'),
  body('items')
    .optional()
    .isArray()
    .withMessage('商品項目必須是陣列'),
  body('items.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('商品名稱長度必須在1-100個字符之間'),
  body('items.*.quantity')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('商品數量必須大於0'),
  body('items.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('商品價格必須大於等於0'),
  body('items.*.category')
    .optional()
    .isIn(['food', 'clothing', 'electronics', 'home', 'health', 'beauty', 'sports', 'books', 'toys', 'automotive', 'garden', 'office', 'other'])
    .withMessage('商品類別無效'),
  validateRequest
], invoiceController.createInvoice);

// 上傳發票圖片並進行 OCR 識別
router.post('/upload', upload.single('invoice'), invoiceController.uploadInvoice);

// 獲取單個發票記錄
router.get('/:id', invoiceController.getInvoice);

// 更新發票記錄
router.put('/:id', [
  body('storeName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('商店名稱長度必須在1-100個字符之間'),
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('總金額必須大於等於0'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('備註不能超過500個字符'),
  validateRequest
], invoiceController.updateInvoice);

// 刪除發票記錄
router.delete('/:id', invoiceController.deleteInvoice);

// 獲取發票統計
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
], invoiceController.getInvoiceStats);

// 獲取商品類別分布
router.get('/stats/category-distribution', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], invoiceController.getCategoryDistribution);

// 獲取商店統計
router.get('/stats/store-stats', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('開始日期格式無效'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('結束日期格式無效'),
  validateRequest
], invoiceController.getStoreStats);

// 批量創建發票記錄
router.post('/batch', [
  body('invoices')
    .isArray({ min: 1, max: 50 })
    .withMessage('發票記錄數量必須在1-50之間'),
  body('invoices.*.type')
    .isIn(['electronic', 'paper', 'scanned'])
    .withMessage('發票類型無效'),
  body('invoices.*.storeName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('商店名稱長度必須在1-100個字符之間'),
  body('invoices.*.totalAmount')
    .isFloat({ min: 0 })
    .withMessage('總金額必須大於等於0'),
  validateRequest
], invoiceController.createBatchInvoices);

module.exports = router;
