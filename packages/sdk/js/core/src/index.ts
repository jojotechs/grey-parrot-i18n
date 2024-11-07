import type { I18nOptions, Languages, LocaleType } from './types'
import { readonly, ref } from '@vue/reactivity'

export class I18n {
  private languages: Languages = {}
  private currentLocale = ref('')
  private fallbackLocale?: LocaleType

  constructor(options: I18nOptions) {
    if (options.messages)
      this.languages = options.messages

    this.currentLocale.value = options.locale
    this.fallbackLocale = options.fallbackLocale
  }

  get locale() {
    return readonly(this.currentLocale)
  }

  get availableLocales() {
    return Object.keys(this.languages)
  }

  setLocale(locale: LocaleType) {
    if (this.languages[locale]) {
      this.currentLocale.value = locale
    }
    else {
      console.warn(`Language ${locale} not found`)
    }
  }

  $t(key: string, params?: Record<string, string>): string {
    const message = this.getMessage(key, this.currentLocale.value)
      || (this.fallbackLocale && this.getMessage(key, this.fallbackLocale))

    if (!message) {
      console.warn(`Translation key "${key}" not found`)
      return key
    }

    if (!params)
      return message

    return Object.entries(params).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, 'g'), value),
      message,
    )
  }

  private getMessage(key: string, locale: LocaleType): string | undefined {
    return this.languages[locale]?.[key]
  }

  add(locale: LocaleType, messages: Record<string, string>): void
  add(messages: Languages): void
  add(localeOrMessages: LocaleType | Languages, messages?: Record<string, string>) {
    if (typeof localeOrMessages === 'string' && messages) {
      // 单语言添加
      this.languages[localeOrMessages] = {
        ...(this.languages[localeOrMessages] || {}),
        ...messages,
      }
    }
    else if (typeof localeOrMessages === 'object') {
      // 批量添加多语言
      this.languages = {
        ...this.languages,
        ...localeOrMessages,
      }
    }
  }

  hasLocale(locale: LocaleType) {
    return !!this.languages[locale]
  }

  getMessages() {
    return this.languages
  }
}

export * from './types'
