const { Product, Category, Review, Favorite, ViewHistory, User } = require('../models');
const { success, error, paginate } = require('../utils/response');
const { PAGINATION, COPYWRITING, VIEW_HISTORY_TYPE, FAVORITE_TYPE } = require('../config/constants');
const { Op } = require('sequelize');
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');
const logger = require('../config/logger');

const getProducts = async (req, res) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE, category_id, keyword, is_new, is_hot, is_recommend } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const where = { deleted_at: null };
    if (category_id) where.category_id = parseInt(category_id);
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { subtitle: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (is_new) where.is_new = is_new;
    if (is_hot) where.is_hot = is_hot;
    if (is_recommend) where.is_recommend = is_recommend;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      offset,
      limit
    });

    paginate(res, rows, {
      page: parseInt(page),
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Get products error:', err);
    error(res, '获取商品列表失败', 500);
  }
};

const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id, 10);
    
    if (isNaN(productId)) {
      return error(res, '无效的商品ID', 400);
    }

    const product = await Product.findOne({
      where: { id: productId, is_on_sale: 1, deleted_at: null },
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    if (!product) {
      return error(res, '商品不存在', 404);
    }

    if (req.user) {
      await ViewHistory.findOrCreate({
        where: {
          user_id: req.user.id,
          type: VIEW_HISTORY_TYPE.PRODUCT,
          target_id: product.id
        },
        defaults: {
          user_id: req.user.id,
          type: VIEW_HISTORY_TYPE.PRODUCT,
          target_id: product.id,
          view_count: 1
        }
      }).then(([history, created]) => {
        if (!created) {
          history.increment('view_count');
        }
      });
    }

    const isFavorite = req.user ? !!(await Favorite.findOne({
      where: { user_id: req.user.id, type: FAVORITE_TYPE.PRODUCT, target_id: product.id }
    })) : false;

    const reviews = await Review.findAll({
      where: { product_id: product.id },
      include: [{ model: User, attributes: ['id', 'nickname', 'avatar'] }],
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    // 处理评价数据：解析图片、处理匿名、返回配送评分
    const processedReviews = reviews.map(review => {
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

      const isAnon = review.is_anonymous === 1;
      return {
        id: review.id,
        rating: review.rating,
        delivery_rating: review.delivery_rating || 5,
        content: review.content,
        images,
        is_anonymous: review.is_anonymous,
        reply: review.reply,
        like_count: review.like_count,
        created_at: review.created_at,
        User: isAnon
          ? { id: null, nickname: '匿名用户', avatar: null }
          : (review.User || { nickname: '用户', avatar: null })
      };
    });

    success(res, {
      ...product.toJSON(),
      isFavorite,
      reviews: processedReviews,
      complianceInfo: {
        notice: COPYWRITING.PRODUCT.NOTICE,
        storage: COPYWRITING.PRODUCT.STORAGE,
        includes: COPYWRITING.PRODUCT.INCLUDES,
        tags: COPYWRITING.PRODUCT.TAGS
      }
    });
  } catch (err) {
    console.error('Get product detail error:', err);
    error(res, '获取商品详情失败', 500);
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']]
    });
    success(res, categories);
  } catch (err) {
    console.error('Get categories error:', err);
    error(res, '获取分类失败', 500);
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const { type, target_id } = req.body;

    const [favorite, created] = await Favorite.findOrCreate({
      where: {
        user_id: req.user.id,
        type,
        target_id
      },
      defaults: {
        user_id: req.user.id,
        type,
        target_id
      }
    });

    if (!created) {
      await favorite.destroy();
      success(res, { isFavorite: false }, '取消收藏');
    } else {
      success(res, { isFavorite: true }, '收藏成功');
    }
  } catch (err) {
    console.error('Toggle favorite error:', err);
    error(res, '操作失败', 500);
  }
};

