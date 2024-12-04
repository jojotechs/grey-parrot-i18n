export interface ProjectConfig {
  projectId: string
  dashboardUrl: string
  defaultLocale: string
  scanDir: string
  langsDir: string
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

export interface TextLocation {
  file: string
  line: number
}

export interface FileMatch {
  file: string
  matches: Array<{
    text: string
    line: number
    start: number
    end: number
    fullMatch: string
  }>
}

export interface TransResponse {
  entries: Array<{
    key: string
    translations: Record<string, string>
  }>
}

export interface TransOptions {
  replace?: boolean
}
