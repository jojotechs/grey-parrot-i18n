export interface ProjectConfig {
  projectId: string // TODO: 项目ID，后面从dashboard获取
  defaultLocale: string
  scanDir: string
  include: string[]
  exclude: string[]
}

export interface ScanOptions {
  include?: string[]
  exclude?: string[]
}

export interface I18nMatch {
  text: string
  fullMatch: string
  start: number
  end: number
  lineNumber: number
  column: number
  params?: string
}
