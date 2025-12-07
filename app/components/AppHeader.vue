<template>
  <header class="app-header" :class="{ 'nav-visible': isScrolled }">
    <div class="header-container">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        {{ siteTitle }}
      </NuxtLink>

      <!-- Desktop Navigation Menu -->
      <nav class="nav-menu">
        <ul class="nav-list">
          <li 
            v-for="(item, index) in menuItems" 
            :key="item.name || index" 
            class="nav-item group" 
            :class="{ 'has-dropdown': item.children && item.children.length > 0 }"
          >
            <!-- Menu item with children (dropdown) -->
            <template v-if="item.children && item.children.length > 0">
              <span class="nav-link">
                <Icon v-if="item.icon" :name="item.icon" class="nav-icon" />
                {{ item.name }}
              </span>
              <ul class="dropdown-menu">
                <li v-for="(child, childIndex) in item.children" :key="child.name || childIndex">
                  <NuxtLink :to="child.path || '#'" class="dropdown-link">
                    <Icon v-if="child.icon" :name="child.icon" class="dropdown-icon" />
                    {{ child.name }}
                  </NuxtLink>
                </li>
              </ul>
            </template>

            <!-- Simple menu item (no children) -->
            <NuxtLink v-else :to="item.path || '#'" class="nav-link">
              <Icon v-if="item.icon" :name="item.icon" class="nav-icon" />
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Right Actions -->
      <div class="header-actions">
        <ClientOnly>
          <!-- Search Button -->
          <button 
            class="action-btn" 
            @click="openSearch"
            aria-label="搜索"
            title="搜索"
          >
            <Icon name="ri:search-line" class="action-icon" />
          </button>

          <!-- Theme Toggle -->
          <button 
            class="action-btn" 
            @click="toggleColorMode"
            aria-label="切换主题"
            :title="colorMode === 'dark' ? '切换到浅色模式' : '切换到深色模式'"
          >
            <Icon 
              :name="colorMode === 'dark' ? 'ri:sun-line' : 'ri:moon-line'" 
              class="action-icon" 
            />
          </button>

          <!-- Mobile Menu Toggle -->
          <button 
            class="mobile-menu-toggle action-btn" 
            @click="toggleMobileMenu"
            aria-label="Toggle menu"
          >
            <Icon :name="mobileMenuOpen ? 'ri:close-line' : 'ri:menu-line'" class="action-icon" />
          </button>
        </ClientOnly>
      </div>
    </div>

    <!-- Mobile Menu -->
    <ClientOnly>
      <nav class="mobile-menu" v-if="mobileMenuOpen">
        <ul class="mobile-nav-list">
          <li 
            v-for="(item, index) in menuItems" 
            :key="item.name || index" 
            class="mobile-nav-item"
            :class="{ 'has-children': item.children && item.children.length > 0 }"
          >
            <!-- 有子菜单的项 -->
            <template v-if="item.children && item.children.length > 0">
              <div class="mobile-nav-link mobile-nav-parent">
                <Icon v-if="item.icon" :name="item.icon" class="mobile-nav-icon" />
                {{ item.name }}
              </div>
              <ul class="mobile-nav-children">
                <li v-for="(child, childIndex) in item.children" :key="child.name || childIndex">
                  <NuxtLink 
                    :to="child.path || '#'" 
                    class="mobile-nav-link mobile-nav-child"
                    @click="closeMobileMenu"
                  >
                    <Icon v-if="child.icon" :name="child.icon" class="mobile-nav-icon" />
                    {{ child.name }}
                  </NuxtLink>
                </li>
              </ul>
            </template>
            <!-- 普通菜单项 -->
            <NuxtLink 
              v-else
              :to="item.path || '#'" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              <Icon v-if="item.icon" :name="item.icon" class="mobile-nav-icon" />
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </ClientOnly>

    <!-- Search Modal -->
    <ClientOnly>
      <SearchModal :is-open="searchModalOpen" @close="closeSearch" />
    </ClientOnly>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWindowScroll } from '@vueuse/core'
