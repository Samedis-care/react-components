/**
 * Utilities for "date-only" values — calendar dates without a time component.
 *
 * A date-only value is a `Date` anchored at **12:00 UTC**, whose **UTC** calendar
 * parts carry the date. Noon is used so the value stays on the same calendar day
 * when a backend or database truncates it in any timezone from UTC-12 to UTC+11.
 *
 * The rule that keeps this consistent: **only the UTC parts of a date-only value
 * are meaningful.** Never read one with the local getters (`getDate()`,
 * `toLocaleDateString()`, `moment(value)`) — that shifts the day by one in
 * timezones at or beyond UTC+12 (New Zealand, Fiji, Chatham, Tonga, Samoa,
 * Kiribati), and the error compounds with every save/load cycle.
 *
 * Use the helpers here to cross the boundary in either direction:
 * - {@link normalizeDate} — a local calendar day (e.g. from a date picker) → date-only value
 * - {@link normalizeDateUtc} / {@link parseDateOnly} — a UTC-anchored value (e.g. from the backend) → date-only value
 * - {@link denormalizeDate} — date-only value → local calendar day (e.g. for a date picker)
 * - {@link formatDateOnly} — date-only value → localized string
 */
/**
 * Do the years 0–99 need putting back?
 *
 * `Date.UTC` and the `Date` constructor both map those years to 1900+year, so a
 * date picker mid-entry — where a half-typed `2026` passes through as year 2, 20
 * or 202 — would silently yield a real 19xx date instead. Assigning the year
 * afterwards is the documented way to reach them.
 * @param year The year the caller asked for
 * @returns Whether the year came out shifted
 */
const isShiftedYear = (year) => year >= 0 && year <= 99;
/**
 * Turns a local calendar day into a date-only value.
 *
 * The date is taken from the **local** parts of the input, so this is the right
 * conversion for user input: date pickers, `new Date()` ("today") and anything
 * else expressed in the user's timezone. The time of day of the input is ignored.
 * @param date A date whose local calendar day should be kept
 * @returns The date-only value (12:00 UTC)
 */
export const normalizeDate = (date) => {
    const year = date.getFullYear();
    const normalized = new Date(Date.UTC(year, date.getMonth(), date.getDate(), 12));
    if (isShiftedYear(year))
        normalized.setUTCFullYear(year);
    return normalized;
};
/**
 * Turns a UTC-anchored value into a date-only value.
 *
 * The date is taken from the **UTC** parts of the input, so this is the right
 * conversion for values that already come from the wire: `new Date("2026-08-13")`
 * (parsed as UTC midnight) as well as an already normalized
 * `2026-08-13T12:00:00.000Z`. The time of day of the input is ignored.
 * @param date A date whose UTC calendar day should be kept
 * @returns The date-only value (12:00 UTC)
 */
export const normalizeDateUtc = (date) => {
    const year = date.getUTCFullYear();
    const normalized = new Date(Date.UTC(year, date.getUTCMonth(), date.getUTCDate(), 12));
    if (isShiftedYear(year))
        normalized.setUTCFullYear(year);
    return normalized;
};
/**
 * Parses a date-only value from a string, by its UTC calendar day.
 *
 * Accepts both date-only strings (`"2026-08-13"`) and full ISO timestamps
 * (`"2026-08-13T12:00:00.000Z"`).
 * @param value The serialized date
 * @returns The date-only value (12:00 UTC)
 */
