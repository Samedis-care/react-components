import React from "react";
import { DataGridPersistentStateContext } from "./StatePersistence";

export interface NoPersistProps {
	/**
	 * The children to render
	 */
	children: React.ReactNode;
}

/**
 * Clears the current persistence provider for DataGrid.
 */
const NoPersist = (props: NoPersistProps) => {
	const { children } = props;
	return (
		<DataGridPersistentStateContext.Provider value={undefined}>
			{children}
		</DataGridPersistentStateContext.Provider>
	);
};

export default React.memo(NoPersist);
