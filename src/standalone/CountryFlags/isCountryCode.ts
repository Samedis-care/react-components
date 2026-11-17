import FlagCodes, { type CountryCode } from "./index";

/** The codes of `FlagCodes`, for lookups */
const codes: ReadonlySet<string> = new Set(FlagCodes);

/**
 * Whether a string is a `CountryCode`, a code the library has a flag and a
 * name for. Case-sensitive: `"DE"` is one, `"de"` is not, and neither is
 * `"UK"` (the United Kingdom is `"GB"`). It needs no flag to have loaded.
 *
 * For codes known only at runtime, such as user or backend data: it narrows
 * the code to `CountryCode`, so it can then index the map of
 * `loadCountryFlags()` or be tested against `CountryCodes`.
 *
 * @param code The code to test
 * @returns `true` if the library has a flag for `code`
 * @example
 * // a country a country select offers
 * const valid = isCountryCode(code) && CountryCodes.includes(code);
 */
const isCountryCode = (code: string): code is CountryCode => codes.has(code);

export default isCountryCode;
