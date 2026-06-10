const { Sequelize } = require('sequelize');
const path = require('path');

// 确保环境变量正确加载
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

let sequelize;

// 根据配置选择数据库类型
if (process.env.DB_CONNECTION === 'sqlite') {
  // SQLite 配置
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_FILENAME || './database/dev.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  // MySQL 配置
  sequelize = new Sequelize(
    process.env.DB_NAME || 'qupeixian',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timezone: '+08:00',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 10000
      },
      define: {
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
        freezeTableName: true
      }
    }
  );
}

module.exports = sequelize;
