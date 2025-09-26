const mongoose = require('mongoose');

const carbonActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['transportation', 'shopping', 'food', 'energy', 'travel', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, '描述不能超過200個字符']
  },
  carbonFootprint: {
    type: Number,
    required: true,
    min: [0, '碳足跡不能為負數']
  },
  timestamp: {
    type: Date,
    required: true
  },
  metadata: {
    source: {
      type: String,
      enum: ['movement', 'invoice', 'manual', 'api'],
      default: 'manual'
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    duration: Number,
    distance: Number,
    amount: Number,
    quantity: Number
  }
}, { _id: false });

const carbonFootprintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  total: {
    type: Number,
    required: true,
    min: [0, '總碳足跡不能為負數']
  },
  breakdown: {
    transportation: {
      type: Number,
      default: 0,
      min: [0, '交通碳足跡不能為負數']
    },
    shopping: {
      type: Number,
      default: 0,
      min: [0, '購物碳足跡不能為負數']
    },
    food: {
      type: Number,
      default: 0,
      min: [0, '食物碳足跡不能為負數']
    },
    energy: {
      type: Number,
      default: 0,
      min: [0, '能源碳足跡不能為負數']
    },
    other: {
      type: Number,
      default: 0,
      min: [0, '其他碳足跡不能為負數']
    }
  },
  activities: [carbonActivitySchema],
  dailyGoal: {
    type: Number,
    default: 20, // 預設每日目標 20kg CO2
    min: [0, '每日目標不能為負數']
  },
  isGoalAchieved: {
    type: Boolean,
    default: false
  },
  goalProgress: {
    type: Number,
    default: 0,
    min: [0, '目標進度不能為負數'],
    max: [100, '目標進度不能超過100%']
  },
  comparison: {
    previousDay: {
      type: Number,
      default: 0
    },
    previousWeek: {
      type: Number,
      default: 0
    },
    previousMonth: {
      type: Number,
      default: 0
    },
    average: {
      type: Number,
      default: 0
    }
  },
  insights: [{
    type: {
      type: String,
      enum: ['tip', 'warning', 'achievement', 'suggestion'],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: [100, '洞察標題不能超過100個字符']
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, '洞察描述不能超過500個字符']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  isCalculated: {
    type: Boolean,
    default: false
  },
  lastCalculated: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// 索引
carbonFootprintSchema.index({ userId: 1, date: -1 });
carbonFootprintSchema.index({ date: -1 });
carbonFootprintSchema.index({ total: 1 });
carbonFootprintSchema.index({ 'breakdown.transportation': 1 });
carbonFootprintSchema.index({ 'breakdown.shopping': 1 });

// 複合索引
carbonFootprintSchema.index({ userId: 1, date: 1 }, { unique: true });

// 虛擬欄位：計算目標達成率
carbonFootprintSchema.virtual('goalAchievementRate').get(function() {
  if (this.dailyGoal === 0) return 0;
  return Math.min((this.total / this.dailyGoal) * 100, 100);
});

// 虛擬欄位：計算與前一天的比較
carbonFootprintSchema.virtual('dayOverDayChange').get(function() {
  if (this.comparison.previousDay === 0) return 0;
  return ((this.total - this.comparison.previousDay) / this.comparison.previousDay) * 100;
});

// 中介軟體：自動計算總碳足跡和目標進度
carbonFootprintSchema.pre('save', function(next) {
  // 計算總碳足跡
  this.total = Object.values(this.breakdown).reduce((sum, value) => sum + value, 0);
  
  // 計算目標進度
  this.goalProgress = this.dailyGoal > 0 ? (this.total / this.dailyGoal) * 100 : 0;
  this.isGoalAchieved = this.total <= this.dailyGoal;
  
  next();
});

// 靜態方法：獲取用戶的碳足跡統計
carbonFootprintSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const matchStage = {
    userId: mongoose.Types.ObjectId(userId),
    date: {
      $gte: startDate,
      $lte: endDate
    }
  };

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCarbonFootprint: { $sum: '$total' },
        averageDaily: { $avg: '$total' },
        maxDaily: { $max: '$total' },
        minDaily: { $min: '$total' },
        goalAchievementRate: { $avg: '$goalProgress' },
        daysWithData: { $sum: 1 },
        transportationTotal: { $sum: '$breakdown.transportation' },
        shoppingTotal: { $sum: '$breakdown.shopping' },
        foodTotal: { $sum: '$breakdown.food' },
        energyTotal: { $sum: '$breakdown.energy' },
        otherTotal: { $sum: '$breakdown.other' }
      }
    }
  ]);

  return stats[0] || {
    totalCarbonFootprint: 0,
    averageDaily: 0,
    maxDaily: 0,
    minDaily: 0,
    goalAchievementRate: 0,
    daysWithData: 0,
    transportationTotal: 0,
    shoppingTotal: 0,
    foodTotal: 0,
    energyTotal: 0,
    otherTotal: 0
  };
};

