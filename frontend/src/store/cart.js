import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '@/api'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref([])
  const totalCount = ref(0)

  const selectedItems = computed(() => cartList.value.filter(item => item.selected))
  const totalAmount = computed(() => {
    return selectedItems.value.reduce((sum, item) => {
      const price = item.Product.member_price || item.Product.price
      return sum + price * item.quantity
    }, 0)
  })

  const fetchCart = async () => {
    try {
      const { data } = await cartApi.getCart()
      cartList.value = data.items || []
      totalCount.value = cartList.value.reduce((sum, item) => sum + item.quantity, 0)
    } catch (error) {
      console.error('获取购物车失败:', error)
    }
  }

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartApi.addToCart({ product_id: productId, quantity })
      await fetchCart()
    } catch (error) {
      console.error('添加购物车失败:', error)
      throw error
    }
  }

  const updateCartItem = async (id, data) => {
    try {
      await cartApi.updateCartItem(id, data)
      await fetchCart()
    } catch (error) {
      console.error('更新购物车失败:', error)
      throw error
    }
  }

  const removeFromCart = async (id) => {
    try {
      await cartApi.removeFromCart(id)
      await fetchCart()
    } catch (error) {
      console.error('删除购物车失败:', error)
      throw error
    }
  }

  return {
    cartList,
    totalCount,
    selectedItems,
    totalAmount,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart
  }
})
