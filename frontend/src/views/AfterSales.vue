<template>
  <div class="after-sales">
    <van-nav-bar title="售后服务" left-arrow @click-left="$router.back()" />

    <div class="after-sales-content">
      <div class="compliance-notice">
        <van-icon name="warning-o" color="#faad14" />
        <div class="notice-content">
          <h4>生鲜食材特殊性合规说明</h4>
          <ul>
            <li>生鲜属于易损耗定制商品，不支持七天无理由退货</li>
            <li>签收后24小时内变质、异味、异物、漏发错发，凭照片/视频可全额售后</li>
            <li>超时、储存不当、烹饪问题不在保障范围</li>
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-title">售后记录</div>
        <div v-if="afterSalesList.length > 0" class="after-sales-list">
          <div v-for="item in afterSalesList" :key="item.id" class="after-sales-item">
            <div class="after-sales-header">
              <span class="after-sales-no">售后单号: {{ item.after_sale_no }}</span>
              <span :class="['after-sales-status', 'status-' + item.status]">{{ getStatusText(item.status) }}</span>
            </div>
            <div class="after-sales-info">
              <p>订单号: {{ item.order_no }}</p>
              <p>申请时间: {{ item.created_at }}</p>
              <p>原因: {{ item.reason }}</p>
            </div>
            <div class="after-sales-actions">
              <van-button v-if="item.status === 0" size="small" @click="handleCancel(item)">撤销申请</van-button>
              <van-button v-if="item.status === 1" size="small" type="primary" @click="handleUpload(item)">上传凭证</van-button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <van-empty description="暂无售后记录" />
        </div>
      </div>

      <div class="section">
        <div class="section-title">申请售后</div>
        <van-form @submit="handleApply" class="apply-form">
          <van-cell-group inset>
            <van-field
              v-model="form.order_no"
              name="order_no"
              label="订单号"
              placeholder="请输入订单号"
              :rules="[{ required: true, message: '请输入订单号' }]"
            />
            <van-field
              v-model="form.reason"
              name="reason"
              label="售后原因"
              placeholder="请选择售后原因"
              readonly
              @click="showReasonPicker = true"
            />
            <van-field
              v-model="form.description"
              name="description"
              label="问题描述"
              placeholder="请详细描述问题"
              :type="textarea"
              :rows="3"
            />
          </van-cell-group>

          <div class="submit-section">
            <van-button round block type="primary" native-type="submit" class="btn-submit">提交申请</van-button>
          </div>
        </van-form>
      </div>
    </div>

    <van-popup v-model="showReasonPicker" position="bottom">
      <van-picker :columns="reasonColumns" @confirm="handleReasonConfirm" />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showDialog } from 'vant'
import { orderApi } from '@/api'

const afterSalesList = ref([])
const showReasonPicker = ref(false)

const form = ref({
  order_no: '',
  reason: '',
  description: ''
})

const reasonColumns = [
  { name: '食材变质', value: 'food_spoiled' },
  { name: '有异味', value: 'bad_smell' },
  { name: '发现异物', value: 'foreign_object' },
  { name: '漏发商品', value: 'missing_item' },
  { name: '错发商品', value: 'wrong_item' },
  { name: '包装破损', value: 'damaged_package' }
]

const statusMap = {
  0: '待审核',
  1: '待上传凭证',
  2: '审核通过',
  3: '退款中',
  4: '已完成',
  5: '已拒绝'
}

const getStatusText = (status) => {
  return statusMap[status] || '未知'
}

const loadAfterSales = async () => {
  try {
    const { data } = await orderApi.getAfterSales()
    afterSalesList.value = data
  } catch (error) {
    console.error('加载售后记录失败:', error)
  }
}

const handleReasonConfirm = (value) => {
  const reason = reasonColumns.find(r => r.value === value)
  form.value.reason = reason?.name || ''
  showReasonPicker.value = false
}

const handleApply = async () => {
  try {
    await orderApi.applyAfterSale({
      order_no: form.value.order_no,
      reason: form.value.reason,
      description: form.value.description
    })
    showToast('申请提交成功')
    form.value = { order_no: '', reason: '', description: '' }
    loadAfterSales()
  } catch (error) {
    console.error('提交售后申请失败:', error)
  }
}

const handleCancel = async (item) => {
  await showDialog({
    title: '撤销申请',
    message: '确定要撤销这个售后申请吗？'
  }).then(async () => {
    try {
      await orderApi.cancelAfterSale(item.id)
      showToast('已撤销')
      loadAfterSales()
    } catch (error) {
      console.error('撤销失败:', error)
    }
  }).catch(() => {})
}

const handleUpload = (item) => {
  showToast('上传凭证功能开发中')
}

onMounted(() => {
  loadAfterSales()
})
</script>

<style scoped>
.after-sales {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.after-sales-content {
  padding: 12px;
}

.compliance-notice {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #fffbe6;
  border-radius: 8px;
  margin-bottom: 12px;
}

.notice-content h4 {
  font-size: 14px;
  font-weight: bold;
  color: #ad8b00;
  margin-bottom: 8px;
}

.notice-content ul {
  padding-left: 16px;
}

.notice-content li {
  font-size: 13px;
  color: #ad8b00;
  margin-bottom: 4px;
}

.section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.after-sales-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.after-sales-item {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.after-sales-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.after-sales-no {
  font-size: 13px;
  color: #666;
}

.after-sales-status {
  font-size: 13px;
  font-weight: bold;
}

.status-0 { color: #faad14; }
.status-1 { color: #1890ff; }
.status-2 { color: #52c41a; }
.status-3 { color: #1890ff; }
.status-4 { color: #52c41a; }
.status-5 { color: #ff4d4f; }

.after-sales-info p {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.after-sales-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  padding: 40px 0;
}

.apply-form {
  margin-top: 8px;
}

.submit-section {
  padding: 16px 0;
}

.btn-submit {
  height: 48px;
  font-size: 16px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%);
}
</style>
