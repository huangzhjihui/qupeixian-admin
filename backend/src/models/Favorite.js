const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
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
  type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '类型'
  },
  target_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '目标ID'
  }
}, {
  tableName: 'favorites',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Favorite;
