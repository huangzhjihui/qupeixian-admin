const { verifyToken } = require('../config/jwt');
const { User } = require('../models');
const logger = require('../config/logger');

const auth = async (req, res, next) => {
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

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '无效或过期的令牌'
      });
    }

    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '令牌中未包含用户ID'
      });
    }

    const userIdNumber = parseInt(userId, 10);

    if (isNaN(userIdNumber)) {
      return res.status(401).json({
        success: false,
        message: '无效的用户ID'
      });
    }

    const user = await User.findByPk(userIdNumber, {
      attributes: { exclude: ['password_hash', 'phone_encrypted', 'id_card'] },
      paranoid: false
    });

    if (!user) {
      // 尝试通过手机号回退查找（仅用于ID变更场景）
      const userByPhone = decoded.phone ? await User.findOne({
        where: { phone: decoded.phone },
        attributes: { exclude: ['password_hash', 'phone_encrypted', 'id_card'] },
        paranoid: false
      }) : null;

      if (userByPhone && !userByPhone.deleted_at && userByPhone.status === 1 && !userByPhone.is_blacklist) {
        req.user = userByPhone;
        return next();
      }

      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (user.deleted_at) {
      return res.status(401).json({
        success: false,
        message: '账号已被删除'
      });
    }

    if (user.status !== 1 || user.is_blacklist) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: '认证失败，请重新登录'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded) {
        const userId = decoded.id || decoded.userId;
        if (userId) {
          const userIdNumber = parseInt(userId, 10);
          if (!isNaN(userIdNumber)) {
            const user = await User.findByPk(userIdNumber, {
              attributes: { exclude: ['password_hash', 'phone_encrypted', 'id_card'] }
            });

            if (user && user.status === 1 && !user.is_blacklist) {
              req.user = user;
            }
          }
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { auth, optionalAuth };
