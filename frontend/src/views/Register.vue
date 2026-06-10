<template>
  <div class="register">
    <van-nav-bar title="注册" left-arrow @click-left="$router.back()" />

    <div class="register-content">
      <div class="logo-section">
        <h1 class="app-name">趣配鲜</h1>
      </div>

      <van-form @submit="handleRegister" class="register-form">
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
            placeholder="请设置6位以上密码"
            :rules="[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]"
          />
          <van-field
            v-model="form.nickname"
            name="nickname"
            label="昵称"
            placeholder="请输入昵称"
            :rules="[{ required: true, message: '请输入昵称' }]"
          />
        </van-cell-group>

        <div class="form-footer">
          <div class="login-link" @click="$router.push('/login')">已有账号？去登录</div>
        </div>

        <div class="submit-section">
          <van-button round block type="primary" native-type="submit" class="btn-submit">注册</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  phone: '',
  password: '',
  nickname: ''
})

const handleRegister = async () => {
  try {
    const { data } = await userApi.register(form.value)
    userStore.setToken(data.token)
    userStore.setUserInfo(data.user)

    router.push('/')
    showToast('注册成功')
  } catch (error) {
    console.error('注册失败:', error)
  }
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  background-color: #fff;
}

.register-content {
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
}

.register-form {
  margin-bottom: 24px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
}

.login-link {
  font-size: 13px;
  color: #FF6B35;
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
