<template>
  <div class="checkout">
    <van-nav-bar title="确认订单" left-arrow @click-left="handleBack" />

    <div class="checkout-content">
      <div class="address-section" @click="$router.push('/addresses?from=checkout')">
        <div v-if="selectedAddress" class="address-info">
          <div class="address-header">
            <span class="address-name">{{ selectedAddress.real_name }}</span>
            <span class="address-phone">{{ selectedAddress.phone }}</span>
            <van-icon v-if="selectedAddress.is_default" name="star" color="#FF6B35" />
          </div>
          <p class="address-detail">{{ selectedAddress.full_address }}</p>
        </div>
        <div v-else class="address-empty">
          <van-icon name="plus" />
          <span>添加收货地址</span>
        </div>
        <van-icon name="chevron-right" />
      </div>

      <div class="section">
        <div class="section-title">配送方式</div>
        <van-radio-group v-model="deliveryMethod">
          <van-radio name="0">同城配送</van-radio>
          <van-radio name="1">到店自提</van-radio>
        </van-radio-group>
      </div>

      <div class="section">
        <div class="section-title">配送时段</div>
        <van-radio-group v-model="deliveryTime">
          <van-radio name="now">今日即时</van-radio>
          <van-radio name="evening">晚间 18:00-21:00</van-radio>
          <van-radio name="next-morning">次日午间 11:00-14:00</van-radio>
          <van-radio name="next-evening">次日晚间 18:00-21:00</van-radio>
        </van-radio-group>
      </div>

      <div class="section">
        <div class="section-title">商品清单</div>
        <div v-if="cartStore.selectedItems.length === 0" class="empty-cart">
          <van-icon name="shopping-cart" size="64" color="#ccc" />
          <p>购物车是空的</p>
          <van-button type="primary" size="small" @click="$router.push('/')">去逛逛</van-button>
        </div>
        <div v-else>
          <div v-for="item in cartStore.selectedItems" :key="item.id" class="order-item">
            <img :src="item.Product?.main_image" :alt="item.Product?.name" class="order-item-img" />
            <div class="order-item-info">
              <h4>{{ item.Product?.name }}</h4>
              <p v-if="item.dietary_note">忌口: {{ item.dietary_note }}</p>
            </div>
            <div class="order-item-right">
              <span class="order-item-price">¥{{ item.Product?.member_price || item.Product?.price }}</span>
              <span class="order-item-quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">优惠券</div>
        <div class="coupon-select" @click="showCouponPicker = true">
          <span v-if="selectedCoupon" class="coupon-selected">{{ selectedCoupon.name }} -¥{{ selectedCoupon.discount_value }}</span>
          <span v-else-if="availableCoupons.length > 0" class="coupon-available">{{ availableCoupons.length }}张可用</span>
          <span v-else class="coupon-none">暂无可用</span>
          <van-icon name="arrow" />
        </div>
      </div>

      <div class="section">
        <div class="section-title">发票信息</div>
        <van-cell-group>
          <van-cell title="发票类型" :value="invoiceType === 'personal' ? '个人' : '企业'" @click="showInvoicePicker = true" />
          <van-field v-if="invoiceType === 'enterprise'" v-model="invoiceTaxNo" placeholder="请输入税号" />
          <van-field v-model="invoiceTitle" placeholder="请输入发票抬头" />
        </van-cell-group>
      </div>

      <div class="section">
        <van-field label="订单备注" v-model="orderNote" placeholder="选填，可备注特殊要求" />
      </div>

      <div class="compliance-notice">
        <van-icon name="warning-o" color="#faad14" />
        <span>生鲜食材为定制备货品，下单后即刻备货，非质量问题不支持无理由退换</span>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="price-summary">
        <div class="price-row">
          <span>商品金额:</span>
          <span>¥{{ cartStore.totalAmount.toFixed(2) }}</span>
        </div>
        <div class="price-row">
          <span>运费:</span>
          <span>{{ cartStore.totalAmount >= 99 ? '免运费' : '¥5.00' }}</span>
        </div>
        <div v-if="selectedCoupon" class="price-row coupon-discount">
          <span>优惠券抵扣:</span>
          <span>-¥{{ selectedCoupon.discount_value }}</span>
        </div>
        <div class="price-row total">
          <span>应付金额:</span>
          <span>¥{{ finalAmount.toFixed(2) }}</span>
        </div>
      </div>
      <van-button type="primary" class="submit-btn" @click="handleSubmit">提交订单</van-button>
    </div>

    <van-popup v-model:show="showCouponPicker" position="bottom" :style="{ height: '60%' }" round closeable>
      <div class="coupon-picker">
        <div class="coupon-picker-header">
          <h3>选择优惠券</h3>
        </div>
        <div class="coupon-picker-list">
          <div
            class="coupon-option"
            :class="{ active: !selectedCoupon }"
            @click="handleCouponSelect(null)"
          >
            <span>不使用优惠券</span>
            <van-icon v-if="!selectedCoupon" name="success" color="#FF6B35" />
          </div>
          <div
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-option"
            :class="{ active: selectedCoupon?.id === coupon.id }"
            @click="handleCouponSelect(coupon)"
          >
            <div class="coupon-option-info">
              <span class="coupon-option-name">{{ coupon.name }}</span>
              <span class="coupon-option-desc">满{{ coupon.min_amount }}减{{ coupon.discount_value }}</span>
            </div>
            <div class="coupon-option-value">
              <span>-¥{{ coupon.discount_value }}</span>
              <van-icon v-if="selectedCoupon?.id === coupon.id" name="success" color="#FF6B35" />
            </div>
          </div>
          <div v-if="availableCoupons.length === 0" class="coupon-empty">
            <p>暂无可用优惠券</p>
          </div>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showInvoicePicker" position="bottom" :style="{ height: '50%' }" round>
      <van-picker :columns="invoiceColumns" @confirm="handleInvoiceConfirm" @cancel="showInvoicePicker = false" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { userApi, orderApi } from '@/api'
