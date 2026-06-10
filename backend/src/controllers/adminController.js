const { Admin } = require('../models');
const { generateToken } = require('../config/jwt');
const { success, error } = require('../utils/response');
const { ADMIN_ROLE } = require('../config/constants');
const { Order, Product, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return error(res, '管理员不存在', 404);
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return error(res, '密码错误', 401);
    }

    if (admin.status !== 1) {
      return error(res, '账号已被禁用', 403);
    }

    await admin.update({
      last_login_time: new Date(),
      last_login_ip: req.ip
    });

    const token = generateToken({ adminId: admin.id, role: admin.role });

    success(res, {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        real_name: admin.real_name,
        avatar: admin.avatar,
        role: admin.role,
        phone: admin.phone,
        need_reset_password: admin.need_reset_password
      }
    }, '登录成功');
  } catch (err) {
    logger.error('Admin login error:', err);
    error(res, '登录失败', 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const admin = req.admin;
    success(res, {
      id: admin.id,
      username: admin.username,
      real_name: admin.real_name,
      avatar: admin.avatar,
      role: admin.role,
      phone: admin.phone
    });
  } catch (err) {
    logger.error('Get admin profile error:', err);
    error(res, '获取管理员信息失败', 500);
  }
};

const getAdmins = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const admins = await Admin.findAndCountAll({
      attributes: ['id', 'username', 'real_name', 'phone', 'role', 'status', 'created_at', 'last_login_time'],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });
    success(res, {
      data: admins.rows,
      total: admins.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    logger.error('Get admins error:', err);
    error(res, '获取管理员列表失败', 500);
  }
};

const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = parseInt(id, 10);
    
    if (isNaN(adminId)) {
      return error(res, '无效的管理员ID', 400);
    }
    
    const admin = await Admin.findByPk(adminId, {
      attributes: ['id', 'username', 'real_name', 'phone', 'role', 'status', 'permissions']
    });
    if (!admin) {
      return error(res, '管理员不存在', 404);
    }
    success(res, admin);
  } catch (err) {
    logger.error('Get admin by id error:', err);
    error(res, '获取管理员信息失败', 500);
  }
};

const createAdmin = async (req, res) => {
  try {
    const { username, password, real_name, phone, role = 1, permissions } = req.body;
    
    if (!username || !password) {
      return error(res, '用户名和密码不能为空', 400);
    }

    const existing = await Admin.findOne({ where: { username } });
    if (existing) {
      return error(res, '用户名已存在', 400);
    }

    const admin = await Admin.create({
      username,
      password_hash: password,
      real_name,
      phone,
      role,
      permissions,
      status: 1
    });

    success(res, {
      id: admin.id,
      username: admin.username,
      real_name: admin.real_name,
      phone: admin.phone,
      role: admin.role,
      status: admin.status
    }, '创建成功');
  } catch (err) {
    logger.error('Create admin error:', err);
    error(res, '创建管理员失败', 500);
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = parseInt(id, 10);
    
    if (isNaN(adminId)) {
      return error(res, '无效的管理员ID', 400);
    }
    
    const { real_name, phone, role, status, permissions } = req.body;

    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return error(res, '管理员不存在', 404);
    }

    await admin.update({
      real_name,
      phone,
      role,
      status,
      permissions
    });

    success(res, {
      id: admin.id,
      username: admin.username,
      real_name: admin.real_name,
      phone: admin.phone,
      role: admin.role,
      status: admin.status
    }, '更新成功');
  } catch (err) {
    logger.error('Update admin error:', err);
    error(res, '更新管理员失败', 500);
  }
};

const updateAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = parseInt(id, 10);
    
    if (isNaN(adminId)) {
      return error(res, '无效的管理员ID', 400);
    }
    
    const { password } = req.body;

    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return error(res, '管理员不存在', 404);
    }

    await admin.update({ password_hash: password });

    success(res, null, '密码修改成功');
  } catch (err) {
    logger.error('Update admin password error:', err);
    error(res, '修改密码失败', 500);
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = parseInt(id, 10);
    
    if (isNaN(adminId)) {
      return error(res, '无效的管理员ID', 400);
    }

    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return error(res, '管理员不存在', 404);
    }

    if (admin.role === ADMIN_ROLE.SUPER_ADMIN) {
      return error(res, '超级管理员不能删除', 403);
    }

    await admin.update({ status: 0 });

    success(res, null, '删除成功');
  } catch (err) {
    logger.error('Delete admin error:', err);
    error(res, '删除管理员失败', 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const admin = req.admin;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return error(res, '请输入原密码和新密码', 400);
    }

    const isPasswordValid = await admin.comparePassword(old_password);
    if (!isPasswordValid) {
      return error(res, '原密码错误', 401);
    }

    const sequelize = require('../config/database');
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(new_password, await bcrypt.genSalt(12));
    await sequelize.query('UPDATE admins SET password_hash = ?, need_reset_password = 0 WHERE id = ?', {
      replacements: [hash, admin.id]
    });

    success(res, null, '密码修改成功');
  } catch (err) {
    logger.error('Admin reset password error:', err);
    error(res, '修改密码失败', 500);
  }
};

