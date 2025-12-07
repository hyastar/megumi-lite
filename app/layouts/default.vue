<template>
  <div class="layout-container">
    <AppHeader />
    
    <main class="main-content">
      <slot />
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Default layout with AppHeader, main content, and AppFooter
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: transparent; /* 透明，让背景图显示 */
  color: var(--text-color);
}

.main-content {
  flex: 1;
  min-height: 80vh;
  padding-top: var(--nav-height);
  background: transparent; /* 确保不遮挡背景图 */
}
</style>