import SearchModal from '~/components/SearchModal.vue'

const appConfig = useAppConfig()

// 使用 ?. 防止报错，如果取不到则使用默认值
const siteTitle = computed(() => appConfig?.site?.title ?? "Fomalhaut🥝")

// 菜单数据结构 - 按照用户要求的格式
interface MenuItem {
  name: string
  path?: string
  icon?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  { 
    name: '首页', 
    path: '/', 
    icon: 'ri:home-4-line' 
  },
  { 
    name: '文章', 
    icon: 'ri:article-line', 
    children: [
      { name: '博客', path: '/blog', icon: 'ri:list-check-2' },
      { name: '归档', path: '/archives', icon: 'ri:archive-line' },
      { name: '标签', path: '/tags', icon: 'ri:price-tag-3-line' },
      { name: '分类', path: '/categories', icon: 'ri:folder-2-line' }
    ]
  },
  { 
    name: '图集', 
    path: '/gallery', 
    icon: 'ri:gallery-view-2' 
  },
  { 
    name: '分析', 
    icon: 'ri:bar-chart-2-line', 
    children: [
      { name: '全站统计', path: '/stats', icon: 'ri:bar-chart-line' },
      { name: '文章统计', path: '/stats/articles', icon: 'ri:file-text-line' }
    ]
  },
  { 
    name: '友链', 
    path: '/friends', 
    icon: 'ri:links-line' 
  },
  { 
    name: '关于', 
    path: '/about', 
    icon: 'ri:user-3-line' 
  }
]

// 颜色模式
const colorMode = useColorMode()

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

// 使用 VueUse 的 useWindowScroll 监听滚动
const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 60)

// 移动端菜单状态
const mobileMenuOpen = ref(false)
const searchModalOpen = ref(false)

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// 搜索功能
const openSearch = () => {
  searchModalOpen.value = true
  console.log('打开搜索') // 暂时仅打印 log
}

const closeSearch = () => {
  searchModalOpen.value = false
}
</script>

<style scoped lang="scss">
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--nav-height);
  /* 始终显示半透明背景，确保文字清晰可见 */
  background: var(--header-bg-scrolled) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  color: var(--text-color); /* 确保文字颜色使用变量 */
  z-index: 1000;
  transition: all 0.3s ease;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  padding: 0 var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo {
  font-size: 1.5rem; /* 从 1.25rem 增大到 1.5rem (约 21px) */
  font-weight: 700;
  color: var(--text-color); /* 始终使用文字颜色变量，因为背景一直存在 */
  text-decoration: none;
  transition: var(--transition);
  text-shadow: none; /* 移除阴影，因为背景一直存在 */
}

.logo:hover {
  color: var(--primary-color);
}

/* Navigation Menu */
.nav-menu {
  display: flex;
  align-items: center;
}

.nav-list {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-icon {
  width: 16px;
  height: 16px;
  margin-right: var(--spacing-xs);
  transition: var(--transition);
}

.nav-link:hover .nav-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Navigation Link */
.nav-link {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-color); /* 始终使用文字颜色变量，因为背景一直存在 */
  text-decoration: none;
  font-size: 16px; /* 从 var(--font-size-base) 14px 增大到 16px */
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  text-shadow: none; /* 移除阴影，因为背景一直存在 */

  /* 下划线动画效果 */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--primary-hover);
    transition: all 0.3s ease;
    transform: translateX(-50%);
  }

  &:hover {
    color: var(--primary-hover);
    text-shadow: none;

    &::after {
      width: 80%;
    }
  }

  &.router-link-active {
    color: var(--primary-color);
    text-shadow: none;

    &::after {
      width: 80%;
      background: var(--primary-color);
    }
  }
}

/* 滚动后导航链接颜色变为正常文字颜色 */
.app-header.nav-visible .nav-link {
  color: var(--text-color);
  text-shadow: none;
}

