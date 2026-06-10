<template>
  <div class="admin-page">
    <div class="content-header">
      <h3 class="content-title">食谱管理</h3>
      <van-button type="primary" size="small" @click="handleAddRecipe">
        <van-icon name="plus" /> 新增食谱
      </van-button>
    </div>

    <div class="content-body">
      <div class="search-section">
        <van-search 
          v-model="keyword" 
          placeholder="搜索食谱名称" 
          shape="round"
          @search="handleSearch"
          @clear="handleSearch"
        />
      </div>

      <div class="recipe-list">
        <div v-for="recipe in recipeList" :key="recipe.id" class="recipe-card">
          <img :src="recipe.cover_image" class="recipe-img" />
          <div class="recipe-info">
            <h4 class="recipe-title">{{ recipe.title }}</h4>
            <p class="recipe-desc">{{ recipe.description }}</p>
            <div class="recipe-meta">
              <span class="recipe-category">{{ recipe.category }}</span>
              <span class="recipe-time">
                <van-icon name="clock-o" />
                {{ recipe.cooking_time }}
              </span>
              <span class="recipe-difficulty">{{ recipe.difficulty }}</span>
            </div>
            <div class="recipe-products">
              <span class="label">关联商品:</span>
              <van-tag v-for="product in recipe.related_products" :key="product.id" type="primary" size="small">
                {{ product.name }}
              </van-tag>
            </div>
            <div class="recipe-actions">
              <van-button size="mini" type="primary" @click="handleEdit(recipe)">编辑</van-button>
              <van-button size="mini" type="danger" @click="handleDelete(recipe)">删除</van-button>
            </div>
          </div>
        </div>

        <div v-if="recipeList.length === 0" class="empty-state">
          <van-icon name="notes-o" size="48" color="#ccc" />
          <p>暂无食谱数据</p>
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
          <h3>{{ isEdit ? '编辑食谱' : '新增食谱' }}</h3>
        </div>
        
        <van-form @submit="handleSubmit" class="recipe-form">
          <van-cell-group inset>
            <van-field
              v-model="form.title"
              label="食谱名称"
              placeholder="请输入食谱名称"
              required
              :rules="[{ required: true, message: '请输入食谱名称' }]"
            />
            <van-field
              v-model="form.description"
              label="简介"
              placeholder="请输入食谱简介"
              type="textarea"
              rows="2"
              autosize
            />
            <van-field name="cover_image" label="封面图">
              <template #input>
                <ImageUpload v-model="form.main_image" alt="食谱封面图" />
              </template>
            </van-field>
            <van-field
              v-model="form.category"
              is-link
              readonly
              label="分类"
              placeholder="请选择分类"
              @click="showCategoryPicker = true"
            />
            <van-field
              v-model="form.cooking_time"
              label="烹饪时长"
              placeholder="如：30分钟"
            />
            <van-field
              v-model="form.difficulty"
              is-link
              readonly
              label="难度"
              placeholder="请选择难度"
              @click="showDifficultyPicker = true"
            />
            <van-field
              v-model="form.servings"
              label="份量"
              placeholder="如：2人份"
            />
            <van-field
              v-model="form.ingredients"
              label="食材"
              placeholder="请输入食材列表"
              type="textarea"
              rows="3"
              autosize
            />
            <van-field
              v-model="form.steps"
              label="步骤"
              placeholder="请输入烹饪步骤"
              type="textarea"
              rows="5"
              autosize
            />
            <van-field
              v-model="form.related_products_text"
              is-link
              readonly
              label="关联商品"
              placeholder="点击选择关联商品"
              @click="showProductPicker = true"
            />
            <van-field name="switch" label="发布状态">
              <template #input>
                <van-switch v-model="form.is_published" size="20" />
              </template>
            </van-field>
          </van-cell-group>

          <div class="form-submit">
            <van-button type="primary" native-type="submit" block>保存食谱</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <van-popup v-model:show="showCategoryPicker" position="bottom" round>
      <van-picker
        :columns="categoryOptions"
        @confirm="onCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDifficultyPicker" position="bottom" round>
      <van-picker
        :columns="difficultyOptions"
        @confirm="onDifficultyConfirm"
        @cancel="showDifficultyPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showProductPicker" position="bottom" round>
      <div class="product-picker-container">
        <div class="picker-header">
          <h4>选择关联商品</h4>
          <van-button type="primary" size="small" @click="confirmProducts">确定</van-button>
        </div>
        <div class="picker-body">
          <van-checkbox-group v-model="selectedProducts">
            <van-cell-group>
              <van-cell
                v-for="product in availableProducts"
                :key="product.id"
                clickable
                @click="toggleProduct(product.id)"
              >
                <template #title>
                  <div class="product-option">
                    <img :src="product.main_image" class="option-img" />
                    <span>{{ product.name }}</span>
                  </div>
                </template>
                <template #right-icon>
                  <van-checkbox :name="product.id" ref="checkboxes" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-checkbox-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { adminApi } from '@/api'
