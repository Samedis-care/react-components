import React from "react";
import { ButtonProps } from "@mui/material";
/**
 * The `ownerState` of the `button` slot: two flags. A function in the
 * theme's `styleOverrides` gets it. A theme variant's `props` object matches
 * each key against the button's props (every SubActionButton prop but
 * `icon`, `small`, `disableDivider` and `children`, `fullWidth` as applied)
 * and against these flags; a `props` function gets the button's props and
 * these flags.
 */
export interface SubActionButtonOwnerState {
    /**
     * Whether the `small` prop is set
     */
    small: boolean;
    /**
     * Whether the `disableDivider` prop is set (`"true"` included)
     */
    disableDivider: boolean;
}
/**
 * Key of the theme's `components.CcSubActionButton.styleOverrides`:
 * `button`, the MUI `Button`, SubActionButton's only slot. A function
 * override gets its {@link SubActionButtonOwnerState}. Theme `variants` style
 * the button too.
 */
export type SubActionButtonClassKey = "button";
export interface SubActionButtonProps extends Omit<ButtonProps, "children"> {
    /**
     * The icon before the label, rendered in a `span` with the class
     * `CcSubActionButton-icon`. It is painted through that span's text color,
     * which an SvgIcon fills with: the `main` of `color` (by default
     * `primary.main`), `text.disabled` while disabled, and on the hover fill
     * of a `small` button the hover's text color. An icon with a color of its
     * own (an SvgIcon's `color` or `htmlColor`, or a color in its `sx`) keeps
     * it in every state.
     */
    icon?: React.ReactNode;
    /**
     * Show only the icon, for a compact button. The label (`children`) stays
     * in the button as visually hidden text, which names it in every state,
     * and shows as a tooltip on hover and on keyboard focus (not while
     * disabled). Use it with `icon`.
     * @default false
     */
    small?: boolean;
    /**
     * The label, already translated: a string or any other node (no
     * interactive content). It names the button, also with `small`, where it
     * is visually hidden and shows as a tooltip. An `aria-label` or
     * `aria-labelledby` replaces that name, also while the tooltip is open.
     */
    children: NonNullable<React.ReactNode>;
    /**
     * Flag to disable the top divider
     */
    disableDivider?: boolean | "true";
    /**
     * The palette color of the label and the icon, a custom palette color
     * included: both are its `main`, at rest and on hover, and the hover of a
     * `small` button fills the cell with its `light` and paints the icon in
     * `getContrastText(light)`. `"inherit"` takes the parent's text color.
     * The top border, the divider between rows, stays grey, and a disabled
     * button is `text.disabled`.
     * @default undefined: the label is `text.primary` and turns `primary.main`
     * on hover, the icon is `primary.main`, and a `small` button's hover fills
     * the cell with `primary.light`
     */
    color?: ButtonProps["color"];
}
declare const _default: React.MemoExoticComponent<(inProps: SubActionButtonProps) => React.JSX.Element>;
export default _default;
