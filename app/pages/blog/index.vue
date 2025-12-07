<template>
  <div class="blog-page">
    <!-- Page Header -->
    <section class="page-header">
      <h1 class="page-title">全部文章</h1>
      <p class="page-subtitle">探索更多精彩内容</p>
    </section>

    <!-- Main Content: Articles + Sidebar -->
    <div class="main-layout">
      <!-- Articles Section (Left 74%) -->
      <section class="articles-section">
        <h2 class="section-title">文章列表</h2>
        
        <!-- Loading State - 骨架屏 -->
        <div v-if="pending" class="loading-state">
          <div class="skeleton-list">
            <div v-for="i in 5" :key="i" class="skeleton-card">
              <div class="skeleton-cover"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-excerpt"></div>
                <div class="skeleton-excerpt"></div>
                <div class="skeleton-meta"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <Icon name="mdi:alert-circle" class="error-icon" />
          <p>{{ error }}</p>
        </div>

        <!-- Articles List -->
        <div v-else-if="articles && articles.length > 0" class="articles-list">
          <article
            v-for="(article, index) in articles"
            :key="article.slug || article._id || index"
            class="article-card"
            :class="{ 
              'article-card--reverse': index % 2 === 1
            }"
          >
            <NuxtLink :to="`/articles/${article.slug}`" class="article-link">
              <!-- Article Cover Image -->
              <div class="article-cover">
                <div class="cover-wrapper">
                  <img 
                    v-if="article.coverImage" 
                    :src="article.coverImage" 
                    :alt="article.title" 
                    loading="lazy" 
                  />
                  <div v-else class="cover-placeholder">
                    <Icon name="mdi:image-outline" class="placeholder-icon" />
                  </div>
                </div>
              </div>

              <!-- Article Content -->
              <div class="article-content">
                <div class="article-header">
                  <h3 class="article-title">{{ article.title }}</h3>
                  <p class="article-excerpt">{{ article.summary || '暂无摘要' }}</p>
                </div>
                
                <div class="article-meta">
                  <span class="meta-item" v-if="article.category">
                    <Icon name="mdi:folder-outline" class="meta-icon" />
                    <span class="meta-text">{{ article.category.name }}</span>
                  </span>
                  <span class="meta-item" v-if="article.tags && article.tags.length > 0">
                    <Icon name="mdi:tag-outline" class="meta-icon" />
                    <span class="meta-text">
                      <span v-for="(tag, i) in article.tags" :key="tag._id || i">
                        {{ tag.name }}<span v-if="i < article.tags.length - 1">, </span>
                      </span>
                    </span>
                  </span>
                  <span class="meta-item">
                    <Icon name="mdi:calendar-outline" class="meta-icon" />
                    <time :datetime="article.publishedAt">{{ formatDate(article.publishedAt) }}</time>
                  </span>
                  <span class="meta-item">
                    <Icon name="mdi:eye-outline" class="meta-icon" />
                    <span class="meta-text">{{ article.views || 0 }} 次阅读</span>
                  </span>
                </div>
              </div>
            </NuxtLink>
          </article>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <Icon name="mdi:file-document-outline" class="empty-icon" />
          <p>暂无文章</p>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1" class="pagination">
          <NuxtLink
            v-if="pagination.page > 1"
            :to="`/blog?page=${pagination.page - 1}`"
            class="page-btn"
          >
            <Icon name="ri:arrow-left-line" class="page-icon" />
            <span>上一页</span>
          </NuxtLink>

          <div class="page-numbers">
            <NuxtLink
              v-for="pageNum in visiblePages"
              :key="pageNum"
              :to="`/blog${pageNum === 1 ? '' : `?page=${pageNum}`}`"
              class="page-number"
              :class="{ active: pageNum === pagination.page }"
            >
              {{ pageNum }}
            </NuxtLink>
          </div>

          <NuxtLink
            v-if="pagination.page < pagination.totalPages"
            :to="`/blog?page=${pagination.page + 1}`"
            class="page-btn"
          >
            <span>下一页</span>
            <Icon name="ri:arrow-right-line" class="page-icon" />
          </NuxtLink>
        </div>
      </section>

      <!-- Sidebar (Right 24%) -->
      <aside class="sidebar-section">
        <Sidebar :stats="stats" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Sidebar from '~/components/common/Sidebar.vue'

const route = useRoute()

// 获取当前页码，默认为 1
const currentPage = computed(() => {
  const page = parseInt(route.query.page as string) || 1
  return page > 0 ? page : 1
})

// 获取文章列表（带分页）
const { data: articlesData, pending, error, refresh } = await useFetch('/api/articles', {
  query: computed(() => ({
    limit: 10,
    page: currentPage.value
  }))
})

// 监听路由变化，自动刷新数据
watch(() => route.query.page, () => {
  refresh()
})

// 处理 API 返回的数据
const articles = computed(() => {
  if (!articlesData.value) return []
  // 如果返回的是分页对象，取 articles 字段；否则直接返回数组（向后兼容）
  return Array.isArray(articlesData.value) ? articlesData.value : articlesData.value.articles || []
})

