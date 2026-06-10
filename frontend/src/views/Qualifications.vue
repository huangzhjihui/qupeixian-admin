<template>
  <div class="qualifications">
    <van-nav-bar title="资质公示" left-arrow @click-left="$router.back()" />

    <div class="qualifications-content">
      <div class="section">
        <div class="section-title">平台资质</div>
        <div class="qualification-list">
          <div class="qualification-item">
            <div class="qualification-header">
              <van-icon name="file-text" />
              <span>营业执照</span>
            </div>
            <p class="qualification-info">统一社会信用代码: 91330000MA2K123456</p>
            <p class="qualification-info">经营范围: 食品销售（仅销售预包装食品）</p>
          </div>
          <div class="qualification-item">
            <div class="qualification-header">
              <van-icon name="shield" />
              <span>食品经营许可证</span>
            </div>
            <p class="qualification-info">许可证编号: JY333010000000123</p>
            <p class="qualification-info">许可项目: 预包装食品销售</p>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">食品安全承诺</div>
        <div class="promise-content">
          <ul>
            <li>本平台承诺所售商品均为正规渠道采购</li>
            <li>所有食材均经过严格检验检疫</li>
            <li>确保食材新鲜、安全、卫生</li>
            <li>严格遵守《食品安全法》相关规定</li>
          </ul>
        </div>
      </div>

      <div class="section">
        <div class="section-title">供应商资质</div>
        <p class="section-desc">本平台所有供应商均已通过资质审核，持有合法有效的营业执照和食品经营许可证。</p>
      </div>

      <div class="section">
        <div class="section-title">投诉举报</div>
        <div class="contact-info">
          <p><van-icon name="phone" /> 客服热线: 400-888-8888</p>
          <p><van-icon name="mail" /> 邮箱: service@qupeixian.com</p>
        </div>
      </div>

      <div class="safety-tips">
        <van-icon name="info-o" />
        本平台已向市场监督管理部门备案，备案号: 浙食网备2024XXXXXXXX号
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.qualifications {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.qualifications-content {
  padding: 12px;
}

.section {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.section-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.qualification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qualification-item {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.qualification-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.qualification-info {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.promise-content ul {
  padding-left: 16px;
}

.promise-content li {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.safety-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background-color: #f6ffed;
  border-radius: 8px;
  font-size: 13px;
  color: #52c41a;
  margin-top: 12px;
}
</style>
