// MongoDB 初始化腳本
db = db.getSiblingDB('carbon-tracker');

// 創建用戶
db.createUser({
  user: 'carbon-user',
  pwd: 'carbon-password',
  roles: [
    {
      role: 'readWrite',
      db: 'carbon-tracker'
    }
  ]
});

// 創建集合和索引
db.createCollection('users');
db.createCollection('movements');
db.createCollection('invoices');
db.createCollection('carbonfootprints');

// 用戶集合索引
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// 移動記錄集合索引
db.movements.createIndex({ userId: 1, timestamp: -1 });
db.movements.createIndex({ type: 1 });
db.movements.createIndex({ 'startLocation.latitude': 1, 'startLocation.longitude': 1 });
db.movements.createIndex({ 'endLocation.latitude': 1, 'endLocation.longitude': 1 });

// 發票集合索引
db.invoices.createIndex({ userId: 1, timestamp: -1 });
db.invoices.createIndex({ storeName: 1 });
db.invoices.createIndex({ type: 1 });
db.invoices.createIndex({ 'items.category': 1 });

// 碳足跡集合索引
db.carbonfootprints.createIndex({ userId: 1, date: -1 });
db.carbonfootprints.createIndex({ date: -1 });
db.carbonfootprints.createIndex({ userId: 1, date: 1 }, { unique: true });

// 插入初始數據
db.users.insertOne({
  name: '系統管理員',
  email: 'admin@carbon-tracker.com',
  password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', // password123
  preferences: {
    units: 'metric',
    language: 'zh-TW',
    notifications: {
      daily: true,
      weekly: true,
      monthly: false,
      achievements: true
    },
    privacy: {
      shareData: false,
      locationTracking: true
    }
  },
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('MongoDB 初始化完成');
