import { eq } from 'drizzle-orm'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export default defineAuthEventHandler(async (event, user) => {
  if (user.role === 'reader') {
    throw createError({
      statusCode: 403,
      message: '没有删除权限',
    })
  }

  const id = Number(event.context.params?.id)
  const db = useDrizzle()

  await db.delete(tables.sheets)
    .where(eq(tables.sheets.id, id))

  return { success: true }
})
