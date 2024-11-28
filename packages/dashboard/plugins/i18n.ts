import { createI18n } from '@grey-parrot-i18n/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const { install, i18n } = createI18n({
    locale: 'zh',
    messages: {
      zh: {
        // 你的中文翻译
      },
      en: {
        // 你的英文翻译
      },
    },
  })

  nuxtApp.vueApp.use(install)

  return {
    provide: {
      i18n,
    },
  }
})
