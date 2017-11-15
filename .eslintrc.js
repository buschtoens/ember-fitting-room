module.exports = {
  root: true,
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    "prettier"
  ],
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  env: {
    browser: true
  },
  rules: {
    "prettier/prettier": ["error", { singleQuote: true }]
  }
};
