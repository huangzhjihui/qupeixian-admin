import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000
})

let loadingCount = 0

const showLoading = () => {
  loadingCount++
  if (loadingCount === 1) {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
      duration: 0
    })
  }
}

const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    closeToast()
  }
}

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('app_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.showLoading !== false) {
      showLoading()
    }

    return config
  },
  (error) => {
    hideLoading()
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    hideLoading()
    const { success, message, data, pagination } = response.data

    if (success) {
      return { data, message, pagination }
    } else {
      showToast(message || '请求失败')
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    hideLoading()

    const response = error.response
    if (response) {
      const status = response.status
      const data = response.data

      if (status === 401) {
        const errorCode = data?.code || data?.errorCode
        const errorMessage = data?.message || data?.msg || '登录已过期'
        const tokenErrorCodes = ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'TOKEN_NOT_FOUND', 'TOKEN_INVALID', 'UNAUTHORIZED']
        const isTokenError = tokenErrorCodes.includes(errorCode) || 
                            errorMessage.includes('过期') || 
                            errorMessage.includes('无效') || 
                            errorMessage.includes('未登录') ||
                            errorMessage.includes('Unauthorized') ||
                            errorMessage.includes('未提供') ||
                            errorMessage.includes('令牌')

        if (isTokenError) {
          const currentPath = window.location.pathname
          
          if (currentPath.startsWith('/admin')) {
            localStorage.removeItem('admin_token')
            window.location.href = '/admin/login'
          } else {
            localStorage.removeItem('app_token')
            localStorage.removeItem('app_user')
            const redirect = encodeURIComponent(window.location.pathname + window.location.search)
            window.location.href = `/login?redirect=${redirect}`
          }
          showToast(errorMessage)
        } else {
          showToast(errorMessage)
        }
      } else if (status === 403) {
        showToast(data?.message || '没有权限')
      } else {
        showToast(data?.message || error.message || '网络错误')
      }
    } else {
      showToast(error.message || '网络错误')
    }

    return Promise.reject(error)
  }
)

export default request