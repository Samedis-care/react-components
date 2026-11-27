/**
 * components-care's current language (ccI18n.language, e.g. "de-DE"); the caller
 * renders again when it changes. For a component rendered many times over, such as a
 * grid cell, that only needs to follow the language: useCCTranslations costs
 * noticeably more per mount.
 * @returns The language
 */
declare const useCCLanguage: () => string;
export default useCCLanguage;
