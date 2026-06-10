import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api'

const getStoredToken = () => {
  try {
    return localStorage.getItem('app_token') || ''
  } catch {
    return ''
  }
}

const getStoredUserInfo = () => {
  try {
    const stored = localStorage.getItem('app_user')
    if (!stored) return null
    return JSON.parse(stored)
  } catch {
    localStorage.removeItem('app_user')
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(getStoredToken())
  const userInfo = ref(getStoredUserInfo())

  const isLoggedIn = computed(() => {
    return !!token.value && !!userInfo.value
  })

  const setToken = (newToken) => {
    token.value = newToken || ''
    if (newToken) {
      localStorage.setItem('app_token', newToken)
    } else {
      localStorage.removeItem('app_token')
    }
  }

  const setUserInfo = (info) => {
    if (info && typeof info === 'object') {
      userInfo.value = info
      localStorage.setItem('app_user', JSON.stringify(info))
    } else {
      userInfo.value = null
      localStorage.removeItem('app_user')
    }
  }

  const fetchUserInfo = async () => {
    try {
      const { data } = await userApi.getProfile()
      setUserInfo(data)
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('app_token')
    localStorage.removeItem('app_user')
  }

  const initUserSession = () => {
    const savedToken = getStoredToken()
    const savedUserInfo = getStoredUserInfo()
    
    console.log('初始化用户会话 - app_token:', savedToken)
    console.log('初始化用户会话 - app_user:', savedUserInfo)
    
    if (savedToken && savedUserInfo) {
      token.value = savedToken
      userInfo.value = savedUserInfo
    } else {
      token.value = ''
      userInfo.value = null
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    setToken,
    setUserInfo,
    fetchUserInfo,
    logout,
    initUserSession
  }
})
