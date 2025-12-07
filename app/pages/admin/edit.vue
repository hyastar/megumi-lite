<template>
  <div class="editor-page">
    <header class="editor-header">
      <div class="left">
        <button class="btn ghost" type="button" @click="handleBack">
          <Icon name="mdi:arrow-left" />
          返回列表
        </button>
        <div class="title-block">
          <p class="eyebrow">{{ isEdit ? '编辑文章' : '新建文章' }}</p>
          <h1>{{ form.title || '未命名文章' }}</h1>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn ghost" type="button" @click="handleCancel">
          <Icon name="mdi:close" />
          取消
        </button>
        <button class="btn primary" type="button" :disabled="saving" @click="handleSave">
          <Icon v-if="saving" name="mdi:loading" class="spinning" />
          <Icon v-else name="mdi:content-save" />
          {{ saving ? '保存中...' : form.isPublished ? '保存并发布' : '保存草稿' }}
        </button>
      </div>
    </header>

    <section class="meta-panel">
      <div class="panel-block full-row">
        <label class="label">
          标题 <span class="required">*</span>
        </label>
        <input
          v-model="form.title"
          class="input"
          type="text"
          placeholder="请输入文章标题..."
          required
        />
      </div>

      <div class="panel-grid">
        <div class="panel-block">
          <label class="label">
            Slug (URL)
            <span class="hint">留空将自动从标题生成</span>
          </label>
          <input v-model="form.slug" class="input" type="text" placeholder="article-slug" />
        </div>

        <div class="panel-block">
          <label class="label">分类</label>
          <select v-model="category" class="input select">
            <option value="">未分类</option>
            <option v-for="item in categories" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="panel-block">
          <label class="label">状态</label>
          <div class="radio-group">
            <label class="radio">
              <input v-model="form.isPublished" type="radio" :value="true" />
              <span>发布</span>
            </label>
            <label class="radio">
              <input v-model="form.isPublished" type="radio" :value="false" />
              <span>草稿</span>
            </label>
          </div>
        </div>

        <div class="panel-block">
          <label class="label">封面图 URL</label>
          <input
            v-model="form.cover"
            class="input"
            type="text"
            placeholder="https://..."
          />
        </div>

        <div class="panel-block file-upload">
          <label class="label">上传封面</label>
          <div class="upload-row">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden-input"
              @change="handleFileSelect"
            />
            <button
              class="btn ghost"
              type="button"
              :disabled="uploading"
              @click="fileInputRef?.click()"
            >
              <Icon :name="uploading ? 'mdi:loading' : 'mdi:upload'" :class="{ spinning: uploading }" />
              {{ uploading ? '上传中...' : '选择图片' }}
            </button>
            <p class="hint">支持直接上传或粘贴 URL</p>
          </div>
        </div>

        <div class="panel-block">
          <label class="label">标签（回车添加）</label>
          <div class="tags">
            <span v-for="(tag, index) in form.tags" :key="`${tag}-${index}`" class="tag">
              {{ tag }}
              <button class="tag-remove" type="button" @click="removeTag(index)">
                <Icon name="mdi:close" />
              </button>
            </span>
          </div>
          <div class="tag-input-row">
            <input
              v-model="tagInput"
              class="input"
              type="text"
              placeholder="输入标签后回车"
              @keyup.enter="addTag"
            />
            <button class="btn ghost small" type="button" @click="addTag">添加</button>
          </div>
        </div>
      </div>

      <div class="panel-block split-row">
        <div class="panel-block">
          <label class="label">摘要</label>
          <textarea
            v-model="form.summary"
            class="input textarea summary-area"
            rows="6"
            placeholder="用一两句话概括文章内容"
          />
        </div>
        <div class="panel-block">
          <label class="label">封面预览</label>
          <div class="cover-preview">
            <div v-if="form.cover" class="cover-thumb">
              <img :src="form.cover" alt="封面预览" />
              <button class="cover-remove" type="button" @click="form.cover = ''">
                <Icon name="mdi:close" />
              </button>
            </div>
            <div v-else class="cover-placeholder">
              <Icon name="mdi:image-outline" />
              <span>封面预览</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="workspace">
      <div class="panel-block">
        <div class="content-header">
          <div>
            <p class="eyebrow">Markdown</p>
            <h3>正文内容</h3>
          </div>
          <span class="hint">支持 Markdown / 代码块 / 数学公式</span>
        </div>
        <div class="content-columns">
          <div class="editor-pane">
            <label class="mini-label">编辑</label>
            <textarea
              v-model="form.content"
              class="input editor-textarea"
              placeholder="# 在这里输入 Markdown..."
            />
          </div>
          <div class="preview-pane">
            <div class="preview-header">
              <label class="mini-label">预览</label>
              <span class="hint">{{ rendererReady ? '实时渲染' : '渲染器初始化中...' }}</span>
            </div>
            <div class="preview-body markdown-body" v-html="previewHtml" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
// @ts-ignore - markdown-it-katex has no types
import markdownItKatex from 'markdown-it-katex'
import markdownItAnchor from 'markdown-it-anchor'
import { createHighlighter } from 'shiki'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.query.slug)
const saving = ref(false)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const tagInput = ref('')
const category = ref('')
const categories = ref(['Tech', 'Life', 'Note'])
const previewHtml = ref('<p>实时预览</p>')
const mdRenderer = ref<MarkdownIt | null>(null)
const rendererReady = ref(false)

const form = reactive({
  id: '',
  title: '',
  slug: '',
  content: '',
  summary: '',
  cover: '',
  tags: [] as string[],
  isPublished: true
})

