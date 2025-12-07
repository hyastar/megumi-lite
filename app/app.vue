<template>
  <NuxtLayout>
    <NuxtPage />
    <NuxtRouteAnnouncer />
  </NuxtLayout>
  <ClientOnly>
    <div v-if="isLoggedIn" class="admin-badge" @click="handleLogout">
      🔴 Admin Mode | 退出
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// Ensure every visitor gets a unique id for view tracking (auto-imported composable)
useVisitorId()

const { isLoggedIn } = useAdmin()

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    window.location.reload()
  } catch (err) {
    console.error(err)
  }
}
</script>

<style scoped>
.admin-badge {
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  z-index: 9999;
  backdrop-filter: blur(4px);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.admin-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
}
</style>
