import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { hashPassword, isFirstUser } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string()
    .min(8, '密码长度至少为8位')
    .regex(/[A-Z]/, '密码必须包含大写字母')
    .regex(/[a-z]/, '密码必须包含小写字母')
    .regex(/\d/, '密码必须包含数字')
    .regex(/[^A-Z0-9]/i, '密码必须包含特殊字符'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

export default defineEventHandler(async (event) => {
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

  // 直接返回用户数据，nuxt-auth 会自动处理 session
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  }
})
