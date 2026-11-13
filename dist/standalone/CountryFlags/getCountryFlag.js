import CountryFlags from "./index";
import isCountryCode from "./isCountryCode";
/**
 * The flag of a code known only at runtime, such as user or backend data: the
 * image URL `CountryFlags` has for it, or `undefined` if the code is not a
 * `CountryCode` (`"de"`, `"UK"`, `""`, ...). A `CountryCode` can index
 * `CountryFlags` directly.
 *
 * To show a flag, use the `CountryFlag` component, which takes any string.
 *
 * @param code The country's code, an upper-case ISO 3166-1 alpha-2 code such as `"DE"`
 * @returns The URL of the flag's image, or `undefined` if the library has no flag for `code`
 * @example
 * const flag = getCountryFlag(address.country);
 * if (flag) style.backgroundImage = `url(${flag})`;
 */
const getCountryFlag = (code) => isCountryCode(code) ? CountryFlags[code] : undefined;
export default getCountryFlag;
