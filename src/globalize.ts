import Globalize from "globalize/dist/globalize";
import "globalize/dist/globalize/number";
import "globalize/dist/globalize/currency";

// required CLDR json files from http://johnnyreilly.github.io/globalize-so-what-cha-want/#/?currency=true&date=false&message=false&number=true&plural=false&relativeTime=false&unit=false
import likelySubtags from "cldr-data/supplemental/likelySubtags.json";
import numberingSystems from "cldr-data/supplemental/numberingSystems.json";
import plurals from "cldr-data/supplemental/plurals.json";
import ordinals from "cldr-data/supplemental/ordinals.json";
import currencyData from "cldr-data/supplemental/currencyData.json";
import { deepAssign } from "./utils";
import ccI18n from "./i18n";

// base data
let data = deepAssign(
	{},
	currencyData,
	likelySubtags,
	numberingSystems,
	numberingSystems,
	plurals,
	ordinals
);

const loadLocale = (locale: string): Promise<Record<string, unknown>>[] =>
	[
		import("cldr-data/main/" + locale + "/numbers.json"),
		import("cldr-data/main/" + locale + "/currencies.json"),
	] as Promise<Record<string, unknown>>[];

const loadGlobalize = async (): Promise<Globalize> => {
	const locale = ccI18n.language;

	if ("main" in data && locale in (data.main as Record<string, unknown>)) {
		// to prevent a data race here:
		if (!instanceCache) return Globalize(ccI18n.language);

		return instanceCache;
	}
	data = deepAssign(data, ...(await Promise.all(loadLocale(locale))));
	Globalize.load(data);
	instanceCache = Globalize(ccI18n.language);
	return instanceCache;
};

// fetch new languages as needed
ccI18n.on("languageChanged", () => void loadGlobalize());

let instanceCache: Globalize | null = null;

/**
 * Fast cached access to a globalized instance with the current locale
 */
export const getGlobalized = async (): Promise<Globalize> => {
	if (!instanceCache) {
		return loadGlobalize();
	}
	return instanceCache;
};
