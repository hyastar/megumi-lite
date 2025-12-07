import { connectDB } from '../../utils/db'
import { Article } from '../../models/article.schema'

export default defineEventHandler(async (event) => {
  try {
    // 检查认证（通过中间件）
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug parameter is required'
      })
    }

    await connectDB()

    const article = await Article.findOneAndDelete({ slug })

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article not found'
      })
    }

    return {
      success: true,
      message: 'Article deleted successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error deleting article:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete article'
    })
  }
})

