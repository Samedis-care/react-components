import React from "react";
export interface GroupBoxLegendOwnerState {
    smallLabel: boolean;
}
export type GroupBoxClassKey = "root" | "legend";
export interface GroupBoxProps {
    /**
     * The HTML id of the fieldset
     */
    id?: string;
    /**
     * The label of the box
     */
    label: React.ReactNode;
    /**
     * The label type of the box
     */
    smallLabel?: boolean;
    /**
     * Box contents
     */
    children?: React.ReactNode;
    /**
     * CSS class to apply to fieldset
     */
    className?: string;
    /**
     * Custom styles
     */
    classes?: Partial<Record<GroupBoxClassKey, string>>;
}
declare const _default: React.MemoExoticComponent<(inProps: GroupBoxProps) => React.JSX.Element>;
export default _default;
