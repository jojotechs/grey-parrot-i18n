export const LANGUAGE_MAP: Record<string, string> = {
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

export const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_MAP).map(([value, label]) => ({
  value,
  label,
}))

export const DEFAULT_LANGUAGE = 'en'
