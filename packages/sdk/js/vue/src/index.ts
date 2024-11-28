import type { I18nOptions } from '@grey-parrot-i18n/core'
import type { App, InjectionKey } from 'vue'
import { I18n } from '@grey-parrot-i18n/core'
import { inject } from 'vue'

export const I18nSymbol: InjectionKey<I18n> = Symbol('parrot-i18n')

// 扩展 vue 的类型声明
declare module 'vue' {
  interface ComponentCustomProperties {
    $i18n: I18n
    $t: I18n['$t']
    $tt: I18n['$tt']
  }
}

export function createI18n(options: I18nOptions) {
  const i18n = new I18n(options)

  return {
    install(app: App) {
      app.config.globalProperties.$i18n = i18n
      app.config.globalProperties.$t = i18n.$t.bind(i18n)
      app.config.globalProperties.$tt = i18n.$tt.bind(i18n)
      app.provide(I18nSymbol, i18n)
    },
    i18n,
  }
}

export function useI18n() {
  const i18n = inject(I18nSymbol)
  if (!i18n)
    throw new Error('useI18n() must be called after installing i18n plugin')

  return i18n
}

export type { I18n, I18nOptions }
