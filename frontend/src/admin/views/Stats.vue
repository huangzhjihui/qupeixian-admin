<template>
  <div class="stats-page">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon orders">
          <van-icon name="clipboard-o" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.todayOrders }}</span>
          <span class="stat-label">今日订单</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon revenue">
          <van-icon name="wallet" />
        </div>
        <div class="stat-info">
          <span class="stat-value">¥{{ stats.todayRevenue }}</span>
          <span class="stat-label">今日销售额</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon users">
          <van-icon name="users" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.newUsers }}</span>
          <span class="stat-label">新增用户</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon products">
          <van-icon name="goods" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalProducts }}</span>
          <span class="stat-label">商品总数</span>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-section">
        <div class="section-header">
          <h4>近7日订单趋势</h4>
          <div class="chart-summary">
            <span class="summary-item">
              <van-icon name="arrow-up" color="#52c41a" />
              总订单: {{ orderStats.total }}
            </span>
            <span class="summary-item">
              <van-icon name="arrow-up" color="#52c41a" />
              日均: {{ orderStats.avg }}
            </span>
          </div>
        </div>
        <div class="bar-chart">
          <div class="chart-container">
            <div class="y-axis">
              <span v-for="val in yAxisValues" :key="val">{{ val }}</span>
            </div>
            <div class="bars-container">
              <div v-for="(item, index) in orderChartData" :key="index" class="bar-item">
                <div class="bar-wrapper">
                  <div 
                    class="bar" 
                    :style="{ height: getBarHeight(item.value, maxOrderValue) + '%' }"
                  >
                    <span class="bar-value">{{ item.value }}</span>
                  </div>
                </div>
                <span class="bar-label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="section-header">
          <h4>近7日销售额趋势</h4>
          <div class="chart-summary">
            <span class="summary-item">
              <van-icon name="arrow-up" color="#52c41a" />
              总销售: ¥{{ revenueStats.total }}
            </span>
            <span class="summary-item">
              <van-icon name="arrow-up" color="#52c41a" />
              日均: ¥{{ revenueStats.avg }}
            </span>
          </div>
        </div>
        <div class="line-chart">
          <div class="chart-container">
            <div class="y-axis">
              <span v-for="val in revenueYAxisValues" :key="val">¥{{ val }}</span>
            </div>
            <div class="line-container">
              <svg class="line-svg" viewBox="0 0 700 200">
                <polyline
                  :points="getLinePoints(revenueChartData, maxRevenueValue)"
                  fill="none"
                  stroke="#FF6B35"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <g v-for="(point, index) in getLinePointsArray(revenueChartData, maxRevenueValue)" :key="index">
                  <circle :cx="point.x" :cy="point.y" r="5" fill="#FF6B35" />
                  <text :x="point.x" :y="point.y - 15" text-anchor="middle" class="point-label">
                    ¥{{ revenueChartData[index].value }}
                  </text>
                </g>
              </svg>
              <div class="x-labels">
                <span v-for="(item, index) in revenueChartData" :key="index">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-section">
        <div class="section-header">
          <h4>商品销量排行</h4>
        </div>
        <div class="product-ranking">
          <div v-for="(product, index) in productRanking" :key="product.id" class="ranking-item">
            <div class="ranking-index" :class="{ top: index < 3 }">{{ index + 1 }}</div>
            <div class="ranking-info">
              <span class="ranking-name">{{ product.name }}</span>
              <span class="ranking-sales">销量: {{ product.sales }}件</span>
            </div>
            <div class="ranking-bar">
              <div class="ranking-progress" :style="{ width: (product.sales / maxProductSales * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="section-header">
          <h4>用户活跃度</h4>
        </div>
        <div class="user-stats">
          <div class="user-stat-item">
            <div class="user-stat-icon">
              <van-icon name="user-o" color="#FF6B35" />
            </div>
            <div class="user-stat-info">
              <span class="user-stat-value">{{ userStats.activeUsers }}</span>
              <span class="user-stat-label">活跃用户</span>
            </div>
          </div>
          <div class="user-stat-item">
            <div class="user-stat-icon">
              <van-icon name="friends-o" color="#52c41a" />
            </div>
            <div class="user-stat-info">
              <span class="user-stat-value">{{ userStats.newUsersWeek }}</span>
              <span class="user-stat-label">本周新增</span>
            </div>
          </div>
          <div class="user-stat-item">
            <div class="user-stat-icon">
              <van-icon name="star-o" color="#1890ff" />
            </div>
            <div class="user-stat-info">
              <span class="user-stat-value">{{ userStats.vipUsers }}</span>
              <span class="user-stat-label">会员用户</span>
            </div>
          </div>
          <div class="user-stat-item">
            <div class="user-stat-icon">
              <van-icon name="cart-o" color="#722ed1" />
            </div>
            <div class="user-stat-info">
              <span class="user-stat-value">{{ userStats.buyUsers }}</span>
              <span class="user-stat-label">购买用户</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api'

const stats = ref({
  todayOrders: 0,
  todayRevenue: 0,
  newUsers: 0,
  totalProducts: 0
})

