import React, { useContext, useEffect } from "react";
import {
	DataGridProps,
	IDataGridColumnsState,
	IDataGridColumnState,
	IDataGridState,
	useDataGridColumnState,
	useDataGridColumnsWidthState,
	useDataGridProps,
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
	Partial<DataGridPersistentState> | undefined,
	(data: DataGridPersistentState) => Promise<void> | void,
];
export const DataGridPersistentStateContext = React.createContext<
	DataGridPersistentStateContextType | undefined
>(undefined);

// when you change this, also update documentation DataGridProps.persist @default
const DEFAULT_PERSIST_CONFIG: DataGridProps["persist"] = [
	"columns",
	"sort",
	"filters",
];

export const filterPersistedState = (
	persisted: Partial<DataGridPersistentState>,
	config: DataGridProps["persist"],
): DataGridPersistentState => {
	const { columnState, columnWidth, state } = persisted;
	config = config ?? DEFAULT_PERSIST_CONFIG;
	return {
		columnState: columnState
			? Object.fromEntries<IDataGridColumnState>(
					Object.entries<IDataGridColumnState>(columnState).map(
						([column, data]) => [
							column,
							{
								...data,
								sort: config.includes("sort") ? data.sort : 0,
								sortOrder: config.includes("sort") ? data.sortOrder : undefined,
								filter: config.includes("filters") ? data.filter : undefined,
							} as IDataGridColumnState,
						],
					),
				)
			: {},
		columnWidth: config.includes("columns") ? (columnWidth ?? {}) : {},
		state: {
			search: config.includes("filters") ? state?.search : undefined,
			hiddenColumns: config.includes("columns")
				? state?.hiddenColumns
				: undefined,
			lockedColumns: config.includes("columns")
				? state?.lockedColumns
				: undefined,
			customData: config.includes("filters") ? state?.customData : undefined,
			initialResize: config.includes("columns")
				? state?.initialResize
				: undefined,
		},
	};
};

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
	const config = useDataGridProps().persist;

	// save on changes
	useEffect(() => {
		if (!setPersisted) return;

		void setPersisted(
			filterPersistedState(
				{
					columnState,
					columnWidth: columnWidthState,
					state: {
						search: state.search,
						hiddenColumns: state.hiddenColumns,
						lockedColumns: state.lockedColumns,
						customData: state.customData,
						initialResize: state.initialResize,
					},
				},
				config,
			),
		);
	}, [setPersisted, state, columnState, columnWidthState, config]);

	return <></>;
};

export default React.memo(StatePersistence);
