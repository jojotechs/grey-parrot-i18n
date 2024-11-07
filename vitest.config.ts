import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: ['**/dist/**'],
    coverage: {
      exclude: [
        '**/dist/**',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/__tests__/**',
      ],
      include: [
        'packages/sdk/js/*/src/**/*.{js,ts,vue}',
      ],
    },
  },
})
