<template>
  <div class="dashboard-page">
    <!-- Hero Banner: 樱花粉 -> 天空蓝 渐变背景 -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="greeting">
          <span class="greeting-icon">👋</span>
          <h1 class="greeting-text">{{ greeting }}</h1>
          <p class="greeting-subtitle">今天也是充满希望的一天~</p>
        </div>
        <div class="hero-decoration">
          <span class="decoration-icon">🌸</span>
        </div>
      </div>
    </div>

    <!-- 数据概览: Grid Layout -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">📝</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat-value">{{ stats.articles }}</div>
        <div class="stat-change positive">
          <span>↗️</span>
          <span>+2</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">👁️</span>
          <span class="stat-label">总览</span>
        </div>
        <div class="stat-value">{{ formatNumber(stats.views) }}</div>
        <div class="stat-change positive">
          <span>↗️</span>
          <span>+50</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">📷</span>
          <span class="stat-label">图片</span>
        </div>
        <div class="stat-value">{{ stats.images }}</div>
        <div class="stat-change new">
          <span>New</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-icon">⏳</span>
          <span class="stat-label">运行</span>
        </div>
        <div class="stat-value">{{ stats.uptime }} 天</div>
        <div class="stat-change stable">
          <span>稳定</span>
        </div>
      </div>
    </div>

    <!-- 快捷入口: Flex Center -->
    <div class="quick-actions">
      <NuxtLink to="/admin/articles" class="action-button">
        <span class="button-icon">⭕</span>
        <span class="button-text">写新文章</span>
      </NuxtLink>
      <NuxtLink to="/admin/gallery" class="action-button">
        <span class="button-icon">⭕</span>
        <span class="button-text">上传图片</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  layout: 'admin', 
  middleware: 'auth'
})

// 根据时间生成问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return '早上好，欧尼酱！'
  } else if (hour >= 12 && hour < 18) {
    return '下午好，欧尼酱！'
  } else if (hour >= 18 && hour < 22) {
    return '晚上好，欧尼酱！'
  } else {
    return '夜深了，欧尼酱！'
  }
})

// 统计数据（可以从 API 获取）
const stats = ref({
  articles: 102,
  views: 12580,
  images: 586,
  uptime: 120
})

// 格式化数字
const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}
</script>

<style scoped>
.dashboard-page {
  animation: slideUp 0.5s ease-out;
}

/* Hero Banner: 樱花粉 -> 天空蓝 渐变背景 */
.hero-banner {
  background: linear-gradient(135deg, #FFB6C1 0%, #87CEEB 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(255, 182, 193, 0.3);
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.greeting {
  flex: 1;
}

.greeting-icon {
  font-size: 48px;
  display: inline-block;
  margin-bottom: 12px;
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(20deg);
  }
  75% {
    transform: rotate(-20deg);
  }
}

.greeting-text {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.greeting-subtitle {
  font-size: 16px;
  color: rgba(44, 62, 80, 0.8);
  font-weight: 500;
}

.hero-decoration {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.3;
}

.decoration-icon {
  font-size: 120px;
  display: block;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

/* 数据概览: Grid Layout */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FFB6C1, #87CEEB);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-icon {
  font-size: 24px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.stat-change.positive {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.stat-change.new {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.stat-change.stable {
  background: rgba(241, 196, 15, 0.1);
  color: #f1c40f;
}

/* 快捷入口: Flex Center */
.quick-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 48px;
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.3), rgba(135, 206, 235, 0.3));
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  text-decoration: none;
  color: #2c3e50;
  font-weight: 600;
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-button:hover::before {
  width: 300px;
  height: 300px;
}

.action-button:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 30px rgba(255, 182, 193, 0.4);
  border-color: rgba(255, 182, 193, 0.8);
}

.action-button:active {
  transform: translateY(-2px) scale(0.98);
}

.button-icon {
  font-size: 48px;
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease;
}

.action-button:hover .button-icon {
  transform: scale(1.1) rotate(5deg);
}

.button-text {
  position: relative;
  z-index: 1;
}

/* 页面进入动画 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 暗黑模式适配 */
.dark .hero-banner {
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.3) 0%, rgba(135, 206, 235, 0.3) 100%);
}

.dark .stat-card {
  background: rgba(30, 30, 46, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .stat-value {
  color: #e0e0e0;
}

.dark .stat-label {
  color: #a0a0a0;
}

.dark .greeting-text {
  color: #e0e0e0;
}

.dark .greeting-subtitle {
  color: rgba(224, 224, 224, 0.8);
}

.dark .action-button {
  background: linear-gradient(135deg, rgba(255, 182, 193, 0.2), rgba(135, 206, 235, 0.2));
  border-color: rgba(255, 255, 255, 0.2);
  color: #e0e0e0;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-banner {
    padding: 24px;
  }

  .greeting-text {
    font-size: 24px;
  }

  .greeting-icon {
    font-size: 36px;
  }

  .decoration-icon {
    font-size: 80px;
    right: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
    min-width: auto;
  }
}
</style>
