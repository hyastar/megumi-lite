import { connectDB } from '../../utils/db'
import { Article } from '../../models/article.schema'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const tag = query.tag as string | undefined

    // 构建查询条件
    const filter: any = {}
    if (tag) {
      filter.tags = tag
    }

    // 计算跳过的文档数
    const skip = (page - 1) * limit

    // 查询文章列表
    const [list, total] = await Promise.all([
      Article.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content') // 不返回完整内容，只返回摘要
        .lean(),
      Article.countDocuments(filter)
    ])

    return {
      success: true,
      data: {
        list,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('Error fetching articles:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch articles'
    })
  }
})

