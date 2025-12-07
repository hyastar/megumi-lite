<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

type ArticleRow = {
  id: string
  slug: string
  title: string
  cover: string
  category: string
  isPublished: boolean
  publishedAt: string
  summary?: string
}

const router = useRouter()

const loading = ref(false)
const refreshing = ref(false)
const deletingSlug = ref<string | null>(null)
const articles = ref<ArticleRow[]>([])

const filters = reactive({
  keyword: '',
  category: 'all',
  timeframe: 'all'
})

const pagination = reactive({
  page: 1,
  pageSize: 8
})

const categoryOptions = computed(() => {
  const names = new Set<string>()
  articles.value.forEach((item) => {
    if (item.category) {
      names.add(item.category)
    }
  })
  return ['all', ...Array.from(names)]
})

const filteredArticles = computed(() => {
  let list = [...articles.value]
  const keyword = filters.keyword.trim().toLowerCase()

  if (keyword) {
    list = list.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        (item.summary || '').toLowerCase().includes(keyword) ||
        item.slug.toLowerCase().includes(keyword)
    )
  }

  if (filters.category !== 'all') {
    list = list.filter((item) => item.category === filters.category)
  }

  if (filters.timeframe !== 'all') {
    const now = new Date()
    const threshold = new Date(now)

    if (filters.timeframe === 'week') {
      threshold.setDate(now.getDate() - 7)
    } else if (filters.timeframe === 'month') {
      threshold.setDate(now.getDate() - 30)
    } else if (filters.timeframe === 'year') {
      threshold.setFullYear(now.getFullYear() - 1)
    }

    list = list.filter((item) => {
      const publishedDate = new Date(item.publishedAt)
      return Number.isNaN(publishedDate.getTime()) ? true : publishedDate >= threshold
    })
  }

  return list
})

const totalPages = computed(() => {
  if (filteredArticles.value.length === 0) return 1
  return Math.ceil(filteredArticles.value.length / pagination.pageSize)
})

const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, idx) => idx + 1))

const pagedArticles = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredArticles.value.slice(start, start + pagination.pageSize)
})

watch(
  () => [filters.keyword, filters.category, filters.timeframe],
  () => {
    pagination.page = 1
  }
)

watch(filteredArticles, () => {
  if (pagination.page > totalPages.value) {
    pagination.page = totalPages.value || 1
  }
})

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const mapArticle = (item: any): ArticleRow => ({
  id: String(item._id || item.id || item.slug || Math.random()),
  slug: item.slug || '',
  title: item.title || '未命名文章',
  cover: item.cover || item.coverImage || '',
  category:
    (typeof item.category === 'object' && item.category?.name) || item.category || '未分类',
  isPublished: item.isPublished !== false,
  publishedAt: item.publishedAt || item.createdAt || new Date().toISOString(),
  summary: item.summary || ''
})

const fetchArticles = async () => {
  loading.value = true
  try {
    const response: any = await $fetch('/api/blog', {
      query: {
        page: 1,
        limit: 100
      }
    })

    const list = response?.data?.list || []
    articles.value = list.map(mapArticle)
  } catch (err: any) {
    console.error(err)
    alert(err?.data?.message || err?.message || '加载文章失败')
  } finally {
    loading.value = false
  }
}

const handleNewArticle = () => {
  router.push('/admin/edit')
}

const handleEdit = (slug: string) => {
  router.push(`/admin/edit?slug=${slug}`)
}

const handleDelete = async (article: ArticleRow) => {
  if (!article.slug) return
  const confirmed = confirm(`确定要删除「${article.title}」吗？此操作不可恢复。`)
  if (!confirmed) return

  deletingSlug.value = article.slug
  try {
    await $fetch(`/api/blog/${article.slug}`, { method: 'DELETE' })
    await fetchArticles()
  } catch (err: any) {
    console.error(err)
    alert(err?.data?.message || err?.message || '删除失败')
  } finally {
    deletingSlug.value = null
  }
}

const handleRefresh = async () => {
  refreshing.value = true
  await fetchArticles()
  refreshing.value = false
}

onMounted(() => {
  fetchArticles()
})
</script>

