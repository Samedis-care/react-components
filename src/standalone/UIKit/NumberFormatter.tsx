import React from "react";
import { NumberFormatterOptions } from "globalize/dist/globalize/number";
import { useGlobalized } from "../../utils";

export interface NumberFormatterProps {
	/**
	 * The number to format
	 */
	value: number | null;
	/**
	 * Formatting options
	 */
	options?: NumberFormatterOptions;
}

const NumberFormatter = (props: NumberFormatterProps) => {
	const { value, options } = props;
	const globalized = useGlobalized();

	return (
		<>
			{value !== null && globalized
				? globalized.formatNumber(value, options)
				: ""}
		</>
	);
};

export default React.memo(NumberFormatter);
