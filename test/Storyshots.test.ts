import "./js-dom-mocks";
// import "./crud-mocks";
import initStoryshots from "@storybook/addon-storyshots";
import { advanceTo, clear } from "jest-date-mock";

/**
 * We have some controls which use the current Date (e.g. schedule controls).
 * To prevent them from failing the snapshot because the date changed we're going to make it static
 */

beforeAll(() => advanceTo(1606219200000));
afterAll(() => clear());

initStoryshots({
	storyKindRegex: /^(?!.*?(Backend-Components|Backend-Integration)).*$/gm,
});
