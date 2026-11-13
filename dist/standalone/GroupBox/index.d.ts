import React from "react";
/**
 * Keys of the theme's `components.CcGroupBox.styleOverrides`, also the keys
 * of the `classes` prop:
 * - `root`: the `<fieldset>` frame
 * - `legend`: the `<legend>` title
 * - `smallLabel`: the legend while `smallLabel` is set. Its theme overrides
 *   apply after those of `legend`.
 *
 * No slot receives an `ownerState`: a function override is called with the
 * theme. The small legend has the class `CcGroupBox-smallLabel`, so a
 * `legend` override can also style it with `"&.CcGroupBox-smallLabel"`.
 */
export type GroupBoxClassKey = "root" | "legend" | "smallLabel";
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
     * Renders the legend at 0.75em of the inherited font size. The legend
     * then has the class `CcGroupBox-smallLabel` and `classes.smallLabel`, and
     * gets the theme's `styleOverrides.smallLabel`; a font size from the theme
     * replaces the 0.75em.
     * @default false
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
     * Additional class names: `root` is added to the `<fieldset>`,
     * `smallLabel` to the legend while `smallLabel` is set
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
