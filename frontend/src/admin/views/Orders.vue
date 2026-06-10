<template>
  <div class="admin-page">
    <div class="content-header">
      <h3 class="content-title">订单管理</h3>
      <van-button type="primary" size="small" @click="handleExport">
        <van-icon name="down" /> 导出Excel
      </van-button>
    </div>

    <div class="content-body">
      <div class="search-section">
        <van-search 
          v-model="keyword" 
          placeholder="搜索订单号、用户名" 
          shape="round"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <van-dropdown-menu>
          <van-dropdown-item v-model="statusFilter" :options="statusOptions" @change="handleSearch" />
        </van-dropdown-menu>
      </div>

      <div class="order-stats">
        <div class="stat-item">
          <span class="stat-label">待付款</span>
          <span class="stat-value pending">{{ orderCounts.pending_payment }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">待备货</span>
          <span class="stat-value preparing">{{ orderCounts.preparing }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">配送中</span>
          <span class="stat-value delivering">{{ orderCounts.delivering }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value completed">{{ orderCounts.completed }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">售后中</span>
          <span class="stat-value aftersale">{{ orderCounts.aftersale }}</span>
        </div>
      </div>

      <div class="order-list">
        <div v-for="order in orderList" :key="order.id" class="order-card">
          <div class="order-header">
            <span class="order-no">订单号: {{ order.order_no }}</span>
            <span class="order-time">{{ order.created_at }}</span>
            <van-tag :type="getStatusType(order.status)" size="medium">
              {{ getStatusText(order.status) }}
            </van-tag>
          </div>
          
          <div class="order-body">
            <div class="order-items">
              <div v-for="item in order.items" :key="item.id" class="order-item">
                <img :src="item.product_image" class="item-img" />
                <div class="item-info">
                  <span class="item-name">{{ item.product_name }}</span>
                  <span class="item-qty">x{{ item.quantity }}</span>
                </div>
                <span class="item-price">¥{{ item.price }}</span>
              </div>
            </div>
            
            <div class="order-summary">
              <span class="total-items">共{{ order.total_items }}件商品</span>
              <span class="total-amount">合计: <strong>¥{{ order.total_amount }}</strong></span>
            </div>
          </div>

          <div class="order-footer">
            <div class="user-info">
              <van-icon name="user-o" />
              <span>{{ order.user_name }}</span>
              <van-icon name="phone-o" />
              <span>{{ order.user_phone }}</span>
            </div>
            <div class="order-actions">
              <van-button size="small" type="primary" @click="handleDetail(order)">详情</van-button>
              <van-button 
                v-if="order.status === 0" 
                size="small" 
                type="warning"
                @click="handleCancel(order)"
              >取消</van-button>
              <van-button 
                v-if="order.status === 1" 
                size="small" 
                type="success"
                @click="handlePrepare(order)"
              >备货完成</van-button>
              <van-button 
                v-if="order.status === 2" 
                size="small" 
                type="success"
                @click="handleDeliver(order)"
              >确认送达</van-button>
            </div>
          </div>
        </div>

        <div v-if="orderList.length === 0" class="empty-state">
          <van-icon name="clipboard-o" size="48" color="#ccc" />
          <p>暂无订单数据</p>
        </div>
      </div>

      <van-pagination
        v-model="currentPage"
        :total-items="total"
        :items-per-page="pageSize"
        :show-page-size="5"
        force-ellipses
        @change="handlePageChange"
      />
    </div>

    <van-popup 
      v-model:show="showDetail" 
      position="bottom" 
      :style="{ height: '80%' }"
      round
      closeable
    >
      <div v-if="selectedOrder" class="detail-container">
        <div class="detail-header">
          <h3>订单详情</h3>
        </div>
        
        <div class="detail-body">
          <van-cell-group inset>
            <van-cell title="订单信息">
              <template #label>
                <div class="info-row">
                  <span>订单号: {{ selectedOrder.order_no }}</span>
                </div>
                <div class="info-row">
                  <span>下单时间: {{ selectedOrder.created_at }}</span>
                </div>
                <div class="info-row">
                  <span>订单状态: </span>
                  <van-tag :type="getStatusType(selectedOrder.status)">
                    {{ getStatusText(selectedOrder.status) }}
                  </van-tag>
                </div>
              </template>
            </van-cell>
            
            <van-cell title="用户信息">
              <template #label>
                <div class="user-info-card">
                  <img v-if="selectedOrder.user_avatar" :src="selectedOrder.user_avatar" class="user-avatar" />
                  <div v-else class="user-avatar-placeholder">
                    <van-icon name="user-o" size="20" />
                  </div>
                  <div class="user-info-text">
                    <div class="info-row">
                      <span>用户: {{ selectedOrder.user_name || '未知用户' }}</span>
                      <van-tag v-if="selectedOrder.member_level > 0" type="warning" size="mini">会员</van-tag>
                    </div>
                    <div class="info-row">
                      <span>电话: {{ selectedOrder.user_phone || '未获取' }}</span>
                    </div>
                  </div>
                  <van-button 
                    size="mini" 
                    type="primary" 
                    plain 
                    @click.stop="openChat(selectedOrder)"
                  >
                    <van-icon name="chat-o" /> 发起会话
                  </van-button>
                </div>
              </template>
            </van-cell>
            
            <van-cell title="收货地址">
              <template #label>
                <div class="info-row">
                  <span>{{ selectedOrder.address?.real_name }} {{ selectedOrder.address?.phone }}</span>
                </div>
                <div class="info-row">
                  <span>{{ selectedOrder.address?.full_address }}</span>
                </div>
              </template>
            </van-cell>
          </van-cell-group>

          <div class="detail-section">
            <h4>商品清单</h4>
            <div v-for="item in selectedOrder.items" :key="item.id" class="detail-item">
              <img :src="item.product_image" class="detail-item-img" />
              <div class="detail-item-info">
                <span class="detail-item-name">{{ item.product_name }}</span>
                <span class="detail-item-qty">x{{ item.quantity }}</span>
              </div>
              <span class="detail-item-price">¥{{ item.price }}</span>
            </div>
          </div>

          <van-cell-group inset>
            <van-cell title="商品总额" :value="`¥${Number(selectedOrder.total_amount || 0).toFixed(2)}`" />
            <van-cell title="配送费" :value="`¥${Number(selectedOrder.freight || 0).toFixed(2)}`" />
            <van-cell title="优惠券抵扣" :value="`-¥${Number(selectedOrder.discount_amount || 0).toFixed(2)}`" />
            <van-cell title="实付金额" :value="`¥${Number(selectedOrder.pay_amount || 0).toFixed(2)}`" value-class="amount-highlight" />
          </van-cell-group>

          <div class="detail-actions">
            <van-field label="订单状态" readonly>
              <template #input>
                <van-dropdown-menu>
                  <van-dropdown-item 
                    v-model="selectedOrder.status" 
                    :options="statusChangeOptions" 
                    @change="handleStatusChange"
                  />
                </van-dropdown-menu>
              </template>
            </van-field>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 会话弹窗 -->
    <van-popup
      v-model:show="showChat"
      position="bottom"
      :style="{ height: '60%' }"
      round
      closeable
    >
      <div v-if="chatUser" class="chat-container">
        <div class="chat-header">
          <h3>会话 - {{ chatUser.user_name }}</h3>
          <span class="chat-phone">{{ chatUser.user_phone }}</span>
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

        <div class="chat-quick-actions">
          <van-button size="mini" @click="sendQuickMessage('您好，请问有什么可以帮助您的？')">问候</van-button>
          <van-button size="mini" @click="sendQuickMessage('您的订单正在处理中，请耐心等待。')">订单进度</van-button>
          <van-button size="mini" @click="sendQuickMessage('请问您需要修改收货地址吗？')">确认地址</van-button>
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
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { adminApi } from '@/api'

const keyword = ref('')
const statusFilter = ref(-1)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const orderList = ref([])
const showDetail = ref(false)
const selectedOrder = ref(null)

const orderCounts = ref({
  pending_payment: 0,
  preparing: 0,
  delivering: 0,
  completed: 0,
  aftersale: 0
})

const loadOrderStats = async () => {
  try {
    const response = await adminApi.getOrderStats()
    if (response.data) {
      orderCounts.value = {
        pending_payment: response.data.pending_payment || 0,
        preparing: response.data.preparing || 0,
        delivering: response.data.delivering || 0,
        completed: response.data.completed || 0,
        aftersale: response.data.aftersale || 0
      }
    }
  } catch (error) {
    console.error('加载订单统计失败:', error)
  }
}

const statusOptions = [
  { text: '全部状态', value: -1 },
  { text: '待付款', value: 0 },
  { text: '待备货', value: 1 },
  { text: '配送中', value: 2 },
  { text: '待收货', value: 3 },
  { text: '已完成', value: 4 },
  { text: '售后中', value: 5 },
  { text: '已关闭', value: 6 }
]

const statusChangeOptions = [
  { text: '待付款', value: 0 },
  { text: '待备货', value: 1 },
  { text: '配送中', value: 2 },
  { text: '待收货', value: 3 },
  { text: '已完成', value: 4 },
  { text: '售后中', value: 5 },
  { text: '已关闭', value: 6 }
]

const statusMap = {
  0: { text: '待付款', type: 'warning' },
  1: { text: '待备货', type: 'primary' },
  2: { text: '配送中', type: 'primary' },
  3: { text: '待收货', type: 'warning' },
  4: { text: '已完成', type: 'success' },
  5: { text: '售后中', type: 'warning' },
  6: { text: '已关闭', type: 'default' }
}

const getStatusText = (status) => statusMap[status]?.text || '未知'
const getStatusType = (status) => statusMap[status]?.type || 'default'

const loadOrders = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      status: statusFilter.value >= 0 ? statusFilter.value : undefined
    }
    const { data } = await adminApi.getOrders(params)
    orderList.value = data.data || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载订单失败:', error)
    orderList.value = []
    total.value = 0
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadOrders()
}

const handlePageChange = () => {
  loadOrders()
}

const handleDetail = async (order) => {
  try {
    const { data } = await adminApi.getOrderDetail(order.id)
    selectedOrder.value = data
  } catch (error) {
    console.error('加载订单详情失败:', error)
    selectedOrder.value = order
  }
  showDetail.value = true
}

const handleCancel = async (order) => {
  try {
    await showConfirmDialog({
      title: '取消订单',
      message: `确定要取消订单 ${order.order_no} 吗？`
    })
    await adminApi.updateOrderStatus(order.id, { status: 6, description: '订单已取消' })
    order.status = 6
    showToast('订单已取消')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      showToast('操作失败')
    }
  }
}