<template>
  <div class="articles-page">
    <div class="page-header">
      <div class="page-titles">
        <p class="eyebrow">📍 文章管理</p>
        <h1>文章列表</h1>
        <p class="subtitle">查看、筛选和管理你的每一篇文章。</p>
      </div>
      <button class="btn primary" @click="handleNewArticle">
        <Icon name="mdi:plus" />
        写新文章
      </button>
    </div>

    <div class="filter-bar">
      <div class="filter search">
        <Icon name="mdi:magnify" class="icon" />
        <input
          v-model="filters.keyword"
          class="input"
          type="text"
          placeholder="搜索标题 / 摘要 / Slug"
        />
      </div>

      <div class="filter select">
        <span class="label">分类</span>
        <select v-model="filters.category" class="input select-input">
          <option value="all">全部分类</option>
          <option
            v-for="category in categoryOptions.filter((item) => item !== 'all')"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>
      </div>

      <div class="filter select">
        <span class="label">时间</span>
        <select v-model="filters.timeframe" class="input select-input">
          <option value="all">所有时间</option>
          <option value="week">最近 7 天</option>
          <option value="month">最近 30 天</option>
          <option value="year">最近一年</option>
        </select>
      </div>

      <div class="filter actions">
        <button class="btn ghost" :disabled="refreshing" @click="handleRefresh">
          <Icon :name="refreshing ? 'mdi:loading' : 'mdi:refresh'" :class="{ spinning: refreshing }" />
          刷新
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div>
          <p class="eyebrow">数据表格</p>
          <h3>文章列表</h3>
        </div>
        <div class="table-meta">
          <span>共 {{ filteredArticles.length }} 篇</span>
          <span class="dot">•</span>
          <span>第 {{ pagination.page }} / {{ totalPages }} 页</span>
        </div>
      </div>

      <div v-if="loading" class="table-state">
        <Icon name="mdi:loading" class="spinning" />
        <p>正在加载文章...</p>
      </div>

      <div v-else-if="!filteredArticles.length" class="table-state">
        <Icon name="mdi:file-document-outline" />
        <div class="empty-text">
          <p>还没有文章，去写一篇吧~</p>
          <button class="btn primary" @click="handleNewArticle">
            <Icon name="mdi:plus" />
            写新文章
          </button>
        </div>
      </div>

      <div v-else class="table-wrapper">
        <table class="articles-table">
          <thead>
            <tr>
              <th class="cover-col">封面</th>
              <th>标题</th>
              <th>分类</th>
              <th>状态</th>
              <th>发布时间</th>
              <th class="actions-col">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in pagedArticles" :key="article.id">
              <td class="cover-cell">
                <div v-if="article.cover" class="cover-thumb">
                  <img :src="article.cover" alt="封面" loading="lazy" />
                </div>
                <div v-else class="cover-placeholder">
                  <Icon name="mdi:image-outline" />
                </div>
              </td>
              <td class="title-cell">
                <div class="title">{{ article.title }}</div>
                <div class="subtitle">{{ article.summary || '暂无摘要' }}</div>
                <div class="slug">Slug: {{ article.slug || '--' }}</div>
              </td>
              <td>
                <span class="category-pill">{{ article.category || '未分类' }}</span>
              </td>
              <td>
                <span
                  class="status-pill"
                  :class="article.isPublished ? 'published' : 'draft'"
                >
                  <span class="dot" />
                  {{ article.isPublished ? '已发布' : '草稿' }}
                </span>
              </td>
              <td>{{ formatDate(article.publishedAt) }}</td>
              <td class="row-actions">
                <button class="btn ghost small" @click="handleEdit(article.slug)">
                  <Icon name="mdi:pencil-outline" />
                  编辑
                </button>
                <button
                  class="btn danger small"
                  :disabled="deletingSlug === article.slug"
                  @click="handleDelete(article)"
                >
                  <Icon :name="deletingSlug === article.slug ? 'mdi:loading' : 'mdi:trash-can-outline'" />
                  {{ deletingSlug === article.slug ? '删除中...' : '删除' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" v-if="filteredArticles.length">
          <button
            class="btn ghost small"
            :disabled="pagination.page === 1"
            @click="pagination.page = Math.max(1, pagination.page - 1)"
          >
            <Icon name="mdi:chevron-left" />
            上一页
          </button>

          <div class="page-numbers">
            <button
              v-for="num in pageNumbers"
              :key="num"
              class="page-btn"
              :class="{ active: num === pagination.page }"
              @click="pagination.page = num"
            >
              {{ num }}
            </button>
          </div>

          <button
            class="btn ghost small"
            :disabled="pagination.page === totalPages"
            @click="pagination.page = Math.min(totalPages, pagination.page + 1)"
          >
            下一页
            <Icon name="mdi:chevron-right" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.articles-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.3s ease;
  background: radial-gradient(circle at 20% 20%, rgba(255, 182, 193, 0.2), transparent 30%),
    radial-gradient(circle at 80% 0%, rgba(135, 206, 235, 0.25), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.35));
  padding: 10px;
  border-radius: 18px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  border-radius: 16px;
}

