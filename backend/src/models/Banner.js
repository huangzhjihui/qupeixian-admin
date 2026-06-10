const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  position: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '位置'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '标题'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '图片'
  },
  link_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '链接类型'
  },
  link_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '链接地址'
  },
  product_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: '关联商品ID'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序'
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '显示开始时间'
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '显示结束时间'
  },
  is_active: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否启用'
  }
}, {
  tableName: 'banners',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Banner;
