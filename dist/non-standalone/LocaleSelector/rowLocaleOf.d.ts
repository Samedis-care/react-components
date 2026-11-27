/**
 * The row a locale shows as, lower case `language-region`: the region of a
 * locale without one is its most likely one (`"de"` is `"de-de"`, `"en"` is
 * `"en-us"`), as for the date and number formats
 * @param locale The locale, e.g. `"de-AT"` or `"de"`
 * @returns The row's locale in lower case, e.g. `"de-at"`
 */
declare const rowLocaleOf: (locale: string) => string;
export default rowLocaleOf;
