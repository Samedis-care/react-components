module.exports = {
  stories: ['../src/stories/**/index.story.@(ts|tsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-knobs/register',
    '@storybook/addon-actions',
    '@storybook/addon-links',
  ],
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "cldr$": "cldrjs",
      "cldr": "cldrjs/dist/cldr"
    };
    return config;
  },
};
