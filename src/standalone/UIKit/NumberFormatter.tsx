import React from "react";
import ccI18n from "../../i18n";

export interface NumberFormatterProps {
	/**
	 * The number to format
	 */
	value: number | null;
	/**
	 * Formatting options
	 */
	options?: Intl.NumberFormatOptions;
}

const NumberFormatter = (props: NumberFormatterProps) => {
	const { value, options } = props;

	return (
		<>{value !== null ? value.toLocaleString(ccI18n.language, options) : ""}</>
	);
};

export default React.memo(NumberFormatter);
