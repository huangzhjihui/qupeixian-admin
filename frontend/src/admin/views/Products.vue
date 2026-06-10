<template>
  <div class="admin-page">
    <div class="content-header">
      <h3 class="content-title">商品管理</h3>
      <div class="header-actions">
        <van-button type="success" size="small" @click="showBatchImport = true">
          <van-icon name="orders-o" /> 批量导入
        </van-button>
        <van-button type="primary" size="small" @click="handleAddProduct">
          <van-icon name="plus" /> 新增商品
        </van-button>
      </div>
    </div>

    <div class="content-body">
      <div class="search-section">
        <van-search 
          v-model="keyword" 
          placeholder="搜索商品名称、编号" 
          shape="round"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <van-dropdown-menu>
          <van-dropdown-item v-model="categoryId" :options="categoryOptions" @change="handleSearch" />
          <van-dropdown-item v-model="statusFilter" :options="statusOptions" @change="handleSearch" />
        </van-dropdown-menu>
      </div>

      <div class="product-table">
        <div class="table-header">
          <span class="col-image">图片</span>
          <span class="col-name">商品名称</span>
          <span class="col-price">价格</span>
          <span class="col-stock">库存</span>
          <span class="col-sales">销量</span>
          <span class="col-status">状态</span>
          <span class="col-actions">操作</span>
        </div>
        
        <div v-for="product in productList" :key="product.id" class="table-row">
          <span class="col-image">
            <img :src="product.main_image" :alt="product.name" class="product-img" />
          </span>
          <span class="col-name">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-subtitle">{{ product.subtitle }}</div>
          </span>
          <span class="col-price">
            <div class="price-current">¥{{ product.price }}</div>
            <div class="price-original">¥{{ product.original_price }}</div>
          </span>
          <span class="col-stock">
            <van-stepper 
              v-model="product.stock" 
              min="0" 
              max="9999"
              theme="round"
              button-size="22"
              @change="handleStockChange(product)"
            />
          </span>
          <span class="col-sales">{{ product.sales || 0 }}</span>
          <span class="col-status">
            <van-switch 
              v-model="product.is_on_sale" 
              size="20"
              active-color="#52c41a"
              inactive-color="#ccc"
              @change="handleStatusChange(product)"
            />
          </span>
          <span class="col-actions">
            <van-button size="mini" type="primary" @click="handleEdit(product)">编辑</van-button>
            <van-button size="mini" type="danger" @click="handleDelete(product)">删除</van-button>
          </span>
        </div>

        <div v-if="productList.length === 0" class="empty-state">
          <van-icon name="goods-o" size="48" color="#ccc" />
          <p>暂无商品数据</p>
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
      :style="{ height: '90%' }"
      round
      closeable
    >
      <div class="form-container">
        <div class="form-header">
          <h3>{{ isEdit ? '编辑商品' : '新增商品' }}</h3>
        </div>
        
        <van-form @submit="handleSubmit" class="product-form">
          <van-cell-group inset>
            <van-field
              v-model="form.name"
              label="商品名称"
              placeholder="请输入商品名称"
              required
              :rules="[{ required: true, message: '请输入商品名称' }]"
            />
            <van-field
              v-model="form.subtitle"
              label="商品副标题"
              placeholder="请输入商品副标题"
            />
            <van-field name="main_image" label="商品主图">
              <template #input>
                <ImageUpload v-model="form.main_image" alt="商品主图" />
              </template>
            </van-field>
            <van-field name="images" label="商品轮播图">
              <template #input>
                <MultiImageUpload v-model="form.images" :max-count="9" />
              </template>
            </van-field>
            <van-field
              v-model="form.category_id"
              is-link
              readonly
              label="商品分类"
              placeholder="请选择分类"
              required
              @click="showCategoryPicker = true"
              :rules="[{ required: true, message: '请选择分类' }]"
            />
            <van-field
              v-model="form.price"
              type="number"
              label="售价"
              placeholder="请输入售价"
              required
              :rules="[{ required: true, message: '请输入售价' }]"
            />
            <van-field
              v-model="form.original_price"
              type="number"
              label="原价"
              placeholder="请输入原价"
            />
            <van-field
              v-model="form.member_price"
              type="number"
              label="会员价"
              placeholder="请输入会员价"
            />
            <van-field
              v-model="form.stock"
              type="digit"
              label="库存"
              placeholder="请输入库存数量"
              required
              :rules="[{ required: true, message: '请输入库存' }]"
            />
            <van-field
              v-model="form.serving_size"
              label="份量"
              placeholder="如：2人份"
            />
            <van-field
              v-model="form.cooking_time"
              label="烹饪时长"
              placeholder="如：15分钟"
            />
            <van-field
              v-model="form.origin"
              label="产地"
              placeholder="请输入产地"
            />
            <van-field
              v-model="form.shelf_life"
              label="保质期"
              placeholder="如：24小时"
            />
            <van-field
              v-model="form.storage_conditions"
              label="储存条件"
              placeholder="如：0-4℃冷藏"
            />
            <van-field
              v-model="form.ingredient_list"
              label="配料表"
              placeholder="请输入配料表"
              type="textarea"
              rows="3"
              autosize
            />
            <van-field name="switch" label="上架状态">
              <template #input>
                <van-switch v-model="form.is_on_sale" size="20" />
              </template>
            </van-field>
            <van-field name="switch" label="新品推荐">
              <template #input>
                <van-switch v-model="form.is_new" size="20" />
              </template>
            </van-field>
            <van-field name="switch" label="热销商品">
              <template #input>
                <van-switch v-model="form.is_hot" size="20" />
              </template>
            </van-field>
          </van-cell-group>

          <div class="form-submit">
            <van-button type="primary" native-type="submit" block>保存商品</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showCategoryPicker" position="bottom" round>
      <van-picker
        :columns="categoryPickerOptions"
        :default-index="defaultCategoryIndex"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
        @click="onPickerClick"
      />
    </van-popup>

    <!-- 批量导入弹窗 -->
    <van-popup 
      v-model:show="showBatchImport" 
      position="bottom" 
      :style="{ height: '80%' }"
      round
      closeable
    >
      <div class="batch-import-container">
        <div class="form-header">
          <h3>批量导入商品</h3>
        </div>

        <div class="batch-import-body">
          <!-- 步骤1: 下载模板 -->
          <div class="import-step">
            <div class="step-title">
              <span class="step-number">1</span>
              <span class="step-text">下载Excel模板</span>
            </div>
            <div class="step-content">
              <p class="step-desc">模板包含三个工作表：</p>
              <div class="template-features">
                <div class="feature-item">
                  <van-icon name="notes-o" color="#1989fa" />
                  <span><b>商品导入</b> — 填写商品信息，含示例数据</span>
                </div>
                <div class="feature-item">
                  <van-icon name="description-o" color="#52c41a" />
                  <span><b>填写说明</b> — 每个字段的详细解释</span>
                </div>
                <div class="feature-item">
                  <van-icon name="apps-o" color="#faad14" />
                  <span><b>分类列表</b> — 系统当前可用分类</span>
                </div>
              </div>
              <van-button 
                type="primary" 
                plain 
                size="small" 
                :loading="downloading"
                @click="handleDownloadTemplate"
              >
                <van-icon name="down" /> 下载导入模板
              </van-button>
            </div>
          </div>

          <!-- 步骤2: 上传文件 -->
          <div class="import-step">
            <div class="step-title">
              <span class="step-number">2</span>
              <span class="step-text">上传填好的Excel文件</span>
            </div>
            <div 
              class="upload-zone" 
              :class="{ 'upload-zone-active': importFile, 'upload-zone-dragover': isDragover }"
              @dragover.prevent="isDragover = true"
              @dragleave.prevent="isDragover = false"
              @drop.prevent="handleFileDrop"
              @click="triggerFileInput"
            >
              <template v-if="!importFile">
                <van-icon name="upload" size="36" color="#999" />
                <p>点击选择或拖拽Excel文件到此处</p>
                <p class="upload-hint">支持 .xlsx、.xls、.csv 格式，最大 10MB</p>
              </template>
              <template v-else>
                <van-icon name="description" size="36" color="#52c41a" />
                <p class="file-name">{{ importFile.name }}</p>
                <p class="upload-hint">{{ (importFile.size / 1024).toFixed(1) }} KB</p>
                <van-button size="mini" type="danger" plain @click.stop="importFile = null">重新选择</van-button>
              </template>
              <input 
                ref="fileInputRef" 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                style="display: none" 
                @change="handleFileSelect"
              />
            </div>
          </div>

          <!-- 步骤3: 开始导入 -->
          <div class="import-step">
            <van-button 
              type="primary" 
              block 
              :disabled="!importFile" 
              :loading="importing"
              loading-text="导入中..."
              @click="handleBatchImport"
            >
              开始导入
            </van-button>
          </div>

          <!-- 导入结果 -->
          <div v-if="importResult" class="import-result">
            <div class="result-header">
              <van-icon 
                :name="importResult.failed === 0 ? 'passed' : 'warning'" 
                :color="importResult.failed === 0 ? '#52c41a' : '#faad14'" 
                size="20" 
              />
              <span>导入完成</span>
            </div>
            <div class="result-stats">
              <span class="stat-item">总计 <strong>{{ importResult.total }}</strong> 条</span>
              <span class="stat-item stat-success">✓ 成功 <strong>{{ importResult.success }}</strong> 条</span>
              <span class="stat-item stat-fail" v-if="importResult.failed > 0">✗ 失败 <strong>{{ importResult.failed }}</strong> 条</span>
            </div>
            <div v-if="importResult.errors && importResult.errors.length > 0" class="result-errors">
              <div class="error-title">失败详情：</div>
              <div class="error-list">
                <div v-for="(err, idx) in importResult.errors.slice(0, 20)" :key="idx" class="error-item">
                  <span class="error-row">第{{ err.row }}行</span>
                  <span class="error-name">「{{ err.name || '未命名' }}」</span>
                  <span class="error-msg">{{ err.message }}</span>
                </div>
                <div v-if="importResult.errors.length > 20" class="error-more">
                  ...还有 {{ importResult.errors.length - 20 }} 条失败记录
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { adminApi } from '@/api'
import ImageUpload from '@/admin/components/ImageUpload.vue'
import MultiImageUpload from '@/admin/components/MultiImageUpload.vue'

