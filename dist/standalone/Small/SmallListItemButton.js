import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { ListItemButton, styled, useThemeProps, } from "@mui/material";
import { buttonGutters } from "./listGutters";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";
const SmallListItemButtonRoot = styled(ListItemButton, {
    name: "CcSmallListItemButton",
    slot: "root",
    shouldForwardProp: wrapperRootShouldForwardProp,
})(buttonGutters(8, 8));
const SmallListItemButton = React.forwardRef(function SmallListItemButton(inProps, ref) {
    const props = useThemeProps({
        props: inProps,
        name: "CcSmallListItemButton",
    });
    return _jsx(SmallListItemButtonRoot, { ...props, ref: ref });
});
/**
 * MUI `ListItemButton` with 8px left and right gutters instead of MUI's
 * 16px; `disableGutters` removes them. Renders a `div[role=button]`, so inside
 * a `List` wrap it in `<ListItem disablePadding>`. Takes all `ListItemButton`
 * props and a `ref` (the button); `selected` only changes the look, so add the
 * ARIA state yourself.
 *
 * Theme: `components.CcSmallListItemButton.defaultProps` ({@link SmallListItemButtonProps}),
 * `styleOverrides.root` (see {@link SmallListItemButtonClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * gutters, which in turn win over a theme's `MuiListItemButton` padding.
 */
export default React.memo(SmallListItemButton);
