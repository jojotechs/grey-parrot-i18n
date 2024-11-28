import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'
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
    let totalMatches = 0
    const results: Array<{ file: string, matches: Array<{ text: string, line: number }> }> = []

    // 处理每个文件
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      const matches = extractI18nText(content)

      if (matches.length > 0) {
        totalMatches += matches.length
        results.push({
          file: file.replace(baseDir, '').replace(/^\//, ''),
          matches: matches.map(m => ({
            text: m.text,
            line: m.lineNumber,
          })),
        })
      }
    }

    // 打印扫描结果
    console.log(chalk.blue(`\n共发现 ${totalMatches} 处待翻译文案：`))
    results.forEach(({ file, matches }) => {
      console.log(chalk.yellow(`\n📄 ${file}:`))
      matches.forEach(({ text, line }) => {
        console.log(chalk.gray(`  [行 ${line}] ${text}`))
      })
    })
  }
  catch (error) {
    spinner.fail(chalk.red(error instanceof Error ? error.message : '未知错误'))
    process.exit(1)
  }
}