const keyword = ref('')
const categoryId = ref(0)
const statusFilter = ref(-1)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const productList = ref([])
const categories = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const showCategoryPicker = ref(false)
const lastClickTime = ref(0)
const lastClickedIndex = ref(-1)

// 批量导入相关
const showBatchImport = ref(false)
const downloading = ref(false)
const importing = ref(false)
const importFile = ref(null)
const importResult = ref(null)
const isDragover = ref(false)
const fileInputRef = ref(null)

const form = ref({
  name: '',
  subtitle: '',
  main_image: '',
  images: [],
  category_id: '',
  price: '',
  original_price: '',
  member_price: '',
  stock: 100,
  serving_size: '',
  cooking_time: '',
  origin: '',
  shelf_life: '',
  storage_conditions: '',
  ingredient_list: '',
  is_on_sale: true,
  is_new: false,
  is_hot: false
})

const categoryOptions = computed(() => {
  return [
    { text: '全部分类', value: 0 },
    ...categories.value.map(cat => ({ text: cat.name, value: cat.id }))
  ]
})

const statusOptions = [
  { text: '全部状态', value: -1 },
  { text: '已上架', value: 1 },
  { text: '已下架', value: 0 }
]

const categoryPickerOptions = computed(() => {
  return categories.value.map(cat => ({ text: cat.name, value: cat.id }))
})

