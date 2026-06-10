const { Cart, Product } = require('../models');
const { success, error } = require('../utils/response');

const getCart = async (req, res) => {
  try {
    if (!req.user) {
      return success(res, {
        items: [],
        totalAmount: 0,
        selectedCount: 0
      });
    }

    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, attributes: ['id', 'name', 'main_image', 'price', 'member_price', 'stock', 'sales'] }],
      order: [['created_at', 'DESC']]
    });

    const selectedItems = cartItems.filter(item => item.selected);
    const totalAmount = selectedItems.reduce((sum, item) => {
      const price = req.user.member_level > 0 && item.Product.member_price ? item.Product.member_price : item.Product.price;
      return sum + price * item.quantity;
    }, 0);

    success(res, {
      items: cartItems,
      totalAmount,
      selectedCount: selectedItems.length
    });
  } catch (err) {
    console.error('Get cart error:', err);
    error(res, '获取购物车失败', 500);
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, spec_id, quantity = 1, dietary_note } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product || !product.is_on_sale) {
      return error(res, '商品不存在或已下架', 404);
    }

    const [cartItem, created] = await Cart.findOrCreate({
      where: {
        user_id: req.user.id,
        product_id,
        spec_id: spec_id || null
      },
      defaults: {
        user_id: req.user.id,
        product_id,
        spec_id: spec_id || null,
        quantity,
        dietary_note
      }
    });

    if (!created) {
      await cartItem.increment('quantity', { by: quantity });
    }

    success(res, null, '添加成功');
  } catch (err) {
    console.error('Add to cart error:', err);
    error(res, '添加失败', 500);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, selected, dietary_note } = req.body;

    const cartItem = await Cart.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!cartItem) {
      return error(res, '购物车项不存在', 404);
    }

    await cartItem.update({
      quantity: quantity !== undefined ? quantity : cartItem.quantity,
      selected: selected !== undefined ? selected : cartItem.selected,
      dietary_note: dietary_note !== undefined ? dietary_note : cartItem.dietary_note
    });

    success(res, null, '更新成功');
  } catch (err) {
    console.error('Update cart error:', err);
    error(res, '更新失败', 500);
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!cartItem) {
      return error(res, '购物车项不存在', 404);
    }

    await cartItem.destroy();
    success(res, null, '删除成功');
  } catch (err) {
    console.error('Remove from cart error:', err);
    error(res, '删除失败', 500);
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.destroy({
      where: { user_id: req.user.id }
    });

    success(res, null, '清空成功');
  } catch (err) {
    console.error('Clear cart error:', err);
    error(res, '清空失败', 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
