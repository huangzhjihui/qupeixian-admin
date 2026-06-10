<template>
  <div class="cart">
    <van-nav-bar title="购物车" left-arrow @click-left="$router.back()" />

    <div v-if="cartStore.cartList.length > 0" class="cart-content">
      <van-checkbox-group v-model="checkedIds" @change="handleCheckChange">
        <div v-for="item in cartStore.cartList" :key="item.id" class="cart-item">
          <van-checkbox :name="item.id.toString()" />
          <img :src="item.Product?.main_image || 'https://picsum.photos/100/100'" :alt="item.Product?.name" class="cart-item-img" />
          <div class="cart-item-info">
            <h4 class="cart-item-name">{{ item.Product?.name }}</h4>
            <p v-if="item.dietary_note" class="cart-item-note">忌口: {{ item.dietary_note }}</p>
            <div class="cart-item-bottom">
              <span class="cart-item-price">¥{{ item.Product?.member_price || item.Product?.price }}</span>
              <van-stepper v-model="item.quantity" :min="1" :max="item.Product?.stock || 99" @change="handleQuantityChange(item)" />
            </div>
          </div>
          <van-icon name="delete-o" class="cart-item-delete" @click="handleDelete(item.id)" />
        </div>
      </van-checkbox-group>

      <div class="dietary-section">
        <van-field label="忌口备注" v-model="dietaryNote" placeholder="如：不要辣、不要香菜等" />
      </div>
    </div>

    <div v-else class="empty-cart">
      <van-empty image="cart" description="购物车是空的" />
      <van-button type="primary" round @click="$router.push('/products')" class="go-shopping-btn">去逛逛</van-button>
    </div>

    <div v-if="cartStore.cartList.length > 0" class="bottom-bar">
      <van-checkbox :checked="isAllChecked" @change="handleSelectAll">全选</van-checkbox>
      <div class="price-info">
        <span class="total-label">合计:</span>
        <span class="total-price">¥{{ cartStore.totalAmount.toFixed(2) }}</span>
      </div>
      <van-button type="primary" round class="checkout-btn" :disabled="cartStore.selectedItems.length === 0" @click="handleCheckout">结算({{ cartStore.selectedItems.length }})</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showDialog } from 'vant'
import { cartApi } from '@/api'
import { useCartStore } from '@/store/cart'

const cartStore = useCartStore()

const checkedIds = ref([])
const dietaryNote = ref('')

const isAllChecked = computed(() => {
  return cartStore.cartList.length > 0 && cartStore.cartList.every(item => checkedIds.value.includes(item.id.toString()))
})

const handleCheckChange = () => {
  cartStore.cartList.forEach(item => {
    const isChecked = checkedIds.value.includes(item.id.toString())
    cartApi.updateCartItem(item.id, { selected: isChecked ? 1 : 0 })
  })
}

const handleSelectAll = (checked) => {
  if (checked) {
    checkedIds.value = cartStore.cartList.map(item => item.id.toString())
    cartStore.cartList.forEach(item => {
      cartApi.updateCartItem(item.id, { selected: 1 })
    })
  } else {
    checkedIds.value = []
    cartStore.cartList.forEach(item => {
      cartApi.updateCartItem(item.id, { selected: 0 })
    })
  }
}

const handleQuantityChange = async (item) => {
  try {
    await cartApi.updateCartItem(item.id, { quantity: item.quantity })
    cartStore.fetchCart()
  } catch (error) {
    console.error('更新数量失败:', error)
  }
}

const handleDelete = async (id) => {
  await showDialog({
    title: '确认删除',
    message: '确定要删除这个商品吗？'
  }).then(async () => {
    try {
      await cartApi.removeFromCart(id)
      showToast('删除成功')
      const idx = checkedIds.value.indexOf(id.toString())
      if (idx > -1) {
        checkedIds.value.splice(idx, 1)
      }
      cartStore.fetchCart()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleCheckout = () => {
  if (dietaryNote.value) {
    cartStore.selectedItems.forEach(item => {
      cartApi.updateCartItem(item.id, { dietary_note: dietaryNote.value })
    })
  }
  window.location.href = '/checkout'
}

onMounted(() => {
  if (cartStore.cartList.length === 0) {
    cartStore.fetchCart()
  } else {
    checkedIds.value = cartStore.cartList.filter(item => item.selected).map(item => item.id.toString())
  }
})
</script>

<style scoped>
.cart {
  min-height: 100vh;
  padding-bottom: calc(110px + env(safe-area-inset-bottom));
  background-color: #f7f8fa;
}

.cart-content {
  padding: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: white;
  margin-bottom: 10px;
  border-radius: 8px;
}

.cart-item-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.cart-item-note {
  font-size: 12px;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.cart-item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-item-price {
  font-size: 16px;
  font-weight: bold;
  color: #FF6B35;
}

.cart-item-delete {
  color: #999;
  font-size: 20px;
}

.dietary-section {
  margin-top: 12px;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.go-shopping-btn {
  margin-top: 24px;
  width: 200px;
}

.bottom-bar {
  position: fixed;
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.price-info {
  flex: 1;
  text-align: right;
  margin-right: 12px;
}

.total-label {
  font-size: 14px;
  color: #666;
}

.total-price {
  font-size: 20px;
  font-weight: bold;
  color: #FF6B35;
  margin-left: 4px;
}

.checkout-btn {
  width: 140px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
}
</style>
