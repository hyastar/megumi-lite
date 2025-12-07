export default defineNuxtRouteMiddleware((to, from) => {
  // 只在客户端运行
  if (process.server) return

  const { isLoggedIn } = useAdmin()
  
  if (!isLoggedIn.value) {
    return navigateTo('/kato')
  }
})