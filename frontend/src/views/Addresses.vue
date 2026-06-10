<template>
  <div class="addresses">
    <van-nav-bar title="收货地址" left-arrow @click-left="handleBack" />

    <div class="addresses-content">
      <div v-if="addressList.length > 0" class="address-list">
        <div v-for="address in addressList" :key="address.id" class="address-card" @click="handleSelectAddress(address)">
          <div class="address-header">
            <span class="address-name">{{ address.real_name }}</span>
            <span class="address-phone">{{ address.phone }}</span>
            <van-icon v-if="address.is_default" name="star" color="#FF6B35" />
          </div>
          <p class="address-detail">{{ address.full_address }}</p>
          <div class="address-actions">
            <span @click.stop="handleSetDefault(address)">设为默认</span>
            <span @click.stop="handleEdit(address)">编辑</span>
            <span @click.stop="handleDelete(address)">删除</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <van-empty description="暂无收货地址" />
      </div>
    </div>

    <div class="bottom-bar">
      <van-button type="primary" block @click="handleAddAddress">添加新地址</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { userApi } from '@/api'

const route = useRoute()
const router = useRouter()
const from = computed(() => route.query.from || '')

const handleBack = () => {
  if (from.value === 'checkout') {
    router.push('/checkout')
  } else {
    router.back()
  }
}

const handleSelectAddress = (address) => {
  if (from.value === 'checkout') {
    router.push('/checkout')
  } else {
    router.push('/address/edit/' + address.id)
  }
}

const handleAddAddress = () => {
  const url = from.value ? `/address/edit?from=${from.value}` : '/address/edit'
  router.push(url)
}

const addressList = ref([])

const loadAddresses = async () => {
  try {
    const { data } = await userApi.getAddresses()
    addressList.value = data
  } catch (error) {
    console.error('加载地址失败:', error)
  }
}

const handleSetDefault = async (address) => {
  try {
    await userApi.setDefaultAddress(address.id)
    addressList.value.forEach(addr => {
      addr.is_default = addr.id === address.id
    })
    showToast('已设为默认地址')
  } catch (error) {
    console.error('设置默认地址失败:', error)
  }
}

const handleEdit = (address) => {
  window.location.href = '/address/edit/' + address.id
}

const handleDelete = async (address) => {
  await showDialog({
    title: '删除地址',
    message: '确定要删除这个地址吗？'
  }).then(async () => {
    try {
      await userApi.deleteAddress(address.id)
      addressList.value = addressList.value.filter(addr => addr.id !== address.id)
      showToast('删除成功')
    } catch (error) {
      console.error('删除地址失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadAddresses()
})
</script>

<style scoped>
.addresses {
  min-height: 100vh;
  padding-bottom: 100px;
  background-color: #f7f8fa;
}

.addresses-content {
  padding: 12px;
}

.address-card {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.address-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.address-phone {
  font-size: 14px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.address-actions {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #FF6B35;
}

.empty-state {
  padding: 60px 0;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.bottom-bar button {
  height: 48px;
}
</style>
