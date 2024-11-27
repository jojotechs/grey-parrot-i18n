import { eq } from 'drizzle-orm'
import yaml from 'js-yaml'
import OpenAI from 'openai'
import { entriesUpdateSchema } from '~/server/schemas/sheet'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'
import { createLogger } from '~/server/utils/logger'

export interface AITranslationResponse {
  key: string
  translations: Record<string, string>
}

export interface EntryUpdateResponse {
  success: boolean
  entries: AITranslationResponse[]
  errors?: string[]
}

export default defineAuthEventHandler(async (event, user) => {
  const log = createLogger(event)
  try {
    if (user.role === 'reader') {
      throw createError({
        statusCode: 403,
        message: '没有编辑权限',
      })
    }

    const sheetId = Number(event.context.params?.id)
    const body = await readBody(event)
    log.debug('Request body:', body)

    const { text, currentLanguage } = entriesUpdateSchema.parse(body)

    const db = useDrizzle()

    // 获取 sheet 数据和已有的 keys
    const sheet = await db.query.sheets.findFirst({
      where: eq(tables.sheets.id, sheetId),
    })

    if (!sheet) {
      throw createError({
        statusCode: 404,
        message: '多语言表不存在',
      })
    }

    const existingEntries = await db.query.entries.findMany({
      where: eq(tables.entries.sheetId, sheetId),
      columns: {
        key: true,
      },
    })

    const existingKeys = new Set(existingEntries.map(entry => entry.key))
    const targetLanguages = JSON.parse(sheet.languages as string) as string[]

    // 创建 OpenAI 客户端
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    })

    const results: EntryUpdateResponse = {
      success: true,
      entries: [],
      errors: [],
    }

    const prompt = [
      {
        role: 'system' as const,
        content: `你是一个精通多国语言的专家。请将以下文案翻译成这些语言：${targetLanguages.join(', ')}。
同时，为每条文案生成一个语义化的key（只包含小写字母、数字和下划线，不要包含原文中的特殊字符）。
请以YAML格式返回，格式举例如下：
entries:
  - key: first_semantic_key
    translations:
      zh-CN: 第一条中文翻译
      en: First English translation
  - key: second_semantic_key
    translations:
      zh-CN: 第二条中文翻译
      en: Second English translation`,
      },
      {
        role: 'user' as const,
        content: `源语言：${currentLanguage}
源文案：
${text.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
      },
    ]

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'o1-mini',
      messages: prompt,
      temperature: 0.3,
    })

    const content = response.choices[0].message.content
    log.debug('AI response:', content)
    if (!content) {
      results.errors?.push('AI 返回内容为空')
      results.success = false
      return results
    }

    // 解析 YAML 响应
    const parsed = yaml.load(content.replace(/```yaml|```/g, '').trim()) as { entries: AITranslationResponse[] }
    log.debug('Parsed YAML:', parsed)
    if (!parsed.entries?.length) {
      results.errors?.push('解析 AI 响应失败：未找到有效条目')
      results.success = false
      return results
    }

    // 批量插入数据库
    const entriesToInsert = parsed.entries.map((entry) => {
      // 确保 key 不重复
      let finalKey = entry.key
      let counter = 1
      while (existingKeys.has(finalKey)) {
        finalKey = `${entry.key}_${counter}`
        counter++
      }
      existingKeys.add(finalKey)

      return {
        sheetId,
        key: finalKey,
        translations: JSON.stringify(entry.translations),
        createdBy: user.id,
      }
    })

    const insertedEntries = await db.insert(tables.entries)
      .values(entriesToInsert)
      .returning()

    results.entries = insertedEntries.map(entry => ({
      key: entry.key,
      translations: JSON.parse(entry.translations as string),
    }))

    return results
  }
  catch (error: unknown) {
    log.error('Entry update error:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : '处理文案失败',
    })
  }
})
