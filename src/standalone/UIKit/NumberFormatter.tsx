import React from "react";
import ccI18n from "../../i18n";
import { useTranslation } from "react-i18next";

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
	const { i18n } = useTranslation(undefined, { i18n: ccI18n });

	return (
		<>{value !== null ? value.toLocaleString(i18n.language, options) : ""}</>
	);
};

export default React.memo(NumberFormatter);
