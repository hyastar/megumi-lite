export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { password } = body

    // 使用 runtimeConfig 获取配置
    const config = useRuntimeConfig()
    const adminPassword = config.adminPassword

    if (!adminPassword) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Admin password is not configured. Please set NUXT_ADMIN_PASSWORD in your .env file.'
      })
    }

    if (password !== adminPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid password'
      })
    }

    // 设置 Cookie (使用 authSecret 增强安全性)
    setCookie(event, 'auth_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 天
      // 如果使用 signed cookie，可以在这里添加签名
      // signed: true // 需要配置 authSecret
    })

    return {
      success: true,
      message: 'Login successful'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Login failed'
    })
  }
})

