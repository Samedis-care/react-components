import CountryFlags, { type CountryCode } from "./index";

/**
 * Whether a string is a `CountryCode`, a code the library has a flag and a
 * name for. Case-sensitive: `"DE"` is one, `"de"` is not, and neither is
 * `"UK"` (the United Kingdom is `"GB"`).
 *
 * For codes known only at runtime, such as user or backend data: it narrows
 * the code to `CountryCode`, so it can then index `CountryFlags` or be tested
 * against `CountryCodes`.
 *
 * @param code The code to test
 * @returns `true` if `code` is a key of `CountryFlags`
 * @example
 * // a country a country select offers
 * const valid = isCountryCode(code) && CountryCodes.includes(code);
 */
const isCountryCode = (code: string): code is CountryCode =>
	// the map has no prototype, so `in` finds its country codes only
	code in CountryFlags;

export default isCountryCode;
