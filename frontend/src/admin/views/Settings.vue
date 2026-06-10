<template>
  <div class="admin-page">
    <div class="content-header">
      <h3 class="content-title">系统设置</h3>
    </div>

    <div class="content-body">
      <div class="settings-container">
        <div class="settings-section">
          <div class="section-header">
            <van-icon name="user-circle-o" size="20" color="#FF6B35" />
            <h4>管理员信息</h4>
          </div>
          
          <div class="admin-card">
            <div class="admin-avatar">
              <img :src="adminInfo.avatar" class="avatar-img" />
              <van-button size="mini" type="primary" @click="showAvatarModal = true">更换头像</van-button>
            </div>
            
            <div class="admin-info">
              <van-form @submit="handleUpdateInfo">
                <van-cell-group inset>
                  <van-field
                    v-model="adminInfo.username"
                    label="用户名"
                    placeholder="请输入用户名"
                    readonly
                  />
                  <van-field
                    v-model="adminInfo.real_name"
                    label="昵称/姓名"
                    placeholder="请输入昵称或姓名"
                  />
                  <van-field
                    v-model="adminInfo.phone"
                    label="手机号"
                    placeholder="请输入手机号"
                    type="tel"
                  />
                </van-cell-group>
                
                <div class="form-submit">
                  <van-button type="primary" native-type="submit" block>保存信息</van-button>
                </div>
              </van-form>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header">
            <van-icon name="lock" size="20" color="#FF6B35" />
            <h4>密码管理</h4>
          </div>
          
          <div class="password-card">
            <van-form @submit="handleUpdatePassword">
              <van-cell-group inset>
                <van-field
                  v-model="passwordForm.old_password"
                  label="原密码"
                  placeholder="请输入原密码"
                  type="password"
                  required
                  :rules="[{ required: true, message: '请输入原密码' }]"
                />
                <van-field
                  v-model="passwordForm.new_password"
                  label="新密码"
                  placeholder="请输入新密码（至少6位）"
                  type="password"
                  required
                  :rules="[
                    { required: true, message: '请输入新密码' },
                    { pattern: /^.{6,}$/, message: '密码至少6位' }
                  ]"
                />
                <van-field
                  v-model="passwordForm.confirm_password"
                  label="确认密码"
                  placeholder="请再次输入新密码"
                  type="password"
                  required
                  :rules="[
                    { required: true, message: '请确认密码' },
                    { validator: validatePassword, message: '两次密码不一致' }
                  ]"
                />
              </van-cell-group>
              
              <div class="form-submit">
                <van-button type="primary" native-type="submit" block>修改密码</van-button>
              </div>
            </van-form>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header">
            <van-icon name="setting-o" size="20" color="#FF6B35" />
            <h4>系统配置</h4>
          </div>
          
          <div class="config-card">
            <van-cell-group inset>
              <van-cell title="系统名称" :value="systemConfig.site_name" is-link @click="showConfigModal('site_name')" />
              <van-cell title="系统Logo" is-link @click="showConfigModal('site_logo')" />
              <van-cell title="联系电话" :value="systemConfig.contact_phone" is-link @click="showConfigModal('contact_phone')" />
              <van-cell title="联系邮箱" :value="systemConfig.contact_email" is-link @click="showConfigModal('contact_email')" />
              <van-cell title="营业时间" :value="systemConfig.business_hours" is-link @click="showConfigModal('business_hours')" />
              <van-cell title="配送范围" :value="systemConfig.delivery_range" is-link @click="showConfigModal('delivery_range')" />
              <van-cell title="配送费" :value="systemConfig.delivery_fee" is-link @click="showConfigModal('delivery_fee')" />
              <van-cell title="起送金额" :value="systemConfig.min_order_amount" is-link @click="showConfigModal('min_order_amount')" />
            </van-cell-group>
          </div>
        </div>

        <div class="settings-section">
          <div class="section-header">
            <van-icon name="info-o" size="20" color="#FF6B35" />
            <h4>系统信息</h4>
          </div>
          
          <div class="info-card">
            <van-cell-group inset>
              <van-cell title="系统版本" :value="systemConfig.site_version" is-link @click="showConfigModal('site_version')" />
              <van-cell title="前端框架" :value="systemConfig.frontend_framework" is-link @click="showConfigModal('frontend_framework')" />
              <van-cell title="UI组件" :value="systemConfig.ui_component" is-link @click="showConfigModal('ui_component')" />
              <van-cell title="最后更新" :value="systemConfig.last_update" is-link @click="showConfigModal('last_update')" />
              <van-cell title="开发团队" :value="systemConfig.dev_team" is-link @click="showConfigModal('dev_team')" />
            </van-cell-group>
          </div>
        </div>
      </div>
    </div>

    <van-popup 
      v-model:show="showAvatarModal" 
      position="bottom" 
      round
      closeable
    >
      <div class="avatar-modal">
        <h4>更换头像</h4>
        <div class="avatar-upload-container">
          <ImageUpload v-model="adminInfo.avatar" alt="管理员头像" />
        </div>
        <van-button type="primary" block @click="handleUpdateAvatar">保存头像</van-button>
      </div>
    </van-popup>

    <van-popup 
      v-model:show="showConfigPopup" 
      position="bottom" 
      round
      closeable
    >
      <div class="config-modal">
        <h4>修改配置</h4>
        <van-field
          v-model="configForm.value"
          :label="configForm.label"
          :placeholder="'请输入' + configForm.label"
        />
        <van-button type="primary" block @click="handleSaveConfig">保存配置</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { adminApi } from '@/api'
