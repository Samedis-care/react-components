import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { ListItemIcon, styled, useThemeProps, } from "@mui/material";
import wrapperRootShouldForwardProp from "../../utils/internal/wrapperRootShouldForwardProp";
const SmallListItemIconRoot = styled(ListItemIcon, {
    name: "CcSmallListItemIcon",
    slot: "root",
    shouldForwardProp: wrapperRootShouldForwardProp,
})({
    minWidth: 0,
    paddingRight: 8,
});
const SmallListItemIcon = React.forwardRef(function SmallListItemIcon(inProps, ref) {
    const props = useThemeProps({ props: inProps, name: "CcSmallListItemIcon" });
    return _jsx(SmallListItemIconRoot, { ...props, ref: ref });
});
/**
 * MUI `ListItemIcon` without MUI's 56px `min-width`, with an 8px gap
 * (`padding-right`) before the text. Takes all `ListItemIcon` props and a
 * `ref` (its `div`).
 *
 * Theme: `components.CcSmallListItemIcon.defaultProps` ({@link SmallListItemIconProps}),
 * `styleOverrides.root` (see {@link SmallListItemIconClassKey}) and `variants`,
 * which match its props after the theme's default props. They win over its
 * `min-width` and padding, which in turn win over a theme's `MuiListItemIcon`
 * overrides of those.
 */
export default React.memo(SmallListItemIcon);