const defaultCategoryIndex = computed(() => {
  if (!form.value.category_id) return 0
  const index = categories.value.findIndex(cat => cat.id == form.value.category_id)
  return index >= 0 ? index : 0
})

const onPickerClick = () => {
  const now = Date.now()
  const clickedIndex = categories.value.findIndex(cat => cat.id == form.value.category_id)
  
  if (clickedIndex >= 0 && clickedIndex === lastClickedIndex.value && now - lastClickTime.value < 350) {
    showCategoryPicker.value = false
    lastClickedIndex.value = -1
    lastClickTime.value = 0
    return
  }
  
  lastClickedIndex.value = clickedIndex
  lastClickTime.value = now
}

const loadProducts = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value,
      category_id: categoryId.value && categoryId.value > 0 ? categoryId.value : undefined,
      is_on_sale: statusFilter.value >= 0 ? statusFilter.value : undefined
    }
    const { data: products, pagination } = await adminApi.getProducts(params)
    productList.value = (products || []).map(item => ({
      ...item,
      is_on_sale: item.is_on_sale === 1
    }))
    total.value = pagination?.total || 0
  } catch (error) {
    console.error('加载商品失败:', error)
    productList.value = [
      { id: 1, name: '宫保鸡丁套餐', subtitle: '经典川菜', main_image: 'https://picsum.photos/100/100?random=1', price: 39.9, original_price: 49.9, stock: 100, sales: 256, is_on_sale: true },
      { id: 2, name: '番茄炒蛋套餐', subtitle: '家常美味', main_image: 'https://picsum.photos/100/100?random=2', price: 25.9, original_price: 32.9, stock: 200, sales: 198, is_on_sale: true },
      { id: 3, name: '清蒸鲈鱼套餐', subtitle: '清淡鲜美', main_image: 'https://picsum.photos/100/100?random=3', price: 59.9, original_price: 79.9, stock: 50, sales: 145, is_on_sale: true },
      { id: 4, name: '减脂沙拉套餐', subtitle: '低卡健康', main_image: 'https://picsum.photos/100/100?random=4', price: 29.9, original_price: 39.9, stock: 150, sales: 123, is_on_sale: false },
      { id: 5, name: '番茄牛腩套餐', subtitle: '软糯入味', main_image: 'https://picsum.photos/100/100?random=5', price: 69.9, original_price: 89.9, stock: 80, sales: 98, is_on_sale: true }
    ]
    total.value = 5
  }
}

