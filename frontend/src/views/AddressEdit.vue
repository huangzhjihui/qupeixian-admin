<template>
  <div class="address-edit">
    <van-nav-bar :title="isEdit ? '编辑地址' : '添加地址'" left-arrow @click-left="$router.back()" />

    <div class="address-form">
      <van-form @submit="handleSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.real_name"
            name="real_name"
            label="收货人"
            placeholder="请输入收货人姓名"
            :rules="[{ required: true, message: '请输入收货人姓名' }]"
          />
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]"
          />
          <div class="location-row">
            <van-field
              v-model="form.province"
              name="province"
              label="省"
              placeholder="请选择省份"
              readonly
              right-icon="arrow-down"
              @click="handleProvinceClick"
              class="location-field"
            />
            <van-field
              v-model="form.city"
              name="city"
              label="市"
              placeholder="请选择城市"
              readonly
              right-icon="arrow-down"
              @click="handleCityClick"
              class="location-field"
            />
            <van-field
              v-model="form.district"
              name="district"
              label="区"
              placeholder="请选择区县"
              readonly
              right-icon="arrow-down"
              @click="handleDistrictClick"
              class="location-field"
            />
          </div>
          <div class="location-btn-row">
            <van-button size="small" type="primary" plain @click="handleGetLocation">获取当前位置</van-button>
          </div>
          <van-field
            v-model="form.detail_address"
            name="detail_address"
            label="详细地址"
            placeholder="请输入详细地址"
            :rules="[{ required: true, message: '请输入详细地址' }]"
          />
        </van-cell-group>

        <div class="default-address-row">
          <span class="default-label">设为默认地址</span>
          <van-switch v-model="form.is_default" active-color="#FF6B35" />
        </div>

        <div class="submit-section">
          <van-button round block type="primary" native-type="submit" class="btn-submit">保存</van-button>
        </div>
      </van-form>
    </div>

    <van-action-sheet
      v-model:show="showProvincePicker"
      :actions="provinceOptions"
      cancel-text="取消"
      @select="onProvinceSelect"
    />

    <van-action-sheet
      v-model:show="showCityPicker"
      :actions="cityOptions"
      cancel-text="取消"
      @select="onCitySelect"
    />

    <van-action-sheet
      v-model:show="showDistrictPicker"
      :actions="districtOptions"
      cancel-text="取消"
      @select="onDistrictSelect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast, showDialog } from 'vant'
import { userApi } from '@/api'
import { getProvinces, getCities, getDistricts } from '@/data/regions'

const route = useRoute()
const router = useRouter()
const from = computed(() => route.query.from || '')

const isEdit = ref(false)
const form = ref({
  real_name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: false
})

const provinceCode = ref('')
const cityCode = ref('')

const showProvincePicker = ref(false)
const showCityPicker = ref(false)
const showDistrictPicker = ref(false)

const provinceOptions = computed(() => {
  return getProvinces().map(p => ({ name: p.name, code: p.code }))
})

const cityOptions = computed(() => {
  if (!provinceCode.value) return []
  return getCities(provinceCode.value).map(c => ({ name: c.name, code: c.code }))
})

const districtOptions = computed(() => {
  if (!provinceCode.value || !cityCode.value) return []
  return getDistricts(provinceCode.value, cityCode.value).map(d => ({ name: d }))
})

const handleProvinceClick = () => {
  if (provinceOptions.value.length > 0) {
    showProvincePicker.value = true
  } else {
    showToast('暂无省份数据')
  }
}

const handleCityClick = () => {
  if (!form.value.province) {
    showToast('请先选择省份')
    return
  }
  if (cityOptions.value.length > 0) {
    showCityPicker.value = true
  } else {
    showToast('暂无城市数据')
  }
}

const handleDistrictClick = () => {
  if (!form.value.city) {
    showToast('请先选择城市')
    return
  }
  if (districtOptions.value.length > 0) {
    showDistrictPicker.value = true
  } else {
    showToast('暂无区县数据')
  }
}

const onProvinceSelect = (option) => {
  form.value.province = option.name
  provinceCode.value = option.code
  
  form.value.city = ''
  form.value.district = ''
  cityCode.value = ''
  
  showProvincePicker.value = false
}

const onCitySelect = (option) => {
  form.value.city = option.name
  cityCode.value = option.code
  
  form.value.district = ''
  
  showCityPicker.value = false
}

const onDistrictSelect = (option) => {
  form.value.district = option.name
  showDistrictPicker.value = false
}

const maxRetries = 2
let retryCount = 0

const handleGetLocation = () => {
  if (!navigator.geolocation) {
    showToast('您的浏览器不支持获取位置')
    return
  }

  retryCount = 0
  getLocationWithRetry()
}

