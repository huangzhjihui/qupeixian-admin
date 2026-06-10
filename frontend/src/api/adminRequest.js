import axios from 'axios'
import { showToast, showLoadingToast, closeToast } from 'vant'

const request = axios.create({
  baseURL: 'http://localhost:3000/api',
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
    const token = localStorage.getItem('admin_token')
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
    
    if (response.config.responseType === 'blob') {
      return response
    }
    
    const { success, message, data, pagination } = response.data

    if (success) {
      return { data, message, pagination }
    } else {
      const err = new Error(message || '请求失败')
      err.apiMessage = message
      showToast(message || '请求失败')
      return Promise.reject(err)
    }
  },
  (error) => {
    hideLoading()

    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
      showToast('请重新登录')
    } else if (error.response?.status === 403) {
      showToast('权限不足')
    } else if (error.response?.status === 404) {
      showToast('接口不存在')
    } else if (error.response?.status === 500) {
      const errorMsg = error.response.data?.message || '服务器内部错误'
      showToast(errorMsg)
    } else if (error.response) {
      const errorMsg = error.response.data?.message || error.message || '请求失败'
      showToast(errorMsg)
      error.apiMessage = errorMsg
    } else {
      showToast(error.message || '网络错误')
    }

    return Promise.reject(error)
  }
)

export default request