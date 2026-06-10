const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  admin_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '管理员ID'
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '管理员用户名'
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '模块'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '描述'
  },
  ip: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'IP地址'
  },
  params: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '请求参数'
  }
}, {
  tableName: 'admin_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AdminLog;
