import React, { Dispatch, SetStateAction, useCallback } from "react";
import { Grid } from "@material-ui/core";
import {
	DataGridCustomDataType,
	useDataGridProps,
	useDataGridState,
} from "../index";

export interface IDataGridStatusBarProps {
	/**
	 * The user-defined custom data
	 */
	customData: DataGridCustomDataType;
	/**
	 * A setState like interface for setting customData
	 */
	setCustomData: Dispatch<SetStateAction<DataGridCustomDataType>>;
}

const StatusBar = () => {
	const { statusBar: StatusBarView } = useDataGridProps();
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

	return (
		<Grid container>
			{StatusBarView && (
				<StatusBarView
					customData={state.customData}
					setCustomData={setCustomData}
				/>
			)}
		</Grid>
	);
};

export default React.memo(StatusBar);
