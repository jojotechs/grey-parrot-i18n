import { eq } from 'drizzle-orm'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'
import { useLogger } from '~/server/utils/logger'

interface MessagesResponse {
  [locale: string]: {
    [key: string]: string
  }
}

export default defineAuthEventHandler(async (event) => {
  const log = useLogger()
  try {
    const sheetId = Number(event.context.params?.id)
    const db = useDrizzle()

    // 获取 sheet 数据
    const sheet = await db.query.sheets.findFirst({
      where: eq(tables.sheets.id, sheetId),
    })

    if (!sheet) {
      throw createError({
        statusCode: 404,
        message: 'Multi-language table does not exist',
      })
    }

    // 获取所有条目
    const entries = await db.query.entries.findMany({
      where: eq(tables.entries.sheetId, sheetId),
    })

    log.debug('Found entries:', entries.length)

    // 转换格式
    const messages: MessagesResponse = {}
    const languages = JSON.parse(sheet.languages as string) as string[]

    // 初始化每种语言的对象
    languages.forEach((lang) => {
      messages[lang] = {}
    })

    // 填充翻译数据
    entries.forEach((entry) => {
      const translations = JSON.parse(entry.translations as string) as Record<string, string>
      Object.entries(translations).forEach(([lang, text]) => {
        if (messages[lang]) {
          messages[lang][entry.key] = text
        }
      })
    })

    log.debug('Generated messages format for languages:', Object.keys(messages))
    return messages
  }
  catch (error: unknown) {
    log.debug('Failed to get messages:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to get messages',
    })
  }
}, { allowApiToken: true })
