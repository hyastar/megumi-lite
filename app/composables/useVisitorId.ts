import { v4 as uuidv4 } from 'uuid'

/**
 * 访客 ID 管理（用于统计）
 */
export const useVisitorId = () => {
  const visitorId = useCookie('visitor_id', {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  })

  if (!visitorId.value) {
    visitorId.value = uuidv4()
  }

  return { visitorId }
}