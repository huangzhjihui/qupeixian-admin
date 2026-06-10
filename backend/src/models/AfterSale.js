const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AfterSale = sequelize.define('AfterSale', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  after_sale_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '售后单号'
  },
  order_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '订单ID'
  },
  order_item_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '订单项ID'
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '类型'
  },
  reason: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '退款原因'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '详细描述'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '凭证图片'
  },
  refund_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '退款金额'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态'
  },
  refuse_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '拒绝原因'
  },
  audit_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '审核时间'
  },
  refund_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '退款时间'
  }
}, {
  tableName: 'after_sales',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AfterSale;