/* Active link (router-link-active is added by Nuxt) */
.nav-link.router-link-active {
  color: var(--primary-color);
}

/* Dropdown Menu - Pure CSS Implementation */
.nav-item.has-dropdown .dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--spacing-sm);
  min-width: 160px;
  background: var(--card-bg); /* 使用 CSS 变量 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-lg);
  list-style: none;
  padding: var(--spacing-xs) 0;
  margin: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(-10px);
  transition: all 0.3s ease-in-out; /* 使用 ease-in-out 实现平滑动画 */
  pointer-events: none;
  border: 1px solid var(--border-light);
  z-index: 100;
  display: block; /* 确保下拉菜单是块级元素 */
}

/* Show dropdown on hover (group-hover) */
.nav-item.has-dropdown.group:hover .dropdown-menu,
.nav-item.has-dropdown.group:hover > .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0); /* 淡入显示 */
  pointer-events: auto;
}

/* 下拉菜单在暗色模式下自动使用 --card-bg 变量，无需单独设置 */

/* Dropdown Link */
.dropdown-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-color);
  text-decoration: none;
  font-size: 14px; /* 从 var(--font-size-sm) 12px 增大到 14px */
  transition: var(--transition);
}

.dropdown-icon {
  width: 14px;
  height: 14px;
  transition: var(--transition);
}

.dropdown-link:hover {
  background-color: rgba(73, 177, 245, 0.1);
  color: var(--primary-color);

  .dropdown-icon {
    transform: scale(1.1);
  }
}

.dropdown-link.router-link-active {
  background-color: rgba(73, 177, 245, 0.1);
  color: var(--primary-color);
}

/* ============================================
   Header Actions (Search, Theme Toggle, Mobile Menu)
   ============================================ */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-color); /* 始终使用文字颜色变量，因为背景一直存在 */
  border-radius: var(--radius-sm);
  transition: var(--transition);
  filter: none; /* 移除阴影，因为背景一直存在 */

  &:hover {
    background: rgba(73, 177, 245, 0.1);
    color: var(--primary-color);

    .action-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.action-icon {
  width: 20px;
  height: 20px;
  transition: var(--transition);
}

.mobile-menu-toggle {
  display: none;
}

/* ============================================
   Mobile Menu
   ============================================ */
.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-light);
  box-shadow: var(--shadow-md);
  max-height: calc(100vh - var(--nav-height));
  overflow-y: auto;

  :global(.dark) & {
    background: rgba(20, 20, 30, 0.95);
    border-top-color: rgba(255, 255, 255, 0.1);
  }
}

.mobile-nav-list {
  list-style: none;
  padding: var(--spacing-md);
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.mobile-nav-item {
  margin: 0;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  color: var(--text-color);
  text-decoration: none;
  font-size: 16px; /* 从 var(--font-size-base) 14px 增大到 16px */
  border-radius: var(--radius-md);
  transition: var(--transition);

  &:hover,
  &.router-link-active {
    background: rgba(73, 177, 245, 0.1);
    color: var(--primary-color);
  }
}

.mobile-nav-parent {
  font-weight: 600;
  cursor: default;
}

.mobile-nav-children {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.mobile-nav-child {
  font-size: 14px;
  padding: var(--spacing-sm) var(--spacing-md);
  opacity: 0.9;
}

.mobile-nav-icon {
  width: 18px;
  height: 18px;
}

/* ============================================
   Responsive (Mobile)
   ============================================ */
@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--spacing-sm);
  }

  .nav-menu {
    display: none; /* 隐藏桌面端菜单 */
  }

  .mobile-menu-toggle {
    display: flex; /* 显示移动端菜单按钮 */
  }

  .header-actions {
    gap: var(--spacing-xs);
  }

  .mobile-menu {
    display: block; /* 显示移动端菜单 */
  }

  /* 在移动端隐藏桌面端下拉菜单 */
  .nav-item.has-dropdown .dropdown-menu {
    display: none !important;
  }
}
</style>