const loadCategories = async () => {
  try {
    const { data } = await adminApi.getCategories()
    categories.value = data || []
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = [
      { id: 1, name: '单人餐' },
      { id: 2, name: '双人餐' },
      { id: 3, name: '家庭餐' },
      { id: 4, name: '轻食沙拉' },
      { id: 5, name: '儿童套餐' }
    ]
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

const handlePageChange = () => {
  loadProducts()
}

const handleStockChange = async (product) => {
  try {
    await adminApi.updateProduct(product.id, { stock: product.stock })
    showToast('库存已更新')
  } catch (error) {
    console.error('更新库存失败:', error)
    showToast('更新失败')
  }
}

const handleStatusChange = async (product) => {
  try {
    const status = product.is_on_sale ? 1 : 0
    await adminApi.updateProductStatus(product.id, { is_on_sale: status })
    showToast(product.is_on_sale ? '已上架' : '已下架')
  } catch (error) {
    console.error('更新状态失败:', error)
    product.is_on_sale = !product.is_on_sale
    showToast('操作失败')
  }
}

const handleAddProduct = () => {
  isEdit.value = false
  form.value = {
    name: '',
    subtitle: '',
    main_image: '',
    images: [],
    category_id: '',
    price: '',
    original_price: '',
    member_price: '',
    stock: 100,
    serving_size: '',
    cooking_time: '',
    origin: '',
    shelf_life: '',
    storage_conditions: '',
    ingredient_list: '',
    is_on_sale: true,
    is_new: false,
    is_hot: false
  }
  showForm.value = true
}

const handleEdit = (product) => {
  isEdit.value = true
  let productImages = []
  if (product.images) {
    if (Array.isArray(product.images)) {
      productImages = product.images
    } else if (typeof product.images === 'string') {
      try {
        productImages = JSON.parse(product.images) || []
      } catch (e) {
        productImages = []
      }
    }
  }
  form.value = {
    ...product,
    images: productImages,
    category_id: product.category_id || '',
    is_on_sale: product.is_on_sale === 1 || product.is_on_sale === true,
    is_new: product.is_new === 1 || product.is_new === true,
    is_hot: product.is_hot === 1 || product.is_hot === true
  }
  showForm.value = true
}

const handleDelete = async (product) => {
  try {
    await showConfirmDialog({
      title: '删除商品',
      message: `确定要删除"${product.name}"吗？`
    })
    await adminApi.deleteProduct(product.id)
    productList.value = productList.value.filter(p => p.id !== product.id)
    showToast('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      showToast('删除失败')
    }
  }
}

const onCategoryConfirm = ({ selectedOptions }) => {
  form.value.category_id = selectedOptions[0].value
  showCategoryPicker.value = false
}

const handleSubmit = async () => {
  try {
    if (!form.value.name.trim()) {
      showToast('请输入商品名称')
      return
    }
    if (!form.value.main_image.trim()) {
      showToast('请输入主图URL')
      return
    }
    if (!form.value.category_id) {
      showToast('请选择商品分类')
      return
    }
    if (!form.value.price) {
      showToast('请输入售价')
      return
    }
    
    const submitData = {
      name: form.value.name.trim(),
      subtitle: form.value.subtitle ? form.value.subtitle.trim() : '',
      description: '',
      price: Number(form.value.price),
      original_price: form.value.original_price ? Number(form.value.original_price) : Number(form.value.price),
      category_id: Number(form.value.category_id),
      main_image: form.value.main_image.trim(),
      images: form.value.images && form.value.images.length > 0 ? form.value.images : null,
      stock: Number(form.value.stock) || 0,
      serving_size: form.value.serving_size ? form.value.serving_size.trim() : '',
      ingredient_list: form.value.ingredient_list ? form.value.ingredient_list.trim() : '',
      is_new: form.value.is_new ? 1 : 0,
      is_hot: form.value.is_hot ? 1 : 0,
      is_recommend: 0,
      is_on_sale: form.value.is_on_sale ? 1 : 0,
      sort_order: 0,
      origin: form.value.origin ? form.value.origin.trim() : '',
      shelf_life: form.value.shelf_life ? form.value.shelf_life.trim() : '',
      storage_conditions: form.value.storage_conditions ? form.value.storage_conditions.trim() : '',
      cooking_time: form.value.cooking_time ? form.value.cooking_time.trim() : ''
    }
    
    if (isEdit.value && form.value.id) {
      await adminApi.updateProduct(form.value.id, submitData)
      showToast('修改成功')
    } else {
      await adminApi.createProduct(submitData)
      showToast('添加成功')
    }
    showForm.value = false
    loadProducts()
  } catch (error) {
    let errorMsg = '保存失败'
    if (error.response) {
      // 有响应数据
      if (error.response.data && error.response.data.message) {
        errorMsg = error.response.data.message
      } else if (error.response.status === 401) {
        errorMsg = '登录已过期，请重新登录'
      } else if (error.response.status === 403) {
        errorMsg = '权限不足'
      } else if (error.response.status === 404) {
        errorMsg = '接口不存在'
      } else if (error.response.status === 500) {
        errorMsg = error.response.data?.message || '服务器内部错误，请查看后端日志'
      }
    } else if (error.message) {
      // 网络错误或其他错误
      errorMsg = error.message
    }
    
    showToast(errorMsg)
  }
}

onMounted(() => {
  loadProducts()
  loadCategories()
})

// 批量导入方法
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    importFile.value = file
    importResult.value = null
  }
  // 重置input以便再次选择同名文件
  e.target.value = ''
}

