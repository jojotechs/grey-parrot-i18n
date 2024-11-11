import { eq } from 'drizzle-orm'
import { createError, eventHandler, readBody } from 'h3'
import { sign, verify } from 'jsonwebtoken'
import { tables, useDrizzle } from '~/server/utils/drizzle'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const ACCESS_TOKEN_TTL = 30 * 60 // 30 minutes

export default eventHandler(async (event) => {
  const body = await readBody<{ refreshToken: string }>(event)
  const refreshToken = body.refreshToken

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      message: '需要刷新令牌',
    })
  }

  try {
    const decoded = verify(refreshToken, JWT_SECRET) as {
      id: number
      email: string
      role: string
    }

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

    // 生成新的访问令牌
    const accessToken = sign(tokenData, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    })

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
