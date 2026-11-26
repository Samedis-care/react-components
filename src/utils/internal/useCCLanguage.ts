import { useSyncExternalStore } from "react";
import ccI18n from "../../i18n";

/**
 * Subscribes to components-care's language changes
 * @param onChange Called after each change
 * @returns The unsubscribe function
 */
const subscribe = (onChange: () => void) => {
	ccI18n.on("languageChanged", onChange);
	return () => ccI18n.off("languageChanged", onChange);
};

/** components-care's current language */
const getLanguage = () => ccI18n.language;

/**
 * components-care's current language (ccI18n.language, e.g. "de-DE"); the caller
 * renders again when it changes. For a component rendered many times over, such as a
 * grid cell, that only needs to follow the language: useCCTranslations costs
 * noticeably more per mount.
 * @returns The language
 */
const useCCLanguage = (): string =>
	useSyncExternalStore(subscribe, getLanguage);

export default useCCLanguage;
