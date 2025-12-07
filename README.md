# 🌸 Megumi-Lite

> 一个基于 Nuxt 4 构建的轻量级、高性能博客系统。
> 集成了 MongoDB Atlas 云数据库与 Redis (Upstash) 缓存，支持 Vercel 一键部署。

## ✨ 特性 (Features)

  * **⚡️ 高性能架构**：基于 **Nuxt 4** (SSR/ISR) 开发，首屏加载极快。
  * **☁️ 云原生支持**：
      * 数据库采用 **MongoDB Atlas**，数据持久化存储。
      * 缓存采用 **Redis (Upstash)**，加速接口响应。
      * 完美适配 **Vercel** 边缘网络部署。
  * **📊 双模统计系统**：
      * 支持通过环境变量一键切换 **51.la** 或 **Umami** 统计。
      * 集成 51.la 挂件与单页应用 (SPA) 路由追踪支持。
  * **📝 内容管理**：
      * 支持 Markdown 文章撰写。
      * 包含分类、标签、友链、相册等完整模块。
  * **🛡️ 安全机制**：集成 Admin 后台管理，支持 JWT 鉴权与 Redis Session 管理。

## 🛠️ 技术栈 (Tech Stack)

  * **框架**: [Nuxt 4](https://nuxt.com/) (Vue 3 + TypeScript)
  * **数据库**: [MongoDB Atlas](https://www.mongodb.com/atlas) (Mongoose ODM)
  * **缓存**: [Upstash Redis](https://upstash.com/)
  * **部署**: [Vercel](https://vercel.com/)
  * **样式**: SCSS / CSS 

## 🚀 本地开发 (Local Development)

### 1\. 克隆项目

```bash
git clone https://github.com/your-username/megumi-lite.git
cd megumi-lite
```

### 2\. 安装依赖

推荐使用 `pnpm` 进行包管理：

```bash
pnpm install
```

### 3\. 配置环境变量

在项目根目录新建 `.env` 文件，复制以下内容并修改为你自己的配置：

```ini
# --- 数据库配置 (MongoDB Atlas) ---
NUXT_MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/megumi_lite?retryWrites=true&w=majority

# --- Redis 配置 (Upstash) ---
NUXT_REDIS_HOST=delicate-jaguar-xxxxx.upstash.io
NUXT_REDIS_PORT=6379
NUXT_REDIS_PASSWORD=你的Upstash密码

# --- 管理员配置 ---
NUXT_ADMIN_USERNAME=admin
NUXT_ADMIN_PASSWORD=你的安全密码

# --- 安全配置 ---
NUXT_AUTH_SECRET=随便乱输一串长字符作为密钥

# --- 统计配置 (可选 51la 或 umami) ---
# 切换模式: '51la' 或 'umami'
NUXT_PUBLIC_ANALYTICS_PROVIDER=51la
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# 51.la 配置 (如果使用)
NUXT_PUBLIC_51LA_ID=你的ID
NUXT_PUBLIC_51LA_CK=你的CK

# Umami 配置 (如果使用)
# NUXT_PUBLIC_UMAMI_ID=你的UmamiID
# NUXT_PUBLIC_UMAMI_HOST=https://你的umami地址

# 统计报表公开链接 (用于 /stats 页面展示)
NUXT_PUBLIC_ANALYTICS_SHARE_URL=你的报表分享链接
```

### 4\. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000` 即可看到效果。

## 📦 部署到 Vercel (Deployment)

本项目专为 Vercel 优化，部署非常简单：

1.  将代码推送到 GitHub。
2.  登录 Vercel，点击 **"Add New Project"** 并导入你的仓库。
3.  **⚠️ 关键步骤：配置环境变量**
      * 在 Vercel 的 `Settings` -\> `Environment Variables` 中，将你本地 `.env` 里的所有变量复制进去。
      * 注意：`NUXT_PUBLIC_SITE_URL` 在正式环境应填 `https://你的域名.vercel.app`。
4.  点击 **Deploy**。

> **注意**：请确保你的 MongoDB Atlas 网络访问白名单 (Network Access) 已添加 `0.0.0.0/0`，否则 Vercel 服务器无法连接数据库。

## ⚙️ 统计切换指南 (Analytics)

本项目支持通过环境变量无缝切换统计服务，无需修改代码。

### 模式 A: 使用 51.la

在 Vercel 环境变量中设置：

```properties
NUXT_PUBLIC_ANALYTICS_PROVIDER=51la
NUXT_PUBLIC_51LA_ID=xxxxx
NUXT_PUBLIC_51LA_CK=xxxxx
```

### 模式 B: 使用 Umami

在 Vercel 环境变量中设置：

```properties
NUXT_PUBLIC_ANALYTICS_PROVIDER=umami
NUXT_PUBLIC_UMAMI_ID=xxxxx
NUXT_PUBLIC_UMAMI_HOST=https://analytics.yourdomain.com
```

修改后记得 **Redeploy** 项目以生效。

## 📄 License

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0) License © 2025 [hyastar](https://github.com/hyastar)