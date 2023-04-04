import React from "react";
import { IDataGridFilterBarProps } from "./FilterBar";
import { DataGridAdditionalFilters, DataGridSortSetting, IDataGridColumnDef, IDataGridFieldFilter } from "../DataGrid";
import { SvgIconComponent } from "@material-ui/icons";
import { DialogContextType } from "../../../framework";
export interface IDataGridHeaderProps {
    /**
     * The filter bar component for rendering custom filters (also used in custom filter dialog)
     */
    filterBar?: React.ComponentType<IDataGridFilterBarProps>;
    /**
     * Media query that enables the custom filter dialog mode (if matches)
     */
    enableFilterDialogMediaQuery?: string;
    /**
     * List of available export providers
     */
    exporters?: IDataGridExporter<unknown>[];
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
    onRequest: (quickFilter: string, additionalFilters: DataGridAdditionalFilters, fieldFilter: IDataGridFieldFilter, sort: DataGridSortSetting[], columns: IDataGridColumnDef[]) => Promise<T>;
    /**
     * Frontend handler to download data based off metadata supplied by backend
     * @param data The data returned by backend
     * @param pushDialog function to push react dialogs (only available if DataGrid has CC dialog context)
     */
    onDownload: (data: T, pushDialog?: DialogContextType[0] | null | undefined) => void;
    /**
     * Automatically call onDownload when ready (this is considered non-interactive and may come with limitations for e.g. opening popups)
     */
    autoDownload?: boolean;
}
declare const _default: React.MemoExoticComponent<() => JSX.Element>;
export default _default;
