module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true
  },
  parser: '@typescript-eslint/parser',
  extends: ['plugin:react/recommended', 'next', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: __dirname + '/tsconfig.eslint.json'
  },
  plugins: ['react', 'prettier', '@typescript-eslint/eslint-plugin'],
  ignorePatterns: ['.eslintrc.js', 'next.config.mjs'],
  rules: {
    'no-console': 0,
    'import/first': 'error',
    'react/prop-types': 0,
    'linebreak-style': ['error', 'unix'],
    'no-restricted-imports': [
      'warn',
      {
        paths: ['@mui/material', '@mui/lab', '@mui/icons-material'],
        patterns: ['@mui/*/*/*']
      }
    ],
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
