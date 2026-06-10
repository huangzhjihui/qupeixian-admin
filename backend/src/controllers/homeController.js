const { Product, Banner, Notice, Category, Recipe, Agreement, Qualification, Config } = require('../models');
const { success, error } = require('../utils/response');
const { BRAND, COPYWRITING } = require('../config/constants');
const { Op } = require('sequelize');

const getHomeData = async (req, res) => {
  try {
    const [banners, notices, categories, newProducts, hotProducts, recommendProducts, recipes] = await Promise.all([
      Banner.findAll({
        where: { is_active: 1 },
        order: [['sort_order', 'ASC']]
      }),
      Notice.findAll({
        where: { is_active: 1 },
        order: [['sort_order', 'ASC']],
        limit: 5
      }),
      Category.findAll({
        where: { status: 1 },
        order: [['sort_order', 'ASC']]
      }),
      Product.findAll({
        where: { is_on_sale: 1, is_new: 1, deleted_at: null },
        limit: 10,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']]
      }),
      Product.findAll({
        where: { is_on_sale: 1, is_hot: 1, deleted_at: null },
        limit: 10,
        order: [['sales', 'DESC']]
      }),
      Product.findAll({
        where: { is_on_sale: 1, is_recommend: 1, deleted_at: null },
        limit: 10,
        order: [['sort_order', 'ASC']]
      }),
      Recipe.findAll({
        where: { is_on_sale: 1, deleted_at: null },
        limit: 6,
        order: [['view_count', 'DESC']]
      })
    ]);

    success(res, {
      brand: BRAND,
      banners,
      notices,
      categories,
      newProducts,
      hotProducts,
      recommendProducts,
      recipes,
      copywriting: {
        home: COPYWRITING.HOME
      }
    });
  } catch (err) {
    console.error('Get home data error:', err);
    error(res, '获取首页数据失败', 500);
  }
};

const search = async (req, res) => {
  try {
    const { keyword, type = 'product' } = req.query;
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    if (type === 'product') {
      const { count, rows } = await Product.findAndCountAll({
        where: {
          is_on_sale: 1,
          deleted_at: null,
          [Op.or]: [
            { name: { [Op.like]: `%${keyword}%` } },
            { subtitle: { [Op.like]: `%${keyword}%` } }
          ]
        },
        include: [{ model: Category, attributes: ['id', 'name'] }],
        order: [['sales', 'DESC']],
        offset,
        limit
      });

      success(res, {
        type: 'product',
        data: rows,
        total: count
      });
    } else if (type === 'recipe') {
      const { count, rows } = await Recipe.findAndCountAll({
        where: {
          is_on_sale: 1,
          deleted_at: null,
          [Op.or]: [
            { title: { [Op.like]: `%${keyword}%` } },
            { cuisine: { [Op.like]: `%${keyword}%` } },
            { taste: { [Op.like]: `%${keyword}%` } },
            { scene: { [Op.like]: `%${keyword}%` } }
          ]
        },
        order: [['view_count', 'DESC']],
        offset,
        limit
      });

      success(res, {
        type: 'recipe',
        data: rows,
        total: count
      });
    } else {
      error(res, '无效的搜索类型', 400);
    }
  } catch (err) {
    console.error('Search error:', err);
    error(res, '搜索失败', 500);
  }
};

const getAgreement = async (req, res) => {
  try {
    const { type } = req.params;
    const agreement = await Agreement.findOne({ where: { type } });

    if (!agreement) {
      return error(res, '协议不存在', 404);
    }

    success(res, agreement);
  } catch (err) {
    console.error('Get agreement error:', err);
    error(res, '获取协议失败', 500);
  }
};

const getQualifications = async (req, res) => {
  try {
    const qualifications = await Qualification.findAll({
      where: { is_public: 1 },
      order: [['created_at', 'DESC']]
    });

    success(res, {
      qualifications,
      footerLinks: COPYWRITING.FOOTER.LINKS
    });
  } catch (err) {
    console.error('Get qualifications error:', err);
    error(res, '获取资质失败', 500);
  }
};

const getConfig = async (req, res) => {
  try {
    const configs = await Config.findAll();
    const configMap = {};
    configs.forEach(config => {
      let value = config.value;
      if (config.type === 'number') {
        value = parseFloat(value);
      } else if (config.type === 'boolean') {
        value = value === 'true' || value === '1';
      } else if (config.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch {
          value = config.value;
        }
      }
      configMap[config.key] = value;
    });

    success(res, {
      ...configMap,
      brand: BRAND,
      warning: COPYWRITING.WARNING
    });
  } catch (err) {
    console.error('Get config error:', err);
    error(res, '获取配置失败', 500);
  }
};

const getRecipes = async (req, res) => {
  try {
    const { cuisine, difficulty, taste, scene, page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const where = { is_on_sale: 1, deleted_at: null };
    if (cuisine) where.cuisine = cuisine;
    if (difficulty) where.difficulty = difficulty;
    if (taste) where.taste = taste;
    if (scene) where.scene = scene;

    const { count, rows } = await Recipe.findAndCountAll({
      where,
      order: [['view_count', 'DESC']],
      offset,
      limit
    });

    success(res, {
      data: rows,
      total: count,
      copywriting: {
        recipeNote: '食谱仅供家庭烹饪参考，口味可微调'
      }
    });
  } catch (err) {
    console.error('Get recipes error:', err);
    error(res, '获取食谱失败', 500);
  }
};

const getRecipeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findOne({
      where: { id, is_on_sale: 1, deleted_at: null }
    });

    if (!recipe) {
      return error(res, '食谱不存在', 404);
    }

    await recipe.increment('view_count');

    const relatedProduct = recipe.product_id ? await Product.findByPk(recipe.product_id) : null;

    success(res, {
      ...recipe.toJSON(),
      relatedProduct
    });
  } catch (err) {
    console.error('Get recipe detail error:', err);
    error(res, '获取食谱详情失败', 500);
  }
};

module.exports = {
  getHomeData,
  search,
  getAgreement,
  getQualifications,
  getConfig,
  getRecipes,
  getRecipeDetail
};
