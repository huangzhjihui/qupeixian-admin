const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const userController = require('../controllers/userController');
const couponController = require('../controllers/couponController');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

router.get('/addresses', auth, userController.getAddresses);
router.post('/addresses', auth, userController.createAddress);
router.put('/addresses/:id', auth, userController.updateAddress);
router.delete('/addresses/:id', auth, userController.deleteAddress);
router.put('/addresses/:id/default', auth, userController.setDefaultAddress);

router.get('/coupons', auth, couponController.getUserCoupons);

router.put('/profile/password', auth, userController.resetPassword);
router.post('/send-reset-code', userController.sendResetCode);
router.post('/forgot-password', userController.forgotPassword);

router.post('/recharge', auth, userController.recharge);
router.get('/balance', auth, userController.getBalanceRecords);

module.exports = router;
