<template>
  <article class="article-card" :class="{ 'article-card--reverse': reverse }">
    <!-- 封面图 -->
    <div class="article-card__image">
      <NuxtLink :to="`/blog/${article.slug || article.id}`" class="image-link">
        <NuxtImg
          :src="article.cover || '/images/default-cover.svg'"
          :alt="article.title"
          class="cover-image"
          loading="lazy"
          format="webp"
          quality="80"
          placeholder="blur"
        />
      </NuxtLink>
    </div>

    <!-- 内容区 -->
    <div class="article-card__content">
      <!-- 标题 -->
      <h2 class="article-card__title">
        <NuxtLink :to="`/blog/${article.slug || article.id}`" class="title-link">
          {{ article.title }}
        </NuxtLink>
      </h2>

      <!-- 元信息 -->
      <div class="article-card__meta">
        <span class="meta-item">
          <Icon name="mdi:calendar-outline" class="meta-icon" />
          <time :datetime="article.date">{{ formatDate(article.date) }}</time>
        </span>
        <span class="meta-item" v-if="article.category">
          <Icon name="mdi:folder-outline" class="meta-icon" />
          <NuxtLink :to="`/categories/${article.category}`" class="category-link">
            {{ article.category }}
          </NuxtLink>
        </span>
      </div>

      <!-- 摘要 -->
      <p class="article-card__excerpt">
        {{ article.excerpt || article.content?.substring(0, 150) + '...' }}
      </p>

      <!-- 分类标签 -->
      <div class="article-card__tags" v-if="article.tags && article.tags.length > 0">
        <NuxtLink
          v-for="tag in article.tags"
          :key="tag"
          :to="`/tags/${tag}`"
          class="tag-item"
        >
          <Icon name="mdi:tag-outline" class="tag-icon" />
          {{ tag }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
interface Article {
  id: string | number
  title: string
  cover?: string
  date: string
  category?: string
  tags?: string[]
  excerpt?: string
  content?: string
}

interface Props {
  article: Article
  reverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  reverse: false
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped lang="scss">
.article-card {
  display: flex;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition);
  margin-bottom: var(--spacing-lg);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  &--reverse {
    flex-direction: row-reverse;
  }
}

.article-card__image {
  flex: 0 0 40%;
  overflow: hidden;
  position: relative;

  .image-link {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--transition);
  }

  &:hover .cover-image {
    transform: scale(1.05);
  }
}

.article-card__content {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-card__title {
  margin-bottom: var(--spacing-md);
  font-size: 1.5rem;
  line-height: 1.4;

  .title-link {
    color: var(--text-color);
    transition: var(--transition);

    &:hover {
      color: var(--primary-color);
    }
  }
}

.article-card__meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  flex-wrap: wrap;
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

.category-link {
  color: var(--text-secondary);
  transition: var(--transition);

  &:hover {
    color: var(--primary-color);
  }
}

.article-card__excerpt {
  flex: 1;
  color: var(--text-secondary);
  line-height: var(--line-height);
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: auto;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(73, 177, 245, 0.1);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  transition: var(--transition);

  &:hover {
    background: rgba(73, 177, 245, 0.2);
    transform: translateY(-2px);
  }
}

.tag-icon {
  width: 14px;
  height: 14px;
}

// ============================================
// 响应式设计
// ============================================
@media (max-width: 768px) {
  .article-card {
    flex-direction: column;

    &--reverse {
      flex-direction: column;
    }
  }

  .article-card__image {
    flex: 0 0 auto;
    height: 200px;
  }

  .article-card__content {
    padding: var(--spacing-md);
  }

  .article-card__title {
    font-size: 1.25rem;
  }
}
</style>

