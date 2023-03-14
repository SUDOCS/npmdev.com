module.exports = {
  extends: [
    '@antfu',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'curly': 'off',
    'import/order': ['error', { alphabetize: { order: 'asc', caseInsensitive: true } }],
  },
}
