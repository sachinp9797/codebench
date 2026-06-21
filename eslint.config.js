import importPlugin from 'eslint-plugin-import';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
  {
    files: ['packages/core/**/*.ts'],
    languageOptions: { parser: tsParser },
    plugins: { import: importPlugin },
    rules: {
      // core must not import any other @codebench/* package
      'import/no-restricted-paths': ['error', {
        zones: [{ target: './packages/core', from: './packages', except: ['./core'] }],
      }],
    },
  },
  {
    files: ['packages/web/**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser },
    plugins: { import: importPlugin },
    rules: {
      // web may only import @codebench/core (not providers/executor/runner/extractor)
      'no-restricted-imports': ['error', {
        patterns: ['@codebench/providers', '@codebench/executor', '@codebench/runner', '@codebench/extractor'],
      }],
    },
  },
];
