/* eslint import/no-webpack-loader-syntax: off */

import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
// @ts-ignore These are locale files, there is no typescript definition for them
import resBundle from "i18next-resource-store-loader!./assets/i18n/index.js";

i18n
	// detect user language
	// see: https://github.com/i18next/i18next-browser-languageDetector
	.use(LanguageDetector)
	// pass the i18n instance to the react-i18next components.
	// Alternative use the I18nextProvider: https://react.i18next.com/components/i18nextprovider
	.use(initReactI18next)
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

		// special options for react-i18next
		// learn more: https://react.i18next.com/components/i18next-instance
		react: {
			wait: true,
		},
	});

export default i18n;
