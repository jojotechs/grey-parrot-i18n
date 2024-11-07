import type { I18nOptions } from '../types'
import { describe, expect, it } from 'vitest'
import { I18n } from '..'

describe('i18n core', () => {
  const messages = {
    en: {
      hello: 'Hello',
      world: 'World',
      welcome: 'Welcome, {name}!',
    },
    zh: {
      hello: '你好',
      world: '世界',
      welcome: '欢迎，{name}！',
    },
  }

  const options: I18nOptions = {
    locale: 'en',
    messages,
  }

  it('should initialize with default locale', () => {
    const i18n = new I18n(options)
    expect(i18n.locale.value).toBe('en')
  })

  it('should translate simple message', () => {
    const i18n = new I18n(options)
    expect(i18n.$t('hello')).toBe('Hello')
  })

  it('should translate with parameters', () => {
    const i18n = new I18n(options)
    expect(i18n.$t('welcome', { name: 'John' })).toBe('Welcome, John!')
  })

  it('should switch locale', () => {
    const i18n = new I18n(options)
    i18n.setLocale('zh')
    expect(i18n.locale.value).toBe('zh')
    expect(i18n.$t('hello')).toBe('你好')
  })

  it('should add new messages', () => {
    const i18n = new I18n(options)
    i18n.add('en', { test: 'Test' })
    expect(i18n.$t('test')).toBe('Test')
  })

  it('should handle missing translations', () => {
    const i18n = new I18n(options)
    expect(i18n.$t('missing')).toBe('missing')
  })

  it('should use fallback locale', () => {
    const i18n = new I18n({
      ...options,
      locale: 'fr',
      fallbackLocale: 'en',
    })
    expect(i18n.$t('hello')).toBe('Hello')
  })
})