import ImageUpload from '@/admin/components/ImageUpload.vue'

const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const recipeList = ref([])
const showForm = ref(false)
const isEdit = ref(false)
const showCategoryPicker = ref(false)
const showDifficultyPicker = ref(false)
const showProductPicker = ref(false)
const selectedProducts = ref([])
const availableProducts = ref([])

const form = ref({
  title: '',
  description: '',
  main_image: '',
  category: '',
  cooking_time: '',
  difficulty: '',
  servings: '',
  ingredients: '',
  steps: '',
  related_products: [],
  related_products_text: '',
  is_published: true
})

const categoryOptions = [
  { text: '家常菜', value: '家常菜' },
  { text: '快手菜', value: '快手菜' },
  { text: '素食', value: '素食' },
  { text: '海鲜', value: '海鲜' },
  { text: '汤品', value: '汤品' },
  { text: '甜品', value: '甜品' },
  { text: '儿童餐', value: '儿童餐' },
  { text: '减脂餐', value: '减脂餐' }
]

const difficultyOptions = [
  { text: '简单', value: '简单' },
  { text: '中等', value: '中等' },
  { text: '困难', value: '困难' }
]

const loadRecipes = async () => {
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    }
    const { data } = await adminApi.getRecipes(params)
    recipeList.value = data.data || []
    total.value = data.total || 0
  } catch (error) {
    console.error('加载食谱失败:', error)
    recipeList.value = [
      { id: 1, title: '宫保鸡丁', description: '经典川菜，麻辣鲜香', main_image: 'https://picsum.photos/200/150?random=1', category: '家常菜', cooking_time: '30分钟', difficulty: '中等', related_products: [{ id: 1, name: '宫保鸡丁套餐' }] },
      { id: 2, title: '番茄炒蛋', description: '家常美味，简单易做', main_image: 'https://picsum.photos/200/150?random=2', category: '快手菜', cooking_time: '15分钟', difficulty: '简单', related_products: [{ id: 2, name: '番茄炒蛋套餐' }] },
      { id: 3, title: '清蒸鲈鱼', description: '清淡鲜美，营养丰富', main_image: 'https://picsum.photos/200/150?random=3', category: '海鲜', cooking_time: '25分钟', difficulty: '中等', related_products: [{ id: 3, name: '清蒸鲈鱼套餐' }] },
      { id: 4, title: '减脂沙拉', description: '低卡健康，营养均衡', main_image: 'https://picsum.photos/200/150?random=4', category: '减脂餐', cooking_time: '10分钟', difficulty: '简单', related_products: [{ id: 4, name: '减脂沙拉套餐' }] }
    ]
    total.value = 4
  }
}

