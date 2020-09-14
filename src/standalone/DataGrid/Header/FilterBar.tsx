import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
} from "react";
import { Box, Grid } from "@material-ui/core";
import { DataGridPropsContext, DataGridStateContext } from "../index";

export interface IDataGridFilterBarProps {
	/**
	 * The user-defined custom data
	 */
	customData: any;
	/**
	 * A setState like interface for setting customData
	 */
	setCustomData: Dispatch<SetStateAction<any>>;
}

const FilterBar = () => {
	const props = useContext(DataGridPropsContext)!;
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
