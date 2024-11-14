import { eq } from 'drizzle-orm'
import { sheetSchema } from '~/server/schemas/sheet'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export default defineAuthEventHandler(async (event, user) => {
  if (user.role === 'reader') {
    throw createError({
      statusCode: 403,
      message: '没有编辑权限',
    })
  }

  const id = Number(event.context.params?.id)
  const body = await readBody(event)
  const data = sheetSchema.parse(body)

  const db = useDrizzle()
  const [updated] = await db.update(tables.sheets)
    .set({
      ...data,
      languages: JSON.stringify(data.languages),
      updatedAt: new Date(),
    })
    .where(eq(tables.sheets.id, id))
    .returning()

  return {
    ...updated,
    languages: JSON.parse(updated.languages),
  }
})
