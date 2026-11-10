import countries from "../../assets/data/countries.json";
/**
 * The countries the library knows, as upper-case ISO 3166-1 alpha-2 codes in
 * code order: `["AD", "AE", "AF", …]`. Every code has a flag in `CountryFlags`
 * and a name in the `countries` namespace (`useCCCountryTranslations().t(code)`).
 *
 * For a country select use `useCountryOptions()`, which sorts the countries by
 * their localized name. The list is frozen: copy it before sorting
 * (`[...CountryCodes].sort(…)`).
 */
const CountryCodes = Object.freeze([...countries]);
export default CountryCodes;
