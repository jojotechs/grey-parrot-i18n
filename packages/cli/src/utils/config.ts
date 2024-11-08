import type { ProjectConfig } from '../types'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { cosmiconfig } from 'cosmiconfig'

const explorer = cosmiconfig('grey-parrot')

export function getConfigDir(): string {
  return process.cwd()
}

export async function getConfig(): Promise<ProjectConfig> {
  try {
    const result = await explorer.search()
    if (!result || !result.config)
      throw new Error('配置不存在')

    return {
      ...result.config,
      scanDir: '.', // 默认使用配置文件所在目录
    }
  }
  catch (error) {
    throw new Error('项目配置不存在，请先运行 grey-parrot init')
  }
}

export async function createConfig(config: ProjectConfig): Promise<void> {
  const configPath = resolve(process.cwd(), '.grey-parrotrc.json')
  await writeFile(configPath, JSON.stringify(config, null, 2))
}
