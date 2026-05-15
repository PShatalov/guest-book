import baseConfig from '@guest-book/eslint-config';

const nodeGlobals = {
  Buffer: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  clearInterval: 'readonly',
  console: 'readonly',
  exports: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',
};

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'drizzle/**'],
  },
  {
    files: ['src/**/*.ts', 'test/**/*.ts', 'drizzle.config.ts'],
    languageOptions: {
      globals: nodeGlobals,
    },
  },
];
