import { Article } from '../../models/article.schema'
import MarkdownIt from 'markdown-it'
// @ts-ignore - markdown-it-katex 没有类型定义
import markdownItKatex from 'markdown-it-katex'
import markdownItAnchor from 'markdown-it-anchor'
import { createHighlighter } from 'shiki'
import { getRequestHeader, getRequestIP, parseCookies } from 'h3'
import { redis } from '../../utils/redis'
// 全局缓存 Shiki 实例
let shikiHighlighter: Awaited<ReturnType<typeof createHighlighter>> | null = null

// 初始化 Shiki（只初始化一次）
async function initShiki() {
  if (!shikiHighlighter) {
    shikiHighlighter = await createHighlighter({
      themes: ['one-dark-pro'],
      langs: ['js', 'ts', 'vue', 'py', 'bash', 'sh', 'json', 'html', 'css', 'scss', 'md', 'yaml', 'yml', 'sql', 'go', 'rust', 'java', 'cpp', 'c']
    })
  }
  return shikiHighlighter
}

// 统一的 slugify 函数，确保 TOC 和 anchor ID 一致
const slugify = (str: string): string => {
  // 使用 encodeURIComponent 支持中文标题生成合法的 ID
  return encodeURIComponent(str.toLowerCase().trim().replace(/\s+/g, '-'))
}

// 创建 Markdown 解析器实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
}).use(markdownItKatex)
  .use(markdownItAnchor, {
    level: [1, 2, 3], // 只处理 h1, h2, h3
    slugify,
    permalink: false // 不自动添加锚点链接
  })

// 提取 TOC 的函数
function extractToc(content: string): Array<{ id: string; text: string; level: number }> {
  const toc: Array<{ id: string; text: string; level: number }> = []
  const tokens = md.parse(content, {})
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.substring(1)) // h1 -> 1, h2 -> 2, etc.
      if (level >= 1 && level <= 3) {
        // 找到下一个 inline token 来获取标题文本
        const inlineToken = tokens[i + 1]
        if (inlineToken && inlineToken.type === 'inline') {
          const text = inlineToken.content || ''
          const id = slugify(text) // 使用相同的 slugify 函数
          toc.push({ id, text, level })
        }
      }
    }
  }
  
  return toc
}

/**
 * GET /api/articles/[slug]
 * 返回文章详情（包含渲染好的 HTML content）
 */
export default defineEventHandler(async (event) => {
  try {
    const slugOrId = getRouterParam(event, 'slug')
    
    if (!slugOrId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Article slug or id is required'
      })
    }

    // 防刷：基于 Cookie 和 IP 的 24h 锁
    const cookies = parseCookies(event)
    const visitorId = cookies.visitor_id || 'anonymous'
    const clientIp = getRequestIP(event) || getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const lockKey = `viewed:article:${slugOrId}:user:${visitorId}`
    let shouldIncrement = true
    let redisHealthy = true

    try {
      const exists = await redis.exists(lockKey)
      if (exists) {
        shouldIncrement = false
      }
    } catch (err) {
      redisHealthy = false
      console.error('[redis] check view lock failed', err)
    }
    
    // 支持通过 _id 或 slug 查询
    const query = /^[0-9a-fA-F]{24}$/.test(slugOrId) 
      ? { _id: slugOrId, isPublished: true }
      : { slug: slugOrId, isPublished: true }
    
    const article = await Article.findOne(query)
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .lean()
    
    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article not found'
      })
    }
    
    // 增加浏览量并写入防刷锁（降级保护，Redis异常不影响页面）
    if (shouldIncrement) {
      try {
        await Article.updateOne(query, { $inc: { views: 1 } })
        article.views = (article.views || 0) + 1

        if (redisHealthy) {
          // 不阻塞主流程
          redis.set(lockKey, clientIp || '1', 'EX', 60 * 60 * 24, 'NX').catch((err) => {
            console.error('[redis] set view lock failed', err)
          })
        }
      } catch (err) {
        console.error('[article] increase view failed', err)
      }
    }
    
    // 初始化 Shiki（如果还未初始化）
    const highlighter = await initShiki()
    
    // 配置 markdown-it 使用 Shiki 渲染代码块
    md.set({
      highlight: (code: string, lang: string) => {
        if (!lang || !highlighter) {
          return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`
        }
        
        try {
          return highlighter.codeToHtml(code, {
            lang: lang.toLowerCase(),
            theme: 'one-dark-pro'
          })
        } catch (e) {
          // 如果高亮失败，返回转义的代码
          return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`
        }
      }
    })
    
    // 将 Markdown 转换为 HTML
    const htmlContent = md.render(article.content || '')
    
    // 提取目录 (TOC)
    const toc = extractToc(article.content || '')
    
    // 查找上一篇和下一篇文章
    const [prevArticle, nextArticle] = await Promise.all([
      Article.findOne({
        publishedAt: { $lt: article.publishedAt },
        isPublished: true
      })
        .sort({ publishedAt: -1 })
        .select('slug title')
        .lean(),
      Article.findOne({
        publishedAt: { $gt: article.publishedAt },
        isPublished: true
      })
        .sort({ publishedAt: 1 })
        .select('slug title')
        .lean()
    ])
    
    // map 输出，确保 _id 转为 string，category/tags 为对象结构
    // 【关键修改】：这里要把文章详情包在 'article' 字段里，把上一篇下一篇放在外面
    return {
      article: {
        _id: String(article._id),
        title: article.title || '',
        slug: article.slug || '',
        summary: article.summary || '',
        content: htmlContent, // 渲染好的 HTML
        coverImage: article.coverImage || '',
        publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
        views: article.views || 0,
        isTop: article.isTop || false,
        isPublished: article.isPublished !== false,
        category: article.category ? {
          _id: String(article.category._id),
          name: article.category.name || '',
          slug: article.category.slug || ''
        } : null,
        tags: Array.isArray(article.tags) 
          ? article.tags.map((tag: any) => ({
              _id: String(tag._id),
              name: tag.name || '',
              slug: tag.slug || ''
            }))
          : [],
        createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString(),
        toc, // 添加目录数据
      },
      // 上一篇和下一篇放在 article 对象的同级，而不是里面
      prevArticle: prevArticle ? {
        slug: prevArticle.slug || '',
        title: prevArticle.title || ''
      } : null,
      nextArticle: nextArticle ? {
        slug: nextArticle.slug || '',
        title: nextArticle.title || ''
      } : null
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('[API] 查询文章详情失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch article'
    })
  }
})
