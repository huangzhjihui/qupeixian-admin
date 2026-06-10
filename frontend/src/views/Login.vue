<template>
  <div class="login">
    <van-nav-bar title="登录" left-arrow @click-left="$router.back()" />

    <div class="login-content">
      <div class="logo-section">
        <h1 class="app-name">趣配鲜</h1>
        <p class="app-slogan">食材配齐，下锅即烹</p>
      </div>

      <van-form @submit="handleLogin" class="login-form">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]"
          />
        </van-cell-group>

        <div class="form-footer">
          <div class="register-link" @click="$router.push('/register')">还没有账号？立即注册</div>
        </div>

        <div class="submit-section">
          <van-button round block type="primary" native-type="submit" class="btn-submit">登录</van-button>
        </div>
      </van-form>

      <div class="agreement-section">
        <div class="safety-tips" style="margin: 16px;">
          温馨提示：未成年人请在监护人陪同下操作厨房烹饪
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const form = ref({
  phone: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const { data } = await userApi.login(form.value)
    
    console.log('登录响应数据:', data)
    
    if (!data.token) {
      showToast('登录失败：未获取到令牌')
      return
    }
    
    localStorage.setItem('app_token', data.token)
    console.log('Token已存储:', data.token)
    
    if (data.user) {
      localStorage.setItem('app_user', JSON.stringify(data.user))
      console.log('用户信息已存储:', data.user)
    } else {
      localStorage.removeItem('app_user')
      console.log('用户信息为空，已清除')
    }
    
    userStore.setToken(data.token)
    userStore.setUserInfo(data.user || null)

    const redirect = route.query.redirect || '/'
    router.push(decodeURIComponent(redirect))
    showToast('登录成功')
  } catch (error) {
    console.error('登录失败:', error)
    showToast(error.response?.data?.message || '登录失败')
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background-color: #fff;
}

.login-content {
  padding: 32px 24px;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.app-name {
  font-size: 32px;
  font-weight: bold;
  color: #FF6B35;
  margin-bottom: 8px;
}

.app-slogan {
  font-size: 14px;
  color: #666;
}

.login-form {
  margin-bottom: 24px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
}

.register-link {
  font-size: 13px;
  color: #FF6B35;
  cursor: pointer;
}

.submit-section {
  padding: 24px 16px;
}

.btn-submit {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  height: 48px;
  font-size: 16px;
}
</style>
