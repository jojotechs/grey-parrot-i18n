import { eq } from 'drizzle-orm'
import { sign } from 'jsonwebtoken'
import { z } from 'zod'
import { definePublicEventHandler, verifyPassword } from '~/server/utils/auth'
import type { User } from '~/server/utils/drizzle'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export const JWT_SECRET = process.env.JWT_SECRET || 'grey-parrot-secret'
export const ACCESS_TOKEN_TTL = 60 * 60 // 1 hour

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export type JWTTokenPayload = Omit<User, 'password' | 'createdAt'>

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