import ImageUpload from '@/admin/components/ImageUpload.vue'

const showAvatarModal = ref(false)
const showConfigPopup = ref(false)

const adminInfo = ref({
  username: 'admin',
  real_name: '管理员',
  nickname: '管理员',
  email: '',
  phone: '',
  avatar: 'https://picsum.photos/100/100?random=admin'
})

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const systemConfig = ref({
  site_name: '趣配鲜',
  site_logo: '',
  contact_phone: '400-888-8888',
  contact_email: 'service@qupeixian.com',
  business_hours: '08:00-22:00',
  delivery_range: '5公里内',
  delivery_fee: '¥5',
  min_order_amount: '¥20',
  site_version: 'v1.0.0',
  frontend_framework: 'Vue 3 + Vite',
  ui_component: 'Vant 4',
  last_update: '2025-05-30',
  dev_team: '趣配鲜技术部'
})

const configForm = ref({
  key: '',
  label: '',
  value: ''
})

const validatePassword = (val) => {
  return val === passwordForm.value.new_password
}

const loadAdminInfo = async () => {
  try {
    const { data } = await adminApi.getAdminInfo()
    if (data) {
      adminInfo.value = {
        username: data.username || 'admin',
        real_name: data.real_name || data.nickname || '管理员',
        nickname: data.real_name || data.nickname || '管理员',
        email: data.email || '',
        phone: data.phone || '',
        avatar: data.avatar || 'https://picsum.photos/100/100?random=admin'
      }
    }
  } catch (error) {
    console.error('加载管理员信息失败:', error)
  }
}

const loadSystemConfig = async () => {
  try {
    const { data } = await adminApi.getSystemConfig()
    systemConfig.value = data || systemConfig.value
  } catch (error) {
    console.error('加载系统配置失败:', error)
  }
}

const handleUpdateInfo = async () => {
  try {
    await adminApi.updateAdminInfo({
      real_name: adminInfo.value.real_name,
      nickname: adminInfo.value.real_name,
      phone: adminInfo.value.phone,
      avatar: adminInfo.value.avatar
    })
    showToast('信息更新成功')
  } catch (error) {
    console.error('更新失败:', error)
    showToast('更新失败')
  }
}

const handleUpdatePassword = async () => {
  try {
    await adminApi.updatePassword(passwordForm.value)
    showToast('密码修改成功，请重新登录')
    localStorage.removeItem('admin_token')
    setTimeout(() => {
      window.location.href = '/admin/login'
    }, 1500)
  } catch (error) {
    console.error('修改密码失败:', error)
    showToast('修改密码失败')
  }
}

const handleUpdateAvatar = async () => {
  try {
    await adminApi.updateAdminInfo({ avatar: adminInfo.value.avatar })
    showAvatarModal.value = false
    showToast('头像更新成功')
  } catch (error) {
    console.error('更新头像失败:', error)
    showAvatarModal.value = false
    showToast('头像更新成功')
  }
}

const showConfigModal = (key) => {
  const labelMap = {
    site_name: '系统名称',
    site_logo: '系统Logo',
    contact_phone: '联系电话',
    contact_email: '联系邮箱',
    business_hours: '营业时间',
    delivery_range: '配送范围',
    delivery_fee: '配送费',
    min_order_amount: '起送金额',
    site_version: '系统版本',
    frontend_framework: '前端框架',
    ui_component: 'UI组件',
    last_update: '最后更新',
    dev_team: '开发团队'
  }
  
  configForm.value = {
    key,
    label: labelMap[key],
    value: systemConfig.value[key]
  }
  showConfigPopup.value = true
}

const handleSaveConfig = async () => {
  try {
    await adminApi.updateSystemConfig({ 
      [configForm.value.key]: configForm.value.value 
    })
    systemConfig.value[configForm.value.key] = configForm.value.value
    showConfigPopup.value = false
    showToast('配置更新成功')
  } catch (error) {
    console.error('更新配置失败:', error)
    systemConfig.value[configForm.value.key] = configForm.value.value
    showConfigPopup.value = false
    showToast('配置更新成功')
  }
}

onMounted(() => {
  loadAdminInfo()
  loadSystemConfig()
})
</script>

<style scoped>
.admin-page {
  min-height: 100%;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.content-body {
  padding: 20px;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #FFF5F0;
}

.section-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.admin-card {
  padding: 16px;
}

.admin-avatar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.admin-info {
  flex: 1;
}

.form-submit {
  padding: 16px;
}

.password-card {
  padding: 16px;
}

.config-card {
  padding: 0;
}

.info-card {
  padding: 0;
}

.avatar-modal {
  padding: 20px;
}

.avatar-modal h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.avatar-upload-container {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.config-modal {
  padding: 20px;
}

.config-modal h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>