module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'space-before-function-paren': 'off',
    'no-multiple-empty-lines': 'off',
    'no-prototype-builtins': 'off',
    'semi': ['error', 'always'],
    'prefer-const': 'off',
    'one-var': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
