import React, { ChangeEvent } from "react";
import { IDataGridColumnProps } from "../DataGrid";
export interface IDataGridSettingsDialogProps extends IDataGridColumnProps {
    /**
     * Callback to close settings pop-over
     */
    closeGridSettings: () => void;
    /**
     * Event to toggle column locked state
     * @param evt The change event
     */
    toggleColumnLock: (evt: ChangeEvent<HTMLInputElement>) => void;
    /**
     * Event to toggle column hidden state
     * @param evt The change event
     */
    toggleColumnVisibility: (evt: ChangeEvent<HTMLInputElement>) => void;
    /**
     * The currently locked columns
     */
    lockedColumns: string[];
    /**
     * The currently hidden columns
     */
    hiddenColumns: string[];
}
declare const _default: React.MemoExoticComponent<(props: IDataGridSettingsDialogProps) => JSX.Element>;
export default _default;
