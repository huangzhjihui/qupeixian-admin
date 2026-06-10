<template>
  <div class="recharge">
    <van-nav-bar title="余额充值" left-arrow @click-left="$router.back()" :fixed="true" />

    <!-- 余额卡片 -->
    <div class="balance-card">
      <div class="balance-label">当前余额</div>
      <div class="balance-value">
        <span class="currency">¥</span>
        <span class="amount">{{ formatPrice(currentBalance) }}</span>
      </div>
    </div>

    <!-- 充值金额选择 -->
    <div class="section">
      <div class="section-title">选择充值金额</div>
      <div class="amount-grid">
        <div
          v-for="item in presetAmounts"
          :key="item.value"
          class="amount-item"
          :class="{ active: selectedAmount === item.value && !customMode }"
          @click="selectPreset(item.value)"
        >
          <span class="amount-num">¥{{ item.value }}</span>
          <span v-if="item.tag" class="amount-tag">{{ item.tag }}</span>
        </div>
      </div>

      <!-- 自定义金额 -->
      <div class="custom-amount" :class="{ active: customMode }" @click="enableCustom">
        <span v-if="!customMode" class="custom-label">自定义金额</span>
        <div v-else class="custom-input-wrap">
          <span class="custom-currency">¥</span>
          <input
            ref="customInputRef"
            v-model="customAmount"
            type="number"
            class="custom-input"
            placeholder="输入充值金额"
            min="1"
            max="50000"
            step="0.01"
          />
        </div>
      </div>
      <p v-if="amountError" class="error-text">{{ amountError }}</p>
    </div>

    <!-- 支付方式 -->
    <div class="section">
      <div class="section-title">支付方式</div>
      <div class="method-item" :class="{ active: payMethod === 'wechat' }" @click="payMethod = 'wechat'">
        <div class="method-left">
          <div class="method-icon wechat-bg">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/></svg>
          </div>
          <span class="method-name">微信支付</span>
        </div>
        <span class="radio-dot" :class="{ checked: payMethod === 'wechat' }"></span>
      </div>
      <div class="method-item" :class="{ active: payMethod === 'alipay' }" @click="payMethod = 'alipay'">
        <div class="method-left">
          <div class="method-icon alipay-bg">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M21.422 14.763c-1.324-.588-3.27-1.374-5.522-2.156.567-1.064 1.017-2.25 1.318-3.534h-3.63V7.586h4.472V6.497h-4.472V3.855h-2.28s0 .15 0 2.642H6.855v1.089h4.453v1.487H7.575v1.089h7.798a14.86 14.86 0 0 1-.903 2.395c-2.46-.757-4.887-1.271-6.725-1.271-3.216 0-5.088 1.727-5.088 3.652 0 2.61 2.604 3.966 5.99 3.966 2.694 0 5.267-1.06 7.344-2.862 1.865 1.048 3.482 2.155 4.544 3.006L21.422 14.763z"/></svg>
          </div>
          <span class="method-name">支付宝</span>
        </div>
        <span class="radio-dot" :class="{ checked: payMethod === 'alipay' }"></span>
      </div>
    </div>

    <!-- 充值说明 -->
    <div class="tips-section">
      <van-icon name="info-o" size="16" />
      <span>充值说明</span>
      <div class="tips-list">
        <p>1. 充值金额最低 ¥1.00，最高 ¥50000.00</p>
        <p>2. 充值金额将实时到账余额</p>
        <p>3. 余额可用于订单支付抵扣</p>
      </div>
    </div>

    <!-- 底部充值按钮 -->
    <div class="footer-bar">
      <div class="footer-info">
        <span class="footer-label">充值金额</span>
        <span class="footer-amount">¥{{ formatPrice(finalAmount) }}</span>
      </div>
      <van-button type="primary" round class="recharge-btn" :disabled="finalAmount <= 0" @click="handleRecharge">
        立即充值
      </van-button>
    </div>

    <!-- 密码弹窗 -->
    <Teleport to="body">
      <div v-if="showPassword" class="pwd-full-modal">
        <div class="pwd-backdrop" @click="closePassword"></div>
        <div class="pwd-content">
          <div class="pwd-header">
            <span class="pwd-close" @click="closePassword">
              <van-icon name="cross" size="20" />
            </span>
            <span class="pwd-title">请输入支付密码</span>
            <span class="pwd-amount">¥{{ formatPrice(finalAmount) }}</span>
          </div>
          <div class="pwd-body">
            <p class="pwd-desc">付款给 趣配鲜商城</p>
            <div class="pwd-input-box" @click="showKeyboard = true">
              <span v-for="i in 6" :key="i" class="pwd-dot" :class="{ filled: i <= password.length }"></span>
            </div>
            <p class="pwd-counter">已输入 {{ password.length }}/6 位</p>
            <p v-if="passwordError" class="pwd-error">{{ passwordError }}</p>
            <p class="pwd-tip">默认支付密码：123456</p>
          </div>
          <div class="pwd-keyboard">
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
              <button class="kb-key kb-func" @click="showKeyboard = false"><van-icon name="apps-o" size="22" /></button>
              <button class="kb-key" @click="onKeyPress('0')">0</button>
              <button class="kb-key kb-func" @click="onDeleteKey"><van-icon name="delete-o" size="22" /></button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 充值结果弹窗 -->
    <Teleport to="body">
      <div v-if="showResult" class="result-modal">
        <div class="result-backdrop" @click="closeResult"></div>
        <div class="result-card">
          <div v-if="rechargeSuccess" class="result-success-icon">
            <van-icon name="success" size="64" color="#52c41a" />
          </div>
          <div v-else class="result-fail-icon">
            <van-icon name="cross" size="64" color="#ee0a24" />
          </div>
          <h3 class="result-title">{{ rechargeSuccess ? '充值成功' : '充值失败' }}</h3>
          <p v-if="rechargeSuccess" class="result-amount">¥{{ formatPrice(resultData?.recharge_amount) }}</p>
          <p v-else class="result-msg">{{ resultMessage }}</p>
          <div v-if="rechargeSuccess" class="result-detail">
            <div class="result-row">
              <span>充值前余额</span>
              <span>¥{{ formatPrice(resultData?.old_balance) }}</span>
            </div>
            <div class="result-row">
              <span>充值后余额</span>
              <span class="highlight">¥{{ formatPrice(resultData?.new_balance) }}</span>
            </div>
            <div class="result-row">
              <span>交易号</span>
              <span>{{ resultData?.transaction_id }}</span>
            </div>
          </div>
          <van-button v-if="rechargeSuccess" type="primary" block round @click="closeResult">完成</van-button>
          <van-button v-else type="primary" block round @click="closeResultAndRetry">重新充值</van-button>
        </div>
      </div>
    </Teleport>

    <!-- 支付处理中 -->
    <Teleport to="body">
      <div v-if="processing" class="processing-overlay">
        <div class="processing-card">
          <van-loading type="spinner" size="48px" color="#FF6B35" />
          <p>充值处理中...</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { userApi } from '@/api'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const currentBalance = ref(0)
