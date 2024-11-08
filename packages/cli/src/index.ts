#!/usr/bin/env node
import boxen from 'boxen'
import chalk from 'chalk'
import { Command } from 'commander'
// import { dashboard } from './commands/dashboard'
// import { init } from './commands/init'
// import { scan } from './commands/scan'
// import { sync } from './commands/sync'

const program = new Command()

// CLI 信息
console.log(boxen(chalk.green('🦜 Grey Parrot I18n CLI'), {
  padding: 1,
  margin: 1,
  borderStyle: 'round',
  borderColor: 'green',
}))

program
  .name('grey-parrot')
  .description('Grey Parrot I18n CLI - 全流程的多语言管理方案')
  .version('0.1.0')

// program
//   .command('init')
//   .description('初始化项目的多语言配置')
//   .action(init)

// program
//   .command('scan')
//   .description('扫描项目中的多语言文案')
//   .option('-w, --watch', '监听文件变化')
//   .option('-o, --output <path>', '输出文件路径')
//   .option('--include <patterns...>', '包含的文件模式')
//   .option('--exclude <patterns...>', '排除的文件模式')
//   .action(scan)

// program
//   .command('sync')
//   .description('同步多语言文案到项目')
//   .option('-f, --force', '强制覆盖本地文件')
//   .action(sync)

// program
//   .command('dashboard')
//   .description('打开项目的 Dashboard')
//   .option('-p, --port <number>', '指定本地端口', '3000')
//   .action(dashboard)

program.parse()
