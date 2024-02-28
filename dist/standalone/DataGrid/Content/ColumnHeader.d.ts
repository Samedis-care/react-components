import React from "react";
import { IDataGridColumnDef } from "../DataGrid";
export interface IDataGridContentColumnHeaderProps {
    /**
     * The column definition
     */
    column: IDataGridColumnDef;
}
export declare const HEADER_PADDING = 32;
export declare const applyColumnWidthLimits: (column: IDataGridColumnDef, targetWidth: number) => number;
declare const _default: React.MemoExoticComponent<(props: IDataGridContentColumnHeaderProps) => React.JSX.Element>;
export default _default;
