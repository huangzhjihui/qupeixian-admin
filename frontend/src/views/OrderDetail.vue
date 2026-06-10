<template>
  <div class="order-detail">
    <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" />

    <div class="order-content">
      <div class="status-bar" :class="'status-' + order?.status">
        <van-icon :name="getStatusIcon(order?.status)" />
        <span>{{ getStatusText(order?.status) }}</span>
      </div>

      <!-- 配送地图入口 -->
      <div v-if="order && [2, 3].includes(order.status)" class="tracking-entry" @click="goTracking">
        <div class="tracking-entry-left">
          <van-icon name="logistics" size="20" color="#FF6B35" />
          <div>
            <span class="tracking-entry-title">查看配送路线</span>
            <span class="tracking-entry-desc">实时查看配送员位置</span>
          </div>
        </div>
        <van-icon name="arrow" color="#ccc" />
      </div>

      <!-- 物流跟踪时间线 -->
      <div v-if="showLogistics && logisticsRecords.length > 0" class="section logistics-section">
        <div class="section-title">
          <van-icon name="logistics" />
          物流跟踪
        </div>
        <div class="logistics-timeline">
          <div
            v-for="(item, index) in reversedLogistics"
            :key="index"
            :class="['timeline-item', { 'timeline-active': index === 0 }]"
          >
            <div class="timeline-dot-wrapper">
              <div class="timeline-dot"></div>
              <div v-if="index < reversedLogistics.length - 1" class="timeline-line"></div>
            </div>
            <div class="timeline-content">
              <p class="timeline-desc">{{ item.description }}</p>
              <p class="timeline-meta">
                <span class="timeline-time">{{ formatTime(item.time) }}</span>
                <span v-if="item.operator" class="timeline-operator">{{ item.operator }}</span>
              </p>
              <p v-if="item.location" class="timeline-location">
                <van-icon name="location-o" /> {{ item.location }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">收货地址</div>
        <div v-if="order?.address" class="address-info">
          <div class="address-header">
            <span>{{ order.address.real_name }}</span>
            <span>{{ order.address.phone }}</span>
          </div>
          <p>{{ order.address.full_address }}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">商品清单</div>
        <div v-for="item in order?.items" :key="item.id" class="order-item">
          <img :src="item.product_image" :alt="item.product_name" class="order-item-img" />
          <div class="order-item-info">
            <h4>{{ item.product_name }}</h4>
            <p>规格: {{ item.specs || '标准份' }}</p>
          </div>
          <div class="order-item-right">
            <span class="order-item-price">¥{{ formatPrice(item.total_price) }}</span>
            <span class="order-item-quantity">x{{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">订单信息</div>
        <van-cell-group>
          <van-cell title="订单编号" :value="order?.order_no" />
          <van-cell title="下单时间" :value="order?.created_at" />
          <van-cell title="配送方式" :value="order?.delivery_method === 0 ? '同城配送' : '到店自提'" />
          <van-cell title="配送时段" :value="getDeliveryTimeText(order?.delivery_time)" />
        </van-cell-group>
      </div>

      <div class="section">
        <div class="section-title">费用明细</div>
        <div class="price-list">
          <div class="price-row">
            <span>商品金额</span>
            <span>¥{{ formatPrice(order?.total_amount) }}</span>
          </div>
          <div class="price-row">
            <span>运费</span>
            <span>{{ order?.freight === 0 ? '免运费' : '¥' + formatPrice(order?.freight) }}</span>
          </div>
          <div v-if="order?.discount_amount > 0" class="price-row">
            <span>优惠</span>
            <span class="text-red">-¥{{ formatPrice(order?.discount_amount) }}</span>
          </div>
          <div class="price-row total">
            <span>实付金额</span>
            <span>¥{{ formatPrice(order?.pay_amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <van-button v-if="order?.status === 0" type="default" @click="handleCancel">取消订单</van-button>
      <van-button v-if="order?.status === 0" type="primary" @click="handlePay">去支付</van-button>
      <van-button v-if="order?.status === 2 || order?.status === 3" type="primary" @click="handleConfirm">确认收货</van-button>
      <van-button v-if="order?.status === 4" type="default" @click="handleReview">去评价</van-button>
      <van-button v-if="order?.status === 4" type="primary" @click="handleAfterSale">申请售后</van-button>
      <van-button type="success" @click="openChat">
        <van-icon name="chat-o" /> 联系客服
      </van-button>
    </div>

    <!-- 会话弹窗 -->
    <van-popup
      v-model:show="showChat"
      position="bottom"
      :style="{ height: '60%' }"
      round
      closeable
    >
      <div v-if="order" class="chat-container">
        <div class="chat-header">
          <h3>订单会话</h3>
          <span class="chat-order-no">{{ order.order_no }}</span>
        </div>
        
        <div class="chat-messages" ref="chatMessagesRef">
          <div v-for="(msg, index) in chatMessages" :key="index" :class="['chat-msg', msg.is_admin ? 'admin' : 'user']">
            <div class="chat-msg-bubble">
              <span>{{ msg.content }}</span>
              <span class="chat-msg-time">{{ msg.time }}</span>
            </div>
          </div>
          <div v-if="chatMessages.length === 0" class="chat-empty">
            <p>暂无会话记录，发送消息开始对话</p>
          </div>
        </div>

        <div class="chat-input-area">
          <van-field
            v-model="chatInput"
            placeholder="输入消息..."
            @keyup.enter="sendMessage"
          />
          <van-button type="primary" size="small" @click="sendMessage" :disabled="!chatInput.trim()">
            发送
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { orderApi, userApi } from '@/api'

const route = useRoute()
const router = useRouter()

const order = ref(null)
const logisticsRecords = ref([])

// 是否显示物流跟踪（配送中、待收货、已完成）
const showLogistics = computed(() => {
  return order.value && [2, 3, 4].includes(order.value.status)
})

// 倒序排列物流记录（最新的在上面）
const reversedLogistics = computed(() => {
  return [...logisticsRecords.value].reverse()
})

// 会话相关
const showChat = ref(false)
const chatInput = ref('')
const chatMessages = ref([])
const chatMessagesRef = ref(null)
let chatPollingTimer = null

const statusMap = {
  0: { text: '待付款', icon: 'clock-o' },
  1: { text: '待备货', icon: 'loading' },
  2: { text: '配送中', icon: 'navigation' },
  3: { text: '待收货', icon: 'package-o' },
  4: { text: '已完成', icon: 'check-circle' },
  5: { text: '售后中', icon: 'help-o' },
  6: { text: '已关闭', icon: 'close' }
}

const deliveryTimeMap = {
  'now': '今日即时',
  'evening': '晚间 18:00-21:00',
  'next-morning': '次日午间 11:00-14:00',
  'next-evening': '次日晚间 18:00-21:00'
}

const getStatusText = (status) => {
  return statusMap[status]?.text || '未知'
}

const getStatusIcon = (status) => {
  return statusMap[status]?.icon || 'info-o'
}

const getDeliveryTimeText = (time) => {
  return deliveryTimeMap[time] || time
}

const formatPrice = (value) => {
  if (value === null || value === undefined) return '0.00'
  return Number(value).toFixed(2)
}

const loadOrderDetail = async () => {
  try {
    const { data } = await orderApi.getOrderDetail(route.params.id)
    order.value = data
    // 加载物流信息
    if (data && [2, 3, 4].includes(data.status)) {
      await loadLogistics()
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    showToast('加载失败')
  }
}

const loadLogistics = async () => {
  try {
    const { data } = await orderApi.getOrderLogistics(route.params.id)
    logisticsRecords.value = data?.records || []
  } catch (error) {
    console.error('加载物流信息失败:', error)
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const min = d.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hour}:${min}`
}

const handlePay = () => {
  router.push('/payment/' + order.value.id)
}

const goTracking = () => {
  router.push('/order/' + order.value.id + '/tracking')
}

const handleCancel = async () => {
  await showDialog({
    title: '取消订单',
    message: '确定要取消这个订单吗？'
  }).then(async () => {
    try {
      await orderApi.cancelOrder(order.value.id, { reason: '用户取消' })
      showToast('订单已取消')
      window.location.href = '/orders'
    } catch (error) {
      console.error('取消订单失败:', error)
    }
  }).catch(() => {})
}

const handleConfirm = async () => {
  await showDialog({
    title: '确认收货',
    message: '确定已收到商品吗？'
  }).then(async () => {
    try {
      await orderApi.confirmReceipt(order.value.id)
      showToast('已确认收货')
      window.location.href = '/orders'
    } catch (error) {
      console.error('确认收货失败:', error)
    }
  }).catch(() => {})
}

const handleReview = () => {
  // 跳转到待评价列表
  router.push('/reviews')
}

const handleAfterSale = () => {
  window.location.href = '/after-sales'
}

const openChat = async () => {
  showChat.value = true
  await loadChatHistory()
  // 开始轮询新消息
  startChatPolling()
}

const loadChatHistory = async () => {
  try {
    const { data } = await userApi.getChatHistory({
      order_no: order.value.order_no
    })
    chatMessages.value = (data || []).map(msg => ({
      content: msg.content,
      is_admin: msg.sender_type === 2,
      time: new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }))
    setTimeout(() => scrollChatBottom(), 100)
  } catch (error) {
    console.error('加载聊天记录失败:', error)
  }
}

const sendMessage = async () => {
  if (!chatInput.value.trim()) return
  const content = chatInput.value.trim()
  chatInput.value = ''
  
  try {
    const { data } = await userApi.sendChatMessage({
      order_no: order.value.order_no,
      content
    })
    
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    chatMessages.value.push({
      content: data.content,
      is_admin: false,
      time
    })
    setTimeout(() => scrollChatBottom(), 50)
  } catch (error) {
    console.error('发送消息失败:', error)
    showToast('发送失败')
  }
}

const startChatPolling = () => {
  stopChatPolling()
  // 每3秒轮询一次新消息
  chatPollingTimer = setInterval(async () => {
    try {
      const { data } = await userApi.getChatHistory({
        order_no: order.value.order_no
      })
      const newMessages = (data || []).map(msg => ({
        content: msg.content,
        is_admin: msg.sender_type === 2,
        time: new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }))
      
      // 只有当消息数量增加时才更新
      if (newMessages.length > chatMessages.value.length) {
        chatMessages.value = newMessages
        setTimeout(() => scrollChatBottom(), 50)
      }
    } catch (error) {
      // 静默失败
    }
  }, 3000)
}

const stopChatPolling = () => {
  if (chatPollingTimer) {
    clearInterval(chatPollingTimer)
    chatPollingTimer = null
  }
}

const scrollChatBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

onMounted(() => {
  loadOrderDetail()
})

// 组件卸载时停止轮询
onUnmounted(() => {
  stopChatPolling()
})
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  padding-bottom: 100px;
  background-color: #f7f8fa;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: bold;
}

.status-0 { background-color: #fff7e6; color: #faad14; }
.status-1 { background-color: #e6f7ff; color: #1890ff; }
.status-2 { background-color: #e6f7ff; color: #1890ff; }
.status-3 { background-color: #fff7e6; color: #ff6b35; }
.status-4 { background-color: #f6ffed; color: #52c41a; }
.status-5 { background-color: #fff7e6; color: #faad14; }
.status-6 { background-color: #f5f5f5; color: #999; }

/* 配送地图入口 */
.tracking-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  margin: 0 12px 12px;
  padding: 14px 16px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  cursor: pointer;
}

.tracking-entry:active {
  background: #fafafa;
}

.tracking-entry-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tracking-entry-title {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.tracking-entry-desc {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* 物流跟踪时间线 */
.logistics-section {
  margin-bottom: 12px;
}

.logistics-section .section-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.logistics-timeline {
  padding: 4px 0 0 0;
}

.timeline-item {
  display: flex;
  gap: 12px;
  min-height: 60px;
}

.timeline-dot-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 20px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ddd;
  border: 2px solid #ddd;
  flex-shrink: 0;
  margin-top: 4px;
}

.timeline-active .timeline-dot {
  width: 12px;
  height: 12px;
  background-color: #FF6B35;
  border-color: #FF6B35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
  margin-top: 3px;
}

.timeline-line {
  width: 2px;
  flex: 1;
  background-color: #e8e8e8;
  margin: 4px 0;
}

.timeline-active .timeline-line {
  background-color: #FFD5C2;
}

.timeline-content {
  flex: 1;
  padding-bottom: 16px;
  min-width: 0;
}

.timeline-desc {
  font-size: 14px;
  color: #999;
  line-height: 1.5;
  margin: 0 0 4px 0;
}

.timeline-active .timeline-desc {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.timeline-meta {
  font-size: 12px;
  color: #bbb;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-time {
  color: #bbb;
}

.timeline-active .timeline-time {
  color: #999;
}

.timeline-operator {
  background-color: #f0f0f0;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  color: #999;
}

.timeline-location {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0 0;
  display: flex;
  align-items: center;
  gap: 3px;
}

.order-content {
  padding: 12px;
}

.section {
  background-color: white;
  margin-bottom: 12px;
  padding: 16px;
  border-radius: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.address-info {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.address-header {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.address-header span:first-child {
  font-weight: bold;
  color: #333;
}

.address-header span:last-child {
  color: #666;
}

.order-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
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

.order-item-right {
  text-align: right;
}

.order-item-price {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #FF6B35;
}

.order-item-quantity {
  font-size: 12px;
  color: #999;
}

.price-list {
  padding: 0 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  padding: 8px 0;
}

.price-row.total {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  padding-top: 12px;
  border-top: 1px dashed #f0f0f0;
}

.price-row.total span:last-child {
  color: #FF6B35;
}

.text-red {
  color: #ff4d4f;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.bottom-bar button {
  flex: 1;
}

/* 会话弹窗样式 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
}

.chat-order-no {
  color: #999;
  font-size: 12px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.chat-msg {
  display: flex;
  margin-bottom: 12px;
}

.chat-msg.admin {
  justify-content: flex-end;
}

.chat-msg.user {
  justify-content: flex-start;
}

.chat-msg-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
}

.chat-msg.admin .chat-msg-bubble {
  background: #f0f0f0;
  color: #333;
  border-bottom-right-radius: 4px;
}

.chat-msg.user .chat-msg-bubble {
  background: #FF6B35;
  color: #fff;
  border-bottom-left-radius: 4px;
}

.chat-msg-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.chat-empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.chat-input-area {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #eee;
}

.chat-input-area .van-field {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
}
</style>
