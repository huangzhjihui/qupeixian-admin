const { Order, OrderItem, Product, UserAddress, AfterSale, Review, UserCoupon, Coupon, User, OrderLogistics } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const logger = require('../config/logger');
const sequelize = require('../config/database');

// 物流状态描述映射
const LOGISTICS_STATUS_MAP = {
  0: '订单已提交，等待付款',
  1: '付款成功，商家正在备货',
  2: '商品已发出，正在配送中',
  3: '商品已送达，等待确认收货',
  4: '已确认收货，订单完成',
  5: '售后处理中',
  6: '订单已关闭'
};

// 创建物流跟踪记录的辅助函数
const addLogisticsEntry = async (order_id, status, description, operator = '系统', transaction = null) => {
  const opts = transaction ? { transaction } : {};
  return OrderLogistics.create({
    order_id,
    status,
    description: description || LOGISTICS_STATUS_MAP[status] || '订单状态更新',
    operator
  }, opts);
};

const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      address_id,
      items,
      remark,
      user_coupon_id,
      delivery_method,
      invoice_type,
      invoice_title,
      invoice_tax_no
    } = req.body;

    if (!items || !items.length) {
      await t.rollback();
      return error(res, '购物车不能为空', 400);
    }

    const address = await UserAddress.findOne({ where: { id: address_id, user_id: req.user.id } });
    if (!address) {
      await t.rollback();
      return error(res, '地址不存在', 400);
    }

    let totalAmount = 0;
    let totalItems = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product || product.status === 0) {
        await t.rollback();
        return error(res, '商品不存在或已下架', 400);
      }
      if (product.stock < item.quantity) {
        await t.rollback();
        return error(res, `\u201c${product.name}\u201d库存不足`, 400);
      }
      const unitPrice = parseFloat(product.member_price) || parseFloat(product.price);
      totalAmount += Math.round(unitPrice * item.quantity * 100) / 100;
      totalItems += item.quantity;
    }

    // 运费计算：满99免运费，否则¥5
    const freight = totalAmount >= 99 ? 0 : 5;

    // 优惠券验证
    let discountAmount = 0;
    let userCoupon = null;
    if (user_coupon_id) {
      userCoupon = await UserCoupon.findOne({
        where: {
          id: user_coupon_id,
          user_id: req.user.id,
          status: 0
        },
        include: [{ model: Coupon, attributes: ['discount_value', 'min_amount', 'end_time'] }],
        transaction: t
      });

      if (!userCoupon) {
        await t.rollback();
        return error(res, '优惠券不存在或已使用', 400);
      }

      if (new Date(userCoupon.expire_time) < new Date()) {
        await t.rollback();
        return error(res, '优惠券已过期', 400);
      }

      if (totalAmount < parseFloat(userCoupon.Coupon.min_amount)) {
        await t.rollback();
        return error(res, `未满足优惠券使用门槛（满${userCoupon.Coupon.min_amount}元）`, 400);
      }

      discountAmount = parseFloat(userCoupon.Coupon.discount_value);
    }

    // 实付金额 = 商品总额 + 运费 - 优惠
    totalAmount = Math.round(totalAmount * 100) / 100;
    const payAmount = Math.max(0, Math.round((totalAmount + freight - discountAmount) * 100) / 100);

    const orderNo = `QPX${Date.now()}${Math.random().toString(36).slice(-6).toUpperCase()}`;

    const order = await Order.create({
      order_no: orderNo,
      user_id: req.user.id,
      user_name: req.user.nickname,
      address_id,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      freight,
      pay_amount: payAmount,
      total_items: totalItems,
      coupon_id: userCoupon ? userCoupon.coupon_id : null,
      delivery_method: delivery_method || 0,
      invoice_type: invoice_type || null,
      invoice_title: invoice_title || null,
      invoice_tax_no: invoice_tax_no || null,
      remark,
      status: 0
    }, { transaction: t });

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t, lock: t.LOCK.UPDATE });
      const unitPrice = parseFloat(product.member_price) || parseFloat(product.price);
      const itemTotal = Math.round(unitPrice * item.quantity * 100) / 100;
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        product_name: product.name,
        product_image: product.main_image || 'https://picsum.photos/100/100',
        spec_name: item.spec_name || '默认规格',
        quantity: item.quantity,
        price: unitPrice,
        total_price: itemTotal
      }, { transaction: t });

      await product.update({ stock: product.stock - item.quantity }, { transaction: t });
    }

    // 标记优惠券已使用
    if (userCoupon) {
      await userCoupon.update({ status: 1, use_time: new Date(), order_id: order.id }, { transaction: t });
    }

    // 创建初始物流跟踪记录
    await addLogisticsEntry(order.id, 0, '订单已提交，等待付款', '系统', t);

    await t.commit();
    success(res, order, '订单创建成功');
  } catch (err) {
    await t.rollback();
    logger.error('Create order error:', err);
    error(res, '创建订单失败', 500);
  }
};

