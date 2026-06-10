const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const orderController = require('../controllers/orderController');

router.post('/create', auth, orderController.createOrder);
router.get('/', auth, orderController.getOrders);
router.get('/:id', auth, orderController.getOrderDetail);
router.get('/:id/logistics', auth, orderController.getOrderLogistics);
router.get('/:id/delivery-route', auth, orderController.getDeliveryRoute);
router.put('/:id/cancel', auth, orderController.cancelOrder);
router.put('/:id/confirm', auth, orderController.confirmReceipt);
router.get('/:id/payment', auth, orderController.getPaymentInfo);
router.post('/:id/pay', auth, orderController.payOrder);

router.post('/after-sales', auth, orderController.createAfterSale);
router.get('/after-sales/list', auth, orderController.getAfterSales);

router.post('/reviews', auth, orderController.createReview);
router.get('/reviews/list', auth, orderController.getUserReviews);
router.get('/reviews/pending', auth, orderController.getPendingReviews);

module.exports = router;
