export interface ProjectConfig {
  projectId: string
  dashboardUrl: string
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