const getFavorites = async (req, res) => {
  try {
    const { type } = req.query;
    const { page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const where = { user_id: req.user.id };
    if (type) where.type = type;

    const { count, rows } = await Favorite.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    paginate(res, rows, {
      page: parseInt(page),
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Get favorites error:', err);
    error(res, '获取收藏失败', 500);
  }
};

const getViewHistory = async (req, res) => {
  try {
    const { type } = req.query;
    const { page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const where = { user_id: req.user.id };
    if (type) where.type = type;

    const { count, rows } = await ViewHistory.findAndCountAll({
      where,
      order: [['last_view_time', 'DESC']],
      offset,
      limit
    });

    paginate(res, rows, {
      page: parseInt(page),
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Get view history error:', err);
    error(res, '获取浏览记录失败', 500);
  }
};

const adminGetProducts = async (req, res) => {
  try {
    const { page = PAGINATION.DEFAULT_PAGE, pageSize = PAGINATION.DEFAULT_PAGE_SIZE, category_id, keyword, is_on_sale } = req.query;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const where = {};
    if (category_id) where.category_id = parseInt(category_id);
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { subtitle: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (is_on_sale !== undefined) where.is_on_sale = is_on_sale;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
      offset,
      limit
    });

    paginate(res, rows, {
      page: parseInt(page),
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Admin get products error:', err);
    error(res, '获取商品列表失败', 500);
  }
};

const adminGetProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id },
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });

    if (!product) {
      return error(res, '商品不存在', 404);
    }

    success(res, product);
  } catch (err) {
    console.error('Admin get product error:', err);
    error(res, '获取商品详情失败', 500);
  }
};

const adminCreateProduct = async (req, res) => {
  try {
    const { name, subtitle, description, price, original_price, category_id, image, images, is_new, is_hot, is_recommend, is_on_sale, sort_order, stock, unit, ingredients, main_image, ingredient_list, serving_size, origin, shelf_life, storage_conditions, cooking_time } = req.body;

    // 参数校验
    const errors = [];
    if (!name || !name.trim()) {
      errors.push('商品名称不能为空');
    }
    if (!price && price !== 0) {
      errors.push('商品价格不能为空');
    }
    if (!category_id && category_id !== 0) {
      errors.push('商品分类不能为空');
    }
    
    const mainImageValue = main_image || image;
    if (!mainImageValue || !mainImageValue.trim()) {
      errors.push('商品主图不能为空');
    }
    
    // 校验数字类型
    if (price && isNaN(Number(price))) {
      errors.push('价格必须是数字');
    }
    if (category_id && isNaN(Number(category_id))) {
      errors.push('分类ID必须是数字');
    }
    
    if (errors.length > 0) {
      return error(res, `参数校验失败: ${errors.join('; ')}`, 400);
    }

    // 构建创建数据
    const priceNum = typeof price === 'number' && !isNaN(price) ? price : Number(price);
    const categoryIdNum = typeof category_id === 'number' && !isNaN(category_id) ? category_id : Number(category_id);
    const originalPriceNum = original_price ? (typeof original_price === 'number' && !isNaN(original_price) ? original_price : Number(original_price)) : priceNum;
    
    const createData = {
      name: name.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      description: description ? description.trim() : null,
      price: priceNum,
      original_price: originalPriceNum,
      category_id: categoryIdNum,
      main_image: mainImageValue.trim(),
      images: images ? (typeof images === 'string' ? JSON.parse(images) : images) : null,
      is_new: is_new !== undefined ? is_new : 0,
      is_hot: is_hot !== undefined ? is_hot : 0,
      is_recommend: is_recommend !== undefined ? is_recommend : 0,
      is_on_sale: is_on_sale !== undefined ? is_on_sale : 1,
      sort_order: sort_order !== undefined ? sort_order : 0,
      stock: stock !== undefined ? stock : 0,
      serving_size: serving_size ? serving_size.trim() : (unit ? unit.trim() : null),
      ingredient_list: ingredient_list ? ingredient_list.trim() : (ingredients ? (typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients)) : null),
      origin: origin ? origin.trim() : null,
      shelf_life: shelf_life ? shelf_life.trim() : null,
      storage_conditions: storage_conditions ? storage_conditions.trim() : null,
      cooking_time: cooking_time ? cooking_time.trim() : null
    };

    const product = await Product.create(createData);

    success(res, product, '创建成功');
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message).join(', ');
      return error(res, `数据验证失败: ${messages}`, 400);
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return error(res, '选择的分类不存在', 400);
    }
    if (err.name === 'SequelizeDatabaseError') {
      return error(res, `数据库错误: ${err.message}`, 500);
    }
    if (err.name === 'TypeError') {
      return error(res, `数据类型错误: ${err.message}`, 400);
    }
    error(res, `创建商品失败: ${err.message}`, 500);
  }
};

const adminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subtitle, description, price, original_price, category_id, image, images, is_new, is_hot, is_recommend, is_on_sale, sort_order, stock, unit, ingredients, main_image, ingredient_list, serving_size, origin, shelf_life, storage_conditions, cooking_time } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return error(res, '商品不存在', 404);
    }

    const updateData = {
      name: name || product.name,
      subtitle: subtitle || product.subtitle,
      description: description || product.description,
      price: price || product.price,
      original_price: original_price || product.original_price,
      category_id: category_id || product.category_id,
      main_image: main_image || image || product.main_image,
      images: images ? (typeof images === 'string' ? JSON.parse(images) : images) : product.images,
      is_new: is_new !== undefined ? is_new : product.is_new,
      is_hot: is_hot !== undefined ? is_hot : product.is_hot,
      is_recommend: is_recommend !== undefined ? is_recommend : product.is_recommend,
      is_on_sale: is_on_sale !== undefined ? is_on_sale : product.is_on_sale,
      sort_order: sort_order || product.sort_order,
      stock: stock !== undefined ? stock : product.stock,
      serving_size: serving_size || unit || product.serving_size,
      ingredient_list: ingredient_list !== undefined ? ingredient_list : (ingredients ? (typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients)) : product.ingredient_list),
      origin: origin !== undefined ? origin : product.origin,
      shelf_life: shelf_life !== undefined ? shelf_life : product.shelf_life,
      storage_conditions: storage_conditions !== undefined ? storage_conditions : product.storage_conditions,
      cooking_time: cooking_time !== undefined ? cooking_time : product.cooking_time
    };

    await product.update(updateData);

    success(res, product, '更新成功');
  } catch (err) {
    console.error('Admin update product error:', err);
    if (err.name === 'SequelizeValidationError') {
      const messages = err.errors.map(e => e.message).join(', ');
      return error(res, `数据验证失败: ${messages}`, 400);
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return error(res, '选择的分类不存在', 400);
    }
    error(res, `更新商品失败: ${err.message}`, 500);
  }
};

const adminToggleSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_on_sale } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return error(res, '商品不存在', 404);
    }

    await product.update({ is_on_sale });

    success(res, { id, is_on_sale }, is_on_sale ? '上架成功' : '下架成功');
  } catch (err) {
    console.error('Admin toggle sale error:', err);
    error(res, '操作失败', 500);
  }
};

const adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return error(res, '商品不存在', 404);
    }

    await product.destroy();

    success(res, null, '删除成功');
  } catch (err) {
    console.error('Admin delete product error:', err);
    error(res, '删除商品失败', 500);
  }
};

const adminGetCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['sort_order', 'ASC']]
    });
    success(res, categories);
  } catch (err) {
    console.error('Admin get categories error:', err);
    error(res, '获取分类失败', 500);
  }
};

const adminCreateCategory = async (req, res) => {
  try {
    const { name, sort_order, status } = req.body;

    if (!name) {
      return error(res, '分类名称不能为空', 400);
    }

    const category = await Category.create({
      name,
      sort_order: sort_order || 0,
      status: status || 1
    });

    success(res, category, '创建成功');
  } catch (err) {
    console.error('Admin create category error:', err);
    error(res, '创建分类失败', 500);
  }
};

const adminUpdateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sort_order, status } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return error(res, '分类不存在', 404);
    }

    await category.update({ name, sort_order, status });

    success(res, category, '更新成功');
  } catch (err) {
    console.error('Admin update category error:', err);
    error(res, '更新分类失败', 500);
  }
};

const adminDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return error(res, '分类不存在', 404);
    }

    const productCount = await Product.count({ where: { category_id: id } });
    if (productCount > 0) {
      return error(res, '该分类下有商品，无法删除', 400);
    }

    await category.destroy();

    success(res, null, '删除成功');
  } catch (err) {
    logger.error('Admin delete category error:', err);
    error(res, '删除分类失败', 500);
  }
};

// ====== 批量导入商品 ======

// Excel文件上传配置
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../public/uploads/imports');
    const fs = require('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `batch_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const excelFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.xlsx', '.xls', '.csv'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 Excel (.xlsx, .xls) 或 CSV 格式'), false);
  }
};

const excelUpload = multer({
  storage: excelStorage,
  fileFilter: excelFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Excel模板列定义
const TEMPLATE_COLUMNS = [
  // 基础信息
  { key: 'name', header: '商品名称', required: true, width: 24, desc: '必填，建议30字以内，如"宫保鸡丁净菜套餐"' },
  { key: 'subtitle', header: '副标题', required: false, width: 24, desc: '一句话卖点，如"经典川菜·微辣鲜香"' },
  { key: 'category_name', header: '分类名称', required: true, width: 15, desc: '必填，见"分类列表"工作表' },
  // 价格与库存
  { key: 'price', header: '售价(元)', required: true, width: 10, desc: '必填，数字，如 39.9' },
  { key: 'original_price', header: '原价(元)', required: false, width: 10, desc: '划线价，不填则等于售价' },
  { key: 'member_price', header: '会员价(元)', required: false, width: 10, desc: '不填则不享受会员价' },
  { key: 'stock', header: '库存数量', required: false, width: 10, desc: '不填默认100' },
  // 图片
  { key: 'main_image', header: '主图地址', required: false, width: 35, desc: '图片URL，不填可在后台上传' },
  { key: 'images', header: '轮播图地址', required: false, width: 40, desc: '多张图片用英文逗号分隔，如 url1,url2,url3' },
  // 商品属性
  { key: 'serving_size', header: '份量', required: false, width: 10, desc: '如"2人份"、"500g"' },
  { key: 'cooking_time', header: '烹饪时长', required: false, width: 10, desc: '如"15分钟"' },
  { key: 'origin', header: '食材产地', required: false, width: 12, desc: '如"四川"、"本地"' },
  { key: 'shelf_life', header: '保质期', required: false, width: 12, desc: '如"48小时"' },
  { key: 'storage_conditions', header: '储存条件', required: false, width: 15, desc: '如"0-4\u2103冷藏"' },
  { key: 'ingredient_list', header: '配料表', required: false, width: 30, desc: '配料用顿号分隔' },
  // 状态设置
  { key: 'is_on_sale', header: '上架状态', required: false, width: 12, desc: '填"是"上架 / "否"下架，不填默认上架' },
  { key: 'is_new', header: '新品', required: false, width: 8, desc: '填"是"或"否"，不填默认否' },
  { key: 'is_hot', header: '热销', required: false, width: 8, desc: '填"是"或"否"，不填默认否' }
];

// 下载Excel模板
const adminDownloadTemplate = async (req, res) => {
  try {
    // 获取所有分类用于示例
    const categories = await Category.findAll({
      where: { status: 1 },
      attributes: ['id', 'name'],
      order: [['sort_order', 'ASC']]
    });
    const firstCat = categories[0]?.name || '单人餐';
    const secondCat = categories[1]?.name || '双人餐';
    const catNames = categories.map(c => c.name).join('、') || '单人餐、双人餐、家庭餐';

    const wb = XLSX.utils.book_new();

    // ============ Sheet 1: 商品导入模板 ============
    const headers = TEMPLATE_COLUMNS.map(c => c.header);

    // 更丰富的示例数据
    const exampleRows = [
      ['宫保鸡丁净菜套餐', '经典川菜·微辣鲜香', firstCat, 39.9, 49.9, 35.9, 100, '', '', '2人份', '15分钟', '四川', '48小时', '0-4\u2103冷藏', '鸡胸肉、花生米、干辣椒、花椒、葱姜蒜', '是', '否', '是'],
      ['番茄炒蛋净菜套餐', '家常美味·营养均衡', firstCat, 25.9, 32.9, 22.9, 200, '', '', '1人份', '10分钟', '本地', '24小时', '0-4\u2103冷藏', '番茄、鸡蛋、葱、盐、糖', '是', '是', '否'],
      ['清蒸鲈鱼净菜套餐', '鲜活现做·清蒸原味', secondCat, 59.9, 79.9, 54.9, 50, '', '', '2-3人份', '20分钟', '本地', '24小时', '0-4\u2103冷藏', '鲈鱼、葱姜、蒸鱼鼓油', '是', '否', '否'],
      ['轻食沙拉套餐', '低卡健康·减脂代餐', firstCat, 29.9, 39.9, 26.9, 150, '', '', '1人份', '5分钟', '云南', '12小时', '0-4\u2103冷藏', '生菜、小番茄、黄瓜、鸡蛋、沙拉酱', '是', '是', '否'],
    ];

    const wsData = [headers, ...exampleRows];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 设置列宽
    ws['!cols'] = TEMPLATE_COLUMNS.map(c => ({ wch: c.width }));

    // 设置表头行高和样式
    if (!ws['!rows']) ws['!rows'] = [];
    ws['!rows'][0] = { hpt: 32 }; // 表头行高

    XLSX.utils.book_append_sheet(wb, ws, '商品导入');

    // ============ Sheet 2: 填写说明 ============
    const instructions = [
      ['商品批量导入模板 — 填写说明'],
      [],
      ['一、必填字段（标*号的列）'],
      ['字段名', '说明', '示例'],
      ['商品名称', '建议30字以内，包含核心卖点', '宫保鸡丁净菜套餐'],
      ['分类名称', '必须与系统中已有分类完全一致，见"分类列表"工作表', catNames.split('、')[0]],
      ['售价(元)', '填写数字，支持小数，如 39.9', '39.9'],
      [],
      ['二、可选字段说明'],
      ['字段名', '说明', '默认值'],
      ['副标题', '一句话卖点，显示在商品名称下方', '空'],
      ['原价(元)', '显示为划线价，不填则等于售价', '等于售价'],
      ['会员价(元)', '会员专属价格', '空'],
      ['库存数量', '可售数量', '100'],
      ['主图地址', '商品展示图的URL地址，也可不填，后续在后台上传', '空'],
      ['轮播图地址', '多张图片URL用英文逗号,分隔，如: https://img1.jpg,https://img2.jpg', '空'],
      ['份量', '如"2人份"、"500g"', '空'],
      ['烹饪时长', '如"15分钟"', '空'],
      ['食材产地', '如"四川"、"本地"', '空'],
      ['保质期', '如"48小时"、"7天"', '空'],
      ['储存条件', '如"0-4\u2103冷藏"、"常温"', '空'],
      ['配料表', '配料用顿号、分隔', '空'],
      ['上架状态', '填"是"表示上架，填"否"表示下架，留空默认上架', '上架'],
      ['新品', '填"是"或"否"', '否'],
      ['热销', '填"是"或"否"', '否'],
      [],
      ['三、注意事项'],
      ['1. 请勿删除或修改第一行表头，直接从第二行开始填写数据'],
      ['2. 分类名称必须与系统中已有分类完全一致（大小写敏感）'],
      ['3. 价格字段请填写纯数字，不要带"¥"、"元"等单位'],
      ['4. 图片地址支持填写网络图片URL，也可以先不填，后续在后台编辑上传'],
      ['5. 轮播图地址：多张图片用英文逗号(,)分隔，最多支持9张'],
      ['6. 上架/新品/热销 填中文"是"或"否"，也支持填数字 1 或 0'],
      ['7. 单次导入建议不超过500条，文件大小不超过10MB'],
      [],
      ['四、导入步骤'],
      ['第1步：点击"下载导入模板"获取最新的Excel文件'],
      ['第2步：按照上方说明填写商品数据'],
      ['第3步：在后台"批量导入"弹窗中上传填好的Excel文件'],
      ['第4步：点击"开始导入"，等待导入完成查看结果'],
    ];

    const wsInstr = XLSX.utils.aoa_to_sheet(instructions);
    wsInstr['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 25 }];
    if (!wsInstr['!rows']) wsInstr['!rows'] = [];
    wsInstr['!rows'][0] = { hpt: 36 };
    XLSX.utils.book_append_sheet(wb, wsInstr, '填写说明');

    // ============ Sheet 3: 分类列表 ============
    const catData = [
      ['可用分类列表'],
      [],
      ['序号', '分类名称', '状态'],
    ];
    categories.forEach((c, i) => {
      catData.push([i + 1, c.name, '可用']);
    });
    if (categories.length === 0) {
      catData.push([1, '(暂无分类，请先在后台添加分类)', '']);
    }
    catData.push([]);
    catData.push(['注意：填写分类名称时必须与上表中的分类名称完全一致']);

    const wsCat = XLSX.utils.aoa_to_sheet(catData);
    wsCat['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 10 }];
    if (!wsCat['!rows']) wsCat['!rows'] = [];
    wsCat['!rows'][0] = { hpt: 32 };
    XLSX.utils.book_append_sheet(wb, wsCat, '分类列表');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const filename = encodeURIComponent('商品批量导入模板.xlsx');

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    logger.error('Download template error:', err);
    error(res, '下载模板失败', 500);
  }
};

// 批量导入商品
const adminBatchImport = async (req, res) => {
  excelUpload.single('file')(req, res, async (uploadErr) => {
    if (uploadErr) {
      if (uploadErr instanceof multer.MulterError) {
        if (uploadErr.code === 'LIMIT_FILE_SIZE') {
          return error(res, '文件大小不能超过10MB', 400);
        }
        return error(res, `上传失败: ${uploadErr.message}`, 400);
      }
      return error(res, uploadErr.message || '上传失败', 400);
    }

    if (!req.file) {
      return error(res, '请选择要导入的Excel文件', 400);
    }

    try {
      const filePath = req.file.path;
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 解析为JSON，第一行为表头
      const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawData || rawData.length === 0) {
        return error(res, 'Excel文件中没有数据行', 400);
      }

      // 构建列名映射（支持多种匹配方式）
      const headerMap = {};
      TEMPLATE_COLUMNS.forEach(col => {
        headerMap[col.header] = col.key;
        // 支持不带括号后缀的简写匹配
        const shortHeader = col.header.replace(/\(.+?\)/g, '').trim();
        headerMap[shortHeader] = col.key;
      });
      // 兼容旧模板的表头名称
      const legacyAliases = {
        '商品名称(必填)': 'name',
        '分类名称(必填)': 'category_name',
        '售价(必填)': 'price',
        '主图URL': 'main_image',
        '库存': 'stock',
        '产地': 'origin',
        '上架(1上架/0下架)': 'is_on_sale',
        '新品(1是/0否)': 'is_new',
        '热销(1是/0否)': 'is_hot'
      };
      Object.entries(legacyAliases).forEach(([alias, key]) => {
        headerMap[alias] = key;
      });

      // 加载所有分类用于名称→ID映射
      const categories = await Category.findAll({
        where: { status: 1 },
        attributes: ['id', 'name']
      });
      const categoryNameToId = {};
      categories.forEach(c => {
        categoryNameToId[c.name.trim()] = c.id;
      });

      const results = {
        total: rawData.length,
        success: 0,
        failed: 0,
        errors: []
      };

      // 逐行处理
      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNum = i + 2; // Excel行号（第1行是表头）

        try {
          // 映射字段
          const mapped = {};
          for (const [excelHeader, value] of Object.entries(row)) {
            const fieldKey = headerMap[excelHeader.trim()];
            if (fieldKey) {
              mapped[fieldKey] = typeof value === 'string' ? value.trim() : value;
            }
          }

          // 跳过空行和非数据行（如“填写说明”等）
          if (!mapped.name || String(mapped.name).includes('填写说明') || String(mapped.name).includes('注意') || String(mapped.name).includes('导入步骤')) {
            results.total--;
            continue;
          }

          // 必填项校验
          if (!mapped.name) {
            results.failed++;
            results.errors.push({ row: rowNum, name: '', message: '商品名称为空' });
            continue;
          }
          if (!mapped.price && mapped.price !== 0) {
            results.failed++;
            results.errors.push({ row: rowNum, name: mapped.name, message: '售价为空' });
            continue;
          }
          if (isNaN(Number(mapped.price))) {
            results.failed++;
            results.errors.push({ row: rowNum, name: mapped.name, message: '售价不是有效数字' });
            continue;
          }

          // 分类名称转ID
          let categoryId = null;
          if (mapped.category_name) {
            categoryId = categoryNameToId[mapped.category_name] || null;
          }
          if (!categoryId) {
            results.failed++;
            results.errors.push({ row: rowNum, name: mapped.name, message: `分类"${mapped.category_name || ''}"不存在` });
            continue;
          }

          // 解析状态字段：支持"是"/"否"和 1/0
          const parseBool = (val, defaultVal) => {
            if (val === '' || val === undefined || val === null) return defaultVal;
            const s = String(val).trim();
            if (s === '是' || s === '1' || s === 'true' || s === 'yes') return 1;
            if (s === '否' || s === '0' || s === 'false' || s === 'no') return 0;
            return defaultVal;
          };

          // 解析轮播图：支持逗号分隔的多URL
          let imagesValue = null;
          if (mapped.images && String(mapped.images).trim()) {
            const urls = String(mapped.images).split(',').map(u => u.trim()).filter(u => u && u.startsWith('http'));
            if (urls.length > 0) {
              imagesValue = JSON.stringify(urls);
            }
          }

          const priceNum = Number(mapped.price);
          const originalPriceNum = mapped.original_price ? Number(mapped.original_price) : priceNum;
          const memberPriceNum = mapped.member_price ? Number(mapped.member_price) : null;

          const createData = {
            name: String(mapped.name),
            subtitle: mapped.subtitle ? String(mapped.subtitle) : null,
            description: null,
            price: priceNum,
            original_price: originalPriceNum,
            member_price: memberPriceNum,
            category_id: categoryId,
            main_image: mapped.main_image ? String(mapped.main_image) : '',
            images: imagesValue,
            stock: mapped.stock !== '' && mapped.stock !== undefined ? parseInt(mapped.stock) || 100 : 100,
            serving_size: mapped.serving_size ? String(mapped.serving_size) : null,
            cooking_time: mapped.cooking_time ? String(mapped.cooking_time) : null,
            origin: mapped.origin ? String(mapped.origin) : null,
            shelf_life: mapped.shelf_life ? String(mapped.shelf_life) : null,
            storage_conditions: mapped.storage_conditions ? String(mapped.storage_conditions) : null,
            ingredient_list: mapped.ingredient_list ? String(mapped.ingredient_list) : null,
            is_on_sale: parseBool(mapped.is_on_sale, 1),
            is_new: parseBool(mapped.is_new, 0),
            is_hot: parseBool(mapped.is_hot, 0),
            is_recommend: 0,
            sort_order: 0
          };

          await Product.create(createData);
          results.success++;
        } catch (rowErr) {
          results.failed++;
          results.errors.push({
            row: rowNum,
            name: rawData[i][TEMPLATE_COLUMNS[0].header] || rawData[i]['商品名称'] || rawData[i]['商品名称(必填)'] || '',
            message: rowErr.message || '导入异常'
          });
        }
      }

      // 清理临时文件
      const fs = require('fs');
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      success(res, results, `批量导入完成：成功${results.success}条，失败${results.failed}条`);
    } catch (err) {
      logger.error('Batch import error:', err);
      error(res, `批量导入失败: ${err.message}`, 500);
    }
  });
};

module.exports = {
  getProducts,
  getProductDetail,
  getCategories,
  toggleFavorite,
  getFavorites,
  getViewHistory,
  adminGetProducts,
  adminGetProductById,
  adminCreateProduct,
  adminUpdateProduct,
  adminToggleSale,
  adminDeleteProduct,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminDownloadTemplate,
  adminBatchImport
};
