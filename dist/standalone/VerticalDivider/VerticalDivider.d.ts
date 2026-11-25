import { SxProps, Theme } from "@mui/material";
import React from "react";
/**
 * Props of {@link VerticalDivider}, also the type of the theme's
 * `components.CcVerticalDivider.defaultProps`. Besides its own props it takes
 * the HTML attributes of a `div` (`id`, `style`, `role`, `aria-*`,
 * `data-*`, event handlers, ...) and passes them to the divider's `div`.
 */
export interface VerticalDividerProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * CSS class names to apply to the divider's `div`, after the `root`
     * styles, so `styled(VerticalDivider)` wins over them
     */
    className?: string;
    /**
     * Lets the divider sit directly in a flex row and take the row's height,
     * as `flexItem` does on MUI `<Divider orientation="vertical" />`: it is
     * stretched (`align-self: stretch`, `height: auto`), also when the row
     * centers its items, and in a MUI `Toolbar`. The element gets the class
     * `CcVerticalDivider-flexItem`.
     *
     * Default `false`: `height: 100%` of its parent, for a parent with a
     * definite height or a block wrapper that a stretching flex row sizes.
     * Inside such a wrapper `flexItem` makes it 0px tall, because the wrapper
     * is not a flex container.
     */
    flexItem?: boolean;
    /**
     * System styles for the divider's `div`, as on MUI components
     */
    sx?: SxProps<Theme>;
}
/**
 * Theme style slots of {@link VerticalDivider}
 * (`components.CcVerticalDivider.styleOverrides.<slot>`): `root` is the
 * divider's `div`.
 */
export type VerticalDividerClassKey = "root";
/**
 * A 1px vertical line in `theme.palette.divider` with a 4px margin on either
 * side, for separating items in a horizontal row. Renders an empty `div` with
 * `display: inline-block` and passes all `div` attributes through. Takes a
 * `ref` (the `div`) and `sx`.
 *
 * Height: by default it is `height: 100%` of its parent, like MUI
 * `<Divider orientation="vertical" />`. So it needs a parent with a definite
 * height, or a block wrapper that a stretching flex row sizes, as in the
 * DataGrid header's action bar: `<Grid container wrap="nowrap">…<Grid><VerticalDivider /></Grid>…</Grid>`.
 * Directly in a flex row without a height of its own, or in a MUI `Toolbar`,
 * pass `flexItem` instead, as the DataGrid footer's action bar does. In a
 * wrapper that the row does not stretch (e.g. in a Grid container with
 * `alignItems: "center"`), or inline in text, it is 0px tall either way.
 *
 * Theme: `components.CcVerticalDivider.defaultProps`
 * ({@link VerticalDividerProps}), `styleOverrides.root` (see
 * {@link VerticalDividerClassKey}), and `variants`, which apply to the `div`
 * and match its props after the theme's default props, with `flexItem`
 * `false` when it is not set.
 */
declare const _default: React.NamedExoticComponent<VerticalDividerProps & React.RefAttributes<HTMLDivElement>>;
export default _default;
