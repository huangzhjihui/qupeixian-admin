const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCoupon = sequelize.define('UserCoupon', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '用户ID'
  },
  coupon_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '优惠券ID'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '状态'
  },
  order_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: '使用订单ID'
  },
  use_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '使用时间'
  },
  receive_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '领取时间'
  },
  expire_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '过期时间'
  }
}, {
  tableName: 'user_coupons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserCoupon;
