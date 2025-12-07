<template>
  <aside v-if="toc && toc.length > 0" class="article-toc">
    <div class="toc-header">
      <Icon name="mdi:format-list-bulleted" class="toc-icon" />
      <h3 class="toc-title">目录</h3>
    </div>
    <nav class="toc-nav">
      <ul class="toc-list">
        <li
          v-for="item in toc"
          :key="item.id"
          :class="['toc-item', `toc-item--level-${item.level}`, { 'toc-item--active': activeId === item.id }]"
        >
          <a
            :href="`#${item.id}`"
            class="toc-link"
            @click.prevent="scrollToHeading(item.id)"
          >
            {{ item.text }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TocItem {
  id: string
  text: string
  level: number
}

interface Props {
  toc: TocItem[]
}

const props = defineProps<Props>()

const activeId = ref<string>('')

// 平滑滚动到指定标题
const scrollToHeading = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offsetTop = element.offsetTop - 100 // 减去一些偏移量，避免被固定头部遮挡
    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
    activeId.value = id
  }
}

// 使用 IntersectionObserver 实现当前阅读位置高亮
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (typeof window === 'undefined' || !props.toc || props.toc.length === 0) return

  // 清理旧的 observer
  if (observer) {
    observer.disconnect()
  }

  // 创建新的 observer
  observer = new IntersectionObserver(
    (entries) => {
      // 找到当前最接近视口顶部的标题
      let currentEntry: IntersectionObserverEntry | null = null
      let maxRatio = -1

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio
          currentEntry = entry
        }
      })

      // 如果找到了当前可见的标题，更新 activeId
      if (currentEntry && currentEntry.target.id) {
        activeId.value = currentEntry.target.id
      }
    },
    {
      rootMargin: '-100px 0px -80% 0px', // 当标题进入视口顶部 100px 范围内时触发
      threshold: [0, 0.1, 0.5, 1]
    }
  )

  // 观察所有标题元素
  props.toc.forEach((item) => {
    const element = document.getElementById(item.id)
    if (element) {
      observer!.observe(element)
    }
  })
}

onMounted(() => {
  // 等待 DOM 渲染完成后再设置 observer
  setTimeout(() => {
    setupObserver()
  }, 100)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped lang="scss">
.article-toc {
  position: sticky;
  top: 100px; // 距离顶部 100px，避免被导航栏遮挡
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: var(--card-bg, #fff);
  border-radius: var(--radius-lg, 8px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
  padding: var(--spacing-lg, 20px);
  margin-left: var(--spacing-xl, 24px);
  width: 280px;
  flex-shrink: 0;

  // 移动端隐藏
  @media (max-width: 1024px) {
    display: none;
  }

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color, #e0e0e0);
    border-radius: 3px;

    &:hover {
      background: var(--text-secondary, #999);
    }
  }
}

.toc-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-md, 16px);
  padding-bottom: var(--spacing-md, 16px);
  border-bottom: 1px solid var(--border-light, #f0f0f0);
}

.toc-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-color, #49b1f5);
}

.toc-title {
  font-size: var(--font-size-lg, 18px);
  font-weight: 600;
  color: var(--text-color, #333);
  margin: 0;
}

.toc-nav {
  // 导航样式
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  margin-bottom: var(--spacing-xs, 4px);
  line-height: 1.6;

  &--level-1 {
    font-weight: 600;
    font-size: var(--font-size-base, 16px);
    padding-left: 0;
  }

  &--level-2 {
    font-weight: 500;
    font-size: var(--font-size-sm, 14px);
    padding-left: var(--spacing-md, 16px);
  }

  &--level-3 {
    font-weight: 400;
    font-size: var(--font-size-sm, 14px);
    padding-left: var(--spacing-lg, 24px);
    color: var(--text-secondary, #666);
  }

  &--active {
    .toc-link {
      color: var(--primary-color, #49b1f5);
      font-weight: 600;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: -12px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: var(--primary-color, #49b1f5);
        border-radius: 2px;
      }
    }
  }
}

.toc-link {
  display: block;
  color: var(--text-color, #333);
  text-decoration: none;
  transition: var(--transition, all 0.3s ease);
  padding: var(--spacing-xs, 4px) 0;
  word-break: break-word;

  &:hover {
    color: var(--primary-color, #49b1f5);
  }
}
</style>

