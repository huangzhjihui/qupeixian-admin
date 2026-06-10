<template>
  <div class="admin-page">
    <div class="content-header">
      <h3 class="content-title">Banner管理</h3>
      <van-button type="primary" size="small" @click="handleAddBanner">
        <van-icon name="plus" /> 新增Banner
      </van-button>
    </div>

    <div class="content-body">
      <div class="banner-list">
        <div v-for="banner in bannerList" :key="banner.id" class="banner-card">
          <img :src="banner.image" class="banner-img" />
          <div class="banner-info">
            <h4 class="banner-title">{{ banner.title }}</h4>
            <p class="banner-desc">{{ banner.description }}</p>
            <div class="banner-meta">
              <span class="banner-sort">
                <van-icon name="sort" />
                排序: {{ banner.sort_order }}
              </span>
              <van-tag :type="banner.is_active ? 'success' : 'default'" size="medium">
                {{ banner.is_active ? '已上架' : '已下架' }}
              </van-tag>
            </div>
            <div class="banner-actions">
              <van-button size="mini" type="primary" @click="handleEdit(banner)">编辑</van-button>
              <van-button 
                size="mini" 
                :type="banner.is_active ? 'warning' : 'success'"
                @click="handleToggleStatus(banner)"
              >
                {{ banner.is_active ? '下架' : '上架' }}
              </van-button>
              <van-button size="mini" @click="handleMoveUp(banner)" :disabled="banner.sort_order === 1">
                <van-icon name="arrow-up" />
              </van-button>
              <van-button size="mini" @click="handleMoveDown(banner)" :disabled="banner.sort_order === bannerList.length">
                <van-icon name="arrow-down" />
              </van-button>
              <van-button size="mini" type="danger" @click="handleDelete(banner)">删除</van-button>
            </div>
          </div>
        </div>

        <div v-if="bannerList.length === 0" class="empty-state">
          <van-icon name="photo-o" size="48" color="#ccc" />
          <p>暂无Banner数据</p>
        </div>
      </div>
    </div>

    <van-popup 
      v-model:show="showForm" 
      position="bottom" 
      :style="{ height: '60%' }"
      round
      closeable
    >
      <div class="form-container">
        <div class="form-header">
          <h3>{{ isEdit ? '编辑Banner' : '新增Banner' }}</h3>
        </div>
        
        <van-form @submit="handleSubmit" class="banner-form">
          <van-cell-group inset>
            <van-field
              v-model="form.title"
              label="标题"
              placeholder="请输入Banner标题"
              required
              :rules="[{ required: true, message: '请输入标题' }]"
            />
            <van-field
              v-model="form.description"
              label="描述"
              placeholder="请输入Banner描述"
            />
            <van-field name="image" label="Banner图片">
              <template #input>
                <ImageUpload v-model="form.image" alt="Banner图片" />
              </template>
            </van-field>
            <van-field
              v-model="form.link_url"
              label="跳转链接"
              placeholder="点击后跳转的链接地址"
            />
            <van-field
              v-model="form.sort_order"
              type="digit"
              label="排序"
              placeholder="数字越小越靠前"
            />
            <van-field name="switch" label="上架状态">
              <template #input>
                <van-switch v-model="form.is_active" size="20" />
              </template>
            </van-field>
          </van-cell-group>

          <div class="form-submit">
            <van-button type="primary" native-type="submit" block>保存Banner</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { adminApi } from '@/api'
import ImageUpload from '@/admin/components/ImageUpload.vue'

const bannerList = ref([])
const showForm = ref(false)
const isEdit = ref(false)

const form = ref({
  title: '',
  description: '',
  image: '',
  link_url: '',
  sort_order: 1,
  is_active: true
})