const slugify = (str: string): string => {
  return encodeURIComponent(str.toLowerCase().trim().replace(/\s+/g, '-'))
}

const initRenderer = async () => {
  if (mdRenderer.value) return
  const highlighter = await createHighlighter({
    themes: ['one-dark-pro'],
    langs: ['js', 'ts', 'vue', 'py', 'bash', 'sh', 'json', 'html', 'css', 'scss', 'md', 'yaml', 'yml', 'sql', 'go', 'rust', 'java', 'cpp', 'c']
  })

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (code: string, lang: string) => {
      if (!lang) {
        return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`
      }
      try {
        return highlighter.codeToHtml(code, {
          lang: lang.toLowerCase(),
          theme: 'one-dark-pro'
        })
      } catch (e) {
        return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`
      }
    }
  })
    .use(markdownItKatex)
    .use(markdownItAnchor, {
      level: [1, 2, 3],
      slugify,
      permalink: false
    })

  mdRenderer.value = md
  rendererReady.value = true
}

const updatePreview = () => {
  if (!mdRenderer.value) {
    previewHtml.value = form.content || ''
    return
  }
  previewHtml.value = mdRenderer.value.render(form.content || '')
}

watch(
  () => form.content,
  () => updatePreview()
)

const loadArticle = async () => {
  if (!isEdit.value) return

  try {
    const response = await $fetch(`/api/blog/${route.query.slug}`)
    if (response.success && response.data.article) {
      const article = response.data.article
      form.id = article._id || ''
      form.title = article.title || ''
      form.slug = article.slug || ''
      form.content = article.content || ''
      form.summary = article.summary || ''
      form.cover = article.cover || article.coverImage || ''
      form.tags = Array.isArray(article.tags) ? article.tags.map((t: any) => t.name || t) : []
      form.isPublished = article.isPublished !== false
      category.value = article.category?.name || ''
    }
  } catch (err: any) {
    alert(err?.data?.message || err?.message || '加载文章失败')
    router.push('/admin/articles')
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      form.cover = response.data.url
    }
  } catch (err: any) {
    alert(err?.data?.message || err?.message || '上传失败')
  } finally {
    uploading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
  }
  tagInput.value = ''
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const handleSave = async () => {
  if (!form.title.trim() || !form.content.trim()) {
    alert('请填写标题和正文')
    return
  }

  saving.value = true

  try {
    await $fetch('/api/articles/save', {
      method: 'POST',
      body: {
        id: form.id || undefined,
        title: form.title,
        slug: form.slug,
        content: form.content,
        summary: form.summary,
        cover: form.cover,
        tags: form.tags,
        isPublished: form.isPublished
      }
    })

    router.push('/admin/articles')
  } catch (err: any) {
    alert(err?.data?.message || err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  if (confirm('确定要取消吗？未保存的更改将会丢失。')) {
    router.push('/admin/articles')
  }
}

const handleBack = () => {
  router.push('/admin/articles')
}

onMounted(() => {
  loadArticle()
  initRenderer().then(updatePreview)
})
</script>

<style scoped>
.editor-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.editor-header .left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.title-block h1 {
  margin: 4px 0 0;
  font-size: 24px;
  color: #111827;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  color: #7c3aed;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 10px;
  padding: 10px 14px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  background: #f3f4f6;
  color: #111827;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #7c3aed, #6366f1);
  color: #fff;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
}

.btn.ghost {
  border-color: #e5e7eb;
  background: #fff;
}

.btn.small {
  padding: 8px 12px;
  border-radius: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.meta-panel,
.workspace {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.08);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.split-row .panel-block {
  height: 100%;
  overflow: hidden;
}

.panel-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.full-row {
  grid-column: 1 / -1;
}

.split-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  align-items: flex-start;
  max-height: 220px;
}

.content-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-height: calc(100vh - 300px);
}

.editor-pane,
.preview-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  min-height: 80vh;
}

.mini-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 700;
}

.editor-textarea {
  min-height: 80vh;
  font-family: 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace;
  line-height: 1.6;
  resize: vertical;
  background: #fff;
  overflow: auto;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-body {
  min-height: 80vh;
  padding: 12px;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.85));
  border: 1px solid #e5e7eb;
  overflow: auto;
}

.label {
  font-weight: 600;
  color: #111827;
}

.required {
  color: #ef4444;
}

.hint {
  font-size: 12px;
  color: #6b7280;
}

.input {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f9fafb;
  outline: none;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #111827;
}

.input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  background: #fff;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.summary-area {
  flex: 1;
  min-height: auto;
  resize: none;
}

.select {
  background: #fff;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #eef2ff;
  color: #4338ca;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
}

.tag-remove {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.tag-input-row {
  display: flex;
  gap: 8px;
}

.cover-preview {
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  background: #f9fafb;
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cover-thumb {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  width: 100%;
  height: 100%;
}

.cover-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #9ca3af;
  padding: 20px;
  width: 100%;
  height: 100%;
}

.cover-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

.radio-group {
  display: flex;
  gap: 12px;
}

.radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #374151;
}

.file-upload .upload-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hidden-input {
  display: none;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.content-header h3 {
  margin: 2px 0;
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

@media (max-width: 1024px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }

  .split-row {
    grid-template-columns: 1fr;
    height: auto;
  }

  .content-columns {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .editor-pane,
  .preview-pane {
    min-height: 60vh;
  }

  .split-row .panel-block {
    height: auto;
  }
}
</style>
