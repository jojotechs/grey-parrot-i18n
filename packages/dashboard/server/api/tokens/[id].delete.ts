import { eq } from 'drizzle-orm'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export default defineAuthEventHandler(async (event, user) => {
  const id = Number(event.context.params?.id)

  if (!id) {
    throw createError({
      statusCode: 400,
      message: '无效的token ID',
    })
  }

  const db = useDrizzle()

  // 检查token是否属于当前用户
  const token = await db.query.tokens.findFirst({
    where: eq(tables.tokens.id, id),
  })

  if (!token) {
    throw createError({
      statusCode: 404,
      message: 'Token不存在',
    })
  }

  if (token.userId !== user.id) {
    throw createError({
      statusCode: 403,
      message: '无权删除此token',
    })
  }

  await db.delete(tables.tokens)
    .where(eq(tables.tokens.id, id))

  return { success: true }
})
