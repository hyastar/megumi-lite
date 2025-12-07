<template>
  <div class="articles-stats-page">
    <h1 class="page-title">文章统计</h1>

    <div class="stats-container">
      <section class="stats-section">
        <h2 class="stats-title">文章维度统计</h2>
        
        <div class="stats-grid" v-if="!pending">
          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="ri:file-list-line" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(articleStats.totalArticles) }}</div>
              <div class="stat-label">文章总数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="ri:file-text-line" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(articleStats.totalWords) }}</div>
              <div class="stat-label">总字数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="ri:eye-line" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(articleStats.totalViews) }}</div>
              <div class="stat-label">总阅读量</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="ri:bar-chart-line" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(articleStats.avgWords) }}</div>
              <div class="stat-label">平均字数</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <Icon name="ri:fire-line" />
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatNumber(articleStats.avgViews) }}</div>
              <div class="stat-label">平均阅读量</div>
            </div>
          </div>

          <div class="stat-card stat-card--wide">
            <div class="stat-icon">
              <Icon name="ri:star-line" />
            </div>
            <div class="stat-content">
              <div class="stat-value">
                <span class="hottest-title">{{ articleStats.hottestArticle.title || '-' }}</span>
                <span class="hottest-views" v-if="articleStats.hottestArticle.views"> · {{ formatNumber(articleStats.hottestArticle.views) }} 次</span>
              </div>
              <div class="stat-label">最热文章</div>
            </div>
          </div>
        </div>

        <div class="stats-grid" v-else>
          <div v-for="i in 6" :key="i" class="stat-card skeleton-card"></div>
        </div>
      </section>
      <section class="chart-section">
        <h2 class="section-title">
          <Icon name="ri:fire-line" class="icon" />
          文章热度全景图
        </h2>
        <ClientOnly>
          <ArticleViewsChart v-if="!pending && chartData.length" :data="chartData" />
          <div v-else class="chart-skeleton"></div>
        </ClientOnly>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import ArticleViewsChart from '~/components/stats/ArticleViewsChart.client.vue'

const { data, pending, error } = useFetch('/api/stats/articles')

const articleStats = computed(() => data.value || {
  totalArticles: 0,
  totalWords: 0,
  totalViews: 0,
  avgWords: 0,
  avgViews: 0,
  hottestArticle: { title: '-', views: 0 },
  chartData: []
})

const chartData = computed(() => {
  const data = articleStats.value.chartData || []
  return data
})

const formatNumber = (num: number | undefined | null) => {
  const n = Number(num || 0)
  if (n >= 10000) {
    return `${(n / 10000).toFixed(1)}w`
  }
  return n.toString()
}

watch(error, (err) => {
  if (err) {
    console.error('Error loading article statistics:', err)
  }
})
</script>

<style scoped lang="scss">
.articles-stats-page {
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

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.stats-section {
  background-color: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  padding: 32px;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
}

.stats-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(73, 177, 245, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: rgba(73, 177, 245, 0.05);
  border-radius: var(--card-radius);
  border: 1px solid rgba(73, 177, 245, 0.12);
  transition: var(--transition);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
    border-color: var(--primary-color);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-card--wide {
  grid-column: span 2;

  @media (max-width: 768px) {
    grid-column: span 1;
  }
}

.hottest-title {
  font-weight: 700;
  color: var(--text-color);
}

.hottest-views {
  color: var(--text-secondary);
  margin-left: 4px;
}

.skeleton-card {
  min-height: 96px;
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--card-radius);
  border: 1px solid rgba(255,255,255,0.1);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

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

.chart-section {
  background: var(--card-bg);
  border-radius: var(--card-radius);
  border: 1px solid var(--border-light);
  padding: 32px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  color: #ff7242;
}

.chart-skeleton {
  width: 100%;
  height: 500px;
  border-radius: var(--card-radius);
  background: linear-gradient(90deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border: 1px solid rgba(255,255,255,0.1);
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

