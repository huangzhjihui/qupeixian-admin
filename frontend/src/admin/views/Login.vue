<template>
  <div class="admin-login">
    <div class="login-container">
      <div class="logo-section">
        <h1 class="app-name">趣配鲜</h1>
        <p class="app-slogan">食材配齐，下锅即烹</p>
        <p class="admin-tag">运营管理后台</p>
      </div>

      <van-form @submit="handleLogin" class="login-form">
        <van-cell-group inset>
          <van-field
            v-model="form.username"
            name="username"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
          />
        </van-cell-group>

        <div class="submit-section">
          <van-button round block type="primary" native-type="submit" class="btn-submit">登录</van-button>
        </div>

        <div class="forgot-password">
          <van-button text type="default" @click="showForgotPassword = true">忘记密码？</van-button>
        </div>
      </van-form>

      <van-dialog v-model:show="showForgotPassword" :title="forgotStep === 1 ? '找回密码' : forgotStep === 2 ? '验证验证码' : '设置新密码'" width="80%" @confirm="handleForgotConfirm">
        <van-cell-group>
          <template v-if="forgotStep === 1">
            <van-field
              v-model="forgotForm.phone"
              name="phone"
              label="手机号"
              placeholder="请输入绑定的手机号"
              type="tel"
              :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
            />
          </template>
          <template v-else-if="forgotStep === 2">
            <van-field
              v-model="forgotForm.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              type="tel"
              disabled
            />
            <van-field
              v-model="forgotForm.code"
              name="code"
              label="验证码"
              placeholder="请输入验证码"
              :rules="[{ required: true, message: '请输入验证码' }]"
            >
              <template #button>
                <van-button size="small" type="primary" :disabled="!canGetCode" @click="sendSmsCode">
                  {{ codeCountdown > 0 ? `${codeCountdown}秒` : '获取验证码' }}
                </van-button>
              </template>
            </van-field>
          </template>
          <template v-else>
            <van-field
              v-model="forgotForm.newPassword"
              type="password"
              name="newPassword"
              label="新密码"
              placeholder="请输入新密码（至少6位）"
              :rules="[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]"
            />
            <van-field
              v-model="forgotForm.confirmPassword"
              type="password"
              name="confirmPassword"
              label="确认密码"
              placeholder="请再次输入新密码"
              :rules="[{ required: true, message: '请确认密码' }, { validator: validateConfirmPassword, message: '两次输入的密码不一致' }]"
            />
          </template>
        </van-cell-group>
        <template #footer>
          <div class="dialog-footer">
            <van-button type="default" v-if="forgotStep > 1" @click="forgotStep--">上一步</van-button>
            <van-button type="default" v-else @click="showForgotPassword = false; resetForgotForm()">取消</van-button>
            <van-button type="primary" native-type="submit">{{ forgotStep === 3 ? '确认重置' : '下一步' }}</van-button>
          </div>
        </template>
      </van-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { adminApi } from '@/api'

const router = useRouter()
const route = useRoute()

const form = ref({
  username: '',
  password: ''
})

const showForgotPassword = ref(false)
const forgotStep = ref(1)
const forgotForm = ref({
  phone: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})
const codeCountdown = ref(0)

const canGetCode = computed(() => {
  return codeCountdown.value === 0 && forgotForm.value.phone && /^1[3-9]\d{9}$/.test(forgotForm.value.phone)
})

const handleLogin = async () => {
  try {
    const { data } = await adminApi.login(form.value)
    localStorage.setItem('admin_token', data.token)
    showToast('登录成功')
    
    const redirect = route.query.redirect || '/admin'
    router.push(redirect)
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败，请检查用户名密码')
  }
}

const resetForgotForm = () => {
  forgotStep.value = 1
  forgotForm.value = {
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  }
  codeCountdown.value = 0
}

const sendSmsCode = async () => {
  if (!forgotForm.value.phone) {
    showToast('请输入手机号')
    return
  }
  
  try {
    await adminApi.sendSmsCode({ phone: forgotForm.value.phone })
    showToast('验证码已发送')
    
    codeCountdown.value = 60
    const timer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    showToast('发送验证码失败')
  }
}

const handleForgotConfirm = async () => {
  if (forgotStep.value === 1) {
    if (!forgotForm.value.phone || !/^1[3-9]\d{9}$/.test(forgotForm.value.phone)) {
      showToast('请输入正确的手机号')
      return
    }
    forgotStep.value = 2
  } else if (forgotStep.value === 2) {
    if (!forgotForm.value.code) {
      showToast('请输入验证码')
      return
    }
    
    try {
      await adminApi.verifySmsCode({ phone: forgotForm.value.phone, code: forgotForm.value.code })
      showToast('验证码验证通过')
      forgotStep.value = 3
    } catch (error) {
      console.error('验证验证码失败:', error)
      showToast('验证码错误')
    }
  } else if (forgotStep.value === 3) {
    if (!forgotForm.value.newPassword || forgotForm.value.newPassword.length < 6) {
      showToast('请输入至少6位的新密码')
      return
    }
    if (forgotForm.value.newPassword !== forgotForm.value.confirmPassword) {
      showToast('两次输入的密码不一致')
      return
    }
    
    try {
      await adminApi.resetPasswordBySms({ phone: forgotForm.value.phone, new_password: forgotForm.value.newPassword })
      showDialog({
        title: '密码重置成功',
        message: '密码重置成功，请使用新密码登录',
        showCancelButton: false
      }).then(() => {
        showForgotPassword.value = false
        resetForgotForm()
      })
    } catch (error) {
      console.error('重置密码失败:', error)
      showToast('重置密码失败')
    }
  }
}

const validateConfirmPassword = (value) => {
  return value === forgotForm.value.newPassword
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.app-name {
  font-size: 32px;
  font-weight: 700;
  color: #FF6B35;
  margin: 0 0 10px 0;
}

.app-slogan {
  font-size: 14px;
  color: #999;
  margin: 0 0 8px 0;
}

.admin-tag {
  font-size: 12px;
  color: #FF6B35;
  margin: 0;
  padding: 4px 12px;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 20px;
  display: inline-block;
}

.login-form {
  margin-top: 20px;
}

.submit-section {
  margin-top: 20px;
}

.btn-submit {
  background: linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%);
  border: none;
  height: 44px;
  line-height: 44px;
  font-size: 16px;
  font-weight: 600;
}

.forgot-password {
  text-align: right;
  margin-top: 16px;
}

.forgot-password button {
  font-size: 14px;
  color: #FF6B35;
  padding: 0;
}

.dialog-footer {
  display: flex;
}

.dialog-footer button {
  flex: 1;
}
</style>