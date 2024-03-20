import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
} from "react";
import { Box, Grid, useMediaQuery } from "@mui/material";
import {
	DataGridCustomDataType,
	useDataGridProps,
	useDataGridState,
	useDataGridStyles,
} from "../DataGrid";
import CustomFiltersButton from "./CustomFiltersButton";

export interface IDataGridFilterBarProps {
	/**
	 * The user-defined custom data
	 */
	customData: DataGridCustomDataType;
	/**
	 * A setState like interface for setting customData
	 */
	setCustomData: Dispatch<SetStateAction<DataGridCustomDataType>>;
	/**
	 * Is rendered in Dialog?
	 */
	inDialog: boolean;
}

type CustomFilterActiveContextType = [
	number,
	Dispatch<React.SetStateAction<number>>,
];
export const CustomFilterActiveContext = React.createContext<
	CustomFilterActiveContextType | undefined
>(undefined);
export const useCustomFilterActiveContext =
	(): CustomFilterActiveContextType => {
		const ctx = useContext(CustomFilterActiveContext);
		if (!ctx) throw new Error("Context not set");
		return ctx;
	};

const FilterBar = () => {
	const props = useDataGridProps();
	const [state, setState] = useDataGridState();
	const classes = useDataGridStyles();
	const enableDialog = useMediaQuery(
		props.enableFilterDialogMediaQuery ?? "(false)",
	);

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

	const openDialog = useCallback(() => {
		setState((prevState) => ({
			...prevState,
			showFilterDialog: !prevState.showFilterDialog,
			showSettings: prevState.showFilterDialog ? prevState.showSettings : false,
		}));
	}, [setState]);

	// hide dialog if user resizes window
	useEffect(() => {
		if (!enableDialog) {
			setState((prevState) => ({
				...prevState,
				showFilterDialog: false,
			}));
		}
	}, [enableDialog, setState]);

	const FilterBarView = props.filterBar;

	return (
		<Box ml={4} className={classes.filterBarBox}>
			<Grid
				container
				alignItems={"center"}
				justifyContent={"flex-end"}
				spacing={2}
				className={
					classes.filterBarGrid + " components-care-data-grid-filter-bar"
				}
			>
				{FilterBarView &&
					(enableDialog ? (
						<Grid item>
							<CustomFiltersButton onClick={openDialog} />
						</Grid>
					) : (
						<FilterBarView
							customData={state.customData}
							setCustomData={setCustomData}
							inDialog={false}
						/>
					))}
			</Grid>
		</Box>
	);
};

export default React.memo(FilterBar);
