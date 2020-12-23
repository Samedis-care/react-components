import React, { Dispatch, SetStateAction, useCallback } from "react";
import { Box, Grid } from "@material-ui/core";
import {
	DataGridCustomDataType,
	useDataGridProps,
	useDataGridState,
} from "../index";

export interface IDataGridFilterBarProps {
	/**
	 * The user-defined custom data
	 */
	customData: DataGridCustomDataType;
	/**
	 * A setState like interface for setting customData
	 */
	setCustomData: Dispatch<SetStateAction<DataGridCustomDataType>>;
}

const FilterBar = () => {
	const props = useDataGridProps();
	const [state, setState] = useDataGridState();

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

	const FilterBarView = props.filterBar;

	return (
		<Box ml={4}>
			<Grid container alignItems={"center"} justify={"flex-end"} spacing={2}>
				{FilterBarView && (
					<FilterBarView
						customData={state.customData}
						setCustomData={setCustomData}
					/>
				)}
			</Grid>
		</Box>
	);
};

export default React.memo(FilterBar);
