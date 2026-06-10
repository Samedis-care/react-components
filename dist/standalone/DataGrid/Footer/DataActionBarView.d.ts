import React from "react";
import { DataGridProps } from "../DataGrid";
export interface DataActionBarViewProps {
    /**
     * The amount of selected items
     * Values: 0 (none), 1 (one) or 2 (multiple)
     */
    numSelected: 0 | 1 | 2;
    /**
     * Callback for edit button.
     * If not defined: Disables edit button
     */
    handleEdit?: React.MouseEventHandler;
    /**
     * Callback for delete button.
     * If not defined: Disables delete button
     */
    handleDelete?: React.MouseEventHandler;
    /**
     * Disable delete button reason
     */
    disableDeleteHint?: string;
    /**
     * @see DataGridProps.customDataActionButtons
     */
    customButtons: DataGridProps["customDataActionButtons"];
    /**
     * Forward click to external handler
     * @param label The label of the custom button
     */
    handleCustomButtonClick: (label: string) => void;
    /**
     * Disable select all button
     */
    disableSelection: boolean;
}
declare const _default: React.MemoExoticComponent<(props: DataActionBarViewProps) => React.JSX.Element>;
export default _default;
