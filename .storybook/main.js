module.exports = {
	stories: ["../src/stories/**/index.story.@(ts|tsx)"],
	addons: [
		"@storybook/preset-create-react-app",
		"@storybook/addon-knobs/register",
		"@storybook/addon-actions",
		"@storybook/addon-links",
	],
	webpackFinal: async (config) => {
		if (config.mode === "development") {
			// Disable proptype generation in dev as this is slow => 50% speed improvement
			config.plugins = config.plugins.filter(
				(plugin) => plugin.name !== "React Docgen Typescript Plugin"
			); // Disable ESlint plugin in dev as this is also slow (and buggy due to wrong caching) => 60% speed improvement

			config.plugins = config.plugins.filter(
				(plugin) => !("options" in plugin && "eslintPath" in plugin.options)
			); // Total 80-85% speed improvement
		}

		config.resolve.alias = {
			...config.resolve.alias,
			cldr$: "cldrjs",
			cldr: "cldrjs/dist/cldr",
		};
		return config;
	},
	core: {
		builder: "webpack5",
	},
};