.page-titles h1 {
  font-size: 26px;
  margin: 4px 0;
  color: #1f2937;
}

.subtitle {
  color: #445069;
  margin: 0;
}

.eyebrow {
  color: #c2417a;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.2px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.5);
  color: #0f172a;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 700;
  backdrop-filter: blur(12px);
}

.btn.primary {
  background: linear-gradient(135deg, #ffb6c1, #87ceeb);
  color: #1f1f2e;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 12px 26px rgba(255, 182, 193, 0.35);
}

.btn.ghost {
  background: rgba(255, 255, 255, 0.45);
  border-color: rgba(255, 255, 255, 0.6);
}

.btn.danger {
  background: rgba(255, 255, 255, 0.55);
  color: #c2417a;
  border-color: rgba(255, 182, 193, 0.7);
}

.btn.small {
  padding: 8px 12px;
  border-radius: 10px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.08);
}

.filter-bar {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr auto;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  align-items: center;
  box-shadow: 0 10px 28px rgba(255, 182, 193, 0.18);
}

.filter {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.filter.search {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.filter .icon {
  color: #9ca3af;
}

.input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #0f172a;
}

.input:focus {
  border: 1px solid transparent;
  box-shadow: 0 0 0 2px rgba(255, 182, 193, 0.65), 0 0 0 4px rgba(135, 206, 235, 0.4);
  border-radius: 10px;
}

.select-input {
  padding: 10px 12px;
  border-radius: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.7);
}

.label {
  color: #4b5563;
  font-size: 14px;
}

.filter.actions {
  justify-content: flex-end;
}

.table-card {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 16px;
  backdrop-filter: blur(20px);
  box-shadow: 0 16px 32px rgba(255, 182, 193, 0.28);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.table-header h3 {
  margin: 2px 0;
}

.table-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #445069;
  font-weight: 600;
}

.table-meta .dot {
  width: 4px;
  height: 4px;
  display: inline-block;
  border-radius: 999px;
  background: #d1d5db;
}

.table-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px;
  color: #6b7280;
  flex-direction: column;
}

.empty-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-wrapper {
  overflow: auto;
}

.articles-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;
}

.articles-table th,
.articles-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.35);
}

.articles-table th {
  color: #334155;
  font-weight: 700;
  background: transparent;
  position: relative;
}

.articles-table th::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 182, 193, 0.7), rgba(135, 206, 235, 0.6));
  opacity: 0.6;
}

.articles-table tbody tr {
  position: relative;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.articles-table tbody tr::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, rgba(255, 182, 193, 0.9), rgba(135, 206, 235, 0.75));
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 0.2s ease;
  border-radius: 0 6px 6px 0;
}

.articles-table tbody tr:hover {
  background: rgba(255, 182, 193, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.articles-table tbody tr:hover::before {
  transform: scaleY(1);
}

.cover-col {
  width: 110px;
}

.actions-col {
  width: 200px;
}

.cover-cell {
  display: flex;
  align-items: center;
}

.cover-thumb {
  width: 80px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.12);
}

.cover-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  width: 80px;
  height: 56px;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.7);
  color: #9ca3af;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.5);
}

.title-cell .title {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.title-cell .subtitle {
  color: #475569;
  font-size: 14px;
  margin-bottom: 6px;
}

.slug {
  font-size: 13px;
  color: #94a3b8;
}

.category-pill {
  display: inline-flex;
  padding: 6px 10px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.55));
  color: #4338ca;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 13px;
  color: #0b1220;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 8px 18px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.status-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);
}

.status-pill.published {
  background: linear-gradient(135deg, #a0f1da, #6de0b6);
}

.status-pill.published .dot {
  background: #0ea36c;
}

.status-pill.draft {
  background: linear-gradient(135deg, #ffb6c1, #f7a76c);
}

.status-pill.draft .dot {
  background: #e17055;
}

.row-actions {
  display: flex;
  gap: 8px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

.page-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(255, 182, 193, 0.28);
}

.page-btn.active {
  background: linear-gradient(135deg, #ffb6c1, #87ceeb);
  color: #0f172a;
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 12px 22px rgba(255, 182, 193, 0.35);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 960px) {
  .filter-bar {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .row-actions {
    flex-direction: column;
  }
}
</style>