const selectedAmount = ref(100)
const customMode = ref(false)
const customAmount = ref('')
const customInputRef = ref(null)
const amountError = ref('')
const payMethod = ref('wechat')

// 密码相关
const showPassword = ref(false)
const showKeyboard = ref(true)
const password = ref('')
const passwordError = ref('')

// 结果相关
const showResult = ref(false)
const rechargeSuccess = ref(false)
const resultData = ref(null)
const resultMessage = ref('')
const processing = ref(false)

const presetAmounts = [
  { value: 50, tag: '' },
  { value: 100, tag: '推荐' },
  { value: 200, tag: '' },
  { value: 500, tag: '热门' },
  { value: 1000, tag: '' },
  { value: 2000, tag: '' }
]

const finalAmount = computed(() => {
  if (customMode.value) {
    const val = parseFloat(customAmount.value)
    return isNaN(val) ? 0 : val
  }
  return selectedAmount.value || 0
})

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00'
  return parseFloat(price).toFixed(2)
}

const selectPreset = (amount) => {
  customMode.value = false
  customAmount.value = ''
  selectedAmount.value = amount
  amountError.value = ''
}

const enableCustom = () => {
  customMode.value = true
  selectedAmount.value = 0
  amountError.value = ''
  setTimeout(() => {
    customInputRef.value?.focus()
  }, 100)
}

