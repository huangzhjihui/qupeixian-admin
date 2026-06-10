const { Recipe } = require('../models');
const { success, error } = require('../utils/response');
const { Op } = require('sequelize');

const adminGetRecipes = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword } = req.query;
    
    let where = {};
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` };
    }

    const recipes = await Recipe.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: parseInt(pageSize)
    });

    success(res, {
      data: recipes.rows,
      total: recipes.count,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (err) {
    console.error('Admin get recipes error:', err);
    error(res, '获取食谱列表失败', 500);
  }
};

const adminGetRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return error(res, '食谱不存在', 404);
    }

    success(res, recipe);
  } catch (err) {
    console.error('Admin get recipe by id error:', err);
    error(res, '获取食谱详情失败', 500);
  }
};

const adminCreateRecipe = async (req, res) => {
  try {
    const { title, description, main_image, cover_image, cooking_time, difficulty, ingredients, steps, tips, is_published } = req.body;

    const recipe = await Recipe.create({
      title,
      description,
      cover_image: main_image || cover_image,
      cooking_time,
      difficulty,
      ingredients: typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients),
      steps: typeof steps === 'string' ? steps : JSON.stringify(steps),
      tips,
      view_count: 0,
      is_on_sale: is_published !== undefined ? (is_published ? 1 : 0) : 1,
      status: 1
    });

    success(res, recipe, '食谱创建成功');
  } catch (err) {
    console.error('Admin create recipe error:', err);
    error(res, `创建食谱失败: ${err.message}`, 500);
  }
};

const adminUpdateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, main_image, cover_image, cooking_time, difficulty, ingredients, steps, tips, status, is_published } = req.body;

    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return error(res, '食谱不存在', 404);
    }

    await recipe.update({
      title: title || recipe.title,
      description: description !== undefined ? description : recipe.description,
      cover_image: main_image || cover_image || recipe.cover_image,
      cooking_time: cooking_time || recipe.cooking_time,
      difficulty: difficulty || recipe.difficulty,
      ingredients: ingredients ? (typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients)) : recipe.ingredients,
      steps: steps ? (typeof steps === 'string' ? steps : JSON.stringify(steps)) : recipe.steps,
      tips: tips !== undefined ? tips : recipe.tips,
      is_on_sale: is_published !== undefined ? (is_published ? 1 : 0) : recipe.is_on_sale,
      status: status !== undefined ? status : recipe.status
    });

    success(res, recipe, '食谱更新成功');
  } catch (err) {
    console.error('Admin update recipe error:', err);
    error(res, `更新食谱失败: ${err.message}`, 500);
  }
};

const adminDeleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findByPk(id);
    if (!recipe) {
      return error(res, '食谱不存在', 404);
    }

    await recipe.destroy();
    success(res, null, '食谱已删除');
  } catch (err) {
    console.error('Admin delete recipe error:', err);
    error(res, '删除食谱失败', 500);
  }
};

module.exports = {
  adminGetRecipes,
  adminGetRecipeById,
  adminCreateRecipe,
  adminUpdateRecipe,
  adminDeleteRecipe
};
