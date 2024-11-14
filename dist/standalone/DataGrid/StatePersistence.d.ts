import React from "react";
import { DataGridProps, IDataGridColumnsState, IDataGridState } from "./DataGrid";
export interface DataGridPersistentState {
    columnState: IDataGridColumnsState;
    columnWidth: Record<string, number>;
    state: Partial<Pick<IDataGridState, "search" | "hiddenColumns" | "lockedColumns" | "customData" | "initialResize">>;
}
export type DataGridPersistentStateContextType = [
    Partial<DataGridPersistentState> | undefined,
    (data: Partial<DataGridPersistentState>) => Promise<void> | void
];
export declare const DataGridPersistentStateContext: React.Context<DataGridPersistentStateContextType | undefined>;
export declare const filterPersistedState: (persisted: Partial<DataGridPersistentState>, config: DataGridProps["persist"]) => Partial<DataGridPersistentState>;
declare const _default: React.MemoExoticComponent<() => React.JSX.Element>;
export default _default;
