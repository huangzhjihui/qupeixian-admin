<template>
  <div class="image-upload">
    <!-- 图片预览 -->
    <div v-if="imageUrl" class="image-preview">
      <img :src="imageUrl" :alt="alt" class="preview-img" />
      <div class="preview-actions">
        <van-button size="mini" type="primary" @click="triggerUpload">更换图片</van-button>
        <van-button size="mini" type="danger" @click="handleRemove">删除</van-button>
      </div>
    </div>
    
    <!-- 上传区域 -->
    <div v-else class="upload-area" @click="triggerUpload">
      <van-icon name="plus" size="24" color="#999" />
      <span class="upload-text">上传图片</span>
    </div>
    
    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { showToast } from 'vant'
import { adminApi } from '@/api'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: '图片'
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const imageUrl = ref(props.modelValue)

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
  if (!allowedTypes.includes(file.type)) {
    showToast('只支持图片格式 (jpg, png, gif, webp, bmp)')
    event.target.value = ''
    return
  }
  
  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('文件大小不能超过5MB')
    event.target.value = ''
    return
  }
  
  try {
    showToast({ type: 'loading', message: '上传中...', forbidClick: true, duration: 0 })
    const response = await adminApi.uploadImage(file)
    const url = response.data?.url
    if (url) {
      imageUrl.value = url
      emit('update:modelValue', url)
      showToast('上传成功')
    } else {
      showToast('上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    showToast(error.apiMessage || '上传失败')
  }
  
  // 清空 input，允许重复选择同一文件
  event.target.value = ''
}

const handleRemove = () => {
  imageUrl.value = ''
  emit('update:modelValue', '')
}
</script>

<style scoped>
.image-upload {
  display: inline-block;
}

.image-preview {
  position: relative;
  width: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.preview-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.preview-actions {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
}

.upload-area {
  width: 200px;
  height: 150px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #1989fa;
}

.upload-text {
  margin-top: 8px;
  font-size: 14px;
  color: #999;
}
</style>
