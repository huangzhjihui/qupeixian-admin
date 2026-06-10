const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middlewares/auth');
const productController = require('../controllers/productController');

router.get('/categories', productController.getCategories);
router.get('/', productController.getProducts);
router.get('/:id', optionalAuth, productController.getProductDetail);

router.post('/favorites/toggle', auth, productController.toggleFavorite);
router.get('/favorites/list', auth, productController.getFavorites);
router.get('/history/view', auth, productController.getViewHistory);

module.exports = router;
