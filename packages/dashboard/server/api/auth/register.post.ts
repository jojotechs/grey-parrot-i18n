import { useSession } from '@nuxthub/core'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default definePublicEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = registerSchema.parse(body)

  const db = useDrizzle()

  // 检查是否是首个用户
  const isFirst = await isFirstUser()

  // 检查邮箱是否已存在
  const existingUser = await db.query.users.findFirst({
    where: eq(tables.users.email, email),
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: '该邮箱已被注册',
    })
  }

  // 创建用户
  const hashedPassword = await hashPassword(password)
  const [user] = await db.insert(tables.users)
    .values({
      email,
      password: hashedPassword,
      role: isFirst ? 'admin' : 'reader',
    })
    .returning()

  // 创建会话
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
