<template>
  <div class="tags-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="mdi:tag-multiple-outline" class="title-icon" />
        标签
      </h1>
      <p class="page-subtitle">共 {{ tags.length }} 个标签</p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <Icon name="mdi:loading" class="loading-icon" />
      <p>加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <Icon name="mdi:alert-circle" class="error-icon" />
      <p>{{ error }}</p>
    </div>

    <!-- Main Content -->
    <div v-else-if="tags && tags.length > 0" class="tags-content">
      <!-- Chart Section -->
      <div class="tag-chart-container">
        <h2 class="chart-title">Top 15 标签统计 📈</h2>
        <TagChart :tags="tags" />
      </div>

      <!-- Tag Cloud Section -->
      <div class="tag-cloud-container">
        <div class="tag-cloud">
          <NuxtLink
            v-for="tag in tags"
            :key="tag.slug"
            :to="`/tags/${tag.slug}`"
            class="tag-item"
            :style="getTagStyle(tag)"
          >
            {{ tag.name }}
            <span class="tag-count">({{ tag.count }})</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <Icon name="mdi:tag-outline" class="empty-icon" />
      <p>暂无标签</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TagChart from '~/components/TagChart.client.vue'

// 获取标签数据
const { data: metadata, pending, error } = await useFetch('/api/metadata')

// 提取标签列表
const tags = computed(() => {
  if (!metadata.value || !metadata.value.tags) return []
  return metadata.value.tags || []
})

// 计算标签的字体大小（根据文章数量）
const getFontSize = (count: number, minCount: number, maxCount: number) => {
  if (maxCount === minCount) return 16 // 如果所有标签数量相同，使用默认大小
  
  // 归一化到 12px - 30px
  const minSize = 12
  const maxSize = 30
  const ratio = (count - minCount) / (maxCount - minCount)
  return minSize + (maxSize - minSize) * ratio
}

// 生成随机颜色（Hexo 风格的鲜艳颜色）
const tagColors = [
  '#49b1f5', // 主题蓝
  '#ff7242', // 橙
  '#ff6b9d', // 粉
  '#c44569', // 深粉
  '#f093fb', // 浅粉
  '#4facfe', // 天蓝
  '#43e97b', // 绿
  '#fa709a', // 玫红
  '#fee140', // 黄
  '#30cfd0', // 青
  '#a8edea', // 浅青
  '#ff9a9e', // 浅粉红
  '#fecfef', // 淡粉
  '#fad0c4', // 淡橙
  '#ffd1ff', // 淡紫
]

// 为每个标签分配颜色和大小
const tagStyles = computed(() => {
  if (!tags.value || tags.value.length === 0) return {}
  
  const counts = tags.value.map(t => t.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)
  
  const styles: Record<string, { fontSize: string; color: string }> = {}
  
  tags.value.forEach((tag, index) => {
    if (!tag.slug) return // 跳过没有 slug 的标签
    const fontSize = getFontSize(tag.count, minCount, maxCount)
    const color = tagColors[index % tagColors.length] || tagColors[0] // 确保有默认值
    const slug = tag.slug as string // 类型断言，因为上面已经检查过
    
    styles[slug] = {
      fontSize: `${fontSize}px`,
      color: color as string
    }
  })
  
  return styles
})

// 获取标签样式
const getTagStyle = (tag: { slug: string; count: number }) => {
  const style = tagStyles.value[tag.slug]
  if (!style) return {}
  
  return {
    fontSize: style.fontSize,
    color: style.color,
    '--tag-color': style.color
  }
}

// SEO
useHead({
  title: '标签',
  meta: [
    { name: 'description', content: `博客标签云 - 共 ${tags.value.length} 个标签` }
  ]
})
</script>

<style scoped lang="scss">
.tags-page {
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
   Tags Content Wrapper
   ============================================ */
.tags-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* ============================================
   Tag Chart Container
   ============================================ */
.tag-chart-container {
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 var(--spacing-lg) 0;
  text-align: center;
}

/* ============================================
   Tag Cloud Container
   ============================================ */
.tag-cloud-container {
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

/* ============================================
   Tag Item
   ============================================ */
.tag-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(169, 169, 169, 0.2);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: var(--transition);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  
  // 使用 CSS 变量来设置颜色
  border-color: var(--tag-color, rgba(169, 169, 169, 0.2));
  
  &:hover {
    transform: scale(1.15) translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    background: var(--tag-color, var(--primary-color));
    color: white;
    border-color: var(--tag-color, var(--primary-color));
    
    .tag-count {
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.tag-count {
  font-size: 0.85em;
  color: var(--text-secondary);
  transition: var(--transition);
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
  .tags-page {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .tag-chart-container,
  .tag-cloud-container {
    padding: var(--spacing-lg);
  }
  
  .chart-title {
    font-size: 1.25rem;
  }
  
  .tag-cloud {
    gap: var(--spacing-sm);
  }
  
  .tag-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
}

/* ============================================
   Dark Mode Support
   ============================================ */
.dark .tag-item {
  background: rgba(30, 30, 40, 0.5);
  
  &:hover {
    background: var(--tag-color, var(--primary-color));
  }
}
</style>
