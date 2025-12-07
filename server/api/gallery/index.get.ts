import { connectDB } from '../../utils/db'
import { Photo } from '../../models/photo.schema'

export default defineEventHandler(async (event) => {
  try {
    await connectDB()

    const query = getQuery(event)
    const page = Math.max(parseInt(query.page as string) || 1, 1)
    const limit = Math.max(parseInt(query.limit as string) || 20, 1)
    const skip = (page - 1) * limit

    const [list, total] = await Promise.all([
      Photo.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id url width height caption createdAt')
        .lean(),
      Photo.countDocuments({})
    ])

    const mapped = list.map((item: any) => ({
      _id: String(item._id),
      url: item.url || '',
      width: item.width || 0,
      height: item.height || 0,
      caption: item.caption || '',
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()
    }))

    return {
      success: true,
      data: {
        list: mapped,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error: any) {
    console.error('[API] fetch gallery failed:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to fetch gallery'
    })
  }
})