const smsCodes = {};

const sendSmsCode = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return error(res, '请输入手机号', 400);
    }

    const admin = await Admin.findOne({ where: { phone } });
    if (!admin) {
      return error(res, '该手机号未绑定管理员账号', 400);
    }

    const code = Math.random().toString(10).slice(-6);
    const expireTime = Date.now() + 5 * 60 * 1000;
    smsCodes[phone] = { code, expireTime };

    logger.info(`管理员找回密码验证码已发送，手机号: ${phone.substring(0, 3)}****${phone.substring(7)}`);

    success(res, { phone }, '验证码已发送，请注意查收');
  } catch (err) {
    logger.error('Send SMS code error:', err);
    error(res, '发送验证码失败', 500);
  }
};

const verifySmsCode = async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return error(res, '请输入手机号和验证码', 400);
    }

    const storedCode = smsCodes[phone];
    if (!storedCode) {
      return error(res, '请先获取验证码', 400);
    }

    if (Date.now() > storedCode.expireTime) {
      delete smsCodes[phone];
      return error(res, '验证码已过期，请重新获取', 400);
    }

    if (storedCode.code !== code) {
      return error(res, '验证码错误', 400);
    }

    delete smsCodes[phone];
    success(res, { phone }, '验证码验证通过');
  } catch (err) {
    logger.error('Verify SMS code error:', err);
    error(res, '验证失败', 500);
  }
};

const resetPasswordBySms = async (req, res) => {
  try {
    const { phone, new_password } = req.body;

    if (!phone || !new_password) {
      return error(res, '请输入手机号和新密码', 400);
    }

    const admin = await Admin.findOne({ where: { phone } });
    if (!admin) {
      return error(res, '该手机号未绑定管理员账号', 400);
    }

    const hash = await bcrypt.hash(new_password, await bcrypt.genSalt(12));
    await sequelize.query('UPDATE admins SET password_hash = ?, need_reset_password = 0 WHERE id = ?', {
      replacements: [hash, admin.id]
    });

    success(res, null, '密码重置成功，请使用新密码登录');
  } catch (err) {
    logger.error('Reset password by SMS error:', err);
    error(res, '密码重置失败', 500);
  }
};

const forceResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password) {
      return error(res, '请输入新密码', 400);
    }

    const admin = await Admin.findByPk(id);
    if (!admin) {
      return error(res, '管理员不存在', 404);
    }

    const sequelize = require('../config/database');
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(new_password, await bcrypt.genSalt(12));
    await sequelize.query('UPDATE admins SET password_hash = ?, need_reset_password = 1 WHERE id = ?', {
      replacements: [hash, admin.id]
    });

    success(res, null, '密码已重置，用户下次登录需要修改密码');
  } catch (err) {
    logger.error('Admin force reset password error:', err);
    error(res, '重置密码失败', 500);
  }
};

const getRoleOptions = async (req, res) => {
  try {
    const roles = [
      { value: ADMIN_ROLE.SUPER_ADMIN, label: '超级管理员' },
      { value: ADMIN_ROLE.OPERATION, label: '运营' },
      { value: ADMIN_ROLE.CUSTOMER_SERVICE, label: '客服' },
      { value: ADMIN_ROLE.FINANCE, label: '财务' }
    ];
    success(res, roles);
  } catch (err) {
    logger.error('Get role options error:', err);
    error(res, '获取角色列表失败', 500);
  }
};

// 更新当前管理员信息
const updateProfile = async (req, res) => {
  try {
    const admin = req.admin;
    const { real_name, nickname, phone, avatar, email } = req.body;

    const updateData = {};
    if (real_name !== undefined) updateData.real_name = real_name;
    if (nickname !== undefined) updateData.real_name = nickname;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    await admin.update(updateData);

    success(res, {
      id: admin.id,
      username: admin.username,
      real_name: admin.real_name,
      nickname: admin.real_name,
      avatar: admin.avatar,
      phone: admin.phone,
      role: admin.role
    }, '更新成功');
  } catch (err) {
    logger.error('Update admin profile error:', err);
    error(res, '更新管理员信息失败', 500);
  }
};

const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [todayOrders, todayRevenue, newUsers, totalProducts] = await Promise.all([
      Order.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      }),
      Order.sum('total_amount', {
        where: {
          created_at: {
            [Op.gte]: today
          },
          status: {
            [Op.in]: [2, 3, 4]
          }
        }
      }),
      User.count({
        where: {
          created_at: {
            [Op.gte]: today
          }
        }
      }),
      Product.count({
        where: {
          deleted_at: null
        }
      })
    ]);

    success(res, {
      todayOrders: todayOrders || 0,
      todayRevenue: todayRevenue || 0,
      newUsers: newUsers || 0,
      totalProducts: totalProducts || 0
    });
  } catch (err) {
    logger.error('Get stats error:', err);
    error(res, '获取统计数据失败', 500);
  }
};

module.exports = {
  login,
  getProfile,
  getStats,
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin,
  getRoleOptions,
  resetPassword,
  forceResetPassword,
  sendSmsCode,
  verifySmsCode,
  resetPasswordBySms,
  updateProfile
};