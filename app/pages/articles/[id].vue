<template>
  <div class="article-page">
    <div v-if="pending" class="loading-container">
      <Icon name="mdi:loading" class="loading-icon" />
      <p>加载中...</p>
    </div>

    <div v-else-if="error || !article" class="error-container">
      <Icon name="mdi:alert-circle" class="error-icon" />
      <h1>文章不存在或加载失败</h1>
      <p>{{ error?.message || '无法找到该文章' }}</p>
      <NuxtLink to="/" class="btn-back">返回首页</NuxtLink>
    </div>

    <template v-else>
      <div class="article-wrapper">
        <div class="article-container">
          <article class="article-content">
            <header class="article-header">
          <h1 class="article-title">{{ article.title }}</h1>
          
          <div class="article-meta-top">
            <span class="meta-item" v-if="article.category">
              <Icon name="mdi:folder-outline" class="meta-icon" />
              <NuxtLink :to="`/categories/${article.category.slug}`" class="meta-link">
                {{ article.category.name }}
              </NuxtLink>
            </span>
            <span class="meta-item">
              <Icon name="mdi:calendar-outline" class="meta-icon" />
              <time :datetime="article.publishedAt">{{ formatDate(article.publishedAt) }}</time>
            </span>
            <span class="meta-item">
              <Icon name="mdi:eye-outline" class="meta-icon" />
              <span>{{ article.views || 0 }} 次阅读</span>
            </span>
          </div>

          <div class="article-tags" v-if="article.tags && article.tags.length > 0">
            <NuxtLink
              v-for="tag in article.tags"
              :key="tag.slug"
              :to="`/tags/${tag.slug}`"
              class="tag-item"
            >
              <Icon name="mdi:tag-outline" class="tag-icon" />
              {{ tag.name }}
            </NuxtLink>
          </div>
        </header>

        <div class="article-body markdown-body" v-html="article.content"></div>

        <footer class="article-footer">
          <div class="footer-divider"></div>
          <div class="footer-meta">
            <div class="footer-item">
              <Icon name="mdi:calendar-check" class="footer-icon" />
              <span>最后更新于 {{ formatDate(article.updatedAt) }}</span>
            </div>
          </div>
        </footer>
          </article>
        </div>

        <!-- 右侧目录 -->
        <ArticleToc v-if="article?.toc && article.toc.length > 0" :toc="article.toc" />
      </div>

      <nav class="article-navigation">
        <NuxtLink 
          v-if="prevArticle" 
          :to="`/articles/${prevArticle.slug}`" 
          class="nav-card nav-card--prev"
        >
          <div class="nav-card__icon"><Icon name="mdi:chevron-left" /></div>
          <div class="nav-card__content">
            <div class="nav-card__label">上一篇</div>
            <div class="nav-card__title">{{ prevArticle.title }}</div>
          </div>
        </NuxtLink>
        <div v-else class="nav-card nav-card--empty"></div>

        <NuxtLink 
          v-if="nextArticle" 
          :to="`/articles/${nextArticle.slug}`" 
          class="nav-card nav-card--next"
        >
          <div class="nav-card__content">
            <div class="nav-card__label">下一篇</div>
            <div class="nav-card__title">{{ nextArticle.title }}</div>
          </div>
          <div class="nav-card__icon"><Icon name="mdi:chevron-right" /></div>
        </NuxtLink>
        <div v-else class="nav-card nav-card--empty"></div>
      </nav>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

// 1. 获取数据
const { data, pending, error } = await useFetch(`/api/articles/${route.params.slug || route.params.id}`)

// 2. 正确提取数据（API 返回 { article: {...}, prevArticle: ..., nextArticle: ... } 结构）
const article = computed(() => data.value?.article || null)
const prevArticle = computed(() => data.value?.prevArticle || null)
const nextArticle = computed(() => data.value?.nextArticle || null)

// 3. 日期格式化
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* ============================================
   文章页面容器
   ============================================ */
.article-page {
  width: 100%;
  max-width: 1400px; /* 调整为双栏布局的宽度 */
  margin: 0 auto;
  padding: var(--spacing-lg) var(--spacing-md);
}

/* ============================================
   Loading & Error
   ============================================ */
.loading-container, .error-container {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: var(--text-secondary);
}
.loading-icon, .error-icon { font-size: 3rem; }
.loading-icon { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

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

/* ============================================
   文章卡片样式
   ============================================ */
.article-wrapper {
  display: flex;
  gap: var(--spacing-xl);
  align-items: flex-start;
  margin-bottom: 40px;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

.article-container {
  flex: 1;
  min-width: 0; /* 防止 flex 子元素溢出 */
}

.article-content {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 40px;
  box-shadow: var(--shadow-sm);
}

/* 头部信息 */
.article-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}
.article-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 16px;
  line-height: 1.4;
}
.article-meta-top {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}
.meta-item { display: flex; align-items: center; gap: 6px; }
.meta-link { color: inherit; text-decoration: none; transition: 0.2s; }
.meta-link:hover { color: var(--primary-color); }

/* 标签 */
.article-tags {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
.tag-item {
  font-size: 0.85rem;
  padding: 4px 10px;
  background: rgba(73, 177, 245, 0.1);
  color: var(--primary-color);
  border-radius: 6px;
  text-decoration: none;
  transition: 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.tag-item:hover { background: var(--primary-color); color: #fff; }

/* ============================================
   正文样式 (Deep Selectors for Shiki & Markdown)
   ============================================ */
.article-body {
  line-height: 1.8;
  color: var(--text-color);
  font-size: 1.05rem;
}

/* Shiki 代码块核心样式 */
:deep(pre.shiki) {
  background-color: #282c34 !important; /* One Dark Pro 背景 */
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
}

:deep(code) {
  font-family: inherit;
}

/* 图片自适应 */
:deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

/* 标题样式 */
:deep(h1), :deep(h2), :deep(h3) {
  color: var(--text-color);
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}
:deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  border-bottom: 1px dashed var(--primary-color);
}

/* 文章底部 */
.article-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-light);
}

.footer-divider {
  margin-bottom: 16px;
}

.footer-meta {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-icon {
  width: 16px;
  height: 16px;
}

/* ============================================
   底部导航
   ============================================ */
.article-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.nav-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: var(--card-bg);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border-light);
}
.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}
.nav-card--next { flex-direction: row-reverse; text-align: right; }
.nav-card__content { flex: 1; margin: 0 12px; }
.nav-card__label { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 4px; }
.nav-card__title { font-weight: 600; font-size: 0.95rem; }
.nav-card--empty { visibility: hidden; }

@media (max-width: 768px) {
  .article-container { padding: 20px; }
  .article-title { font-size: 1.5rem; }
  .article-navigation { grid-template-columns: 1fr; }
}
</style>
