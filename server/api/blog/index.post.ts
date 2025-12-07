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
    const body = await readBody(event)

    await connectDB()

    // 如果没有提供 slug，从标题自动生成
    let slug = body.slug
    if (!slug && body.title) {
      slug = body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // 移除特殊字符
        .replace(/\s+/g, '-') // 空格替换为连字符
        .replace(/-+/g, '-') // 多个连字符合并为一个
        .trim()
    }

    // 确保 slug 唯一
    let finalSlug = slug
    let counter = 1
    while (await Article.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    const tags = await findOrCreateTags(body.tags)

    const article = new Article({
      title: body.title,
      slug: finalSlug,
      content: body.content,
      summary: body.summary,
      cover: body.cover,
      tags,
      views: 0
    })

    await article.save()

    return {
      success: true,
      data: article
    }
  } catch (error: any) {
    console.error('Error creating article:', error)
    
    // 处理 MongoDB 唯一索引错误
    if (error.code === 11000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Article with this slug already exists'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create article'
    })
  }
})

