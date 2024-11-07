import type { App, InjectionKey } from 'vue'
import { I18n } from '@grey-parrot-i18n/core'
import { inject } from 'vue'

export const I18nSymbol: InjectionKey<I18n> = Symbol('i18n')

export interface I18nOptions {
  locale: string
  messages: Record<string, Record<string, string>>
}

export function createI18n(options: I18nOptions) {
  const i18n = new I18n(options.locale, options.messages)

  return {
    install(app: App) {
      // 提供全局属性
      app.config.globalProperties.$i18n = i18n
      app.config.globalProperties.$t = i18n.$t.bind(i18n)

      // 提供注入
      app.provide(I18nSymbol, i18n)
    },
    i18n,
  }
}

// 组合式API
export function useI18n() {
  const i18n = inject(I18nSymbol)
  if (!i18n) {
    throw new Error('useI18n() must be called after installing i18n plugin')
  }
  return i18n
}

// 重新导出core类型
export type { I18n }
