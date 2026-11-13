import ComponentsCareI18n from "../i18n";
import getCurrentLocale from "./getCurrentLocale";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const YEAR = 365 * DAY;
const MONTH = YEAR / 12;

/** Each unit with its length, from the largest down */
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	["year", YEAR],
	["month", MONTH],
	["week", WEEK],
	["day", DAY],
	["hour", HOUR],
	["minute", MINUTE],
	["second", SECOND],
];

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
const timestampToAge = (timestamp: Date): string => {
	const delta = timestamp.getTime() - Date.now();
	if (!Number.isFinite(delta)) return "";
	const locale = getCurrentLocale(ComponentsCareI18n);
	const distance = Math.abs(delta);

	if (distance < 5 * SECOND)
		return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
			0,
			"second",
		);
	const [unit, unitLength] =
		UNITS.find(([, length]) => distance >= length) ?? UNITS[UNITS.length - 1];
	return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(
		Math.sign(delta) * Math.floor(distance / unitLength),
		unit,
	);
};

export default timestampToAge;
