<template>
  <div class="tracking-page">
    <van-nav-bar
      title="配送跟踪"
      left-arrow
      @click-left="$router.back()"
      class="tracking-nav"
    />

    <div v-if="loading" class="loading-state">
      <van-loading type="spinner" size="36" />
      <p>加载配送信息...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <van-icon name="warning-o" size="48" color="#ff6b35" />
      <p>{{ error }}</p>
      <van-button type="primary" size="small" @click="$router.back()">返回</van-button>
    </div>

    <template v-else-if="routeData">
      <!-- 地图区域 -->
      <div ref="mapContainer" class="map-container"></div>

      <!-- 底部信息面板 -->
      <div class="bottom-panel">
        <!-- 状态条 -->
        <div class="status-header" :class="'status-bg-' + routeData.status">
          <div class="status-main">
            <div class="status-icon-wrap">
              <van-icon v-if="routeData.status === 2" name="logistics" size="24" />
              <van-icon v-else-if="routeData.status === 3" name="passed" size="24" />
              <van-icon v-else name="check-circle" size="24" />
            </div>
            <div class="status-text">
              <h3>{{ routeData.statusText }}</h3>
              <p v-if="routeData.eta" class="eta-text">{{ routeData.eta }}</p>
              <p v-if="routeData.distance && routeData.status === 2" class="distance-text">
                距您 {{ routeData.distance }}
              </p>
            </div>
          </div>
          <van-button
            v-if="routeData.status === 2 || routeData.status === 3"
            size="small"
            type="primary"
            round
            @click="handleConfirm"
          >确认收货</van-button>
        </div>

        <!-- 配送员信息 -->
        <div class="driver-card">
          <div class="driver-avatar">
            <van-icon name="manager-o" size="28" color="#FF6B35" />
          </div>
          <div class="driver-info">
            <span class="driver-name">{{ routeData.driver.name }}</span>
            <span class="driver-phone">{{ routeData.driver.phone }}</span>
          </div>
          <a :href="'tel:' + routeData.driver.phone" class="driver-call">
            <van-icon name="phone-o" size="20" color="#fff" />
          </a>
        </div>

        <!-- 路线信息 -->
        <div class="route-info">
          <div class="route-point">
            <div class="route-dot store-dot"></div>
            <div class="route-detail">
              <span class="route-label">发货</span>
              <span class="route-addr">{{ routeData.store.name }}</span>
            </div>
          </div>
          <div class="route-line-connector"></div>
          <div class="route-point" v-if="routeData.status === 2">
            <div class="route-dot driver-dot">
              <van-icon name="logistics" size="12" color="#fff" />
            </div>
            <div class="route-detail">
              <span class="route-label current">配送中</span>
              <span class="route-addr">配送员正在前往您的收货地址</span>
            </div>
          </div>
          <div class="route-line-connector" v-if="routeData.status === 2"></div>
          <div class="route-point">
            <div class="route-dot dest-dot"></div>
            <div class="route-detail">
              <span class="route-label" :class="{ current: routeData.status >= 3 }">收货</span>
              <span class="route-addr">{{ routeData.destination.address }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { orderApi } from '@/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()
const router = useRouter()
const mapContainer = ref(null)
const loading = ref(true)
const error = ref('')
const routeData = ref(null)
let mapInstance = null
let driverMarker = null
let animTimer = null

// 自定义图标
const createIcon = (color, size = 32) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};border-radius:50%;
      border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

const storeIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width:36px;height:36px;background:#1890ff;border-radius:50%;
    border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
    font-size:18px;color:#fff;
  ">🏪</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
})

const destIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width:36px;height:36px;background:#52c41a;border-radius:50%;
    border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);
    display:flex;align-items:center;justify-content:center;
    font-size:18px;color:#fff;
  ">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
})

