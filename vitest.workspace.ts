import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'core',
      environment: 'node',
      include: ['packages/sdk/js/core/src/**/*.{test,spec}.{js,ts}'],
    },
  },
  {
    test: {
      name: 'vue',
      environment: 'happy-dom',
      include: ['packages/sdk/js/vue/src/**/*.{test,spec}.{js,ts}'],
      deps: {
        optimizer: {
          web: {
            include: ['@grey-parrot-i18n/core'],
          },
        },
      },
    },
  },
])
