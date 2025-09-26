const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '請提供姓名'],
    trim: true,
    maxlength: [50, '姓名不能超過50個字符']
  },
  email: {
    type: String,
    required: [true, '請提供電子郵件'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      '請提供有效的電子郵件地址'
    ]
  },
  password: {
    type: String,
    required: [true, '請提供密碼'],
    minlength: [6, '密碼至少需要6個字符'],
    select: false // 預設查詢時不返回密碼
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    language: {
      type: String,
      enum: ['zh-TW', 'en-US'],
      default: 'zh-TW'
    },
    notifications: {
      daily: {
        type: Boolean,
        default: true
      },
      weekly: {
        type: Boolean,
        default: true
      },
      monthly: {
        type: Boolean,
        default: false
      },
      achievements: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      shareData: {
        type: Boolean,
        default: false
      },
      locationTracking: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// 索引
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// 密碼加密中介軟體
userSchema.pre('save', async function(next) {
  // 只有當密碼被修改時才加密
  if (!this.isModified('password')) return next();

  try {
    // 加密密碼
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 比較密碼方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 生成 JWT Token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      name: this.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// 更新最後登入時間
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// 轉換為 JSON 時移除敏感信息
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// 靜態方法：根據電子郵件查找用戶
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// 靜態方法：檢查電子郵件是否已存在
userSchema.statics.emailExists = async function(email) {
  const user = await this.findOne({ email: email.toLowerCase() });
  return !!user;
};

module.exports = mongoose.model('User', userSchema);
