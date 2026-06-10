<template>
  <div class="admin-layout">
    <div class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">趣配鲜管理后台</h2>
      </div>
      
      <div class="menu-list">
        <div
          v-for="menu in menuItems"
          :key="menu.value"
          class="menu-item"
          :class="{ active: currentRoute === menu.path }"
          @click="handleMenuClick(menu.path)"
        >
          <van-icon :name="menu.icon" />
          <span>{{ menu.label }}</span>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <van-button type="default" block @click="handleLogout">退出登录</van-button>
      </div>
    </div>

    <div class="main-content">
      <div class="content-header">
        <h3 class="content-title">{{ currentTitle }}</h3>
        <div class="header-right">
          <span class="admin-name">管理员</span>
        </div>
      </div>

      <div class="content-body">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showDialog } from 'vant'

const router = useRouter()
const route = useRoute()

const currentRoute = ref('')

const menuItems = [
  { label: '数据统计', icon: 'bar-chart-o', value: 'stats', path: '/admin' },
  { label: '商品管理', icon: 'goods', value: 'products', path: '/admin/products' },
  { label: '订单管理', icon: 'clipboard-o', value: 'orders', path: '/admin/orders' },
  { label: '用户管理', icon: 'users', value: 'users', path: '/admin/users' },
  { label: '优惠券管理', icon: 'gift', value: 'coupons', path: '/admin/coupons' },
  { label: '食谱管理', icon: 'file-text', value: 'recipes', path: '/admin/recipes' },
  { label: 'Banner管理', icon: 'image', value: 'banners', path: '/admin/banners' },
  { label: '公告管理', icon: 'bell-o', value: 'notices', path: '/admin/notices' },
  { label: '系统设置', icon: 'setting', value: 'settings', path: '/admin/settings' }
]

const currentTitle = computed(() => {
  const menu = menuItems.find(item => item.path === route.path)
  return menu ? menu.label : '数据统计'
})

const handleMenuClick = (path) => {
  currentRoute.value = path
  router.push(path)
}

const handleLogout = () => {
  showDialog({
    title: '提示',
    message: '确定要退出登录吗？',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }).catch(() => {
    // 用户取消
  })
}

onMounted(() => {
  currentRoute.value = route.path
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 200px;
  background: #2f3542;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #4a5568;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.menu-list {
  flex: 1;
  padding: 10px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 4px;
}

.menu-item:hover {
  background: rgba(255, 107, 53, 0.1);
}

.menu-item.active {
  background: rgba(255, 107, 53, 0.2);
  color: #FF6B35;
}

.menu-item van-icon {
  margin-right: 10px;
  font-size: 16px;
}

.menu-item span {
  font-size: 14px;
}

.sidebar-footer {
  margin-top: auto;
  padding: 10px;
}

.sidebar-footer .van-button {
  background: #1e252d;
  border: none;
  color: #fff;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  background: #fff;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.content-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-name {
  margin-right: 15px;
  font-size: 14px;
  color: #666;
}

.content-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
  
  .sidebar-header {
    padding: 15px 10px;
  }
  
  .sidebar-title {
    display: none;
  }
  
  .menu-item span {
    display: none;
  }
  
  .menu-item {
    justify-content: center;
  }
  
  .admin-name {
    display: none;
  }
}
</style>