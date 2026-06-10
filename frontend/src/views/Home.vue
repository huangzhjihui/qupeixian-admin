<template>
  <div class="home">
    <div class="compliance-banner">
      {{ brand?.attributeNotice || '本平台所售为生鲜预处理食材包，非熟食、非即食预制菜，需自行烹饪加工' }}
    </div>

    <van-nav-bar title="趣配鲜" fixed placeholder>
      <template #left>
        <div class="search-wrap" @click="goSearch">
          <van-icon name="search" />
          <span>搜索菜品、场景</span>
        </div>
      </template>
      <template #right>
        <van-icon name="service-o" size="22" />
      </template>
    </van-nav-bar>

    <div class="content">
      <van-swipe :autoplay="3000" indicator-color="white" class="banner-swipe">
        <van-swipe-item v-for="banner in banners" :key="banner.id" @click="handleBannerClick(banner)">
          <img :src="banner.image || 'https://picsum.photos/750/300?random=' + banner.id" :alt="banner.title" class="banner-img" />
        </van-swipe-item>
      </van-swipe>

      <div v-if="activeNotices.length > 0" class="notice-swipe-wrap">
        <van-swipe :autoplay="4000" indicator-color="#FF6B35" class="notice-swipe">
          <van-swipe-item v-for="notice in activeNotices" :key="notice.id">
            <van-notice-bar left-icon="volume-o" :text="notice.content" />
          </van-swipe-item>
        </van-swipe>
      </div>

      <div class="category-nav">
        <div v-for="cat in categories" :key="cat.id" class="category-item" @click="goCategory(cat)">
          <img :src="cat.icon || 'https://picsum.photos/100/100?random=' + cat.id" :alt="cat.name" class="category-icon" />
          <span class="category-name">{{ cat.name }}</span>
        </div>
      </div>

      <div class="home-section">
        <div class="section-header">
          <h3 class="section-title">本周上新</h3>
          <span class="section-more" @click="goNewProducts">更多 ></span>
        </div>
        <div class="product-list horizontal">
          <div v-for="product in newProducts" :key="product.id" class="product-card-horizontal" @click="goProductDetail(product.id)">
            <img :src="product.main_image || 'https://picsum.photos/200/200?random=' + product.id" :alt="product.name" class="product-img" />
            <div class="product-info">
              <h4 class="product-name">{{ product.name }}</h4>
              <div class="product-price">
                <span class="price">¥{{ product.price }}</span>
                <span v-if="product.member_price" class="member-price">会员价 ¥{{ product.member_price }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="home-section">
        <div class="section-header">
          <h3 class="section-title">🔥 热销爆款</h3>
          <span class="section-more" @click="goHotProducts">更多 ></span>
        </div>
        <div class="product-grid">
          <van-card
            v-for="product in hotProducts"
            :key="product.id"
            :thumb="product.main_image || 'https://picsum.photos/200/200?random=' + product.id"
            :title="product.name"
            :price="product.price"
            :origin-price="product.original_price"
            @click="goProductDetail(product.id)"
          >
            <template #tags>
              <van-tag plain type="danger" size="small">热销</van-tag>
            </template>
          </van-card>
        </div>
      </div>

      <div class="home-section">
        <div class="section-header">
          <h3 class="section-title">📖 食谱专区</h3>
          <span class="section-more" @click="$router.push('/recipes')">更多 ></span>
        </div>
        <div class="recipe-list">
          <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card" @click="$router.push('/recipe/' + recipe.id)">
            <img :src="recipe.cover_image || 'https://picsum.photos/300/200?random=' + recipe.id" :alt="recipe.title" class="recipe-img" />
            <div class="recipe-info">
              <h4 class="recipe-title">{{ recipe.title }}</h4>
              <div class="recipe-meta">
                <span v-if="recipe.cooking_time"><van-icon name="clock-o" /> {{ recipe.cooking_time }}</span>
                <span v-if="recipe.difficulty"><van-icon name="fire-o" /> {{ recipe.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="safety-tips">
        <van-icon name="info-o" />
        {{ copywriting?.home?.description || '食材已清洗切配、调料精准分份，当日新鲜采购，同城当日配送' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import { homeApi } from '@/api'

const router = useRouter()
const cartStore = useCartStore()

const brand = ref(null)
const banners = ref([])
const notices = ref([])
const categories = ref([])
const newProducts = ref([])
const hotProducts = ref([])
const recipes = ref([])
const copywriting = ref(null)

// 过滤已发布的公告
const activeNotices = computed(() => {
  return (notices.value || []).filter(n => n.is_active === 1 || n.is_active === true)
})

const loadHomeData = async () => {
  try {
    const { data } = await homeApi.getHomeData()
    brand.value = data.brand
    banners.value = data.banners
    notices.value = data.notices
    categories.value = data.categories
    newProducts.value = data.newProducts
    hotProducts.value = data.hotProducts
    recipes.value = data.recipes
    copywriting.value = data.copywriting
  } catch (error) {
    console.error('加载首页数据失败:', error)
  }
}

const handleBannerClick = (banner) => {
  if (banner.product_id) {
    goProductDetail(banner.product_id)
  } else if (banner.link_url) {
    window.open(banner.link_url)
  }
}

const goSearch = () => {
  router.push('/products')
}

const goCategory = (cat) => {
  router.push({
    path: '/products',
    query: { category_id: cat.id }
  })
}

const goNewProducts = () => {
  router.push({
    path: '/products',
    query: { is_new: 1 }
  })
}

const goHotProducts = () => {
  router.push({
    path: '/products',
    query: { is_hot: 1 }
  })
}

const goProductDetail = (id) => {
  router.push('/product/' + id)
}

onMounted(() => {
  loadHomeData()
  if (cartStore.cartList.length === 0) {
    cartStore.fetchCart()
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
  background-color: #f7f8fa;
}

.content {
  padding-top: 60px;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f5f5f5;
  padding: 8px 16px;
  border-radius: 20px;
  color: #999;
  font-size: 14px;
  width: 260px;
  cursor: pointer;
}

.banner-swipe {
  width: 100%;
  height: 160px;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.notice-swipe-wrap {
  background: white;
}

.notice-swipe {
  height: 36px;
}

.category-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 16px;
  background-color: white;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.category-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
}

.category-name {
  font-size: 12px;
  color: #333;
}

.home-section {
  margin-top: 12px;
  background-color: white;
  padding: 12px 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.product-list.horizontal {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding-bottom: 8px;
}

.product-card-horizontal {
  flex-shrink: 0;
  width: 140px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.product-img {
  width: 140px;
  height: 140px;
  object-fit: cover;
}

.product-info {
  padding: 8px;
}

.product-name {
  font-size: 12px;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price {
  color: #FF6B35;
  font-size: 16px;
  font-weight: bold;
}

.member-price {
  color: #ff4d4f;
  font-size: 11px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.recipe-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.recipe-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.recipe-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.recipe-info {
  padding: 10px;
}

.recipe-title {
  font-size: 13px;
  color: #333;
  margin-bottom: 6px;
  font-weight: 500;
}

.recipe-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #999;
}

.recipe-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
