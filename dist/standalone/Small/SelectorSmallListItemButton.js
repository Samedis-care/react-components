import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { ListItemButton, styled, useThemeProps, } from "@mui/material";
import { buttonGutters } from "./listGutters";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";
const SelectorSmallListItemButtonRoot = styled(ListItemButton, {
    name: "CcSelectorSmallListItemButton",
    slot: "root",
    shouldForwardProp: wrapperRootShouldForwardProp,
})(buttonGutters(0, 8));
const SelectorSmallListItemButton = React.forwardRef(function SelectorSmallListItemButton(inProps, ref) {
    const props = useThemeProps({
        props: inProps,
        name: "CcSelectorSmallListItemButton",
    });
    return _jsx(SelectorSmallListItemButtonRoot, { ...props, ref: ref });
});
/**
 * MUI `ListItemButton` with no left and an 8px right gutter; `disableGutters`
 * removes them. The Selector's option rows are built on it and set their own
 * 16px gutters. Takes all `ListItemButton` props and a `ref` (the button).
 *
 * Theme: `components.CcSelectorSmallListItemButton.defaultProps` ({@link SelectorSmallListItemButtonProps}),
 * `styleOverrides.root` (see {@link SelectorSmallListItemButtonClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * gutters, which in turn win over a theme's `MuiListItemButton` padding.
 */
export default React.memo(SelectorSmallListItemButton);
