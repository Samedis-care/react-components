import getNumberSeparator from "./getNumberSeparator";
import getCurrentLocale from "./getCurrentLocale";
import isNegativeNumberText from "./internal/isNegativeNumberText";
import ccI18n from "../i18n";
/**
 * Gets the number of digits in the locale's groups: the last group before the decimal separator,
 * and the ones before it (3 and 3 for most locales, 3 and 2 for en-IN: "12,34,567").
 * @param options The number formatting options used to format the number
 * @returns The sizes, or null if the locale doesn't group digits
 */
const getGroupSizes = (options) => {
    const integers = Intl.NumberFormat(getCurrentLocale(ccI18n), {
        ...options,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        minimumSignificantDigits: undefined,
        maximumSignificantDigits: undefined,
        // engines before Intl.NumberFormat v3 read "always" as the locale's own grouping, which
        // also groups a number this long
        useGrouping: "always",
    })
        .formatToParts(123456789012)
        .filter((part) => part.type === "integer")
        .map((part) => part.value.length);
    if (integers.length < 3)
        return null;
    return { last: integers[integers.length - 1], others: integers[1] };
};
/**
 * Whether the . and , in a value fit the locale's format. A single one always does (see
 * getDecimalSeparator). Several fit if the ones before the last are the locale's group
 * separator, the last one is the group or the decimal separator, and the digits between them form
 * the locale's groups: "1.234.567" and "1.234,5" in de, "12,34,567" in en-IN. They don't in
 * "1.234.5" or "7.5." (de), "1,234.5" (de, the group separator after the decimal separator),
 * "1,234,5" (de, the decimal separator twice) or "1.234,5" (fr, which groups with a space).
 * A . or , without a digit next to it belongs to a symbol ("Cg.") and doesn't count.
 * @param value The value
 * @param options The number formatting options used to format the number
 */
const fitsLocaleFormat = (value, options) => {
    const isDigit = (index) => /\d/.test(value.charAt(index));
    const marks = Array.from(value.matchAll(/[.,]/g), (match) => match.index).filter((index) => isDigit(index - 1) || isDigit(index + 1));
    if (marks.length < 2)
        return true;
    const decimal = getNumberSeparator("decimal", options);
    const group = getNumberSeparator("group", options);
    const groupMarks = value[marks[marks.length - 1]] === decimal ? marks.slice(0, -1) : marks;
    if (groupMarks.some((index) => value[index] !== group))
        return false;
    const sizes = getGroupSizes(options);
    if (!sizes)
        return false;
    const digitsBetween = (start, end) => value.slice(start, end).replace(/\D/g, "");
    const first = digitsBetween(0, groupMarks[0]);
    if (!/^[1-9]\d*$/.test(first) || first.length > sizes.others)
        return false;
    return groupMarks.every((index, i) => {
        const end = i + 1 < marks.length ? marks[i + 1] : value.length;
        const size = i + 1 < groupMarks.length ? sizes.others : sizes.last;
        return digitsBetween(index + 1, end).length === size;
    });
};
/**
 * Gets the separator the user meant as decimal separator in the given value.
 *
 * Touch keypads offer the decimal separator of the device's region, which isn't necessarily the
 * one of the current locale. So without the locale's decimal separator, a single . or , is read as
 * the decimal separator, unless it is the locale's group separator with 1–3 digits that don't
 * start with 0 before it and exactly 3 digits after it: "1.234" is 1234 in de, es and it, "7.5"
 * and "0.500" are 7.5 and 0.5.
 * @param value The value
 * @param options The number formatting options used to format the number
 */
const getDecimalSeparator = (value, options) => {
    const decimal = getNumberSeparator("decimal", options);
    if (value.includes(decimal))
        return decimal;
    const marks = value.match(/[.,]/g);
    if (marks?.length !== 1)
        return decimal;
    const [, before, mark, after] = /(\d*)([.,])(\d*)/.exec(value);
    const isGroup = mark === getNumberSeparator("group", options) &&
        /^[1-9]\d{0,2}$/.test(before) &&
        after.length === 3;
    return isGroup ? decimal : mark;
};
/** The parts of a formatted number that are no part of the number itself */
const FORMAT_SYMBOL_PARTS = [
    "currency",
    "percentSign",
    "unit",
    "literal",
];
/**
 * Whether a value without a digit is empty: nothing but blanks and the symbols the format writes
 * around a number ("€", "%", "kr", "Cg."), which is what is left when the user deletes the
 * digits of a formatted number. Anything else, such as "abc", a separator or a minus sign, is text
 * typed in place of a number.
 * @param value The value, without a digit
 * @param options The number formatting options used to format the number
 */
const isEmptyWithoutDigits = (value, options) => {
    if (value.trim() === "")
        return true;
    const symbols = Intl.NumberFormat(getCurrentLocale(ccI18n), options)
        .formatToParts(1)
        .filter((part) => FORMAT_SYMBOL_PARTS.includes(part.type))
        .map((part) => part.value);
    return (symbols
        .reduce((rest, symbol) => rest.split(symbol).join(""), value)
        .trim() === "");
};
/**
 * Removes group separators from the given value and replaces the decimal separator with a dot for
 * usage with parseFloat(...). Returns an empty string if value is empty, and "NaN" if it is no
 * number:
 * - text without a digit that is not empty ("abc", ".", "-"); blanks and the format's own symbols
 *   ("€" of a currency format) count as empty (see isEmptyWithoutDigits)
 * - a value whose . and , don't fit the locale's format (see fitsLocaleFormat), so that a typo
 *   such as "1.234.5" in de is not read as another number.
 *
 * The decimal separator is the locale's one, or a single . or , that can't be a group separator
 * (see getDecimalSeparator). A minus sign before the first digit ("-" or "−", also after a
 * currency symbol: "€ -5,00") becomes a leading "-".
 * @param value The value to "delocalize"
 * @param options The number formatting options used to format the number
 */
const delocalizeNumber = (value, options) => {
    if (!/[0-9]/.test(value)) {
        return isEmptyWithoutDigits(value, options) ? "" : "NaN";
    }
    if (!fitsLocaleFormat(value, options))
        return "NaN";
    const decimal = getDecimalSeparator(value, options);
    const unsigned = value
        .replace(new RegExp("[^0-9\\" + decimal + "]", "g"), "")
        .replace(new RegExp("\\" + decimal, "g"), ".");
    return isNegativeNumberText(value) ? "-" + unsigned : unsigned;
};
export default delocalizeNumber;
