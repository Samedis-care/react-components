import {
	deDE,
	enUS,
	esES,
	frFR,
	itIT,
	nlNL,
	ruRU,
} from "@mui/x-date-pickers/locales";
import { LocalizationProviderProps } from "@mui/x-date-pickers";
import { useMemo } from "react";
import { useCurrentLanguage } from "../../utils/useCurrentLocale";

/**
 * The MUI picker texts (`localeText`) for the current components-care language.
 * Every library language MUI ships texts for gets MUI's translation (de, en, es,
 * fr, it, nl, ru); any other (uz, which MUI has no texts for) gets English. The
 * object is MUI's own, so it stays the same while the language does.
 * @returns The `localeText` to hand to a `LocalizationProvider`
 */
const useMuiLocaleData = () => {
	const language = useCurrentLanguage();
	return useMemo(() => {
		const extractLocaleData = (
			locale: typeof enUS,
		): LocalizationProviderProps<never>["localeText"] => {
			return locale.components.MuiLocalizationProvider.defaultProps.localeText;
		};
		const getLocaleData = () => {
			switch (language) {
				case "en":
					return enUS;
				case "de":
					return deDE;
				case "es":
					return esES;
				case "fr":
					return frFR;
				case "it":
					return itIT;
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
