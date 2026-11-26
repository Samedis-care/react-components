import React from "react";
import { DataGridPersistentStateContext } from "./StatePersistence";
import { DataGridPersistMountContext } from "./PersistGate";

export interface NoPersistProps {
	/**
	 * The children to render
	 */
	children: React.ReactNode;
}

/**
 * Clears the current persistence provider for DataGrid.
 *
 * The grids inside persist nothing, and an outer provider does not hold them
 * back while it loads its stored state, nor mount them again when its
 * storage keys change.
 */
const NoPersist = (props: NoPersistProps) => {
	const { children } = props;
	return (
		<DataGridPersistMountContext.Provider value={null}>
			<DataGridPersistentStateContext.Provider value={undefined}>
				{children}
			</DataGridPersistentStateContext.Provider>
		</DataGridPersistMountContext.Provider>
	);
};

export default React.memo(NoPersist);
