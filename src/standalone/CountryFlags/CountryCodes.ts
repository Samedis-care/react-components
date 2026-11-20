import countries from "../../assets/data/countries.json";
import type { CountryCode } from "./index";

/**
 * The countries the library offers for a country select: every country and
 * territory ISO 3166-1 assigns a code to (249, Aruba, Curaçao and Åland
 * included), as upper-case alpha-2 codes in code order:
 * `["AD", "AE", "AF", …]`. Every code is a `CountryCode`: it has a flag
 * (`<CountryFlag code={code} />`) and a name in the `countries` namespace
 * (`useCCCountryTranslations().t(code)`). Kosovo's `"XK"` is a `CountryCode`
 * but not listed: it is a user-assigned code, not an ISO 3166-1 one, and
 * validators of ISO 3166-1 codes refuse it.
 *
 * For a country select use `useCountryOptions()`, which sorts the countries by
 * their localized name. The list is frozen: copy it before sorting
 * (`[...CountryCodes].sort(…)`). To test a code known only at runtime, narrow
 * it first: `isCountryCode(code) && CountryCodes.includes(code)`.
 */
// every code of countries.json is a CountryCode: the generator
// (scripts/make_country_data.py) writes the codes and their flags from this
// list and the countries of the language dialog
const CountryCodes = Object.freeze([...countries]) as readonly CountryCode[];

export default CountryCodes;
