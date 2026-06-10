const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middlewares/adminAuth');
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const userController = require('../controllers/userController');
const couponController = require('../controllers/couponController');
const recipeController = require('../controllers/recipeController');
const bannerController = require('../controllers/bannerController');
const noticeController = require('../controllers/noticeController');
const settingsController = require('../controllers/settingsController');

router.post('/login', adminController.login);
router.post('/send-sms-code', adminController.sendSmsCode);
router.post('/verify-sms-code', adminController.verifySmsCode);
router.post('/reset-password-by-sms', adminController.resetPasswordBySms);
router.get('/profile', adminAuth, adminController.getProfile);
router.get('/stats', adminAuth, adminController.getStats);

// 管理员信息（前端 /admin/info 路径）
router.get('/info', adminAuth, adminController.getProfile);
router.put('/info', adminAuth, adminController.updateProfile);

router.get('/admins', adminAuth, adminController.getAdmins);
router.get('/admins/:id', adminAuth, adminController.getAdminById);
router.post('/admins', adminAuth, adminController.createAdmin);
router.put('/admins/:id', adminAuth, adminController.updateAdmin);
router.put('/admins/:id/password', adminAuth, adminController.updateAdminPassword);
router.delete('/admins/:id', adminAuth, adminController.deleteAdmin);
router.get('/roles', adminAuth, adminController.getRoleOptions);

router.put('/profile/password', adminAuth, adminController.resetPassword);
router.put('/admins/:id/force-reset', adminAuth, adminController.forceResetPassword);

router.get('/products', adminAuth, productController.adminGetProducts);
router.get('/products/template', adminAuth, productController.adminDownloadTemplate);
router.post('/products/batch-import', adminAuth, productController.adminBatchImport);
router.get('/products/:id', adminAuth, productController.adminGetProductById);
router.post('/products', adminAuth, productController.adminCreateProduct);
router.put('/products/:id', adminAuth, productController.adminUpdateProduct);
router.put('/products/:id/sale', adminAuth, productController.adminToggleSale);
router.delete('/products/:id', adminAuth, productController.adminDeleteProduct);

router.get('/categories', adminAuth, productController.adminGetCategories);
router.post('/categories', adminAuth, productController.adminCreateCategory);
router.put('/categories/:id', adminAuth, productController.adminUpdateCategory);
router.delete('/categories/:id', adminAuth, productController.adminDeleteCategory);

router.get('/orders', adminAuth, orderController.adminGetOrders);
router.get('/orders/stats', adminAuth, orderController.adminGetOrderStats);
router.get('/orders/export', adminAuth, orderController.adminExportOrders);
router.get('/orders/:id', adminAuth, orderController.adminGetOrderDetail);
router.put('/orders/:id/status', adminAuth, orderController.adminUpdateOrderStatus);
router.post('/orders/:id/logistics', adminAuth, orderController.adminAddLogisticsEntry);

router.get('/users', adminAuth, userController.adminGetUsers);
router.get('/users/stats', adminAuth, userController.adminGetUserStats);
router.get('/users/:id', adminAuth, userController.adminGetUserById);
router.put('/users/:id/status', adminAuth, userController.adminUpdateUserStatus);

router.get('/coupons', adminAuth, couponController.adminGetCoupons);
router.post('/coupons', adminAuth, couponController.adminCreateCoupon);
router.put('/coupons/:id', adminAuth, couponController.adminUpdateCoupon);
router.put('/coupons/:id/status', adminAuth, couponController.adminUpdateCouponStatus);
router.delete('/coupons/:id', adminAuth, couponController.adminDeleteCoupon);
router.post('/coupons/:id/issue', adminAuth, couponController.adminIssueCoupon);

router.get('/recipes', adminAuth, recipeController.adminGetRecipes);
router.get('/recipes/:id', adminAuth, recipeController.adminGetRecipeById);
router.post('/recipes', adminAuth, recipeController.adminCreateRecipe);
router.put('/recipes/:id', adminAuth, recipeController.adminUpdateRecipe);
router.delete('/recipes/:id', adminAuth, recipeController.adminDeleteRecipe);

router.get('/banners', adminAuth, bannerController.adminGetBanners);
router.post('/banners', adminAuth, bannerController.adminCreateBanner);
router.put('/banners/:id', adminAuth, bannerController.adminUpdateBanner);
router.put('/banners/:id/sort', adminAuth, bannerController.adminUpdateBannerSort);
router.put('/banners/:id/status', adminAuth, bannerController.adminUpdateBannerStatus);
router.delete('/banners/:id', adminAuth, bannerController.adminDeleteBanner);

router.get('/notices', adminAuth, noticeController.adminGetNotices);
router.post('/notices', adminAuth, noticeController.adminCreateNotice);
router.put('/notices/:id', adminAuth, noticeController.adminUpdateNotice);
router.put('/notices/:id/status', adminAuth, noticeController.adminUpdateNoticeStatus);
router.delete('/notices/:id', adminAuth, noticeController.adminDeleteNotice);

router.get('/settings', adminAuth, settingsController.getSettings);
router.put('/settings', adminAuth, settingsController.saveSettings);

// 系统配置（前端 /admin/config 路径）
router.get('/config', adminAuth, settingsController.getSettings);
router.put('/config', adminAuth, settingsController.saveSettings);

module.exports = router;
