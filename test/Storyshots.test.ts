import "./js-dom-mocks";
// import "./crud-mocks";
import initStoryshots from "@storybook/addon-storyshots";

initStoryshots({
	storyKindRegex: /^(?!.*?(Backend-Components|Backend-Integration)).*$/gm,
});
