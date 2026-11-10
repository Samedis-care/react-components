import { createElement, useMemo } from "react";
import CountryCodes from "./CountryCodes";
import CountryFlag from "../CountryFlag";
import { useCCCountryTranslations } from "../../utils/useCCTranslations";
import getCurrentLocale from "../../utils/getCurrentLocale";
/**
 * The countries of `CountryCodes` as options for a select, sorted by their
 * name in components-care's current language with that language's collation
 * (in German "Ägypten" comes after "Afghanistan", "Österreich" after "Oman").
 *
 * When the language changes, the component re-renders with renamed and
 * re-sorted options; until then the hook returns the same array. Like
 * `useCCCountryTranslations()`, it suspends while the country names load.
 *
 * @returns One option per country: `{ value: code, label: name, icon: <CountryFlag code={code} /> }`
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
const useCountryOptions = () => {
    const { t, i18n } = useCCCountryTranslations();
    const locale = getCurrentLocale(i18n);
    return useMemo(() => {
        const collator = new Intl.Collator(locale);
        return CountryCodes.map((code) => ({
            value: code,
            label: t(code),
            icon: createElement(CountryFlag, { code }),
        })).sort((a, b) => collator.compare(a.label, b.label));
    }, [t, locale]);
};
export default useCountryOptions;
