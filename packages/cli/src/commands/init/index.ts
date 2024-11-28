import type { ProjectConfig } from '../../types'
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
    ProjectConfig & { confirmScanDir: boolean, projectType: 'js' | 'flutter' }
  >([
    {
      type: 'input',
      name: 'projectId',
      message: '请输入临时项目ID (后续可通过 Dashboard 修改):', // TODO: 后续通过 Dashboard 修改
      default: `temp-${Date.now()}`,
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
  ])

  const config: ProjectConfig = {
    projectId: answers.projectId,
    defaultLocale: answers.defaultLocale,
    scanDir: answers.scanDir || '.',
    include: DEFAULT_SCAN_PATTERNS[answers.projectType].include,
    exclude: DEFAULT_SCAN_PATTERNS[answers.projectType].exclude,
  }

  const spinner = ora('正在创建配置文件...').start()

  try {
    await createConfig(config)
    spinner.succeed(chalk.green('配置文件创建成功！'))

    console.log(`\n${boxen(
      chalk.cyan(
        '🎉 初始化完成！接下来您可以：\n\n'
        + `1. 运行 ${chalk.bold('grey-parrot watch')} 开始监听项目文案\n`
        + `2. 使用 SDK 中的 ${chalk.bold('$tt()')} 函数标记需要翻译的文案\n`
        + `3. 后续可以通过 Dashboard 管理您的多语言文案`,
      ),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      },
    )}`)
  }
  catch (error) {
    spinner.fail(chalk.red('配置文件创建失败！'))
    console.error(error instanceof Error ? error.message : '未知错误')
    process.exit(1)
  }
}
