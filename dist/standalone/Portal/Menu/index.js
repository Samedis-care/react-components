import { jsx as _jsx } from "react/jsx-runtime";
import React, { useState } from "react";
import { MenuContext, toMenuItemComponent } from "./MenuItem";
import combineClassNames from "../../../utils/combineClassNames";
import { styled, useThemeProps } from "@mui/material";
const Root = styled("div", { name: "CcPortalMenu", slot: "root" })({
    height: "100%",
    width: "100%",
    overflow: "auto",
});
const PortalMenu = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcPortalMenu" });
    const { wrapper: Wrapper, className, classes, customState, definition, } = props;
    const state = useState("");
    return (_jsx(Root, { className: combineClassNames([className, classes?.root]), children: _jsx(Wrapper, { children: _jsx(MenuContext.Provider, { value: customState || state, children: definition.map((child) => toMenuItemComponent(props, child, 0, null)) }) }) }));
};
export default React.memo(PortalMenu);
