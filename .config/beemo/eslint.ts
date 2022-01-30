import { ESLintConfig } from '@beemo/driver-eslint';

const config: ESLintConfig = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    // 'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-implicit-any-catch': 'off',
    'sort-keys': 'off',
    // 'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }], //should add ".ts" if typescript project
    'react/react-in-jsx-scope': 'off',
  },
  plugins: ['prettier', 'react', '@typescript-eslint'],
  ignore: ['scripts', '*.generated.ts', '*.generated.tsx', '.eslintrc.js'],
  overrides: [
    {
      files: ['packages/**/*.js', 'packages/**/*.mjs'],
      rules: {
        'import/no-commonjs': 'off',
        'unicorn/prefer-module': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
      },
    },
    {
      files: ['packages/*/tests/**/*'],
      rules: {
        'no-magic-numbers': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      },
    },
    {
      files: ['packages/*/tests/examples?/**/*', 'examples/**/*'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};

export default config;
