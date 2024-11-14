import { eq } from 'drizzle-orm'
import { defineAdminEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export default defineAdminEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
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

  // 不能删除自己
  if (user.id === event.context.user.id) {
    throw createError({
      statusCode: 400,
      message: '不能删除自己的账号',
    })
  }

  // 如果要删除的是管理员，检查是否是最后一个管理员
  if (user.role === 'admin') {
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

  // 删除用户
  await db.delete(tables.users)
    .where(eq(tables.users.id, id))

  return { success: true }
})
