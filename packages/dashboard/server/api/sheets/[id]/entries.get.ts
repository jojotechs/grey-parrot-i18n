import { eq } from 'drizzle-orm'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'

export default defineAuthEventHandler(async (event) => {
  const id = Number(event.context.params?.id)
  const db = useDrizzle()

  try {
    const entries = await db.query.entries.findMany({
      where: eq(tables.entries.sheetId, id),
      with: {
        creator: {
          columns: {
            email: true,
          },
        },
      },
      orderBy: (entries, { desc }) => [desc(entries.updatedAt)],
    })

    return entries.map(entry => ({
      ...entry,
      translations: JSON.parse(entry.translations as string),
    }))
  }
  catch (error) {
    console.error('Failed to fetch sheet entries:', error)
    throw createError({
      statusCode: 500,
      message: '获取多语言条目失败',
    })
  }
})
