require('dotenv').config();
const sequelize = require('../src/config/database');
const { User } = require('../src/models');

async function checkUsers() {
  try {
    console.log('=== 数据库连接测试 ===');
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');
    
    console.log('\n=== 查询用户数量 ===');
    const userCount = await User.count({ paranoid: false });
    console.log(`数据库中的用户总数: ${userCount}`);
    
    const activeUserCount = await User.count({ where: { status: 1 } });
    console.log(`活跃用户数量: ${activeUserCount}`);
    
    const deletedUserCount = await User.count({ where: { deleted_at: { [sequelize.Sequelize.Op.ne]: null } }, paranoid: false });
    console.log(`已删除用户数量: ${deletedUserCount}`);
    
    if (userCount > 0) {
      console.log('\n=== 用户列表 ===');
      const users = await User.findAll({ 
        limit: 20,
        paranoid: false,
        attributes: ['id', 'phone', 'nickname', 'status', 'created_at', 'deleted_at']
      });
      
      users.forEach(user => {
        const statusText = user.status === 1 ? '正常' : '禁用';
        const deletedText = user.deleted_at ? '已删除' : '正常';
        console.log(`ID: ${user.id} | 手机号: ${user.phone} | 昵称: ${user.nickname} | 状态: ${statusText} | 删除状态: ${deletedText}`);
      });
    } else {
      console.log('\n⚠️ 警告: 数据库中没有用户数据!');
      console.log('请先注册用户后再进行测试');
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkUsers();