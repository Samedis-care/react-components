import { jsx as _jsx } from "react/jsx-runtime";
import { styled } from "@mui/material";
import React from "react";
import combineClassNames from "../../utils/combineClassNames";
const VerticalDividerRoot = styled("div", {
    name: "CcVerticalDivider",
    slot: "root",
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
/**
 * A 1px vertical line in `theme.palette.divider` with a 4px margin on either
 * side, for separating items in a horizontal row. Renders an empty `div` with
 * `display: inline-block` and passes all `div` attributes through.
 *
 * Height: by default it is `height: 100%` of its parent, like MUI
 * `<Divider orientation="vertical" />`. So it needs a parent with a definite
 * height, or a block wrapper that a stretching flex row sizes, as in the
 * DataGrid action bars: `<Grid container wrap="nowrap">…<Grid><VerticalDivider /></Grid>…</Grid>`.
 * Directly in a flex row without a height of its own, or in a MUI `Toolbar`,
 * pass `flexItem` instead. In a wrapper that the row does not stretch (e.g. in
 * a Grid container with `alignItems: "center"`), or inline in text, it is 0px
 * tall either way.
 */
const VerticalDivider = React.forwardRef(function VerticalDivider(props, ref) {
    const { flexItem, className, ...other } = props;
    return (_jsx(VerticalDividerRoot, { ...other, ref: ref, className: combineClassNames([
            className,
            flexItem && "CcVerticalDivider-flexItem",
        ]) }));
});
export default React.memo(VerticalDivider);
