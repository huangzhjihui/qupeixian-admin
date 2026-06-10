<template>
  <div class="favorites">
    <van-nav-bar title="我的收藏" left-arrow @click-left="$router.back()" />

    <div class="favorites-content">
      <van-tabs v-model="activeTab">
        <van-tab title="商品" name="products">
          <div v-if="productFavorites.length > 0" class="favorites-list">
            <div v-for="item in productFavorites" :key="item.id" class="favorite-item" @click="$router.push('/product/' + item.target_id)">
              <img :src="item.Product?.main_image" :alt="item.Product?.name" class="favorite-item-img" />
              <div class="favorite-item-info">
                <h4>{{ item.Product?.name }}</h4>
                <span class="favorite-item-price">¥{{ item.Product?.price }}</span>
              </div>
              <van-icon name="delete-o" class="favorite-item-delete" @click.stop="handleRemove(item)" />
            </div>
          </div>
          <div v-else class="empty-state">
            <van-empty description="暂无商品收藏" />
          </div>
        </van-tab>
        <van-tab title="食谱" name="recipes">
          <div v-if="recipeFavorites.length > 0" class="favorites-list">
            <div v-for="item in recipeFavorites" :key="item.id" class="favorite-item" @click="$router.push('/recipe/' + item.target_id)">
              <img :src="item.Recipe?.cover_image" :alt="item.Recipe?.title" class="favorite-item-img" />
              <div class="favorite-item-info">
                <h4>{{ item.Recipe?.title }}</h4>
                <span class="favorite-item-meta">{{ item.Recipe?.cooking_time }} | {{ item.Recipe?.difficulty }}</span>
              </div>
              <van-icon name="delete-o" class="favorite-item-delete" @click.stop="handleRemove(item)" />
            </div>
          </div>
          <div v-else class="empty-state">
            <van-empty description="暂无食谱收藏" />
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { productApi, recipeApi } from '@/api'

const activeTab = ref('products')
const favorites = ref([])

const productFavorites = computed(() => favorites.value.filter(f => f.type === 0))
const recipeFavorites = computed(() => favorites.value.filter(f => f.type === 1))

const loadFavorites = async () => {
  try {
    const { data: productData } = await productApi.getFavorites({ type: 0 })
    const { data: recipeData } = await recipeApi.getFavorites({ type: 1 })
    favorites.value = [...productData, ...recipeData]
  } catch (error) {
    console.error('加载收藏失败:', error)
  }
}

const handleRemove = async (item) => {
  try {
    if (item.type === 0) {
      await productApi.toggleFavorite({ type: 0, target_id: item.target_id })
    } else {
      await recipeApi.toggleFavorite({ type: 1, target_id: item.target_id })
    }
    favorites.value = favorites.value.filter(f => f.id !== item.id)
    showToast('已取消收藏')
  } catch (error) {
    console.error('取消收藏失败:', error)
  }
}

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.favorites {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.favorites-content {
  padding: 12px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: white;
  border-radius: 8px;
}

.favorite-item-img {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.favorite-item-info {
  flex: 1;
}

.favorite-item-info h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.favorite-item-price {
  font-size: 16px;
  font-weight: bold;
  color: #FF6B35;
}

.favorite-item-meta {
  font-size: 12px;
  color: #999;
}

.favorite-item-delete {
  color: #999;
  font-size: 20px;
}

.empty-state {
  padding: 60px 0;
}
</style>