export const parseDateOnly = (value) => normalizeDateUtc(new Date(value));
/** Strict ISO calendar date, which JS parses as UTC midnight */
const DATE_ONLY_ISO = /^\d{4}-\d{2}-\d{2}$/;
/** Does this string state its UTC offset? Without one, JS parses it in local time. */
const HAS_UTC_DESIGNATOR = /(?:Z|[+-]\d{2}:?\d{2})$/i;
/** Is this value this library's own date-only anchor (12:00 UTC exactly)? */
const isDateOnlyAnchor = (date) => date.getUTCHours() === 12 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0;
/**
 * Turns whatever the backend sent into a date-only value.
 *
 * Backends serve both kinds of value into date-only fields, so the reading
 * depends on what arrived:
 * - a calendar date (`"2026-08-13"`) keeps its date
 * - this library's own serialization (12:00 UTC exactly, in any offset notation)
 *   keeps its date, so the day doesn't drift when a date-only field is backed by
 *   a datetime column
 * - anything else is an instant — a real timestamp such as `created_at` — and is
 *   converted to the calendar day the **viewer** sees it on, midnight UTC
 *   included (`2026-08-13T00:00:00Z` is the 12th in New York)
 *
 * Two cases stay genuinely ambiguous, both narrow: a real timestamp that falls on
 * exactly 12:00 UTC is read as a calendar date, and a `Date` built from local
 * midnight is exactly 12:00 UTC in UTC+12, so it is read as the previous day
 * there. Pass a string, or use the explicit helpers, where that matters.
 *
 * Use {@link parseDateOnly} instead where the value is known to be a calendar
 * date, and {@link dateOnlyFromDateTime} where it is known to be an instant.
 * @param value The value as received
 * @returns The date-only value (12:00 UTC)
 */
export const toDateOnly = (value) => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (DATE_ONLY_ISO.test(trimmed))
            return normalizeDateUtc(new Date(trimmed));
        // without a stated offset the string was parsed in local time, so its own
        // parts already are the viewer's day — and testing the anchor would misfire,
        // local midnight being exactly noon UTC in UTC+12
        if (!HAS_UTC_DESIGNATOR.test(trimmed))
            return normalizeDate(new Date(trimmed));
    }
    const date = value instanceof Date ? value : new Date(value);
    return isDateOnlyAnchor(date) ? normalizeDateUtc(date) : normalizeDate(date);
};
/**
 * Turns an instant (a real timestamp) into a date-only value.
 *
 * Use this when a value that carries a time of day — `created_at`, an appointment
 * timestamp — has to be shown as a plain calendar date. The day is the one the
 * **viewer** sees the instant on, which is what {@link normalizeDate} does: a
 * timestamp of `2026-08-13T22:30:00Z` is already the 14th in Berlin.
 *
 * Note that this conversion is lossy and viewer-relative. Prefer keeping such a
 * field a datetime and only formatting it as a date, unless a real date-only
 * value is needed (e.g. to feed a date picker).
 * @param value The instant, as a `Date` or an ISO string
 * @returns The date-only value (12:00 UTC) of the viewer's calendar day
 */
export const dateOnlyFromDateTime = (value) => normalizeDate(value instanceof Date ? value : new Date(value));
/**
 * Turns a date-only value back into a local calendar day.
 *
 * Use this whenever a date-only value has to be handed to something that reads
 * dates in local time — most importantly the date pickers (`moment(value)`).
 * The returned date is local midnight of the stored day (01:00 on the few days
 * where a timezone skips midnight for DST — the calendar day is always kept).
 * @param date A date-only value
 * @returns A date at local midnight of the same calendar day
 */
export const denormalizeDate = (date) => {
    const year = date.getUTCFullYear();
    const local = new Date(year, date.getUTCMonth(), date.getUTCDate());
    if (isShiftedYear(year))
        local.setFullYear(year);
    return local;
};
/**
 * Formats a date-only value for display.
 *
 * Formats by the value's UTC parts, so the stored day is shown in every
 * timezone. The UTC anchor cannot be overridden through `options`.
 * @param date A date-only value
 * @param locale The locale to format in (see `getCurrentLocale`)
 * @param options Additional format options (e.g. `ToDateLocaleStringOptions`)
 * @returns The localized date
 */
export const formatDateOnly = (date, locale, options) => date.toLocaleDateString(locale, { ...options, timeZone: "UTC" });
