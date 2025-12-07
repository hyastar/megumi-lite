// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // 引入全局样式（注意顺序：fonts.css -> variables.css -> main.scss -> admin-theme.scss）
  css: [
    '~/assets/styles/fonts.css',
    '~/assets/styles/variables.css',
    '~/assets/styles/main.scss',
    '~/assets/styles/admin-theme.scss',
    'katex/dist/katex.min.css'
  ],
  
  // 模块配置
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/color-mode'
  ],
  
  // Color Mode 配置
  colorMode: {
    classSuffix: '', // 使用 .dark 类名而不是 .dark-mode
    preference: 'system', // 默认跟随系统
    fallback: 'light'
  },
  
  // Image 模块配置
  image: {
    provider: 'ipx',
    format: ['webp'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
      '2xl': 1536
    }
  },
  
  // App Head Configuration (SEO Meta Tags)
  // Extracted from _config.yml
  app: {
    head: {
      title: 'Fomalhaut🥝',
      titleTemplate: '%s - Fomalhaut🥝',
      htmlAttrs: {
        lang: 'zh-CN'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Future is now 🍭🍭🍭'
        },
        { 
          name: 'author', 
          content: 'Fomalhaut🥝'
        },
        { 
          name: 'language', 
          content: 'zh-CN'
        },
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Fomalhaut🥝' },
        { property: 'og:description', content: 'Future is now 🍭🍭🍭' },
        { property: 'og:site_name', content: 'Fomalhaut🥝' },
        { property: 'og:url', content: '' },
        { property: 'og:locale', content: 'zh_CN' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Fomalhaut🥝' },
        { name: 'twitter:description', content: 'Future is now 🍭🍭🍭' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    },
    // 页面过渡配置
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    }
  },
  
  // Runtime config
  runtimeConfig: {
    // Server-side only (not exposed to client)
    mongodbUri: process.env.NUXT_MONGODB_URI || process.env.NUXT_MONGO_URI,
    mongoUri: process.env.NUXT_MONGODB_URI || process.env.NUXT_MONGO_URI, // legacy compatibility
    adminUsername: process.env.NUXT_ADMIN_USERNAME || 'kato',
    adminPassword: process.env.NUXT_ADMIN_PASSWORD || 'kato_passwd',
    authSecret: process.env.NUXT_AUTH_SECRET || 'default_secret_please_change',
    redisHost: process.env.NUXT_REDIS_HOST || '127.0.0.1',
    redisPort: process.env.NUXT_REDIS_PORT || 6379, // keep raw, convert where used
    redisPassword: process.env.NUXT_REDIS_PASSWORD || '',
    
    // Client-side accessible
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://www.fomal.cc/',
      analyticsProvider: process.env.NUXT_PUBLIC_ANALYTICS_PROVIDER || 'umami',
      analyticsShareUrl: process.env.NUXT_PUBLIC_ANALYTICS_SHARE_URL || '',
      laId: process.env.NUXT_PUBLIC_51LA_ID || '',
      laCk: process.env.NUXT_PUBLIC_51LA_CK || '',
      umamiId: process.env.NUXT_PUBLIC_UMAMI_ID || '',
      umamiHost: process.env.NUXT_PUBLIC_UMAMI_HOST || ''
    }
  },

  // Route rules
  routeRules: {
    '/kato/**': { ssr: false },
    '/admin/**': { ssr: false }
  },

  // Nitro 配置
  nitro: {
    // 允许文件写入
    storage: {
      // 可以在这里配置存储选项
    }
  }
})
