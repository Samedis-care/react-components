import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import supportedLanguages from "./assets/data/supported-languages.json";
import resourcesToBackend from "i18next-resources-to-backend";

export const langs = supportedLanguages;

const ccI18n = i18n.createInstance();
const isJest = process && process.env && process.env.JEST_WORKER_ID;

void ccI18n
	// async fetch locales
	.use(
		resourcesToBackend(
			(lang: string, namespace: string) =>
				import(`./assets/i18n/${lang.split("-")[0]}/${namespace}.json`)
		)
	)
	// detect user language
	// see: https://github.com/i18next/i18next-browser-languageDetector
	.use(LanguageDetector)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		// when running under jest we load all namespaces because otherwise we'd just have snapshots of react suspense
		ns: isJest
			? [
					"translation",
					"countries",
					"currencies",
					"languages",
					"locale-switcher",
			  ]
			: ["translation"],
		defaultNS: "translation",
		supportedLngs: langs,
		nonExplicitSupportedLngs: true,
		fallbackLng: "en",
		debug: process.env.NODE_ENV !== "production",
		initImmediate:
			// when running under jest we init immediately because otherwise we'd just have snapshots of react suspense
			!isJest,

		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
	});

export default ccI18n;
