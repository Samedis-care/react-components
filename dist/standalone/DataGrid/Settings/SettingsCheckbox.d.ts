import React, { ChangeEvent } from "react";
export interface IDataGridSettingsCheckboxProps {
    /**
     * The column's field: the checkbox's value, which the change handler reads
     * from the event's target
     */
    field: string;
    /**
     * Is the checkbox ticked?
     */
    checked: boolean;
    /**
     * Is the checkbox disabled? Give describedBy a reason then.
     * @default false
     */
    disabled?: boolean;
    /**
     * Called when the user ticks or unticks the checkbox
     * @param evt The change event; its target's value is field
     */
    onChange: (evt: ChangeEvent<HTMLInputElement>) => void;
    /**
     * The ids of the elements that name the checkbox, space separated: the
     * table's column header ("Visible", "Pin") and the row's header (the
     * column's name)
     */
    labelledBy: string;
    /**
     * The id of the element that says why the checkbox is disabled, or
     * undefined for none
     */
    describedBy?: string;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridSettingsCheckboxProps) => React.JSX.Element>;
export default _default;
