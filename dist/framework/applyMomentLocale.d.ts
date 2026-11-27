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
declare const applyMomentLocale: (locale: string) => string;
export default applyMomentLocale;
