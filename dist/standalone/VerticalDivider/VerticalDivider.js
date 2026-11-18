import { jsx as _jsx } from "react/jsx-runtime";
import { styled, useThemeProps } from "@mui/material";
import React from "react";
import combineClassNames from "../../utils/combineClassNames";
/**
 * What MUI keeps off the DOM of a root slot, plus the divider's own props
 */
const ROOT_PROPS_NOT_FORWARDED = new Set([
    "flexItem",
    "ownerState",
    "theme",
    "sx",
    "as",
]);
const VerticalDividerRoot = styled("div", {
    name: "CcVerticalDivider",
    slot: "root",
    shouldForwardProp: (prop) => !ROOT_PROPS_NOT_FORWARDED.has(prop),
})(({ theme }) => ({
    display: "inline-block",
    borderRight: `1px solid ${theme.palette.divider}`,
    height: "100%",
    padding: "0",
    margin: "0 4px",
    "&.CcVerticalDivider-flexItem": {
        alignSelf: "stretch",
        height: "auto",
    },
}));
const VerticalDivider = React.forwardRef(function VerticalDivider(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: "CcVerticalDivider" });
    const { flexItem = false, className, ...other } = props;
    return (_jsx(VerticalDividerRoot, { ...other, ref: ref, flexItem: flexItem, className: combineClassNames([
            className,
            flexItem && "CcVerticalDivider-flexItem",
        ]) }));
});
/**
 * A 1px vertical line in `theme.palette.divider` with a 4px margin on either
 * side, for separating items in a horizontal row. Renders an empty `div` with
 * `display: inline-block` and passes all `div` attributes through. Takes a
 * `ref` (the `div`) and `sx`.
 *
 * Height: by default it is `height: 100%` of its parent, like MUI
 * `<Divider orientation="vertical" />`. So it needs a parent with a definite
 * height, or a block wrapper that a stretching flex row sizes, as in the
 * DataGrid action bars: `<Grid container wrap="nowrap">…<Grid><VerticalDivider /></Grid>…</Grid>`.
 * Directly in a flex row without a height of its own, or in a MUI `Toolbar`,
 * pass `flexItem` instead. In a wrapper that the row does not stretch (e.g. in
 * a Grid container with `alignItems: "center"`), or inline in text, it is 0px
 * tall either way.
 *
 * Theme: `components.CcVerticalDivider.defaultProps`
 * ({@link VerticalDividerProps}), `styleOverrides.root` (see
 * {@link VerticalDividerClassKey}), and `variants`, which apply to the `div`
 * and match its props after the theme's default props, with `flexItem`
 * `false` when it is not set.
 */
export default React.memo(VerticalDivider);
