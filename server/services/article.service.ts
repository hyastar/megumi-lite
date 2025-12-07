import { Article } from '../models/article.schema'
import type { ArticleListItemVM, ArticleDetailVM } from '../types/vm'
import { toArticleListItemVM, toArticleDetailVM } from '../utils/toVM'

/**
 * 文章服务层
 * 负责数据查询和 ViewModel 转换
 */

/**
 * 获取文章列表（只返回已发布的文章）
 */
export async function listArticles(): Promise<ArticleListItemVM[]> {
  const articles = await Article.find({ isPublished: true })
    .select('-content') // 不选择 content 字段
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .sort({ publishedAt: -1 })
    .lean()
  
  return articles.map(toArticleListItemVM)
}

/**
 * 根据 slug 获取文章详情
 */
export async function getArticleBySlug(slug: string): Promise<ArticleDetailVM | null> {
  const article = await Article.findOne({ slug, isPublished: true })
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .lean()
  
  if (!article) {
    return null
  }
  
  return toArticleDetailVM(article)
}

