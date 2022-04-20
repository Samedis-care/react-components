import i18n, { Resource, ResourceKey } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import supportedLanguages from "./assets/data/supported-languages.json";

const loadLang = (lang: string): Resource =>
	({
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		translation: require(`./assets/i18n/${lang}/translation.json`) as ResourceKey,
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		languages: require(`./assets/i18n/${lang}/languages.json`) as ResourceKey,
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		"locale-switcher": require(`./assets/i18n/${lang}/locale-switcher.json`) as ResourceKey,
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		countries: require(`./assets/i18n/${lang}/countries.json`) as ResourceKey,
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		currencies: require(`./assets/i18n/${lang}/currencies.json`) as ResourceKey,
	} as Resource);

export const langs = supportedLanguages;
const langVals: Record<string, Resource> = {};
for (const lang of langs) {
	langVals[lang] = loadLang(lang);
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.lvs = langVals;

const ccI18n = i18n.createInstance();

void ccI18n
	// detect user language
	// see: https://github.com/i18next/i18next-browser-languageDetector
	.use(LanguageDetector)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		ns: ["translation"],
		defaultNS: "translation",
		supportedLngs: langs,
		nonExplicitSupportedLngs: true,
		fallbackLng: "en",
		debug: process.env.NODE_ENV !== "production",
		resources: langVals,
		initImmediate: false,

		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
	});

export default ccI18n;
