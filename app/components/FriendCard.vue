<template>
  <a
    :href="friend.link"
    target="_blank"
    rel="noopener noreferrer"
    class="friend-card"
    :style="cardStyle"
  >
    <div class="friend-avatar-wrapper">
      <img
        :src="friend.avatar || '/images/avatar.svg'"
        :alt="friend.name"
        class="friend-avatar"
        loading="lazy"
      />
    </div>
    <div class="friend-content">
      <h3 class="friend-name">{{ friend.name }}</h3>
      <p class="friend-desc">{{ friend.desc || '暂无简介' }}</p>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Friend {
  name: string
  desc?: string
  avatar?: string
  link: string
  color?: string
}

interface Props {
  friend: Friend
}

const props = defineProps<Props>()

// 计算卡片样式（悬停时使用主题色）
const cardStyle = computed(() => {
  if (props.friend.color) {
    return {
      '--friend-color': props.friend.color
    }
  }
  return {}
})
</script>

<style scoped lang="scss">
.friend-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid var(--border-light);
  text-decoration: none;
  color: inherit;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--friend-color, var(--primary-color));
    opacity: 0;
    transition: var(--transition);
    z-index: 0;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    border-color: var(--friend-color, var(--primary-color));
    
    &::before {
      opacity: 1;
    }
    
    .friend-name,
    .friend-desc {
      color: white;
      position: relative;
      z-index: 1;
    }
    
    .friend-avatar {
      transform: rotate(360deg);
    }
  }
}

.friend-avatar-wrapper {
  position: relative;
  z-index: 1;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-light);
  transition: var(--transition);
  background: var(--bg-color);
  
  .friend-card:hover & {
    border-color: white;
  }
}

.friend-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
  display: block;
}

.friend-content {
  text-align: center;
  position: relative;
  z-index: 1;
  flex: 1;
  width: 100%;
}

.friend-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 var(--spacing-xs) 0;
  transition: var(--transition);
}

.friend-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: var(--transition);
}
</style>

