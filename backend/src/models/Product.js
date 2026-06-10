const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '分类ID'
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '商品名称'
  },
  subtitle: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '副标题'
  },
  main_image: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '主图'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '轮播图片'
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '视频URL'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '商品描述'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  member_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '会员价'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '原价'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '库存'
  },
  stock_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '库存类型'
  },
  sales: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '销量'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 5.00,
    comment: '评分'
  },
  review_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '评价数'
  },
  serving_size: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '适用人数'
  },
  cooking_time: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '烹饪时长'
  },
  difficulty: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '难度'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '标签'
  },
  origin: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '食材产地'
  },
  packing_date: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '分装日期'
  },
  shelf_life: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '保质期'
  },
  storage_conditions: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '储存条件'
  },
  ingredient_list: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配料表'
  },
  producer_info: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '生产者信息'
  },
  recipe_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    comment: '关联食谱ID'
  },
  is_on_sale: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否上架'
  },
  is_new: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否新品'
  },
  is_hot: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否热销'
  },
  is_recommend: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否推荐'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '排序'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '删除时间'
  }
}, {
  tableName: 'products',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = Product;
