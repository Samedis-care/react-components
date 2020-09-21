import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
} from "react";
import { Grid } from "@material-ui/core";
import {
	DataGridCustomDataType,
	DataGridPropsContext,
	DataGridStateContext,
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
	const props = useContext(DataGridPropsContext);
	const stateCtx = useContext(DataGridStateContext);
	if (!props) throw new Error("Props Context not set");
	if (!stateCtx) throw new Error("State Context not set");
	const StatusBarView = props.statusBar;
	const [state, setState] = stateCtx;

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