const handlePrepare = async (order) => {
  try {
    await showConfirmDialog({
      title: '备货完成',
      message: '确认商品已备货完成，准备配送？'
    })
    await adminApi.updateOrderStatus(order.id, { status: 2, description: '商品已备货完成，快递员已取件，正在配送中' })
    order.status = 2
    showToast('备货完成')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新状态失败:', error)
      showToast('操作失败')
    }
  }
}

const handleDeliver = async (order) => {
  try {
    await showConfirmDialog({
      title: '确认送达',
      message: '确认订单已送达客户？'
    })
    await adminApi.updateOrderStatus(order.id, { status: 3, description: '商品已送达，等待客户确认收货' })
    order.status = 3
    showToast('已确认送达')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新状态失败:', error)
      showToast('操作失败')
    }
  }
}

const handleStatusChange = async () => {
  try {
    const statusDescMap = {
      0: '订单已重新置为待付款',
      1: '付款成功，商家正在备货',
      2: '商品已发出，正在配送中',
      3: '商品已送达，等待确认收货',
      4: '已确认收货，订单完成',
      5: '进入售后处理流程',
      6: '订单已关闭'
    }
    const description = statusDescMap[selectedOrder.value.status] || '订单状态已更新'
    await adminApi.updateOrderStatus(selectedOrder.value.id, { status: selectedOrder.value.status, description })
    showToast('状态已更新')
    loadOrders()
  } catch (error) {
    console.error('更新状态失败:', error)
    showToast('操作失败')
  }
}