// 靜態方法：獲取碳足跡趨勢
carbonFootprintSchema.statics.getTrends = async function(userId, startDate, endDate, groupBy = 'day') {
  let groupFormat;
  
  switch (groupBy) {
    case 'day':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
      break;
    case 'week':
      groupFormat = { $dateToString: { format: '%Y-W%U', date: '$date' } };
      break;
    case 'month':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
  }

  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: groupFormat,
        total: { $sum: '$total' },
        transportation: { $sum: '$breakdown.transportation' },
        shopping: { $sum: '$breakdown.shopping' },
        food: { $sum: '$breakdown.food' },
        energy: { $sum: '$breakdown.energy' },
        other: { $sum: '$breakdown.other' },
        average: { $avg: '$total' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// 靜態方法：獲取排行榜
carbonFootprintSchema.statics.getLeaderboard = async function(startDate, endDate, limit = 10) {
  return await this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalCarbonFootprint: { $sum: '$total' },
        averageDaily: { $avg: '$total' },
        daysCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        userName: '$user.name',
        userAvatar: '$user.avatar',
        totalCarbonFootprint: 1,
        averageDaily: 1,
        daysCount: 1
      }
    },
    { $sort: { averageDaily: 1 } }, // 按平均每日碳排放升序排列（越低越好）
    { $limit: limit }
  ]);
};

// 靜態方法：計算或更新碳足跡記錄
carbonFootprintSchema.statics.calculateDailyFootprint = async function(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 獲取當天的移動記錄
  const Movement = mongoose.model('Movement');
  const movements = await Movement.find({
    userId,
    timestamp: { $gte: startOfDay, $lte: endOfDay }
  });

  // 獲取當天的發票記錄
  const Invoice = mongoose.model('Invoice');
  const invoices = await Invoice.find({
    userId,
    timestamp: { $gte: startOfDay, $lte: endOfDay }
  });

  // 計算各類別碳足跡
  const transportation = movements.reduce((sum, movement) => sum + movement.carbonFootprint, 0);
  const shopping = invoices.reduce((sum, invoice) => sum + invoice.carbonFootprint, 0);
  
  // 這裡可以添加其他類別的計算邏輯
  const food = 0;
  const energy = 0;
  const other = 0;

  const total = transportation + shopping + food + energy + other;

  // 創建或更新碳足跡記錄
  const carbonFootprint = await this.findOneAndUpdate(
    { userId, date: startOfDay },
    {
      userId,
      date: startOfDay,
      total,
      breakdown: {
        transportation,
        shopping,
        food,
        energy,
        other
      },
      isCalculated: true,
      lastCalculated: new Date()
    },
    { upsert: true, new: true }
  );

  return carbonFootprint;
};

module.exports = mongoose.model('CarbonFootprint', carbonFootprintSchema);