const getOrders = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;

    let where = { user_id: req.user.id };
    if (status !== undefined && status !== '') {
      where.status = parseInt(status, 10);
    }

    const orders = await Order.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });

    // 自动取消超时未支付的订单，并返回剩余支付时间
    const TIMEOUT_MS = 30 * 60 * 1000;
    const processedOrders = await Promise.all(orders.rows.map(async (order) => {
      const plain = order.toJSON();
      if (order.status === 0) {
        const createdAt = new Date(order.created_at).getTime();
        const elapsed = Date.now() - createdAt;
        if (elapsed > TIMEOUT_MS) {
          await order.update({
            status: 6,
            cancel_reason: '超时未支付，系统自动取消',
            cancel_time: new Date()
          });
          plain.status = 6;
          plain.cancel_reason = '超时未支付，系统自动取消';
          plain.remain_seconds = 0;
        } else {
          plain.remain_seconds = Math.max(0, Math.floor((TIMEOUT_MS - elapsed) / 1000));
        }
      }
      return plain;
    }));

    success(res, {
      data: processedOrders,
      total: orders.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    logger.error('Get orders error:', err);
    error(res, '获取订单失败', 500);
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return error(res, '无效的订单ID', 400);
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'product_id', 'product_name', 'product_image', 'spec_name', 'quantity', 'price', 'total_price']
        },
        {
          model: UserAddress,
          as: 'address',
          attributes: ['real_name', 'phone', 'province', 'city', 'district', 'detail_address']
        }
      ]
    });

    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    success(res, order);
  } catch (err) {
    logger.error('Get order detail error:', err);
    error(res, '获取订单详情失败', 500);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return error(res, '无效的订单ID', 400);
    }

    const order = await Order.findByPk(orderId);
    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    if (order.status !== 0) {
      return error(res, '订单状态不允许取消', 400);
    }

    await order.update({ status: 6 });

    // 添加物流跟踪记录
    await addLogisticsEntry(order.id, 6, '订单已取消', '用户');

    const items = await OrderItem.findAll({ where: { order_id: id } });
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (product) {
        await product.update({ stock: product.stock + item.quantity });
      }
    }

    success(res, null, '订单已取消');
  } catch (err) {
    logger.error('Cancel order error:', err);
    error(res, '取消订单失败', 500);
  }
};

const confirmReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    if (order.status !== 3) {
      return error(res, '订单状态不允许确认收货', 400);
    }

    await order.update({ status: 4 });

    // 添加物流跟踪记录
    await addLogisticsEntry(order.id, 4, '已确认收货，订单完成', '系统');

    success(res, null, '已确认收货');
  } catch (err) {
    logger.error('Confirm receipt error:', err);
    error(res, '确认收货失败', 500);
  }
};

// 订单支付超时时间（毫秒）- 30分钟
const ORDER_PAY_TIMEOUT_MS = 30 * 60 * 1000;

