const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  parent_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: '父分类ID'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '分类名称'
  },
  icon: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '图标'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '分类图片'
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '描述'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态'
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Category;
