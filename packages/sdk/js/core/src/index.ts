import type { I18nOptions, Languages, LocaleType } from './types'
import { readonly, ref } from '@vue/reactivity'

export class I18n {
  private languages: Languages = {}
  private currentLocale = ref('')
  private fallbackLocale?: LocaleType

  // Languages that require region codes to be preserved
  private static readonly REGION_SPECIFIC_LANGS = new Set(['zh'])

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

  private replaceParams(text: string, params?: Record<string, string>): string {
    if (!params)
      return text

    return Object.entries(params).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, 'g'), value),
      text,
    )
  }

  $t(key: string, params?: Record<string, string>): string {
    const message = this.getMessage(key, this.currentLocale.value)
      || (this.fallbackLocale && this.getMessage(key, this.fallbackLocale))

    if (!message) {
      console.warn(`Translation key "${key}" not found`)
      return key
    }

    return this.replaceParams(message, params)
  }

  // different from $t, $tt is for placeholder which is not in the message, will be collected by cli and added to messages
  $tt(text: string, params?: Record<string, string>): string {
    return this.replaceParams(text, params)
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

  static getLanguage(locale?: string) {
    if (locale)
      return this.processLocale(locale)

    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.navigator)
      return undefined

    const browserLocale = navigator.language || navigator.languages?.[0]
    return browserLocale ? this.processLocale(browserLocale) : undefined
  }

  private static processLocale(locale: string) {
    const [lang, region] = locale.toLowerCase().split('-')

    // Keep region for specific languages
    if (this.REGION_SPECIFIC_LANGS.has(lang) && region)
      return `${lang}-${region}`

    return lang
  }
}

export * from './types'
