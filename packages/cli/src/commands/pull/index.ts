import { promises as fs } from 'node:fs'
import { resolve } from 'node:path'
import chalk from 'chalk'
import { config as loadEnv } from 'dotenv'
import ora from 'ora'
import { getConfig } from '../../utils/config'

async function getMessages(config: any) {
  loadEnv({ path: resolve(process.cwd(), '.env') })

  const token = process.env.GREY_PARROT_TOKEN
  if (!token) {
    throw new Error('Missing GREY_PARROT_TOKEN in .env file')
  }

  const response = await fetch(`${config.dashboardUrl}/api/sheets/${config.projectId}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to get messages')
  }

  return response.json()
}

export async function pull() {
  const spinner = ora('正在获取多语言数据...').start()

  try {
    const config = await getConfig()
    const messages = await getMessages(config)

    // 确保多语言目录存在
    const langsDir = resolve(process.cwd(), config.langsDir)
    await fs.mkdir(langsDir, { recursive: true })

    // 为每种语言生成文件
    for (const [locale, translations] of Object.entries(messages)) {
      const filePath = resolve(langsDir, `${locale}.json`)
      await fs.writeFile(
        filePath,
        JSON.stringify(translations, null, 2),
      )
    }

    spinner.succeed(chalk.green(`成功生成多语言文件到 ${config.langsDir} 目录`))
  }
  catch (error) {
    spinner.fail(chalk.red(error instanceof Error ? error.message : '未知错误'))
    process.exit(1)
  }
}