// 检查订单是否超时未支付，若超时则自动取消
const checkAndCancelExpiredOrder = async (order) => {
  if (order.status !== 0) return false;
  const createdAt = new Date(order.created_at).getTime();
  const now = Date.now();
  if (now - createdAt > ORDER_PAY_TIMEOUT_MS) {
    await order.update({
      status: 6,
      cancel_reason: '超时未支付，系统自动取消',
      cancel_time: new Date()
    });
    return true;
  }
  return false;
};

const getPaymentInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return error(res, '无效的订单ID', 400);
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'product_id', 'product_name', 'product_image', 'quantity', 'price', 'total_price']
        }
      ]
    });

    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    // 检查订单是否已超时自动取消
    const expired = await checkAndCancelExpiredOrder(order);
    if (expired) {
      return error(res, '订单已超时自动取消，请重新下单', 400);
    }

    if (order.status !== 0) {
      return error(res, '订单状态不允许支付', 400);
    }

    // 计算剩余支付时间（秒）
    const createdAt = new Date(order.created_at).getTime();
    const elapsed = Date.now() - createdAt;
    const remainSeconds = Math.max(0, Math.floor((ORDER_PAY_TIMEOUT_MS - elapsed) / 1000));

    success(res, {
      id: order.id,
      order_no: order.order_no,
      pay_amount: order.pay_amount,
      total_amount: order.total_amount,
      discount_amount: order.discount_amount,
      freight: order.freight,
      items: order.items,
      created_at: order.created_at,
      remain_seconds: remainSeconds,
      timeout_minutes: 30
    });
  } catch (err) {
    logger.error('Get payment info error:', err);
    error(res, '获取支付信息失败', 500);
  }
};

const payOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { pay_method, pay_password } = req.body;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return error(res, '无效的订单ID', 400);
    }

    const order = await Order.findByPk(orderId);
    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    // 检查订单是否已超时自动取消
    const expired = await checkAndCancelExpiredOrder(order);
    if (expired) {
      return error(res, '订单已超时自动取消，请重新下单', 400);
    }

    if (order.status !== 0) {
      return error(res, '订单状态不允许支付', 400);
    }

    // 支付密码验证（必须提供密码）
    const correctPassword = '123456';
    if (!pay_password || pay_password !== correctPassword) {
      return error(res, '支付密码错误', 400);
    }

    // 模拟支付处理
    const transactionId = `PAY${Date.now()}${Math.random().toString(36).slice(-6).toUpperCase()}`;
    const payTime = new Date();

    await order.update({
      status: 1, // 待备货
      pay_method: pay_method || 'wechat',
      pay_time: payTime,
      transaction_id: transactionId
    });

    // 添加物流跟踪记录
    await addLogisticsEntry(order.id, 1, '付款成功，商家正在备货', '系统');

    success(res, {
      id: order.id,
      order_no: order.order_no,
      pay_amount: order.pay_amount,
      pay_method: pay_method || 'wechat',
      pay_time: payTime.toISOString(),
      transaction_id: transactionId
    }, '支付成功');
  } catch (err) {
    logger.error('Pay order error:', err);
    error(res, '支付失败', 500);
  }
};

const createAfterSale = async (req, res) => {
  try {
    const { order_id, order_item_id, type, reason, images } = req.body;

    const order = await Order.findByPk(order_id);
    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    if (order.status !== 4) {
      return error(res, '订单状态不允许申请售后', 400);
    }

    const afterSale = await AfterSale.create({
      order_id,
      order_item_id,
      user_id: req.user.id,
      type,
      reason,
      images: JSON.stringify(images || []),
      status: 0
    });

    success(res, afterSale, '售后申请已提交');
  } catch (err) {
    logger.error('Create after sale error:', err);
    error(res, '提交售后申请失败', 500);
  }
};

const getAfterSales = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const afterSales = await AfterSale.findAndCountAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });

    success(res, {
      data: afterSales.rows,
      total: afterSales.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    logger.error('Get after sales error:', err);
    error(res, '获取售后记录失败', 500);
  }
};

