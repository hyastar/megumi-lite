<template>
  <div class="categories-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="mdi:folder-multiple-outline" class="title-icon" />
        分类
      </h1>
      <p class="page-subtitle">文章分类统计图 📊</p>
    </div>

    <!-- Loading State -->
    <div v-if="pending || statsPending" class="loading-state">
      <Icon name="mdi:loading" class="loading-icon" />
      <p>加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || statsError" class="error-state">
      <Icon name="mdi:alert-circle" class="error-icon" />
      <p>{{ error || statsError }}</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="categories && categories.length > 0" class="categories-container">
      <!-- Chart Section -->
      <div class="chart-section">
        <CategoryChart v-if="chartData && chartData.length > 0" :data="chartData" />
        <div v-else class="empty-chart">
          <Icon name="mdi:chart-pie" class="empty-chart-icon" />
          <p>暂无统计数据</p>
        </div>
      </div>

      <!-- Categories List -->
      <div class="categories-list-section">
        <h2 class="list-title">所有分类</h2>
        <div class="categories-list">
          <NuxtLink
            v-for="category in categories"
            :key="category.slug"
            :to="`/categories/${category.slug}`"
            class="category-link"
          >
            {{ category.name }}
            <span class="category-count">({{ category.count }})</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <Icon name="mdi:folder-outline" class="empty-icon" />
      <p>暂无分类</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CategoryChart from '~/components/CategoryChart.client.vue'

// 获取分类数据（用于列表）
const { data: metadata, pending, error } = await useFetch('/api/metadata')

// 获取分类统计数据（用于图表）
const { data: statsData, pending: statsPending, error: statsError } = await useFetch('/api/categories/stats')

// 提取分类列表
const categories = computed(() => {
  if (!metadata.value || !metadata.value.categories) return []
  return metadata.value.categories || []
})

// 提取图表数据
const chartData = computed(() => {
  if (!statsData.value || !statsData.value.data) return []
  return statsData.value.data || []
})

// SEO
useHead({
  title: '分类',
  meta: [
    { name: 'description', content: `博客分类统计 - 共 ${categories.value.length} 个分类` }
  ]
})
</script>

<style scoped lang="scss">
.categories-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  min-height: calc(100vh - var(--nav-height) - 200px);
}

/* ============================================
   Page Header
   ============================================ */
.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl) 0;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.title-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--primary-color);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

/* ============================================
   Categories Container
   ============================================ */
.categories-container {
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

/* ============================================
   Chart Section
   ============================================ */
.chart-section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.empty-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.empty-chart-icon {
  width: 64px;
  height: 64px;
  color: var(--text-light);
  opacity: 0.5;
}

/* ============================================
   Categories List Section
   ============================================ */
.categories-list-section {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-light);
}

.list-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 var(--spacing-lg) 0;
  text-align: center;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
}

.category-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--bg-color);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-color);
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  
  &:hover {
    transform: scale(1.05) translateY(-2px);
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-hover);
    
    .category-count {
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  &:active {
    transform: scale(1.02) translateY(-1px);
  }
}

.category-count {
  font-size: 0.9em;
  color: var(--text-secondary);
  transition: var(--transition);
  font-weight: 600;
}

/* ============================================
   Loading & Error States
   ============================================ */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-xl) * 2);
  gap: var(--spacing-md);
  color: var(--text-secondary);
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  box-shadow: var(--shadow-sm);
}

.loading-icon {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.error-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-light);
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
   Responsive
   ============================================ */
@media (max-width: 768px) {
  .categories-page {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .categories-container {
    padding: var(--spacing-lg);
  }
  
  .chart-section {
    padding: var(--spacing-md);
  }
  
  .categories-list {
    gap: var(--spacing-sm);
  }
  
  .category-link {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
}
</style>
