const { Banner } = require('../models');
const { success, error } = require('../utils/response');

const adminGetBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
    });

    success(res, banners);
  } catch (err) {
    console.error('Admin get banners error:', err);
    error(res, '获取Banner列表失败', 500);
  }
};

const adminCreateBanner = async (req, res) => {
  try {
    const { title, image, link_url, product_id, sort_order, is_active } = req.body;

    const banner = await Banner.create({
      title,
      image,
      link_url,
      product_id,
      sort_order: sort_order || 0,
      is_active: is_active !== undefined ? is_active : 1
    });

    success(res, banner, 'Banner创建成功');
  } catch (err) {
    console.error('Admin create banner error:', err);
    error(res, '创建Banner失败', 500);
  }
};

const adminUpdateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, image, link_url, product_id, sort_order, is_active } = req.body;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return error(res, 'Banner不存在', 404);
    }

    await banner.update({
      title,
      image,
      link_url,
      product_id,
      sort_order,
      is_active
    });

    success(res, banner, 'Banner更新成功');
  } catch (err) {
    console.error('Admin update banner error:', err);
    error(res, '更新Banner失败', 500);
  }
};

const adminDeleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return error(res, 'Banner不存在', 404);
    }

    await banner.destroy();
    success(res, null, 'Banner已删除');
  } catch (err) {
    console.error('Admin delete banner error:', err);
    error(res, '删除Banner失败', 500);
  }
};

const adminUpdateBannerSort = async (req, res) => {
  try {
    const { id } = req.params;
    const { sort_order } = req.body;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return error(res, 'Banner不存在', 404);
    }

    await banner.update({ sort_order });
    success(res, banner, '排序更新成功');
  } catch (err) {
    console.error('Admin update banner sort error:', err);
    error(res, '更新排序失败', 500);
  }
};

const adminUpdateBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return error(res, 'Banner不存在', 404);
    }

    await banner.update({ is_active });
    success(res, banner, '状态更新成功');
  } catch (err) {
    console.error('Admin update banner status error:', err);
    error(res, '更新状态失败', 500);
  }
};

module.exports = {
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminUpdateBannerSort,
  adminUpdateBannerStatus,
  adminDeleteBanner
};
