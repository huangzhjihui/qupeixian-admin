const express = require('express');
const router = express.Router();

const homeRoutes = require('./homeRoutes');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');
const uploadController = require('../controllers/uploadController');
const { adminAuth } = require('../middlewares/adminAuth');
const chatController = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');

router.use('/home', homeRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

// 文件上传（管理员）
router.post('/upload/image', adminAuth, uploadController.uploadImage);
router.post('/upload/images', adminAuth, uploadController.uploadImages);

// 文件上传（普通用户）
router.post('/user/upload/image', auth, uploadController.uploadImage);
router.post('/user/upload/images', auth, uploadController.uploadImages);

// 聊天接口
router.post('/admin/chat/send', adminAuth, chatController.adminSendMessage);
router.get('/admin/chat/history', adminAuth, chatController.adminGetChatHistory);
router.put('/admin/chat/read', adminAuth, chatController.adminMarkAsRead);

router.post('/chat/send', auth, chatController.userSendMessage);
router.get('/chat/history', auth, chatController.userGetChatHistory);
router.get('/chat/unread', auth, chatController.userGetUnreadCount);

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
