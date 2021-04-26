/* eslint-disable no-console */
import "./js-dom-mocks";
// import "./crud-mocks";
import initStoryshots, {
	multiSnapshotWithOptions,
} from "@storybook/addon-storyshots";
import { advanceTo, clear } from "jest-date-mock";
import ccI18n, { langs } from "../src/i18n";
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

	// set fixed locale and unload locale files as they cause a massive increase in snapshot size
	await ccI18n.changeLanguage("cimode");
	langs.forEach((lang) => ccI18n.removeResourceBundle(lang, "translation"));
	advanceTo(1606219200000);
});
afterAll(() => clear());

initStoryshots({
	storyKindRegex: /^(?!.*?(Backend-Components|Backend-Integration)).*$/gm,
	test: multiSnapshotWithOptions({ renderer: createMount() }),
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	snapshotSerializers: [enzymeSerializer()],
});
