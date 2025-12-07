<template>
  <div class="gallery-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="ri:gallery-view-2" class="title-icon" />
        图集
      </h1>
      <p class="page-subtitle">定格美好瞬间 📸</p>
    </div>

    <!-- Gallery Grid -->
    <div class="gallery-container">
      <!-- 提示信息（如果所有图片都加载失败？-->
      <div v-if="allImagesError" class="gallery-notice">
        <Icon name="ri:image-line" class="notice-icon" />
        <h3>图片尚未上传</h3>
        <p>请将图片文件复制到 <code>public/gallery/</code> 目录下：</p>
        <ul class="notice-list">
          <li><code>01.jpg</code></li>
          <li><code>02.jpg</code></li>
          <li><code>03.jpg</code></li>
          <li><code>04.jpg</code></li>
          <li><code>05.jpg</code></li>
          <li><code>06.jpg</code></li>
        </ul>
      </div>
      
      <ClientOnly>
        <viewer ref="viewerRef">
          <div class="gallery-grid">
            <div
              v-for="(photo, index) in photos"
              :key="index"
              class="gallery-item"
            >
              <NuxtImg
                :src="photo.src"
                :alt="photo.desc"
                class="gallery-image"
                loading="lazy"
                format="webp"
                width="600"
                @error="handleImageError($event, index)"
                :class="{ 'image-error': photo.hasError }"
              />
              <div v-if="photo.hasError" class="gallery-error-overlay">
                <Icon name="ri:image-line" class="error-icon" />
                <p>图片未找到</p>
              </div>
              <div v-else class="gallery-overlay">
                <p class="gallery-desc">{{ photo.desc }}</p>
              </div>
            </div>
          </div>
        </viewer>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const viewerRef = ref()

// 图片数据
const photos = reactive([
  { src: '/gallery/01.jpg', desc: 'Photo 1', hasError: false },
  { src: '/gallery/02.jpg', desc: 'Photo 2', hasError: false },
  { src: '/gallery/03.jpg', desc: 'Photo 3', hasError: false },
  { src: '/gallery/04.jpg', desc: 'Photo 4', hasError: false },
  { src: '/gallery/05.jpg', desc: 'Photo 5', hasError: false },
  { src: '/gallery/06.jpg', desc: 'Photo 6', hasError: false }
])

// 处理图片加载错误
const handleImageError = (event: Event, index: number) => {
  const img = event.target as HTMLImageElement
  photos[index].hasError = true
  // 使用占位图片
  img.src = '/images/default-cover.svg'
  img.onerror = null // 防止无限循环
}

// 检查是否所有图片都加载失败
const allImagesError = computed(() => {
  return photos.every(photo => photo.hasError)
})

// SEO
useHead({
  title: '图集',
  meta: [
    { name: 'description', content: '图集 - 定格美好瞬间 📸' }
  ]
})
</script>

<style scoped lang="scss">
.gallery-page {
  max-width: 1400px;
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
   Gallery Container
   ============================================ */
.gallery-container {
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

/* ============================================
   Gallery Grid (瀑布流布局)
   ============================================ */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

.gallery-item {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  background: var(--bg-color);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    
    .gallery-image {
      transform: scale(1.05);
    }
    
    .gallery-overlay {
      opacity: 1;
    }
  }
}

.gallery-image {
  width: 100%;
  height: auto;
  min-height: 200px;
  display: block;
  transition: var(--transition);
  object-fit: cover;
  background: var(--bg-color);
  
  &.image-error {
    opacity: 0.5;
    background: var(--bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: var(--spacing-lg);
  opacity: 0;
  transition: var(--transition);
}

.gallery-desc {
  color: white;
  font-size: var(--font-size-sm);
  margin: 0;
  text-align: center;
}

.gallery-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-secondary);
  gap: var(--spacing-sm);
}

.error-icon {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.gallery-notice {
  text-align: center;
  padding: calc(var(--spacing-xl) * 2);
  color: var(--text-secondary);
}

.notice-icon {
  width: 64px;
  height: 64px;
  color: var(--text-light);
  opacity: 0.5;
  margin-bottom: var(--spacing-md);
}

.gallery-notice h3 {
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
}

.gallery-notice p {
  margin-bottom: var(--spacing-md);
}

.gallery-notice code {
  background: var(--bg-color);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--primary-color);
  border: 1px solid var(--border-light);
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-lg) 0 0 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-sm);
}

.notice-list li {
  margin: 0;
}
</style>
