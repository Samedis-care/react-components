import React, { useMemo } from "react";
import { Box, Grid, SvgIconProps } from "@mui/material";
import Search from "./Search";
import ActionBar from "./ActionBar";
import FilterBar, { IDataGridFilterBarProps } from "./FilterBar";
import {
	DataGridAdditionalFilters,
	DataGridSortSetting,
	IDataGridColumnDef,
	IDataGridFieldFilter,
	useDataGridState,
} from "../DataGrid";
import { SvgIconComponent } from "@mui/icons-material";
import { DialogContextType } from "../../../framework";

export interface IDataGridHeaderProps {
	/**
	 * The filter bar component for rendering custom filters (also used in custom filter dialog)
	 */
	filterBar?: React.ComponentType<IDataGridFilterBarProps>;
	/**
	 * Media query that enables the custom filter dialog mode (if matches)
	 * @deprecated use enableFilterDialogWidth
	 * @remarks not used if enableFilterDialogWidth is set
	 */
	enableFilterDialogMediaQuery?: string;
	/**
	 * If width of the filter container < enableFilterDialogWidth show custom filter dialog
	 * @remarks Takes precedence over enableFilterDialogMediaQuery
	 */
	enableFilterDialogWidth?: number;
	/**
	 * List of available export providers
	 */
	exporters?: IDataGridExporter<unknown>[];
	/**
	 * Keep export menu open after downloading the export?
	 * @default false
	 */
	keepExportMenuOpenAfterDownload?: boolean;
	/**
	 * Hide user column settings
	 */
	hideSettings?: boolean;
	/**
	 * Hide user reset button
	 */
	hideReset?: boolean;
}

/**
 * An exporter provider
 * The data grid calls onRequest once the user clicks the export menu entry
 * Once the promise returns the user will be shown that the export is done
 * When the user clicks on the ready export onDownload will be called with
 * the data from the return value of onRequest. The methods are separated
 * due to popup blocker issues.
 */
export interface IDataGridExporter<T> {
	/**
	 * Unique identifier for the export menu entry
	 */
	id: string;
	/**
	 * An optional icon for the export menu entry
	 */
	icon?: SvgIconComponent | React.ComponentType<SvgIconProps>;
	/**
	 * The label of the export menu entry while waiting for the user to click it
	 */
	getLabel: () => string;
	/**
	 * The label of the export menu entry while waiting for onRequest to complete
	 */
	getWorkingLabel: () => string;
	/**
	 * The label of the export menu entry after onRequest completed, but before
	 * onDownload got called
	 */
	getReadyLabel: () => string;
	/**
	 * The label of the export menu entry if an error occurs in onRequest
	 */
	getErrorLabel: () => string;
	/**
	 * Requests the backend to prepare an export with the given parameters
	 * @param quickFilter The quick filter (search field)
	 * @param additionalFilters Additional user-defined fields
	 * @param fieldFilter Field specific filters
	 * @param sort The sort settings
	 * @param column The currently visible columns in correct order
	 */
	onRequest: (
		quickFilter: string,
		additionalFilters: DataGridAdditionalFilters,
		fieldFilter: IDataGridFieldFilter,
		sort: DataGridSortSetting[],
		columns: IDataGridColumnDef[],
	) => Promise<T>;
	/**
	 * Frontend handler to download data based off metadata supplied by backend
	 * @param data The data returned by backend
	 * @param pushDialog function to push react dialogs (only available if DataGrid has CC dialog context)
	 */
	onDownload: (data: T, pushDialog?: DialogContextType[0] | null) => void;
	/**
	 * Automatically call onDownload when ready (this is considered non-interactive and may come with limitations for e.g. opening popups)
	 */
	autoDownload?: boolean;
}

const Header = () => {
	const [state] = useDataGridState();
	const { showSettings } = state;

	return useMemo(
		() => (
			<Box mx={1}>
				<Grid
					container
					justifyContent={"space-between"}
					alignItems={"center"}
					wrap={"nowrap"}
				>
					<Grid>
						<Search />
					</Grid>
					<Grid size={"grow"} display={showSettings ? "none" : undefined}>
						<FilterBar />
					</Grid>
					<Grid display={showSettings ? "none" : undefined}>
						<ActionBar />
					</Grid>
				</Grid>
			</Box>
		),
		[showSettings],
	);
};

export default React.memo(Header);
