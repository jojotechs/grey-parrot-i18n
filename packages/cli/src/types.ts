export interface ProjectConfig {
  projectName: string
  defaultLocale: string
  supportedLocales: string[]
  scanDir: string
}

export interface ScanOptions {
  watch?: boolean
  output?: string
  include?: string[]
  exclude?: string[]
}

export interface CollectedMessage {
  raw: string
  file: string
  line: number
  params?: string[]
}
