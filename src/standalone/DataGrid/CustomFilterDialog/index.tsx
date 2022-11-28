import React, { useCallback } from "react";
import { Collapse } from "@material-ui/core";
import {
	DataGridCustomDataType,
	useDataGridProps,
	useDataGridState,
	useDataGridStyles,
} from "../DataGrid";
import Dialog from "./FilterDialog";

const DataGridCustomFilters = () => {
	const classes = useDataGridStyles();

	const { filterBar } = useDataGridProps();
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
				| ((prevState: DataGridCustomDataType) => DataGridCustomDataType)
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
		[setState]
	);

	if (!filterBar) {
		return <></>;
	}

	return (
		<Collapse
			className={classes.contentOverlayCollapse}
			in={state.showFilterDialog}
		>
			<Dialog
				closeFilterDialog={closeCustomFilterDialog}
				customFilters={filterBar}
				customData={state.customData}
				setCustomData={setCustomData}
			/>
		</Collapse>
	);
};

export default React.memo(DataGridCustomFilters);
