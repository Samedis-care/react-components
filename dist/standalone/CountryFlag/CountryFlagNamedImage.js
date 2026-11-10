import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { useCCCountryTranslations } from "../../utils/useCCTranslations";
import CountryFlagImage from "./CountryFlagImage";
/**
 * The flag of a named CountryFlag: its alt text is the country's name in
 * components-care's current language. Suspends until the names have loaded.
 */
const CountryFlagNamedImage = (props) => {
    const { code, src, className } = props;
    const { t } = useCCCountryTranslations();
    return _jsx(CountryFlagImage, { src: src, alt: t(code), className: className });
};
export default React.memo(CountryFlagNamedImage);
