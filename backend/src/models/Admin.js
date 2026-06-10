const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: '用户名'
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '密码Hash'
  },
  real_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '真实姓名'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '电话'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '头像'
  },
  role: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '角色'
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '权限列表'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
    comment: '状态'
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
  }
}, {
  tableName: 'admins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Admin.beforeCreate(async (admin) => {
  if (admin.password_hash) {
    const salt = await bcrypt.genSalt(12);
    admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
  }
});

Admin.beforeUpdate(async (admin) => {
  if (admin.changed('password_hash')) {
    const salt = await bcrypt.genSalt(12);
    admin.password_hash = await bcrypt.hash(admin.password_hash, salt);
  }
});

Admin.prototype.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = Admin;
