/**
 * 管理员认证状态
 */
export const useAdmin = () => {
  const authToken = useCookie('auth_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  const isLoggedIn = computed(() => authToken.value === 'authenticated')

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      authToken.value = null
      await navigateTo('/kato')
    }
  }

  return {
    isLoggedIn,
    logout
  }
}