const createReview = async (req, res) => {
  try {
    const { order_item_id, rating, delivery_rating, content, images, is_anonymous } = req.body;

    const orderItem = await OrderItem.findByPk(order_item_id);
    if (!orderItem) {
      return error(res, '订单商品不存在', 404);
    }

    const order = await Order.findByPk(orderItem.order_id);
    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    if (order.status !== 4) {
      return error(res, '订单未完成，无法评价', 400);
    }

    const existingReview = await Review.findOne({ where: { order_item_id } });
    if (existingReview) {
      return error(res, '该商品已评价', 400);
    }

    const review = await Review.create({
      order_id: orderItem.order_id,
      order_item_id,
      user_id: req.user.id,
      product_id: orderItem.product_id,
      rating,
      delivery_rating: delivery_rating || 5,
      content,
      images: JSON.stringify(images || []),
      is_anonymous: is_anonymous || 0
    });

    // 更新商品的评价数量和平均评分
    try {
      const product = await Product.findByPk(orderItem.product_id);
      if (product) {
        const allReviews = await Review.findAll({
          where: { product_id: orderItem.product_id },
          attributes: ['rating']
        });
        const count = allReviews.length;
        const avgRating = count > 0
          ? parseFloat((allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1))
          : 5.0;
        await product.update({
          review_count: count,
          rating: avgRating
        });
      }
    } catch (updateErr) {
      logger.warn('更新商品评价统计失败:', updateErr.message);
    }

    success(res, review, '评价成功');
  } catch (err) {
    logger.error('Create review error:', err);
    error(res, '评价失败', 500);
  }
};

const adminGetOrders = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, start_date, end_date } = req.query;

    let where = {};
    if (keyword) {
      where.order_no = { [Op.like]: `%${keyword}%` };
    }
    if (status !== undefined && status !== '') {
      where.status = status;
    }
    if (start_date) {
      where.created_at = { [Op.gte]: new Date(start_date) };
    }
    if (end_date) {
      const end = new Date(end_date);
      end.setDate(end.getDate() + 1);
      where.created_at = { ...where.created_at, [Op.lte]: end };
    }

    const orders = await Order.findAndCountAll({
      where,
      include: [
        {
          model: UserAddress,
          as: 'address',
          attributes: ['real_name', 'phone', 'province', 'city', 'district', 'detail_address']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone', 'avatar']
        },
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'product_id', 'product_name', 'product_image', 'quantity', 'price']
        }
      ],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });

    const result = orders.rows.map(order => {
      const items = order.items || [];
      const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      return {
        id: order.id,
        order_no: order.order_no,
        user_id: order.user_id,
        user_name: order.user ? order.user.nickname : '',
        user_phone: order.user ? order.user.phone : '',
        user_avatar: order.user ? order.user.avatar : null,
        total_amount: order.total_amount,
        pay_amount: order.pay_amount,
        status: order.status,
        total_items: totalItems,
        created_at: order.created_at,
        items,
        address: order.address ? {
          real_name: order.address.real_name,
          phone: order.address.phone,
          full_address: `${order.address.province}${order.address.city}${order.address.district}${order.address.detail_address}`
        } : null
      };
    });

    success(res, {
      data: result,
      total: orders.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    logger.error('Admin get orders error:', err);
    error(res, '获取订单列表失败', 500);
  }
};

const adminGetOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'product_id', 'product_name', 'product_image', 'spec_name', 'quantity', 'price', 'total_price']
        },
        {
          model: UserAddress,
          as: 'address',
          attributes: ['real_name', 'phone', 'province', 'city', 'district', 'detail_address']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'phone', 'avatar', 'member_level']
        }
      ]
    });

    if (!order) {
      return error(res, '订单不存在', 404);
    }

    const items = order.items || [];
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    success(res, {
      id: order.id,
      order_no: order.order_no,
      user_id: order.user_id,
      user_name: order.user ? order.user.nickname : '',
      user_phone: order.user ? order.user.phone : '',
      user_avatar: order.user ? order.user.avatar : null,
      member_level: order.user ? order.user.member_level : 0,
      total_amount: order.total_amount,
      pay_amount: order.pay_amount,
      discount_amount: order.discount_amount,
      freight: order.freight,
      status: order.status,
      total_items: totalItems,
      remark: order.delivery_remark || order.admin_remark || '',
      delivery_method: order.delivery_method,
      invoice_type: order.invoice_type,
      invoice_title: order.invoice_title,
      invoice_tax_no: order.invoice_tax_no,
      created_at: order.created_at,
      items: order.items,
      address: order.address ? {
        real_name: order.address.real_name,
        phone: order.address.phone,
        full_address: `${order.address.province}${order.address.city}${order.address.district}${order.address.detail_address}`
      } : null
    });
  } catch (err) {
    logger.error('Admin get order detail error:', err);
    error(res, '获取订单详情失败', 500);
  }
};

