import { Article } from '../models/article.schema'
import { Category } from '../models/category.schema'
import { Tag } from '../models/tag.schema'

export default defineEventHandler(async (event) => {
  try {
    // 使用 countDocuments() 提升性能，而不是查出所有数据
    const [articleCount, categoryCount, tagCount] = await Promise.all([
      Article.countDocuments(),
      Category.countDocuments(),
      Tag.countDocuments()
    ])

    // 计算网站运行天数（从最早的文章发布日期开始）
    const earliestArticle = await Article.findOne()
      .sort({ publishedAt: 1 })
      .select('publishedAt')
      .lean()

    let siteRunDays = 0
    if (earliestArticle && earliestArticle.publishedAt) {
      const startDate = new Date(earliestArticle.publishedAt)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - startDate.getTime())
      siteRunDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    return {
      success: true,
      data: {
        articleCount,
        categoryCount,
        tagCount,
        siteRunDays
      }
    }
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch stats'
    })
  }
})

