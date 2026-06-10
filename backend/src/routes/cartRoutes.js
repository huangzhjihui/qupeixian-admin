const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middlewares/auth');
const cartController = require('../controllers/cartController');

router.get('/', optionalAuth, cartController.getCart);
router.post('/add', auth, cartController.addToCart);
router.put('/:id', auth, cartController.updateCartItem);
router.delete('/:id', auth, cartController.removeFromCart);
router.delete('/', auth, cartController.clearCart);

module.exports = router;
