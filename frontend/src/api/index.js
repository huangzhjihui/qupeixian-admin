import request from './request'
import adminRequest from './adminRequest'

export const homeApi = {
  getHomeData: () => request.get('/home'),
  search: (params) => request.get('/home/search', { params }),
  getConfig: () => request.get('/home/config', { showLoading: false }),
  getAgreement: (type) => request.get(`/home/agreement/${type}`, { showLoading: false }),
  getQualifications: () => request.get('/home/qualifications', { showLoading: false }),
  getRecipes: (params) => request.get('/home/recipes', { params }),
  getRecipeDetail: (id) => request.get(`/home/recipes/${id}`)
}

export const recipeApi = {
  getRecipes: (params) => request.get('/home/recipes', { params }),
  getRecipeDetail: (id) => request.get(`/home/recipes/${id}`)
}

export const userApi = {
  register: (data) => request.post('/users/register', data),
  login: (data) => request.post('/users/login', data),
  getProfile: () => request.get('/users/profile'),
  updateProfile: (data) => request.put('/users/profile', data),
  getAddresses: () => request.get('/users/addresses'),
  createAddress: (data) => request.post('/users/addresses', data),
  updateAddress: (id, data) => request.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => request.delete(`/users/addresses/${id}`),
  setDefaultAddress: (id) => request.put(`/users/addresses/${id}/default`),
  getCoupons: () => request.get('/users/coupons'),
  recharge: (data) => request.post('/users/recharge', data),
  getBalance: () => request.get('/users/balance'),
  
  // 聊天相关
  sendChatMessage: (data) => request.post('/chat/send', data),
  getChatHistory: (params) => request.get('/chat/history', { params }),
  getUnreadCount: () => request.get('/chat/unread', { showLoading: false })
}

export const productApi = {
  getProducts: (params) => {
    console.log('API调用参数:', params)
    return request.get('/products', { params })
  },
  getProductDetail: (id) => request.get(`/products/${id}`),
  getCategories: () => request.get('/products/categories'),
  toggleFavorite: (data) => request.post('/products/favorites/toggle', data),
  getFavorites: (params) => request.get('/products/favorites/list', { params }),
  getViewHistory: (params) => request.get('/products/history/view', { params })
}

export const cartApi = {
  getCart: () => request.get('/cart'),
  addToCart: (data) => request.post('/cart/add', data),
  updateCartItem: (id, data) => request.put(`/cart/${id}`, data),
  removeFromCart: (id) => request.delete(`/cart/${id}`),
  clearCart: () => request.delete('/cart')
}

export const orderApi = {
  createOrder: (data) => request.post('/orders/create', data),
  getOrders: (params) => request.get('/orders', { params }),
  getOrderDetail: (id) => request.get(`/orders/${id}`),
  getOrderLogistics: (id) => request.get(`/orders/${id}/logistics`),
  getDeliveryRoute: (id) => request.get(`/orders/${id}/delivery-route`),
  cancelOrder: (id, data) => request.put(`/orders/${id}/cancel`, data),
  confirmReceipt: (id) => request.put(`/orders/${id}/confirm`),
  getPaymentInfo: (id) => request.get(`/orders/${id}/payment`),
  payOrder: (id, data) => request.post(`/orders/${id}/pay`, data),
  createAfterSale: (data) => request.post('/orders/after-sales', data),
  getAfterSales: (params) => request.get('/orders/after-sales/list', { params }),
  createReview: (data) => request.post('/orders/reviews', data),
  getReviews: (params) => request.get('/orders/reviews/list', { params }),
  getPendingReviews: () => request.get('/orders/reviews/pending')
}

