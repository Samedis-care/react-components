import i18n, { Resource, ResourceKey } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const loadLang = (lang: string): Resource =>
	({
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		translation: require(`./assets/i18n/${lang}/translation.json`) as ResourceKey,
	} as Resource);

// edit this when adding new languages
export const langs = ["de", "en", "fr", "ru"];
const langVals: Record<string, Resource> = {};
for (const lang of langs) {
	langVals[lang] = loadLang(lang);
}

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
		fallbackLng: "en",
		debug: true,
		resources: langVals,

		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
	});

export default ccI18n;
