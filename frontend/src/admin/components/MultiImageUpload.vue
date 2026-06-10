<template>
  <div class="multi-image-upload">
    <!-- 已上传图片列表 -->
    <div class="image-list">
      <div v-for="(img, idx) in imageList" :key="idx" class="image-item">
        <img :src="img" class="preview-img" />
        <div class="image-overlay">
          <van-icon name="cross" class="remove-btn" @click="removeImage(idx)" />
        </div>
        <div v-if="idx === 0" class="image-badge">主图</div>
      </div>

      <!-- 上传按钮 -->
      <div v-if="imageList.length < maxCount" class="upload-btn" @click="triggerUpload">
        <van-icon name="plus" size="24" color="#999" />
        <span class="upload-text">上传图片</span>
        <span class="upload-hint">{{ imageList.length }}/{{ maxCount }}</span>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
      multiple
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import { adminApi } from '@/api'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 9
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const imageList = ref([...(props.modelValue || [])])

// 监听外部变化同步到内部
watch(() => props.modelValue, (val) => {
  if (JSON.stringify(val) !== JSON.stringify(imageList.value)) {
    imageList.value = [...(val || [])]
  }
}, { deep: true })

const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return

  // 检查是否超过最大数量
  const remaining = props.maxCount - imageList.value.length
  if (remaining <= 0) {
    showToast(`最多上传${props.maxCount}张图片`)
    event.target.value = ''
    return
  }

  const filesToUpload = Array.from(files).slice(0, remaining)

  try {
    showToast({ type: 'loading', message: `上传中 0/${filesToUpload.length}`, forbidClick: true, duration: 0 })

    const uploadResults = []
    let completed = 0

    for (const file of filesToUpload) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
      if (!allowedTypes.includes(file.type)) {
        showToast(`${file.name} 不是图片格式，已跳过`)
        continue
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} 超过5MB，已跳过`)
        continue
      }

      const response = await adminApi.uploadImage(file)
      const url = response.data?.url
      if (url) {
        uploadResults.push(url)
      }

      completed++
      showToast({ type: 'loading', message: `上传中 ${completed}/${filesToUpload.length}`, forbidClick: true, duration: 0 })
    }

    if (uploadResults.length > 0) {
      const newList = [...imageList.value, ...uploadResults]
      imageList.value = newList
      emit('update:modelValue', newList)
      showToast(`成功上传 ${uploadResults.length} 张图片`)
    } else {
      showToast('没有成功上传的图片')
    }
  } catch (error) {
    console.error('上传失败:', error)
    showToast(error.apiMessage || '上传失败')
  }

  // 清空 input
  event.target.value = ''
}

const removeImage = (idx) => {
  const newList = [...imageList.value]
  newList.splice(idx, 1)
  imageList.value = newList
  emit('update:modelValue', newList)
}
</script>

<style scoped>
.multi-image-upload {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
}

.remove-btn {
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  padding: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.remove-btn:hover {
  background: rgba(255, 0, 0, 0.7);
}

.image-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 107, 53, 0.85);
  color: white;
  font-size: 11px;
  text-align: center;
  padding: 2px 0;
}

.upload-btn {
  width: 100px;
  height: 100px;
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

.upload-btn:hover {
  border-color: #1989fa;
}

.upload-text {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}

.upload-hint {
  font-size: 11px;
  color: #ccc;
}
</style>
