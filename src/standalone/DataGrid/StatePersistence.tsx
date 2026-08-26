import React, { useContext, useEffect, useMemo, useRef } from "react";
import {
	getDataGridDefaultColumnsState,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridProps,
	useDataGridState,
} from "./DataGrid";
import {
	DataGridPersistedData,
	DataGridPersistentState,
	encodePersistedState,
} from "./PersistFormat";

export type {
	DataGridPersistedData,
	DataGridPersistedSort,
	DataGridPersistentState,
	DataGridPersistentStateLegacy,
} from "./PersistFormat";

export type DataGridPersistentStateContextType = [
	/**
	 * The persisted data, in whichever format it was written
	 */
	DataGridPersistedData | undefined,
	/**
	 * Store the given data
	 */
	(data: DataGridPersistentState) => Promise<void> | void,
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
	const {
		persist: config,
		columns,
		defaultSort,
		defaultFilter,
	} = useDataGridProps();

	const defaultColumnState = useMemo(
		() => getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter),
		[columns, defaultSort, defaultFilter],
	);

	// the grid state changes on every page of data loaded, so compare what we'd
	// write before writing it - persistence may well be a request to a server
	const lastWritten = useRef<string>(undefined);

	// save on changes
	useEffect(() => {
		if (!setPersisted) return;

		const data = encodePersistedState(
			state,
			columnState,
			columnWidthState,
			defaultColumnState,
			columns,
			config,
		);
		const serialized = JSON.stringify(data);
		if (lastWritten.current === serialized) return;
		lastWritten.current = serialized;

		void setPersisted(data);
	}, [
		setPersisted,
		state,
		columnState,
		columnWidthState,
		defaultColumnState,
		columns,
		config,
	]);

	return <></>;
};

export default React.memo(StatePersistence);
