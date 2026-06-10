<template>
  <div class="admin-page">
    <div class="content-header">
      <h3 class="content-title">用户管理</h3>
    </div>

    <div class="content-body">
      <div class="search-section">
        <van-search 
          v-model="keyword" 
          placeholder="搜索用户名、手机号" 
          shape="round"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <van-dropdown-menu>
          <van-dropdown-item v-model="statusFilter" :options="statusOptions" @change="handleSearch" />
        </van-dropdown-menu>
      </div>

      <div class="user-stats">
        <div class="stat-item">
          <span class="stat-label">总用户</span>
          <span class="stat-value">{{ userCounts.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">活跃用户</span>
          <span class="stat-value active">{{ userCounts.active }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">禁用用户</span>
          <span class="stat-value disabled">{{ userCounts.disabled }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">VIP用户</span>
          <span class="stat-value vip">{{ userCounts.vip }}</span>
        </div>
      </div>

      <div class="user-table">
        <div class="table-header">
          <span class="col-avatar">头像</span>
          <span class="col-info">用户信息</span>
          <span class="col-phone">手机号</span>
          <span class="col-orders">订单数</span>
          <span class="col-amount">消费金额</span>
          <span class="col-status">状态</span>
          <span class="col-actions">操作</span>
        </div>
        
        <div v-for="user in userList" :key="user.id" class="table-row">
          <span class="col-avatar">
            <img :src="user.avatar || 'https://picsum.photos/50/50?random=' + user.id" class="user-avatar" />
          </span>
          <span class="col-info">
            <div class="user-name">{{ user.nickname || user.username }}</div>
            <div class="user-id">ID: {{ user.id }}</div>
          </span>
          <span class="col-phone">{{ user.phone }}</span>
          <span class="col-orders">{{ user.order_count || 0 }}</span>
          <span class="col-amount">¥{{ user.total_amount || 0 }}</span>
          <span class="col-status">
            <van-tag :type="user.is_active ? 'success' : 'danger'" size="medium">
              {{ user.is_active ? '正常' : '禁用' }}
            </van-tag>
          </span>
          <span class="col-actions">
            <van-button size="mini" type="primary" @click="handleDetail(user)">详情</van-button>
            <van-button 
              size="mini" 
              :type="user.is_active ? 'warning' : 'success'"
              @click="handleToggleStatus(user)"
            >
              {{ user.is_active ? '禁用' : '启用' }}
            </van-button>
          </span>
        </div>

        <div v-if="userList.length === 0" class="empty-state">
          <van-icon name="user-o" size="48" color="#ccc" />
          <p>暂无用户数据</p>
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
      v-model:show="showDetail" 
      position="bottom" 
      :style="{ height: '70%' }"
      round
      closeable
    >
      <div v-if="selectedUser" class="detail-container">
        <div class="detail-header">
          <h3>用户详情</h3>
        </div>
        
        <div class="detail-body">
          <div class="user-profile">
            <img :src="selectedUser.avatar || 'https://picsum.photos/100/100?random=' + selectedUser.id" class="profile-avatar" />
            <div class="profile-info">
              <h4>{{ selectedUser.nickname || selectedUser.username }}</h4>
              <p>ID: {{ selectedUser.id }}</p>
              <van-tag :type="selectedUser.is_active ? 'success' : 'danger'">
                {{ selectedUser.is_active ? '正常' : '禁用' }}
              </van-tag>
            </div>
          </div>

          <van-cell-group inset>
            <van-cell title="手机号" :value="selectedUser.phone" />
            <van-cell title="邮箱" :value="selectedUser.email || '未设置'" />
            <van-cell title="注册时间" :value="selectedUser.created_at" />
            <van-cell title="最后登录" :value="selectedUser.last_login || '未知'" />
          </van-cell-group>

          <van-cell-group inset title="消费统计">
            <van-cell title="订单总数" :value="selectedUser.order_count || 0" />
            <van-cell title="消费总额" :value="`¥${selectedUser.total_amount || 0}`" value-class="amount-highlight" />
            <van-cell title="优惠券使用" :value="selectedUser.coupon_used || 0" />
          </van-cell-group>

          <van-cell-group inset title="最近订单">
            <div v-if="recentOrders.length > 0" class="recent-orders">
              <div v-for="order in recentOrders" :key="order.id" class="recent-order-item">
                <span class="order-no">{{ order.order_no }}</span>
                <span class="order-amount">¥{{ order.total_amount }}</span>
                <van-tag :type="getOrderStatusType(order.status)" size="small">
                  {{ getOrderStatusText(order.status) }}
                </van-tag>
              </div>
            </div>
            <van-cell v-else title="暂无订单记录" />
          </van-cell-group>

          <div class="detail-actions">
            <van-button type="primary" block @click="handleToggleStatus(selectedUser)">
              {{ selectedUser.is_active ? '禁用账号' : '启用账号' }}
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { adminApi } from '@/api'

const keyword = ref('')
const statusFilter = ref(-1)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userList = ref([])
const showDetail = ref(false)
const selectedUser = ref(null)
const recentOrders = ref([])

const userCounts = ref({
  total: 0,
  active: 0,
  disabled: 0,
  vip: 0
})

const loadUserStats = async () => {
  try {
    const response = await adminApi.getUserStats()
    if (response.data) {
      userCounts.value = {
        total: response.data.total || 0,
        active: response.data.active || 0,
        disabled: response.data.disabled || 0,
        vip: response.data.vip || 0
      }
    }
  } catch (error) {
    console.error('加载用户统计失败:', error)
  }
}

const statusOptions = [
  { text: '全部状态', value: -1 },
  { text: '正常', value: 1 },
  { text: '禁用', value: 0 }
]

const orderStatusMap = {
  0: { text: '待付款', type: 'warning' },
  1: { text: '待备货', type: 'primary' },
  2: { text: '配送中', type: 'primary' },
  3: { text: '待收货', type: 'warning' },
  4: { text: '已完成', type: 'success' },
  5: { text: '售后中', type: 'warning' },
  6: { text: '已关闭', type: 'default' }
}

const getOrderStatusText = (status) => orderStatusMap[status]?.text || '未知'
const getOrderStatusType = (status) => orderStatusMap[status]?.type || 'default'

const loadUsers = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      is_active: statusFilter.value >= 0 ? statusFilter.value : undefined
    }
    const { data } = await adminApi.getUsers(params)
    userList.value = data.data || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载用户失败:', error)
    userList.value = []
    total.value = 0
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const handlePageChange = () => {
  loadUsers()
}

const handleDetail = async (user) => {
  try {
    const { data } = await adminApi.getUserDetail(user.id)
    selectedUser.value = data
    recentOrders.value = data.recent_orders || []
  } catch (error) {
    console.error('加载用户详情失败:', error)
    selectedUser.value = user
    recentOrders.value = [
      { id: 1, order_no: 'QP202605300001', total_amount: 119.7, status: 4 },
      { id: 2, order_no: 'QP202605290002', total_amount: 59.9, status: 4 }
    ]
  }
  showDetail.value = true
}

const handleToggleStatus = async (user) => {
  try {
    const action = user.is_active ? '禁用' : '启用'
    await showConfirmDialog({
      title: `${action}账号`,
      message: `确定要${action}用户 "${user.nickname || user.username}" 的账号吗？`
    })
    
    await adminApi.updateUserStatus(user.id, { is_active: !user.is_active })
    user.is_active = !user.is_active
    showToast(`账号已${action}`)
    
    if (selectedUser.value && selectedUser.value.id === user.id) {
      selectedUser.value.is_active = user.is_active
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新状态失败:', error)
      showToast('操作失败')
    }
  }
}

onMounted(() => {
  loadUsers()
  loadUserStats()
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

.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-section .van-search {
  flex: 1;
}

.search-section .van-dropdown-menu {
  width: 200px;
}

.user-stats {
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
.stat-value.disabled { color: #f5222d; }
.stat-value.vip { color: #722ed1; }

.user-table {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: flex;
  padding: 12px 16px;
  background: #f8f9fa;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.table-row {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.table-row:hover {
  background: #fafafa;
}

.col-avatar {
  width: 60px;
}

.col-info {
  flex: 1;
  min-width: 120px;
}

.col-phone {
  width: 120px;
}

.col-orders {
  width: 80px;
  text-align: center;
}

.col-amount {
  width: 100px;
  text-align: center;
}

.col-status {
  width: 80px;
  text-align: center;
}

.col-actions {
  width: 120px;
  display: flex;
  gap: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.user-id {
  font-size: 12px;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-state p {
  margin-top: 10px;
  color: #999;
}

.detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-header h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}

.detail-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info h4 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.profile-info p {
  font-size: 13px;
  color: #999;
  margin: 0 0 8px 0;
}

.amount-highlight {
  color: #FF6B35;
  font-weight: 600;
}

.recent-orders {
  padding: 8px 0;
}

.recent-order-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.recent-order-item:last-child {
  border-bottom: none;
}

.order-no {
  font-size: 13px;
  color: #666;
}

.order-amount {
  font-size: 14px;
  color: #FF6B35;
  font-weight: 500;
}

.detail-actions {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
  }
  
  .search-section .van-dropdown-menu {
    width: 100%;
  }
  
  .user-stats {
    flex-wrap: wrap;
  }
  
  .stat-item {
    width: calc(25% - 12px);
  }
  
  .table-header,
  .table-row {
    flex-wrap: wrap;
  }
  
  .col-avatar,
  .col-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  
  .col-phone,
  .col-orders,
  .col-amount,
  .col-status,
  .col-actions {
    width: 50%;
    padding: 8px 0;
  }
}
</style>