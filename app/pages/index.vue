<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background"></div>
      <div class="hero-content">
        <h1 class="hero-title">{{ siteTitle }}</h1>
        <p class="hero-subtitle" ref="subtitleRef">
          {{ displayedText }}<span class="cursor">|</span>
        </p>
      </div>
      <!-- 向下滚动提示 -->
      <div class="scroll-indicator">
        <Icon name="mdi:chevron-down" class="scroll-arrow" />
      </div>
    </section>

    <!-- Main Content: Articles + Sidebar -->
    <div class="main-layout">
      <!-- Articles Section (Left 74%) -->
      <section class="articles-section">
      <h2 class="section-title">最新文章</h2>
      
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
            <div class="article-cover" v-if="article.coverImage">
              <NuxtImg
                :src="article.coverImage"
                :alt="article.title"
                loading="lazy"
                format="webp"
                width="600"
                quality="80"
                placeholder="blur"
              />
            </div>
            <div class="article-cover article-cover--placeholder" v-else>
              <Icon name="mdi:image-outline" class="placeholder-icon" />
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

      <!-- 查看更多按钮 -->
      <div class="more-articles">
        <NuxtLink to="/blog" class="more-btn">
          <span>查看更多</span>
          <Icon name="ri:arrow-right-line" class="btn-icon" />
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Sidebar from '~/components/common/Sidebar.vue'

const appConfig = useAppConfig()
const siteTitle = computed(() => appConfig?.site?.title ?? "Fomalhaut🥝")
const siteDescription = computed(() => appConfig?.site?.description ?? '欢迎来到我的博客 🍭🍭🍭')

// 使用标准 useFetch 获取文章列表，只显示最新 6 篇
const { data: articlesData, pending, error } = await useFetch('/api/articles', {
  query: { limit: 6 }
})

// 处理 API 返回的数据格式（可能是数组或分页对象）
const articles = computed(() => {
  if (!articlesData.value) return []
  // 如果返回的是分页对象，取 articles 字段；否则直接返回数组（向后兼容）
  return Array.isArray(articlesData.value) ? articlesData.value : articlesData.value.articles || []
})

// 打字机效果
const subtitleRef = ref<HTMLElement | null>(null)
const displayedText = ref('')
const texts = ['Future is now 🍭', '相信美好的事情即将发生 ✨']
let currentTextIndex = 0
let currentCharIndex = 0
let isDeleting = false
let typingTimer: ReturnType<typeof setTimeout> | null = null

const typeWriter = () => {
  const currentText = texts[currentTextIndex]
  
  if (isDeleting) {
    // 删除模式：从后往前删除字符
    displayedText.value = currentText.substring(0, currentCharIndex - 1)
    currentCharIndex--
    
    if (currentCharIndex === 0) {
      // 删除完毕，切换到下一句
      isDeleting = false
      currentTextIndex = (currentTextIndex + 1) % texts.length
      typingTimer = setTimeout(typeWriter, 500) // 暂停 500ms 后开始下一句
      return
    }
    
    typingTimer = setTimeout(typeWriter, 50) // 删除速度较快
  } else {
    // 打字模式：逐个添加字符
    displayedText.value = currentText.substring(0, currentCharIndex + 1)
    currentCharIndex++
    
    if (currentCharIndex === currentText.length) {
      // 打完一句，暂停后开始删除
      isDeleting = true
      typingTimer = setTimeout(typeWriter, 2000) // 显示 2 秒后开始删除
      return
    }
    
    typingTimer = setTimeout(typeWriter, 100) // 打字速度
  }
}

onMounted(() => {
  // 延迟开始打字机效果
  setTimeout(() => {
    typeWriter()
  }, 500)
})

onUnmounted(() => {
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
})

