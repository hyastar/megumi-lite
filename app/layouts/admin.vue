<template>
  <div class="app-container">
    <!-- 背景层：二次元插画 + backdrop-blur -->
    <div class="background-layer"></div>
    
    <!-- 侧边栏：悬浮/毛玻璃/圆角 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="user-info">
          <div class="avatar">(^^)</div>
          <div class="user-details">
            <div class="user-name">Kato_Megumi</div>
            <div class="user-status">
              <span class="status-dot"></span>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
      
      <nav class="menu">
        <div class="menu-section">
          <div class="menu-label">MENU</div>
          <NuxtLink to="/admin" class="menu-item" active-class="active">
            <span class="menu-indicator">{{ $route.path === '/admin' ? '🟦' : '⬜' }}</span>
            <span class="menu-icon">📊</span>
            <span class="menu-text">仪表盘</span>
          </NuxtLink>
          <NuxtLink to="/admin/articles" class="menu-item" active-class="active">
            <span class="menu-indicator">{{ $route.path.startsWith('/admin/articles') ? '🟦' : '⬜' }}</span>
            <span class="menu-icon">📝</span>
            <span class="menu-text">文章管理</span>
          </NuxtLink>
          <NuxtLink to="/admin/gallery" class="menu-item" active-class="active">
            <span class="menu-indicator">{{ $route.path.startsWith('/admin/gallery') ? '🟦' : '⬜' }}</span>
            <span class="menu-icon">📷</span>
            <span class="menu-text">图集管理</span>
          </NuxtLink>
        </div>
        
        <div class="menu-section">
          <div class="menu-label">SYSTEM</div>
          <button class="menu-item logout" @click="handleLogout">
            <span class="menu-indicator">⬜</span>
            <span class="menu-icon">🚪</span>
            <span class="menu-text">退出登录</span>
          </button>
        </div>
      </nav>
    </aside>

    <!-- 顶部导航栏：Sticky -->
    <header class="header">
      <div class="breadcrumb">
        <span>📍</span>
        <span>当前位置</span>
      </div>
      <div class="header-actions">
        <a href="/" class="action-btn" target="_blank">💻 前台</a>
        <button class="action-btn" @click="toggleColorMode">
          <span>{{ isDark ? '☀️' : '🌙' }}</span>
        </button>
        <button class="action-btn">👤 用户</button>
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="搜索..." class="search-input" />
        </div>
      </div>
    </header>

    <!-- 主内容区域：圆角卡片 -->
    <main class="main-content">
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const { logout } = useAdmin()

const handleLogout = async () => {
  await logout()
}
</script>

<style scoped>
/* CSS Reset */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* CSS Variables */
:root {
  --sidebar-bg: rgba(255, 255, 255, 0.15);
  --sidebar-text: #2c3e50;
  --sidebar-active-bg: rgba(255, 107, 157, 0.2);
  --sidebar-active-text: #FF6B9D;
  --header-bg: rgba(255, 255, 255, 0.2);
  --header-border: rgba(255, 255, 255, 0.3);
  --main-bg: rgba(255, 255, 255, 0.1);
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --backdrop-blur: blur(20px);
}

.dark {
  --sidebar-bg: rgba(30, 30, 46, 0.3);
  --sidebar-text: #e0e0e0;
  --sidebar-active-bg: rgba(255, 107, 157, 0.3);
  --sidebar-active-text: #FFA8C5;
  --header-bg: rgba(30, 30, 46, 0.3);
  --header-border: rgba(255, 255, 255, 0.1);
  --main-bg: rgba(15, 15, 26, 0.2);
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
}

/* 1. 根容器：定死屏幕高度，禁止 body 滚动 */
.app-container {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 60px 1fr;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
}

/* 背景层：二次元插画 + backdrop-blur */
.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-image: url('/Shiki-Ryougi.png');
  background-size: cover;
  background-position: center center;
  background-attachment: fixed;
  filter: var(--backdrop-blur);
  opacity: 0.6;
}

/* 2. 侧边栏：悬浮/毛玻璃/圆角 */
.sidebar {
  grid-row: 1 / -1;
  grid-column: 1;
  background: var(--sidebar-bg);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  color: var(--sidebar-text);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: 0 20px 20px 0;
  margin: 12px 0 12px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.3), rgba(255, 168, 197, 0.3));
  border-radius: 12px;
  font-size: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.2);
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--sidebar-text);
  margin-bottom: 4px;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #2ecc71;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(46, 204, 113, 0.6);
}

.menu {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.menu-section {
  padding: 0 20px;
}

.menu-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 12px;
  letter-spacing: 1px;
  opacity: 0.7;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  position: relative;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.menu-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.2);
}

.menu-item.active .menu-indicator {
  opacity: 1;
}

.menu-item:not(.active) .menu-indicator {
  opacity: 0.5;
}

.menu-indicator {
  font-size: 12px;
  width: 16px;
  text-align: center;
  transition: opacity 0.3s;
}

.menu-icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-weight: 500;
}

.menu-item.logout {
  color: #e74c3c;
}

.menu-item.logout:hover {
  background: rgba(231, 76, 60, 0.2);
}

/* 3. 顶栏：Sticky */
.header {
  grid-column: 2;
  grid-row: 1;
  background: var(--header-bg);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid var(--header-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-radius: 0 0 20px 20px;
  margin: 12px 12px 0 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: var(--text-primary);
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  padding: 10px 16px 10px 36px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  font-size: 14px;
  width: 200px;
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 107, 157, 0.5);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
  width: 240px;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

/* 4. 主内容区：圆角卡片 */
.main-content {
  grid-column: 2;
  grid-row: 2;
  padding: 20px 24px 24px 24px;
  overflow-y: auto;
  position: relative;
}

.content-wrapper {
  background: var(--main-bg);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 100px);
}

/* 滚动条样式 */
.sidebar::-webkit-scrollbar,
.main-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb,
.main-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.main-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 响应式：移动端 */
@media (max-width: 768px) {
  .app-container {
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr;
  }
  
  .sidebar {
    position: fixed;
    left: -240px;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
    margin: 0;
    border-radius: 0;
  }
  
  .sidebar.open {
    left: 0;
  }
  
  .header {
    grid-column: 1;
    margin: 0;
    border-radius: 0;
  }
  
  .main-content {
    grid-column: 1;
  }
  
  .search-input {
    width: 150px;
  }
  
  .search-input:focus {
    width: 180px;
  }
}
</style>
