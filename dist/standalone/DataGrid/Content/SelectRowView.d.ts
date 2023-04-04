import React from "react";
export interface IDataGridContentSelectRowViewProps {
    /**
     * Is currently checked?
     */
    checked: boolean;
    /**
     * The row record ID
     */
    id: string;
    /**
     * Is the control disabled?
     */
    disabled: boolean;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridContentSelectRowViewProps) => JSX.Element>;
export default _default;
