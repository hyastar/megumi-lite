import { connectDB } from '../../utils/db'
import { Article } from '../../models/article.schema'
import { renderMarkdown, extractToc } from '#imports'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug parameter is required'
      })
    }

    const article = await Article.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .lean()

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article not found'
      })
    }

    const htmlContent = await renderMarkdown(article.content || '')
    const toc = await extractToc(article.content || '')

    const [prevArticle, nextArticle] = await Promise.all([
      Article.findOne({
        createdAt: { $lt: article.createdAt }
      })
        .sort({ createdAt: -1 })
        .select('slug title')
        .lean(),
      Article.findOne({
        createdAt: { $gt: article.createdAt }
      })
        .sort({ createdAt: 1 })
        .select('slug title')
        .lean()
    ])

    return {
      success: true,
      data: {
        article: {
          _id: String(article._id),
          title: article.title || '',
          slug: article.slug || '',
          summary: article.summary || '',
          content: htmlContent,
          cover: article.coverImage || '',
          coverImage: article.coverImage || '',
          publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
          createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : new Date().toISOString(),
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
          toc
        },
        prevArticle: prevArticle ? {
          slug: prevArticle.slug || '',
          title: prevArticle.title || ''
        } : null,
        nextArticle: nextArticle ? {
          slug: nextArticle.slug || '',
          title: nextArticle.title || ''
        } : null
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error fetching article:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch article'
    })
  }
})
