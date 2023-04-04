import React from "react";
import { DataGridProps, IDataGridColumnProps } from "../DataGrid";
export interface IDataGridContentProps extends IDataGridColumnProps, Pick<DataGridProps, "globalScrollListener"> {
    rowsPerPage: number;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridContentProps) => JSX.Element>;
export default _default;
