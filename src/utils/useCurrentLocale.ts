import getCurrentLocale, { getCurrentLanguage } from "./getCurrentLocale";
import useCCTranslations from "./useCCTranslations";

const useCurrentLocale = (): string => {
	const { i18n } = useCCTranslations();
	return getCurrentLocale(i18n);
};

export default useCurrentLocale;

export const useCurrentLanguage = (): string => {
	const { i18n } = useCCTranslations();
	return getCurrentLanguage(i18n);
};
