import { DataGridCustomDataActionButton, DataGridFilterParameters, DataGridQuery, DataGridRowData, DataGridRowUpdate, DataGridSortSetting, IDataGridCallbacks, IDataGridColumnsState, IDataGridFieldFilter, IDataGridState } from "./DataGrid";
export declare const dataGridPrepareFiltersAndSorts: (columnsState: IDataGridColumnsState) => [DataGridSortSetting[], IDataGridFieldFilter];
/**
 * The filter the grid shows, as loadData gets it
 * @param state The grid state (its search and custom data)
 * @param columnsState The column state (its filters)
 * @param getAdditionalFilters The grid's getAdditionalFilters
 * @remarks Without getAdditionalFilters, the custom data are the additional filters
 */
export declare const dataGridGetFilterParameters: (state: Pick<IDataGridState, "search" | "customData">, columnsState: IDataGridColumnsState, getAdditionalFilters: IDataGridCallbacks["getAdditionalFilters"]) => DataGridFilterParameters;
/**
 * The query the grid shows, as loadData gets it (without the paging)
 * @param state The grid state (its search and custom data)
 * @param columnsState The column state (its filters and sorts)
 * @param getAdditionalFilters The grid's getAdditionalFilters
 * @see dataGridGetFilterParameters
 */
export declare const dataGridGetQuery: (state: Pick<IDataGridState, "search" | "customData">, columnsState: IDataGridColumnsState, getAdditionalFilters: IDataGridCallbacks["getAdditionalFilters"]) => DataGridQuery;
export interface DataGridFirstRows {
    /**
     * The first selectable rows, in the grid's order, at most the limit
     */
    rows: DataGridRowData[];
    /**
     * The rows of the pages which were loaded for them (row index -> row), in
     * the grid's rows format
     */
    loadedRows: Record<number, DataGridRowData>;
}
/**
 * The first rows the query matches which can be selected, as the limited
 * select all selects them (DataGridProps.limitSelectAll)
 * @param loadData The grid's loadData, loads the pages the grid hasn't loaded
 * @param query The query the grid shows
 * @param rowsPerPage The grid's page size
 * @param rows The rows the grid has loaded (row index -> row)
 * @param limit How many rows to return at most
 * @param canSelectRow The grid's canSelectRow: the rows it refuses are skipped
 * @returns The rows and the pages loaded for them, rejects if loadData rejects
 * @remarks Loads one page after the other, until the limit is reached or a
 *          page with less than rowsPerPage rows (the last one) was read
 */
export declare const dataGridLoadFirstRows: (loadData: IDataGridCallbacks["loadData"], query: DataGridQuery, rowsPerPage: number, rows: Record<number, DataGridRowData>, limit: number, canSelectRow: IDataGridCallbacks["canSelectRow"]) => Promise<DataGridFirstRows>;
/**
 * Is a custom data action button disabled?
 * @param button The button
 * @param numSelected The amount of selected rows (0 none, 1 one, 2 multiple)
 * @param selectAll Is everything selected (the selection inverted)?
 */
export declare const dataGridIsCustomDataActionDisabled: (button: DataGridCustomDataActionButton, numSelected: 0 | 1 | 2, selectAll: boolean) => boolean;
/**
 * Applies a manual row update to the grid state
 * @param state The current grid state
 * @param id The ID of the row to update
 * @param update The changed fields, or a function which gets the current row
 *               data and returns the changed fields
 * @returns The new grid state, or the passed state if the row isn't loaded
 * @remarks The row ID can't be changed
 */
export declare const dataGridApplyRowUpdate: (state: IDataGridState, id: string, update: DataGridRowUpdate) => IDataGridState;
