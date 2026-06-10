import React, { Dispatch, SetStateAction } from "react";
import { DataGridCustomDataType } from "../DataGrid";
export interface IDataGridFilterBarProps {
    /**
     * The user-defined custom data
     */
    customData: DataGridCustomDataType;
    /**
     * A setState like interface for setting customData
     */
    setCustomData: Dispatch<SetStateAction<DataGridCustomDataType>>;
    /**
     * Is rendered in Dialog?
     */
    inDialog: boolean;
}
type CustomFilterActiveContextType = [
    number,
    Dispatch<React.SetStateAction<number>>
];
export declare const CustomFilterActiveContext: React.Context<CustomFilterActiveContextType | undefined>;
export declare const useCustomFilterActiveContext: () => CustomFilterActiveContextType;
declare const _default: React.MemoExoticComponent<() => React.JSX.Element>;
export default _default;
