<template>
  <aside class="sidebar">
    <!-- Profile Card -->
    <div class="sidebar-card profile-card">
      <div class="profile-avatar">
        <NuxtImg
          src="/images/avatar.svg"
          alt="Avatar"
          class="avatar-image"
          loading="lazy"
          format="webp"
          width="100"
          height="100"
          quality="80"
        />
      </div>
      <h3 class="profile-name">Megumi-Lite</h3>
      <p class="profile-bio">相信美好的事情即将发生 ✨</p>

      <!-- 统计数据 -->
      <div class="profile-stats">
        <div class="stat-item">
          <div class="stat-number">{{ stats.articles }}</div>
          <div class="stat-label">文章</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.tags }}</div>
          <div class="stat-label">标签</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-number">{{ stats.categories }}</div>
          <div class="stat-label">分类</div>
        </div>
      </div>

      <!-- 社交按钮 -->
      <div class="profile-social">
        <a
          v-for="social in socialLinks"
          :key="social.name"
          :href="social.url"
          :title="social.name"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          <Icon :name="social.icon" class="social-icon" />
        </a>
      </div>
    </div>

    <!-- Notice Card -->
    <div class="sidebar-card notice-card">
      <div class="card-header">
        <Icon name="mdi:bell-outline" class="header-icon" />
        <h3 class="card-title">公告</h3>
      </div>
      <div class="notice-content">
        <p>{{ notice }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
interface SocialLink {
  name: string
  url: string
  icon: string
}

interface Props {
  stats?: {
    articles: number
    tags: number
    categories: number
  }
  notice?: string
  socialLinks?: SocialLink[]
}

const props = withDefaults(defineProps<Props>(), {
  stats: () => ({
    articles: 0,
    tags: 0,
    categories: 0
  }),
  notice: '欢迎来到 Megumi-Lite！这里记录着生活的点滴与技术的思考。',
  socialLinks: () => [
    {
      name: 'GitHub',
      url: 'https://github.com',
      icon: 'mdi:github'
    },
    {
      name: 'Bilibili',
      url: 'https://www.bilibili.com',
      icon: 'ri:bilibili-line'
    },
    {
      name: 'Email',
      url: 'mailto:example@example.com',
      icon: 'mdi:email-outline'
    }
  ]
})
</script>

<style scoped lang="scss">
.sidebar {
  position: sticky;
  top: calc(64px + var(--spacing-lg));
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.sidebar-card {
  background: var(--card-bg);
  backdrop-filter: var(--backdrop-filter);
  -webkit-backdrop-filter: var(--backdrop-filter);
  border-radius: var(--card-radius);
  border: 1px solid rgba(169, 169, 169, 0.2);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
}

// ============================================
// Profile Card
// ============================================
.profile-card {
  text-align: center;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto var(--spacing-md);
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-light);
  transition: transform 0.8s ease, border-color 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: rotate(360deg);
    border-color: var(--primary-color);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--transition);
  }
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: var(--spacing-sm);
}

.profile-bio {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-md) 0;
  margin-bottom: var(--spacing-lg);
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-light);
}

.profile-social {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(73, 177, 245, 0.1);
  color: var(--primary-color);
  transition: var(--transition);

  &:hover {
    background: var(--primary-color);
    color: white;
    transform: scale(1.1);
  }
}

.social-icon {
  width: 20px;
  height: 20px;
  transition: var(--transition);
}

.social-icon {
  width: 20px;
  height: 20px;
}

// ============================================
// Notice Card
// ============================================
.notice-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-light);
  }

  .header-icon {
    width: 20px;
    height: 20px;
    color: var(--primary-color);
  }

  .card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
  }
}

.notice-content {
  color: var(--text-secondary);
  line-height: var(--line-height);
  font-size: var(--font-size-base);

  p {
    margin: 0;
  }
}

// ============================================
// 响应式设计
// ============================================
@media (max-width: 1024px) {
  .sidebar {
    position: static;
    margin-top: var(--spacing-lg);
  }
}
</style>

