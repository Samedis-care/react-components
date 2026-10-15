import getCurrentLocale from "./getCurrentLocale";
import ccI18n from "../i18n";
/**
 * Gets the decimal or group separator of the current locale
 * @param separatorType The separator type
 * @param options The number format options
 */
const getNumberSeparator = (separatorType, options) => {
    const format = Intl.NumberFormat(getCurrentLocale(ccI18n), {
        ...options,
        // options that show no fraction digits (e.g. a currency like JPY) don't change the
        // separator, but leave it out of the formatted number
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        minimumSignificantDigits: undefined,
        maximumSignificantDigits: undefined,
    })
        .formatToParts(1000.11)
        .find((part) => part.type === separatorType);
    return format === undefined ? "," : format.value;
};
export default getNumberSeparator;
