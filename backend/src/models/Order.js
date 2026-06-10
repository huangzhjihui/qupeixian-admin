const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  order_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  address_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '地址ID'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单总额'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '优惠金额'
  },
  freight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '运费'
  },
  pay_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '实付金额'
  },
  points_used: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '使用积分'
  },
  points_earned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '获得积分'
  },
  coupon_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: '使用优惠券ID'
  },
  delivery_method: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '配送方式'
  },
  delivery_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '配送时段'
  },
  delivery_remark: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '配送备注'
  },
  pay_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '支付方式'
  },
  pay_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  transaction_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '第三方交易号'
  },
  invoice_title: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '发票抬头'
  },
  invoice_tax_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '税号'
  },
  invoice_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '发票类型'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '订单状态'
  },
  cancel_reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '取消原因'
  },
  cancel_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '取消时间'
  },
  prepare_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '备货时间'
  },
  ship_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '发货时间'
  },
  receive_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '收货时间'
  },
  complete_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '完成时间'
  },
  admin_remark: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '管理员备注'
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order;
