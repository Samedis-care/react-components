import React from "react";
import Selector, { SelectorData, SelectorPropsSingleSelect } from "./Selector";

const SingleSelect = <Data extends SelectorData>(
	props: SelectorPropsSingleSelect<Data>
) => (
	<Selector<Data> {...props} onSelect={props.onSelect} multiSelect={false} />
);

export default React.memo(SingleSelect) as typeof SingleSelect;
