<template>
  <div class="admin-page">
    <div class="content-header">
      <h3 class="content-title">公告管理</h3>
      <van-button type="primary" size="small" @click="handleAddNotice">
        <van-icon name="plus" /> 发布公告
      </van-button>
    </div>

    <div class="content-body">
      <div class="notice-list">
        <div v-for="notice in noticeList" :key="notice.id" class="notice-card">
          <div class="notice-header">
            <div class="notice-title-row">
              <van-tag :type="getTypeColor(notice.type)" size="medium">
                {{ getTypeText(notice.type) }}
              </van-tag>
              <h4 class="notice-title">{{ notice.title }}</h4>
            </div>
            <div class="notice-status">
              <van-tag :type="notice.is_active ? 'success' : 'default'" size="small">
                {{ notice.is_active ? '已发布' : '草稿' }}
              </van-tag>
            </div>
          </div>
          
          <div class="notice-content">
            {{ notice.content }}
          </div>
          
          <div class="notice-footer">
            <div class="notice-meta">
              <span class="meta-item">
                <van-icon name="clock-o" />
                {{ notice.created_at }}
              </span>
              <span v-if="notice.expire_at" class="meta-item">
                <van-icon name="warning-o" />
                过期: {{ notice.expire_at }}
              </span>
              <span class="meta-item">
                <van-icon name="eye-o" />
                阅读: {{ notice.view_count || 0 }}
              </span>
            </div>
            <div class="notice-actions">
              <van-button size="mini" type="primary" @click="handleEdit(notice)">编辑</van-button>
              <van-button 
                size="mini" 
                :type="notice.is_active ? 'warning' : 'success'"
                @click="handleTogglePublish(notice)"
              >
                {{ notice.is_active ? '撤回' : '发布' }}
              </van-button>
              <van-button size="mini" type="danger" @click="handleDelete(notice)">删除</van-button>
            </div>
          </div>
        </div>

        <div v-if="noticeList.length === 0" class="empty-state">
          <van-icon name="comment-circle-o" size="48" color="#ccc" />
          <p>暂无公告数据</p>
        </div>
      </div>

      <van-pagination
        v-model="currentPage"
        :total-items="total"
        :items-per-page="pageSize"
        :show-page-size="5"
        force-ellipses
        @change="handlePageChange"
      />
    </div>

    <van-popup 
      v-model:show="showForm" 
      position="bottom" 
      :style="{ height: '70%' }"
      round
      closeable
      teleport="body"
    >
      <div class="form-container">
        <div class="form-header">
          <h3>{{ isEdit ? '编辑公告' : '发布公告' }}</h3>
        </div>
        
        <van-form @submit="handleSubmit" class="notice-form">
          <van-cell-group inset>
            <van-field
              v-model="form.title"
              label="标题"
              placeholder="请输入公告标题"
              required
              :rules="[{ required: true, message: '请输入标题' }]"
            />
            <van-field
              v-model="form.type"
              is-link
              readonly
              label="类型"
              placeholder="请选择公告类型"
              @click="showTypePicker = true"
            />
            <van-field
              v-model="form.content"
              label="内容"
              placeholder="请输入公告内容"
              type="textarea"
              rows="4"
              autosize
              required
              :rules="[{ required: true, message: '请输入内容' }]"
            />
            <van-field
              v-model="form.expire_at"
              is-link
              readonly
              label="过期时间"
              placeholder="点击选择过期时间（可选）"
              @click="showDatePicker = true"
            />
            <van-field name="switch" label="立即发布">
              <template #input>
                <van-switch v-model="form.is_published" size="20" />
              </template>
            </van-field>
            <van-field name="switch" label="置顶">
              <template #input>
                <van-switch v-model="form.is_top" size="20" />
              </template>
            </van-field>
          </van-cell-group>

          <div class="form-submit">
            <van-button type="primary" native-type="submit" block>保存公告</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showTypePicker" position="bottom" round teleport="body" :overlay="false">
      <van-picker
        :columns="typeOptions"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDatePicker" position="bottom" round teleport="body" :overlay="false">
      <van-date-picker
        v-model="selectedDate"
        title="选择过期时间"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { adminApi } from '@/api'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const noticeList = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const showTypePicker = ref(false)
const showDatePicker = ref(false)
const now = new Date()
const selectedDate = ref([
  String(now.getFullYear()),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0')
])
const minDate = new Date()
const maxDate = new Date(now.getFullYear() + 2, 11, 31)

const form = ref({
  title: '',
  type: '',
  content: '',
  expire_at: '',
  is_published: true,
  is_top: false
})

const typeOptions = [
  { text: '系统公告', value: 'system' },
  { text: '活动通知', value: 'activity' },
  { text: '维护通知', value: 'maintenance' },
  { text: '更新日志', value: 'update' }
]

