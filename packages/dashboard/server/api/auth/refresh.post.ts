import { eq } from 'drizzle-orm'
import { createError, readBody } from 'h3'
import type { JWTTokenPayload } from '~/server/types'
import { ACCESS_TOKEN_TTL } from '~/server/utils/constant'
import { tables, useDrizzle } from '~/server/utils/drizzle'
import { signToken, verifyToken } from '~/server/utils/jwt'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ refreshToken: string }>(event)
  const refreshToken = body.refreshToken

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      message: '需要刷新令牌',
    })
  }

  try {
    const decoded = await verifyToken<JWTTokenPayload>(refreshToken)

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

    const tokenData = {
      id: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await signToken(tokenData, ACCESS_TOKEN_TTL)

    return {
      token: {
        accessToken,
        refreshToken, // 返回相同的刷新令牌
      },
      user: tokenData,
    }
  }
  catch (error) {
    throw createError({
      statusCode: 401,
      message: '无效的刷新令牌',
    })
  }
})
