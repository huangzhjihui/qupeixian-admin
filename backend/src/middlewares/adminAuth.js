const { verifyToken } = require('../config/jwt');
const { Admin } = require('../models');
const { ADMIN_ROLE } = require('../config/constants');
const logger = require('../config/logger');

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.adminId) {
      return res.status(401).json({
        success: false,
        message: '无效或过期的令牌'
      });
    }

    const admin = await Admin.findByPk(decoded.adminId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '管理员不存在'
      });
    }

    if (admin.status !== 1) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    logger.error('Admin auth middleware error:', err);
    res.status(401).json({
      success: false,
      message: '认证失败，请重新登录'
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: '未登录'
      });
    }

    if (req.admin.role === ADMIN_ROLE.SUPER_ADMIN) {
      return next();
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    next();
  };
};

module.exports = { adminAuth, requireRole };
