import { resolve } from 'node:path'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vitest.config.ts',
    test: {
      name: 'core',
      environment: 'node',
      include: ['packages/sdk/js/core/src/**/*.{test,spec}.{js,ts}'],
    },
  },
  {
    extends: './vitest.config.ts',
    test: {
      name: 'vue',
      environment: 'happy-dom',
      include: ['packages/sdk/js/vue/src/**/*.{test,spec}.{js,ts}'],
      alias: {
        '@grey-parrot-i18n/core': resolve(__dirname, 'packages/sdk/js/core/src/index.ts'),
      },
    },
  },
])
