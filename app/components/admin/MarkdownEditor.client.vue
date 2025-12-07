<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <button
          v-for="tool in tools"
          :key="tool.name"
          @click="insertMarkdown(tool.pattern)"
          :title="tool.title"
          class="toolbar-btn"
        >
          <Icon :name="tool.icon" />
        </button>
      </div>
      <div class="toolbar-right">
        <button
          @click="togglePreview"
          class="toolbar-btn"
          :class="{ active: showPreview }"
        >
          <Icon name="mdi:eye" />
          {{ showPreview ? '编辑' : '预览' }}
        </button>
      </div>
    </div>

    <div class="editor-content" :class="{ 'preview-mode': showPreview }">
      <textarea
        v-if="!showPreview"
        v-model="localValue"
        @input="handleInput"
        class="editor-textarea"
        :placeholder="placeholder"
        ref="textareaRef"
      />
      <div
        v-else
        class="editor-preview markdown-body"
        v-html="renderedContent"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '开始编写你的文章...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(props.modelValue)
const showPreview = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const tools = [
  {
    name: 'bold',
    icon: 'mdi:format-bold',
    title: '粗体',
    pattern: { before: '**', after: '**', placeholder: '粗体文字' }
  },
  {
    name: 'italic',
    icon: 'mdi:format-italic',
    title: '斜体',
    pattern: { before: '*', after: '*', placeholder: '斜体文字' }
  },
  {
    name: 'heading',
    icon: 'mdi:format-header-1',
    title: '标题',
    pattern: { before: '# ', after: '', placeholder: '标题' }
  },
  {
    name: 'link',
    icon: 'mdi:link',
    title: '链接',
    pattern: { before: '[', middle: '](', after: ')', placeholder: '链接文字', placeholder2: 'https://' }
  },
  {
    name: 'image',
    icon: 'mdi:image',
    title: '图片',
    pattern: { before: '![', middle: '](', after: ')', placeholder: '图片描述', placeholder2: '/path/to/image.jpg' }
  },
  {
    name: 'code',
    icon: 'mdi:code-tags',
    title: '代码',
    pattern: { before: '`', after: '`', placeholder: '代码' }
  },
  {
    name: 'quote',
    icon: 'mdi:format-quote-close',
    title: '引用',
    pattern: { before: '> ', after: '', placeholder: '引用内容' }
  },
  {
    name: 'list',
    icon: 'mdi:format-list-bulleted',
    title: '列表',
    pattern: { before: '- ', after: '', placeholder: '列表项' }
  }
]

const handleInput = () => {
  emit('update:modelValue', localValue.value)
}

watch(() => props.modelValue, (newValue) => {
  if (newValue !== localValue.value) {
    localValue.value = newValue
  }
})

const insertMarkdown = (pattern: any) => {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = localValue.value.substring(start, end)
  const hasSelection = selectedText.length > 0

  let insertText = ''
  let newCursorPos = start

  if (pattern.middle) {
    // 有中间部分（如链接、图片）
    if (hasSelection) {
      insertText = `${pattern.before}${selectedText}${pattern.middle}${pattern.placeholder2}${pattern.after}`
      newCursorPos = start + pattern.before.length + selectedText.length + pattern.middle.length + pattern.placeholder2.length
    } else {
      insertText = `${pattern.before}${pattern.placeholder}${pattern.middle}${pattern.placeholder2}${pattern.after}`
      newCursorPos = start + pattern.before.length + pattern.placeholder.length + pattern.middle.length
    }
  } else {
    // 没有中间部分
    if (hasSelection) {
      insertText = `${pattern.before}${selectedText}${pattern.after}`
      newCursorPos = start + pattern.before.length + selectedText.length + pattern.after.length
    } else {
      insertText = `${pattern.before}${pattern.placeholder}${pattern.after}`
      newCursorPos = start + pattern.before.length + pattern.placeholder.length + pattern.after.length
    }
  }

  const newValue =
    localValue.value.substring(0, start) +
    insertText +
    localValue.value.substring(end)

  localValue.value = newValue
  emit('update:modelValue', newValue)

  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// 简单的 Markdown 渲染（实际项目中应使用 marked 或 markdown-it）
const renderedContent = computed(() => {
  let html = localValue.value

  // 转义 HTML
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')

  // 斜体
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')

  // 代码块
  html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>')

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />')

  // 引用
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

  // 列表
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  // 段落
  html = html.replace(/\n\n/gim, '</p><p>')
  html = '<p>' + html + '</p>'

  return html
})
</script>

<style scoped lang="scss">
.markdown-editor {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(73, 177, 245, 0.05);
  border-bottom: 1px solid var(--border-light);
}

.toolbar-left {
  display: flex;
  gap: var(--spacing-xs);
}

.toolbar-right {
  display: flex;
  gap: var(--spacing-xs);
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-color);
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--font-size-base);

  & svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba(73, 177, 245, 0.1);
    border-color: var(--border-color);
  }

  &.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
  }
}

.editor-content {
  position: relative;
  min-height: 400px;
}

.editor-textarea {
  width: 100%;
  min-height: 400px;
  padding: var(--spacing-lg);
  border: none;
  outline: none;
  font-family: 'LXGW WenKai Mono Screen', monospace;
  font-size: var(--font-size-base);
  line-height: var(--line-height);
  color: var(--text-color);
  background: var(--card-bg);
  resize: vertical;

  &::placeholder {
    color: var(--text-light);
  }
}

.editor-preview {
  min-height: 400px;
  padding: var(--spacing-lg);
  overflow-y: auto;
  max-height: 600px;
}

.preview-mode {
  .editor-preview {
    max-height: none;
  }
}
</style>

