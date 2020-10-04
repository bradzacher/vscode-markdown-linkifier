/**@type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['brad'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'no-void': 'off',
  },
};
