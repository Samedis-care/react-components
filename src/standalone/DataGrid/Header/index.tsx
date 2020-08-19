import React from "react";
import { Grid } from "@material-ui/core";
import Search from "./Search";
import ActionBar from "./ActionBar";
import FilterBar, { IDataGridFilterBarProps } from "./FilterBar";
import {
	DataGridAdditionalFilters,
	DataGridSortSetting,
	IDataGridFieldFilter,
} from "../index";
import { SvgIconComponent } from "@material-ui/icons";

export interface IDataGridHeaderProps {
	/**
	 * The filter bar component for rendering custom filters
	 */
	filterBar?: React.ComponentType<IDataGridFilterBarProps>;
	/**
	 * List of available export providers
	 */
	exporters?: IDataGridExporter<any>[];
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
	icon?: SvgIconComponent;
	/**
	 * The label of the export menu entry while waiting for the user to click it
	 */
	label: string;
	/**
	 * The label of the export menu entry while waiting for onRequest to complete
	 */
	workingLabel: string;
	/**
	 * The label of the export menu entry after onRequest completed, but before
	 * onDownload got called
	 */
	readyLabel: string;
	/**
	 * Requests the backend to prepare an export with the given parameters
	 * @param quickFilter The quick filter (search field)
	 * @param additionalFilters Additional user-defined fields
	 * @param fieldFilter Field specific filters
	 * @param sort The sort settings
	 */
	onRequest: (
		quickFilter: string,
		additionalFilters: DataGridAdditionalFilters,
		fieldFilter: IDataGridFieldFilter,
		sort: DataGridSortSetting[]
	) => Promise<T>;
	/**
	 * Frontend handler to download data based off metadata supplied by backend
	 * @param data The data returned by backend
	 */
	onDownload: (data: T) => void;
}

const Header = (_props: IDataGridHeaderProps) => {
	return (
		<Grid container justify={"space-between"}>
			<Grid item>
				<Search />
			</Grid>
			<Grid item>
				<FilterBar />
			</Grid>
			<Grid item>
				<ActionBar />
			</Grid>
		</Grid>
	);
};

export default React.memo(Header);
