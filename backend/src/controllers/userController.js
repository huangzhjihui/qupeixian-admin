const { User, UserAddress } = require('../models');
const { Op } = require('sequelize');
const { success, error } = require('../utils/response');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config/jwt');
const logger = require('../config/logger');

const register = async (req, res) => {
  try {
    const { phone, password, nickname } = req.body;

    // 手机号格式验证
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return error(res, '请输入正确的手机号', 400);
    }

    // 密码强度校验
    if (!password || password.length < 6) {
      return error(res, '密码长度不能少于6位', 400);
    }
    if (password.length > 32) {
      return error(res, '密码长度不能超过32位', 400);
    }

    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return error(res, '该手机号已注册', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      phone,
      password_hash: passwordHash,
      nickname: nickname || `用户${phone.slice(-4)}`,
      status: 1
    });

    const token = jwt.sign({ id: user.id, phone: user.phone }, jwtConfig.secret, { expiresIn: '7d' });
    
    success(res, {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        member_level: user.member_level,
        points: user.points,
        balance: user.balance
      },
      token
    }, '注册成功');
  } catch (err) {
    logger.error('Register error:', err);
    error(res, '注册失败', 500);
  }
};

const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    const user = await User.findOne({ where: { phone } });

    if (!user) {
      return error(res, '账号或密码错误', 401);
    }

    if (user.status === 0) {
      return error(res, '账号已被禁用', 403);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return error(res, '账号或密码错误', 401);
    }

    await user.update({ last_login_time: new Date() });

    const token = jwt.sign({ id: user.id, phone: user.phone }, jwtConfig.secret, { expiresIn: '7d' });
    
    success(res, {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        member_level: user.member_level,
        points: user.points,
        balance: user.balance
      },
      token
    }, '登录成功');
  } catch (err) {
    logger.error('Login error:', err);
    error(res, '登录失败', 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'phone', 'nickname', 'email', 'real_name', 'member_level', 'member_expire_time', 'points', 'balance', 'status', 'created_at']
    });
    
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    success(res, user);
  } catch (err) {
    logger.error('Get profile error:', err);
    error(res, '获取用户信息失败', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nickname, email, real_name } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    await user.update({ nickname, email, real_name });
    success(res, user, '更新成功');
  } catch (err) {
    logger.error('Update profile error:', err);
    error(res, '更新失败', 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return error(res, '请输入旧密码和新密码', 400);
    }
    if (new_password.length < 6) {
      return error(res, '新密码长度不能少于6位', 400);
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    const isValid = await bcrypt.compare(old_password, user.password_hash);
    if (!isValid) {
      return error(res, '旧密码错误', 400);
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash: hashedPassword });

    success(res, null, '密码修改成功');
  } catch (err) {
    logger.error('Reset password error:', err);
    error(res, '密码修改失败', 500);
  }
};

// 短信验证码存储（生产环境应使用 Redis）
const smsCodes = {};

// 发送重置密码验证码
const sendResetCode = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return error(res, '请输入正确的手机号', 400);
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return error(res, '该手机号未注册', 400);
    }

    // 防刷：60秒内不能重复发送
    const existing = smsCodes[phone];
    if (existing && Date.now() - existing.sendTime < 60 * 1000) {
      return error(res, '验证码已发送，请60秒后再试', 400);
    }

    const code = Math.random().toString(10).slice(-6);
    smsCodes[phone] = { code, sendTime: Date.now(), expireTime: Date.now() + 5 * 60 * 1000 };

    // TODO: 对接真实短信服务商发送验证码
    logger.info(`重置密码验证码已发送，手机号: ${phone.substring(0, 3)}****${phone.substring(7)}`);

    success(res, { phone }, '验证码已发送，请注意查收');
  } catch (err) {
    logger.error('Send reset code error:', err);
    error(res, '发送验证码失败', 500);
  }
};

// 通过短信验证码重置密码
const forgotPassword = async (req, res) => {
  try {
    const { phone, code, new_password } = req.body;

    if (!phone || !code || !new_password) {
      return error(res, '请输入手机号、验证码和新密码', 400);
    }
    if (new_password.length < 6) {
      return error(res, '新密码长度不能少于6位', 400);
    }

    // 验证码校验
    const stored = smsCodes[phone];
    if (!stored) {
      return error(res, '请先获取验证码', 400);
    }
    if (Date.now() > stored.expireTime) {
      delete smsCodes[phone];
      return error(res, '验证码已过期，请重新获取', 400);
    }
    if (stored.code !== code) {
      return error(res, '验证码错误', 400);
    }

    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return error(res, '该手机号未注册', 400);
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await user.update({ password_hash: hashedPassword });

    // 验证成功后清除验证码
    delete smsCodes[phone];

    success(res, null, '密码重置成功，请使用新密码登录');
  } catch (err) {
    logger.error('Forgot password error:', err);
    error(res, '密码重置失败', 500);
  }
};

const getAddresses = async (req, res) => {
  try {
    const addresses = await UserAddress.findAll({
      where: { user_id: req.user.id },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    });

    success(res, addresses);
  } catch (err) {
    logger.error('Get addresses error:', err);
    error(res, '获取地址失败', 500);
  }
};

