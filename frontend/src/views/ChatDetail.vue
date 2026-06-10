<template>
  <div class="chat-detail">
    <van-nav-bar :title="'订单 ' + orderNo" left-arrow @click-left="$router.back()" />

    <div class="chat-messages" ref="chatMessagesRef">
      <div v-for="(msg, index) in messages" :key="index" :class="['chat-msg', msg.is_admin ? 'admin' : 'user']">
        <div class="chat-msg-bubble">
          <span>{{ msg.content }}</span>
          <span class="chat-msg-time">{{ msg.time }}</span>
        </div>
      </div>
      <div v-if="messages.length === 0" class="chat-empty">
        <van-icon name="chat-o" size="48" color="#ccc" />
        <p>暂无消息，发送消息开始对话</p>
      </div>
    </div>

    <div class="chat-input-area">
      <van-field
        v-model="chatInput"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
      />
      <van-button type="primary" size="small" @click="sendMessage" :disabled="!chatInput.trim()">
        发送
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { showToast } from 'vant'
import { userApi } from '@/api'

const route = useRoute()
const orderNo = route.params.orderNo

const chatInput = ref('')
const messages = ref([])
const chatMessagesRef = ref(null)
let pollingTimer = null

const loadMessages = async () => {
  try {
    const { data } = await userApi.getChatHistory({ order_no: orderNo })
    const list = (data || []).map(msg => ({
      content: msg.content,
      is_admin: msg.sender_type === 2,
      time: new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }))
    messages.value = list
    setTimeout(() => scrollBottom(), 50)
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

const sendMessage = async () => {
  if (!chatInput.value.trim()) return
  const content = chatInput.value.trim()
  chatInput.value = ''

  try {
    const { data } = await userApi.sendChatMessage({
      order_no: orderNo,
      content
    })

    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    messages.value.push({
      content: data.content,
      is_admin: false,
      time
    })
    setTimeout(() => scrollBottom(), 50)
  } catch (error) {
    console.error('发送消息失败:', error)
    showToast('发送失败')
  }
}

const scrollBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

onMounted(() => {
  loadMessages()
  // 每3秒轮询新消息
  pollingTimer = setInterval(loadMessages, 3000)
})

onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
})
</script>

<style scoped>
.chat-detail {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 80px;
}

.chat-msg {
  display: flex;
  margin-bottom: 12px;
}

.chat-msg.admin {
  justify-content: flex-start;
}

.chat-msg.user {
  justify-content: flex-end;
}

.chat-msg-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
}

.chat-msg.admin .chat-msg-bubble {
  background: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 4px;
}

.chat-msg.user .chat-msg-bubble {
  background: #FF6B35;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.chat-msg-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999;
}

.chat-empty p {
  margin-top: 12px;
  font-size: 14px;
}

.chat-input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  background: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.chat-input-area .van-field {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 20px;
}
</style>
