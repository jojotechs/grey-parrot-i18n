#!/usr/bin/env node
import boxen from 'boxen'
import chalk from 'chalk'
import { Command } from 'commander'
import { init } from './commands/init'
import { trans } from './commands/trans'

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
  .command('trans')
  .description('扫描项目中的多语言文案并生成翻译')
  .action(trans)

program
  .command('init')
  .description('初始化项目的多语言配置')
  .action(init)

program.parse()
