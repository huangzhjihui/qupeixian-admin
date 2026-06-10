const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
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
  product_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '商品ID'
  },
  spec_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: '规格ID'
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '商品名称快照'
  },
  product_image: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '商品图片快照'
  },
  spec_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '规格名称快照'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '单价快照'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '数量'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '小计'
  },
  dietary_note: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '忌口备注'
  }
}, {
  tableName: 'order_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = OrderItem;
