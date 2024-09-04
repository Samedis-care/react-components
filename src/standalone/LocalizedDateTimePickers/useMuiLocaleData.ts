import useCCTranslations from "../../utils/useCCTranslations";
import { deDE, enUS, frFR, nlNL, ruRU } from "@mui/x-date-pickers/locales";
import { LocalizationProviderProps } from "@mui/x-date-pickers";
import { Moment } from "moment";
import { useMemo } from "react";

const useMuiLocaleData = () => {
	const { i18n } = useCCTranslations();
	const [language] = i18n.language.split("-"); // second array element `region: string | undefined`, not used
	return useMemo(() => {
		const extractLocaleData = (
			locale:
				| typeof enUS
				| typeof deDE
				| typeof frFR
				| typeof nlNL
				| typeof ruRU,
		): LocalizationProviderProps<Moment, never>["localeText"] => {
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
