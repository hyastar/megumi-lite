import { Article } from '../../models/article.schema'

/**
 * GET /api/categories/stats
 * 返回分类统计数据，用于 ECharts 图表
 * 使用聚合查询按分类分组统计文章数量
 */
export default defineEventHandler(async (event) => {
  try {
    // 使用聚合查询按分类分组统计
    const stats = await Article.aggregate([
      // 1. 筛选已发布的文章
      {
        $match: {
          isPublished: true
        }
      },
      // 2. 按 category 字段分组计数
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      // 3. 过滤掉 null 分类（没有分类的文章）
      {
        $match: {
          _id: { $ne: null }
        }
      },
      // 4. 联表查询 Category 集合获取分类名称和 slug
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      // 5. 展开 categoryInfo 数组（应该只有一个元素）
      {
        $unwind: {
          path: '$categoryInfo',
          preserveNullAndEmptyArrays: false // 如果分类不存在，过滤掉
        }
      },
      // 6. 投影最终字段
      {
        $project: {
          _id: 0,
          name: '$categoryInfo.name',
          slug: '$categoryInfo.slug',
          value: '$count'
        }
      },
      // 7. 按文章数量降序排序
      {
        $sort: { value: -1 }
      }
    ])
    
    return {
      success: true,
      data: stats
    }
  } catch (error: any) {
    console.error('[API] 获取分类统计失败:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch category stats'
    })
  }
})

