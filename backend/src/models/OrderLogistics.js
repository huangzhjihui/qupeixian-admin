const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderLogistics = sequelize.define('OrderLogistics', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '订单ID'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '对应订单状态'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '物流描述'
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '位置信息'
  },
  operator: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '系统',
    comment: '操作人'
  }
}, {
  tableName: 'order_logistics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = OrderLogistics;
