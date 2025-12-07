import mongoose, { Schema } from 'mongoose'

export interface IArticle extends mongoose.Document {
  // 1) 基础信息
  title: string
  slug: string
  summary?: string
  
  // 2) 内容
  content: string
  
  // 3) 封面图
  coverImage?: string
  
  // 4) 分类 / 标签（标准引用模型，只存 ObjectId）
  category?: mongoose.Types.ObjectId | null
  tags: mongoose.Types.ObjectId[]
  
  // 5) 统计 / 状态
  views: number
  isTop: boolean
  isPublished: boolean
  
  // 6) 时间
  publishedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ArticleSchema = new Schema<IArticle>(
  {
    // 1) 基础信息
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    summary: { type: String, default: '', trim: true },

    // 2) 内容
    content: { type: String, required: true },

    // 3) 封面图
    coverImage: { type: String, default: '', trim: true },

    // 4) 分类 / 标签（标准引用模型，只存 ObjectId）
    category: { type: Schema.Types.ObjectId, ref: 'Category', index: true, default: null },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag', index: true }],

    // 5) 统计 / 状态
    views: { type: Number, default: 0 },
    isTop: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true, index: true },

    // 6) 时间
    publishedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    collection: 'articles'
  }
)

/**
 * 索引优化：
 * - slug: 唯一索引（已在字段上声明 unique + index）
 * - publishedAt: 排序索引（已在字段上声明 index）
 * - category: 分类查询索引（已在字段上声明 index）
 * - tags: 标签查询索引（已在字段上声明 index）
 * - isPublished + publishedAt: 列表页常用查询
 * - isTop + publishedAt: 置顶列表查询
 */
ArticleSchema.index({ isPublished: 1, publishedAt: -1 })
ArticleSchema.index({ isTop: 1, publishedAt: -1 })

export const Article = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema)