import { useCartStore } from '@/store/cart'

const router = useRouter()
const cartStore = useCartStore()

const handleBack = () => {
  router.push('/')
}

const addresses = ref([])
const selectedAddress = ref(null)
const deliveryMethod = ref('0')
const deliveryTime = ref('now')
const selectedCoupon = ref(null)
const showCouponPicker = ref(false)
const invoiceType = ref('personal')
const showInvoicePicker = ref(false)
const invoiceTitle = ref('')
const invoiceTaxNo = ref('')
const orderNote = ref('')
const coupons = ref([])

const availableCoupons = computed(() => {
  const totalAmount = cartStore.totalAmount
  return coupons.value.filter(c => c.status === 0 && totalAmount >= (c.min_amount || 0))
})

const finalAmount = computed(() => {
  let amount = cartStore.totalAmount
  const freight = amount >= 99 ? 0 : 5
  if (selectedCoupon.value) {
    amount -= selectedCoupon.value.discount_value
  }
  return Math.max(0, amount + freight)
})

const loadAddresses = async () => {
  try {
    const { data } = await userApi.getAddresses()
    addresses.value = data
    selectedAddress.value = data.find(a => a.is_default) || data[0]
  } catch (error) {
    console.error('加载地址失败:', error)
  }
}

const loadCoupons = async () => {
  try {
    const response = await userApi.getCoupons()
    if (Array.isArray(response.data)) {
      coupons.value = response.data
    } else if (response.data && Array.isArray(response.data.data)) {
      coupons.value = response.data.data
    }
  } catch (error) {
    console.error('加载优惠券失败:', error)
  }
}

const handleCouponSelect = (coupon) => {
  selectedCoupon.value = coupon
  showCouponPicker.value = false
}

const invoiceColumns = [
  { text: '个人', value: 'personal' },
  { text: '企业', value: 'enterprise' }
]

const handleInvoiceConfirm = ({ selectedOptions }) => {
  showInvoicePicker.value = false
  if (selectedOptions && selectedOptions[0]) {
    invoiceType.value = selectedOptions[0].value
    if (invoiceType.value === 'personal') {
      invoiceTaxNo.value = ''
    }
  }
}

const handleSubmit = async () => {
  if (!selectedAddress.value) {
    showToast('请选择收货地址')
    return
  }

  if (cartStore.selectedItems.length === 0) {
    showToast('请选择商品')
    return
  }

  try {
    const items = cartStore.selectedItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      spec_name: item.spec_name || '默认规格'
    }))

    const data = {
      address_id: selectedAddress.value.id,
      items,
      remark: orderNote.value,
      user_coupon_id: selectedCoupon.value?.id || undefined,
      delivery_method: parseInt(deliveryMethod.value),
      invoice_type: invoiceType.value,
      invoice_title: invoiceTitle.value || undefined,
      invoice_tax_no: invoiceType.value === 'enterprise' ? invoiceTaxNo.value : undefined
    }

    const { data: result } = await orderApi.createOrder(data)
    showToast('订单提交成功')
    // 清空购物车已选项
    cartStore.cartList.forEach(item => {
      if (item.selected) cartStore.cartList.splice(cartStore.cartList.indexOf(item), 1)
    })
    // 跳转到支付页面
    setTimeout(() => {
      router.replace('/payment/' + result.id)
    }, 1000)
  } catch (error) {
    console.error('提交订单失败:', error)
    showToast(error.apiMessage || error.message || '提交订单失败')
  }
}

onMounted(() => {
  loadAddresses()
  loadCoupons()
  if (cartStore.cartList.length === 0) {
    cartStore.fetchCart()
  }
})
</script>

<style scoped>
.checkout {
  min-height: 100vh;
  padding-bottom: 200px;
  background-color: #f7f8fa;
}

.checkout-content {
  padding: 12px;
}

.address-section {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: white;
  margin-bottom: 12px;
  border-radius: 8px;
}

.address-info {
  flex: 1;
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
}

.address-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #999;
}

.section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
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
  width: 60px;
  height: 60px;
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
  color: #ff4d4f;
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

.coupon-select {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
}

.coupon-selected {
  color: #FF6B35;
  font-weight: bold;
}

.coupon-available {
  color: #FF6B35;
}

.coupon-none {
  color: #999;
}

.coupon-picker {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.coupon-picker-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.coupon-picker-header h3 {
  margin: 0;
  font-size: 16px;
}

.coupon-picker-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.coupon-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-option.active {
  border-color: #FF6B35;
  background-color: #fff8f5;
}

.coupon-option-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.coupon-option-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.coupon-option-desc {
  font-size: 12px;
  color: #999;
}

.coupon-option-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #FF6B35;
}

.coupon-empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.compliance-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background-color: #fff3e0;
  border-radius: 8px;
  font-size: 13px;
  color: #e65100;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 12px 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.price-summary {
  margin-bottom: 12px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.price-row.coupon-discount {
  color: #FF6B35;
}

.price-row.total {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
}

.price-row.total span:last-child {
  color: #FF6B35;
  font-size: 20px;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  font-size: 16px;
}
</style>
