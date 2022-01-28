import { ESLintConfig } from '@beemo/driver-eslint';

const config: ESLintConfig = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-implicit-any-catch': 'off',
    'sort-keys': 'off',
  },
  plugins: ['prettier', '@typescript-eslint'],
  ignore: ['scripts', '*.generated.ts', '*.generated.tsx'],
  overrides: [
    {
      files: ['packages/**/*.js', 'packages/**/*.mjs'],
      rules: {
        'import/no-commonjs': 'off',
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
