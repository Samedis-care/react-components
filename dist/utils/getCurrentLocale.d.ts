import { i18n } from "i18next";
/**
 * Gets the current locale from an i18n instance, defaulting to "en-US" when in cimode
 */
declare const getCurrentLocale: (i18n: i18n) => string;
export default getCurrentLocale;
/**
 * Gets the current language (without region) from an i18n instance, defaulting to "en" when in cimode
 */
export declare const getCurrentLanguage: (i18n: i18n) => string;