const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined || status === null) {
      return error(res, '请提供订单状态', 400);
    }

    // 合法状态范围校验
    if (![0, 1, 2, 3, 4, 5, 6].includes(Number(status))) {
      return error(res, '无效的订单状态', 400);
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return error(res, '订单不存在', 404);
    }

    // 状态流转合法性校验
    const allowedTransitions = {
      0: [1, 6],       // 待付款 → 待备货/已关闭
      1: [2, 6],       // 待备货 → 配送中/已关闭
      2: [3, 5],       // 配送中 → 待收货/售后中
      3: [4, 5],       // 待收货 → 已完成/售后中
      4: [5],          // 已完成 → 售后中
      5: [4],          // 售后中 → 已完成
      6: []            // 已关闭 → 不允许变更
    };

    const currentStatus = order.status;
    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(Number(status))) {
      const statusNames = { 0: '待付款', 1: '待备货', 2: '配送中', 3: '待收货', 4: '已完成', 5: '售后中', 6: '已关闭' };
      return error(res, `不允许从\u201c${statusNames[currentStatus]}\u201d变更为\u201c${statusNames[status]}\u201d`, 400);
    }

    // 获取管理员可选的物流描述
    const { description, location } = req.body;

    await order.update({ status });

    // 添加物流跟踪记录
    const logisticsDesc = description || LOGISTICS_STATUS_MAP[Number(status)];
    const operatorName = req.admin ? (req.admin.nickname || req.admin.username || '管理员') : '管理员';
    await addLogisticsEntry(order.id, Number(status), logisticsDesc, operatorName);

    success(res, null, '订单状态已更新');
  } catch (err) {
    logger.error('Admin update order status error:', err);
    error(res, '更新订单状态失败', 500);
  }
};

