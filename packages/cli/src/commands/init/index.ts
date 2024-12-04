import type { ProjectConfig } from '../../types'
import fs from 'node:fs/promises'
import path from 'node:path'
import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS } from '@grey-parrot-i18n/shared'
import boxen from 'boxen'
import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { createConfig } from '../../utils/config'
import { DEFAULT_SCAN_PATTERNS } from '../../utils/constants'

export async function init() {
  console.log(chalk.blue('\n🦜 让我们开始初始化您的多语言项目配置\n'))

  const answers = await inquirer.prompt<
    ProjectConfig & { confirmScanDir: boolean, confirmLangsDir: boolean, projectType: 'js' | 'flutter', token: string }
  >([
    {
      type: 'input',
      name: 'projectId',
      message: '请输入Sheet ID (可通过Dashboard获取):',
      required: true,
    },
    {
      type: 'input',
      name: 'token',
      message: '请输入访问令牌 (可通过Dashboard获取):',
      required: true,
    },
    {
      type: 'input',
      name: 'dashboardUrl',
      message: '请输入Dashboard URL:',
      required: true,
    },
    {
      type: 'list',
      name: 'defaultLocale',
      message: '请选择默认语言:',
      choices: LANGUAGE_OPTIONS,
      default: DEFAULT_LANGUAGE,
    },
    {
      type: 'confirm',
      name: 'confirmScanDir',
      message: '是否需要自定义扫描目录？(默认为项目根目录)',
      default: false,
    },
    {
      type: 'input',
      name: 'scanDir',
      message: '请输入要扫描的目录 (相对于项目根目录):',
      default: '.',
      when: answers => answers.confirmScanDir,
    },
    {
      type: 'list',
      name: 'projectType',
      message: '请选择项目类型:',
      choices: [
        { name: 'JavaScript/TypeScript', value: 'js' },
        { name: 'Flutter', value: 'flutter' },
      ],
      default: 'js',
    },
    {
      type: 'confirm',
      name: 'confirmLangsDir',
      message: '是否需要自定义多语言文件目录？(默认为 ./langs)',
      default: false,
    },
    {
      type: 'input',
      name: 'langsDir',
      message: '请输入多语言文件目录 (相对于项目根目录):',
      default: './langs',
      when: answers => answers.confirmLangsDir,
    },
  ])

  const spinner = ora('正在创建配置文件...').start()

  try {
    // 创建配置文件
    const config: ProjectConfig = {
      projectId: answers.projectId,
      dashboardUrl: answers.dashboardUrl,
      defaultLocale: answers.defaultLocale,
      scanDir: answers.scanDir || '.',
      langsDir: answers.langsDir || './langs',
      include: DEFAULT_SCAN_PATTERNS[answers.projectType].include,
      exclude: DEFAULT_SCAN_PATTERNS[answers.projectType].exclude,
    }
    await createConfig(config)

    // 创建或更新 .env 文件
    const envPath = path.join(process.cwd(), '.env')
    const envContent = `GREY_PARROT_TOKEN=${answers.token}\n`

    try {
      const existingEnv = await fs.readFile(envPath, 'utf-8')
      // 如果已经存在 GREY_PARROT_TOKEN，则替换它
      if (existingEnv.includes('GREY_PARROT_TOKEN=')) {
        const updatedEnv = existingEnv.replace(
          /GREY_PARROT_TOKEN=.*/,
          `GREY_PARROT_TOKEN=${answers.token}`,
        )
        await fs.writeFile(envPath, updatedEnv)
      }
      else {
        // 如果不存在，则追加到文件末尾
        await fs.appendFile(envPath, `\n${envContent}`)
      }
    }
    catch (err) {
      // 如果文件不存在，创建新的 .env 文件
      await fs.writeFile(envPath, envContent)
    }

    spinner.succeed(chalk.green('配置文件创建成功！'))

    console.log(`\n${boxen(
      chalk.cyan(
        '🎉 初始化完成！接下来您可以：\n\n'
        + `1. 使用 SDK 中的 ${chalk.bold('$tt()')} 函数标记需要翻译的文案 \n`
        + `2. 运行 ${chalk.bold('grey-parrot trans')} 生成翻译文案 \n`
        + `3. 后续可以通过 Dashboard 管理您的多语言文案`,
      ),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      },
    )}`)

    // 提醒用户将 .env 添加到 .gitignore
    console.log(chalk.yellow('\n⚠️  请确保将 .env 文件添加到 .gitignore 中以保护您的访问令牌'))
  }
  catch (error) {
    spinner.fail(chalk.red('配置文件创建失败！'))
    console.error(error instanceof Error ? error.message : '未知错误')
    process.exit(1)
  }
}
