const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB 連接成功: ${conn.connection.host}`);

    // 監聽連接事件
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB 連接錯誤:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB 連接中斷');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB 重新連接成功');
    });

    // 優雅關閉
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB 連接已關閉');
      process.exit(0);
    });

  } catch (error) {
    logger.error('MongoDB 連接失敗:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
