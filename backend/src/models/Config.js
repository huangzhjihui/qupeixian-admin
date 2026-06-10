const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '配置键'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配置值'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '描述'
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'string',
    comment: '类型'
  },
  group: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '分组'
  }
}, {
  tableName: 'configs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Config;
