<template>
  <div class="profile">
    <van-nav-bar title="我的" />

    <div class="profile-header">
      <div class="user-info">
        <img :src="userStore.userInfo?.avatar || 'https://picsum.photos/80/80'" class="avatar" />
        <div class="user-detail">
          <h2 class="user-name">{{ userStore.userInfo?.nickname || '点击登录' }}</h2>
          <div class="member-badge" v-if="userStore.userInfo?.member_level > 0">
            <van-tag type="primary">会员</van-tag>
          </div>
        </div>
      </div>
      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-value">{{ userStore.userInfo?.points || 0 }}</span>
          <span class="stat-label">积分</span>
        </div>
        <div class="stat-item balance-stat" @click="$router.push('/recharge')">
          <span class="stat-value">¥{{ userStore.userInfo?.balance || '0.00' }}</span>
          <span class="stat-label">余额 <van-icon name="arrow" size="12" /></span>
        </div>
      </div>
    </div>

    <div class="section">
      <van-cell-group>
        <van-cell icon="chat-o" title="消息中心" @click="$router.push('/messages')">
          <template #right-icon>
            <van-badge v-if="unreadCount > 0" :content="unreadCount" />
            <van-icon v-else name="chevron-right" />
          </template>
        </van-cell>
        <van-cell icon="clipboard-o" title="我的订单" @click="$router.push('/orders')">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
        <van-cell icon="map-o" title="收货地址" @click="$router.push('/addresses')">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
        <van-cell icon="heart-o" title="我的收藏" @click="$router.push('/favorites')">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
        <van-cell icon="ticket-o" title="优惠券" @click="$router.push('/coupons')">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
      </van-cell-group>
    </div>

    <div class="section">
      <van-cell-group>
        <van-cell icon="star-o" title="评价晒单" @click="handleReviews">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
        <van-cell icon="service-o" title="售后服务" @click="$router.push('/after-sales')">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
        <van-cell icon="help-o" title="帮助中心" @click="handleHelp">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
        <van-cell icon="phone-o" title="联系客服" @click="handleContact">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
      </van-cell-group>
    </div>

    <div class="section">
      <van-cell-group>
        <van-cell icon="file-text" title="用户协议" @click="$router.push('/agreement/user_agreement')">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
        <van-cell icon="lock" title="隐私政策" @click="$router.push('/agreement/privacy_policy')">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
        <van-cell icon="shield" title="资质公示" @click="$router.push('/qualifications')">
          <template #right-icon><van-icon name="chevron-right" /></template>
        </van-cell>
      </van-cell-group>
    </div>

    <div v-if="userStore.isLoggedIn" class="logout-section">
      <van-button type="default" block @click="handleLogout">退出登录</van-button>
    </div>

    <div v-else class="login-section">
      <van-button type="primary" block @click="$router.push('/login')">登录/注册</van-button>
    </div>

    <div class="safety-tips" style="margin-top: 16px;">
      <van-icon name="info-o" />
      温馨提示：本平台所售为生鲜预处理食材，需自行烹饪；未成年人请在监护人陪同下操作厨房烹饪，注意用火用电安全。
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useUserStore } from '@/store/user'
import { useCartStore } from '@/store/cart'
import { userApi } from '@/api'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const unreadCount = ref(0)
let chatPollingTimer = null

const handleLogout = async () => {
  await showDialog({
    title: '退出登录',
    message: '确定要退出登录吗？'
  }).then(() => {
    userStore.logout()
    cartStore.cartList = []
    cartStore.totalCount = 0
    showToast('已退出登录')
  }).catch(() => {})
}

const handleReviews = () => {
  router.push('/reviews')
}

const handleHelp = () => {
  showToast('帮助中心开发中')
}

const handleContact = () => {
  showToast('客服功能开发中')
}

onMounted(() => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    userStore.fetchUserInfo()
  }
  if (cartStore.cartList.length === 0) {
    cartStore.fetchCart()
  }
  // 轮询未读消息
  checkUnread()
  chatPollingTimer = setInterval(checkUnread, 10000)
})

onUnmounted(() => {
  if (chatPollingTimer) {
    clearInterval(chatPollingTimer)
  }
})

const checkUnread = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const { data } = await userApi.getUnreadCount()
    unreadCount.value = data?.count || 0
  } catch {
    // 静默失败
  }
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
  padding-bottom: 60px;
  background-color: #f7f8fa;
}

.profile-header {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  padding: 32px 16px 24px;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.5);
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 4px;
}

.user-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.balance-stat {
  cursor: pointer;
}

.balance-stat .stat-label {
  display: flex;
  align-items: center;
  gap: 2px;
}

.section {
  background-color: white;
  margin-bottom: 12px;
}

.logout-section,
.login-section {
  padding: 16px;
}

.safety-tips {
  padding: 12px 16px;
  font-size: 12px;
  line-height: 1.5;
}
</style>
