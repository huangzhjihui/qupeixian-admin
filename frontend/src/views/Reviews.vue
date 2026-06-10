<template>
  <div class="reviews-page">
    <van-nav-bar title="评价晒单" left-arrow @click-left="$router.back()" />

    <van-tabs v-model:active="activeTab" sticky @change="handleTabChange">
      <van-tab title="我的评价" name="my">
        <div class="review-list">
          <div v-for="review in myReviews" :key="review.id" class="review-card">
            <div class="review-header">
              <div class="product-info" @click="goProductDetail(review.product?.id)">
                <img :src="review.product?.main_image || 'https://picsum.photos/60/60'" class="product-img" />
                <span class="product-name">{{ review.product?.name || '商品已下架' }}</span>
              </div>
              <div class="rating-group">
                <div class="rating-row">
                  <span class="rating-label">商品</span>
                  <van-rate v-model="review.rating" readonly :size="12" />
                </div>
                <div class="rating-row">
                  <span class="rating-label">配送</span>
                  <van-rate v-model="review.delivery_rating" readonly :size="12" />
                </div>
              </div>
            </div>
            <div class="review-content">{{ review.content }}</div>
            <div v-if="review.images && review.images.length > 0" class="review-images">
              <van-image
                v-for="(img, idx) in review.images"
                :key="idx"
                :src="img"
                width="80"
                height="80"
                fit="cover"
                radius="4"
                @click="previewImage(review.images, idx)"
              />
            </div>
            <div v-if="review.reply" class="review-reply">
              <span class="reply-label">商家回复：</span>{{ review.reply }}
            </div>
            <div class="review-footer">
              <span class="review-time">{{ formatTime(review.created_at) }}</span>
              <span class="review-likes">
                <van-icon name="good-job-o" /> {{ review.like_count || 0 }}
              </span>
            </div>
          </div>

          <div v-if="myReviews.length === 0 && !loading" class="empty-state">
            <van-icon name="star-o" size="48" color="#ccc" />
            <p>暂无评价</p>
          </div>
        </div>
      </van-tab>

      <van-tab title="待评价" name="pending">
        <div class="pending-list">
          <div v-for="item in pendingReviews" :key="item.order_item_id" class="pending-card">
            <div class="pending-product">
              <img :src="item.product_image || item.product?.main_image || 'https://picsum.photos/80/80'" class="product-img" />
              <div class="product-detail">
                <span class="product-name">{{ item.product_name || item.product?.name }}</span>
                <span class="product-price">¥{{ item.price }}</span>
              </div>
            </div>
            <van-button type="primary" size="small" @click="goAddReview(item)">
              立即评价
            </van-button>
          </div>

          <div v-if="pendingReviews.length === 0 && !loading" class="empty-state">
            <van-icon name="passed" size="48" color="#ccc" />
            <p>所有订单都已评价</p>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showImagePreview } from 'vant'
import { orderApi } from '@/api'

const router = useRouter()
const activeTab = ref('my')
const myReviews = ref([])
const pendingReviews = ref([])
const loading = ref(false)

const loadMyReviews = async () => {
  loading.value = true
  try {
    const { data } = await orderApi.getReviews({ page: 1, pageSize: 50 })
    myReviews.value = data?.data || []
  } catch (error) {
    console.error('加载评价列表失败:', error)
  } finally {
    loading.value = false
  }
}

const loadPendingReviews = async () => {
  loading.value = true
  try {
    const { data } = await orderApi.getPendingReviews()
    pendingReviews.value = data || []
  } catch (error) {
    console.error('加载待评价列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleTabChange = (tab) => {
  if (tab === 'my' && myReviews.value.length === 0) {
    loadMyReviews()
  } else if (tab === 'pending' && pendingReviews.value.length === 0) {
    loadPendingReviews()
  }
}

const goProductDetail = (id) => {
  if (id) {
    router.push(`/product/${id}`)
  }
}

const goAddReview = (item) => {
  router.push({
    path: '/review/add',
    query: {
      order_item_id: item.order_item_id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image
    }
  })
}

const previewImage = (images, idx) => {
  showImagePreview({
    images,
    startPosition: idx
  })
}

const formatTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadMyReviews()
})
</script>

<style scoped>
.reviews-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.review-list,
.pending-list {
  padding: 12px;
}

.review-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.product-info .product-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.product-info .product-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.review-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
}

.review-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.review-reply {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.reply-label {
  color: #FF6B35;
  font-weight: 500;
}

.review-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.review-likes {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-label {
  font-size: 11px;
  color: #999;
  width: 24px;
  text-align: right;
}

.pending-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pending-product {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.pending-product .product-img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.product-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-detail .product-name {
  font-size: 14px;
  color: #333;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-detail .product-price {
  font-size: 14px;
  color: #FF6B35;
  font-weight: bold;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}
</style>
