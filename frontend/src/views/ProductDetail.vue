<template>
  <div class="product-detail">
    <van-nav-bar title="商品详情" left-arrow @click-left="$router.back()" />

    <div class="product-content">
      <van-swipe :autoplay="3000" indicator-color="white" class="product-swipe">
        <van-swipe-item>
          <img :src="product?.main_image || 'https://picsum.photos/750/500'" :alt="product?.name" class="product-img" @click="previewProductImages(0)" />
        </van-swipe-item>
        <van-swipe-item v-for="(img, idx) in parsedImages" :key="idx">
          <img :src="img" :alt="product?.name" class="product-img" @click="previewProductImages(idx + 1)" />
        </van-swipe-item>
      </van-swipe>

      <div class="compliance-banner" style="font-size: 11px;">
        {{ complianceInfo?.notice || '本平台所售为生鲜预处理食材包，非熟食、非即食预制菜，需自行烹饪加工' }}
      </div>

      <div class="product-info">
        <h1 class="product-name">{{ product?.name }}</h1>
        <p class="product-subtitle">{{ product?.subtitle }}</p>
        
        <div class="price-section">
          <span class="current-price">¥{{ product?.price }}</span>
          <span v-if="product?.original_price" class="original-price">¥{{ product?.original_price }}</span>
          <van-tag v-if="product?.is_new" type="primary" size="small">新品</van-tag>
        </div>

        <div class="product-meta">
          <span><van-icon name="user-o" /> {{ product?.serving_size }}</span>
          <span><van-icon name="clock-o" /> {{ product?.cooking_time }}</span>
          <span><van-icon name="star-o" /> {{ product?.rating }}</span>
          <span><van-icon name="message-o" /> {{ product?.review_count }}条评价</span>
        </div>

        <div class="product-tags">
          <span v-for="tag in complianceInfo?.tags" :key="tag" class="product-tag">{{ tag }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <van-icon name="food" />
          <span>食材清单</span>
        </div>
        <div class="ingredients-list">
          <div v-for="item in ingredients" :key="item.id" class="ingredient-item">
            <img :src="item.image || 'https://picsum.photos/50/50'" :alt="item.name" class="ingredient-img" />
            <div class="ingredient-info">
              <span class="ingredient-name">{{ item.name }}</span>
              <span class="ingredient-quantity">{{ item.quantity }} {{ item.unit }}</span>
            </div>
            <van-tag v-if="item.is_preprocessed" size="mini">已处理</van-tag>
            <van-tag v-if="item.is_seasoning" size="mini" type="warning">调料</van-tag>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <van-icon name="info-o" />
          <span>产品说明</span>
        </div>
        <div class="description-text">
          <p>{{ complianceInfo?.includes }}</p>
          <p class="text-red-500">{{ complianceInfo?.notice }}</p>
          <p>{{ complianceInfo?.storage }}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <van-icon name="file-text" />
          <span>食材信息</span>
        </div>
        <van-cell-group>
          <van-cell title="食材产地" :value="product?.origin || '-'">
            <template #right-icon><van-icon name="chevron-right" /></template>
          </van-cell>
          <van-cell title="分装日期" :value="product?.packing_date || '-'">
            <template #right-icon><van-icon name="chevron-right" /></template>
          </van-cell>
          <van-cell title="保质期" :value="product?.shelf_life || '-'">
            <template #right-icon><van-icon name="chevron-right" /></template>
          </van-cell>
          <van-cell title="储存条件" :value="product?.storage_conditions || '-'">
            <template #right-icon><van-icon name="chevron-right" /></template>
          </van-cell>
          <van-cell title="配料表" :value="product?.ingredient_list || '-'">
            <template #right-icon><van-icon name="chevron-right" /></template>
          </van-cell>
        </van-cell-group>
      </div>

      <div class="section">
        <div class="section-title">
          <van-icon name="play-circle-o" />
          <span>烹饪教程</span>
        </div>
        <div class="cooking-steps">
          <div v-for="(step, idx) in cookingSteps" :key="idx" class="step-item">
            <div class="step-number">{{ idx + 1 }}</div>
            <div class="step-content">
              <p>{{ step.description }}</p>
              <img v-if="step.image" :src="step.image" class="step-img" />
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <van-icon name="star-o" />
          <span>用户评价（{{ product?.review_count || 0 }}）</span>
        </div>
        <div v-if="reviews.length > 0" class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <img :src="review.User?.avatar || 'https://picsum.photos/50/50'" class="review-avatar" />
            <div class="review-content">
              <div class="review-header">
                <span class="review-name">{{ review.User?.nickname || '用户' }}</span>
                <span class="review-time">{{ formatTime(review.created_at) }}</span>
              </div>
              <div class="review-ratings">
                <div class="review-rating-row">
                  <span class="rating-label">商品</span>
                  <van-rate v-model="review.rating" readonly :size="12" />
                </div>
                <div class="review-rating-row">
                  <span class="rating-label">配送</span>
                  <van-rate v-model="review.delivery_rating" readonly :size="12" />
                </div>
              </div>
              <p class="review-text">{{ review.content }}</p>
              <div v-if="review.images && review.images.length > 0" class="review-images">
                <img v-for="(img, idx) in review.images" :key="idx" :src="img" class="review-img" @click="previewReviewImage(review.images, idx)" />
              </div>
              <div v-if="review.reply" class="review-reply">
                <span class="reply-label">商家回复：</span>{{ review.reply }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <van-empty description="暂无评价" />
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-left">
        <div class="action-item" @click="handleFavorite">
          <van-icon :name="isFavorite ? 'heart' : 'heart-o'" :color="isFavorite ? '#ff4d4f' : '#999'" />
          <span>收藏</span>
        </div>
        <div class="action-item" @click="handleShare">
          <van-icon name="share-o" />
          <span>分享</span>
        </div>
        <div class="action-item" @click="$router.push('/profile')">
          <van-icon name="user-o" />
          <span>客服</span>
        </div>
      </div>
      <div class="bottom-right">
        <van-button class="btn-cart" @click="handleAddCart">加入购物车</van-button>
        <van-button class="btn-buy" type="primary" @click="handleBuy">立即购买</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showImagePreview } from 'vant'
import { productApi, cartApi } from '@/api'
import { useUserStore } from '@/store/user'
import { useCartStore } from '@/store/cart'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const product = ref(null)
const reviews = ref([])
const ingredients = ref([])
const isFavorite = ref(false)
const complianceInfo = ref(null)

const parsedImages = computed(() => {
  if (!product.value?.images) return []
  if (Array.isArray(product.value.images)) return product.value.images
  try {
    const parsed = JSON.parse(product.value.images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
})

const cookingSteps = computed(() => {
  if (!product.value?.recipe) return []
  return product.value.recipe.steps || []
})

const loadProductDetail = async () => {
  try {
    console.log('开始加载商品详情, ID:', route.params.id, ', 类型:', typeof route.params.id)
    const { data } = await productApi.getProductDetail(route.params.id)
    console.log('商品详情加载成功:', data ? '有数据' : '无数据')
    product.value = data
    reviews.value = data.reviews || []
    isFavorite.value = data.isFavorite || false
    complianceInfo.value = data.complianceInfo
    ingredients.value = data.ingredients || []
  } catch (error) {
    console.error('加载商品详情失败:', error)
    console.error('错误详情:', error.response ? error.response.data : error.message)
    showToast(error.response?.data?.message || '加载失败')
  }
}

const handleFavorite = async () => {
  const token = localStorage.getItem('app_token')
  const userInfo = localStorage.getItem('app_user')
  
  console.log('handleFavorite检查 - app_token:', token)
  console.log('handleFavorite检查 - app_user:', userInfo)
  
  if (!token || !userInfo) {
    router.push('/login?redirect=' + encodeURIComponent('/product/' + route.params.id))
    return
  }

  try {
    const { data } = await productApi.toggleFavorite({
      type: 0,
      target_id: route.params.id
    })
    isFavorite.value = data.isFavorite
    showToast(isFavorite.value ? '收藏成功' : '取消收藏')
  } catch (error) {
    console.error('收藏失败:', error)
  }
}

const handleShare = () => {
  showToast('分享功能开发中')
}

const handleAddCart = async () => {
  const token = localStorage.getItem('app_token')
  const userInfo = localStorage.getItem('app_user')
  
  console.log('handleAddCart检查 - app_token:', token ? '存在，长度=' + token.length : '不存在')
  console.log('handleAddCart检查 - app_user:', userInfo ? '存在，内容=' + userInfo : '不存在')
  
  if (!token || !userInfo) {
    console.log('未登录，跳转登录页')
    router.push('/login?redirect=' + encodeURIComponent('/product/' + route.params.id))
    return
  }

  try {
    console.log('开始调用cartApi.addToCart，product_id:', route.params.id)
    await cartApi.addToCart({ product_id: route.params.id })
    cartStore.fetchCart()
    showToast('添加成功')
  } catch (error) {
    console.error('添加购物车失败:', error)
  }
}

const handleBuy = async () => {
  const token = localStorage.getItem('app_token')
  const userInfo = localStorage.getItem('app_user')
  
  console.log('handleBuy检查 - app_token:', token)
  console.log('handleBuy检查 - app_user:', userInfo)
  
  if (!token || !userInfo) {
    router.push('/login?redirect=' + encodeURIComponent('/product/' + route.params.id))
    return
  }

  try {
    await cartApi.addToCart({ product_id: route.params.id })
    cartStore.fetchCart()
    router.push('/checkout')
  } catch (error) {
    console.error('添加购物车失败:', error)
  }
}

onMounted(() => {
  loadProductDetail()
})

const formatTime = (time) => {
  if (!time) return ''
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const previewReviewImage = (images, idx) => {
  showImagePreview({ images, startPosition: idx })
}

const previewProductImages = (idx) => {
  const allImages = [product.value?.main_image, ...parsedImages.value].filter(Boolean)
  showImagePreview({ images: allImages, startPosition: idx })
}
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.product-swipe {
  height: 280px;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.product-subtitle {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #FF6B35;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.section {
  background-color: white;
  margin-bottom: 12px;
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.ingredients-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: calc(50% - 6px);
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.ingredient-img {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.ingredient-info {
  flex: 1;
}

.ingredient-name {
  display: block;
  font-size: 13px;
  color: #333;
}

.ingredient-quantity {
  font-size: 12px;
  color: #999;
}

.description-text {
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

.text-red-500 {
  color: #ff4d4f;
}

.cooking-steps {
  padding-top: 8px;
}

.step-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.step-number {
  width: 28px;
  height: 28px;
  background-color: #FF6B35;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content p {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.step-img {
  width: 100%;
  border-radius: 8px;
}

.reviews-list {
  padding-top: 8px;
}

.review-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.review-name {
  font-size: 13px;
  color: #333;
}

.review-time {
  font-size: 12px;
  color: #999;
}

.review-ratings {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
}

.review-rating-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-label {
  font-size: 11px;
  color: #999;
}

.review-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.review-reply {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.review-reply .reply-label {
  color: #FF6B35;
  font-weight: 500;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.review-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.empty-state {
  padding: 32px;
}

.bottom-bar {
  position: fixed;
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.bottom-left {
  display: flex;
  gap: 20px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.bottom-right {
  flex: 1;
  display: flex;
  gap: 10px;
  margin-left: 20px;
}

.btn-cart {
  flex: 1;
  background-color: #ffb563;
  color: white;
  border-radius: 24px;
}

.btn-buy {
  flex: 1;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  border-radius: 24px;
}
</style>
