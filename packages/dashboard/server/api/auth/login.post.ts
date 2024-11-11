import { eq } from 'drizzle-orm'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import type { JWTTokenPayload } from '~/server/types'
import { definePublicEventHandler, verifyPassword } from '~/server/utils/auth'
import { ACCESS_TOKEN_TTL, JWT_SECRET } from '~/server/utils/constant'
import { tables, useDrizzle } from '~/server/utils/drizzle'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export default definePublicEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = loginSchema.parse(body)

  const db = useDrizzle()
  const user = await db.query.users.findFirst({
    where: eq(tables.users.email, email),
  })

  if (!user || !await verifyPassword(user.password, password)) {
    throw createError({
      statusCode: 401,
      message: '邮箱或密码错误',
    })
  }

  const tokenData: JWTTokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  }

  // 生成访问令牌
  const accessToken = sign(tokenData, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  })

  // 生成刷新令牌
  const refreshToken = sign(tokenData, JWT_SECRET, {
    expiresIn: '7d',
  })

  return {
    token: {
      accessToken,
      refreshToken,
    },
    user: tokenData,
  }
})

export function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}
