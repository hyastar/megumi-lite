import { connectDB } from '../../utils/db'
import { Article } from '../../models/article.schema'
import { Tag } from '../../models/tag.schema'
import type { ITag } from '../../models/tag.schema'
import type mongoose from 'mongoose'

const parseRawTags = (raw: any): string[] => {
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch (e) {
      try {
        raw = JSON.parse(raw.replace(/'/g, '"'))
      } catch (e2) {
        raw = []
      }
    }
  }
  return Array.isArray(raw) ? raw : []
}

const slugifyTag = (name: string) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return base || `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

const findOrCreateTags = async (rawTags: any): Promise<mongoose.Types.ObjectId[]> => {
  const tagNames = parseRawTags(rawTags)
  const tagIds: mongoose.Types.ObjectId[] = []

  for (const name of tagNames) {
    if (!name || typeof name !== 'string') continue
    const trimmed = name.trim()
    if (!trimmed) continue

    let tag: ITag | null = await Tag.findOne({ name: trimmed })
    if (!tag) {
      let slug = slugifyTag(trimmed)
      const existingSlug = await Tag.findOne({ slug })
      if (existingSlug) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`
      }
      tag = await Tag.create({ name: trimmed, slug })
    }
    tagIds.push(tag._id)
  }

  return tagIds
}

export default defineEventHandler(async (event) => {
  try {
    // 检查认证（通过中间件）
    const slug = getRouterParam(event, 'slug')
    const body = await readBody(event)

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug parameter is required'
      })
    }

    await connectDB()

    // 如果更新了标题但没有更新 slug，自动生成新 slug
    let updateSlug = body.slug
    if (body.title && !updateSlug) {
      updateSlug = body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    // 如果 slug 改变了，检查新 slug 是否已存在
    if (updateSlug && updateSlug !== slug) {
      const existing = await Article.findOne({ slug: updateSlug })
      if (existing) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Article with this slug already exists'
        })
      }
    }

    const updateData: any = {}
    if (body.title) updateData.title = body.title
    if (updateSlug) updateData.slug = updateSlug
    if (body.content !== undefined) updateData.content = body.content
    if (body.summary !== undefined) updateData.summary = body.summary
    if (body.cover !== undefined) updateData.cover = body.cover
    if (body.tags !== undefined) {
      updateData.tags = await findOrCreateTags(body.tags)
    }

    const article = await Article.findOneAndUpdate(
      { slug },
      updateData,
      { new: true, runValidators: true }
    )

    if (!article) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Article not found'
      })
    }

    return {
      success: true,
      data: article
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error updating article:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update article'
    })
  }
})

