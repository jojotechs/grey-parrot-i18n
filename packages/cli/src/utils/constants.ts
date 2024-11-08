export const DEFAULT_SCAN_PATTERNS = {
  js: {
    include: ['**/*.{js,jsx,ts,tsx,vue}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.git/**',
      '**/coverage/**',
      '**/.vscode/**',
      '**/.idea/**',
    ],
  },
  flutter: {
    include: ['**/*.dart'],
    exclude: [
      '**/build/**',
      '**/.dart_tool/**',
      '**/.pub/**',
      '**/ios/**',
      '**/android/**',
      '**/web/**',
      '**/test/**',
    ],
  },
}
