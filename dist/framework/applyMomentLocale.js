import moment from "moment";
import { ToDateLocaleStringOptions } from "../constants";
/** A date to read the format from: only the order of its parts matters */
const SAMPLE_DATE = new Date(Date.UTC(2026, 11, 31, 12));
/** The moment token for each part of a short date */
const TOKENS = {
    day: "DD",
    month: "MM",
    year: "YYYY",
};
/**
 * The short date format the date renderers display dates in for a locale
 * (Intl's, with `ToDateLocaleStringOptions`), as a moment format: the order of
 * day, month and year and the text between them, of the locale's Gregorian
 * calendar.
 * @param locale The locale, e.g. "en-ZA"
 * @returns The moment format, e.g. "YYYY/MM/DD"; null where moment cannot
 * write it (a locale Intl rejects, other parts than day, month and year, or
 * Latin letters between them, which moment reads as tokens)
 */
const getIntlDateFormat = (locale) => {
    let parts;
    try {
        parts = new Intl.DateTimeFormat(locale, {
            ...ToDateLocaleStringOptions,
            calendar: "gregory",
            timeZone: "UTC",
        }).formatToParts(SAMPLE_DATE);
    }
    catch {
        return null;
    }
    const seen = new Set();
    let format = "";
    for (const { type, value } of parts) {
        if (type === "literal") {
            if (/[A-Za-z]/.test(value))
                return null;
            format += value;
            continue;
        }
        const token = TOKENS[type];
        if (!token || seen.has(type))
            return null;
        seen.add(type);
        format += token;
    }
    return seen.size === 3 ? format : null;
};
/**
 * Makes a locale moment's global locale, with the short date format (`L`) the
 * date renderers display dates in for it, so the date pickers take dates as
 * they are shown:
 * - where moment's `L` for the locale is another one (es-US), it is changed
 * - a region moment has no locale for (en-ZA) gets one of that name, based on
 *   the language's (en), with the renderers' `L`
 *
 * Moment's other formats (`LT`, `LL`, …) stay moment's. A language moment
 * has no locale for keeps moment's global locale.
 * @param locale The locale, e.g. "en-ZA", whose moment locale (or the
 * language's) is loaded
 * @returns The name of the moment locale now global, e.g. "en-za"
 */
const applyMomentLocale = (locale) => {
    const loaded = moment.locale(locale);
    const name = locale.toLowerCase();
    // moment fell back to its global locale, which is another language's
    if (name !== loaded && !name.startsWith(loaded + "-"))
        return loaded;
    const L = getIntlDateFormat(locale);
    const data = moment.localeData();
    if (L === null || data.longDateFormat("L") === L)
        return loaded;
    const longDateFormat = {
        LTS: data.longDateFormat("LTS"),
        LT: data.longDateFormat("LT"),
        L,
        LL: data.longDateFormat("LL"),
        LLL: data.longDateFormat("LLL"),
        LLLL: data.longDateFormat("LLLL"),
    };
    if (name === loaded)
        moment.updateLocale(name, { longDateFormat });
    else
        moment.defineLocale(name, { parentLocale: loaded, longDateFormat });
    return moment.locale(name);
};
export default applyMomentLocale;
