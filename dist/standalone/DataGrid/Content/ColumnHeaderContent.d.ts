import React from "react";
import { IFilterDef } from "./FilterEntry";
import { ModelFilterType } from "../../../backend-integration/Model";
import { IDataGridColumnDef } from "../DataGrid";
export interface IDataGridContentColumnHeaderContentProps {
    /**
     * The column field name
     */
    field: string;
    /**
     * The header columnHeaderLabel
     */
    headerName: NonNullable<React.ReactNode>;
    /**
     * Allow resizing of column (disabled for locked columns)
     */
    enableResize: boolean;
    /**
     * Start dragging callback, called with the press on the resize handle
     * @param evt The mouse down event
     */
    startDrag: (evt: React.MouseEvent) => void;
    /**
     * Called on a double click on the resize handle: fits the column to its
     * content
     * @param evt The double click event; its currentTarget is the handle
     */
    autoResize: (evt: React.MouseEvent<HTMLElement>) => void;
    /**
     * Can the column be sorted? The label is then a sort button, else a tab
     * stop when it is a string.
     */
    sortable: boolean;
    /**
     * Called when Enter or Space is pressed on the sort button: steps the
     * column's sort as a click on the header does
     * @param additional Shift was held: add or remove the column as a further
     * sort, as Shift+click does
     */
    onSort: (additional: boolean) => void;
    /**
     * The currently active sort
     */
    sort: -1 | 0 | 1;
    /**
     * The sort priority (lower = higher priority)
     */
    sortOrder: number | undefined;
    /**
     * The currently active filter
     */
    filter?: IFilterDef;
    /**
     * Can the column be filtered?
     */
    filterable: boolean;
    /**
     * Updates the filter
     * @param value The new filter
     */
    onFilterChange: (value: IFilterDef) => void;
    /**
     * The type of the column
     */
    columnType: ModelFilterType;
    /**
     * The filter data of the column
     */
    filterData: IDataGridColumnDef["filterData"];
}
declare const _default: React.MemoExoticComponent<(props: IDataGridContentColumnHeaderContentProps) => React.JSX.Element>;
export default _default;