const createAddress = async (req, res) => {
  try {
    const { real_name, phone, province, city, district, detail, is_default } = req.body;

    const full_address = `${province}${city}${district}${detail}`;

    if (is_default) {
      await UserAddress.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      );
    }

    const address = await UserAddress.create({
      user_id: req.user.id,
      real_name,
      phone,
      province,
      city,
      district,
      detail_address: detail,
      full_address,
      is_default: is_default || false
    });

    success(res, address, '添加成功');
  } catch (err) {
    logger.error('Create address error:', err);
    error(res, '添加失败', 500);
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { real_name, phone, province, city, district, detail, is_default } = req.body;

    const full_address = `${province}${city}${district}${detail}`;

    const address = await UserAddress.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!address) {
      return error(res, '地址不存在', 404);
    }

    if (is_default) {
      await UserAddress.update(
        { is_default: false },
        { where: { user_id: req.user.id } }
      );
    }

    await address.update({
      real_name,
      phone,
      province,
      city,
      district,
      detail_address: detail,
      full_address,
      is_default: is_default || false
    });

    success(res, address, '更新成功');
  } catch (err) {
    logger.error('Update address error:', err);
    error(res, '更新失败', 500);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await UserAddress.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!address) {
      return error(res, '地址不存在', 404);
    }

    await address.destroy();
    success(res, null, '删除成功');
  } catch (err) {
    logger.error('Delete address error:', err);
    error(res, '删除失败', 500);
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await UserAddress.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!address) {
      return error(res, '地址不存在', 404);
    }

    await UserAddress.update(
      { is_default: false },
      { where: { user_id: req.user.id } }
    );

    await address.update({ is_default: true });
    success(res, address, '设置成功');
  } catch (err) {
    logger.error('Set default address error:', err);
    error(res, '设置失败', 500);
  }
};

const adminGetUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, member_level } = req.query;
    const { Op } = require('sequelize');
    
    let where = {};
    if (keyword) {
      where[Op.or] = [
        { phone: { [Op.like]: `%${keyword}%` } },
        { nickname: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (member_level !== undefined && member_level !== '') {
      where.member_level = member_level;
    }

    const users = await User.findAndCountAll({
      where,
      attributes: ['id', 'nickname', 'phone', 'member_level', 'points', 'balance', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });

    const userData = users.rows.map(user => ({
      ...user.toJSON(),
      is_active: user.status === 1
    }));

    success(res, {
      data: userData,
      total: users.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    logger.error('Admin get users error:', err);
    error(res, '获取用户列表失败', 500);
  }
};

const adminGetUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return error(res, '无效的用户ID', 400);
    }
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'nickname', 'phone', 'email', 'real_name', 'member_level', 'member_expire_time', 'points', 'balance', 'status', 'created_at', 'last_login_time']
    });

    if (!user) {
      return error(res, '用户不存在', 404);
    }

    success(res, user);
  } catch (err) {
    logger.error('Admin get user by id error:', err);
    error(res, '获取用户信息失败', 500);
  }
};

const adminUpdateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);
    
    if (isNaN(userId)) {
      return error(res, '无效的用户ID', 400);
    }
    
    const { status } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    await user.update({ status });
    success(res, null, '用户状态已更新');
  } catch (err) {
    logger.error('Admin update user status error:', err);
    error(res, '更新用户状态失败', 500);
  }
};

const adminGetUserStats = async (req, res) => {
  try {
    const [total, active, disabled, vip] = await Promise.all([
      User.count(),
      User.count({ where: { status: 1 } }),
      User.count({ where: { status: 0 } }),
      User.count({ where: { member_level: { [Op.gt]: 0 } } })
    ]);
    success(res, { total, active, disabled, vip });
  } catch (err) {
    logger.error('Admin get user stats error:', err);
    error(res, '获取用户统计失败', 500);
  }
};

// 充值接口（模拟）
const recharge = async (req, res) => {
  try {
    const { amount, pay_method, pay_password } = req.body;
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return error(res, '请输入有效的充值金额', 400);
    }

    const rechargeAmount = parseFloat(parseFloat(amount).toFixed(2));
    if (rechargeAmount < 1) {
      return error(res, '最低充值金额为 ¥1.00', 400);
    }
    if (rechargeAmount > 50000) {
      return error(res, '单次充值金额不能超过 ¥50000', 400);
    }

    // 支付密码验证（必须提供密码）
    const correctPassword = '123456';
    if (!pay_password || pay_password !== correctPassword) {
      return error(res, '支付密码错误', 400);
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    const oldBalance = parseFloat(user.balance) || 0;
    const newBalance = parseFloat((oldBalance + rechargeAmount).toFixed(2));

    await user.update({ balance: newBalance });

    const transactionId = `RCH${Date.now()}${Math.random().toString(36).slice(-6).toUpperCase()}`;

    success(res, {
      transaction_id: transactionId,
      recharge_amount: rechargeAmount,
      old_balance: oldBalance,
      new_balance: newBalance,
      pay_method: pay_method || 'wechat',
      recharge_time: new Date()
    }, '充值成功');
  } catch (err) {
    logger.error('Recharge error:', err);
    error(res, '充值失败', 500);
  }
};

// 获取余额流水（简单实现）
const getBalanceRecords = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'balance']
    });
    if (!user) {
      return error(res, '用户不存在', 404);
    }
    // 简单返回当前余额信息
    success(res, {
      balance: user.balance,
      records: []
    });
  } catch (err) {
    logger.error('Get balance records error:', err);
    error(res, '获取余额记录失败', 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  resetPassword,
  sendResetCode,
  forgotPassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  recharge,
  getBalanceRecords,
  adminGetUsers,
  adminGetUserById,
  adminUpdateUserStatus,
  adminGetUserStats
};
