import { DataGridCustomDataActionButton, DataGridFilterParameters, DataGridRowUpdate, DataGridSortSetting, IDataGridCallbacks, IDataGridColumnsState, IDataGridFieldFilter, IDataGridState } from "./DataGrid";
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
