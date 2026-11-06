import getCurrentLocale from "./getCurrentLocale";
import ccI18n from "../i18n";

/**
 * Gets the decimal or group separator of the current locale (the language of the CC i18n
 * instance), as numbers formatted with the given options show it. Options and locales that
 * leave a separator out of some numbers don't change it: the group separator of es is "."
 * although es shows 1234 as "1234", and also with `useGrouping: false`.
 * @param separatorType The separator type
 * @param options The number format options
 * @returns The separator, or "," if numbers in this format have none
 */
const getNumberSeparator = (
	separatorType: "decimal" | "group",
	options?: Intl.NumberFormatOptions,
): string => {
	const format = Intl.NumberFormat(getCurrentLocale(ccI18n), {
		...options,
		// options that show no fraction digits (e.g. a currency like JPY) or no grouping don't
		// change the separators, but leave them out of the formatted number
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		minimumSignificantDigits: undefined,
		maximumSignificantDigits: undefined,
		// some locales group only from 5 digits on (e.g. es and it show 1000 as "1000", but
		// 10000 as "10.000"); engines before Intl.NumberFormat v3 read "always" as the
		// locale's own grouping, so the number below has enough digits for every locale
		useGrouping: "always",
	})
		.formatToParts(1000000.11)
		.find((part) => part.type === separatorType);
	return format === undefined ? "," : format.value;
};
export default getNumberSeparator;
