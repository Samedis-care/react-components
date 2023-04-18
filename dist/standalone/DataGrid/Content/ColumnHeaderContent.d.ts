import React from "react";
import { IFilterDef } from "./FilterEntry";
import { ModelFilterType } from "../../../backend-integration/Model";
import { IDataGridColumnDef } from "../DataGrid";
export interface IDataGridContentColumnHeaderContentProps {
    /**
     * The header columnHeaderLabel
     */
    headerName: string;
    /**
     * Allow resizing of column (disabled for locked columns)
     */
    enableResize: boolean;
    /**
     * Start dragging callback
     */
    startDrag: () => void;
    /**
     * Automatic resize callback
     */
    autoResize: () => void;
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
declare const _default: React.MemoExoticComponent<(props: IDataGridContentColumnHeaderContentProps) => JSX.Element>;
export default _default;
