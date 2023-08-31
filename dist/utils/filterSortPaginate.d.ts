import { DataGridRowData, IDataGridColumnDef, IDataGridLoadDataParameters } from "../standalone/DataGrid/DataGrid";
/**
 * Applies the given filters, sort and offset-based pagination settings to the given data.
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
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
 */
declare const filterSortPaginate: (rowData: DataGridRowData[], params: IDataGridLoadDataParameters, columnDef: IDataGridColumnDef[]) => [DataGridRowData[], number];
export default filterSortPaginate;
