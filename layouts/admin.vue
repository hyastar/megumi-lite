<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-title">💎 Kato Admin</div>
      <nav class="menu">
        <NuxtLink to="/admin" class="menu-item">📊 仪表盘</NuxtLink>
        <NuxtLink to="/admin/articles" class="menu-item">📝 文章管理</NuxtLink>
        <NuxtLink to="/admin/gallery" class="menu-item">📷 图集管理</NuxtLink>
        <NuxtLink to="/admin/tags" class="menu-item">🏷️ 标签管理</NuxtLink>
        <div class="menu-divider"></div>
        <NuxtLink to="/admin/settings" class="menu-item">⚙️ 系统设置</NuxtLink>
        <button class="menu-item logout" @click="handleLogout">🚪 退出登录</button>
      </nav>
    </aside>

    <main class="main">
      <header class="topbar">
        <div class="breadcrumb">📍 仪表盘 &gt; 当前页面</div>
        <div class="topbar-actions">
          <button class="top-btn">🌐 中文</button>
          <button class="top-btn">🌙</button>
          <button class="top-btn">👤</button>
        </div>
      </header>
      <section class="content">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/')
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
  background: #f7f8fa;
  color: #1f2937;
}

.sidebar {
  background: #111827;
  color: #e5e7eb;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  padding: 12px 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 12px;
  border-radius: 10px;
  color: inherit;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.menu-item:hover,
.menu-item:focus {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.menu-divider {
  height: 1px;
  margin: 6px 0;
  background: rgba(255, 255, 255, 0.12);
}

.logout {
  color: #fef3c7;
}

.main {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.breadcrumb {
  font-size: 14px;
  color: #6b7280;
}

.topbar-actions {
  display: flex;
  gap: 10px;
}

.top-btn {
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.top-btn:hover {
  background: #f3f4f6;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.content {
  padding: 24px;
  flex: 1;
  overflow: auto;
}
</style>