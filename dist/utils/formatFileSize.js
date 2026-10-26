const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
/**
 * Formats a file size for display, e.g. 15728640 bytes as "15 MB"
 * @param bytes The size in bytes
 * @param locale The locale to format for, e.g. from useCurrentLocale
 * @returns The size in the largest unit it fills at least once, with at most one decimal
 * @remarks Each unit is 1024 of the one below, as Rails counts them, so that a limit the
 *          backend defines as `15.megabytes` reads as 15 MB rather than 15.7.
 */
const formatFileSize = (bytes, locale) => {
    let unit = 0;
    let value = bytes;
    // compared as displayed, so that 1023.96 kB is shown as 1 MB and not as 1,024 kB
    while (Math.round(value * 10) / 10 >= 1024 && unit < UNITS.length - 1) {
        value /= 1024;
        unit++;
    }
    return (new Intl.NumberFormat(locale, {
        style: "unit",
        unit: UNITS[unit],
        unitDisplay: "short",
        maximumFractionDigits: 1,
    })
        .format(value)
        // some locales separate the unit with a plain space, so a line could break
        // between "15" and "MB"
        .replace(/ /g, " "));
};
export default formatFileSize;
