const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { success, error } = require('../utils/response');

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    // 按日期创建子目录
    const dateDir = new Date().toISOString().split('T')[0];
    const dir = path.join(uploadDir, dateDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, name);
  }
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('image/');
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('只支持图片格式 (jpg, png, gif, webp, bmp)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 单文件上传
const uploadImage = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return error(res, '文件大小不能超过5MB', 400);
        }
        return error(res, `上传失败: ${err.message}`, 400);
      }
      return error(res, err.message || '上传失败', 400);
    }
    
    if (!req.file) {
      return error(res, '请选择要上传的文件', 400);
    }
    
    // 返回可访问的完整URL
    const dateDir = new Date().toISOString().split('T')[0];
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const url = `${baseUrl}/uploads/${dateDir}/${req.file.filename}`;
    success(res, { url, filename: req.file.filename }, '上传成功');
  });
};

// 多文件上传
const uploadImages = (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return error(res, '文件大小不能超过5MB', 400);
        }
        return error(res, `上传失败: ${err.message}`, 400);
      }
      return error(res, err.message || '上传失败', 400);
    }
    
    if (!req.files || req.files.length === 0) {
      return error(res, '请选择要上传的文件', 400);
    }
    
    const dateDir = new Date().toISOString().split('T')[0];
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const urls = req.files.map(f => `${baseUrl}/uploads/${dateDir}/${f.filename}`);
    success(res, { urls }, '上传成功');
  });
};

module.exports = {
  uploadImage,
  uploadImages,
  upload
};
