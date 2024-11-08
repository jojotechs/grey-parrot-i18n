export interface ProjectConfig {
  projectName: string
  defaultLocale: string
  supportedLocales: string[]
  scanDir: string
}

export interface ScanOptions {
  include?: string[]
  exclude?: string[]
}

export interface CollectedMessage {
  raw: string
  file: string
  line: number
  params?: string[]
}
