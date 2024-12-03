import { eq, sql } from 'drizzle-orm'
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

// 处理已有翻译的辅助函数
function processExistingTranslations(
  entries: Array<{ key: string, translations: string }>,
  textsToTranslate: string[],
): {
    remainingTexts: string[]
    processedEntries: AITranslationResponse[]
  } {
  const translatedTexts = new Set(
    entries.flatMap((entry) => {
      const translations = JSON.parse(entry.translations as string)
      return Object.values(translations)
    }),
  )

  return {
    remainingTexts: textsToTranslate.filter(t => !translatedTexts.has(t)),
    processedEntries: entries.map(entry => ({
      key: entry.key,
      translations: JSON.parse(entry.translations as string),
    })),
  }
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

    // Construct the JSON path as a raw string
    const jsonPath = `'$."${currentLanguage}"'`

    // Build the conditions without parameterized the JSON path
    const conditions = text.map(t =>
      sql`json_extract(${tables.entries.translations}, ${sql.raw(jsonPath)}) = ${t}`,
    )

    // Now, use these conditions in your query
    const allMatchingEntries = await db.query.entries.findMany({
      where: sql`
        json_valid(${tables.entries.translations})
        AND (
          ${sql.join(conditions, sql` OR `)}
        )
      `,
      orderBy: sql`CASE WHEN ${tables.entries.sheetId} = ${sheetId} THEN 0 ELSE 1 END`,
      limit: 20,
    })
    log.debug('Found matching entries:', allMatchingEntries.length)

    const results: EntryUpdateResponse = {
      success: true,
      entries: [],
      errors: [],
    }

    // 先处理已有的翻译
    const currentSheetEntries = allMatchingEntries.filter(entry => entry.sheetId === sheetId)
    const otherSheetEntries = allMatchingEntries.filter(entry => entry.sheetId !== sheetId)

    log.debug('Found entries in current sheet:', currentSheetEntries.length)
    log.debug('Found entries in other sheets:', otherSheetEntries.length)

    // 处理当前sheet的翻译
    let textsToTranslate = [...text]
    let entriesToInsert: Array<{
      key: string
      translations: string
      fromSheet?: number
    }> = []

    if (currentSheetEntries.length > 0) {
      const { remainingTexts, processedEntries } = processExistingTranslations(
        currentSheetEntries,
        textsToTranslate,
      )

      textsToTranslate = remainingTexts
      results.entries = processedEntries
      log.debug('Reused translations from current sheet:', processedEntries.length)
      log.debug('Remaining texts to translate:', textsToTranslate)

      // 如果所有文本都已存在，直接返回
      if (textsToTranslate.length === 0) {
        log.debug('All texts found in current sheet, skipping further processing')
        return results
      }
    }

    // 处理其他sheet的翻译
    if (otherSheetEntries.length > 0) {
      const { remainingTexts, processedEntries } = processExistingTranslations(
        otherSheetEntries,
        textsToTranslate,
      )

      textsToTranslate = remainingTexts
      log.debug('Found translations in other sheets:', processedEntries.length)
      log.debug('Final texts to translate:', textsToTranslate)

      // 收集其他sheet的翻译
      entriesToInsert = otherSheetEntries.map(entry => ({
        key: entry.key,
        translations: entry.translations,
        fromSheet: entry.sheetId,
      }))
    }

    // 如果还有需要翻译的文本，继续 AI 翻译
    if (textsToTranslate.length > 0) {
      log.debug('Starting AI translation for remaining texts:', textsToTranslate.length)
      const targetLanguages = JSON.parse(sheet.languages as string) as string[]
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
      })

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
${textsToTranslate.map((t, i) => `${i + 1}. ${t}`).join('\n')}`,
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

      // 解析 YAML 应
      const parsed = yaml.load(content.replace(/```yaml|```/g, '').trim()) as { entries: AITranslationResponse[] }
      log.debug('Parsed YAML:', parsed)
      if (!parsed.entries?.length) {
        results.errors?.push('Failed to parse AI response: No valid entries found')
        results.success = false
        return results
      }

      // 添加 AI 翻译的结果
      entriesToInsert = [
        ...entriesToInsert,
        ...parsed.entries.map(entry => ({
          key: entry.key,
          translations: JSON.stringify(entry.translations),
        })),
      ]
    }

    // 统一处理 key 重复问题
    if (entriesToInsert.length > 0) {
      const existingKeys = await db.query.entries.findMany({
        where: eq(tables.entries.sheetId, sheetId),
        columns: {
          key: true,
        },
      })
      const keySet = new Set(existingKeys.map(entry => entry.key))

      // 处理所有要插入的条目
      const finalEntries = entriesToInsert.map((entry) => {
        let finalKey = entry.key
        let counter = 1
        while (keySet.has(finalKey)) {
          finalKey = `${entry.key}_${counter}`
          counter++
        }
        keySet.add(finalKey)

        return {
          sheetId,
          key: finalKey,
          translations: entry.translations,
          createdBy: user.id,
        }
      })

      // 批量插入
      const insertedEntries = await db.insert(tables.entries)
        .values(finalEntries)
        .returning()

      // 添加新插入的条目到结果中
      results.entries = [
        ...results.entries,
        ...insertedEntries.map(entry => ({
          key: entry.key,
          translations: JSON.parse(entry.translations as string),
        })),
      ]
    }

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
}, { allowApiToken: true })
