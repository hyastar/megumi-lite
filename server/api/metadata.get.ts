import { Article } from '../models/article.schema'
import { Category } from '../models/category.schema'
import { Tag } from '../models/tag.schema'

/**
 * GET /api/metadata
 * 返回标签和分类的列表（带文章计数）
 * 用于标签云和分类列表页面
 */
export default defineEventHandler(async (event) => {
  try {
    // 获取所有已发布的文章
    const publishedArticles = await Article.find({ isPublished: true })
      .select('category tags')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .lean()
    
    // 统计每个分类的文章数量
    const categoryCountMap = new Map<string, { name: string; slug: string; count: number }>()
    publishedArticles.forEach((article: any) => {
      if (article.category) {
        const catId = String(article.category._id)
        const catName = article.category.name || ''
        const catSlug = article.category.slug || ''
        
        if (categoryCountMap.has(catId)) {
          const existing = categoryCountMap.get(catId)!
          existing.count++
        } else {
          categoryCountMap.set(catId, {
            name: catName,
            slug: catSlug,
            count: 1
          })
        }
      }
    })
    
    // 统计每个标签的文章数量
    const tagCountMap = new Map<string, { name: string; slug: string; count: number }>()
    publishedArticles.forEach((article: any) => {
      if (Array.isArray(article.tags)) {
        article.tags.forEach((tag: any) => {
          if (tag) {
            const tagId = String(tag._id)
            const tagName = tag.name || ''
            const tagSlug = tag.slug || ''
            
            if (tagCountMap.has(tagId)) {
              const existing = tagCountMap.get(tagId)!
              existing.count++
            } else {
              tagCountMap.set(tagId, {
                name: tagName,
                slug: tagSlug,
                count: 1
              })
            }
          }
        })
      }
    })
    
    // 转换为数组并排序（按文章数量降序）
    const categories = Array.from(categoryCountMap.values())
      .sort((a, b) => b.count - a.count)
    
    const tags = Array.from(tagCountMap.values())
      .sort((a, b) => b.count - a.count)
    
    return {
      success: true,
      categories,
      tags
    }
  } catch (error: any) {
    console.error('[API] 获取元数据失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch metadata'
    })
  }
})

