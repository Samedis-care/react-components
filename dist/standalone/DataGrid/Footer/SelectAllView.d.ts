import React from "react";
export interface IDataGridContentSelectAllViewProps {
    /**
     * Is currently checked (everything selected)
     */
    checked: boolean;
    /**
     * Is part of the rows selected? Shown as a dash, a click selects everything
     */
    indeterminate: boolean;
    /**
     * Is the select all button disabled?
     */
    disabled: boolean;
    /**
     * Update checked
     * @param evt The change event, ignored
     * @param newChecked New checked state
     */
    onSelect: (evt: React.ChangeEvent, newChecked: boolean) => void;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridContentSelectAllViewProps) => React.JSX.Element>;
export default _default;
