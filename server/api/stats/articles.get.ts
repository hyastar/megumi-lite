import { Article } from '../../models/article.schema'

export default defineEventHandler(async () => {
  try {
    const [result] = await Article.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalArticles: { $sum: 1 },
          totalWords: { $sum: { $strLenCP: { $ifNull: ['$content', ''] } } },
          totalViews: { $sum: { $ifNull: ['$views', 0] } }
        }
      }
    ])

    let hottestArticle = null
    const hottest = await Article.findOne({ status: 'published' })
      .sort({ views: -1 })
      .select('title slug views')
      .lean()
    if (hottest) {
      hottestArticle = {
        title: hottest.title || '',
        slug: hottest.slug || '',
        views: hottest.views || 0
      }
    }

    const stats = result || { totalArticles: 0, totalWords: 0, totalViews: 0 }
    const totalArticles = stats.totalArticles || 0
    const totalWords = stats.totalWords || 0
    const totalViews = stats.totalViews || 0

    const avgWords = totalArticles > 0 ? Math.round(totalWords / totalArticles) : 0
    const avgViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0

    // 阅读量前 10 的文章用于可视化
    const articlesForChart = await Article.find({ status: 'published' })
      .select('title views slug')
      .sort({ views: -1 })
      .limit(10)
      .lean()

    const chartData = (articlesForChart || [])
      .map(item => ({
        name: item.title || '',
        value: item.views || 0,
        slug: item.slug || ''
      }))

    return {
      totalArticles,
      totalWords,
      totalViews,
      avgWords,
      avgViews,
      hottestArticle,
      chartData
    }
  } catch (error: any) {
    console.error('[stats/articles] failed', error)
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Failed to compute article stats'
    })
  }
})
