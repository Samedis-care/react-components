import React from "react";
import useCurrentLocale from "../../utils/useCurrentLocale";

export interface NumberFormatterProps {
	/**
	 * The number to format
	 */
	value: number | null | undefined;
	/**
	 * Formatting options
	 */
	options?: Intl.NumberFormatOptions;
}

const NumberFormatter = (props: NumberFormatterProps) => {
	const { value, options } = props;
	const locale = useCurrentLocale();

	return <>{value != null ? value.toLocaleString(locale, options) : ""}</>;
};

export default React.memo(NumberFormatter);
