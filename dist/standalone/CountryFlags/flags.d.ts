import type { CountryCode } from "./index";
/**
 * Country flag images by `CountryCode`: `CountryFlags.DE` is the URL of
 * Germany's flag. Frozen and without a prototype: a lookup of a name of
 * `Object.prototype` (`"toString"`, `"__proto__"`, ...) gives `undefined`,
 * and `code in CountryFlags` is true for country codes only.
 *
 * Imported by `loadCountryFlags()` only, with a dynamic `import()`: the app's
 * bundler puts the flags into a chunk of their own, loaded when the first
 * flag is shown. A static import would put every flag into the code that
 * imports it.
 */
declare const CountryFlags: Readonly<Record<CountryCode, string>>;
export default CountryFlags;
