import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createApp, defineComponent, h } from 'vue'
import { createI18n, useI18n } from '..'

describe('vue integration', () => {
  const messages = {
    en: {
      hello: 'Hello',
      world: 'World',
    },
  }

  const options = {
    locale: 'en',
    messages,
  }

  it('should provide i18n instance', () => {
    const app = createApp({})
    const { install, i18n } = createI18n(options)
    app.use(install)
    expect(i18n.locale.value).toBe('en')
  })

  it('should work with composition API', () => {
    const TestComponent = defineComponent({
      setup() {
        const i18n = useI18n()
        return () => h('div', i18n.$t('hello'))
      },
    })

    const { install } = createI18n(options)
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[install]],
      },
    })

    expect(wrapper.text()).toBe('Hello')
  })

  it('should work with global properties', () => {
    const TestComponent = defineComponent({
      template: '<div>{{ $t("hello") }}</div>',
    })

    const { install } = createI18n(options)
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[install]],
      },
    })

    expect(wrapper.text()).toBe('Hello')
  })
})
