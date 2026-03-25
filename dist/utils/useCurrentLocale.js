import getCurrentLocale, { getCurrentLanguage } from "./getCurrentLocale";
import useCCTranslations from "./useCCTranslations";
const useCurrentLocale = () => {
    const { i18n } = useCCTranslations();
    return getCurrentLocale(i18n);
};
export default useCurrentLocale;
export const useCurrentLanguage = () => {
    const { i18n } = useCCTranslations();
    return getCurrentLanguage(i18n);
};
