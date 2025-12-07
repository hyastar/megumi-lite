<template>
  <div class="gallery-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">📍 图集管理</p>
        <h1>上传与预览</h1>
        <p class="subtitle">拖拽上传、网格预览，一键复制图片链接。</p>
      </div>
      <button class="btn primary" type="button" @click="fileInputRef?.click()">
        <Icon :name="uploading ? 'mdi:loading' : 'mdi:cloud-upload-outline'" :class="{ spinning: uploading }" />
        {{ uploading ? '上传中...' : '点击上传' }}
      </button>
    </header>

    <section
      class="dropzone"
      :class="{ active: dragActive }"
      @dragenter.prevent="handleDragEnter"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInputRef"
        class="hidden-input"
        type="file"
        accept="image/*"
        multiple
        @change="handleFileSelect"
      />
      <Icon name="mdi:cloud-upload-outline" class="drop-icon" />
      <div class="drop-text">
        <p>把图片拖到这里，或者 <button class="link-btn" type="button" @click="fileInputRef?.click()">点击上传</button></p>
        <p class="hint">支持 MinIO / S3 / R2 / 自定义接口；多文件自动排队上传</p>
      </div>
    </section>

    <section class="grid-card">
      <div class="grid-header">
        <div>
          <p class="eyebrow">图片瀑布流</p>
          <h3>网格预览</h3>
        </div>
        <div class="grid-meta">
          <span>共 {{ images.length }} 张</span>
          <span class="dot">•</span>
          <span>点击缩略图可复制链接</span>
        </div>
      </div>

      <div v-if="!images.length" class="empty-state">
        <Icon name="mdi:image-off-outline" />
        <p>还没有图片，先上传几张吧。</p>
      </div>

      <div v-else class="image-grid">
        <div v-for="item in images" :key="item.id" class="image-card">
          <div class="thumb" @click="copyLink(item.url)">
            <img :src="item.url" :alt="item.caption" loading="lazy" />
            <div class="overlay">
              <span>📋 复制链接</span>
              <span class="small">{{ formatDimensions(item.width, item.height) }}</span>
            </div>
          </div>
          <div class="card-footer">
            <div class="info">
              <p class="name" :title="item.caption">{{ item.caption }}</p>
              <p class="meta">{{ item.createdAt ? formatTime(item.createdAt) : '刚刚' }}</p>
            </div>
            <div class="actions">
              <button class="btn ghost small" type="button" @click="copyLink(item.url)">
                <Icon name="mdi:content-copy" />
              </button>
              <button class="btn danger small" type="button" @click="removeLocal(item.url)">
                <Icon name="mdi:trash-can-outline" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="load-more">
        <button class="btn ghost" type="button" :disabled="!hasMore || pagination.loading" @click="loadMore">
          {{ hasMore ? '👇 加载更多' : '没有更多了' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

type GalleryItem = {
  id: string
  url: string
  width: number
  height: number
  caption: string
  createdAt: string
}

const images = ref<GalleryItem[]>([])
const uploading = ref(false)
const dragActive = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0,
  loading: false
})

const hasMore = computed(() => pagination.page * pagination.limit < pagination.total)

const makeTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const mapPhoto = (item: any): GalleryItem => ({
  id: item._id || item.id || makeTempId(),
  url: item.url || '',
  width: item.width || 0,
  height: item.height || 0,
  caption: item.caption || '未命名图片',
  createdAt: item.createdAt || new Date().toISOString()
})

const fetchPhotos = async (pageToLoad = 1, append = false) => {
  pagination.loading = true
  try {
    const response: any = await $fetch('/api/gallery', {
      query: {
        page: pageToLoad,
        limit: pagination.limit
      }
    })

    const list = response?.data?.list || []
    const mapped = list.map(mapPhoto)
    if (append) {
      images.value = [...images.value, ...mapped]
    } else {
      images.value = mapped
    }

    pagination.total = response?.data?.total ?? images.value.length
    pagination.page = pageToLoad
  } catch (err: any) {
    console.error(err)
    alert(err?.data?.message || err?.message || '获取图集失败')
  } finally {
    pagination.loading = false
  }
}

