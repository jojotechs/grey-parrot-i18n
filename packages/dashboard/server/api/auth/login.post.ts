import { eq } from 'drizzle-orm'
import { z } from 'zod'
import type { JWTTokenPayload } from '~/server/types'
import { verifyPassword } from '~/server/utils/auth'
import { ACCESS_TOKEN_TTL } from '~/server/utils/constant'
import { tables, useDrizzle } from '~/server/utils/drizzle'
import { signToken } from '~/server/utils/jwt'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export default defineEventHandler(async (event) => {
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

  const accessToken = await signToken(tokenData, ACCESS_TOKEN_TTL)
  const refreshToken = await signToken(tokenData, '7 days')

  return {
    token: {
      accessToken,
      refreshToken,
    },
    user: tokenData,
  }
})
