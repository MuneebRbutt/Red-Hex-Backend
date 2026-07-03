/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ['en'],
  sourceLocale: 'en',
  catalogs: [
    {
      path: '<rootDir>/src/locale/{locale}/messages',
      include: ['src'],
    },
  ],
  format: 'po',
};
