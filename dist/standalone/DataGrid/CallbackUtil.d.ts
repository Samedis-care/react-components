import { DataGridRowUpdate, DataGridSortSetting, IDataGridColumnsState, IDataGridFieldFilter, IDataGridState } from "./DataGrid";
export declare const dataGridPrepareFiltersAndSorts: (columnsState: IDataGridColumnsState) => [DataGridSortSetting[], IDataGridFieldFilter];
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
