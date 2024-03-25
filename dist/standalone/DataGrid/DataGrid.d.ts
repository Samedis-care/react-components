import React, { Dispatch, SetStateAction } from "react";
import type * as Theming from "../../types/theming";
import { Theme } from "@mui/material";
import { Styles } from "@mui/styles";
import { IDataGridHeaderProps } from "./Header";
import { FilterType, IFilterDef } from "./Content/FilterEntry";
import { ModelFilterType } from "../../backend-integration/Model";
import { IDataGridContentSelectRowViewProps } from "./Content/SelectRowView";
export interface DataGridTheme extends Theming.BasicElementThemeFragment {
    header?: Theming.BasicElementThemeFragment;
    content?: Theming.BasicElementThemeFragment & {
        row?: Theming.BasicElementThemeFragment & {
            odd?: Theming.BasicColorThemeFragment;
            even?: Theming.BasicColorThemeFragment;
            hover?: Theming.BasicColorThemeFragment;
            selected?: Theming.BasicColorThemeFragment;
            cell?: Theming.BasicElementThemeFragment & {
                header?: Theming.BasicTextThemeFragment & {
                    label?: Theming.BasicTextThemeFragment;
                    resizer?: Theming.BasicElementThemeFragment;
                };
                data?: Theming.BasicTextThemeFragment & {
                    label?: Theming.BasicTextThemeFragment;
                };
            };
        };
    };
    footer?: Theming.BasicElementThemeFragment & {
        total?: Theming.BasicElementThemeFragment;
    };
}
export type DataGridProps = IDataGridHeaderProps & IDataGridColumnProps & IDataGridCallbacks & {
    /**
     * Custom styles
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
    /**
     * Custom data action buttons
     * Rendered next to delete.
     * Max 1 extra button to fit on mobile screens
     */
    customDataActionButtons?: {
        /**
         * The icon of the button
         */
        icon: React.ReactNode;
        /**
         * The label of the button
         * @remarks must be unique
         */
        label: string;
        /**
         * Is the button disabled?
         * @param numSelected The amount of selected rows
         * 										0 => none
         * 									  1 => one
         * 									  2 => multiple
         */
        isDisabled: (numSelected: 0 | 1 | 2) => boolean;
        /**
         * The click handler
         * @param invert Is the selection inverted? (if true => ids = everything except ids)
         * @param ids The ids
         */
        onClick: (invert: boolean, ids: string[]) => void;
    }[];
    /**
     * Hides the footer
     */
    disableFooter?: boolean;
    /**
     * Custom selection control (instead of default checkbox)
     */
    customSelectionControl?: React.ComponentType<IDataGridContentSelectRowViewProps>;
    /**
     * Enable the global scroll listener (listens for page up/down keydown events)
     */
    globalScrollListener?: boolean;
};
export interface IDataGridLoadDataParameters {
    /**
     * The page to load
     */
    page: number;
    /**
     * The amount of rows per page
     */
    rows: number;
    /**
     * The search box content
     */
    quickFilter: string;
    /**
     * Additional filters specified by you
     */
    additionalFilters: DataGridAdditionalFilters;
    /**
     * The field filter contents
     */
    fieldFilter: IDataGridFieldFilter;
    /**
     * The sort settings
     */
    sort: DataGridSortSetting[];
}
export interface IDataGridCallbacks {
    /**
     * Loads data for the grid
     * @param params The load data parameters
     * @returns The loaded data (resolve) or an error (reject)
     */
    loadData: (params: IDataGridLoadDataParameters) => DataGridData | Promise<DataGridData>;
    /**
     * Specifies the amount of data entries to load at once.
     * Defaults to 25
     */
    rowsPerPage?: number;
    /**
     * Token which is used to cause a forceful refresh of data
     */
    forceRefreshToken?: string;
    /**
     * Extracts additional filters from the provided custom data
     * @param customData The custom user-defined state-stored data
     */
    getAdditionalFilters?: (customData: DataGridCustomDataType) => DataGridAdditionalFilters;
    /**
     * Default initial values for custom data (overwritten by persisted custom data)
     */
    defaultCustomData?: Record<string, unknown>;
    /**
     * Forced initial values for custom data (overwrites persisted custom data)
     */
    overrideCustomData?: Record<string, unknown>;
    /**
     * Set the (initial) selection of the grid when provided/updated.
     * Content: [invert, ids].
     * Use together with onSelectionChange for controlled selection.
     */
    selection?: [boolean, string[]];
    /**
     * Event for selection change
     * @param invert Are ids inverted? If true: Everything is selected except ids. If false: Only ids are selected
     * @param ids The ids that are selected/not selected based on invert
     */
    onSelectionChange?: (invert: boolean, ids: string[]) => void;
    /**
     * Callback for row double click
     * @param record The data of the row to choose field for double click
     * @remarks Called additionally before edit handler
     */
    onRowDoubleClick?: (record: Record<string, unknown>) => void;
    /**
     * Callback to check if filter is supported
     * @param dataType The data type
     * @param filterType The filter type
     * @param fieldName the column field name
     * @returns Supported?
     */
    isFilterSupported?: (dataType: ModelFilterType, filterType: FilterType, fieldName: string) => boolean;
    /**
     * Callback for unhandled JS errors
     * @param err The unhandled error
     */
    onError?: (err: Error) => void;
    /**
     * Callback for import button click
     * If not defined: Import button will not show
     */
    onImport?: () => void;
    /**
     * Callback to show a row as selected/unselected based on the data record it contains.
     * Defaults to return selected. Use in conjunction with canSelectRow.
     * @param selected The current selected state (as determined by data grid)
     * @param record The data record
     * @return Should the DataGrid display the record as selected?
     */
    isSelected?: (selected: boolean, record: Record<string, unknown>) => boolean;
    /**
     * Can toggle selection callback. Can be used to disable selection for select rows.
     * Defaults to return true. Use in conjunction with isSelected.
     * @param record The data record
     * @return Can the row be selected
     */
    canSelectRow?: (record: Record<string, unknown>) => boolean;
}
export type DataGridAdditionalFilters = Record<string, unknown>;
export type DataGridSortSetting = {
    field: string;
    direction: -1 | 1;
};
export type DataGridFilterSetting = {
    field: string;
    filter: IFilterDef;
};
export interface IDataGridAddButton {
    /**
     * The icon
     */
    icon?: React.ReactNode;
    /**
     * Label of the add button
     */
    label: NonNullable<React.ReactNode>;
    /**
     * onClick handler for the add button
     * Set undefined to disable button
     */
    onClick: (() => void) | undefined;
    /**
     * Disable button reason hint
     */
    disableHint?: string;
}
export interface IDataGridColumnProps {
    /**
     * Column definitions
     */
    columns: IDataGridColumnDef[];
    /**
     * Placeholder for search box
     */
    searchPlaceholder?: string;
    /**
     * Add new handler(s), do not specify to disable add new button(s). Set to string to show disabled add new button with hint
     */
    onAddNew?: (() => void) | string | IDataGridAddButton[];
    /**
     * Edit handler
     * @param id The id to edit
     */
    onEdit?: (id: string) => void;
    /**
     * Delete handler, do not specify to disable deletion
     * @param invert if invert is true, delete everything except ids, otherwise only delete ids
     * @param ids The list of ids to (not) delete
     * @param filter The current data grid filter (if set)
     * @return Promise Optional promise, which will cancel automatic unselect if rejected
     */
    onDelete?: (invert: boolean, ids: string[], filter?: Pick<IDataGridLoadDataParameters, "quickFilter" | "additionalFilters" | "fieldFilter">) => Promise<void> | unknown;
    /**
     * Reason why delete is disabled
     */
    disableDeleteHint?: string;
    /**
     * Do we support and enable the delete all functionality?
     * If not set select all will only select all ids on the current page
     */
    enableDeleteAll?: boolean;
    /**
     * Limits the amount of chainable column filters
     * @remarks This is zero-indexed, so max 1 filter means pass 0, max 2 filter => 1, etc
     */
    filterLimit?: number;
    /**
     * Limits the amount of active sorts
     * @remarks This is zero-indexed, so max 1 sorts means pass 0, max 2 sorts => 1, etc
     */
    sortLimit?: number;
    /**
     * Disable selecting multiple entries (disables select all & delete all)
     */
    prohibitMultiSelect?: boolean;
    /**
     * Hide checkbox column
     */
    disableSelection?: boolean;
    /**
     * The default sort settings
     */
    defaultSort?: DataGridSortSetting[];
    /**
     * The default column filter settings
     */
    defaultFilter?: DataGridFilterSetting[];
    /**
     * The column filter settings override (disables all filters if set)
     */
    overrideFilter?: DataGridFilterSetting[];
    /**
     * Header height override (in px)
     * @default 32
     */
    headerHeight?: number;
}
export type IDataGridFieldFilter = {
    [field: string]: IFilterDef;
};
export interface DataGridSetFilterDataEntry {
    /**
     * The value to pass to the backend.
     * Must not contain comma as it is being used as separator.
     */
    value: string;
    /**
     * The label to display
     * Fallback if not set: getLabelText
     */
    getLabel?: () => React.ReactNode;
    /**
     * The label text
     */
    getLabelText: () => string;
    /**
     * Is the value disabled
     */
    disabled?: boolean;
    /**
     * Is the value a divider
     */
    isDivider?: boolean;
}
export type DataGridSetFilterData = DataGridSetFilterDataEntry[];
export interface IDataGridColumnDef {
    /**
     * The field name
     */
    field: string;
    /**
     * The field label
     */
    headerName: string;
    /**
     * Optional label override for column header
     */
    headerLabel?: string;
    /**
     * The data type used for filtering
     */
    type: ModelFilterType;
    /**
     * Filter data, required for the following types:
     * - enum (DataGridSetFilterData)
     */
    filterData?: DataGridSetFilterData;
    /**
     * Hidden by default?
     */
    hidden?: boolean;
    /**
     * Can the column be filtered?
     */
    filterable?: boolean;
    /**
     * Can the column be sorted?
     */
    sortable?: boolean;
    /**
     * Pinned by default?
     */
    pinned?: boolean;
    /**
     * Force the column to be pinned?
     */
    forcePin?: boolean;
    /**
     * Is the column locked to the start
     */
    isLocked?: boolean;
    /**
     * Column width configuration
     */
    width?: [minWidth: number, maxWidth: number, initialWidth?: number];
}
export interface IDataGridColumnState {
    /**
     * The current sort setting
     */
    sort: -1 | 0 | 1;
    /**
     * The sort priority (lower = higher priority)
     */
    sortOrder?: number;
    /**
     * The enabled filter
     */
    filter: IFilterDef | undefined;
}
export interface DataGridData {
    /**
     * Total amount of rows
     */
    rowsTotal: number;
    /**
     * Amount of rows shown
     */
    rowsFiltered?: number;
    /**
     * Row data
     */
    rows: DataGridRowData[];
}
export type DataGridRowData = {
    id: string;
} & Record<string, string | number | {
    toString: () => string;
} | React.ReactElement | null>;
export type DataGridCustomDataType = Record<string, unknown>;
export interface IDataGridState {
    /**
     * The current search (quick filter) string
     */
    search: string;
    /**
     * The page start and end indexes
     */
    pages: [start: number, end: number];
    /**
     * The total amount of rows
     */
    rowsTotal: number;
    /**
     * The amount of rows shown if view is filtered
     */
    rowsFiltered: number | null;
    /**
     * Show the settings popover
     */
    showSettings: boolean;
    /**
     * Show the custom filter dialog
     */
    showFilterDialog: boolean;
    /**
     * The hidden fields
     */
    hiddenColumns: string[];
    /**
     * The locked fields
     */
    lockedColumns: string[];
    /**
     * Is everything selected? (inverts selection)
     */
    selectAll: boolean;
    /**
     * The selected rows
     */
    selectedRows: string[];
    /**
     * Was the selection updated by DataGrid props
     */
    selectionUpdatedByProps: boolean;
    /**
     * The rows to be shown
     */
    rows: Record<number, DataGridRowData>;
    /**
     * Error returned by loadData
     */
    dataLoadError: Error | null;
    /**
     * Should loadData be called?
     */
    refreshData: number;
    /**
     * Should refresh data wipe the rows (when its on 2). This is needed because
     * filters can change between refreshes without being reset
     */
    refreshShouldWipeRows: boolean;
    /**
     * Custom user-defined data
     */
    customData: DataGridCustomDataType;
    /**
     * Initially resized?
     */
    initialResize: boolean;
}
export declare const useDataGridState: () => [
    IDataGridState,
    Dispatch<SetStateAction<IDataGridState>>
];
export declare const useDataGridProps: () => DataGridProps;
export type IDataGridColumnsState = {
    [field: string]: IDataGridColumnState;
};
export type DataGridColumnState = [
    /**
     * Column state of all columns
     */
    IDataGridColumnsState,
    /**
     * Update column state callback
     */
    Dispatch<SetStateAction<IDataGridColumnsState>>
];
export declare const useDataGridColumnState: () => DataGridColumnState;
export type DataGridColumnsWidthState = [
    /**
     * Field -> Width in px
     */
    Record<string, number>,
    /**
     * Set state function
     */
    Dispatch<SetStateAction<Record<string, number>>>
];
export declare const useDataGridColumnsWidthState: () => DataGridColumnsWidthState;
export declare const useDataGridRootRef: () => HTMLDivElement;
export declare const getDataGridDefaultState: (columns: IDataGridColumnDef[], defaultCustomData: Record<string, unknown> | undefined) => IDataGridState;
export declare const getDataGridDefaultColumnsState: (columns: IDataGridColumnDef[], defaultSort: DataGridSortSetting[] | undefined, defaultFilter: DataGridFilterSetting[] | undefined) => IDataGridColumnsState;
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"footer" | "header" | "content" | "cell" | "wrapper" | "rowOdd" | "rowEven" | "headerCell" | "dataCell" | "dataCellSelected" | "columnHeaderContentWrapper" | "columnHeaderFilterable" | "columnHeaderFilterButton" | "columnHeaderFilterButtonActive" | "columnHeaderResizer" | "columnHeaderFilterPopup" | "columnHeaderFilterPopupEnum" | "columnHeaderFilterIcon" | "columnHeaderSortIcon" | "quickFilterActiveIcon" | "customFilterIcon" | "customFilterActiveIcon" | "customFilterBorder" | "columnHeaderLabel" | "disableClick" | "filterClearBtn" | "filterBarBox" | "filterBarGrid" | "setFilterContainer" | "setFilterListItem" | "setFilterListItemDivider" | "setFilterListDivider" | "contentOverlayCollapse" | "paginationText" | "selectAllWrapper" | "selectAllCheckbox" | "selectCheckbox" | "contentOverlayPaper" | "contentOverlayClosed" | "customFilterContainer">;
export type DataGridClassKey = keyof ReturnType<typeof useStyles>;
export type DataGridThemeExpert = Partial<Styles<Theme, DataGridProps, DataGridClassKey>>;
export declare const useDataGridStyles: () => ReturnType<typeof useStyles>;
export declare const getActiveDataGridColumns: (columns: IDataGridColumnDef[], hiddenColumns: string[], lockedColumns: string[]) => IDataGridColumnDef[];
export declare const getDefaultColumnWidths: (columns: IDataGridColumnDef[], theme: Theme) => Record<string, number>;
declare const _default: React.MemoExoticComponent<(props: DataGridProps) => React.JSX.Element>;
export default _default;