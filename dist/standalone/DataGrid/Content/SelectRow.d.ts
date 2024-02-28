import React from "react";
import { DataGridProps, DataGridRowData } from "../DataGrid";
export interface IDataGridContentSelectRowProps {
    /**
     * The row record
     */
    record: DataGridRowData;
}
export declare const isSelected: (selectAll: boolean, selectedIds: string[], record?: Record<string, unknown>, isSelectedHook?: DataGridProps["isSelected"]) => boolean;
declare const _default: React.MemoExoticComponent<(props: IDataGridContentSelectRowProps) => React.JSX.Element>;
export default _default;
