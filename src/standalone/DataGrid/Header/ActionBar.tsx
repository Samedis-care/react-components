import React, { useCallback } from "react";
import {
	getDataGridDefaultColumnsState,
	getDataGridDefaultState,
	useDataGridColumnState,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import ActionBarView from "./ActionBarView";

const ActionBar = () => {
	const [, setState] = useDataGridState();
	const [, setColumnState] = useDataGridColumnState();
	const {
		columns,
		onAddNew,
		exporters,
		filterBar,
		defaultSort,
		defaultFilter,
		defaultCustomData,
	} = useDataGridProps();

	const toggleSettings = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			showSettings: !prevState.showSettings,
			showFilterDialog: prevState.showSettings
				? prevState.showFilterDialog
				: false,
		}));
	}, [setState]);

	const handleReset = useCallback(() => {
		setState(getDataGridDefaultState(columns, defaultCustomData));
		setColumnState(
			getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter)
		);
	}, [
		setState,
		columns,
		defaultCustomData,
		setColumnState,
		defaultSort,
		defaultFilter,
	]);

	return (
		<ActionBarView
			toggleSettings={toggleSettings}
			handleAddNew={onAddNew}
			handleReset={handleReset}
			exporters={exporters}
			hasCustomFilterBar={!!filterBar}
		/>
	);
};

export default React.memo(ActionBar);