const loadBanners = async () => {
  try {
    const { data } = await adminApi.getBanners()
    bannerList.value = (data || []).sort((a, b) => a.sort_order - b.sort_order)
  } catch (error) {
    console.error('加载Banner失败:', error)
    bannerList.value = [
      { id: 1, title: '新人专享优惠', description: '新用户注册立享20元优惠', image_url: 'https://picsum.photos/800/300?random=1', link_url: '/products', sort_order: 1, is_active: true },
      { id: 2, title: '周末特惠活动', description: '周末下单享受特别折扣', image_url: 'https://picsum.photos/800/300?random=2', link_url: '/products', sort_order: 2, is_active: true },
      { id: 3, title: '会员专属福利', description: 'VIP会员专享优惠', image_url: 'https://picsum.photos/800/300?random=3', link_url: '/vip', sort_order: 3, is_active: false },
      { id: 4, title: '夏季清凉套餐', description: '精选夏季清凉美食', image_url: 'https://picsum.photos/800/300?random=4', link_url: '/products', sort_order: 4, is_active: true }
    ]
  }
}

const handleAddBanner = () => {
  isEdit.value = false
  form.value = {
    title: '',
    description: '',
    image: '',
    link_url: '',
    sort_order: bannerList.value.length + 1,
    is_active: true
  }
  showForm.value = true
}

const handleEdit = (banner) => {
  isEdit.value = true
  form.value = {
    ...banner,
    is_active: banner.is_active === 1 || banner.is_active === true
  }
  showForm.value = true
}

const handleDelete = async (banner) => {
  try {
    await showConfirmDialog({
      title: '删除Banner',
      message: `确定要删除"${banner.title}"吗？`
    })
    await adminApi.deleteBanner(banner.id)
    bannerList.value = bannerList.value.filter(b => b.id !== banner.id)
    showToast('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      showToast('删除失败')
    }
  }
}

const handleToggleStatus = async (banner) => {
  try {
    const newStatus = !banner.is_active
    await adminApi.updateBannerStatus(banner.id, { is_active: newStatus ? 1 : 0 })
    banner.is_active = newStatus
    showToast(newStatus ? '已上架' : '已下架')
  } catch (error) {
    console.error('更新状态失败:', error)
    showToast('操作失败')
  }
}

const handleMoveUp = async (banner) => {
  const index = bannerList.value.findIndex(b => b.id === banner.id)
  if (index > 0) {
    const prevBanner = bannerList.value[index - 1]
    const newSort = prevBanner.sort_order
    prevBanner.sort_order = banner.sort_order
    banner.sort_order = newSort
    
    bannerList.value.sort((a, b) => a.sort_order - b.sort_order)
    
    try {
      await adminApi.updateBannerSort(banner.id, { sort_order: banner.sort_order })
      await adminApi.updateBannerSort(prevBanner.id, { sort_order: prevBanner.sort_order })
      showToast('排序已更新')
    } catch (error) {
      console.error('更新排序失败:', error)
      showToast('更新失败')
    }
  }
}

const handleMoveDown = async (banner) => {
  const index = bannerList.value.findIndex(b => b.id === banner.id)
  if (index < bannerList.value.length - 1) {
    const nextBanner = bannerList.value[index + 1]
    const newSort = nextBanner.sort_order
    nextBanner.sort_order = banner.sort_order
    banner.sort_order = newSort
    
    bannerList.value.sort((a, b) => a.sort_order - b.sort_order)
    
    try {
      await adminApi.updateBannerSort(banner.id, { sort_order: banner.sort_order })
      await adminApi.updateBannerSort(nextBanner.id, { sort_order: nextBanner.sort_order })
      showToast('排序已更新')
    } catch (error) {
      console.error('更新排序失败:', error)
      showToast('更新失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    const submitData = {
      ...form.value,
      is_active: form.value.is_active ? 1 : 0
    }
    
    if (isEdit.value) {
      await adminApi.updateBanner(form.value.id, submitData)
      showToast('修改成功')
    } else {
      await adminApi.createBanner(submitData)
      showToast('添加成功')
    }
    showForm.value = false
    loadBanners()
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
  }
}

onMounted(() => {
  loadBanners()
})
</script>

<style scoped>
.admin-page {
  min-height: 100%;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.content-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.content-body {
  padding: 20px;
}

.banner-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.banner-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.banner-info {
  padding: 12px;
}

.banner-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.banner-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
}

.banner-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.banner-sort {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.banner-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
}

.empty-state p {
  margin-top: 10px;
  color: #999;
}

.form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-header h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.banner-form {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-submit {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>