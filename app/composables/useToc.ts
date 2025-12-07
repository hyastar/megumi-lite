import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'

const slugify = (str: string): string => encodeURIComponent(str.toLowerCase().trim().replace(/\s+/g, '-'))

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
}).use(markdownItAnchor, {
  level: [1, 2, 3],
  slugify,
  permalink: false
})

export const useToc = () => {
  const extract = (markdown: string) => {
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

  return { extract }
}
