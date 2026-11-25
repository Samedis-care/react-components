import React from "react";
import { DataGridProps } from "../DataGrid";
export interface DataActionBarViewProps {
    /**
     * The amount of selected items
     * Values: 0 (none), 1 (one) or 2 (multiple)
     */
    numSelected: 0 | 1 | 2;
    /**
     * Is everything selected (the selection inverted)?
     */
    selectAll: boolean;
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
     * Is a delete running? Delete is then unavailable and shows a progress
     * indicator in place of its icon
     * @see DataGridProps.deleting
     */
    deleting: boolean;
    /**
     * Does handleDelete handle an inverted selection? Otherwise the delete button
     * is disabled while everything is selected
     */
    enableDeleteAll: boolean;
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
     * Hides the select all checkbox (it keeps its place). It is disabled then
     * too, see selectAllDisabled
     */
    disableSelection: boolean;
    /**
     * The select all label: "All", or "First" and the limit while the limited
     * select all selects only part of the rows matching the filter
     */
    selectAllLabel: string;
    /**
     * Is the select all checkbox disabled? Its caption is dimmed then, like
     * the captions of the disabled actions
     * @see DataGridSelectAll.disabled
     */
    selectAllDisabled: boolean;
}
declare const _default: React.MemoExoticComponent<(props: DataActionBarViewProps) => React.JSX.Element>;
export default _default;