// 分页信息
const pagination = computed(() => {
  if (!articlesData.value || Array.isArray(articlesData.value)) {
    return null
  }
  return {
    total: articlesData.value.total || 0,
    page: articlesData.value.page || 1,
    limit: articlesData.value.limit || 10,
    totalPages: articlesData.value.totalPages || 1
  }
})

// 计算可见的页码（显示当前页前后各2页）
const visiblePages = computed(() => {
  if (!pagination.value) return []
  const { page, totalPages } = pagination.value
  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 统计数据
const stats = computed(() => ({
  articles: pagination.value?.total || articles.value?.length || 0,
  tags: 0, // 可以从 API 获取
  categories: 0 // 可以从 API 获取
}))

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date | string) => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped lang="scss">
/* ============================================
   博客页面容器
   ============================================ */
.blog-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* ============================================
   Page Header
   ============================================ */
.page-header {
  text-align: center;
  padding: calc(var(--spacing-xl) * 2) var(--spacing-md) var(--spacing-xl);
  background: transparent;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0;
}

/* ============================================
   主布局 - 双栏（复用首页样式）
   ============================================ */
.main-layout {
  display: grid;
  grid-template-columns: 74% 24%;
  gap: 2%;
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  background: transparent;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

.articles-section {
  background: transparent;
}

.sidebar-section {
  background: transparent;
  
  @media (max-width: 1024px) {
    order: -1;
  }
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--spacing-xl);
  text-align: center;
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--border-light);
}

/* ============================================
   文章列表（复用首页样式）
   ============================================ */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.article-card {
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  overflow: hidden;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
  }
}

.article-link {
  display: flex;
  text-decoration: none;
  color: inherit;
  min-height: 240px;
}

.article-card:not(.article-card--reverse) .article-link {
  flex-direction: row;
}

.article-card--reverse .article-link {
  flex-direction: row-reverse;
}

.article-cover {
  flex: 0 0 40%;
  position: relative;
  overflow: hidden;
  background: var(--bg-color);
}

.cover-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 ratio */
  overflow: hidden;
}

.cover-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: var(--transition);
}

.article-card:hover .cover-wrapper img {
  transform: scale(1.1);
}

.cover-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--bg-color) 0%, var(--border-light) 100%);
}

.placeholder-icon {
  width: 64px;
  height: 64px;
  color: var(--text-light);
  opacity: 0.5;
}

.article-content {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-header {
  flex: 1;
}

.article-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  line-height: 1.4;
  transition: var(--transition);
}

.article-card:hover .article-title {
  color: var(--primary-color);
}

.article-excerpt {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  line-height: var(--line-height);
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-light);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.meta-text {
  color: var(--text-secondary);
}

/* ============================================
   加载和错误状态
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
}

.error-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-light);
}

/* ============================================
   骨架屏（复用首页样式）
   ============================================ */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.skeleton-card {
  background: var(--card-bg);
  border-radius: 25px;
  border: 1px solid rgba(169, 169, 169, 0.2);
  overflow: hidden;
  display: flex;
  min-height: 240px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-cover {
  flex: 0 0 40%;
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: linear-gradient(
    90deg,
    var(--bg-color) 0%,
    var(--border-light) 50%,
    var(--bg-color) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.skeleton-title {
  height: 24px;
  width: 70%;
  background: linear-gradient(
    90deg,
    var(--bg-color) 0%,
    var(--border-light) 50%,
    var(--bg-color) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-excerpt {
  height: 16px;
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--bg-color) 0%,
    var(--border-light) 50%,
    var(--bg-color) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

.skeleton-excerpt:nth-child(3) {
  width: 85%;
}

.skeleton-meta {
  height: 14px;
  width: 40%;
  background: linear-gradient(
    90deg,
    var(--bg-color) 0%,
    var(--border-light) 50%,
    var(--bg-color) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  margin-top: auto;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes skeleton-shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* ============================================
   分页组件
   ============================================ */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
  flex-wrap: wrap;
}

.page-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  color: var(--text-color);
  font-size: var(--font-size-base);
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.page-icon {
  width: 18px;
  height: 18px;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 var(--spacing-sm);
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  color: var(--text-color);
  font-size: var(--font-size-base);
  text-decoration: none;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }

  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    font-weight: 600;
  }
}

/* ============================================
   响应式设计
   ============================================ */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .sidebar-section {
    order: -1;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .main-layout {
    padding: var(--spacing-lg) var(--spacing-sm);
  }

  .article-link {
    flex-direction: column !important;
    min-height: auto;
  }

  .article-card--reverse .article-link {
    flex-direction: column !important;
  }

  .article-cover {
    flex: 0 0 auto;
    width: 100%;
  }

  .article-content {
    padding: var(--spacing-md);
  }

  .article-title {
    font-size: 1.25rem;
  }

  .pagination {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .page-numbers {
    justify-content: center;
  }
}
</style>

