import "./js-dom-mocks";
// import "./crud-mocks";
import initStoryshots from "@storybook/addon-storyshots";

initStoryshots({
	storyNameRegex: /^(?!.*?(Backend-Components|Backend-Integration)).*$/gm,
});
