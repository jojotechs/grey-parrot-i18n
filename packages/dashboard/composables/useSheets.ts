import type { SheetWithParsedLanguages } from '~/server/utils/drizzle'

export function useSheets() {
  // 获取多语言表列表
  const { data: sheets, error, refresh } = useFetch<SheetWithParsedLanguages[]>('/api/sheets')

  // 获取单个多语言表
  async function getSheet(id: number) {
    const { data } = await useFetch<SheetWithParsedLanguages>(`/api/sheets/${id}`)
    return data.value
  }

  // 获取多语言表的条目
  async function getSheetEntries(id: number) {
    const { data } = await useFetch(`/api/sheets/${id}/entries`)
    return data.value
  }

  // 创建多语言表
  async function createSheet(data: {
    name: string
    description?: string
    languages: string[]
  }) {
    await $fetch('/api/sheets', {
      method: 'POST',
      body: data,
    })
  }

  // 更新多语言表
  async function updateSheet(id: number, data: {
    name: string
    description?: string
    languages: string[]
  }) {
    await $fetch(`/api/sheets/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  // 删除多语言表
  async function deleteSheet(id: number) {
    await $fetch(`/api/sheets/${id}`, {
      method: 'DELETE',
    })
  }

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

  // 语言选项
  const languageOptions = Object.entries(languageMap).map(([value, label]) => ({
    value,
    label,
  }))

  return {
    sheets,
    error,
    refresh,
    getSheet,
    getSheetEntries,
    createSheet,
    updateSheet,
    deleteSheet,
    languageMap,
    languageOptions,
  }
}