// 统计数据（可以从 API 获取）
const stats = computed(() => ({
  articles: articles.value?.length || 0,
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
   首页容器
   ============================================ */
.home-page {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* ============================================
   Hero Section - 全屏背景图
   ============================================ */
.hero-section {
  position: relative;
  width: 100%;
  height: 100vh; /* 全屏高度，固定为 100vh */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-align: center;
  background: transparent; /* 确保不遮挡 body 背景图 */
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent; /* 完全透明，让 body 的背景图完全显示 */
  z-index: 0;

  /* 完全移除遮罩层，让背景图完全清晰可见 */
  /* 不再使用 ::after 伪元素 */
}

.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  padding: var(--spacing-xl);
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  color: #ffffff; /* 纯白色 */
  margin-bottom: var(--spacing-lg);
  line-height: 1.2;
  /* 增强文字阴影，多层阴影效果 */
  text-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.8),
    0 4px 16px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 0, 0, 0.4);
  animation: fadeInDown 0.8s ease;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #ffffff; /* 纯白色，更清晰 */
  margin: 0;
  line-height: 1.6;
  /* 增强文字阴影，多层阴影效果 */
  text-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.8),
    0 4px 16px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 0, 0, 0.4);
  min-height: 2em; /* 为打字机效果预留空间 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 500; /* 稍微加粗，更清晰 */
}

.cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: #ffffff; /* 纯白色 */
  text-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.8),
    0 4px 16px rgba(0, 0, 0, 0.6);
  font-weight: 700; /* 加粗光标，更明显 */
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* ============================================
   向下滚动提示
   ============================================ */
.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  animation: bounce 2s infinite;
}

.scroll-arrow {
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.8);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 1);
    transform: translateY(5px);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* ============================================
   主布局 - 双栏
   ============================================ */
.main-layout {
  display: grid;
  grid-template-columns: 74% 24%;
  gap: 2%;
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
  background: transparent; /* 布局容器透明，让背景图显示 */

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

/* ============================================
   文章区域
   ============================================ */
.articles-section {
  /* 左侧文章列表区域 - 样式继承自父容器 */
  /* 文章卡片本身已经有半透明背景 (--card-bg: rgba(255, 255, 255, 0.9)) */
  /* 区域本身保持透明，让背景图显示 */
  background: transparent;
}

.sidebar-section {
  /* 右侧侧边栏区域 */
  /* 侧边栏卡片本身已经有半透明背景 (--card-bg: rgba(255, 255, 255, 0.9)) */
  /* 区域本身保持透明，让背景图显示 */
  background: transparent;
  
  @media (max-width: 1024px) {
    order: -1; /* 移动端时侧边栏在上方 */
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
   文章列表
   ============================================ */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* ============================================
   文章卡片 - Butterfly 风格 Zig-Zag 布局
   ============================================ */
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

.article-card--top {
  border-left: 4px solid var(--primary-color);
}

.article-link {
  display: flex;
  text-decoration: none;
  color: inherit;
  min-height: 200px;
}

/* 左图右文布局 */
.article-card:not(.article-card--reverse) .article-link {
  flex-direction: row;
}

/* 右图左文布局（偶数项） */
.article-card--reverse .article-link {
  flex-direction: row-reverse;
}

/* ============================================
   文章封面
   ============================================ */
.article-cover {
  flex: 0 0 40%;
  min-height: 200px;
  overflow: hidden;
  background: var(--bg-color);
  position: relative;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.article-card:hover .article-cover img {
  transform: scale(1.1); /* 图片放大效果 */
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

/* ============================================
   置顶标签
   ============================================ */
.article-top-badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  z-index: 10;
  box-shadow: var(--shadow-sm);
}

.top-icon {
  width: 14px;
  height: 14px;
}

/* ============================================
   文章内容
   ============================================ */
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

/* ============================================
   文章元信息
   ============================================ */
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
   骨架屏 - 纯 CSS 实现
   ============================================ */
.loading-state {
  width: 100%;
}

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
  min-height: 200px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-cover {
  flex: 0 0 40%;
  min-height: 200px;
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
   分页
   ============================================ */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
}

.page-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  color: var(--text-color);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: var(--transition);
}

.page-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
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
  .hero-section {
    height: 100vh; /* 移动端也保持全屏 */
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
  
  .scroll-arrow {
    width: 24px;
    height: 24px;
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
    height: 200px;
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
}

/* ============================================
   查看更多按钮
   ============================================ */
.more-articles {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg) 0;
}

.more-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border: 1px solid var(--border-light);
  border-radius: var(--card-radius);
  color: var(--text-color);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);

  &:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);

    .btn-icon {
      transform: translateX(4px);
    }
  }
}

.btn-icon {
  width: 18px;
  height: 18px;
  transition: var(--transition);
}
</style>
