import React from "react";
import Selector, {
	SelectorData,
	SelectorOnSelectCallback,
	SelectorOnSelectExCallback,
	SelectorProps,
} from "./Selector";

export interface SingleSelectProps<Data extends SelectorData>
	extends Omit<
		SelectorProps<Data>,
		"onSelect" | "onSelectEx" | "selected" | "multiSelect"
	> {
	/**
	 * Simple selection change handler
	 * @param value The selected value
	 */
	onSelect?: (value: string) => void;
	/**
	 * Extended selection change handler
	 * @param data The selected data entry
	 */
	onSelectEx?: (data: Data) => void;
	/**
	 * The currently selected value
	 */
	selected: string;
}

export default React.memo((props: SingleSelectProps<any>) => (
	<Selector
		{...props}
		onSelect={props.onSelect as SelectorOnSelectCallback}
		onSelectEx={props.onSelectEx as SelectorOnSelectExCallback<any>}
		multiSelect={false}
	/>
));
