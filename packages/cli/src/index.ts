#!/usr/bin/env node
import boxen from 'boxen'
import chalk from 'chalk'
import { Command } from 'commander'
import { watch } from './commands/watch'

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

program
  .command('watch')
  .description('监听项目中的多语言文案变化')
  .option('--include <patterns...>', '包含的文件模式')
  .option('--exclude <patterns...>', '排除的文件模式')
  .action(watch)

program.parse()
