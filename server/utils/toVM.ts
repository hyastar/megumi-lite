import type { CategoryVM, TagVM, ArticleListItemVM, ArticleDetailVM } from '../types/vm'

/**
 * ViewModel 转换工具
 * 将 Mongoose lean 对象转换为统一的 ViewModel 格式
 */

/**
 * 转换分类为 ViewModel
 */
export function toCategoryVM(category: any): CategoryVM | null {
  if (!category) return null
  
  // 处理 populate 后的对象
  if (typeof category === 'object' && category._id) {
    return {
      _id: String(category._id),
      name: category.name || '',
      slug: category.slug || ''
    }
  }
  
  return null
}

/**
 * 转换标签为 ViewModel
 */
export function toTagVM(tag: any): TagVM | null {
  if (!tag) return null
  
  // 处理 populate 后的对象
  if (typeof tag === 'object' && tag._id) {
    return {
      _id: String(tag._id),
      name: tag.name || '',
      slug: tag.slug || ''
    }
  }
  
  return null
}

/**
 * 转换文章列表项为 ViewModel
 */
export function toArticleListItemVM(article: any): ArticleListItemVM {
  return {
    _id: String(article._id),
    title: article.title || '',
    slug: article.slug || '',
    summary: article.summary || '',
    coverImage: article.coverImage || '',
    category: toCategoryVM(article.category),
    tags: Array.isArray(article.tags) 
      ? article.tags.map(toTagVM).filter((tag: TagVM | null): tag is TagVM => tag !== null)
      : [],
    views: article.views || 0,
    isTop: article.isTop || false,
    isPublished: article.isPublished !== false, // 默认 true
    publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
    createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString()
  }
}

/**
 * 转换文章详情为 ViewModel
 */
export function toArticleDetailVM(article: any): ArticleDetailVM {
  const base = toArticleListItemVM(article)
  return {
    ...base,
    content: article.content || ''
  }
}

