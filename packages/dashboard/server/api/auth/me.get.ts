import { eq } from 'drizzle-orm'
import { createError, eventHandler, getRequestHeader } from 'h3'
import { verify } from 'jsonwebtoken'
import type { JWTTokenPayload } from '~/server/types'
import { extractToken } from '~/server/utils/auth'
import { JWT_SECRET } from '~/server/utils/constant'
import { tables, useDrizzle } from '~/server/utils/drizzle'

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
    const decoded = verify(token, JWT_SECRET) as JWTTokenPayload

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
