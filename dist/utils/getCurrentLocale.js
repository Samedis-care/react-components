/**
 * Gets the current locale from an i18n instance, defaulting to "en-US" when in cimode
 */
const getCurrentLocale = (i18n) => {
    const lang = i18n.language;
    if (lang === "cimode")
        return "en-US";
    // normalize to BCP 47: replace underscores and strip POSIX suffixes (e.g. "en_US-posix" -> "en-US")
    return lang.replace(/_/g, "-").replace(/-posix$/i, "");
};
export default getCurrentLocale;
/**
 * Gets the current language (without region) from an i18n instance, defaulting to "en" when in cimode
 */
export const getCurrentLanguage = (i18n) => {
    return getCurrentLocale(i18n).split("-")[0];
};
