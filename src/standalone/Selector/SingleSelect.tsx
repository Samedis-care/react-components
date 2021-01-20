import React from "react";
import BaseSelector, { BaseSelectorProps } from "./BaseSelector";

const SingleSelect = (props: BaseSelectorProps) => {
	return <BaseSelector {...props} />;
};

export default React.memo(SingleSelect) as typeof SingleSelect;
