<template>
  <div class="admin-page">
    <div class="content-header">
      <h3 class="content-title">优惠券管理</h3>
      <van-button type="primary" size="small" @click="handleAddCoupon">
        <van-icon name="plus" /> 新增优惠券
      </van-button>
    </div>

    <div class="content-body">
      <div class="coupon-stats">
        <div class="stat-item">
          <span class="stat-label">优惠券总数</span>
          <span class="stat-value">{{ couponCounts.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已发放</span>
          <span class="stat-value active">{{ couponCounts.issued }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已使用</span>
          <span class="stat-value used">{{ couponCounts.used }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已过期</span>
          <span class="stat-value expired">{{ couponCounts.expired }}</span>
        </div>
      </div>

      <div class="coupon-list">
        <div v-for="coupon in couponList" :key="coupon.id" class="coupon-card">
          <div class="coupon-left">
            <div class="coupon-value">
              <span class="currency">¥</span>
              <span class="amount">{{ coupon.discount_value }}</span>
            </div>
            <div class="coupon-condition">满{{ coupon.min_amount }}可用</div>
          </div>
          <div class="coupon-right">
            <div class="coupon-info">
              <h4 class="coupon-name">{{ coupon.name }}</h4>
              <p class="coupon-desc">{{ coupon.description }}</p>
              <div class="coupon-time">
                <van-icon name="clock-o" />
                <span>{{ coupon.start_time }} ~ {{ coupon.end_time }}</span>
              </div>
            </div>
            <div class="coupon-meta">
              <van-tag :type="getCouponStatusType(coupon)" size="medium">
                {{ getCouponStatusText(coupon) }}
              </van-tag>
              <span class="coupon-count">已发放 {{ coupon.used_count }}张</span>
            </div>
            <div class="coupon-actions">
              <van-button size="mini" type="primary" @click="handleEdit(coupon)">编辑</van-button>
              <van-button size="mini" type="success" @click="handleIssue(coupon)">发放</van-button>
              <van-button size="mini" type="danger" @click="handleDelete(coupon)">删除</van-button>
            </div>
          </div>
        </div>

        <div v-if="couponList.length === 0" class="empty-state">
          <van-icon name="coupon-o" size="48" color="#ccc" />
          <p>暂无优惠券数据</p>
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
          <h3>{{ isEdit ? '编辑优惠券' : '新增优惠券' }}</h3>
        </div>
        
        <van-form @submit="handleSubmit" class="coupon-form">
          <van-cell-group inset>
            <van-field
              v-model="form.name"
              label="优惠券名称"
              placeholder="请输入优惠券名称"
              required
              :rules="[{ required: true, message: '请输入优惠券名称' }]"
            />
            <van-field
              v-model="form.description"
              label="描述"
              placeholder="请输入优惠券描述"
              type="textarea"
              rows="2"
              autosize
            />
            <van-field
              v-model="form.discount_amount"
              type="number"
              label="优惠金额"
              placeholder="请输入优惠金额"
              required
              :rules="[{ required: true, message: '请输入优惠金额' }]"
            />
            <van-field
              v-model="form.min_amount"
              type="number"
              label="最低消费"
              placeholder="请输入最低消费金额"
              required
              :rules="[{ required: true, message: '请输入最低消费金额' }]"
            />
            <van-field
              v-model="form.total_count"
              type="digit"
              label="发放总量"
              placeholder="请输入发放总量"
              required
              :rules="[{ required: true, message: '请输入发放总量' }]"
            />
            <van-field
              :model-value="form.start_time"
              is-link
              readonly
              label="开始时间"
              placeholder="请选择开始时间"
              required
              @click="openDatePicker('start')"
              :rules="[{ required: true, message: '请选择开始时间' }]"
            />
            <van-field
              :model-value="form.end_time"
              is-link
              readonly
              label="结束时间"
              placeholder="请选择结束时间"
              required
              @click="openDatePicker('end')"
              :rules="[{ required: true, message: '请选择结束时间' }]"
            />
            <van-field name="switch" label="立即启用">
              <template #input>
                <van-switch v-model="form.is_active" size="20" />
              </template>
            </van-field>
          </van-cell-group>

          <div class="form-submit">
            <van-button type="primary" native-type="submit" block>保存优惠券</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup 
      v-model:show="showIssuePopup" 
      position="bottom" 
      :style="{ height: '50%' }"
      round
      closeable
      teleport="body"
    >
      <div v-if="selectedCoupon" class="issue-container">
        <div class="issue-header">
          <h3>发放优惠券</h3>
        </div>
        <div class="issue-body">
          <div class="issue-coupon-info">
            <h4>{{ selectedCoupon.name }}</h4>
            <p>优惠金额: ¥{{ selectedCoupon.discount_value }}</p>
            <p>剩余数量: {{ selectedCoupon.total_count - selectedCoupon.used_count }}张</p>
          </div>
          
          <van-form @submit="handleIssueSubmit">
            <van-cell-group inset>
              <van-field
                v-model="issueForm.issue_count"
                type="digit"
                label="发放数量"
                placeholder="请输入发放数量"
                required
                :rules="[{ required: true, message: '请输入发放数量' }]"
              />
              <van-field
                :model-value="getTargetDisplayText()"
                is-link
                readonly
                label="发放对象"
                placeholder="请选择发放对象"
                required
                @click="showTargetPicker = true"
                :rules="[{ required: true, message: '请选择发放对象' }]"
              />
            </van-cell-group>
            
            <div class="form-submit">
              <van-button type="primary" native-type="submit" block>确认发放</van-button>
            </div>
          </van-form>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showDatePicker" position="bottom" round teleport="body" :overlay="false">
      <van-date-picker
        v-model="datePickerValue"
        :title="datePickerTitle"
        :min-date="datePickerMinDate"
        :max-date="datePickerMaxDate"
        @confirm="onDatePickerConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showTargetPicker" position="bottom" round teleport="body" :overlay="false">
      <van-picker
        :columns="targetOptions"
        @confirm="onTargetConfirm"
        @cancel="showTargetPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showUserPicker" position="bottom" :style="{ height: '60%' }" round closeable>
      <div class="user-picker-container">
        <div class="user-picker-header">
          <h3>选择用户</h3>
          <van-button size="mini" type="primary" @click="confirmUserSelection">确认选择 ({{ selectedUserIds.length }})</van-button>
        </div>
        <van-search v-model="userSearchKeyword" placeholder="搜索手机号/昵称" @search="fetchUsers" @update:model-value="fetchUsers" />
        <div class="user-picker-list">
          <van-checkbox-group v-model="selectedUserIds">
            <van-cell-group inset>
              <van-cell
                v-for="user in userList"
                :key="user.id"
                :title="user.nickname || user.phone"
                :label="user.phone"
                clickable
                @click="toggleUser(user.id)"
              >
                <template #right-icon>
                  <van-checkbox :name="user.id" />
                </template>
              </van-cell>
            </van-cell-group>
            <div v-if="userList.length === 0" class="empty-state" style="padding: 20px;">
              <p>无匹配用户</p>
            </div>
          </van-checkbox-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { adminApi } from '@/api'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const couponList = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const showIssuePopup = ref(false)
const showTargetPicker = ref(false)
const showUserPicker = ref(false)
const showDatePicker = ref(false)
const datePickerField = ref('') // 'start' or 'end'
const datePickerValue = ref(['2026', '06', '01'])
const datePickerMinDate = new Date(2024, 0, 1)
const datePickerMaxDate = new Date(2030, 11, 31)

const datePickerTitle = computed(() => {
  return datePickerField.value === 'start' ? '选择开始时间' : '选择结束时间'
})
const selectedCoupon = ref(null)
const userList = ref([])
const userSearchKeyword = ref('')
const selectedUserIds = ref([])

const couponCounts = computed(() => {
  const now = new Date()
  return {
    total: couponList.value.length,
    issued: couponList.value.length,
    used: couponList.value.reduce((sum, c) => sum + (c.used_count || 0), 0),
    expired: couponList.value.filter(c => c.end_time && new Date(c.end_time) < now).length
  }
})

const form = ref({
  name: '',
  description: '',
  discount_amount: '',
  min_amount: '',
  total_count: '',
  start_time: '',
  end_time: '',
  is_active: true
})

const issueForm = ref({
  issue_count: '',
  target_type: ''
})

const targetOptions = [
  { text: '全部用户', value: 'all' },
  { text: '新用户', value: 'new' },
  { text: 'VIP用户', value: 'vip' },
  { text: '指定用户', value: 'specific' }
]

const targetTextMap = {
  'all': '全部用户',
  'new': '新用户',
  'vip': 'VIP用户',
  'specific': '指定用户'
}

const getTargetDisplayText = () => {
  const type = issueForm.value.target_type
  if (type === 'specific') {
    return selectedUserIds.value.length > 0
      ? `指定用户(已选${selectedUserIds.value.length}人)`
      : '指定用户(未选择)'
  }
  return targetTextMap[type] || type
}

const getCouponStatusType = (coupon) => {
  const now = new Date()
  const end = new Date(coupon.end_time)
  if (now > end) return 'default'
  if (coupon.is_active) return 'success'
  return 'warning'
}

const getCouponStatusText = (coupon) => {
  const now = new Date()
  const end = new Date(coupon.end_time)
  if (now > end) return '已过期'
  if (coupon.is_active) return '进行中'
  return '已停用'
}

const loadCoupons = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    const { data } = await adminApi.getCoupons(params)
    couponList.value = data.data || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载优惠券失败:', error)
    couponList.value = [
      { id: 1, name: '新人专享券', description: '新用户注册即可领取', discount_value: 20, min_amount: 50, total_count: 1000, used_count: 500, start_time: '2026-05-01', end_time: '2026-06-30', is_active: 1 },
      { id: 2, name: '会员专属券', description: 'VIP会员专享优惠', discount_value: 30, min_amount: 100, total_count: 500, used_count: 200, start_time: '2026-05-15', end_time: '2026-07-15', is_active: 1 },
      { id: 3, name: '周末特惠券', description: '周末下单立减', discount_value: 15, min_amount: 30, total_count: 300, used_count: 150, start_time: '2026-05-20', end_time: '2026-05-25', is_active: 0 },
      { id: 4, name: '节日优惠券', description: '节日促销活动', discount_value: 50, min_amount: 150, total_count: 200, used_count: 180, start_time: '2026-04-01', end_time: '2026-04-30', is_active: 0 }
    ]
    total.value = 4
  }
}

const handlePageChange = () => {
  loadCoupons()
}

const handleAddCoupon = () => {
  isEdit.value = false
  form.value = {
    name: '',
    description: '',
    discount_amount: '',
    min_amount: '',
    total_count: '',
    start_time: '',
    end_time: '',
    is_active: true
  }
  showForm.value = true
}

const handleEdit = (coupon) => {
  isEdit.value = true
  form.value = {
    ...coupon,
    is_active: coupon.is_active === 1 || coupon.is_active === true
  }
  showForm.value = true
}

const handleDelete = async (coupon) => {
  try {
    await showConfirmDialog({
      title: '删除优惠券',
      message: `确定要删除"${coupon.name}"吗？`
    })
    await adminApi.deleteCoupon(coupon.id)
    couponList.value = couponList.value.filter(c => c.id !== coupon.id)
    showToast('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      showToast('删除失败')
    }
  }
}

const openDatePicker = (field) => {
  datePickerField.value = field
  const currentValue = field === 'start' ? form.value.start_time : form.value.end_time
  if (currentValue) {
    const parts = currentValue.split('-')
    if (parts.length === 3) {
      datePickerValue.value = parts
    } else {
      const now = new Date()
      datePickerValue.value = [
        String(now.getFullYear()),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ]
    }
  } else {
    const now = new Date()
    datePickerValue.value = [
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ]
  }
  showDatePicker.value = true
}

const onDatePickerConfirm = ({ selectedValues }) => {
  const dateStr = selectedValues.join('-')
  if (datePickerField.value === 'start') {
    form.value.start_time = dateStr
  } else {
    form.value.end_time = dateStr
  }
  showDatePicker.value = false
}

const handleIssue = (coupon) => {
  selectedCoupon.value = coupon
  issueForm.value = {
    issue_count: '',
    target_type: ''
  }
  showIssuePopup.value = true
}

const onTargetConfirm = ({ selectedOptions }) => {
  const selected = selectedOptions[0]
  issueForm.value.target_type = selected.value
  showTargetPicker.value = false
  if (selected.value === 'specific') {
    selectedUserIds.value = []
    userSearchKeyword.value = ''
    fetchUsers()
    showUserPicker.value = true
  }
}

const fetchUsers = async () => {
  try {
    const { data } = await adminApi.getUsers({ keyword: userSearchKeyword.value, pageSize: 50 })
    userList.value = data.data || []
  } catch (e) {
    userList.value = []
  }
}

const toggleUser = (id) => {
  const idx = selectedUserIds.value.indexOf(id)
  if (idx > -1) {
    selectedUserIds.value.splice(idx, 1)
  } else {
    selectedUserIds.value.push(id)
  }
}

const confirmUserSelection = () => {
  showUserPicker.value = false
  if (selectedUserIds.value.length > 0) {
    issueForm.value.target_type = 'specific'
  } else {
    showToast('请至少选择一个用户')
  }
}

const handleSubmit = async () => {
  try {
    const submitData = {
      ...form.value,
      is_active: form.value.is_active ? 1 : 0
    }
    
    if (isEdit.value) {
      await adminApi.updateCoupon(form.value.id, submitData)
      showToast('修改成功')
    } else {
      await adminApi.createCoupon(submitData)
      showToast('添加成功')
    }
    showForm.value = false
    loadCoupons()
  } catch (error) {
    console.error('保存失败:', error)
    showToast('保存失败')
  }
}

const handleIssueSubmit = async () => {
  try {
    if (issueForm.value.target_type === 'specific' && selectedUserIds.value.length === 0) {
      showToast('请先选择指定用户')
      return
    }
    const submitData = {
      issue_count: parseInt(issueForm.value.issue_count, 10),
      target_type: issueForm.value.target_type,
      user_ids: issueForm.value.target_type === 'specific' ? selectedUserIds.value : undefined
    }
    await adminApi.issueCoupon(selectedCoupon.value.id, submitData)
    showToast('发放成功')
    showIssuePopup.value = false
    loadCoupons()
  } catch (error) {
    console.error('发放失败:', error)
    showToast(error.apiMessage || error.message || '发放失败')
  }
}

onMounted(() => {
  loadCoupons()
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

.coupon-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.stat-value.active { color: #52c41a; }
.stat-value.used { color: #1890ff; }
.stat-value.expired { color: #f5222d; }

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.coupon-card {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.coupon-left {
  width: 120px;
  background: linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.coupon-value {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 16px;
  color: #fff;
}

.amount {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
}

.coupon-condition {
  font-size: 12px;
  color: #fff;
  margin-top: 8px;
}

.coupon-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.coupon-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
}

.coupon-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.coupon-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.coupon-count {
  font-size: 12px;
  color: #999;
}

.coupon-actions {
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

.form-container,
.issue-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-header,
.issue-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-header h3,
.issue-header h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.coupon-form,
.issue-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.issue-coupon-info {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.issue-coupon-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.issue-coupon-info p {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.form-submit {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.user-picker-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.user-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.user-picker-header h3 {
  margin: 0;
  font-size: 16px;
}

.user-picker-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

@media (max-width: 768px) {
  .coupon-stats {
    flex-wrap: wrap;
  }
  
  .stat-item {
    width: calc(25% - 12px);
  }
  
  .coupon-card {
    flex-direction: column;
  }
  
  .coupon-left {
    width: 100%;
    padding: 12px;
  }
  
  .coupon-value {
    justify-content: center;
  }
}
</style>