const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '食谱标题'
  },
  subtitle: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '副标题'
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '封面图'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '食谱图片'
  },
  video_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '视频URL'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '描述'
  },
  cuisine: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '菜系'
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
  taste: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '口味'
  },
  scene: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '场景'
  },
  servings: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '适用人数'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '标签'
  },
  steps: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '烹饪步骤'
  },
  tips: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '小贴士'
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '浏览量'
  },
  collect_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '收藏量'
  },
  is_on_sale: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否上架'
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
  tableName: 'recipes',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = Recipe;
