<template>
  <div class="orders">
    <van-nav-bar title="我的订单" left-arrow @click-left="$router.back()" />

    <van-tabs v-model="activeTab" @change="handleTabChange">
      <van-tab title="全部" name="all" />
      <van-tab title="待付款" name="pending" />
      <van-tab title="待备货" name="prepare" />
      <van-tab title="配送中" name="delivering" />
      <van-tab title="待收货" name="receive" />
    </van-tabs>

    <div class="orders-content">
      <div v-if="orderList.length > 0" class="orders-list">
        <div v-for="order in orderList" :key="order.id" class="order-card" @click="$router.push('/order/' + order.id)">
          <div class="order-header">
            <span class="order-no">订单号: {{ order.order_no }}</span>
            <span :class="['order-status', 'status-' + order.status]">{{ getStatusText(order.status) }}</span>
          </div>
          
          <!-- 待付款倒计时 -->
          <div v-if="order.status === 0 && order.remain_seconds > 0" class="order-countdown">
            <van-icon name="clock-o" size="14" />
            <span>剩余 {{ formatCountdown(order.remain_seconds) }} 自动取消</span>
          </div>
          
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img :src="item.product_image" :alt="item.product_name" class="order-item-img" />
              <div class="order-item-info">
                <h4>{{ item.product_name }}</h4>
                <p>x{{ item.quantity }}</p>
              </div>
              <span class="order-item-price">¥{{ formatPrice(item.total_price) }}</span>
            </div>
          </div>

          <div class="order-footer">
            <span class="order-total">合计: <strong>¥{{ formatPrice(order.pay_amount) }}</strong></span>
            <div class="order-actions">
              <van-button v-if="order.status === 0" size="small" type="primary" @click.stop="handlePay(order)">去支付</van-button>
              <van-button v-if="order.status === 0" size="small" @click.stop="handleCancel(order)">取消订单</van-button>
              <van-button v-if="order.status === 2 || order.status === 3" size="small" @click.stop="handleViewLogistics(order)">
                <van-icon name="logistics" /> 配送路线
              </van-button>
              <van-button v-if="order.status === 3 || order.status === 2" size="small" type="primary" @click.stop="handleConfirm(order)">确认收货</van-button>
              <van-button v-if="order.status === 4" size="small" @click.stop="handleReview(order)">去评价</van-button>
              <van-button v-if="order.status === 4" size="small" @click.stop="handleAfterSale(order)">申请售后</van-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <van-empty description="暂无订单" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { orderApi } from '@/api'

const router = useRouter()
const activeTab = ref('all')
const orderList = ref([])

const statusMap = {
  0: '待付款',
  1: '待备货',
  2: '配送中',
  3: '待收货',
  4: '已完成',
  5: '售后中',
  6: '已关闭'
}

// 格式化价格，修复浮点数精度问题
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00'
  return parseFloat(price).toFixed(2)
}

const getStatusText = (status) => {
  return statusMap[status] || '未知'
}

// 格式化倒计时
const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const TAB_STATUS_MAP = { 'all': '', 'pending': 0, 'prepare': 1, 'delivering': 2, 'receive': 3 }

const loadOrders = async (status) => {
  try {
    const params = {}
    if (status !== undefined && status !== '' && status !== null) {
      params.status = status
    }
    const { data } = await orderApi.getOrders(params)
    orderList.value = data?.data || []
  } catch (error) {
    console.error('加载订单失败:', error)
  }
}

const handleTabChange = (name) => {
  const status = TAB_STATUS_MAP[name]
  loadOrders(status)
}

const handlePay = (order) => {
  router.push('/payment/' + order.id)
}

const handleViewLogistics = (order) => {
  router.push('/order/' + order.id + '/tracking')
}

const handleCancel = async (order) => {
  await showDialog({
    title: '取消订单',
    message: '确定要取消这个订单吗？'
  }).then(async () => {
    try {
      await orderApi.cancelOrder(order.id, { reason: '用户取消' })
      showToast('订单已取消')
      handleTabChange(activeTab.value)
    } catch (error) {
      console.error('取消订单失败:', error)
    }
  }).catch(() => {})
}

const handleConfirm = async (order) => {
  await showDialog({
    title: '确认收货',
    message: '确定已收到商品吗？'
  }).then(async () => {
    try {
      await orderApi.confirmReceipt(order.id)
      showToast('已确认收货')
      handleTabChange(activeTab.value)
    } catch (error) {
      console.error('确认收货失败:', error)
    }
  }).catch(() => {})
}

const handleReview = (order) => {
  router.push('/reviews')
}

const handleAfterSale = (order) => {
  window.location.href = '/after-sales'
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.orders-content {
  padding: 12px;
}

.order-card {
  background-color: white;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.order-no {
  font-size: 13px;
  color: #666;
}

.order-status {
  font-size: 13px;
  font-weight: bold;
}

.order-countdown {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: #fff7e6;
  font-size: 12px;
  color: #e65100;
  border-bottom: 1px solid #f0f0f0;
}

.status-0 { color: #faad14; }
.status-1 { color: #1890ff; }
.status-2 { color: #1890ff; }
.status-3 { color: #ff6b35; }
.status-4 { color: #52c41a; }
.status-5 { color: #faad14; }
.status-6 { color: #999; }

.order-items {
  padding: 12px;
}

.order-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.order-item-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.order-item-info {
  flex: 1;
}

.order-item-info h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.order-item-info p {
  font-size: 12px;
  color: #999;
}

.order-item-price {
  font-size: 14px;
  font-weight: bold;
  color: #FF6B35;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9f9f9;
}

.order-total {
  font-size: 14px;
  color: #333;
}

.order-total strong {
  color: #FF6B35;
}

.order-actions {
  display: flex;
  gap: 8px;
}
</style>
