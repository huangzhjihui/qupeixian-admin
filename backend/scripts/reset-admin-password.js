const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');
const models = require('../src/models');

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const admin = await models.Admin.findOne({ where: { username: 'admin' } });
    if (admin) {
      console.log('找到管理员:', admin.username);

      const hash = await bcrypt.hash('123456', 12);
      admin.password_hash = hash;
      await admin.save();

      console.log('管理员密码已重置为: 123456');
      console.log('新哈希:', hash);
    } else {
      console.log('未找到管理员账号，将创建新账号');

      const hash = await bcrypt.hash('123456', 12);
      await models.Admin.create({
        username: 'admin',
        password_hash: hash,
        real_name: '超级管理员',
        phone: '13800138000',
        role: 0,
        status: 1
      });

      console.log('管理员账号已创建 (admin/123456)');
    }

    process.exit(0);
  } catch (error) {
    console.error('重置密码失败:', error);
    process.exit(1);
  }
}

resetAdminPassword();