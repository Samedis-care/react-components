import React from "react";
import { useCCCountryTranslations } from "../../utils/useCCTranslations";
import CountryFlagImage from "./CountryFlagImage";

export interface CountryFlagNamedImageProps {
	/**
	 * The country's code, which names the image
	 */
	code: string;
	/**
	 * The flag's URL
	 */
	src: string;
	/**
	 * Class name of the `image` slot
	 */
	className?: string;
}

/**
 * The flag of a named CountryFlag: its alt text is the country's name in
 * components-care's current language. Suspends until the names have loaded.
 */
const CountryFlagNamedImage = (props: CountryFlagNamedImageProps) => {
	const { code, src, className } = props;
	const { t } = useCCCountryTranslations();
	return <CountryFlagImage src={src} alt={t(code)} className={className} />;
};

export default React.memo(CountryFlagNamedImage);
