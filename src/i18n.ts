/* eslint import/no-webpack-loader-syntax: off */

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
// @ts-ignore These are locale files, there is no typescript definition for them
import resBundle from "i18next-resource-store-loader!./assets/i18n/index.js";

const ccI18n = i18n.createInstance();

ccI18n
	// detect user language
	// see: https://github.com/i18next/i18next-browser-languageDetector
	.use(LanguageDetector)
	// init i18next
	// for all options read: https://www.i18next.com/overview/configuration-options
	.init({
		ns: ["translation"],
		defaultNS: "translation",
		fallbackLng: "en",
		debug: true,
		resources: resBundle,

		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},
	});

export default ccI18n;
