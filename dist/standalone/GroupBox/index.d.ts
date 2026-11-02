import React from "react";
export interface GroupBoxLegendOwnerState {
    smallLabel: boolean;
}
export type GroupBoxClassKey = "root" | "legend";
/**
 * The HTML attributes of the GroupBox's fieldset, e.g. `aria-busy` or `aria-describedby`
 */
export type GroupBoxHTMLProps = Omit<React.ComponentPropsWithoutRef<"fieldset">, "children">;
/**
 * @remarks Every HTML attribute the box does not take itself is set on its fieldset.
 */
export interface GroupBoxProps extends GroupBoxHTMLProps {
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