const handleFileDrop = (e) => {
  isDragover.value = false
  const file = e.dataTransfer.files[0]
  if (file) {
    const ext = file.name.split('.').pop().toLowerCase()
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      importFile.value = file
      importResult.value = null
    } else {
      showToast('只支持 Excel (.xlsx, .xls) 或 CSV 格式')
    }
  }
}

const handleDownloadTemplate = async () => {
  downloading.value = true
  try {
    const response = await adminApi.downloadProductTemplate()
    const blob = response.data
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '商品批量导入模板.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    showToast('模板下载成功')
  } catch (err) {
    showToast('下载模板失败')
  } finally {
    downloading.value = false
  }
}

const handleBatchImport = async () => {
  if (!importFile.value) return
  importing.value = true
  importResult.value = null
  try {
    const { data } = await adminApi.batchImportProducts(importFile.value)
    importResult.value = data
    if (data.success > 0) {
      showToast(`成功导入 ${data.success} 个商品`)
      loadProducts()
    }
    if (data.failed > 0 && data.success === 0) {
      showToast(`导入失败 ${data.failed} 条，请检查数据`)
    }
  } catch (err) {
    showToast(err.apiMessage || '批量导入失败')
  } finally {
    importing.value = false
  }
}
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

.header-actions {
  display: flex;
  gap: 8px;
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
  width: 300px;
}

