export type Languages = Record<string, Record<string, string>>
export type LocaleType = string

export interface I18nOptions {
  locale: LocaleType
  messages: Languages
  fallbackLocale?: LocaleType
}
