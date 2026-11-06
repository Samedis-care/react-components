import React from "react";
import { DataGridProps, DataGridRowData, IDataGridColumnDef } from "../DataGrid";
export interface IDataGridContentSelectRowProps {
    /**
     * The row record
     */
    record: DataGridRowData;
    /**
     * The visible columns, in the order they are shown
     */
    columns: IDataGridColumnDef[];
}
export declare const isSelected: (selectAll: boolean, selectedIds: string[], record?: Record<string, unknown>, isSelectedHook?: DataGridProps["isSelected"]) => boolean;
declare const _default: React.MemoExoticComponent<(props: IDataGridContentSelectRowProps) => React.JSX.Element>;
export default _default;
