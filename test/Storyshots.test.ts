import "./js-dom-mocks";
// import "./crud-mocks";
import initStoryshots from "@storybook/addon-storyshots";
import { advanceTo, clear } from "jest-date-mock";
import ccI18n from "../src/i18n";
import enzyme from "enzyme";
import { createSerializer as enzymeSerializer } from "enzyme-to-json";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";

import { createMount } from "@material-ui/core/test-utils";

enzyme.configure({
	adapter: new Adapter(),
});

/**
 * We have some controls which use the current Date (e.g. schedule controls) and/or Locale.
 * To prevent them from failing the snapshot because the date/locale changed we're going to make it static
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
	renderer: createMount(),
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	snapshotSerializers: [enzymeSerializer()],
});
