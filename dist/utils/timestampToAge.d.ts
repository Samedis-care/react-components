/**
 * Formats the age of a point in time relative to now, in the current language
 * of the components-care i18n instance, e.g. "5 minutes ago", "vor 5 Minuten",
 * "5 минут назад" or, for a time in the future, "in 2 hours".
 * @param timestamp The point in time
 * @returns The age in the largest unit it fills at least once (seconds, minutes,
 * hours, days, weeks, months or years), rounded down: 119 seconds are
 * "1 minute ago". Less than 5 seconds either way is "now". A month is a twelfth of
 * 365 days. An invalid date gives an empty string.
 * @remarks Formatted by `Intl.RelativeTimeFormat` for use within a sentence, so it
 * starts in lowercase where the language does ("vor 5 Minuten", "il y a 5 minutes").
 * The result is not updated as time passes: call it again on the next render.
 */
declare const timestampToAge: (timestamp: Date) => string;
export default timestampToAge;