const getLocationWithRetry = () => {
  const loading = showLoadingToast({
    message: retryCount === 0 ? '正在获取位置...' : `重试获取位置(${retryCount}/${maxRetries})...`,
    forbidClick: true
  })

  navigator.geolocation.getCurrentPosition(
    (position) => {
      closeToast()
      const { latitude, longitude } = position.coords
      getAddressFromCoords(latitude, longitude)
    },
    (error) => {
      closeToast()
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          showDialog({
            title: '位置权限说明',
            message: '获取位置需要您授权位置权限。\n\n请在浏览器设置中允许获取位置：\n1. 点击浏览器地址栏左侧的"i"图标\n2. 找到"权限"选项\n3. 将"位置"设置为"允许"\n\n设置完成后点击"获取当前位置"按钮',
            confirmButtonText: '我知道了'
          })
          break
        case error.POSITION_UNAVAILABLE:
          showToast({
            message: '位置信息不可用，请检查手机 GPS 是否开启',
            duration: 3000
          })
          break
        case error.TIMEOUT:
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(() => {
              getLocationWithRetry()
            }, 1000)
          } else {
            showToast({
              message: '获取位置超时，请手动选择地址',
              duration: 3000
            })
          }
          break
        default:
          showToast({
            message: '获取位置失败，请手动选择地址',
            duration: 3000
          })
      }
    },
    {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 300000
    }
  )
}

const getAddressFromCoords = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77&output=json`
    )
    const data = await response.json()
    
    if (data.status === 0) {
      const result = data.result
      const addressComponent = result.address_component
      
      form.value.province = addressComponent.province || ''
      form.value.city = addressComponent.city || addressComponent.district || ''
      form.value.district = addressComponent.district || ''
      
      const provinces = getProvinces()
      const province = provinces.find(p => p.name === form.value.province)
      if (province) {
        provinceCode.value = province.code
        
        const cities = getCities(province.code)
        const city = cities.find(c => c.name === form.value.city)
        if (city) {
          cityCode.value = city.code
        }
      }
      
      if (result.formatted_address) {
        const fullAddress = `${form.value.province} ${form.value.city} ${form.value.district}`.trim()
        const detail = result.formatted_address.replace(fullAddress, '').trim()
        if (detail && !detail.includes(form.value.province) && !detail.includes(form.value.city)) {
          form.value.detail_address = detail
        }
      }
      
      showToast('位置获取成功')
    } else {
      showToast('解析位置失败')
    }
  } catch (error) {
    console.error('获取地址失败:', error)
    showToast('获取地址失败')
  }
}

const handleSubmit = async () => {
  if (!form.value.province || !form.value.city) {
    showToast('请选择完整的省市区')
    return
  }

  try {
    const data = {
      real_name: form.value.real_name,
      phone: form.value.phone,
      province: form.value.province,
      city: form.value.city,
      district: form.value.district || '',
      detail: form.value.detail_address,
      is_default: form.value.is_default ? 1 : 0
    }

    if (isEdit.value) {
      await userApi.updateAddress(route.params.id, data)
      showToast('修改成功')
    } else {
      await userApi.createAddress(data)
      showToast('添加成功')
    }

    setTimeout(() => {
      if (from.value === 'checkout') {
        window.location.href = '/checkout'
      } else {
        window.location.href = '/addresses'
      }
    }, 1500)
  } catch (error) {
    console.error('保存地址失败:', error)
  }
}

const loadAddress = async () => {
  if (!route.params.id) return

  try {
    isEdit.value = true
    const { data } = await userApi.getAddress(route.params.id)
    form.value = {
      ...data,
      is_default: data.is_default === 1
    }
    
    if (form.value.province) {
      const provinces = getProvinces()
      const province = provinces.find(p => p.name === form.value.province)
      if (province) {
        provinceCode.value = province.code
        
        if (form.value.city) {
          const cities = getCities(province.code)
          const city = cities.find(c => c.name === form.value.city)
          if (city) {
            cityCode.value = city.code
          }
        }
      }
    }
  } catch (error) {
    console.error('加载地址失败:', error)
  }
}

onMounted(() => {
  loadAddress()
})
</script>

<style scoped>
.address-edit {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.address-form {
  padding: 16px;
}

.location-row {
  display: flex;
  gap: 8px;
}

.location-field {
  flex: 1;
}

.location-btn-row {
  padding: 12px 0;
  text-align: center;
}

.default-address-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
  margin-top: 12px;
  border-radius: 8px;
}

.default-label {
  font-size: 14px;
  color: #333;
}

.submit-section {
  padding: 24px 16px;
}

.btn-submit {
  height: 48px;
  font-size: 16px;
}
</style>
