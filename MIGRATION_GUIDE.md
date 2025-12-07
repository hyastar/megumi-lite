# Hexo Butterfly 迁移指南

## 配置文件迁移说明

### 1. 更新 `app.config.ts`

请根据您的 Hexo 配置文件更新以下内容：

#### 从 `_config.yml` 提取站点信息：

```yaml
# _config.yml 示例
title: Your Blog Title
subtitle: Your Blog Subtitle
description: Your blog description
author: Your Name
language: zh-CN
timezone: Asia/Shanghai
url: https://your-domain.com
```

更新 `app.config.ts` 中的 `site` 部分：

```typescript
site: {
  title: 'Your Blog Title',        // 从 _config.yml 的 title
  subtitle: 'Your Blog Subtitle',   // 从 _config.yml 的 subtitle
  description: 'Your blog description', // 从 _config.yml 的 description
  author: 'Your Name',              // 从 _config.yml 的 author
  language: 'zh-CN',                // 从 _config.yml 的 language
  timezone: 'Asia/Shanghai',        // 从 _config.yml 的 timezone
  url: 'https://your-domain.com',   // 从 _config.yml 的 url
}
```

#### 从 `_config.butterfly.yml` 提取菜单：

查找 `menu:` 部分，只保留以下菜单项：

```yaml
# _config.butterfly.yml 示例
menu:
  首页: 
    - / || fas fa-home
  文章:
    - /archives/ || fas fa-archive
    - /categories/ || fas fa-folder-open
    - /tags/ || fas fa-tags
  统计:
    - /statistics/ || fas fa-chart-line
  友链:
    - /links/ || fas fa-link
  关于:
    - /about/ || fas fa-heart
```

更新 `app.config.ts` 中的 `menu` 部分（已按您的要求简化）：

```typescript
menu: [
  {
    name: '首页',
    path: '/',
    icon: 'home'
  },
  {
    name: '文章',
    path: '#',
    icon: 'article',
    children: [
      { name: '归档', path: '/archives', icon: 'archive' },
      { name: '分类', path: '/categories', icon: 'category' },
      { name: '标签', path: '/tags', icon: 'tag' }
    ]
  },
  {
    name: '统计',
    path: '#',
    icon: 'statistics',
    children: [
      { name: '网站统计', path: '/statistics', icon: 'site-stats' },
      { name: '文章统计', path: '/article-statistics', icon: 'article-stats' }
    ]
  },
  {
    name: '友链',
    path: '/links',
    icon: 'link'
  },
  {
    name: '关于',
    path: '/about',
    icon: 'about'
  }
]
```

#### 从 `_config.butterfly.yml` 提取社交链接：

查找 `social:` 部分：

```yaml
# _config.butterfly.yml 示例
social:
  GitHub: https://github.com/yourusername || fab fa-github
  Email: mailto:your.email@example.com || fas fa-envelope
```

更新 `app.config.ts` 中的 `social` 部分：

```typescript
social: [
  {
    name: 'GitHub',
    url: 'https://github.com/yourusername',
    icon: 'github'
  },
  {
    name: 'Email',
    url: 'mailto:your.email@example.com',
    icon: 'email'
  }
]
```

#### 从 `_config.butterfly.yml` 提取友链：

查找 `links:` 部分：

```yaml
# _config.butterfly.yml 示例
links:
  - name: Friend Name
    url: https://friend-site.com
    avatar: https://friend-site.com/avatar.jpg
    description: Friend description
```

更新 `app.config.ts` 中的 `links` 部分：

```typescript
links: [
  {
    name: 'Friend Name',
    url: 'https://friend-site.com',
    avatar: 'https://friend-site.com/avatar.jpg',
    description: 'Friend description'
  }
]
```

### 2. 更新 `nuxt.config.ts` 的 SEO Meta 标签

`nuxt.config.ts` 中的 `app.head` 配置会自动使用 `app.config.ts` 中的值。您也可以直接在 `nuxt.config.ts` 中更新：

```typescript
app: {
  head: {
    title: 'Your Blog Title', // 从 app.config.ts 的 site.title
    titleTemplate: '%s - Your Blog Title',
    meta: [
      { name: 'description', content: 'Your blog description' }, // 从 app.config.ts 的 site.description
      { name: 'author', content: 'Your Name' }, // 从 app.config.ts 的 site.author
      // ... 其他 meta 标签
    ]
  }
}
```

## 使用配置

在组件中使用配置：

```vue
<script setup>
const appConfig = useAppConfig()

// 访问站点信息
console.log(appConfig.site.title)
console.log(appConfig.site.description)

// 访问菜单
console.log(appConfig.menu)

// 访问社交链接
console.log(appConfig.social)

// 访问友链
console.log(appConfig.links)
</script>
```

## 注意事项

1. **图标配置已简化**：原 Hexo Butterfly 使用 Font Awesome 图标类名（如 `fas fa-home`），现在只保留图标名称字符串，您可以在组件中根据需要映射到实际的图标组件。

2. **菜单路径**：下拉菜单的父项路径设置为 `#`，表示不跳转，只展开子菜单。

3. **统计页面**：需要创建 `/statistics` 和 `/article-statistics` 页面，或者根据实际需求调整路径。

4. **友链页面**：需要创建 `/links` 页面来展示友链列表。

