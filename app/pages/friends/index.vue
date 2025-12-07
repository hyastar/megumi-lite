<template>
  <div class="friends-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="ri:links-line" class="title-icon" />
        友情链接
      </h1>
      <p class="page-subtitle">也就是我的小伙伴们</p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <Icon name="mdi:loading" class="loading-icon" />
      <p>加载中...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <Icon name="mdi:alert-circle" class="error-icon" />
      <p>{{ error }}</p>
    </div>

    <!-- Friends Grid -->
    <div v-else-if="friends && friends.length > 0" class="friend-wrap">
      <FriendCard
        v-for="(friend, index) in friends"
        :key="friend._id || friend.link || index"
        :friend="friend"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <Icon name="ri:links-line" class="empty-icon" />
      <p>暂无友链</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import FriendCard from '~/components/FriendCard.vue'

// 获取友链数据
const { data: friendsData, pending, error } = await useFetch('/api/friends')

// 处理友链数据
const friends = computed(() => {
  if (!friendsData.value) return []
  
  // 如果返回的是数组，直接使用
  if (Array.isArray(friendsData.value)) {
    return friendsData.value.map((friend: any) => ({
      _id: friend._id ? String(friend._id) : undefined,
      name: friend.name || '',
      desc: friend.desc || friend.description || '',
      avatar: friend.avatar || '',
      link: friend.link || friend.url || '#',
      color: friend.color || undefined
    }))
  }
  
  // 如果返回的是对象，尝试提取 data 字段
  if (friendsData.value.data && Array.isArray(friendsData.value.data)) {
    return friendsData.value.data.map((friend: any) => ({
      _id: friend._id ? String(friend._id) : undefined,
      name: friend.name || '',
      desc: friend.desc || friend.description || '',
      avatar: friend.avatar || '',
      link: friend.link || friend.url || '#',
      color: friend.color || undefined
    }))
  }
  
  return []
})

// SEO
useHead({
  title: '友情链接',
  meta: [
    { name: 'description', content: '友情链接 - 也就是我的小伙伴们' }
  ]
})
</script>

<style scoped lang="scss">
.friends-page {
  max-width: 1200px;
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
   Friend Wrap (Grid Layout)
   ============================================ */
.friend-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: var(--spacing-md);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

/* ============================================
   Loading & Error States
   ============================================ */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-xl) * 2);
  gap: var(--spacing-md);
  color: var(--text-secondary);
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  box-shadow: var(--shadow-sm);
}

.loading-icon {
  width: 48px;
  height: 48px;
  color: var(--primary-color);
  animation: spin 1s linear infinite;
}

.error-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-light);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
