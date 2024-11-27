import { eq } from 'drizzle-orm'
import yaml from 'js-yaml'
import OpenAI from 'openai'
import { entriesUpdateSchema } from '~/server/schemas/sheet'
import { defineAuthEventHandler } from '~/server/utils/auth'
import { tables, useDrizzle } from '~/server/utils/drizzle'
import { useLogger } from '~/server/utils/logger'

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
  const log = useLogger()
  try {
    if (user.role === 'reader') {
      throw createError({
        statusCode: 403,
        message: 'No editing permission',
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
        message: 'Multi-language table does not exist',
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
        content: `You are a multilingual expert. Please translate the following text into these languages: ${targetLanguages.join(', ')}.
Additionally, generate a semantic key for each text entry (using only lowercase letters, numbers, and underscores, without any special characters from the original text).
Please return the result in YAML format, following this example:
\`\`\`yaml
entries:
  - key: first_semantic_key
    translations:
      zh-CN: 第一条中文翻译
      en: First English translation
  - key: second_semantic_key
    translations:
      zh-CN: 第二条中文翻译
      en: Second English translation
\`\`\`
ps: Return only the yaml content, nothing else.
`,
      },
      {
        role: 'user' as const,
        content: `Source language: ${currentLanguage}
Source text:
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
      results.errors?.push('AI returned empty content')
      results.success = false
      return results
    }

    // 解析 YAML 响应
    const parsed = yaml.load(content.replace(/```yaml|```/g, '').trim()) as { entries: AITranslationResponse[] }
    log.debug('Parsed YAML:', parsed)
    if (!parsed.entries?.length) {
      results.errors?.push('Failed to parse AI response: No valid entries found')
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
    log.debug('Entry update error:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to process text',
    })
  }
})
