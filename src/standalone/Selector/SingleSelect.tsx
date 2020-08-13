import React from "react";
import Selector, {
	SelectorData,
	SelectorOnSelectCallback,
	SelectorProps,
} from "./Selector";

export interface SingleSelectProps<Data extends SelectorData>
	extends Omit<SelectorProps<Data>, "onSelect" | "selected" | "multiSelect"> {
	/**
	 * Simple selection change handler
	 * @param value The selected value
	 */
	onSelect: (value: Data) => void;
	/**
	 * The currently selected value
	 */
	selected: Data;
}

const SingleSelect = (props: SingleSelectProps<any>) => (
	<Selector
		{...props}
		onSelect={props.onSelect as SelectorOnSelectCallback<any>}
		multiSelect={false}
	/>
);

export default React.memo(SingleSelect);
