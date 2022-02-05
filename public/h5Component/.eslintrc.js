module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/standard'],
  parserOptions: {
    parser: 'babel-eslint',
    requireConfigFile: false,
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['vue'],
  rules: {
    semi: ['warn', 'always'],
    'spaced-comment': ['warn', 'always'],
    'prefer-const': 'off',
    'one-var': 'off',
    'space-before-function-paren': 'off',
    'no-multiple-empty-lines': 'off',
    'no-prototype-builtins': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
};
