import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import supportedLanguages from "./assets/data/supported-languages.json";
import resourcesToBackend from "i18next-resources-to-backend";
export const langs = supportedLanguages;
/**
 * The i18next instance of Components-Care, exported as `ComponentsCareI18n`. It leads the
 * app's UI language: the Components-Care widgets render in its language, and the
 * Framework's `CCI18nProvider` sets moment's locale and `<html lang>` from it.
 *
 * Change the language through it, `ComponentsCareI18n.changeLanguage(locale)`, e.g. after
 * login to the language of the user's profile; `LocaleSelectorDialog` does the same.
 * Changing only the app's own i18next instance leaves the Components-Care widgets, moment
 * and `<html lang>` in the old language. The app's own instance follows this one: add
 * something like this to the app's entry point (`languageChanged` also fires when the
 * language is detected at start-up).
 * ```ts
 * // Components-Care i18n locale sync
 * ComponentsCareI18n.on("languageChanged", () => {
 *   void i18n.changeLanguage(getCurrentLocale(ComponentsCareI18n));
 * });
 * ```
 * Its language detector stores the language in `localStorage.i18nextLng`.
 */
const ccI18n = i18n.createInstance();
const isJest = typeof process !== "undefined" && process.env && process.env.JEST_WORKER_ID;
void ccI18n
    // async fetch locales
    .use(resourcesToBackend((lang, namespace) => import(`./assets/i18n/${lang.split("-")[0]}/${namespace}.json`)))
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
    initAsync: 
    // when running under jest we init immediately because otherwise we'd just have snapshots of react suspense
    !isJest,
    interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
    },
});
export default ccI18n;
