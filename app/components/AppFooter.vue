<template>
  <footer class="app-footer">
    <div class="footer-background"></div>
    <div class="footer-container">
      <div class="footer-content">
        <!-- Copyright -->
        <p class="footer-text">
          © {{ currentYear }} {{ siteTitle }}. All rights reserved.
        </p>

        <!-- Social Icons -->
        <div class="footer-social" v-if="socialLinks && socialLinks.length > 0">
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
    </div>
  </footer>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()

const siteTitle = computed(() => appConfig.site?.title || 'Fomalhaut🥝')
const currentYear = new Date().getFullYear()

// 社交链接配置
const socialLinks = [
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
</script>

<style scoped lang="scss">
.app-footer {
  position: relative;
  margin-top: auto;
  padding: var(--spacing-xl) 0;
  background: var(--footer-bg); /* 使用 CSS 变量 */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid var(--border-light);
  overflow: hidden;
}

.footer-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/Shiki-Ryougi.png');
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
  opacity: 0.1;
  z-index: -1;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  position: relative;
  z-index: 1;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.footer-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px; /* 从 var(--font-size-sm) 12px 增大到 14px */
  text-align: center;
}

.footer-social {
  display: flex;
  align-items: center;
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
  background: var(--card-bg); /* 使用 CSS 变量，自动适配暗色模式 */
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  color: var(--text-color);
  transition: var(--transition);
  text-decoration: none;

  &:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 768px) {
  .app-footer {
    padding: var(--spacing-lg) 0;
  }

  .footer-content {
    gap: var(--spacing-sm);
  }

  .footer-text {
    font-size: 14px; /* 移动端也保持 14px */
  }

  .social-link {
    width: 36px;
    height: 36px;
  }

  .social-icon {
    width: 18px;
    height: 18px;
  }
}
</style>

