import type { ProjectConfig } from '../types'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const CONFIG_FILE = '.grey-parrot.json'

export function getConfigDir(): string {
  return resolve(process.cwd(), CONFIG_FILE, '..')
}

export async function getConfig(): Promise<ProjectConfig> {
  try {
    const content = await readFile(resolve(process.cwd(), CONFIG_FILE), 'utf-8')
    return {
      ...JSON.parse(content),
      scanDir: '.', // 默认使用配置文件所在目录
    }
  }
  catch (error) {
    throw new Error('项目配置不存在，请先运行 grey-parrot init')
  }
}

export async function createConfig(config: ProjectConfig): Promise<void> {
  await writeFile(
    resolve(process.cwd(), CONFIG_FILE),
    JSON.stringify(config, null, 2),
  )
}
