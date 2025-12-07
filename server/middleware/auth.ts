export default defineEventHandler((event) => {
  const path = event.node.req.url || ''
  
  // 只处理 API 请求，不拦截页面路由
  if (!path.startsWith('/api/')) {
    return
  }
  
  const publicPaths = [
    '/api/admin/login',
    '/api/auth/login',
    '/api/stats',
    '/api/visitor'
  ]

  // 公开接口与公开 GET
  if (
    publicPaths.some(p => path.startsWith(p)) ||
    (path.startsWith('/api/blog') && event.node.req.method === 'GET') ||
    (path.startsWith('/api/articles') && event.node.req.method === 'GET') ||
    (path.startsWith('/api/categories') && event.node.req.method === 'GET') ||
    (path.startsWith('/api/tags') && event.node.req.method === 'GET')
  ) {
    return
  }

  // 需要认证的接口
  const protectedPaths = ['/api/upload', '/api/admin']
  const needsAuth =
    protectedPaths.some(p => path.startsWith(p) && path !== '/api/admin/login') ||
    (path.startsWith('/api/blog') && ['POST', 'PUT', 'DELETE'].includes(event.node.req.method || ''))

  if (needsAuth) {
    const token = getCookie(event, 'auth_token')
    if (!token || token !== 'authenticated') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
  }
})
