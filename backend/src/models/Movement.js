const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  altitude: {
    type: Number,
    default: null
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    required: true
  }
}, { _id: false });

const movementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['walking', 'cycling', 'driving', 'public_transport', 'flying', 'unknown'],
    required: true
  },
  startLocation: {
    type: locationSchema,
    required: true
  },
  endLocation: {
    type: locationSchema,
    required: true
  },
  distance: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  carbonFootprint: {
    type: Number,
    required: true,
    min: 0
  },
  metadata: {
    speed: {
      type: Number,
      default: null
    },
    elevation: {
      type: Number,
      default: null
    },
    weather: {
      type: String,
      default: null
    },
    traffic: {
      type: String,
      enum: ['light', 'moderate', 'heavy'],
      default: null
    },
    vehicleType: {
      type: String,
      default: null
    },
    fuelType: {
      type: String,
      default: null
    },
    passengers: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['gps', 'manual', 'sensor', 'api'],
    default: 'gps'
  },
  notes: {
    type: String,
    maxlength: [500, '備註不能超過500個字符']
  }
}, {
  timestamps: true
});

// 索引
movementSchema.index({ userId: 1, timestamp: -1 });
movementSchema.index({ type: 1 });
movementSchema.index({ timestamp: -1 });
movementSchema.index({ 'startLocation.latitude': 1, 'startLocation.longitude': 1 });
movementSchema.index({ 'endLocation.latitude': 1, 'endLocation.longitude': 1 });

// 虛擬欄位：計算平均速度 (km/h)
movementSchema.virtual('averageSpeed').get(function() {
  if (this.duration === 0) return 0;
  return (this.distance / (this.duration / 60)).toFixed(2);
});

// 虛擬欄位：計算碳排放強度 (kg CO2/km)
movementSchema.virtual('emissionIntensity').get(function() {
  if (this.distance === 0) return 0;
  return (this.carbonFootprint / this.distance).toFixed(3);
});

// 中介軟體：自動計算距離（如果未提供）
movementSchema.pre('save', function(next) {
  if (!this.distance && this.startLocation && this.endLocation) {
    this.distance = this.calculateDistance(
      this.startLocation.latitude,
      this.startLocation.longitude,
      this.endLocation.latitude,
      this.endLocation.longitude
    );
  }
  next();
});

// 計算兩點間距離的方法（Haversine公式）
movementSchema.methods.calculateDistance = function(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半徑（公里）
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 角度轉弧度
movementSchema.methods.toRad = function(deg) {
  return deg * (Math.PI / 180);
};

// 靜態方法：獲取用戶的移動統計
movementSchema.statics.getUserStats = async function(userId, startDate, endDate) {
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
        totalDistance: { $sum: '$distance' },
        totalDuration: { $sum: '$duration' },
        totalCarbonFootprint: { $sum: '$carbonFootprint' },
        averageSpeed: { $avg: { $divide: ['$distance', { $divide: ['$duration', 60] }] } },
        movementCount: { $sum: 1 },
        typeBreakdown: {
          $push: {
            type: '$type',
            distance: '$distance',
            carbonFootprint: '$carbonFootprint'
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalDistance: 0,
    totalDuration: 0,
    totalCarbonFootprint: 0,
    averageSpeed: 0,
    movementCount: 0,
    typeBreakdown: []
  };
};

// 靜態方法：獲取移動類型分布
movementSchema.statics.getTypeDistribution = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalDistance: { $sum: '$distance' },
        totalCarbonFootprint: { $sum: '$carbonFootprint' },
        averageDistance: { $avg: '$distance' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Movement', movementSchema);
