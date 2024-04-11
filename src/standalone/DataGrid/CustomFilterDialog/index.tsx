import React, { useCallback } from "react";
import {
	DataGridContentOverlayCollapse,
	DataGridCustomDataType,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import Dialog from "./FilterDialog";

const DataGridCustomFilters = () => {
	const { filterBar, classes } = useDataGridProps();
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

	if (!filterBar) {
		return <></>;
	}

	return (
		<DataGridContentOverlayCollapse
			className={classes?.contentOverlayCollapse}
			in={state.showFilterDialog}
		>
			<Dialog
				closeFilterDialog={closeCustomFilterDialog}
				customFilters={filterBar}
				customData={state.customData}
				setCustomData={setCustomData}
			/>
		</DataGridContentOverlayCollapse>
	);
};

export default React.memo(DataGridCustomFilters);
