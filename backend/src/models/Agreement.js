const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Agreement = sequelize.define('Agreement', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '类型'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '内容'
  },
  version: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '版本号'
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '发布时间'
  }
}, {
  tableName: 'agreements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Agreement;
