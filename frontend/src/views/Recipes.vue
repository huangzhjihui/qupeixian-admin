<template>
  <div class="recipes">
    <van-nav-bar title="食谱专区" left-arrow @click-left="$router.back()" />

    <div class="filter-section">
      <van-tabs v-model="activeTab" @change="handleTabChange">
        <van-tab title="全部" name="all" />
        <van-tab title="中式" name="chinese" />
        <van-tab title="西式" name="western" />
        <van-tab title="日式" name="japanese" />
        <van-tab title="韩式" name="korean" />
      </van-tabs>
    </div>

    <div class="filter-tags">
      <van-tag
        v-for="tag in filterTags"
        :key="tag.value"
        :type="activeFilter === tag.value ? 'primary' : 'default'"
        :plain="activeFilter !== tag.value"
        @click="activeFilter = tag.value"
      >
        {{ tag.label }}
      </van-tag>
    </div>

    <div class="recipes-content">
      <div class="recipe-grid">
        <div v-for="recipe in recipeList" :key="recipe.id" class="recipe-card" @click="$router.push('/recipe/' + recipe.id)">
          <img :src="recipe.cover_image || 'https://picsum.photos/300/200?random=' + recipe.id" :alt="recipe.title" class="recipe-img" />
          <div class="recipe-info">
            <h3 class="recipe-title">{{ recipe.title }}</h3>
            <div class="recipe-meta">
              <span><van-icon name="clock-o" /> {{ recipe.cooking_time }}</span>
              <span><van-icon name="fire-o" /> {{ recipe.difficulty }}</span>
            </div>
            <p class="recipe-desc">{{ recipe.description }}</p>
          </div>
          <div v-if="recipe.product_id" class="recipe-action">
            <van-button size="small" type="primary" @click.stop="handleBuy(recipe.product_id)">一键购买食材</van-button>
          </div>
        </div>
      </div>

      <van-load-more v-if="!loading" :status="loadStatus" @load="loadMore" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { recipeApi, cartApi } from '@/api'
import { useCartStore } from '@/store/cart'

const router = useRouter()
const cartStore = useCartStore()

const activeTab = ref('all')
const activeFilter = ref('')
const loading = ref(false)
const loadStatus = ref('loading')

const recipeList = ref([])
const page = ref(1)
const pageSize = ref(20)

const filterTags = [
  { label: '全部', value: '' },
  { label: '15分钟', value: 'quick' },
  { label: '低卡', value: 'diet' },
  { label: '儿童', value: 'kids' },
  { label: '新手', value: 'easy' }
]

const cuisineMap = {
  'all': '',
  'chinese': 1,
  'western': 2,
  'japanese': 3,
  'korean': 4
}

const loadRecipes = async (pageNum = 1) => {
  try {
    loading.value = true
    const params = {
      page: pageNum,
      pageSize: pageSize.value,
      cuisine: cuisineMap[activeTab.value],
      filter: activeFilter.value
    }

    const { data } = await recipeApi.getRecipes(params)
    const recipes = data.data || []

    if (pageNum === 1) {
      recipeList.value = recipes
    } else {
      recipeList.value = [...recipeList.value, ...recipes]
    }

    loadStatus.value = recipeList.value.length >= (data.total || 0) ? 'finished' : 'loading'
  } catch (error) {
    console.error('加载食谱失败:', error)
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (loading.value || loadStatus.value === 'finished') return
  page.value++
  loadRecipes(page.value)
}

const handleTabChange = () => {
  page.value = 1
  loadRecipes(1)
}

const handleBuy = async (productId) => {
  const token = localStorage.getItem('app_token')
  const userInfo = localStorage.getItem('app_user')
  
  console.log('Recipes handleBuy检查 - app_token:', token)
  console.log('Recipes handleBuy检查 - app_user:', userInfo)
  
  if (!token || !userInfo) {
    showToast('请先登录')
    router.push('/login?redirect=' + encodeURIComponent('/recipes'))
    return
  }

  try {
    await cartApi.addToCart({ product_id: productId })
    cartStore.fetchCart()
    showToast('已加入购物车')
  } catch (error) {
    console.error('添加购物车失败:', error)
  }
}

onMounted(() => {
  loadRecipes(1)
  if (cartStore.cartList.length === 0) {
    cartStore.fetchCart()
  }
})
</script>

<style scoped>
.recipes {
  min-height: 100vh;
  padding-bottom: 60px;
  background-color: #f7f8fa;
}

.filter-section {
  background-color: white;
}

.filter-tags {
  display: flex;
  gap: 8px;
  padding: 12px;
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
}

.recipes-content {
  padding: 12px;
}

.recipe-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recipe-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.recipe-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.recipe-info {
  padding: 12px;
}

.recipe-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.recipe-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.recipe-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
}

.recipe-action {
  padding: 0 12px 12px;
}

.recipe-action button {
  width: 100%;
}
</style>
