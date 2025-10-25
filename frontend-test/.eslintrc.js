module.exports = {
  extends: ['next/core-web-vitals', 'next/typescript'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    // Allow require() for backend CommonJS files
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-commonjs': 'off',
  },
}
