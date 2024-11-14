import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { defineAdminEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'editor', 'reader']),
})

export default defineAdminEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const body = await readBody(event)
  const { role } = updateRoleSchema.parse(body)

  const db = useDrizzle()

  // 检查用户是否存在
  const user = await db.query.users.findFirst({
    where: eq(tables.users.id, id),
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: '用户不存在',
    })
  }

  // 如果要修改的是管理员角色，检查是否是最后一个管理员
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await db.query.users.findMany({
      where: eq(tables.users.role, 'admin'),
    })

    if (adminCount.length <= 1) {
      throw createError({
        statusCode: 400,
        message: '系统必须保留至少一个管理员',
      })
    }
  }

  // 更新角色
  const [updated] = await db.update(tables.users)
    .set({ role })
    .where(eq(tables.users.id, id))
    .returning()

  return updated
})
