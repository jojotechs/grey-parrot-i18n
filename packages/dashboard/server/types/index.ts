export interface AITranslationResponse {
  key: string
  translations: Record<string, string>
}

export interface EntryUpdateResponse {
  success: boolean
  entries: AITranslationResponse[]
  errors?: string[]
}
