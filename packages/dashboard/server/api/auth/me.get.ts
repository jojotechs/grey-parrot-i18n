import { eq } from 'drizzle-orm'
import { createError, eventHandler, getRequestHeader } from 'h3'
import type { JWTTokenPayload } from '~/server/types'
import { extractToken } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'
import { verifyToken } from '~/server/utils/jwt'

export default eventHandler(async (event) => {
  const authHeader = getRequestHeader(event, 'Authorization')
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: '未登录',
    })
  }

  try {
    const token = extractToken(authHeader)
    const decoded = await verifyToken<JWTTokenPayload>(token)

    const db = useDrizzle()
    const user = await db.query.users.findFirst({
      where: eq(tables.users.id, decoded.id),
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户不存在',
      })
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }
  }
  catch (error) {
    throw createError({
      statusCode: 401,
      message: '无效的token',
    })
  }
})
