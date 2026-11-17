import isCountryCode from "./isCountryCode";
import loadCountryFlags from "./loadCountryFlags";

/**
 * The flag of a code known only at runtime, such as user or backend data: the
 * image URL `loadCountryFlags()` has for it, or `undefined` if the code is not
 * a `CountryCode` (`"de"`, `"UK"`, `""`, ...). Loads the flags on first use,
 * unless the code has none; rejects if they fail to load.
 *
 * To show a flag, use the `CountryFlag` component, which takes any string.
 *
 * @param code The country's code, an upper-case ISO 3166-1 alpha-2 code such as `"DE"`
 * @returns The URL of the flag's image, or `undefined` if the library has no flag for `code`
 * @example
 * const flag = await loadCountryFlag(address.country);
 * if (flag) style.backgroundImage = `url(${flag})`;
 */
const loadCountryFlag = async (code: string): Promise<string | undefined> =>
	isCountryCode(code) ? (await loadCountryFlags())[code] : undefined;

export default loadCountryFlag;
