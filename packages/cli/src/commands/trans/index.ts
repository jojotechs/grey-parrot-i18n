import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'
import { config as loadEnv } from 'dotenv'
import micromatch from 'micromatch'
import ora from 'ora'
import { getConfig } from '../../utils/config'
import { DEFAULT_SCAN_PATTERNS } from '../../utils/constants'
import { extractI18nText } from './scan'

async function getAllFiles(
  dir: string,
  baseDir: string,
  include: string[],
  exclude: string[],
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = resolve(dir, entry.name)
      const relativePath = fullPath.replace(baseDir, '').replace(/^\//, '')

      // 检查是否在排除列表中
      if (micromatch.isMatch(relativePath, exclude)) {
        return []
      }

      if (entry.isDirectory()) {
        return getAllFiles(fullPath, baseDir, include, exclude)
      }

      // 检查文件是否匹配包含模式
      if (micromatch.isMatch(relativePath, include)) {
        return [fullPath]
      }

      return []
    }),
  )

  return files.flat()
}

// 提交文案到服务器
async function submitTexts(texts: string[], config: any) {
  // 加载 .env 文件
  loadEnv({ path: resolve(process.cwd(), '.env') })

  const token = process.env.GREY_PARROT_TOKEN
  if (!token) {
    throw new Error('Missing GREY_PARROT_TOKEN in .env file')
  }

  const response = await fetch(`${config.dashboardUrl}/api/sheets/${config.projectId}/entry`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: texts,
      currentLanguage: config.defaultLocale,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to submit texts')
  }

  return response.json()
}

export async function trans() {
  const spinner = ora('正在扫描项目文件...').start()

  try {
    const config = await getConfig()
    const {
      scanDir = '.',
      include = DEFAULT_SCAN_PATTERNS.js.include,
      exclude = DEFAULT_SCAN_PATTERNS.js.exclude,
    } = config

    const baseDir = resolve(process.cwd(), scanDir)
    const files = await getAllFiles(baseDir, baseDir, include, exclude)

    spinner.succeed(chalk.green(`扫描完成，找到 ${files.length} 个待处理文件`))

    // 扫描结果统计
    const results: Array<{ file: string, matches: Array<{ text: string, line: number }> }> = []

    // Add a new interface for tracking duplicates
    interface TextLocation {
      file: string
      line: number
    }

    // Inside the trans function, before submitting texts:
    const textMap = new Map<string, TextLocation[]>()

    // 处理每个文件
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      const matches = extractI18nText(content)

      if (matches.length > 0) {
        // Track locations for each text
        matches.forEach((m) => {
          const locations = textMap.get(m.text) || []
          locations.push({
            file: file.replace(baseDir, '').replace(/^\//, ''),
            line: m.lineNumber,
          })
          textMap.set(m.text, locations)
        })

        results.push({
          file: file.replace(baseDir, '').replace(/^\//, ''),
          matches: matches.map(m => ({
            text: m.text,
            line: m.lineNumber,
          })),
        })
      }
    }

    // Report duplicates before submission
    const duplicates = Array.from(textMap.entries())
      .filter(([_, locations]) => locations.length > 1)

    if (duplicates.length > 0) {
      console.log(chalk.yellow('\nFound duplicate texts:'))
      duplicates.forEach(([text, locations]) => {
        console.log(chalk.cyan(`\n"${text}" appears in:`))
        locations.forEach((loc) => {
          console.log(chalk.gray(`  ${loc.file}:${loc.line}`))
        })
      })
    }

    // Use deduplicated texts for submission
    const uniqueTexts = Array.from(textMap.keys())

    if (uniqueTexts.length > 0) {
      spinner.text = '正在提交文案到服务器...'
      const response = await submitTexts(uniqueTexts, config)
      spinner.succeed(chalk.green(`成功提交 ${uniqueTexts.length} 条文案`))

      // 打印翻译结果
      console.log(chalk.blue('\n翻译结果：'))
      response.entries.forEach((entry: any) => {
        console.log(chalk.yellow(`\n🔑 ${entry.key}:`))
        Object.entries(entry.translations).forEach(([lang, text]) => {
          console.log(chalk.gray(`  ${lang}: ${text}`))
        })
      })
    }
  }
  catch (error) {
    spinner.fail(chalk.red(error instanceof Error ? error.message : '未知错误'))
    process.exit(1)
  }
}
