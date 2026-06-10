const { Coupon, UserCoupon } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

const adminGetCoupons = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status } = req.query;
    
    let where = {};
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }
    if (status !== undefined && status !== '') {
      where.is_active = status;
    }

    const coupons = await Coupon.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });

    success(res, {
      data: coupons.rows,
      total: coupons.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    console.error('Admin get coupons error:', err);
    error(res, '获取优惠券列表失败', 500);
  }
};

const adminCreateCoupon = async (req, res) => {
  try {
    const { name, description, discount_amount, min_amount, total_count, start_time, end_time, is_active = 1 } = req.body;

    const coupon = await Coupon.create({
      name,
      description,
      type: 1,
      discount_value: discount_amount,
      min_amount,
      total_count,
      used_count: 0,
      start_time,
      end_time,
      is_active
    });

    success(res, coupon, '优惠券创建成功');
  } catch (err) {
    console.error('Admin create coupon error:', err);
    error(res, '创建优惠券失败', 500);
  }
};

const adminUpdateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, discount_amount, min_amount, total_count, start_time, end_time, is_active } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return error(res, '优惠券不存在', 404);
    }

    const updateData = {
      name,
      description,
      discount_value: discount_amount,
      min_amount,
      total_count,
      start_time,
      end_time
    };
    
    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    await coupon.update(updateData);

    success(res, coupon, '优惠券更新成功');
  } catch (err) {
    console.error('Admin update coupon error:', err);
    error(res, '更新优惠券失败', 500);
  }
};

const adminUpdateCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return error(res, '优惠券不存在', 404);
    }

    await coupon.update({ status });
    success(res, null, '优惠券状态已更新');
  } catch (err) {
    console.error('Admin update coupon status error:', err);
    error(res, '更新优惠券状态失败', 500);
  }
};

const adminDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return error(res, '优惠券不存在', 404);
    }

    await coupon.destroy();
    success(res, null, '优惠券已删除');
  } catch (err) {
    console.error('Admin delete coupon error:', err);
    error(res, '删除优惠券失败', 500);
  }
};

const adminIssueCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { issue_count: rawIssueCount, target_type, user_ids } = req.body;
    const issue_count = parseInt(rawIssueCount, 10);

    if (!issue_count || issue_count <= 0) {
      return error(res, '发放数量必须大于0', 400);
    }

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return error(res, '优惠券不存在', 404);
    }

    if (!coupon.is_active) {
      return error(res, '优惠券未启用', 400);
    }

    const issuedCount = await UserCoupon.count({ where: { coupon_id: id } });
    const availableCount = coupon.total_count - issuedCount;
    
    if (issue_count > availableCount) {
      return error(res, `库存不足，剩余${availableCount}张`, 400);
    }

    const { User } = require('../models');
    const users = [];
    if (target_type === 'specific' && Array.isArray(user_ids) && user_ids.length > 0) {
      users.push(...user_ids.slice(0, issue_count));
    } else if (target_type === '全部用户' || target_type === 'all') {
      const allUsers = await User.findAll({ attributes: ['id'] });
      users.push(...allUsers.map(u => u.id).slice(0, issue_count));
    } else if (target_type === '新用户' || target_type === 'new') {
      const newUsers = await User.findAll({ 
        attributes: ['id'],
        where: { created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      });
      users.push(...newUsers.map(u => u.id).slice(0, issue_count));
    } else if (target_type === 'VIP用户' || target_type === 'vip') {
      const vipUsers = await User.findAll({ 
        attributes: ['id'],
        where: { is_vip: 1 }
      });
      users.push(...vipUsers.map(u => u.id).slice(0, issue_count));
    }

    if (users.length === 0) {
      return error(res, '未找到符合条件的用户', 400);
    }

    const userCoupons = [];
    for (const userId of users) {
      userCoupons.push({
        user_id: userId,
        coupon_id: id,
        status: 0,
        receive_time: new Date(),
        expire_time: coupon.end_time
      });
    }

    await UserCoupon.bulkCreate(userCoupons);

    await coupon.update({ used_count: issuedCount + users.length });

    success(res, { issued: users.length }, '优惠券发放成功');
  } catch (err) {
    console.error('Admin issue coupon error:', err);
    error(res, '发放优惠券失败', 500);
  }
};

const getUserCoupons = async (req, res) => {
  try {
    const userCoupons = await UserCoupon.findAll({
      where: {
        user_id: req.user.id
      },
      include: [{
        model: Coupon,
        attributes: ['name', 'discount_value', 'min_amount', 'start_time', 'end_time']
      }],
      order: [['created_at', 'DESC']]
    });

    const coupons = userCoupons.map(uc => ({
      id: uc.id,
      coupon_id: uc.coupon_id,
      name: uc.Coupon?.name || '',
      discount_value: uc.Coupon?.discount_value || 0,
      min_amount: uc.Coupon?.min_amount || 0,
      status: uc.status,
      receive_time: uc.receive_time,
      expire_time: uc.expire_time,
      start_time: uc.Coupon?.start_time,
      end_time: uc.Coupon?.end_time
    }));

    success(res, coupons);
  } catch (err) {
    console.error('Get user coupons error:', err);
    error(res, '获取优惠券失败', 500);
  }
};

module.exports = {
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminUpdateCouponStatus,
  adminDeleteCoupon,
  adminIssueCoupon,
  getUserCoupons
};
