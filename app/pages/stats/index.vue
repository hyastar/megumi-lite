<template>
  <div class="stats-page">
    <h1 class="page-title">网站统计</h1>

    <!-- 访问统计 iframe 区域 -->
    <div class="analytics-section">
      <div class="analytics-container">
        <!-- Loading State -->
        <div v-if="iframeLoading" class="iframe-loading">
          <Icon name="mdi:loading" class="loading-icon" />
          <p>加载统计中...</p>
        </div>

        <!-- Empty State (未配置) -->
        <div v-else-if="!analyticsShareUrl" class="empty-state">
          <Icon name="mdi:chart-line-variant" class="empty-icon" />
          <h3>未配置统计分享链接</h3>
          <p>请在环境变量中设置 <code>NUXT_PUBLIC_ANALYTICS_SHARE_URL</code></p>
          <div class="empty-hint">
            <p><strong>配置示例：</strong></p>
            <ul>
              <li>Umami: <code>NUXT_PUBLIC_ANALYTICS_PROVIDER=umami</code></li>
              <li>51.LA: <code>NUXT_PUBLIC_ANALYTICS_PROVIDER=51la</code></li>
              <li>分享链接: <code>NUXT_PUBLIC_ANALYTICS_SHARE_URL=你的分享链接</code></li>
            </ul>
          </div>
        </div>

        <!-- Analytics iframe -->
        <iframe
          v-else
          :src="analyticsShareUrl"
          class="analytics-iframe"
          :class="{
            'iframe-umami': analyticsProvider === 'umami',
            'iframe-51la': analyticsProvider === '51la'
          }"
          frameborder="0"
          allow="fullscreen"
          referrerpolicy="no-referrer"
          @load="handleIframeLoad"
        ></iframe>

        <!-- 51.la 数据挂件 -->
        <div
          v-if="is51LaWidgetVisible"
          ref="laWidgetRef"
          class="la-widget-container"
        ></div>
      </div>
    </div>

    <!-- 网站基础统计 -->
    <div class="stats-container">
      <!-- 网站统计 -->
      <section class="stats-section">
        <h2 class="stats-title">网站统计</h2>
        <ul class="stats-list">
          <li class="stats-item">
            <span class="stats-label">文章总数：</span>
            <span class="stats-value">{{ siteStats.articles }}</span>
          </li>
          <li class="stats-item">
            <span class="stats-label">分类总数：</span>
            <span class="stats-value">{{ siteStats.categories }}</span>
          </li>
          <li class="stats-item">
            <span class="stats-label">标签总数：</span>
            <span class="stats-value">{{ siteStats.tags }}</span>
          </li>
          <li class="stats-item">
            <span class="stats-label">运行天数：</span>
            <span class="stats-value">{{ siteStats.runningDays }}</span>
          </li>
          <li class="stats-item">
            <span class="stats-label">最后更新：</span>
            <span class="stats-value">{{ siteStats.lastUpdate }}</span>
          </li>
        </ul>
      </section>

      <!-- 文章统计 -->
      <section class="stats-section">
        <h2 class="stats-title">文章统计</h2>
        <ul class="stats-list">
          <li class="stats-item">
            <span class="stats-label">总字数：</span>
            <span class="stats-value">{{ articleStats.totalWords }}</span>
          </li>
          <li class="stats-item">
            <span class="stats-label">平均字数：</span>
            <span class="stats-value">{{ articleStats.avgWords }}</span>
          </li>
          <li class="stats-item">
            <span class="stats-label">总阅读量：</span>
            <span class="stats-value">{{ articleStats.totalViews }}</span>
          </li>
          <li class="stats-item">
            <span class="stats-label">平均阅读量：</span>
            <span class="stats-value">{{ articleStats.avgViews }}</span>
          </li>
          <li class="stats-item">
            <span class="stats-label">最热文章：</span>
            <span class="stats-value">{{ articleStats.hottestArticle }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// 获取运行时配置
const config = useRuntimeConfig()
const analyticsProvider = computed(() => config.public.analyticsProvider || 'umami')
const analyticsShareUrl = computed(() => config.public.analyticsShareUrl || '')
const is51LaWidgetVisible = computed(
  () => analyticsProvider.value === '51la' && !!config.public.laId
)
const laWidgetRef = ref<HTMLElement | null>(null)

// iframe 加载状态
const iframeLoading = ref(true)

// 处理 iframe 加载完成
const handleIframeLoad = () => {
  iframeLoading.value = false
}

// Mock statistics data (will be replaced with API call)
const siteStats = ref({
  articles: 0,
  categories: 0,
  tags: 0,
  runningDays: 0,
  lastUpdate: '2024-01-01'
})

const articleStats = ref({
  totalWords: 0,
  avgWords: 0,
  totalViews: 0,
  avgViews: 0,
  hottestArticle: '-'
})

// Load statistics from API
const loadStatistics = async () => {
  try {
    // Load site stats
    const siteResponse = await $fetch('/api/stats')

    if (siteResponse.success) {
      const statsData = siteResponse.data
      siteStats.value = {
        articles: statsData.articleCount || 0,
        categories: statsData.categoryCount || 0,
        tags: statsData.tagCount || 0,
        runningDays: statsData.siteRunDays || 0,
        lastUpdate: new Date().toISOString().split('T')[0]
      }
    }

    // Calculate article stats
    const articlesResponse = await $fetch('/api/articles', {
      query: {
        limit: 100
      }
    })

    if (Array.isArray(articlesResponse)) {
      const articles = articlesResponse
      let totalWords = 0
      let totalViews = 0
      let maxViews = 0
      let hottestArticle = '-'

      articles.forEach((article: any) => {
        if (article.summary) {
          totalWords += article.summary.length * 10 // 估算字数
        }
        if (article.views) {
          totalViews += article.views
          if (article.views > maxViews) {
            maxViews = article.views
            hottestArticle = article.title
          }
        }
      })

      articleStats.value = {
        totalWords: formatNumber(totalWords),
        avgWords: formatNumber(Math.round(totalWords / (articles.length || 1))),
        totalViews: formatNumber(totalViews),
        avgViews: formatNumber(Math.round(totalViews / (articles.length || 1))),
        hottestArticle: hottestArticle
      }
    }
  } catch (error) {
    console.error('Error loading statistics:', error)
    // Use default values on error
  }
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

onMounted(() => {
  loadStatistics()
  
  // 如果配置了分享链接，设置加载超时（防止 iframe 加载失败时一直显示 loading）
  if (analyticsShareUrl.value) {
    setTimeout(() => {
      iframeLoading.value = false
    }, 10000) // 10秒超时
  } else {
    iframeLoading.value = false
  }

  // 51.la 挂件
  if (is51LaWidgetVisible.value && laWidgetRef.value) {
    const script = document.createElement('script')
    script.id = 'LA-DATA-WIDGET'
    script.crossOrigin = 'anonymous'
    script.charset = 'UTF-8'
    script.src = `https://v6-widget.51.la/v6/${config.public.laId}/quote.js?theme=0&col=true&f=12&badge=text&text=center`
    laWidgetRef.value.appendChild(script)
  }
})

// SEO
useHead({
  title: '网站统计',
  meta: [
    { name: 'description', content: '网站访问统计和数据分析' }
  ]
})
</script>

<style scoped lang="scss">
.stats-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  text-align: center;
  margin-bottom: 40px;
}

/* ============================================
   Analytics Section (iframe 区域)
   ============================================ */
.analytics-section {
  margin-bottom: 40px;
}

.analytics-container {
  position: relative;
  background-color: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  padding: 32px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  min-height: 85vh;
  overflow: hidden;
}

.analytics-iframe {
  width: 100%;
  height: 100%;
  min-height: 85vh;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
}

.la-widget-container {
  margin-top: 20px;
  padding: 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Umami 特定样式 */
.iframe-umami {
  /* Umami 默认样式，可根据需要调整 */
}

/* 51.LA 特定样式 */
.iframe-51la {
  /* 51.LA 报表页面样式，确保通用兼容 */
  width: 100%;
  height: 100%;
  min-height: 85vh;
}

/* ============================================
   Loading State
   ============================================ */
.iframe-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-secondary);
  z-index: 10;
}