const orderChartData = ref([])

const revenueChartData = ref([])

const productRanking = ref([])

const userStats = ref({
  activeUsers: 0,
  newUsersWeek: 0,
  vipUsers: 0,
  buyUsers: 0
})

const maxOrderValue = computed(() => {
  const values = orderChartData.value.map(item => item.value)
  return values.length > 0 ? Math.max(...values) : 100
})
const maxRevenueValue = computed(() => {
  const values = revenueChartData.value.map(item => item.value)
  return values.length > 0 ? Math.max(...values) : 100
})
const maxProductSales = computed(() => {
  const values = productRanking.value.map(item => item.sales)
  return values.length > 0 ? Math.max(...values) : 100
})

const yAxisValues = computed(() => {
  const max = maxOrderValue.value
  const step = Math.ceil(max / 4)
  return [max, max - step, max - step * 2, max - step * 3, 0]
})

const revenueYAxisValues = computed(() => {
  const max = maxRevenueValue.value
  const step = Math.ceil(max / 4)
  return [max, max - step, max - step * 2, max - step * 3, 0]
})

const orderStats = computed(() => {
  const total = orderChartData.value.reduce((sum, item) => sum + item.value, 0)
  return { total, avg: Math.round(total / 7) }
})

const revenueStats = computed(() => {
  const total = revenueChartData.value.reduce((sum, item) => sum + item.value, 0)
  return { total, avg: Math.round(total / 7) }
})

const getBarHeight = (value, max) => {
  return Math.round((value / max) * 100)
}

const getLinePoints = (data, max) => {
  const points = data.map((item, index) => {
    const x = 50 + index * 100
    const y = 200 - (item.value / max) * 180
    return `${x},${y}`
  })
  return points.join(' ')
}

const getLinePointsArray = (data, max) => {
  return data.map((item, index) => {
    const x = 50 + index * 100
    const y = 200 - (item.value / max) * 180
    return { x, y }
  })
}

const loadStats = async () => {
  try {
    const { data } = await adminApi.getStats()
    stats.value = data
  } catch (error) {
    console.error('加载统计数据失败:', error)
    stats.value = {
      todayOrders: 0,
      todayRevenue: 0,
      newUsers: 0,
      totalProducts: 0
    }
  }
}

const loadUserStats = async () => {
  try {
    const response = await adminApi.getUserStats()
    if (response.data) {
      userStats.value = {
        activeUsers: response.data.active || 0,
        newUsersWeek: response.data.newUsersWeek || 0,
        vipUsers: response.data.vip || 0,
        buyUsers: response.data.buyUsers || 0
      }
    }
  } catch (error) {
    console.error('加载用户统计失败:', error)
  }
}

const loadProductRanking = async () => {
  try {
    const { data } = await adminApi.getProducts({ pageSize: 5, sortBy: 'sales', sortOrder: 'desc' })
    if (data && data.data) {
      productRanking.value = data.data.map(p => ({
        id: p.id,
        name: p.name,
        sales: p.sales || 0
      }))
    }
  } catch (error) {
    console.error('加载商品排行失败:', error)
  }
}

onMounted(() => {
  loadStats()
  loadUserStats()
  loadProductRanking()
})
</script>

<style scoped>
.stats-page {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: #fff;
}

.stat-icon.orders {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.users {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.products {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chart-summary {
  display: flex;
  gap: 15px;
}

.summary-item {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.bar-chart {
  height: 200px;
}

.chart-container {
  display: flex;
  height: 100%;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 40px;
  font-size: 12px;
  color: #999;
  padding-right: 10px;
  text-align: right;
}

.bars-container {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 30px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}

.bar-wrapper {
  height: 150px;
  display: flex;
  align-items: flex-end;
  width: 100%;
}

.bar {
  width: 40px;
  background: linear-gradient(180deg, #FF6B35 0%, #F7C59F 100%);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.5s;
  min-height: 20px;
}

.bar-value {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #FF6B35;
  font-weight: 600;
}

.bar-label {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

.line-chart {
  height: 200px;
}

.line-container {
  flex: 1;
  position: relative;
}

.line-svg {
  width: 100%;
  height: 180px;
}

.point-label {
  font-size: 11px;
  fill: #FF6B35;
  font-weight: 600;
}

.x-labels {
  display: flex;
  justify-content: space-around;
  padding-top: 10px;
}

.x-labels span {
  font-size: 12px;
  color: #666;
}

.product-ranking {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ranking-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.ranking-index.top {
  background: #FF6B35;
  color: #fff;
}

.ranking-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ranking-name {
  font-size: 14px;
  color: #333;
}

.ranking-sales {
  font-size: 12px;
  color: #999;
}

.ranking-bar {
  width: 100px;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.ranking-progress {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35 0%, #F7C59F 100%);
  border-radius: 4px;
  transition: width 0.5s;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.user-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.user-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.user-stat-info {
  display: flex;
  flex-direction: column;
}

.user-stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.user-stat-label {
  font-size: 12px;
  color: #999;
}

@media (max-width: 1200px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .user-stats {
    grid-template-columns: 1fr;
  }
}
</style>