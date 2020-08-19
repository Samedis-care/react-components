import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
} from "react";
import { Grid } from "@material-ui/core";
import { DataGridPropsContext, DataGridStateContext } from "../index";

export interface IDataGridStatusBarProps {
	/**
	 * The user-defined custom data
	 */
	customData: any;
	/**
	 * A setState like interface for setting customData
	 */
	setCustomData: Dispatch<SetStateAction<any>>;
}

const StatusBar = () => {
	const StatusBarView = useContext(DataGridPropsContext)!.statusBar;
	const [state, setState] = useContext(DataGridStateContext)!;

	const setCustomData = useCallback(
		(newState: any | ((prevState: any) => any)) => {
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
