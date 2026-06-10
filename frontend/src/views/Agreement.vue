<template>
  <div class="agreement">
    <van-nav-bar :title="title" left-arrow @click-left="$router.back()" />

    <div class="agreement-content">
      <div v-if="type === 'user_agreement'" class="agreement-text">
        <h2>用户协议</h2>
        <h3>一、服务条款的确认和接纳</h3>
        <p>趣配鲜（以下简称"本平台"）依据本协议为用户提供服务。用户在使用本平台服务前，应当仔细阅读本协议的全部内容。</p>
        
        <h3>二、用户账号</h3>
        <p>用户需注册账号并设置密码。用户应对其账号和密码的安全负责，并对通过其账号进行的所有活动承担责任。</p>
        
        <h3>三、服务内容</h3>
        <p>本平台提供生鲜预处理食材包的销售服务。用户通过本平台购买的商品为生鲜预处理食材，需自行烹饪加工。</p>
        
        <h3>四、订单与支付</h3>
        <p>用户下单后需及时支付。生鲜商品为定制备货，非质量问题不支持无理由退换。</p>
        
        <h3>五、用户行为规范</h3>
        <p>用户不得利用本平台进行任何违法违规活动，不得发布虚假信息或侵犯他人权益。</p>
        
        <h3>六、隐私保护</h3>
        <p>本平台将依法保护用户的个人信息，未经用户同意，不会向第三方泄露。</p>
      </div>

      <div v-else-if="type === 'privacy_policy'" class="agreement-text">
        <h2>隐私政策</h2>
        <h3>一、信息收集</h3>
        <p>本平台收集用户的姓名、手机号、地址等信息，用于订单配送和服务提供。</p>
        
        <h3>二、信息使用</h3>
        <p>用户信息仅用于履行订单、提供服务和改进用户体验，不会出售给第三方。</p>
        
        <h3>三、信息保护</h3>
        <p>本平台采用加密技术保护用户信息安全，防止信息泄露。</p>
        
        <h3>四、用户权利</h3>
        <p>用户有权查询、修改、删除其个人信息，也可以申请注销账号。</p>
      </div>

      <div v-else class="agreement-text">
        <h2>页面维护中</h2>
        <p>该页面正在维护中，请稍后访问。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const type = ref('')

const title = computed(() => {
  const titleMap = {
    'user_agreement': '用户协议',
    'privacy_policy': '隐私政策'
  }
  return titleMap[type.value] || '协议'
})

onMounted(() => {
  type.value = route.params.type || ''
})
</script>

<style scoped>
.agreement {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.agreement-content {
  padding: 16px;
}

.agreement-text {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
}

.agreement-text h2 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 24px;
}

.agreement-text h3 {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin: 16px 0 8px;
}

.agreement-text p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}
</style>
