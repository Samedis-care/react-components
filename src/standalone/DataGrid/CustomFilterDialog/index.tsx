import React, { useCallback } from "react";
import {
	DataGridContentOverlayCollapse,
	DataGridCustomDataType,
	getDataGridDefaultState,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import Dialog from "./FilterDialog";

const DataGridCustomFilters = () => {
	const { filterBar, classes, columns, defaultCustomData, hideReset } =
		useDataGridProps();
	const [state, setState] = useDataGridState();

	const closeCustomFilterDialog = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			showFilterDialog: false,
		}));
	}, [setState]);

	const setCustomData = useCallback(
		(
			newState:
				| DataGridCustomDataType
				| ((prevState: DataGridCustomDataType) => DataGridCustomDataType),
		) => {
			if (typeof newState === "function") {
				setState((prevState) => ({
					...prevState,
					customData: newState(prevState.customData),
				}));
			} else {
				setState((prevState) => ({
					...prevState,
					customData: newState,
				}));
			}
		},
		[setState],
	);

	// the panel's filters only: "Reset filter" in the header also resets the
	// search and the column filters, and releases an override
	const resetCustomData = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			customData: getDataGridDefaultState(columns, defaultCustomData)
				.customData,
		}));
	}, [columns, defaultCustomData, setState]);

	if (!filterBar) {
		return <></>;
	}

	return (
		<DataGridContentOverlayCollapse
			className={classes?.contentOverlayCollapse}
			in={state.showFilterDialog}
			mountOnEnter
		>
			<Dialog
				closeFilterDialog={closeCustomFilterDialog}
				resetCustomData={hideReset ? undefined : resetCustomData}
				customFilters={filterBar}
				customData={state.customData}
				setCustomData={setCustomData}
			/>
		</DataGridContentOverlayCollapse>
	);
};

export default React.memo(DataGridCustomFilters);
