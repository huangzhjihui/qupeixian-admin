<template>
  <div class="recipe-detail">
    <van-nav-bar title="食谱详情" left-arrow @click-left="$router.back()" />

    <div class="recipe-content">
      <img :src="recipe?.cover_image || 'https://picsum.photos/750/400'" :alt="recipe?.title" class="recipe-cover" />

      <div class="recipe-header">
        <h1 class="recipe-title">{{ recipe?.title }}</h1>
        <div class="recipe-meta">
          <span><van-icon name="clock-o" /> {{ recipe?.cooking_time }}</span>
          <span><van-icon name="fire-o" /> {{ recipe?.difficulty }}</span>
          <span><van-icon name="user-o" /> {{ recipe?.servings }}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <van-icon name="food" />
          <span>食材清单</span>
        </div>
        <div class="ingredients-list">
          <div v-for="(item, idx) in ingredients" :key="idx" class="ingredient-item">
            <span class="ingredient-number">{{ idx + 1 }}</span>
            <span class="ingredient-name">{{ item.name }}</span>
            <span class="ingredient-quantity">{{ item.quantity }}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">
          <van-icon name="play-circle-o" />
          <span>烹饪步骤</span>
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
          <van-icon name="info-o" />
          <span>小贴士</span>
        </div>
        <p class="tips-text">{{ recipe?.tips }}</p>
      </div>

      <div class="safety-tips">
        <van-icon name="info-o" />
        食谱仅供家庭烹饪参考，口味可微调
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bottom-left">
        <div class="action-item" @click="handleFavorite">
          <van-icon :name="isFavorite ? 'heart' : 'heart-o'" :color="isFavorite ? '#ff4d4f' : '#999'" />
          <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
        </div>
        <div class="action-item" @click="handleShare">
          <van-icon name="share-o" />
          <span>分享</span>
        </div>
      </div>
      <van-button v-if="recipe?.product_id" type="primary" class="btn-buy" @click="handleBuy">一键购买食材</van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { recipeApi, cartApi } from '@/api'
import { useCartStore } from '@/store/cart'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const recipe = ref(null)
const isFavorite = ref(false)

const ingredients = computed(() => {
  if (!recipe.value?.ingredients) return []
  return JSON.parse(recipe.value.ingredients)
})

const cookingSteps = computed(() => {
  if (!recipe.value?.steps) return []
  return JSON.parse(recipe.value.steps)
})

const loadRecipeDetail = async () => {
  try {
    const { data } = await recipeApi.getRecipeDetail(route.params.id)
    recipe.value = data
    isFavorite.value = data.isFavorite || false
  } catch (error) {
    console.error('加载食谱详情失败:', error)
    showToast('加载失败')
  }
}

const handleFavorite = async () => {
  try {
    const { data } = await recipeApi.toggleFavorite({
      type: 1,
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

const handleBuy = async () => {
  const token = localStorage.getItem('app_token')
  const userInfo = localStorage.getItem('app_user')
  
  console.log('RecipeDetail handleBuy检查 - app_token:', token)
  console.log('RecipeDetail handleBuy检查 - app_user:', userInfo)
  
  if (!token || !userInfo) {
    showToast('请先登录')
    router.push('/login?redirect=' + encodeURIComponent('/recipe/' + route.params.id))
    return
  }

  try {
    await cartApi.addToCart({ product_id: recipe.value.product_id })
    cartStore.fetchCart()
    showToast('已加入购物车')
  } catch (error) {
    console.error('添加购物车失败:', error)
  }
}

onMounted(() => {
  loadRecipeDetail()
})
</script>

<style scoped>
.recipe-detail {
  min-height: 100vh;
  padding-bottom: calc(100px + env(safe-area-inset-bottom));
  background-color: #f7f8fa;
}

.recipe-cover {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.recipe-header {
  background-color: white;
  padding: 16px;
}

.recipe-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.recipe-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.section {
  background-color: white;
  margin-top: 12px;
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
  padding-left: 8px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.ingredient-number {
  width: 24px;
  height: 24px;
  background-color: #FF6B35;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.ingredient-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.ingredient-quantity {
  font-size: 14px;
  color: #666;
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

.tips-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.safety-tips {
  margin: 12px;
  padding: 12px;
  background-color: #fffbe6;
  border-radius: 8px;
  font-size: 13px;
  color: #ad8b00;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.bottom-left {
  display: flex;
  gap: 24px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #666;
}

.btn-buy {
  flex: 1;
  margin-left: 24px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
  border-radius: 24px;
}
</style>
