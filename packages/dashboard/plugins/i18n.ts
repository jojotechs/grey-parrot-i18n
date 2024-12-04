import { createI18n } from '@grey-parrot-i18n/vue'
import en from '../langs/en.json'
import zhCN from '../langs/zh-CN.json'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { install, i18n } = createI18n({
    locale: 'zh-CN',
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': zhCN,
      en,
    },
  })
  nuxtApp.vueApp.use(install)
  return {
    provide: {
      i18n,
    },
  }
})
