<template>
  <div class="coupons">
    <van-nav-bar title="我的优惠券" />

    <div class="tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'available' }"
        @click="activeTab = 'available'"
      >
        可使用 <span class="badge" v-if="availableCount > 0">{{ availableCount }}</span>
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'used' }"
        @click="activeTab = 'used'"
      >
        已使用
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'expired' }"
        @click="activeTab = 'expired'"
      >
        已过期
      </div>
    </div>

    <div class="coupon-list" v-if="couponList.length > 0">
      <div 
        class="coupon-card" 
        v-for="coupon in couponList" 
        :key="coupon.id"
        :class="{ disabled: activeTab !== 'available' }"
      >
        <div class="coupon-left">
          <div class="discount">
            <span class="currency">¥</span>
            <span class="amount">{{ coupon.discount_value }}</span>
          </div>
          <div class="condition">满{{ coupon.min_amount }}可用</div>
        </div>
        <div class="coupon-right">
          <div class="coupon-name">{{ coupon.name }}</div>
          <div class="coupon-desc">趣配鲜生鲜食材专用券</div>
          <div class="coupon-time">{{ formatDate(coupon.start_time) }} - {{ formatDate(coupon.end_time) }}</div>
        </div>
        <div class="coupon-status" v-if="activeTab !== 'available'">
          <span>{{ activeTab === 'used' ? '已使用' : '已过期' }}</span>
        </div>
      </div>
    </div>

    <div class="empty-state" v-else>
      <van-icon name="ticket-o" size="64" color="#ccc" />
      <p>暂无优惠券</p>
      <p class="hint">快去领取优惠券吧</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userApi } from '@/api'

const activeTab = ref('available')
const coupons = ref([])

const availableCount = computed(() => {
  return coupons.value.filter(c => c.status === 0 && !isExpired(c.end_time)).length
})

const couponList = computed(() => {
  if (activeTab.value === 'available') {
    return coupons.value.filter(c => c.status === 0 && !isExpired(c.end_time))
  } else if (activeTab.value === 'used') {
    return coupons.value.filter(c => c.status === 1)
  } else {
    return coupons.value.filter(c => c.status === 0 && isExpired(c.end_time))
  }
})

function isExpired(expireTime) {
  if (!expireTime) return false
  return new Date(expireTime) < new Date()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const fetchCoupons = async () => {
  try {
    const response = await userApi.getCoupons()
    console.log('优惠券响应:', response)
    if (Array.isArray(response.data)) {
      coupons.value = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      coupons.value = response.data.data
    }
  } catch (err) {
    console.error('获取优惠券失败:', err)
  }
}

onMounted(() => {
  fetchCoupons()
})
</script>

<style scoped>
.coupons {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 60px;
}

.tabs {
  display: flex;
  background-color: white;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #666;
  position: relative;
  padding-bottom: 8px;
}

.tab-item.active {
  color: #FF6B35;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background-color: #FF6B35;
  border-radius: 2px;
}

.badge {
  display: inline-block;
  background-color: #FF6B35;
  color: white;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  margin-left: 4px;
}

.coupon-list {
  padding: 16px;
}

.coupon-card {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  position: relative;
  overflow: hidden;
}

.coupon-card.disabled {
  background: linear-gradient(135deg, #ccc 0%, #ddd 100%);
}

.coupon-card::before {
  content: '';
  position: absolute;
  left: 100px;
  top: 0;
  bottom: 0;
  width: 20px;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(255,255,255,0.3) 5px,
    rgba(255,255,255,0.3) 10px
  );
}

.coupon-left {
  width: 100px;
  text-align: center;
  padding-right: 20px;
  border-right: 1px dashed rgba(255,255,255,0.5);
}

.discount {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.currency {
  font-size: 16px;
  color: white;
}

.amount {
  font-size: 36px;
  font-weight: bold;
  color: white;
}

.condition {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
  margin-top: 4px;
}

.coupon-right {
  flex: 1;
  padding-left: 16px;
  color: white;
}

.coupon-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.coupon-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 8px;
}

.coupon-time {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
}

.coupon-status {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(0,0,0,0.3);
  padding: 4px 12px;
  font-size: 12px;
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-state p {
  margin-top: 16px;
  color: #999;
  font-size: 14px;
}

.empty-state .hint {
  font-size: 12px;
  color: #ccc;
}
</style>
