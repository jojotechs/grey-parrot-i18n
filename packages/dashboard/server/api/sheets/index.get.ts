import { defineAuthEventHandler } from '~/server/utils/auth'
import { useDrizzle } from '~/server/utils/drizzle'

export default defineAuthEventHandler(async (event) => {
  const db = useDrizzle()

  try {
    const sheets = await db.query.sheets.findMany({
      with: {
        creator: {
          columns: {
            email: true,
          },
        },
      },
      orderBy: (sheets, { desc }) => [desc(sheets.updatedAt)],
    })

    return sheets.map(sheet => ({
      ...sheet,
      languages: JSON.parse(sheet.languages),
    }))
  }
  catch (error) {
    console.error('Failed to fetch sheets:', error)
    throw createError({
      statusCode: 500,
      message: '获取多语言表失败',
    })
  }
})
