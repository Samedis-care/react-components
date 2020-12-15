import React from "react";
import Selector, { SelectorData, SelectorPropsSingleSelect } from "./Selector";

const SingleSelect = <Data extends SelectorData>(
	props: Omit<SelectorPropsSingleSelect<Data>, "multiSelect">
) => (
	<Selector<Data, false>
		{...props}
		onSelect={props.onSelect}
		multiSelect={false}
	/>
);

export default React.memo(SingleSelect) as typeof SingleSelect;
