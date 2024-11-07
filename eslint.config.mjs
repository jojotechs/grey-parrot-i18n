import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'n/prefer-global/process': 'warn',
    'n/prefer-global/buffer': 'warn',
    'unused-imports/no-unused-vars': 'warn',
  },
})