const adminExportOrders = async (req, res) => {
  try {
    const { keyword, status, start_date, end_date } = req.query;

    let where = { deleted_at: null };
    if (keyword) {
      where.order_no = { [Op.like]: `%${keyword}%` };
    }
    if (status !== undefined && status !== '' && status !== '-1') {
      where.status = status;
    }
    if (start_date) {
      where.created_at = { [Op.gte]: new Date(start_date) };
    }
    if (end_date) {
      const end = new Date(end_date);
      end.setDate(end.getDate() + 1);
      where.created_at = { ...where.created_at, [Op.lte]: end };
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['product_name', 'quantity', 'price', 'total_price']
        },
        {
          model: UserAddress,
          as: 'address',
          attributes: ['real_name', 'phone', 'province', 'city', 'district', 'detail_address']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const statusMap = {
      0: '待付款',
      1: '待备货',
      2: '配送中',
      3: '待收货',
      4: '已完成',
      5: '售后中',
      6: '已关闭'
    };

    const excelData = [];

    if (orders.length === 0) {
      excelData.push({
        '订单号': '',
        '下单时间': '',
        '订单状态': '',
        '用户姓名': '',
        '联系电话': '',
        '收货地址': '',
        '商品名称': '',
        '商品数量': '',
        '商品单价': '',
        '商品小计': '',
        '订单总额': '',
        '支付金额': ''
      });
    } else {
      orders.forEach(order => {
        const address = order.address;
        const fullAddress = address ? `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail_address || ''}` : '';

        order.items.forEach((item, index) => {
          excelData.push({
            '订单号': index === 0 ? order.order_no : '',
            '下单时间': index === 0 ? order.created_at ? order.created_at.toLocaleString('zh-CN') : '' : '',
            '订单状态': index === 0 ? statusMap[order.status] || '未知' : '',
            '用户姓名': index === 0 ? order.user_name : '',
            '联系电话': index === 0 ? (address ? address.phone : '') : '',
            '收货地址': index === 0 ? fullAddress : '',
            '商品名称': item.product_name,
            '商品数量': item.quantity,
            '商品单价': `\u00a5${item.price}`,
            '商品小计': `\u00a5${item.total_price}`,
            '订单总额': index === 0 ? `\u00a5${order.total_amount}` : '',
            '支付金额': index === 0 ? `\u00a5${order.pay_amount || order.total_amount}` : ''
          });
        });
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '订单列表');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `订单数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    logger.error('Admin export orders error:', err);

    try {
      const excelData = [{
        '订单号': '导出失败',
        '下单时间': err.message || '未知错误',
        '订单状态': '',
        '用户姓名': '',
        '联系电话': '',
        '收货地址': '',
        '商品名称': '',
        '商品数量': '',
        '商品单价': '',
        '商品小计': '',
        '订单总额': '',
        '支付金额': ''
      }];

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '订单列表');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      const filename = `订单数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (e) {
      res.status(500).json({ success: false, message: '导出订单失败' });
    }
  }
};

const adminGetOrderStats = async (req, res) => {
  try {
    const [pending_payment, preparing, delivering, completed, aftersale] = await Promise.all([
      Order.count({ where: { status: 0 } }),
      Order.count({ where: { status: 1 } }),
      Order.count({ where: { status: 2 } }),
      Order.count({ where: { status: 4 } }),
      Order.count({ where: { status: 5 } })
    ]);
    success(res, { pending_payment, preparing, delivering, completed, aftersale });
  } catch (err) {
    logger.error('Admin get order stats error:', err);
    error(res, '获取订单统计失败', 500);
  }
};

const getUserReviews = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const reviews = await Review.findAndCountAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'main_image', 'price']
        }
      ],
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });

    const result = reviews.rows.map(review => {
      let images = [];
      try {
        if (Array.isArray(review.images)) {
          images = review.images;
        } else if (typeof review.images === 'string' && review.images) {
          images = JSON.parse(review.images);
        }
      } catch (e) {
        images = [];
      }
      return {
        id: review.id,
        rating: review.rating,
        delivery_rating: review.delivery_rating || 5,
        content: review.content,
        images,
        is_anonymous: review.is_anonymous,
        reply: review.reply,
        reply_time: review.reply_time,
        like_count: review.like_count,
        created_at: review.created_at,
        product: review.Product || null
      };
    });

    success(res, {
      data: result,
      total: reviews.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    logger.error('Get user reviews error:', err);
    error(res, '获取评价列表失败', 500);
  }
};