// 数字类型 → 字符串映射
const typeReverseMap = { 0: 'system', 1: 'activity', 2: 'maintenance', 3: 'update' }

const getTypeText = (type) => {
  const strType = typeof type === 'number' ? (typeReverseMap[type] || 'system') : type
  const option = typeOptions.find(o => o.value === strType)
  return option ? option.text : strType
}

const getTypeColor = (type) => {
  const strType = typeof type === 'number' ? (typeReverseMap[type] || 'system') : type
  const colorMap = {
    system: 'primary',
    activity: 'success',
    maintenance: 'warning',
    update: 'default'
  }
  return colorMap[strType] || 'default'
}

const loadNotices = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const { data } = await adminApi.getNotices(params)
    noticeList.value = data.data || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载公告失败:', error)
    noticeList.value = [
      { id: 1, title: '系统维护通知', content: '系统将于今晚22:00-24:00进行维护升级，届时将暂停服务，请提前做好准备。', type: 'maintenance', is_published: true, is_top: true, created_at: '2025-05-28 10:00', expire_at: '2025-05-30', view_count: 156 },
      { id: 2, title: '新功能上线', content: '我们新增了食谱推荐功能，可以根据您的喜好推荐合适的食谱，快来体验吧！', type: 'update', is_published: true, is_top: false, created_at: '2025-05-27 15:30', expire_at: '', view_count: 89 },
      { id: 3, title: '端午节活动预告', content: '端午节即将来临，我们准备了丰富的优惠活动，敬请期待！活动时间：6月1日-6月5日。', type: 'activity', is_published: true, is_top: false, created_at: '2025-05-26 09:00', expire_at: '2025-06-05', view_count: 234 },
      { id: 4, title: '用户协议更新', content: '我们更新了用户协议和隐私政策，请在使用前仔细阅读。', type: 'system', is_published: false, is_top: false, created_at: '2025-05-25 14:00', expire_at: '', view_count: 0 }
    ]
    total.value = 4
  }
}

const handlePageChange = () => {
  loadNotices()
}

const handleAddNotice = () => {
  isEdit.value = false
  form.value = {
    title: '',
    type: '',
    content: '',
    expire_at: '',
    is_published: true,
    is_top: false
  }
  showForm.value = true
}

const handleEdit = (notice) => {
  // 数字类型 → 字符串
  const typeReverseMap = { 0: 'system', 1: 'activity', 2: 'maintenance', 3: 'update' }
  isEdit.value = true
  form.value = {
    ...notice,
    type: typeReverseMap[notice.type] || 'system',
    is_published: notice.is_active === 1 || notice.is_active === true,
    is_top: (notice.sort_order || 0) > 0
  }
  showForm.value = true
}

const handleDelete = async (notice) => {
  try {
    await showConfirmDialog({
      title: '删除公告',
      message: `确定要删除"${notice.title}"吗？`
    })
    await adminApi.deleteNotice(notice.id)
    noticeList.value = noticeList.value.filter(n => n.id !== notice.id)
    showToast('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      showToast('删除失败')
    }
  }
}

const handleTogglePublish = async (notice) => {
  try {
    const newStatus = !notice.is_active
    await adminApi.updateNoticeStatus(notice.id, { is_published: newStatus ? 1 : 0 })
    notice.is_active = newStatus
    showToast(newStatus ? '发布成功' : '已撤回')
  } catch (error) {
    console.error('更新状态失败:', error)
    showToast(error.apiMessage || error.message || '操作失败')
  }
}

const onTypeConfirm = ({ selectedOptions }) => {
  form.value.type = selectedOptions[0].value
  showTypePicker.value = false
}

const onDateConfirm = ({ selectedValues }) => {
  form.value.expire_at = selectedValues.join('-')
  showDatePicker.value = false
}

const handleSubmit = async () => {
  try {
    const submitData = {
      title: form.value.title,
      type: form.value.type,
      content: form.value.content,
      is_published: form.value.is_published ? 1 : 0,
      is_top: form.value.is_top ? 1 : 0
    }
    
    if (isEdit.value) {
      await adminApi.updateNotice(form.value.id, submitData)
      showToast('修改成功')
    } else {
      await adminApi.createNotice(submitData)
      showToast('发布成功')
    }
    showForm.value = false
    loadNotices()
  } catch (error) {
    console.error('保存失败:', error)
    showToast(error.apiMessage || error.message || '保存失败')
  }
}

onMounted(() => {
  loadNotices()
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

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notice-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.notice-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.notice-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.notice-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.notice-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4px;
}

.notice-actions {
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

.notice-form {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-submit {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>