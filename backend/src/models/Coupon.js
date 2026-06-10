const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '优惠券名称'
  },
  type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '类型'
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '优惠值'
  },
  min_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '最低使用金额'
  },
  max_discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '最大优惠金额'
  },
  total_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '发放总量'
  },
  used_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '已使用数量'
  },
  limit_per_user: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '每人限领数量'
  },
  valid_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '有效期类型'
  },
  valid_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '有效天数'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '结束时间'
  },
  category_ids: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '适用分类ID'
  },
  product_ids: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '适用商品ID'
  },
  is_new_user: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否仅限新人'
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否启用'
  }
}, {
  tableName: 'coupons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Coupon;