const handleRecharge = () => {
  const amount = finalAmount.value
  if (amount < 1) {
    amountError.value = '最低充值金额为 ¥1.00'
    return
  }
  if (amount > 50000) {
    amountError.value = '单次充值金额不能超过 ¥50000'
    return
  }
  amountError.value = ''
  password.value = ''
  passwordError.value = ''
  showPassword.value = true
  showKeyboard.value = true
}

const closePassword = () => {
  showPassword.value = false
  showKeyboard.value = false
  password.value = ''
  passwordError.value = ''
}

const onKeyPress = (key) => {
  if (password.value.length < 6) {
    password.value += key
    if (password.value.length === 6) {
      showKeyboard.value = false
      submitRecharge()
    }
  }
}

const onDeleteKey = () => {
  if (password.value.length > 0) {
    password.value = password.value.slice(0, -1)
    passwordError.value = ''
  }
}

const submitRecharge = async () => {
  try {
    processing.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))

    const { data } = await userApi.recharge({
      amount: finalAmount.value,
      pay_method: payMethod.value,
      pay_password: password.value
    })

    closePassword()
    processing.value = false

    rechargeSuccess.value = true
    resultData.value = data
    showResult.value = true

    // 更新 store 中的余额
    currentBalance.value = data.new_balance
    if (userStore.userInfo) {
      userStore.userInfo.balance = data.new_balance
      userStore.setUserInfo({ ...userStore.userInfo })
    }
  } catch (err) {
    processing.value = false
    const msg = err?.response?.data?.message || err?.message || err?.apiMessage || '充值失败'
    if (msg.includes('密码')) {
      passwordError.value = msg
      password.value = ''
      showKeyboard.value = true
    } else {
      closePassword()
      rechargeSuccess.value = false
      resultMessage.value = msg
      showResult.value = true
    }
  }
}

const closeResult = () => {
  showResult.value = false
  resultData.value = null
}

const closeResultAndRetry = () => {
  showResult.value = false
  resultData.value = null
}

onMounted(async () => {
  try {
    const { data } = await userApi.getBalance()
    currentBalance.value = parseFloat(data?.balance) || 0
  } catch {
    currentBalance.value = parseFloat(userStore.userInfo?.balance) || 0
  }
})
</script>

<style scoped>
.recharge {
  min-height: 100vh;
  background: #f5f5f5;
  padding-top: 46px;
  padding-bottom: 80px;
}

.balance-card {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  padding: 30px 20px;
  text-align: center;
  margin-bottom: 12px;
}

.balance-label {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 8px;
}

.balance-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.currency {
  font-size: 24px;
  color: white;
  font-weight: bold;
}

.amount {
  font-size: 48px;
  color: white;
  font-weight: bold;
  letter-spacing: -1px;
}

.section {
  background: white;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.amount-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 2px solid #eee;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.amount-item.active {
  border-color: #FF6B35;
  background: #fff8f5;
}