const getPendingReviews = async (req, res) => {
  try {
    // 获取已完成的订单（status = 4）
    const completedOrders = await Order.findAll({
      where: {
        user_id: req.user.id,
        status: 4
      },
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['id', 'product_id', 'product_name', 'product_image', 'quantity', 'price'],
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'main_image', 'price']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // 过滤出未评价的订单项
    const pendingItems = [];
    for (const order of completedOrders) {
      for (const item of (order.items || [])) {
        const existingReview = await Review.findOne({
          where: { order_item_id: item.id }
        });
        if (!existingReview) {
          pendingItems.push({
            order_id: order.id,
            order_no: order.order_no,
            order_item_id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            quantity: item.quantity,
            price: item.price,
            product: item.Product || null
          });
        }
      }
    }

    success(res, pendingItems);
  } catch (err) {
    logger.error('Get pending reviews error:', err);
    error(res, '获取待评价列表失败', 500);
  }
};

// 用户端获取订单物流跟踪信息
const getOrderLogistics = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return error(res, '无效的订单ID', 400);
    }

    const order = await Order.findByPk(orderId);
    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    const logistics = await OrderLogistics.findAll({
      where: { order_id: orderId },
      order: [['created_at', 'ASC']]
    });

    // 构建物流时间线：将当前订单状态也作为一条记录（如果最后一条状态与当前不一致）
    const records = logistics.map(l => ({
      id: l.id,
      status: l.status,
      description: l.description,
      location: l.location,
      operator: l.operator,
      time: l.created_at
    }));

    // 如果物流记录为空（老订单），根据当前状态生成基础时间线
    if (records.length === 0 && order.status > 0) {
      const baseTimeline = [];
      baseTimeline.push({ status: 0, description: '订单已提交', operator: '系统', time: order.created_at });
      if (order.status >= 1 && order.pay_time) {
        baseTimeline.push({ status: 1, description: '付款成功，商家正在备货', operator: '系统', time: order.pay_time });
      }
      if (order.status >= 2 && order.ship_time) {
        baseTimeline.push({ status: 2, description: '商品已发出，正在配送中', operator: '系统', time: order.ship_time });
      }
      if (order.status >= 3 && order.receive_time) {
        baseTimeline.push({ status: 3, description: '商品已送达，等待确认收货', operator: '系统', time: order.receive_time });
      }
      if (order.status >= 4 && order.complete_time) {
        baseTimeline.push({ status: 4, description: '已确认收货，订单完成', operator: '系统', time: order.complete_time });
      }
      return success(res, { current_status: order.status, records: baseTimeline });
    }

    success(res, {
      current_status: order.status,
      records
    });
  } catch (err) {
    logger.error('Get order logistics error:', err);
    error(res, '获取物流信息失败', 500);
  }
};

// 管理端添加物流跟踪记录
const adminAddLogisticsEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, location } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return error(res, '订单不存在', 404);
    }

    const operatorName = req.admin ? (req.admin.nickname || req.admin.username || '管理员') : '管理员';
    const entry = await addLogisticsEntry(
      order.id,
      order.status,
      description || '物流状态更新',
      operatorName
    );

    if (location) {
      await entry.update({ location });
    }

    success(res, entry, '物流信息已更新');
  } catch (err) {
    logger.error('Admin add logistics error:', err);
    error(res, '更新物流信息失败', 500);
  }
};

// 门店坐标（默认杭州市西湖区）
const STORE_LOCATION = {
  name: '趣配鲜配送中心',
  lat: 30.2741,
  lng: 120.1551,
  address: '杭州市西湖区文三路268号'
};

// 基于订单ID生成确定性的伪随机数
const seededRandom = (seed) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

// 生成模拟配送路线坐标点
const generateRoute = (storeLat, storeLng, destLat, destLng, seed) => {
  const rng = seededRandom(seed);
  const points = [];
  const numWaypoints = 5 + Math.floor(rng() * 4); // 5-8个中间点

  for (let i = 0; i <= numWaypoints + 1; i++) {
    const t = i / (numWaypoints + 1);
    // 基础线性插值 + 随机偏移（模拟实际道路弯曲）
    const baseLat = storeLat + (destLat - storeLat) * t;
    const baseLng = storeLng + (destLng - storeLng) * t;

    // 偏移量：中间点偏移大，起终点不偏移
    const offsetFactor = Math.sin(t * Math.PI) * 0.008;
    const latOffset = (rng() - 0.5) * offsetFactor;
    const lngOffset = (rng() - 0.5) * offsetFactor;

    points.push([
      parseFloat((baseLat + latOffset).toFixed(6)),
      parseFloat((baseLng + lngOffset).toFixed(6))
    ]);
  }

  // 确保起点和终点精确
  points[0] = [storeLat, storeLng];
  points[points.length - 1] = [destLat, destLng];

  return points;
};

