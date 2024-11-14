import { eq } from 'drizzle-orm'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export default defineAuthEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const db = useDrizzle()

  const sheet = await db.query.sheets.findFirst({
    where: eq(tables.sheets.id, id),
    with: {
      creator: {
        columns: {
          email: true,
        },
      },
    },
  })

  if (!sheet) {
    throw createError({
      statusCode: 404,
      message: '多语言表不存在',
    })
  }

  return {
    ...sheet,
    languages: JSON.parse(sheet.languages as string),
  }
})