.loading-icon {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ============================================
   Empty State
   ============================================ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-xl) * 2);
  gap: var(--spacing-lg);
  color: var(--text-secondary);
  text-align: center;
  min-height: 400px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--text-light);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.empty-state p {
  margin: 0;
  line-height: 1.6;
}

.empty-state code {
  background: var(--bg-color);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--primary-color);
  border: 1px solid var(--border-light);
}

.empty-hint {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  text-align: left;
  max-width: 600px;
}

.empty-hint p {
  margin-bottom: var(--spacing-md);
  font-weight: 500;
}

.empty-hint ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.empty-hint li {
  padding: var(--spacing-sm);
  background: var(--card-bg);
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}

/* ============================================
   Stats Container (Two Column Layout)
   ============================================ */
.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  
  .analytics-container {
    padding: var(--spacing-lg);
    min-height: 70vh;
  }
  
  .analytics-iframe {
    min-height: 70vh;
  }
  
  .iframe-51la {
    min-height: 70vh;
  }
}

/* Stats Section */
.stats-section {
  background-color: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  padding: 32px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.stats-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(73, 177, 245, 0.2);
}

/* Stats List */
.stats-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.stats-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-light);
  font-size: 1rem;
  line-height: 1.6;
}

.stats-item:last-child {
  border-bottom: none;
}

.stats-label {
  color: var(--text-secondary);
  margin-right: 8px;
}

.stats-value {
  color: var(--text-color);
  font-weight: 500;
}
</style>
