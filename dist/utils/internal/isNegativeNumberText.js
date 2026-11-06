/**
 * Whether the number in a text the user typed, or a number input formatted, is negative: a minus
 * sign comes before its first digit, wherever the format puts it ("-€5.00", "€ -5,00",
 * "EUR-5.00"). Takes the hyphen-minus "-" of the keyboard and the minus sign "−" (U+2212) that
 * some locales format with. A minus after the first digit ("5-") doesn't count.
 * @param text The text
 */
const isNegativeNumberText = (text) => /^[^0-9]*[-\u2212]/.test(text);
export default isNegativeNumberText;
