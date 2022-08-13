require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  extends: ['@unknown/eslint-config/profile/react'],
  parserOptions: { tsconfigRootDir: __dirname }
};
