const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ViewHistory = sequelize.define('ViewHistory', {
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
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: '浏览次数'
  },
  last_view_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '最后浏览时间'
  }
}, {
  tableName: 'view_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ViewHistory;
