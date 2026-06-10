const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
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
  order_no: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '关联订单号'
  },
  sender_type: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '发送者类型: 1-用户, 2-管理员'
  },
  sender_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: '发送者ID'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '消息内容'
  },
  is_read: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否已读: 0-未读, 1-已读'
  }
}, {
  tableName: 'chat_messages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ChatMessage;
