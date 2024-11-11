import { getServerSession } from '#auth'
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: '未登录',
    })
  }

  return session.user
})
