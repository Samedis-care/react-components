/**
 * Parses a localized number string
 * @param value The number string
 * @param options The number formatting options used to format the number
 */
declare const parseLocalizedNumber: (value: string, options?: Intl.NumberFormatOptions) => number | null;
export default parseLocalizedNumber;
