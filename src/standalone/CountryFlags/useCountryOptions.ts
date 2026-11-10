import { useMemo } from "react";
import CountryFlags from "./index";
import CountryCodes from "./CountryCodes";
import { useCCCountryTranslations } from "../../utils/useCCTranslations";
import getCurrentLocale from "../../utils/getCurrentLocale";

/**
 * A country as an option of a select. It has the shape of the Selector's
 * `BaseSelectorData`, so it can be passed to `SingleSelect` or `MultiSelect`
 * as is.
 */
export interface CountryOption {
	/**
	 * The upper-case ISO 3166-1 alpha-2 code, e.g. `"DE"`: the value to store
	 */
	value: string;
	/**
	 * The country's name in components-care's current language, e.g.
	 * `"Deutschland"` in German
	 */
	label: string;
	/**
	 * The URL of the country's flag (`CountryFlags[value]`), for `<img src>` or
	 * the Selector's `enableIcons`
	 */
	icon: string;
}

/**
 * The countries of `CountryCodes` as options for a select, sorted by their
 * name in components-care's current language with that language's collation
 * (in German "Ägypten" comes after "Afghanistan", "Österreich" after "Oman").
 *
 * When the language changes, the component re-renders with renamed and
 * re-sorted options; until then the hook returns the same array. Like
 * `useCCCountryTranslations()`, it suspends while the country names load.
 *
 * @returns One option per country: `{ value: code, label: name, icon: flag URL }`
 * @example
 * // a Selector
 * const countries = useCountryOptions();
 * const onLoad = useMemo(() => selectorLocalLoadHandler(countries), [countries]);
 * return <SingleSelect label="Country" onLoad={onLoad} enableIcons … />;
 * @example
 * // a model's enum field, with countries from useCountryOptions() in the hook
 * // that builds the model
 * new ModelDataTypeEnumSelectRenderer(
 * 	countries.map(({ value, label, icon }) => ({ value, getLabel: () => label, icon })),
 * 	"",
 * 	{ enableIcons: true },
 * );
 */
const useCountryOptions = (): CountryOption[] => {
	const { t, i18n } = useCCCountryTranslations();
	const locale = getCurrentLocale(i18n);
	return useMemo(() => {
		const collator = new Intl.Collator(locale);
		return CountryCodes.map((code): CountryOption => ({
			value: code,
			label: t(code),
			icon: CountryFlags[code],
		})).sort((a, b) => collator.compare(a.label, b.label));
	}, [t, locale]);
};

export default useCountryOptions;
