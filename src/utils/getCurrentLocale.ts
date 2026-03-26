import { i18n } from "i18next";

/**
 * Gets the current locale from an i18n instance, defaulting to "en-US" when in cimode
 */
const getCurrentLocale = (i18n: i18n): string => {
	const lang = i18n.language ?? "en-US";
	if (lang === "cimode") return "en-US";
	// normalize to BCP 47: replace underscores and strip POSIX suffixes (e.g. "en_US-posix" -> "en-US")
	return lang.replace(/_/g, "-").replace(/-posix$/i, "");
};
export default getCurrentLocale;

/**
 * Gets the current language (without region) from an i18n instance, defaulting to "en" when in cimode
 */
export const getCurrentLanguage = (i18n: i18n): string => {
	return getCurrentLocale(i18n).split("-")[0];
};
