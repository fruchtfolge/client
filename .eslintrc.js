module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  globals: {
    '_': true,
    '$nuxt': true
  },
  extends: [
    'plugin:nuxt/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: [
    'prettier'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    "vue/attribute-hyphenation": [{
      "ignore": ['perPage']
    }]
  }
}
