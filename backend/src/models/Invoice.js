const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, '商品名稱不能超過100個字符']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0.01, '數量必須大於0']
  },
  price: {
    type: Number,
    required: true,
    min: [0, '價格不能為負數']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'food', 'clothing', 'electronics', 'home', 'health', 
      'beauty', 'sports', 'books', 'toys', 'automotive', 
      'garden', 'office', 'other'
    ]
  },
  carbonFootprint: {
    type: Number,
    required: true,
    min: [0, '碳足跡不能為負數']
  },
  brand: {
    type: String,
    default: null
  },
  barcode: {
    type: String,
    default: null
  }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['electronic', 'paper', 'scanned'],
    required: true
  },
  storeName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, '商店名稱不能超過100個字符']
  },
  storeAddress: {
    type: String,
    default: null
  },
  storeCategory: {
    type: String,
    enum: [
      'supermarket', 'convenience', 'department', 'restaurant', 
      'pharmacy', 'electronics', 'clothing', 'home', 'other'
    ],
    default: 'other'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, '總金額不能為負數']
  },
  items: [invoiceItemSchema],
  carbonFootprint: {
    type: Number,
    required: true,
    min: [0, '碳足跡不能為負數']
  },
  imageUrl: {
    type: String,
    default: null
  },
  ocrData: {
    rawText: String,
    confidence: Number,
    processingTime: Number,
    extractedFields: {
      storeName: String,
      totalAmount: Number,
      date: Date,
      items: [String]
    }
  },
  invoiceNumber: {
    type: String,
    default: null
  },
  invoiceDate: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile', 'other'],
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['ocr', 'manual', 'api', 'electronic'],
    default: 'manual'
  },
  notes: {
    type: String,
    maxlength: [500, '備註不能超過500個字符']
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// 索引
invoiceSchema.index({ userId: 1, timestamp: -1 });
invoiceSchema.index({ storeName: 1 });
invoiceSchema.index({ type: 1 });
invoiceSchema.index({ timestamp: -1 });
invoiceSchema.index({ 'items.category': 1 });
invoiceSchema.index({ totalAmount: 1 });

// 虛擬欄位：計算平均商品價格
invoiceSchema.virtual('averageItemPrice').get(function() {
  if (this.items.length === 0) return 0;
  const totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return (totalPrice / this.items.length).toFixed(2);
});

// 虛擬欄位：計算商品數量
invoiceSchema.virtual('totalItemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// 虛擬欄位：計算碳排放強度 (kg CO2/元)
invoiceSchema.virtual('emissionIntensity').get(function() {
  if (this.totalAmount === 0) return 0;
  return (this.carbonFootprint / this.totalAmount).toFixed(4);
});

// 中介軟體：自動計算總碳足跡
invoiceSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.carbonFootprint = this.items.reduce((sum, item) => sum + item.carbonFootprint, 0);
  }
  next();
});

// 靜態方法：獲取用戶的購物統計
invoiceSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const matchStage = {
    userId: mongoose.Types.ObjectId(userId),
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  };

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$totalAmount' },
        totalCarbonFootprint: { $sum: '$carbonFootprint' },
        invoiceCount: { $sum: 1 },
        averageAmount: { $avg: '$totalAmount' },
        storeBreakdown: {
          $push: {
            storeName: '$storeName',
            amount: '$totalAmount',
            carbonFootprint: '$carbonFootprint'
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalAmount: 0,
    totalCarbonFootprint: 0,
    invoiceCount: 0,
    averageAmount: 0,
    storeBreakdown: []
  };
};

// 靜態方法：獲取商品類別分布
invoiceSchema.statics.getCategoryDistribution = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.category',
        totalAmount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalCarbonFootprint: { $sum: '$items.carbonFootprint' },
        itemCount: { $sum: '$items.quantity' },
        averagePrice: { $avg: '$items.price' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

// 靜態方法：獲取商店統計
invoiceSchema.statics.getStoreStats = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$storeName',
        visitCount: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalCarbonFootprint: { $sum: '$carbonFootprint' },
        averageAmount: { $avg: '$totalAmount' },
        lastVisit: { $max: '$timestamp' }
      }
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 20 }
  ]);
};

module.exports = mongoose.model('Invoice', invoiceSchema);
