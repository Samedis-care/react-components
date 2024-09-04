import useCCTranslations from "../../utils/useCCTranslations";
import { deDE, enUS, frFR, nlNL, ruRU } from "@mui/x-date-pickers/locales";
import { useMemo } from "react";
const useMuiLocaleData = () => {
    const { i18n } = useCCTranslations();
    const [language] = i18n.language.split("-"); // second array element `region: string | undefined`, not used
    return useMemo(() => {
        const extractLocaleData = (locale) => {
            return locale.components.MuiLocalizationProvider.defaultProps.localeText;
        };
        const getLocaleData = () => {
            switch (language) {
                case "en":
                    return enUS;
                case "de":
                    return deDE;
                case "fr":
                    return frFR;
                case "nl":
                    return nlNL;
                case "ru":
                    return ruRU;
                default:
                    return enUS;
            }
        };
        return extractLocaleData(getLocaleData());
    }, [language]);
};
export default useMuiLocaleData;
