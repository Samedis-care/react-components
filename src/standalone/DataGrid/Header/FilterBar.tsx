import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { Grid, useMediaQuery } from "@mui/material";
import {
	DataGridCustomDataType,
	DataGridFilterBarBox,
	DataGridFilterBarGrid,
	useDataGridProps,
	useDataGridState,
} from "../DataGrid";
import CustomFiltersButton from "./CustomFiltersButton";
import combineClassNames from "../../../utils/combineClassNames";

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
	const { enableFilterDialogMediaQuery, enableFilterDialogWidth } = props;
	const { classes } = props;
	const [state, setState] = useDataGridState();
	const filterBarContainer = useRef<HTMLDivElement>(null);
	const enableDialogMediaQuery = useMediaQuery(
		enableFilterDialogMediaQuery ?? "(false)",
	);
	const enableDialogWidthRef = useRef(false);
	const [enableDialogWidth, setEnableDialogWidth] = useState<boolean>(
		enableDialogWidthRef.current,
	);
	useEffect(() => {
		if (!enableFilterDialogWidth) return;
		const resizeHandler = () => {
			const container = filterBarContainer.current;
			if (!container) return;
			const showDialog = container.clientWidth < enableFilterDialogWidth;
			if (showDialog !== enableDialogWidthRef.current) {
				enableDialogWidthRef.current = showDialog;
				setEnableDialogWidth(showDialog);
			}
		};
		const resizeWatcher = new ResizeObserver(resizeHandler);
		if (filterBarContainer.current)
			resizeWatcher.observe(filterBarContainer.current);
		resizeHandler();
		return () => {
			resizeWatcher.disconnect();
		};
	}, [enableFilterDialogWidth]);

	const enableDialog =
		enableFilterDialogWidth != null
			? enableDialogWidth
			: enableDialogMediaQuery;

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
		<DataGridFilterBarBox
			ml={4}
			className={classes?.filterBarBox}
			ref={filterBarContainer}
		>
			<DataGridFilterBarGrid
				container
				alignItems={"center"}
				justifyContent={"flex-end"}
				spacing={2}
				className={combineClassNames([
					classes?.filterBarGrid,
					"components-care-data-grid-filter-bar",
				])}
			>
				{FilterBarView &&
					(enableDialog ? (
						<Grid>
							<CustomFiltersButton onClick={openDialog} />
						</Grid>
					) : (
						<FilterBarView
							customData={state.customData}
							setCustomData={setCustomData}
							inDialog={false}
						/>
					))}
			</DataGridFilterBarGrid>
		</DataGridFilterBarBox>
	);
};

export default React.memo(FilterBar);
