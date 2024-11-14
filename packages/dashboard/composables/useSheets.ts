import type { Sheet } from '~/server/utils/drizzle'

export function useSheets() {
  // 获取多语言表列表
  const { data: sheets, error, refresh } = useFetch<Sheet[]>('/api/sheets')

  // 获取语言名称映射
  const languageMap: Record<string, string> = {
    'zh-CN': '简体中文',
    'zh-HK': '繁體中文（香港）',
    'zh-TW': '繁體中文（台灣）',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
    'es': 'Español',
    'pt': 'Português',
    'ar': 'العربية',
    'id': 'Bahasa Indonesia',
    'th': 'ไทย',
  }

  return {
    sheets,
    error,
    refresh,
    languageMap,
  }
}
