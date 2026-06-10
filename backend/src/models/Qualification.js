const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Qualification = sequelize.define('Qualification', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '类型'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '资质名称'
  },
  license_no: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '证号'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '资质图片'
  },
  issuing_authority: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '发证机关'
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '发证日期'
  },
  expire_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '到期日期'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '详细内容'
  },
  is_public: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '是否公开'
  }
}, {
  tableName: 'qualifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Qualification;
