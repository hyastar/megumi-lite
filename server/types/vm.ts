/**
 * ViewModel 类型定义
 * API 层统一输出格式，确保前端始终接收一致的数据结构
 */

export interface CategoryVM {
  _id: string
  name: string
  slug: string
}

export interface TagVM {
  _id: string
  name: string
  slug: string
}

export interface ArticleListItemVM {
  _id: string
  title: string
  slug: string
  summary: string
  coverImage: string
  category: CategoryVM | null
  tags: TagVM[]
  views: number
  isTop: boolean
  isPublished: boolean
  publishedAt: string // ISO date string
  createdAt: string
  updatedAt: string
}

export interface ArticleDetailVM extends ArticleListItemVM {
  content: string
}

