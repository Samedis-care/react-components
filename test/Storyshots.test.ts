import "./js-dom-mocks";
// import "./crud-mocks";
import initStoryshots from "@storybook/addon-storyshots";
import { advanceTo, clear } from "jest-date-mock";
import ccI18n from "../src/i18n";

/**
 * We have some controls which use the current Date (e.g. schedule controls).
 * To prevent them from failing the snapshot because the date changed we're going to make it static
 */

beforeAll(async () => {
	// silence please
	console.log = jest.fn();
	console.warn = jest.fn();
	console.error = jest.fn();
	console.debug = jest.fn();

	// set fixed locale
	await ccI18n.changeLanguage("en");
	advanceTo(1606219200000);
});
afterAll(() => clear());

initStoryshots({
	storyKindRegex: /^(?!.*?(Backend-Components|Backend-Integration)).*$/gm,
});