// 基于订单状态计算配送员当前位置（在路线上的比例）
const getDriverPosition = (route, orderStatus, rng) => {
  // 状态对应的进度比例
  const progressMap = {
    0: 0,     // 待付款：未出发
    1: 0,     // 待备货：在仓库
    2: 0.3 + rng() * 0.4,  // 配送中：30%-70%之间
    3: 1,     // 待收货：已到达
    4: 1,     // 已完成：已到达
    5: 1,
    6: 0
  };

  const progress = progressMap[orderStatus] ?? 0;
  if (progress === 0) return route[0];
  if (progress >= 1) return route[route.length - 1];

  // 根据进度比例找到最近的两个点并插值
  const totalPoints = route.length - 1;
  const idx = progress * totalPoints;
  const floor = Math.floor(idx);
  const ceil = Math.min(floor + 1, totalPoints);
  const frac = idx - floor;

  return [
    route[floor][0] + (route[ceil][0] - route[floor][0]) * frac,
    route[floor][1] + (route[ceil][1] - route[floor][1]) * frac
  ];
};

// 获取订单配送路线信息
const getDeliveryRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return error(res, '无效的订单ID', 400);
    }

    const order = await Order.findByPk(orderId, {
      include: [{ model: UserAddress, as: 'address' }]
    });

    if (!order || order.user_id !== req.user.id) {
      return error(res, '订单不存在', 404);
    }

    // 只有配送中和待收货状态才显示路线
    if (order.status < 2 || order.status > 4) {
      return error(res, '该订单状态不支持查看配送路线', 400);
    }

    const address = order.address;
    if (!address) {
      return error(res, '收货地址信息缺失', 400);
    }

    // 使用订单ID作为种子生成确定性坐标
    const rng = seededRandom(orderId * 7 + 13);
    const destLat = 30.25 + rng() * 0.06;   // 30.25 - 30.31
    const destLng = 120.10 + rng() * 0.10;   // 120.10 - 120.20

    const route = generateRoute(
      STORE_LOCATION.lat, STORE_LOCATION.lng,
      destLat, destLng,
      orderId
    );

    const driverPosition = getDriverPosition(route, order.status, seededRandom(orderId * 31 + Date.now() % 100));

    // 计算预估到达时间
    let eta = '';
    if (order.status === 2) {
      const mins = 10 + Math.floor(seededRandom(orderId * 17)() * 30);
      eta = `预计${mins}分钟后送达`;
    } else if (order.status === 3) {
      eta = '已送达';
    } else if (order.status === 4) {
      eta = '订单已完成';
    }

    // 距离计算（简化欧几里得）
    const driverLat = driverPosition[0];
    const driverLng = driverPosition[1];
    const distKm = Math.sqrt(
      Math.pow((driverLat - destLat) * 111, 2) +
      Math.pow((driverLng - destLng) * 111 * Math.cos(destLat * Math.PI / 180), 2)
    ).toFixed(1);

    success(res, {
      store: {
        name: STORE_LOCATION.name,
        lat: STORE_LOCATION.lat,
        lng: STORE_LOCATION.lng,
        address: STORE_LOCATION.address
      },
      destination: {
        name: `${address.real_name}（收货地址）`,
        lat: destLat,
        lng: destLng,
        address: `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail_address || ''}`
      },
      route,
      driver: {
        lat: parseFloat(driverPosition[0].toFixed(6)),
        lng: parseFloat(driverPosition[1].toFixed(6)),
        name: '配送员',
        phone: '138****' + String(1000 + (orderId % 9000)).slice(0, 4)
      },
      eta,
      distance: order.status === 2 ? `${distKm}km` : '已送达',
      status: order.status,
      statusText: LOGISTICS_STATUS_MAP[order.status] || '未知'
    });
  } catch (err) {
    logger.error('Get delivery route error:', err);
    error(res, '获取配送路线失败', 500);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderDetail,
  getOrderLogistics,
  getDeliveryRoute,
  cancelOrder,
  confirmReceipt,
  getPaymentInfo,
  payOrder,
  createAfterSale,
  getAfterSales,
  createReview,
  getUserReviews,
  getPendingReviews,
  adminGetOrders,
  adminGetOrderDetail,
  adminUpdateOrderStatus,
  adminAddLogisticsEntry,
  adminExportOrders,
  adminGetOrderStats
};
