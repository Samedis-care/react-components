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
/**
 * A frame with an optional title: a native `<fieldset>` whose `label` is drawn
 * as a `<legend>` in its top border.
 *
 * The frame is as wide as its parent. When it is its parent's only element
 * child, it is also as tall as the parent wherever the parent's height is
 * definite, e.g. a Grid item stretched to its row, so frames in one Grid row
 * are equally tall. Next to other elements (a heading above it, helper text
 * below it) it is as tall as its content, and the siblings stay inside the
 * parent. A `height` set by the theme or a `styled(GroupBox)` wrapper
 * replaces this rule.
 */
declare const _default: React.MemoExoticComponent<(inProps: GroupBoxProps) => React.JSX.Element>;
export default _default;