.amount-num {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.amount-item.active .amount-num {
  color: #FF6B35;
}

.amount-tag {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #FF6B35;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

.custom-amount {
  border: 2px solid #eee;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.custom-amount.active {
  border-color: #FF6B35;
}

.custom-label {
  font-size: 16px;
  color: #999;
}

.custom-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-currency {
  font-size: 24px;
  font-weight: bold;
  color: #FF6B35;
}

.custom-input {
  flex: 1;
  border: none;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  outline: none;
  background: transparent;
}

.custom-input::placeholder {
  color: #ccc;
  font-weight: normal;
  font-size: 16px;
}

.error-text {
  color: #ee0a24;
  font-size: 13px;
  margin-top: 8px;
}

/* 支付方式 */
.method-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.method-item:last-child {
  border-bottom: none;
}

.method-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-bg { background: #07c160; }
.alipay-bg { background: #1677ff; }

.method-name {
  font-size: 15px;
  color: #333;
}

.radio-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.radio-dot.checked {
  border-color: #FF6B35;
  background: #FF6B35;
}

.radio-dot.checked::after {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: white;
}

/* 提示 */
.tips-section {
  background: white;
  padding: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #999;
}

.tips-section .van-icon {
  margin-right: 4px;
}

.tips-list {
  margin-top: 8px;
  padding-left: 20px;
}

.tips-list p {
  margin: 4px 0;
  line-height: 1.6;
}

/* 底部 */
.footer-bar {
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

.footer-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
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

.recharge-btn {
  min-width: 140px;
  height: 44px;
  font-size: 16px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  border: none;
}

/* 密码弹窗 */
.pwd-full-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9000;
}

.pwd-backdrop {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
}

.pwd-content {
  position: absolute;
  bottom: 0; left: 0; right: 0;
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

.pwd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.pwd-close { cursor: pointer; color: #999; }
.pwd-title { font-size: 16px; font-weight: 600; color: #333; }
.pwd-amount { font-size: 16px; font-weight: bold; color: #FF6B35; }

.pwd-body {
  padding: 24px 32px 16px;
  text-align: center;
}

.pwd-desc { font-size: 14px; color: #666; margin-bottom: 20px; }

.pwd-input-box {
  display: flex;
  justify-content: center;
  margin: 0 auto;
  width: fit-content;
  cursor: pointer;
}

.pwd-dot {
  width: 46px; height: 50px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.pwd-dot:first-child { border-radius: 6px 0 0 6px; }
.pwd-dot:last-child { border-radius: 0 6px 6px 0; }
.pwd-dot + .pwd-dot { border-left: none; }

.pwd-dot.filled::after {
  content: '';
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #333;
}

.pwd-counter { font-size: 14px; color: #FF6B35; margin-top: 10px; font-weight: 500; }
.pwd-error { color: #ee0a24; font-size: 13px; margin-top: 8px; }
.pwd-tip { color: #bbb; font-size: 12px; margin-top: 12px; }

.pwd-keyboard {
  background: #f5f5f5;
  padding: 6px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
}

.kb-row { display: flex; gap: 6px; margin-bottom: 6px; }
.kb-row:last-child { margin-bottom: 0; }

.kb-key {
  flex: 1; height: 48px;
  border: none; border-radius: 8px;
  background: white;
  font-size: 22px; font-weight: 500; color: #333;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.kb-key:active { background: #e0e0e0; }
.kb-func { background: #e8e8e8; color: #666; }
.kb-func:active { background: #d0d0d0; }

/* 结果弹窗 */
.result-modal {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-backdrop {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
}

.result-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  width: 85%;
  max-width: 360px;
  text-align: center;
  z-index: 1;
}

.result-success-icon,
.result-fail-icon {
  margin-bottom: 16px;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.result-amount {
  font-size: 36px;
  font-weight: bold;
  color: #52c41a;
  margin-bottom: 16px;
}

.result-msg {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.result-detail {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.result-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  color: #666;
}

.result-row .highlight {
  color: #FF6B35;
  font-weight: bold;
}

/* 处理中 */
.processing-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.processing-card {
  background: white;
  border-radius: 16px;
  padding: 40px 48px;
  text-align: center;
}

.processing-card p {
  margin-top: 16px;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}
</style>
