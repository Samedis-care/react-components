import React from "react";
export interface IDataGridPaginationViewProps {
    /**
     * The total amount of rows
     */
    rowsTotal: number;
    /**
     * The amount of rows shown
     */
    rowsFiltered: number | null;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridPaginationViewProps) => React.JSX.Element>;
export default _default;