const loadProducts = async () => {
  try {
    const { data } = await adminApi.getProducts({ pageSize: 100 })
    availableProducts.value = Array.isArray(data) ? data : (data.data || [])
  } catch (error) {
    console.error('加载商品失败:', error)
    availableProducts.value = [
      { id: 1, name: '宫保鸡丁套餐', main_image: 'https://picsum.photos/50/50?random=1' },
      { id: 2, name: '番茄炒蛋套餐', main_image: 'https://picsum.photos/50/50?random=2' },
      { id: 3, name: '清蒸鲈鱼套餐', main_image: 'https://picsum.photos/50/50?random=3' },
      { id: 4, name: '减脂沙拉套餐', main_image: 'https://picsum.photos/50/50?random=4' },
      { id: 5, name: '番茄牛腩套餐', main_image: 'https://picsum.photos/50/50?random=5' }
    ]
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadRecipes()
}

const handlePageChange = () => {
  loadRecipes()
}

const handleAddRecipe = () => {
  isEdit.value = false
  form.value = {
    title: '',
    description: '',
    main_image: '',
    category: '',
    cooking_time: '',
    difficulty: '',
    servings: '',
    ingredients: '',
    steps: '',
    related_products: [],
    related_products_text: '',
    is_published: true
  }
  selectedProducts.value = []
  showForm.value = true
}

const handleEdit = (recipe) => {
  isEdit.value = true
  form.value = {
    ...recipe,
    related_products_text: recipe.related_products?.map(p => p.name).join(', ') || '',
    is_published: recipe.is_published === 1 || recipe.is_published === true
  }
  selectedProducts.value = recipe.related_products?.map(p => p.id) || []
  showForm.value = true
}

const handleDelete = async (recipe) => {
  try {
    await showConfirmDialog({
      title: '删除食谱',
      message: `确定要删除"${recipe.title}"吗？`
    })
    await adminApi.deleteRecipe(recipe.id)
    recipeList.value = recipeList.value.filter(r => r.id !== recipe.id)
    showToast('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      showToast('删除失败')
    }
  }
}

const onCategoryConfirm = ({ selectedValues }) => {
  form.value.category = selectedValues[0]
  showCategoryPicker.value = false
}

const onDifficultyConfirm = ({ selectedValues }) => {
  form.value.difficulty = selectedValues[0]
  showDifficultyPicker.value = false
}

const toggleProduct = (productId) => {
  const index = selectedProducts.value.indexOf(productId)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(productId)
  }
}

const confirmProducts = () => {
  const selected = availableProducts.value.filter(p => selectedProducts.value.includes(p.id))
  form.value.related_products = selected
  form.value.related_products_text = selected.map(p => p.name).join(', ')
  showProductPicker.value = false
}

const handleSubmit = async () => {
  try {
    const submitData = {
      ...form.value,
      related_product_ids: selectedProducts.value,
      is_published: form.value.is_published ? 1 : 0
    }
    
    if (isEdit.value) {
      await adminApi.updateRecipe(form.value.id, submitData)
      showToast('修改成功')
    } else {
      await adminApi.createRecipe(submitData)
      showToast('添加成功')
    }
    showForm.value = false
    loadRecipes()
  } catch (error) {
    console.error('保存失败:', error)
    showToast(error.apiMessage || error.message || '保存失败')
  }
}

onMounted(() => {
  loadRecipes()
  loadProducts()
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
  margin-bottom: 16px;
}

.recipe-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.recipe-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.recipe-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.recipe-info {
  padding: 12px;
}

.recipe-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.recipe-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
}

.recipe-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.recipe-category {
  font-size: 12px;
  color: #FF6B35;
  background: #FFF5F0;
  padding: 2px 8px;
  border-radius: 4px;
}

.recipe-time {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.recipe-difficulty {
  font-size: 12px;
  color: #999;
}

.recipe-products {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.recipe-products .label {
  font-size: 12px;
  color: #999;
}

.recipe-actions {
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
  grid-column: 1 / -1;
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

.recipe-form {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.form-submit {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.product-picker-container {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.picker-header h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.picker-body {
  flex: 1;
  overflow-y: auto;
}

.product-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .recipe-list {
    grid-template-columns: 1fr;
  }
}
</style>