import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
// @ts-ignore - markdown-it-katex has no types
import markdownItKatex from 'markdown-it-katex'
import { createHighlighter } from 'shiki'

const slugify = (str: string): string => {
  return encodeURIComponent(str.toLowerCase().trim().replace(/\s+/g, '-'))
}

let rendererPromise: Promise<MarkdownIt> | null = null

const getRenderer = async () => {
  if (rendererPromise) return rendererPromise

  rendererPromise = (async () => {
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

    return md
  })()

  return rendererPromise
}

export const renderMarkdown = async (markdown: string): Promise<string> => {
  const md = await getRenderer()
  return md.render(markdown || '')
}

export const extractToc = async (markdown: string): Promise<Array<{ id: string; text: string; level: number }>> => {
  const md = await getRenderer()
  const toc: Array<{ id: string; text: string; level: number }> = []
  const tokens = md.parse(markdown || '', {})

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.substring(1))
      if (level >= 1 && level <= 3) {
        const inlineToken = tokens[i + 1]
        if (inlineToken && inlineToken.type === 'inline') {
          const text = inlineToken.content || ''
          const id = slugify(text)
          toc.push({ id, text, level })
        }
      }
    }
  }

  return toc
}
