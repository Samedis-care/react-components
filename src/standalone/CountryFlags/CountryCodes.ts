import countries from "../../assets/data/countries.json";
import type { CountryCode } from "./index";

/**
 * The countries the library offers for a country select, as upper-case
 * ISO 3166-1 alpha-2 codes in code order: `["AD", "AE", "AF", …]`. Every code
 * is a `CountryCode`: it has a flag in `CountryFlags` and a name in the
 * `countries` namespace (`useCCCountryTranslations().t(code)`).
 *
 * For a country select use `useCountryOptions()`, which sorts the countries by
 * their localized name. The list is frozen: copy it before sorting
 * (`[...CountryCodes].sort(…)`). To test a code known only at runtime, narrow
 * it first: `isCountryCode(code) && CountryCodes.includes(code)`.
 */
// every code of countries.json is a key of CountryFlags: the generator
// (scripts/make_country_data.py) writes the map's keys from this list and the
// countries of the language dialog
const CountryCodes = Object.freeze([...countries]) as readonly CountryCode[];

export default CountryCodes;
