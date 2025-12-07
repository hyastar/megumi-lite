<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="search-modal" @click.self="close">
        <div class="search-modal-content" @click.stop>
          <div class="search-header">
            <Icon name="ri:search-line" class="search-icon" />
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索文章、标签、分类..."
              @keydown.esc="close"
              @input="handleSearch"
            />
            <button class="search-close" @click="close" aria-label="关闭搜索">
              <Icon name="ri:close-line" class="close-icon" />
            </button>
          </div>
          
          <!-- 搜索结果 -->
          <div class="search-results">
            <!-- 占位符 -->
            <div v-if="!searchQuery.trim()" class="search-placeholder">
              <Icon name="ri:search-line" class="placeholder-icon" />
              <p>输入关键词开始搜索...</p>
            </div>
            
            <!-- 加载状态 -->
            <div v-else-if="isSearching" class="search-loading">
              <Icon name="mdi:loading" class="loading-icon" />
              <p>搜索中...</p>
            </div>
            
            <!-- 搜索结果列表 -->
            <div v-else-if="searchResults.length > 0" class="results-list">
              <NuxtLink
                v-for="(result, index) in searchResults"
                :key="index"
                :to="result.path"
                class="result-item"
                @click="close"
              >
                <div class="result-header">
                  <Icon :name="result.icon || 'ri:file-text-line'" class="result-icon" />
                  <h3 class="result-title" v-html="highlightText(result.title, searchQuery)"></h3>
                </div>
                <p class="result-excerpt" v-html="highlightText(result.excerpt, searchQuery)"></p>
                <div class="result-meta">
                  <span class="result-meta-item" v-if="result.category">
                    <Icon name="ri:folder-line" class="meta-icon" />
                    {{ result.category }}
                  </span>
                  <span class="result-meta-item" v-if="result.date">
                    <Icon name="ri:calendar-line" class="meta-icon" />
                    {{ result.date }}
                  </span>
                </div>
              </NuxtLink>
            </div>
            
            <!-- 无结果 -->
            <div v-else class="search-empty">
              <Icon name="ri:file-search-line" class="empty-icon" />
              <p>未找到相关结果</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchInput = ref<HTMLInputElement | null>(null)
const searchQuery = ref('')
const isSearching = ref(false)

// 模拟搜索结果（假数据）
const mockResults = [
  {
    title: 'Vue 3 组合式 API 完全指南',
    excerpt: '深入理解 Vue 3 的组合式 API，包括 setup、ref、reactive 等核心概念...',
    path: '/articles/vue3-composition-api',
    category: '前端开发',
    date: '2024-01-15',
    icon: 'ri:file-text-line'
  },
  {
    title: 'TypeScript 类型系统详解',
    excerpt: '全面介绍 TypeScript 的类型系统，包括基础类型、泛型、工具类型等...',
    path: '/articles/typescript-types',
    category: '编程语言',
    date: '2024-01-10',
    icon: 'ri:file-text-line'
  },
  {
    title: 'Nuxt 3 服务端渲染实践',
    excerpt: '学习如何使用 Nuxt 3 构建高性能的服务端渲染应用...',
    path: '/articles/nuxt3-ssr',
    category: '前端框架',
    date: '2024-01-05',
    icon: 'ri:file-text-line'
  },
  {
    title: 'CSS Grid 布局完全指南',
    excerpt: '掌握 CSS Grid 布局，创建复杂的响应式网页布局...',
    path: '/articles/css-grid',
    category: 'CSS',
    date: '2023-12-28',
    icon: 'ri:file-text-line'
  },
  {
    title: 'JavaScript 异步编程',
    excerpt: '深入理解 Promise、async/await 等异步编程模式...',
    path: '/articles/js-async',
    category: 'JavaScript',
    date: '2023-12-20',
    icon: 'ri:file-text-line'
  }
]

// 搜索结果
const searchResults = ref<typeof mockResults>([])

// 高亮匹配文本
const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

// 执行搜索
const handleSearch = async () => {
  const query = searchQuery.value.trim()
  
  if (!query) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  
  // 模拟搜索延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 简单的文本匹配搜索
  const results = mockResults.filter(item => {
    const searchText = `${item.title} ${item.excerpt} ${item.category}`.toLowerCase()
    return searchText.includes(query.toLowerCase())
  })
  
  searchResults.value = results
  isSearching.value = false
}

// 当模态框打开时，自动聚焦输入框
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await nextTick()
    searchInput.value?.focus()
  } else {
    searchQuery.value = ''
    searchResults.value = []
  }
})

// 监听搜索查询变化
watch(searchQuery, () => {
  handleSearch()
})

const close = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.search-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.search-modal-content {
  width: 90%;
  max-width: 700px;
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.search-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
  position: relative;
}

.search-icon {
  width: 24px;
  height: 24px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-color);
  font-size: 1.25rem;
  font-family: inherit;
  padding: var(--spacing-sm) 0;
  border-bottom: 2px solid var(--border-light);
  transition: var(--transition);
  
  &:focus {
    border-bottom-color: var(--primary-color);
  }
  
  &::placeholder {
    color: var(--text-secondary);
  }
}

.search-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: var(--transition);
  
  &:hover {
    background: var(--border-light);
    color: var(--text-color);
  }
}

.close-icon {
  width: 20px;
  height: 20px;
}

.search-results {
  min-height: 200px;
  max-height: 60vh;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.search-placeholder,
.search-loading,
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-xl) * 2);
  gap: var(--spacing-md);
  color: var(--text-secondary);
  text-align: center;
}

.placeholder-icon,
.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--text-light);
  opacity: 0.5;
}

.loading-icon {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.result-item {
  display: block;
  padding: var(--spacing-lg);
  background: var(--bg-color);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
  
  &:hover {
    transform: translateX(4px);
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.result-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.result-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
  line-height: 1.4;
}

.result-excerpt {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: var(--spacing-sm) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.result-meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.highlight {
  background: var(--primary-color);
  color: white;
  padding: 2px 4px;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .search-modal-content,
.modal-leave-active .search-modal-content {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .search-modal-content,
.modal-leave-to .search-modal-content {
  opacity: 0;
  transform: scale(0.9);
}
</style>