const handleExport = async () => {
  try {
    showToast({ message: '正在导出...', duration: 0 })
    
    const params = {
      keyword: keyword.value,
      status: statusFilter.value >= 0 ? statusFilter.value : undefined
    }
    
    const response = await adminApi.exportOrders(params)
    
    const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    const filename = `订单数据_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    showToast('导出成功')
  } catch (error) {
    console.error('导出订单失败:', error)
    showToast('导出失败，请稍后重试')
  }
}

// 会话相关
const showChat = ref(false)
const chatUser = ref(null)
const chatInput = ref('')
const chatMessages = ref([])
const chatMessagesRef = ref(null)

const openChat = async (order) => {
  chatUser.value = {
    user_id: order.user_id,
    user_name: order.user_name || '未知用户',
    user_phone: order.user_phone || '未获取',
    order_no: order.order_no
  }
  showChat.value = true
  
  // 从后端加载历史消息
  try {
    const { data } = await adminApi.getChatHistory({
      user_id: order.user_id,
      order_no: order.order_no
    })
    chatMessages.value = (data || []).map(msg => ({
      content: msg.content,
      is_admin: msg.sender_type === 2,
      time: new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }))
  } catch (error) {
    console.error('加载聊天记录失败:', error)
    chatMessages.value = []
  }
  
  setTimeout(() => scrollChatBottom(), 100)
}

const sendMessage = async () => {
  if (!chatInput.value.trim()) return
  const content = chatInput.value.trim()
  chatInput.value = ''
  
  try {
    const { data } = await adminApi.sendChatMessage({
      user_id: chatUser.value.user_id,
      order_no: chatUser.value.order_no,
      content
    })
    
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    chatMessages.value.push({
      content: data.content,
      is_admin: true,
      time
    })
    setTimeout(() => scrollChatBottom(), 50)
  } catch (error) {
    console.error('发送消息失败:', error)
    showToast('发送失败')
  }
}

const sendQuickMessage = async (content) => {
  try {
    const { data } = await adminApi.sendChatMessage({
      user_id: chatUser.value.user_id,
      order_no: chatUser.value.order_no,
      content
    })
    
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`
    chatMessages.value.push({
      content: data.content,
      is_admin: true,
      time
    })
    setTimeout(() => scrollChatBottom(), 50)
  } catch (error) {
    console.error('发送消息失败:', error)
    showToast('发送失败')
  }
}

const scrollChatBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

onMounted(() => {
  loadOrders()
  loadOrderStats()
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

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-section .van-search {
  flex: 1;
}

.search-section .van-dropdown-menu {
  width: 200px;
}

.order-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-value.pending { color: #faad14; }
.stat-value.preparing { color: #1890ff; }
.stat-value.delivering { color: #722ed1; }
.stat-value.completed { color: #52c41a; }
.stat-value.aftersale { color: #f5222d; }

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  gap: 12px;
}

.order-no {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-body {
  padding: 12px 16px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 14px;
  color: #333;
}

.item-qty {
  font-size: 12px;
  color: #999;
}

.item-price {
  font-size: 14px;
  color: #FF6B35;
  font-weight: 500;
}

.order-summary {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.total-items {
  font-size: 12px;
  color: #999;
}

.total-amount {
  font-size: 14px;
  color: #333;
}

.total-amount strong {
  color: #FF6B35;
  font-size: 16px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
}

.empty-state p {
  margin-top: 10px;
  color: #999;
}

.detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-header h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.detail-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.info-row {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.detail-section {
  margin: 16px 0;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.detail-item-img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.detail-item-info {
  flex: 1;
}

.detail-item-name {
  font-size: 14px;
  color: #333;
}

.detail-item-qty {
  font-size: 12px;
  color: #999;
}

.detail-item-price {
  font-size: 14px;
  color: #FF6B35;
  font-weight: 500;
}

.amount-highlight {
  color: #FF6B35;
  font-weight: 600;
}

.detail-actions {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
  }
  
  .search-section .van-dropdown-menu {
    width: 100%;
  }
  
  .order-stats {
    flex-wrap: wrap;
  }
  
  .stat-item {
    width: calc(20% - 12px);
  }
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info-text {
  flex: 1;
}

.user-info-text .info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

/* 会话弹窗 */
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

.chat-phone {
  color: #999;
  font-size: 13px;
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
  background: #FF6B35;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-msg.user .chat-msg-bubble {
  background: #f0f0f0;
  color: #333;
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

.chat-quick-actions {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  flex-wrap: wrap;
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