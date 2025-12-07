import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    // 检查认证（通过中间件）
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    const file = formData[0]
    if (!file.data || !file.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file data'
      })
    }

    // 获取当前日期用于组织文件夹
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    // 构建保存路径
    const uploadDir = join(process.cwd(), 'public', 'uploads', String(year), month)
    
    // 确保目录存在
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 生成唯一文件名（时间戳 + 原始文件名）
    const timestamp = Date.now()
    const originalName = file.filename
    const ext = originalName.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join(uploadDir, fileName)

    // 保存文件
    await writeFile(filePath, file.data)

    // 返回相对路径 URL
    const url = `/uploads/${year}/${month}/${fileName}`

    return {
      success: true,
      data: {
        url,
        filename: fileName,
        originalName,
        size: file.data.length
      }
    }
  } catch (error: any) {
    console.error('Error uploading file:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to upload file'
    })
  }
})

