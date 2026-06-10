<template>
  <div class="products-page">
    <van-nav-bar title="商品分类" fixed placeholder>
      <template #left>
        <div class="search-box" @click="showSearchModal = true">
          <van-icon name="search" />
          <span>{{ searchKeyword || '搜索商品' }}</span>
        </div>
      </template>
    </van-nav-bar>

    <div class="category-tabs">
      <van-tabs v-model:active="currentCategory" shrink>
        <van-tab title="全部" name="0" />
        <van-tab
          v-for="cat in categoryList"
          :key="cat.id"
          :title="cat.name"
          :name="String(cat.id)"
        />
      </van-tabs>
    </div>

    <div class="product-list">
      <van-pull-refresh v-model="isRefreshing" @refresh="loadProductList">
        <div v-if="productList.length === 0 && !isLoading" class="empty-state">
          <van-icon name="shopping-cart" size="64" color="#ccc" />
          <p>暂无商品</p>
        </div>

        <div class="product-grid">
          <div
            v-for="product in productList"
            :key="product.id"
            class="product-card"
            @click="goToProductDetail(product.id)"
          >
            <div class="card-image-wrap">
              <img
                :src="product.main_image || 'https://picsum.photos/400/400?random=' + product.id"
                :alt="product.name"
                class="card-image"
              />
              <div class="card-badges">
                <span v-if="product.is_new" class="badge badge-new">新品</span>
                <span v-if="product.is_hot" class="badge badge-hot">热销</span>
              </div>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ product.name }}</h3>
              <div v-if="product.subtitle" class="card-subtitle">{{ product.subtitle }}</div>
              <div class="card-meta">
                <span v-if="product.serving_size" class="meta-item">
                  <van-icon name="user-o" size="11" />{{ product.serving_size }}
                </span>
                <span v-if="product.cooking_time" class="meta-item">
                  <van-icon name="clock-o" size="11" />{{ product.cooking_time }}
                </span>
              </div>
              <div class="card-price-row">
                <div class="price-group">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ product.price }}</span>
                  <span v-if="product.original_price && product.original_price > product.price" class="price-original">¥{{ product.original_price }}</span>
                </div>
                <div class="card-cart-btn" @click.stop="handleQuickAddCart(product)">
                  <van-icon name="shopping-cart-o" size="18" color="#FF6B35" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <van-load-more
          v-if="productList.length > 0 && !isLoading"
          :status="loadMoreStatus"
          @load="loadMoreProducts"
        />
      </van-pull-refresh>
    </div>

    <van-popup v-model="showSearchModal" position="top" :style="{ height: '180px' }">
      <van-search
        v-model="searchKeyword"
        placeholder="搜索商品"
        show-action
        @search="handleSearch"
        @cancel="showSearchModal = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import { productApi, cartApi } from '@/api'

const router = useRouter()
const route = useRoute()

const currentCategory = ref('0')
const searchKeyword = ref('')
const showSearchModal = ref(false)
const isLoading = ref(false)
const isRefreshing = ref(false)
const loadMoreStatus = ref('loading')

const productList = ref([])
const categoryList = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalProducts = ref(0)

const loadProductList = async (page = 1, reset = true) => {
  isLoading.value = true
  
  try {
    const params = {
      page: page,
      pageSize: pageSize.value,
      keyword: searchKeyword.value
    }

    console.log('当前分类值:', currentCategory.value, '类型:', typeof currentCategory.value)
    
    if (currentCategory.value !== '0') {
      params.category_id = parseInt(currentCategory.value)
      console.log('添加分类ID:', params.category_id)
    }

    console.log('请求参数:', params)
    
    const response = await productApi.getProducts(params)
    const { data: products, pagination } = response

    if (reset) {
      productList.value = products || []
    } else {
      productList.value = [...productList.value, ...(products || [])]
    }

    totalProducts.value = pagination?.total || 0
    loadMoreStatus.value = productList.value.length >= totalProducts.value ? 'finished' : 'loading'
    
    console.log('加载成功:', productList.value.length, '个商品')
  } catch (error) {
    console.error('加载商品失败:', error)
    showToast('加载失败，请稍后重试')
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

const loadMoreProducts = () => {
  if (isLoading.value || loadMoreStatus.value === 'finished') return
  currentPage.value++
  loadProductList(currentPage.value, false)
}

const handleSearch = () => {
  showSearchModal.value = false
  currentPage.value = 1
  loadProductList(1, true)
}

const goToProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const handleQuickAddCart = async (product) => {
  const token = localStorage.getItem('app_token')
  if (!token) {
    router.push('/login?redirect=/products')
    return
  }
  try {
    await cartApi.addToCart({ product_id: product.id })
    showToast('已加入购物车')
  } catch (err) {
    console.error('加购失败:', err)
  }
}

const loadCategories = async () => {
  try {
    const { data } = await productApi.getCategories()
    categoryList.value = data || []
  } catch (err) {
    console.error('加载分类失败:', err)
  }
}

onMounted(() => {
  const categoryId = route.query.category_id
  if (categoryId) {
    currentCategory.value = String(categoryId)
    console.log('从URL参数设置分类:', currentCategory.value)
  }
  loadCategories()
  loadProductList(1, true)
})

watch(currentCategory, (newVal) => {
  console.log('分类变化:', newVal)
  currentPage.value = 1
  loadProductList(1, true)
})
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background-color: #f5f6f8;
  padding-bottom: 60px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f0f0f0;
  padding: 8px 16px;
  border-radius: 20px;
  color: #999;
  font-size: 14px;
  width: 240px;
}

.category-tabs {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #fff;
}

.product-list {
  padding-top: 96px;
  padding-left: 10px;
  padding-right: 10px;
}

/* 双列网格布局 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding-bottom: 12px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.product-card:active {
  transform: scale(0.97);
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.08);
}

/* 图片区域 */
.card-image-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
  background: #f0f0f0;
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 标签 */
.card-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fff;
  line-height: 1.5;
}

.badge-new {
  background: linear-gradient(135deg, #1989fa, #4facfe);
}

.badge-hot {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
}

/* 信息区域 */
.card-info {
  padding: 10px 10px 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-subtitle {
  font-size: 11px;
  color: #999;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #aaa;
}

/* 价格行 */
.card-price-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 1px;
  flex: 1;
  min-width: 0;
}

.price-symbol {
  font-size: 12px;
  font-weight: 700;
  color: #FF6B35;
}

.price-value {
  font-size: 20px;
  font-weight: 700;
  color: #FF6B35;
  line-height: 1;
}

.price-original {
  font-size: 11px;
  color: #ccc;
  text-decoration: line-through;
  margin-left: 4px;
}

.card-cart-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #FFF5F0;
  flex-shrink: 0;
}

.card-cart-btn:active {
  background: #FFE8D9;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state p {
  margin-top: 16px;
}

/* 响应式：宽屏显示3列 */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
}

@media (min-width: 1024px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
}
</style>
