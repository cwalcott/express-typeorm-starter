import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import pluginN from 'eslint-plugin-n';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettier,
  {
    plugins: {
      n: pluginN
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'n/prefer-node-protocol': 'error',
      'n/no-deprecated-api': 'error',
      'n/no-unpublished-import': 'error',
      'n/process-exit-as-throw': 'error',
      'n/no-path-concat': 'error',
      'n/prefer-global/process': 'error',
      'n/prefer-global/buffer': 'error',
      'n/prefer-global/console': 'error',
      'n/prefer-global/url': 'error'
    }
  },
  {
    // Override for test files
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', 'tests/**/*'],
    rules: {
      'n/no-unpublished-import': 'off' // Allow dev dependencies in tests
    }
  },
  {
    ignores: ['dist/', 'node_modules/', 'data/', '*.js']
  }
);