.product-table {
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

.col-image {
  width: 80px;
}

.col-name {
  flex: 1;
  min-width: 150px;
}

.col-price {
  width: 100px;
}

.col-stock {
  width: 120px;
}

.col-sales {
  width: 60px;
  text-align: center;
}

.col-status {
  width: 60px;
  text-align: center;
}

.col-actions {
  width: 120px;
  display: flex;
  gap: 8px;
}

.product-img {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.product-subtitle {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.price-current {
  font-size: 14px;
  font-weight: 600;
  color: #FF6B35;
}

.price-original {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
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

.product-form {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-submit {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .search-section {
    flex-direction: column;
  }
  
  .search-section .van-dropdown-menu {
    width: 100%;
  }
  
  .table-header,
  .table-row {
    flex-wrap: wrap;
  }
  
  .col-image,
  .col-name {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  
  .col-price,
  .col-stock,
  .col-sales,
  .col-status,
  .col-actions {
    width: 50%;
    padding: 8px 0;
  }
}

/* 批量导入样式 */
.batch-import-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.batch-import-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.import-step {
  margin-bottom: 20px;
}

.step-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #1989fa;
  color: white;
  font-size: 12px;
  margin-right: 8px;
}

.step-desc {
  font-size: 12px;
  color: #999;
  margin: 0 0 8px 0;
}

.step-content {
  margin-left: 28px;
}

.template-features {
  margin-bottom: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
  padding: 6px 0;
}

.feature-item b {
  color: #333;
}

.upload-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-zone:hover {
  border-color: #1989fa;
  background: #f0f7ff;
}

.upload-zone-active {
  border-color: #52c41a;
  background: #f6ffed;
}

.upload-zone-dragover {
  border-color: #1989fa;
  background: #e6f4ff;
}

.upload-zone p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #666;
}

.upload-hint {
  font-size: 12px;
  color: #999;
}

.file-name {
  font-weight: 600;
  color: #333;
}

.import-result {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.result-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  font-size: 13px;
  color: #666;
}

.stat-item strong {
  font-size: 16px;
  margin: 0 2px;
}

.stat-success strong {
  color: #52c41a;
}

.stat-fail strong {
  color: #ff4d4f;
}

.result-errors {
  background: white;
  border-radius: 6px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.error-title {
  font-size: 13px;
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.error-item {
  font-size: 12px;
  color: #666;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.error-item:last-child {
  border-bottom: none;
}

.error-row {
  color: #ff4d4f;
  font-weight: 500;
  white-space: nowrap;
}

.error-name {
  color: #333;
  font-weight: 500;
}

.error-msg {
  color: #999;
}

.error-more {
  font-size: 12px;
  color: #999;
  text-align: center;
  padding: 8px 0;
}
</style>