const formatDimensions = (w: number, h: number) => {
  if (!w || !h) return '未知尺寸'
  return `${w} × ${h}`
}

const formatTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const copyLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    alert('已复制图片链接')
  } catch (err) {
    alert('复制失败，请手动复制')
  }
}

const removeLocal = (url: string) => {
  if (!confirm('仅从列表移除，未真正删除服务器文件。继续吗？')) return
  images.value = images.value.filter(item => item.url !== url)
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  uploadFiles(files)
  if (target) target.value = ''
}

const handleDragEnter = () => {
  dragActive.value = true
}
const handleDragOver = () => {
  dragActive.value = true
}
const handleDragLeave = () => {
  dragActive.value = false
}

const handleDrop = (event: DragEvent) => {
  dragActive.value = false
  const files = Array.from(event.dataTransfer?.files || []).filter(file => file.type.startsWith('image/'))
  uploadFiles(files)
}

const uploadFiles = async (files: File[]) => {
  if (!files.length) return
  uploading.value = true

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response: any = await $fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (response?.success) {
        images.value.unshift({
          id: response.data.url || makeTempId(),
          url: response.data.url,
          width: 0,
          height: 0,
          caption: response.data.filename || file.name,
          createdAt: new Date().toISOString()
        })
      }
    } catch (err: any) {
      console.error(err)
      alert(err?.data?.message || err?.message || '上传失败')
    }
  }

  uploading.value = false
}

const loadMore = () => {
  if (pagination.loading || !hasMore.value) return
  fetchPhotos(pagination.page + 1, true)
}

onMounted(() => {
  fetchPhotos(1, false)
})
</script>

<style scoped>
.gallery-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow {
  margin: 0;
  color: #7c3aed;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.subtitle {
  margin: 0;
  color: #6b7280;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn.primary {
  background: linear-gradient(120deg, #7c3aed, #6366f1);
  color: #fff;
  border: none;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
}

.btn.ghost {
  background: #f9fafb;
}

.btn.danger {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecdd3;
}

.btn.small {
  padding: 8px 10px;
  border-radius: 8px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 30px;
  background: #f9fafb;
  display: grid;
  place-items: center;
  gap: 10px;
  text-align: center;
  transition: all 0.2s ease;
}

.dropzone.active {
  border-color: #6366f1;
  background: #eef2ff;
  box-shadow: 0 10px 24px rgba(99, 102, 241, 0.18);
}

.drop-icon {
  font-size: 36px;
  color: #7c3aed;
}

.drop-text p {
  margin: 4px 0;
}

.link-btn {
  border: none;
  background: none;
  color: #7c3aed;
  font-weight: 700;
  cursor: pointer;
}

.hint {
  color: #9ca3af;
  font-size: 13px;
}

.grid-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 12px 28px rgba(17, 24, 39, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grid-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grid-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-weight: 600;
}

.grid-meta .dot {
  width: 4px;
  height: 4px;
  background: #d1d5db;
  border-radius: 50%;
  display: inline-block;
}

.empty-state {
  display: grid;
  place-items: center;
  padding: 30px;
  gap: 6px;
  color: #9ca3af;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.image-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

.thumb {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  cursor: pointer;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}

.thumb:hover img {
  transform: scale(1.02);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.55));
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  padding: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
  font-weight: 700;
}

.overlay .small {
  font-size: 12px;
  font-weight: 500;
  opacity: 0.8;
}

.thumb:hover .overlay {
  opacity: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  gap: 8px;
}

.info {
  min-width: 0;
}

.name {
  margin: 0;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 6px;
}

.load-more {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.hidden-input {
  display: none;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
