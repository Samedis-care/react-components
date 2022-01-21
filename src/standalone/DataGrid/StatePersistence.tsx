import React, { useContext, useEffect } from "react";
import {
	IDataGridColumnsState,
	IDataGridState,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridState,
} from "./DataGrid";

export interface DataGridPersistentState {
	columnState: IDataGridColumnsState;
	columnWidth: Record<string, number>;
	state: Partial<
		Pick<
			IDataGridState,
			| "search"
			| "hiddenColumns"
			| "lockedColumns"
			| "customData"
			| "initialResize"
		>
	>;
}

export type DataGridPersistentStateContextType = [
	(
		| Promise<Partial<DataGridPersistentState>>
		| Partial<DataGridPersistentState>
		| undefined
	),
	(data: DataGridPersistentState) => Promise<void> | void
];
export const DataGridPersistentStateContext = React.createContext<
	DataGridPersistentStateContextType | undefined
>(undefined);

/**
 * Logical component which takes care of optional state persistence for the data grid
 * @remarks Used internally in DataGrid, do not use in your code!
 */
const StatePersistence = () => {
	const persistedContext = useContext(DataGridPersistentStateContext);
	const [, setPersisted] = persistedContext || [];
	const [state] = useDataGridState();
	const [columnState] = useDataGridColumnState();
	const [columnWidthState] = useDataGridColumnsWidthState();

	// save on changes
	useEffect(() => {
		if (!setPersisted) return;

		void setPersisted({
			columnState,
			columnWidth: columnWidthState,
			state: {
				search: state.search,
				hiddenColumns: state.hiddenColumns,
				lockedColumns: state.lockedColumns,
				customData: state.customData,
				initialResize: state.initialResize,
			},
		});
	}, [setPersisted, state, columnState, columnWidthState]);

	return <></>;
};

export default React.memo(StatePersistence);
