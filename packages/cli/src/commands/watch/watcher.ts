import type { ScanOptions } from '../../types'
import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'
import chokidar from 'chokidar'
import { getConfigDir } from '../../utils/config'
import { DEFAULT_SCAN_PATTERNS } from '../../utils/constants'
import { extractI18nText } from './scan'

export async function createWatcher(options: ScanOptions & { scanDir?: string }) {
  const {
    scanDir = '.',
    include = DEFAULT_SCAN_PATTERNS.js.include,
    exclude = DEFAULT_SCAN_PATTERNS.js.exclude,
  } = options

  const configDir = getConfigDir()
  const watchPath = resolve(configDir, scanDir)

  const watcher = chokidar.watch(include, {
    cwd: watchPath,
    ignored: exclude,
    ignoreInitial: false,
  })

  async function handleFile(filepath: string) {
    try {
      const content = await fs.readFile(resolve(watchPath, filepath), 'utf-8')
      const matches = extractI18nText(content)

      if (matches.length > 0) {
        console.log(chalk.blue(`\n[${filepath}] 发现 ${matches.length} 处待翻译文案:`))
        matches.forEach((match) => {
          console.log(chalk.yellow(`  - ${match.text} (第 ${match.lineNumber} 行)`))
        })
      }
    }
    catch (error) {
      console.error(chalk.red(`处理文件 ${filepath} 时发生错误:`, error))
    }
  }

  watcher
    .on('add', handleFile)
    .on('change', handleFile)
    .on('error', error => console.error(chalk.red('监听错误:', error)))

  return watcher
}
