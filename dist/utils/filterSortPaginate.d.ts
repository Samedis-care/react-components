import type { DataGridRowData, IDataGridColumnDef, IDataGridLoadDataParameters } from "../standalone/DataGrid/DataGrid";
/**
 * Applies the given filters, sort and offset-based pagination settings to the given data.
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
 * @remarks A column filter's chain (nextFilter) ends before its first condition
 *          without a value1, as in the DataGrid's own query
 *          (IDataGridLoadDataParameters.fieldFilter), so a filter whose first
 *          condition has none filters nothing. The empty and notEmpty conditions
 *          carry their type as value1, as the DataGrid's filter popup sets them.
 */
export declare const filterSortPaginate2: (rowData: DataGridRowData[], params: Omit<IDataGridLoadDataParameters, "page" | "rows"> & {
    offset: number;
    rows: number;
}, columnDef: IDataGridColumnDef[]) => [DataGridRowData[], number];
/**
 * Applies the given filters, sort and pagination settings to the given data
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
 * @remarks The column filters are read as in filterSortPaginate2: a chain ends
 *          before its first condition without a value1.
 */
declare const filterSortPaginate: (rowData: DataGridRowData[], params: IDataGridLoadDataParameters, columnDef: IDataGridColumnDef[]) => [DataGridRowData[], number];
export default filterSortPaginate;
