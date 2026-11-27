import React from "react";
import { ButtonProps } from "@mui/material";
/**
 * Key of the theme's `components.CcActionButton.styleOverrides`: `button`,
 * the MUI `Button`, ActionButton's only slot. A function override gets its
 * {@link ActionButtonOwnerState}. Theme `variants` style the button too.
 */
export type ActionButtonClassKey = "button";
/**
 * The `ownerState` of the `button` slot: two flags, not ActionButton's
 * props. A function in the theme's `styleOverrides` gets it. A theme
 * variant's `props` object matches each key against the button's props
 * (every ActionButton prop but `icon`, `small` and `children`, `fullWidth`
 * as applied) and against these flags; a `props` function gets the button's
 * props with these flags in place of `small` and `color`.
 */
export interface ActionButtonOwnerState {
    /**
     * Whether the `small` prop is set (`"true"` included)
     */
    small: boolean;
    /**
     * Whether a `color` prop is set, whatever its value (`"primary"`
     * included); not the color itself
     */
    color: boolean;
}
export interface ActionButtonProps extends Omit<ButtonProps, "children"> {
    /**
     * The icon of the button
     */
    icon?: React.ReactNode;
    /**
     * Adjust full width of the button
     */
    fullWidth?: boolean;
    /**
     * Show only the icon, centred, for a compact button. The label
     * (`children`) stays in the button as visually hidden text, which names it
     * in every state, and shows as a tooltip on hover and on keyboard focus
     * (not while disabled). Use it with `icon`. `"true"` is the same as `true`.
     * @default false
     */
    small?: boolean | "true";
    /**
     * The label, already translated: a string or any other node (no
     * interactive content). It names the button, also with `small`, where it
     * is visually hidden and shows as a tooltip. An `aria-label` or
     * `aria-labelledby` replaces that name, also while the tooltip is open.
     */
    children: React.ReactNode;
    /**
     * The palette color the button is painted in, a custom palette color
     * included: as on MUI's `Button`, the fill is its `main`, the text its
     * `contrastText` and the hover fill its `dark`. A fill on which
     * `contrastText` has less than 4.5:1 is darkened (behind dark text:
     * lightened) just enough, in its own hue. This, or
     * `components.CcActionButton.defaultProps.color` in the theme, is how an
     * ActionButton is recolored: overriding only `backgroundColor` keeps
     * primary's text color and hover.
     * @default undefined: painted in `palette.primary` by ActionButton itself
     */
    color?: ButtonProps["color"];
}
/**
 * The main call to action of a form or page: a contained MUI `Button` without
 * elevation, full width by default.
 *
 * Without `color` it is painted in `palette.primary`. Recolor it with `color`,
 * or for every ActionButton with `components.CcActionButton.defaultProps.color`
 * in the theme: fill, text and hover then all come from that palette color.
 * The text reaches 4.5:1 at rest and on hover in any palette: a fill on which
 * the palette's `contrastText` falls short is darkened (behind dark text:
 * lightened) just enough, in its own hue. A `backgroundColor` set in
 * `styleOverrides.button`, `styled()` or `sx` changes only the fill and is
 * used as it is: the text keeps primary's `contrastText` and the hover turns
 * the button primary. An override that paints its own fill sets `color` and
 * the `&:hover` fill as well.
 *
 * Disabled, it is filled with `palette.action.disabled` and its label and
 * icon are `background.paper`, with or without `color`. A theme gives
 * disabled ActionButtons a fill of its own with `&.Mui-disabled` in
 * `styleOverrides.button`.
 */
declare const ActionButton: (inProps: ActionButtonProps) => React.JSX.Element;
declare const _default: typeof ActionButton;
export default _default;
