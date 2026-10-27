// Configuración ESLint compartida del monorepo (flat config, ESLint 9).
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/dist/**',
    '**/coverage/**',
    '**/.vite/**',
    '**/playwright-report/**',
    '**/test-results/**',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // Los logs van por pino; nada de console.* en el código final.
      'no-console': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['apps/api/**/*.ts', 'packages/**/*.{ts,js}', '**/*.config.{ts,js}'],
    languageOptions: { globals: globals.node },
  },
  prettier,
);
