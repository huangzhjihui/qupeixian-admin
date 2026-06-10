const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
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
  product_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '商品ID'
  },
  rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '评分'
  },
  delivery_rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 5,
    comment: '配送评分'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '评价内容'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '评价图片'
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '评价视频'
  },
  is_anonymous: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否匿名'
  },
  is_top: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否置顶'
  },
  reply: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商家回复'
  },
  reply_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '回复时间'
  },
  like_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '点赞数'
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Review;
