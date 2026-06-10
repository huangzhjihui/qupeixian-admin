const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAddress = sequelize.define('UserAddress', {
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
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '收货人姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '收货人电话'
  },
  province: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '省'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '市'
  },
  district: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '区'
  },
  detail_address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '详细地址'
  },
  full_address: {
    type: DataTypes.STRING(300),
    allowNull: false,
    comment: '完整地址'
  },
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: '邮编'
  },
  is_default: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否默认'
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
    comment: '经度'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: true,
    comment: '纬度'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '删除时间'
  }
}, {
  tableName: 'user_addresses',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = UserAddress;
