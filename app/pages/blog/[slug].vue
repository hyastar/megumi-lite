<template>
  <div class="article-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <Icon name="mdi:loading" class="loading-icon" />
      <p>加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <Icon name="mdi:alert-circle" class="error-icon" />
      <p>{{ error }}</p>
      <NuxtLink to="/" class="btn-back">返回首页</NuxtLink>
    </div>

    <!-- Article Content -->
    <template v-else-if="article">
      <!-- Hero Header -->
      <section 
        class="article-hero" 
        :style="{ backgroundImage: `url(${article.cover || '/images/default-cover.svg'})` }"
        ref="heroRef"
      >
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <h1 class="hero-title">{{ article.title }}</h1>
          <div class="hero-meta">
            <span class="meta-item">
              <Icon name="mdi:calendar-outline" class="meta-icon" />
              <time :datetime="article.date">{{ formatDate(article.date) }}</time>
            </span>
            <span class="meta-item" v-if="article.wordCount">
              <Icon name="mdi:file-document-outline" class="meta-icon" />
              {{ article.wordCount }} 字
            </span>
            <span class="meta-item" v-if="article.readTime">
              <Icon name="mdi:clock-outline" class="meta-icon" />
              {{ article.readTime }} 分钟
            </span>
          </div>
        </div>
      </section>

      <!-- 文章容器 -->
      <div class="article-wrapper">
        <div class="article-container">
          <article class="article-content">
          <!-- 文章元信息 -->
          <div class="article-meta">
          <div class="meta-row" v-if="article.category || article.tags">
            <span class="meta-tag" v-if="article.category">
              <Icon name="mdi:folder-outline" class="tag-icon" />
              <NuxtLink :to="`/categories/${article.category}`" class="tag-link">
                {{ article.category }}
              </NuxtLink>
            </span>
            <span 
              class="meta-tag" 
              v-for="tag in article.tags" 
              :key="tag"
            >
              <Icon name="mdi:tag-outline" class="tag-icon" />
              <NuxtLink :to="`/tags/${tag}`" class="tag-link">
                {{ tag }}
              </NuxtLink>
            </span>
          </div>
        </div>

        <!-- 文章正文 -->
        <div class="article-body markdown-body" v-html="articleContent"></div>

        <!-- 文章底部信息 -->
        <div class="article-footer">
          <div class="footer-divider"></div>
          <div class="footer-meta">
            <div class="footer-item">
              <Icon name="mdi:calendar-outline" class="footer-icon" />
              <span>发布于 {{ formatDate(article.date) }}</span>
            </div>
            <div class="footer-item" v-if="article.updatedAt">
              <Icon name="mdi:update" class="footer-icon" />
              <span>更新于 {{ formatDate(article.updatedAt) }}</span>
            </div>
          </div>
        </div>
        </article>

        <!-- 上一篇/下一篇导航 -->
        <nav class="article-navigation">
          <NuxtLink 
          v-if="prevArticle" 
          :to="`/blog/${prevArticle.slug}`" 
          class="nav-card nav-card--prev"
        >
          <div class="nav-card__icon">
            <Icon name="mdi:chevron-left" />
          </div>
          <div class="nav-card__content">
            <div class="nav-card__label">上一篇</div>
            <div class="nav-card__title">{{ prevArticle.title }}</div>
          </div>
          </NuxtLink>
          <div v-else class="nav-card nav-card--empty"></div>

          <NuxtLink 
          v-if="nextArticle" 
          :to="`/blog/${nextArticle.slug}`" 
          class="nav-card nav-card--next"
        >
          <div class="nav-card__content">
            <div class="nav-card__label">下一篇</div>
            <div class="nav-card__title">{{ nextArticle.title }}</div>
          </div>
          <div class="nav-card__icon">
            <Icon name="mdi:chevron-right" />
          </div>
          </NuxtLink>
          <div v-else class="nav-card nav-card--empty"></div>
        </nav>

        <!-- 评论区 -->
        <div class="article-comments" id="artalk-comments">
          <div class="comments-header">
            <h3 class="comments-title">
              <Icon name="mdi:comment-outline" class="comments-icon" />
              评论
            </h3>
          </div>
          <div class="comments-container">
            <!-- Artalk 评论系统将在这里渲染 -->
            <div class="comments-placeholder">
              <p>评论区加载中...</p>
            </div>
          </div>
        </div>
        </div>
        
        <!-- 右侧目录 -->
        <ArticleToc v-if="article.toc && article.toc.length > 0" :toc="article.toc" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface TocItem {
  id: string
  text: string
  level: number
}

