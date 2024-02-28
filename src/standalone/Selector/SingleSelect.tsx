import React from "react";
import BaseSelector, {
	BaseSelectorData,
	BaseSelectorProps,
} from "./BaseSelector";

const SingleSelect = <DataT extends BaseSelectorData>(
	props: BaseSelectorProps<DataT>,
) => {
	return <BaseSelector {...props} />;
};

export default React.memo(SingleSelect) as typeof SingleSelect;
