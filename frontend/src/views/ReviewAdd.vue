<template>
  <div class="review-add-page">
    <van-nav-bar title="发表评价" left-arrow @click-left="$router.back()" />

    <div class="review-form">
      <div class="product-info">
        <img :src="productImage || 'https://picsum.photos/80/80'" class="product-img" />
        <span class="product-name">{{ productName }}</span>
      </div>

      <div class="form-section">
        <div class="form-label">商品评分</div>
        <van-rate v-model="rating" :size="28" color="#FF6B35" />
        <span class="rating-text">{{ ratingText }}</span>
      </div>

      <div class="form-section">
        <div class="form-label">配送服务</div>
        <van-rate v-model="deliveryRating" :size="28" color="#FF6B35" />
        <span class="rating-text">{{ deliveryRatingText }}</span>
      </div>

      <div class="form-section">
        <van-field
          v-model="content"
          type="textarea"
          rows="4"
          placeholder="分享您的使用体验，帮助其他买家做出选择~"
          maxlength="500"
          show-word-limit
        />
      </div>

      <div class="form-section">
        <div class="form-label">上传图片（可选，最多6张）</div>
        <van-uploader
          v-model="imageList"
          :max-count="6"
          :after-read="afterRead"
          :before-delete="beforeDelete"
        />
      </div>

      <div class="form-section">
        <van-cell title="匿名评价" center>
          <template #right-icon>
            <van-switch v-model="isAnonymous" size="20" />
          </template>
        </van-cell>
      </div>

      <div class="submit-section">
        <van-button type="primary" block @click="submitReview" :loading="submitting">
          提交评价
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { orderApi, adminApi } from '@/api'

const route = useRoute()
const router = useRouter()

const orderItemId = route.query.order_item_id
const productId = route.query.product_id
const productName = route.query.product_name || '商品'
const productImage = route.query.product_image || ''

const rating = ref(5)
const deliveryRating = ref(5)
const content = ref('')
const imageList = ref([])
const uploadedImages = ref([])
const isAnonymous = ref(false)
const submitting = ref(false)

const ratingText = computed(() => {
  const texts = ['', '很差', '较差', '一般', '满意', '非常满意']
  return texts[rating.value] || ''
})

const deliveryRatingText = computed(() => {
  const texts = ['', '很差', '较差', '一般', '满意', '非常满意']
  return texts[deliveryRating.value] || ''
})

const afterRead = async (file) => {
  try {
    file.status = 'uploading'
    file.message = '上传中...'
    
    const formData = new FormData()
    formData.append('file', file.file)
    
    const response = await fetch('/api/user/upload/image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('app_token')}`
      }
    })
    
    const result = await response.json()
    if (result.success && result.data?.url) {
      file.status = 'done'
      file.message = ''
      uploadedImages.value.push(result.data.url)
    } else {
      file.status = 'failed'
      file.message = '上传失败'
    }
  } catch (error) {
    console.error('上传失败:', error)
    file.status = 'failed'
    file.message = '上传失败'
  }
}

const beforeDelete = (file, detail) => {
  const idx = detail.index
  if (idx >= 0 && idx < uploadedImages.value.length) {
    uploadedImages.value.splice(idx, 1)
  }
  return true
}

const submitReview = async () => {
  if (!rating.value) {
    showToast('请选择评分')
    return
  }
  if (!content.value.trim()) {
    showToast('请输入评价内容')
    return
  }

  submitting.value = true
  try {
    await orderApi.createReview({
      order_item_id: orderItemId,
      product_id: productId,
      rating: rating.value,
      delivery_rating: deliveryRating.value,
      content: content.value.trim(),
      images: uploadedImages.value,
      is_anonymous: isAnonymous.value ? 1 : 0
    })
    showToast('评价成功')
    setTimeout(() => {
      router.back()
    }, 500)
  } catch (error) {
    console.error('评价失败:', error)
    showToast(error.message || '评价失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.review-add-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.review-form {
  padding: 12px;
}

.product-info {
  background: white;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.product-info .product-img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.product-info .product-name {
  font-size: 14px;
  color: #333;
  flex: 1;
}

.form-section {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.form-label {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.rating-text {
  margin-left: 12px;
  font-size: 14px;
  color: #FF6B35;
}

.submit-section {
  padding: 16px 0;
}
</style>
