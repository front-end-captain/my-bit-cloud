require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: ['@unknown/eslint-config/profile/node'],
  parserOptions: { tsconfigRootDir: __dirname }
};
