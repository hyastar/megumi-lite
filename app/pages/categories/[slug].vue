<template>
  <div class="category-page">
    <div v-if="pending" class="loading-container">
      <Icon name="mdi:loading" class="loading-icon" />
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <Icon name="mdi:alert-circle" class="error-icon" />
      <p>{{ error }}</p>
      <NuxtLink to="/" class="btn-back">返回首页</NuxtLink>
    </div>

    <template v-else>
      <header class="page-header">
        <h1 class="page-title">
          <Icon name="mdi:folder-outline" class="title-icon" />
          分类：{{ categoryName }}
        </h1>
        <p class="page-description" v-if="articles && articles.length > 0">
          共 {{ articles.length }} 篇文章
        </p>
      </header>

      <div v-if="articles && articles.length > 0" class="articles-list">
        <article
          v-for="(article, index) in articles"
          :key="article.slug || article._id || index"
          class="article-card"
        >
          <NuxtLink :to="`/articles/${article.slug}`" class="article-link">
            <div class="article-cover" v-if="article.coverImage">
              <img :src="article.coverImage" :alt="article.title" loading="lazy" />
            </div>
            <div class="article-cover article-cover--placeholder" v-else>
              <Icon name="mdi:image-outline" class="placeholder-icon" />
            </div>

            <div class="article-content">
              <div class="article-header">
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-excerpt">{{ article.summary || '暂无摘要' }}</p>
              </div>
              
              <div class="article-meta">
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

      <div v-else class="empty-state">
        <Icon name="mdi:file-document-outline" class="empty-icon" />
        <p>该分类下暂无文章</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

// 获取该分类下的文章
const { data: articles, pending, error } = await useFetch(`/api/articles?category=${slug}`)

// 从第一篇文章中获取分类名称（如果有文章的话）
const categoryName = computed(() => {
  if (articles.value && articles.value.length > 0 && articles.value[0].category) {
    return articles.value[0].category.name
  }
  return slug
})

// 格式化日期
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.category-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
}

.loading-container,
.error-container,
.empty-state {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-secondary);
}

.loading-icon {
  animation: spin 1s linear infinite;
  font-size: 3rem;
}

.error-icon,
.empty-icon {
  font-size: 3rem;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.btn-back {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: var(--transition);
  margin-top: var(--spacing-md);
}

.btn-back:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.page-header {
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.title-icon {
  width: 32px;
  height: 32px;
}

.page-description {
  color: var(--text-secondary);
  font-size: 1rem;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.article-card {
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border-light);
  overflow: hidden;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.article-link {
  display: flex;
  text-decoration: none;
  color: inherit;
  min-height: 200px;
}

.article-cover {
  flex: 0 0 40%;
  min-height: 200px;
  overflow: hidden;
  background: var(--bg-color);
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-cover--placeholder {
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
}

.meta-text {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .article-link {
    flex-direction: column;
    min-height: auto;
  }

  .article-cover {
    flex: 0 0 auto;
    height: 200px;
  }

  .article-content {
    padding: var(--spacing-md);
  }

  .article-title {
    font-size: 1.25rem;
  }
}
</style>