export const adminApi = {
  login: (data) => adminRequest.post('/admin/login', data),
  sendSmsCode: (data) => adminRequest.post('/admin/send-sms-code', data),
  verifySmsCode: (data) => adminRequest.post('/admin/verify-sms-code', data),
  resetPasswordBySms: (data) => adminRequest.post('/admin/reset-password-by-sms', data),
  getProfile: () => adminRequest.get('/admin/profile'),
  resetPassword: (data) => adminRequest.put('/admin/profile/password', data),
  getStats: () => adminRequest.get('/admin/stats'),
  
  getProducts: (params) => adminRequest.get('/admin/products', { params }),
  getProductById: (id) => adminRequest.get(`/admin/products/${id}`),
  createProduct: (data) => adminRequest.post('/admin/products', data),
  updateProduct: (id, data) => adminRequest.put(`/admin/products/${id}`, data),
  updateProductStatus: (id, data) => adminRequest.put(`/admin/products/${id}/sale`, data),
  updateProductStock: (id, data) => adminRequest.put(`/admin/products/${id}/stock`, data),
  deleteProduct: (id) => adminRequest.delete(`/admin/products/${id}`),
  downloadProductTemplate: () => adminRequest.get('/admin/products/template', { responseType: 'blob', showLoading: false }),
  batchImportProducts: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return adminRequest.post('/admin/products/batch-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  getCategories: () => adminRequest.get('/admin/categories'),
  createCategory: (data) => adminRequest.post('/admin/categories', data),
  updateCategory: (id, data) => adminRequest.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => adminRequest.delete(`/admin/categories/${id}`),
  
  getOrders: (params) => adminRequest.get('/admin/orders', { params }),
  getOrderStats: () => adminRequest.get('/admin/orders/stats'),
  getOrderDetail: (id) => adminRequest.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, data) => adminRequest.put(`/admin/orders/${id}/status`, data),
  deliverOrder: (id, data) => adminRequest.put(`/admin/orders/${id}/deliver`, data),
  exportOrders: (params) => adminRequest.get('/admin/orders/export', { params, responseType: 'blob' }),
  
  getUsers: (params) => adminRequest.get('/admin/users', { params }),
  getUserStats: () => adminRequest.get('/admin/users/stats'),
  getUserDetail: (id) => adminRequest.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => adminRequest.put(`/admin/users/${id}/status`, data),
  
  getCoupons: (params) => adminRequest.get('/admin/coupons', { params }),
  createCoupon: (data) => adminRequest.post('/admin/coupons', data),
  updateCoupon: (id, data) => adminRequest.put(`/admin/coupons/${id}`, data),
  updateCouponStatus: (id, data) => adminRequest.put(`/admin/coupons/${id}/status`, data),
  issueCoupon: (id, data) => adminRequest.post(`/admin/coupons/${id}/issue`, data),
  deleteCoupon: (id) => adminRequest.delete(`/admin/coupons/${id}`),
  
  getRecipes: (params) => adminRequest.get('/admin/recipes', { params }),
  getRecipeById: (id) => adminRequest.get(`/admin/recipes/${id}`),
  createRecipe: (data) => adminRequest.post('/admin/recipes', data),
  updateRecipe: (id, data) => adminRequest.put(`/admin/recipes/${id}`, data),
  deleteRecipe: (id) => adminRequest.delete(`/admin/recipes/${id}`),
  
  getBanners: (params) => adminRequest.get('/admin/banners', { params }),
  createBanner: (data) => adminRequest.post('/admin/banners', data),
  updateBanner: (id, data) => adminRequest.put(`/admin/banners/${id}`, data),
  updateBannerStatus: (id, data) => adminRequest.put(`/admin/banners/${id}/status`, data),
  updateBannerSort: (id, data) => adminRequest.put(`/admin/banners/${id}/sort`, data),
  deleteBanner: (id) => adminRequest.delete(`/admin/banners/${id}`),
  
  getNotices: (params) => adminRequest.get('/admin/notices', { params }),
  createNotice: (data) => adminRequest.post('/admin/notices', data),
  updateNotice: (id, data) => adminRequest.put(`/admin/notices/${id}`, data),
  updateNoticeStatus: (id, data) => adminRequest.put(`/admin/notices/${id}/status`, data),
  deleteNotice: (id) => adminRequest.delete(`/admin/notices/${id}`),
  
  getSettings: () => adminRequest.get('/admin/settings'),
  saveSettings: (data) => adminRequest.put('/admin/settings', data),
  getAdminInfo: () => adminRequest.get('/admin/info'),
  updateAdminInfo: (data) => adminRequest.put('/admin/info', data),
  updatePassword: (data) => adminRequest.put('/admin/profile/password', data),
  getSystemConfig: () => adminRequest.get('/admin/config'),
  updateSystemConfig: (data) => adminRequest.put('/admin/config', data),
  
  getAdmins: (params) => adminRequest.get('/admin/admins', { params }),
  createAdmin: (data) => adminRequest.post('/admin/admins', data),
  updateAdmin: (id, data) => adminRequest.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => adminRequest.delete(`/admin/admins/${id}`),
  getRoles: () => adminRequest.get('/admin/roles'),
  forceResetPassword: (id, data) => adminRequest.put(`/admin/admins/${id}/force-reset`, data),
  
  // 文件上传
  uploadImage: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return adminRequest.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      showLoading: false
    })
  },
  
  // 聊天相关
  sendChatMessage: (data) => adminRequest.post('/admin/chat/send', data),
  getChatHistory: (params) => adminRequest.get('/admin/chat/history', { params }),
  markChatAsRead: (data) => adminRequest.put('/admin/chat/read', data)
}