interface Article {
  id: string | number
  slug: string
  title: string
  cover?: string
  date: string
  updatedAt?: string
  category?: string
  tags?: string[]
  content: string
  wordCount?: number
  readTime?: number
  toc?: TocItem[]
}

const route = useRoute()
const heroRef = ref<HTMLElement | null>(null)
const parallaxOffset = ref(0)

// 从 API 获取文章数据
const article = ref<Article | null>(null)
const prevArticle = ref<Article | null>(null)
const nextArticle = ref<Article | null>(null)
const loading = ref(true)
const error = ref('')

// 加载文章数据
const loadArticle = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch(`/api/blog/${route.params.slug}`)
    
    if (response.success && response.data) {
      const data = response.data
      article.value = {
        id: data.article._id || data.article.id,
        slug: data.article.slug,
        title: data.article.title,
        cover: data.article.cover,
        date: data.article.createdAt,
        updatedAt: data.article.updatedAt,
        category: data.article.category,
        tags: data.article.tags || [],
        content: data.article.content,
        wordCount: data.article.content?.length || 0,
        readTime: Math.ceil((data.article.content?.length || 0) / 300), // 假设每分钟阅读 300 字
        toc: data.article.toc || []
      }
      
      prevArticle.value = data.prevArticle ? {
        slug: data.prevArticle.slug,
        title: data.prevArticle.title
      } : null
      
      nextArticle.value = data.nextArticle ? {
        slug: data.nextArticle.slug,
        title: data.nextArticle.title
      } : null
    }
  } catch (err: any) {
    error.value = err.data?.message || err.message || '加载文章失败'
    console.error('Error loading article:', err)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 处理文章内容（Markdown 转 HTML）
const articleContent = computed(() => {
  if (!article.value?.content) return ''
  // 这里应该使用 Markdown 解析器，暂时直接返回
  // 实际项目中应该使用 marked、markdown-it 或 @nuxt/content
  return article.value.content
})

// 视差滚动效果
const handleScroll = () => {
  if (!heroRef.value) return
  
  // 移动设备上禁用视差效果以提升性能
  const isMobile = window.innerWidth <= 768
  if (isMobile) return
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const heroHeight = heroRef.value.offsetHeight
  
  if (scrollTop < heroHeight * 2) {
    // 视差效果：背景图移动速度是滚动速度的一半
    parallaxOffset.value = scrollTop * 0.5
    heroRef.value.style.transform = `translateY(${parallaxOffset.value}px)`
  }
}

onMounted(() => {
  loadArticle()
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // 初始化 Artalk 评论系统（如果需要）
  // 这里可以添加 Artalk 的初始化代码
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 实际项目中应该从 API 获取文章数据
// const { data: article } = await useFetch(`/api/articles/${route.params.slug}`)
</script>

<style scoped lang="scss">
.article-page {
  min-height: 100vh;
}

.loading-container,
.error-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  text-align: center;
}

.loading-icon {
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  color: var(--primary-color);
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #f48771;
}

.btn-back {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: var(--transition);

  &:hover {
    background: var(--primary-hover);
    transform: translateY(-2px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// ============================================
// Hero Header
// ============================================
.article-hero {
  position: relative;
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  will-change: transform;
  // 视差滚动效果通过 JavaScript 控制 transform
  
  @media (max-width: 768px) {
    height: 300px;
    // 移动设备上使用固定背景以提升性能
    background-attachment: scroll;
  }
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 900px;
  padding: 0 var(--spacing-md);
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.hero-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  font-size: var(--font-size-base);
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-icon {
  width: 18px;
  height: 18px;
}

// ============================================
// 文章容器
// ============================================
.article-wrapper {
  display: flex;
  max-width: 1400px;
  margin: -50px auto 0;
  padding: 0 var(--spacing-md);
  position: relative;
  z-index: 10;
  gap: var(--spacing-xl);
  align-items: flex-start;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
  
  @media (max-width: 768px) {
    margin-top: -30px;
  }
}

.article-container {
  flex: 1;
  min-width: 0; // 防止 flex 子元素溢出
  position: relative;
}

.article-content {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 40px;
  margin-bottom: var(--spacing-xl);
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    margin-top: -30px;
  }
}

.article-meta {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-light);
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: rgba(73, 177, 245, 0.1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  transition: var(--transition);
  
  &:hover {
    background: rgba(73, 177, 245, 0.2);
    transform: translateY(-2px);
  }
}

.tag-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-color);
}

.tag-link {
  color: var(--primary-color);
  font-weight: 500;
  
  &:hover {
    color: var(--primary-hover);
  }
}

// ============================================
// 文章正文
// ============================================
.article-body {
  color: var(--text-color);
  line-height: var(--line-height);
  font-size: var(--font-size-base);
  
  // 确保图片响应式
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: var(--radius-md);
    margin: var(--spacing-lg) 0;
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
    
    &:hover {
      box-shadow: var(--shadow-md);
    }
  }
  
  // 代码块样式已在全局样式中定义
  :deep(pre.shiki) {
    margin: var(--spacing-lg) 0;
    position: relative;
  }
  
  // 链接样式
  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: var(--transition);
    
    &:hover {
      color: var(--primary-hover);
      border-bottom-color: var(--primary-hover);
    }
  }
  
  // 标题样式
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    color: var(--text-color);
    font-weight: 600;
    margin-top: var(--spacing-xl);
    margin-bottom: var(--spacing-md);
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  // 引用块
  :deep(blockquote) {
    border-left-color: var(--primary-color);
    background: rgba(73, 177, 245, 0.05);
  }
  
  // 表格
  :deep(table) {
    border-color: var(--border-color);
    
    th {
      background: rgba(73, 177, 245, 0.05);
    }
  }
}

// ============================================
// 文章底部
// ============================================
.article-footer {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
}

.footer-divider {
  height: 1px;
  background: var(--border-light);
  margin-bottom: var(--spacing-lg);
}

.footer-meta {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.footer-icon {
  width: 16px;
  height: 16px;
}

// ============================================
// 上一篇/下一篇导航
// ============================================
.article-navigation {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.nav-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  text-decoration: none;
  color: var(--text-color);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    color: var(--primary-color);
  }
  
  &--prev {
    text-align: left;
  }
  
  &--next {
    text-align: right;
    flex-direction: row-reverse;
  }
  
  &--empty {
    visibility: hidden;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
}

.nav-card__icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(73, 177, 245, 0.1);
  border-radius: 50%;
  color: var(--primary-color);
  font-size: 1.5rem;
  transition: var(--transition);
  
  .nav-card:hover & {
    background: rgba(73, 177, 245, 0.2);
    transform: scale(1.1);
  }
}

.nav-card__content {
  flex: 1;
  min-width: 0;
}

.nav-card__label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.nav-card__title {
  font-size: var(--font-size-base);
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

// ============================================
// 评论区
// ============================================
.article-comments {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.comments-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.comments-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.comments-icon {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.comments-container {
  min-height: 200px;
}

.comments-placeholder {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  
  p {
    margin: 0;
  }
}
</style>

