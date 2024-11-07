import { readonly, ref } from '@vue/reactivity'

type Languages = Record<string, Record<string, string>>
type LocaleType = string

class I18n {
  private languages: Languages = {}
  private currentLocale = ref('')

  constructor(defaultLocale: LocaleType, messages: Languages) {
    this.languages = messages
    this.currentLocale.value = defaultLocale
  }

  // 获取当前语言
  get locale() {
    return readonly(this.currentLocale)
  }

  // 切换语言
  setLocale(locale: LocaleType) {
    if (this.languages[locale]) {
      this.currentLocale.value = locale
    }
    else {
      console.warn(`Language ${locale} not found`)
    }
  }

  // 翻译方法
  $t(key: string, params?: Record<string, string>): string {
    const message = this.languages[this.currentLocale.value]?.[key]

    if (!message) {
      console.warn(`Translation key "${key}" not found`)
      return key
    }

    if (params) {
      return Object.entries(params).reduce(
        (acc, [key, value]) => acc.replace(new RegExp(`{${key}}`, 'g'), value),
        message,
      )
    }

    return message
  }

  // 添加新的语言包
  add(locale: LocaleType, messages: Record<string, string>) {
    this.languages[locale] = {
      ...(this.languages[locale] || {}),
      ...messages,
    }
  }
}

export { I18n }
