const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  openid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '微信OpenID'
  },
  unionid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '微信UnionID'
  },
  nickname: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '昵称'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '头像URL'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '手机号(脱敏存储)'
  },
  phone_encrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '手机号加密'
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '邮箱'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '密码Hash'
  },
  real_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '真实姓名'
  },
  id_card: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '身份证号'
  },
  member_level: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '会员等级'
  },
  member_expire_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '会员到期时间'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '积分'
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '余额'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态'
  },
  is_blacklist: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否黑名单'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '用户标签'
  },
  last_login_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后登录时间'
  },
  last_login_ip: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '最后登录IP'
  },
  need_reset_password: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: '是否需要重置密码(1=是)'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '删除时间'
  }
}, {
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

User.beforeCreate(async (user) => {
  if (user.password_hash && !user.password_hash.startsWith('$2a$') && !user.password_hash.startsWith('$2b$') && !user.password_hash.startsWith('$2y$')) {
    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    const salt = await bcrypt.genSalt(12);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});

User.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;
