import { Article } from '../models/article.schema'
import { Category } from '../models/category.schema'
import { Tag } from '../models/tag.schema'

/**
 * GET /api/articles
 * 返回文章列表（不包含 content）
 * 支持查询参数：
 * - category: 分类 slug
 * - tag: 标签 slug
 * - page: 页码（从 1 开始，默认 1）
 * - limit: 每页数量（默认不限制）
 * - mode: 'archive' - 归档模式，只返回 title, slug, publishedAt 字段
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const mode = query.mode as string | undefined
    const categorySlug = query.category as string | undefined
    const tagSlug = query.tag as string | undefined
    const page = parseInt(query.page as string) || 1
    const limit = query.limit ? parseInt(query.limit as string) : undefined
    
    // 归档模式：只返回轻量级数据
    if (mode === 'archive') {
      const filter: any = { isPublished: true }
      
      const articles = await Article.find(filter)
        .select('title slug publishedAt') // 只选择这三个字段
        .sort({ publishedAt: -1 }) // 按时间倒序
        .lean()
      
      const mappedArticles = articles.map((article: any) => ({
        title: article.title || '',
        slug: article.slug || '',
        publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString()
      }))
      
      return mappedArticles
    }
    
    // 构建查询条件
    const filter: any = { isPublished: true }
    
    // 如果指定了分类，先查找分类 ID
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug }).lean()
      if (category) {
        filter.category = category._id
      } else {
        // 如果分类不存在，返回空数组
        return { articles: [], total: 0, page: 1, limit: limit || 0, totalPages: 0 }
      }
    }
    
    // 如果指定了标签，先查找标签 ID
    if (tagSlug) {
      const tag = await Tag.findOne({ slug: tagSlug }).lean()
      if (tag) {
        filter.tags = tag._id
      } else {
        // 如果标签不存在，返回空数组
        return { articles: [], total: 0, page: 1, limit: limit || 0, totalPages: 0 }
      }
    }
    
    // 计算总数
    const total = await Article.countDocuments(filter)
    
    // 构建查询
    let queryBuilder = Article.find(filter)
      .select('-content') // 不选择 content 字段
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .sort({ publishedAt: -1 })
    
    // 如果指定了 limit，应用分页
    if (limit) {
      const skip = (page - 1) * limit
      queryBuilder = queryBuilder.skip(skip).limit(limit)
    }
    
    const articles = await queryBuilder.lean()
    
    // 计算总页数
    const totalPages = limit ? Math.ceil(total / limit) : 1
    
    // map 输出，确保 _id 转为 string，category/tags 为对象结构
    const mappedArticles = articles.map((article: any) => ({
      _id: String(article._id),
      title: article.title || '',
      slug: article.slug || '',
      summary: article.summary || '',
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
      updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString()
    }))
    
    // 如果指定了 limit，返回分页信息；否则返回数组（向后兼容）
    if (limit) {
      return {
        articles: mappedArticles,
        total,
        page,
        limit,
        totalPages
      }
    }
    
    // 向后兼容：如果没有 limit，直接返回数组
    return mappedArticles
  } catch (error: any) {
    console.error('[API] 查询文章列表失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch articles'
    })
  }
})
