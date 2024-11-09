import chalk from 'chalk'
import ora from 'ora'
import { getConfig } from '../../utils/config'
import { createWatcher } from './watcher'

export async function watch() {
  const spinner = ora('正在初始化监听服务...').start()

  try {
    const config = await getConfig()
    const watcher = await createWatcher({
      scanDir: config.scanDir,
      include: config.include,
      exclude: config.exclude,
    })

    spinner.succeed(chalk.green('监听服务已启动'))
    console.log(chalk.blue(`正在监听 ${config.scanDir} 目录下的文件变化...`))

    // 优雅退出
    process.on('SIGINT', () => {
      watcher.close()
      console.log(chalk.yellow('\n已停止监听服务'))
      process.exit(0)
    })
  }
  catch (error) {
    spinner.fail(chalk.red(error instanceof Error ? error.message : '未知错误'))
    process.exit(1)
  }
}
