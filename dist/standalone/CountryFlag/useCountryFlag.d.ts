/**
 * The URL of a country's flag for CountryFlag: `undefined` for a code without
 * a flag and while the flags load. The first call loads them
 * (`loadCountryFlags()`); the component re-renders when they are there.
 *
 * @param code The country's code, any string
 */
declare const useCountryFlag: (code: string) => string | undefined;
export default useCountryFlag;
