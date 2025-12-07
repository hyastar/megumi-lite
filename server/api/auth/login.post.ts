export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (
    body?.username === config.adminUsername &&
    body?.password === config.adminPassword
  ) {
    setCookie(event, 'auth_token', 'authenticated', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax'
    })

    return {
      success: true,
      message: '登录成功'
    }
  }

  throw createError({
    statusCode: 401,
    statusMessage: 'Invalid credentials'
  })
})
