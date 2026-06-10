const { ChatMessage, User } = require('../models');
const { success, error } = require('../utils/response');

// 管理员发送消息
const adminSendMessage = async (req, res) => {
  try {
    const { user_id, order_no, content } = req.body;
    const adminId = req.admin.id;

    if (!user_id || !content) {
      return error(res, '用户ID和消息内容不能为空', 400);
    }

    const message = await ChatMessage.create({
      user_id,
      order_no,
      sender_type: 2, // 管理员
      sender_id: adminId,
      content,
      is_read: 0
    });

    success(res, message, '发送成功');
  } catch (err) {
    console.error('Admin send message error:', err);
    error(res, '发送消息失败', 500);
  }
};

// 用户发送消息
const userSendMessage = async (req, res) => {
  try {
    const { order_no, content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return error(res, '消息内容不能为空', 400);
    }

    const message = await ChatMessage.create({
      user_id: userId,
      order_no,
      sender_type: 1, // 用户
      sender_id: userId,
      content,
      is_read: 0
    });

    success(res, message, '发送成功');
  } catch (err) {
    console.error('User send message error:', err);
    error(res, '发送消息失败', 500);
  }
};

// 获取聊天记录（管理员查看与某用户的聊天）
const adminGetChatHistory = async (req, res) => {
  try {
    const { user_id, order_no } = req.query;

    if (!user_id) {
      return error(res, '用户ID不能为空', 400);
    }

    const where = { user_id };
    if (order_no) {
      where.order_no = order_no;
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [['created_at', 'ASC']],
      include: [{
        model: User,
        attributes: ['id', 'nickname', 'phone', 'avatar']
      }]
    });

    success(res, messages);
  } catch (err) {
    console.error('Admin get chat history error:', err);
    error(res, '获取聊天记录失败', 500);
  }
};

// 获取聊天记录（用户查看自己的聊天）
const userGetChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_no } = req.query;

    const where = { user_id: userId };
    if (order_no) {
      where.order_no = order_no;
    }

    const messages = await ChatMessage.findAll({
      where,
      order: [['created_at', 'ASC']]
    });

    // 标记管理员发送的消息为已读
    await ChatMessage.update(
      { is_read: 1 },
      {
        where: {
          user_id: userId,
          sender_type: 2, // 管理员发送的
          is_read: 0
        }
      }
    );

    success(res, messages);
  } catch (err) {
    console.error('User get chat history error:', err);
    error(res, '获取聊天记录失败', 500);
  }
};

// 获取未读消息数量（用户）
const userGetUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await ChatMessage.count({
      where: {
        user_id: userId,
        sender_type: 2, // 管理员发送的
        is_read: 0
      }
    });

    success(res, { count });
  } catch (err) {
    console.error('User get unread count error:', err);
    error(res, '获取未读数失败', 500);
  }
};

// 标记消息为已读（管理员标记用户发送的消息）
const adminMarkAsRead = async (req, res) => {
  try {
    const { user_id } = req.body;

    await ChatMessage.update(
      { is_read: 1 },
      {
        where: {
          user_id,
          sender_type: 1, // 用户发送的
          is_read: 0
        }
      }
    );

    success(res, null, '标记成功');
  } catch (err) {
    console.error('Admin mark as read error:', err);
    error(res, '标记失败', 500);
  }
};

module.exports = {
  adminSendMessage,
  userSendMessage,
  adminGetChatHistory,
  userGetChatHistory,
  userGetUnreadCount,
  adminMarkAsRead
};
