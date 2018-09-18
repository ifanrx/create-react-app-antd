module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: ['standard', 'standard-react'],
  parser: 'babel-eslint',
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    'eqeqeq': 0,
    'max-len': ['error', 120],
    indent: ['error', 2],
    quotes: ['error', 'single'],
    'object-curly-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'react/prop-types': 0,
    'standard/no-callback-literal': 0,
    'react/jsx-no-bind': 0,
  }
}
