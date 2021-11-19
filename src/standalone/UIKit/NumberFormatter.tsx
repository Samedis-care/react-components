import React from "react";
import useCCTranslations from "../../utils/useCCTranslations";

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
	const { i18n } = useCCTranslations();

	return (
		<>{value != null ? value.toLocaleString(i18n.language, options) : ""}</>
	);
};

export default React.memo(NumberFormatter);
