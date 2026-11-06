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
    /**
     * The text that identifies the row (DataGridProps.getRowLabel), e.g. a
     * person's name, to name the control after its row: "Select Carol Jones".
     * An empty string if the row has none.
     */
    rowLabel: string;
}
declare const _default: React.MemoExoticComponent<(props: IDataGridContentSelectRowViewProps) => React.JSX.Element>;
export default _default;
