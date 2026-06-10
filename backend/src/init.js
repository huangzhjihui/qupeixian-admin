const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');
const models = require('./models');

async function initDatabase() {
  try {
    console.log('=== 开始初始化数据库 ===');
    
    // 验证数据库连接
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');
    
    // 创建所有表
    await sequelize.sync({ force: false });
    console.log('✓ 表结构同步完成');

    // 字段迁移：为已有表添加新字段
    try {
      await sequelize.query(`ALTER TABLE reviews ADD COLUMN delivery_rating TINYINT NOT NULL DEFAULT 5`);
      console.log('✓ reviews 表添加 delivery_rating 字段');
    } catch (e) {
      // 字段已存在时忽略错误
    }
    
    // 初始化管理员账号
    const adminCount = await models.Admin.count();
    if (adminCount === 0) {
      await models.Admin.create({
        username: 'admin',
        password_hash: '123456',
        real_name: '超级管理员',
        phone: '13800138000',
        role: 0,
        status: 1
      });
      console.log('✓ 管理员账号创建完成 (admin/123456)');
    } else {
      console.log('✓ 管理员账号已存在');
    }
    
    // 初始化测试用户账号
    const userCount = await models.User.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('123456', 12);
      await models.User.create({
        nickname: 'huang',
        phone: '18780542777',
        password_hash: hashedPassword,
        member_level: 0,
        points: 0,
        balance: 0,
        status: 1
      });
      console.log('✓ 测试用户创建完成 (18780542777/123456)');
    } else {
      console.log('✓ 用户数据已存在');
    }
    
    // 初始化分类数据
    const categoryCount = await models.Category.count();
    if (categoryCount === 0) {
      const categories = [
        { name: '单人餐', icon: 'https://picsum.photos/100/100?random=1', sort_order: 1 },
        { name: '双人餐', icon: 'https://picsum.photos/100/100?random=2', sort_order: 2 },
        { name: '家庭餐', icon: 'https://picsum.photos/100/100?random=3', sort_order: 3 },
        { name: '减脂餐', icon: 'https://picsum.photos/100/100?random=4', sort_order: 4 },
        { name: '儿童餐', icon: 'https://picsum.photos/100/100?random=5', sort_order: 5 },
        { name: '单品净菜', icon: 'https://picsum.photos/100/100?random=6', sort_order: 6 },
        { name: '调料专区', icon: 'https://picsum.photos/100/100?random=7', sort_order: 7 }
      ];
      await models.Category.bulkCreate(categories);
      console.log('✓ 分类数据初始化完成');
    } else {
      console.log('✓ 分类数据已存在');
    }
    
    // 初始化商品数据
    const productCount = await models.Product.count();
    if (productCount === 0) {
      const products = [
        {
          name: '宫保鸡丁套餐',
          subtitle: '经典川菜，鲜嫩可口',
          price: 39.9,
          original_price: 49.9,
          member_price: 35.9,
          category_id: 2,
          serving_size: '2人份',
          cooking_time: '15分钟',
          main_image: 'https://picsum.photos/400/400?random=101',
          images: JSON.stringify(['https://picsum.photos/400/400?random=102', 'https://picsum.photos/400/400?random=103']),
          origin: '山东',
          shelf_life: '24小时',
          storage_conditions: '0-4℃冷藏',
          ingredient_list: '鸡胸肉、花生、黄瓜、干辣椒、花椒、生抽、料酒、白糖、盐',
          packing_date: new Date().toISOString().split('T')[0],
          producer: '趣配鲜中央厨房',
          rating: 4.9,
          review_count: 1256,
          sales_count: 5890,
          stock: 100,
          is_new: 1,
          is_hot: 1,
          status: 1,
          recipe: JSON.stringify({
            steps: [
              { description: '鸡肉切丁，用料酒、生抽腌制10分钟', image: null },
              { description: '花生炸熟，黄瓜切丁备用', image: null },
              { description: '锅中放油，爆香干辣椒和花椒', image: null },
              { description: '加入鸡丁翻炒至变色', image: null },
              { description: '加入调料调味，翻炒均匀', image: null },
              { description: '加入花生和黄瓜丁翻炒', image: null },
              { description: '出锅装盘，撒上葱花', image: null }
            ]
          })
        },
        {
          name: '番茄炒蛋套餐',
          subtitle: '家常美味，营养丰富',
          price: 25.9,
          original_price: 32.9,
          member_price: 22.9,
          category_id: 1,
          serving_size: '1人份',
          cooking_time: '10分钟',
          main_image: 'https://picsum.photos/400/400?random=201',
          images: JSON.stringify(['https://picsum.photos/400/400?random=202']),
          origin: '云南',
          shelf_life: '24小时',
          storage_conditions: '0-4℃冷藏',
          ingredient_list: '番茄、鸡蛋、葱花、盐、糖',
          packing_date: new Date().toISOString().split('T')[0],
          producer: '趣配鲜中央厨房',
          rating: 4.8,
          review_count: 2341,
          sales_count: 12580,
          stock: 200,
          is_new: 0,
          is_hot: 1,
          status: 1,
          recipe: JSON.stringify({
            steps: [
              { description: '番茄切块，鸡蛋打散', image: null },
              { description: '锅中放油，倒入鸡蛋液炒至凝固', image: null },
              { description: '加入番茄块翻炒', image: null },
              { description: '加入盐和糖调味', image: null },
              { description: '出锅撒上葱花', image: null }
            ]
          })
        },
        {
          name: '清蒸鲈鱼套餐',
          subtitle: '清淡鲜美，老少皆宜',
          price: 59.9,
          original_price: 79.9,
          member_price: 54.9,
          category_id: 3,
          serving_size: '3-4人份',
          cooking_time: '12分钟',
          main_image: 'https://picsum.photos/400/400?random=301',
          images: JSON.stringify(['https://picsum.photos/400/400?random=302']),
          origin: '浙江舟山',
          shelf_life: '12小时',
          storage_conditions: '0-4℃冷藏',
          ingredient_list: '鲈鱼、姜片、葱段、蒸鱼豉油、料酒',
          packing_date: new Date().toISOString().split('T')[0],
          producer: '趣配鲜中央厨房',
          rating: 4.9,
          review_count: 892,
          sales_count: 3456,
          stock: 50,
          is_new: 1,
          is_hot: 0,
          status: 1,
          recipe: JSON.stringify({
            steps: [
              { description: '鲈鱼处理干净，两面划刀', image: null },
              { description: '用料酒腌制5分钟', image: null },
              { description: '盘底铺姜片和葱段', image: null },
              { description: '鱼放在上面，蒸锅上汽后蒸8分钟', image: null },
              { description: '倒掉蒸出的水，淋上蒸鱼豉油', image: null },
              { description: '撒上葱丝，淋上热油', image: null }
            ]
          })
        },
        {
          name: '减脂沙拉套餐',
          subtitle: '低卡健康，轻食首选',
          price: 29.9,
          original_price: 39.9,
          member_price: 26.9,
          category_id: 4,
          serving_size: '1人份',
          cooking_time: '5分钟',
          main_image: 'https://picsum.photos/400/400?random=401',
          images: JSON.stringify(['https://picsum.photos/400/400?random=402']),
          origin: '本地农场',
          shelf_life: '24小时',
          storage_conditions: '0-4℃冷藏',
          ingredient_list: '生菜、番茄、黄瓜、鸡胸肉、牛油果、沙拉酱',
          packing_date: new Date().toISOString().split('T')[0],
          producer: '趣配鲜中央厨房',
          rating: 4.7,
          review_count: 567,
          sales_count: 2341,
          stock: 150,
          is_new: 0,
          is_hot: 0,
          status: 1,
          recipe: JSON.stringify({
            steps: [
              { description: '生菜撕成小块', image: null },
              { description: '番茄切块，黄瓜切片', image: null },
              { description: '鸡胸肉切片煮熟', image: null },
              { description: '牛油果切片', image: null },
              { description: '所有食材混合，淋上沙拉酱', image: null }
            ]
          })
        },
        {
          name: '番茄牛腩套餐',
          subtitle: '软烂入味，暖心暖胃',
          price: 69.9,
          original_price: 89.9,
          member_price: 64.9,
          category_id: 3,
          serving_size: '3-4人份',
          cooking_time: '90分钟',
          main_image: 'https://picsum.photos/400/400?random=501',
          images: JSON.stringify(['https://picsum.photos/400/400?random=502']),
          origin: '内蒙古',
          shelf_life: '48小时',
          storage_conditions: '0-4℃冷藏',
          ingredient_list: '牛腩、番茄、土豆、胡萝卜、姜片、八角、香叶、生抽、料酒',
          packing_date: new Date().toISOString().split('T')[0],
          producer: '趣配鲜中央厨房',
          rating: 4.9,
          review_count: 1456,
          sales_count: 4567,
          stock: 80,
          is_new: 0,
          is_hot: 1,
          status: 1,
          recipe: JSON.stringify({
            steps: [
              { description: '牛腩切块焯水', image: null },
              { description: '锅中放油，爆香姜片和香料', image: null },
              { description: '加入牛腩翻炒', image: null },
              { description: '加入料酒和生抽翻炒', image: null },
              { description: '加入开水炖煮1小时', image: null },
              { description: '加入番茄、土豆、胡萝卜继续炖煮30分钟', image: null },
              { description: '加盐调味即可', image: null }
            ]
          })
        },
        {
          name: '虾仁豆腐羹套餐',
          subtitle: '细腻滑嫩，宝宝最爱',
          price: 35.9,
          original_price: 45.9,
          member_price: 32.9,
          category_id: 5,
          serving_size: '2人份',
          cooking_time: '15分钟',
          main_image: 'https://picsum.photos/400/400?random=601',
          images: JSON.stringify(['https://picsum.photos/400/400?random=602']),
          origin: '山东',
          shelf_life: '12小时',
          storage_conditions: '0-4℃冷藏',
          ingredient_list: '虾仁、嫩豆腐、鸡蛋、葱花、盐、淀粉',
          packing_date: new Date().toISOString().split('T')[0],
          producer: '趣配鲜中央厨房',
          rating: 4.8,
          review_count: 789,
          sales_count: 2890,
          stock: 100,
          is_new: 0,
          is_hot: 0,
          status: 1,
          recipe: JSON.stringify({
            steps: [
              { description: '虾仁切丁，用淀粉抓匀', image: null },
              { description: '豆腐切成小块', image: null },
              { description: '鸡蛋打散备用', image: null },
              { description: '锅中加水烧开，加入豆腐煮2分钟', image: null },
              { description: '加入虾仁煮至变色', image: null },
              { description: '倒入蛋液搅拌', image: null },
              { description: '加盐调味，勾芡后撒葱花', image: null }
            ]
          })
        }
      ];
      await models.Product.bulkCreate(products);
      console.log('✓ 商品数据初始化完成');
    } else {
      console.log('✓ 商品数据已存在');
    }
    
    // 初始化食谱数据
    const recipeCount = await models.Recipe.count();
    if (recipeCount === 0) {
      const recipes = [
        {
          title: '麻婆豆腐',
          description: '四川经典名菜，麻辣鲜香',
          cover_image: 'https://picsum.photos/600/400?random=1001',
          cuisine: 1,
          cooking_time: '20分钟',
          difficulty: '中等',
          servings: '2人份',
          ingredients: JSON.stringify([
            { name: '豆腐', quantity: '300g' },
            { name: '牛肉末', quantity: '100g' },
            { name: '豆瓣酱', quantity: '2勺' },
            { name: '花椒粉', quantity: '1勺' },
            { name: '葱花', quantity: '适量' }
          ]),
          steps: JSON.stringify([
            { description: '豆腐切小块，焯水备用', image: null },
            { description: '锅中放油，爆香豆瓣酱', image: null },
            { description: '加入牛肉末翻炒', image: null },
            { description: '加入豆腐翻炒', image: null },
            { description: '加水炖煮5分钟', image: null },
            { description: '勾芡后撒花椒粉和葱花', image: null }
          ]),
          tips: '豆腐焯水时加少许盐，更入味',
          product_id: 1,
          status: 1,
          sort_order: 1
        },
        {
          title: '红烧肉',
          description: '肥而不腻，入口即化',
          cover_image: 'https://picsum.photos/600/400?random=1002',
          cuisine: 1,
          cooking_time: '60分钟',
          difficulty: '困难',
          servings: '4人份',
          ingredients: JSON.stringify([
            { name: '五花肉', quantity: '500g' },
            { name: '姜片', quantity: '适量' },
            { name: '葱段', quantity: '适量' },
            { name: '冰糖', quantity: '适量' },
            { name: '生抽', quantity: '2勺' },
            { name: '老抽', quantity: '1勺' }
          ]),
          steps: JSON.stringify([
            { description: '五花肉切块焯水', image: null },
            { description: '锅中放油，炒冰糖至融化', image: null },
            { description: '加入五花肉翻炒上色', image: null },
            { description: '加入葱姜爆香', image: null },
            { description: '加入生抽老抽翻炒', image: null },
            { description: '加入开水炖煮40分钟', image: null },
            { description: '大火收汁即可', image: null }
          ]),
          tips: '用冰糖炒色比白糖更亮',
          product_id: null,
          status: 1,
          sort_order: 2
        },
        {
          title: '日式咖喱饭',
          description: '浓郁醇香，简单美味',
          cover_image: 'https://picsum.photos/600/400?random=1003',
          cuisine: 3,
          cooking_time: '30分钟',
          difficulty: '简单',
          servings: '2人份',
          ingredients: JSON.stringify([
            { name: '鸡胸肉', quantity: '200g' },
            { name: '土豆', quantity: '1个' },
            { name: '胡萝卜', quantity: '1根' },
            { name: '洋葱', quantity: '1个' },
            { name: '咖喱块', quantity: '1块' }
          ]),
          steps: JSON.stringify([
            { description: '鸡肉切块，蔬菜切块', image: null },
            { description: '锅中放油，炒香洋葱', image: null },
            { description: '加入鸡肉翻炒至变色', image: null },
            { description: '加入土豆胡萝卜翻炒', image: null },
            { description: '加入开水炖煮15分钟', image: null },
            { description: '加入咖喱块搅拌至融化', image: null },
            { description: '继续炖煮5分钟即可', image: null }
          ]),
          tips: '咖喱块要关火后再加入',
          product_id: null,
          status: 1,
          sort_order: 3
        }
      ];
      await models.Recipe.bulkCreate(recipes);
      console.log('✓ 食谱数据初始化完成');
    } else {
      console.log('✓ 食谱数据已存在');
    }
    
    // 初始化Banner数据
    const bannerCount = await models.Banner.count();
    if (bannerCount === 0) {
      const banners = [
        { title: '新品上市', image: 'https://picsum.photos/750/300?random=2001', link_url: '/products?is_new=1', position: 'home', sort_order: 1, status: 1 },
        { title: '热销爆款', image: 'https://picsum.photos/750/300?random=2002', link_url: '/products?is_hot=1', position: 'home', sort_order: 2, status: 1 },
        { title: '15分钟快手', image: 'https://picsum.photos/750/300?random=2003', link_url: '/recipes?filter=quick', position: 'home', sort_order: 3, status: 1 }
      ];
      await models.Banner.bulkCreate(banners);
      console.log('✓ Banner数据初始化完成');
    } else {
      console.log('✓ Banner数据已存在');
    }
    
    // 初始化公告数据
    const noticeCount = await models.Notice.count();
    if (noticeCount === 0) {
      await models.Notice.create({
        title: '平台公告',
        content: '欢迎来到趣配鲜！我们为您精选新鲜食材，让烹饪变得简单。',
        type: 1,
        status: 1
      });
      console.log('✓ 公告数据初始化完成');
    } else {
      console.log('✓ 公告数据已存在');
    }
    
    // 初始化资质数据
    const qualificationCount = await models.Qualification.count();
    if (qualificationCount === 0) {
      const qualifications = [
        { type: 'business_license', title: '营业执照', image: '', is_public: 1 },
        { type: 'food_license', title: '食品经营许可证', image: '', is_public: 1 }
      ];
      await models.Qualification.bulkCreate(qualifications);
      console.log('✓ 资质数据初始化完成');
    } else {
      console.log('✓ 资质数据已存在');
    }
    
    // 初始化协议数据
    const agreementCount = await models.Agreement.count();
    if (agreementCount === 0) {
      const userAgreement = `用户协议

一、服务条款的确认和接纳

趣配鲜（以下简称"本平台"）依据本协议为用户提供服务。用户在使用本平台服务前，应当仔细阅读本协议的全部内容。

二、用户账号

用户需注册账号并设置密码。用户应对其账号和密码的安全负责，并对通过其账号进行的所有活动承担责任。

三、服务内容

本平台提供生鲜预处理食材包的销售服务。用户通过本平台购买的商品为生鲜预处理食材，需自行烹饪加工。

四、订单与支付

用户下单后需及时支付。生鲜商品为定制备货，非质量问题不支持无理由退换。

五、用户行为规范

用户不得利用本平台进行任何违法违规活动，不得发布虚假信息或侵犯他人权益。

六、隐私保护

本平台将依法保护用户的个人信息，未经用户同意，不会向第三方泄露。`;

      const privacyPolicy = `隐私政策

一、信息收集

本平台收集用户的姓名、手机号、地址等信息，用于订单配送和服务提供。

二、信息使用

用户信息仅用于履行订单、提供服务和改进用户体验，不会出售给第三方。

三、信息保护

本平台采用加密技术保护用户信息安全，防止信息泄露。

四、用户权利

用户有权查询、修改、删除其个人信息，也可以申请注销账号。`;

      await models.Agreement.bulkCreate([
        { type: 'user_agreement', title: '用户协议', content: userAgreement, version: '1.0.0' },
        { type: 'privacy_policy', title: '隐私政策', content: privacyPolicy, version: '1.0.0' }
      ]);
      console.log('✓ 协议数据初始化完成');
    } else {
      console.log('✓ 协议数据已存在');
    }
    
    console.log('=== 数据库初始化完成 ===');
    
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

module.exports = initDatabase;

// 如果直接运行此文件，则执行初始化
if (require.main === module) {
  initDatabase().then(() => {
    process.exit(0);
  });
}
