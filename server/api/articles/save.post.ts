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

const slugifyTitle = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
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

const ensureUniqueSlug = async (slug: string, excludeId?: string | mongoose.Types.ObjectId | null) => {
  let finalSlug = slug
  let counter = 1
  while (true) {
    const existing = await Article.findOne(
      excludeId
        ? { slug: finalSlug, _id: { $ne: excludeId } }
        : { slug: finalSlug }
    )
    if (!existing) break
    finalSlug = `${slug}-${counter}`
    counter++
  }
  return finalSlug
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
    const body = await readBody(event)
    await connectDB()

    const tags = await findOrCreateTags(body.tags)
    const coverImage = body.cover || body.coverImage || ''
    const title = body.title || ''

    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title is required'
      })
    }

    let slug = body.slug
    if (!slug && title) {
      slug = slugifyTitle(title)
    }

    // update
    if (body.id) {
      const article = await Article.findById(body.id)
      if (!article) {
        throw createError({ statusCode: 404, statusMessage: 'Article not found' })
      }

      if (slug) {
        article.slug = await ensureUniqueSlug(slug, body.id)
      }
      article.title = title
      article.content = body.content ?? article.content
      article.summary = body.summary ?? article.summary
      article.coverImage = coverImage
      article.tags = tags
      article.isPublished = body.isPublished !== false
      await article.save()

      return { success: true, data: article }
    }

    // create
    const finalSlug = slug ? await ensureUniqueSlug(slug) : await ensureUniqueSlug(slugifyTitle(title))
    const created = await Article.create({
      title,
      slug: finalSlug,
      content: body.content || '',
      summary: body.summary || '',
      coverImage,
      tags,
      isPublished: body.isPublished !== false
    })

    return { success: true, data: created }
  } catch (error: any) {
    console.error('[API] save article failed:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to save article'
    })
  }
})
