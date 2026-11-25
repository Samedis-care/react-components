import React, { Dispatch, SetStateAction } from "react";
import { DataGridCustomDataType } from "../DataGrid";
export interface IDataGridFilterBarProps {
    /**
     * The user-defined custom data. Restored from storage, it holds JSON
     * values only: see DataGridCustomDataType
     */
    customData: DataGridCustomDataType;
    /**
     * A setState like interface for setting customData. The grid persists it
     * as JSON, so set JSON values only: see DataGridCustomDataType
     */
    setCustomData: Dispatch<SetStateAction<DataGridCustomDataType>>;
    /**
     * Is rendered in Dialog?
     */
    inDialog: boolean;
}
declare const _default: React.MemoExoticComponent<() => React.JSX.Element>;
export default _default;
