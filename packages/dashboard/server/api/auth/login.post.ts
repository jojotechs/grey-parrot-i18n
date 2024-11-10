import { useSession } from '@nuxthub/core'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { definePublicEventHandler, verifyPassword } from '~/server/utils/auth'
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

  const session = await useSession(event)
  await session.update({
    userId: user.id,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  }
})
