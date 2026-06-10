import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'TabbarLayout',
    component: () => import('@/layouts/TabbarLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '趣配鲜', keepAlive: true, tab: 'home' }
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('@/views/Products.vue'),
        meta: { title: '商品列表', keepAlive: true, tab: 'category' }
      },
      {
        path: 'recipes',
        name: 'Recipes',
        component: () => import('@/views/Recipes.vue'),
        meta: { title: '食谱专区', keepAlive: true, tab: 'recipes' }
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/Cart.vue'),
        meta: { title: '购物车', requiresAuth: true, tab: 'cart' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人中心', requiresAuth: true, tab: 'profile' }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
        meta: { title: '商品详情', tab: 'category', extraBottom: true }
      },
      {
        path: 'recipe/:id',
        name: 'RecipeDetail',
        component: () => import('@/views/RecipeDetail.vue'),
        meta: { title: '食谱详情', hideTabbar: true }
      },
      {
        path: 'checkout',
        name: 'Checkout',
        component: () => import('@/views/Checkout.vue'),
        meta: { title: '确认订单', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/Orders.vue'),
        meta: { title: '我的订单', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('@/views/OrderDetail.vue'),
        meta: { title: '订单详情', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'order/:id/tracking',
        name: 'OrderTracking',
        component: () => import('@/views/OrderTracking.vue'),
        meta: { title: '配送跟踪', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'payment/:id',
        name: 'Payment',
        component: () => import('@/views/Payment.vue'),
        meta: { title: '订单支付', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'addresses',
        name: 'Addresses',
        component: () => import('@/views/Addresses.vue'),
        meta: { title: '收货地址', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'address/edit/:id?',
        name: 'AddressEdit',
        component: () => import('@/views/AddressEdit.vue'),
        meta: { title: '编辑地址', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'favorites',
        name: 'Favorites',
        component: () => import('@/views/Favorites.vue'),
        meta: { title: '我的收藏', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'coupons',
        name: 'Coupons',
        component: () => import('@/views/Coupons.vue'),
        meta: { title: '我的优惠券', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'after-sales',
        name: 'AfterSales',
        component: () => import('@/views/AfterSales.vue'),
        meta: { title: '售后记录', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'agreement/:type',
        name: 'Agreement',
        component: () => import('@/views/Agreement.vue'),
        meta: { title: '协议', hideTabbar: true }
      },
      {
        path: 'qualifications',
        name: 'Qualifications',
        component: () => import('@/views/Qualifications.vue'),
        meta: { title: '资质公示', hideTabbar: true }
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/Messages.vue'),
        meta: { title: '消息中心', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'chat/:orderNo',
        name: 'ChatDetail',
        component: () => import('@/views/ChatDetail.vue'),
        meta: { title: '聊天', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'reviews',
        name: 'Reviews',
        component: () => import('@/views/Reviews.vue'),
        meta: { title: '评价晒单', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'review/add',
        name: 'ReviewAdd',
        component: () => import('@/views/ReviewAdd.vue'),
        meta: { title: '发表评价', requiresAuth: true, hideTabbar: true }
      },
      {
        path: 'recharge',
        name: 'Recharge',
        component: () => import('@/views/Recharge.vue'),
        meta: { title: '余额充值', requiresAuth: true, hideTabbar: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', requiresAuth: false }
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/admin/views/Login.vue'),
    meta: { title: '管理后台登录' }
  },
  {
    path: '/admin',
    name: 'AdminHome',
    component: () => import('@/admin/views/Home.vue'),
    meta: { title: '管理后台', requiresAuth: true, isAdmin: true },
    children: [
      { path: '', name: 'AdminStats', component: () => import('@/admin/views/Stats.vue'), meta: { title: '数据统计' } },
      { path: 'products', name: 'AdminProducts', component: () => import('@/admin/views/Products.vue'), meta: { title: '商品管理' } },
      { path: 'orders', name: 'AdminOrders', component: () => import('@/admin/views/Orders.vue'), meta: { title: '订单管理' } },
      { path: 'users', name: 'AdminUsers', component: () => import('@/admin/views/Users.vue'), meta: { title: '用户管理' } },
      { path: 'coupons', name: 'AdminCoupons', component: () => import('@/admin/views/Coupons.vue'), meta: { title: '优惠券管理' } },
      { path: 'settings', name: 'AdminSettings', component: () => import('@/admin/views/Settings.vue'), meta: { title: '系统设置' } },
      { path: 'recipes', name: 'AdminRecipes', component: () => import('@/admin/views/Recipes.vue'), meta: { title: '食谱管理' } },
      { path: 'banners', name: 'AdminBanners', component: () => import('@/admin/views/Banners.vue'), meta: { title: 'Banner管理' } },
      { path: 'notices', name: 'AdminNotices', component: () => import('@/admin/views/Notices.vue'), meta: { title: '公告管理' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 趣配鲜` : '趣配鲜'

  if (to.meta.isAdmin) {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      next('/admin/login?redirect=' + encodeURIComponent(to.fullPath))
      return
    }
  } else if (to.meta.requiresAuth) {
    const token = localStorage.getItem('app_token')
    const userInfo = localStorage.getItem('app_user')
    
    if (!token) {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      return
    }
    
    if (!userInfo) {
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      return
    }
    
    try {
      JSON.parse(userInfo)
    } catch (e) {
      localStorage.removeItem('app_token')
      localStorage.removeItem('app_user')
      next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
      return
    }
  }
  
  next()
})

export default router
