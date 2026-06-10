module.exports = {
  // 订单状态
  ORDER_STATUS: {
    PENDING_PAYMENT: 0,
    PENDING_PREPARE: 1,
    DELIVERING: 2,
    PENDING_RECEIVE: 3,
    COMPLETED: 4,
    AFTER_SALE: 5,
    CLOSED: 6
  },

  // 售后状态
  AFTER_SALE_STATUS: {
    PENDING_AUDIT: 0,
    APPROVED: 1,
    REJECTED: 2,
    RETURNING: 3,
    REFUNDING: 4,
    COMPLETED: 5,
    CLOSED: 6
  },

  // 售后类型
  AFTER_SALE_TYPE: {
    REFUND_ONLY: 0,
    RETURN_REFUND: 1
  },

  // 配送方式
  DELIVERY_METHOD: {
    HOME_DELIVERY: 0,
    SELF_PICKUP: 1
  },

  // 优惠券类型
  COUPON_TYPE: {
    FIXED_AMOUNT: 0,
    DISCOUNT: 1,
    NEW_USER: 2
  },

  // 用户优惠券状态
  USER_COUPON_STATUS: {
    UNUSED: 0,
    USED: 1,
    EXPIRED: 2
  },

  // 收藏类型
  FAVORITE_TYPE: {
    PRODUCT: 0,
    RECIPE: 1
  },

  // 浏览记录类型
  VIEW_HISTORY_TYPE: {
    PRODUCT: 0,
    RECIPE: 1
  },

  // 管理员角色
  ADMIN_ROLE: {
    SUPER_ADMIN: 0,
    OPERATION: 1,
    CUSTOMER_SERVICE: 2,
    FINANCE: 3
  },

  // 食品安全记录类型
  FOOD_SAFETY_RECORD_TYPE: {
    DAILY: 0,
    WEEKLY: 1,
    MONTHLY: 2
  },

  // 品牌文案
  BRAND: {
    NAME: '趣配鲜',
    SLOGAN: '食材配齐，下锅即烹，轻松享受做饭乐趣',
    ATTRIBUTE_NOTICE: '本平台所售为生鲜预处理食材包，非熟食、非即食预制菜，需自行烹饪加工',
    COPYRIGHT: '©2026 趣配鲜 版权所有'
  },

  // 页面文案
  COPYWRITING: {
    HOME: {
      TITLE: '不用买菜、不用备菜、不用配调料',
      SUBTITLE: '10-15分钟，自己做出健康家常菜',
      DESCRIPTION: '食材已清洗切配、调料精准分份，当日新鲜采购，同城当日配送'
    },
    PRODUCT: {
      TAGS: ['已洗净', '已切配', '定量调料配齐', '附完整烹饪教程', '当日新鲜'],
      INCLUDES: '套餐包含：\n1. 预处理生鲜食材（已清洗、切配、分装）\n2. 独立小包装调味料（精准配比）\n3. 图文+视频分步烹饪教程',
      NOTICE: '产品说明：本品为生鲜预处理食材套餐，非熟食、非即食预制菜，需自行烹饪。',
      STORAGE: '储存说明：收到后0-4℃冷藏，建议24小时内食用。'
    },
    CHECKOUT: {
      NOTICE: '生鲜食材为定制备货品，下单后即刻备货，非质量问题不支持无理由退换'
    },
    AFTER_SALE: {
      RULES: '生鲜食材特殊性合规说明：\n1. 生鲜属于易损耗定制商品，不支持七天无理由退货\n2. 签收后24小时内变质、异味、异物、漏发错发，凭照片/视频可全额售后\n3. 超时、储存不当、烹饪问题不在保障范围'
    },
    CUSTOMER_SERVICE: {
      AUTO_REPLY: [
        '您好，欢迎咨询趣配鲜，请问有什么可以帮您？',
        '下单后按需备货，不囤货，最大程度保证新鲜',
        '食材已洗切配好，到手直接烹饪即可',
        '生鲜售后请在签收24小时内提供凭证，我们快速处理',
        '退款审核通过后，款项原路退回，1-3个工作日到账'
      ]
    },
    FOOTER: {
      LINKS: [
        { name: '营业执照公示', type: 'qualification', key: 'business_license' },
        { name: '食品经营合规备案', type: 'qualification', key: 'food_license' },
        { name: '用户协议', type: 'agreement', key: 'user_agreement' },
        { name: '隐私政策', type: 'agreement', key: 'privacy_policy' },
        { name: '退换货规则', type: 'agreement', key: 'return_policy' }
      ]
    },
    WARNING: '温馨提示：本平台所售为生鲜预处理食材，需自行烹饪；未成年人请在监护人陪同下操作厨房烹饪，注意用火用电安全。'
  },

  // 分页默认值
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100
  }
};
