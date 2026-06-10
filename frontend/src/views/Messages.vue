<template>
  <div class="messages-page">
    <van-nav-bar title="消息中心" left-arrow @click-left="$router.back()" />

    <div class="messages-list">
      <div
        v-for="conv in conversations"
        :key="conv.order_no"
        class="message-item"
        @click="openConversation(conv)"
      >
        <div class="message-avatar">
          <van-icon name="chat-o" size="24" color="#FF6B35" />
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="message-title">订单 {{ conv.order_no }}</span>
            <span class="message-time">{{ conv.lastTime }}</span>
          </div>
          <div class="message-preview">
            <span class="preview-text">{{ conv.lastMessage }}</span>
            <van-badge v-if="conv.unreadCount > 0" :content="conv.unreadCount" class="unread-badge" />
          </div>
        </div>
      </div>

      <div v-if="conversations.length === 0" class="empty-state">
        <van-icon name="chat-o" size="48" color="#ccc" />
        <p>暂无消息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api'

const router = useRouter()
const conversations = ref([])
let pollingTimer = null

const loadMessages = async () => {
  try {
    const { data } = await userApi.getChatHistory({})
    const messages = data || []

    // 按 order_no 分组
    const groups = {}
    messages.forEach(msg => {
      const key = msg.order_no || 'default'
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(msg)
    })

    // 构建会话列表
    const list = []
    for (const [orderNo, msgs] of Object.entries(groups)) {
      const sorted = msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      const last = sorted[sorted.length - 1]
      const unreadCount = sorted.filter(m => m.sender_type === 2 && m.is_read === 0).length

      list.push({
        order_no: orderNo,
        lastMessage: last.content,
        lastTime: new Date(last.created_at).toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        unreadCount,
        totalMessages: sorted.length
      })
    }

    // 按最后消息时间倒序
    conversations.value = list.sort((a, b) => {
      const aMsg = messages.find(m => (m.order_no || 'default') === a.order_no && m.content === a.lastMessage)
      const bMsg = messages.find(m => (m.order_no || 'default') === b.order_no && m.content === b.lastMessage)
      return new Date(bMsg?.created_at) - new Date(aMsg?.created_at)
    })
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

const openConversation = (conv) => {
  router.push(`/chat/${conv.order_no}`)
}

onMounted(() => {
  loadMessages()
  // 每5秒刷新消息列表
  pollingTimer = setInterval(loadMessages, 5000)
})

onUnmounted(() => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
  }
})
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.messages-list {
  padding: 8px 0;
}

.message-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.message-item:active {
  background: #f5f5f5;
}

.message-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff0eb;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-time {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
  margin-left: 8px;
}

.message-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-text {
  font-size: 13px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.unread-badge {
  flex-shrink: 0;
  margin-left: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}
</style>
