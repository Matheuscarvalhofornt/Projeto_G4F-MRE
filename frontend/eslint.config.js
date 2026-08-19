import eslint from '@eslint/js';
import globals from 'globals';
import hooksPlugin from 'eslint-plugin-react-hooks';
import refreshPlugin from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': hooksPlugin, 'react-refresh': refreshPlugin },
    rules: {
      ...hooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
