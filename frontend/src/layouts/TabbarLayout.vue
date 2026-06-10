<template>
  <div class="tabbar-layout">
    <div class="page-content" :class="{ 'no-tabbar': hideTabbar, 'extra-bottom': extraBottom }">
      <router-view :key="$route.fullPath" />
    </div>

    <van-tabbar
      v-if="!hideTabbar"
      :active="currentTab"
      @change="handleTabChange"
      safe-area-inset-bottom
    >
      <van-tabbar-item name="home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item name="category" icon="apps-o">分类</van-tabbar-item>
      <van-tabbar-item name="recipes" icon="description">食谱</van-tabbar-item>
      <van-tabbar-item name="cart" icon="shopping-cart-o">购物车</van-tabbar-item>
      <van-tabbar-item name="profile" icon="user-o" :badge="unreadCount > 0 ? unreadCount : undefined" @click="handleProfileClick">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi } from '@/api'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const currentTab = ref('home')
const unreadCount = ref(0)
let chatPollingTimer = null

const tabToPath = {
  home: '/',
  category: '/products',
  recipes: '/recipes',
  cart: '/cart',
  profile: '/profile'
}

const pathToTab = {
  '/': 'home',
  '/products': 'category',
  '/recipes': 'recipes',
  '/cart': 'cart',
  '/profile': 'profile'
}

const hideTabbar = computed(() => Boolean(route.meta?.hideTabbar))
const extraBottom = computed(() => Boolean(route.meta?.extraBottom))

const handleTabChange = (tabName) => {
  const targetPath = tabToPath[tabName]
  if (targetPath) {
    currentTab.value = tabName
    router.push(targetPath)
  }
}

const handleProfileClick = () => {
  if (unreadCount.value > 0) {
    router.push('/messages')
  } else {
    router.push('/profile')
  }
}

watch(() => route.path, async (newPath) => {
  const tabName = pathToTab[newPath]
  if (tabName && tabName !== currentTab.value) {
    await nextTick()
    currentTab.value = tabName
  }
}, { immediate: true, deep: true })

watch(() => route.fullPath, () => {
  window.scrollTo({ top: 0, behavior: 'instant' })
})

onMounted(() => {
  const tabName = pathToTab[route.path]
  if (tabName) {
    currentTab.value = tabName
  }
  // 登录后开始全局聊天轮询
  if (userStore.isLoggedIn) {
    checkUnreadMessages()
    chatPollingTimer = setInterval(checkUnreadMessages, 10000)
  }
})

onUnmounted(() => {
  if (chatPollingTimer) {
    clearInterval(chatPollingTimer)
    chatPollingTimer = null
  }
})

// 全局轮询未读消息
const checkUnreadMessages = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const { data } = await userApi.getUnreadCount()
    unreadCount.value = data?.count || 0
  } catch {
    // 静默失败
  }
}
</script>

<style scoped>
.tabbar-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.page-content {
  flex: 1;
  padding-bottom: calc(60px + env(safe-area-inset-bottom));
}

.page-content.no-tabbar {
  padding-bottom: 0;
}

.page-content.extra-bottom {
  padding-bottom: calc(140px + env(safe-area-inset-bottom));
}
</style>
