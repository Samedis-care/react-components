import React, {
	Dispatch,
	SetStateAction,
	useCallback,
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
	 * The user-defined custom data. Restored from storage, it holds JSON
	 * values only: see DataGridCustomDataType
	 */
	customData: DataGridCustomDataType;
	/**
	 * A setState like interface for setting customData. The grid persists it
	 * as JSON, so set JSON values only: see DataGridCustomDataType
	 */
	setCustomData: Dispatch<SetStateAction<DataGridCustomDataType>>;
	/**
	 * Is rendered in Dialog?
	 */
	inDialog: boolean;
}

/**
 * The default of DataGridProps.enableFilterDialogWidth (in px), used while the
 * grid has a filterBar and sets neither enableFilterDialogWidth nor
 * enableFilterDialogMediaQuery. The helpers (GridSingleSelectFilter and the
 * like) take a third of the bar each by default, so each of them is about
 * 190px wide at this width.
 */
const DEFAULT_FILTER_DIALOG_WIDTH = 600;

const FilterBar = () => {
	const props = useDataGridProps();
	const { enableFilterDialogMediaQuery, filterBar } = props;
	const enableFilterDialogWidth =
		props.enableFilterDialogWidth ??
		(filterBar && enableFilterDialogMediaQuery == null
			? DEFAULT_FILTER_DIALOG_WIDTH
			: undefined);
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

	const FilterBarView = filterBar;

	return (
		<DataGridFilterBarBox
			sx={{ ml: 4 }}
			className={classes?.filterBarBox}
			ref={filterBarContainer}
		>
			<DataGridFilterBarGrid
				container
				sx={{ alignItems: "center", justifyContent: "flex-end" }}
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