const driverIcon = L.divIcon({
  className: 'custom-marker driver-marker',
  html: `<div style="
    width:40px;height:40px;background:#FF6B35;border-radius:50%;
    border:3px solid #fff;box-shadow:0 2px 12px rgba(255,107,53,0.5);
    display:flex;align-items:center;justify-content:center;
    font-size:20px;color:#fff;
    animation: pulse 2s ease-in-out infinite;
  ">🚚</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
})

const initMap = (data) => {
  if (!mapContainer.value) return

  mapInstance = L.map(mapContainer.value, {
    zoomControl: false,
    attributionControl: false
  })

  // 使用高德地图瓦片（无需API Key）
  L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    minZoom: 10
  }).addTo(mapInstance)

  // 绘制配送路线
  const routeLine = L.polyline(data.route, {
    color: '#FF6B35',
    weight: 4,
    opacity: 0.8,
    dashArray: '8, 6',
    lineCap: 'round'
  }).addTo(mapInstance)

  // 已行驶路线（实线）
  if (data.status === 2) {
    const driverIdx = findClosestRoutePoint(data.route, data.driver.lat, data.driver.lng)
    const traveledRoute = data.route.slice(0, driverIdx + 1)
    traveledRoute.push([data.driver.lat, data.driver.lng])
    L.polyline(traveledRoute, {
      color: '#FF6B35',
      weight: 5,
      opacity: 1,
      lineCap: 'round'
    }).addTo(mapInstance)
  }

  // 门店标记
  L.marker([data.store.lat, data.store.lng], { icon: storeIcon })
    .addTo(mapInstance)
    .bindPopup(`<b>${data.store.name}</b><br/>${data.store.address}`)

  // 目的地标记
  L.marker([data.destination.lat, data.destination.lng], { icon: destIcon })
    .addTo(mapInstance)
    .bindPopup(`<b>${data.destination.name}</b><br/>${data.destination.address}`)

  // 配送员标记
  driverMarker = L.marker([data.driver.lat, data.driver.lng], { icon: driverIcon })
    .addTo(mapInstance)
    .bindPopup(`<b>配送员</b><br/>${data.driver.phone}`)

  // 调整视图以显示整个路线
  mapInstance.fitBounds(routeLine.getBounds(), { padding: [50, 50] })

  // 配送中时模拟配送员移动动画
  if (data.status === 2) {
    startDriverAnimation(data)
  }
}

const findClosestRoutePoint = (route, lat, lng) => {
  let minDist = Infinity
  let idx = 0
  route.forEach((point, i) => {
    const d = Math.pow(point[0] - lat, 2) + Math.pow(point[1] - lng, 2)
    if (d < minDist) {
      minDist = d
      idx = i
    }
  })
  return idx
}

const startDriverAnimation = (data) => {
  const driverIdx = findClosestRoutePoint(data.route, data.driver.lat, data.driver.lng)
  let currentIdx = driverIdx
  let currentPos = [data.driver.lat, data.driver.lng]

  animTimer = setInterval(() => {
    if (!driverMarker || !mapInstance) return
    currentIdx++
    if (currentIdx >= data.route.length) {
      clearInterval(animTimer)
      animTimer = null
      return
    }
    const target = data.route[currentIdx]
    animateMarkerTo(driverMarker, currentPos, target, 2000)
    currentPos = target
  }, 5000)
}

const animateMarkerTo = (marker, from, to, duration) => {
  const start = Date.now()
  const animate = () => {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    const lat = from[0] + (to[0] - from[0]) * eased
    const lng = from[1] + (to[1] - from[1]) * eased
    marker.setLatLng([lat, lng])
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  requestAnimationFrame(animate)
}

const loadRoute = async () => {
  try {
    loading.value = true
    error.value = ''
    const { data } = await orderApi.getDeliveryRoute(route.params.id)
    routeData.value = data
    await nextTick()
    initMap(data)
  } catch (err) {
    error.value = err.message || '加载配送路线失败'
    // 如果是状态不支持，跳回订单详情
    if (err.message?.includes('不支持')) {
      showToast('该订单暂不支持查看配送路线')
      router.back()
    }
  } finally {
    loading.value = false
  }
}

const handleConfirm = async () => {
  try {
    await showDialog({
      title: '确认收货',
      message: '确定已收到商品吗？'
    })
    await orderApi.confirmReceipt(route.params.id)
    showToast('已确认收货')
    router.push('/orders')
  } catch (err) {
    if (err !== 'cancel') {
      showToast('操作失败')
    }
  }
}

onMounted(() => {
  loadRoute()
})

onUnmounted(() => {
  if (animTimer) {
    clearInterval(animTimer)
    animTimer = null
  }
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<style scoped>
.tracking-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  position: relative;
}

.tracking-nav {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255,255,255,0.95) !important;
  backdrop-filter: blur(10px);
}

.map-container {
  flex: 1;
  width: 100%;
  min-height: 0;
  z-index: 1;
}

.loading-state, .error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #666;
  padding-top: 60px;
}

.bottom-panel {
  background: #fff;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  gap: 12px;
}

.status-bg-2 { background: linear-gradient(135deg, #FF6B35, #FF8F60); color: #fff; }
.status-bg-3 { background: linear-gradient(135deg, #52c41a, #73d13d); color: #fff; }
.status-bg-4 { background: linear-gradient(135deg, #1890ff, #40a9ff); color: #fff; }

.status-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.status-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-text h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.eta-text {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.9;
}

.distance-text {
  margin: 2px 0 0;
  font-size: 12px;
  opacity: 0.75;
}

.status-header .van-button {
  flex-shrink: 0;
  background: rgba(255,255,255,0.25) !important;
  border-color: rgba(255,255,255,0.5) !important;
  color: #fff !important;
  font-size: 13px;
}

.driver-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.driver-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #FFF5F0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.driver-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.driver-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.driver-phone {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.driver-call {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FF6B35;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(255,107,53,0.3);
}

.route-info {
  padding: 16px 20px 20px;
}

.route-point {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: 32px;
}

.route-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.store-dot {
  background: #1890ff;
  border: 2px solid #e6f7ff;
}

.dest-dot {
  background: #52c41a;
  border: 2px solid #f6ffed;
}

.driver-dot {
  background: #FF6B35;
  border: 2px solid #fff5f0;
  width: 24px;
  height: 24px;
}

.route-line-connector {
  width: 2px;
  height: 20px;
  background: #e8e8e8;
  margin-left: 9px;
}

.route-detail {
  flex: 1;
}

.route-label {
  display: inline-block;
  font-size: 12px;
  color: #999;
  background: #f5f5f5;
  padding: 1px 8px;
  border-radius: 3px;
  margin-bottom: 2px;
}

.route-label.current {
  color: #FF6B35;
  background: #FFF5F0;
  font-weight: 600;
}

.route-addr {
  display: block;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}

/* Leaflet 自定义样式 */
:global(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

:global(@keyframes pulse) {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

:global(.driver-marker div) {
  animation: pulse 2s ease-in-out infinite;
}

:global(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  font-size: 13px;
}
</style>
