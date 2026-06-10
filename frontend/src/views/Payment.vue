<template>
  <div class="payment">
    <van-nav-bar title="收银台" left-arrow @click-left="handleBack" :fixed="true" />

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <van-loading size="36px" vertical>加载中...</van-loading>
    </div>

    <!-- 支付超时/订单关闭 -->
    <div v-else-if="orderExpired" class="expired-state">
      <div class="expired-icon">
        <van-icon name="clock-o" size="64" color="#faad14" />
      </div>
      <h2 class="expired-title">订单已关闭</h2>
      <p class="expired-desc">该订单已超过支付时限，已自动取消</p>
      <div class="expired-actions">
        <van-button type="primary" block round @click="$router.replace('/')">重新选购</van-button>
        <van-button plain block round @click="$router.replace('/orders')">查看订单</van-button>
      </div>
    </div>

    <!-- 支付结果页 -->
    <div v-else-if="payResult !== null" class="result-page">
      <!-- 支付成功 -->
      <div v-if="payResult.success" class="result-success">
        <div class="result-header success-bg">
          <div class="result-icon-wrapper">
            <van-icon name="success" size="36" color="#fff" />
          </div>
          <h2 class="result-title">支付成功</h2>
          <p class="result-amount">¥{{ formatPrice(payResult.pay_amount) }}</p>
        </div>
        <div class="result-detail">
          <div class="detail-row">
            <span class="detail-label">订单号</span>
            <span class="detail-value">{{ payResult.order_no }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">交易号</span>
            <span class="detail-value">{{ payResult.transaction_id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">支付方式</span>
            <span class="detail-value">{{ getPayMethodText(payResult.pay_method) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">支付时间</span>
            <span class="detail-value">{{ formatTime(payResult.pay_time) }}</span>
          </div>
        </div>
        <div class="result-actions">
          <van-button type="primary" block round @click="$router.replace('/order/' + orderId)">查看订单详情</van-button>
          <van-button plain block round @click="$router.replace('/orders')">我的订单</van-button>
          <van-button plain block round @click="$router.replace('/')">返回首页</van-button>
        </div>
      </div>

      <!-- 支付失败 -->
      <div v-else class="result-fail">
        <div class="result-header fail-bg">
          <div class="result-icon-wrapper fail">
            <van-icon name="cross" size="36" color="#fff" />
          </div>
          <h2 class="result-title">支付失败</h2>
          <p class="result-fail-reason">{{ payResult.message || '支付过程中出现问题' }}</p>
        </div>
        <div class="result-actions">
          <van-button type="primary" block round @click="resetPayment">重新支付</van-button>
          <van-button plain block round @click="$router.replace('/orders')">返回订单</van-button>
        </div>
      </div>
    </div>

    <!-- 支付处理中 (全屏遮罩) -->
    <div v-if="paying" class="paying-overlay">
      <div class="paying-content">
        <div class="paying-spinner">
          <van-loading type="spinner" size="48px" color="#FF6B35" />
        </div>
        <p class="paying-text">支付处理中...</p>
        <p class="paying-sub">请稍候，正在处理您的付款</p>
      </div>
    </div>

    <!-- 主支付页面 -->
    <div v-else-if="orderInfo" class="payment-content">
      <!-- 倒计时区域 -->
      <div class="countdown-bar" :class="{ warning: remainSeconds < 300 }">
        <van-icon name="clock-o" />
        <span v-if="remainSeconds > 0">
          请在 <strong>{{ countdownText }}</strong> 内完成支付，超时将自动取消
        </span>
        <span v-else class="countdown-expired">支付超时</span>
      </div>

      <!-- 金额展示区 -->
      <div class="amount-section">
        <p class="amount-label">需支付金额</p>
        <div class="amount-value">
          <span class="currency">¥</span>
          <span class="amount-num">{{ formatPrice(orderInfo.pay_amount) }}</span>
        </div>
        <p class="amount-order-no">订单号：{{ orderInfo.order_no }}</p>
      </div>

      <!-- 费用明细 -->
      <div class="fee-detail">
        <div class="fee-row">
          <span>商品金额</span>
          <span>¥{{ formatPrice(orderInfo.total_amount) }}</span>
        </div>
        <div class="fee-row">
          <span>运费</span>
          <span>{{ parseFloat(orderInfo.freight) === 0 ? '免运费' : '¥' + formatPrice(orderInfo.freight) }}</span>
        </div>
        <div v-if="parseFloat(orderInfo.discount_amount) > 0" class="fee-row discount">
          <span>优惠券</span>
          <span>-¥{{ formatPrice(orderInfo.discount_amount) }}</span>
        </div>
      </div>

      <!-- 商品缩略 -->
      <div class="goods-section">
        <div class="goods-header">
          <span>商品信息</span>
          <span class="goods-count">共{{ totalItemCount }}件</span>
        </div>
        <div class="goods-scroll">
          <div v-for="item in orderInfo.items" :key="item.id" class="goods-item">
            <img :src="item.product_image" :alt="item.product_name" class="goods-img" />
            <div class="goods-info">
              <p class="goods-name">{{ item.product_name }}</p>
              <div class="goods-bottom">
                <span class="goods-price">¥{{ formatPrice(item.total_price) }}</span>
                <span class="goods-qty">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="pay-method-section">
        <div class="section-header">
          <van-icon name="shield-o" color="#FF6B35" />
          <span>选择支付方式</span>
        </div>
        <div class="method-item" :class="{ active: selectedMethod === 'wechat' }" @click="selectedMethod = 'wechat'">
          <div class="method-left">
            <div class="method-icon wechat-bg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.310 4.065c-3.846 0-7.088 2.599-7.088 5.953 0 3.354 3.242 5.953 7.088 5.953a8.4 8.4 0 0 0 2.362-.339.748.748 0 0 1 .593.083l1.56.909a.272.272 0 0 0 .136.046c.133 0 .24-.108.24-.243 0-.06-.024-.118-.04-.175l-.317-1.208a.482.482 0 0 1 .175-.546C21.163 19.537 22 17.89 22 16.01c0-3.354-3.158-5.953-7.092-5.953zm-2.545 3.203c.527 0 .955.435.955.97a.963.963 0 0 1-.955.97.963.963 0 0 1-.955-.97c0-.535.428-.97.955-.97zm5.09 0c.527 0 .955.435.955.97a.963.963 0 0 1-.955.97.963.963 0 0 1-.955-.97c0-.535.428-.97.955-.97z"/></svg>
            </div>
            <div class="method-text">
              <span class="method-name">微信支付</span>
              <span class="method-desc">推荐使用微信安全支付</span>
            </div>
          </div>
          <span class="radio-check" :class="{ checked: selectedMethod === 'wechat' }"></span>
        </div>
        <div class="method-item" :class="{ active: selectedMethod === 'alipay' }" @click="selectedMethod = 'alipay'">
          <div class="method-left">
            <div class="method-icon alipay-bg">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M21.422 14.763c-1.324-.588-3.27-1.374-5.522-2.156.567-1.064 1.017-2.25 1.318-3.534h-3.63V7.586h4.472V6.497h-4.472V3.855h-2.28s0 .15 0 2.642H6.855v1.089h4.453v1.487H7.575v1.089h7.798a14.86 14.86 0 0 1-.903 2.395c-2.46-.757-4.887-1.271-6.725-1.271-3.216 0-5.088 1.727-5.088 3.652 0 2.61 2.604 3.966 5.99 3.966 2.694 0 5.267-1.06 7.344-2.862 1.865 1.048 3.482 2.155 4.544 3.006L21.422 14.763zM7.566 17.808c-2.358 0-3.708-.834-3.708-2.184 0-1.212 1.164-2.172 3.258-2.172 1.734 0 3.912.522 6.042 1.338-1.692 1.836-3.63 3.018-5.592 3.018z"/></svg>
            </div>
            <div class="method-text">
              <span class="method-name">支付宝</span>
              <span class="method-desc">支付宝安全支付</span>
            </div>
          </div>
          <span class="radio-check" :class="{ checked: selectedMethod === 'alipay' }"></span>
        </div>
        <div class="method-item" :class="{ active: selectedMethod === 'balance' }" @click="selectedMethod = 'balance'">
          <div class="method-left">
            <div class="method-icon balance-bg">
              <van-icon name="balance-o" size="22" color="#fff" />
            </div>
            <div class="method-text">
              <span class="method-name">余额支付</span>
              <span class="method-desc">当前余额：¥0.00</span>
            </div>
          </div>
          <span class="radio-check" :class="{ checked: selectedMethod === 'balance' }"></span>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="security-tip">
        <van-icon name="shield-o" color="#52c41a" />
        <span>支付安全由趣配鲜保障，资金即时到账</span>
      </div>
    </div>

    <!-- 订单加载失败 -->
    <div v-else class="error-state">
      <van-empty description="订单信息加载失败">
        <van-button type="primary" plain round @click="$router.back()">返回</van-button>
      </van-empty>
    </div>

    <!-- 底部支付按钮（固定） -->
    <div v-if="orderInfo && !payResult && !loading && !orderExpired" class="pay-footer">
      <div class="footer-left">
        <span class="footer-label">实付</span>
        <span class="footer-amount">¥{{ formatPrice(orderInfo.pay_amount) }}</span>
      </div>
      <van-button
        type="primary"
        round
        class="pay-btn"
        :disabled="remainSeconds <= 0"
        @click="openPasswordDialog"
      >
        确认支付
      </van-button>
    </div>

    <!-- 支付密码弹窗（整合式） -->
    <Teleport to="body">
      <div v-if="showPassword" class="pwd-full-modal">
        <!-- 背景遮罩 -->
        <div class="pwd-backdrop" @click="closePassword"></div>
        <!-- 内容区 -->
        <div class="pwd-content">
          <div class="password-header">
            <span class="password-close" @click="closePassword">
              <van-icon name="cross" size="20" />
            </span>
            <span class="password-title">请输入支付密码</span>
            <span class="password-amount">¥{{ formatPrice(orderInfo?.pay_amount) }}</span>
          </div>
          <div class="password-body">
            <div class="password-merchant">
              <span>付款给</span>
              <strong>趣配鲜商城</strong>
            </div>
            <div class="pwd-input-box" @click="showKeyboard = true">
              <span v-for="i in 6" :key="i" class="pwd-dot" :class="{ filled: i <= password.length }"></span>
            </div>
            <p class="password-counter">已输入 {{ password.length }}/6 位</p>
            <p v-if="passwordError" class="password-error">{{ passwordError }}</p>
            <p class="password-tip">默认支付密码：123456</p>
          </div>
          <!-- 键盘嵌入在弹窗内 -->
          <div class="num-keyboard-inline">
            <div class="kb-row">
              <button class="kb-key" @click="onKeyPress('1')">1</button>
              <button class="kb-key" @click="onKeyPress('2')">2</button>
              <button class="kb-key" @click="onKeyPress('3')">3</button>
            </div>
            <div class="kb-row">
              <button class="kb-key" @click="onKeyPress('4')">4</button>
              <button class="kb-key" @click="onKeyPress('5')">5</button>
              <button class="kb-key" @click="onKeyPress('6')">6</button>
            </div>
            <div class="kb-row">
              <button class="kb-key" @click="onKeyPress('7')">7</button>
              <button class="kb-key" @click="onKeyPress('8')">8</button>
              <button class="kb-key" @click="onKeyPress('9')">9</button>
            </div>
            <div class="kb-row">
              <button class="kb-key kb-func" @click="showKeyboard = false">
                <van-icon name="apps-o" size="22" />
              </button>
              <button class="kb-key" @click="onKeyPress('0')">0</button>
              <button class="kb-key kb-func" @click="onDeleteKey">
                <van-icon name="delete-o" size="22" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { orderApi } from '@/api'

const route = useRoute()
const router = useRouter()

const orderId = ref(route.params.id)
const orderInfo = ref(null)
const loading = ref(true)
const paying = ref(false)
const payResult = ref(null) // null=未支付, {success:true/false, ...}
const orderExpired = ref(false)

// 倒计时
const remainSeconds = ref(0)
let countdownTimer = null

// 支付方式
const selectedMethod = ref('wechat')

// 密码
const showPassword = ref(false)
const showKeyboard = ref(false)
const password = ref('')
const passwordError = ref('')

// 计算属性
const countdownText = computed(() => {
  const mins = Math.floor(remainSeconds.value / 60)
  const secs = remainSeconds.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

const totalItemCount = computed(() => {
  if (!orderInfo.value?.items) return 0
  return orderInfo.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
})

// 工具函数
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00'
  return parseFloat(price).toFixed(2)
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const d = new Date(timeStr)
  return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`
}

const getPayMethodText = (method) => {
  const map = { wechat: '微信支付', alipay: '支付宝', balance: '余额支付' }
  return map[method] || method || '微信支付'
}

// 倒计时逻辑
const startCountdown = () => {
  stopCountdown()
  countdownTimer = setInterval(() => {
    if (remainSeconds.value <= 0) {
      stopCountdown()
      orderExpired.value = true
      orderInfo.value = null
      return
    }
    remainSeconds.value--
  }, 1000)
}

const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 加载支付信息
const loadPaymentInfo = async () => {
  try {
    loading.value = true
    const { data } = await orderApi.getPaymentInfo(orderId.value)
    orderInfo.value = data
    remainSeconds.value = data.remain_seconds || 0
    if (remainSeconds.value <= 0) {
      orderExpired.value = true
      orderInfo.value = null
    } else {
      startCountdown()
    }
  } catch (err) {
    console.error('加载支付信息失败:', err)
    const msg = err?.response?.data?.message || err?.message || err?.apiMessage || '加载失败'
    if (msg.includes('超时') || msg.includes('取消')) {
      orderExpired.value = true
    } else {
      showToast(msg)
    }
  } finally {
    loading.value = false
  }
}

// 打开密码弹窗
const openPasswordDialog = () => {
  password.value = ''
  passwordError.value = ''
  showPassword.value = true
  showKeyboard.value = true
}

// 关闭密码弹窗
const closePassword = () => {
  showPassword.value = false
  showKeyboard.value = false
  password.value = ''
  passwordError.value = ''
}

// 密码输入完成
const onPasswordInput = () => {
  if (password.value.length === 6) {
    showKeyboard.value = false
    submitPayment()
  }
}

// 自定义键盘按键处理
const onKeyPress = (key) => {
  if (password.value.length < 6) {
    password.value += key
    // 输入满6位自动提交
    if (password.value.length === 6) {
      showKeyboard.value = false
      submitPayment()
    }
  }
}

// 删除键
const onDeleteKey = () => {
  if (password.value.length > 0) {
    password.value = password.value.slice(0, -1)
    passwordError.value = ''
  }
}

// 提交支付
const submitPayment = async () => {
  try {
    paying.value = true
    // 模拟支付处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const { data } = await orderApi.payOrder(orderId.value, {
      pay_method: selectedMethod.value,
      pay_password: password.value
    })
    
    closePassword()
    paying.value = false
    
    // 支付成功动画延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    payResult.value = { success: true, ...data }
    stopCountdown()
  } catch (err) {
    console.error('支付失败:', err)
    paying.value = false
    const msg = err?.response?.data?.message || err?.message || err?.apiMessage || '支付失败'
    
    if (msg.includes('密码')) {
      passwordError.value = msg
      password.value = ''
      showKeyboard.value = true
    } else if (msg.includes('超时') || msg.includes('取消')) {
      closePassword()
      orderExpired.value = true
      orderInfo.value = null
    } else {
      closePassword()
      payResult.value = { success: false, message: msg }
    }
  }
}

// 重置支付
const resetPayment = () => {
  payResult.value = null
  password.value = ''
  passwordError.value = ''
  loadPaymentInfo()
}

// 返回处理
const handleBack = () => {
  if (payResult.value?.success) {
    router.replace('/orders')
  } else {
    router.back()
  }
}

onMounted(() => {
  loadPaymentInfo()
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.payment {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-top: 46px;
  padding-bottom: 80px;
}

/* 加载 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

/* 倒计时栏 */
.countdown-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #fff7e6 0%, #fff3e0 100%);
  font-size: 13px;
  color: #e65100;
}

.countdown-bar strong {
  font-size: 15px;
  color: #d84315;
}

.countdown-bar.warning {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  animation: pulse 1s infinite;
}

.countdown-bar.warning strong {
  color: #c62828;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.countdown-expired {
  font-weight: bold;
  color: #c62828;
}

/* 金额展示 */
.amount-section {
  background: white;
  padding: 28px 20px;
  text-align: center;
  margin-bottom: 10px;
}

.amount-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.amount-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 10px;
}

.currency {
  font-size: 24px;
  color: #333;
  font-weight: bold;
}

.amount-num {
  font-size: 42px;
  color: #333;
  font-weight: bold;
  letter-spacing: -1px;
}

.amount-order-no {
  font-size: 12px;
  color: #bbb;
}

/* 费用明细 */
.fee-detail {
  background: white;
  padding: 14px 20px;
  margin-bottom: 10px;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: #666;
}

.fee-row.discount span:last-child {
  color: #FF6B35;
}

/* 商品信息 */
.goods-section {
  background: white;
  padding: 14px 16px;
  margin-bottom: 10px;
}

.goods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.goods-count {
  font-size: 12px;
  font-weight: normal;
  color: #999;
}

.goods-scroll {
  max-height: 200px;
  overflow-y: auto;
}

.goods-item {
  display: flex;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 14px;
  color: #FF6B35;
  font-weight: bold;
}

.goods-qty {
  font-size: 12px;
  color: #999;
}

/* 支付方式 */
.pay-method-section {
  background: white;
  padding: 16px;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 14px;
}

.method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 12px;
  border: 1px solid #eee;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: all 0.2s;
  cursor: pointer;
}

.method-item.active {
  border-color: #FF6B35;
  background: #fff8f5;
}

.method-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-bg { background: #07c160; }
.alipay-bg { background: #1677ff; }
.balance-bg { background: #ff9500; }

.method-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.method-name {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

.method-desc {
  font-size: 12px;
  color: #999;
}

/* 自定义单选按钮 */
.radio-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.radio-check.checked {
  border-color: #FF6B35;
  background: #FF6B35;
}

.radio-check.checked::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

/* 安全提示 */
.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  font-size: 12px;
  color: #999;
}

/* 底部按钮 */
.pay-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.footer-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.footer-label {
  font-size: 14px;
  color: #666;
}

.footer-amount {
  font-size: 24px;
  color: #FF6B35;
  font-weight: bold;
}

.pay-btn {
  min-width: 160px;
  height: 44px;
  font-size: 16px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  border: none;
}

/* 密码弹窗 - 整合式全屏模态 */
.pwd-full-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9000;
}

.pwd-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
}

.pwd-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 16px 16px 0 0;
  animation: slideUp 0.3s ease-out;
  z-index: 1;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* 密码面板 */
.password-panel {
  padding: 0 0 0;
}

.password-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.password-close {
  cursor: pointer;
  color: #999;
}

.password-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.password-amount {
  font-size: 16px;
  font-weight: bold;
  color: #FF6B35;
}

.password-body {
  padding: 24px 32px 16px;
  text-align: center;
}

.password-merchant {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

/* 自定义密码输入框 */
.pwd-input-box {
  display: flex;
  justify-content: center;
  gap: 0;
  cursor: pointer;
  margin: 0 auto;
  width: fit-content;
}

.pwd-dot {
  width: 46px;
  height: 50px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  position: relative;
}

.pwd-dot:first-child {
  border-radius: 6px 0 0 6px;
}

.pwd-dot:last-child {
  border-radius: 0 6px 6px 0;
}

.pwd-dot + .pwd-dot {
  border-left: none;
}

.pwd-dot.filled::after {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #333;
}

.password-error {
  color: #ee0a24;
  font-size: 13px;
  margin-top: 8px;
}

.password-counter {
  font-size: 14px;
  color: #FF6B35;
  margin-top: 10px;
  font-weight: 500;
}

.password-tip {
  color: #bbb;
  font-size: 12px;
  margin-top: 12px;
}

/* 内嵌数字键盘 */
.num-keyboard-inline {
  background: #f5f5f5;
  padding: 6px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
}

.kb-row {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.kb-row:last-child {
  margin-bottom: 0;
}

.kb-key {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 8px;
  background: white;
  font-size: 22px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.kb-key:active {
  background: #e0e0e0;
}

.kb-func {
  background: #e8e8e8;
  color: #666;
}

.kb-func:active {
  background: #d0d0d0;
}

/* 支付处理遮罩 */
.paying-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.paying-content {
  background: white;
  border-radius: 16px;
  padding: 40px 48px;
  text-align: center;
}

.paying-spinner {
  margin-bottom: 16px;
}

.paying-text {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-bottom: 6px;
}

.paying-sub {
  font-size: 13px;
  color: #999;
}

/* 超时关闭页 */
.expired-state {
  padding: 80px 32px 32px;
  text-align: center;
}

.expired-icon {
  margin-bottom: 20px;
}

.expired-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.expired-desc {
  font-size: 14px;
  color: #999;
  margin-bottom: 40px;
}

.expired-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 结果页 */
.result-page {
  min-height: calc(100vh - 46px);
}

.result-header {
  padding: 40px 20px 30px;
  text-align: center;
  color: white;
}

.success-bg {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.fail-bg {
  background: linear-gradient(135deg, #ee0a24 0%, #ff4d4f 100%);
}

.result-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.result-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.result-amount {
  font-size: 36px;
  font-weight: bold;
}

.result-fail-reason {
  font-size: 14px;
  opacity: 0.9;
}

.result-detail {
  background: white;
  margin: -10px 12px 12px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  position: relative;
  z-index: 1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #999;
}

.detail-value {
  color: #333;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.result-actions {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.error-state {
  padding-top: 80px;
}
</style>
