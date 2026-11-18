import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { ListItem, styled, useThemeProps } from "@mui/material";
import { itemGutters } from "./listGutters";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";
const SmallListItemRoot = styled(ListItem, {
    name: "CcSmallListItem",
    slot: "root",
    shouldForwardProp: wrapperRootShouldForwardProp,
})(itemGutters(8, 8));
const SmallListItem = React.forwardRef(function SmallListItem(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: "CcSmallListItem" });
    return _jsx(SmallListItemRoot, { ...props, ref: ref });
});
/**
 * MUI `ListItem` with 8px left and right gutters instead of MUI's 16px.
 * Vertical padding is MUI's (`dense` reduces it); `disableGutters` removes
 * the gutters, `disablePadding` all padding. With `secondaryAction` the right
 * padding stays MUI's 48px. Takes all `ListItem` props and a `ref` (the
 * `li`).
 *
 * Theme: `components.CcSmallListItem.defaultProps` ({@link SmallListItemProps}),
 * `styleOverrides.root` (see {@link SmallListItemClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * gutters, which in turn win over a theme's `MuiListItem` padding.
 */
export default React.memo(SmallListItem);
