const { Notice } = require('../models');
const { success, error } = require('../utils/response');

const adminGetNotices = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const notices = await Notice.findAndCountAll({
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });

    success(res, {
      data: notices.rows,
      total: notices.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    console.error('Admin get notices error:', err);
    error(res, '获取公告列表失败', 500);
  }
};

const adminCreateNotice = async (req, res) => {
  try {
    const { title, content, type, is_published, is_top } = req.body;

    // 类型映射：字符串 → 数字
    const typeMap = { system: 0, activity: 1, maintenance: 2, update: 3 };
    const noticeType = typeMap[type] !== undefined ? typeMap[type] : 0;

    const notice = await Notice.create({
      title,
      content,
      type: noticeType,
      is_active: is_published !== undefined ? (is_published ? 1 : 0) : 1,
      sort_order: is_top ? 999 : 0
    });

    success(res, notice, '公告创建成功');
  } catch (err) {
    console.error('Admin create notice error:', err);
    error(res, `创建公告失败: ${err.message}`, 500);
  }
};

const adminUpdateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, is_published, is_top } = req.body;

    const notice = await Notice.findByPk(id);
    if (!notice) {
      return error(res, '公告不存在', 404);
    }

    const typeMap = { system: 0, activity: 1, maintenance: 2, update: 3 };
    const updateData = { title, content };
    if (type !== undefined) updateData.type = typeMap[type] !== undefined ? typeMap[type] : notice.type;
    if (is_published !== undefined) updateData.is_active = is_published ? 1 : 0;
    if (is_top !== undefined) updateData.sort_order = is_top ? 999 : 0;

    await notice.update(updateData);

    success(res, notice, '公告更新成功');
  } catch (err) {
    console.error('Admin update notice error:', err);
    error(res, `更新公告失败: ${err.message}`, 500);
  }
};

const adminUpdateNoticeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    const notice = await Notice.findByPk(id);
    if (!notice) {
      return error(res, '公告不存在', 404);
    }

    await notice.update({ is_active: is_published ? 1 : 0 });
    success(res, notice, '状态更新成功');
  } catch (err) {
    console.error('Admin update notice status error:', err);
    error(res, '更新状态失败', 500);
  }
};

const adminDeleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByPk(id);
    if (!notice) {
      return error(res, '公告不存在', 404);
    }

    await notice.destroy();
    success(res, null, '公告已删除');
  } catch (err) {
    console.error('Admin delete notice error:', err);
    error(res, '删除公告失败', 500);
  }
};

module.exports = {
  adminGetNotices,
  adminCreateNotice,
  adminUpdateNotice,
  adminUpdateNoticeStatus,
  adminDeleteNotice
};
