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
     * Is the column pinned? (field -> pinned)
     */
    columnPinned: Record<string, boolean>;
    /**
     * Is the column hidden? (field -> hidden)
     */
    columnHidden: Record<string, boolean>;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridSettingsDialogProps) => React.JSX.Element>;
export default _default;
