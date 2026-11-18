import { type i18n as I18nInstance } from "i18next";
export declare const langs: string[];
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
declare const ccI18n: I18nInstance;
export default ccI18n;
