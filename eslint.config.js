import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

const capasExternasApi = [
  'fastify',
  'fastify/*',
  '@fastify/*',
  'firebase-admin',
  'firebase-admin/*',
  '@vercel/*',
];

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**', 'Proyectos/**', 'calidad/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      eqeqeq: ['error', 'always'],
      'no-console': 'error',
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: globals.node,
    },
    rules: { ...tseslint.configs.disableTypeChecked.rules, 'no-console': 'off' },
  },

  // Arquitectura hexagonal: el dominio no conoce nada externo.
  {
    files: ['apps/api/src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/application/**', '**/infrastructure/**'],
              message: 'El dominio no depende de otras capas.',
            },
            { group: capasExternasApi, message: 'El dominio no depende de frameworks ni SDKs.' },
          ],
        },
      ],
    },
  },
  // La aplicación depende solo del dominio y de sus propios puertos (inversión de dependencias).
  {
    files: ['apps/api/src/application/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/infrastructure/**'],
              message: 'Use un puerto (interfaz) en application/ports.',
            },
            {
              group: capasExternasApi,
              message: 'Los casos de uso no dependen de frameworks ni SDKs.',
            },
          ],
        },
      ],
    },
  },

  // Frontend React: hooks, accesibilidad y prohibición de Firestore en el navegador.
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['firebase/firestore', 'firebase/firestore/*'],
              message: 'El navegador nunca habla con Firestore: use la API.',
            },
            {
              group: ['firebase-admin', 'firebase-admin/*'],
              message: 'El Admin SDK solo vive en la API.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/**/*.tsx'],
    ...jsxA11y.flatConfigs.strict,
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  prettier,
);
