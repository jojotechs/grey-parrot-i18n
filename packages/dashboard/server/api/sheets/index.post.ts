import { sheetSchema } from '~/server/schemas/sheet'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export default defineAuthEventHandler(async (event, user) => {
  if (user.role === 'reader') {
    throw createError({
      statusCode: 403,
      message: '没有创建权限',
    })
  }

  const body = await readBody(event)
  const data = sheetSchema.parse(body)

  const db = useDrizzle()
  const [sheet] = await db.insert(tables.sheets)
    .values({
      ...data,
      languages: JSON.stringify(data.languages),
      createdBy: user.id,
    })
    .returning()

  return {
    ...sheet,
    languages: JSON.parse(sheet.languages),
  }
})
