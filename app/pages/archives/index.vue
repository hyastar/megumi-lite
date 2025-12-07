<template>
  <div class="archives-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="mdi:archive-outline" class="title-icon" />
        归档
      </h1>
      <p class="page-subtitle">共 {{ totalArticles }} 篇文章</p>
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

    <!-- Timeline -->
    <div v-else-if="groupedArticles && groupedArticles.length > 0" class="timeline-container">
      <div class="timeline-wrapper">
        <div class="timeline-line"></div>
        
        <div
          v-for="group in groupedArticles"
          :key="group.year"
          class="timeline-year-group"
        >
          <div class="year-header">
            <div class="year-dot"></div>
            <h2 class="year-title">{{ group.year }}</h2>
            <span class="year-count">{{ group.articles.length }} 篇</span>
          </div>
          
          <div class="articles-list">
            <NuxtLink
              v-for="article in group.articles"
              :key="article.slug"
              :to="`/articles/${article.slug}`"
              class="article-item"
            >
              <div class="article-dot"></div>
              <div class="article-content">
                <time class="article-date">{{ formatDate(article.publishedAt) }}</time>
                <span class="article-title">{{ article.title }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <Icon name="mdi:file-document-outline" class="empty-icon" />
      <p>暂无文章</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 获取归档数据
const { data: archiveData, pending, error } = await useFetch('/api/articles', {
  query: { mode: 'archive' }
})

// 计算总文章数
const totalArticles = computed(() => {
  if (!archiveData.value || !Array.isArray(archiveData.value)) return 0
  return archiveData.value.length
})

// 按年份分组文章，返回有序数组
const groupedArticles = computed(() => {
  if (!archiveData.value || !Array.isArray(archiveData.value)) return []
  
  const grouped: Record<string, Array<{ title: string; slug: string; publishedAt: string }>> = {}
  
  archiveData.value.forEach((article: any) => {
    if (!article.publishedAt) return
    
    const date = new Date(article.publishedAt)
    const year = date.getFullYear().toString()
    
    if (!grouped[year]) {
      grouped[year] = []
    }
    
    grouped[year].push({
      title: article.title || '',
      slug: article.slug || '',
      publishedAt: article.publishedAt
    })
  })
  
  // 转换为数组并按年份倒序排列，每个年份内的文章也按日期倒序排列（最新的在前）
  return Object.entries(grouped)
    .map(([year, articles]) => ({
      year,
      articles: articles.sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime()
        const dateB = new Date(b.publishedAt).getTime()
        return dateB - dateA // 倒序：最新的在前
      })
    }))
    .sort((a, b) => parseInt(b.year) - parseInt(a.year)) // 年份倒序：最新的年份在前
})

// 格式化日期为 MM-DD
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

// SEO
useHead({
  title: '归档',
  meta: [
    { name: 'description', content: `博客归档 - 共 ${totalArticles.value} 篇文章` }
  ]
})
</script>

<style scoped lang="scss">
.archives-page {
  max-width: 900px;
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
   Timeline Container
   ============================================ */
.timeline-container {
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.timeline-wrapper {
  position: relative;
  padding-left: var(--spacing-xl);
}

.timeline-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--primary-color),
    var(--primary-light),
    transparent
  );
  border-radius: 2px;
}

/* ============================================
   Year Group
   ============================================ */
.timeline-year-group {
  position: relative;
  margin-bottom: var(--spacing-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.year-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  position: relative;
  left: calc(-1 * var(--spacing-xl) - 8px);
}

.year-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--primary-color);
  border: 3px solid var(--card-bg);
  box-shadow: 0 0 0 2px var(--primary-color);
  flex-shrink: 0;
  transition: var(--transition);
  
  .timeline-year-group:hover & {
    transform: scale(1.3);
    box-shadow: 0 0 0 2px var(--primary-color), 0 0 10px var(--primary-color);
  }
}

.year-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.year-count {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  background: var(--bg-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  margin-left: auto;
}

/* ============================================
   Articles List
   ============================================ */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-left: var(--spacing-md);
}

.article-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  color: inherit;
  padding: var(--spacing-sm) 0;
  position: relative;
  transition: var(--transition);
  
  &:hover {
    .article-dot {
      transform: scale(1.3);
      background: var(--primary-hover);
    }
    
    .article-title {
      color: var(--primary-color);
      text-decoration: underline;
    }
  }
}

.article-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--text-light);
  border: 2px solid var(--card-bg);
  flex-shrink: 0;
  transition: var(--transition);
}

.article-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.article-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  min-width: 60px;
  flex-shrink: 0;
}

.article-title {
  font-size: var(--font-size-base);
  color: var(--text-color);
  transition: var(--transition);
  line-height: 1.6;
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
  .archives-page {
    padding: var(--spacing-lg) var(--spacing-sm);
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .timeline-container {
    padding: var(--spacing-lg);
  }
  
  .timeline-wrapper {
    padding-left: var(--spacing-lg);
  }
  
  .year-header {
    left: calc(-1 * var(--spacing-lg) - 8px);
  }
  
  .year-title {
    font-size: 1.5rem;
  }
  
  .article-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .article-date {
    min-width: auto;
  }
}
</style>
