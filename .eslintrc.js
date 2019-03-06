module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    '_': true,
    '$nuxt': true
  },
  extends: [
    '@nuxtjs',
    'plugin:prettier/recommended'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off'
  }
}
